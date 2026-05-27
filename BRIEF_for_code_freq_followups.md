# Brief for Code: two freq-rebuild follow-ups

Two unrelated items, both bite the lemma table. Do them in the order below because item E changes which rows exist and item F operates on counts.

The infrastructure you delivered is in great shape otherwise (counts + `freq_wordfreq` native + `source_metadata.json` + long-format views, `text_coverage_curve` dropped, the schema doc reads well). These two are tidy-ups on what's already there.

---

## E. Restore the lemma CSV to 18,000 rows

### What happened

The lemma CSV shrank during your freq rebuild today, from 18,000 rows to 9,337. The vocab chat noticed because the thin-fill pass it just ran covered only the first 9,337 lemmas, not the full 18,000 the user expected.

Backup trail confirms the regression:

| File | Rows | Cols | Stage |
|---|---|---|---|
| `vocabulary_it_frequency_lemmas.csv.bak.preB` | 8,000 | 13 | before Brief B |
| `vocabulary_it_frequency_lemmas.csv.bak.preC` | 18,000 | 13 | after Brief B |
| `vocabulary_it_frequency_lemmas.csv.bak.preCounts` | 18,000 | 17 | after Brief C |
| current `vocabulary_it_frequency_lemmas.csv` | **9,337** | 24 | after your freq counts |

So the 7 new count/freq columns came in (good) but 8,663 rows went out (not asked for).

### What we think happened

Best guess: the freq rebuild filtered to rows that had non-null count data in at least one of the count sources, which dropped the tail lemmas that only had a rank in the original three sources (itwac / opensubs / wordfreq) but no usable count column. The tail lemmas are real — they appear in the lemma frequency lists at progressively noisier signal — they just don't have raw counts attached because the upstream sources reporting them only gave ranks or normalised frequencies.

Could be a different cause. Whichever it was, the cull wasn't asked for and the user wants the full 18,000 back.

### What we need

Restore the lemma CSV to 18,000 rows, preserving the work you've already done (the 24 columns including count_* and freq_wordfreq).

For the ~8,663 restored tail lemmas:

- **`count_<source>`**: use `NULL` (not 0) wherever the source genuinely has no data for that lemma. NULL = "we didn't find a count from this source"; 0 = "this is a full corpus and the word isn't there". For closed corpora (lip / news / literature / wikipedia / lemmatised opensubs) where the lemma isn't in the corpus, 0 is correct. For top-N cutoff sources (itwac via franfranz, raw opensubs wordforms aggregated) where the lemma fell off the cutoff, NULL is more honest.
- **`freq_wordfreq`**: NULL if wordfreq doesn't have it.
- **Rank columns** (`rank_*`): keep whatever rank values the preCounts version had, NULL where the source didn't list the lemma.
- **`merged_rank`**: the order from the preCounts version is the source of truth; the restored rows take ranks 9,338 through 18,000.

The `sources_count` column should reflect the number of sources with **any** data (rank OR count OR freq) for the lemma, not just the count columns.

### Verification ask

After restore:

```sql
SELECT COUNT(*) FROM lemmas;   -- expect 18,000
SELECT MIN(merged_rank), MAX(merged_rank) FROM lemmas;   -- expect (1, 18000)
```

And the SUM-over-counts invariants that item F will enforce should still hold after this restore (zero-attribution for splits, full attribution to canonical row).

### Small additional ask: truncate-then-write on JSON outputs

While the lemma CSV got smaller, the curated JSON file hit a different write issue: when the vocab chat tried to load `vocabulary_it_frequency.json`, Python errored with "Extra data" at the closing bracket. Investigation showed a valid 1,496-entry JSON array ending at byte 664,329, then ~14 KB of stale string-fragment from a previous larger write, then null bytes. The previous write was longer than the new one, and the new write didn't truncate. The vocab chat parsed-and-cleaned by `raw_decode` + atomic rewrite, so the data's fine — but if your DB regenerator or any other script writes JSON via `open(p, 'w')` without `.truncate()` or via streaming, please make sure it uses `os.replace()` from a tmp file OR truncates the target first. This is the same family of bug that bit the OneDrive sync earlier.

---

## F. Apply the homograph dedup per architect's option 1

### What the bug looks like now

When a single surface form (e.g. `il`) corresponds to multiple `(lemma, pos, gender)` split rows in the lemma table, the same count is currently attributed to every split row. Three split rows for `il` (article / pronoun / noun-ambiguous) all carry `count_opensubs = 14,199,426`. Five split rows for `che` all carry the same count. And so on.

Sum-of-counts vs corpus total, current:

| source | sum | corpus total | ratio |
|---|---|---|---|
| opensubs | 479,962,631 | 241,569,888 | 198.68% |
| news | 4,720,769 | 2,479,394 | 190.40% |
| lip | 97,747,514 | 51,939,699 | 188.19% |
| literature | 10,240,780 | 5,774,685 | 177.34% |
| wikipedia | 903,995,481 | 518,971,790 | 174.19% |
| itwac | 634,644,208 | 681,124,896 | 93.18% (clean — POS-aware upstream) |

The over-100% sources are the ones lemmatised POS-blind during your freq pass; itwac escapes because the upstream franfranz files separated counts by POS.

### Architect's decision (verbatim)

> Option 1, please. From the consumer side I want SUM(count_*) over all rows to equal the corpus total exactly once — so coverage queries can just say "sum the counts where the learner knows the lemma" with no further dedup.
>
> Use lowest `merged_rank` as the canonical row (your suggestion). Set the count fields on non-canonical split rows to `0` rather than `NULL`, so SUMs and AVGs behave predictably and no consumer has to remember to `COALESCE`.
>
> The single sentence in the schema doc that needs adding is something like: "For surface forms that resolve to multiple `(lemma, pos, gender)` split rows, each per-corpus count is attributed in full to the row with the lowest `merged_rank` and zero on the rest. Sum the column to recover the corpus total."

### What we need

For every set of split rows sharing the same `lemma` (regardless of pos and gender):

1. Identify the canonical row: the one with the lowest `merged_rank` in the set.
2. Keep the full count on the canonical row in every `count_<source>` column AND `freq_wordfreq`.
3. Set the same fields on every non-canonical row in the set to `0` (use `0`, not `NULL`, per the architect).

This applies to the 7 surface-form-aggregated source columns: `count_opensubs`, `count_lip`, `count_news`, `count_literature`, `count_wikipedia`, plus `freq_wordfreq`. It does NOT apply to `count_itwac` (which is already POS-aware) — leave that column alone.

Rank columns (`rank_*`) are not affected; they stay on every split row as before. Other metadata fields (`gender`, `auxiliary`, `adj_class`, etc.) are unaffected.

### After-action: regenerate DB and verify

After applying the dedup to the CSV, rebuild the SQLite. Then verify each affected column sums to the corpus total exactly:

```sql
-- For each split-affected source, should now equal sources.total_tokens for that source
SELECT 'opensubs' AS source, SUM(count_opensubs) AS total FROM lemmas
UNION ALL SELECT 'news', SUM(count_news) FROM lemmas
UNION ALL SELECT 'lip', SUM(count_lip) FROM lemmas
UNION ALL SELECT 'literature', SUM(count_literature) FROM lemmas
UNION ALL SELECT 'wikipedia', SUM(count_wikipedia) FROM lemmas;

-- Cross-check against sources
SELECT name, total_tokens FROM sources WHERE name IN ('opensubs','news','lip','literature','wikipedia');
```

The sum and total_tokens should match (within rounding for `freq_wordfreq` which is a float). The current ratios (198%/190%/etc) should drop to ~100% in every row of the first query.

### Schema doc

Add the sentence the architect suggested, into `linguics_italian.db.SCHEMA.md` near the count columns:

> "For surface forms that resolve to multiple `(lemma, pos, gender)` split rows, each per-corpus count is attributed in full to the row with the lowest `merged_rank` and zero on the rest. Sum the column to recover the corpus total."

And the matching note in the lemma CSV's README/header comment if you have one.

---

## Order of operations

1. Restore the lemma CSV to 18,000 rows (item E), with NULL convention for tail lemmas with no data.
2. Apply option-1 homograph dedup (item F) to the now-18K CSV.
3. Regenerate the SQLite DB.
4. Run the verification SUM queries.
5. Update the schema doc.

After step 5, the vocab chat picks up from there — it'll rerun its thin fill against the restored tail (ranks 9,338-18,000) to extend the curated JSON to full coverage, then start the rich-fill enrichment pass.

---

## Out of scope for this brief

The `il`/`lo` gloss-disambiguation work in `PATCH_REQUEST_for_code.md` is still pending but separate from this. Do whenever convenient.

The `translation_en` comma-string to array migration is also still open and would let the marker do clean set operations on glosses, but it depends on a marker-side decision the architect hasn't ruled on yet (FEEDBACK item 13 update).
