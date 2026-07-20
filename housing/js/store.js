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
      const merged = Object.assign(defaultState(), parsed);
      // State hygiene: drop events whose bucket field isn't a non-empty string.
      // Bad events accumulated from older code revisions or partial migrations
      // cause downstream renderers to throw TypeError. Log the count so we can
      // spot recurrence. See inter_chat/
      // Architecture_Housing_eventsForNode_TypeError_and_state_hygiene.md.
      let droppedEventCount = 0;
      for (const att of (merged.attempts || [])) {
        if (!Array.isArray(att.events)) { att.events = []; continue; }
        const before = att.events.length;
        att.events = att.events.filter(ev =>
          ev && typeof ev.bucket === "string" && ev.bucket.length > 0
        );
        droppedEventCount += before - att.events.length;
      }
      if (droppedEventCount > 0) {
        console.warn("[Linguics] State hygiene: dropped " + droppedEventCount +
          " malformed event(s) from loaded state (events without a valid bucket field).");
      }
      return merged;
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
    // Build events from markpoints, then filter out any that lack a valid
    // bucket string. Prevents bad events from accumulating in localStorage
    // and surfaces the upstream cause (a markpoint missing .bucket) via
    // console.warn. See inter_chat/
    // Architecture_Housing_eventsForNode_TypeError_and_state_hygiene.md.
    // Person tag (verb_formation_person_split v2): formation items carry a
    // structured `person` (1sg..3pl; explicit null on non-finite). Every
    // event of a person-carrying item is tagged so per-person mastery can
    // aggregate within a leaf. Items without the field produce untagged
    // events, exactly as before - the render side treats absent as unsplit.
    // Generalised for leaf-declared paradigms (paradigm_bands v1): "person"
    // for verb formation, "slot" for form-paradigm leaves (articles,
    // articulated prepositions, demonstratives, possessives). The leaf
    // DECLARES which field matters; the store just carries what the item has.
    const PARADIGM_FIELDS = ["person", "slot"];
    const rawEvents = (result.markpoints || []).map(mp => {
      const ev = {
        bucket: mp.bucket,
        attempted_credit: mp.attempted_credit,
        correctness_credit: mp.correctness_credit,
        outcome: mp.outcome,
        evidence: mp.evidence || mp.evidence_in_attempt,
        source: strand === "grammar" ? "engine" : "ai_stub",
        bucket_proposed: !!mp.bucket_proposed
      };
      for (const pf of PARADIGM_FIELDS) {
        if (item_or_question && item_or_question[pf] !== undefined) ev[pf] = item_or_question[pf];
      }
      return ev;
    });
    const events = rawEvents.filter(ev => {
      if (typeof ev.bucket !== "string" || ev.bucket.length === 0) {
        console.warn("[Linguics] recordAttempt: skipping event with bad bucket field", ev);
        return false;
      }
      return true;
    });
    // accent slips (grammar only)
    if (result.orthography) {
      for (const o of result.orthography) {
        const oe = {
          bucket: o.bucket,
          attempted_credit: 1,
          correctness_credit: 0,
          outcome: "miss",
          evidence: o.evidence,
          source: "engine_orthography"
        };
        // Classed slip payload (live_round2 ask 3 / pulse maximal payload):
        // which word, what they wrote, which accent characters, what class.
        for (const k of ["expected", "written", "accent_class", "accent_chars"]) {
          if (o[k] !== undefined) oe[k] = o[k];
        }
        events.push(oe);
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
    // candidate_tenses metadata (AUTHOR_BRIEF criterion 16, Phase 1; see
    // inter_chat/Architecture_Housing_candidate_tenses_tick.md). Recorded when
    // the item declares its candidate set, to feed per-context discrimination
    // stats. Phase 1 stores correct_tense + whether the learner got the item
    // right; chosen-wrong-tense attribution is Phase 2 (needs tense-tagged
    // must_not_include entries).
    if (Array.isArray(item_or_question.candidate_tenses)
        && item_or_question.candidate_tenses.length >= 2
        && item_or_question.correct_tense) {
      attempt.tense_meta = {
        candidate_tenses: item_or_question.candidate_tenses.slice(),
        correct_tense: item_or_question.correct_tense,
        was_right: result.overall.marks_possible > 0
          && result.overall.marks_awarded >= result.overall.marks_possible
      };
    }
    // candidate_forms metadata: same semantics as tense_meta above, for
    // non-tense discriminations (suo his/her/your-formal, questo/quello). See
    // inter_chat/Architecture_Housing_breadcrumb_defaults_and_candidate_forms.md.
    if (Array.isArray(item_or_question.candidate_forms)
        && item_or_question.candidate_forms.length >= 2
        && item_or_question.correct_form) {
      attempt.form_meta = {
        candidate_forms: item_or_question.candidate_forms.slice(),
        correct_form: item_or_question.correct_form,
        was_right: result.overall.marks_possible > 0
          && result.overall.marks_awarded >= result.overall.marks_possible
      };
    }
    // Item-level misconception tags from the firing guard (attribution only;
    // the stats axis is a later phase). See inter_chat/
    // Architecture_Housing_misconception_item_tags.md.
    if (Array.isArray(result.misconceptions) && result.misconceptions.length) {
      attempt.misconception_hits = result.misconceptions.slice();
    }
    state.attempts.push(attempt);
    LL.lastAttempt = attempt;   // read by the grammar pulse strip (live flashes)
    // Attempt pulse to the estate workbook (shared_login_and_pulse v1).
    // Fail-soft by contract: a pulse must never break marking or storage.
    try { if (LL.pulse) LL.pulse.reportAttempt(strand, item_or_question, result, attempt); } catch (e) {}

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
