/* =============================================================================
 * pulse.js — estate shared sign-in + attempt pulse (Linguics adopter)
 *
 * Mechanism verbatim from the EdTech packet (inter_chat/
 * EdTechOverview_Architecture_shared_login_and_pulse_adoption.md) under the
 * rulings of Architecture_Housing_shared_login_and_pulse v1:
 *   - one shared Apps Script endpoint, one workbook; project: "linguics"
 *     grows its own tab on first POST, no deploy step;
 *   - identity SHARED with the physics drillers via localStorage key
 *     smithics_fields_identity_v1 (anonymous_id + display_name common);
 *     the LINGUICS cohort is SCOPED: held under our own key, never written
 *     into the shared object, sent as `cohort` on every POST;
 *   - payload MAXIMAL from day one (Smith: "absolutely as much information
 *     as possible so you don't have to retro-add anything");
 *   - fail-soft everywhere: a pulse must never break marking.
 * ========================================================================== */
(function () {
  "use strict";
  const LL = window.LL || (window.LL = {});

  const REPORT_URL = "https://script.google.com/macros/s/AKfycbwQ2NxNi-AWGCpBVDa6nT9DDYsS66F53ENZvtZozDwuWkKaivqgLaGUyjSFd_InJ4Kt/exec";
  const PROJECT = "linguics";
  const IDENTITY_KEY = "smithics_fields_identity_v1";   // shared estate identity
  const COHORT_KEY = "linguics_cohort_v1";              // scoped Italian class
  // Interim hardcoded list (Smith, 2026-07-20). Swap to the TeacherViewer
  // doGet single-source when milestone M2 announces it.
  const INTERIM_CLASSES = ["Test", "Y12 Italian", "Y13 Italian"];

  function uuid() {
    try { return crypto.randomUUID(); } catch (e) {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0; return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
      });
    }
  }

  function readShared() {
    try {
      const raw = localStorage.getItem(IDENTITY_KEY);
      const obj = raw ? JSON.parse(raw) : null;
      return (obj && typeof obj === "object") ? obj : {};
    } catch (e) { return {}; }
  }
  function writeShared(obj) {
    try { localStorage.setItem(IDENTITY_KEY, JSON.stringify(obj)); } catch (e) {}
  }

  function identity() {
    const shared = readShared();
    let cohort = "";
    try { cohort = localStorage.getItem(COHORT_KEY) || ""; } catch (e) {}
    return {
      anonymous_id: shared.anonymous_id || "",
      display_name: shared.display_name || "",
      cohort
    };
  }
  function signedIn() {
    const id = identity();
    return !!(id.display_name && id.cohort);
  }
  // Sign in: PRESERVE every unknown key in the shared object (the packet's
  // caution about the physics drillers); never touch shared.cohort (that is
  // the physics class); the Linguics class lives only under COHORT_KEY.
  function signIn(displayName, cohort) {
    const shared = readShared();
    if (!shared.anonymous_id) shared.anonymous_id = uuid();
    shared.display_name = String(displayName || "").trim();
    if (shared.google_email === undefined) shared.google_email = "";
    writeShared(shared);
    try { localStorage.setItem(COHORT_KEY, String(cohort || "")); } catch (e) {}
    sendSessionStart();
    return identity();
  }

  function sessionId() {
    try {
      let s = sessionStorage.getItem("ll_session_id");
      if (!s) { s = uuid(); sessionStorage.setItem("ll_session_id", s); }
      return s;
    } catch (e) { return "no-session-storage"; }
  }

  // Status pill: the app registers a listener; "sent" means dispatched (the
  // no-cors response is opaque by design), "offline" means the POST failed.
  let statusListener = null;
  function onStatus(fn) { statusListener = fn; }
  function flash(status) { try { if (statusListener) statusListener(status); } catch (e) {} }

  function post(payload) {
    try {
      fetch(REPORT_URL, {
        method: "POST", mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload), keepalive: true
      }).then(function () { flash("sent"); })
        .catch(function () { flash("offline"); });
    } catch (e) { flash("offline"); }
  }

  function basePayload() {
    const id = identity();
    return {
      project: PROJECT,
      timestamp: new Date().toISOString(),
      anonymous_id: id.anonymous_id,
      display_name: id.display_name,
      cohort: id.cohort,
      google_email: "",
      session_id: sessionId()
    };
  }

  function statusFor(result) {
    const p = (result && result.overall && result.overall.marks_possible) || 0;
    const a = (result && result.overall && result.overall.marks_awarded) || 0;
    if (p <= 0) return "wrong";
    if (a >= p) return "correct";
    if (a <= 0) return "wrong";
    return "half";
  }

  // The maximal payload. `attempt` is the store's persisted attempt (carries
  // events + misconception_hits + timestamp); `item` is the question/entry.
  function buildAttemptPayload(strand, item, result, attempt) {
    const payload = basePayload();
    payload.item_id = (item && (item.external_id || item.id)) || "";
    payload.topic = (item && item.topic) || firstBucketRoot(result) || "";
    payload.qtype = (item && item.type) || (strand === "vocab" ? "vocab_card" : "short");
    payload.mode = strand;
    payload.level = (item && item.cefr_level_target) || "";
    payload.status = statusFor(result);
    payload.picked_id = (item && item.type === "mcq" && attempt) ? String(attempt.raw_response || "") : "";
    // Hits are OBJECTS {id, bucket, evidence}; the column takes the ID (the
    // old String() would have sent "[object Object]" the day a tag fired).
    const mh = (attempt && Array.isArray(attempt.misconception_hits)) ? attempt.misconception_hits : [];
    payload.misconception_id = mh.length ? String(mh[0].id || mh[0]) : "";

    // LIVE FINDING (Smith, 2026-07-21): a client-built extra_json string
    // arrives EMPTY in the sheet - the estate script owns that column and
    // fills it by sweeping UNRECOGNISED top-level keys. So everything
    // Linguics-specific now travels as top-level keys (the packet's other
    // blessed route); complex structures pre-stringified.
    payload.answer = (attempt && attempt.raw_response) || "";
    payload.expected_answer = expectedAnswerFor(item);
    payload.build = LL.build || "";
    payload.score = result && result.overall ? result.overall.marks_awarded : "";
    payload.marks_possible = result && result.overall ? result.overall.marks_possible : "";
    payload.duration_ms = LL._cardShownAt ? Math.max(0, Date.now() - LL._cardShownAt) : "";
    payload.person = (item && item.person !== undefined && item.person !== null) ? item.person : "";
    payload.slot = (item && item.slot !== undefined && item.slot !== null) ? item.slot : "";
    payload.intent = (attempt && attempt.intent) || "";
    payload.events_n = (attempt && attempt.events && attempt.events.length) || 0;
    payload.markpoints_json = JSON.stringify((result && result.markpoints || []).map(mp => ({
      bucket: mp.bucket, outcome: mp.outcome,
      attempted: mp.attempted_credit, correctness: mp.correctness_credit,
      evidence: mp.evidence || ""
    })));
    payload.orthography_json = JSON.stringify((result && result.orthography || []).map(o => ({
      bucket: o.bucket, expected: o.expected, written: o.written,
      accent_class: o.accent_class, accent_chars: o.accent_chars
    })));
    payload.misconceptions_json = JSON.stringify(mh);
    // App-side context (input mode, active scopes) - also top-level.
    try { if (typeof LL.pulseContext === "function") Object.assign(payload, LL.pulseContext()); } catch (e) {}
    return payload;
  }

  function expectedAnswerFor(item) {
    try {
      if (item && item.type === "mcq" && Array.isArray(item.choices)) {
        return String(item.choices[item.answer_index] !== undefined ? item.choices[item.answer_index] : "");
      }
      const mp = item && item.markpoints && item.markpoints[0];
      const ph = mp && mp.any_phrases && mp.any_phrases[0];
      return typeof ph === "string" ? ph : (ph && ph.phrase) || "";
    } catch (e) { return ""; }
  }

  function firstBucketRoot(result) {
    const mp = result && result.markpoints && result.markpoints[0];
    return mp && mp.bucket ? String(mp.bucket).split(".")[0] : "";
  }

  function reportAttempt(strand, item, result, attempt) {
    try { post(buildAttemptPayload(strand, item, result, attempt)); } catch (e) { /* never break marking */ }
  }

  function sendSessionStart() {
    try {
      const payload = basePayload();
      payload.item_id = ""; payload.topic = ""; payload.qtype = ""; payload.mode = "";
      payload.level = ""; payload.picked_id = ""; payload.misconception_id = "";
      payload.status = "session_start";
      payload.build = LL.build || "";
      post(payload);
    } catch (e) {}
  }

  // Log out = clear the LINGUICS class only (the gate reasks; the shared
  // name + anonymous_id stay, so physics is untouched and the name prefills).
  function signOut() {
    try { localStorage.removeItem(COHORT_KEY); } catch (e) {}
  }

  LL.pulse = {
    classes: () => INTERIM_CLASSES.slice(),
    identity, signedIn, signIn, signOut, onStatus, reportAttempt, sendSessionStart,
    _buildAttemptPayload: buildAttemptPayload,   // exposed for the test harness
    _statusFor: statusFor
  };
})();
