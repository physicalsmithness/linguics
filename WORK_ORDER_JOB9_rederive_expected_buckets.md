# Job 9 — Re-derive `expected_buckets` on the new lemmatiser, and add the alternatives

**Written by:** the Architecture chat, 2026-08-12, **for a fresh AI with no prior context** (QoderWork,
Codex, whoever is free). Self-contained: everything needed is below.

**Size:** one session. It is one deterministic pass over 914 items plus a verification pass.

---

## PREAMBLE — the rules that bind every job on this project

Live folder:

```
C:\Claude (not on Gdrive, nor OneDrive)\Linguics
```

**That path is the live copy. There is a OneDrive mirror; do not edit it.**

1. **Back up before any in-place edit** — `outputs/backup_job9_<date>/`, full file copies.
2. **Write JSON atomically** (`atomic_io.py` is in the repo root). A truncated JSON file takes the
   whole site down; the loader is sequential.
3. **Never write to** `DECISIONS.md`, `AUTHOR_BRIEF.md`, `data/buckets/*.json`,
   `data/misconceptions.json`, `data/manifest.json`.
4. **Count from the file, never from memory of what you did.** End by re-reading the written artefacts
   and reporting counts with the command shown.
5. **If an acceptance test fails, stop and report.** Do not loosen the test.
6. Leave a note in `inter_chat/Architecture_Housing_marker_expectation_suite.md` as
   `## v8, <date>, <your name>`.

---

## Why this job exists

Translation answers are marked by an AI worker. As of build r159 the worker is **no longer given the
581-name bucket menu** — it now receives only the item's own buckets plus that item's `expected_buckets`
fire-list. **So the fire-list is the only thing the marker is told to look for. Its quality is the
marking's quality.**

That fire-list was derived using `data/it_surface_to_lemma.json`, a **427-entry stub**. It has no entry
for `date` or `dati` (so `dare` never fired on any item), and it resolves `detto` to *dettare* and
`visto` to *vistare*. Measured consequence: **mean 1.12 vocabulary lemmas per item, and 45% of items
with no verb at all on their fire-list.**

Architecture has rebuilt the map. Your job is to re-derive against it.

---

## Inputs

| file | what it is |
|---|---|
| `data/it_surface_to_lemma_morphit.json` | **the new map, 1,450 entries. USE THIS ONE.** |
| `data/it_surface_to_lemma.json` | the old 427-entry stub. Do not use; do not delete. |
| `data/translation_items_*.json` | 914 items (skip `.bak` and anything containing `.merged`) |
| `data/vocabulary_it_frequency.json` | 18,042 entries: `lemma`, `pos`, `gender`, `number`, `rank`, `equivalence_class` |
| `data/buckets/*.json` | the bucket trees, 780 ids |

Per item, the Italian text you derive from is `reference_translations[0].text` when `target_lang` is
`it`, and `source_text` when it is `en`. **The Italian side always carries the grammar.**

---

## What to derive

**(a) Vocabulary.** Resolve each token via the new map to a lemma, look it up, and emit

```
vocabulary.it.<lemma>.<pos>[.<gender>][.<number>].translation.<direction>
```

- `<direction>` is `active` when the learner produces Italian (`target_lang: it`), `passive` otherwise.
- The `<gender>` segment appears **only** when that (lemma, pos) has entries of more than one gender.
- The `<number>` segment appears **only** when that (lemma, pos, gender) has entries of more than one number.
- Skip function words: exclude lemmas whose best rank is **50 or better**. Report the cutoff you used.

**(b) NEW, and the point of this job as much as the lemmatiser — equivalence-class alternatives.**

If a derived entry carries an `equivalence_class`, **emit a bucket for every other member of that
class as well.**

Why: the reference for an item says `tv`; a learner writes `televisione`. Under the production rule
that answer is **correct** — but if `televisione` is not on the fire-list, the marker has no bucket to
credit them in and they are marked wrong for a right answer. This is a live fault behind three of
Smith's screenshots (`tv`/`televisione`, `secco`/`asciutto`, `lungo`/`lunghezza`). 1,550 entries across
738 classes carry `equivalence_class` today.

Compose each alternative's id from **its own** entry (its own pos, gender, number), not by string-editing
the original's id.

**(c) Noun gender.** For a noun from (a) whose token is **immediately preceded by an article** — `il lo
la l' i gli le un uno una un'`, or an articulated preposition `del dello della dell' dei degli delle al
allo alla all' nel nello nella nell' sul sulla dal dalla dallo dall'` — emit the same id with aspect
`gender` and direction `active`. **Only on `target_lang: it` items**; gender is production-only. No
article, no emission.

**(d) Accents.** If the Italian text contains any of `à è é ì ò ù`, emit `orthography.accent.italian`.
Do not guess a sub-class.

**(e) Spelling classes**, from this list only, on a match in the Italian text:

| bucket | trigger |
|---|---|
| `orthography.spelling.doubling` | any doubled consonant |
| `orthography.spelling.apostrophe_elision` | any apostrophe |
| `orthography.spelling.digraph` | `gl`, `gn` or `sc` before `e`/`i` |
| `orthography.spelling.c_g_softening` | `c`/`g` before `e`/`i`, or `ch`/`gh` |
| `orthography.spelling.qu_cu_cqu` | `qu`, `cu` before a vowel, or `cqu` |
| `orthography.spelling.silent_h` | word-initial `h` |
| `orthography.spelling.capitalization` | a capital that is not sentence-initial |

---

## Output

Replace each item's `expected_buckets` with the new list. Deduplicate, sort alphabetically, and **omit
anything already in that item's `required_buckets`**.

---

## The semantics, so you understand what you are writing

`required_buckets` is what the item **exists to test**; absence from the learner's answer is a **miss**.
`expected_buckets` is what a good answer **happens to show**, and it has **three** outcomes: engaged and
right is a hit, **engaged and wrong is a real miss**, not engaged at all is a blank with no penalty.

That is why **a generous list is safe and a wrong list is not**: an extra correct entry costs nothing,
and an incorrect one makes the marker mark something that is not there. It is also why (b) matters — a
learner who reaches for a valid alternative must have somewhere to be credited.

---

## DO NOT

- **Do not modify `required_buckets`**, `source_text`, `reference_translations`, or any other key.
- **Do not attempt grammar buckets** (tense, mood, prepositions, clitics, agreement). Those come from a
  separate morph-it tagging pass whose proposals are already out with the topic seats for review.
  Guessing them from string patterns produces confident nonsense.
- **Do not strip any bucket class.** An earlier Architecture ruling said to stop deriving
  `orthography.spelling.*` and `it_en` vocabulary because the prompt forbade firing them. **That
  ruling is under review**: r159 removed the 581-name menu, so the fire-list now *is* what the marker
  is told to check, which likely dissolves the problem. Derive everything above; Housing rules on
  stripping separately.
- **Do not "fix" the old stub file.** Leave `data/it_surface_to_lemma.json` exactly as it is.

---

## Validation — the test that trips people up

The bucket trees hold 780 ids, and their only `vocabulary.*` entries are **frequency bands**
(`vocabulary.it.freq_12601_12700`). Per-lemma ids are **composed at runtime and are NOT in the trees.**

- **Non-vocabulary ids** (`orthography.*`) → must exist in `data/buckets/*.json`.
- **Vocabulary ids** → validate by composition instead: the lemma resolves to exactly one entry of that
  pos; the gender segment is present only when that lemma+pos is gender-split; the number segment only
  when number-split; the direction suffix is present and correct.

A blanket tree check rejects every vocabulary id you generate. If you find yourself dropping them all,
this is why.

---

## Acceptance tests — run them, report the output

1. **`required_buckets` is byte-identical before and after**, across all 914 items. Prove it with a diff
   of just that field against your backup.
2. Every item has an `expected_buckets` key. Item counts per file unchanged. Every file parses.
3. Every emitted id passes the split validation above. Report the count checked and **zero** failures.
4. **Report the before/after table**, same method both sides:

   | | before | after |
   |---|---|---|
   | mean vocabulary lemmas per item | 1.12 | ? |
   | items with no verb at all | 45% | ? |
   | items gaining at least one alternative from (b) | — | ? |

5. **Spot-check three by hand and paste them**: an item whose reference contains `visto` (must resolve
   to *vedere*, not *vistare*), one containing `date` or `dati` (must resolve to *dare*), and one whose
   reference uses a lemma with an `equivalence_class` (must carry its class-mates).

## One thing to report, not fix

The expected mean is 10-20 vocabulary lemmas per item and the rebuilt map reaches about 3.4. Some of
that gap is real and some is not: these reference sentences are short — *"Stasera guarderemo un film
insieme"* has four content words, and no lemmatiser turns that into fifteen. **Report the distribution
of content-word counts per item** alongside your mean, so the question can be settled with data rather
than assumed to be a failure.
