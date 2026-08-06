/* ============================================================================
   Engine axes: pure derivations with no DOM and no app state.

   Extracted from app.js 2026-08-03 so they can be TESTED. Both were written
   inside the 480k-character render file, where nothing can reach them except
   the app itself - and both derive facts the analysis surfaces depend on
   (which tense the learner reached for; which kind of accent error they made).
   Logic that decides what gets recorded should not be reachable only by
   booting the whole UI.

   Loaded before app.js. Everything here is exposed on LL and called as
   LL.<name> from app.js, the bench and housing/selftest.html.
   ============================================================================ */

(function () {
  "use strict";
  const LL = window.LL || (window.LL = {});

  // ---------------------------------------------------------------------
  // Chosen-tense inference. MisconceptionAnalyst_Housing_bespoke_grid_specs
  // (Grid A6) needs the tense the learner REACHED FOR, not just whether they
  // were right. Architecture ratified reading it off the produced form.
  //
  // Compound tenses are auxiliary + past participle, so those are detected
  // first: the auxiliary's own tense decides which compound it is. Simple
  // tenses come straight from the form's readings. In both cases the reading is
  // intersected with the ITEM's candidate_tenses; anything that does not resolve
  // to exactly one candidate returns null, because a wrong guess here would
  // write a false confusion into the matrix, which is worse than a gap.
  // ---------------------------------------------------------------------
  const AUX_TO_COMPOUND = {
    present: "passato_prossimo",
    imperfect: "trapassato_prossimo",
    future: "futuro_anteriore",
    condizionale: "condizionale_passato",
    congiuntivo_presente: "congiuntivo_passato",
    congiuntivo_imperfetto: "congiuntivo_trapassato",
    passato_remoto: "trapassato_remoto",
  };
  LL.inferChosenTense = function (raw, candidates) {
    const vt = LL.verbTenseForms;
    if (!vt || !vt.simple || !Array.isArray(candidates) || !candidates.length) return null;
    const cand = new Set(candidates);
    const words = String(raw || "").toLowerCase()
      .split(/[^a-zà-ÿ']+/).filter(Boolean);
    if (!words.length) return null;
    const parts = new Set(vt.participles || []);
    // Learners type without accents, so every lookup is tried accent-folded
    // too ("c e stato" must find the auxiliary "è").
    const fold = w => w.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const look = (table, w) => {
      if (!table) return null;
      if (table[w]) return table[w];
      const f = fold(w);
      if (table[f]) return table[f];
      for (const k in table) if (fold(k) === f) return table[k];
      return null;
    };
    // The participle list only covers the verbs these items cue, so a learner
    // reaching for any other verb ("ho mangiato") would miss the compound
    // reading entirely. Fall back to Italian participle morphology.
    const looksParticiple = w =>
      parts.has(w) || parts.has(fold(w)) || /(?:ato|ito|uto|sto|tto|sso|nto|rto|lto|so|to)$/.test(w);

    // 1. compound: an auxiliary followed (anywhere later) by a past participle
    for (let i = 0; i < words.length; i++) {
      const auxReadings = look(vt.aux, words[i]);
      if (!auxReadings) continue;
      let hasPart = false;
      for (let j = i + 1; j < words.length; j++) if (looksParticiple(words[j])) { hasPart = true; break; }
      if (!hasPart) continue;
      const compounds = [];
      for (const code of String(auxReadings)) {
        const c = AUX_TO_COMPOUND[(vt.codes && vt.codes[code]) || code];
        if (c && cand.has(c) && compounds.indexOf(c) < 0) compounds.push(c);
      }
      if (compounds.length === 1) return compounds[0];
    }

    // 2. simple: every word's readings, intersected with the candidate set
    const hits = [];
    for (const w of words) {
      const rs = look(vt.simple, w);
      if (!rs) continue;
      for (const code of String(rs)) {
        const r = (vt.codes && vt.codes[code]) || code;
        if (cand.has(r) && hits.indexOf(r) < 0) hits.push(r);
      }
    }
    return hits.length === 1 ? hits[0] : null;
  };

  // ---------------------------------------------------------------------
  // Accent event axes. inter_chat/Architecture_Housing_accent_stress_and_new_qtypes.md
  // section 1: every accent attempt reports accent_type x placement_class x
  // outcome, and the OUTCOME decides the leaf - not the item's declared bucket.
  // ---------------------------------------------------------------------
  // A JUDGEMENT item asks "is this form spelled correctly?" - its choices are a
  // verdict ("Correct" / "Incorrect"), not two spellings of a word. There is no
  // accent difference between the choices to classify, so it is not a
  // wrong-mark, an omission or an insertion; it is a failure to RECOGNISE.
  //
  // This was found by housing/selftest.html on its first run. 158 of the 301
  // accent distractors - over half - are judgement choices, and they were all
  // falling through accentDiff (correctly returning null) onto the wrong_kind
  // DEFAULT. So they were recorded under .wrong_mark, a leaf none of them
  // belongs to, and once docking landed they earned 0.8 for getting a two-way
  // question wrong. A default dressed as a derivation, which is the exact fault
  // r107 fixed for the tagged half.
  function isJudgementChoiceSet(choices) {
    if (!Array.isArray(choices) || choices.length < 2) return false;
    const norm = c => String(c || "").trim().toLowerCase();
    return choices.every(c => /^(in)?correct$/.test(norm(c)) || /^(right|wrong|yes|no)$/.test(norm(c)));
  }
  const ACCENT_OUTCOME_LEAF = {
    omitted: "missing",       // knew a mark was needed, left it off
    wrong_kind: "wrong_mark", // grave for acute, or the reverse
    inserted: "added",        // put a mark where none belongs
  };
  const ACCENT_MARK_KIND = {
    "à": "grave", "è": "grave", "ì": "grave", "ò": "grave", "ù": "grave",
    "á": "acute", "é": "acute", "í": "acute", "ó": "acute", "ú": "acute",
  };
  function accentBase(ch) {
    return String(ch).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  }
  // Compare the correct spelling with the one picked and report the vowel that
  // carries the disagreement, plus the mark expected and the mark written.
  // Returns null when the two differ by something that is not an accent.
  function accentDiff(expected, written) {
    const e = String(expected || ""), w = String(written || "");
    const eb = accentBase(e), wb = accentBase(w);
    if (eb !== wb) return null;              // not an accent difference at all
    for (let i = 0; i < e.length && i < w.length; i++) {
      const ec = e[i], wc = w[i];
      if (ec === wc) continue;
      const expectedMark = ACCENT_MARK_KIND[ec.toLowerCase()] || "none";
      const writtenMark = ACCENT_MARK_KIND[wc.toLowerCase()] || "none";
      if (expectedMark === writtenMark) continue;
      return {
        vowel: accentBase(ec),
        expected_mark: expectedMark,
        written_mark: writtenMark,
        expected_char: ec,
        written_char: wc,
      };
    }
    return null;
  }
  // The outcome class, preferring the author's own tag and falling back to the
  // string diff so an untagged distractor still lands on the right leaf.
  function accentOutcomeClass(q, pickedIdx, correct) {
    if (correct) return "correct";
    // Tag-first, even on judgement items (seed_frames Defect 4, v7 ask c): an
    // endorsed error-form carries that error's class in choice_tags, so the
    // miss can emit a real outcome event despite crediting 0. Untagged
    // judgement misses (all 158 until the regen lands) keep the flat
    // "judgement" class and today's behaviour.
    const tag = Array.isArray(q.choice_tags) ? q.choice_tags[pickedIdx] : null;
    if (tag && tag.class && ACCENT_OUTCOME_LEAF[tag.class]) return tag.class;
    if (isJudgementChoiceSet(q.choices)) return "judgement";
    const d = accentDiff(q.choices[q.answer_index], q.choices[pickedIdx]);
    if (!d) return "wrong_kind";
    if (d.written_mark === "none") return "omitted";
    if (d.expected_mark === "none") return "inserted";
    return "wrong_kind";
  }
  function accentPlacementClass(q) {
    const st = String(q.subtopic || "");
    // The regen (seed_frames Defect 1, gate posted 2026-08-03) moved subtopic
    // to the FULL placement id; the seed era used accent.<class>. Normalise
    // both to the bare class so the dock table's severe-omission test and the
    // axes key on one form regardless of data era.
    const FULL = "orthography.accent.italian.placement.";
    if (st.indexOf(FULL) === 0) return st.slice(FULL.length);
    return st.indexOf("accent.") === 0 ? st.slice(7) : (st || "unclassified");
  }
  // Rewrite the result so the leaf reflects what the learner ACTUALLY did, and
  // attach the three axes for the reports to group on.
  // Accent DOCKING. Smith reversed the old never-dock/0.9-flat policy in the
  // design-overhaul reconciliation: a wrong-KIND slip (grave where acute was
  // wanted, or the reverse) docks 0.2, an OMISSION docks about half, correct is
  // full marks. So an accent item is no longer pass/fail - the severity of the
  // error decides the credit, which is only possible now that r107 classifies
  // the outcome instead of firing the item's declared bucket regardless.
  //
  // `inserted` RULED 0.5 (design_overhaul v3/v4 + seed_frames v6/v7): the
  // scale measures whether the error can change the word, not how many marks
  // were typed. Presence and absence are lexical (e -> è, da -> dà land on a
  // different real word, in either direction), so omitted and inserted dock
  // alike at 0.5; placement and mark-type slips are orthographic, 0.8.
  // Omissions on meaning_pair / tense_bearing items dock 0.4 (seed_frames
  // ruled table) - the slip that lands on a different word or tense.
  // No entry for "judgement": a binary right-or-wrong question docks nothing,
  // it simply scores 0 when wrong. Smith's docking scale grades the SEVERITY of
  // a produced accent error; a two-way judgement has no severity to grade, and
  // paying 0.8 for a coin-flip would be the tail wagging the dog.
  const ACCENT_DOCK = { correct: 1, wrong_kind: 0.8, inserted: 0.5, omitted: 0.5 };
  function applyAccentAxes(q, pickedIdx, result) {
    if (!result || !Array.isArray(result.markpoints)) return result;
    const correct = pickedIdx === q.answer_index;
    const outcome = accentOutcomeClass(q, pickedIdx, correct);
    const placement = accentPlacementClass(q);
    const diff = accentDiff(q.choices[q.answer_index], q.choices[pickedIdx]);
    const axes = {
      accent_type: diff ? diff.vowel : null,
      expected_mark: diff ? diff.expected_mark : null,
      written_mark: diff ? diff.written_mark : null,
      placement_class: placement,
      outcome_class: outcome,
      pron_effect: q.pron_effect || null,
    };
    // DOUBLE EVENT (seed_frames v6 contract, GO ruled at v11): every choice
    // fires the item's placement leaf - the authored markpoint keeps its
    // placement bucket, docked or not - and a wrong pick ADDITIONALLY fires
    // its outcome leaf as a synthetic zero-weight markpoint. Placement
    // accumulates on every attempt; outcomes accumulate only on errors. The
    // old model RETARGETED placement onto the outcome leaf on a miss, which
    // starved the placement axis of exactly the attempts it most needed. An
    // untagged judgement miss has no outcome leaf and stays on placement
    // alone; a tagged one classifies via choice_tags above and fires its leaf
    // while the isJudgement guard below still pins its credit at 0.
    const leaf = (outcome === "judgement") ? null : ACCENT_OUTCOME_LEAF[outcome];
    for (const mp of result.markpoints) {
      mp.accent_axes = axes;
    }
    if (!correct && leaf) {
      const src = result.markpoints[0] || {};
      result.markpoints.push({
        bucket: "orthography.accent.italian." + leaf,
        label: "outcome: " + outcome,
        credit_weight: 0,
        attempted_credit: 1,
        correctness_credit: 0,
        outcome: "miss",
        evidence: (q.choices && q.choices[pickedIdx]) || "",
        declared_bucket: (typeof src.bucket === "string") ? src.bucket : null,
        accent_axes: axes,
        synthetic_outcome: true,
        suppress_display: true
      });
    }
    result.accent_axes = axes;

    // Apply the docking scale to the markpoints and the overall. Judgement
    // items NEVER dock - a two-way call has no severity to grade
    // (design_overhaul v4) - so a classified judgement miss keeps credit 0
    // while its outcome event fires.
    let dock = ACCENT_DOCK[outcome];
    if (outcome === "omitted" && (placement === "meaning_pair" || placement === "tense_bearing")) dock = 0.4;
    const isJudgement = isJudgementChoiceSet(q.choices);
    if (!correct && !isJudgement && typeof dock === "number" && dock > 0) {
      let awarded = 0, possible = 0;
      for (const mp of result.markpoints) {
        if (mp.synthetic_outcome) continue;   // the error tally never earns dock credit
        const w = (typeof mp.credit_weight === "number") ? mp.credit_weight : 1;
        mp.correctness_credit = dock;
        mp.outcome = "partial";
        mp.docked_from = outcome;
        awarded += w * dock; possible += w;
      }
      if (possible > 0) {
        result.overall.marks_awarded = Math.min(result.overall.marks_possible, awarded);
        result.overall.correctness_overall = dock;
        result.overall.status = "partial";
        result.overall.summary = (outcome === "omitted")
          ? "The accent is missing"
          : (outcome === "inserted") ? "No accent belongs there" : "Right vowel, wrong mark";
      }
    }
    return result;
  }


  // Learner-facing coverage predicate (feedback_redesign R5, Smith-delegated
  // ruling 2026-08-03): retired nodes (active: false) and the marker-
  // classification-only accent placement subtree never render in learner-
  // facing coverage and never enter a denominator. One predicate, used by the
  // coverage matrix and the live tree; the leaf census should count with it
  // too (DECISIONS ~2041: the census counted retired nodes as live).
  function isLearnerFacingNode(node) {
    if (!node) return false;
    if (node.active === false) return false;
    if (String(node.id || "").indexOf("orthography.accent.italian.placement") === 0) return false;
    return true;
  }
  LL.isLearnerFacingNode = isLearnerFacingNode;

  // Misconception field purity (Architecture_Housing_misconception_field_purity
  // v1, DECISIONS 2026-08-03): the misconception channel carries only
  // canonical registry ids; classifier confusion cells (stress.confusion.*,
  // accent.*) are descriptors and live on their own axes. The id set is
  // cached on the registry object itself, so a data reload (which replaces
  // the object) naturally invalidates the cache.
  function isRegistryMisconceptionId(id) {
    const reg = LL.misconceptions;
    if (!reg || !Array.isArray(reg.misconceptions)) return false;
    if (!reg.__idSet) {
      reg.__idSet = new Set();
      for (const m of reg.misconceptions) if (m && m.id) reg.__idSet.add(m.id);
    }
    return reg.__idSet.has(String(id || ""));
  }
  LL.isRegistryMisconceptionId = isRegistryMisconceptionId;

  // ---------------------------------------------------------------------
  // multi_select CHROME: strip the instruction out of the authored prompt.
  //
  // "Select all that apply" is qtype furniture that ended up inside 12 prompt
  // texts (pronoun 7, pronominal_verbs 5 - derived from disk 2026-08-05; the
  // routing thread said 11, it is 12). Architecture ruled it renders NATIVELY
  // and the prompts then drop the sentence (cue_notation_renderer v4/v5).
  //
  // The card strips it at RENDER time rather than waiting for the data edit, so
  // there is no window in which the learner sees the instruction twice, and the
  // authors' cleanup becomes a no-op rather than a coordination step. It is
  // deliberately SURGICAL: one item carries the instruction inside a bracket
  // that also holds a real cue ("[fem 'it' = la lettera; select all that
  // apply]"), and a blunt strip would delete the cue with it.
  //
  // Display-only, but it lives here rather than in app.js because it is pure
  // string logic that the self-test must be able to reach without a DOM.
  const MS_PHRASE = "select\\s+all\\s+that\\s+apply";
  function stripSelectAllChrome(text) {
    let s = String(text || "");
    const re = (body, flags) => new RegExp(body, flags || "gi");
    // 1. a whole parenthetical/bracket that is ONLY the instruction
    s = s.replace(re("\\s*[\\(\\[]\\s*" + MS_PHRASE + "\\s*[.!]?\\s*[\\)\\]]"), "");
    // 2. the instruction as a trailing clause inside a bracket that carries a cue
    s = s.replace(re("\\s*[;,]\\s*" + MS_PHRASE + "\\s*[.!]?(?=\\s*[\\)\\]])"), "");
    // 3. ...or as the LEADING clause of one
    s = s.replace(re("([\\(\\[])\\s*" + MS_PHRASE + "\\s*[.!]?\\s*[;,]\\s*"), "$1");
    // 4. a bare trailing sentence with no brackets at all
    s = s.replace(re("\\s*" + MS_PHRASE + "\\s*[.!]?\\s*$"), "");
    return s.replace(/\s{2,}/g, " ").replace(/\s+([.?!,;:])/g, "$1").trim();
  }
  LL.stripSelectAllChrome = stripSelectAllChrome;

  // Did this attempt actually record a gender?
  //
  // The vocab heatmap used to flash a gender class cell whenever the word was a
  // noun. But gender is only written on PRODUCTION (English->Italian) and only
  // on an unambiguous signal - an explicit (m)/(f) or an unambiguous article. On
  // a recognition card the learner is asked what the word MEANS, so no gender is
  // demonstrated and none is recorded - yet the cell lit up, announcing a
  // measurement that had not been taken (Smith: `racconto` flashed the -o class,
  // `playlist` flashed invariable loanword).
  //
  // So the display asks the event log, not the dictionary. Pure, and here rather
  // than in app.js so the self-test can reach it without a DOM.
  function attemptRecordedGender(buckets) {
    if (!buckets) return false;
    const list = (typeof buckets.forEach === "function" && !Array.isArray(buckets))
      ? Array.from(buckets) : [].concat(buckets);
    return list.some(b => String(b || "").indexOf(".gender") >= 0);
  }
  LL.attemptRecordedGender = attemptRecordedGender;

  LL.applyAccentAxes = applyAccentAxes;
  LL.accentDiff = accentDiff;
  LL.accentOutcomeClass = accentOutcomeClass;
  LL.ACCENT_DOCK = ACCENT_DOCK;
  LL.ACCENT_OUTCOME_LEAF = ACCENT_OUTCOME_LEAF;
})();
