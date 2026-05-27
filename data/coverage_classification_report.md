# Coverage classification report

Output of `coverage_classifier.py` — see `REQUEST_to_code_classifier_and_adjusted_denominators.md` for the policy.

Full per-token classification in `data/coverage_classification.tsv` (top-200 per corpus by count; aggregate totals are across the FULL missing pile).

## Per-corpus excludable breakdown

| corpus | total_raw | proper_nouns | foreign_words | numerals_acronyms | phantom_lemmas | tokeniser_fixable | total_learner | keep_fraction |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| itwac | 681,124,896 | 566,979 | 5,833,252 | 326,454 | 3,509,920 | 1,830,819 | 669,057,472 | 0.982 |
| wikipedia | 518,971,790 | 8,526,633 | 7,991,789 | 1,166,800 | 83,951 | 1,561,295 | 499,641,322 | 0.963 |
| news | 2,479,394 | 17,167 | 18,116 | 6,094 | 728 | 18,188 | 2,419,101 | 0.976 |
| lip | 51,939,699 | 171,623 | 81,830 | 29,806 | 15,004 | 1,345,959 | 50,295,477 | 0.968 |
| literature | 5,774,685 | 36,987 | 35,103 | 8,875 | 5,871 | 158,225 | 5,529,624 | 0.958 |
| opensubs | 241,569,888 | 3,586,686 | 979,596 | 94,545 | 158,961 | 4,614,937 | 232,135,163 | 0.961 |
| hermitdave | 241,736,295 | 3,586,686 | 979,596 | 94,545 | 158,961 | 4,614,937 | 232,301,570 | 0.961 |
| orgtre | 562,506,798 | 8,573,031 | 1,877,164 | 193,941 | 371,003 | 10,901,119 | 540,590,540 | 0.961 |

## Headline coverage: old vs new denominator

| corpus | sum count_X | old % (vs raw) | new % (vs learner) | Δ |
| --- | ---: | ---: | ---: | ---: |
| itwac | 634,644,208 | 93.18% | 94.86% | +1.68pp |
| opensubs | 227,573,699 | 94.21% | 98.03% | +3.83pp |
| lip | 48,839,725 | 94.03% | 97.11% | +3.07pp |
| news | 2,347,379 | 94.68% | 97.04% | +2.36pp |
| literature | 4,894,854 | 84.76% | 88.52% | +3.76pp |
| wikipedia | 459,335,439 | 88.51% | 91.93% | +3.42pp |

## ItWaC phantom-lemma verification

For each phantom-affected verb, comparing `count_itwac` in the lemma CSV against the franfranz row sums attributed to (a) the correct lemma and (b) the phantom lemma. `csv_equals_correct=True` means our parser already took only the correct row and phantom is pure duplication noise (no fix needed). `False` would mean we're under-attributing — alias table required.

| verb | csv count_itwac | franfranz correct sum | franfranz phantom sum | csv==correct |
| --- | ---: | ---: | ---: | :---: |
| fare | 5,447,388 | 5,447,388 | 1,326,658 | ✓ |
| sapere | 1,293,519 | 1,293,519 | 220,966 | ✓ |
| definire | 469,209 | 469,209 | 109,555 | ✓ |
| leggere | 482,938 | 482,938 | 129,417 | ✓ |
| nascere | 403,615 | 403,615 | 177,152 | ✓ |
| morire | 268,957 | 268,957 | 84,576 | ✓ |
| lasciare | 575,771 | 575,771 | 96,181 | ✓ |
| aprire | 416,417 | 416,417 | 87,635 | ✓ |
| andare | 1,699,591 | 1,699,591 | 64,498 | ✓ |
| riuscire | 605,648 | 605,648 | 115,305 | ✓ |
| seguire | 502,013 | 502,013 | 129,915 | ✓ |

**Result**: 11 verbs are case 1 (no fix needed); 0 are case 2 (would need alias table).

Good news: every phantom is pure duplication noise. No alias-table follow-up needed.

## Caveats and known classifier limitations

- **Proper-noun detection** uses a curated Italian/foreign name list plus NLTK's English names corpus. It misses Italian surnames not seen by NLTK and non-English foreign names (German/Russian/Eastern European). Some of those leak into `foreign_word` or `residual`.
- **Foreign-word detection** uses NLTK's English word list. Italian-English lookalikes (`asset`, `default`, `surplus`) get flagged as foreign even when they're now standard Italian financial vocab. Acceptable for v1.
- **Phantom-lemma list** is hand-curated from the previous diagnostic plus common backoff patterns; not exhaustive. Probably catches >90% of phantom mass but a long tail remains in `residual`.
- **Tokeniser-fixable** clitic-verb detection tries reasonable stem reconstructions; harder cases (irregular imperatives, double clitics like `gliene`) may miss.
- **Archaic detection** is only applied to the `literature` corpus. If we add a different historical corpus later, that policy will need extending.
- **Residual** is the catch-all; some of it is real rare Italian vocab outside the 18K table, some is unclassified noise. Vocab chat can audit if needed.
