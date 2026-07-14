# Coverage: Comparatives and superlatives

**Seat:** ComparisonAuthor · **Date:** 2026-07-15 · **Authored to:** AUTHOR_BRIEF Revision 17 · **Tree:** `data/buckets/comparison.json` (11 nodes, 8 active leaves, topic_short `cmp`)

Delivered: 51 grammar items, 24 translation items, 4 glossary suggestions, 0 bucket suggestions. Counts below are computed from the shipped files, not from memory of batches.

## Bucket-to-item counts

| Leaf | id (under `comparison.`) | Grammar | Translation | Direction | Suppressed |
|---|---|---:|---:|---|---|
| Più and meno with di | `comparative.piu_meno_di` | 6 | 3 | production | no |
| Di or che? | `comparative.di_vs_che` | 12 | 6 (3 IT→EN) | bidirectional | yes (12) |
| As...as: come and quanto | `comparative.equality` | 5 | 2 | production | no |
| Migliore, peggiore, maggiore, minore | `comparative.irregular_adjectives` | 5 | 2 | production | no |
| Migliore or meglio? | `comparative.migliore_vs_meglio` | 6 | 4 (2 IT→EN) | bidirectional | yes (6) |
| Il più... di | `superlative.relative` | 5 | 2 | production | no |
| -issimo | `superlative.absolute` | 7 | 2 | production | no |
| Ottimo, pessimo, benissimo | `superlative.irregular` | 5 | 3 (2 IT→EN) | bidirectional | no |
| **Total** | | **51** | **24** | | **18** |

The three aggregates (the root, Comparatives, Superlatives) carry no items of their own; every item cites a leaf. Translation splits 17 EN→IT / 7 IT→EN, with all seven IT→EN recognition items on the three bidirectional leaves and the production-only leaves taking EN→IT only, per the dispatch.

Weighting follows the dispatch's priority order: Di or che? is the heaviest leaf (12 grammar plus 6 translation), and -issimo takes 7 because the spelling join carries three separate sub-rules.

## The engine limitation this topic runs into (the main finding)

The grammar marker tests `any_phrases` **before** `must_not_include`, so a positive match wins outright. The consequence: **a guard can never fire when the correct form is a substring of the error it is meant to catch.** Three of this topic's five hot spots have exactly that shape.

1. **Double comparative ("più migliore"). Solved.** With a bare `migliore` answer the guard is dead: `migliore` is a word inside `più migliore`, so the error scored full credit. This was caught by running answers through a replica of the marker, not by reading the JSON. Fixed by pulling the copula into the answer: the items now want `è migliore`, and the inserted `più` breaks the `è migliore` adjacency so `must_not_include` is reached. Applied to all five items on Migliore, peggiore, maggiore, minore; verified.
2. **Repeated-article calque ("la città la più bella"). Solved differently.** Any item whose answer is a bare `più` is unfixable, since `più` sits inside `la più`. So the two calque-catchers are whole-phrase items: the answer is `la città più bella`, and the calque's intervening `la` breaks the `città più` adjacency, letting `città la più` fire. Verified.
3. **Stacking ("molto bellissimo", "molto ottimo"). Not solvable here.** `bellissimo` is a word inside `molto bellissimo`, and no reformulation removes the containment, because the error is purely *additive*: the correct answer is the whole answer and the learner has put a spurious word in front of it. **No dead guard was shipped.** The catch is routed to the AI-marked translation strand as negative-polarity references (`trans_cmp_en_it_abs_02`, `trans_cmp_en_it_supirr_01`) and to the misconception axis.

The general shape is worth a ruling: **additive errors are outside the substring marker's reach.** Any topic whose characteristic mistake is "the learner added a word in front of a correct form" hits this. It is not specific to comparison.

## Revision 17 conformance

- **Criterion 16, generalised to non-tense discriminations.** The 18 items on the two discrimination leaves carry `candidate_forms` + `correct_form` (`di | che`; `migliore | meglio`) alongside `info_display: "suppress"`. Split: Di or che? 9 *che* / 3 *di*; Migliore or meglio? 4 *meglio* / 2 *migliore*.
- **Criterion 18, all three directions.** Short single-form phrases are `match_at: "word"` anchored (verified: `più di venti` correctly refuses `più di ventidue`). The new third direction, that no guard may fire on a plausible *correct* attempt, was audited across all 51 items: 0 problems.
- **0.9-for-dodges.** Four variants are correct Italian that sidestep the drilled form and score 0.9 with a steering note: `è più buono` for migliore, `è più cattivo` for peggiore, `buonissima` for ottima, `cattivissimo` for pessimo.
- **Criterion 17.** Every explanation opens with a plain-English gloss of the completed sentence.
- **The ratified meglio ruling.** `meglio` with a noun subject scores 0.5 with a register note (`cmp_mvm_01`, `cmp_mvm_04`), verified as 0.5. Deliberately *not* folded into 0.9-for-dodges: it is non-standard rather than correct-but-sidestepping, so it keeps its own grade.

Markers were verified by replicating `norm()` and the marker's precedence and marking representative right and wrong answers, not by inspection.

## Items flagged uncertain

- **`cmp_irr_01`–`cmp_irr_05` (predicative framing).** These read `Mia sorella è maggiore di me` rather than the more idiomatic and far more frequent `mio fratello maggiore`. The predicative shape was chosen *only* so the double-comparative guard can fire. This trades idiom for diagnostic reach and is the batch's biggest deliberate compromise. If Architecture prefers idiom, they revert to attributive and the guard moves to translation.
- **`cmp_rel_02`, `cmp_rel_04`.** Whole-phrase answers (`la città più bella`) run to four words, at the ceiling of criterion 6. Deliberate, and the only way to catch the calque.
- **`cmp_eq_04`.** `La situazione è così grave come sembra`: the full così...come pair before a clause is slightly formal and many speakers drop così. Only the paired form is accepted, because the item exists to test the pairing.
- **`cmp_abs_07`.** Asks the learner to restate `bellissimo` more mildly (answer `molto`). An unusual instruction shape, and the only positive way to teach the molto / -issimo alternation once the stacking error proved uncatchable.
- **The concrete/abstract line.** `più buono` is full credit for taste (`cmp_irr_05`, pizza) but a 0.9 dodge for a restaurant's general quality (`cmp_irr_01`). The distinction is real but fine, and a learner may not feel it.

## Misconception-axis candidates (for the Misconception Analyst; not authored here)

The di/che swap in both directions (di where che belongs on two verbs, qualities or quantities; che where di belongs before an entity or a numeral); `più migliore` and the double-comparative family; the repeated-article calque; the molto + -issimo / molto ottimo stack; migliore-for-meglio in the adverb slot and meglio-for-migliore with a noun subject; `come io` / `quanto tu` (subject pronoun after come/quanto); the così...quanto pair mix; the -issimo spelling join (`stancissimo`, `simpatichissimo`).

## Notes for the next dispatch

1. **The manifest add is now due.** The standing ruling holds the new trees out of `data/manifest.json` until first content lands. It has landed, so `comparison` needs wiring.
2. **Bucket-level suppress.** Rev 17 lets aggregates carry `attributes.default_info_display: "suppress"`; the two discrimination leaves are natural users. My items carry explicit per-item flags, which win either way, so this is tidy-up, not a fix. I have not touched the tree.
3. **`bucket_suggestions` is empty, deliberately.** The 8 leaves covered everything I wanted to write; no new bucket was needed.
4. **Glossary:** four terms proposed (comparative, superlative, absolute superlative, relative superlative). None is in `glossary.json` (v4, 108 terms). Aliases suggested per entry.
5. **Cross-tree citations verified on disk:** adjective-agreement stem-changes, definite article, articulated preposition, existential plural, possessive family exception. Note that `possessive.family_exception` does not exist; the real id is `possessive.adjective.family_exception`.
6. **OIC idea bank.** Taken up: the rule-per-item di/che map (all four che triggers plus the di-before-numerals exception and di + stressed pronoun, one rule per item) and the comparative-adverb frame (`canta meglio di me`). Not taken up: the word-bank cloze (needs a bank qtype the engine does not have) and the REL-vs-ASS classification set with the non-issimo absolutes (`tenero tenero`, `arcistufo`), which would want a new leaf. Both are candidates for a later pass.
