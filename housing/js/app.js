/* ============================================================================
   App controller: UI rendering and event wiring.
   ============================================================================ */

(function () {
  "use strict";
  const LL = window.LL || (window.LL = {});

  // Build identifier. Bump when shipping a deploy worth distinguishing in
  // diagnostics. Surfaced in the page footer so two tabs on different builds
  // are visually distinguishable. See inter_chat/Architecture_Housing_cache_busting_and_data_load_messaging.md.
  const LL_BUILD = "2026-06-08-r2";

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

  function applyFilter(arr, filter) {
    return arr.filter(q => {
      if (filter.topic && q.topic !== filter.topic) return false;
      if (filter.cefr && q.cefr_level_target !== filter.cefr) return false;
      if (filter.bucketPath) {
        const buckets = getItemBuckets(q);
        if (!buckets.some(b => bucketUnder(b, filter.bucketPath))) return false;
      }
      return true;
    });
  }

  function setBucketFilter(bucketId) {
    grammarFilter.bucketPath = bucketId;
    translationFilter.bucketPath = bucketId;
    grammarDeck = [];
    translationDeck = [];
    grammarIndex = 0;
    translationIndex = 0;
    renderGrammarFilterBar();
    renderTranslationFilterBar();
    renderGrammar();
    renderTranslation();
  }

  function clearBucketFilter() {
    grammarFilter.bucketPath = "";
    translationFilter.bucketPath = "";
    grammarDeck = [];
    translationDeck = [];
    grammarIndex = 0;
    translationIndex = 0;
    renderGrammarFilterBar();
    renderTranslationFilterBar();
    renderGrammar();
    renderTranslation();
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

  // True when the item carries the suppress flag. Use at pre-answer surfaces.
  function shouldSuppressBucketName(item) {
    return !!(item && item.info_display === "suppress");
  }

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

  function buildBucketFilterBanner(filter) {
    if (!filter.bucketPath) return null;
    const banner = document.createElement("div");
    banner.className = "bucket-filter-banner";
    const node = bucketIndex.byId[filter.bucketPath];
    let label = node ? (node.label || node.id) : filter.bucketPath;
    // Honour info_display: "suppress" — if the in-flight item shares this
    // bucket (or descends from it), show the topic-generic label instead.
    if (LL.inFlightSuppress) {
      const buckets = LL.inFlightSuppress.buckets;
      const filterPath = filter.bucketPath;
      let touches = false;
      buckets.forEach(b => {
        if (b === filterPath || b.startsWith(filterPath + ".")) touches = true;
      });
      if (touches) label = LL.inFlightSuppress.topicLabel;
    }
    banner.innerHTML = `Drilled into: <strong>${escapeHtml(label)}</strong>`;
    banner.title = filter.bucketPath;
    const clearBtn = document.createElement("button");
    clearBtn.className = "clear-btn";
    clearBtn.textContent = "Clear";
    clearBtn.addEventListener("click", clearBucketFilter);
    banner.appendChild(clearBtn);
    return banner;
  }
  function ensureGrammarDeck() {
    const filtered = applyFilter(grammarQuestions, grammarFilter);
    if (grammarDeck.length !== filtered.length) {
      grammarDeck = shuffle(filtered);
    }
  }
  function ensureTranslationDeck() {
    const filtered = applyFilter(translationItems, translationFilter);
    if (translationDeck.length !== filtered.length) {
      translationDeck = shuffle(filtered);
    }
  }
  function uniqueValues(arr, key) {
    const s = new Set();
    for (const x of arr) if (x[key]) s.add(x[key]);
    return Array.from(s).sort();
  }

  function buildFilterBar(strandName, sourceArr, filterObj, onChange) {
    const bar = document.createElement("div");
    bar.innerHTML = "";

    const topics = uniqueValues(sourceArr, "topic");
    const cefrs = uniqueValues(sourceArr, "cefr_level_target");

    const tLabel = document.createElement("label");
    tLabel.textContent = "Topic:";
    bar.appendChild(tLabel);

    const tSel = document.createElement("select");
    const tAny = document.createElement("option");
    tAny.value = ""; tAny.textContent = "any";
    tSel.appendChild(tAny);
    for (const t of topics) {
      const o = document.createElement("option");
      o.value = t; o.textContent = t;
      if (t === filterObj.topic) o.selected = true;
      tSel.appendChild(o);
    }
    tSel.addEventListener("change", () => {
      filterObj.topic = tSel.value;
      onChange();
    });
    bar.appendChild(tSel);

    const cLabel = document.createElement("label");
    cLabel.textContent = "CEFR:";
    bar.appendChild(cLabel);

    const cSel = document.createElement("select");
    const cAny = document.createElement("option");
    cAny.value = ""; cAny.textContent = "any";
    cSel.appendChild(cAny);
    for (const c of cefrs) {
      const o = document.createElement("option");
      o.value = c; o.textContent = c;
      if (c === filterObj.cefr) o.selected = true;
      cSel.appendChild(o);
    }
    cSel.addEventListener("change", () => {
      filterObj.cefr = cSel.value;
      onChange();
    });
    bar.appendChild(cSel);

    const count = document.createElement("span");
    count.className = "filter-count";
    const filtered = applyFilter(sourceArr, filterObj);
    count.textContent = `${filtered.length} of ${sourceArr.length}`;
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
    // Defensive JSON parser. Trailing NUL bytes (and stray CRLFs) on some
    // chat-edited JSON files have been observed causing JSON.parse to throw
    // and the page to silently fall back to inline samples. We trim the
    // trailing junk and warn so we can track whether NULs are still being
    // produced upstream. See inter_chat/Architecture_Housing_atomic_write_nul_padding.md.
    const parseJson = async (path, response) => {
      const raw = await response.text();
      const trimmed = raw.replace(/[\x00\r\n\s]+$/, "");
      if (trimmed.length !== raw.length) {
        const dropped = raw.length - trimmed.length;
        const nulCount = (raw.match(/\x00/g) || []).length;
        console.warn(`[Linguics] ${path}: stripped ${dropped} trailing bytes before parse (${nulCount} NULs).`);
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
          return null;
        }
      } catch (e) {
        logFetchFailure("fetch_error", path, { optional: true, error: String(e) });
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
      const buckets = [];
      const grammar = [];
      const translation = [];
      const perTopicCounts = [];

      for (const topic of topics) {
        const tree = await Foptional(`../data/buckets/${topic}.json`);
        if (!tree) {
          console.warn(`Bucket tree missing for topic '${topic}'; skipping.`);
          continue;
        }
        for (const b of tree) buckets.push(b);

        const isBucketsOnly = BUCKETS_ONLY_TOPICS.has(topic);
        let g = null, t = null;
        if (!isBucketsOnly) {
          g = await Foptional(`../data/grammar_questions_${topic}.json`);
          if (g) for (const q of g) grammar.push(q);
          t = await Foptional(`../data/translation_items_${topic}.json`);
          if (t) for (const it of t) translation.push(it);
        }

        perTopicCounts.push({
          topic,
          buckets: tree.length,
          grammar: g ? g.length : 0,
          translation: t ? t.length : 0,
          bucketsOnly: isBucketsOnly
        });
      }

      // Optional glossary load (separate from the topic loop).
      const glossary = await Foptional("../data/glossary.json");
      if (glossary) {
        LL.glossary = buildGlossaryIndex(glossary);
      }

      // Optional vocabulary frequency list (separate from the topic loop).
      // Used by the vocab strand. Missing file means the vocab tab shows an
      // empty state but everything else still works.
      const vocab = await Foptional("../data/vocabulary_it_frequency.json");

      // Optional themes taxonomy (separate axis on the right-hand heatmap).
      // Missing file means the themes axis is hidden; everything else works.
      const themes = await Foptional("../data/vocab_themes.json");
      if (themes) {
        LL.themesTaxonomy = themes;
      }

      console.info("Loaded per topic:", perTopicCounts);
      return { buckets, grammar, translation, perTopicCounts, vocab, themes };
    } catch (e) {
      console.error("[Linguics] Real content fetch failed; using inline samples. Cause:", e && e.message || e);
      showLoadFailureBanner(e && e.message ? e.message : String(e));
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

  function renderGrammar() {
    const host = document.getElementById("grammar-host");
    host.innerHTML = "";
    if (!grammarQuestions.length) { host.textContent = "No grammar questions loaded."; return; }
    const banner = buildBucketFilterBanner(grammarFilter);
    if (banner) host.appendChild(banner);
    ensureGrammarDeck();
    if (!grammarDeck.length) {
      const empty = document.createElement("div");
      empty.className = "muted";
      empty.style.cssText = "padding:18px;font-style:italic";
      empty.textContent = grammarFilter.bucketPath
        ? "No questions touch this bucket. Clear the bucket filter, or pick a different one."
        : "No questions match the current filter. Loosen the topic or CEFR filter above.";
      host.appendChild(empty);
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
          selectedChoiceIdx = idx;
          choiceButtons.forEach((b, j) => b.classList.toggle("selected", j === idx));
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
    const next = document.createElement("button"); next.className = "secondary"; next.textContent = "Next";
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
      recentlyChangedBuckets = new Set(attempt.events.map(e => e.bucket));
      // Post-answer surfaces are unaffected by info_display: "suppress",
      // so clear the in-flight hint before re-rendering the live panel.
      clearInFlightSuppress();
      resultHost.innerHTML = "";
      resultHost.appendChild(renderResult(result));
      renderLiveStats();
      marked = true;
      // Deferring focus past the current event-loop tick is more reliable
      // across browsers than calling synchronously inside a keydown handler.
      setTimeout(() => next.focus(), 0);
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

      // Second-chance guard (see inter_chat/Architecture_Housing_second_chance_on_chip_mismatch.md).
      // Triggers only when:
      //   - the item is short-answer (not MCQ),
      //   - we haven't already prompted this item,
      //   - the outcome is a clean miss (zero marks),
      //   - no must_not_include / hint matched (the learner's specific wrong
      //     form isn't a recognised wrong; they may have answered a different
      //     question than the one asked), AND
      //   - the chip has an extractable lemma AND the answer's stem doesn't
      //     overlap the lemma's stem.
      if (!isMcq && !secondChanceShown) {
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
        grammarDeck = shuffle(grammarQuestions);
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
    if (input) setTimeout(() => input.focus(), 0);
    else if (choiceButtons.length) setTimeout(() => choiceButtons[0].focus(), 0);
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
    const tbanner = buildBucketFilterBanner(translationFilter);
    if (tbanner) host.appendChild(tbanner);
    ensureTranslationDeck();
    if (!translationDeck.length) {
      const empty = document.createElement("div");
      empty.className = "muted";
      empty.style.cssText = "padding:18px;font-style:italic";
      empty.textContent = translationFilter.bucketPath
        ? "No items touch this bucket. Clear the bucket filter, or pick a different one."
        : "No items match the current filter. Loosen the topic or CEFR filter above.";
      host.appendChild(empty);
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
    const next = document.createElement("button"); next.className = "secondary"; next.textContent = "Next";
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
      if (costLine) resultHost.appendChild(costLine);
      renderLiveStats();
      next.focus();
    };
    const doNext = () => {
      translationIndex++;
      if (translationIndex >= translationDeck.length) {
        translationDeck = shuffle(translationItems);
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
    setTimeout(() => textarea.focus(), 0);
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
  let vocabIndex = 0;
  let vocabFilter = {
    band: "",
    direction: "it_en",
    theme: "",
    genderClass: "",
    rankRange: null,
    drillLevel: null,   // null | "thousand" | "hundred" | "ten"
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
        if (!Array.isArray(v.themes) || !v.themes.includes(vocabFilter.theme)) return false;
      }
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
    [["it_en", "Italian → English"], ["en_it", "English → Italian"]].forEach(([v, t]) => {
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
    const isItEn = vocabFilter.direction === "it_en";

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
    nextBtn.textContent = "Next";
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
      nextBtn.focus();
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
    setTimeout(() => input.focus(), 0);
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
      val.className = "cmp-value cmp-learner";
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
      setTimeout(scrollToFreshBuckets, 80);
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

  function renderLiveOverview() {
    const host = document.getElementById("live-overview");
    if (!host) return;
    host.innerHTML = "";
    for (const root of bucketIndex.roots) {
      host.appendChild(renderOverviewCell(root));
    }
  }

  function renderOverviewCell(root) {
    const stats = aggregateNodeStats(root);
    const hasEvents = !!stats;
    const cell = document.createElement("div");
    cell.className = "overview-cell";
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
    // Always show the hits/events count, even at 0/0, so the user can tell
    // "no progress yet" from "this tile is broken" (Issue 4, 2026-05-29).
    meta.textContent = hasEvents ? `${stats.hits}/${stats.n}` : "0/0";
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
    return label + summary + desc + "\n\nClick to filter the deck to this.";
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

  function scrollToFreshBuckets() {
    const fresh = document.querySelector("#live-stats-content .live-bucket-row.fresh");
    if (fresh) fresh.scrollIntoView({ behavior: "smooth", block: "center" });
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
    if (hasEvents && recentlyChangedBuckets.has(node.id)) row.classList.add("fresh");
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
  showStrand("grammar");
  setStatus(`Inline samples (${grammarQuestions.length}G / ${translationItems.length}T / ${allBuckets.length}B). Serve via http to load real content.`);

  // Try to upgrade to real content
  tryLoadRealContent().then(real => {
    if (!real) return;
    clearLoadFailureBanner();
    allBuckets = real.buckets;
    bucketIndex = LL.store.indexBuckets(allBuckets);
    LL.bucketsById = bucketIndex.byId;
    grammarQuestions = real.grammar;
    translationItems = real.translation;
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
          .map(t => `${t.topic.split(".").pop()} ${t.grammar}G+${t.translation}T`)
          .join(", ")
      : "";
    const vocabBit = vocabEntries.length ? `, ${vocabEntries.length} vocab` : "";
    // Item counts per topic (grammar items + translation items). Separate
    // from the live-stats topic-tile counts in the right panel, which are
    // hits/events (Issue 7, 2026-05-29).
    setStatus(`Real content: ${grammarQuestions.length} grammar, ${translationItems.length} translation${vocabBit}, ${allBuckets.length} buckets. ${topicsDesc ? "Item counts per topic: " + topicsDesc : ""}`);
  });

})();
