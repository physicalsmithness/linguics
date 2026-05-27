# Request to Code: classify the missing pile, compute adjusted denominators

Follow-up to the coverage diagnostics work. The previous diagnostic gave us the top-50 missing tokens per corpus and confirmed the headline numbers are broadly sound. This brief turns those lists into a learner-meaningful coverage figure per corpus, using a clean policy on what belongs in the denominator and what doesn't.

## The policy

After reviewing the diagnostic output, the agreed framing is: a corpus's denominator should include only tokens that represent vocabulary a competent user of modern Italian would genuinely need to know. Tokens that are upstream noise, foreign content, or tokeniser/lemmatiser artefacts of forms the learner can already parse should come out of the denominator. Tokens that are characteristic vocabulary of the corpus itself (including archaic Italian in Gutenberg) should stay in.

Seven categories. The first five exclude from the denominator. The last two stay in.

| # | Category | Examples | Denominator |
|---|---|---|---|
| 1 | Proper nouns | Maria, Carlo, Roma, Trump, Barack, Bruxelles | exclude |
| 2 | Foreign words and English borrowings | league, records, asset, surplus, championship, division, military | exclude |
| 3 | Numerals and acronyms | xix, xvi, xviii, BCE, FMI, QE, HIV, UE, ATP | exclude |
| 4 | Phantom upstream lemmas | farire, saperire, definirire, lettare, natare, mortare, facendere, tangere | exclude (see ItWaC verification below) |
| 5 | Lemmatisation/tokenisation artefacts | farlo, dammi, vattene, scusami, dirmi, perche, piu, cosi, dell'unione, l'onorevole, nell'ambito, c'è | exclude (tag as "tokeniser-fixable") |
| 6 | Archaic and corpus-native vocabulary | avea, perchè, anco, ch'io, de', que', poichè, ne', a' | **include** |
| 7 | Genuine rare Italian content outside the 18,000 | (the residual) | include |

The reasoning behind each decision, briefly so anyone reading the metadata knows what they're looking at:

**Proper nouns and foreign words (1, 2)** aren't Italian vocabulary. A learner reading Italian Wikipedia encounters "Maria" or "league" and either recognises them as a name or treats them as opaque foreign labels; neither requires a vocabulary entry. Out.

**Numerals and acronyms (3)** aren't vocabulary either. Roman numerals XIX, popes' regnal numbers, financial acronyms like BCE or FMI: all "you read them as labels, you don't need to know them as Italian words." Out.

**Phantom upstream lemmas (4)** are TreeTagger / simplemma morphological-backoff artefacts. For irregular Italian verbs, TreeTagger constructs spurious infinitives by gluing `-ire` onto perceived stems (`fare` becomes `farire`, `sapere` becomes `saperire`, the gerund `facendo` becomes the nonsense `facendere`). simplemma does the same with participle-shaped tokens (`tanto` becomes `tangere`). These aren't real Italian lemmas and they aren't in our 18,000-lemma table by design. They're upstream tooling noise that shouldn't penalise our coverage. Out.

**Lemmatisation and tokenisation artefacts (5)** are forms a learner who knows the base lemmas already understands. A learner who knows `fare` and `lo` understands `farlo`; the only reason `farlo` appears as "missing" is that simplemma doesn't strip enclitics. Similarly, `dell'unione` is `di + l'unione`, which a learner who knows `di` and `unione` parses without effort, and the only reason it's missing is that WORD_RE doesn't split apostrophe contractions. Likewise `perche` (subtitle convention drops the accent off `perché`), `piu` for `più`, `cosi` for `così`. These are cosmetic surface variants of lemmas the learner already knows. The structurally right fix is to fix the tokeniser/lemmatiser so these forms get attributed to their real lemmas in the numerator. Until that work is done, exclude them from the denominator and **tag them in metadata as `tokeniser_fixable`** so we don't forget the upstream debt.

**Archaic forms (6)** stay in. Gutenberg's whole purpose is to measure coverage against classical Italian literature; stripping `avea`, `perchè`, `anco`, `ch'io` from its denominator answers a meaningless question. The honest Gutenberg figure tells learners "if you know modern Italian, you'll catch X% of Manzoni." That's the figure we want. Same applies to any future corpus where the corpus's own vocabulary characteristics are the point of including it.

**Genuine rare content (7)** stays in. These are real Italian words the learner doesn't know because they're outside the 18,000-lemma cutoff. Honest coverage gap.

## Deliverables

### 1. Classifier script

A standalone Python script, `coverage_classifier.py`, that:

- Loads the missing-tokens output from the previous diagnostic (the per-corpus top-50 lists, or ideally the full per-corpus missing-token enumeration if that's cheap to regenerate).
- Assigns each token to one of the seven categories.
- Outputs a structured file `data/coverage_classification.tsv` with columns: `corpus`, `token`, `count`, `category`, `notes`.

Suggested heuristics. None of these need to be perfect; flag uncertain cases as `category_uncertain` and we'll review.

- **Proper nouns (1):** capitalised in the corpus more than (say) 60% of its occurrences AND lowercase form not in our 18k lemma list. Cross-reference with a name list if convenient (Italian Wikipedia gazetteer, or a simple "common first names" file). Tokens like `Maria` would qualify.
- **Foreign words (2):** lowercase tokens that match English wordlist patterns (CMU dict, NLTK English wordlist) and don't match Italian phonotactic patterns. `league`, `records`, `asset`. There will be borderline cases like `asset` (in Italian financial Italian); those go to `category_uncertain`.
- **Numerals and acronyms (3):** matches `^[xvilcdmXVILCDM]+$` for Roman numerals; matches `^[A-Z0-9]{2,5}$` for acronyms; any digit-bearing token.
- **Phantom upstream lemmas (4):** a curated list. Start with the ones already identified: `farire, saperire, definirire, lettare, natare, mortare, facendere, riuscitare, lasciatare, apertire, andatare, indire (the wrong-sense one), tangere`. Probably 30-50 entries total. Easy to extend over time. List them in a comment block in the classifier script so future additions are obvious.
- **Lemmatisation/tokenisation artefacts (5):** apostrophe contractions matched by `^(dell?|nell?|all?|dell?'|nell?'|all?'|l'|d'|c'|s'|n'|m'|t')` patterns; clitic-verb forms detected by stripping common pronominal clitics (`mi, ti, si, lo, la, le, ne, gli`) and checking whether the remaining stem is a verb lemma in the table; accent-stripped forms detected by adding back common accents (`perche` → `perché`, `piu` → `più`, `cosi` → `così`) and checking whether the accented form is in the table.
- **Archaic forms (6):** corpus-specific. For Gutenberg, anything matching common 19th-century Italian patterns (`ch'io, s'era, ne', de', pei, a' que', avea, potea, anco, perchè/poichè with the obsolete grave accent, etc.) and not already classified elsewhere. A small curated suffix-and-pattern list is fine; we can extend it. Optionally also flag tokens that DO map to a modern lemma after stripping archaic spelling (`avea` → `aveva` → `avere`); those are a sub-category we might want to handle in a future tokeniser pass, but for now they stay in the denominator under category 6.
- **Residual (7):** anything that didn't match the above.

The classifier doesn't need to be sophisticated. A reasonable heuristic that gets 85% of tokens right is enough; the per-category totals are robust to small misclassifications.

### 2. Per-corpus tally and metadata update

For each of the seven corpora with raw counts (`itwac, opensubs, lip, news, literature, wikipedia, hermitdave, orgtre`), compute the total token count in each of the five exclude-categories, summed across the FULL missing pile (not just the top 50). Save as a structured block in `source_metadata.json`:

```json
"opensubs": {
  "total_tokens": 241569888,
  "total_tokens_raw": 241569888,
  "total_tokens_learner": <computed>,
  "type": "raw_count",
  "total_tokens_includes": "alphabetic_wordforms_attempted",
  "excludable_breakdown": {
    "proper_nouns": <count>,
    "foreign_words": <count>,
    "numerals_and_acronyms": <count>,
    "phantom_upstream_lemmas": <count>,
    "tokeniser_fixable": <count>
  },
  "description": "..."
}
```

`total_tokens` stays as the original raw figure (for back-compat with anything already reading it); `total_tokens_raw` is the explicit alias; `total_tokens_learner` is the new denominator the housing will use to report coverage.

### 3. Recomputed headline coverage

For each corpus, recompute the per-corpus sum of `count_<source>` divided by `total_tokens_learner` rather than `total_tokens`. Report alongside the old figures so we can see the shift.

Expected shape based on the previous diagnostic, with caveats: OpenSubtitles, news, LIP should jump from ~94% to ~98-99% once their tokeniser-fixable buckets come out of the denominator. Wikipedia should jump from 88.5% to ~96-97% once proper nouns and foreign borrowings come out. Gutenberg should stay close to 84.76% because archaic forms remain in the denominator (only proper nouns and the small Latinate-phantom share come out). ItWaC depends on the verification result (next item).

If the actual numbers are noticeably different from this shape (Gutenberg jumping to 95%, or OpenSubs only hitting 95%), flag it. The shape gives us a quick sanity check that the classifier is doing roughly the right thing.

### 4. ItWaC phantom-lemma verification (side check)

For each of the phantom-affected verbs (`fare, sapere, definire, letto, nato, morto, facendo, stato, lasciato, riuscito, aperto, andato, indica, indicare`), compare `count_itwac` in the lemma table against the sum of all franfranz rows where the surface form maps to that verb in any way (correct lemma or phantom lemma).

Two possible outcomes:

- **`count_itwac` already equals the full surface count:** franfranz is double-attributing (same count under correct lemma and phantom lemma), and the lemma table's parser took only the correct row. The phantom rows are pure duplication noise. No action needed beyond classifying them as category 4.

- **`count_itwac` is less than the full surface count:** franfranz is splitting the count between correct and phantom rows. The lemma table is under-attributing real verbs by the share that went to phantoms. In this case, we need a small alias table (`farire → fare, saperire → sapere, ...`) applied at lemma-table-build time to merge phantom counts back into their real correlates. Approximately 30-50 entries should catch the bulk.

Report which case applies. If it's the second, the alias-table work is a small follow-up brief.

## Order of operations

1. Build the classifier script using the heuristics above.
2. Run it on the full missing-token enumeration per corpus.
3. Compute `total_tokens_learner` and the `excludable_breakdown` block; write into `source_metadata.json`.
4. Run the ItWaC verification check; report result.
5. Recompute and report the headline coverage table against `total_tokens_learner`.
6. Save a summary in `data/coverage_classification_report.md` showing per-corpus totals in each category plus the old-vs-new headline coverage.

## Out of scope for this brief

The structural fix for category 5 (improving the tokeniser to strip apostrophe contractions and clitics, and accent-normalising for OpenSubs) is a separate piece of work. Worth doing eventually because it would push those tokens from the excludable pile back into proper lemma attribution, but it doesn't block this classification work and shouldn't be bundled in.

The alias-table fix for category 4 (mapping phantom lemmas back to real ones at build time) is conditional on the ItWaC verification outcome. If the verification shows attribution is leaking, we'll commission that work in a follow-up brief.

A future modern-fiction corpus (to give a "modern Italian literature coverage" figure distinct from Gutenberg's archaic-classical figure) is also out of scope here. Worth flagging in `ROADMAP.md` for later.

## Verification

After all four deliverables land, the architect and vocab chats can verify by running:

```sql
SELECT name, total_tokens_raw, total_tokens_learner,
       1.0 * total_tokens_learner / total_tokens_raw AS keep_fraction
FROM sources;
```

Expected `keep_fraction`: 0.85-0.93 for most corpora (i.e., 7-15% of corpus is excludable), with Gutenberg closest to 1.0 (because archaic forms stay in) and Wikipedia lowest (because proper-noun + loanword mass is large).

And the coverage figures for the full table:

```sql
-- Old figure
SELECT name, SUM(count_X) * 1.0 / total_tokens_raw AS old_coverage FROM ...
-- New learner-meaningful figure
SELECT name, SUM(count_X) * 1.0 / total_tokens_learner AS new_coverage FROM ...
```

The "new" coverage should land in the 96-99% range for the lemmatised corpora (excluding Gutenberg) and somewhere in the 88-92% range for Gutenberg. ItWaC depends on the verification outcome.

Thanks.
