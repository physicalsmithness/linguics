# `linguics_italian.db` — schema

A derived SQLite database. Source files in `data/` stay authoritative; rerun `regenerate_db.py` after any edit to the JSONs or CSVs.

The DB is built atomically via `<path>.tmp` + `os.replace()`, so a crashed build leaves the previous DB intact.

## Tables

### `lemmas` (18,000 rows)

One row per `(lemma, pos, gender)` triple from `vocabulary_it_frequency_lemmas.csv`. Gender is only a row-key component for nouns (per the homograph rule); for non-nouns it's typically NULL.

| column | type | notes |
|---|---|---|
| `id` | INTEGER PK | |
| `lemma` | TEXT NOT NULL | citation form |
| `pos` | TEXT NOT NULL | noun/verb/adjective/adverb/preposition/pronoun/article/conjunction/interjection/numeral/determiner |
| `gender` | TEXT | m / f / mf / ambiguous, NULL for non-nouns |
| `plural`, `conjugation_class`, `noun_class` | TEXT | NULL here — these live on curated_entries (the lemma CSV doesn't carry them) |
| `auxiliary` | TEXT | essere / avere / either |
| `adj_class` | TEXT | o / e / invariable |
| `nvdb_tier` | TEXT | FO / AU / AD / NULL |
| `merged_rank` | INTEGER NOT NULL | 1..18000 |
| `avg_rank` | REAL | mean of source ranks that apply |
| `sources_count` | INTEGER | 0..3 (ItWaC, OpenSubs, wordfreq) |
| `rank_itwac`, `rank_opensubs`, `rank_wordfreq` | INTEGER | per-source ranks |
| `rank_lip`, `rank_news`, `rank_literature`, `rank_wikipedia` | INTEGER | per-register ranks (rank_lip is Europarl-proxy — formal transcribed speech, not strictly LIP) |
| `notes` | TEXT | |

UNIQUE (lemma, pos, gender). Indexes on lemma, pos, merged_rank, nvdb_tier.

### `forms` (10,000 rows)

One row per wordform from `vocabulary_it_frequency_forms.csv`. `lemma_id` is resolved at build time via simplemma → most-specific-POS lookup; NULL if no match.

| column | type | notes |
|---|---|---|
| `id` | INTEGER PK | |
| `form` | TEXT NOT NULL | the surface string |
| `lemma_id` | INTEGER | FK to lemmas, nullable |
| `merged_rank` | INTEGER NOT NULL | |
| `avg_rank` | REAL | |
| `sources_count` | INTEGER | |
| `rank_hermitdave`, `rank_orgtre`, `rank_wordfreq` | INTEGER | wordform-level source ranks |
| `rank_lip`, `rank_news`, `rank_literature`, `rank_wikipedia` | INTEGER | wordform-level register ranks |

### `curated_entries` (1,496 rows)

One row per entry in `vocabulary_it_frequency.json`. `lemma_id` is the best-match into `lemmas` (by lemma + pos + gender, falling back to lemma + pos).

| column | type | notes |
|---|---|---|
| `id` | INTEGER PK | |
| `rank` | INTEGER | curated rank (pedagogical ordering — does NOT equal `lemmas.merged_rank`) |
| `lemma` | TEXT NOT NULL | |
| `pos` | TEXT NOT NULL | |
| `translation_en` | TEXT | the marker uses this |
| `band` | TEXT | FK to bands.id |
| `gender` | TEXT | |
| `plural`, `auxiliary`, `conjugation_class`, `adj_class`, `noun_class` | TEXT | |
| `themes` | TEXT | JSON array of theme IDs (matching themes.id) |
| `gloss_en`, `notes` | TEXT | |
| `lemma_id` | INTEGER | FK to lemmas, nullable |

### `themes` (81 rows)

The taxonomy from `vocab_themes.json`.

| column | type |
|---|---|
| `id` | TEXT PK |
| `kind` | TEXT — semantic_concrete/semantic_abstract/functional/verb_subtype/adjective_subtype/adverb_subtype |
| `label` | TEXT — human-readable |

### `bands` (80 rows)

The 100-rank frequency-band aggregates from `data/buckets/vocabulary_frequency.json`.

| column | type |
|---|---|
| `id` | TEXT PK (e.g. `vocabulary.it.freq_1_100`) |
| `parent_id`, `language_code`, `label`, `description` | TEXT |
| `band_lo`, `band_hi` | INTEGER |
| `cefr_importance` | TEXT (JSON dict CEFR-level → importance) |
| `attributes` | TEXT (JSON) |
| `active`, `version` | INTEGER |

### `text_coverage_curve` (64 rows = 16 ranks × 4 registers)

For each register and each grid rank ∈ {1, 5, 10, 25, 50, 100, 200, 500, 1000, 2000, 3000, 5000, 8000, 12000, 20000, 50000}: the fraction of running tokens covered by the top-N wordforms of that register.

| column | type | notes |
|---|---|---|
| `register` | TEXT | `wikipedia` / `news` / `lip` / `literature` |
| `rank` | INTEGER | one of the grid points |
| `cumulative_coverage` | REAL | 0..1 |

PRIMARY KEY (register, rank).

## Views

### `vocab_view`

`lemmas LEFT JOIN curated_entries` with a gender-aware match rule:
- For nouns: match on `(lemma, pos, gender)` exactly.
- For everything else: match on `(lemma, pos)` only, treating `lemma.gender ∈ {NULL, 'na', 'ambiguous'}` as a wildcard so the marker can render `il` as `the (m sg)` even though the lemma row carries no gender.

Useful for queries like "show me the top 100 lemmas with their English glosses."

## Common queries

**"How much of news text does a learner cover at rank N?"**
```sql
SELECT cumulative_coverage FROM text_coverage_curve
 WHERE register = 'news' AND rank = 1000;
```

**"Find top-2000 lemmas missing translations":**
```sql
SELECT l.lemma, l.pos, l.merged_rank
  FROM lemmas l
  LEFT JOIN curated_entries c ON c.lemma_id = l.id
 WHERE l.merged_rank <= 2000
   AND (c.translation_en IS NULL OR c.translation_en LIKE '%?%')
 ORDER BY l.merged_rank;
```

**"Noun-class distribution in band freq_201_300":**
```sql
SELECT c.noun_class, COUNT(*) FROM curated_entries c
 WHERE c.band = 'vocabulary.it.freq_201_300' AND c.pos = 'noun'
 GROUP BY c.noun_class ORDER BY 2 DESC;
```

**"What register is this lemma most-used in?"**
```sql
SELECT lemma, pos,
       MIN(rank_wikipedia, rank_news, rank_lip, rank_literature) AS best_register_rank,
       rank_wikipedia, rank_news, rank_lip, rank_literature
  FROM lemmas WHERE lemma = 'pena';
```

## Caveats

- `rank_lip` is a **proxy** built from OPUS Europarl (parliamentary transcripts). It captures formal transcribed Italian, not the spontaneous spoken Italian that the original LIP corpus targets. The BADIP-hosted LIP wasn't reachable during build; if it becomes available, swap the source and rerun.
- `forms.lemma_id` is best-effort via simplemma's context-free lemmatisation. Some forms (`stato`, `porta`) will end up under one POS even when the underlying corpus token was the other; the lemma CSV's count contamination caveat (see `vocabulary_it_README.md`) applies here.
- `curated_entries.rank` is **not** the same as `lemmas.merged_rank`. The curated rank is pedagogical/historical; merged_rank is corpus-grounded.
- `bands` table is loaded from `data/buckets/vocabulary_frequency.json` which already exists in this project; the schema accepts the buckets format directly.
