/* ============================================================================
   Store: bucket / question / item registry plus attempt persistence.
   In-memory + localStorage. No backend.
   ============================================================================ */

(function () {
  "use strict";
  const LL = window.LL || (window.LL = {});

  const LS_KEY = "ll_state_v1";

  function loadState() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return Object.assign(defaultState(), parsed);
    } catch (e) {
      console.warn("Could not parse localStorage state", e);
      return defaultState();
    }
  }

  function defaultState() {
    return {
      user_cefr: "B1",
      attempts: [],            // { id, strand, question_id|item_id, raw_response, intent?, overall, markpoint_events, timestamp }
      drafts: [],              // bucket-proposal drafts from AI marker
      preferences: { show_arcane: false, show_decay: true }
    };
  }

  function saveState(state) {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }

  // --- bucket tree ---
  function indexBuckets(arr) {
    const byId = {};
    for (const b of arr) byId[b.id] = Object.assign({ children: [] }, b);
    const roots = [];
    for (const b of Object.values(byId)) {
      if (b.parent_id && byId[b.parent_id]) byId[b.parent_id].children.push(b);
      else roots.push(b);
    }
    return { byId, roots };
  }

  // --- attempts ---
  function recordAttempt(strand, item_or_question, raw, result, intent) {
    const state = LL.state;
    const events = (result.markpoints || []).map(mp => ({
      bucket: mp.bucket,
      attempted_credit: mp.attempted_credit,
      correctness_credit: mp.correctness_credit,
      outcome: mp.outcome,
      evidence: mp.evidence || mp.evidence_in_attempt,
      source: strand === "grammar" ? "engine" : "ai_stub",
      bucket_proposed: !!mp.bucket_proposed
    }));
    // accent slips (grammar only)
    if (result.orthography) {
      for (const o of result.orthography) {
        events.push({
          bucket: o.bucket,
          attempted_credit: 1,
          correctness_credit: 0,
          outcome: "miss",
          evidence: o.evidence,
          source: "engine_orthography"
        });
      }
    }
    const attempt = {
      id: "att_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
      strand,
      question_id: strand === "grammar" ? item_or_question.external_id : null,
      item_id: strand === "translation" ? item_or_question.external_id : null,
      raw_response: raw,
      intent: intent || null,
      overall: result.overall,
      events,
      timestamp: new Date().toISOString()
    };
    state.attempts.push(attempt);

    // Track any bucket proposals that came through
    for (const mp of (result.markpoints || [])) {
      if (mp.bucket_proposed) {
        state.drafts.push({
          proposed_id: mp.bucket,
          proposed_parent_id: mp.proposed_parent_id,
          proposed_label: mp.proposed_label,
          proposed_rationale: mp.proposed_rationale,
          first_seen_attempt: attempt.id,
          status: "pending",
          occurrences: 1
        });
      }
    }
    saveState(state);
    return attempt;
  }

  // --- bucket stats ---
  function bucketStats(bucketId) {
    const events = [];
    for (const att of LL.state.attempts) {
      for (const ev of att.events) {
        if (ev.bucket === bucketId) events.push({ event: ev, attempt: att });
      }
    }
    if (events.length === 0) return null;
    // most recent K
    const K = 5;
    const recent = events.slice(-K);
    let attemptedSum = 0, correctSum = 0, respondedCount = 0;
    for (const r of recent) {
      attemptedSum += r.event.attempted_credit;
      if (r.event.correctness_credit !== null) { correctSum += r.event.correctness_credit; respondedCount++; }
    }
    return {
      bucket: bucketId,
      n_events: events.length,
      attempted_rate: attemptedSum / recent.length,
      correctness_given_attempt: respondedCount > 0 ? correctSum / respondedCount : 0,
      combined: (attemptedSum / recent.length) * (respondedCount > 0 ? correctSum / respondedCount : 0),
      last_seen: events[events.length - 1].attempt.timestamp
    };
  }

  function allBucketStats() {
    const out = {};
    for (const att of LL.state.attempts) {
      for (const ev of att.events) {
        if (!out[ev.bucket]) {
          out[ev.bucket] = { bucket: ev.bucket, attempted: 0, correct: 0, n: 0 };
        }
        out[ev.bucket].n += 1;
        out[ev.bucket].attempted += ev.attempted_credit;
        if (ev.correctness_credit !== null) out[ev.bucket].correct += ev.correctness_credit;
      }
    }
    for (const k of Object.keys(out)) {
      const r = out[k];
      r.attempted_rate = r.n > 0 ? r.attempted / r.n : 0;
      r.correctness = r.attempted > 0 ? r.correct / r.attempted : 0;
      r.combined = r.attempted_rate * r.correctness;
    }
    return out;
  }

  LL.store = {
    indexBuckets,
    recordAttempt,
    bucketStats,
    allBucketStats,
    saveState,
    loadState,
    LS_KEY
  };
})();
