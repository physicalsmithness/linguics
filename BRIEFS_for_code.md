# Briefs from the vocab chat to Code

Four jobs, ordered by priority. A first (it unblocks the vocab chat). B and C can run in parallel. D consolidates.

You already have access to `C:\Users\patri\OneDrive\Documents\Claude\Projects\Language Learning\`. Write directly to the `data/` folder.

---

## A. Top-1000 gap-fill — thin entries

The curated JSON has 1,146 entries but only ~592 of those sit in lemma-CSV ranks 1-1000. About 408 top-1000 lemmas are missing because the original authoring was theme-led, not strictly frequency-led. Fill them in.

Generate a **thin** entry for each missing lemma. Don't write rich glosses or pedagogical notes; just get a defensible first cut. The vocab chat enriches afterwards.

### Identifying the missing 408

```python
import csv, json
with open('data/vocabulary_it_frequency_lemmas.csv') as f:
    csv_rows = list(csv.DictReader(f))
with open('data/vocabulary_it_frequency.json') as f:
    curated = json.load(f)
curated_keys = {(e['lemma'], e['pos']) for e in curated}
missing = [r for r in csv_rows if int(r['rank']) <= 1000 and (r['lemma'], r['pos']) not in curated_keys]
```

### Schema for each thin entry

```json
{
  "rank": <from lemma CSV>,
  "lemma": "<lemma>",
  "pos": "<pos from CSV>",
  "translation_en": "<best-effort English gloss>",
  "band": "vocabulary.it.freq_<lo>_<hi>",
  "gender": <from CSV: m / f / mf / null>,
  "plural": null,
  "auxiliary": <see auxiliary rules below>,
  "conjugation_class": null,
  "adj_class": <from CSV: o / e / invariable / null>,
  "noun_class": <derive — see noun_class rules below>,
  "themes": [<POS-based default — see themes rules below>],
  "gloss_en": null,
  "notes": "thin entry from gap-fill pass — needs vocab-chat review for plural, conjugation_class, gloss refinement"
}
```

### Auxiliary rules

The CSV uses `essere` / `avere` / `either`. The curated file's vocabulary is now:
- `essere` / `avere` — straightforward
- `modal_aux_inheritance` — for `potere`, `dovere`, `volere` only
- `aux_varies_by_transitivity` — for verbs whose aux depends on transitive vs intransitive use

When converting from CSV `either` to curated values: if `lemma in {potere, dovere, volere}` → `modal_aux_inheritance`; else → `aux_varies_by_transitivity`.

### noun_class derivation

The exact algorithm the vocab chat used (see `outputs/schema_updates.py`):

```
1. If lemma in {film, bar, menu, chef, computer, sport, taxi, tram, camion,
   autobus, garage, jeans, foto, auto, moto, radio, metro, tv, video}
   → invariable_loanword
2. If lemma ends in à/è/ì/ò/ù → invariable_accented_final
3. If lemma in {braccio, uovo, dito, paio, osso, ginocchio, ciglio,
   sopracciglio, lenzuolo, labbro, orecchio, miglio}
   → gender_shift_plural
4. If lemma in {problema, sistema, programma, dramma, tema, clima, poema,
   schema, dilemma, panorama, fantasma, dogma} → greek_ma_masc
5. If lemma ends in -ista → ista_common_gender
6. If lemma in {mano, radio, foto, auto, moto, eco} → irregular_gender
7. If lemma ends in -o and gender=m → regular_o_masc
8. If lemma ends in -a and gender=f → regular_a_fem
9. If lemma ends in -e → e_ambiguous
10. Else → irregular_gender
```

### themes derivation

POS-based defaults:
- `noun` → `["noun_abstract"]`
- `verb` → `["verb_action_general"]`
- `adjective` → `["adjective_quality"]`
- `adverb` → `["adverb_manner"]`
- `article` → `["function_word"]`
- `preposition` → `["function_word", "preposition"]`
- `conjunction` → `["function_word", "conjunction"]`
- `pronoun` → `["function_word", "pronoun_personal"]`
- `determiner` → `["function_word"]`
- `interjection` → `["interjection"]`
- `numeral` → `["numbers_cardinal"]`

Full taxonomy lives in `data/vocab_themes.json`. The vocab chat re-themes during enrichment, so don't agonise — just pick a defensible default.

### translation_en — best-effort

For each lemma, get a one-to-three-word English gloss. Options in order of preference:
1. **simplemma** has a multilingual lexicon embedded — see if its translation hook works
2. **Wiktionary** scrape — fast, reliable, free
3. **Small LLM call** per lemma (DeepSeek V3 is cheap enough at $0.001/call × 408 = ~$0.40 total)

Mark uncertain glosses with `?` so the vocab chat reviews them first. Don't include parenthetical disambiguation in `translation_en` (use `gloss_en` for that — leave blank for now).

### Insert and save

Insert each new entry in its rank position (sort the whole array by rank afterwards). Save back to `data/vocabulary_it_frequency.json`. Verify the JSON parses and entry count is ~1554.

### Bonus: small report

Write `outputs/gapfill_report.md` listing the 408 lemmas added, with their rank, pos, gloss, and any `?` flags.

---

## B. Extend lemma CSV to top 15,000-20,000 lemmas

Same methodology as the existing 7,626-row lemma file, but deeper. Add 7,500-12,500 more rows.

### Source options

**Best option: add PAISÀ as a fourth ranking source.** ~250M-token Italian web corpus, lemmatised, POS-tagged, well-known, free. Available from <http://www.corpusitaliano.it/>.

**Alternative: extend existing sources to full depth.** ItWaC and wordfreq both have far more lemmas than the top 25,000 currently captured. Just take the top 15K-20K from each instead of top 25K.

### Realistic ceiling

The realistic ceiling is around 12,000-15,000 useful lemmas. Beyond that you're into hapax-legomena territory (words that appear only a handful of times even in massive corpora). Top 12,000 covers ~97% of running text; top 20,000 maybe 98%. Diminishing returns are severe.

### NVdB

NVdB stops at ~7,500. Everything beyond NVdB will have blank `nvdb_tier`. That's correct — beyond C1 territory NVdB has nothing to say.

### Schema

Same columns as the current CSV. Just more rows.

### Save

Save as `data/vocabulary_it_frequency_lemmas.csv` (overwrite the existing file).

---

## C. Per-register source columns — all stats

Add separate rank columns to the lemma CSV (and form CSV where applicable) that break out frequency by text type.

| Column to add | Source | Register | Notes |
|---|---|---|---|
| `rank_lip` | LIP corpus (Lessico di frequenza dell'italiano parlato) | Spoken Italian | Transcribed conversations, lectures, broadcast speech. The canonical Italian spoken corpus. |
| `rank_news` | CORIS news subset OR La Repubblica Corpus | News writing | Either source works; CORIS is free for research |
| `rank_literature` | LIZ Letteratura Italiana Zanichelli sample OR Italian Project Gutenberg subset | Literary writing | Use whatever's cleanest to get |
| `rank_wikipedia` | Italian Wikipedia dump (lemmatised via simplemma) | Encyclopedic writing | Easy to get; useful baseline |
| (already there as `rank_opensubs`) | OpenSubtitles | Conversational fiction | Existing — no change |
| (already there as `rank_itwac` and `rank_wordfreq`) | ItWaC + wordfreq mix | Mixed written | Existing — no change |

### How they merge

The headline `rank` and `avg_rank` columns stay computed across the **original** sources (ItWaC, OpenSubs, wordfreq) for backwards compatibility. The per-register columns sit alongside as additional signals — don't fold them into the average.

### Why "all stats" matters

The housing wants to compute coverage stats per register: *"this vocabulary covers 78% of typical news writing, 62% of spoken conversation, 55% of literature."* That's the kind of stat that tells a learner what they're actually equipped for. Without per-register ranks, only generic coverage stats are possible.

---

## D. Consolidate everything into one DB

After A, B, C are done, consolidate into one queryable database that housing, the vocab chat, and architecture chat can all read.

### Shape: SQLite

Single file, no server, fast queries, supported everywhere. Save as `data/linguics_italian.db`.

### Tables

- **`lemmas`** — one row per lemma. Columns: `id`, `lemma`, `pos`, `gender`, `plural`, `auxiliary`, `conjugation_class`, `adj_class`, `noun_class`, `nvdb_tier`, `merged_rank`, plus every per-source rank column (`rank_itwac`, `rank_opensubs`, `rank_wordfreq`, `rank_lip`, `rank_news`, `rank_literature`, `rank_wikipedia`).
- **`forms`** — one row per surface form. Columns: `id`, `form`, `lemma_id` (FK to lemmas), `merged_rank`, plus per-source rank columns from the form CSV.
- **`curated_entries`** — one row per curated JSON entry. Columns: all the curated fields (rank, lemma, pos, translation_en, band, gender, plural, auxiliary, conjugation_class, adj_class, noun_class, themes (stored as JSON), gloss_en, notes). Foreign key to `lemmas` by (lemma, pos, gender).
- **`themes`** — taxonomy registry. Columns: `id`, `kind`, `label`. Load from `vocab_themes.json`.
- **`bands`** — bucket definitions. Columns: `id`, `band_lo`, `band_hi`, `cefr_subbands` (JSON array), `direction`. Load from `vocabulary_frequency.json`.
- **`text_coverage_curve`** — lookup table: `rank`, `register`, `cumulative_coverage`. Pre-computed Italian-text coverage curves per register. Lets the housing answer *"if a learner knows up to rank N, what % of register R text do they cover?"* in a single SELECT.

### Companion files

- `data/linguics_italian.db.SCHEMA.md` — documents tables and intended queries.
- `regenerate_db.py` — script that rebuilds the SQLite from the source files (so the editable JSONs and CSVs stay authoritative; the DB is derived).

### Use cases the DB enables

- **Housing**: per-learner coverage stats per register, with one SELECT.
- **Vocab chat**: "find all unmatched curated entries", "find all top-2000 lemmas missing translations", "what's the noun-class distribution in band X" — all become trivial queries.
- **Architecture chat**: schema introspection, validation, change-impact analysis.

---

## Order

Do them in order A → B and C in parallel → D. The vocab chat needs A urgently; B, C, D can land asynchronously.

Tell the user when each one is done; the vocab chat (this one) will pick up A's output and start the enrichment pass.
