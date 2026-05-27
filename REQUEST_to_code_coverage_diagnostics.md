# Request to Code: two diagnostic checks on the coverage numbers

Before the architect and vocab chats build on top of the new `count_<source>` columns, please run two quick diagnostics on the deduped lemma table. They take about ten minutes and will let everyone stop guessing about whether the 85-94% post-dedup sums are sensible or whether something is leaking.

## Why this matters

You wrote, after the F dedup:

> The 5-15% deficit is the long tail outside the top-N lemmatisation cutoff, expected and consistent across registers.

That is plausible, but currently unverified. Published Italian coverage curves give top-10,000 lemmas around 97-98% of running text, and 18,000 lemmas should land near 98-99%. The gap from textbook expectation to the observed 84-94% is exactly the size you would expect if the corpus denominators include punctuation, numbers, proper nouns, unlemmatisable tokens and noise. It is also exactly the size you would see if there is a real lemmatisation gap or counting leak. The two stories give the same headline number and can only be told apart by inspecting what is actually missing.

The ItWaC column is partly self-diagnostic. `source_metadata.json` says ItWaC excludes auxiliaries and function words upstream and `applies_to_pos: [noun, verb, adjective]`. So ItWaC's `total_tokens` is content-words-only, and the 6.82% gap there is content tokens that did not get attributed to any lemma in the table. That should be almost entirely proper nouns and rare content words from a 681M-token web crawl. If it turns out to contain common Italian content words instead, we have a real problem. The other corpora are less self-diagnostic because their denominators include function words.

## Diagnostic 1: top-50 missing tokens per corpus

For each corpus with raw-count data (`itwac`, `opensubs`, `lip`, `news`, `literature`, `wikipedia`, plus optionally `hermitdave` and `orgtre` if cheap), produce the 50 most frequent tokens that do NOT map to any of the 18,000 lemmas in the table, with their raw counts.

Interpretation rules:

- If a corpus's list is dominated by proper nouns (Marco, Italia, Roma, Berlusconi), numbers, punctuation tokens, interjections, foreign words and archaic forms, the "long tail" claim is verified for that corpus and no action is needed.
- If a corpus's list contains ordinary Italian content words (cosa, fare, dire, modo), common enclitic or reflexive forms (dirgli, vorrei, dammi, gliene), or what look like unlemmatised verb conjugations, that is a real bug in either the lemma list or the lemmatisation pipeline for that corpus. Flag it and we'll discuss before the architect or vocab chats consume the table.

For ItWaC specifically, the expected content of the missing-tokens list is proper nouns and rare nouns/verbs/adjectives only. Anything else (function words, frequent content words) would indicate a real problem because ItWaC's denominator is content-only.

Save the output as `data/coverage_diagnostic_missing_tokens.md`, one section per corpus, with each entry as `{token}\t{count}`. Plain markdown is fine.

## Diagnostic 2: top-N anchor against published coverage curves

For OpenSubtitles, sum `count_opensubs` over progressively larger top-N slices by merged rank, then express each as a percentage of `total_tokens['opensubs']`:

- top 1,000 lemmas
- top 2,000
- top 5,000
- top 10,000
- top 18,000 (full table — should match your existing 94.21%)

Expected shape if the table is anchored correctly:

- top 1,000: ~75-85%
- top 2,000: ~85-90%
- top 5,000: ~92-95%
- top 10,000: ~95-97%
- top 18,000: ~94% (matches the existing post-dedup figure)

If top 1,000 lands at ~55% or top 5,000 lands at ~70%, the merged-rank ordering is leaking against OpenSubtitles' own rank order, or counts are not being aggregated correctly. Either way, worth knowing before the housing trusts these numbers.

A second anchor that comes free: do the same sum over the existing `nvdb_tier` column. Total `count_opensubs` over rows tagged FO ("fundamental", roughly 2,000 lemmas) should land in the published NVDB coverage range for spoken Italian (which subtitles approximate). If it doesn't, the nvdb_tier mapping or the count attribution has a leak somewhere.

Append the results to the same diagnostic markdown file.

## Document `total_tokens` semantics in `source_metadata.json`

The existing metadata has `type`, `description`, and for ItWaC `applies_to_pos`. Please add one more field per corpus making the denominator semantics explicit, so the housing can pick the right coverage story to tell learners:

- `total_tokens_includes`: short string. Suggested values:
  - `"content_pos_only"` — only noun/verb/adjective tokens after function-word stripping (matches the existing ItWaC description)
  - `"all_lemmatisable_tokens"` — every token that simplemma assigned a lemma to (probably what the lemmatised opensubs, news, lip, wikipedia, literature totals are, but please verify against the build script)
  - `"raw_wordforms"` — every wordform token, no lemmatisation (hermitdave, orgtre)

If the truth is more nuanced than the suggested options, write what's actually true. The important thing is that someone reading `source_metadata.json` can answer "if I sum count_<source> across my known lemmas and divide by total_tokens, what fraction am I measuring?" without having to read the build script.

This matters downstream because "you understand 92% of typical Italian news text" and "you understand 98% of content words in typical Italian news text" are both legitimate framings under different conventions, and they tell the learner very different stories.

## What not to worry about

The earlier note about the file briefly being at 9,337 rows — confirmed stale snapshot, not a real truncation. Don't spend time on it.

## Summary

Two checks, one metadata field per corpus, roughly ten minutes of work. Once the missing-token lists come back, we can decide whether the table is ready to consume or whether something needs another pass. No need to block on this for any work that doesn't touch coverage figures.

Thanks.
