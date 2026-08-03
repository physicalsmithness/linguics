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

  // Apostrophe-style accent input, as an ESCALATION (Smith 2026-07-21, thread
  // AccentAuthor_Housing_apostrophe_input). For every vowel:
  //
  //     1 apostrophe   -> grave                  e + 1  ->  e-grave
  //     2 apostrophes  -> acute                  e + 2  ->  e-acute
  //     3 apostrophes  -> a LITERAL apostrophe   e + 3  ->  e then a real quote
  //
  // and 4+ give (n-2) literal apostrophes, so it degrades monotonically. Three
  // is uniform across every vowel, so the rule is one sentence a learner can
  // hold: "three apostrophes always gives you a real apostrophe".
  //
  // This replaces BOTH the old sequential rule list and the hardcoded apocope
  // allow-list, for two separate reasons.
  //
  // 1. The old list was applied in order, so a later rule silently UNDID an
  //    earlier one: the grave-plus-apostrophe escape ran BEFORE the plain
  //    vowel-plus-apostrophe rule, which converted the escape straight back to
  //    an accent. Verified by simulating progressive typing (the rewriter fires
  //    per keystroke): every escape was dead. po x3 gave p + o-grave, e x3 gave
  //    e-grave, citta x2 gave citta with an a-grave. The accent bar has been
  //    advertising the three-apostrophe escape under an input where it has
  //    never once worked.
  //
  // 2. The allow-list reserved exactly va/da/fa/sta/di + apostrophe behind a
  //    private-use sentinel, so the COMMONER indicative forms da-grave and
  //    di-grave could not be typed by shortcut at all, while po, be, mo and to
  //    - absent from the list - were silently corrupted into po-grave and
  //    friends: precisely the error the accent drill exists to correct. A list
  //    of apocope words can never be complete. An escalation needs no list.
  //
  // ONE atomic pass: match a vowel (bare OR already accented, because the live
  // rewriter fires per keystroke and the buffer already holds the accent from
  // the previous one) together with its whole following run of apostrophes,
  // total the level, and emit once. Nothing can undo anything, because nothing
  // runs twice.
  //
  // Apostrophes after a CONSONANT are never touched, so elisions pass through
  // exactly as typed: l'amico, un'amica, dell'anno, quell'uomo.
  //
  // Length is not preserved (2 chars in, 1 out), but the sole caller computes
  // its caret delta from the actual length difference, so that is already safe.
  const GRAVE = { a: "à", e: "è", i: "ì", o: "ò", u: "ù",
                  A: "À", E: "È", I: "Ì", O: "Ò", U: "Ù" };
  const ACUTE = { a: "á", e: "é", i: "í", o: "ó", u: "ú",
                  A: "Á", E: "É", I: "Í", O: "Ó", U: "Ú" };
  // accented character -> [base vowel, how many apostrophes it already stands for]
  const ACCENT_LEVEL = {};
  for (const k of Object.keys(GRAVE)) {
    ACCENT_LEVEL[GRAVE[k]] = [k, 1];
    ACCENT_LEVEL[ACUTE[k]] = [k, 2];
  }
  const VOWEL_RUN = new RegExp(
    "([aeiouAEIOU" +
    "àèìòùÀÈÌÒÙ" +
    "áéíóúÁÉÍÓÚ" +
    "])('+)", "g");

  function normaliseAccentInput(s) {
    if (s == null) return "";
    return String(s).replace(VOWEL_RUN, function (m, ch, aps) {
      var base = ch, level = 0;
      if (ACCENT_LEVEL[ch]) { base = ACCENT_LEVEL[ch][0]; level = ACCENT_LEVEL[ch][1]; }
      level += aps.length;
      if (level === 1) return GRAVE[base];
      if (level === 2) return ACUTE[base];
      var out = base;
      for (var i = 0; i < level - 2; i++) out += "'";
      return out;
    });
  }
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
  // defaultMatchAt: a MARKPOINT-level match_at, used for any phrase that does
  // not carry its own. Anchoring is per-phrase by design, but authors write it
  // at markpoint level too, and until now that was SILENTLY IGNORED - the
  // author saw an anchor in their data, the engine applied none, and nothing
  // said so. 64 markpoints across 32 passato-prossimo items were in exactly
  // that state, and the consequence was live false credit: with `any: ["ho",
  // "parlato"]` anchored at markpoint level, "ho parlatoo" and even
  // "hoparlato" both scored full marks, because the correct string sits inside
  // the wrong one and nothing enforced the boundary.
  //
  // A per-phrase match_at still wins, so nothing already anchored changes. This
  // only makes the two spellings mean the same thing, which is what every
  // author who wrote the markpoint-level form already believed.
  function findMatchingPhrase(haystackNorm, anyArr, caseSensitive, defaultMatchAt) {
    if (!Array.isArray(anyArr)) return null;
    for (const phrase of anyArr) {
      const isObj = typeof phrase === "object" && phrase;
      const phraseStr = (isObj && phrase.phrase) ? phrase.phrase : phrase;
      const matchAt = (isObj && phrase.match_at) ? phrase.match_at : defaultMatchAt;
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
