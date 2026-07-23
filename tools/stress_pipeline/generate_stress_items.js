// generate_stress_items.js — StressAuthor Deliverable 2: stress drill items
// QoderWork 2026-07-23
// Reads data/stress_sidecar_lemma.json + data/stress_sidecar_wordform.json
// Writes data/grammar_questions_stress.json
//
// Item shape (per DISPATCH_stress.md §Deliverable 2 + Architecture→Housing v1 §2):
//   type: "mcq", index-scored
//   choices: the word with each candidate syllable position emboldened (**syl**)
//   option set = every phonologically possible position, capped at 4
//   answer_index = stress_pos - 1 (0-indexed)
//   pulse extra_json: (true_pos, answered_pos, syllable_count)

const fs = require("fs");
const path = require("path");

const DATA = path.join(__dirname, "..", "..", "data");

// --- helpers ---

function boldify(syllables, stressIdx) {
  // Return the word with syllables[stressIdx] wrapped in **...**
  return syllables.map((s, i) => (i === stressIdx ? "**" + s + "**" : s)).join("");
}

function buildChoices(syllables, optionCount) {
  // Options ordered by stress_pos: 1=last, 2=penult, 3=antepenult, 4=fourth-last
  // stress_pos P means the stressed syllable is at array index (syllable_count - P)
  const n = syllables.length;
  const choices = [];
  for (let pos = 1; pos <= optionCount; pos++) {
    const sylIdx = n - pos; // array index of the syllable that would be stressed
    choices.push(boldify(syllables, sylIdx));
  }
  return choices;
}

// --- load data ---

const lemmaData = JSON.parse(fs.readFileSync(path.join(DATA, "stress_sidecar_lemma.json"), "utf8"));
const wordformData = JSON.parse(fs.readFileSync(path.join(DATA, "stress_sidecar_wordform.json"), "utf8"));

console.log(`Loaded ${lemmaData.length} lemma entries, ${wordformData.length} wordform entries`);

// --- generate items ---

const items = [];
let skippedMono = 0, skippedLow = 0, skippedBadSyl = 0;
const counters = {}; // mechanism_detail counts

function processEntry(entry, unit) {
  const conf = entry.stress_confidence;
  if (conf === "low") { skippedLow++; return; }

  // Pipeline bug: all 12 lemma-layer bisdrucciole are misclassified
  // (spazzolino, telefonino etc. are piana/sdrucciola, not bisdrucciola).
  // True bisdrucciole exist only at wordform level (3pl present of -are verbs).
  // QoderWork 2026-07-23
  if (unit === "lemma" && entry.stress_class === "bisdrucciola") { skippedBadSyl++; return; }

  const syllables = entry.syllables;
  if (!syllables || !Array.isArray(syllables) || syllables.length < 2) { skippedMono++; return; }
  if (syllables.some(s => typeof s !== "string" || s.length === 0)) { skippedBadSyl++; return; }

  const stressPos = entry.stress_pos;
  const sylCount = syllables.length;
  if (stressPos < 1 || stressPos > sylCount) { skippedBadSyl++; return; }

  const optionCount = Math.min(sylCount, 4);
  // If stress_pos > optionCount (e.g. a 5-syllable word with stress on 5th-from-last),
  // the correct answer isn't among the 4 options. Skip these (extremely rare).
  if (stressPos > optionCount) { skippedBadSyl++; return; }

  const word = unit === "wordform" ? entry.form : entry.lemma;
  const choices = buildChoices(syllables, optionCount);
  const answerIndex = stressPos - 1; // 0-indexed

  const mechanism = entry.stress_mechanism || "lexical";
  const detail = entry.stress_mechanism_detail || "lexical_simple";
  const accentCue = entry.accent_cue || false;
  const etymological = entry.etymological || false;
  const stressClass = entry.stress_class || "";
  const tags = entry.stress_tags || [];

  // Bucket: phonology.stress.<mechanism>.<detail>
  const bucket = `phonology.stress.${mechanism}.${detail}`;

  // External ID
  const prefix = unit === "wordform" ? "str_wf" : "str_lm";
  const seq = String(items.length + 1).padStart(5, "0");
  const externalId = `${prefix}_${detail}_${seq}`;

  // Choice tags: mark the correct answer null, others get the "wrong position" tag
  const choiceTags = choices.map((_, idx) => {
    if (idx === answerIndex) return null;
    const wrongPos = idx + 1; // the stress_pos this choice represents
    return {
      class: "wrong_position",
      true_pos: stressPos,
      answered_pos: wrongPos,
      misconception: `stress.confusion.${stressClass}_as_${["tronca","piana","sdrucciola","bisdrucciola"][wrongPos-1]}`
    };
  });

  const item = {
    external_id: externalId,
    prompt: word,
    type: "mcq",
    choices: choices,
    answer_index: answerIndex,
    markpoints: [
      {
        order_index: 0,
        credit: 1,
        bucket: bucket,
        label: `${stressClass} — ${detail.replace(/_/g, " ")}`
      }
    ],
    explanation: `"${word}" is ${stressClass}: stress falls on the ${["last","penultimate","antepenultimate","pre-antepenultimate"][stressPos-1]} syllable (${syllables[sylCount - stressPos]}).`,
    topic: "phonology",
    subtopic: `stress.${mechanism}.${detail}`,
    info_display: "suppress",
    language_code: "it",
    choice_tags: choiceTags,
    generated_by: "stress_pipeline",
    version: 1,
    // --- diagnostic metadata (report axes per Architecture→Housing v1 §2) ---
    stress_meta: {
      unit: unit,
      word: word,
      lemma: entry.lemma || null,
      stress_pos: stressPos,
      stress_class: stressClass,
      syllable_count: sylCount,
      syllables: syllables,
      stress_source: entry.stress_source || null,
      stress_confidence: conf,
      stress_mechanism: mechanism,
      stress_mechanism_detail: detail,
      etymological: etymological,
      accent_cue: accentCue,
      stress_tags: tags
    }
  };

  items.push(item);
  counters[detail] = (counters[detail] || 0) + 1;
}

// Process lemmas first, then wordforms
for (const entry of lemmaData) processEntry(entry, "lemma");
for (const entry of wordformData) processEntry(entry, "wordform");

// --- write output ---

const outPath = path.join(DATA, "grammar_questions_stress.json");
fs.writeFileSync(outPath, JSON.stringify(items, null, 1), "utf8");

console.log(`\nGenerated ${items.length} stress drill items -> ${outPath}`);
console.log(`Skipped: ${skippedLow} low-confidence, ${skippedMono} monosyllable, ${skippedBadSyl} bad-syllable/out-of-range`);
console.log(`\nBy mechanism detail (top 20):`);
Object.entries(counters).sort((a,b) => b[1]-a[1]).slice(0, 20).forEach(([k,v]) => console.log(`  ${k}: ${v}`));

// Class distribution
const classCounts = {};
items.forEach(it => { classCounts[it.stress_meta.stress_class] = (classCounts[it.stress_meta.stress_class]||0)+1; });
console.log(`\nBy stress class:`);
Object.entries(classCounts).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));

// Option-count distribution
const optCounts = {};
items.forEach(it => { const n = it.choices.length; optCounts[n] = (optCounts[n]||0)+1; });
console.log(`\nBy option count:`);
Object.entries(optCounts).sort((a,b) => Number(a[0])-Number(b[0])).forEach(([k,v]) => console.log(`  ${k} options: ${v}`));
