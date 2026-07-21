# Dispatch: Italian top-1000 frequency-tier vocabulary

A fresh-chat dispatch packet. Paste this whole document into a new chat.

---

## Context

You are authoring vocabulary content for **Linguics**, an Italian language-learning website. The site already has authored grammar and translation content for three topics (adjective_agreement, verb_form.passato_prossimo, pronoun). Vocabulary is now the missing strand.

Your job: produce a frequency-tiered top-1000 Italian word list with structured metadata per word, organised so that:

- A learner can practise vocabulary in roughly-100-word bands, easiest first.
- The platform can fire bucket events on each word at the right granularity (translation, gender, plural, conjugation, etc.).
- Per-word entries plug into the existing `vocab_help` schema used by grammar and translation items.

The Linguics platform uses an atomised bucket taxonomy: every event fires against a named bucket like `vocabulary.it.casa.translation` or `vocabulary.it.andare.auxiliary`. The bucket tree is populated dynamically as events come in; you don't need to enumerate every bucket. You DO need to produce the **content** that drives those events: the words, their attributes, and where they sit in the frequency hierarchy.

---

## What to produce

Three files:

### 1. `data/buckets/vocabulary_frequency.json`

A small bucket tree extension that adds frequency-band sub-trees under `vocabulary.it`:

```json
[
  {
    "id": "vocabulary.it.freq_1_100",
    "parent_id": "vocabulary.it",
    "language_code": "it",
    "label": "Top 100 most common words",
    "description": "The 100 most frequent words in modern written and spoken Italian. Core A1 vocabulary; a learner should know nearly all of these to begin functioning.",
    "cefr_importance": {"A1": "core", "A2": "core", "B1": "review", "B2": "fluency", "C1": "fluency", "C2": "fluency"},
    "prerequisites": [],
    "attributes": {"is_aggregate": true, "band_lo": 1, "band_hi": 100},
    "active": true,
    "version": 1
  },
  {
    "id": "vocabulary.it.freq_101_200",
    "parent_id": "vocabulary.it",
    "language_code": "it",
    "label": "Words 101-200",
    "description": "...",
    "cefr_importance": {"A1": "preview", "A2": "core", "B1": "review", "B2": "fluency", "C1": "fluency", "C2": "fluency"},
    "prerequisites": ["vocabulary.it.freq_1_100"],
    "attributes": {"is_aggregate": true, "band_lo": 101, "band_hi": 200},
    "active": true,
    "version": 1
  }
  ... etc up to freq_901_1000
]
```

Ten bands, in 100-word steps from 1-100 to 901-1000. Each band is an aggregate under `vocabulary.it`. CEFR importance shifts as we go down the frequency list: top 100 is A1-core, 901-1000 is A2-core, etc. (Calibrate as you see fit.)

### 2. `data/vocabulary_it_frequency.json`

The actual word list with metadata. One entry per word, ordered by frequency rank, with the band id and per-word attributes:

```json
[
  {
    "rank": 1,
    "lemma": "essere",
    "pos": "verb",
    "translation_en": "to be",
    "band": "vocabulary.it.freq_1_100",
    "gender": null,
    "plural": null,
    "auxiliary": "essere",
    "conjugation_class": "irregular",
    "notes": "the highest-frequency verb; highly irregular; auxiliary for its own compound tenses"
  },
  {
    "rank": 2,
    "lemma": "avere",
    "pos": "verb",
    "translation_en": "to have",
    "band": "vocabulary.it.freq_1_100",
    "gender": null,
    "plural": null,
    "auxiliary": "avere",
    "conjugation_class": "irregular"
  },
  {
    "rank": 10,
    "lemma": "casa",
    "pos": "noun",
    "translation_en": "house, home",
    "band": "vocabulary.it.freq_1_100",
    "gender": "f",
    "plural": "case",
    "auxiliary": null,
    "conjugation_class": null
  },
  ...
]
```

Required fields per entry:
- `rank`: 1-1000.
- `lemma`: citation form (infinitive for verbs, masculine singular for adjectives, singular for nouns).
- `pos`: one of `noun`, `verb`, `adjective`, `adverb`, `preposition`, `pronoun`, `article`, `conjunction`, `interjection`, `numeral`, `determiner`.
- `translation_en`: comma-separated English glosses, most common first.
- `band`: the bucket id of the frequency band this word belongs to.

Optional but encouraged:
- `gender`: `m` or `f` (for nouns and some adjectives, irrelevant for verbs).
- `plural`: the plural form (for nouns), e.g. `case` for `casa`.
- `auxiliary`: `essere`, `avere`, or `either` (for verbs).
- `conjugation_class`: `are_regular`, `ere_regular`, `ire_regular`, `ire_isco` (the -isc- inserting class), `irregular`.
- `adj_class`: `o` or `e` (for adjectives).
- `notes`: anything unusual or worth flagging (irregularities, register, false-friend warnings, etc.).

### 3. `coverage_vocabulary_frequency.md`

A short summary: total words produced, distribution by POS (nouns, verbs, adjectives, etc.), any words you weren't sure about, any frequency-rank decisions you had to make. The reviewer wants this.

---

## How to assemble the frequency list

Use the standard Italian frequency lists from your training corpus as a starting point. Well-known references include the Lessico di frequenza dell'italiano scritto (LIF), the Vocabolario di base (VdB, ~7000 fundamental words divided into fundamental / high / available), and the Routledge Frequency Dictionary of Italian. You don't need to cite a specific source; your training-corpus prior on Italian frequency is fine.

Be slightly conservative about including very-low-frequency colloquialisms or regionalisms in the top bands. The list should be useful to a learner at A1 / A2.

Function words (articles, prepositions, conjunctions, particles) will dominate the top 50 ranks. That's correct; include them but don't agonise over their per-word metadata (they don't have gender, plural, etc.).

---

## Pedagogical constraints

- **Lemma form only.** Don't list inflected forms (no `rossi` or `andata`). Always the citation form.
- **No duplicates.** Each lemma appears once. A word that's both a noun and a verb (like `colpo` vs `colpire`) gets two entries with distinct POS.
- **Multi-word lemmas allowed.** Adjective+noun fixed expressions (`pari opportunità`), idiomatic verbs (`farcela`, `andarsene`), preposition phrases (`per esempio`, `a meno che`) can be in the list if their frequency warrants. Note them in `notes`.
- **Cognates flagged.** Where an Italian word is a near-cognate of English (`importante`, `interessante`), still include it; learners benefit from confirmation that the cognate works.
- **False friends flagged.** `pretendere` (to demand, not to pretend), `attualmente` (currently, not actually), etc. Put a warning in `notes`.

---

## Output format

Three files:

```
data/buckets/vocabulary_frequency.json     (10 bucket entries, the bands)
data/vocabulary_it_frequency.json          (1000 word entries)
coverage_vocabulary_frequency.md            (summary)
```

Return them in your reply as separate JSON blocks for each file plus the markdown for the coverage file. The reviewer will save them to disk.

If 1000 words is too much for one reply, produce the first 500 in this reply and indicate "continue" for the next 500. Maintain rank order.

---

## What happens next

After this dispatch:

1. The reviewer adds `vocabulary_frequency` to `data/manifest.json` so the housing loads the new bucket tree.
2. The reviewer adds `vocabulary.it.freq_*` bands to the canonical glossary file if the labels need explanation.
3. A SECOND dispatch produces direct vocabulary practice questions (translate this word, what's the gender, etc.) drawing from this list. That's a separate authoring chat; you don't need to write practice questions in THIS dispatch.

So your output here is the data layer: the words, their attributes, their bands. Questions come later.

---

## Operational notes

- The Linguics brand sits alongside Smithics (the spaced-repetition project, which is where vocabulary memorisation will eventually be done at depth). This frequency list is for the Linguics direct-test vocabulary strand, complementary to memorised study.
- Italian content is the launch product; later languages would get their own frequency lists.
- Translation glosses target the en-it pair specifically; you don't need to consider other source languages.

Good luck.
