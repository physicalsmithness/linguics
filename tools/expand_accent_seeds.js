/* Variant pipeline: expand AccentAuthor seed frames into grammar_questions_accent.json
   QoderWork 2026-07-22
   Reads: incoming drafts/accent_seed_v0.json
   Writes: data/grammar_questions_accent.json
   Per DECISIONS 2026-07-20 A(a): mechanical expansion, provenance-tagged. */

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const seedPath = path.join(root, "incoming drafts", "accent_seed_v0.json");
const outPath = path.join(root, "data", "grammar_questions_accent.json");

const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
const items = [];
let counter = 0;

function nextId(prefix) {
  counter++;
  return prefix + "_" + String(counter).padStart(3, "0");
}

// Accent manipulation helpers
function stripAccents(s) {
  return s.replace(/[àá]/g, "a").replace(/[èé]/g, "e").replace(/[ìí]/g, "i")
          .replace(/[òó]/g, "o").replace(/[ùú]/g, "u");
}
function graveToAcute(s) {
  return s.replace(/à/g, "á").replace(/è/g, "é").replace(/ì/g, "í")
          .replace(/ò/g, "ó").replace(/ù/g, "ú");
}
function acuteToGrave(s) {
  return s.replace(/á/g, "à").replace(/é/g, "è").replace(/í/g, "ì")
          .replace(/ó/g, "ò").replace(/ú/g, "ù");
}
function insertAccent(s) {
  // Add a grave accent to the final vowel (the tempting error for no_accent words)
  const m = s.match(/^(.*?)([aeiou])([^aeiou]*)$/i);
  if (!m) return s + "\u0300"; // fallback
  return m[1] + m[2].replace(/a/g,"à").replace(/e/g,"è").replace(/i/g,"ì").replace(/o/g,"ò").replace(/u/g,"ù") + m[3];
}
function accentType(s) {
  const m = s.match(/[àèéìòù]/);
  return m ? m[0] : null;
}

function makeItem(id, prompt, choices, answerIdx, bucket, label, explanation, subtopic, choiceTags) {
  return {
    external_id: id,
    prompt: prompt,
    type: "mcq",
    choices: choices,
    answer_index: answerIdx,
    markpoints: [{ order_index: 0, credit: 1.0, bucket: bucket, label: label }],
    explanation: explanation,
    topic: "orthography",
    subtopic: subtopic,
    info_display: "suppress",
    language_code: "it",
    choice_tags: choiceTags || choices.map(() => null),
    generated_by: "variant",
    version: 1
  };
}

// ---- Frame 1: acc_pick_bare ----

// che_compound: target(acute) + gravemark(wrong_kind) + stripped(omitted)
for (const word of seed.class_seeds.che_compound.seed) {
  const stripped = stripAccents(word);
  const wrongKind = acuteToGrave(word); // perché -> perchè
  const choices = [word, wrongKind, stripped];
  const id = nextId("acc_bare_che");
  items.push(makeItem(
    id,
    "Which is spelled correctly?",
    choices, 0,
    "orthography.accent.italian.wrong_mark",
    "Acute accent on -ché compounds",
    `\u201c${word}\u201d always takes an acute accent (é). \u201c${wrongKind}\u201d (grave) and \u201c${stripped}\u201d (no accent) are both wrong.`,
    "accent.che_compound",
    [null, { class: "wrong_kind", misconception: "accent.wrong_mark.grave_for_acute", proposed: true }, { class: "omitted", misconception: "accent.missing.accent_omitted", proposed: true }]
  ));
}

// lexical_final: target + stripped(omitted) + wrongmark where applicable
const lexicalWords = [];
for (const fam of Object.values(seed.class_seeds.lexical_final.subfamilies)) {
  for (const w of fam) lexicalWords.push(w);
}
for (const word of lexicalWords) {
  const stripped = stripAccents(word);
  const choices = [word, stripped];
  const tags = [null, { class: "omitted", misconception: "accent.missing.accent_omitted", proposed: true }];
  // Add wrong_kind distractor if the final vowel can take both grave and acute
  const lastChar = word[word.length - 1];
  if ("èé".includes(lastChar)) {
    const wrongKind = lastChar === "è" ? word.slice(0, -1) + "é" : word.slice(0, -1) + "è";
    choices.push(wrongKind);
    tags.push({ class: "wrong_kind", misconception: "accent.wrong_mark.acute_for_grave", proposed: true });
  }
  const id = nextId("acc_bare_lex");
  items.push(makeItem(
    id,
    "Which is spelled correctly?",
    choices, 0,
    "orthography.accent.italian.missing",
    "Final accent on " + word,
    `\u201c${word}\u201d carries a fixed accent on the final vowel. \u201c${stripped}\u201d (no accent) is wrong.`,
    "accent.lexical_final",
    tags
  ));
}

// no_accent: target(bare, correct) + inserted(accented temptation)
for (const word of seed.class_seeds.no_accent.seed) {
  const inserted = insertAccent(word);
  const choices = [word, inserted];
  const id = nextId("acc_bare_noacc");
  items.push(makeItem(
    id,
    "Which is spelled correctly?",
    choices, 0,
    "orthography.accent.italian.added",
    "No accent on " + word,
    `\u201c${word}\u201d is a monosyllable that never takes an accent. \u201c${inserted}\u201d is wrong \u2014 no accent needed here.`,
    "accent.no_accent",
    [null, { class: "inserted", misconception: "accent.added.unnecessary_accent", proposed: true }]
  ));
}

// apostrophe_not_accent: target(apostrophe) + accentform + bare
for (const entry of seed.class_seeds.apostrophe_not_accent.seed) {
  const choices = [entry.target, ...entry.errors];
  const tags = [null];
  for (const err of entry.errors) {
    if (/[àèéìòù]/.test(err)) tags.push({ class: "inserted_as_accent", misconception: "accent.wrong_mark.accent_for_apostrophe", proposed: true });
    else tags.push({ class: "omitted", misconception: "accent.missing.apostrophe_omitted", proposed: true });
  }
  const id = nextId("acc_bare_apos");
  items.push(makeItem(
    id,
    "Which is spelled correctly?",
    choices, 0,
    "orthography.accent.italian.wrong_mark",
    "Apostrophe, not accent: " + entry.target,
    `\u201c${entry.target}\u201d takes an apostrophe (truncation), not an accent. ${entry.gloss}.`,
    "accent.apostrophe_not_accent",
    tags
  ));
}

// ---- Frame 2: acc_pick_context ----

// meaning_pair: each pair × each carrier direction
for (const pair of seed.class_seeds.meaning_pair.pairs) {
  // Carriers forcing the accented form
  for (const carrier of pair.carriers_force_accented) {
    const prompt = carrier.it.replace("___", "____") + "  (" + carrier.en + ")";
    const choices = [pair.accented, pair.bare];
    const id = nextId("acc_ctx_mp");
    items.push(makeItem(
      id,
      prompt,
      choices, 0,
      "orthography.accent.italian.missing",
      pair.accented + " (" + pair.gloss_accented + ") vs " + pair.bare + " (" + pair.gloss_bare + ")",
      `\u201c${pair.accented}\u201d (with accent) means \u201c${pair.gloss_accented}\u201d; \u201c${pair.bare}\u201d without the accent means \u201c${pair.gloss_bare}\u201d.`,
      "accent.meaning_pair",
      [null, { class: "omitted", misconception: "accent.missing.meaning_pair_bare_chosen", proposed: true }]
    ));
  }
  // Carriers forcing the bare form
  for (const carrier of pair.carriers_force_bare) {
    const prompt = carrier.it.replace("___", "____") + "  (" + carrier.en + ")";
    const choices = [pair.bare, pair.accented];
    const id = nextId("acc_ctx_mp");
    items.push(makeItem(
      id,
      prompt,
      choices, 0,
      "orthography.accent.italian.added",
      pair.bare + " (" + pair.gloss_bare + ") vs " + pair.accented + " (" + pair.gloss_accented + ")",
      `\u201c${pair.bare}\u201d (no accent) means \u201c${pair.gloss_bare}\u201d; \u201c${pair.accented}\u201d with the accent means \u201c${pair.gloss_accented}\u201d.`,
      "accent.meaning_pair",
      [null, { class: "inserted", misconception: "accent.added.meaning_pair_accented_chosen", proposed: true }]
    ));
  }
}

// tense_bearing: remoto + futuro seeds
const tenseSeeds = [...seed.class_seeds.tense_bearing.remoto_3sg_seed, ...seed.class_seeds.tense_bearing.futuro_accent_drop_seed];
for (const entry of tenseSeeds) {
  const prompt = entry.carrier.it.replace("___", "____") + "  (" + entry.carrier.en + ")";
  const choices = [entry.target, entry.stripped];
  const id = nextId("acc_ctx_tense");
  items.push(makeItem(
    id,
    prompt,
    choices, 0,
    "orthography.accent.italian.missing",
    entry.target + " (" + entry.verb + ", past/future) vs " + entry.stripped + " (present)",
    `\u201c${entry.target}\u201d (accented) is the past/future form of ${entry.verb}; \u201c${entry.stripped}\u201d (no accent) is the present tense.`,
    "accent.tense_bearing",
    [null, { class: "omitted", misconception: "accent.missing.tense_accent_dropped", proposed: true }]
  ));
}

// ---- Frame 3: acc_judge (Yes/No binary) ----
// Generate for che_compound + lexical_final + no_accent (the bare-frame classes)

function judgeItem(word, shownForm, isCorrect, subtopic, bucket, explanation) {
  const id = nextId("acc_judge");
  const choices = ["Correct", "Incorrect"];
  const answerIdx = isCorrect ? 0 : 1;
  return makeItem(
    id,
    "Is this spelled correctly?  " + shownForm,
    choices, answerIdx,
    bucket,
    "Judgement: " + shownForm,
    explanation,
    subtopic,
    isCorrect ? [null, null] : [null, null]
  );
}

// che_compound judgements
for (const word of seed.class_seeds.che_compound.seed) {
  const wrongKind = acuteToGrave(word);
  items.push(judgeItem(word, word, true, "accent.che_compound", "orthography.accent.italian.wrong_mark",
    `\u201c${word}\u201d is correct \u2014 acute accent on -ché.`));
  items.push(judgeItem(word, wrongKind, false, "accent.che_compound", "orthography.accent.italian.wrong_mark",
    `\u201c${wrongKind}\u201d is wrong \u2014 -ché compounds take acute (é), not grave (è).`));
}

// lexical_final judgements (sample: show correct + show stripped)
for (const word of lexicalWords) {
  const stripped = stripAccents(word);
  items.push(judgeItem(word, word, true, "accent.lexical_final", "orthography.accent.italian.missing",
    `\u201c${word}\u201d is correct \u2014 final accent required.`));
  items.push(judgeItem(word, stripped, false, "accent.lexical_final", "orthography.accent.italian.missing",
    `\u201c${stripped}\u201d is wrong \u2014 this word requires a final accent: ${word}.`));
}

// no_accent judgements
for (const word of seed.class_seeds.no_accent.seed) {
  const inserted = insertAccent(word);
  items.push(judgeItem(word, word, true, "accent.no_accent", "orthography.accent.italian.added",
    `\u201c${word}\u201d is correct \u2014 no accent on this monosyllable.`));
  items.push(judgeItem(word, inserted, false, "accent.no_accent", "orthography.accent.italian.added",
    `\u201c${inserted}\u201d is wrong \u2014 ${word} never takes an accent.`));
}

// ---- Write output (flat array, matching grammar_questions_*.json convention) ----
fs.writeFileSync(outPath, JSON.stringify(items, null, 1), "utf8");
console.log("Written " + items.length + " items to " + outPath);
console.log("  pick_bare: " + items.filter(i => i.external_id.startsWith("acc_bare")).length);
console.log("  pick_context: " + items.filter(i => i.external_id.startsWith("acc_ctx")).length);
console.log("  judge: " + items.filter(i => i.external_id.startsWith("acc_judge")).length);
