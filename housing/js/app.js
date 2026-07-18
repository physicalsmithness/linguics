/* ============================================================================
   App controller: UI rendering and event wiring.
   ============================================================================ */

(function () {
  "use strict";
  const LL = window.LL || (window.LL = {});

  // Build identifier. Bump when shipping a deploy worth distinguishing in
  // diagnostics. Surfaced in the page footer so two tabs on different builds
  // are visually distinguishable. See inter_chat/Architecture_Housing_cache_busting_and_data_load_messaging.md.
  const LL_BUILD = "2026-07-18-r19";
  LL.build = LL_BUILD;  // read by the feedback widget's context() at submit time
  // Touch-first device (no hover, coarse pointer): tap interactions replace
  // keyboard ones. Computed once; used for tap-to-mark on MCQ.
  const TOUCH_FIRST = !!(window.matchMedia
    && window.matchMedia("(hover: none) and (pointer: coarse)").matches);
  // Scroll the fresh question card into view. After reading a result the
  // page is often scrolled deep (result details, stats below on mobile);
  // without this the next card renders off-screen and the learner only
  // sees whatever the input's minimal focus-scroll happens to reveal.
  function ensureCardVisible(cardEl) {
    if (!cardEl || !cardEl.getBoundingClientRect) return;
    const r = cardEl.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight || 800;
    if (r.top < 0 || r.top > vh * 0.35) {
      window.scrollTo(0, Math.max(0, window.scrollY + r.top - 12));
    }
  }

  LL.state = LL.store.loadState();

  // Migration 2026-05-28: drop legacy-shape vocab events.
  //
  // The bucket-id shape for vocab events changed to include POS (always) and
  // gender (for gender-split lemmas). Old shape `vocabulary.it.<lemma>.<aspect>`
  // can't be reattributed to a specific entry, so we drop those events. The
  // heatmap goes blank for vocab and re-fills as the learner practises under
  // the new shape. Idempotent: legacy events were filtered out the first time
  // this code ran, subsequent loads find none and the migration is a no-op.
  (function migrateLegacyVocabEvents() {
    const parse = LL.parseVocabBucketId;
    if (typeof parse !== "function") return;
    let dropped = 0;
    for (const att of LL.state.attempts || []) {
      if (!Array.isArray(att.events)) continue;
      const before = att.events.length;
      att.events = att.events.filter(ev => {
        const parsed = parse(ev.bucket);
        if (!parsed) return true;              // non-vocab event, keep
        if (parsed.pos) return true;           // new shape, keep
        return false;                          // legacy shape, drop
      });
      dropped += before - att.events.length;
    }
    if (dropped > 0) {
      LL.store.saveState(LL.state);
      console.log("[Linguics] Migrated vocab event history:", dropped, "legacy-shape events dropped. Vocab heatmap will re-fill as you practise.");
    }
  })();

  // Note: these are `let` so the fetch-loader can replace them with real content.
  let allBuckets = window.LL_BUCKETS || [];
  let bucketIndex = LL.store.indexBuckets(allBuckets);
  // Expose for translation_marker.js to consult bucket.attributes.direction
  // when filtering candidates by direction.
  LL.bucketsById = bucketIndex.byId;
  let grammarQuestions = window.LL_GRAMMAR_QUESTIONS || [];
  let translationItems = window.LL_TRANSLATION_ITEMS || [];
  // Shuffled decks used for navigation; reshuffle on wrap.
  let grammarDeck = [];
  let translationDeck = [];

  // Filters: narrow the deck by topic / CEFR level / bucket path. Empty = any.
  let grammarFilter = { topic: "", cefr: "", bucketPath: "" };
  let translationFilter = { topic: "", cefr: "", bucketPath: "" };

  // What bucket ids does a grammar question or translation item touch?
  // Grammar questions: their markpoints' bucket fields.
  // Translation items: their required_buckets array (we don't yet filter by
  // optional_buckets or vocab_help; if needed, extend here).
  function getItemBuckets(q) {
    if (q.markpoints) return q.markpoints.map(mp => mp.bucket).filter(Boolean);
    if (q.required_buckets) return q.required_buckets;
    return [];
  }

  function bucketUnder(bucketId, ancestorId) {
    return bucketId === ancestorId || bucketId.startsWith(ancestorId + ".");
  }

  const CEFR_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"];
  function cefrIndex(level) { return CEFR_ORDER.indexOf(level); }

  // A "clause" is { topics?: string[], bucketPaths?: string[] }. An item matches
  // a clause when its topic is in topics (if given) AND at least one of its
  // buckets sits under one of bucketPaths (if given). The composed entry-screen
  // selection matches an item if it matches ANY clause, so parts are OR-ed:
  // "Verbs + Pronouns together" works because a verb item satisfies the verbs
  // clause and is not excluded by the pronoun clause's bucketPaths.
  function itemMatchesClause(q, clause) {
    if (clause.topics && clause.topics.length && !clause.topics.includes(q.topic)) return false;
    if (clause.bucketPaths && clause.bucketPaths.length) {
      const buckets = getItemBuckets(q);
      if (!buckets.some(b => clause.bucketPaths.some(pp => bucketUnder(b, pp)))) return false;
    }
    return true;
  }

  // Extended filter. Back-compat: the in-session bars set scalar topic / cefr /
  // bucketPath and behave exactly as before. The entry screen sets filter.clauses
  // (OR-ed structured parts) and/or filter.cefrRange ([minIdx, maxIdx] over
  // CEFR_ORDER). See inter_chat/Architecture_Housing_welcome_entry_screen.md.
  function applyFilter(arr, filter) {
    const hasClauses = Array.isArray(filter.clauses) && filter.clauses.length > 0;
    const range = (Array.isArray(filter.cefrRange) && filter.cefrRange.length === 2)
      ? filter.cefrRange : null;
    const lvls = (Array.isArray(filter.cefrLevels) && filter.cefrLevels.length)
      ? filter.cefrLevels : null;
    return arr.filter(q => {
      if (lvls) {
        // Independent multi-select: membership in the OR-ed level set.
        if (!lvls.includes(cefrIndex(q.cefr_level_target))) return false;
      } else if (range) {
        const ci = cefrIndex(q.cefr_level_target);
        if (ci < range[0] || ci > range[1]) return false;
      } else if (filter.cefr && q.cefr_level_target !== filter.cefr) {
        return false;
      }
      // Translation which-way: keep only items translating INTO the chosen
      // language (target_lang). Grammar items carry no target_lang and grammar
      // never sets this, so it is a no-op there.
      if (filter.targetLang && q.target_lang !== filter.targetLang) return false;
      if (hasClauses) {
        if (!filter.clauses.some(c => itemMatchesClause(q, c))) return false;
      } else if (filter.topic && q.topic !== filter.topic) {
        return false;
      }
      // Drill bucketPath is an ADDITIONAL constraint applied in both branches, so
      // drilling into a bucket narrows a composed (clauses) session too, not only
      // a scalar one. See inter_chat/Architecture_Housing_drill_filter_not_applied.md.
      if (filter.bucketPath) {
        const buckets = getItemBuckets(q);
        if (!buckets.some(b => bucketUnder(b, filter.bucketPath))) return false;
      }
      return true;
    });
  }

  // What the topic scope currently is, in learner language.
  function scopeLabelFor(filter) {
    if (Array.isArray(filter.clauses) && filter.clauses.length) return "Custom mix";
    if (filter.topic) return friendlyTopicLabel(filter.topic);
    return "";
  }
  function cefrLabelFor(filter) {
    if (Array.isArray(filter.cefrLevels) && filter.cefrLevels.length) {
      // Collapse to runs: [A1,A2,B1] -> "A1-B1"; [A1,B1] -> "A1, B1".
      const s = filter.cefrLevels.slice().sort((a, b) => a - b);
      const parts = [];
      let a = s[0], b = s[0];
      for (let k = 1; k <= s.length; k++) {
        if (k < s.length && s[k] === b + 1) { b = s[k]; continue; }
        parts.push(a === b ? CEFR_ORDER[a] : CEFR_ORDER[a] + "\u2013" + CEFR_ORDER[b]);
        if (k < s.length) { a = s[k]; b = s[k]; }
      }
      return parts.join(", ");
    }
    if (Array.isArray(filter.cefrRange) && filter.cefrRange.length === 2) {
      const a = CEFR_ORDER[filter.cefrRange[0]], b = CEFR_ORDER[filter.cefrRange[1]];
      return a === b ? a : a + "\u2013" + b;
    }
    return filter.cefr || "";
  }
  function resetDecksAndRender() {
    grammarDeck = [];
    translationDeck = [];
    grammarIndex = 0;
    translationIndex = 0;
    renderGrammarFilterBar();
    renderTranslationFilterBar();
    renderGrammar();
    renderTranslation();
  }

  // Snapshot of the topic scope a drill replaced, so it can be undone.
  let _preDrillScope = null;

  // Drilling into a bucket makes THAT BUCKET the corpus: the topic scope widens
  // to all, because keeping a stale intersection turns every cross-topic drill
  // into a dead end (Custom mix pronouns + a tense_choice tile = zero, with
  // nothing explaining which filter blocked). Clicking another tile while
  // drilled SWITCHES the drill and does not re-snapshot, so undo always returns
  // to the pre-drill scope. See inter_chat/
  // Architecture_Housing_drill_filter_ux_and_dropdown_labels.md.
  function setBucketFilter(bucketId) {
    const alreadyDrilled = !!grammarFilter.bucketPath;
    if (!alreadyDrilled) {
      _preDrillScope = {
        label: scopeLabelFor(grammarFilter) || scopeLabelFor(translationFilter),
        grammar:     { topic: grammarFilter.topic,     clauses: grammarFilter.clauses },
        translation: { topic: translationFilter.topic, clauses: translationFilter.clauses }
      };
    }
    grammarFilter.bucketPath = bucketId;
    translationFilter.bucketPath = bucketId;
    grammarFilter.topic = "";     grammarFilter.clauses = null;
    translationFilter.topic = ""; translationFilter.clauses = null;
    resetDecksAndRender();
  }
  function undoDrillWiden() {
    if (_preDrillScope) {
      grammarFilter.topic       = _preDrillScope.grammar.topic;
      grammarFilter.clauses     = _preDrillScope.grammar.clauses;
      translationFilter.topic   = _preDrillScope.translation.topic;
      translationFilter.clauses = _preDrillScope.translation.clauses;
    }
    grammarFilter.bucketPath = "";
    translationFilter.bucketPath = "";
    _preDrillScope = null;
    resetDecksAndRender();
  }

  function clearBucketFilter() {
    grammarFilter.bucketPath = "";
    translationFilter.bucketPath = "";
    _preDrillScope = null;   // the widened scope stands; only the drill is dropped
    resetDecksAndRender();
  }

  // Topic-root → generic label for the info_display: "suppress" flag.
  // See inter_chat/Architecture_Housing_info_display_suppress.md.
  // When an item carries that flag, pre-answer surfaces substitute the generic
  // label here in place of the bucket-specific label, preventing the bucket
  // name from leaking the rule under test. New topics: add entries here; the
  // fallback uses a transformed dotted-id and warns once.
  const TOPIC_GENERIC_LABELS = {
    "verb_form.imperfect":        "Imperfect drill",
    "verb_form.passato_prossimo": "Passato prossimo drill",
    "pronoun":                    "Pronoun drill",
    "adjective_agreement":        "Adjective agreement drill",
    "tense_choice":               "Tense choice drill",
    "vocabulary":                 "Vocab drill"
  };
  const _topicGenericWarnedFor = new Set();
  function topicGenericLabel(bucketIdOrItem) {
    if (!bucketIdOrItem) return "Drill";
    // Accept either a bucket id string OR an item with .topic / .markpoints[].bucket.
    let id = "";
    if (typeof bucketIdOrItem === "string") {
      id = bucketIdOrItem;
    } else if (bucketIdOrItem.topic) {
      id = String(bucketIdOrItem.topic);
    } else if (Array.isArray(bucketIdOrItem.markpoints) && bucketIdOrItem.markpoints[0] && typeof bucketIdOrItem.markpoints[0].bucket === "string") {
      id = bucketIdOrItem.markpoints[0].bucket;
    } else {
      return "Drill";
    }
    // Match the longest known prefix.
    let best = null;
    for (const key in TOPIC_GENERIC_LABELS) {
      if (id === key || id.startsWith(key + ".")) {
        if (!best || key.length > best.length) best = key;
      }
    }
    if (best) return TOPIC_GENERIC_LABELS[best];
    // Fallback: transform first dotted segment. Warn once per topic.
    const head = id.split(".")[0] || "drill";
    if (!_topicGenericWarnedFor.has(head)) {
      _topicGenericWarnedFor.add(head);
      console.warn("[Linguics] No TOPIC_GENERIC_LABELS entry for topic root \"" + head + "\"; using fallback label.");
    }
    const friendly = head.replace(/_/g, " ");
    return friendly.charAt(0).toUpperCase() + friendly.slice(1) + " drill";
  }

  // Walk a cited bucket's ancestor chain looking for a tree-level
  // attributes.default_info_display: "suppress". See inter_chat/
  // Architecture_Housing_breadcrumb_defaults_and_candidate_forms.md.
  function bucketChainSuppresses(bucketId) {
    let node = bucketIndex.byId[bucketId];
    let guard = 0;
    while (node && guard++ < 64) {
      const a = node.attributes;
      if (a && a.default_info_display === "suppress") return true;
      node = node.parent_id ? bucketIndex.byId[node.parent_id] : null;
    }
    return false;
  }
  // True when the item should hide its bucket name pre-answer. An explicit
  // per-item info_display always wins (either direction); otherwise the flag is
  // INHERITED from any cited bucket or its ancestors. Data-driven: no per-item
  // edits needed for a whole subtree.
  function shouldSuppressBucketName(item) {
    if (!item) return false;
    if (item.info_display) return item.info_display === "suppress";
    const buckets = getItemBuckets(item);
    for (const b of buckets) { if (bucketChainSuppresses(b)) return true; }
    return false;
  }
  LL.shouldSuppressBucketName = shouldSuppressBucketName;  // exposed for tests

  // Global hint for the live stats panel: when a grammar/translation item is
  // in flight (rendered but unmarked) with info_display: "suppress", any
  // panel tooltip for the same bucket should use the generic label too.
  // Cleared when the item is marked or the strand re-renders.
  LL.inFlightSuppress = null;
  function setInFlightSuppress(item) {
    if (item && shouldSuppressBucketName(item)) {
      LL.inFlightSuppress = {
        topicLabel: topicGenericLabel(item),
        buckets: new Set(
          (Array.isArray(item.markpoints) ? item.markpoints : [])
            .map(mp => mp && mp.bucket)
            .filter(b => typeof b === "string")
        )
      };
    } else {
      LL.inFlightSuppress = null;
    }
  }
  function clearInFlightSuppress() { LL.inFlightSuppress = null; }

  // Deck rebuild keys on the full filter SIGNATURE, not the filtered length: two
  // different filters can yield the same count, and a length-only check then
  // serves stale items. See inter_chat/Architecture_Housing_drill_filter_not_applied.md.
  function filterSig(f) {
    return JSON.stringify([f.topic, f.cefr, f.bucketPath, f.clauses || null, f.cefrRange || null, f.targetLang || null, f.cefrLevels || null]);
  }
  let _grammarDeckSig = null;
  function ensureGrammarDeck() {
    const sig = filterSig(grammarFilter);
    if (sig !== _grammarDeckSig || grammarDeck.length === 0) {
      grammarDeck = shuffle(applyFilter(grammarQuestions, grammarFilter));
      if (sig !== _grammarDeckSig) grammarIndex = 0;   // filter changed -> restart position
      _grammarDeckSig = sig;
    }
  }
  let _translationDeckSig = null;
  function ensureTranslationDeck() {
    const sig = filterSig(translationFilter);
    if (sig !== _translationDeckSig || translationDeck.length === 0) {
      translationDeck = shuffle(applyFilter(translationItems, translationFilter));
      if (sig !== _translationDeckSig) translationIndex = 0;
      _translationDeckSig = sig;
    }
  }
  function uniqueValues(arr, key) {
    const s = new Set();
    for (const x of arr) if (x[key]) s.add(x[key]);
    return Array.from(s).sort();
  }

  // The drilled-into label, honouring info_display:"suppress" exactly as the old
  // standalone banner did (a drilled bucket must not leak the rule under test).
  function drillChipLabel(filter) {
    const node = bucketIndex.byId[filter.bucketPath];
    let label = node ? (node.label || node.id) : filter.bucketPath;
    if (LL.inFlightSuppress) {
      const filterPath = filter.bucketPath;
      let touches = false;
      LL.inFlightSuppress.buckets.forEach(b => {
        if (b === filterPath || b.startsWith(filterPath + ".")) touches = true;
      });
      if (touches) label = LL.inFlightSuppress.topicLabel;
    }
    return label;
  }

  // One row, one system: Topic, Level and the drill all render as chips side by
  // side, so every active restriction is visible in one place and an active one
  // can't be missed. Topic options use friendly labels grouped into the
  // parts.json families; raw dot-ids never reach a learner-facing surface.
  // See inter_chat/Architecture_Housing_drill_filter_ux_and_dropdown_labels.md.
  function buildFilterBar(strandName, sourceArr, filterObj, onChange) {
    const bar = document.createElement("div");
    bar.className = "filter-row";

    const hasClauses = Array.isArray(filterObj.clauses) && filterObj.clauses.length > 0;
    const hasRange = (Array.isArray(filterObj.cefrRange) && filterObj.cefrRange.length === 2)
      || (Array.isArray(filterObj.cefrLevels) && filterObj.cefrLevels.length > 0);

    // ---- Topic chip ----
    const tChip = document.createElement("label");
    tChip.className = "filter-chip" + ((filterObj.topic || hasClauses) ? " active" : "");
    const tLbl = document.createElement("span");
    tLbl.className = "filter-chip-key";
    tLbl.textContent = "Topic";
    tChip.appendChild(tLbl);
    const tSel = document.createElement("select");
    if (hasClauses) {
      const cm = document.createElement("option");     // pinned at the top
      cm.value = "__custom__"; cm.textContent = "Custom mix"; cm.selected = true;
      tSel.appendChild(cm);
    }
    const tAny = document.createElement("option");
    tAny.value = ""; tAny.textContent = "all topics";
    if (!hasClauses && !filterObj.topic) tAny.selected = true;
    tSel.appendChild(tAny);
    const byFam = new Map();
    for (const tp of uniqueValues(sourceArr, "topic")) {
      const fam = overviewCategoryFor(tp) || MORE_PART_LABEL;
      if (!byFam.has(fam)) byFam.set(fam, []);
      byFam.get(fam).push(tp);
    }
    for (const fam of overviewCategoryOrder()) {
      const list = byFam.get(fam);
      if (!list || !list.length) continue;
      const og = document.createElement("optgroup");
      og.label = fam;
      for (const tp of list) {
        const o = document.createElement("option");
        o.value = tp; o.textContent = friendlyTopicLabel(tp);
        if (tp === filterObj.topic) o.selected = true;
        og.appendChild(o);
      }
      tSel.appendChild(og);
    }
    tSel.addEventListener("change", () => {
      if (tSel.value === "__custom__") return;   // no-op: it's the current composed state
      filterObj.topic = tSel.value;
      filterObj.clauses = null; filterObj.cefrRange = null;  // topic edit replaces the composed scope; the LEVEL SET survives (2026-07-18)
      onChange();
    });
    tChip.appendChild(tSel);
    bar.appendChild(tChip);

    // ---- Level chip: toggle cells, same set semantics as the entry strip ----
    // Smith (2026-07-18, live): "tried to do a1b1a2... should be allowed" - the
    // old single-choice dropdown couldn't express a set in session. Each cell
    // toggles that level in filterObj.cefrLevels (OR'd by the engine). A level
    // edit PRESERVES filterObj.clauses: narrowing the level must not nuke a
    // composed Custom mix (the old dropdown silently did exactly that).
    const setActive = Array.isArray(filterObj.cefrLevels) && filterObj.cefrLevels.length > 0;
    const pureRange = Array.isArray(filterObj.cefrRange) && filterObj.cefrRange.length === 2;
    const cChip = document.createElement("span");
    cChip.className = "filter-chip filter-chip-levels" + ((filterObj.cefr || hasRange) ? " active" : "");
    const cLbl = document.createElement("span");
    cLbl.className = "filter-chip-key";
    cLbl.textContent = "Level";
    cLbl.title = "Tap levels to include or drop them. None selected = all levels.";
    cChip.appendChild(cLbl);
    const levelsPresent = uniqueValues(sourceArr, "cefr_level_target")
      .slice().sort((a, b) => cefrIndex(a) - cefrIndex(b));
    for (const c of levelsPresent) {
      const idx = cefrIndex(c);
      const on = setActive ? filterObj.cefrLevels.includes(idx)
        : (filterObj.cefr === c || (pureRange && idx >= filterObj.cefrRange[0] && idx <= filterObj.cefrRange[1]));
      const b = document.createElement("button");
      b.type = "button";
      b.className = "level-toggle" + (on ? " on" : "");
      b.textContent = c;
      b.title = on ? "Drop " + c : "Add " + c;
      b.addEventListener("click", () => {
        // Migrate any scalar/range remnant into the set once, then toggle.
        let L = Array.isArray(filterObj.cefrLevels) ? filterObj.cefrLevels.slice() : [];
        if (!L.length) {
          if (filterObj.cefr) { const i0 = cefrIndex(filterObj.cefr); if (i0 >= 0) L.push(i0); }
          else if (pureRange) { for (let k = filterObj.cefrRange[0]; k <= filterObj.cefrRange[1]; k++) L.push(k); }
        }
        const at = L.indexOf(idx);
        if (at >= 0) L.splice(at, 1); else L.push(idx);
        L.sort((x, y) => x - y);
        filterObj.cefrLevels = L.length ? L : null;
        filterObj.cefr = ""; filterObj.cefrRange = null;
        onChange();
      });
      cChip.appendChild(b);
    }
    bar.appendChild(cChip);

    // ---- Drill chip (same row, so all three restrictions read together) ----
    if (filterObj.bucketPath) {
      const dChip = document.createElement("span");
      dChip.className = "filter-chip drill active";
      dChip.title = filterObj.bucketPath;
      const dKey = document.createElement("span");
      dKey.className = "filter-chip-key";
      dKey.textContent = "Drilled into";
      dChip.appendChild(dKey);
      const dVal = document.createElement("strong");
      dVal.textContent = drillChipLabel(filterObj);
      dChip.appendChild(dVal);
      if (_preDrillScope && _preDrillScope.label) {
        const note = document.createElement("span");
        note.className = "drill-note";
        note.textContent = "topic widened from " + _preDrillScope.label + " ";
        const undo = document.createElement("button");
        undo.type = "button"; undo.className = "linkish"; undo.textContent = "undo";
        undo.title = "Restore the previous topic scope and drop the drill";
        undo.addEventListener("click", undoDrillWiden);
        note.appendChild(undo);
        dChip.appendChild(note);
      }
      const x = document.createElement("button");
      x.type = "button"; x.className = "chip-x"; x.textContent = "\u00d7";
      x.title = "Clear the drill";
      x.addEventListener("click", clearBucketFilter);
      dChip.appendChild(x);
      bar.appendChild(dChip);
    }

    const count = document.createElement("span");
    count.className = "filter-count";
    count.textContent = `${applyFilter(sourceArr, filterObj).length} of ${sourceArr.length}`;
    bar.appendChild(count);

    return bar;
  }
  function renderGrammarFilterBar() {
    const host = document.getElementById("grammar-filter-bar");
    host.innerHTML = "";
    if (!grammarQuestions.length) return;
    host.appendChild(buildFilterBar("grammar", grammarQuestions, grammarFilter, () => {
      grammarDeck = [];        // force reshuffle of filtered set
      grammarIndex = 0;
      renderGrammarFilterBar(); // refresh the count
      renderGrammar();
    }));
  }
  function renderTranslationFilterBar() {
    const host = document.getElementById("translation-filter-bar");
    host.innerHTML = "";
    if (!translationItems.length) return;
    host.appendChild(buildFilterBar("translation", translationItems, translationFilter, () => {
      translationDeck = [];
      translationIndex = 0;
      renderTranslationFilterBar();
      renderTranslation();
    }));
  }

  // ----------------- real-content loader -----------------
  // Tries to fetch the canonical JSON files from ../data/. Works when the page
  // is served over http (e.g. `python -m http.server` from the project root).
  // Falls back silently to the inline samples if fetch fails (file://).
  async function tryLoadRealContent() {
    // Files that failed to PARSE or errored on the network. A 404 is not a
    // failure: missing optional files are the documented contract. Anything in
    // here gets named to the learner rather than silently skipped. See
    // inter_chat/Architecture_Housing_cache_busting_and_data_load_messaging.md v3.
    const loadFailures = [];
    // Defensive JSON parser. Trailing NUL bytes (and stray CRLFs) on some
    // chat-edited JSON files have been observed causing JSON.parse to throw
    // and the page to silently fall back to inline samples. We trim the
    // trailing junk and warn so we can track whether NULs are still being
    // produced upstream. See inter_chat/Architecture_Housing_atomic_write_nul_padding.md.
    const parseJson = async (path, response) => {
      const raw = await response.text();
      const trimmed = raw.replace(/[\x00\r\n\s]+$/, "");
      const nulCount = (raw.match(/\x00/g) || []).length;
      if (nulCount > 0) {
        // Only NULs are worth shouting about. A trailing newline is normal, and
        // warning on it drowned the signal we actually track here.
        console.warn(`[Linguics] ${path}: stripped ${raw.length - trimmed.length} trailing bytes before parse (${nulCount} NULs).`);
      }
      return JSON.parse(trimmed);
    };
    // Diagnostic logger for fetch failures. Captures enough context to
    // distinguish stale-cache, network-blip, extension-block, and parse-fail
    // from each other after the fact. See inter_chat/
    // Architecture_Housing_cache_busting_and_data_load_messaging.md.
    const logFetchFailure = (kind, path, info) => {
      const ctx = {
        kind: kind,                       // "fetch_error" | "http_error" | "parse_error"
        path: path,
        build: LL_BUILD,
        ts: new Date().toISOString(),
        ua: (typeof navigator !== "undefined" && navigator.userAgent) || "(no ua)",
        online: (typeof navigator !== "undefined") ? navigator.onLine : null,
        connType: (typeof navigator !== "undefined" && navigator.connection && navigator.connection.effectiveType) || null,
        localStorageKeys: (function () {
          try { return Object.keys(localStorage); } catch (e) { return null; }
        })(),
      };
      Object.assign(ctx, info || {});
      console.error("[Linguics] data fetch failure:", ctx);
    };
    const F = async (path) => {
      let r;
      try {
        r = await fetch(path);
      } catch (e) {
        logFetchFailure("fetch_error", path, { error: String(e) });
        throw new Error(`${path}: network error: ${e && e.message ? e.message : e}`);
      }
      if (!r.ok) {
        logFetchFailure("http_error", path, {
          status: r.status,
          statusText: r.statusText,
          cacheControl: r.headers.get("cache-control"),
          etag: r.headers.get("etag"),
          contentType: r.headers.get("content-type"),
        });
        throw new Error(`${path}: ${r.status}`);
      }
      try {
        return await parseJson(path, r);
      } catch (e) {
        logFetchFailure("parse_error", path, {
          status: r.status,
          contentType: r.headers.get("content-type"),
          error: String(e),
        });
        throw e;
      }
    };
    const Foptional = async (path) => {
      try {
        const r = await fetch(path);
        if (!r.ok) {
          logFetchFailure("http_error", path, {
            status: r.status,
            statusText: r.statusText,
            optional: true,
          });
          return null;
        }
        try {
          return await parseJson(path, r);
        } catch (e) {
          logFetchFailure("parse_error", path, { optional: true, error: String(e) });
          loadFailures.push({ path: path, kind: "parse_error", error: String(e) });
          return null;
        }
      } catch (e) {
        logFetchFailure("fetch_error", path, { optional: true, error: String(e) });
        loadFailures.push({ path: path, kind: "fetch_error", error: String(e) });
        return null;
      }
    };
    try {
      // 1. Load the manifest listing known topics
      const manifest = await F("../data/manifest.json");
      const topics = manifest.topics || [];
      if (!topics.length) throw new Error("manifest has no topics");

      // 2. For each topic, fetch the bucket tree (required) and any content
      //    files (all optional; missing files don't fail the load).
      // Some topics are buckets-only (no grammar / translation items). For
      // those we skip the content fetches entirely to avoid the 404 noise.
      const BUCKETS_ONLY_TOPICS = new Set(["vocabulary", "vocabulary_frequency"]);
      // Parallel fetch with a small concurrency pool (entry_load_and_level_strip
      // Defect 1). The old loop awaited every file in sequence - ~30 topics x
      // up to 3 files = up to ~90 serial round-trips, which was the ten-second
      // cold load. Results collect into a keyed map and are flattened in
      // manifest order below, so parallel completion can never shuffle topic
      // order. Per-file Foptional resilience is unchanged: one bad file skips
      // that file, one missing tree skips that topic.
      const POOL = 8;
      const perTopic = new Map();
      let nextJob = 0;
      const worker = async () => {
        for (;;) {
          const idx = nextJob++;
          if (idx >= topics.length) return;
          const topic = topics[idx];
          const tree = await Foptional(`../data/buckets/${topic}.json`);
          if (!tree) {
            console.warn(`Bucket tree missing for topic '${topic}'; skipping.`);
            continue;
          }
          const isBucketsOnly = BUCKETS_ONLY_TOPICS.has(topic);
          let g = null, t = null;
          if (!isBucketsOnly) {
            [g, t] = await Promise.all([
              Foptional(`../data/grammar_questions_${topic}.json`),
              Foptional(`../data/translation_items_${topic}.json`)
            ]);
          }
          perTopic.set(topic, { tree, g, t, isBucketsOnly });
        }
      };
      // The four singleton files (glossary, vocab list, parts, themes) join
      // the same wave rather than trailing the topic loop.
      const tail = Promise.all([
        Foptional("../data/glossary.json"),
        Foptional("../data/vocabulary_it_frequency.json"),
        Foptional("../data/parts.json"),
        Foptional("../data/vocab_themes.json")
      ]);
      const workers = [];
      for (let w = 0; w < Math.min(POOL, topics.length); w++) workers.push(worker());
      await Promise.all(workers);
      const [glossary, vocab, parts, themes] = await tail;

      // Flatten strictly in manifest order.
      const buckets = [];
      const grammar = [];
      const translation = [];
      const perTopicCounts = [];
      for (const topic of topics) {
        const r = perTopic.get(topic);
        if (!r) continue;
        for (const b of r.tree) buckets.push(b);
        if (r.g) for (const q of r.g) grammar.push(q);
        if (r.t) for (const it of r.t) translation.push(it);
        perTopicCounts.push({
          topic,
          buckets: r.tree.length,
          grammar: r.g ? r.g.length : 0,
          translation: r.t ? r.t.length : 0,
          bucketsOnly: r.isBucketsOnly
        });
      }

      if (glossary) {
        LL.glossary = buildGlossaryIndex(glossary);
      }
      if (themes) {
        LL.themesTaxonomy = themes;
      }

      console.info("Loaded per topic:", perTopicCounts);
      return { buckets, grammar, translation, perTopicCounts, vocab, themes, parts, failures: loadFailures };
    } catch (e) {
      const cause = e && e.message ? e.message : String(e);
      console.error("[Linguics] Real content fetch failed; using inline samples. Cause:", cause);
      showLoadFailureBanner(cause);
      // Promote the real cause to the footer: on http(s) the old "serve via
      // http" line was actively misleading.
      const onFile = (typeof location !== "undefined" && location.protocol === "file:");
      setStatus("Inline samples \u2014 " + (onFile
        ? "serve via http to load real content."
        : "couldn\u2019t load real content: " + cause));
      return null;
    }
  }

  // Surface a fetch-failure banner inline on the page. End-user friendly text;
  // no jargon. A single Refresh button retries. The banner persists until the
  // next successful load (which clears it) or the user dismisses (× button).
  // See inter_chat/Architecture_Housing_cache_busting_and_data_load_messaging.md.
  function showLoadFailureBanner(detailForTitle) {
    const host = document.getElementById("load-failure-banner");
    if (!host) return;
    host.innerHTML = "";
    host.hidden = false;
    const msg = document.createElement("span");
    msg.className = "load-failure-msg";
    msg.textContent = "Couldn\u2019t load the latest exercises. Refresh to try again.";
    host.appendChild(msg);
    const reloadBtn = document.createElement("button");
    reloadBtn.type = "button";
    reloadBtn.className = "load-failure-reload";
    reloadBtn.textContent = "Refresh";
    reloadBtn.addEventListener("click", () => location.reload());
    host.appendChild(reloadBtn);
    const dismiss = document.createElement("button");
    dismiss.type = "button";
    dismiss.className = "load-failure-dismiss";
    dismiss.textContent = "\u00d7";
    dismiss.title = "Dismiss";
    dismiss.addEventListener("click", () => { host.hidden = true; });
    host.appendChild(dismiss);
    // Detail tucked into a title attribute so curious users / developers can
    // hover for technical context without it being shoved at the learner.
    if (detailForTitle) {
      host.title = "Details: " + detailForTitle;
    }
  }
  // Partial-load banner: content loaded, but named files were skipped. The old
  // behaviour skipped them SILENTLY, so a corrupt batch was invisible to the
  // learner and misdiagnosed twice. Names what is missing, in plain language.
  function friendlyFailureName(path) {
    let m = /grammar_questions_(.+)\.json$/.exec(path);
    if (m) return prettifyId(m[1]) + " grammar items";
    m = /translation_items_(.+)\.json$/.exec(path);
    if (m) return prettifyId(m[1]) + " translation items";
    m = /buckets\/(.+)\.json$/.exec(path);
    if (m) return prettifyId(m[1]) + " topic";
    return String(path).split("/").pop();
  }
  function showPartialLoadBanner(failures) {
    const host = document.getElementById("load-failure-banner");
    if (!host || !failures || !failures.length) return;
    host.innerHTML = "";
    host.hidden = false;
    const names = failures.map(f => friendlyFailureName(f.path));
    const msg = document.createElement("span");
    msg.className = "load-failure-msg";
    msg.textContent = names.join(", ") + " failed to load. You\u2019re practising without "
      + (names.length > 1 ? "them" : "it") + ".";
    host.appendChild(msg);
    const reloadBtn = document.createElement("button");
    reloadBtn.type = "button";
    reloadBtn.className = "load-failure-reload";
    reloadBtn.textContent = "Refresh";
    reloadBtn.addEventListener("click", () => location.reload());
    host.appendChild(reloadBtn);
    const dismiss = document.createElement("button");
    dismiss.type = "button";
    dismiss.className = "load-failure-dismiss";
    dismiss.textContent = "\u00d7";
    dismiss.title = "Dismiss";
    dismiss.addEventListener("click", () => { host.hidden = true; });
    host.appendChild(dismiss);
    host.title = "Details: " + failures.map(f => f.path + " (" + f.kind + ")").join("; ");
  }
  function clearLoadFailureBanner() {
    const host = document.getElementById("load-failure-banner");
    if (host) { host.hidden = true; host.innerHTML = ""; }
  }

  function setStatus(text) {
    const el = document.getElementById("content-status");
    if (el) el.textContent = text;
  }

  const LAST_N = 10;

  // Colour endpoints for the two intensity-shaded cells.
  const GREEN_END = [46, 125, 79];   // var(--green) = #2e7d4f
  const BLUE_END  = [74, 137, 199];  // var(--blue)  = #4a89c7

  function shadeWhiteTo(t, end) {
    t = Math.max(0, Math.min(1, t));
    const r = Math.round(255 + (end[0] - 255) * t);
    const g = Math.round(255 + (end[1] - 255) * t);
    const b = Math.round(255 + (end[2] - 255) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }

  // Colour scheme for overview cells and dots (4-stop gradient):
  //   untouched     → pale neutral cream (distinguishable from page --bg)
  //   0% mastery    → red          (last attempt wrong, no recent rights)
  //   30% mastery   → PALE yellow  (deliberately soft so it doesn't dominate
  //                                  as colour transitions into green)
  //   70% mastery   → pale green   (mostly right recently)
  //   100% mastery  → deep green   (consolidated)
  // Linear interpolation between adjacent stops.
  let RWG_RED        = [208,  72,  72];
  let RWG_YELLOW     = [240, 233, 204];
  let RWG_PALE_GREEN = [163, 210, 163];
  let RWG_GREEN      = [ 25, 110,  58];

  function rgbToHex(rgb) {
    const h = (n) => n.toString(16).padStart(2, "0");
    return "#" + h(rgb[0]) + h(rgb[1]) + h(rgb[2]);
  }
  function hexToRgb(hex) {
    const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(String(hex || "").trim());
    if (!m) return null;
    return [parseInt(m[1],16), parseInt(m[2],16), parseInt(m[3],16)];
  }
  function paletteAsJson() {
    return JSON.stringify({
      red:        rgbToHex(RWG_RED),
      yellow:     rgbToHex(RWG_YELLOW),
      paleGreen:  rgbToHex(RWG_PALE_GREEN),
      green:      rgbToHex(RWG_GREEN),
      yellowStop: vocabYellowStop,
      baseline:   vocabUnattemptedBaseline
    }, null, 2);
  }
  // Untouched fill — a neutral that reads as "empty slot" against the cream
  // page bg (#fdfaf4). Slightly cooler / darker so the eye registers it as
  // distinct from the page background.
  const RWG_UNATTEMPTED = "rgb(236, 229, 210)";

  function interpRGB(a, b, t) {
    return `rgb(${Math.round(a[0]+(b[0]-a[0])*t)}, ${Math.round(a[1]+(b[1]-a[1])*t)}, ${Math.round(a[2]+(b[2]-a[2])*t)})`;
  }

  // Tunable gradient stops. yellowStop is where the gradient reaches pale
  // yellow (default 0.2 per user spec). greenStop is where it reaches pale
  // green (0.7). Both expressed as 0..1 correctness values.
  let vocabYellowStop = 0.2;
  const vocabGreenStop = 0.7;
  // Unattempted baseline: when a cell has no events at all, treat it as
  // having this correctness value for the purpose of colouring (so the cell
  // is filled, not blank). Default 0.2 per user spec.
  let vocabUnattemptedBaseline = 0.2;

  function rwgColour(correctness, hasEvents) {
    const baseline = hasEvents ? Math.max(0, Math.min(1, correctness)) : vocabUnattemptedBaseline;
    const c = baseline;
    const yStop = vocabYellowStop;
    const gStop = vocabGreenStop;
    if (c <= yStop) {
      const t = yStop > 0 ? c / yStop : 0;
      return interpRGB(RWG_RED, RWG_YELLOW, t);
    } else if (c <= gStop) {
      const t = (gStop > yStop) ? (c - yStop) / (gStop - yStop) : 0;
      return interpRGB(RWG_YELLOW, RWG_PALE_GREEN, t);
    } else {
      const t = (gStop < 1) ? (c - gStop) / (1 - gStop) : 0;
      return interpRGB(RWG_PALE_GREEN, RWG_GREEN, t);
    }
  }

  // Mark formatter: integer when integer-valued, else 1 decimal.
  function fmtMark(n) {
    if (n === undefined || n === null) return "0";
    if (Math.abs(n - Math.round(n)) < 0.01) return String(Math.round(n));
    return n.toFixed(1);
  }

  // Translate a markpoint outcome to a friendly status word for the result panel.
  function friendlyOutcome(mp) {
    switch (mp.outcome) {
      case "hit": return { word: "Right", cls: "outcome-right" };
      case "miss": return { word: "Wrong", cls: "outcome-wrong" };
      case "partial": return { word: "Partly right", cls: "outcome-partial" };
      case "not_attempted": return { word: "Didn't try", cls: "outcome-none" };
      default: return { word: (mp.outcome || "n/a"), cls: "outcome-none" };
    }
  }

  // Fisher-Yates shuffle (non-mutating).
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // Track recently-changed buckets so the live panel can flash them
  let recentlyChangedBuckets = new Set();

  // Freshness propagates to ancestors: a node is fresh when the last attempt
  // recorded an event on it OR on any descendant (id-prefix match). Without
  // this, the overview topic tiles never read as fresh and the post-Mark
  // scroll silently no-ops in the default view. See inter_chat/
  // Architecture_Housing_grammar_view_space_and_scroll.md v6.
  function bucketIsFresh(id) {
    if (recentlyChangedBuckets.has(id)) return true;
    const prefix = id + ".";
    for (const b of recentlyChangedBuckets) {
      if (b.startsWith(prefix)) return true;
    }
    return false;
  }

  // -------------------- pretty breadcrumb --------------------
  // Resolve a bucket id (full dot-path) to a readable breadcrumb:
  // "adjective_agreement.o_class.feminine_singular"
  //   -> "Adjective agreement › Class I (-o) › Class I, fem sg (-a)"
  function prettyBreadcrumb(bucketId) {
    if (!bucketId) return "";
    const node = bucketIndex.byId[bucketId];
    if (!node) return bucketId.replace(/_/g, " ").replace(/\./g, " › ");
    const labels = [];
    let cur = node;
    while (cur) {
      labels.unshift(cur.label || cur.id);
      cur = cur.parent_id ? bucketIndex.byId[cur.parent_id] : null;
    }
    return labels.join(" › ");
  }

  // -------------------- nav --------------------
  function showStrand(name) {
    hideEntry();
    hideCoverage();
    document.querySelectorAll(".strand").forEach(s => s.hidden = (s.id !== "strand-" + name));
    document.querySelectorAll("nav#strand-nav button").forEach(b =>
      b.classList.toggle("active", b.dataset.strand === name));
    // Body class drives whether live-stats aside is visible. Vocab tab claims
    // the whole right side for the multi-axis heatmap.
    document.body.classList.toggle("strand-vocab-active", name === "vocab");
    if (name === "buckets") renderBucketsBrowse();
    if (name === "grammar") focusGrammarInput();
    if (name === "translation") focusTranslationInput();
    if (name === "vocab") { renderVocab(); focusVocabInput(); }
  }
  document.querySelectorAll("nav#strand-nav button").forEach(b =>
    b.addEventListener("click", () => showStrand(b.dataset.strand)));

  // -------------------- accent bar (shared) --------------------
  // opts.rewriteApostrophes: if false, don't auto-rewrite `e'` -> `è` etc.
  // (Set this to false for English-target inputs, where "I've" should stay
  // as "I've" and not get autocorrected to "Ìve".)
  function buildAccentBar(input, opts) {
    opts = opts || {};
    const rewriteApostrophes = opts.rewriteApostrophes !== false;

    const bar = document.createElement("div");
    bar.className = "accent-bar";
    const accents = ["à", "è", "é", "ì", "ò", "ù", "À", "È", "É", "Ì", "Ò", "Ù"];
    for (const a of accents) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = a;
      btn.addEventListener("click", e => {
        e.preventDefault();
        const start = input.selectionStart, end = input.selectionEnd;
        const v = input.value;
        input.value = v.slice(0, start) + a + v.slice(end);
        input.selectionStart = input.selectionEnd = start + a.length;
        input.focus();
      });
      bar.appendChild(btn);
    }
    if (rewriteApostrophes) {
      input.addEventListener("input", () => {
        const start = input.selectionStart;
        const rewritten = LL.normaliseAccentInput(input.value);
        if (rewritten !== input.value) {
          const delta = rewritten.length - input.value.length;
          input.value = rewritten;
          input.selectionStart = input.selectionEnd = Math.max(0, start + delta);
        }
      });
      // Inline hint so users know about the apostrophe shortcut.
      const hint = document.createElement("span");
      hint.className = "accent-hint";
      hint.textContent = "or type a' e' i' o' u' for à è ì ò ù  ·  e'' for é";
      bar.appendChild(hint);
    }
    return bar;
  }

  // -------------------- grammar strand --------------------
  let grammarIndex = 0;
  let grammarInputRef = null;

  // Extract a chip lemma from a grammar item's prompt cue (parenthetical at
  // the end of the prompt). Used by the second-chance prompt to detect when
  // the learner's answer has no stem overlap with the named target lemma.
  // See inter_chat/Architecture_Housing_second_chance_on_chip_mismatch.md.
  //
  // Returns the lemma string when extractable, else null:
  //   "(studiare, 1sg)"      -> "studiare"
  //   "(grande)"              -> "grande"
  //   "(to him + it)"         -> null   (multi-word; not a single lemma)
  //   "(see ref)"             -> null   (multi-word)
  function extractChipLemma(promptText) {
    const m = String(promptText || "").match(/\(([^)]+)\)\s*$/);
    if (!m) return null;
    const cueText = m[1];
    const first = (cueText.split(",")[0] || "").trim();
    if (!first) return null;
    if (/\s/.test(first)) return null;            // single word only
    if (/[.,;:!?"'\/+]/.test(first)) return null; // no punctuation (diacritics OK)
    return first;
  }

  // Stem-overlap test: returns true if the learner's answer doesn't share a
  // 3-character prefix with the chip lemma. The mismatch is the trigger for
  // the second-chance prompt.
  let _legacyBaseFormWarned = false;
  function wrongAnswerIsFormErrorOnly(q) {
    if (q.wrong_answer_is_form_error_only !== undefined) return !!q.wrong_answer_is_form_error_only;
    if (q.prompt_supplies_base_form !== undefined) {
      if (!_legacyBaseFormWarned) {
        _legacyBaseFormWarned = true;
        console.warn("[Linguics] item uses legacy field prompt_supplies_base_form (renamed wrong_answer_is_form_error_only, cue_placement v3/v4); honouring it, but the migration missed this file.");
      }
      return !!q.prompt_supplies_base_form;
    }
    return false;
  }

  function chipStemMismatch(answer, lemma) {
    const norm = (s) => String(s || "").toLowerCase().trim();
    const a = norm(answer);
    const l = norm(lemma);
    if (!a || !l) return false;
    const PREFIX = 3;
    return a.slice(0, PREFIX) !== l.slice(0, PREFIX);
  }

  // Render an inline second-chance prompt beneath the input. Buttons + keys:
  //   Yes, mark it / Enter   -> onConfirm()
  //   Let me try again / Esc -> onRetry()
  // Removes itself on either action. Tone is gentle ("Is that your final
  // answer?"), not chiding.
  function showSecondChancePrompt(host, chipLemma, onConfirm, onRetry) {
    const existing = host.querySelector(".second-chance-prompt");
    if (existing) existing.remove();
    const banner = document.createElement("div");
    banner.className = "second-chance-prompt";
    banner.tabIndex = -1;
    const msg = document.createElement("span");
    msg.className = "second-chance-msg";
    msg.innerHTML = "Is that your final answer? Remember, you\u2019re supposed to use <strong>" +
      escapeHtml(chipLemma) + "</strong>.";
    banner.appendChild(msg);
    const yes = document.createElement("button");
    yes.type = "button";
    yes.className = "second-chance-confirm";
    yes.textContent = "Yes, mark it";
    yes.addEventListener("click", () => { banner.remove(); onConfirm(); });
    banner.appendChild(yes);
    const no = document.createElement("button");
    no.type = "button";
    no.className = "second-chance-retry";
    no.textContent = "Let me try again";
    no.addEventListener("click", () => { banner.remove(); onRetry(); });
    banner.appendChild(no);
    banner.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); banner.remove(); onConfirm(); }
      else if (e.key === "Escape") { e.preventDefault(); banner.remove(); onRetry(); }
    });
    host.appendChild(banner);
    // Focus the confirm button so Enter has a default; Esc still retries.
    setTimeout(() => yes.focus(), 0);
  }

  // A zero-result state must NAME the blocking restriction and offer the fix in
  // one click, instead of leaving the learner to guess which filter bit. We test
  // each active facet by relaxing it and seeing whether anything comes back.
  // See inter_chat/Architecture_Housing_drill_filter_ux_and_dropdown_labels.md.
  function buildEmptyState(pool, filter, noun, onChanged) {
    const el = document.createElement("div");
    el.className = "muted empty-state";
    const lvl = cefrLabelFor(filter);
    const scope = scopeLabelFor(filter);
    let msg = "No " + (lvl ? lvl + " " : "") + noun;
    if (filter.bucketPath) msg += " in this bucket";
    else if (scope) msg += " under " + scope;
    const line = document.createElement("div");
    line.className = "empty-state-msg";
    line.textContent = msg + ".";
    el.appendChild(line);

    const tries = [];
    if (filter.bucketPath) tries.push({
      label: "Clear the drill",
      relaxed: Object.assign({}, filter, { bucketPath: "" }),
      apply: () => clearBucketFilter()
    });
    if (lvl) tries.push({
      label: "Widen the level",
      relaxed: Object.assign({}, filter, { cefr: "", cefrRange: null, cefrLevels: null }),
      apply: () => { filter.cefr = ""; filter.cefrRange = null; filter.cefrLevels = null; onChanged(); }
    });
    if (scope) tries.push({
      label: "Clear the topic",
      relaxed: Object.assign({}, filter, { topic: "", clauses: null }),
      apply: () => { filter.topic = ""; filter.clauses = null; onChanged(); }
    });
    const unblock = tries.filter(x => applyFilter(pool, x.relaxed).length > 0);
    const actions = document.createElement("div");
    actions.className = "empty-actions";
    if (unblock.length) {
      for (const u of unblock) {
        const b = document.createElement("button");
        b.type = "button"; b.className = "empty-action";
        b.textContent = u.label;
        b.addEventListener("click", u.apply);
        actions.appendChild(b);
      }
    } else if (tries.length) {
      // No single relaxation helps: offer the whole reset rather than a lie.
      const b = document.createElement("button");
      b.type = "button"; b.className = "empty-action";
      b.textContent = "Clear all filters";
      b.addEventListener("click", () => {
        filter.bucketPath = ""; filter.cefr = ""; filter.cefrRange = null; filter.cefrLevels = null;
        filter.topic = ""; filter.clauses = null;
        _preDrillScope = null;
        onChanged();
      });
      actions.appendChild(b);
    }
    if (actions.children.length) el.appendChild(actions);
    return el;
  }

  function renderGrammar() {
    const host = document.getElementById("grammar-host");
    host.innerHTML = "";
    if (!grammarQuestions.length) { host.textContent = "No grammar questions loaded."; return; }
    ensureGrammarDeck();
    if (!grammarDeck.length) {
      host.appendChild(buildEmptyState(grammarQuestions, grammarFilter, "questions", () => {
        grammarDeck = []; grammarIndex = 0;
        renderGrammarFilterBar(); renderGrammar();
      }));
      return;
    }
    const q = grammarDeck[grammarIndex % grammarDeck.length];
    const vocabHelpsUsed = [];
    const isMcq = q.type === "mcq" && Array.isArray(q.choices) && q.choices.length > 0;
    // Pre-answer suppression hint for the live stats panel. Cleared when the
    // item is marked. See inter_chat/Architecture_Housing_info_display_suppress.md.
    setInFlightSuppress(q);

    const card = document.createElement("div");
    card.className = "qcard";

    const meta = document.createElement("div");
    meta.className = "meta faint";
    // No topic breadcrumb here: it gives the answer away. Topic info appears
    // in the result panel after the learner has had their go.
    const extras = [];
    if (q.cefr_level_target) extras.push(`CEFR ${q.cefr_level_target}`);
    if (q.marks) extras.push(`${q.marks} mark${q.marks > 1 ? "s" : ""}`);
    meta.textContent = extras.join(" · ");
    meta.title = q.external_id || "";
    card.appendChild(meta);

    card.appendChild(renderPromptElement(q.prompt, q, vocabHelpsUsed));

    // Branch on item type: free-text vs multiple-choice.
    let input = null, selectedChoiceIdx = null, choiceButtons = [];
    if (isMcq) {
      // MCQ rendering: choices as clickable buttons. The substring-based
      // grammar marker can't reliably score short MCQ options (a 2-letter
      // pronoun choice like "lo" substring-matches "lui"), so MCQ items
      // are scored by direct index comparison against q.answer_index.
      const choicesHost = document.createElement("div");
      choicesHost.className = "mcq-choices";
      q.choices.forEach((choiceText, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "mcq-choice";
        btn.textContent = choiceText;
        btn.addEventListener("click", () => {
          if (marked) return; // choice is locked once marked
          selectedChoiceIdx = idx;
          choiceButtons.forEach((b, j) => b.classList.toggle("selected", j === idx));
          // Touch-first: tapping a choice IS the answer. Mark immediately
          // instead of demanding a second tap on Mark.
          if (TOUCH_FIRST) doMark();
        });
        // Intercept Enter on a focused choice button: pressing Enter should
        // fire Mark (or Next, post-mark), not re-fire the button's default
        // click (which would just re-select the same choice).
        btn.addEventListener("keydown", e => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (marked) doNext();
            else doMark();
          }
        });
        choiceButtons.push(btn);
        choicesHost.appendChild(btn);
      });
      card.appendChild(choicesHost);
      // Card-level keydown for MCQ: number keys 1-N select the corresponding
      // choice and move focus to it. Faster than clicking when the learner
      // wants to keep their hands on the keyboard.
      card.addEventListener("keydown", e => {
        if (!/^[1-9]$/.test(e.key)) return;
        const idx = parseInt(e.key, 10) - 1;
        if (idx < 0 || idx >= choiceButtons.length) return;
        // Ignore number keys typed inside any future text input on the card
        // (none today, but keeps the listener defensive).
        const tag = (e.target && e.target.tagName) || "";
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        selectedChoiceIdx = idx;
        choiceButtons.forEach((b, j) => b.classList.toggle("selected", j === idx));
        choiceButtons[idx].focus();
      });
      // MCQ items don't render vocab-help / accent-bar / slash-menu.
      // Decision (Bug 1a, 2026-05-28): on a forced-choice item the learner
      // is picking between fully-rendered choices, not retrieving a word
      // from memory. Vocab help would only obscure the diagnostic.
      grammarInputRef = null;
    } else {
      // Free-text rendering: text input + accent bar + vocab help.
      input = document.createElement("input");
      input.type = "text";
      const hasHelps = q.vocab_help && q.vocab_help.length;
      input.placeholder = hasHelps
        ? "Type your answer; / for vocab help; Enter to mark."
        : "Type your answer; press Enter to mark.";
      input.autocomplete = "off";
      card.appendChild(input);
      grammarInputRef = input;
      // Grammar answers are typed in the question's language_code (usually 'it').
      // Apostrophe-rewrite only makes sense when the target is Italian.
      card.appendChild(buildAccentBar(input, { rewriteApostrophes: (q.language_code || "it") === "it" }));

      const helpBar = buildVocabHelpBar(q, vocabHelpsUsed);
      if (helpBar) card.appendChild(helpBar);
      attachVocabSlashMenu(input, q, vocabHelpsUsed);
    }

    const actions = document.createElement("div");
    actions.className = "actions";
    const mark = document.createElement("button"); mark.textContent = "Mark";
    // Pre-mark the button means "skip without marking"; post-mark it means
    // "advance". Label it honestly in each state.
    const next = document.createElement("button"); next.className = "secondary"; next.textContent = "Skip";
    next.title = "Skip this question without marking it";
    const hint = document.createElement("span"); hint.className = "kbd-hint";
    hint.textContent = isMcq
      ? "Click a choice or press 1-" + q.choices.length + ". Enter to mark. Enter again to advance."
      : "Enter to mark · Enter again to advance";
    actions.appendChild(mark); actions.appendChild(next); actions.appendChild(hint);
    card.appendChild(actions);

    const resultHost = document.createElement("div");
    card.appendChild(resultHost);

    // `marked` flag drives the second-Enter-advances behaviour even when
    // focus didn't move to the Next button (Bug 2, 2026-05-28).
    let marked = false;

    // Per-item flag: second-chance prompt fires at most once per item render.
    // A learner who answers wrong, gets the prompt, confirms or edits, then
    // gets it wrong again is not re-prompted.
    let secondChanceShown = false;

    const commitResult = (result, rawForRecord) => {
      const attempt = LL.store.recordAttempt("grammar", q, rawForRecord, result);
      track("grammar_marked", { outcome: result.overall.status, awarded: result.overall.marks_awarded, possible: result.overall.marks_possible });
      recentlyChangedBuckets = new Set(attempt.events.map(e => e.bucket));
      // Post-answer surfaces are unaffected by info_display: "suppress",
      // so clear the in-flight hint before re-rendering the live panel.
      clearInFlightSuppress();
      resultHost.innerHTML = "";
      resultHost.appendChild(renderResult(result));
      const tenseRow = renderCandidateTensesRow(q);
      if (tenseRow) resultHost.appendChild(tenseRow);
      if (TOUCH_FIRST) {
        const jump = document.createElement("button");
        jump.type = "button";
        jump.className = "grammar-updated-hint";
        jump.innerHTML = 'Grammar progress updated <span aria-hidden="true">\u2193</span>';
        jump.addEventListener("click", () => scrollToFreshBuckets({ force: true }));
        resultHost.appendChild(jump);
      }
      renderLiveStats();
      marked = true;
      next.textContent = "Next";
      next.title = "Advance to the next question";
      // Deferring focus past the current event-loop tick is more reliable
      // across browsers than calling synchronously inside a keydown handler.
      setTimeout(() => next.focus({ preventScroll: true }), 0);
    };

    const doMark = () => {
      let result;
      if (isMcq) {
        if (selectedChoiceIdx === null) {
          // No choice picked yet; nudge but don't record an attempt.
          resultHost.innerHTML = "";
          const nudge = document.createElement("div");
          nudge.className = "muted";
          nudge.style.cssText = "padding:10px;font-style:italic";
          nudge.textContent = "Pick one of the choices above, then press Mark or Enter.";
          resultHost.appendChild(nudge);
          return;
        }
        result = buildMcqResult(q, selectedChoiceIdx);
      } else {
        const raw = input.value;
        result = LL.markGrammar(q, raw);
        appendVocabHelpEvents(result, vocabHelpsUsed, q);
        appendActiveProductionHits(result, vocabHelpsUsed, q, raw);
      }
      const rawForRecord = isMcq ? q.choices[selectedChoiceIdx] : input.value;

      // Second-chance guard (see inter_chat/Architecture_Housing_second_chance_on_chip_mismatch.md
      // for the introduction; narrowed 2026-06-08 per
      // inter_chat/Architecture_Housing_second_chance_narrowing.md).
      // Triggers only when:
      //   - the item is short-answer (not MCQ),
      //   - we haven't already prompted this item,
      //   - the item is NOT a conjugation drill that hands the learner the
      //     base form via the cue (wrong_answer_is_form_error_only): on those, a
      //     wrong answer is a form / spelling error of the cued verb, not a
      //     cue misread, and the marker should just record it. The whole
      //     present-formation batch (and future / conditional to come) ships
      //     with this flag set.
      //   - the outcome is a clean miss (zero marks),
      //   - no must_not_include matched (catalogued wrong forms are known
      //     errors the item was built to catch; no rescue),
      //   - the chip has an extractable lemma AND the answer's stem doesn't
      //     overlap the lemma's stem (the cue-misread signal).
      // Field renamed per Architecture_Housing_cue_placement v3/v4: the old
      // name (prompt_supplies_base_form) asked a descriptive question about
      // the prompt, which 1,083 items answered honestly while meaning the
      // wrong thing. The new name states the author's actual claim: a wrong
      // answer here can only be a form/spelling error of the cued word, so
      // the cue-misread rescue must not fire. Legacy read is a tripwire, not
      // a compat layer - it warns so unmigrated items surface.
      if (!isMcq && !secondChanceShown && !wrongAnswerIsFormErrorOnly(q)) {
        const isCleanMiss = result.overall.marks_awarded === 0
          && Array.isArray(result.markpoints)
          && result.markpoints.every(mp => mp.outcome === "miss" || mp.outcome === "not_attempted");
        const hadRecognisedWrong = Array.isArray(result.markpoints)
          && result.markpoints.some(mp => mp.evidence && /\(wrong form\)/.test(String(mp.evidence)));
        const chipLemma = extractChipLemma(q.prompt);
        if (isCleanMiss && !hadRecognisedWrong && chipLemma && chipStemMismatch(rawForRecord, chipLemma)) {
          secondChanceShown = true;
          showSecondChancePrompt(
            resultHost,
            chipLemma,
            () => commitResult(result, rawForRecord),         // confirm: mark as wrong
            () => { setTimeout(() => input.focus(), 0); }      // retry: cancel mark, return focus
          );
          return;
        }
      }

      commitResult(result, rawForRecord);
    };
    const doNext = () => {
      grammarIndex++;
      if (grammarIndex >= grammarDeck.length) {
        grammarDeck = shuffle(applyFilter(grammarQuestions, grammarFilter));
        grammarIndex = 0;
      }
      renderGrammar();
    };

    mark.addEventListener("click", doMark);
    next.addEventListener("click", doNext);

    if (input) {
      input.addEventListener("keydown", e => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          // Bug 2 fix: if we've already marked, advance instead of re-marking.
          // This makes second-Enter-advances robust against focus quirks.
          if (marked) doNext();
          else doMark();
        }
      });
    }
    next.addEventListener("keydown", e => {
      if (e.key === "Enter") { e.preventDefault(); doNext(); }
    });

    host.appendChild(card);
    setTimeout(() => {
      ensureCardVisible(card);
      if (input) input.focus({ preventScroll: true });
      else if (choiceButtons.length) choiceButtons[0].focus({ preventScroll: true });
    }, 0);
  }

  // MCQ scorer: builds a result with the same shape as markGrammar so the
  // renderResult pipeline doesn't care which marker produced it.
  function buildMcqResult(q, pickedIdx) {
    const possible = q.marks || 1;
    const correct = pickedIdx === q.answer_index;
    const points = Array.isArray(q.markpoints) ? q.markpoints : [];
    const choice = q.choices[pickedIdx];
    const expectedChoice = q.choices[q.answer_index];
    const mpResults = [];
    let awarded = 0;
    for (const mp of points) {
      const credit = (typeof mp.credit === "number") ? mp.credit : 1;
      mpResults.push({
        bucket: mp.bucket,
        label: mp.label || "",
        credit_weight: credit,
        attempted_credit: 1,
        correctness_credit: correct ? 1 : 0,
        outcome: correct ? "hit" : "miss",
        evidence: choice,
        expected: expectedChoice
      });
      if (correct) awarded += credit;
    }
    if (awarded > possible) awarded = possible;
    return {
      raw_response: choice,
      overall: {
        attempted_overall: 1,
        correctness_overall: correct ? 1 : 0,
        marks_awarded: awarded,
        marks_possible: possible,
        status: correct ? "hit" : "miss",
        summary: correct ? "Right" : ("Wrong - correct was \"" + expectedChoice + "\""),
        explanation: q.explanation || null,
        examiner_note: q.examiner_note || null
      },
      markpoints: mpResults,
      orthography: []
    };
  }
  function focusGrammarInput() { if (grammarInputRef) grammarInputRef.focus(); }

  // -------------------- translation strand --------------------
  let translationIndex = 0;
  let translationTextareaRef = null;

  function renderTranslation() {
    const host = document.getElementById("translation-host");
    host.innerHTML = "";
    if (!translationItems.length) { host.textContent = "No translation items loaded."; return; }
    ensureTranslationDeck();
    if (!translationDeck.length) {
      host.appendChild(buildEmptyState(translationItems, translationFilter, "items", () => {
        translationDeck = []; translationIndex = 0;
        renderTranslationFilterBar(); renderTranslation();
      }));
      return;
    }
    const it = translationDeck[translationIndex % translationDeck.length];
    const vocabHelpsUsed = [];
    setInFlightSuppress(it);

    const card = document.createElement("div");
    card.className = "qcard";

    const meta = document.createElement("div");
    meta.className = "meta faint";
    // No topic breadcrumb. Direction (EN → IT) is fine to show, it doesn't
    // give away the grammar being tested.
    const dir = (it.source_lang || "").toUpperCase() + " → " + (it.target_lang || "").toUpperCase();
    const extras = [dir];
    if (it.cefr_level_target) extras.push(`CEFR ${it.cefr_level_target}`);
    if (it.register) extras.push(it.register);
    meta.textContent = extras.join(" · ");
    meta.title = it.external_id || "";
    card.appendChild(meta);

    card.appendChild(renderPromptElement(it.source_text, it, vocabHelpsUsed));

    const textarea = document.createElement("textarea");
    const hasHelps = it.vocab_help && it.vocab_help.length;
    textarea.placeholder = hasHelps
      ? "Your translation. / for vocab help. Enter to mark; Shift+Enter for a line break."
      : "Your translation. Enter to mark; Shift+Enter for a line break. Wrap with <g>...</g>, <s>...</s>, <f>...</f> for annotations.";
    card.appendChild(textarea);
    translationTextareaRef = textarea;
    // Apostrophe-rewrite only makes sense when the target is Italian.
    // For IT->EN, typing "I've" must not be turned into "Ìve".
    card.appendChild(buildAccentBar(textarea, { rewriteApostrophes: it.target_lang === "it" }));

    const helpBar = buildVocabHelpBar(it, vocabHelpsUsed);
    if (helpBar) card.appendChild(helpBar);
    attachVocabSlashMenu(textarea, it, vocabHelpsUsed);

    const intentBar = document.createElement("div");
    intentBar.className = "intent-bar";
    intentBar.innerHTML = '<label>Intent:</label>';
    const intentSel = document.createElement("select");
    for (const v of ["literal", "guess", "sense"]) {
      const o = document.createElement("option"); o.value = v; o.textContent = v;
      intentSel.appendChild(o);
    }
    intentBar.appendChild(intentSel);
    card.appendChild(intentBar);

    const annoBar = document.createElement("div");
    annoBar.className = "annotation-bar";
    [["g", "Guess"], ["s", "Sense"], ["f", "Flair"]].forEach(([tag, label]) => {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = label;
      b.addEventListener("click", () => wrapSelection(textarea, tag));
      annoBar.appendChild(b);
    });
    card.appendChild(annoBar);

    const actions = document.createElement("div");
    actions.className = "actions";
    const mark = document.createElement("button"); mark.textContent = "Mark";
    const next = document.createElement("button"); next.className = "secondary"; next.textContent = "Skip";
    next.title = "Skip this item without marking it";
    const hint = document.createElement("span"); hint.className = "kbd-hint";
    hint.textContent = "Enter to mark · Shift+Enter for newline · Enter on Next to advance";
    actions.appendChild(mark); actions.appendChild(next); actions.appendChild(hint);
    card.appendChild(actions);

    const resultHost = document.createElement("div");
    card.appendChild(resultHost);

    const doMark = async () => {
      const raw = textarea.value;
      const intent = intentSel.value;

      // Use live AI marker when a Worker URL is configured; otherwise fall
      // back to the substring-tells stub.
      const markerUrl = (typeof LL.markerUrl === "function") ? LL.markerUrl() : "";
      let result, costLine = null;
      if (markerUrl) {
        // Show a "marking..." indicator while the AI thinks
        resultHost.innerHTML = '<div class="muted" style="padding:14px;font-style:italic">Marking via AI...</div>';
        try {
          const bucketContext = LL.buildBucketContext(it, bucketIndex.byId);
          const payload = await LL.markTranslationLive(it, raw, intent, { bucketContext });
          result = payload.result;
          if (!result.raw_response) result.raw_response = raw;
          // Belt-and-braces: post-process AI markpoints to resolve any base
          // vocab translation ids to their .active/.passive variant. The AI
          // sees variant ids in bucket_context already, but might shortcut.
          if (typeof LL.resolveVocabInMarkpoints === "function" && typeof LL.inferDirection === "function") {
            const direction = LL.inferDirection(it);
            result.markpoints = LL.resolveVocabInMarkpoints(result.markpoints, direction);
          }
          // Build the cost line
          const modelShort = (payload.model_used || "").split("/").pop() || "model";
          costLine = document.createElement("div");
          costLine.className = "marker-cost";
          costLine.textContent = `${modelShort} · ${payload.usage.input_tokens} in, ${payload.usage.output_tokens} out · ${LL.formatCost(payload.cost_usd)}`;
        } catch (e) {
          // Fallback to stub on error so the learner still gets a result
          resultHost.innerHTML = '<div class="muted" style="padding:8px;font-style:italic;color:#b03030">Live marker failed: ' + (e.message || e) + '. Falling back to stub.</div>';
          result = LL.markTranslationStub(it, raw, intent);
        }
      } else {
        result = LL.markTranslationStub(it, raw, intent);
      }

      appendVocabHelpEvents(result, vocabHelpsUsed, it);
      appendActiveProductionHits(result, vocabHelpsUsed, it, raw);
      const attempt = LL.store.recordAttempt("translation", it, raw, result, intent);
      recentlyChangedBuckets = new Set(attempt.events.map(e => e.bucket));
      resultHost.innerHTML = "";
      resultHost.appendChild(renderResult(result));
      const tenseRowT = renderCandidateTensesRow(it);
      if (tenseRowT) resultHost.appendChild(tenseRowT);
      if (costLine) resultHost.appendChild(costLine);
      renderLiveStats();
      next.textContent = "Next";
      next.title = "Advance to the next item";
      next.focus({ preventScroll: true });
    };
    const doNext = () => {
      translationIndex++;
      if (translationIndex >= translationDeck.length) {
        translationDeck = shuffle(applyFilter(translationItems, translationFilter));
        translationIndex = 0;
      }
      renderTranslation();
    };

    mark.addEventListener("click", doMark);
    next.addEventListener("click", doNext);

    textarea.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doMark(); }
    });
    next.addEventListener("keydown", e => {
      if (e.key === "Enter") { e.preventDefault(); doNext(); }
    });

    host.appendChild(card);
    setTimeout(() => {
      ensureCardVisible(card);
      textarea.focus({ preventScroll: true });
    }, 0);
  }
  function focusTranslationInput() { if (translationTextareaRef) translationTextareaRef.focus(); }

  // ============================================================================
  // Vocab strand: minimal translation-only practice.
  // One word at a time. Direction toggle (IT→EN default, or EN→IT). Frequency-
  // band filter. Each attempt fires events on the lemma's translation bucket
  // and on the entry's frequency-band bucket so both signals accumulate.
  // Richer aspects (gender, plural, conjugation, auxiliary) deferred; will
  // come as learner-picked subsections, not random aspect picking.
  // ============================================================================

  let vocabEntries = [];
  let vocabDeck = [];
  let vocabDeckDirs = [];   // per-card directions when direction is "mix"
  let vocabIndex = 0;
  let vocabFilter = {
    band: "",
    direction: "it_en",
    theme: "",
    themes: null,       // list of theme ids OR'd (multi-id category chips, e.g. Numbers = cardinal+ordinal)
    genderClass: "",
    rankRange: null,
    rankRanges: null,   // list of {start,end} OR'd - the entry builder's frequency selection (vocab_session_builder v2: non-contiguous bands)
    drillLevel: null,   // null | "thousand" | "hundred" | "ten"
    genderDrill: false, // nouns-only production focus (Smith gender ask)
    topN: 0,            // 0 = all; else max rank to include in scope
    subBand: ""         // "" | "A1-core" | "A1-secure" | ... | "C1-stretch"
  };
  // CEFR sub-band rank ranges from the vocab chat's mapping (deliberately
  // overlapping at boundaries: A1-stretch and A2-core both cover 801-1000).
  const VOCAB_SUBBANDS = [
    { id: "A1-core",    start: 1,     end: 500 },
    { id: "A1-secure",  start: 501,   end: 800 },
    { id: "A1-stretch", start: 801,   end: 1000 },
    { id: "A2-core",    start: 801,   end: 1300 },
    { id: "A2-secure",  start: 1301,  end: 1700 },
    { id: "A2-stretch", start: 1701,  end: 2000 },
    { id: "B1-core",    start: 1701,  end: 2500 },
    { id: "B1-secure",  start: 2501,  end: 3200 },
    { id: "B1-stretch", start: 3201,  end: 4000 },
    { id: "B2-core",    start: 3201,  end: 5000 },
    { id: "B2-secure",  start: 5001,  end: 6500 },
    { id: "B2-stretch", start: 6501,  end: 8000 },
    { id: "C1-core",    start: 6501,  end: 9000 },
    { id: "C1-secure",  start: 9001,  end: 11000 },
    { id: "C1-stretch", start: 11001, end: 13000 }
  ];
  function vocabSubbandRange(id) {
    return VOCAB_SUBBANDS.find(s => s.id === id) || null;
  }

  // The RATIFIED category chip list (Architecture_Vocab_display_theme_grouping
  // v3, ratified v4): 94 chips - 30 parents + 64 sub-themes - in 4 sections.
  // Labels are Vocab's editorial deliverable and render verbatim; ids are the
  // engine's. Multi-id chips query as a set-union. Counts are NEVER baked
  // (v4 ruling): anything a learner sees is computed live at render.
  const VOCAB_CATEGORY_SECTIONS = [
    { section: "Everyday", chips: [
      { label: "Numbers", ids: ["numbers_cardinal", "numbers_ordinal"] },
      { label: "Colours", ids: ["colours"] },
      { label: "Days, months & seasons", ids: ["days_of_week", "months", "seasons", "parts_of_day"] },
      { label: "Time words", ids: ["time_general"] },
      { label: "Family", ids: ["people_family"] },
      { label: "Body", ids: ["body"], subs: [
        { label: "Head & face", ids: ["body_head"] },
        { label: "Arms & legs", ids: ["body_limbs"] },
        { label: "Torso", ids: ["body_torso"] },
        { label: "Organs & bones", ids: ["body_internal"] },
        { label: "Skin, hair & fluids", ids: ["body_surface"] },
        { label: "Animal body parts", ids: ["body_animal_part"] }
      ] },
      { label: "Food & drink", ids: ["food_drink"], subs: [
        { label: "Fruit", ids: ["food_fruit"] },
        { label: "Vegetables", ids: ["food_vegetable"] },
        { label: "Meat & fish", ids: ["food_meat_fish"] },
        { label: "Dairy & eggs", ids: ["food_dairy"] },
        { label: "Grains, bread & pasta", ids: ["food_grain_pasta"] },
        { label: "Sweets & desserts", ids: ["food_sweet"] },
        { label: "Herbs, spices & condiments", ids: ["food_herb_spice"] },
        { label: "Meal types & courses", ids: ["food_meal_type"] },
        { label: "Alcoholic drinks", ids: ["drink_alcoholic"] },
        { label: "Soft drinks", ids: ["drink_nonalcoholic"] },
        { label: "Kitchen & tableware", ids: ["food_utensil"] }
      ] },
      { label: "Clothing", ids: ["clothing"] },
      { label: "Home", ids: ["home"] },
      { label: "Weather", ids: ["weather"] }
    ] },
    { section: "Out in the world", chips: [
      { label: "Places in town", ids: ["city_places"], subs: [
        { label: "Shops & restaurants", ids: ["places_commerce"] },
        { label: "Government buildings", ids: ["places_civic"] },
        { label: "Schools & libraries", ids: ["places_education"] },
        { label: "Hospitals & clinics", ids: ["places_health"] },
        { label: "Museums & monuments", ids: ["places_culture"] },
        { label: "Churches & religious sites", ids: ["places_religious"] },
        { label: "Stations & airports", ids: ["places_transit"] },
        { label: "Parks, streets & squares", ids: ["places_outdoor"] }
      ] },
      { label: "Transport", ids: ["transport"], subs: [
        { label: "Cars, buses & trains", ids: ["transport_land"] },
        { label: "Boats & ships", ids: ["transport_water"] },
        { label: "Planes & helicopters", ids: ["transport_air"] },
        { label: "Vehicle parts", ids: ["transport_part"] },
        { label: "Roads, bridges & tracks", ids: ["transport_infrastructure"] },
        { label: "Journeys & routes", ids: ["transport_journey"] },
        { label: "Tickets & paperwork", ids: ["transport_document"] }
      ] },
      { label: "Directions", ids: ["direction"] },
      { label: "Countries & regions", ids: ["geography_admin"] },
      { label: "Nature", ids: ["nature"] },
      { label: "Animals", ids: ["animals"], subs: [
        { label: "Pets", ids: ["animals_pet"] },
        { label: "Farm animals", ids: ["animals_farm"] },
        { label: "Wild mammals", ids: ["animals_wild_mammal"] },
        { label: "Birds", ids: ["animals_bird"] },
        { label: "Sea creatures", ids: ["animals_sea_creature"] },
        { label: "Reptiles & amphibians", ids: ["animals_reptile_amphibian"] },
        { label: "Insects", ids: ["animals_insect"] }
      ] },
      { label: "Plants", ids: ["plants"] }
    ] },
    { section: "People, work & society", chips: [
      { label: "Professions", ids: ["people_roles"], subs: [
        { label: "Politicians & leaders", ids: ["roles_political"] },
        { label: "Lawyers & judges", ids: ["roles_legal"] },
        { label: "Military & police", ids: ["roles_security"] },
        { label: "Teachers & students", ids: ["roles_education"] },
        { label: "Doctors & nurses", ids: ["roles_medical"] },
        { label: "Priests & religious roles", ids: ["roles_religious"] },
        { label: "Artists & journalists", ids: ["roles_arts_media"] },
        { label: "Business & office roles", ids: ["roles_business"] },
        { label: "Trades & service work", ids: ["roles_trade_service"] },
        { label: "Engineers & scientists", ids: ["roles_technical_science"] },
        { label: "Athletes & coaches", ids: ["roles_sports"] },
        { label: "Citizens, guests & residents", ids: ["roles_status_general"] }
      ] },
      { label: "Nationalities", ids: ["adjective_nationality"] },
      { label: "School", ids: ["school_education"] },
      { label: "Work & business", ids: ["work_business"] },
      { label: "Shopping & money", ids: ["shopping_money"] },
      { label: "Health & medicine", ids: ["health_medicine"] },
      { label: "Sports & leisure", ids: ["sports_leisure"] },
      { label: "Politics & society", ids: ["politics_society"] },
      { label: "Law & justice", ids: ["law_justice"] }
    ] },
    { section: "Culture, mind & self", chips: [
      { label: "Arts & entertainment", ids: ["arts_entertainment"], subs: [
        { label: "Music", ids: ["arts_music"] },
        { label: "Visual arts", ids: ["arts_visual"] },
        { label: "Literature & writing", ids: ["arts_literature"] },
        { label: "Theatre & dance", ids: ["arts_performing"] },
        { label: "Film & TV", ids: ["arts_film_tv"] },
        { label: "General arts terms", ids: ["arts_general"] }
      ] },
      { label: "Science & technology", ids: ["science_technology"], subs: [
        { label: "Computing & digital", ids: ["tech_computing"] },
        { label: "Physics", ids: ["science_physics"] },
        { label: "Chemistry", ids: ["science_chemistry"] },
        { label: "Biology & life sciences", ids: ["science_biology"] },
        { label: "Mathematics", ids: ["science_math"] },
        { label: "Astronomy & earth sciences", ids: ["science_astronomy"] },
        { label: "General science terms", ids: ["science_general"] }
      ] },
      { label: "Emotions", ids: ["emotions"] },
      { label: "Physical sensations", ids: ["sensations_physical"] },
      { label: "Personal care", ids: ["personal_care"] }
    ] }
  ];

  // ---- vocab session-builder helpers (inter_chat/Architecture_Housing_vocab_session_builder.md) ----
  function mergeRankRanges(ranges) {
    const s = ranges.slice().sort((a, b) => a.start - b.start);
    const out = [];
    for (const r of s) {
      const last = out[out.length - 1];
      if (last && r.start <= last.end + 1) last.end = Math.max(last.end, r.end);
      else out.push({ start: r.start, end: r.end });
    }
    return out;
  }
  // CEFR lens spans, read from the vocabulary_frequency band registry's
  // cefr_subbands tags (v3 ruling: real data, overlapping by design, with the
  // core/secure/stretch tier). Tag may be coarse ("A1") or a subband
  // ("A1-secure"). Static VOCAB_SUBBANDS is only the pre-load fallback.
  function vocabCefrSpans(tag) {
    const out = [];
    const byId = (typeof bucketIndex !== "undefined" && bucketIndex && bucketIndex.byId) ? bucketIndex.byId : null;
    if (byId) {
      for (const id in byId) {
        const n = byId[id];
        const a = n && n.attributes;
        const tags = (n && n.cefr_subbands) || (a && a.cefr_subbands);
        if (!a || a.band_lo == null || !Array.isArray(tags)) continue;
        if (tags.some(t => t === tag || t.split("-")[0] === tag)) {
          out.push({ start: a.band_lo, end: a.band_hi });
        }
      }
    }
    if (!out.length) {
      for (const s of VOCAB_SUBBANDS) {
        if (s.id === tag || s.id.split("-")[0] === tag) out.push({ start: s.start, end: s.end });
      }
    }
    return mergeRankRanges(out);
  }
  // Parent themes select their whole subtree (Ruling 1's category axis).
  function themesList() {
    const tx = LL.themesTaxonomy;
    if (!tx) return [];
    if (Array.isArray(tx)) return tx;
    if (Array.isArray(tx.themes)) return tx.themes;
    return Object.values(tx).filter(t => t && t.id);
  }
  let _themeChildren = null;
  function themeChildrenMap() {
    if (_themeChildren) return _themeChildren;
    const m = new Map();
    for (const t of themesList()) {
      if (t && t.parent_id) {
        if (!m.has(t.parent_id)) m.set(t.parent_id, []);
        m.get(t.parent_id).push(t.id);
      }
    }
    _themeChildren = m;
    return m;
  }
  function themeMatchesSelected(entryThemes, selected) {
    if (entryThemes.includes(selected)) return true;
    const kids = themeChildrenMap().get(selected);
    if (!kids) return false;
    const stack = kids.slice();
    while (stack.length) {
      const id = stack.pop();
      if (entryThemes.includes(id)) return true;
      const more = themeChildrenMap().get(id);
      if (more) for (const x of more) stack.push(x);
    }
    return false;
  }
  let vocabExpandedThemes = new Set();
  let vocabExpandedGenders = new Set();
  let vocabInputRef = null;

  // Universe of entries currently "in scope" — only the cumulative caps apply
  // (top-N and sub-band). Used by the axes so they only show in-scope cells.
  function vocabEntriesInScope() {
    const sub = vocabFilter.subBand ? vocabSubbandRange(vocabFilter.subBand) : null;
    return vocabEntries.filter(v => {
      const t = v.translation_en;
      if (!t || !String(t).trim()) return false;
      // [skip] convention from the vocab chat: tokenisation artefacts, foreign
      // words, wrong-POS entries are flagged for the marker to ignore.
      if (String(t).trim() === "[skip]") return false;
      if (vocabFilter.topN && typeof v.rank === "number" && v.rank > vocabFilter.topN) return false;
      if (sub && typeof v.rank === "number") {
        if (v.rank < sub.start || v.rank > sub.end) return false;
      }
      // Entry-builder frequency selection: a list of rank ranges, OR'd.
      // Scope-level like topN/subBand, so the axes reflect the session.
      if (Array.isArray(vocabFilter.rankRanges) && vocabFilter.rankRanges.length && typeof v.rank === "number") {
        if (!vocabFilter.rankRanges.some(r => v.rank >= r.start && v.rank <= r.end)) return false;
      }
      return true;
    });
  }

  // The deck-ready set: in-scope entries with the remaining filters applied.
  function filteredVocabEntries() {
    return vocabEntriesInScope().filter(v => {
      if (vocabFilter.band && v.band !== vocabFilter.band) return false;
      if (vocabFilter.rankRange && typeof v.rank === "number") {
        if (v.rank < vocabFilter.rankRange.start || v.rank > vocabFilter.rankRange.end) return false;
      }
      if (vocabFilter.theme) {
        if (!Array.isArray(v.themes) || !themeMatchesSelected(v.themes, vocabFilter.theme)) return false;
      }
      if (Array.isArray(vocabFilter.themes) && vocabFilter.themes.length) {
        if (!Array.isArray(v.themes) || !vocabFilter.themes.some(id => themeMatchesSelected(v.themes, id))) return false;
      }
      if (vocabFilter.genderDrill && v.pos !== "noun") return false;
      if (vocabFilter.genderClass) {
        if (v.pos !== "noun") return false;
        const cls = v.noun_class || (v.gender === "m" ? "unspecified_m" : v.gender === "f" ? "unspecified_f" : "unspecified");
        if (cls !== vocabFilter.genderClass) return false;
      }
      return true;
    });
  }

  function ensureVocabDeck() {
    if (!vocabDeck.length || vocabIndex >= vocabDeck.length) {
      vocabDeck = weightedVocabShuffle(filteredVocabEntries());
      vocabDeckDirs = (vocabFilter.direction === "mix")
        ? vocabDeck.map(() => Math.random() < 0.5 ? "it_en" : "en_it")
        : [];
      vocabIndex = 0;
    }
  }

  // Score-weighted, without-replacement shuffle. Weight = 1.1 - score, where
  // score is the lemma's current recency-weighted correctness in the active
  // direction. Untouched lemmas score 0 and get max weight 1.1; fully known
  // lemmas (score 1.0) get min weight 0.1, an 11x ratio. The user explicitly
  // chose this formula.
  function weightedVocabShuffle(entries) {
    const pool = entries.slice();
    if (pool.length <= 1) return pool;
    const activeDir = (vocabFilter && vocabFilter.direction === "it_en") ? "passive" : "active";
    const weights = pool.map(e => {
      // Per-entry weights so multi-entry lemmas don't share a single score.
      // A miss on presto.interjection should only demote that entry's weight,
      // not also demote presto.adverb and presto.adjective.
      const events = eventsForEntry(e, { direction: activeDir, aspect: "translation" });
      const wc = recencyWeightedCorrectness(events);
      const score = wc.hasEvents ? wc.correctness : 0;
      return Math.max(0.05, 1.1 - score);
    });
    const out = [];
    while (pool.length > 0) {
      let total = 0;
      for (const w of weights) total += w;
      let r = Math.random() * total;
      let idx = 0;
      for (; idx < weights.length; idx++) {
        r -= weights[idx];
        if (r <= 0) break;
      }
      if (idx >= weights.length) idx = weights.length - 1;
      out.push(pool[idx]);
      pool.splice(idx, 1);
      weights.splice(idx, 1);
    }
    return out;
  }

  function bandFriendly(bandId) {
    if (!bandId) return "";
    return String(bandId).replace(/.*freq_/, "").replace(/_/g, "-");
  }

  function renderVocabFilterBar() {
    const host = document.getElementById("vocab-filter-bar");
    if (!host) return;
    host.innerHTML = "";
    if (!vocabEntries.length) return;

    // Direction toggle
    const dirLabel = document.createElement("label");
    dirLabel.textContent = "Direction:";
    host.appendChild(dirLabel);
    const dirSel = document.createElement("select");
    [["it_en", "Italian → English"], ["en_it", "English → Italian"], ["mix", "Mixed"]].forEach(([v, t]) => {
      const o = document.createElement("option");
      o.value = v; o.textContent = t;
      if (vocabFilter.direction === v) o.selected = true;
      dirSel.appendChild(o);
    });
    dirSel.addEventListener("change", () => {
      vocabFilter.direction = dirSel.value;
      // Reshuffle so the next card isn't the same lemma in reverse
      // (otherwise the learner can peek at the answer by toggling direction).
      vocabDeck = []; vocabIndex = 0;
      renderVocab();
    });
    host.appendChild(dirSel);

    // Top-N cutoff: restricts the entire universe (axes + deck).
    const topLbl = document.createElement("label");
    topLbl.className = "filter-bar-topn-label";
    topLbl.textContent = "Restrict to:";
    host.appendChild(topLbl);
    const topSel = document.createElement("select");
    topSel.className = "filter-bar-topn";
    // Cumulative CEFR cuts at the END of each sub-band, derived from
    // VOCAB_SUBBANDS so the two stay in sync. Each option means "all
    // lemmas with rank <= this sub-band's end", which lets the learner
    // dial scope sub-band by sub-band rather than level by level.
    // The Sub-band dropdown (below) handles "only this one sub-band".
    const topOptions = [[0, "all (~14k curated)"]];
    VOCAB_SUBBANDS.forEach(s => {
      topOptions.push([s.end, "≤ " + s.id + " (1-" + s.end + ")"]);
    });
    topOptions.forEach(([val, label]) => {
      const o = document.createElement("option");
      o.value = String(val);
      o.textContent = label;
      if (vocabFilter.topN === val) o.selected = true;
      topSel.appendChild(o);
    });
    topSel.addEventListener("change", () => {
      vocabFilter.topN = parseInt(topSel.value, 10) || 0;
      invalidateVocabCaches();
      vocabDeck = []; vocabIndex = 0;
      renderVocab();
    });
    host.appendChild(topSel);

    // Sub-band dropdown — pick a specific CEFR sub-band (overlapping ranges
    // per the vocab chat's mapping). Coexists with the cumulative top-N.
    const subLbl = document.createElement("label");
    subLbl.className = "filter-bar-topn-label";
    subLbl.textContent = "Sub-band:";
    host.appendChild(subLbl);
    const subSel = document.createElement("select");
    subSel.className = "filter-bar-topn";
    const anyOpt = document.createElement("option");
    anyOpt.value = ""; anyOpt.textContent = "any";
    if (!vocabFilter.subBand) anyOpt.selected = true;
    subSel.appendChild(anyOpt);
    VOCAB_SUBBANDS.forEach(s => {
      const o = document.createElement("option");
      o.value = s.id;
      o.textContent = s.id + " (" + s.start + "-" + s.end + ")";
      if (vocabFilter.subBand === s.id) o.selected = true;
      subSel.appendChild(o);
    });
    subSel.addEventListener("change", () => {
      vocabFilter.subBand = subSel.value;
      invalidateVocabCaches();
      vocabDeck = []; vocabIndex = 0;
      renderVocab();
    });
    host.appendChild(subSel);

    // Count
    const filtered = filteredVocabEntries();
    const count = document.createElement("span");
    count.className = "filter-count";
    count.textContent = `${filtered.length} of ${vocabEntries.length}`;
    host.appendChild(count);
  }

  function renderVocab() {
    renderVocabFilterBar();
    const host = document.getElementById("vocab-host");
    if (!host) return;
    host.innerHTML = "";
    if (!vocabEntries.length) {
      const msg = document.createElement("p");
      msg.className = "muted";
      msg.style.cssText = "padding:18px;font-style:italic";
      msg.textContent = "No vocab entries loaded. Serve the project over http (e.g. python -m http.server) and reload to fetch the frequency list.";
      host.appendChild(msg);
      return;
    }
    ensureVocabDeck();
    if (!vocabDeck.length) {
      const msg = document.createElement("p");
      msg.className = "muted";
      msg.style.cssText = "padding:18px;font-style:italic";
      msg.textContent = "No entries match the current filter. Loosen the band filter above.";
      host.appendChild(msg);
      return;
    }
    const entry = vocabDeck[vocabIndex];
    const effDir = (vocabFilter.direction === "mix")
      ? (vocabDeckDirs[vocabIndex] || "it_en")
      : vocabFilter.direction;
    const isItEn = effDir === "it_en";

    const card = document.createElement("div");
    card.className = "qcard";

    const meta = document.createElement("div");
    meta.className = "meta faint";
    const friendly = bandFriendly(entry.band);
    const bits = [];
    if (entry.pos) bits.push(entry.pos);
    if (friendly) bits.push("band " + friendly);
    if (entry.rank) bits.push("rank " + entry.rank);
    meta.textContent = bits.join(" · ");
    card.appendChild(meta);

    // If this lemma has multiple curated entries WITH DIFFERENT POS values
    // (homographs across POS), disambiguate the prompt by stating the POS.
    // Saves the learner from having to guess which sense of "fisico" we mean.
    //
    // Same-POS-different-gender splits (fine.f vs fine.m) get article-prepend
    // in IT->EN: "What does la fine mean?" not "What does fine mean?".
    const sameLemmaSiblings = vocabEntries.filter(v =>
      v && v.lemma === entry.lemma && v.translation_en && String(v.translation_en).trim()
    );
    const distinctPosCount = new Set(
      sameLemmaSiblings.map(v => v.pos || "")
    ).size;
    const showPos = distinctPosCount > 1 && entry.pos;
    // Article-prepend triggers when the lemma is part of a gender-split set
    // (same lemma + same POS but multiple genders), the direction is IT->EN,
    // and this entry has a definable gender. The article hard-disambiguates.
    const isGenderSplitHere = (typeof LL.isGenderSplit === "function") &&
      LL.isGenderSplit(entry.lemma, entry.pos);
    const showArticle = isItEn && isGenderSplitHere && entry.pos === "noun" && entry.gender;
    let articleForDisplay = "";
    let displayedLemma = entry.lemma;
    if (showArticle) {
      const arts = expectedArticlesFor(entry.lemma, entry.gender);
      if (arts && arts.definite && arts.definite[0]) {
        articleForDisplay = arts.definite[0];
        // Article ending in "'" concatenates with no space (l'amico); otherwise space.
        displayedLemma = articleForDisplay.endsWith("'")
          ? articleForDisplay + entry.lemma
          : articleForDisplay + " " + entry.lemma;
      }
    }
    // Regime for marker semantics ruling 2026-05-28:
    //   hard = POS-in-parens (different meaning across sister entries) OR
    //          article-prepend on gender-split noun in IT->EN.
    //   soft = parenthetical clarifier on the gloss (same meaning, different form);
    //          detected by presence of "(...)" in translation_en (EN->IT direction).
    //   none = ambiguous prompt with no clarifier.
    let promptRegime = "none";
    if (showPos || showArticle) {
      promptRegime = "hard";
    } else if (!isItEn && entry.translation_en && /\(/.test(String(entry.translation_en))) {
      promptRegime = "soft";
    }
    // "as a noun" / "as an adjective" — pick the article by initial vowel.
    const posPhrase = showPos
      ? "as " + (/^[aeiou]/i.test(entry.pos) ? "an" : "a") + " " + entry.pos
      : "";

    const prompt = document.createElement("div");
    prompt.className = "prompt";
    if (isItEn) {
      const strong = document.createElement("strong");
      strong.textContent = displayedLemma;
      prompt.appendChild(document.createTextNode("What does "));
      prompt.appendChild(strong);
      if (showPos) {
        prompt.appendChild(document.createTextNode(" mean ("));
        const posEm = document.createElement("em");
        posEm.textContent = posPhrase;
        prompt.appendChild(posEm);
        prompt.appendChild(document.createTextNode(")?"));
      } else {
        prompt.appendChild(document.createTextNode(" mean?"));
      }
    } else {
      const strong = document.createElement("strong");
      strong.textContent = entry.translation_en;
      prompt.appendChild(document.createTextNode("What's the Italian for "));
      prompt.appendChild(strong);
      if (showPos) {
        prompt.appendChild(document.createTextNode(" ("));
        const posEm = document.createElement("em");
        posEm.textContent = posPhrase;
        prompt.appendChild(posEm);
        prompt.appendChild(document.createTextNode(")?"));
      } else {
        prompt.appendChild(document.createTextNode("?"));
      }
    }
    card.appendChild(prompt);

    const input = document.createElement("input");
    input.type = "text";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.placeholder = "Type your answer; press Enter to mark.";
    card.appendChild(input);
    vocabInputRef = input;

    // Accent bar only when typing Italian (EN→IT direction). For IT→EN the
    // answer is English and apostrophe-rewrite would corrupt "I've" style words.
    if (!isItEn) {
      card.appendChild(buildAccentBar(input, { rewriteApostrophes: true }));
    }

    const actions = document.createElement("div");
    actions.className = "actions";
    const markBtn = document.createElement("button");
    markBtn.textContent = "Mark";
    const nextBtn = document.createElement("button");
    nextBtn.className = "secondary";
    nextBtn.textContent = "Skip";
    nextBtn.title = "Skip this word without marking it";
    actions.appendChild(markBtn);
    actions.appendChild(nextBtn);
    const helpHint = document.createElement("span");
    helpHint.className = "kbd-hint";
    helpHint.textContent = "Enter to mark · Enter again to advance";
    actions.appendChild(helpHint);
    card.appendChild(actions);

    const resultHost = document.createElement("div");
    card.appendChild(resultHost);

    const doMark = () => {
      const raw = input.value;
      const result = markVocab(entry, raw, isItEn, promptRegime);
      const syntheticItem = { id: "vocab_" + (entry.rank || entry.lemma) + "_" + (isItEn ? "ie" : "ei"), prompt: prompt.textContent };
      const attempt = LL.store.recordAttempt("vocab", syntheticItem, raw, result);
      recentlyChangedBuckets = new Set(attempt.events.map(e => e.bucket));
      resultHost.innerHTML = "";
      resultHost.appendChild(renderResult(result));
      renderLiveStats();
      // Refresh the right-hand axes (frequency heatmap, gender, themes) so
      // the cells containing this lemma re-colour immediately. Then flash
      // every cell the lemma belongs to across all three axes.
      renderVocabAxes();
      flashAxisCellsFor(entry, result.overall && result.overall.marks_awarded >= result.overall.marks_possible);
      nextBtn.textContent = "Next";
      nextBtn.title = "Advance to the next word";
      nextBtn.focus({ preventScroll: true });
    };
    const doNext = () => {
      vocabIndex++;
      if (vocabIndex >= vocabDeck.length) {
        vocabDeck = weightedVocabShuffle(filteredVocabEntries());
        vocabIndex = 0;
      }
      renderVocab();
    };

    markBtn.addEventListener("click", doMark);
    nextBtn.addEventListener("click", doNext);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        doMark();
      }
    });
    nextBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        doNext();
      }
    });

    host.appendChild(card);
    setTimeout(() => {
      ensureCardVisible(card);
      input.focus({ preventScroll: true });
    }, 0);
    renderVocabAxes();
  }

  function focusVocabInput() { if (vocabInputRef) vocabInputRef.focus(); }

  // ============================================================================
  // Vocab right-hand panel: multi-axis heatmap.
  //
  // Three axes ship over time:
  //   - frequency (top, focused window of 10 bands forming a square; flanking
  //                bands at narrow widths)
  //   - gender   (middle, toggleable, nouns only)
  //   - themes   (right, hierarchical with multi-membership)
  //
  // This pass: just the frequency axis. The gender + themes hosts are
  // scaffolded as empty placeholders so they have a visible home and the
  // layout already accommodates them.
  // ============================================================================

  // Default focus: bands 1-10 = ranks 1-1000. Tracked as the index (0-based)
  // of the LEFTMOST focused band in the sorted band list.
  let vocabFreqFocusStart = 0;
  const VOCAB_FREQ_WINDOW = 10;
  // Height of the focused dot-grid in px; flanking blocks match this height.
  // 11 rows of boxes x 3 dots x 9px + 10 row-gaps x 3px + 2 x 4px padding
  // = 297 + 30 + 8 = 335.
  const VOCAB_FOCUS_HEIGHT_PX = 335;

  // Build a band -> [lemma] index lazily from vocabEntries.
  let _bandLemmasCache = null;
  let _bandLemmasCacheLen = -1;
  function bandLemmasIndex() {
    const scoped = vocabEntriesInScope();
    if (_bandLemmasCache && _bandLemmasCacheLen === scoped.length) return _bandLemmasCache;
    const idx = Object.create(null);
    for (const v of scoped) {
      if (!v.band) continue;
      (idx[v.band] = idx[v.band] || []).push(v.lemma);
    }
    _bandLemmasCache = idx;
    _bandLemmasCacheLen = scoped.length;
    return idx;
  }

  // Generic events-by-lemma collector. `lemmas` is a list or Set of lemma
  // strings. `opts.direction` filters to "active" / "passive" / "any" (default
  // any). Used by all three axes - band, gender, themes - so they all share
  // the same event-shape contract.
  function eventsForLemmas(lemmas, opts) {
    opts = opts || {};
    const directionFilter = opts.direction || "any";
    // aspect: "translation" (default), "gender", or "any"
    const aspectFilter = opts.aspect || "translation";
    const lemmaSet = (lemmas instanceof Set) ? lemmas : new Set(lemmas);
    if (lemmaSet.size === 0) return [];
    const out = [];
    // Uses LL.parseVocabBucketId so the parser handles both shapes:
    //   new: vocabulary.it.<lemma>.<pos>[.<gender>].<aspect>[.<dir>]
    //   legacy: vocabulary.it.<lemma>.<aspect>[.<dir>]  (until migrated)
    const parse = LL.parseVocabBucketId || function () { return null; };
    for (const att of LL.state.attempts) {
      for (const ev of att.events) {
        const parsed = parse(ev.bucket);
        if (!parsed) continue;
        if (!lemmaSet.has(parsed.lemma)) continue;
        if (aspectFilter !== "any" && parsed.aspect !== aspectFilter) continue;
        if (directionFilter === "active"  && parsed.direction !== "active")  continue;
        if (directionFilter === "passive" && parsed.direction !== "passive") continue;
        out.push({ ev, timestamp: att.timestamp });
      }
    }
    out.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    return out;
  }

  // Per-entry events: filters by (lemma, pos, gender, number) so multi-entry
  // lemmas (e.g. presto.adverb / presto.interjection / presto.adjective) keep
  // their events distinct in the heatmap and deck-weight scoring. Without this,
  // a miss on presto.interjection would light up adjacent ranks for the other
  // two presto entries because eventsForLemmas filters on lemma alone.
  function eventsForEntry(entry, opts) {
    opts = opts || {};
    const directionFilter = opts.direction || "any";
    const aspectFilter = opts.aspect || "translation";
    if (!entry || !entry.lemma) return [];
    const targetPos = entry.pos || null;
    const targetGender = entry.gender || null;
    const targetNumber = entry.number || null;  // Vocab v4 ruling (le.f.sg vs le.f.pl)
    const out = [];
    const parse = LL.parseVocabBucketId || function () { return null; };
    for (const att of LL.state.attempts) {
      for (const ev of att.events) {
        const parsed = parse(ev.bucket);
        if (!parsed) continue;
        if (parsed.lemma !== entry.lemma) continue;
        // POS must match when both sides carry it. Legacy events with no POS
        // were dropped by the 2026-05-28 migration; if any still slip through
        // (parsed.pos null), treat as non-match for safety.
        if (targetPos && parsed.pos !== targetPos) continue;
        // Gender qualifier present in bucket only on gender-split lemmas, so
        // skip the gender check when either side is absent.
        if (targetGender && parsed.gender && parsed.gender !== targetGender) continue;
        // Number qualifier present in bucket only when needed for disambiguation;
        // skip the check when either side is absent (forward-compat for v4 ruling).
        if (targetNumber && parsed.number && parsed.number !== targetNumber) continue;
        if (aspectFilter !== "any" && parsed.aspect !== aspectFilter) continue;
        if (directionFilter === "active"  && parsed.direction !== "active")  continue;
        if (directionFilter === "passive" && parsed.direction !== "passive") continue;
        out.push({ ev, timestamp: att.timestamp });
      }
    }
    out.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    return out;
  }

  // Convenience: frequency-band events. Active + passive both count toward
  // band correctness (frequency is bidirectional).
  function eventsForBand(bandId) {
    return eventsForLemmas(bandLemmasIndex()[bandId] || []);
  }

  // Pre-sorted list of all band ids known from the loaded buckets and the
  // curated entries. Sorted by band_lo ascending. Each band carries the lo/hi
  // range used for labels.
  let _bandListCache = null;
  function bandList() {
    if (_bandListCache) return _bandListCache;
    const map = new Map();
    // From bucket tree (authoritative if present).
    for (const id in bucketIndex.byId) {
      if (!id.startsWith("vocabulary.it.freq_")) continue;
      const node = bucketIndex.byId[id];
      const a = node.attributes || {};
      const lo = a.band_lo, hi = a.band_hi;
      if (typeof lo === "number" && typeof hi === "number") {
        map.set(id, { id, lo, hi, label: node.label || `${lo}-${hi}` });
      }
    }
    // Fall back to bands referenced from vocabEntries we haven't seen yet.
    for (const v of vocabEntries) {
      if (!v.band || map.has(v.band)) continue;
      const m = /freq_(\d+)_(\d+)$/.exec(v.band);
      if (!m) continue;
      const lo = parseInt(m[1], 10), hi = parseInt(m[2], 10);
      map.set(v.band, { id: v.band, lo, hi, label: `${lo}-${hi}` });
    }
    _bandListCache = Array.from(map.values()).sort((a, b) => a.lo - b.lo);
    return _bandListCache;
  }
  function invalidateVocabCaches() {
    _themeChildren = null;
    _bandLemmasCache = null;
    _bandLemmasCacheLen = -1;
    _bandListCache = null;
    _themeLemmasCache = null;
    _genderClassLemmasCache = null;
  }

  // theme.id -> [lemma]
  let _themeLemmasCache = null;
  function themeLemmasIndex() {
    // Note: not memoised because topN may change between calls.
    const idx = Object.create(null);
    for (const v of vocabEntriesInScope()) {
      const themes = v.themes;
      if (!Array.isArray(themes)) continue;
      for (const t of themes) {
        (idx[t] = idx[t] || []).push(v.lemma);
      }
    }
    return idx;
  }

  // noun_class -> [lemma] (nouns only)
  let _genderClassLemmasCache = null;
  function genderClassLemmasIndex() {
    const idx = Object.create(null);
    for (const v of vocabEntriesInScope()) {
      if (v.pos !== "noun") continue;
      const cls = v.noun_class || (v.gender === "m" ? "unspecified_m" : v.gender === "f" ? "unspecified_f" : "unspecified");
      (idx[cls] = idx[cls] || []).push(v.lemma);
    }
    return idx;
  }

  const GENDER_CLASS_LABELS = {
    regular_o_masc:            "regular -o (m)",
    regular_a_fem:             "regular -a (f)",
    e_ambiguous:               "ends -e (gender varies)",
    greek_ma_masc:             "greek -ma (m)",
    ista_common_gender:        "-ista (common gender)",
    irregular_gender:          "irregular gender",
    gender_shift_plural:       "gender shifts in plural",
    invariable_accented_final: "invariable (final accented)",
    invariable_loanword:       "invariable loanword",
    unspecified_m:             "uncategorised (m)",
    unspecified_f:             "uncategorised (f)",
    unspecified:               "uncategorised"
  };

  function themeKindLabel(kind) {
    const tax = LL.themesTaxonomy;
    if (tax && tax.kinds && tax.kinds[kind]) {
      return tax.kinds[kind].split(":")[0].split(".")[0];
    }
    const labels = {
      semantic_concrete:  "Concrete domains",
      semantic_abstract:  "Abstract domains",
      functional:         "Function words & grammar",
      verb_subtype:       "Verb subtypes",
      adjective_subtype:  "Adjective subtypes",
      adverb_subtype:     "Adverb subtypes"
    };
    return labels[kind] || kind;
  }

  // Threshold above which a cell averages rather than showing per-lemma dots.
  // Per user: "over a hundred per category, then by all means we can take
  // average values".
  const VOCAB_CELL_DOT_THRESHOLD = 100;

  function buildCellGroups(groups, axisKind) {
    const wrap = document.createElement("div");
    wrap.className = "vocab-cellgrid-host";
    for (const g of groups) {
      const section = document.createElement("div");
      section.className = "vocab-cellgrid-section";
      if (g.title) {
        const h = document.createElement("div");
        h.className = "vocab-cellgrid-title";
        h.textContent = g.title;
        section.appendChild(h);
      }
      const grid = document.createElement("div");
      grid.className = "vocab-cellgrid";
      for (const c of g.cells) {
        const cell = document.createElement("div");
        cell.className = "vocab-cell";
        cell.dataset.axis = axisKind;
        cell.dataset.key = c.key;

        const lemmas = (c.lemmas instanceof Set) ? Array.from(c.lemmas) : c.lemmas;
        const lemmaCount = lemmas.length;
        const dirFilter = c.directionFilter || "any";
        const aspect = c.aspect || "translation";

        cell.style.cursor = "pointer";
        // Mark the cell as active if it currently matches the filter, so CSS
        // can highlight it.
        const isActiveThemes = axisKind === "themes" && vocabFilter.theme === c.key;
        const isActiveGender = axisKind === "gender" && vocabFilter.genderClass === c.key;
        if (isActiveThemes || isActiveGender) cell.classList.add("filter-active");

        cell.addEventListener("click", (ev) => {
          if (ev.target && ev.target.classList && ev.target.classList.contains("vocab-lemma-dot")) return;
          // Expand-on-first-click for cells in averaged mode (both themes
          // and gender) when over the threshold.
          if (lemmaCount > VOCAB_CELL_DOT_THRESHOLD) {
            const expandSet = axisKind === "themes" ? vocabExpandedThemes : vocabExpandedGenders;
            if (!expandSet.has(c.key)) {
              expandSet.add(c.key);
              renderVocabAxes();
              return;
            }
          }
          // Toggle: clicking the active filter clears it. Additive: setting
          // theme doesn't clear gender or rank filters.
          if (axisKind === "themes") {
            vocabFilter.theme = vocabFilter.theme === c.key ? "" : c.key;
          } else if (axisKind === "gender") {
            vocabFilter.genderClass = vocabFilter.genderClass === c.key ? "" : c.key;
          }
          vocabDeck = []; vocabIndex = 0;
          renderVocab();
        });

        const head = document.createElement("div");
        head.className = "vocab-cell-head";
        const lbl = document.createElement("div");
        lbl.className = "vocab-cell-label";
        lbl.textContent = c.label;
        head.appendChild(lbl);
        const meta = document.createElement("div");
        meta.className = "vocab-cell-meta";
        head.appendChild(meta);
        cell.appendChild(head);

        const expandSet = axisKind === "themes" ? vocabExpandedThemes : (axisKind === "gender" ? vocabExpandedGenders : null);
        const forceDots = expandSet && expandSet.has(c.key);
        if (lemmaCount > VOCAB_CELL_DOT_THRESHOLD && !forceDots) {
          const m = averageCorrectnessAcrossLemmas(lemmas, dirFilter, aspect);
          cell.classList.add("avg-mode");
          cell.style.background = rwgColour(m.correctness, true);
          const pct = Math.round(m.correctness * 100) + "%";
          meta.textContent = lemmaCount + " words - " + m.touched + " touched - avg " + pct;
          cell.title = c.label + " (averaged) - click to expand";
        } else {
          cell.classList.add("dot-mode");
          const dots = document.createElement("div");
          dots.className = "vocab-cell-dots";
          let attempted = 0;
          for (const lemma of lemmas) {
            const events = eventsForLemmas([lemma], { direction: dirFilter, aspect: aspect });
            const wc = recencyWeightedCorrectness(events);
            const dot = document.createElement("span");
            dot.className = "vocab-lemma-dot";
            dot.style.background = rwgColour(wc.correctness, wc.hasEvents);
            if (!wc.hasEvents) dot.classList.add("untouched");
            const pct = wc.hasEvents ? Math.round(wc.correctness * 100) + "%" : "untouched";
            dot.title = lemma + " - " + pct;
            dot.dataset.lemma = lemma;
            if (wc.hasEvents) attempted++;
            dots.appendChild(dot);
          }
          cell.appendChild(dots);
          meta.textContent = lemmaCount + " words - " + attempted + " touched";
          cell.title = c.label;
        }
        grid.appendChild(cell);
      }
      section.appendChild(grid);
      wrap.appendChild(section);
    }
    return wrap;
  }

  // Fire the success/feedback animation on the axes cells that correspond to
  // the entry just answered. Targeting is by:
  //   - freq-dot:   matched by data-rank (UNIQUE per cell). The previous
  //                 lemma-only selector fired on every dot sharing a lemma,
  //                 which lit up adjacent ranks for multi-entry lemmas like
  //                 presto.adverb @ 429 vs presto.interjection @ 430.
  //   - gender / theme cells (and their inner per-lemma dots): keyed by axis
  //                 attribute. One cell per group; safe to match all that
  //                 contain the lemma.
  //   - flanking cells: matched by rank range membership.
  //
  // `isHit` (boolean) drives the visual: hits get the richer success pulse
  // (.flash-hit), other outcomes get the neutral .flash. See inter_chat/
  // Architecture_Housing_vocab_success_animation.md.
  function flashAxisCellsFor(entry, isHit) {
    if (!entry) return;
    const host = document.getElementById("vocab-axes-host");
    if (!host) return;
    const flashClass = isHit ? "flash-hit" : "flash";
    const FLASH_MS = isHit ? 900 : 800;

    const targets = [];

    // Focused-grid dot: rank-specific, exactly one match.
    if (typeof entry.rank === "number") {
      const dot = host.querySelector('.freq-dot[data-rank="' + entry.rank + '"]');
      if (dot) targets.push(dot);
    }
    // Gender axis cell (nouns only).
    if (entry.pos === "noun") {
      const cls = entry.noun_class || (entry.gender === "m" ? "unspecified_m" : entry.gender === "f" ? "unspecified_f" : "unspecified");
      const gCell = host.querySelector('.vocab-cell[data-axis="gender"][data-key="' + cssEscape(cls) + '"]');
      if (gCell) targets.push(gCell);
    }
    // Theme axis cells.
    if (Array.isArray(entry.themes)) {
      for (const t of entry.themes) {
        const tCell = host.querySelector('.vocab-cell[data-axis="themes"][data-key="' + cssEscape(t) + '"]');
        if (tCell) targets.push(tCell);
      }
    }
    // Inner per-lemma dots inside theme/gender cells (these are legitimately
    // lemma-keyed since each cell has at most one dot per lemma).
    if (entry.lemma) {
      const lemmaDots = host.querySelectorAll('.vocab-lemma-dot[data-lemma="' + cssEscape(entry.lemma) + '"]');
      lemmaDots.forEach(el => targets.push(el));
    }
    // Flanking-block cells whose rank range contains this entry's rank.
    if (typeof entry.rank === "number") {
      const flanks = host.querySelectorAll(".freq-flanking .freq-flank-cell");
      flanks.forEach(cell => {
        const s = parseInt(cell.dataset.rangeStart || "0", 10);
        const e = parseInt(cell.dataset.rangeEnd || "0", 10);
        if (entry.rank >= s && entry.rank <= e) targets.push(cell);
      });
    }

    for (const el of targets) {
      // Remove any existing flash class first so a quick succession of marks
      // re-triggers cleanly (re-adding the same class doesn't restart the
      // animation in CSS).
      el.classList.remove("flash", "flash-hit");
      // Force a reflow so the removal takes effect before re-adding.
      void el.offsetWidth;
      el.classList.add(flashClass);
      setTimeout(() => el.classList.remove(flashClass), FLASH_MS);
    }
  }
  function cssEscape(s) {
    return String(s).replace(/(["\\\]])/g, "\\$1");
  }

  function renderVocabAxes() {
    const host = document.getElementById("vocab-axes-host");
    if (!host) return;
    host.innerHTML = "";

    if (!vocabEntries.length) {
      const empty = document.createElement("div");
      empty.className = "muted";
      empty.style.cssText = "padding:18px;font-style:italic;font-size:13px";
      empty.textContent = "(heatmap appears once vocab data loads)";
      host.appendChild(empty);
      return;
    }

    // -------- header: number inputs + palette pickers --------
    const header = document.createElement("div");
    header.className = "vocab-axes-header";

    function buildNumberInput(labelText, getter, setter, min, max, step) {
      const wrap = document.createElement("label");
      wrap.className = "vocab-numinput";
      const lbl = document.createElement("span");
      lbl.className = "vocab-input-label";
      lbl.textContent = labelText;
      const num = document.createElement("input");
      num.type = "number";
      num.min = String(min); num.max = String(max); num.step = String(step);
      num.value = String(getter());
      num.addEventListener("input", () => {
        const v = parseFloat(num.value);
        if (!isNaN(v)) { setter(v); renderVocabAxes(); }
      });
      wrap.appendChild(lbl);
      wrap.appendChild(num);
      return wrap;
    }
    function buildColourInput(labelText, getter, setter) {
      const wrap = document.createElement("label");
      wrap.className = "vocab-colinput";
      const lbl = document.createElement("span");
      lbl.className = "vocab-input-label";
      lbl.textContent = labelText;
      const inp = document.createElement("input");
      inp.type = "color";
      inp.value = rgbToHex(getter());
      inp.addEventListener("input", () => {
        const rgb = hexToRgb(inp.value);
        if (rgb) { setter(rgb); renderVocabAxes(); }
      });
      wrap.appendChild(lbl);
      wrap.appendChild(inp);
      return wrap;
    }

    header.appendChild(buildNumberInput(
      "Yellow stop", () => vocabYellowStop, (v) => { vocabYellowStop = v; }, 0, 1, 0.01
    ));
    header.appendChild(buildNumberInput(
      "Untouched baseline", () => vocabUnattemptedBaseline, (v) => { vocabUnattemptedBaseline = v; }, 0, 1, 0.01
    ));
    header.appendChild(buildColourInput("0%",   () => RWG_RED,        (v) => { RWG_RED = v; }));
    header.appendChild(buildColourInput("yel",  () => RWG_YELLOW,     (v) => { RWG_YELLOW = v; }));
    header.appendChild(buildColourInput("pgr",  () => RWG_PALE_GREEN, (v) => { RWG_PALE_GREEN = v; }));
    header.appendChild(buildColourInput("100%", () => RWG_GREEN,      (v) => { RWG_GREEN = v; }));

    const report = document.createElement("button");
    report.type = "button";
    report.className = "vocab-palette-report";
    report.textContent = "report palette";
    report.title = "Print the current palette + stops to the console and copy as JSON.";
    report.addEventListener("click", () => {
      const txt = paletteAsJson();
      console.log("LINGUICS PALETTE\n" + txt);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(() => {
          report.textContent = "copied";
          setTimeout(() => { report.textContent = "report palette"; }, 1500);
        });
      } else {
        report.textContent = "see console";
        setTimeout(() => { report.textContent = "report palette"; }, 1500);
      }
    });
    header.appendChild(report);

    if (vocabFilter.band || vocabFilter.theme || vocabFilter.genderClass || vocabFilter.rankRange) {
      const filtRow = document.createElement("div");
      filtRow.className = "vocab-filter-status";
      const lbl = document.createElement("span");
      lbl.className = "vocab-filter-status-label";
      let descr = "Filtered: ";
      if (vocabFilter.band) descr += "band " + bandFriendly(vocabFilter.band);
      if (vocabFilter.rankRange) descr += "ranks " + vocabFilter.rankRange.start + "-" + vocabFilter.rankRange.end;
      if (vocabFilter.theme) descr += "theme " + vocabFilter.theme;
      if (vocabFilter.genderClass) descr += "gender-class " + (GENDER_CLASS_LABELS[vocabFilter.genderClass] || vocabFilter.genderClass);
      lbl.textContent = descr;
      filtRow.appendChild(lbl);
      const back = document.createElement("button");
      back.type = "button";
      back.className = "vocab-back-all";
      back.textContent = "Back to all";
      back.addEventListener("click", () => {
        vocabFilter.band = "";
        vocabFilter.theme = "";
        vocabFilter.genderClass = "";
        vocabFilter.rankRange = null;
        vocabFilter.drillLevel = null;
        // topN is preserved - it's set via the dropdown, not via cells.
        vocabExpandedThemes.clear();
        vocabExpandedGenders.clear();
        vocabDeck = []; vocabIndex = 0;
        renderVocab();
      });
      filtRow.appendChild(back);
      header.appendChild(filtRow);
    }

    host.appendChild(header);

    // Direction-aware: the current vocab toggle drives which event variant
    // (.active vs .passive) populates the heatmaps. EN->IT shows production
    // signal; IT->EN shows recognition signal.
    const activeDir = (vocabFilter && vocabFilter.direction === "it_en") ? "passive" : "active";

    // -------- frequency axis --------
    const freqAxis = document.createElement("div");
    freqAxis.className = "vocab-axis vocab-axis-freq";

    const freqTitle = document.createElement("div");
    freqTitle.className = "vocab-axis-title";
    const ft = document.createElement("span");
    ft.className = "vocab-axis-name";
    if (typeof window.__vocabFocusRankStart === "undefined") window.__vocabFocusRankStart = 1;
    const focusStart = window.__vocabFocusRankStart;
    const focusEnd = focusStart + 989;
    const isTopThousand = focusStart === 1;
    ft.textContent = isTopThousand
      ? "Most frequently used Italian words"
      : ("Italian words by frequency, ranks " + focusStart + "-" + focusEnd);
    freqTitle.appendChild(ft);
    const focusInfo = document.createElement("span");
    focusInfo.className = "vocab-axis-focus";
    focusInfo.textContent = "(ranks " + focusStart + "-" + focusEnd + ")";
    freqTitle.appendChild(focusInfo);
    freqAxis.appendChild(freqTitle);

    // Build rank -> entry index from vocabEntries.
    const byRank = new Map();
    for (const v of vocabEntries) {
      if (typeof v.rank === "number" && v.lemma) {
        // Take the first entry per rank (homographs share ranks - we just
        // colour by the first one's events for now).
        if (!byRank.has(v.rank)) byRank.set(v.rank, v);
      }
    }

    // Determine total rank universe. Use max rank from buckets or entries.
    let maxRank = 0;
    for (const v of vocabEntries) if (typeof v.rank === "number" && v.rank > maxRank) maxRank = v.rank;
    // Round up to nearest 990 boundary for clean block layout.
    const RANKS_PER_BLOCK = 990;
    const totalBlocks = Math.max(1, Math.ceil(Math.max(maxRank, 8000) / RANKS_PER_BLOCK));

    // Which block contains the focus?
    const focusBlockIdx = Math.floor((focusStart - 1) / RANKS_PER_BLOCK);

    // Render each block alongside its tick label inside a column wrapper so
    // the labels naturally centre under their blocks.
    const heatRow = document.createElement("div");
    heatRow.className = "freq-heatmap-row";

    for (let bi = 0; bi < totalBlocks; bi++) {
      const blockStart = bi * RANKS_PER_BLOCK + 1;
      const blockEnd = blockStart + RANKS_PER_BLOCK - 1;
      const distance = bi === focusBlockIdx ? 0 : Math.abs(bi - focusBlockIdx);

      const col = document.createElement("div");
      col.className = "freq-block-col";

      let block;
      if (bi === focusBlockIdx) {
        block = renderFocusedDotGrid(blockStart, byRank, activeDir);
      } else {
        block = renderFlankingStripes(blockStart, blockEnd, byRank, distance, activeDir, VOCAB_FOCUS_HEIGHT_PX);
        // Block-level click: filter deck to this thousand-range AND refocus.
        block.addEventListener("click", (ev) => {
          if (ev.target && ev.target.classList.contains("freq-flank-cell")) return;
          window.__vocabFocusRankStart = blockStart;
          vocabFilter.rankRange = { start: blockStart, end: blockEnd };
          vocabFilter.drillLevel = "thousand";
          vocabDeck = []; vocabIndex = 0;
          renderVocab();
        });
        block.addEventListener("click", (ev) => {
          const t = ev.target;
          if (!t || !t.classList || !t.classList.contains("freq-flank-cell")) return;
          ev.stopPropagation();
          const s = parseInt(t.dataset.rangeStart || "0", 10);
          const e = parseInt(t.dataset.rangeEnd || "0", 10);
          window.__vocabFocusRankStart = blockStart;
          vocabFilter.rankRange = { start: s, end: e };
          vocabFilter.drillLevel = "ten";
          vocabDeck = []; vocabIndex = 0;
          renderVocab();
        });
      }
      col.appendChild(block);

      // Tick label - short form for distant blocks so they fit the narrow strips.
      const tick = document.createElement("div");
      tick.className = "freq-tick " + (bi === focusBlockIdx ? "focused" : "flanking");
      const thousand = bi + 1;
      tick.textContent = (distance > 2) ? (thousand + "k") : ("~" + (thousand * 1000));
      col.appendChild(tick);

      heatRow.appendChild(col);
    }
    freqAxis.appendChild(heatRow);

    // Apply drill-level highlighting to the focused block.
    if (vocabFilter.drillLevel && vocabFilter.rankRange) {
      const focusBlockStart = bands[focusStart] ? bands[focusStart].lo : 1;
      const rr = vocabFilter.rankRange;
      // Highlight matching dots' parent boxes for the hundred/ten levels.
      const allDots = freqAxis.querySelectorAll(".freq-dot");
      allDots.forEach(d => {
        const r = parseInt(d.dataset.rank || "0", 10);
        if (r >= rr.start && r <= rr.end) {
          const box = d.parentElement;
          if (box) box.classList.add("drill-" + vocabFilter.drillLevel);
        }
      });
    }

    host.appendChild(freqAxis);

    // -------- gender axis (production-only, hidden on IT->EN) --------
    if (activeDir === "active") {
    if (typeof window.__vocabGenderHidden === "undefined") window.__vocabGenderHidden = false;
    const genderAxis = document.createElement("div");
    genderAxis.className = "vocab-axis vocab-axis-gender";
    const genderTitle = document.createElement("div");
    genderTitle.className = "vocab-axis-title";
    const gName = document.createElement("span");
    gName.className = "vocab-axis-name";
    gName.textContent = "Gender (nouns, production)";
    genderTitle.appendChild(gName);
    const gToggle = document.createElement("button");
    gToggle.className = "vocab-axis-toggle";
    gToggle.type = "button";
    gToggle.textContent = window.__vocabGenderHidden ? "show" : "hide";
    gToggle.addEventListener("click", () => {
      window.__vocabGenderHidden = !window.__vocabGenderHidden;
      renderVocabAxes();
    });
    genderTitle.appendChild(gToggle);
    genderAxis.appendChild(genderTitle);
    if (!window.__vocabGenderHidden) {
      const gIdx = genderClassLemmasIndex();
      const order = [
        "regular_o_masc", "regular_a_fem", "e_ambiguous",
        "greek_ma_masc", "ista_common_gender",
        "irregular_gender", "gender_shift_plural",
        "invariable_accented_final", "invariable_loanword",
        "unspecified_m", "unspecified_f", "unspecified"
      ];
      const cells = [];
      for (const key of order) {
        const lemmas = gIdx[key];
        if (!lemmas || !lemmas.length) continue;
        cells.push({ key, label: GENDER_CLASS_LABELS[key] || key, lemmas, directionFilter: activeDir, axis: "gender", aspect: "gender" });
      }
      genderAxis.appendChild(buildCellGroups([{ title: null, cells }], "gender"));
    }
    host.appendChild(genderAxis);
    } // end if activeDir==="active"

    // -------- themes axis (unchanged for now) --------
    const themesAxis = document.createElement("div");
    themesAxis.className = "vocab-axis vocab-axis-themes";
    const themesTitle = document.createElement("div");
    themesTitle.className = "vocab-axis-title";
    themesTitle.innerHTML = '<span class="vocab-axis-name">Themes</span>';
    themesAxis.appendChild(themesTitle);

    const tax = LL.themesTaxonomy;
    const tIdx = themeLemmasIndex();
    if (!tax || !Array.isArray(tax.themes)) {
      const msg = document.createElement("div");
      msg.className = "muted";
      msg.style.cssText = "font-style:italic;font-size:12px;padding:6px";
      msg.textContent = "(themes taxonomy not loaded)";
      themesAxis.appendChild(msg);
    } else {
      const kindOrder = [];
      const byKind = new Map();
      for (const t of tax.themes) {
        const k = t.kind || "other";
        if (!byKind.has(k)) { byKind.set(k, []); kindOrder.push(k); }
        byKind.get(k).push(t);
      }
      const groups = [];
      for (const k of kindOrder) {
        const themes = byKind.get(k) || [];
        const cells = [];
        for (const th of themes) {
          const lemmas = tIdx[th.id] || [];
          if (!lemmas.length) continue;
          cells.push({ key: th.id, label: th.label || th.id, lemmas, directionFilter: activeDir, axis: "themes" });
        }
        if (cells.length) groups.push({ title: themeKindLabel(k), cells });
      }
      themesAxis.appendChild(buildCellGroups(groups, "themes"));
    }
    host.appendChild(themesAxis);
  }

  // Render the focused dot-grid: 10 rows x 11 cols of "boxes", each box a 3x3
  // grid of word-dots. 990 dots total. Each dot represents one rank position
  // (ranks blockStart..blockStart+989). Curated entries get coloured by their
  // events; gaps get a neutral "not yet curated" marker.
  function renderFocusedDotGrid(blockStart, byRank, dirFilter) {
    // 11 rows x 10 columns of boxes. We iterate DOM positions row-by-row
    // (matching CSS grid's default row auto-flow), but compute boxIdx in
    // column-major order so the ranks fill top-to-bottom first: ranks 1-9 in
    // (col 0, row 0), ranks 10-18 directly below in (col 0, row 1), and
    // ranks 91-99 end up at the bottom of column 0 (col 0, row 10).
    const grid = document.createElement("div");
    grid.className = "freq-focused";
    for (let boxRow = 0; boxRow < 11; boxRow++) {
      for (let boxCol = 0; boxCol < 10; boxCol++) {
        const box = document.createElement("div");
        box.className = "freq-focused-box";
        const boxIdx = boxCol * 11 + boxRow;  // 0..109, column-major
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const slot = r * 3 + c; // 0..8
            const rank = blockStart + boxIdx * 9 + slot;
            const dot = document.createElement("div");
            dot.className = "freq-dot";
            dot.dataset.rank = rank;
            const entry = byRank.get(rank);
            if (entry) {
              const events = eventsForEntry(entry, { direction: dirFilter || "any" });
              const wc = recencyWeightedCorrectness(events);
              dot.style.background = rwgColour(wc.correctness, wc.hasEvents);
              if (!wc.hasEvents) dot.classList.add("untouched");
              const pct = wc.hasEvents ? Math.round(wc.correctness * 100) + "%" : "untouched";
              const nextDrill = nextDrillLevelFor(rank);
              const drillHint = nextDrill.hint;
              dot.title = entry.lemma + " (rank " + rank + ")\n" + pct + " - " + wc.nAttempted + " attempts" + (drillHint ? "\n(click to " + drillHint + ")" : "");
              dot.dataset.lemma = entry.lemma;
              if (nextDrill.action) dot.style.cursor = "pointer";
              dot.addEventListener("click", () => {
                drillDownFromRank(rank);
              });
            } else {
              dot.classList.add("not-curated");
              dot.title = "rank " + rank + ": not curated yet";
            }
            box.appendChild(dot);
          }
        }
        grid.appendChild(box);
      }
    }
    return grid;
  }

  // Flanking block layout. All cells share the same row height as the
  // focused-grid row (focusedHeightPx / 11), so cells across blocks look
  // visually consistent.
  //   Adjacent (within 2): 10 columns x 11 rows = 110 cells, ~9 lemmas/cell.
  //   Distant (further):    1 column x 10 rows = 10 cells, ~100 lemmas/cell.
  //     Narrow tall strip; same cell height as the adjacent blocks; slightly
  //     shorter overall (10 rows vs 11) but visually balanced.
  function renderFlankingStripes(blockStart, blockEnd, byRank, distance, dirFilter, focusedHeightPx) {
    const adjacent = distance <= 2;
    const COLS = adjacent ? 10 : 1;
    const ROWS = adjacent ? 11 : 10;
    const colWidth = distance === 1 ? 5 : distance === 2 ? 4 : 5;
    // Per-block-shape row-height calibration so each flanking block totals
    // exactly focusedHeightPx, matching the focused 1-1000 grid's bounds.
    // Without this the adjacent block (11 rows + 10 × 1px gap + 8px padding)
    // ran ~18px taller than focused, and the distant block (10 rows) ran
    // shorter — symptom flagged in
    // inter_chat/Architecture_Housing_frequency_heatmap_layout.md.
    const GAP_PX = 1;
    const PAD_PX = 8; // 2 × 4px padding from CSS .freq-flanking
    const rowHeight = (focusedHeightPx - PAD_PX - (ROWS - 1) * GAP_PX) / ROWS;
    const wrap = document.createElement("div");
    wrap.className = "freq-flanking";
    wrap.dataset.blockStart = blockStart;
    wrap.dataset.blockEnd = blockEnd;
    wrap.style.display = "grid";
    wrap.style.gridTemplateColumns = "repeat(" + COLS + ", " + colWidth + "px)";
    wrap.style.gridTemplateRows = "repeat(" + ROWS + ", " + rowHeight + "px)";
    wrap.style.gap = GAP_PX + "px";
    wrap.title = "ranks " + blockStart + "-" + blockEnd + " (click to focus)";
    const span = blockEnd - blockStart + 1;
    const perCell = Math.ceil(span / (COLS * ROWS));
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const cellIdx = row * COLS + col;
        const cStart = blockStart + cellIdx * perCell;
        const cEnd = Math.min(blockEnd, cStart + perCell - 1);
        const lemmas = [];
        for (let r = cStart; r <= cEnd; r++) {
          const e = byRank.get(r);
          if (e) lemmas.push(e.lemma);
        }
        const cell = document.createElement("div");
        cell.className = "freq-flank-cell";
        cell.dataset.rangeStart = cStart;
        cell.dataset.rangeEnd = cEnd;
        if (lemmas.length === 0) {
          cell.style.background = rwgColour(0, false);
        } else {
          const m = averageCorrectnessAcrossLemmas(lemmas, dirFilter || "any");
          cell.style.background = rwgColour(m.correctness, true);
        }
        cell.title = "ranks " + cStart + "-" + cEnd + " (~" + lemmas.length + " curated)";
        wrap.appendChild(cell);
      }
    }
    return wrap;
  }

  // Drill-down helpers. The interaction model: first click anywhere sets the
  // filter to the THOUSAND (1000-block) containing that rank. Second click
  // drills to the HUNDRED (a 99-rank column of the focused block). Third
  // click drills to the TEN (a 9-rank box). After ten, no further drill.
  function rankToBlockStart(rank) {
    return Math.floor((rank - 1) / 990) * 990 + 1;
  }
  function rankToColumnRange(rank) {
    // Column-major fill: 11 box-rows per column, 9 dots per box. Column 0
    // holds ranks block_start..block_start+98.
    const blockStart = rankToBlockStart(rank);
    const offset = rank - blockStart;             // 0..989
    const col = Math.floor(offset / 99);          // 0..9
    const start = blockStart + col * 99;
    return { start: start, end: start + 98 };
  }
  function rankToBoxRange(rank) {
    const blockStart = rankToBlockStart(rank);
    const offset = rank - blockStart;             // 0..989
    const boxIdx = Math.floor(offset / 9);        // 0..109
    const start = blockStart + boxIdx * 9;
    return { start: start, end: start + 8 };
  }
  function nextDrillLevelFor(rank) {
    const lvl = vocabFilter.drillLevel;
    const rr = vocabFilter.rankRange;
    const thousand = rankToBlockStart(rank);
    const inSameThousand = rr && rr.start === thousand && rr.end === thousand + 989;
    // If no filter, or filter is for a different thousand, the next action is
    // to set this thousand as the filter.
    if (!lvl || !inSameThousand) {
      return { action: "thousand", hint: "filter this thousand" };
    }
    if (lvl === "thousand") {
      return { action: "hundred", hint: "filter this hundred" };
    }
    if (lvl === "hundred") {
      // Make sure we're still inside the active hundred before drilling further.
      const col = rankToColumnRange(rank);
      const inSameHundred = rr && rr.start === col.start && rr.end === col.end;
      if (inSameHundred) {
        return { action: "ten", hint: "filter this ten" };
      }
      // Clicked in a different column - drill to that hundred instead.
      return { action: "hundred", hint: "filter this hundred" };
    }
    // Already at ten. Allow clicking another box to switch the active ten.
    const box = rankToBoxRange(rank);
    const inSameTen = rr && rr.start === box.start && rr.end === box.end;
    if (inSameTen) {
      return { action: null, hint: null };
    }
    return { action: "ten", hint: "filter this ten" };
  }
  function drillDownFromRank(rank) {
    const next = nextDrillLevelFor(rank);
    if (!next.action) return;
    if (next.action === "thousand") {
      const start = rankToBlockStart(rank);
      vocabFilter.rankRange = { start: start, end: start + 989 };
      vocabFilter.drillLevel = "thousand";
      window.__vocabFocusRankStart = start;
    } else if (next.action === "hundred") {
      vocabFilter.rankRange = rankToColumnRange(rank);
      vocabFilter.drillLevel = "hundred";
    } else if (next.action === "ten") {
      vocabFilter.rankRange = rankToBoxRange(rank);
      vocabFilter.drillLevel = "ten";
    }
    vocabDeck = []; vocabIndex = 0;
    renderVocab();
  }

  // Baseline-diluted mean across lemmas. Touched lemmas contribute their
  // recency-weighted correctness; untouched lemmas contribute the baseline.
  function averageCorrectnessAcrossLemmas(lemmas, dirFilter, aspect) {
    let sum = 0;
    let touched = 0;
    for (const lemma of lemmas) {
      const ev = eventsForLemmas([lemma], { direction: dirFilter || "any", aspect: aspect || "translation" });
      const wc = recencyWeightedCorrectness(ev);
      if (wc.hasEvents) { sum += wc.correctness; touched++; }
      else { sum += vocabUnattemptedBaseline; }
    }
    return {
      correctness: lemmas.length > 0 ? sum / lemmas.length : 0,
      touched: touched,
      total: lemmas.length
    };
  }


  // Vocab marker. Returns a judgment {outcome, credit, reason} rather than a
  // bool, so we can express partial credit for near-misses:
  //   * exact match -> hit / 1.0
  //   * "to" missing on English infinitive -> hit / 0.9 ("roughly right")
  //   * spelling slip (double letter dropped, or English I/E swap) -> partial / 0.5
  //   * everything else -> miss / 0
  //
  // Spelling tolerance is suppressed when the learner's typed Italian
  // collides with a known different lemma in our vocab (e.g. capello vs
  // cappello). No external dictionary; collision check uses vocabEntries.
  // ---------- Italian article helpers ----------
  function extractItalianArticle(raw) {
    const s = String(raw || "").trim();
    let m = /^(il|lo|la|i|gli|le|un|uno|una)\s+(.+)$/i.exec(s);
    if (m) return { article: m[1].toLowerCase(), rest: m[2].trim() };
    m = /^(l'|un')\s*([^\s]+.*)$/i.exec(s);
    if (m) return { article: m[1].toLowerCase(), rest: m[2].trim() };
    return null;
  }
  // Gender carried by an unambiguous article. l' returns null (ambiguous).
  function articleGender(article) {
    if (["il","lo","i","gli","un","uno"].includes(article)) return "m";
    if (["la","le","una","un'"].includes(article)) return "f";
    return null;
  }
  // Trailing "(m)" or "(f)" suffix - lets the learner declare gender even
  // when their article was ambiguous (l') or absent.
  function parseGenderSuffix(raw) {
    const s = String(raw || "").trim();
    const m = /\s*\(\s*([mf])\s*\)\s*$/i.exec(s);
    if (!m) return { stripped: s, gender: null };
    return { stripped: s.slice(0, m.index).trim(), gender: m[1].toLowerCase() };
  }
  // Expected article forms for a noun, by gender + phonology.
  function expectedArticlesFor(lemma, gender) {
    const w = String(lemma || "").toLowerCase();
    if (!w || !gender) return null;
    const c0 = w[0];
    const c1 = w[1] || "";
    const vowels = "aeiouàèéìòù";
    const isVowel = (ch) => ch && vowels.indexOf(ch) >= 0;
    const startsVowel = isVowel(c0);
    const isSimpura = c0 === "s" && c1 && !isVowel(c1);
    const isZ = c0 === "z";
    const isXY = c0 === "x" || c0 === "y";
    const isGn = c0 === "g" && c1 === "n";
    const isPsPn = c0 === "p" && (c1 === "s" || c1 === "n");
    const isIVowel = c0 === "i" && isVowel(c1);
    const needsLoUno = isSimpura || isZ || isXY || isGn || isPsPn || isIVowel;
    if (gender === "m") {
      if (needsLoUno)   return { definite: ["lo"],  indefinite: ["uno"] };
      if (startsVowel)  return { definite: ["l'"],  indefinite: ["un"]  };
      return              { definite: ["il"],  indefinite: ["un"]  };
    }
    if (gender === "f") {
      if (startsVowel)  return { definite: ["l'"],  indefinite: ["un'"] };
      return              { definite: ["la"],  indefinite: ["una"] };
    }
    return null;
  }

  function vocabJudge(answer, target, isItEn, entry, regime) {
    const norm = s => String(s || "").trim().toLowerCase().replace(/[-.!?"'()\[\]]/g, "").replace(/\s+/g, " ").trim();
    const a = norm(answer);
    if (!a) return { outcome: "not_attempted", credit: 0, reason: null };

    // EN->IT noun: split off optional "(m)/(f)" suffix and optional leading
    // article, then judge translation on the BARE lemma. Attach articleInfo to
    // the result so markVocab can fire gender + article-form side-markpoints.
    if (!isItEn && entry && entry.pos === "noun" && entry.gender) {
      const sfx = parseGenderSuffix(answer);
      const extracted = extractItalianArticle(sfx.stripped);
      const articleProvided = extracted ? extracted.article : null;
      const bareLemma = extracted ? extracted.rest : sfx.stripped;
      const articleInfo = {
        articleProvided: articleProvided,
        articleGenderSignal: articleProvided ? articleGender(articleProvided) : null,
        explicitGender: sfx.gender,
        expectedGender: entry.gender,
        expectedArticles: expectedArticlesFor(entry.lemma, entry.gender)
      };
      const result = vocabJudgeCore(bareLemma || answer, target, isItEn, entry, regime);
      result.articleInfo = articleInfo;
      return result;
    }
    return vocabJudgeCore(answer, target, isItEn, entry, regime);
  }

  function vocabJudgeCore(answer, target, isItEn, entry, regime) {
    const norm = s => String(s || "").trim().toLowerCase().replace(/[-.!?"'()\[\]]/g, "").replace(/\s+/g, " ").trim();
    const a = norm(answer);
    if (!a) return { outcome: "not_attempted", credit: 0, reason: null };

    // Strip parens and square brackets BEFORE splitting on ,;/.
    // Without this order, a parenthetical containing those delimiters
    // (e.g. "the (m pl, before s+cons / z / gn / ps / x / y / i+vowel)")
    // shatters into garbage tokens that neither match the user's bare
    // answer nor recover via the per-piece paren-strip.
    // Parens: disambiguators that should not be in the matching set.
    // Square brackets: usage hints / editorial flags that should not match either.
    // See inter_chat/Architecture_Housing_translation_cleaning.md.
    const cleanedTarget = String(target || "")
      .replace(/\([^)]*\)/g, "")
      .replace(/\[[^\]]*\]/g, "");
    const pieces = cleanedTarget.split(/[,;\/]/).map(s => s.trim()).filter(Boolean);
    const alternatives = new Set();
    for (const p of pieces) {
      alternatives.add(norm(p));
    }

    // 1) exact match
    for (const alt of alternatives) {
      if (alt && a === alt) return { outcome: "hit", credit: 1, reason: null };
    }

    // 1b) Leading English article tolerance (IT->EN direction).
    // Mirror of the EN->IT side (which already accepts a leading Italian article
    // via parseGenderSuffix / extractItalianArticle) and of the "to " infinitive
    // leniency below. Strip a leading "the / a / an " from BOTH the learner's
    // answer and each target alternative, then compare. Guard against emptying
    // the string (a bare "the" answer should not match an empty target).
    // See inter_chat/Architecture_Housing_english_article_tolerance.md.
    if (isItEn) {
      const stripEnArticle = s => String(s || "").replace(/^(the|a|an)\s+/i, "").trim();
      const aStripped = stripEnArticle(a);
      if (aStripped && aStripped !== a) {
        // Learner had the article; target may or may not.
        for (const alt of alternatives) {
          if (!alt) continue;
          const altStripped = stripEnArticle(alt);
          if (altStripped && aStripped === altStripped) {
            return { outcome: "hit", credit: 1, reason: null };
          }
        }
      } else {
        // Learner had no article; target may have one (rare but possible).
        for (const alt of alternatives) {
          if (!alt) continue;
          const altStripped = stripEnArticle(alt);
          if (altStripped && altStripped !== alt && a === altStripped) {
            return { outcome: "hit", credit: 1, reason: null };
          }
        }
      }
    }

    // 2) "to" omission (English direction)
    if (isItEn) {
      for (const alt of alternatives) {
        if (alt.startsWith("to ") && a === alt.slice(3)) {
          return { outcome: "hit", credit: 0.9, reason: "Roughly right - 'to' missing on infinitive" };
        }
        if (a.startsWith("to ") && alt === a.slice(3)) {
          return { outcome: "hit", credit: 1, reason: null };
        }
      }
    } else {
      // Going EN->IT: tolerate a stray "to" on the learner's side (still full credit)
      for (const alt of alternatives) {
        if (a.startsWith("to ") && alt === a.slice(3)) {
          return { outcome: "hit", credit: 1, reason: null };
        }
      }
    }

    // 3) spelling tolerance with collision check
    const collisionRisk = (!isItEn) && vocabLemmaCollision(a, entry);

    // (a) Double-letter slip on either side: collapse all doubles in both
    // strings and see if they're equal. This catches "aple"/"apple" and
    // "cappello"/"capello" alike. Suppressed in Italian direction when the
    // typo collides with a different known lemma.
    const aCollapsed = a.replace(/(.)\1+/g, "$1");
    for (const alt of alternatives) {
      if (!alt) continue;
      if (a === alt) continue; // exact already handled
      const altCollapsed = alt.replace(/(.)\1+/g, "$1");
      if (aCollapsed === altCollapsed) {
        if (collisionRisk) return { outcome: "miss", credit: 0, reason: "Spelling slip would change the word" };
        return { outcome: "partial", credit: 0.5, reason: "Spelling slip - double letter" };
      }
    }

    // (b) English I/E confusion. English direction only. Two flavours:
    //     - transposed pair: "recieve" vs "receive" (ie <-> ei)
    //     - single swap:     "definately" vs "definitely" (i for e)
    if (isItEn) {
      // Transposition: every adjacent ie/ei pair, try swapping
      for (let i = 0; i < a.length - 1; i++) {
        const pair = a.slice(i, i + 2);
        if (pair === "ie" || pair === "ei") {
          const swapped = pair === "ie" ? "ei" : "ie";
          const variant = a.slice(0, i) + swapped + a.slice(i + 2);
          for (const alt of alternatives) {
            if (alt && variant === alt) {
              return { outcome: "partial", credit: 0.5, reason: "Spelling slip - i/e transposed" };
            }
          }
        }
      }
      // Single-position swap
      for (let i = 0; i < a.length; i++) {
        const c = a[i];
        if (c === "i" || c === "e") {
          const swap = c === "i" ? "e" : "i";
          const variant = a.slice(0, i) + swap + a.slice(i + 1);
          for (const alt of alternatives) {
            if (alt && variant === alt) {
              return { outcome: "partial", credit: 0.5, reason: "Spelling slip - i/e swap" };
            }
          }
        }
      }
    }

    // (c) Italian accent omission (EN->IT direction). If stripping all
    // accents from the target makes it match the learner's answer, award 50%.
    // Suppressed when the unaccented form collides with a different lemma.
    if (!isItEn) {
      const stripAccents = (s) => String(s)
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      const aStripped = stripAccents(a);
      for (const alt of alternatives) {
        if (!alt) continue;
        const altStripped = stripAccents(alt);
        if (aStripped === altStripped && a !== alt) {
          if (collisionRisk) return { outcome: "miss", credit: 0, reason: "Spelling slip would change the word" };
          return { outcome: "partial", credit: 0.5, reason: "Spelling slip - accent omitted" };
        }
      }
    }

    // (d) Cross-sense match (IT->EN). The learner's answer matches a SISTER
    // entry's translation (different POS or different sense of the same lemma).
    // Behaviour depends on the regime:
    //
    //   * hard regime  (e.g. "as a noun" in parens): the prompt named one entry
    //     whose sister has DIFFERENT MEANING. Giving the other sense is wrong.
    //     Fire MISS on the asked-for entry; the sister is untouched.
    //
    //   * soft / none: sister has SAME or related meaning. Asymmetric forward:
    //     fire HIT on the SISTER's bucket; asked-for is untouched. The deck
    //     keeps wanting to surface the asked-for so its mastery climbs later.
    //
    // matchedSister carries the sister entry so markVocab can fire on its
    // bucket (soft/none) or surface its name in the info note (hard).
    if (isItEn && entry && entry.lemma && Array.isArray(vocabEntries)) {
      for (const v of vocabEntries) {
        if (!v || !v.lemma || v.lemma !== entry.lemma) continue;
        if ((v.translation_en || "") === (entry.translation_en || "") && (v.pos || "") === (entry.pos || "")) continue;
        const altsForV = String(v.translation_en || "").split(/[,;\/]/).map(p => norm(p)).filter(Boolean);
        for (const altV of altsForV) {
          if (altV && a === altV) {
            // Pick the most informative descriptor for the sister-vs-asked
            // contrast. If POS differs, lead with POS; if POS is the same and
            // only gender differs, lead with gender; if both differ, combine.
            const posDiffers = (v.pos || "") !== (entry.pos || "");
            const genderDiffers = (v.gender || "") !== (entry.gender || "");
            const genderWord = (g) => g === "m" ? "masculine" : g === "f" ? "feminine" : g;
            const describe = (e) => {
              const parts = [];
              if (posDiffers && e.pos) parts.push(e.pos);
              if (genderDiffers && !posDiffers && e.gender) parts.push(genderWord(e.gender));
              if (posDiffers && genderDiffers && e.gender) parts.push("(" + genderWord(e.gender) + ")");
              const desc = parts.length ? parts.join(" ") : (e.pos || "other");
              return desc + " sense (\"" + (e.translation_en || "") + "\")";
            };
            const askedSense = describe(entry);
            const matchedSense = describe(v);
            if (regime === "hard") {
              return {
                outcome: "miss",
                credit: 0,
                reason: "You gave the " + matchedSense + ". This prompt was asking about the " + askedSense + ".",
                matchedSister: { entry: v, regime: "hard" }
              };
            }
            // soft / none: asymmetric forward to the matched sister entry.
            return {
              outcome: "hit",
              credit: 1,
              reason: "Right - that's the " + matchedSense + ". " + entry.lemma + " can also be a " + askedSense + ".",
              matchedSister: { entry: v, regime: regime || "none" }
            };
          }
        }
      }
    }

    // (e) Cross-lemma overlap (EN->IT). Per architect's §4 ruling 2026-05-28:
    // when the learner's typed Italian matches a DIFFERENT lemma whose
    // translation_en overlaps the asked-for's translation_en, fire the
    // supplied lemma at credit = |overlap| / |target.translation_en|.
    // Asked-for is untouched (asymmetric forward).
    //
    //   * Skip under hard regime — the prompt bound the answer.
    //   * Zero overlap → no fire here; falls through to the miss return.
    //   * Full overlap (truly interchangeable, e.g. solo/soltanto for "only")
    //     gives credit = 1.0, which renders as a full Right.
    //
    // The cleaned-element set strips parens and splits on ,;/ as elsewhere.
    if (!isItEn && regime !== "hard" && entry && entry.translation_en && Array.isArray(vocabEntries)) {
      const elementsOf = (s) => {
        // Strip parens AND square brackets FIRST so disambiguators (parens)
        // and usage hints / editorial flags (brackets) don't split on their
        // own commas / slashes and inflate the sense count. Then split on
        // ,;/ as the canonical sense separators.
        const cleaned = String(s || "")
          .replace(/\([^)]*\)/g, "")
          .replace(/\[[^\]]*\]/g, "");
        const set = new Set();
        for (const piece of cleaned.split(/[,;\/]/)) {
          const trimmed = piece.trim();
          if (trimmed) set.add(norm(trimmed));
        }
        return set;
      };
      const targetSenses = elementsOf(entry.translation_en);
      if (targetSenses.size > 0) {
        // Collect all candidate entries whose lemma matches the learner's
        // typed answer AND whose translation shares at least one sense with
        // the asked-for. Per architect's §9 tiebreaker (2026-05-28): pick
        // the entry with the smallest cleaned-element set (most specific);
        // tiebreak by lowest merged_rank, then lowest rank as final fallback.
        // The asked-for entry doesn't get special privilege.
        const candidates = [];
        for (const v of vocabEntries) {
          if (!v || !v.lemma) continue;
          if (v === entry) continue;
          if (norm(v.lemma) !== a) continue;
          const suppliedSenses = elementsOf(v.translation_en || "");
          if (suppliedSenses.size === 0) continue;
          let overlapCount = 0;
          for (const s of suppliedSenses) if (targetSenses.has(s)) overlapCount++;
          if (overlapCount === 0) continue;
          candidates.push({ v, suppliedSenses, overlapCount });
        }
        if (candidates.length > 0) {
          candidates.sort((x, y) => {
            const sx = x.suppliedSenses.size, sy = y.suppliedSenses.size;
            if (sx !== sy) return sx - sy;
            const rx = x.v.merged_rank || x.v.rank || 9e9;
            const ry = y.v.merged_rank || y.v.rank || 9e9;
            return rx - ry;
          });
          const winner = candidates[0];
          const v = winner.v;
          const overlapCount = winner.overlapCount;
          const credit = overlapCount / targetSenses.size;
          const outcome = credit >= 1 ? "hit" : "partial";
          const askedSensesList = Array.from(targetSenses).join(", ");
          // Per architect §7 ruling 2026-05-28: when both entries share an
          // equivalence_class id (e.g. solo/soltanto/solamente in "only_adv"),
          // they are truly interchangeable — change the info-note wording from
          // "X covers Y too" to the interchangeable-class nudge.
          const sharedClass = !!(entry.equivalence_class &&
            v.equivalence_class === entry.equivalence_class);
          let reason;
          if (sharedClass) {
            reason = "\"" + v.lemma + "\" and \"" + entry.lemma + "\" are interchangeable for \"" +
              askedSensesList + "\". " + entry.lemma + " still hasn't been practised specifically; " +
              "try producing it next time.";
          } else if (credit >= 1) {
            reason = "Right - \"" + v.lemma + "\" covers \"" + askedSensesList + "\" too. " +
              entry.lemma + " is the asked-about lemma.";
          } else {
            reason = "Partial - \"" + v.lemma + "\" covers part of \"" + askedSensesList + "\". " +
              entry.lemma + " carries the fuller sense.";
          }
          return {
            outcome: outcome,
            credit: credit,
            reason: reason,
            matchedSister: { entry: v, regime: regime || "none" }
          };
        }
      }
    }

    return { outcome: "miss", credit: 0, reason: null };
  }

  // Does the learner's typed Italian form match a known different lemma?
  function vocabLemmaCollision(typed, entry) {
    const t = String(typed || "").toLowerCase();
    const cur = String((entry && entry.lemma) || "").toLowerCase();
    if (!t || !cur) return false;
    for (const v of vocabEntries) {
      const lem = String(v.lemma || "").toLowerCase();
      if (!lem) continue;
      if (lem === t && lem !== cur) return true;
    }
    return false;
  }

  function markVocab(entry, raw, isItEn, regime) {
    // Active/passive split: IT→EN tests passive recognition; EN→IT tests
    // active production. The vocab tab's direction toggle drives the variant.
    // The bucket id is built per-entry (POS + gender-when-needed) so
    // gender-split lemmas like fine.f vs fine.m track separately.
    //
    // `regime` is "hard" | "soft" | "none" per the marker semantics ruling.
    // For step 2 it's plumbed through and stashed on the result for downstream
    // code; behaviour stays permissive-by-default until step 3 branches on it.
    const direction = isItEn ? "it_en" : "en_it";
    regime = regime || "none";
    // Default: the markpoint fires on the asked-for entry. The cross-sense
    // path can flip `markedEntry` to a sister (soft/none regime, asymmetric
    // forward to the matched sister). For hard regime, asked-for stays.
    let markedEntry = entry;
    const translationBucketFor = (e) => (typeof LL.entryBucketId === "function")
      ? LL.entryBucketId(e, "translation", { direction })
      : `vocabulary.it.${e.lemma}.translation.${isItEn ? "passive" : "active"}`;
    const translationLabelFor = (e) => e.lemma + " (" + (isItEn ? "passive" : "active") + ")";
    let translationBucket = translationBucketFor(markedEntry);
    let translationLabel = translationLabelFor(markedEntry);
    const trimmed = String(raw || "").trim();
    const target = isItEn ? entry.translation_en : entry.lemma;
    // renderResult expects result.overall.{marks_awarded,marks_possible,summary}
    // not result.score/max_score, so use the canonical shape.
    const result = {
      overall: { marks_awarded: 0, marks_possible: 1, summary: "" },
      raw_response: raw,
      markpoints: [],
      regime: regime,
      // Display-only usage information from the curated entry. Strict
      // display-only: renderResult surfaces it as a separate "Usage:" block;
      // the marker does NOT add this to the matchable answer set.
      // See inter_chat/Architecture_Housing_usage_notes_rendering.md.
      usage_notes: (entry && Array.isArray(entry.usage_notes) && entry.usage_notes.length > 0)
        ? entry.usage_notes
        : null
    };
    if (!trimmed) {
      result.overall.summary = "Didn't try";
      result.markpoints.push({
        bucket: translationBucket,
        label: translationLabel,
        attempted_credit: 0,
        correctness_credit: null,
        outcome: "not_attempted",
        evidence: "no answer given",
        expected: target
      });
      return result;
    }
    const judgment = vocabJudge(raw, target, isItEn, entry, regime);
    // Asymmetric tracking on cross-sense matches:
    //   soft/none → fire on the matched sister (asked-for untouched)
    //   hard       → fire miss on the asked-for entry (sister untouched)
    if (judgment.matchedSister && judgment.matchedSister.regime !== "hard") {
      markedEntry = judgment.matchedSister.entry;
      translationBucket = translationBucketFor(markedEntry);
      translationLabel = translationLabelFor(markedEntry);
    }
    const acceptableList = (() => {
      // Strip parens AND square brackets so the "Right answer" display
      // doesn't leak disambiguators or editorial flags to the learner.
      // See inter_chat/Architecture_Housing_translation_cleaning.md.
      const cleaned = String(target || "")
        .replace(/\([^)]*\)/g, "")
        .replace(/\[[^\]]*\]/g, "");
      const seen = new Set();
      const out = [];
      for (const piece of cleaned.split(/[,;\/]/)) {
        const t = piece.trim();
        if (!t) continue;
        const k = t.toLowerCase();
        if (seen.has(k)) continue;
        seen.add(k);
        out.push(t);
      }
      return out;
    })();
    // Cleaned-and-rejoined display form, used as the markpoint's `expected`
    // value so the result panel shows e.g. "the" not "the (m pl, before
    // s+cons / z / gn / ps / x / y / i+vowel)".
    const cleanedExpected = acceptableList.join(", ");
    const credit = judgment.credit;
    const outcome = judgment.outcome;
    const reason = judgment.reason;
    result.overall.marks_awarded = credit;
    if (outcome === "hit" && credit >= 1) {
      result.overall.summary = "Right";
    } else if (outcome === "hit") {
      result.overall.summary = "Roughly right";
    } else if (outcome === "partial") {
      result.overall.summary = "Half right - spelling slip";
    } else {
      result.overall.summary = "Wrong";
    }
    result.markpoints.push({
      bucket: translationBucket,
      label: translationLabel,
      attempted_credit: 1,
      correctness_credit: credit,
      outcome: outcome,
      evidence: raw,
      expected: cleanedExpected || target,
      alternatives: acceptableList,
      explanation: reason || undefined
    });
    if (markedEntry.band) {
      result.markpoints.push({
        bucket: markedEntry.band,
        label: "Frequency band " + bandFriendly(markedEntry.band),
        attempted_credit: 1,
        correctness_credit: credit,
        outcome: outcome,
        source: "band_rollup",
        suppress_display: true
      });
    }
    // EN->IT noun side-channels: gender + article-form markpoints.
    //
    // GENDER fires ONLY on an unambiguous signal:
    //   - explicit "(m)" / "(f)" suffix in the answer, OR
    //   - an article whose gender is unambiguous (il/lo/la/un/uno/una/...).
    // Bare lemma alone, or an ambiguous article like l'amico, leaves gender
    // silent (no markpoint at all). The learner chose not to demonstrate it.
    //
    // ARTICLE-FORM fires whenever an article was provided. It checks whether
    // the article matches the expected forms for this lemma's actual gender
    // and phonology (lo zaino, l'amico, un'arancia, etc.).
    const ai = judgment.articleInfo;
    if (ai && ai.expectedGender) {
      // Build the gender and article_form bucket ids via the per-entry
      // resolver so they carry POS (and gender-qualifier for gender-split
      // lemmas like fine.f vs fine.m).
      const genderBucket = (typeof LL.entryBucketId === "function")
        ? LL.entryBucketId(entry, "gender", {})
        : "vocabulary.it." + entry.lemma + ".gender.active";
      const articleFormBucket = (typeof LL.entryBucketId === "function")
        ? LL.entryBucketId(entry, "article_form", {})
        : "vocabulary.it." + entry.lemma + ".article_form.active";
      const signal = ai.explicitGender || ai.articleGenderSignal;
      if (signal !== null) {
        const correct = (signal === ai.expectedGender);
        result.markpoints.push({
          bucket: genderBucket,
          label: entry.lemma + " (gender, production)",
          attempted_credit: 1,
          correctness_credit: correct ? 1 : 0,
          outcome: correct ? "hit" : "miss",
          evidence: ai.articleProvided ? ("article " + ai.articleProvided) : ("marked (" + signal + ")"),
          expected: "gender " + ai.expectedGender,
          explanation: correct ? undefined : (entry.lemma + " is " + ai.expectedGender + ".")
        });
      }
      if (ai.articleProvided && ai.expectedArticles) {
        const expectedAll = ai.expectedArticles.definite.concat(ai.expectedArticles.indefinite);
        const correct = expectedAll.indexOf(ai.articleProvided) >= 0;
        let explanation;
        if (!correct) {
          explanation = "For " + entry.lemma + " (" + ai.expectedGender + "), use " +
            ai.expectedArticles.definite[0] + " (definite) or " +
            ai.expectedArticles.indefinite[0] + " (indefinite).";
        }
        result.markpoints.push({
          bucket: articleFormBucket,
          label: entry.lemma + " (article form, production)",
          attempted_credit: 1,
          correctness_credit: correct ? 1 : 0,
          outcome: correct ? "hit" : "miss",
          evidence: "article " + ai.articleProvided,
          expected: expectedAll.join(" or "),
          explanation: explanation
        });
      }
    }
    return result;
  }

  // ============================================================================
  // Vocab help: button bar + slash command, both call useVocabHelp().
  // ============================================================================

  function buildVocabHelpBar(item, vocabHelpsUsedRef) {
    if (!item.vocab_help || !item.vocab_help.length) return null;
    const bar = document.createElement("div");
    bar.className = "vocab-help-bar";
    const label = document.createElement("span");
    label.className = "label";
    label.textContent = "Stuck? Help:";
    bar.appendChild(label);
    for (const entry of item.vocab_help) {
      if (entry.aspects) {
        // New rich shape: one button per lemma, opens aspect submenu.
        bar.appendChild(mkRichVocabBtn(entry, vocabHelpsUsedRef));
      } else if (entry.label) {
        // Legacy flat shape: one button per entry.
        bar.appendChild(mkLegacyVocabBtn(entry, vocabHelpsUsedRef));
      }
    }
    return bar;
  }

  function mkRichVocabBtn(entry, vocabHelpsUsedRef) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "vocab-help-btn";
    btn.textContent = entry.lemma;
    btn.title = "Click to ask about " + entry.lemma;
    btn.addEventListener("click", () => {
      openAspectMenu(entry, vocabHelpsUsedRef, btn);
    });
    return btn;
  }

  function mkLegacyVocabBtn(entry, vocabHelpsUsedRef) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "vocab-help-btn";
    btn.textContent = entry.label;
    btn.title = entry.bucket || "";
    btn.addEventListener("click", () => {
      useLegacyVocabHelp(entry, vocabHelpsUsedRef, btn);
    });
    return btn;
  }

  function useLegacyVocabHelp(h, vocabHelpsUsedRef, srcBtn) {
    if (vocabHelpsUsedRef.find(x => x.bucket === h.bucket)) return;
    vocabHelpsUsedRef.push({ bucket: h.bucket, label: h.label, reveal: h.reveal });
    const revealed = document.createElement("span");
    revealed.className = "vocab-revealed";
    revealed.innerHTML = `<span class="reveal-label">${escapeHtml(h.label)}:</span> <span class="reveal-value">${escapeHtml(h.reveal)}</span>`;
    if (srcBtn && srcBtn.parentNode) srcBtn.replaceWith(revealed);
  }

  // -------------------- Rich (per-lemma) vocab help --------------------

  function prettyAspectLabel(aspect, entry) {
    const l = entry.lemma;
    switch (aspect) {
      case "translation":
        return entry.language === "it"
          ? `What does '${l}' mean?`
          : `What's the Italian for '${l}'?`;
      case "gender": return `What gender is '${l}'?`;
      case "plural": return `What's the plural of '${l}'?`;
      case "class": return `What class of adjective is '${l}'?`;
      case "adj_class": return `What class of adjective is '${l}'?`;
      case "auxiliary": return `What auxiliary does '${l}' take?`;
      case "conjugation": return `How does '${l}' conjugate (this form)?`;
      case "position": return `Where does '${l}' go?`;
      case "infinitive": return `What's the infinitive of '${l}'?`;
      default: return `Tell me about '${l}' (${aspect})`;
    }
  }

  function openAspectMenu(entry, vocabHelpsUsedRef, anchor) {
    closeAspectMenu();
    const menu = document.createElement("div");
    menu.className = "aspect-menu";
    menu.id = "aspect-menu";

    const header = document.createElement("div");
    header.className = "aspect-header";
    header.innerHTML = `Reveal about <strong>${escapeHtml(entry.lemma)}</strong> (records as a miss):`;
    menu.appendChild(header);

    const usedBuckets = new Set(vocabHelpsUsedRef.map(h => h.bucket));
    const availableAspects = Object.entries(entry.aspects || {})
      .filter(([_, def]) => !usedBuckets.has(def.bucket));

    if (availableAspects.length === 0) {
      const empty = document.createElement("div");
      empty.className = "aspect-empty";
      empty.textContent = "All available helps already used for this word.";
      menu.appendChild(empty);
    } else {
      for (const [aspect, def] of availableAspects) {
        const opt = document.createElement("button");
        opt.type = "button";
        opt.className = "aspect-option";
        opt.textContent = prettyAspectLabel(aspect, entry);
        opt.addEventListener("click", () => {
          revealAspect(entry, aspect, def, vocabHelpsUsedRef, anchor);
          closeAspectMenu();
        });
        menu.appendChild(opt);
      }
    }

    const r = anchor.getBoundingClientRect();
    menu.style.left = (window.scrollX + r.left) + "px";
    menu.style.top = (window.scrollY + r.bottom + 4) + "px";
    document.body.appendChild(menu);

    setTimeout(() => {
      const dismiss = (e) => {
        if (!menu.contains(e.target) && e.target !== anchor) closeAspectMenu();
      };
      document.addEventListener("click", dismiss, { once: true });
    }, 0);
  }

  function closeAspectMenu() {
    const m = document.getElementById("aspect-menu");
    if (m) m.remove();
  }

  function revealAspect(entry, aspect, def, vocabHelpsUsedRef, anchor) {
    if (vocabHelpsUsedRef.find(h => h.bucket === def.bucket)) return;
    const label = prettyAspectLabel(aspect, entry);
    vocabHelpsUsedRef.push({
      bucket: def.bucket,
      label,
      reveal: def.reveal,
      lemma: entry.lemma,
      aspect
    });
    // Insert a revealed span after the anchor (whether it's a button or a prompt word).
    const revealed = document.createElement("span");
    revealed.className = "vocab-revealed";
    revealed.innerHTML = `<span class="reveal-label">${escapeHtml(entry.lemma)} (${escapeHtml(aspect)}):</span> <span class="reveal-value">${escapeHtml(def.reveal)}</span>`;
    if (anchor.classList && anchor.classList.contains("vocab-help-btn")) {
      // Bar button: replace it
      anchor.replaceWith(revealed);
    } else {
      // Prompt word click: append to vocab help bar (or next to the prompt)
      const card = anchor.closest(".qcard");
      const bar = card && card.querySelector(".vocab-help-bar");
      if (bar) bar.appendChild(revealed);
      else if (anchor.parentNode) anchor.parentNode.insertBefore(revealed, anchor.nextSibling);
    }
  }

  // Render the prompt with words wrapped in clickable spans where a matching
  // vocab_help entry exists. Words that don't match are plain text.
  function renderPromptElement(promptText, item, vocabHelpsUsedRef) {
    const div = document.createElement("div");
    div.className = "prompt";

    // Build a lemma index from rich vocab_help entries
    const rich = (item.vocab_help || []).filter(e => e.lemma && e.aspects);
    const lemmaMap = new Map();
    for (const e of rich) lemmaMap.set(e.lemma.toLowerCase(), e);

    // MCQ items: skip the EN/IT segmenter. The choice text is rendered
    // separately as buttons, so the prompt is typically a short question
    // that doesn't benefit from segmentation and can mis-split if the
    // author baked choice markers into the prompt text (see inter_chat/
    // Architecture_Housing_mcq_segmenter_fallback.md).
    //
    // NOTE on wrapping: `.qcard .prompt` is a flex column. Appending
    // inline content (text nodes, spans) DIRECTLY to it would make each
    // token an anonymous flex item, breaking each word onto its own row.
    // We wrap inline content in a single child div so the flex container
    // sees one child; the child renders text inline as normal.
    // (See inter_chat/Architecture_Housing_segmenter_quote_anchoring.md.)
    if (item && item.type === "mcq") {
      const inlineBlock = document.createElement("div");
      inlineBlock.className = "prompt-inline";
      renderTextWithLemmas(inlineBlock, promptText, lemmaMap, item, vocabHelpsUsedRef);
      div.appendChild(inlineBlock);
      return div;
    }

    const segments = segmentPrompt(promptText);

    // Single segment: render as a plain block, preserving lemma-click behaviour.
    if (segments.length <= 1) {
      const inlineBlock = document.createElement("div");
      inlineBlock.className = "prompt-inline";
      renderTextWithLemmas(inlineBlock, promptText, lemmaMap, item, vocabHelpsUsedRef);
      div.appendChild(inlineBlock);
      return div;
    }

    // Multi-segment: each on its own line, styled by kind.
    for (const seg of segments) {
      const block = document.createElement("div");
      block.className = "prompt-segment prompt-" + seg.kind;
      if (seg.kind === "italian") {
        renderTextWithLemmas(block, seg.text, lemmaMap, item, vocabHelpsUsedRef);
      } else if (seg.kind === "cue") {
        // Render as "Use: <word>" with a label span so CSS can style the
        // "Use:" prefix muted and the cue word prominent.
        const labelSpan = document.createElement("span");
        labelSpan.className = "prompt-cue-label";
        labelSpan.textContent = "Use ";
        const valSpan = document.createElement("span");
        valSpan.className = "prompt-cue-word";
        valSpan.textContent = seg.text;
        block.appendChild(labelSpan);
        block.appendChild(valSpan);
      } else {
        block.textContent = seg.text;
      }
      div.appendChild(block);
    }
    return div;
  }

  // Tokenise prompt text into kind-tagged segments. Three kinds:
  //   italian: text inside paired single or double quotes
  //   cue:     text inside parentheses (typically a verb cue at the end)
  //   english: everything else (narration, directives)
  // Italian apostrophes inside a quoted segment (l'ho, c'è) are preserved by
  // checking that a closing quote candidate is followed by whitespace or
  // punctuation, not by a letter.
  function segmentPrompt(text) {
    const segments = [];
    let buf = "";
    let mode = "english";
    const len = text.length;
    for (let i = 0; i < len; i++) {
      const c = text[i];
      const prev = i > 0 ? text[i - 1] : "";
      const next = i < len - 1 ? text[i + 1] : "";
      const atStart = i === 0;
      const prevIsSpaceLike = /\s/.test(prev);
      // Open an italian segment only when the quote sits AT the start of input
      // or directly after whitespace. Single-character prev means /^/ would
      // match anywhere, so test atStart explicitly.
      if (mode === "english" && (c === "'" || c === '"') && (atStart || prevIsSpaceLike) && /\S/.test(next)) {
        if (buf.trim()) segments.push({ kind: "english", text: buf.trim() });
        buf = ""; mode = "italian";
        continue;
      }
      if (mode === "italian" && (c === "'" || c === '"') &&
          /\S/.test(prev) && (!next || /[\s.,!?;:]/.test(next))) {
        if (buf.trim()) segments.push({ kind: "italian", text: buf.trim() });
        buf = ""; mode = "english";
        continue;
      }
      if (mode === "english" && c === "(" && (atStart || prevIsSpaceLike)) {
        if (buf.trim()) segments.push({ kind: "english", text: buf.trim() });
        buf = ""; mode = "cue";
        continue;
      }
      if (mode === "cue" && c === ")") {
        if (buf.trim()) segments.push({ kind: "cue", text: buf.trim() });
        buf = ""; mode = "english";
        continue;
      }
      buf += c;
    }
    if (buf.trim()) segments.push({ kind: mode, text: buf.trim() });
    return segments;
  }

  function renderTextWithLemmas(host, text, lemmaMap, item, vocabHelpsUsedRef) {
    if (!lemmaMap.size) {
      host.textContent = text;
      return;
    }
    const tokens = text.split(/(\s+|[\.,!?;:"'()\[\]_])/);
    for (const tok of tokens) {
      if (!tok) continue;
      const cleaned = tok.toLowerCase().replace(/^['"]/, "").replace(/['"\.,!?;:]+$/g, "");
      const entry = lemmaMap.get(cleaned);
      if (entry) {
        const span = document.createElement("span");
        span.className = "prompt-clickable-word";
        span.textContent = tok;
        span.title = "Click for vocab help";
        span.addEventListener("click", e => {
          e.stopPropagation();
          openAspectMenu(entry, vocabHelpsUsedRef, span);
        });
        host.appendChild(span);
      } else {
        host.appendChild(document.createTextNode(tok));
      }
    }
  }

  function attachVocabSlashMenu(inputEl, item, vocabHelpsUsedRef) {
    // When the learner types `/` at the end of the input, pop a small menu.
    inputEl.addEventListener("keydown", e => {
      if (e.key === "/" && (!item.vocab_help || item.vocab_help.length === 0)) return;
      if (e.key !== "/") return;
      // Only fire when the input is empty or the cursor is at end-of-line on a word boundary
      const val = inputEl.value;
      const pos = inputEl.selectionStart;
      const before = val.slice(0, pos);
      const lastCh = before.slice(-1);
      if (lastCh && lastCh !== " " && lastCh !== "" && lastCh !== "\n") return;
      e.preventDefault();
      openSlashMenu(inputEl, item, vocabHelpsUsedRef);
    });
  }

  function openSlashMenu(inputEl, item, vocabHelpsUsedRef) {
    closeSlashMenu();
    const menu = document.createElement("div");
    menu.className = "slash-menu";
    menu.id = "slash-menu";
    const helps = (item.vocab_help || []).filter(h => !vocabHelpsUsedRef.find(x => x.bucket === h.bucket));
    if (helps.length === 0) {
      const empty = document.createElement("div");
      empty.className = "slash-empty";
      empty.textContent = (item.vocab_help && item.vocab_help.length)
        ? "All helps already used for this question."
        : "No vocab help defined for this question.";
      menu.appendChild(empty);
    } else {
      const header = document.createElement("div");
      header.className = "slash-header";
      header.textContent = "Reveal (records as a miss):";
      menu.appendChild(header);
      let focusIdx = 0;
      const optEls = [];
      helps.forEach((h, i) => {
        const opt = document.createElement("button");
        opt.type = "button";
        opt.className = "slash-option" + (i === 0 ? " focused" : "");
        opt.textContent = h.label;
        opt.addEventListener("click", () => {
          useVocabHelpFromSlash(h, vocabHelpsUsedRef, inputEl);
          closeSlashMenu();
          inputEl.focus();
        });
        optEls.push(opt);
        menu.appendChild(opt);
      });
      // Keyboard nav inside the menu
      const onKey = (e) => {
        if (e.key === "Escape") { closeSlashMenu(); inputEl.focus(); e.preventDefault(); }
        else if (e.key === "ArrowDown") {
          optEls[focusIdx].classList.remove("focused");
          focusIdx = (focusIdx + 1) % optEls.length;
          optEls[focusIdx].classList.add("focused");
          e.preventDefault();
        } else if (e.key === "ArrowUp") {
          optEls[focusIdx].classList.remove("focused");
          focusIdx = (focusIdx - 1 + optEls.length) % optEls.length;
          optEls[focusIdx].classList.add("focused");
          e.preventDefault();
        } else if (e.key === "Enter") {
          optEls[focusIdx].click();
          e.preventDefault();
        }
      };
      menu.addEventListener("keydown", onKey);
      inputEl.addEventListener("keydown", onKey);
      menu._cleanupSlashKeys = () => inputEl.removeEventListener("keydown", onKey);
    }
    // Position the menu below the input
    const r = inputEl.getBoundingClientRect();
    menu.style.left = (window.scrollX + r.left) + "px";
    menu.style.top = (window.scrollY + r.bottom + 4) + "px";
    document.body.appendChild(menu);
    setTimeout(() => {
      const dismiss = (e) => {
        if (!menu.contains(e.target) && e.target !== inputEl) closeSlashMenu();
      };
      document.addEventListener("click", dismiss, { once: true });
    }, 0);
  }

  function closeSlashMenu() {
    const menu = document.getElementById("slash-menu");
    if (!menu) return;
    if (menu._cleanupSlashKeys) menu._cleanupSlashKeys();
    menu.remove();
  }

  function useVocabHelpFromSlash(h, vocabHelpsUsedRef, inputEl) {
    if (vocabHelpsUsedRef.find(x => x.bucket === h.bucket)) return;
    vocabHelpsUsedRef.push(h);
    // Find the vocab-help-bar in the same card and replace the button with reveal
    const card = inputEl.closest(".qcard");
    if (card) {
      const bar = card.querySelector(".vocab-help-bar");
      if (bar) {
        for (const btn of bar.querySelectorAll(".vocab-help-btn")) {
          if (btn.textContent === h.label) {
            const revealed = document.createElement("span");
            revealed.className = "vocab-revealed";
            revealed.innerHTML = `<span class="reveal-label">${escapeHtml(h.label)}:</span><span class="reveal-value">${escapeHtml(h.reveal)}</span>`;
            btn.replaceWith(revealed);
            return;
          }
        }
      }
    }
  }

  // Append vocab help events to a marker result so they're recorded with the attempt.
  // The variant (.active/.passive) is inferred from the surrounding item's direction
  // when the helper is available.
  function appendVocabHelpEvents(result, vocabHelpsUsedRef, item) {
    if (!vocabHelpsUsedRef.length) return;
    const direction = (item && typeof LL.inferDirection === "function")
      ? LL.inferDirection(item)
      : "en_it";
    const resolve = (typeof LL.resolveVocabVariant === "function")
      ? (b) => LL.resolveVocabVariant(b, direction)
      : (b) => b;
    for (const h of vocabHelpsUsedRef) {
      result.markpoints.push({
        bucket: resolve(h.bucket),
        label: h.label,
        attempted_credit: 1,
        correctness_credit: 0,
        outcome: "miss",
        evidence: `declared unknown; revealed: ${h.reveal}`,
        source: "learner_declared"
      });
    }
  }

  // Fire vocab hits when the learner ACTIVELY produces a vocab_help lemma in
  // their answer. The distinction matters: a lemma that only appeared in the
  // prompt isn't evidence the learner knows it; only producing it (or an
  // inflected form of it) in the answer counts as active knowledge.
  //
  // Heuristic for "lemma produced": exact whole-word match against any token
  // in the answer, OR a 4-character prefix match (so "rosso" counts as
  // produced when the answer is "rossa", "rossi", "rosse"; "andare" counts
  // when the answer is "andata", "andato", etc).
  function appendActiveProductionHits(result, vocabHelpsUsedRef, item, rawAnswer) {
    if (!item || !item.vocab_help) return;
    if (!rawAnswer || !String(rawAnswer).trim()) return;
    const usedBuckets = new Set(vocabHelpsUsedRef.map(h => h.bucket));
    // Collect any text that was visible to the learner before they answered:
    // the grammar prompt, the translation source_text, plus any explicit cue
    // text (e.g. "(grande)" cues in grammar items). A lemma that appears in
    // ANY of this visible text was handed to the learner and so doesn't
    // count as actively produced even if they then wrote it in their answer.
    const visibleParts = [];
    if (item.prompt) visibleParts.push(String(item.prompt));
    if (item.source_text) visibleParts.push(String(item.source_text));
    if (item.cue) visibleParts.push(String(item.cue));
    const visibleText = visibleParts.join(" ");
    // Active production hits fire only when the learner actually produced the
    // lemma in their answer (with the prompt-visibility filter applied). For
    // the active/passive variant: this path fires .active because the lemma
    // was produced. Direction of the item provides the same answer (an item
    // where the learner produces Italian is en_it = active).
    const direction = (typeof LL.inferDirection === "function") ? LL.inferDirection(item) : "en_it";
    const resolve = (typeof LL.resolveVocabVariant === "function")
      ? (b) => LL.resolveVocabVariant(b, direction)
      : (b) => b;
    for (const entry of item.vocab_help) {
      if (!entry.aspects || !entry.lemma) continue;
      if (!lemmaProducedInAnswer(entry.lemma, rawAnswer)) continue;
      // Skip if the lemma was visible in the prompt. The learner saw it; they
      // didn't have to retrieve it from their own knowledge.
      if (visibleText && lemmaProducedInAnswer(entry.lemma, visibleText)) continue;
      for (const [aspect, def] of Object.entries(entry.aspects)) {
        const resolvedBucket = resolve(def.bucket);
        if (usedBuckets.has(def.bucket) || usedBuckets.has(resolvedBucket)) continue;
        result.markpoints.push({
          bucket: resolvedBucket,
          label: `${entry.lemma} (${aspect})`,
          attempted_credit: 1,
          correctness_credit: 1,
          outcome: "hit",
          evidence: "actively produced in answer",
          source: "active_production"
        });
      }
    }
  }

  function lemmaProducedInAnswer(lemma, answer) {
    const lemmaLC = String(lemma).toLowerCase();
    const tokens = String(answer).toLowerCase().split(/[\s,.!?;:"'()\[\]<>\/\\]+/).filter(Boolean);
    for (const tok of tokens) {
      // Exact token match
      if (tok === lemmaLC) return true;
      // Lemma is a substring of token (covers "lo" in "vederlo" attached forms,
      // but only when the lemma is itself a reasonably distinctive sequence)
      if (lemmaLC.length >= 3 && tok.includes(lemmaLC)) return true;
      // 4-character prefix match (catches inflections: rosso<->rossa, andare<->andata)
      if (lemmaLC.length >= 4 && tok.length >= 4 &&
          lemmaLC.slice(0, 4) === tok.slice(0, 4)) return true;
    }
    return false;
  }

  function wrapSelection(textarea, tag) {
    const start = textarea.selectionStart, end = textarea.selectionEnd;
    if (start === end) return;
    const v = textarea.value;
    const selected = v.slice(start, end);
    const wrapped = `<${tag}>${selected}</${tag}>`;
    textarea.value = v.slice(0, start) + wrapped + v.slice(end);
    textarea.selectionStart = start + 3;
    textarea.selectionEnd = start + 3 + selected.length;
    textarea.focus();
  }

  // -------------------- result panel --------------------
  // Controlled tense-tag vocabulary (AUTHOR_BRIEF criterion 16 / DECISIONS
  // 2026-06-09). Friendly labels follow the verb_form tree names.
  const TENSE_TAG_LABELS = {
    present: "Present",
    presente_progressivo: "Present progressive",
    passato_prossimo: "Passato prossimo",
    imperfect: "Imperfect",
    imperfetto_progressivo: "Imperfect progressive",
    trapassato_prossimo: "Pluperfect",
    passato_remoto: "Past historic",
    future: "Future",
    futuro_anteriore: "Future perfect",
    condizionale: "Conditional",
    condizionale_passato: "Past conditional",
    congiuntivo_presente: "Present subjunctive",
    congiuntivo_imperfetto: "Imperfect subjunctive",
    congiuntivo_passato: "Past subjunctive",
    congiuntivo_trapassato: "Pluperfect subjunctive",
    imperativo: "Imperative",
    gerundio: "Gerund",
    infinito: "Infinitive"
  };
  const _tenseTagWarnedFor = new Set();
  function tenseTagLabel(tag) {
    if (TENSE_TAG_LABELS[tag]) return TENSE_TAG_LABELS[tag];
    if (!_tenseTagWarnedFor.has(tag)) {
      _tenseTagWarnedFor.add(tag);
      console.warn("[Linguics] Tense tag \"" + tag + "\" is not in the controlled vocabulary (criterion 16); using fallback label.");
    }
    const s = String(tag).replace(/_/g, " ");
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // Post-answer candidate-tenses row, Phase 1 (see inter_chat/
  // Architecture_Housing_candidate_tenses_tick.md). Rendered ONLY after Mark:
  // pre-answer these items carry info_display:"suppress" and nothing shows.
  // Phase 2 (marking the chosen-wrong tense) waits on tense-tagged
  // must_not_include entries; do not build yet.
  // One code path for both discriminations: candidate_tenses/correct_tense
  // (tense TAGS, friendly-labelled) and candidate_forms/correct_form (already
  // display labels: his / her / your-formal, questo / quello). See inter_chat/
  // Architecture_Housing_breadcrumb_defaults_and_candidate_forms.md.
  function renderCandidateTensesRow(q) {
    if (!q) return null;
    let cands = null, correct = null, labelText = null, isForms = false;
    if (Array.isArray(q.candidate_tenses) && q.candidate_tenses.length >= 2) {
      cands = q.candidate_tenses; correct = q.correct_tense; labelText = "Tenses in play:";
    } else if (Array.isArray(q.candidate_forms) && q.candidate_forms.length >= 2) {
      cands = q.candidate_forms; correct = q.correct_form; labelText = "Forms in play:"; isForms = true;
    } else {
      return null;
    }
    const row = document.createElement("div");
    row.className = "tense-candidates";
    const lbl = document.createElement("span");
    lbl.className = "tense-candidates-label";
    lbl.textContent = labelText;
    row.appendChild(lbl);
    for (const tag of cands) {
      const chip = document.createElement("span");
      const isCorrect = tag === correct;
      chip.className = "tense-chip" + (isCorrect ? " correct" : "");
      chip.textContent = (isCorrect ? "\u2713 " : "") + (isForms ? String(tag) : tenseTagLabel(tag));
      chip.title = isCorrect
        ? (isForms ? "The form the context demanded" : "The tense the context demanded")
        : "A legitimate option in this context";
      row.appendChild(chip);
    }
    return row;
  }

  LL.renderCandidateRow = renderCandidateTensesRow;  // exposed for tests

  function renderResult(result) {
    const root = document.createElement("div");
    root.className = "result";

    const overall = document.createElement("div");
    overall.className = "overall";
    const score = document.createElement("span");
    score.className = "score num";
    score.textContent = `${fmtMark(result.overall.marks_awarded)} / ${fmtMark(result.overall.marks_possible)}`;
    overall.appendChild(score);
    const summary = document.createElement("span");
    summary.textContent = result.overall.summary || "";
    overall.appendChild(summary);
    root.appendChild(overall);

    // Show what the learner wrote, once at the top of the result.
    if (result.raw_response && String(result.raw_response).trim() !== "") {
      const youWrote = document.createElement("div");
      youWrote.className = "result-you-wrote";
      const lbl = document.createElement("span");
      lbl.className = "cmp-label";
      lbl.textContent = "You wrote:";
      const val = document.createElement("span");
      // Colour by outcome: green when fully right, amber when partial,
      // red only when actually wrong (base .cmp-learner style).
      const _mp = result.overall.marks_possible;
      const _ma = result.overall.marks_awarded;
      const outcomeCls = (_mp > 0 && _ma >= _mp) ? " cmp-learner-right"
        : (_ma > 0 ? " cmp-learner-partial" : "");
      val.className = "cmp-value cmp-learner" + outcomeCls;
      val.textContent = result.raw_response;
      youWrote.appendChild(lbl);
      youWrote.appendChild(document.createTextNode(" "));
      youWrote.appendChild(val);
      root.appendChild(youWrote);
    }

    for (const mp of (result.markpoints || [])) {
      if (mp.suppress_display) continue;
      const row = document.createElement("div");
      const cls = mp.bucket_proposed ? "proposed" : (mp.outcome || "");
      row.className = "markpoint " + cls;
      row.title = mp.bucket;

      const label = document.createElement("div");
      label.className = "label";
      const text = mp.label || prettyBreadcrumb(mp.bucket);
      label.innerHTML = escapeHtml(text)
        + (mp.bucket_proposed ? ' <span class="proposed-tag">(proposed)</span>' : '');
      // Bucket description as a small subtitle, when available; gives plain-
      // language context for technical labels like "Class II fem pl (-i)".
      const bucketNode = bucketIndex.byId[mp.bucket];
      if (bucketNode && bucketNode.description) {
        const desc = document.createElement("div");
        desc.className = "bucket-description";
        desc.textContent = bucketNode.description;
        label.appendChild(desc);
      }
      row.appendChild(label);

      const detail = document.createElement("div");
      detail.style.flex = "1";

      // Friendly outcome word. We build the badge here and place it INLINE on
      // the answer line below (Matched: X / Right answer: Y) so the status
      // sits next to the answer rather than floating above it. If there's
      // nothing to sit next to (e.g. a hit with no evidence string), we fall
      // back to a standalone badge on its own row.
      const friendly = friendlyOutcome(mp);
      function buildStatusBadge() {
        const status = document.createElement("span");
        status.className = "outcome-status outcome-status-inline " + friendly.cls;
        status.textContent = friendly.word;
        status.title = `attempted=${mp.attempted_credit}, correctness=${mp.correctness_credit ?? "n/a"}, outcome=${mp.outcome}`;
        return status;
      }
      let badgePlaced = false;

      // Comparison block: "You wrote: X / Right answer: Y" on a miss or
      // partial. Just "Right answer: Y" if they didn't attempt. Just
      // "(matched: X)" on a hit if there's evidence.
      const wrongish = (mp.outcome === "miss" || mp.outcome === "partial" || mp.outcome === "not_attempted");
      const evidenceText = mp.evidence || mp.evidence_in_attempt || "";
      const hasEvidence = !!evidenceText && evidenceText !== "not produced";
      const hasExpected = !!mp.expected && mp.expected !== "(see reference)" && mp.expected !== "n/a";

      if (wrongish && (hasEvidence || hasExpected)) {
        const cmp = document.createElement("div");
        cmp.className = "comparison";
        // Skip the per-markpoint "You wrote" row when its evidence is just
        // the raw response (we already show that once at the top of the panel).
        const evTrim = String(evidenceText || "").trim();
        const rawTrim = String(result.raw_response || "").trim();
        const dupOfTopLevel = evTrim && rawTrim && evTrim.toLowerCase() === rawTrim.toLowerCase();
        if (hasEvidence && mp.outcome !== "not_attempted" && !dupOfTopLevel) {
          const r1 = document.createElement("div");
          r1.className = "cmp-row";
          r1.innerHTML = `<span class="cmp-label">You wrote:</span> <span class="cmp-value cmp-learner">${escapeHtml(evidenceText)}</span>`;
          cmp.appendChild(r1);
        }
        if (hasExpected) {
          const r2 = document.createElement("div");
          r2.className = "cmp-row";
          r2.innerHTML = `<span class="cmp-label">Right answer:</span> <span class="cmp-value cmp-correct">${escapeHtml(mp.expected)}</span>`;
          r2.appendChild(document.createTextNode(" "));
          r2.appendChild(buildStatusBadge());
          badgePlaced = true;
          cmp.appendChild(r2);
        } else if (hasEvidence) {
          // miss with evidence but no expected — attach badge to the "You wrote" row.
          const r1 = cmp.firstChild;
          if (r1) {
            r1.appendChild(document.createTextNode(" "));
            r1.appendChild(buildStatusBadge());
            badgePlaced = true;
          }
        }
        detail.appendChild(cmp);
      } else if (mp.outcome === "hit" && hasEvidence) {
        const e = document.createElement("div");
        e.className = "evidence";
        e.innerHTML = `Matched: <span class="cmp-value cmp-correct">${escapeHtml(evidenceText)}</span>`;
        e.appendChild(document.createTextNode(" "));
        e.appendChild(buildStatusBadge());
        badgePlaced = true;
        detail.appendChild(e);
      }

      // Fallback: nothing to sit next to (e.g. hit with no evidence string).
      // Drop a standalone badge so the learner still sees the outcome word.
      if (!badgePlaced) {
        const standalone = document.createElement("div");
        standalone.className = "outcome-status " + friendly.cls;
        standalone.textContent = friendly.word;
        standalone.title = `attempted=${mp.attempted_credit}, correctness=${mp.correctness_credit ?? "n/a"}, outcome=${mp.outcome}`;
        detail.insertBefore(standalone, detail.firstChild);
      }

      // Vocab markpoints carry an `alternatives` array of acceptable answers.
      // Surface them so the learner sees other acceptable forms even when they
      // got the question right (didactic value: "also could have said ...").
      if (Array.isArray(mp.alternatives) && mp.alternatives.length > 1) {
        const other = mp.alternatives.filter(a => {
          const ev = String(evidenceText || "").replace(/^matched: /i, "").trim().toLowerCase();
          return a.trim().toLowerCase() !== ev;
        });
        if (other.length) {
          const a = document.createElement("div");
          a.className = "evidence vocab-alternatives";
          a.innerHTML = `<span class="cmp-label">Also accepted:</span> <span class="cmp-value cmp-correct">${escapeHtml(other.join(", "))}</span>`;
          detail.appendChild(a);
        }
      }

      // Phrase-level note from a graded any_phrases entry. Set by
      // grammar_engine when an object-form phrase carried a `.note` and got
      // matched (e.g. "tolerated but standard is sagge"). Distinct from
      // mp.explanation (which is the question-level didactic note); rendered
      // as a small italic line so the learner sees the form-choice annotation.
      if (mp.phrase_note) {
        const pn = document.createElement("div");
        pn.className = "evidence markpoint-phrase-note";
        pn.innerHTML = '<span class="cmp-label">Note:</span> ' + escapeHtml(mp.phrase_note);
        detail.appendChild(pn);
      }

      if (mp.explanation) {
        const e = document.createElement("div");
        e.className = "evidence markpoint-explanation";
        e.innerHTML = annotateWithGlossary(mp.explanation);
        detail.appendChild(e);
      }

      row.appendChild(detail);
      root.appendChild(row);
    }
    // Usage notes (vocab-side, from the curated entry's `usage_notes` array).
    // Rendered as a separate visual block beneath the markpoint rows so the
    // learner sees these as supplementary, not as additional correct answers.
    // Two object shapes:
    //   - preposition-structured: { applies_to_sense, preposition, preposition_meaning? }
    //   - free-form text:        { applies_to_sense, text }
    if (Array.isArray(result.usage_notes) && result.usage_notes.length > 0) {
      // Build lines first; only attach the block (with its "Usage:" header)
      // if at least one note had a recognised shape. Avoids a bare header
      // when all notes were skipped as unrecognised.
      const lines = [];
      for (const note of result.usage_notes) {
        if (!note || typeof note !== "object") continue;
        const sense = String(note.applies_to_sense || "").trim();
        let detailStr;
        if (note.preposition) {
          const prep = String(note.preposition).trim();
          const meaning = note.preposition_meaning
            ? " ('" + String(note.preposition_meaning).trim() + "')"
            : "";
          detailStr = "with " + prep + meaning;
        } else if (note.text) {
          detailStr = String(note.text).trim();
        } else {
          continue; // shape we don't recognise; skip rather than render junk
        }
        const line = document.createElement("div");
        line.className = "result-usage-line";
        line.innerHTML = '<span class="cmp-value cmp-sense">' + escapeHtml(sense) +
          '</span> &mdash; <span class="cmp-value cmp-usage">' + escapeHtml(detailStr) + '</span>';
        lines.push(line);
      }
      if (lines.length > 0) {
        const block = document.createElement("div");
        block.className = "result-usage-notes";
        const head = document.createElement("div");
        head.className = "result-usage-head";
        head.textContent = "Usage:";
        block.appendChild(head);
        for (const ln of lines) block.appendChild(ln);
        root.appendChild(block);
      }
    }
    if (result.overall.explanation) {
      const ex = document.createElement("div");
      ex.className = "result-explanation";
      ex.innerHTML = `<strong>Why:</strong> ${annotateWithGlossary(result.overall.explanation)}`;
      root.appendChild(ex);
    }
    if (Array.isArray(result.notes) && result.notes.length) {
      const notes = document.createElement("div");
      notes.style.marginTop = "10px";
      notes.style.fontSize = "13px";
      notes.style.color = "var(--muted)";
      notes.innerHTML = "<strong>Notes:</strong> " + result.notes.map(n => escapeHtml(n.note)).join(" · ");
      root.appendChild(notes);
    }
    return root;
  }

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"})[c]);
  }

  // ============================================================================
  // Glossary: wrap matched grammatical terms in interactive spans.
  // Terms keyed in data/glossary.json with optional aliases (DOP -> "direct
  // object pronoun"). Renderer applies to explanation text in result rows.
  // ============================================================================

  function buildGlossaryIndex(g) {
    const terms = g.terms || {};
    const aliases = g.aliases || {};
    const termsLC = {};
    const displayNames = {};  // lowercase -> original casing
    for (const k of Object.keys(terms)) {
      termsLC[k.toLowerCase()] = terms[k];
      displayNames[k.toLowerCase()] = k;
    }
    const aliasesLC = {};
    for (const k of Object.keys(aliases)) {
      aliasesLC[k.toLowerCase()] = aliases[k].toLowerCase();
      displayNames[k.toLowerCase()] = k;
    }
    const all = [...Object.keys(termsLC), ...Object.keys(aliasesLC)];
    if (all.length === 0) return null;
    const escaped = all.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const sorted = escaped.sort((a, b) => b.length - a.length);
    const regex = new RegExp(`(?:(?<=^)|(?<=[^a-zA-Z0-9]))(${sorted.join('|')})(?=$|[^a-zA-Z0-9])`, 'gi');
    return { terms: termsLC, aliases: aliasesLC, displayNames, regex };
  }

  // Annotate a plain text string with glossary spans. Returns HTML (caller
  // assigns to innerHTML). Input text is escaped first; matched terms are
  // wrapped in <span class="gloss-term" title="<short def>">.
  function annotateWithGlossary(text) {
    const escaped = escapeHtml(text || "");
    const g = LL.glossary;
    if (!g || !g.regex) return escaped;
    return escaped.replace(g.regex, (match) => {
      const lookup = match.toLowerCase();
      const canonical = g.aliases[lookup] || lookup;
      const entry = g.terms[canonical];
      if (!entry || !entry.short) return match;
      const titleAttr = escapeHtml(entry.short);
      return `<span class="gloss-term" title="${titleAttr}">${match}</span>`;
    });
  }

  // ============================================================================
  // LIVE STATS PANEL
  // ============================================================================

  // Collect raw events for a bucket id (no aggregation).
  function rawEventsFor(bucketId) {
    const out = [];
    for (const att of LL.state.attempts) {
      for (const ev of att.events) {
        if (ev.bucket === bucketId) out.push({ ev, timestamp: att.timestamp });
      }
    }
    return out;
  }

  // Collect events from a node and all descendants.
  //
  // Plus a "prefix sweep" at the end: any event whose bucket id starts with
  // `node.id + "."` but ISN'T a registered tree node still gets aggregated
  // under this node. This lets us roll up per-word vocabulary buckets
  // (`vocabulary.it.casa.translation`, etc.) under the `vocabulary` top-level
  // without enumerating every word as a tree node.
  function eventsForNode(node) {
    const out = [];
    const seen = new Set();
    function walk(n) {
      if (seen.has(n.id)) return;
      seen.add(n.id);
      const here = rawEventsFor(n.id);
      for (const e of here) out.push(e);
      for (const c of (n.children || [])) walk(c);
    }
    walk(node);
    // Sweep for orphan events whose bucket lives under this node's id
    const prefix = node.id + ".";
    for (const att of LL.state.attempts) {
      for (const ev of att.events) {
        // Defensive: skip events with non-string buckets so stale localStorage
        // events from older revisions don't throw TypeError here. See
        // inter_chat/Architecture_Housing_eventsForNode_TypeError_and_state_hygiene.md.
        if (typeof ev.bucket !== "string") continue;
        if (seen.has(ev.bucket)) continue;
        if (ev.bucket.startsWith(prefix)) {
          out.push({ ev, timestamp: att.timestamp });
          seen.add(ev.bucket);
        }
      }
    }
    out.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    return out;
  }

  // Aggregate stats from descendant events.
  //
  // `correctness` is recency-weighted with an asymmetric look-back:
  //
  //   * Most recent attempt has weight 7. Each prior attempt has weight 3.
  //   * If the most recent was WRONG, ALL priors contribute. A long history
  //     of rights pulls you back above 0.3, moderating the downside of a
  //     single recent miss.
  //   * If the most recent was RIGHT, only the previous 3 priors contribute.
  //     A weak history can't drag a recent right below ~0.44 (it bottoms out
  //     when all 3 priors are wrong: 7 / (7 + 3×3) = 0.4375).
  //
  // Clean thresholds: right-then-wrong = 0.30 exactly, wrong-then-right = 0.70
  // exactly. 4-rights-then-wrong sits at 0.632; 10-rights-then-wrong at 0.811;
  // 10-wrongs-then-right at 0.438.
  //
  // All-time `attempted`, `correct`, `hits` are kept separately for reporting.
  const MASTERY_W_LAST = 7;
  const MASTERY_W_PRIOR = 3;
  const MASTERY_LOOKBACK_IF_RIGHT = 3;

  // Reusable kernel. `events` must already be sorted oldest -> newest and have
  // the shape {ev, timestamp} that eventsForNode produces.
  function recencyWeightedCorrectness(events) {
    const attemptedEvents = events.filter(e => (e.ev.attempted_credit || 0) > 0);
    if (attemptedEvents.length === 0) return { correctness: 0, hasEvents: false, nAttempted: 0 };

    const last = attemptedEvents[attemptedEvents.length - 1].ev;
    const lastCC = (last.correctness_credit !== null && last.correctness_credit !== undefined) ? last.correctness_credit : 0;
    const lastAtt = last.attempted_credit || 1;
    const lastFrac = lastCC / lastAtt;
    const lastWasRight = lastFrac >= 0.5;

    let priors = attemptedEvents.slice(0, -1);
    if (lastWasRight && priors.length > MASTERY_LOOKBACK_IF_RIGHT) {
      priors = priors.slice(-MASTERY_LOOKBACK_IF_RIGHT);
    }

    let wA = MASTERY_W_LAST * lastAtt;
    let wC = MASTERY_W_LAST * lastCC;
    for (const { ev } of priors) {
      const pAtt = ev.attempted_credit || 0;
      const pCC = (ev.correctness_credit !== null && ev.correctness_credit !== undefined) ? ev.correctness_credit : 0;
      wA += MASTERY_W_PRIOR * pAtt;
      wC += MASTERY_W_PRIOR * pCC;
    }
    const correctness = wA > 0 ? wC / wA : 0;
    return { correctness, hasEvents: true, nAttempted: attemptedEvents.length };
  }

  function aggregateNodeStats(node) {
    const events = eventsForNode(node);
    if (events.length === 0) return null;
    let attempted = 0, correct = 0;
    for (const { ev } of events) {
      attempted += ev.attempted_credit || 0;
      if (ev.correctness_credit !== null && ev.correctness_credit !== undefined) {
        correct += ev.correctness_credit;
      }
    }
    const n = events.length;
    const attempted_rate = attempted / n;

    const { correctness } = recencyWeightedCorrectness(events);

    // Keep the all-time ratio available too, for places that want it.
    const correctness_alltime = attempted > 0 ? correct / attempted : 0;
    const hits = events.filter(e => e.ev.outcome === "hit").length;
    return {
      n, attempted, correct, hits,
      attempted_rate,
      correctness,
      correctness_alltime,
      events
    };
  }

  function descendantHasEvents(node) {
    if (rawEventsFor(node.id).length > 0) return true;
    for (const c of (node.children || [])) {
      if (descendantHasEvents(c)) return true;
    }
    return false;
  }

  function renderLiveStats() {
    renderLiveOverview();
    const host = document.getElementById("live-stats-content");
    host.innerHTML = "";
    const onlyTouched = document.getElementById("live-only-touched").checked;

    for (const root of bucketIndex.roots) {
      const node = renderLiveNode(root, onlyTouched);
      if (node) host.appendChild(node);
    }
    if (!host.children.length) {
      const empty = document.createElement("div");
      empty.className = "muted";
      empty.style.fontStyle = "italic";
      empty.textContent = onlyTouched
        ? "No events yet. Uncheck 'only touched' to see the whole tree."
        : "No buckets loaded.";
      host.appendChild(empty);
    }
    // After rendering, bring the first recently-changed row into view.
    if (recentlyChangedBuckets.size) {
      scrollToFreshBuckets();   // rAF settle inside owns the timing
    }
  }

  // Get all leaf buckets reachable from a node, in tree order.
  function getLeavesUnder(node) {
    const out = [];
    function walk(n) {
      if (!n.children || n.children.length === 0) {
        out.push(n);
      } else {
        for (const c of n.children) walk(c);
      }
    }
    walk(node);
    return out;
  }

  // ---- shared coverage helper (competence strip + 2D coverage matrix) ----
  // In-scope leaves for a (topic-set, level): leaf buckets under any of rootIds
  // whose cefr_importance at that level is core or preview (denominator (a),
  // proposed in inter_chat/Architecture_Housing_coverage_matrix_2d v2, pending
  // ratification).
  function bucketLeavesInScope(rootIds, level) {
    const leaves = []; const seen = new Set();
    for (const rid of rootIds) {
      const root = bucketIndex.byId[rid];
      if (!root) continue;
      for (const leaf of getLeavesUnder(root)) {
        if (seen.has(leaf.id)) continue;
        const ci = leaf.cefr_importance && leaf.cefr_importance[level];
        if (ci === "core" || ci === "preview") { leaves.push(leaf); seen.add(leaf.id); }
      }
    }
    return leaves;
  }
  // Baseline-diluted mean mastery over the in-scope leaves, IDENTICAL in method
  // to averageCorrectnessAcrossLemmas (the vocab heatmap): touched leaves give
  // their recency-weighted correctness, untouched leaves give the baseline.
  // attempted-share = touched / total (the matrix fill fraction).
  function masteryForScope(rootIds, level) {
    const leaves = bucketLeavesInScope(rootIds, level);
    if (!leaves.length) {
      return { correctness: vocabUnattemptedBaseline, hasEvents: false, touched: 0, total: 0, empty: true };
    }
    let sum = 0, touched = 0;
    for (const leaf of leaves) {
      const wc = recencyWeightedCorrectness(eventsForNode(leaf));
      if (wc.hasEvents) { sum += wc.correctness; touched++; }
      else { sum += vocabUnattemptedBaseline; }
    }
    return {
      correctness: sum / leaves.length,
      hasEvents: touched > 0,
      attempted_share: touched / leaves.length,
      touched, total: leaves.length, empty: false
    };
  }

  // Category derivation from a top-level bucket id. Data-driven so future
  // verb_form.future / .condizionale slot in automatically.
  // See inter_chat/Architecture_Housing_stats_panel_structure.md.
  function overviewCategoryFor(rootId) {
    if (!rootId) return null;
    const head = String(rootId).split(".")[0];
    if (head === "vocabulary") return null;              // vocab has its own strand
    // Diagnostic-only trees (orthography.*) are analytics axes, not practisable
    // parts: they must never appear in the picker or the coverage matrix.
    const node = bucketIndex && bucketIndex.byId && (bucketIndex.byId[rootId] || bucketIndex.byId[head]);
    if (node && node.attributes && node.attributes.diagnostic_only) return null;
    const idx = topicPartIndex();
    const hit = idx[rootId] || idx[head];
    if (hit) return hit.id === "vocab" ? null : hit.label;
    // No silent drops: an unmapped loaded topic surfaces under "More", warned once.
    if (LL.partsConfig && !_warnedUnmapped.has(head)) {   // don't warn during the legacy-fallback boot window
      _warnedUnmapped.add(head);
      console.warn("[Linguics] topic \"" + head + "\" is in no parts.json family; showing under \"" + MORE_PART_LABEL + "\".");
    }
    return MORE_PART_LABEL;
  }
  // Across-category order. Verbs first (bulk), then Adjectives, then Pronouns.
  // ---- part families (data/parts.json, architecture-owned) ----
  // Single source of truth for the entry picker AND the overview categoriser, so
  // the two surfaces cannot disagree. Legacy fallback keeps inline-sample boot
  // working before the file loads. See inter_chat/Architecture_Housing_entry_parts_map.md.
  const LEGACY_PARTS = { parts: [
    { id: "verbs", label: "Verbs", topics: ["verb_form.present_indicative","verb_form.passato_prossimo","verb_form.imperfect","verb_form.future","verb_form.condizionale","verb_form.gerundio","verb_form.trapassato_prossimo","verb_form.congiuntivo","verb_form.passato_remoto","verb_form.imperativo","tense_choice"] },
    { id: "pronouns", label: "Pronouns", topics: ["pronoun"] },
    { id: "adjectives_adverbs", label: "Adjectives & adverbs", topics: ["adjective_agreement"] },
    { id: "vocab", label: "Vocab", topics: ["vocabulary"] }
  ] };
  function partsConfig() {
    const c = LL.partsConfig;
    return (c && Array.isArray(c.parts) && c.parts.length) ? c : LEGACY_PARTS;
  }
  const MORE_PART_LABEL = "More";
  const _warnedUnmapped = new Set();
  // topic -> { id, label } for every mapped topic.
  function topicPartIndex() {
    const idx = {};
    for (const part of partsConfig().parts) {
      for (const tp of (part.topics || [])) idx[tp] = { id: part.id, label: part.label };
    }
    return idx;
  }
  function overviewCategoryOrder() {
    const out = partsConfig().parts.filter(p => p.id !== "vocab").map(p => p.label);
    out.push(MORE_PART_LABEL);
    return out;
  }
  const OVERVIEW_CATEGORY_ORDER = null;  // superseded by overviewCategoryOrder()
  // Within-Verbs curriculum sequence. Other categories use manifest order.
  // Full intended curriculum order (CEFR-grounded, see CEFR_GROUNDING.md and
  // inter_chat/Architecture_Housing_curriculum_order_new_trees.md). Trees not
  // yet in the manifest are listed ahead of time and slot in when they land;
  // unknown ids keep the index-999 fallback.
  const VERBS_CURRICULUM_ORDER = [
    "verb_form.present_indicative",
    "verb_form.passato_prossimo",
    "verb_form.imperfect",
    "verb_form.trapassato_prossimo",
    "verb_form.future",
    "verb_form.condizionale",
    "verb_form.imperativo",
    "verb_form.congiuntivo",
    "verb_form.passato_remoto",
    "verb_form.gerundio",
    "tense_choice"
  ];

  function renderLiveOverview() {
    const host = document.getElementById("live-overview");
    if (!host) return;
    host.innerHTML = "";

    // Bucket roots by category (vocabulary roots are suppressed).
    const byCategory = new Map();
    for (const root of bucketIndex.roots) {
      const cat = overviewCategoryFor(root.id);
      if (!cat) continue;
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat).push(root);
    }
    // Sort Verbs by curriculum sequence; others by manifest order (already in).
    const verbsList = byCategory.get("Verbs") || [];
    verbsList.sort((a, b) => {
      const ia = VERBS_CURRICULUM_ORDER.indexOf(a.id);
      const ib = VERBS_CURRICULUM_ORDER.indexOf(b.id);
      const ra = ia >= 0 ? ia : 999;
      const rb = ib >= 0 ? ib : 999;
      return ra - rb;
    });

    // Render category by category.
    for (const cat of overviewCategoryOrder()) {
      const roots = byCategory.get(cat);
      if (!roots || roots.length === 0) continue;
      const header = document.createElement("div");
      header.className = "overview-category-header";
      header.textContent = cat;
      host.appendChild(header);
      const group = document.createElement("div");
      group.className = "overview-category-group";
      for (const root of roots) {
        group.appendChild(renderOverviewCell(root));
      }
      host.appendChild(group);
    }

    // Vocab footer link: not embedded as a tile, but a single line below
    // the grammar panel pointing to the Vocab tab where the proper
    // three-axis heatmap lives. Per ask 4.
    const footer = document.createElement("div");
    footer.className = "overview-vocab-footer";
    const link = document.createElement("button");
    link.type = "button";
    link.className = "overview-vocab-link";
    link.textContent = "Vocabulary: open the Vocab tab \u2192";
    link.addEventListener("click", () => showStrand("vocab"));
    footer.appendChild(link);
    host.appendChild(footer);
  }

  function renderOverviewCell(root) {
    const stats = aggregateNodeStats(root);
    const hasEvents = !!stats;
    const cell = document.createElement("div");
    cell.className = "overview-cell";
    // Topic tile flashes when the last attempt touched anything under it
    // (grammar_view_space_and_scroll v6): this is the shallowest fresh
    // surface and the scroll target in the default overview view.
    if (bucketIsFresh(root.id)) cell.classList.add("fresh");
    cell.title = friendlyOverviewTitle(root, stats);
    // Top-level cell carries no rolled-up background; the texture comes from
    // the mini-cells and micro-dots inside. An overall colour would smooth
    // over the very distribution we want to see.
    cell.addEventListener("click", () => {
      // Issue 6 (2026-05-29): the vocabulary top-level tile is most useful as
      // a jump to the Vocab tab, where the proper three-axis heatmap lives.
      // For all other topics, click filters the deck to that topic.
      if (root.id === "vocabulary" || root.id === "vocabulary.it") {
        showStrand("vocab");
      } else {
        setBucketFilter(root.id);
      }
    });

    const header = document.createElement("div");
    header.className = "overview-header";
    const lbl = document.createElement("div");
    lbl.className = "overview-label";
    lbl.textContent = root.label || root.id;
    header.appendChild(lbl);
    const meta = document.createElement("div");
    meta.className = "overview-meta";
    // Switched 2026-06-08 (per inter_chat/Architecture_Housing_stats_panel_structure.md):
    // headline is "buckets touched / buckets total", which matches the visible
    // texture (one cell per leaf) and is self-explanatory. Raw hits/events
    // count stays accessible on hover via friendlyOverviewTitle.
    //
    // Stub leaves (`stub: true` on the bucket tree) are placeholders for
    // future content (e.g. PresentUsage / TenseChoice slots) that current
    // items never touch. Excluding them from the denominator keeps the
    // headline aligned with what's practiceable right now; once those
    // buckets get real content, the flag drops and they enter the count
    // naturally. See inter_chat/Architecture_Housing_grammar_view_space_and_scroll.md.
    const allLeaves = getLeavesUnder(root);
    const leaves = allLeaves.filter(l => !l.stub);
    const touchedLeafCount = leaves.filter(l => !!aggregateNodeStats(l)).length;
    meta.textContent = touchedLeafCount + " / " + leaves.length;
    const stubCount = allLeaves.length - leaves.length;
    meta.title = "buckets practised" + (stubCount > 0
      ? " (excludes " + stubCount + " stub leaves not yet content-filled)"
      : "");
    header.appendChild(meta);
    cell.appendChild(header);

    // Direct children -> mini-cells. For each mini-cell, micro-dots per leaf.
    const children = root.children || [];
    if (children.length) {
      const childGrid = document.createElement("div");
      childGrid.className = "overview-children";
      for (const child of children) {
        childGrid.appendChild(renderOverviewMiniCell(child));
      }
      cell.appendChild(childGrid);
    } else {
      // No children in the tree (e.g. vocabulary.it has none registered).
      // Show micro-dots per orphan event, grouped by lemma if possible.
      const orphans = renderOverviewOrphanDots(root);
      if (orphans) cell.appendChild(orphans);
    }

    return cell;
  }

  function renderOverviewMiniCell(node) {
    const stats = aggregateNodeStats(node);
    const hasEvents = !!stats;
    const mini = document.createElement("div");
    mini.className = "overview-mini";
    // The pulse lands on the SMALL surfaces (mini-cell + the leaf dot that
    // actually changed), not the whole topic tile - Smith's live feedback on
    // r15 (grammar_view v9). The tile keeps .fresh as the scroll target only.
    if (bucketIsFresh(node.id)) mini.classList.add("fresh");
    mini.title = friendlyOverviewTitle(node, stats);
    // Mid-level mini-cell also carries no rolled-up background; texture comes
    // from the leaf dots inside. The rollup signal is preserved in the
    // tooltip stats and in the hits/total meta if added.
    mini.addEventListener("click", (e) => {
      e.stopPropagation();
      setBucketFilter(node.id);
    });

    // Micro-dots: one per leaf under this mini-cell.
    const leaves = getLeavesUnder(node);
    const dots = document.createElement("div");
    dots.className = "overview-dots";
    for (const leaf of leaves) {
      const leafStats = aggregateNodeStats(leaf);
      const dot = document.createElement("span");
      dot.className = "overview-dot";
      if (recentlyChangedBuckets.has(leaf.id)) dot.classList.add("fresh");
      dot.title = friendlyOverviewTitle(leaf, leafStats);
      dot.style.background = rwgColour(leafStats ? leafStats.correctness : 0, !!leafStats);
      dot.addEventListener("click", (e) => {
        e.stopPropagation();
        setBucketFilter(leaf.id);
      });
      dot.style.cursor = "pointer";
      dots.appendChild(dot);
    }
    mini.appendChild(dots);
    return mini;
  }

  // Friendly title for hover on overview cells / mini-cells / dots.
  // Uses the bucket label (not the id) and a conversational stats summary.
  function friendlyOverviewTitle(node, stats) {
    const label = node.label || node.id;
    let summary = "";
    if (stats) {
      const pct = Math.round(stats.correctness * 100);
      // The visible tile reads "hits / events". Spell out both so the
      // semantic isn't mysterious (Issue 3, 2026-05-29).
      summary = `\n${stats.hits} hits / ${stats.n} events (${pct}% recency-weighted)`;
    } else {
      summary = "\nNo events yet (0/0)";
    }
    const desc = node.description ? "\n\n" + node.description : "";
    return label + summary + desc + "\n\nDrill into this.";
  }

  // For top-level groups with no tree children (like the demo vocabulary
  // language sub-roots), show micro-dots per distinct lemma observed in
  // events (grouped on the third dotted segment of the bucket id).
  function renderOverviewOrphanDots(node) {
    const prefix = node.id + ".";
    const byLemma = new Map();   // lemma -> { hits, n, attempts }
    for (const att of LL.state.attempts) {
      for (const ev of att.events) {
        // Defensive: skip non-string buckets (see inter_chat/
        // Architecture_Housing_eventsForNode_TypeError_and_state_hygiene.md).
        if (typeof ev.bucket !== "string") continue;
        if (!ev.bucket.startsWith(prefix)) continue;
        // Lemma is the next segment after node.id
        const after = ev.bucket.slice(prefix.length);
        const lemma = after.split(".")[0];
        const cur = byLemma.get(lemma) || { hits: 0, n: 0, correctSum: 0, attemptedSum: 0 };
        cur.n += 1;
        cur.attemptedSum += ev.attempted_credit || 0;
        if (ev.correctness_credit !== null && ev.correctness_credit !== undefined) {
          cur.correctSum += ev.correctness_credit;
        }
        if (ev.outcome === "hit") cur.hits += 1;
        byLemma.set(lemma, cur);
      }
    }
    if (byLemma.size === 0) return null;
    const dots = document.createElement("div");
    dots.className = "overview-dots";
    for (const [lemma, s] of byLemma) {
      const correctness = s.attemptedSum > 0 ? s.correctSum / s.attemptedSum : 0;
      const dot = document.createElement("span");
      dot.className = "overview-dot";
      dot.title = `${lemma}: ${s.hits}/${s.n}`;
      dot.style.background = rwgColour(correctness, true);
      dots.appendChild(dot);
    }
    return dots;
  }

  // Nearest scrollbox that actually scrolls the bucket rows. The sidebar nests
  // TWO scrollboxes (#live-stats and #live-stats-content), which is part of why
  // scrollIntoView misbehaved: it walks EVERY scrollable ancestor, including the
  // window. See inter_chat/Architecture_Housing_grammar_view_space_and_scroll.md v4.
  function freshScrollBox() {
    const inner = document.getElementById("live-stats-content");
    const outer = document.getElementById("live-stats");
    if (inner && inner.scrollHeight > inner.clientHeight + 1) return inner;
    if (outer && outer.scrollHeight > outer.clientHeight + 1) return outer;
    return inner || outer || null;
  }
  function scrollToFreshBuckets(opts) {
    // On phones the answer + explanation stay in view and the inline pill
    // invites a look; the pill's click passes force:true so there is exactly
    // one scroll path (grammar_view_space_and_scroll v6 ask 2).
    if (TOUCH_FIRST && !(opts && opts.force)) return;
    // Shallowest fresh surface wins: the overview topic tile (document order
    // puts #live-overview first), else the shallowest fresh tree row.
    const fresh = document.querySelector("#live-overview .overview-cell.fresh, #live-stats-content .live-bucket-row.fresh");
    if (!fresh) return;
    // The flash is SEQUENCED: it fires only after the scroll has landed (or
    // immediately when no scroll is needed), so the learner actually sees it.
    // v7's mistake: .fresh animated at render, up to ~1.5s before the scroll
    // arrived, so the pulse was over before the tile was on screen (v8).
    const flashFresh = () => {
      // Small surfaces only (mini-cell, leaf dot, tree row) - the whole-tile
      // pulse read as "the big box flashing" (Smith on r15, grammar_view v9).
      // The .overview-cell keeps .fresh purely as the scroll target.
      document.querySelectorAll("#live-stats .overview-mini.fresh, #live-stats .overview-dot.fresh, #live-stats-content .live-bucket-row.fresh").forEach(el => {
        el.classList.remove("fresh-flash");
        void el.offsetWidth;   // restart the animation even on repeated Marks
        el.classList.add("fresh-flash");
      });
    };
    // rAF-poll a position getter until it stops moving, then fire done().
    const afterSettle = (getPos, done, cap) => {
      let last = null, still = 0, n = 0;
      const tick = () => {
        const p = getPos();
        if (last !== null && Math.abs(p - last) < 0.5) still++; else still = 0;
        last = p;
        if (still >= 2 || n++ > (cap || 120)) { done(); return; }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    // Wait for layout to stop moving before measuring (v5's settle rationale:
    // the post-Mark reveal animates the main column while we measure).
    afterSettle(() => fresh.getBoundingClientRect().top, () => {
      // v8 root cause: choose the scrollbox that actually CONTAINS the fresh
      // element by walking its ancestors. v5's chooser hard-coded
      // #live-stats-content (right when fresh rows lived in the tree), but the
      // v7 tile target lives in #live-overview, whose scroller is the OUTER
      // #live-stats - so the code scrolled a box the tile was never in.
      let box = null;
      for (let el = fresh.parentElement; el; el = el.parentElement) {
        if (el.scrollHeight > el.clientHeight + 1) { box = el; break; }
        if (el.id === "live-stats") break;   // past the sidebar = the page scrolls
      }
      if (box) {
        const r = fresh.getBoundingClientRect();
        const b = box.getBoundingClientRect();
        const topInBox = r.top - b.top + box.scrollTop;
        const botInBox = topInBox + r.height;
        if (topInBox >= box.scrollTop && botInBox <= box.scrollTop + box.clientHeight) {
          flashFresh();   // already fully visible: no movement, flash now
          return;
        }
        const target = Math.max(0, topInBox - Math.max(0, (box.clientHeight - r.height) / 2));
        if (typeof box.scrollTo === "function") box.scrollTo({ top: target, behavior: "smooth" });
        else box.scrollTop = target;
        afterSettle(() => box.scrollTop, flashFresh);
      } else {
        // Stacked layouts (phone): nothing in the sidebar overflows, the page
        // itself scrolls. Centre the tile via the window, then flash.
        const r = fresh.getBoundingClientRect();
        if (r.top >= 0 && r.bottom <= window.innerHeight) { flashFresh(); return; }
        const t = Math.max(0, window.scrollY + r.top - Math.max(0, (window.innerHeight - r.height) / 2));
        window.scrollTo({ top: t, behavior: "smooth" });
        afterSettle(() => window.scrollY, flashFresh);
      }
    }, 90);
  }

  function scrollToBucket(bucketId) {
    const rows = document.querySelectorAll("#live-stats-content .live-bucket-row");
    for (const row of rows) {
      if (row.title && (row.title === bucketId || row.title.startsWith(bucketId + "\n") || row.title.startsWith(bucketId + " "))) {
        row.scrollIntoView({ behavior: "smooth", block: "start" });
        row.classList.add("jumped");
        setTimeout(() => row.classList.remove("jumped"), 1200);
        return;
      }
    }
  }

  function renderLiveNode(node, onlyTouched) {
    const agg = aggregateNodeStats(node);
    const hasEvents = !!agg;
    if (onlyTouched && !hasEvents) return null;

    const div = document.createElement("div");
    div.className = "live-bucket-node";
    const hasChildren = node.children && node.children.length > 0;
    const descTouched = descendantHasEvents(node);
    // collapse children by default unless this sub-tree has events
    if (hasChildren && !descTouched) div.classList.add("collapsed");

    const row = document.createElement("div");
    row.className = "live-bucket-row " + (hasChildren ? "aggregate" : "leaf");
    if (hasEvents && bucketIsFresh(node.id)) row.classList.add("fresh");
    // Friendly label in the tooltip (DECISIONS.md 2026-05-15); fall back to id
    // only when the bucket has no label. The dotted id is engine-facing.
    // Honour info_display: "suppress" by using the topic-generic label when
    // the in-flight item touches this node (see inter_chat/
    // Architecture_Housing_info_display_suppress.md).
    let tooltipLabel = node.label || node.id;
    if (LL.inFlightSuppress) {
      const buckets = LL.inFlightSuppress.buckets;
      let touches = false;
      buckets.forEach(b => {
        if (b === node.id || b.startsWith(node.id + ".") || node.id.startsWith(b + ".")) touches = true;
      });
      if (touches) tooltipLabel = LL.inFlightSuppress.topicLabel;
    }
    row.title = tooltipLabel + (node.description ? "\n\n" + node.description : "");

    const chev = document.createElement("span");
    chev.className = "chev";
    chev.textContent = hasChildren ? (div.classList.contains("collapsed") ? "▸" : "▾") : "";
    row.appendChild(chev);

    // CEFR pip
    const cefr = (node.cefr_importance && node.cefr_importance[LL.state.user_cefr]);
    if (cefr) {
      const pip = document.createElement("span");
      pip.className = "pip";
      pip.style.background = bandColour(cefr);
      pip.title = `${cefr} at ${LL.state.user_cefr}`;
      row.appendChild(pip);
    }

    const label = document.createElement("span");
    label.className = "label-text";
    label.textContent = node.label || node.id;
    row.appendChild(label);

    // Two intensity-shaded cells.
    //   Green cell: shade = hits / attempted (correct out of attempted).
    //   Blue cell:  shade = hits / total     (correct out of total events).
    // White at 0, full colour at 1.
    const cellPair = document.createElement("span");
    cellPair.className = "live-cell-pair";
    const cellG = document.createElement("span");
    cellG.className = "live-cell-green";
    const cellB = document.createElement("span");
    cellB.className = "live-cell-blue";
    if (agg) {
      const greenT = agg.attempted > 0 ? (agg.correct / agg.attempted) : 0;
      const blueT  = agg.n > 0        ? (agg.correct / agg.n)         : 0;
      cellG.style.background = shadeWhiteTo(greenT, GREEN_END);
      cellB.style.background = shadeWhiteTo(blueT, BLUE_END);
      cellG.title = `correct of attempted: ${Math.round(greenT * 100)}% (${agg.hits} of ${Math.round(agg.attempted)} tried)`;
      cellB.title = `correct of total: ${Math.round(blueT * 100)}% (${agg.hits} of ${agg.n} events)`;
    } else {
      cellG.title = cellB.title = "no events yet";
    }
    cellPair.appendChild(cellG);
    cellPair.appendChild(cellB);
    row.appendChild(cellPair);

    // hits / total ratio
    const ratio = document.createElement("span");
    ratio.className = "live-ratio";
    if (agg) {
      ratio.textContent = `${agg.hits}/${agg.n}`;
    } else {
      ratio.classList.add("empty");
      ratio.textContent = "·";
    }
    row.appendChild(ratio);

    // Last-N tick/cross strip
    const lastN = document.createElement("span");
    lastN.className = "last-n";
    if (agg) {
      const recent = agg.events.slice(-LAST_N);
      for (const { ev } of recent) {
        const m = document.createElement("span");
        m.className = "mark";
        if (ev.outcome === "hit") {
          m.classList.add("hit");
          m.textContent = "✓";
        } else if (ev.outcome === "miss" || ev.outcome === "partial") {
          m.classList.add("miss");
          m.textContent = "✗";
        } else {
          m.classList.add("dot");
          m.textContent = "·";
        }
        lastN.appendChild(m);
      }
    }
    row.appendChild(lastN);

    div.appendChild(row);

    if (hasChildren) {
      const children = document.createElement("div");
      children.className = "children";
      for (const c of node.children) {
        const cn = renderLiveNode(c, onlyTouched);
        if (cn) children.appendChild(cn);
      }
      div.appendChild(children);
      chev.addEventListener("click", e => {
        e.stopPropagation();
        div.classList.toggle("collapsed");
        chev.textContent = div.classList.contains("collapsed") ? "▸" : "▾";
      });
    }
    return div;
  }

  // -------------------- buckets browse strand --------------------
  function renderBucketsBrowse() {
    const host = document.getElementById("buckets-host");
    host.innerHTML = "";
    if (!bucketIndex.roots.length) { host.textContent = "No buckets loaded."; return; }
    const tree = document.createElement("div");
    tree.className = "bucket-tree";
    for (const root of bucketIndex.roots) tree.appendChild(renderBucketBrowseNode(root));
    host.appendChild(tree);
  }

  function renderBucketBrowseNode(node) {
    const div = document.createElement("div");
    div.className = "bucket-node collapsed";
    const row = document.createElement("div");
    row.className = "label-row";
    row.title = node.id;
    const chev = document.createElement("span");
    chev.className = "chev";
    chev.textContent = node.children.length ? "▸" : "";
    row.appendChild(chev);
    const label = document.createElement("span");
    label.className = "label";
    const cefr = (node.cefr_importance && node.cefr_importance[LL.state.user_cefr]) || "review";
    label.innerHTML = `<strong>${escapeHtml(node.label || node.id)}</strong> <span class="level-pip" style="background:${bandColour(cefr)}" title="${cefr} at ${LL.state.user_cefr}"></span>`;
    row.appendChild(label);
    div.appendChild(row);
    chev.addEventListener("click", e => {
      e.stopPropagation();
      div.classList.toggle("collapsed");
      chev.textContent = div.classList.contains("collapsed") ? (node.children.length ? "▸" : "") : "▾";
    });
    if (node.description) {
      const desc = document.createElement("div");
      desc.style.marginLeft = "22px";
      desc.style.fontSize = "12px";
      desc.style.color = "var(--muted)";
      desc.textContent = node.description;
      div.appendChild(desc);
    }
    if (node.children.length) {
      const ch = document.createElement("div");
      ch.className = "children";
      for (const c of node.children) ch.appendChild(renderBucketBrowseNode(c));
      div.appendChild(ch);
    }
    return div;
  }

  function bandColour(band) {
    switch (band) {
      case "core": return "var(--core)";
      case "preview": return "var(--preview)";
      case "review": return "var(--review)";
      case "fluency": return "var(--fluency)";
      case "arcane": return "var(--arcane)";
      default: return "var(--review)";
    }
  }

  // -------------------- CEFR selector --------------------
  function renderCefr() {
    const host = document.getElementById("user-cefr-host");
    host.innerHTML = "Your level: ";
    const sel = document.createElement("select");
    ["A1","A2","B1","B2","C1","C2"].forEach(l => {
      const o = document.createElement("option"); o.value = l; o.textContent = l;
      if (l === LL.state.user_cefr) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener("change", () => {
      LL.state.user_cefr = sel.value;
      LL.store.saveState(LL.state);
      renderLiveStats();
      renderBucketsBrowse();
    });
    host.appendChild(sel);
  }

  // -------------------- marker config (live AI marker) --------------------
  function renderMarkerConfig() {
    const host = document.getElementById("marker-config-host");
    if (!host || !LL.markerUrl) return;
    host.innerHTML = "";
    const lbl = document.createElement("span");
    lbl.className = "muted";
    lbl.textContent = "Translation AI: ";
    lbl.title = "AI marker is used only for the Translation strand. Grammar and Vocab use deterministic markers.";
    host.appendChild(lbl);

    // URL setting (compact)
    const urlBtn = document.createElement("button");
    urlBtn.type = "button";
    urlBtn.className = "secondary";
    urlBtn.style.cssText = "padding:2px 6px;font-size:11px";
    const current = LL.markerUrl();
    urlBtn.textContent = current ? "on" : "set URL";
    urlBtn.title = current ? `Worker URL: ${current}` : "Click to configure the Worker URL";
    urlBtn.addEventListener("click", () => {
      const next = prompt("Worker URL (leave blank to disable live marker):", LL.markerUrl());
      if (next === null) return;
      LL.setMarkerUrl(next);
      renderMarkerConfig();
    });
    host.appendChild(urlBtn);

    // Model picker
    if (current && LL.AVAILABLE_MODELS) {
      const modelSel = document.createElement("select");
      modelSel.style.cssText = "margin-left:6px;font-size:11px;padding:2px 4px";
      LL.AVAILABLE_MODELS.forEach(m => {
        const o = document.createElement("option");
        o.value = m.id; o.textContent = m.label;
        if (m.id === LL.markerModel()) o.selected = true;
        modelSel.appendChild(o);
      });
      modelSel.addEventListener("change", () => {
        LL.setMarkerModel(modelSel.value);
      });
      host.appendChild(modelSel);
    }
  }

  // -------------------- session cost (live AI marker) --------------------
  function renderSessionCost() {
    const host = document.getElementById("session-cost-host");
    if (!host || !LL.sessionCostUsd) return;
    const cost = LL.sessionCostUsd();
    if (cost <= 0) {
      host.textContent = "";
      return;
    }
    host.innerHTML = "";
    const lbl = document.createElement("span");
    lbl.textContent = "Session cost: " + LL.formatCost(cost);
    host.appendChild(lbl);
    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "secondary";
    reset.style.cssText = "margin-left:6px;padding:1px 5px;font-size:11px";
    reset.textContent = "reset";
    reset.addEventListener("click", () => {
      LL.resetSessionCost();
    });
    host.appendChild(reset);
  }
  if (typeof LL.markerUrl === "function") {
    LL.onCostUpdate = function (_total) { renderSessionCost(); };
  }

  // -------------------- only-touched checkbox --------------------
  document.getElementById("live-only-touched").addEventListener("change", () => {
    renderLiveStats();
  });

  // ==================== entry / welcome screen ====================
  // Data-driven part + tense derivation. Reuses the same namespace categoriser
  // (overviewCategoryFor), the live topic list (uniqueValues), the curriculum
  // order (VERBS_CURRICULUM_ORDER) and the pronoun bucket-tree children, so new
  // trees appear automatically as they land in the manifest. No hardcoded lists.
  const TENSE_LABELS = {
    "verb_form.present_indicative": "Present",
    "verb_form.passato_prossimo":   "Passato prossimo",
    "verb_form.imperfect":          "Imperfect",
    "verb_form.trapassato_prossimo":"Trapassato prossimo",
    "verb_form.future":             "Future",
    "verb_form.condizionale":       "Conditional",
    "verb_form.imperativo":         "Imperative",
    "verb_form.congiuntivo":        "Subjunctive",
    "verb_form.passato_remoto":     "Passato remoto",
    "verb_form.gerundio":           "Gerund",
    "tense_choice":                 "Tense choice"
  };
  function prettifyId(id) {
    return String(id).split(".").pop().replace(/_/g, " ").replace(/^./, c => c.toUpperCase());
  }
  function tenseLabel(topic) { return TENSE_LABELS[topic] || prettifyId(topic); }
  function verbCurriculumRank(topic) {
    const i = VERBS_CURRICULUM_ORDER.indexOf(topic);
    return i === -1 ? 999 : i;
  }

  // Returns the ordered part structure for the grammar config panel.
  function deriveEntryParts(grammarItems, bucketById) {
    const loaded = new Set(uniqueValues(grammarItems, "topic"));
    const cfg = partsConfig();
    const out = [];
    const mapped = new Set();
    for (const part of cfg.parts) {
      for (const tp of (part.topics || [])) mapped.add(tp);
      if (part.id === "vocab") continue;                       // vocab has its own strand card
      const topics = (part.topics || []).filter(tp => loaded.has(tp));
      if (!topics.length) continue;                            // all-unloaded part is hidden
      const entry = {
        id: part.id,
        label: part.label,
        kind: part.id === "verbs" ? "verbs" : (part.id === "pronouns" ? "pronouns" : "generic"),
        topics: topics.map(tp => ({ topic: tp, label: friendlyTopicLabel(tp) }))
      };
      if (entry.kind === "verbs") {
        const formation = topics.filter(tp => tp !== "tense_choice")
          .sort((a, b) => verbCurriculumRank(a) - verbCurriculumRank(b));
        entry.formationTopics = formation.map(tp => ({ topic: tp, label: friendlyTopicLabel(tp) }));
        entry.usageTopics = topics.filter(tp => tp === "tense_choice")
          .map(tp => ({ topic: tp, label: friendlyTopicLabel(tp) }));
      }
      if (entry.kind === "pronouns") {
        const kinds = [];
        if (loaded.has("pronoun") && bucketById) {
          for (const id of Object.keys(bucketById)) {
            const b = bucketById[id];
            if (b && b.parent_id === "pronoun") kinds.push({ bucketPath: b.id, label: b.label || prettifyId(b.id) });
          }
        }
        entry.kinds = kinds;
      }
      out.push(entry);
    }
    // No silent drops: any loaded topic in no family surfaces under "More", warned.
    const extra = Array.from(loaded).filter(tp => !mapped.has(tp));
    if (extra.length) {
      console.warn("[Linguics] " + extra.length + " loaded topic(s) map to no parts.json family; "
        + "showing under \"" + MORE_PART_LABEL + "\": " + extra.join(", "));
      out.push({
        id: "__more__", label: MORE_PART_LABEL, kind: "generic",
        topics: extra.map(tp => ({ topic: tp, label: friendlyTopicLabel(tp) }))
      });
    }
    return out;
  }
  LL.deriveEntryParts = deriveEntryParts;  // exposed for tests

  // ---- entry-screen state ----
  let entrySel = null;
  function defaultEntrySel() {
    return {
      strand: null,
      grammar: {
        verbMode: "form",   // "form" | "use"
        parts: {}           // partId -> { on, topics: {topic:true}, kinds: {bucketPath:true} }
      },
      vocab: { direction: "it_en", subBand: "", genderDrill: false, lens: "numeric", rankRanges: [], cefr: "", theme: "", catIds: null, catLabel: "" },
      translation: { grammarPoint: "", way: "" },
      cefrLevels: []
    };
  }
  function partSel(partId) {
    const g = entrySel.grammar;
    if (!g.parts) g.parts = {};
    if (!g.parts[partId]) g.parts[partId] = { on: false, topics: {}, kinds: {} };
    return g.parts[partId];
  }

  function currentEntryParts() {
    const byId = (typeof bucketIndex !== "undefined" && bucketIndex) ? bucketIndex.byId : (LL.bucketsById || null);
    return deriveEntryParts(grammarQuestions, byId);
  }

  // small chip factory
  function entryChip(label, active, onClick, opts) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "entry-chip" + (active ? " active" : "");
    b.textContent = label;
    if (opts && opts.title) b.title = opts.title;
    b.addEventListener("click", e => { e.preventDefault(); onClick(); });
    return b;
  }

  // GA4 semantic events for non-click moments (guarded; no-op if gtag absent).
  function track(name, params) {
    try { if (typeof window.gtag === "function") window.gtag("event", name, params || {}); } catch (e) {}
  }
  function grammarPartsSummary() {
    const g = entrySel && entrySel.grammar; if (!g) return "all";
    const on = [];
    if (g.verbs && g.verbs.on) on.push("verbs:" + g.verbMode);
    if (g.pronouns && g.pronouns.on) on.push("pronouns");
    if (g.adjectives && g.adjectives.on) on.push("adjectives");
    return on.join(",") || "all";
  }

  function showEntry() {
    if (!entrySel) entrySel = defaultEntrySel();
    document.body.classList.add("entry-active");
    const es = document.getElementById("entry-screen");
    if (es) es.hidden = false;
    renderEntryScreen();
  }
  function hideEntry() {
    document.body.classList.remove("entry-active");
    const es = document.getElementById("entry-screen");
    if (es) es.hidden = true;
  }
  LL.showEntry = showEntry;

  function renderEntryScreen() {
    const host = document.getElementById("entry-screen");
    if (!host) return;
    if (!entrySel) entrySel = defaultEntrySel();
    host.innerHTML = "";

    const col = document.createElement("div");
    col.className = "entry-col";
    if (!LL.contentLoading) renderQuickStarts(col);

    // greeting
    const h = document.createElement("h2");
    h.className = "entry-greeting";
    h.textContent = "What would you like to practise?";
    const sub = document.createElement("p");
    sub.className = "entry-subhead";
    sub.textContent = "Pick one to begin.";
    col.appendChild(h);
    col.appendChild(sub);

    // strand cards
    const cards = document.createElement("div");
    cards.className = "entry-cards";
    const STRANDS = [
      { id: "grammar",     label: "Grammar",     desc: "verb endings, genders, word order", badge: "G" },
      { id: "translation", label: "Translation", desc: "whole sentences, both ways",         badge: "T" },
      { id: "vocab",       label: "Vocab",       desc: "words, meanings, genders",           badge: "V" }
    ];
    for (const s of STRANDS) {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "entry-card" + (entrySel.strand === s.id ? " selected" : "");
      const badge = document.createElement("span");
      badge.className = "entry-card-badge badge-" + s.id;
      badge.textContent = s.badge;
      const txt = document.createElement("span");
      txt.className = "entry-card-text";
      const nm = document.createElement("span");
      nm.className = "entry-card-name";
      nm.textContent = s.label;
      const ds = document.createElement("span");
      ds.className = "entry-card-desc";
      ds.textContent = s.desc;
      txt.appendChild(nm); txt.appendChild(ds);
      card.appendChild(badge); card.appendChild(txt);
      card.addEventListener("click", () => { entrySel.strand = s.id; renderEntryScreen(); });
      cards.appendChild(card);
    }
    col.appendChild(cards);

    // selected strand's config panel
    if (entrySel.strand) {
      const panel = document.createElement("div");
      panel.className = "entry-config";
      if (LL.contentLoading) {
        // Provisional data is never shown as final (entry_load Defect 2): no
        // counts, parts or level strip derived from the inline samples. The
        // loader's .then re-renders this screen in place when content lands.
        const wait = document.createElement("p");
        wait.className = "entry-loading";
        wait.textContent = "Loading your exercises\u2026";
        panel.appendChild(wait);
      } else if (entrySel.strand === "grammar") renderGrammarConfig(panel);
      else if (entrySel.strand === "vocab")   renderVocabConfig(panel);
      else                                    renderTranslationConfig(panel);
      col.appendChild(panel);
    }

    if (LL.state && Array.isArray(LL.state.attempts) && LL.state.attempts.length > 0) {
      const cov = document.createElement("button");
      cov.type = "button"; cov.className = "entry-coverage-link";
      cov.textContent = "See your coverage \u2192";
      cov.addEventListener("click", () => { hideEntry(); showCoverage(); });
      col.appendChild(cov);
    }

    host.appendChild(col);
  }

  // ---- grammar config (fully wired) ----
  function renderGrammarConfig(panel) {
    const parts = currentEntryParts();
    const g = entrySel.grammar;

    const head = document.createElement("h3");
    head.className = "entry-config-head";
    head.textContent = "Which part?";
    const hint = document.createElement("p");
    hint.className = "entry-config-hint";
    hint.textContent = "tick any, open one to drill in";
    panel.appendChild(head);
    panel.appendChild(hint);

    const chipRow = (items, isActive, onTap, allActive, onAll) => {
      const r = document.createElement("div");
      r.className = "entry-chip-row";
      r.appendChild(entryChip("All", allActive(), onAll));
      for (const it of items) r.appendChild(entryChip(it.label, isActive(it), () => onTap(it)));
      return r;
    };

    for (const part of parts) {
      const row = document.createElement("div");
      row.className = "entry-part";
      const sel = partSel(part.id);
      const hasDrill = (part.kind === "verbs")
        || (part.kind === "pronouns" && part.kinds && part.kinds.length)
        || (part.topics.length > 1);

      const tickWrap = document.createElement("button");
      tickWrap.type = "button";
      tickWrap.className = "entry-part-tick" + (sel.on ? " on" : "");
      tickWrap.innerHTML = '<span class="tickbox"></span><span class="entry-part-label">' + part.label + '</span>'
        + (hasDrill ? '<span class="entry-part-caret" aria-hidden="true">' + (sel.on ? "\u25be" : "\u25b8") + '</span>' : '');
      tickWrap.addEventListener("click", () => { sel.on = !sel.on; renderEntryScreen(); });
      row.appendChild(tickWrap);

      if (sel.on && hasDrill) {
        const drill = document.createElement("div");
        drill.className = "entry-drill";

        if (part.kind === "verbs") {
          const modeRow = document.createElement("div");
          modeRow.className = "entry-chip-row";
          modeRow.appendChild(entryChip("Form them", g.verbMode === "form",
            () => { g.verbMode = "form"; renderEntryScreen(); }, { title: "Produce the verb form" }));
          modeRow.appendChild(entryChip("Use them", g.verbMode === "use",
            () => { g.verbMode = "use"; renderEntryScreen(); }, { title: "Choose the right tense in context" }));
          drill.appendChild(modeRow);
          const list = (g.verbMode === "use") ? part.usageTopics : part.formationTopics;
          if (list.length) {
            drill.appendChild(chipRow(list,
              it => !!sel.topics[it.topic],
              it => { sel.topics[it.topic] = !sel.topics[it.topic]; renderEntryScreen(); },
              () => Object.keys(sel.topics).filter(k => sel.topics[k]).length === 0,
              () => { sel.topics = {}; renderEntryScreen(); }));
          }
        } else {
          if (part.topics.length > 1) {
            drill.appendChild(chipRow(part.topics,
              it => !!sel.topics[it.topic],
              it => { sel.topics[it.topic] = !sel.topics[it.topic]; renderEntryScreen(); },
              () => Object.keys(sel.topics).filter(k => sel.topics[k]).length === 0,
              () => { sel.topics = {}; renderEntryScreen(); }));
          }
          if (part.kind === "pronouns" && part.kinds && part.kinds.length) {
            const kh = document.createElement("p");
            kh.className = "entry-config-hint";
            kh.textContent = "or narrow to a pronoun kind";
            drill.appendChild(kh);
            drill.appendChild(chipRow(part.kinds,
              k => !!sel.kinds[k.bucketPath],
              k => { sel.kinds[k.bucketPath] = !sel.kinds[k.bucketPath]; renderEntryScreen(); },
              () => Object.keys(sel.kinds).filter(k => sel.kinds[k]).length === 0,
              () => { sel.kinds = {}; renderEntryScreen(); }));
          }
        }
        if (drill.children.length) row.appendChild(drill);
      }
      panel.appendChild(row);
    }

    renderLevelStrip(panel, "grammar");
    appendStart(panel, () => startGrammarSession());
  }

  function buildGrammarClauses() {
    const g = entrySel.grammar;
    const parts = currentEntryParts();
    const clauses = [];
    for (const part of parts) {
      const sel = g.parts && g.parts[part.id];
      if (!sel || !sel.on) continue;
      if (part.kind === "verbs") {
        const chosen = Object.keys(sel.topics).filter(k => sel.topics[k]);
        const list = (g.verbMode === "use") ? part.usageTopics : part.formationTopics;
        const topics = chosen.length ? chosen : list.map(x => x.topic);
        if (topics.length) clauses.push({ topics });
        continue;
      }
      const chosenTopics = Object.keys(sel.topics).filter(k => sel.topics[k]);
      const chosenKinds = Object.keys(sel.kinds).filter(k => sel.kinds[k]);
      if (part.kind === "pronouns" && chosenKinds.length) {
        clauses.push({ topics: ["pronoun"], bucketPaths: chosenKinds });
        const others = chosenTopics.filter(tp => tp !== "pronoun");
        if (others.length) clauses.push({ topics: others });
        continue;
      }
      const topics = chosenTopics.length ? chosenTopics : part.topics.map(x => x.topic);
      if (topics.length) clauses.push({ topics });
    }
    return clauses;
  }
  // Root bucket ids for the current grammar selection, for the competence strip.
  function selectedGrammarRootIds() {
    const clauses = buildGrammarClauses();
    if (!clauses.length) {
      return bucketIndex.roots.map(r => r.id).filter(isGrammarPartRoot);
    }
    const ids = [];
    for (const c of clauses) {
      if (c.bucketPaths && c.bucketPaths.length) ids.push.apply(ids, c.bucketPaths);
      else if (c.topics) ids.push.apply(ids, c.topics);
    }
    return ids;
  }
  function composeGrammarFilter() {
    const clauses = buildGrammarClauses();
    grammarFilter.clauses = clauses.length ? clauses : null;
    grammarFilter.cefrLevels = (Array.isArray(entrySel.cefrLevels) && entrySel.cefrLevels.length) ? entrySel.cefrLevels.slice() : null;
    grammarFilter.cefrRange = null;
    grammarFilter.topic = ""; grammarFilter.cefr = ""; grammarFilter.bucketPath = "";
    grammarDeck = []; grammarIndex = 0;
  }

  function startGrammarSession() {
    composeGrammarFilter();
    saveLastSession("grammar");
    track("session_start", { strand: "grammar", source: "welcome", parts: grammarPartsSummary() });
    renderGrammarFilterBar();
    renderGrammar();
    showStrand("grammar");
  }

  // ---- vocab config (direction + frequency band, via existing vocabFilter) ----
  function renderVocabConfig(panel) {
    const v = entrySel.vocab;
    // Older saved sessions predate these fields.
    if (!Array.isArray(v.rankRanges)) v.rankRanges = [];
    if (!v.lens) v.lens = "numeric";
    if (v.theme == null) v.theme = "";
    if (v.cefr == null) v.cefr = "";
    if (v.catLabel == null) v.catLabel = "";
    if (v.theme && (!v.catIds || !v.catIds.length)) { v.catIds = [v.theme]; v.catLabel = v.theme; v.theme = ""; }  // migrate interim-era selection
    const maxRank = (vocabEntries && vocabEntries.length) ? vocabEntries.length : 18071;
    const setRanges = rr => { v.rankRanges = mergeRankRanges(rr); renderEntryScreen(); };
    const subtractRange = (ranges, s, e) => {
      const out = [];
      for (const r of ranges) {
        if (r.end < s || r.start > e) { out.push(r); continue; }
        if (r.start < s) out.push({ start: r.start, end: s - 1 });
        if (r.end > e) out.push({ start: e + 1, end: r.end });
      }
      return out;
    };
    const covered = (s, e) => v.rankRanges.some(r => r.start <= s && r.end >= e);

    // ---- direction (arrowed labels, Ruling 3) ----
    if (!v.genderDrill) {
      const head = document.createElement("h3");
      head.className = "entry-config-head";
      head.textContent = "Which direction?";
      panel.appendChild(head);
      const dirRow = document.createElement("div");
      dirRow.className = "entry-chip-row";
      dirRow.appendChild(entryChip("Italian \u2192 English", v.direction === "it_en", () => { v.direction = "it_en"; renderEntryScreen(); }, { title: "You see the Italian, type the English" }));
      dirRow.appendChild(entryChip("English \u2192 Italian", v.direction === "en_it", () => { v.direction = "en_it"; renderEntryScreen(); }, { title: "You see the English, type the Italian" }));
      dirRow.appendChild(entryChip("Mix", v.direction === "mix", () => { v.direction = "mix"; renderEntryScreen(); }, { title: "Both directions, shuffled" }));
      panel.appendChild(dirRow);
    }

    // ---- frequency axis: one rank selection, two input lenses (Ruling 1 + v2/v3) ----
    const hFreq = document.createElement("h3");
    hFreq.className = "entry-config-head";
    hFreq.textContent = "How common?";
    panel.appendChild(hFreq);

    const lensRow = document.createElement("div");
    lensRow.className = "entry-lens-toggle";
    lensRow.appendChild(entryChip("By rank", v.lens === "numeric", () => { v.lens = "numeric"; renderEntryScreen(); }, { title: "Pick by frequency rank: presets, a from/to range, or 100-word bands" }));
    lensRow.appendChild(entryChip("By level", v.lens === "cefr", () => { v.lens = "cefr"; renderEntryScreen(); }, { title: "Pick by CEFR level, read from the frequency band registry" }));
    panel.appendChild(lensRow);

    // -- numeric lens --
    const numBlock = document.createElement("div");
    numBlock.className = "entry-lens" + (v.lens === "numeric" ? "" : " lens-dim");
    numBlock.title = v.lens === "numeric" ? "" : "Click to switch to picking by rank";
    const presetRow = document.createElement("div");
    presetRow.className = "entry-chip-row";
    for (const n of [500, 1000, 2000, 5000]) {
      const active = v.rankRanges.length === 1 && v.rankRanges[0].start === 1 && v.rankRanges[0].end === n;
      presetRow.appendChild(entryChip("Top " + n, active, () => {
        v.lens = "numeric"; v.cefr = "";
        setRanges(active ? [] : [{ start: 1, end: n }]);
      }, { title: "The " + n + " most common words" }));
    }
    presetRow.appendChild(entryChip("All", v.rankRanges.length === 0, () => { v.lens = "numeric"; v.cefr = ""; setRanges([]); }, { title: "No frequency restriction" }));
    numBlock.appendChild(presetRow);

    const ftRow = document.createElement("div");
    ftRow.className = "entry-freq-inputs";
    const single = v.rankRanges.length === 1 ? v.rankRanges[0] : null;
    const mkNum = (ph, val) => {
      const inp = document.createElement("input");
      inp.type = "number"; inp.min = "1"; inp.max = String(maxRank);
      inp.placeholder = ph;
      if (val != null) inp.value = String(val);
      return inp;
    };
    const fromInp = mkNum("from", single ? single.start : null);
    const toInp = mkNum("to", single ? single.end : null);
    const applyFromTo = () => {
      v.lens = "numeric"; v.cefr = "";
      const f = parseInt(fromInp.value, 10), t = parseInt(toInp.value, 10);
      const hasF = !isNaN(f) && f > 0, hasT = !isNaN(t) && t > 0;
      if (!hasF && !hasT) { setRanges([]); return; }
      // blank "from" = everything under "to"; blank "to" = from there on up
      const s = hasF ? f : 1, e = hasT ? t : maxRank;
      setRanges([{ start: Math.min(s, e), end: Math.max(s, e) }]);
    };
    fromInp.addEventListener("change", applyFromTo);
    toInp.addEventListener("change", applyFromTo);
    const lblW = document.createElement("span"); lblW.textContent = "words";
    const lblTo = document.createElement("span"); lblTo.textContent = "to";
    ftRow.appendChild(lblW); ftRow.appendChild(fromInp); ftRow.appendChild(lblTo); ftRow.appendChild(toInp);
    numBlock.appendChild(ftRow);

    const bandRow = document.createElement("div");
    bandRow.className = "entry-chip-row entry-band-row";
    for (let b = 1; b <= 901; b += 100) {
      const e = b + 99;
      const on = covered(b, e);
      bandRow.appendChild(entryChip(b + "\u2013" + e, on, () => {
        v.lens = "numeric"; v.cefr = "";
        setRanges(on ? subtractRange(v.rankRanges, b, e) : v.rankRanges.concat([{ start: b, end: e }]));
      }, { title: on ? "Remove this band from the selection" : "Add this band to the selection" }));
    }
    numBlock.appendChild(bandRow);
    numBlock.addEventListener("click", () => { if (v.lens !== "numeric") { v.lens = "numeric"; renderEntryScreen(); } });
    panel.appendChild(numBlock);

    // -- CEFR lens (reads cefr_subbands off the band registry, v3) --
    const cefrBlock = document.createElement("div");
    cefrBlock.className = "entry-lens" + (v.lens === "cefr" ? "" : " lens-dim");
    cefrBlock.title = v.lens === "cefr" ? "" : "Click to switch to picking by level";
    const lvlRow = document.createElement("div");
    lvlRow.className = "entry-chip-row";
    const LEVELS = [["A1","A1"],["A2","A2"],["B1","B1"],["B2","B2"],["C1","C1"],["out_of_scope","Beyond C1"]];
    for (const [tag, label] of LEVELS) {
      const active = v.cefr === tag || v.cefr.indexOf(tag + "-") === 0;
      lvlRow.appendChild(entryChip(label, active, () => {
        v.lens = "cefr"; v.cefr = tag;
        setRanges(vocabCefrSpans(tag));
      }, { title: (() => { const sp = vocabCefrSpans(tag); return sp.length ? "ranks " + sp.map(r => r.start + "\u2013" + r.end).join(", ") : ""; })() }));
    }
    cefrBlock.appendChild(lvlRow);
    const coarse = v.cefr ? v.cefr.split("-")[0] : "";
    if (coarse && coarse !== "out_of_scope") {
      const tierRow = document.createElement("div");
      tierRow.className = "entry-chip-row entry-tier-row";
      tierRow.appendChild(entryChip("whole level", v.cefr === coarse, () => { v.cefr = coarse; setRanges(vocabCefrSpans(coarse)); }, { title: "All bands tagged " + coarse }));
      for (const tier of ["core", "secure", "stretch"]) {
        const tag = coarse + "-" + tier;
        tierRow.appendChild(entryChip(tier, v.cefr === tag, () => { v.cefr = tag; setRanges(vocabCefrSpans(tag)); }, { title: "Bands tagged " + tag }));
      }
      cefrBlock.appendChild(tierRow);
    }
    const cefrNote = document.createElement("p");
    cefrNote.className = "entry-config-hint";
    cefrNote.textContent = "levels come from the frequency band registry; neighbouring levels overlap on purpose";
    cefrBlock.appendChild(cefrNote);
    cefrBlock.addEventListener("click", () => { if (v.lens !== "cefr") { v.lens = "cefr"; renderEntryScreen(); } });
    panel.appendChild(cefrBlock);

    // -- live summary of the whole selection --
    const inSel = e => {
      const t = e.translation_en;
      if (!t || !String(t).trim() || String(t).trim() === "[skip]") return false;
      if (v.rankRanges.length && typeof e.rank === "number" && !v.rankRanges.some(r => e.rank >= r.start && e.rank <= r.end)) return false;
      if (v.catIds && v.catIds.length && (!Array.isArray(e.themes) || !v.catIds.some(id => themeMatchesSelected(e.themes, id)))) return false;
      if (v.genderDrill && e.pos !== "noun") return false;
      return true;
    };
    const nSel = vocabEntries.filter(inSel).length;
    const sum = document.createElement("p");
    sum.className = "entry-vocab-summary";
    const rangeTxt = v.rankRanges.length ? "words " + v.rankRanges.map(r => r.start + "\u2013" + r.end).join(" + ") : "all words";
    sum.textContent = rangeTxt + (v.catLabel ? ", " + v.catLabel : "") + " \u00b7 " + nSel + " in this session";
    panel.appendChild(sum);

    // ---- category axis (Ruling 1): the RATIFIED chip list ----
    // 94 chips in 4 sections per Architecture_Vocab_display_theme_grouping v3
    // (ratified v4). UI shape (Housing's call): grouped-flat - parent chips
    // per section, sub-theme chips revealed by the parent's "..." expander OR
    // automatically when the parent is selected, so subs are pickable from
    // the primary picker AND as drill-in narrowing (Smith's both-ways push).
    // Counts live only in tooltips and the summary line, computed at render.
    {
      const hCat = document.createElement("h3");
      hCat.className = "entry-config-head";
      hCat.textContent = "Which category?";
      panel.appendChild(hCat);
      if (!v._catExpanded) v._catExpanded = {};
      const liveCount = ids => vocabEntries.filter(e => {
        const t = e.translation_en;
        if (!t || !String(t).trim() || String(t).trim() === "[skip]") return false;
        return Array.isArray(e.themes) && ids.some(id => themeMatchesSelected(e.themes, id));
      }).length;
      const pick = chip => {
        if (v.catLabel === chip.label) { v.catIds = null; v.catLabel = ""; }
        else { v.catIds = chip.ids.slice(); v.catLabel = chip.label; }
        renderEntryScreen();
      };
      const allRow = document.createElement("div");
      allRow.className = "entry-chip-row";
      allRow.appendChild(entryChip("All categories", !v.catLabel, () => { v.catIds = null; v.catLabel = ""; renderEntryScreen(); }));
      panel.appendChild(allRow);
      for (const sec of VOCAB_CATEGORY_SECTIONS) {
        const sh = document.createElement("div");
        sh.className = "entry-cat-section";
        sh.textContent = sec.section;
        panel.appendChild(sh);
        const row = document.createElement("div");
        row.className = "entry-chip-row";
        for (const chip of sec.chips) {
          row.appendChild(entryChip(chip.label, v.catLabel === chip.label, () => pick(chip),
            { title: liveCount(chip.ids) + " words" }));
          if (chip.subs && chip.subs.length) {
            const open = !!v._catExpanded[chip.label] || v.catLabel === chip.label
              || chip.subs.some(s => s.label === v.catLabel);
            const ex = entryChip(open ? "\u25be" : "\u2026", false,
              () => { v._catExpanded[chip.label] = !open; renderEntryScreen(); },
              { title: open ? "Hide sub-topics of " + chip.label : "Show sub-topics of " + chip.label });
            ex.classList.add("entry-cat-expander");
            row.appendChild(ex);
            if (open) {
              const subRow = document.createElement("div");
              subRow.className = "entry-chip-row entry-cat-subrow";
              for (const s of chip.subs) {
                subRow.appendChild(entryChip(s.label, v.catLabel === s.label, () => pick(s),
                  { title: liveCount(s.ids) + " words" }));
              }
              row.appendChild(subRow);
            }
          }
        }
        panel.appendChild(row);
      }
    }

    // ---- special drills: a mode, set apart (Ruling 2) ----
    const drills = document.createElement("div");
    drills.className = "entry-special-drills";
    const hDrill = document.createElement("h3");
    hDrill.className = "entry-config-head";
    hDrill.textContent = "Special drills";
    drills.appendChild(hDrill);
    const drillRow = document.createElement("div");
    drillRow.className = "entry-chip-row";
    drillRow.appendChild(entryChip("Gender drill (nouns)", v.genderDrill,
      () => { v.genderDrill = !v.genderDrill; renderEntryScreen(); },
      { title: "Nouns only, producing the Italian with its gender" }));
    drills.appendChild(drillRow);
    const dNote = document.createElement("p");
    dNote.className = "entry-config-hint";
    dNote.textContent = v.genderDrill
      ? "nouns only, producing the Italian (with its article); frequency and category still apply"
      : "changes what the session is, not just which words are in it";
    drills.appendChild(dNote);
    panel.appendChild(drills);

    appendStart(panel, () => startVocabSession());
  }
  function startVocabSession() {
    const v = entrySel.vocab;
    vocabFilter.genderDrill = !!v.genderDrill;
    vocabFilter.direction = v.genderDrill ? "en_it" : v.direction;   // gender drill = production
    // The builder's frequency selection replaces the legacy subBand/topN caps.
    vocabFilter.subBand = "";
    vocabFilter.topN = 0;
    vocabFilter.rankRange = null;
    vocabFilter.rankRanges = (Array.isArray(v.rankRanges) && v.rankRanges.length)
      ? v.rankRanges.map(r => ({ start: r.start, end: r.end })) : null;
    vocabFilter.themes = (v.catIds && v.catIds.length) ? v.catIds.slice() : null;
    vocabFilter.theme = (v.catIds && v.catIds.length === 1) ? v.catIds[0] : "";  // single-id picks light the in-session themes axis
    vocabDeck = []; vocabDeckDirs = []; vocabIndex = 0;
    saveLastSession("vocab");
    track("session_start", { strand: "vocab", source: "welcome", direction: vocabFilter.direction, gender_drill: vocabFilter.genderDrill, lens: v.lens || "numeric", category: v.catLabel || "", ranges: (v.rankRanges || []).map(r => r.start + "-" + r.end).join("+") });
    renderVocab();
    showStrand("vocab");
  }

  // ---- translation config (grammar-point narrowing when available; else just start) ----
  function renderTranslationConfig(panel) {
    const w = entrySel.translation;
    const head = document.createElement("h3");
    head.className = "entry-config-head";
    head.textContent = "Which way?";
    panel.appendChild(head);
    const wayRow = document.createElement("div");
    wayRow.className = "entry-chip-row";
    wayRow.appendChild(entryChip("English \u2192 Italian", w.way === "it", () => { w.way = "it"; renderEntryScreen(); }, { title: "You see the English, produce the Italian" }));
    wayRow.appendChild(entryChip("Italian \u2192 English", w.way === "en", () => { w.way = "en"; renderEntryScreen(); }, { title: "You see the Italian, produce the English" }));
    wayRow.appendChild(entryChip("Both", !w.way, () => { w.way = ""; renderEntryScreen(); }, { title: "A mix of both directions" }));
    panel.appendChild(wayRow);

    const topics = uniqueValues(translationItems, "topic");
    if (topics.length) {
      const h2 = document.createElement("h3");
      h2.className = "entry-config-head";
      h2.textContent = "Narrow by grammar point?";
      panel.appendChild(h2);
      const row = document.createElement("div");
      row.className = "entry-chip-row";
      row.appendChild(entryChip("Any", !w.grammarPoint,
        () => { w.grammarPoint = ""; renderEntryScreen(); }));
      for (const tp of topics) {
        row.appendChild(entryChip(tenseLabel(tp), w.grammarPoint === tp,
          () => { w.grammarPoint = tp; renderEntryScreen(); }));
      }
      panel.appendChild(row);
    }
    renderLevelStrip(panel, "translation");
    appendStart(panel, () => startTranslationSession());
  }
  function startTranslationSession() {
    const gp = entrySel.translation.grammarPoint;
    translationFilter.clauses = gp ? [{ topics: [gp] }] : null;
    translationFilter.cefrLevels = (Array.isArray(entrySel.cefrLevels) && entrySel.cefrLevels.length) ? entrySel.cefrLevels.slice() : null;
    translationFilter.cefrRange = null;
    translationFilter.topic = ""; translationFilter.cefr = ""; translationFilter.bucketPath = "";
    translationFilter.targetLang = entrySel.translation.way || "";
    translationDeck = []; translationIndex = 0;
    saveLastSession("translation");
    track("session_start", { strand: "translation", source: "welcome" });
    renderTranslationFilterBar();
    renderTranslation();
    showStrand("translation");
  }

  // ---- level strip (grammar + translation): availability counts per CEFR band ----
  const _levelCountCache = {};
  function levelCountsFor(strand) {
    let clauses, pool; const extra = {};
    if (strand === "grammar") { clauses = buildGrammarClauses(); pool = grammarQuestions; }
    else {
      const gp = entrySel.translation.grammarPoint;
      clauses = gp ? [{ topics: [gp] }] : []; pool = translationItems;
      if (entrySel.translation.way) extra.targetLang = entrySel.translation.way;
    }
    // pool.length in the signature invalidates the cache when real content loads.
    const sig = strand + "|" + pool.length + "|" + JSON.stringify(clauses) + "|" + JSON.stringify(extra);
    if (_levelCountCache[sig]) return _levelCountCache[sig];
    const filtered = applyFilter(pool, Object.assign({ clauses: clauses.length ? clauses : null }, extra));
    const counts = [0, 0, 0, 0, 0, 0];
    for (const q of filtered) { const i = cefrIndex(q.cefr_level_target); if (i >= 0) counts[i]++; }
    _levelCountCache[sig] = counts;
    return counts;
  }
  // Level selection is a SET (each tap toggles that one level, so tapping
  // three levels leaves three selected) with a range accelerator layered on
  // top: shift-tap, or press one cell and release on another, fills the run.
  // Smith's "we want both" ruling - see inter_chat/
  // Architecture_Housing_entry_load_and_level_strip.md Defect 4 (v2).
  function onLevelTap(i, span) {
    if (!Array.isArray(entrySel.cefrLevels)) entrySel.cefrLevels = [];
    const L = entrySel.cefrLevels;
    const anchor = entrySel._levelAnchor;
    if (span && anchor != null && anchor !== i) {
      const a = Math.min(anchor, i), b = Math.max(anchor, i);
      for (let k = a; k <= b; k++) if (!L.includes(k)) L.push(k);
    } else {
      const at = L.indexOf(i);
      if (at >= 0) L.splice(at, 1); else L.push(i);
    }
    L.sort((x, y) => x - y);
    entrySel._levelAnchor = i;
  }
  function renderLevelStrip(panel, strand) {
    // Shown whenever the pool carries more than one level: level SELECTION
    // needs nothing but the item pool. Only the mastery bars need history,
    // and they gate themselves per band below. (Reverses the first-run gate;
    // inter_chat/Architecture_Housing_entry_load_and_level_strip.md Defect 3.)
    const counts = levelCountsFor(strand);
    const total = counts.reduce((a, b) => a + b, 0);
    if (total === 0) return;
    if (counts.filter(c => c > 0).length < 2) return;  // single-level pool: nothing to choose
    const max = Math.max.apply(null, counts);
    const head = document.createElement("h3");
    head.className = "entry-config-head";
    head.textContent = "Focus on a level?";
    panel.appendChild(head);
    const strip = document.createElement("div");
    strip.className = "entry-level-strip";
    const masteryRoots = (strand === "grammar") ? selectedGrammarRootIds() : null;
    CEFR_ORDER.forEach((lvl, i) => {
      const cell = document.createElement("button");
      cell.type = "button";
      const empty = counts[i] === 0;
      const inSel = Array.isArray(entrySel.cefrLevels) && entrySel.cefrLevels.includes(i);
      cell.className = "entry-level-cell" + (inSel ? " sel" : "") + (empty ? " empty" : "");
      cell.dataset.idx = String(i);
      // Density fill (availability) is always applied; SELECTION is signalled by a
      // contrasting ring + check in .sel, never by the same blue, so a max-density
      // cell can no longer be mistaken for a selected one.
      const alpha = (max > 0 && counts[i] > 0) ? (0.15 + 0.85 * (counts[i] / max)) : 0;
      if (alpha > 0) cell.style.background = "rgba(58,79,138," + alpha.toFixed(2) + ")";
      if (alpha > 0.55) cell.style.color = "#fff";
      cell.innerHTML = '<span class="lvl-name">' + lvl + '</span><span class="lvl-count">' + counts[i] + '</span>';
      // Subordinate 'how you're doing' mastery bar (grammar only, touched bands).
      if (masteryRoots && !empty) {
        const m = masteryForScope(masteryRoots, lvl);
        if (m.hasEvents) {
          const mb = document.createElement("div");
          mb.className = "lvl-mastery";
          mb.title = "how you're doing: " + Math.round(m.correctness * 100) + "%";
          const fill = document.createElement("i");
          fill.style.width = Math.round(m.correctness * 100) + "%";
          fill.style.background = coverageColour(m.correctness, true);
          mb.appendChild(fill);
          cell.appendChild(mb);
        }
      }
      if (empty) cell.disabled = true;
      else cell.addEventListener("click", ev => { onLevelTap(i, ev.shiftKey); renderEntryScreen(); });
      strip.appendChild(cell);
    });
    // Range accelerator, gesture form: press one cell, release on another.
    // elementFromPoint is used because with pointer events touch input gets
    // implicit capture (e.target would stay the pressed cell). A click never
    // fires cross-element, so the toggle cannot double-run.
    let downIdx = null;
    strip.addEventListener("pointerdown", e => {
      const c = e.target && e.target.closest ? e.target.closest(".entry-level-cell") : null;
      downIdx = (c && c.dataset.idx != null) ? Number(c.dataset.idx) : null;
    });
    strip.addEventListener("pointerup", e => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const c = el && el.closest ? el.closest(".entry-level-cell") : null;
      if (c && downIdx != null && Number(c.dataset.idx) !== downIdx) {
        entrySel._levelAnchor = downIdx;
        onLevelTap(Number(c.dataset.idx), true);
        renderEntryScreen();
      }
      downIdx = null;
    });
    panel.appendChild(strip);
  }

  // ---- quick-start shortcuts + resume/mistakes persistence (phase 1) ----
  function missStats() {
    const buckets = new Set(); let n = 0;
    for (const a of (LL.state.attempts || [])) {
      for (const e of (a.events || [])) {
        if (e.outcome === "miss") { n++; buckets.add(e.bucket); }
      }
    }
    return { n, distinct: buckets.size };
  }
  function saveLastSession(strand) {
    if (!LL.state) return;
    LL.state.last_session = { strand, sel: JSON.parse(JSON.stringify(entrySel)) };
    try { LL.store.saveState(LL.state); } catch (e) { /* localStorage may be unavailable */ }
  }
  function resumeLastSession() {
    const ls = LL.state && LL.state.last_session;
    if (!ls) return;
    entrySel = JSON.parse(JSON.stringify(ls.sel));
    // Saved sessions from the range era carry cefrRange; migrate to the set.
    if (Array.isArray(entrySel.cefrRange) && entrySel.cefrRange.length === 2 && !Array.isArray(entrySel.cefrLevels)) {
      entrySel.cefrLevels = [];
      for (let k = entrySel.cefrRange[0]; k <= entrySel.cefrRange[1]; k++) entrySel.cefrLevels.push(k);
      entrySel.cefrRange = null;
    }
    if (!Array.isArray(entrySel.cefrLevels)) entrySel.cefrLevels = [];
    if (ls.strand === "grammar") startGrammarSession();
    else if (ls.strand === "vocab") startVocabSession();
    else startTranslationSession();
  }
  function startMistakesSession() {
    const stats = LL.store.allBucketStats();
    const weak = Object.values(stats)
      .filter(s => s.n > 0 && s.correctness < 1)
      .sort((a, b) => a.combined - b.combined)
      .map(s => s.bucket)
      .slice(0, 10);
    const clause = weak.length ? [{ bucketPaths: weak }] : null;
    // Prefer grammar items touching the weak buckets; fall back to all grammar
    // if none match (e.g. the misses are all vocab-side in this early build).
    track("session_start", { strand: "grammar", source: "mistakes" });
    const test = applyFilter(grammarQuestions, { clauses: clause });
    grammarFilter.clauses = test.length ? clause : null;
    grammarFilter.cefrRange = null;
    grammarFilter.topic = ""; grammarFilter.cefr = ""; grammarFilter.bucketPath = "";
    grammarDeck = []; grammarIndex = 0;
    renderGrammarFilterBar();
    renderGrammar();
    showStrand("grammar");
  }
  function renderQuickStarts(col) {
    const ls = LL.state && LL.state.last_session;
    const ms = missStats();
    const showMistakes = ms.n >= 12 && ms.distinct >= 3;
    if (!ls && !showMistakes) return;
    const wrap = document.createElement("div");
    wrap.className = "entry-quickstarts";
    if (showMistakes) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "entry-quick entry-quick-mistakes";
      b.innerHTML = '<span class="quick-title">Practise your mistakes</span>' +
        '<span class="quick-sub">the words and rules you most often miss</span>';
      b.addEventListener("click", () => startMistakesSession());
      wrap.appendChild(b);
    }
    if (ls) {
      const names = { grammar: "Grammar", translation: "Translation", vocab: "Vocab" };
      const b = document.createElement("button");
      b.type = "button";
      b.className = "entry-quick entry-quick-resume";
      b.innerHTML = '<span class="quick-title">Carry on where you left off</span>' +
        '<span class="quick-sub">' + (names[ls.strand] || "last session") + '</span>';
      b.addEventListener("click", () => resumeLastSession());
      wrap.appendChild(b);
    }
    col.appendChild(wrap);
  }

  // ==================== 2D coverage matrix (topics x CEFR) ====================
  // See inter_chat/Architecture_Housing_coverage_matrix_2d. Shares masteryForScope
  // with the competence strip, so the two are identical in formula and colour.
  let coverageTransposed = false;

  // Coverage colour ramp: white-to-green only, NO red, cream baseline for
  // untouched, intensity capped so black text stays readable. Estate
  // DATA_PRESENTATION rule for coverage grids (red only where negative means
  // bad, which does not apply to "how much / how well"). Used by BOTH the
  // matrix and the competence strip so they match.
  function coverageColour(correctness, hasEvents) {
    if (!hasEvents) return "#f3efe2";
    const c = Math.max(0, Math.min(1, correctness));
    const tt = c * 0.8;
    const r = Math.round(250 + (46 - 250) * tt);
    const g = Math.round(247 + (125 - 247) * tt);
    const b = Math.round(238 + (79 - 238) * tt);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  // Every grammar topic that maps to a (non-vocab) part family, including "More".
  // Previously hardcoded to three, which hid ~17 topics from the matrix.
  function isGrammarPartRoot(id) {
    return overviewCategoryFor(id) !== null;
  }
  function friendlyTopicLabel(id) {
    if (id.indexOf("verb_form.") === 0 || id === "tense_choice") return tenseLabel(id);
    if (id === "pronoun") return "Pronouns";
    if (id === "adjective_agreement") return "Adjectives";
    const b = bucketIndex.byId[id];
    return (b && b.label) ? b.label : prettifyId(id);
  }
  function grammarTopicRows() {
    const roots = bucketIndex.roots.map(r => r.id).filter(isGrammarPartRoot);
    roots.sort((a, b) => {
      const order = overviewCategoryOrder();
      const ca = order.indexOf(overviewCategoryFor(a));
      const cb = order.indexOf(overviewCategoryFor(b));
      if (ca !== cb) return ca - cb;
      return verbCurriculumRank(a) - verbCurriculumRank(b);
    });
    return roots.map(id => ({ id, label: friendlyTopicLabel(id), part: overviewCategoryFor(id) }));
  }

  function showCoverage() {
    document.body.classList.add("coverage-active");
    const el = document.getElementById("coverage-view");
    if (el) el.hidden = false;
    renderCoverage();
  }
  function hideCoverage() {
    document.body.classList.remove("coverage-active");
    const el = document.getElementById("coverage-view");
    if (el) el.hidden = true;
  }
  LL.showCoverage = showCoverage;

  function coverageDrill(topicId, level) {
    const li = CEFR_ORDER.indexOf(level);
    grammarFilter.clauses = [{ topics: [topicId] }];
    grammarFilter.cefrRange = [li, li];
    grammarFilter.topic = ""; grammarFilter.cefr = ""; grammarFilter.bucketPath = "";
    grammarDeck = []; grammarIndex = 0;
    hideCoverage();
    track("coverage_drill", { topic: topicId, level: level });
    renderGrammarFilterBar();
    renderGrammar();
    showStrand("grammar");
  }

  function renderCoverage() {
    const host = document.getElementById("coverage-view");
    if (!host) return;
    host.innerHTML = "";
    const col = document.createElement("div");
    col.className = "coverage-col";

    const bar = document.createElement("div");
    bar.className = "coverage-bar";
    const back = document.createElement("button");
    back.type = "button"; back.className = "coverage-back"; back.textContent = "← Back";
    back.addEventListener("click", () => { hideCoverage(); showEntry(); });
    const title = document.createElement("h2");
    title.className = "coverage-title"; title.textContent = "Your coverage";
    const trBtn = document.createElement("button");
    trBtn.type = "button"; trBtn.className = "coverage-transpose"; trBtn.textContent = "Transpose";
    trBtn.title = "Swap the axes";
    trBtn.addEventListener("click", () => { coverageTransposed = !coverageTransposed; renderCoverage(); });
    bar.appendChild(back); bar.appendChild(title); bar.appendChild(trBtn);
    col.appendChild(bar);

    const sub = document.createElement("p");
    sub.className = "coverage-sub";
    sub.textContent = "Each stripe is one area at that level. Practised ones sink to the bottom and take colour - red through green - so the box fills as you cover the topic. Tap a cell to drill in.";
    col.appendChild(sub);

    const topics = grammarTopicRows();
    const levels = CEFR_ORDER.map(l => ({ level: l, label: l }));
    const rowAxis = coverageTransposed ? levels : topics;
    const colAxis = coverageTransposed ? topics : levels;

    const scroll = document.createElement("div");
    scroll.className = "coverage-scroll" + (coverageTransposed ? " wide" : "");
    const table = document.createElement("table");
    table.className = "coverage-matrix";

    const thead = document.createElement("thead");
    const htr = document.createElement("tr");
    htr.appendChild(document.createElement("th"));
    for (const c of colAxis) {
      const th = document.createElement("th");
      th.textContent = c.label;
      htr.appendChild(th);
    }
    thead.appendChild(htr); table.appendChild(thead);

    const tbody = document.createElement("tbody");
    for (const r of rowAxis) {
      const tr = document.createElement("tr");
      const rh = document.createElement("th");
      rh.className = "coverage-rowhead";
      rh.textContent = r.label;
      tr.appendChild(rh);
      for (const c of colAxis) {
        const topic = coverageTransposed ? c : r;
        const level = coverageTransposed ? r.level : c.level;
        const td = document.createElement("td");
        td.className = "coverage-cell";
        const m = masteryForScope([topic.id], level);
        if (m.empty) {
          td.classList.add("coverage-na");
          td.title = topic.label + " · " + level + ": not in scope at this level";
        } else {
          // One strip per in-scope area, each wearing its OWN state - no
          // aggregation into a single percentage (Smith, 2026-07-18; coverage
          // matrix v5). The box still fills with coverage: untouched areas
          // are faint empty strips, so colour spreading across the box IS
          // the coverage progress.
          const leaves = bucketLeavesInScope([topic.id], level);
          const strips = document.createElement("div");
          // Dense topics (15+ areas at one level) drop the gaps so the stripes
          // compress into contiguous colour bands rather than overflowing.
          strips.className = "coverage-strips" + (leaves.length > 14 ? " dense" : "");
          // HORIZONTAL stripes, sediment order (Smith 2026-07-18, v6):
          // practised areas drop to the BOTTOM of the box so colour pools
          // upward like a fill; unpractised faint stripes float above.
          // Tree order is kept within each band. Colour is rwgColour - the
          // sidebar's red-yellow-green - NOT coverageColour, whose cream-to-
          // green ramp has no red and hid wrong answers entirely.
          const withStats = leaves.map(leaf => ({ leaf, st: aggregateNodeStats(leaf) }));
          const ordered = withStats.filter(x => !x.st).concat(withStats.filter(x => x.st));
          let touched = 0;
          for (const { leaf, st } of ordered) {
            const s = document.createElement("i");
            s.className = "coverage-strip" + (st ? " touched" : "");
            if (st) { s.style.background = rwgColour(st.correctness, true); touched++; }
            s.title = (leaf.label || leaf.id) + " · " + level + ": "
              + (st ? Math.round(st.correctness * 100) + "% (" + st.hits + " hits / " + st.n + " events)" : "not practised yet");
            strips.appendChild(s);
          }
          td.appendChild(strips);
          td.title = topic.label + " · " + level + ": " + touched + "/" + leaves.length + " areas practised";
          td.addEventListener("click", () => coverageDrill(topic.id, level));
        }
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    scroll.appendChild(table);
    col.appendChild(scroll);
    host.appendChild(col);
  }

  function appendStart(panel, onStart) {
    const wrap = document.createElement("div");
    wrap.className = "entry-start-wrap";
    const b = document.createElement("button");
    b.type = "button";
    b.className = "entry-start";
    b.textContent = "Start";
    b.addEventListener("click", onStart);
    wrap.appendChild(b);
    panel.appendChild(wrap);
  }


  // -------------------- bootstrap --------------------
  // Render the build identifier in the footer. Useful for spotting cross-tab
  // version mismatches at a glance.
  (function () {
    const el = document.getElementById("build-version");
    if (el) el.textContent = "build " + LL_BUILD;
  })();

  renderGrammarFilterBar();
  renderTranslationFilterBar();
  renderGrammar();
  renderTranslation();
  renderVocab();
  renderCefr();
  renderMarkerConfig();
  renderSessionCost();
  renderLiveStats();
  LL.contentLoading = true;  // entry screen shows a loading state, never sample-derived counts (entry_load Defect 2)
  showEntry();  // land on the welcome / session builder, not straight into a strand
  {
    // "Serve via http" only makes sense on file://. On an http(s) origin it is a
    // lie that misdirected the diagnosis twice; say we are still loading instead.
    const onFile = (typeof location !== "undefined" && location.protocol === "file:");
    setStatus(`Inline samples (${grammarQuestions.length}G / ${translationItems.length}T / ${allBuckets.length}B).`
      + (onFile ? " Serve via http to load real content." : " Loading real content\u2026"));
  }

  // Try to upgrade to real content
  tryLoadRealContent().then(real => {
    LL.contentLoading = false;
    if (!real) {
      // Fallback settled: the samples ARE the content now and the failure
      // banner explains why. Refresh the entry screen out of its loading state.
      if (document.body.classList.contains("entry-active")) showEntry();
      return;
    }
    // Name any skipped file to the learner instead of skipping it silently.
    if (real.failures && real.failures.length) showPartialLoadBanner(real.failures);
    else clearLoadFailureBanner();
    allBuckets = real.buckets;
    bucketIndex = LL.store.indexBuckets(allBuckets);
    LL.bucketsById = bucketIndex.byId;
    grammarQuestions = real.grammar;
    translationItems = real.translation;
    if (real.parts && Array.isArray(real.parts.parts)) LL.partsConfig = real.parts;
    if (real.vocab && Array.isArray(real.vocab)) {
      vocabEntries = real.vocab;
      LL.vocabEntries = vocabEntries;
      LL._vocabByLemma = null;
      // Index entries so the resolver knows which lemmas are gender-split.
      if (typeof LL.indexEntries === "function") LL.indexEntries(vocabEntries);
      invalidateVocabCaches();
    }
    grammarIndex = 0;
    translationIndex = 0;
    vocabIndex = 0;
    grammarDeck = [];
    translationDeck = [];
    vocabDeck = [];
    renderGrammarFilterBar();
    renderTranslationFilterBar();
    renderGrammar();
    renderTranslation();
    renderVocab();
    renderLiveStats();
    const topicsDesc = real.perTopicCounts
      ? real.perTopicCounts
          .filter(t => !t.bucketsOnly)
          .map(t => {
            // Friendly label rather than the dotted-tail. Look up the topic
            // root in bucketIndex (the chat-authored label field) and fall
            // back to the dotted tail only when absent. See inter_chat/
            // Architecture_Housing_stats_panel_structure.md.
            const rootNode = bucketIndex.byId[t.topic];
            const friendly = (rootNode && rootNode.label) || t.topic.split(".").pop();
            return `${friendly} (${t.grammar}G + ${t.translation}T)`;
          })
          .join(", ")
      : "";
    const vocabBit = vocabEntries.length ? `, ${vocabEntries.length} vocab` : "";
    // Per-topic CONTENT INVENTORY (grammar items + translation items shipped).
    // The right-hand stats panel shows PROGRESS (buckets practised / total).
    // Two surfaces, two distinct measurements, each labelled.
    if (document.body.classList.contains("entry-active")) showEntry();  // refresh derived parts from real content
    setStatus(`Real content: ${grammarQuestions.length} grammar, ${translationItems.length} translation${vocabBit}, ${allBuckets.length} buckets. ${topicsDesc ? "Items per topic: " + topicsDesc : ""}`);
  });

})();
