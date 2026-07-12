  // ---- entry-screen state ----
  let entrySel = null;
  function defaultEntrySel() {
    return {
      strand: null,
      grammar: {
        verbMode: "form",                       // "form" | "use"
        verbs:      { on: false, tenses: {} },  // tenses: { "<topic>": true }
        pronouns:   { on: false, kinds: {} },   // kinds:  { "pronoun.<kind>": true }
        adjectives: { on: false }
      },
      vocab: { direction: "it_en", subBand: "" },
      translation: { grammarPoint: "" },
      cefrRange: null                            // [minIdx, maxIdx] over CEFR_ORDER; set by the level strip (phase 1b)
    };
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
      if (entrySel.strand === "grammar")      renderGrammarConfig(panel);
      else if (entrySel.strand === "vocab")   renderVocabConfig(panel);
      else                                    renderTranslationConfig(panel);
      col.appendChild(panel);
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

    for (const part of parts) {
      const row = document.createElement("div");
      row.className = "entry-part";

      const sel = part.kind === "verbs" ? g.verbs : (part.kind === "pronouns" ? g.pronouns : g.adjectives);

      const tickWrap = document.createElement("button");
      tickWrap.type = "button";
      tickWrap.className = "entry-part-tick" + (sel.on ? " on" : "");
      tickWrap.innerHTML = '<span class="tickbox"></span><span class="entry-part-label">' + part.label + '</span>';
      tickWrap.addEventListener("click", () => { sel.on = !sel.on; renderEntryScreen(); });
      row.appendChild(tickWrap);

      // drill-in (only when ticked)
      if (sel.on && part.kind === "verbs") {
        const drill = document.createElement("div");
        drill.className = "entry-drill";
        // Form / Use toggle
        const modeRow = document.createElement("div");
        modeRow.className = "entry-chip-row";
        modeRow.appendChild(entryChip("Form them", g.verbMode === "form",
          () => { g.verbMode = "form"; renderEntryScreen(); },
          { title: "Produce the verb form" }));
        modeRow.appendChild(entryChip("Use them", g.verbMode === "use",
          () => { g.verbMode = "use"; renderEntryScreen(); },
          { title: "Choose the right tense in context" }));
        drill.appendChild(modeRow);

        const tenseList = g.verbMode === "use" ? part.usageTenses : part.formationTenses;
        if (tenseList.length) {
          const tr = document.createElement("div");
          tr.className = "entry-chip-row";
          tr.appendChild(entryChip("All", Object.keys(g.verbs.tenses).filter(k => g.verbs.tenses[k]).length === 0,
            () => { g.verbs.tenses = {}; renderEntryScreen(); }));
          for (const tn of tenseList) {
            tr.appendChild(entryChip(tn.label, !!g.verbs.tenses[tn.topic],
              () => { g.verbs.tenses[tn.topic] = !g.verbs.tenses[tn.topic]; renderEntryScreen(); }));
          }
          drill.appendChild(tr);
        }
        row.appendChild(drill);
      }
      if (sel.on && part.kind === "pronouns" && part.kinds.length) {
        const drill = document.createElement("div");
        drill.className = "entry-drill";
        const kr = document.createElement("div");
        kr.className = "entry-chip-row";
        kr.appendChild(entryChip("All", Object.keys(g.pronouns.kinds).filter(k => g.pronouns.kinds[k]).length === 0,
          () => { g.pronouns.kinds = {}; renderEntryScreen(); }));
        for (const k of part.kinds) {
          kr.appendChild(entryChip(k.label, !!g.pronouns.kinds[k.bucketPath],
            () => { g.pronouns.kinds[k.bucketPath] = !g.pronouns.kinds[k.bucketPath]; renderEntryScreen(); }));
        }
        drill.appendChild(kr);
        row.appendChild(drill);
      }
      panel.appendChild(row);
    }

    appendStart(panel, () => startGrammarSession());
  }

  function composeGrammarFilter() {
    const g = entrySel.grammar;
    const parts = currentEntryParts();
    const clauses = [];
    if (g.verbs.on) {
      const chosen = Object.keys(g.verbs.tenses).filter(k => g.verbs.tenses[k]);
      let topics;
      if (g.verbMode === "use") {
        const usage = (parts.find(p => p.id === "verbs") || {}).usageTenses || [];
        topics = chosen.length ? chosen : usage.map(x => x.topic);
      } else {
        const formation = (parts.find(p => p.id === "verbs") || {}).formationTenses || [];
        topics = chosen.length ? chosen : formation.map(x => x.topic);
      }
      if (topics.length) clauses.push({ topics });
    }
    if (g.pronouns.on) {
      const kinds = Object.keys(g.pronouns.kinds).filter(k => g.pronouns.kinds[k]);
      clauses.push({ topics: ["pronoun"], bucketPaths: kinds });
    }
    if (g.adjectives.on) clauses.push({ topics: ["adjective_agreement"] });

    grammarFilter.clauses = clauses.length ? clauses : null;
    grammarFilter.cefrRange = entrySel.cefrRange || null;
    grammarFilter.topic = ""; grammarFilter.cefr = ""; grammarFilter.bucketPath = "";
    grammarDeck = []; grammarIndex = 0;
  }

  function startGrammarSession() {
    composeGrammarFilter();
    renderGrammarFilterBar();
    renderGrammar();
    showStrand("grammar");
  }

  // ---- vocab config (direction + frequency band, via existing vocabFilter) ----
  function renderVocabConfig(panel) {
    const v = entrySel.vocab;
    const head = document.createElement("h3");
    head.className = "entry-config-head";
    head.textContent = "See which side?";
    panel.appendChild(head);

    const dirRow = document.createElement("div");
    dirRow.className = "entry-chip-row";
    dirRow.appendChild(entryChip("See Italian", v.direction === "it_en", () => { v.direction = "it_en"; renderEntryScreen(); },
      { title: "Recall the English" }));
    dirRow.appendChild(entryChip("See English", v.direction === "en_it", () => { v.direction = "en_it"; renderEntryScreen(); },
      { title: "Recall the Italian" }));
    panel.appendChild(dirRow);

    const h2 = document.createElement("h3");
    h2.className = "entry-config-head";
    h2.textContent = "How common?";
    panel.appendChild(h2);
    const bandRow = document.createElement("div");
    bandRow.className = "entry-chip-row";
    bandRow.appendChild(entryChip("All", !v.subBand, () => { v.subBand = ""; renderEntryScreen(); }));
    for (const sb of VOCAB_SUBBANDS) {
      bandRow.appendChild(entryChip(sb.id, v.subBand === sb.id, () => { v.subBand = sb.id; renderEntryScreen(); }));
    }
    panel.appendChild(bandRow);

    appendStart(panel, () => startVocabSession());
  }
  function startVocabSession() {
    const v = entrySel.vocab;
    vocabFilter.direction = v.direction;
    vocabFilter.subBand = v.subBand || "";
    if (typeof vocabDeck !== "undefined") { vocabDeck = []; }
    if (typeof vocabIndex !== "undefined") { vocabIndex = 0; }
    renderVocab();
    showStrand("vocab");
  }

  // ---- translation config (grammar-point narrowing when available; else just start) ----
  function renderTranslationConfig(panel) {
    const topics = uniqueValues(translationItems, "topic");
    const head = document.createElement("h3");
    head.className = "entry-config-head";
    head.textContent = "Whole sentences, both ways.";
    panel.appendChild(head);

    if (topics.length) {
      const hint = document.createElement("p");
      hint.className = "entry-config-hint";
      hint.textContent = "narrow to a grammar point, or just start";
      panel.appendChild(hint);
      const row = document.createElement("div");
      row.className = "entry-chip-row";
      row.appendChild(entryChip("Any", !entrySel.translation.grammarPoint,
        () => { entrySel.translation.grammarPoint = ""; renderEntryScreen(); }));
      for (const tp of topics) {
        row.appendChild(entryChip(tenseLabel(tp), entrySel.translation.grammarPoint === tp,
          () => { entrySel.translation.grammarPoint = tp; renderEntryScreen(); }));
      }
      panel.appendChild(row);
    }
    appendStart(panel, () => startTranslationSession());
  }
  function startTranslationSession() {
    const gp = entrySel.translation.grammarPoint;
    translationFilter.clauses = gp ? [{ topics: [gp] }] : null;
    translationFilter.cefrRange = entrySel.cefrRange || null;
    translationFilter.topic = ""; translationFilter.cefr = ""; translationFilter.bucketPath = "";
    translationDeck = []; translationIndex = 0;
    renderTranslationFilterBar();
    renderTranslation();
    showStrand("translation");
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

