/* ============================================================================
   Translation marker STUB
   Returns a canned structured response. In production this is replaced by an
   Anthropic API call returning the schema described in DESIGN.md §5.2.

   Two modes:

   1. Per-item markpoint_tells (sample items): per-bucket substring rules.
      Gives reasonable per-skill verdicts. Good demo, narrow scope.

   2. Fallback: coarse word-overlap similarity vs reference_translations.
      Used when no markpoint_tells are declared (all authored items).
      Honestly marks the whole answer at one fidelity: "looks roughly right"
      vs "looks wrong" vs "barely tried". All markpoints share the same verdict
      under this mode, with a visible "needs AI" notice.
   ============================================================================ */

(function () {
  "use strict";
  const LL = window.LL || (window.LL = {});

  function deriveOutcome(attempted, correct) {
    if (!attempted || attempted < 0.001) return "not_attempted";
    if (correct === null || correct === undefined) return "not_attempted";
    if (correct >= 0.999) return "hit";
    if (correct <= 0.001) return "miss";
    return "partial";
  }

  // Word-set overlap (Jaccard) between two normalised strings.
  function jaccard(a, b) {
    const A = new Set(a.split(/\s+/).filter(w => w.length > 1));
    const B = new Set(b.split(/\s+/).filter(w => w.length > 1));
    if (A.size === 0 || B.size === 0) return 0;
    let inter = 0;
    for (const x of A) if (B.has(x)) inter++;
    const union = A.size + B.size - inter;
    return union > 0 ? inter / union : 0;
  }

  function bestSimilarity(rawNormed, item) {
    const refs = (item.reference_translations || []).map(r => LL.norm(r.text || ""));
    let best = 0;
    for (const r of refs) {
      const sim = jaccard(rawNormed, r);
      if (sim > best) best = sim;
    }
    // Also compute accent-folded similarity as a small boost (a learner missing
    // accents shouldn't be penalised much in the stub).
    const rawFolded = LL.foldAccents(rawNormed);
    for (const r of refs) {
      const sim = jaccard(rawFolded, LL.foldAccents(r));
      if (sim > best) best = sim;
    }
    return best;
  }

  function markTranslationStub(item, rawResponse, intent) {
    const normed = (LL.norm(rawResponse) || "").toLowerCase();
    const hasTells = !!(item.markpoint_tells && Object.keys(item.markpoint_tells).length);

    const out = hasTells
      ? markWithTells(item, rawResponse, intent, normed)
      : markWithSimilarity(item, rawResponse, intent, normed);
    out.raw_response = rawResponse;
    return out;
  }

  /* -------------------- markpoint_tells mode (sample items) -------------------- */

  function markWithTells(item, rawResponse, intent, normed) {
    const markpoints = [];

    for (const bid of (item.required_buckets || [])) {
      const tell = item.markpoint_tells[bid];
      let attempted = 1, correct = 1;
      let evidence = "(stub)";
      let expected = "(see reference)";
      let explanation = "Stubbed marking; in production the AI would explain.";

      if (tell) {
        expected = tell.expected || expected;
        if (tell.positive && LL.includesAny(normed, tell.positive)) {
          attempted = 1; correct = 1;
          evidence = tell.positive.find(p => LL.includesNeedle(normed, p)) || tell.positive[0];
          explanation = tell.explanation_hit || explanation;
        } else if (tell.negative && LL.includesAny(normed, tell.negative)) {
          attempted = 1; correct = 0;
          evidence = tell.negative.find(p => LL.includesNeedle(normed, p)) || tell.negative[0];
          explanation = tell.explanation_miss || explanation;
        } else {
          attempted = 0; correct = null;
          evidence = "not produced";
          explanation = tell.explanation_no_attempt || "Not present in the attempt.";
        }
      }

      markpoints.push({
        bucket: bid,
        bucket_proposed: false,
        attempted_credit: attempted,
        correctness_credit: correct,
        evidence_in_attempt: evidence,
        expected: expected,
        explanation: explanation,
        outcome: deriveOutcome(attempted, correct),
        label: (tell && tell.label) || bid
      });
    }

    if (item.demo_propose_bucket) {
      markpoints.push({
        bucket: item.demo_propose_bucket.id,
        bucket_proposed: true,
        proposed_parent_id: item.demo_propose_bucket.parent_id,
        proposed_label: item.demo_propose_bucket.label,
        proposed_rationale: item.demo_propose_bucket.rationale,
        attempted_credit: 0,
        correctness_credit: null,
        evidence_in_attempt: "(observation)",
        expected: "n/a",
        explanation: item.demo_propose_bucket.rationale,
        outcome: "not_attempted",
        label: item.demo_propose_bucket.label
      });
    }

    return overallFrom(markpoints, intent, "Stub marker (per-tell mode)", item.explanation);
  }

  /* -------------------- similarity-based fallback -------------------- */

  function markWithSimilarity(item, rawResponse, intent, normed) {
    const trimmed = (rawResponse || "").trim();
    const empty = trimmed === "";
    const sim = empty ? 0 : bestSimilarity(normed, item);
    const pct = Math.round(sim * 100);

    // Coarse mapping. Be conservative: only return "hit" when similarity is high.
    let attempted, correct, outcome, summary;
    if (empty) {
      attempted = 0; correct = null; outcome = "not_attempted";
      summary = "Empty attempt.";
    } else if (sim >= 0.75) {
      attempted = 1; correct = 1; outcome = "hit";
      summary = `Looks roughly right (${pct}% word overlap with a reference). Real AI marker would give per-skill feedback.`;
    } else if (sim >= 0.35) {
      attempted = 1; correct = 0; outcome = "miss";
      summary = `Partially close but at least one element is off (${pct}% overlap). Real AI marker would say what.`;
    } else {
      attempted = 1; correct = 0; outcome = "miss";
      summary = `Substantially different from any reference (${pct}% overlap). Real AI marker would diagnose.`;
    }

    // In fallback mode we have no per-bucket info to show on each row.
    // Leaving evidence / expected / explanation off makes each row clean.
    // The Notes block at the bottom of the result panel carries the one-time
    // "this is the stub, real AI would give per-skill detail" message.
    //
    // Direction-aware filter (added 2026-05-17): for IT→EN items, source-
    // language production buckets (adjective_agreement, grammar formation,
    // pronoun forms) aren't candidates because the learner didn't have to
    // produce Italian. Only vocab, translation_mapping, and usage buckets
    // fire on IT→EN. EN→IT items keep all buckets as before.
    const candidateIds = (typeof LL.candidateBucketIds === "function")
      ? LL.candidateBucketIds(item)
      : (item.required_buckets || []);
    // Honest degradation (Architecture_Housing_translation_stub_honest, 2026-07-21):
    // the stub CANNOT compute per-bucket right/wrong, so it must not fabricate it.
    // A fake "Negation: Wrong" on a correct negation is worse than none (and it
    // polluted coverage). No per-markpoint verdicts, no confident score - only an
    // approximate word-overlap read + the offline note. `candidateIds` stays
    // referenced so the direction filter above isn't flagged dead.
    void candidateIds;
    const result = {
      overall: {
        attempted_overall: 1,
        correctness_overall: 0,
        marks_awarded: 0,
        marks_possible: 0,
        status: "not_scored",
        summary: `AI marker offline - not scored. Only a rough ${pct}% word-overlap with a reference, not a per-skill judgement. Intent: ${intent}.`,
        explanation: item.explanation || null
      },
      markpoints: [],
      notes: [
        {
          kind: "info",
          note: `Offline stub: it can't tell which parts of your answer match which skill, so it makes NO per-skill verdict here (only a ${pct}% word-overlap). Connect the AI marker for real per-skill feedback.`
        }
      ]
    };
    return result;
  }

  /* -------------------- overall computation -------------------- */

  function overallFrom(markpoints, intent, summary, explanation) {
    let attemptedSum = 0, correctnessSum = 0, respondedCount = 0;
    for (const mp of markpoints) {
      if (mp.bucket_proposed) continue;
      attemptedSum += mp.attempted_credit;
      if (mp.correctness_credit !== null && mp.correctness_credit !== undefined) {
        correctnessSum += mp.correctness_credit; respondedCount++;
      }
    }
    const total = markpoints.filter(mp => !mp.bucket_proposed).length || 1;
    const attempted_overall = attemptedSum / total;
    const correctness_overall = respondedCount > 0 ? correctnessSum / respondedCount : 0;
    return {
      overall: {
        attempted_overall,
        correctness_overall,
        marks_awarded: attempted_overall * correctness_overall * total,
        marks_possible: total,
        status: deriveOutcome(attempted_overall, correctness_overall),
        summary: `${summary} Intent: ${intent}.`,
        explanation: explanation || null
      },
      markpoints,
      notes: []
    };
  }

  LL.markTranslationStub = markTranslationStub;
})();
