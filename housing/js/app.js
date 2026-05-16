/* ============================================================================
   App controller: UI rendering and event wiring.
   ============================================================================ */

(function () {
  "use strict";
  const LL = window.LL || (window.LL = {});

  LL.state = LL.store.loadState();
  // Note: these are `let` so the fetch-loader can replace them with real content.
  let allBuckets = window.LL_BUCKETS || [];
  let bucketIndex = LL.store.indexBuckets(allBuckets);
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

  function buildBucketFilterBanner(filter) {
    if (!filter.bucketPath) return null;
    const banner = document.createElement("div");
    banner.className = "bucket-filter-banner";
    const node = bucketIndex.byId[filter.bucketPath];
    const label = node ? (node.label || node.id) : filter.bucketPath;
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
    const F = async (path) => {
      const r = await fetch(path);
      if (!r.ok) throw new Error(`${path}: ${r.status}`);
      return r.json();
    };
    const Foptional = async (path) => {
      try { const r = await fetch(path); return r.ok ? await r.json() : null; }
      catch (e) { return null; }
    };
    try {
      // 1. Load the manifest listing known topics
      const manifest = await F("../data/manifest.json");
      const topics = manifest.topics || [];
      if (!topics.length) throw new Error("manifest has no topics");

      // 2. For each topic, fetch the bucket tree (required) and any content
      //    files (all optional; missing files don't fail the load).
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

        const g = await Foptional(`../data/grammar_questions_${topic}.json`);
        if (g) for (const q of g) grammar.push(q);

        const t = await Foptional(`../data/translation_items_${topic}.json`);
        if (t) for (const it of t) translation.push(it);

        perTopicCounts.push({
          topic,
          buckets: tree.length,
          grammar: g ? g.length : 0,
          translation: t ? t.length : 0
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

      console.info("Loaded per topic:", perTopicCounts);
      return { buckets, grammar, translation, perTopicCounts, vocab };
    } catch (e) {
      console.info("Real content fetch failed; using inline samples.", e.message || e);
      return null;
    }
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

  // Provisional colour scheme for the overview cells and nested coverage:
  // - cream/bg when no events at all (untouched)
  // - red at 0% correct, white at 30%, green at 100%, linearly interpolated
  // The 30% midpoint and the red endpoint are placeholders; expect this to
  // change once we have real-attempt data to calibrate.
  const RWG_RED = [194, 65, 65];
  const RWG_WHITE = [255, 255, 255];
  const RWG_GREEN = [46, 125, 79];
  const RWG_MIDPOINT = 0.3;

  function interpRGB(a, b, t) {
    return `rgb(${Math.round(a[0]+(b[0]-a[0])*t)}, ${Math.round(a[1]+(b[1]-a[1])*t)}, ${Math.round(a[2]+(b[2]-a[2])*t)})`;
  }

  function rwgColour(correctness, hasEvents) {
    if (!hasEvents) return "var(--bg)";
    const c = Math.max(0, Math.min(1, correctness));
    if (c <= RWG_MIDPOINT) {
      return interpRGB(RWG_RED, RWG_WHITE, c / RWG_MIDPOINT);
    } else {
      return interpRGB(RWG_WHITE, RWG_GREEN, (c - RWG_MIDPOINT) / (1 - RWG_MIDPOINT));
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

    const input = document.createElement("input");
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

    const actions = document.createElement("div");
    actions.className = "actions";
    const mark = document.createElement("button"); mark.textContent = "Mark";
    const next = document.createElement("button"); next.className = "secondary"; next.textContent = "Next";
    const hint = document.createElement("span"); hint.className = "kbd-hint";
    hint.textContent = "Enter to mark · Enter again to advance";
    actions.appendChild(mark); actions.appendChild(next); actions.appendChild(hint);
    card.appendChild(actions);

    const resultHost = document.createElement("div");
    card.appendChild(resultHost);

    const doMark = () => {
      const raw = input.value;
      const result = LL.markGrammar(q, raw);
      appendVocabHelpEvents(result, vocabHelpsUsed);
      appendActiveProductionHits(result, vocabHelpsUsed, q, raw);
      const attempt = LL.store.recordAttempt("grammar", q, raw, result);
      recentlyChangedBuckets = new Set(attempt.events.map(e => e.bucket));
      resultHost.innerHTML = "";
      resultHost.appendChild(renderResult(result));
      renderLiveStats();
      next.focus();
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

    input.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doMark(); }
    });
    next.addEventListener("keydown", e => {
      if (e.key === "Enter") { e.preventDefault(); doNext(); }
    });

    host.appendChild(card);
    setTimeout(() => input.focus(), 0);
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

      appendVocabHelpEvents(result, vocabHelpsUsed);
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
  let vocabFilter = { band: "", direction: "it_en" };
  let vocabInputRef = null;

  function filteredVocabEntries() {
    return vocabEntries.filter(v => !vocabFilter.band || v.band === vocabFilter.band);
  }

  function ensureVocabDeck() {
    if (!vocabDeck.length || vocabIndex >= vocabDeck.length) {
      vocabDeck = shuffle(filteredVocabEntries());
      vocabIndex = 0;
    }
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
      renderVocab();
    });
    host.appendChild(dirSel);

    // Frequency band filter
    const bands = Array.from(new Set(vocabEntries.map(v => v.band).filter(Boolean))).sort();
    if (bands.length) {
      const bLabel = document.createElement("label");
      bLabel.textContent = "Band:";
      host.appendChild(bLabel);
      const bSel = document.createElement("select");
      const anyOpt = document.createElement("option");
      anyOpt.value = ""; anyOpt.textContent = "any";
      bSel.appendChild(anyOpt);
      bands.forEach(b => {
        const o = document.createElement("option");
        o.value = b; o.textContent = bandFriendly(b);
        if (vocabFilter.band === b) o.selected = true;
        bSel.appendChild(o);
      });
      bSel.addEventListener("change", () => {
        vocabFilter.band = bSel.value;
        vocabDeck = []; vocabIndex = 0;
        renderVocab();
      });
      host.appendChild(bSel);
    }

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

    const prompt = document.createElement("div");
    prompt.className = "prompt";
    if (isItEn) {
      const strong = document.createElement("strong");
      strong.textContent = entry.lemma;
      prompt.appendChild(document.createTextNode("What does "));
      prompt.appendChild(strong);
      prompt.appendChild(document.createTextNode(" mean?"));
    } else {
      const strong = document.createElement("strong");
      strong.textContent = entry.translation_en;
      prompt.appendChild(document.createTextNode("What's the Italian for "));
      prompt.appendChild(strong);
      prompt.appendChild(document.createTextNode("?"));
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
      const result = markVocab(entry, raw, isItEn);
      const syntheticItem = { id: "vocab_" + (entry.rank || entry.lemma) + "_" + (isItEn ? "ie" : "ei"), prompt: prompt.textContent };
      const attempt = LL.store.recordAttempt("vocab", syntheticItem, raw, result);
      recentlyChangedBuckets = new Set(attempt.events.map(e => e.bucket));
      resultHost.innerHTML = "";
      resultHost.appendChild(renderResult(result));
      renderLiveStats();
      nextBtn.focus();
    };
    const doNext = () => {
      vocabIndex++;
      if (vocabIndex >= vocabDeck.length) {
        vocabDeck = shuffle(filteredVocabEntries());
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
  }

  function focusVocabInput() { if (vocabInputRef) vocabInputRef.focus(); }

  // Normalised compare for vocab translation answers. Accepts comma- or
  // semicolon-separated alternatives in the target. Tolerates a leading
  // "to " on verb infinitives. Case-insensitive, punctuation-stripped.
  function vocabAcceptable(answer, target) {
    const norm = s => String(s || "").trim().toLowerCase().replace(/[.,;!?"'()\[\]]/g, "").replace(/\s+/g, " ").trim();
    const a = norm(answer);
    if (!a) return false;
    const alternatives = String(target || "").split(/[,;\/]/).map(norm).filter(Boolean);
    for (const alt of alternatives) {
      if (a === alt) return true;
      // Allow learner to omit a leading "to" on verbs
      if (alt.startsWith("to ") && a === alt.slice(3)) return true;
      if (a.startsWith("to ") && alt === a.slice(3)) return true;
    }
    return false;
  }

  function markVocab(entry, raw, isItEn) {
    const translationBucket = `vocabulary.it.${entry.lemma}.translation`;
    const translationLabel = `${entry.lemma} (translation)`;
    const trimmed = String(raw || "").trim();
    const target = isItEn ? entry.translation_en : entry.lemma;
    // renderResult expects result.overall.{marks_awarded,marks_possible,summary}
    // not result.score/max_score, so use the canonical shape.
    const result = {
      overall: { marks_awarded: 0, marks_possible: 1, summary: "" },
      raw_response: raw,
      markpoints: []
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
    const ok = vocabAcceptable(raw, target);
    if (ok) {
      result.overall.marks_awarded = 1;
      result.overall.summary = "Right";
      result.markpoints.push({
        bucket: translationBucket,
        label: translationLabel,
        attempted_credit: 1,
        correctness_credit: 1,
        outcome: "hit",
        evidence: "matched: " + raw,
        expected: target
      });
      // Also fire on the frequency-band bucket so the band signal fills.
      if (entry.band) {
        result.markpoints.push({
          bucket: entry.band,
          label: "Frequency band " + bandFriendly(entry.band),
          attempted_credit: 1,
          correctness_credit: 1,
          outcome: "hit",
          evidence: "right on " + entry.lemma,
          source: "band_rollup"
        });
      }
    } else {
      result.overall.summary = "Wrong";
      result.markpoints.push({
        bucket: translationBucket,
        label: translationLabel,
        attempted_credit: 1,
        correctness_credit: 0,
        outcome: "miss",
        evidence: "you wrote: " + raw,
        expected: target
      });
      if (entry.band) {
        result.markpoints.push({
          bucket: entry.band,
          label: "Frequency band " + bandFriendly(entry.band),
          attempted_credit: 1,
          correctness_credit: 0,
          outcome: "miss",
          evidence: "miss on " + entry.lemma,
          source: "band_rollup"
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

    const segments = segmentPrompt(promptText);

    // Single segment: render as a plain block, preserving lemma-click behaviour.
    if (segments.length <= 1) {
      renderTextWithLemmas(div, promptText, lemmaMap, item, vocabHelpsUsedRef);
      return div;
    }

    // Multi-segment: each on its own line, styled by kind.
    for (const seg of segments) {
      const block = document.createElement("div");
      block.className = "prompt-segment prompt-" + seg.kind;
      if (seg.kind === "italian") {
        renderTextWithLemmas(block, seg.text, lemmaMap, item, vocabHelpsUsedRef);
      } else if (seg.kind === "cue") {
        block.textContent = "(" + seg.text + ")";
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
      const prev = i > 0 ? text[i - 1] : " ";
      const next = i < len - 1 ? text[i + 1] : "";
      if (mode === "english" && (c === "'" || c === '"') && /\s|^/.test(prev) && /\S/.test(next)) {
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
      if (mode === "english" && c === "(" && /\s|^/.test(prev)) {
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
  function appendVocabHelpEvents(result, vocabHelpsUsedRef) {
    if (!vocabHelpsUsedRef.length) return;
    for (const h of vocabHelpsUsedRef) {
      result.markpoints.push({
        bucket: h.bucket,
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
    for (const entry of item.vocab_help) {
      if (!entry.aspects || !entry.lemma) continue;
      if (!lemmaProducedInAnswer(entry.lemma, rawAnswer)) continue;
      // Skip if the lemma was visible in the prompt. The learner saw it; they
      // didn't have to retrieve it from their own knowledge.
      if (visibleText && lemmaProducedInAnswer(entry.lemma, visibleText)) continue;
      for (const [aspect, def] of Object.entries(entry.aspects)) {
        if (usedBuckets.has(def.bucket)) continue;
        result.markpoints.push({
          bucket: def.bucket,
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

      // Friendly outcome word.
      const friendly = friendlyOutcome(mp);
      const status = document.createElement("div");
      status.className = "outcome-status " + friendly.cls;
      status.textContent = friendly.word;
      status.title = `attempted=${mp.attempted_credit}, correctness=${mp.correctness_credit ?? "n/a"}, outcome=${mp.outcome}`;
      detail.appendChild(status);

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
        if (hasEvidence && mp.outcome !== "not_attempted") {
          const r1 = document.createElement("div");
          r1.className = "cmp-row";
          r1.innerHTML = `<span class="cmp-label">You wrote:</span> <span class="cmp-value cmp-learner">${escapeHtml(evidenceText)}</span>`;
          cmp.appendChild(r1);
        }
        if (hasExpected) {
          const r2 = document.createElement("div");
          r2.className = "cmp-row";
          r2.innerHTML = `<span class="cmp-label">Right answer:</span> <span class="cmp-value cmp-correct">${escapeHtml(mp.expected)}</span>`;
          cmp.appendChild(r2);
        }
        detail.appendChild(cmp);
      } else if (mp.outcome === "hit" && hasEvidence) {
        const e = document.createElement("div");
        e.className = "evidence";
        e.textContent = `Matched: ${evidenceText}`;
        detail.appendChild(e);
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
    const correctness = attempted > 0 ? correct / attempted : 0;
    const hits = events.filter(e => e.ev.outcome === "hit").length;
    return {
      n, attempted, correct, hits,
      attempted_rate,
      correctness,
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
    cell.addEventListener("click", () => setBucketFilter(root.id));

    const header = document.createElement("div");
    header.className = "overview-header";
    const lbl = document.createElement("div");
    lbl.className = "overview-label";
    lbl.textContent = root.label || root.id;
    header.appendChild(lbl);
    const meta = document.createElement("div");
    meta.className = "overview-meta";
    meta.textContent = hasEvents ? `${stats.hits}/${stats.n}` : "";
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
      summary = `\n${stats.hits} right of ${stats.n} (${pct}%)`;
    } else {
      summary = "\nNo events yet";
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
    row.title = node.id + (node.description ? "\n\n" + node.description : "");

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
    lbl.textContent = "AI marker: ";
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
    allBuckets = real.buckets;
    bucketIndex = LL.store.indexBuckets(allBuckets);
    grammarQuestions = real.grammar;
    translationItems = real.translation;
    if (real.vocab && Array.isArray(real.vocab)) {
      vocabEntries = real.vocab;
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
      ? real.perTopicCounts.map(t => `${t.topic.split(".").pop()} ${t.grammar}/${t.translation}`).join(", ")
      : "";
    const vocabBit = vocabEntries.length ? `, ${vocabEntries.length} vocab` : "";
    setStatus(`Real content: ${grammarQuestions.length} grammar, ${translationItems.length} translation${vocabBit}, ${allBuckets.length} buckets. ${topicsDesc ? "Per topic: " + topicsDesc : ""}`);
  });

})();
