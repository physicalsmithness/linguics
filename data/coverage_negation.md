# Coverage: Negation (topic `negation`, prefix `neg` / `trans_neg`)

Authored by NegationAuthor, 2026-07-14, against `data/buckets/negation.json` (11 nodes) and `DISPATCH_negation.md`, brief Revision 16. First batch. Status: delivered for Architecture review, not yet wired to the manifest.

## Totals

36 grammar questions, 18 translation items. Every active leaf covered; hot spots (concord, bipartite, echo answers) carry the heaviest load. All markpoints word-anchored per criterion 18 (see Marker safety below); validation run reports 0 failures, 0 warnings.

## Bucket-to-item counts

| Leaf (friendly label) | id | Grammar | Trans (required) |
|---|---|---|---|
| Where non goes | negation.core.non_position | 6 | 2 |
| Double negation is the norm | negation.core.concord | 6 | 4 |
| Two-part negatives (non... mai/più/ancora) | negation.core.bipartite | 6 | 4 |
| Neanche, nemmeno, neppure | negation.responses | 4 | 3 |
| Non... che: only | negation.restrictive | 4 | 2 |
| Finché and finché non | negation.pleonastic.finche_flip | 3 | 1 |
| A meno che non, and friends | negation.pleonastic.a_meno_che | 3 | 1 |
| Mica | negation.mica | 4 | 1 |

Translation items also cite existential.form.negative, piacere.usage.agreeing_responses, verb_form.passato_prossimo.*, verb_form.congiuntivo, adjective_agreement.* as optional/cross-tree buckets (all verified present on disk).

## Suppression inventory (info_display: "suppress")

Set on the discrimination and recognition items whose breadcrumb would hand over the answer: neg_finche_01/02/03 (the pleonastic-vs-real and the truth-condition flip), neg_restr_01 and neg_restr_04 (the two non...che recognition items; the production items neg_restr_02/03 name the frame in the prompt, so they stay visible), and neg_mica_01/02/04 (the position-meaning classifications). neg_mica_03 names mica in the prompt, so it stays visible. This follows the dispatch (suppress finché #4 and mica #5) plus criterion 15's project-wide discrimination default.

## House techniques used

Person recovery from a compound subject (neg_resp_04, "io e i miei amici" -> noi). Same-surface / opposite-answer pairs on the più-vs-ancora meaning axis (neg_bip_03 vs neg_bip_04, and the paired must_not_include guards each way). The "anything" -> qualcosa calque is planted as a guard across concord items and translations.

## Marker safety (criterion 18)

`non` is a substring of nonna/nonno/nonostante, and short frames nest (non ho inside non ho mica detto), so every any_phrase and must_not_include carries match_at: "word". The containment audit (any_phrase must not match any enumerated wrong attempt under its anchor) passes for all 36 items. The single-token answers (A/B, sì/no, vero/falso, solo, non, mica) rely entirely on word-anchoring; they are safe because the opposite token is the guard and word boundaries block embedding.

## Flagged / uncertain (open questions for Architecture, biggest first)

1. **Concord breadcrumb leak.** The leaf label "Double negation is the norm" shows pre-answer on visible items. On the postverbal-production items (neg_concord_01/02/05/06) that arguably leaks the strategy (keep non), which is the very English-instinct error under test; on the preverbal-drop items (neg_concord_03/04) naming the norm is a *productive* trap (it tempts the wrong retained non, which the must_not_include catches), so visible is correct there. Per criterion 15 the flag is per-item. I did NOT override the dispatch's worked example (neg_concord_01 shipped visible as modelled); recommend suppressing the four postverbal-production concord items and leaving the two preverbal-drop items visible. One-line ruling flips them.

2. **né... né correlative gap.** Not in the ratified tree and not needed for the 8 leaves, so left out; proposed as `negation.correlative` in bucket_suggestions with an ownership caveat (it sits on the seam with a future connettivi/coordination tree). Awaiting a ratify/relocate call before I author it (est. 4-5 grammar + 2 translation).

3. **a_meno_che markpoint bundling.** neg_ameno_01/02 fuse the pleonastic non and the subjunctive form in one markpoint ("non piova"/"non sia"), because the answer is a two-word frame and splitting would require an unanchored "non" (criterion-18 hazard). Diagnostic attribution therefore lands wholly on a_meno_che, not on congiuntivo. If clean per-skill split is wanted, the cleaner route is to give the subjunctive elsewhere and test only the non here; flag if you want that reworked.

4. **Classify items as short-answer.** The finché/mica/restrictive recognition items are type "short" with token any_phrases (A/B, sì/no, vero/falso). If Housing would rather these be true MCQ (choices + answer_index) they convert cleanly; I kept them as markpoint items so bucket attribution still fires.

5. **Minor: comparative pleonastic.** Folded into the a_meno_che leaf per the tree's own description. neg_ameno_03 is consequently a thin single-"non" answer; acceptable, but if the comparative pleonastic deserves its own leaf later, that item moves.

## Notes for next pass

né...né (pending ratification); if wanted, deepen mica with a chunk-reorder format should Housing ship one (the dispatch notes the error is positional); and the non-position tree could gain a couple of B1 items on non with double clitics in compound tenses once the boundary with passato_prossimo.adverb_placement is comfortable.
