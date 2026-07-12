/* ============================================================================
   Grammar marker
   Substring-based, deterministic. Emits per-markpoint attempted/correctness
   (binary in v1).

   Public API:
     window.LL.markGrammar(question, rawResponse) -> {
       overall: { attempted_overall, correctness_overall, marks_awarded, marks_possible, status },
       markpoints: [ { bucket, attempted_credit, correctness_credit, outcome, evidence, expected, label } ],
       orthography: [ { bucket, evidence } ]  // accent slips picked up by the
                                              // accent-folded fallback
     }
   ============================================================================ */

(function () {
  "use strict";
  const LL = window.LL || (window.LL = {});

  function statusFromCombined(awarded, possible) {
    if (possible <= 0) return "not_attempted";
    const f = awarded / possible;
    if (f >= 0.999) return "hit";
    if (f <= 0.001) return "miss";
    return "partial";
  }

  function markGrammar(q, raw) {
    const possible = q.marks || 1;
    const points = Array.isArray(q.markpoints) ? q.markpoints : [];
    const normed = LL.norm(raw);
    const normedFolded = LL.normAccentFolded(raw);
    const inputWasNonEmpty = String(raw || "").trim() !== "";

    let awarded = 0;
    let attemptedSum = 0;
    let correctnessSum = 0;
    let respondedCount = 0;
    const mpResults = [];
    const orthographyHits = [];

    for (const mp of points) {
      const credit = (typeof mp.credit === "number") ? mp.credit : 1;
      const result = {
        bucket: mp.bucket,
        label: mp.label || "",
        credit_weight: credit,
        attempted_credit: 0,
        correctness_credit: null,
        outcome: "not_attempted",
        evidence: null,
        expected: (mp.any_phrases && mp.any_phrases[0])
          ? ((typeof mp.any_phrases[0] === "object" && mp.any_phrases[0].phrase)
              ? mp.any_phrases[0].phrase
              : mp.any_phrases[0])
          : null
      };

      // Helper: extract the matchable string from an entry that may be a
      // bare string OR an object { phrase, credit?, note? }.
      const phraseStr = (e) => (typeof e === "object" && e && e.phrase) ? e.phrase : e;

      // 1. Try strict positive match. Uses findMatchingPhrase so object-form
      // entries carrying per-phrase credit / note are honoured (see
      // inter_chat/Architecture_Housing_engine_graded_any_phrases.md).
      const matched = Array.isArray(mp.any_phrases)
        ? LL.findMatchingPhrase(normed, mp.any_phrases)
        : null;
      if (matched !== null) {
        const phraseCredit = (typeof matched === "object" && typeof matched.credit === "number")
          ? matched.credit
          : 1;
        const matchedStr = phraseStr(matched);
        result.attempted_credit = 1;
        result.correctness_credit = phraseCredit;
        result.outcome = phraseCredit >= 1 ? "hit" : "partial";
        result.evidence = matchedStr;
        if (typeof matched === "object" && matched.note) {
          result.phrase_note = matched.note;
        }
        awarded += credit * phraseCredit;
      }
      // 2. Try accent-folded fallback (typo tolerance). Same object-form
      // handling: object entries get unwrapped to their .phrase string before
      // accent-folding, and per-phrase credit is honoured on a folded hit.
      else if (Array.isArray(mp.any_phrases)) {
        let foldedHit = null;
        for (const p of mp.any_phrases) {
          const ps = phraseStr(p);
          const pFolded = LL.foldAccents(LL.norm(ps));
          // Honour match_at in the folded fallback too, else an end-anchored
          // needle (abbi) still substring-matches a longer wrong form (abbia)
          // here and gets wrongly credited as "accents off".
          const mAt = (typeof p === "object" && p) ? p.match_at : undefined;
          if (pFolded && LL.occursAt(normedFolded, pFolded, mAt)) { foldedHit = p; break; }
        }
        if (foldedHit) {
          // The right idea but wrong accents. Credit the main markpoint,
          // flag an orthography miss separately. Per-phrase credit honoured.
          const phraseCredit = (typeof foldedHit === "object" && typeof foldedHit.credit === "number")
            ? foldedHit.credit
            : 1;
          const foldedStr = phraseStr(foldedHit);
          result.attempted_credit = 1;
          result.correctness_credit = phraseCredit;
          result.outcome = phraseCredit >= 1 ? "hit" : "partial";
          result.evidence = foldedStr + " (accents off)";
          if (typeof foldedHit === "object" && foldedHit.note) {
            result.phrase_note = foldedHit.note;
          }
          awarded += credit * phraseCredit;
          orthographyHits.push({
            bucket: "orthography.accent.italian",
            evidence: foldedStr
          });
        }
        // 3. Wrong-attempt: must_not_include phrases present
        else if (Array.isArray(mp.must_not_include) && LL.includesAny(normed, mp.must_not_include)) {
          result.attempted_credit = 1;
          result.correctness_credit = 0;
          result.outcome = "miss";
          for (const p of mp.must_not_include) {
            const ps = phraseStr(p);
            const mAt = (typeof p === "object" && p) ? p.match_at : undefined;
            if (LL.includesNeedle(normed, ps, mAt)) { result.evidence = ps + " (wrong form)"; break; }
          }
        }
        // 4. Attempted-hints, if any
        else if (Array.isArray(mp.attempted_hints) && LL.includesAny(normed, mp.attempted_hints)) {
          result.attempted_credit = 1;
          result.correctness_credit = 0;
          result.outcome = "miss";
          result.evidence = "attempted but neither right nor a recognised wrong form";
        }
        // 5. Nothing matched: not attempted
      }

      // If the input was non-empty but no positive match, no must_not_include
      // match, and no attempted-hint match, the marker should still record a
      // miss against this markpoint (attempted=1, correctness=0). The previous
      // "not_attempted" verdict was misleading: the learner DID try; the
      // marker just doesn't have a rule that recognises their specific wrong
      // form. "not_attempted" is reserved for an empty submission.
      if (result.outcome === "not_attempted" && inputWasNonEmpty) {
        result.attempted_credit = 1;
        result.correctness_credit = 0;
        result.outcome = "miss";
        // evidence stays null; the panel will fall back to the raw input
      }

      attemptedSum += result.attempted_credit * credit;
      if (result.correctness_credit !== null) {
        correctnessSum += result.correctness_credit * credit;
        respondedCount += credit;
      }

      mpResults.push(result);
    }

    if (awarded > possible) awarded = possible;
    const attempted_overall = possible > 0 ? attemptedSum / possible : 0;
    const correctness_overall = respondedCount > 0 ? correctnessSum / respondedCount : 0;

    return {
      raw_response: raw,
      overall: {
        attempted_overall,
        correctness_overall,
        marks_awarded: awarded,
        marks_possible: possible,
        status: statusFromCombined(awarded, possible),
        summary: summarise(mpResults, orthographyHits),
        explanation: q.explanation || null,
        examiner_note: q.examiner_note || null
      },
      markpoints: mpResults,
      orthography: orthographyHits
    };
  }

  function summarise(results, ortho) {
    const hits = results.filter(r => r.outcome === "hit").length;
    const misses = results.filter(r => r.outcome === "miss").length;
    const noAttempt = results.filter(r => r.outcome === "not_attempted").length;
    let s = `${hits} hit, ${misses} miss, ${noAttempt} not attempted.`;
    if (ortho.length) s += ` ${ortho.length} accent slip(s).`;
    return s;
  }

  LL.markGrammar = markGrammar;
})();
