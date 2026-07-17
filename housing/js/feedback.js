/* =============================================================================
 * feedback.js  -  the estate feedback widget (WEB_KIT standard, Sheets style)
 * Canonical source: MetaProject\web_kit\feedback.js  -  copy verbatim, do not fork.
 * v2, 2026-07-17: optional name/email fields, capture-disclosure caption, no
 * personal name in user-facing copy. Backend columns added in the same revision;
 * the backend must be redeployed as a NEW VERSION (same URL) to store them.
 * Deploy order does not matter: the old backend simply ignores the new fields.
 *
 * What it is: an in-page feedback panel that POSTs straight to a shared Google
 * Sheet via one Apps Script endpoint. No Google Form, no redirect, full styling
 * control. One shared sheet serves every tool; the `project` field is what
 * separates them.
 *
 * HOW TO USE (two lines in the host page, near the other scripts, NOT in <head>):
 *
 *   <script>
 *     window.FEEDBACK_CONFIG = {
 *       project: 'linguics-housing',            // required: which tool this is
 *       context: function () {                  // optional: app state to attach
 *         return { strand: currentStrand, build: 'LL_BUILD 2026-07-14-r4' };
 *       }
 *     };
 *   </script>
 *   <script src="js/feedback.js"></script>
 *
 * The context function is called at submit time and must never throw; anything
 * it returns is JSON-stringified into one Sheet column.
 *
 * Deliberate design points (from WEB_KIT):
 *  - Body script, not <head>, so automated data-only rewrites of <head> leave it alone.
 *  - POSTs as text/plain to dodge the Apps Script CORS preflight gotcha.
 *  - Fails soft: the user always gets a quiet thank-you, even if the POST is slow,
 *    blocked or the endpoint is not deployed yet. Never show the user a stack trace.
 *  - The trigger button carries an id, so the estate delegated click-tracker
 *    (site_click) picks it up with no extra instrumentation.
 *  - Copy never names the recipient personally: tools are used by pupils who know
 *    him by whatever they call him, not by the estate's name for him.
 *  - The caption under the form tells the user the page is included automatically,
 *    so they need not describe where they were. Name/email are optional fields.
 * ========================================================================== */
(function () {
  'use strict';

  if (window.__wkFeedbackLoaded) return;      // never double-mount
  window.__wkFeedbackLoaded = true;

  /* The ONE shared estate endpoint (Apps Script web app appending to the shared
   * Sheet). Same for every tool; only `project` varies. Deployed 2026-07-17.
   * If this URL ever changes, every copied tool orphans silently, so when editing
   * the Apps Script always use Deploy > Manage deployments > New version (which
   * keeps the URL), never a fresh deployment (which mints a new one). */
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbwMbhGFHSd2D1IwpnDlYhbVNLqc7IBk88iDUQcjYHZGPLAnNvVLq4QRm6lMFSM8nqrkfQ/exec';

  var cfg = window.FEEDBACK_CONFIG || {};
  var PROJECT = cfg.project || (location.hostname + location.pathname);

  var CSS = [
    '#wk-fb-btn{position:fixed;right:16px;bottom:16px;z-index:99998;',
    'font:600 13px/1 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;',
    'padding:9px 14px;border-radius:999px;border:1px solid rgba(0,0,0,.18);',
    'background:#fff;color:#1f2937;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.14)}',
    '#wk-fb-btn:hover{background:#f6f7f9}',
    '#wk-fb-panel[hidden]{display:none}',
    '#wk-fb-panel{position:fixed;right:16px;bottom:64px;z-index:99999;width:min(340px,calc(100vw - 32px));',
    'background:#fff;color:#1f2937;border:1px solid rgba(0,0,0,.18);border-radius:12px;',
    'box-shadow:0 8px 28px rgba(0,0,0,.20);padding:14px;',
    'font:400 14px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}',
    '#wk-fb-panel h2{margin:0 0 6px;font-size:15px;font-weight:700}',
    '#wk-fb-panel p.wk-fb-hint{margin:0 0 8px;font-size:12px;color:#6b7280}',
    '#wk-fb-msg{width:100%;box-sizing:border-box;min-height:96px;resize:vertical;',
    'padding:8px;border:1px solid rgba(0,0,0,.22);border-radius:8px;font:inherit}',
    '#wk-fb-name,#wk-fb-email{width:100%;box-sizing:border-box;margin-top:8px;',
    'padding:8px;border:1px solid rgba(0,0,0,.22);border-radius:8px;font:inherit}',
    '#wk-fb-panel p.wk-fb-note{margin:8px 0 0;font-size:11px;line-height:1.4;color:#6b7280}',
    '#wk-fb-row{display:flex;gap:8px;justify-content:flex-end;margin-top:10px}',
    '#wk-fb-panel button{font:600 13px/1 inherit;padding:8px 12px;border-radius:8px;cursor:pointer}',
    '#wk-fb-send{background:#111827;color:#fff;border:1px solid #111827}',
    '#wk-fb-cancel{background:#fff;color:#374151;border:1px solid rgba(0,0,0,.22)}',
    '#wk-fb-done{margin:0;padding:6px 0;font-size:13px;color:#065f46}'
  ].join('');

  /* One source for the form so open/reset can never drift apart. */
  var FORM_HTML =
    '<h2>Send feedback</h2>' +
    '<p class="wk-fb-hint">What worked, what did not, what is missing.</p>' +
    '<textarea id="wk-fb-msg" aria-label="Your feedback"></textarea>' +
    '<input id="wk-fb-name" type="text" autocomplete="name" placeholder="Name (optional)" aria-label="Your name (optional)">' +
    '<input id="wk-fb-email" type="email" autocomplete="email" placeholder="Email (optional)" aria-label="Your email (optional)">' +
    '<p class="wk-fb-note">The page you were on is automatically included in the feedback, ' +
    'so you don\'t need to describe which page it is.</p>' +
    '<div id="wk-fb-row">' +
      '<button id="wk-fb-cancel" type="button">Cancel</button>' +
      '<button id="wk-fb-send" type="button">Send</button>' +
    '</div>';

  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (html != null) n.innerHTML = html;
    return n;
  }

  function safeContext() {
    try {
      return (typeof cfg.context === 'function') ? (cfg.context() || {}) : {};
    } catch (err) {
      return { context_error: String(err) };     // never let the host's code break submit
    }
  }

  function send(message, name, email) {
    var payload = {
      project: PROJECT,
      message: message,
      name: name || '',
      email: email || '',
      url: location.href,
      ts: new Date().toISOString(),
      context: safeContext()
    };
    if (!ENDPOINT || ENDPOINT.indexOf('PASTE_') === 0) {
      // Not deployed yet. Do not bother the user; leave a trace for the developer.
      console.warn('[feedback] endpoint not configured; message not delivered:', payload);
      return Promise.resolve(false);
    }
    // text/plain avoids the CORS preflight that Apps Script does not answer.
    return fetch(ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).then(function () { return true; })
      .catch(function (err) { console.warn('[feedback] post failed:', err); return false; });
  }

  function mount() {
    document.head.appendChild(el('style', null, CSS));

    var btn = el('button', {
      id: 'wk-fb-btn',                       // id so the site_click tracker sees it
      type: 'button',
      'aria-haspopup': 'dialog',
      'aria-controls': 'wk-fb-panel'
    }, 'Feedback');

    var panel = el('section', {
      id: 'wk-fb-panel',
      role: 'dialog',
      'aria-label': 'Send feedback',
      hidden: 'hidden'
    }, FORM_HTML);

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    function val(id) {
      var n = panel.querySelector(id);
      return n ? n.value : '';
    }

    function open() {
      panel.hidden = false;
      panel.innerHTML = FORM_HTML;           // fresh form every open
      wire();
      var msg = panel.querySelector('#wk-fb-msg');
      if (msg) msg.focus();
    }
    function close() { panel.hidden = true; btn.focus(); }

    function thanks() {
      panel.innerHTML = '<h2>Thank you</h2><p id="wk-fb-done">Noted. That genuinely helps.</p>';
      setTimeout(function () {
        panel.hidden = true;
        panel.innerHTML = FORM_HTML;
        wire();
      }, 1400);
    }

    function wire() {
      var c = panel.querySelector('#wk-fb-cancel');
      var s = panel.querySelector('#wk-fb-send');
      if (c) c.onclick = close;
      if (s) s.onclick = function () {
        var text = val('#wk-fb-msg').trim();
        if (!text) { close(); return; }
        // fire and forget: the user is thanked either way
        send(text, val('#wk-fb-name').trim(), val('#wk-fb-email').trim());
        thanks();
      };
    }

    btn.addEventListener('click', function () {
      if (panel.hidden) open(); else close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) close();
    });
    wire();

    window.Feedback = { open: open, close: close };   // minimal public API
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
