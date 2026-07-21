# Coverage: Comparatives and superlatives

**Seat:** ComparisonAuthor · **Date:** 2026-07-15 · **Authored to:** AUTHOR_BRIEF Revision 28 · **Tree:** `data/buckets/comparison.json` (11 nodes, 8 active leaves, topic_short `cmp`)

Delivered: 51 grammar items, 24 translation items, 4 glossary suggestions, 0 bucket suggestions. Counts below are computed from the shipped files, not from memory of batches.

## Bucket-to-item counts

| Leaf | id (under `comparison.`) | Grammar | Translation | Direction | Suppressed |
|---|---|---:|---:|---|---|
| Più and meno with di | `comparative.piu_meno_di` | 6 | 3 | production | no |
| Di or che? | `comparative.di_vs_che` | 12 | 6 (3 IT→EN) | bidirectional | yes (12) |
| As...as: come and quanto | `comparative.equality` | 5 | 2 | production | no |
| Migliore, peggiore, maggiore, minore | `comparative.irregular_adjectives` | 5 | 2 | production | no |
| Migliore or meglio? | `comparative.migliore_vs_meglio` | 6 | 4 (2 IT→EN) | bidirectional | no (Rev 19) |
| Il più... di | `superlative.relative` | 5 | 2 | production | no |
| -issimo | `superlative.absolute` | 7 | 2 | production | no |
| Ottimo, pessimo, benissimo | `superlative.irregular` | 5 | 3 (2 IT→EN) | bidirectional | no |
| **Total** | | **51** | **24** | | **12** |

The three aggregates (the root, Comparatives, Superlatives) carry no items of their own; every item cites a leaf. Translation splits 17 EN→IT / 7 IT→EN, with all seven IT→EN recognition items on the three bidirectional leaves and the production-only leaves taking EN→IT only, per the dispatch.

Weighting follows the dispatch's priority order: Di or che? is the heaviest leaf (12 grammar plus 6 translation), and -issimo takes 7 because the spelling join carries three separate sub-rules.

## The engine limitation this topic runs into (the main finding)

The grammar marker tests `any_phrases` **before** `must_not_include`, so a positive match wins outright. The consequence: **a guard can never fire when the correct form is a substring of the error it is meant to catch.** Three of this topic's five hot spots have exactly that shape.

1. **Double comparative ("più migliore"). Solved.** With a bare `migliore` answer the guard is dead: `migliore` is a word inside `più migliore`, so the error scored full credit. This was caught by running answers through a replica of the marker, not by reading the JSON. Fixed by pulling the copula into the answer: the items now want `è migliore`, and the inserted `più` breaks the `è migliore` adjacency so `must_not_include` is reached. Applied to all five items on Migliore, peggiore, maggiore, minore; verified.
2. **Repeated-article calque ("la città la più bella"). Solved differently.** Any item whose answer is a bare `più` is unfixable, since `più` sits inside `la più`. So the two calque-catchers are whole-phrase items: the answer is `la città più bella`, and the calque's intervening `la` breaks the `città più` adjacency, letting `città la più` fire. Verified.
3. **Stacking ("molto bellissimo", "molto ottimo"). Not solvable here.** `bellissimo` is a word inside `molto bellissimo`, and no reformulation removes the containment, because the error is purely *additive*: the correct answer is the whole answer and the learner has put a spurious word in front of it. **No dead guard was shipped.** The catch is routed to the AI-marked translation strand as negative-polarity references (`trans_cmp_en_it_abs_02`, `trans_cmp_en_it_supirr_01`) and to the misconception axis.

The general shape is worth a ruling: **additive errors are outside the substring marker's reach.** Any topic whose characteristic mistake is "the learner added a word in front of a correct form" hits this. It is not specific to comparison.

## Revision 19 conformance

- **Criterion 16, generalised to non-tense discriminations.** All 18 items on the two discrimination leaves carry `candidate_forms` + `correct_form` (`di | che`; `migliore | meglio`). Split: Di or che? 9 *che* / 3 *di*; Migliore or meglio? 4 *meglio* / 2 *migliore*.
- **Criterion 15 + the Rev 19 recoverability condition.** Di or che? stays suppressed (12 items): its candidate set *is* recoverable pre-answer, because the comparative frame pins the slot to di-or-che, and noticing that a connector choice is in play is precisely the skill. Migliore or meglio? flips to `info_display: "show"` (6 items): migliore and meglio are different lexemes that nothing in the prompt reveals. This is the same shape as the bene/buono case that produced Rev 19; migliore/meglio simply *is* the comparative of buono/bene. Suppressed, a learner cued only "(better)" could reasonably write *più buono* and take a miss on a bucket they were never invited to engage. The leaf label "Migliore or meglio?" already names its candidate forms rather than the rule, as Rev 19 requires, so no relabel is needed. Criterion 16's `candidate_forms` ride along on all 18 for the post-answer tick.
- **Criterion 18, all three directions.** Short single-form phrases are `match_at: "word"` anchored (verified: `più di venti` correctly refuses `più di ventidue`). The new third direction, that no guard may fire on a plausible *correct* attempt, was audited across all 51 items: 0 problems.
- **0.9-for-dodges, and Rev 20's dodge-vs-named-miss precedence.** Two variants are pure dodges and keep **0.9** with a steering note: `è più buono` for migliore and `è più cattivo` for peggiore. The tree protects both explicitly, since the irregular-comparatives leaf names *rejecting* più buono as the miss rather than producing it, so the general kindness applies. Two others do not qualify: `buonissima` for ottima is the superlative-irregular leaf's **own named common_miss** ("'buonissimo' forced where ottimo is the idiomatic choice"), so per Rev 20 the specific diagnosis outranks the 0.9 default and it is regraded to an explicit **0.7** with a steering note; `cattivissimo` follows at 0.7 as the unnamed mirror of the same miss on pessimo. Three tiers for three different sins: **0.5** non-standard (meglio with a noun subject), **0.7** standard Italian that misses the idiom the leaf teaches, **0.9** correct and idiomatic but off-pattern.
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

1. **Manifest: already wired, no action.** Architecture's estate pass took the manifest to 30 topics and `comparison` is in it, so the standing "add on first content landing" ruling is satisfied.
2. **Bucket-level suppress.** Rev 17 lets aggregates carry `attributes.default_info_display: "suppress"`; the two discrimination leaves are natural users. My items carry explicit per-item flags, which win either way, so this is tidy-up, not a fix. I have not touched the tree.
3. **`bucket_suggestions` is empty, deliberately.** The 8 leaves covered everything I wanted to write; no new bucket was needed.
4. **Glossary:** four terms proposed (comparative, superlative, absolute superlative, relative superlative). None is in `glossary.json` (v4, 108 terms). Aliases suggested per entry.
5. **Cross-tree citations verified on disk:** adjective-agreement stem-changes, definite article, articulated preposition, existential plural, possessive family exception. Note that `possessive.family_exception` does not exist; the real id is `possessive.adjective.family_exception`.
6. **OIC idea bank.** Taken up: the rule-per-item di/che map (all four che triggers plus the di-before-numerals exception and di + stressed pronoun, one rule per item) and the comparative-adverb frame (`canta meglio di me`). Not taken up: the word-bank cloze (needs a bank qtype the engine does not have) and the REL-vs-ASS classification set with the non-issimo absolutes (`tenero tenero`, `arcistufo`), which would want a new leaf. Both are candidates for a later pass.
7. **POS-migration reconciliation.** The POS-migration run processed 78 of this batch's 83 vocab refs. Five were left without a POS segment (`alto`, `lungo`, `migliore`, and `vicino` twice) and three were given the wrong POS *for their context here*: `bravo` as **interjection** (it is the adjective "skilful" in `più famoso che bravo`, not the exclamation), `buono` as **adverb** (buono is the adjective; bene is the adverb), and `tranquillo` as **adverb** (adjective in `sono più tranquillo in campagna`). All 14 affected refs are corrected in place and the batch is now 83/83 POS-bearing. Worth checking whether the same three guesses landed in other seats' files.
8. **Batch disposition.** ACCEPTED by Architecture (`inter_chat/Architecture_ComparisonAuthor_batch_disposition.md` v1), with the meglio grading recorded as the standing distinction: 0.5-own-grade for non-standard, separate from 0.9-for-dodges for correct Italian that sidesteps the pattern.
9. **Criterion 20 (Rev 22), applied on next touch.** Of Architecture's 19 candidates, the 10 di_vs_che items are glossed by bracketed English meaning with `prompt_supplies_base_form:false`: they carried no English at all, so a bare Italian word beside the blank could be typed as the whole answer and score an unrecognised miss for a cue-misread rather than a grammar failure. The other 9 stand: `cmp_pmd_01-05`, `cmp_eq_03` and `cmp_rel_03` already carry an English meaning and their Italian cue only anchors the lexeme, and `cmp_irr_01/02` are exempt citation-form triggers. Criterion 19 re-checked *after* glossing (see thread): still a no-op, because the gloss "than tea" pins `tè` as firmly as the deleted cue did.
10. **False-miss packet (2026-07-21), 3 items, applied + verified.** Correct Italian that scored 0 on live learners: `cmp_eq_01` now accepts `quanto me` (come/quanto interchangeable for degree-equality with a pronoun); `cmp_eq_03` now accepts `bello quanto` (tanto optional in the correlative), and its dead `così bello quanto` guard was removed (additive error, out of the marker's reach); `cmp_pmd_04` now credits `oltre venti` at 0.9 as an off-pattern dodge. Whole-file criterion-18 audit clean; `wrong_answer_is_form_error_only` verified `true` on all three. Notation gap flagged to Architecture: 34 items carry an English gloss in mid-prompt parens (no render bug, but against the [brackets] convention); awaiting their call before any conversion.
