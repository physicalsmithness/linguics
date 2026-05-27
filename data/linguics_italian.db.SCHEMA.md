# `linguics_italian.db` — schema

Derived SQLite database. Source files in `data/` stay authoritative; rerun `regenerate_db.py` after any edit to the JSONs or CSVs. Built atomically (`<path>.tmp` + `os.replace()`), so a crashed build leaves the previous DB intact.

## Tables

### `lemmas` (18,000 rows)

One row per `(lemma, pos, gender)` triple from `vocabulary_it_frequency_lemmas.csv`. Gender is only a row-key component for nouns; for non-nouns it's typically NULL.

| column | type | notes |
|---|---|---|
| `id` | INTEGER PK | |
| `lemma` | TEXT NOT NULL | citation form |
| `pos` | TEXT NOT NULL | noun/verb/adjective/adverb/preposition/pronoun/article/conjunction/interjection/numeral/determiner |
| `gender` | TEXT | m/f/mf/ambiguous; NULL for non-nouns |
| `plural`, `conjugation_class`, `noun_class` | TEXT | NULL here — live on curated_entries |
| `auxiliary` | TEXT | essere/avere/either |
| `adj_class` | TEXT | o/e/invariable |
| `nvdb_tier` | TEXT | FO/AU/AD/NULL |
| `merged_rank` | INTEGER NOT NULL | 1..18,000 |
| `avg_rank` | REAL | mean of source ranks that apply |
| `sources_count` | INTEGER | 0..3 (ItWaC, OpenSubs, wordfreq) |
| `rank_itwac`, `rank_opensubs`, `rank_wordfreq` | INTEGER | per-corpus ranks |
| `rank_lip`, `rank_news`, `rank_literature`, `rank_wikipedia` | INTEGER | per-register ranks |
| **`count_itwac`** | INTEGER | raw lemma count in ItWaC (POS-aware upstream — not deduped) |
| **`count_opensubs`** | INTEGER | raw lemma count in OpenSubtitles (lemmatised; deduped — see split-row note below) |
| **`freq_wordfreq`** | REAL | native wordfreq fraction (e.g. 0.0389 = 3.89% of corpus); no raw count because wordfreq is a multi-corpus aggregate (deduped) |
| **`count_lip`** | INTEGER | raw lemma count in Europarl (LIP proxy) (deduped) |
| **`count_news`** | INTEGER | raw lemma count in News-Commentary (deduped) |
| **`count_literature`** | INTEGER | raw lemma count in Gutenberg Italian sample (deduped) |
| **`count_wikipedia`** | INTEGER | raw lemma count in itwiki Oct-2022 dump (deduped) |
| `notes` | TEXT | |

**Split-row attribution rule.** For surface forms that resolve to multiple `(lemma, pos, gender)` split rows (e.g. `il` article/pronoun/noun, `che` pronoun/conjunction/verb/noun/adjective), each per-corpus count is attributed in full to the row with the **lowest `merged_rank`** in the group and **zero** on the rest. Sum the column to recover the corpus total (modulo the long-tail outside the top-N cutoff). This applies to `count_opensubs`, `count_lip`, `count_news`, `count_literature`, `count_wikipedia` and `freq_wordfreq`. It does **not** apply to `count_itwac`, which is already POS-aware via the upstream franfranz files.

UNIQUE (lemma, pos, gender). Indexes on lemma, pos, merged_rank, nvdb_tier.

### `forms` (10,000 rows)

One row per wordform. `lemma_id` is resolved at build time via simplemma → most-specific-POS lookup; NULL if no match.

Per-corpus columns mirror the lemma table (wordform-level rather than lemma-level): `rank_hermitdave / count_hermitdave`, `rank_orgtre / count_orgtre`, `rank_wordfreq / freq_wordfreq`, plus `rank_<register> / count_<register>` for the four registers.

### `sources` (9 rows)

Per-corpus metadata. Use `total_tokens` to convert counts into fractions or fpm.

| column | type | notes |
|---|---|---|
| `name` | TEXT PK | `itwac`, `opensubs`, `wordfreq`, `hermitdave`, `orgtre`, `lip`, `news`, `literature`, `wikipedia` |
| `total_tokens` | INTEGER | corpus size in tokens; NULL for `wordfreq` (it's a normalised aggregate without a token total) |
| `type` | TEXT | `raw_count` or `native_fraction` |
| `description` | TEXT | provenance + caveats |

### `curated_entries` (~18,000 rows)

One row per entry in `vocabulary_it_frequency.json`. `lemma_id` is the best-match into `lemmas` (by lemma + pos + gender, falling back to lemma + pos). `rank` here is the curated pedagogical ordering, NOT `lemmas.merged_rank`.

`translation_source` records provenance for `translation_en`:

| value | meaning |
|---|---|
| `vocab_chat` | hand-authored by the vocab-authoring chat |
| `apertium` | bulk-pulled from the Apertium eng-ita bilingual dictionary |
| `wiktionary` | bulk-pulled from the Italian Wiktionary (kaikki dump) |
| `omw` | bulk-pulled from Open Multilingual WordNet (NLTK) |
| `corpus_artefact` | `translation_en = "[skip]"` — corpus tokenisation noise, intentionally not translated |
| `NULL` | no translation yet (no source matched, vocab chat to attend) |

### `themes` (81 rows)

`id, kind, label` from `vocab_themes.json`.

### `bands` (80 rows)

The 100-rank frequency-band aggregates from `data/buckets/vocabulary_frequency.json`.

## Views

### `vocab_view`

`lemmas LEFT JOIN curated_entries` with a gender-aware match:
- Nouns: match on `(lemma, pos, gender)` exactly.
- Everything else: match on `(lemma, pos)`, treating `lemmas.gender ∈ {NULL, 'na', 'ambiguous'}` as a wildcard so an article like `il` (which the curated JSON tags `m`) joins.

### `lemma_frequencies` (long-format)

UNPIVOTs the per-source `count_*` and `freq_wordfreq` columns of `lemmas`. One row per `(lemma, pos, gender, source)` with the corresponding `count` (NULL for wordfreq), `freq` (NULL except for wordfreq), and `rank`. Easy to aggregate over a known-lemma set in SQL.

### `form_frequencies` (long-format)

Same shape, for `forms`.

## Common queries

**Exact coverage of a known-lemma set in any register:**
```sql
-- "If a learner knows ranks 1..1000, what fraction of news text do they cover?"
SELECT 1.0 * SUM(count_news) / (SELECT total_tokens FROM sources WHERE name = 'news')
  FROM lemmas
 WHERE merged_rank <= 1000;
```

**Same, using the long-format view:**
```sql
SELECT lf.source,
       1.0 * SUM(lf.count) / s.total_tokens AS coverage
  FROM lemma_frequencies lf
  JOIN sources s ON s.name = lf.source
 WHERE lf.lemma_id IN (SELECT id FROM lemmas WHERE merged_rank <= 1000)
   AND s.type = 'raw_count'
 GROUP BY lf.source, s.total_tokens
 ORDER BY coverage DESC;
```

**Per-lemma profile across corpora:**
```sql
SELECT source, count, freq, rank
  FROM lemma_frequencies
 WHERE lemma = 'gatto' AND pos = 'noun'
 ORDER BY rank;
-- itwac      | 43112 |  NULL | 2670
-- wikipedia  | 16773 |  NULL | 2927
-- opensubs   | 16635 |  NULL | 1120
-- literature |    81 |  NULL | 5599
-- lip        |   233 |  NULL | 7450
-- news       |    10 |  NULL | 8431
-- wordfreq   |  NULL | 5.45e-5 | 1682
```

**Find top-2000 lemmas missing translations:**
```sql
SELECT l.lemma, l.pos, l.merged_rank
  FROM lemmas l
  LEFT JOIN curated_entries c ON c.lemma_id = l.id
 WHERE l.merged_rank <= 2000
   AND (c.translation_en IS NULL OR c.translation_en LIKE '%?%')
 ORDER BY l.merged_rank;
```

**Noun-class distribution in band freq_201_300:**
```sql
SELECT c.noun_class, COUNT(*)
  FROM curated_entries c
 WHERE c.band = 'vocabulary.it.freq_201_300' AND c.pos = 'noun'
 GROUP BY c.noun_class ORDER BY 2 DESC;
```

## Caveats

- **`rank_lip` / `count_lip` are a proxy** (Europarl parliamentary transcripts, not the LIP corpus). Captures formal transcribed Italian, not spontaneous speech. BADIP wasn't reachable at build time. Swap and rerun when the actual LIP becomes available.
- **`forms.lemma_id`** is best-effort via simplemma's context-free lemmatisation. Some forms (`stato`, `porta`) end up under one POS even when the underlying token was the other; the lemma-count contamination caveat from `vocabulary_it_README.md` applies.
- **`curated_entries.rank`** is **not** the same as `lemmas.merged_rank`. Curated rank is pedagogical/historical; merged_rank is corpus-grounded.
- **`freq_wordfreq` is a fraction**, not a count. wordfreq is an aggregated multi-corpus list with no shared token total — that's why `sources.total_tokens` is NULL for it. The native float is preserved without rounding.
- **`count_itwac` is NULL for non-{noun,verb,adjective}** because the upstream franfranz files exclude function words and auxiliaries.
