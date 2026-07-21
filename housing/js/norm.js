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

  // Apostrophe-style accent input: e' -> è, e'' -> é, e''' -> e' (literal).
  //
  // The è' and È' rules are listed first because the live-rewriter fires on
  // every keystroke. Typing "e''" in sequence is staged as e -> e' -> è -> è'
  // (the second apostrophe is appended after è has already replaced e'). The
  // è' rule then upgrades the grave to acute so the user gets é. Without this,
  // typing e'' interactively gets stuck at è' because nothing matches that
  // two-character sequence.
  // Triple-apostrophe (Smith 2026-07-21): after acute is formed, a further
  // apostrophe downgrades to a literal vowel + apostrophe (e''' -> e').
  const ACCENT_FROM_APOSTROPHE = [
    [/é'/g, "e'"], [/É'/g, "E'"],   // triple: acute + ' -> literal
    [/à'/g, "a'"], [/À'/g, "A'"],   // (grave + ' would be acute, handled below)
    [/ì'/g, "i'"], [/Ì'/g, "I'"],
    [/ò'/g, "o'"], [/Ò'/g, "O'"],
    [/ù'/g, "u'"], [/Ù'/g, "U'"],
    [/è'/g, "é"], [/È'/g, "É"],     // double: grave + ' -> acute
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

  // Apocopated tu-imperatives whose trailing apostrophe is an apocope marker,
  // NOT an accent shortcut: va' da' fa' sta' di'. Word-start anchored so a
  // mid-word coincidence isn't caught. See inter_chat/
  // Architecture_Housing_marker_match_at_and_apocope.md.
  // Apocopated tu-imperatives whose trailing apostrophe is an apocope marker,
  // NOT an accent shortcut: va' da' fa' sta' di'. Word-start anchored so a
  // mid-word coincidence isn't caught. See inter_chat/
  // Architecture_Housing_marker_match_at_and_apocope.md.
  const APOCOPE_IMPERATIVES = /(^|[^a-zà-ùA-ZÀ-Ù])(va'|da'|fa'|sta'|di')/gi;
  // Private-use sentinel that never appears in learner input; swapped in for the
  // apocope apostrophe so the accent rules (which key off ') skip it, then
  // restored. One char in, one char out, so overall length is preserved and the
  // caller's caret-delta maths is unaffected.
  const APOCOPE_MARK = String.fromCharCode(0xE000);

  function normaliseAccentInput(s) {
    if (s == null) return "";
    let t = String(s);
    // Tradeoff: the apostrophe shortcut can no longer produce da-grave / di-grave
    // for these exact spellings; those stay typeable via the accent bar.
    t = t.replace(APOCOPE_IMPERATIVES, function (m, pre, word) {
      return pre + word.slice(0, -1) + APOCOPE_MARK;
    });
    for (const [re, repl] of ACCENT_FROM_APOSTROPHE) t = t.replace(re, repl);
    t = t.split(APOCOPE_MARK).join("'");
    return t;
  }

  // Core normalisation. `lower` is false for the case-preserving variant used
  // by case_sensitive markpoints (formal-capitalisation items: La/la, Sua/sua).
  // See inter_chat/Architecture_Housing_case_sensitive_markpoints.md.
  function normCore(s, lower) {
    if (s == null) return "";
    let t = String(s);
    if (lower) t = t.toLowerCase();
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
  function norm(s) { return normCore(s, true); }
  function normCased(s) { return normCore(s, false); }

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

  // Boundary-aware occurrence test. Both args are already normalised (space-
  // separated, no apostrophes/punctuation). matchAt:
  //   "end"   phrase must end at a word boundary (end-of-string or a space)
  //   "start" phrase must start at a word boundary
  //   "word"  both
  //   anything else / undefined -> plain substring (back-compat default)
  // This is what makes short answers safe when a correct form is a prefix of a
  // wrong one (abbi inside abbia, sta inside stai). See inter_chat/
  // Architecture_Housing_marker_match_at_and_apocope.md.
  function occursAt(haystack, n, matchAt) {
    if (!n) return false;
    if (matchAt !== "end" && matchAt !== "start" && matchAt !== "word") {
      return haystack.indexOf(n) !== -1;
    }
    let from = 0;
    for (;;) {
      const idx = haystack.indexOf(n, from);
      if (idx === -1) return false;
      const startOk = idx === 0 || haystack[idx - 1] === " ";
      const endPos = idx + n.length;
      const endOk = endPos >= haystack.length || haystack[endPos] === " ";
      if ((matchAt === "end" && endOk) ||
          (matchAt === "start" && startOk) ||
          (matchAt === "word" && startOk && endOk)) return true;
      from = idx + 1;
    }
  }

  function includesNeedle(haystackNorm, needle, matchAt, caseSensitive) {
    const n = caseSensitive ? normCased(needle) : norm(needle);
    return occursAt(haystackNorm, n, matchAt);
  }

  // Phrase entries in an any_phrases array can be either:
  //   - a bare string: matched as a substring of the (normed) haystack
  //   - an object { phrase, credit?, note? }: phrase is the matchable string,
  //     credit is per-phrase credit weight (default 1, may be fractional),
  //     note is an optional pedagogical annotation surfaced in the result panel.
  //
  // findMatchingPhrase returns the MATCHED ENTRY (the original object or string)
  // so the caller can read per-phrase credit / note off it. Returns null on no
  // match. Use this when graded credit matters; includesAny stays for the
  // boolean-only callers.
  function findMatchingPhrase(haystackNorm, anyArr, caseSensitive) {
    if (!Array.isArray(anyArr)) return null;
    for (const phrase of anyArr) {
      const isObj = typeof phrase === "object" && phrase;
      const phraseStr = (isObj && phrase.phrase) ? phrase.phrase : phrase;
      const matchAt = isObj ? phrase.match_at : undefined;
      if (includesNeedle(haystackNorm, phraseStr, matchAt, caseSensitive)) {
        return phrase;
      }
    }
    return null;
  }

  function includesAny(haystackNorm, anyArr, caseSensitive) {
    return findMatchingPhrase(haystackNorm, anyArr, caseSensitive) !== null;
  }

  LL.norm = norm;
  LL.normCased = normCased;
  LL.normAccentFolded = normAccentFolded;
  LL.foldAccents = foldAccents;
  LL.normaliseAccentInput = normaliseAccentInput;
  LL.occursAt = occursAt;
  LL.includesNeedle = includesNeedle;
  LL.includesAny = includesAny;
  LL.findMatchingPhrase = findMatchingPhrase;
})();
