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
    const tag = Array.isArray(q.choice_tags) ? q.choice_tags[pickedIdx] : null;
    if (tag && tag.class && ACCENT_OUTCOME_LEAF[tag.class]) return tag.class;
    const d = accentDiff(q.choices[q.answer_index], q.choices[pickedIdx]);
    if (!d) return "wrong_kind";
    if (d.written_mark === "none") return "omitted";
    if (d.expected_mark === "none") return "inserted";
    return "wrong_kind";
  }
  function accentPlacementClass(q) {
    const st = String(q.subtopic || "");
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
  // `inserted` (a mark added where none belongs) was NOT ruled. It is scored
  // with wrong_kind, on the reading that both are misapplications of a mark the
  // learner knew was in play, where an omission is not knowing one was needed
  // at all. Flagged to Architecture rather than left silent.
  const ACCENT_DOCK = { correct: 1, wrong_kind: 0.8, inserted: 0.8, omitted: 0.5 };
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
    const leaf = ACCENT_OUTCOME_LEAF[outcome];
    for (const mp of result.markpoints) {
      mp.accent_axes = axes;
      // On a MISS, retarget the leaf to the outcome the learner produced. The
      // declared bucket stays on the record as declared_bucket so the authored
      // intent is never lost.
      if (!correct && leaf && typeof mp.bucket === "string" &&
          mp.bucket.indexOf("orthography.accent.") === 0) {
        const retargeted = "orthography.accent.italian." + leaf;
        if (retargeted !== mp.bucket) {
          mp.declared_bucket = mp.bucket;
          mp.bucket = retargeted;
        }
      }
    }
    result.accent_axes = axes;

    // Apply the docking scale to the markpoints and the overall.
    const dock = ACCENT_DOCK[outcome];
    if (!correct && typeof dock === "number" && dock > 0) {
      let awarded = 0, possible = 0;
      for (const mp of result.markpoints) {
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
          ? "The accent is missing" : "Right vowel, wrong mark";
      }
    }
    return result;
  }


  LL.applyAccentAxes = applyAccentAxes;
  LL.accentDiff = accentDiff;
  LL.accentOutcomeClass = accentOutcomeClass;
  LL.ACCENT_DOCK = ACCENT_DOCK;
  LL.ACCENT_OUTCOME_LEAF = ACCENT_OUTCOME_LEAF;
})();
