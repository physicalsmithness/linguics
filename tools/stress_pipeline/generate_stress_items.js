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

// CODEX 2026-07-23: explain the linguistic cue, not merely the label.
// Stress is not fully predictable in Italian.  Productive affixes and
// inflectional cells deserve a real rule; lexical items deserve an honest
// statement that their stress must be learned, backed by the verified
// dictionary pronunciation.
const STRESS_POSITION_NAMES = [
  "last", "penultimate", "antepenultimate", "pre-antepenultimate"
];

const MECHANISM_REASONS = {
  accent_final:
    "The written accent marks the stressed final vowel directly.",
  suffix_issimo:
    "The productive -issimo/-issima family follows an antepenultimate stress pattern.",
  suffix_abile:
    "Adjectives in -abile normally follow the sdrucciolo pattern, with stress before -bile.",
  suffix_ibile:
    "Adjectives in -ibile normally follow the sdrucciolo pattern, with stress before -bile.",
  suffix_evole:
    "Words in -evole/-evoli normally follow an antepenultimate stress pattern.",
  suffix_ologo:
    "Learned formations in -ologo/-ologa normally follow an antepenultimate stress pattern.",
  suffix_grafo:
    "Learned formations in -grafo/-grafa normally follow an antepenultimate stress pattern.",
  suffix_metro:
    "Learned formations in -metro/-metra normally follow an antepenultimate stress pattern.",
  suffix_zione:
    "The productive -zione/-zioni ending normally carries stress on the syllable before final -ne.",
  suffix_sione:
    "The productive -sione/-sioni ending normally carries stress on the syllable before final -ne.",
  suffix_mente:
    "Adverbs in -mente carry their main word stress on -men-; the base adjective may retain secondary stress.",
  suffix_mento:
    "The productive -mento/-menti ending normally carries stress on -men-.",
  suffix_tura:
    "The productive -tura/-ture ending normally carries stress on -tu-.",
  suffix_iere:
    "The -iere/-iera family normally carries stress in the ending and is piana.",
  suffix_anza:
    "The productive -anza/-anze ending normally carries stress on -an-.",
  suffix_enza:
    "The productive -enza/-enze ending normally carries stress on -en-.",
  suffix_ore:
    "The -tore/-trice family normally carries stress in the derivational ending and is piana.",
  suffix_oso:
    "The productive -oso/-osa ending normally carries stress on its first vowel.",
  diminutive_ino_etto:
    "The productive diminutive endings -ino and -etto normally carry the stress.",
  augmentative_one:
    "The productive augmentative ending -one normally carries the stress.",
  suffix_ale_are:
    "The productive -ale/-ali ending normally follows a penultimate-stress pattern.",
  suffix_ia_learned:
    "In this learned -ìa family, final i and a are separate syllables (hiatus), and the i is stressed.",
  infinitive_are:
    "Regular infinitives in -are carry stress on the a of the infinitive ending.",
  infinitive_ire:
    "Regular infinitives in -ire carry stress on the i of the infinitive ending.",
  infinitive_ere_stem:
    "This belongs to the stem-stressed -ere infinitive group; Italian spelling does not reliably predict which -ere group a verb belongs to.",
  infinitive_ere_end:
    "This belongs to the ending-stressed -ere infinitive group; Italian spelling does not reliably predict which -ere group a verb belongs to.",
  present_3pl:
    "In a present-tense third-person plural form, final -no is unstressed and the stress remains in the verb stem; the exact stem syllable is lexical.",
  imperative_clitic:
    "The attached clitic pronouns are unstressed and do not move the imperative's original stress; they add syllables after it.",
  participle:
    "In this past-participle reading, the -ito pattern carries stress on i; the context distinguishes it from the identically spelled adverb.",
  function_word:
    "This spelling has another stress pattern with another meaning; the stated context selects this dictionary pronunciation.",
  etymological_learned:
    "This belongs to a learned Greek/Latin word pattern that commonly preserves antepenultimate stress."
};

function buildStressExplanation(entry, word, syllables, stressPos, stressClass, detail, unit) {
  const stressedIdx = syllables.length - stressPos;
  const stressedSyllable = syllables[stressedIdx];
  const pronunciation = syllables
    .map((s, i) => i === stressedIdx ? s.toLocaleUpperCase("it") : s)
    .join("-");

  let reason = MECHANISM_REASONS[detail];
  if (!reason && unit === "wordform" && String(entry.gloss || "").trim()) {
    reason =
      `The context “${String(entry.gloss).trim()}” selects this dictionary reading; ` +
      "the spelling alone does not determine its stress.";
  }
  if (!reason) {
    reason =
      "Italian spelling does not reliably predict the stress of this word; " +
      "its stress is lexical and must be learned with the word.";
  }

  const positionName = STRESS_POSITION_NAMES[stressPos - 1] || `${stressPos}th-from-last`;
  return `${reason} The verified pronunciation is ${pronunciation}: ` +
    `“${stressedSyllable}” is the ${positionName} syllable, so “${word}” is ${stressClass}.`;
}

// --- load data ---

const lemmaData = JSON.parse(fs.readFileSync(path.join(DATA, "stress_sidecar_lemma.json"), "utf8"));
const wordformData = JSON.parse(fs.readFileSync(path.join(DATA, "stress_sidecar_wordform.json"), "utf8"));

console.log(`Loaded ${lemmaData.length} lemma entries, ${wordformData.length} wordform entries`);

// --- generate items ---

const items = [];
let skippedMono = 0, skippedLow = 0, skippedBadSyl = 0, skippedUnverified = 0;
const counters = {}; // mechanism_detail counts

function processEntry(entry, unit) {
  const conf = entry.stress_confidence;
  if (conf === "low") { skippedLow++; return; }

  // CODEX 2026-07-23: high stress confidence is insufficient when the visible
  // syllable split was guessed. Drill only POS-aware Wiktionary hyphenations.
  const allowedSyllableSources = new Set(["wiktionary_hyphenation", "author_seed"]);
  if (!String(entry.verification_status || "").startsWith("verified") ||
      !allowedSyllableSources.has(entry.syllable_source)) {
    skippedUnverified++;
    return;
  }

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
  const explanation = buildStressExplanation(
    entry, word, syllables, stressPos, stressClass, detail, unit
  );

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

  // CODEX 2026-07-23: homographic wordforms require a contextual reading.
  // A bare "capitano" cannot tell the learner whether it means captain or
  // "they happen".
  const context = unit === "wordform" ? String(entry.gloss || "").trim() : "";
  const prompt = context ? `${word} — ${context}` : word;

  const item = {
    external_id: externalId,
    prompt: prompt,
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
    explanation: explanation,
    topic: "phonology",
    subtopic: `stress.${mechanism}.${detail}`,
    info_display: "suppress",
    language_code: "it",
    choice_tags: choiceTags,
    generated_by: "CODEX stress_pipeline",
    version: 2,
    // --- diagnostic metadata (report axes per Architecture→Housing v1 §2) ---
    stress_meta: {
      unit: unit,
      word: word,
      lemma: entry.lemma || null,
      // CODEX 2026-07-23: retain POS so future audits can reproduce the
      // homograph-safe dictionary lookup.
      pos: entry.pos || (unit === "wordform" ? "verb_or_contextual" : null),
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
      ,
      // CODEX 2026-07-23 provenance fields.
      verification_status: entry.verification_status,
      syllable_source: entry.syllable_source,
      verified_by: entry.verified_by || "CODEX 2026-07-23",
      context: context || null,
      explanation_basis: detail
    }
  };

  items.push(item);
  counters[detail] = (counters[detail] || 0) + 1;
}

// Process lemmas first, then wordforms
for (const entry of lemmaData) processEntry(entry, "lemma");
for (const entry of wordformData) processEntry(entry, "wordform");

// CODEX 2026-07-23: the vocabulary contains duplicate spellings. Keep one
// identical question, but quarantine any bare prompt that maps to conflicting
// answers or syllabifications.
let skippedDuplicate = 0, skippedAmbiguousPrompt = 0;
const promptGroups = new Map();
for (const item of items) {
  const key = item.prompt.toLocaleLowerCase("it");
  if (!promptGroups.has(key)) promptGroups.set(key, []);
  promptGroups.get(key).push(item);
}
const filteredItems = [];
for (const group of promptGroups.values()) {
  const signatures = new Set(group.map(item =>
    JSON.stringify({ choices: item.choices, answer_index: item.answer_index })
  ));
  if (signatures.size > 1) {
    skippedAmbiguousPrompt += group.length;
    continue;
  }
  filteredItems.push(group[0]);
  skippedDuplicate += group.length - 1;
}
items.length = 0;
items.push(...filteredItems);

// --- write output ---

const outPath = path.join(DATA, "grammar_questions_stress.json");
fs.writeFileSync(outPath, JSON.stringify(items, null, 1), "utf8");

console.log(`\nGenerated ${items.length} stress drill items -> ${outPath}`);
console.log(`Skipped: ${skippedLow} low-confidence, ${skippedUnverified} unverified boundaries, ${skippedMono} monosyllable, ${skippedBadSyl} bad-syllable/out-of-range, ${skippedDuplicate} duplicates, ${skippedAmbiguousPrompt} ambiguous bare prompts`);
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
