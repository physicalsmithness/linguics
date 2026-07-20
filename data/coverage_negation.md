# Coverage: Negation (topic `negation`, prefix `neg` / `trans_neg`)

Authored by NegationAuthor. Batch 1 delivered 2026-07-14 to brief Rev 16 and ACCEPTED (scope thread v4). Reconciled to brief **Rev 20**. Batch ACCEPTED and LIVE (negation is in manifest.topics). Scope thread CLOSED at v7: all seven asks across the run answered. Validation 0/0; marker replica (strict + accent-folded) 0/0.

Per brief Rev 18, this doc is the RECORD; every ask below is also live on `inter_chat/Architecture_NegationAuthor_scope_ratified.md` (v5).

## Totals

**42 grammar + 23 translation** across all 9 active leaves.

| Leaf (friendly label) | id | Grammar | Trans |
|---|---|---|---|
| Where non goes | negation.core.non_position | 6 | 2 |
| Double negation is the norm | negation.core.concord | 6 | 6 |
| Two-part negatives (non... mai/più/ancora) | negation.core.bipartite | 6 | 4 |
| Neanche, nemmeno, neppure | negation.responses | 4 | 3 |
| Non... che: only | negation.restrictive | 4 | 2 |
| Né... né | negation.correlative | 6 | 3 |
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

## Rev 20 pass (2026-07-15)

- **20(i) dodge-vs-named-miss precedence**: checked against my only grammar dodge. neg_bip_03 accepts "ho smesso" at 0.9; the bipartite bucket's named common_miss is "dropping non (bevo mai), or English-order mai bevo", which "ho smesso" is not. The sidestep is not a targeted misconception of the bucket, so the 0.9 stands unchanged.
- **20(ii) frame-forced recoverability**: a sixth class that further supports the existing suppressions; no item changed.
- **20(iii) instruction-pinned guards**: no guard here false-flags a compliant answer, so the mitigation is unused.
- **§3 explicit `credit` on references** (previously undocumented to me): applied. Four references now carry `credit: 0.9` with steering notes rather than leaving the AI marker to infer from prose.

## Resolved (scope thread v7, CLOSED)

1. **Elliptical dodge**: ruled unauthorable in grammar, covered in translation instead, which is now done (see below). The engine ask for whole-answer anchoring (`match_at "exact"`) is logged in OPEN_QUESTIONS with this case and ComparisonAuthor's molto+issimo as the motivating pair; it gets built if a third class appears.
2. **candidate_forms on verdict items**: ruled off, jointly with WordFormationAuthor. candidate_forms carries answer-content alternatives; verdict labels are meta-judgements. The MCQ conversions here are cited as the precedent.
3. **Dead guards**: the canonical gate reports negation 0 dead on current disk, corroborating the two fixes and the marker replica.
4. **Accent**: the AccentAuditor seat's central count is negation 13/0, matching my per-phrase criterion-19 check exactly. Accent sweeps now belong to that seat; nothing was recalled from negation.

## The ellipsis, as covered in translation

Two items carry it, because the AI marker sees the whole answer where the substring marker cannot:

- `trans_neg_en_it_concord_05` ("What did you see?" / "I didn't see anything.") and `trans_neg_en_it_concord_06` ("Who came to the party?" / "Nobody came."). Each enumerates the full frame at full credit, the bare elliptical («Niente.» / «Nessuno.») at an explicit `credit: 0.9` with a steering note, and the dropped-non or kept-non error as a `polarity: "negative"` anti-anchor. concord_06 doubles as the both-frames teacher, since Non è venuto nessuno and Nessuno è venuto are both right.

The teaching point that grammar could not grade is exactly the one these carry: the bare ellipsis is what a native actually says, and it is fine, but the moment the full clause appears, non must be there.

## Notes for next pass

Né...né verb-agreement item AUTHORED 2026-07-20 (neg_corr_06 + trans_neg_en_it_corr_03): plural abitano at full credit, singular abita graded 0.9 (Italian tolerates it), boundary flagged to Architecture. Remaining next-pass ideas: Mica would benefit from a chunk-reorder format if Housing ships one, since the error is positional. The non-position leaf could gain B1 items on non with clitic clusters in compound tenses once the passato_prossimo.adverb_placement boundary is comfortable.
