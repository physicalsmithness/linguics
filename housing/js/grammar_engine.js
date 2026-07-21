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

  // Classify an accent slip three ways for the misconception axis: the learner
  // DROPPED a mark (parlo for parlò), ADDED one (hò for ho), or used the WRONG
  // mark (perchè for perché). Span-mapped on NFC so folded/unfolded indices line
  // up (foldAccents is 1 char -> 1 char, so lengths match). Anything mixed or
  // uncertain returns null and the caller logs the parent id, exactly as before.
  // See inter_chat/Architecture_Housing_orthography_split.md.
  const ACCENTED_RE = /[\u00e0\u00e8\u00e9\u00ec\u00f2\u00f9\u00c0\u00c8\u00c9\u00cc\u00d2\u00d9]/;
  function classifyAccentSlip(attemptNorm, attemptFolded, positivePhrase) {
    try {
      const pNorm = LL.norm(positivePhrase).normalize("NFC");
      const pFolded = LL.foldAccents(pNorm);
      const idx = attemptFolded.indexOf(pFolded);
      if (idx === -1) return null;
      const aSpan = attemptNorm.normalize("NFC").substr(idx, pFolded.length);
      if (aSpan.length !== pNorm.length) return null;      // length drift: bail to parent
      let missing = 0, added = 0, wrong = 0;
      for (let k = 0; k < pNorm.length; k++) {
        const pc = pNorm[k], ac = aSpan[k];
        const pAcc = ACCENTED_RE.test(pc), aAcc = ACCENTED_RE.test(ac);
        if (pAcc && !aAcc) missing++;
        else if (!pAcc && aAcc) added++;
        else if (pAcc && aAcc && pc !== ac) wrong++;
      }
      const hits = [["missing", missing], ["added", added], ["wrong_mark", wrong]].filter(x => x[1] > 0);
      if (hits.length !== 1) return null;                  // none or mixed classes: parent
      // Enriched return (live_round2 ask 3 + pulse payload): the learner's
      // actual span and WHICH accented characters were involved, so per-class
      // analytics are reconstitutable from the event, not just a count.
      const chars = [];
      for (let k = 0; k < pNorm.length; k++) {
        if (pNorm[k] !== aSpan[k]) chars.push(ACCENTED_RE.test(pNorm[k]) ? pNorm[k] : aSpan[k]);
      }
      return { cls: hits[0][0], written: aSpan, chars };
    } catch (e) { return null; }
  }

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
    // Case-preserving haystacks for case_sensitive markpoints (formal La/Sua/Le).
    const normedCased = LL.normCased(raw);
    const normedFoldedCased = LL.foldAccents(LL.normCased(raw));
    const inputWasNonEmpty = String(raw || "").trim() !== "";

    let awarded = 0;
    let attemptedSum = 0;
    let correctnessSum = 0;
    let respondedCount = 0;
    const mpResults = [];
    const orthographyHits = [];
    // Item-level misconception attribution: ids carried by the must_not_include
    // entry that actually fired. Pure attribution, marking is unchanged, nothing
    // rendered yet. See inter_chat/Architecture_Housing_misconception_item_tags.md.
    const misconceptionHits = [];

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
      // case_sensitive: skip the lowercase fold for THIS markpoint, so formal
      // capitalisation (La vs la) is markable. Absent -> unchanged behaviour.
      const cs = !!mp.case_sensitive;
      const hay = cs ? normedCased : normed;
      const hayFolded = cs ? normedFoldedCased : normedFolded;
      const matched = Array.isArray(mp.any_phrases)
        ? LL.findMatchingPhrase(hay, mp.any_phrases, cs)
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
        // accent_load_bearing (markpoint flag): when the accent is the ONLY thing
        // distinguishing the target (futuro parlerò vs parlerà, remoto parlò
        // vs present parlo), the accent-folded typo-tolerance fallback would mark
        // the wrong person as right. Setting the flag disables the fold for this
        // markpoint: the accented form must be typed, and the unaccented twin then
        // falls through to must_not_include. Everywhere the flag is absent, the
        // soft accent guard behaves exactly as before. This is markpoint-scoped
        // (the fold loop runs per markpoint), so the flag gates cleanly per point.
        // See inter_chat/Architecture_Housing_accent_as_morpheme.md.
        if (!mp.accent_load_bearing) {
          for (const p of mp.any_phrases) {
            const ps = phraseStr(p);
            // match_at honoured here too, else an end-anchored needle (abbi) would
            // substring-match a longer wrong form (abbia) and be wrongly credited.
            const mAt = (typeof p === "object" && p) ? p.match_at : undefined;
            const pFolded = LL.foldAccents(cs ? LL.normCased(ps) : LL.norm(ps));
            if (pFolded && LL.occursAt(hayFolded, pFolded, mAt)) { foldedHit = p; break; }
          }
        }
        if (foldedHit) {
          // The right idea but wrong accents. Credit the main markpoint,
          // flag an orthography miss separately. Per-phrase credit honoured.
          const phraseCredit = (typeof foldedHit === "object" && typeof foldedHit.credit === "number")
            ? foldedHit.credit
            : 1;
          const foldedStr = phraseStr(foldedHit);
          const slip = classifyAccentSlip(hay, hayFolded, foldedStr);
          const ACCENT_DOCK = { missing: 0.5, wrong_mark: 0.8, added: 0.8 };   // Smith/Architecture 2026-07-21: docking supersedes never-dock
          const dock = (slip && ACCENT_DOCK[slip.cls] !== undefined) ? ACCENT_DOCK[slip.cls] : 0.8;
          const dockedCredit = phraseCredit * dock;
          result.attempted_credit = 1;
          result.correctness_credit = dockedCredit;
          result.outcome = dockedCredit >= 0.999 ? "hit" : "partial";
          result.evidence = foldedStr + " (accents off)";
          if (typeof foldedHit === "object" && foldedHit.note) {
            result.phrase_note = foldedHit.note;
          }
          awarded += credit * dockedCredit;
          orthographyHits.push({
            bucket: "orthography.accent.italian" + (slip && slip.cls ? "." + slip.cls : ""),
            evidence: foldedStr,
            expected: foldedStr,
            written: (slip && slip.written) || LL.foldAccents(LL.norm(foldedStr)),
            accent_class: (slip && slip.cls) || null,
            accent_chars: (slip && slip.chars) || []
          });
        }
        // 3. Wrong-attempt: must_not_include phrases present
        else if (Array.isArray(mp.must_not_include) && LL.includesAny(hay, mp.must_not_include, cs)) {
          result.attempted_credit = 1;
          result.correctness_credit = 0;
          result.outcome = "miss";
          for (const p of mp.must_not_include) {
            const ps = phraseStr(p);
            const mAt = (typeof p === "object" && p) ? p.match_at : undefined;
            if (LL.includesNeedle(hay, ps, mAt, cs)) {
              result.evidence = ps + " (wrong form)";
              if (typeof p === "object" && p && p.misconception) {
                misconceptionHits.push({ id: p.misconception, bucket: mp.bucket, evidence: ps });
              }
              break;
            }
          }
        }
        // 4. Attempted-hints, if any
        else if (Array.isArray(mp.attempted_hints) && LL.includesAny(hay, mp.attempted_hints, cs)) {
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

    // Residue engine (Architecture_Housing_extraneous_word_residue v3, GO given):
    // a SINGLE-markpoint answer that contains the positive PLUS extra unlicensed
    // words scores a named miss. Residue = norm(answer) tokens MINUS every
    // matching any_phrase's tokens (all-matches, order-proof) MINUS the whole
    // visible prompt's tokens (blanks/brackets stripped). Multi-markpoint items
    // keep today's substring semantics (their fragments are legitimate).
    if (points.length === 1 && q.type !== "mcq" && inputWasNonEmpty
        && mpResults[0] && mpResults[0].correctness_credit > 0) {
      const mp0 = points[0];
      const bag = LL.norm(raw).split(" ").filter(Boolean);
      const normAns = LL.norm(raw);
      const drop = (toks) => { for (const t of toks) { const i = bag.indexOf(t); if (i >= 0) bag.splice(i, 1); } };
      for (const p of (mp0.any_phrases || [])) {
        const ph = LL.norm((typeof p === "object" && p && p.phrase) ? p.phrase : p);
        if (ph && normAns.indexOf(ph) >= 0) drop(ph.split(" ").filter(Boolean));
      }
      const promptText = String(q.prompt || "").replace(/_+/g, " ").replace(/\[[^\]]*\]/g, " ").replace(/[()]/g, " ");
      drop(LL.norm(promptText).split(" ").filter(Boolean));
      const residue = bag.filter(t => /[a-z\u00e0-\u00ff]/i.test(t));
      if (residue.length > 0) {
        const r0 = mpResults[0];
        r0.correctness_credit = 0;
        r0.outcome = "miss";
        r0.residue = residue.slice();
        r0.evidence = (r0.evidence ? r0.evidence + " \u00b7 " : "") + "extra word" + (residue.length > 1 ? "s" : "") + ": " + residue.join(" ");
        awarded = 0;
        correctnessSum = 0;
      }
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
      orthography: orthographyHits,
      misconceptions: misconceptionHits
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
