# REFERENCE: CEFR Italian placement-test harvest (2026-07-21)

Provenance: fan-out agents + this synthesis (the OIC-drill method). 7 sources requested; **6 harvested**
(Europass, OnlineItalianClub level test, SIAL, Conjuguemos, Transparent, ESL, italianlanguagetest.online);
**EU Academy (academy.europa.eu) is EU-Login SSO-gated — NOT harvested.** IP: patterns / coverage /
calibration / distractor-logic only, no verbatim item banks. Companion data produced this pass:
`incoming drafts/overregularisation_distractors_v1.json` (216 records, 91 lemmas, 338 distractors).

## 1. Item-shape catalogue (cross-source)
- **3/4-option single-blank MCQ** (all) — canon; per-gap closed set; trivial for the substring marker.
- **Verb-in-parenthesis cloze** (Europass Complete, Conjuguemos) — production; supply lemma, inflect in context.
- **Whole-sentence transformation MCQ** (Europass) — passive / reported speech; distractors embed tense/deixis/agreement errors.
- **ERROR-IDENTIFICATION** (Transparent Grammar II) — NEW shape: one wrong word in a full sentence, the 4 options are words FROM the sentence; pick the error. Recognition, not production. Trivial to mark (index).
- **Authentic-text READING COMPREHENSION** (Transparent, SIAL) — item type Linguics lacks: directions note / recipe / letter / article + detail-retrieval & inference Qs.
- **CHOOSE-THE-REACTION pragmatic MCQ** (Transparent) — situation -> appropriate exclamation/response.
- **Level-laddered separate tests + mastery gate** (SIAL, italianlanguagetest) — placement-by-mastery, not one raw score.
- **Tap-the-stressed-syllable** — our own planned stress drill (no external source; StressAuthor).

## 2. Verified coverage gaps  (FILL = green-lit by Smith 2026-07-21)
- **Interrogatives** (chi?/che?/quale?/quanto?/come?/dove?) — NO bucket exists (disk-verified). Europass A1/B1, Transparent. **FILL** (mint a home + commission).
- **Periodo ipotetico** (integrated 3-type se-clause) — 7 nodes scattered across tense_choice/condizionale/imperfect, no single owner (disk-verified). Europass, OIC, ESL, italianlanguagetest (hard). **FILL** (resolve ownership).
- **Orthography beyond accents** (double consonants, -cia/-cie, univerbation, spacing) — SIAL C1 battery. **FILL** (broaden the orthography axis).
- **Lexical / register discrimination** — paronym minimal pairs (accettare/accertare/accendere/accennare), register (mi scusi vs scusami). Transparent, SIAL, ESL. **FILL** (a vocab axis beyond frequency).
- **Connector+subjunctive & free-choice-indefinite+subjunctive** (qualora/malgrado/per quanto/benche/sebbene/nonostante/pur+gerundio; chiunque/qualunque cosa) — italianlanguagetest dense bank. Feeds connective + indefinite seats + the purpose-connective ruling. **HARVEST into those seats.**
- **Small morphology, verify then place:** participio assoluto, stare per + inf, futuro anteriore placement, bello/quello prenominal allomorphs.
- **PENDING SMITH (not auto-fill):** reading-comprehension item type (he leans no; examples captured §5); functional/pragmatic item type (he wants more — examples captured §5). Also NEW: the **error-identification** recognition shape (Transparent) is worth a design look.

## 3. Techniques worth stealing (feed the volume dispatch's MCQ distractors + misconception axis)
- **Over-regularisation distractor recipe** -> bank produced (`incoming drafts/overregularisation_distractors_v1.json`; use as INDEX-SCORED MCQ distractors, NOT must_not guards — 30 real-word collisions e.g. anno subset of hanno, "piu buono" is valid, bracci is valid).
- Auxiliary-swap foils; participle-agreement minimal pairs; clitic-cluster permutations; **non-word/phonetic** distractors (evavamo for eravamo); **paronym** minimal-pair sets; future/conditional minimal pair (andremo/andremmo).
- **CEFR spiral on one structure** (piacere at rising load) — a calibration ladder.
- **Grouped 27-exercise A1->C2 spine** (Europass Complete) — a scope-and-sequence to cross-check our CEFR tagging + item spread.
- Authentic-text clustering (one stimulus, many items); near-synonym cloze; a dedicated orthography battery; multi-select.

## 4. Reference-layer design note (Conjuguemos /tenses) — Smith's idea, not first priority
Per-node cheatsheet {rule prose + endings paradigm table + worked examples + member lexemes + a one-way "go practice" bridge}, in a SEPARATE section so reference and test are never co-open (satisfies Smith's constraint via the one-way bridge). Atomise reference nodes 1:1 with drill leaves.

## 5. Reading-comp & functional/pragmatic examples (paraphrased — for Smith's decision)
**Reading comprehension (Transparent):** (1) a directions note ("turn right at the junction, left after the 2nd light, bakery on the corner, no. 28") -> spatial detail retrieval; (2) a Sicilian pasta recipe -> which step is done to the aubergines (procedural); (3) a dated thank-you letter to a grandmother -> gift / plans (inference from personal text).
**Functional / pragmatic:** (1) choose-the-reaction — "My wallet was stolen in Rome" -> pick the sympathy exclamation, distractors are positive ("how nice/how cool"); (2) formal vs informal address — "Sir, could you tell me the time?" -> mi scusi over scusami; (3) politeness via conditional — "___ a coffee please" -> Vorrei over Voglio; "___ help me?" -> Potresti.

## 6. Per-source verdicts
- **Europass** HIGH — level-segmented A1-C2 + 150-item Complete spine; best for calibration + distractor engineering.
- **OnlineItalianClub level test** HIGH — 40-item A1-C1 ramp, misconception-shaped distractors, answer key in the JS.
- **Transparent** HIGH — only source with new item shapes (error-ID, authentic reading, choose-the-reaction) + paronym/interrogative/irregular-plural items.
- **SIAL** MEDIUM — contrasting model (level-laddering, authentic-text clustering, orthography battery); confirms C-level discriminators.
- **italianlanguagetest.online** MEDIUM — dense connector+subjunctive / free-choice-indefinite bank; CAUTION its subjunctive-tense answer keys are rigid/debatable (don't mine verbatim); level labels inflated.
- **ESL** LOW-MEDIUM — mostly canon; value = visible answer key + clean A1-C1 calibration + non-word distractors.
- **Conjuguemos** — vocab theme taxonomy (structure not data); Spanish-grammar activity design (lemma cue, tier laddering, revise loop); reference-layer template; Talkometer pronunciation (not pursued). Italian verb drills low value (confirmed Smith's hunch).
- **EU Academy** — GATED (EU Login SSO); not harvested.
