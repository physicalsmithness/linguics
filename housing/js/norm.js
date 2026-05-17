/* ============================================================================
   Normalisation pre-pass
   Ported from the PreIB Physics engine, with Italian-specific extensions.

   Public API:
     window.LL.norm(text)               - canonical normalisation (strict)
     window.LL.normAccentFolded(text)   - accents folded out, for typo-tolerance
     window.LL.normaliseAccentInput(t)  - rewrite e' -> è, a' -> à, etc.
     window.LL.includesNeedle(haystack, needle)
     window.LL.includesAny(haystack, anyArr)
   ============================================================================ */

(function () {
  "use strict";
  const LL = window.LL || (window.LL = {});

  const CONTRACTIONS = [
    ["can't", "cannot"], ["doesn't", "does not"], ["isn't", "is not"],
    ["won't", "will not"], ["wouldn't", "would not"], ["shouldn't", "should not"],
    ["couldn't", "could not"], ["didn't", "did not"],
    ["haven't", "have not"], ["hasn't", "has not"], ["hadn't", "had not"],
    ["aren't", "are not"], ["weren't", "were not"]
  ];

  const SPELLING_FOLD = [
    [/\bionize\b/g, "ionise"], [/\bionizing\b/g, "ionising"],
    [/\bcenter\b/g, "centre"], [/\bcolor\b/g, "colour"]
  ];

  // Apostrophe-style accent input: e' -> è, e'' -> é, etc.
  //
  // The è' and È' rules are listed first because the live-rewriter fires on
  // every keystroke. Typing "e''" in sequence is staged as e -> e' -> è -> è'
  // (the second apostrophe is appended after è has already replaced e'). The
  // è' rule then upgrades the grave to acute so the user gets é. Without this,
  // typing e'' interactively gets stuck at è' because nothing matches that
  // two-character sequence.
  const ACCENT_FROM_APOSTROPHE = [
    [/è'/g, "é"], [/È'/g, "É"],
    [/e''/g, "é"], [/e'/g, "è"],
    [/E''/g, "É"], [/E'/g, "È"],
    [/a'/g, "à"],
    [/i'/g, "ì"],
    [/o'/g, "ò"],
    [/u'/g, "ù"],
    [/A'/g, "À"],
    [/I'/g, "Ì"],
    [/O'/g, "Ò"],
    [/U'/g, "Ù"]
  ];

  function normaliseAccentInput(s) {
    if (s == null) return "";
    let t = String(s);
    for (const [re, repl] of ACCENT_FROM_APOSTROPHE) t = t.replace(re, repl);
    return t;
  }

  function norm(s) {
    if (s == null) return "";
    let t = String(s);
    t = t.toLowerCase();
    t = t.replace(/[‘’‚‛]/g, "'")
         .replace(/[“”„‟]/g, '"');
    t = t.replace(/-/g, " ");
    for (const [c, e] of CONTRACTIONS) {
      const re = new RegExp("(^|[^a-z'])" + c.replace("'", "'") + "(?=[^a-z']|$)", "g");
      t = t.replace(re, "$1" + e);
    }
    for (const [re, repl] of SPELLING_FOLD) t = t.replace(re, repl);
    t = t.replace(/([\.,;:!?])(?=\s|$)/g, " ");
    t = t.replace(/[\t\n\r]+/g, " ").replace(/\s+/g, " ").trim();
    // NOTE: the PreIB engine stripped a leading definite/indefinite article
    // (the/a/an/il/lo/la/i/gli/le/un/uno/una) plus a space from the start.
    // That works for physics ("the proton" == "proton") but breaks Italian:
    // "lo" and "la" are clitic object pronouns at least as often as articles,
    // and stripping turned must_not_include="lo me" into "me", which then
    // substring-matched "melo" and fired a false positive. Article stripping
    // is removed; authors must include both forms in any_phrases if they
    // want article-less acceptance.
    // Italian elision: l'amico -> l amico
    t = t.replace(/'/g, " ").replace(/\s+/g, " ").trim();
    return t;
  }

  // Accent folding: à -> a, è/é -> e, etc. Only for typo-tolerance fallback.
  function foldAccents(s) {
    return s
      .replace(/[àÀ]/g, "a")
      .replace(/[èéÈÉ]/g, "e")
      .replace(/[ìÌ]/g, "i")
      .replace(/[òÒ]/g, "o")
      .replace(/[ùÙ]/g, "u");
  }

  function normAccentFolded(s) {
    return foldAccents(norm(s));
  }

  function includesNeedle(haystackNorm, needle) {
    const n = norm(needle);
    if (!n) return false;
    return haystackNorm.indexOf(n) !== -1;
  }

  function includesAny(haystackNorm, anyArr) {
    if (!Array.isArray(anyArr)) return false;
    for (const phrase of anyArr) {
      if (includesNeedle(haystackNorm, phrase)) return true;
    }
    return false;
  }

  LL.norm = norm;
  LL.normAccentFolded = normAccentFolded;
  LL.foldAccents = foldAccents;
  LL.normaliseAccentInput = normaliseAccentInput;
  LL.includesNeedle = includesNeedle;
  LL.includesAny = includesAny;
})();
