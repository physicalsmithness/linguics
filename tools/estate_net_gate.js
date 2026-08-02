/* Estate-net gate — criterion-20 cue-leak + answer-leak detector.
   QoderWork 2026-07-22
   Spec: Cr17Sweep v5 (inter_chat/Architecture_Cr17Sweep_sequencing.md).
   "Flag where a normalised any_phrase appears as its own punctuation-bounded
    token in the prompt, AND is not the item's whole single-markpoint answer
    equal to its cue."
   Second purpose: answer-leak detection (answer verbatim in prompt's other
   clause, silently under-testing).
   Ownership: Architecture runs it centrally. */

"use strict";
const fs = require("fs");
const path = require("path");

// ── Replicate norm.js normCore (lower=true) ──────────────────────────
const CONTRACTIONS = [
  ["can't","cannot"],["doesn't","does not"],["isn't","is not"],
  ["won't","will not"],["wouldn't","would not"],["shouldn't","should not"],
  ["couldn't","could not"],["didn't","did not"],
  ["haven't","have not"],["hasn't","has not"],["hadn't","had not"],
  ["aren't","are not"],["weren't","were not"]
];
const SPELLING_FOLD = [
  [/\bionize\b/g,"ionise"],[/\bionizing\b/g,"ionising"],
  [/\bcenter\b/g,"centre"],[/\bcolor\b/g,"colour"]
];

function norm(s) {
  if (s == null) return "";
  let t = String(s).toLowerCase();
  t = t.replace(/[''‚‛]/g, "'").replace(/[""„‟]/g, '"');
  t = t.replace(/-/g, " ");
  for (const [c, e] of CONTRACTIONS) {
    const re = new RegExp("(^|[^a-z'])" + c.replace("'", "'") + "(?=[^a-z']|$)", "g");
    t = t.replace(re, "$1" + e);
  }
  for (const [re, repl] of SPELLING_FOLD) t = t.replace(re, repl);
  t = t.replace(/([\.,;:!?])(?=\s|$)/g, " ");
  t = t.replace(/[\t\n\r]+/g, " ").replace(/\s+/g, " ").trim();
  t = t.replace(/'/g, " ").replace(/\s+/g, " ").trim();
  return t;
}

// ── Matchers ─────────────────────────────────────────────────────────
// v2 2026-08-02: the v1 matcher tested for SPACE-bounded tokens, but the gate's
// own spec (header, and Cr17Sweep v5) says PUNCTUATION-bounded. Cue glosses are
// bounded by brackets, parens and quotes, not spaces, so "(nessuno)" never
// presented "nessuno" as a token and the gate returned CLEAN on a live leak.
// Ruled 2026-08-02 (Smith, ratifying PassiveAuthor criterion20_cue_leak).
const WORDCH = /[\p{L}\p{N}]/u;
function boundaryOk(s, i) { return i < 0 || i >= s.length || !WORDCH.test(s[i]); }

// Tier A/B test: needle appears bounded by anything that is not a letter/digit.
function occursTokenBounded(haystack, needle) {
  if (!needle) return false;
  let from = 0;
  for (;;) {
    const idx = haystack.indexOf(needle, from);
    if (idx === -1) return false;
    if (boundaryOk(haystack, idx - 1) && boundaryOk(haystack, idx + needle.length)) return true;
    from = idx + 1;
  }
}

// Tier C test: plain substring, no boundary condition at all. Advisory only —
// this is deliberately over-sensitive ("la" inside "parla") and exists so that
// nothing is invisible, not so that anyone acts on it unread.
function occursSubstring(haystack, needle) {
  return !!needle && haystack.indexOf(needle) !== -1;
}

// v1 behaviour, retained ONLY so the v2 run is comparable with the 2026-07-22 report.
function occursWholeWord(haystack, needle) {
  if (!needle) return false;
  let from = 0;
  for (;;) {
    const idx = haystack.indexOf(needle, from);
    if (idx === -1) return false;
    const startOk = idx === 0 || haystack[idx - 1] === " ";
    const endPos = idx + needle.length;
    const endOk = endPos >= haystack.length || haystack[endPos] === " ";
    if (startOk && endOk) return true;
    from = idx + 1;
  }
}

// ── Scan ─────────────────────────────────────────────────────────────
const dataDir = path.join(__dirname, "..", "data");
const files = fs.readdirSync(dataDir)
  .filter(f => /^grammar_questions_.*\.json$/.test(f) && !f.includes(".bak") && !f.includes(".merged.")
            && !f.includes("_stress"));   // stress corpus is machine-generated, not authored prompts

let totalItems = 0;
const A = [];   // answer-leak alongside other markpoints (v1's flag class)
const B = [];   // NON-DIAGNOSTIC: single-markpoint item whose only answer sits in the prompt
const C = [];   // advisory: plain-substring only, not token-bounded
const S = [];   // soft: cue matches a phrase accepted at PARTIAL credit only
let v1WouldFlag = 0;   // what the 2026-07-22 run saw, for comparison

for (const file of files) {
  let data;
  try { data = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8")); }
  catch (e) { console.error("SKIP (parse error):", file, e.message); continue; }
  const items = data.items || data;
  if (!Array.isArray(items)) { console.error("SKIP (no items array):", file); continue; }

  for (const item of items) {
    totalItems++;
    if (!Array.isArray(item.markpoints)) continue;
    const promptNorm = norm(item.prompt || "");
    if (!promptNorm) continue;

    // Collect all any_phrase strings across all markpoints
    const phrases = [];
    for (const mp of item.markpoints) {
      if (!Array.isArray(mp.any_phrases)) continue;
      for (const entry of mp.any_phrases) {
        const phraseStr = (typeof entry === "object" && entry && entry.phrase) ? entry.phrase : entry;
        if (typeof phraseStr === "string" && phraseStr.trim()) {
          const cr = (typeof entry === "object" && entry && typeof entry.credit === "number") ? entry.credit : 1;
          phrases.push({ raw: phraseStr, normed: norm(phraseStr), mp, credit: cr });
        }
      }
    }
    if (!phrases.length) continue;

    for (const p of phrases) {
      if (!p.normed) continue;

      const tokenHit = occursTokenBounded(promptNorm, p.normed);
      const subHit   = tokenHit || occursSubstring(promptNorm, p.normed);
      if (!subHit) continue;

      const isSingleMp = item.markpoints.length === 1;
      const singleMpPhrases = isSingleMp && Array.isArray(item.markpoints[0].any_phrases)
        ? item.markpoints[0].any_phrases : [];
      const isWholeAnswer = isSingleMp && singleMpPhrases.length === 1;

      if (occursWholeWord(promptNorm, p.normed) && !isWholeAnswer) v1WouldFlag++;

      const rec = {
        file,
        external_id: item.external_id || "(no id)",
        topic: item.topic || "(no topic)",
        flagged_phrase: p.raw,
        prompt: item.prompt,
        markpoint_label: p.mp.label || "(no label)",
        num_markpoints: item.markpoints.length,
        type: item.type || "short",
        credit: p.credit
      };

      // Tier B is NOT an exclusion. v1 treated "the cue IS the whole answer" as
      // harmless because copying the cue yields a correct mark. That is exactly
      // backwards: such an item marks correctly and tests NOTHING. 158 items were
      // made invisible by it, ind_nn_06 among them.
      if (!tokenHit) { C.push(rec); continue; }
      if (isWholeAnswer) { B.push(rec); continue; }
      if (p.credit < 1) { S.push(rec); continue; }   // cue matches only a GRADED tolerance
      A.push(rec);
    }
  }
}

// ── Report ───────────────────────────────────────────────────────────
function dump(title, arr, note) {
  console.log(`=== ${title} (${arr.length}) ===`);
  if (note) console.log(note);
  const byTopic = {};
  for (const h of arr) (byTopic[h.topic] || (byTopic[h.topic] = [])).push(h);
  for (const topic of Object.keys(byTopic).sort()) {
    const g = byTopic[topic];
    console.log(`--- ${topic} (${g.length}) ---`);
    for (const h of g) {
      console.log(`  ${h.external_id} [${h.type}] phrase: "${h.flagged_phrase}" | mp: ${h.markpoint_label} | mps: ${h.num_markpoints}`);
      console.log(`    prompt: ${h.prompt}`);
    }
  }
  console.log("");
}

console.log("=== ESTATE-NET GATE REPORT v2 ===");
console.log("Architecture 2026-08-02 | punctuation-bounded matcher | Tier-B exclusion removed");
console.log(`Files scanned: ${files.length}`);
console.log(`Items scanned: ${totalItems}`);
console.log("");
console.log(`v1 (space-bounded, old exclusion) would flag : ${v1WouldFlag}`);
console.log(`TIER A  answer-leak, item has other markpoints: ${A.length}`);
console.log(`TIER B  NON-DIAGNOSTIC single-markpoint items : ${B.length}`);
console.log(`TIER S  cue matches a PARTIAL-credit tolerance : ${S.length}`);
console.log(`TIER C  advisory substring-only (unbounded)   : ${C.length}`);
console.log("");
dump("TIER A — answer visible in prompt, item has other markpoints", A);
dump("TIER S — cue equals a phrase accepted only at PARTIAL credit (soft; item still docks)", S,
     "Usually legitimate: the cue supplies the base form per formation-supplies-the-trigger, and the base form is tolerated at reduced credit. Read, do not bulk-fix.");
dump("TIER B — the item's ONLY answer is in its own prompt (tests nothing)", B,
     "v1 excluded this entire class as 'harmless'. It is the opposite of harmless.");
console.log(`=== TIER C — advisory, substring-only (${C.length}) === (ids only)`);
console.log(C.map(h => h.external_id).join(", "));
