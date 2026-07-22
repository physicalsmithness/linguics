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

// Whole-word (space-bounded) occurrence test on already-normed text.
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
  .filter(f => /^grammar_questions_.*\.json$/.test(f) && !f.includes(".bak") && !f.includes(".merged."));

let totalItems = 0;
let totalFlagged = 0;
let totalExcluded = 0;
const hits = [];

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
          phrases.push({ raw: phraseStr, normed: norm(phraseStr), mp });
        }
      }
    }
    if (!phrases.length) continue;

    for (const p of phrases) {
      if (!p.normed) continue;
      if (!occursWholeWord(promptNorm, p.normed)) continue;

      // Exclusion: single-markpoint item where the flagged phrase IS the
      // whole answer (copying the cue produces a correct answer → harmless).
      const isSingleMp = item.markpoints.length === 1;
      const singleMpPhrases = isSingleMp && Array.isArray(item.markpoints[0].any_phrases)
        ? item.markpoints[0].any_phrases : [];
      const isWholeAnswer = isSingleMp && singleMpPhrases.length === 1;

      if (isWholeAnswer) {
        totalExcluded++;
        continue;
      }

      totalFlagged++;
      hits.push({
        file,
        external_id: item.external_id || "(no id)",
        topic: item.topic || "(no topic)",
        flagged_phrase: p.raw,
        prompt: item.prompt,
        markpoint_label: p.mp.label || "(no label)",
        num_markpoints: item.markpoints.length,
        num_any_phrases: singleMpPhrases.length || (Array.isArray(p.mp.any_phrases) ? p.mp.any_phrases.length : 0)
      });
    }
  }
}

// ── Report ───────────────────────────────────────────────────────────
console.log("=== ESTATE-NET GATE REPORT ===");
console.log("QoderWork 2026-07-22 | Spec: Cr17Sweep v5");
console.log(`Files scanned: ${files.length}`);
console.log(`Items scanned: ${totalItems}`);
console.log(`Excluded (single-mp whole-answer, harmless): ${totalExcluded}`);
console.log(`FLAGGED: ${totalFlagged}`);
console.log("");

if (hits.length) {
  // Group by topic
  const byTopic = {};
  for (const h of hits) {
    (byTopic[h.topic] || (byTopic[h.topic] = [])).push(h);
  }
  for (const topic of Object.keys(byTopic).sort()) {
    const group = byTopic[topic];
    console.log(`--- ${topic} (${group.length}) ---`);
    for (const h of group) {
      console.log(`  ${h.external_id}`);
      console.log(`    phrase: "${h.flagged_phrase}"  |  mp: ${h.markpoint_label}`);
      console.log(`    prompt: ${h.prompt}`);
      console.log(`    markpoints: ${h.num_markpoints}, any_phrases in mp: ${h.num_any_phrases}`);
    }
    console.log("");
  }
} else {
  console.log("Zero true positives. Gate is quiet, as calibrated by Cr17Sweep.");
}
