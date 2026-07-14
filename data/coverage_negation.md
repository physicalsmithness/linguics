# Coverage: Negation (topic `negation`, prefix `neg` / `trans_neg`)

Authored by NegationAuthor. Batch 1 delivered 2026-07-14 to brief Rev 16 and ACCEPTED (scope thread v4). Reconciled 2026-07-15 to brief **Rev 19** and to Architecture's five rulings, with the né...né leaf added. Validation: 0 failures, 0 warnings.

Per brief Rev 18, this doc is the RECORD; every ask below is also live on `inter_chat/Architecture_NegationAuthor_scope_ratified.md` (v5).

## Totals

**41 grammar + 20 translation** across all 9 active leaves.

| Leaf (friendly label) | id | Grammar | Trans |
|---|---|---|---|
| Where non goes | negation.core.non_position | 6 | 2 |
| Double negation is the norm | negation.core.concord | 6 | 4 |
| Two-part negatives (non... mai/più/ancora) | negation.core.bipartite | 6 | 4 |
| Neanche, nemmeno, neppure | negation.responses | 4 | 3 |
| Non... che: only | negation.restrictive | 4 | 2 |
| Né... né | negation.correlative | 5 | 2 |
| Finché and finché non | negation.pleonastic.finche_flip | 3 | 1 |
| A meno che non, and friends | negation.pleonastic.a_meno_che | 3 | 1 |
| Mica | negation.mica | 4 | 1 |

## The five rulings, as applied (scope thread v4)

1. **Concord breadcrumb.** Suppressed all four postverbal-production items (neg_concord_01/02/05/06), including the worked example. The two preverbal-drop items (03/04) stay visible as productive traps.
2. **né...né ratified under negation.** Leaf `negation.correlative` live; authored 5 grammar + 2 translation. Covers postverbal non...né...né, the preverbal Né...né drop mirror, single né as "or", and the o...o calque guard.
3. **a_meno_che bundling accepted.** Unchanged.
4. **MCQ.** Converted 7 recognition items to real MCQ (index-scored, markpoint retained for attribution): neg_finche_01/02/03, neg_restr_04, neg_mica_01/02/04. Kept as short answer where the token is doing honest work: neg_restr_01 (produce solo), neg_ameno_03 (produce non), neg_mica_03 (produce mica).
5. **Thin comparative item.** Left as is.

## Rev 17/19 reconciliation

- **candidate_forms + correct_form (Rev 17 iii)** on the four genuine form-discriminations: neg_bip_03 / neg_bip_04 (the più-vs-ancora meaning pair, both directions) and neg_resp_01 / neg_resp_02 (the neanche-vs-anche echo). All four carry `info_display: "show"`, per Rev 19: the candidates are lexemes the prompt does not reveal, so the breadcrumb must stay visible and the leaf labels already name the candidate forms rather than the rule. **Deliberate departure:** candidate_forms NOT applied to the finché / mica / restrictive recognition items. Their answers are verdicts (is this a real negation? does this reading flip?), not competing Italian surface forms, so a candidate_forms tick would be noise. Flagged for a ruling.
- **0.9-for-dodges (Rev 17 iv)**: one applied. neg_bip_03 accepts "ho smesso" at 0.9 with a steering note (correct Italian, sidesteps the non...più frame).
- **Rev 19 recoverability**: all 12 suppressions re-checked. Each is either a production item whose task the prompt fully specifies, or an MCQ whose options are on screen. None is a hidden lexeme choice, so none becomes unanswerable when suppressed.
- **POS migration**: absorbed, not reverted. vocab_help refs are on the new `vocabulary.it.<lemma>.<pos>.translation` shape; the né...né items were authored to it directly.

## Criterion 18: third direction (Rev 17 ii) and two bugs it caught

The reconciliation audit added the third direction (no must_not_include may fire on a plausible correct attempt) and found **two dead guards, both introduced in this pass, both now fixed**:

- `neg_corr_05`: the answer "né lui né lei" nests inside the wrong "né lui né lei non lo sanno", so the positive would have CREDITED the error. Blank widened to take the verb ("né lui né lei lo sanno"), as neg_corr_02 already did.
- `neg_mica_04`: "Mica sono stupida." nests inside the distractor "Non mica sono stupida.". Because the error here is an ADDED word, the correct string is always a substring of the wrong one and no substring guard can separate them. Reframed to a yes/no MCQ whose options do not nest.

The 17 remaining "must_not inside correct" hits are all the dropped-non guards (e.g. "conosco nessuno" inside "non conosco nessuno"). These are safe and intended: must_not_include is else-if gated behind the positive, so a correct attempt matches the any_phrase and the guard is never evaluated. This is the pattern the dispatch's worked example blessed.

## Flagged for a ruling (also on the thread, per Rev 18)

1. **The elliptical dodge is unreachable.** "Cosa hai visto?" answered with a bare "Niente." is correct, idiomatic Italian that sidesteps the concord frame, so Rev 17(iv) would want it at 0.9. It cannot be authored: the phrase "niente" is a substring of the wrong attempt "ho visto niente" (dropped non), so a 0.9 entry would credit the very error the item tests. Same class as ComparisonAuthor's molto+issimo stacking. Left unauthored on neg_concord_02/06; the honest fix is a marker that can anchor a whole-answer match, or routing the ellipsis to translation.
2. **candidate_forms on verdict items** (see above): confirm the judgement or tell me to add them.

## Notes for next pass

Né...né could take a verb-agreement item (Né Marco né Luca sono/è venuti) if that is negation's rather than agreement's. Mica would benefit from a chunk-reorder format if Housing ships one, since the error is positional. The non-position leaf could gain B1 items on non with clitic clusters in compound tenses once the passato_prossimo.adverb_placement boundary is comfortable.
