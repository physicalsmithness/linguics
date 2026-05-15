# Decisions wanted from the project author (pronoun dispatch)

In response to part 3 of `FEEDBACK_HOUSE_STYLE_pronoun_chat.md`. The twelve items I flagged uncertain in `coverage_pronoun.md` boil down to the following discrete decisions. Where the impact is small I've stated my default and will go with it unless told otherwise.

## D1. External-id-to-bucket correspondence: strict or loose?

**Item:** `op_dop_li_03`. The external_id leads with `li` (it sits in the `li_xx` batch for editorial grouping) but the bucket-marker actually attributes to `direct_object.le` (it's a fem.pl contrast item designed to catch the masc-default error).

**Decision:** should external_ids strictly correspond to the primary bucket, or is the editorial-grouping flexibility OK?

**My default if no answer:** keep loose. The id is for human grouping; the bucket is the diagnostic. Same item could be renamed `op_dop_le_contrast_01` if strict correspondence is preferred. Other instances of the same kind: none currently; this is the only mismatch.

## D2. Reflexive + post-verb DO: subject-agreement only, or accept DO-agreement too?

**Item:** `op_refl_essere_03` ('I ragazzi si sono lavati le mani'). I credited only modern subject-agreement (`lavati`, agreeing with `i ragazzi`). Some prescriptive sources accept agreement with the DO when post-verb (`lavate le mani`).

**Decision:** accept both? Just the modern one? Different items for the two registers?

**My default if no answer:** accept both as `any_phrases` and adjust the bucket to be permissive. Currently the must_not_include catches the wrong-gender forms only; lavate would be credited as the alternative correct form. I'd update the explanation to mention the prescriptive alternative without making it required.

## D3. The fregarsene/starsene/venirsene bucket placement

**Items:** `op_ne_motion_02` (fregarsene), `op_comb_mene_05` (starsene), `op_comb_mene_06` (venirsene). All three live under `pronoun.ne.motion_andarsene` because no other leaf exists for pronominal idiomatic verbs.

**Decision:** rename `pronoun.ne.motion_andarsene` to the broader `pronoun.ne.pronominal_idiomatic_verbs`, or add it as a sibling and keep motion_andarsene strictly for motion verbs? See bucket_suggestions entry #1 for the proposed rename.

**My default if no answer:** keep items as they are, with the bucket suggestion sitting in the queue. Items already note the mismatch in `examiner_note`. Cleanest fix is the rename (one ID change, all items keep their bucket attribution).

## D4. Capital Si in formal address: keep or drop op_spec_fcap_02?

**Item:** `op_spec_fcap_02`. The capitalisation of reflexive si addressed to formal Lei is variable in modern usage. Many editors leave it lowercase even in formal letters.

**Decision:** drop the item, soften the must_not_include (so 'si' would also be credited), or keep it strict to teach the prescriptive convention?

**My default if no answer:** soften. The marker accepts both `Si` and `si` as `any_phrases`; the explanation notes the variability. The strict-prescriptive version would over-mark a learner who writes the modern lowercase form.

## D5. Optional participle agreement with mi/ti/ci/vi in PP

**Item:** `op_dop_vi_you_03` ('non vi ho viste'). The participle-agreement-with-1/2-person-DOPs rule is OPTIONAL in modern Italian. I credited `viste` (f.pl agreement, prompted by the example sentence using it) and excluded `visto` via must_not_include.

**Decision:** is the must_not_include for `visto` too strict?

**My default if no answer:** soften. Remove `visto` from must_not_include so the invariable form is also credited, but keep `vista`/`visti` (wrong-gender/wrong-number) in. Add a note that the agreement is more typical in narrative and slightly old-fashioned in everyday speech.

## D6. Verbs with stressed-prepositional pattern (fidarsi-style)

**Item:** `op_dop_iop_disc_04` (fidarsi di). The 'right' answer is `mi fido di lei` (reflexive + preposition + stressed pronoun, no DOP/IOP clitic in object slot). Sits awkwardly in a DOP/IOP discrimination batch.

**Decision:** remove from the discrimination batch and rebucket entirely as `pronoun.special.stressed_forms`? Or keep as a counter-example item designed to make the DOP/IOP framework explicit?

**My default if no answer:** keep as counter-example, but rename the external_id to something like `op_spec_stressed_after_verbprep_01` and move to the special section. The pedagogical value is in showing the rule's boundary.

## D7. Two-blank contrast item engine support

**Item:** `op_spec_stressed_06`. Has two markpoints pointing at the same answer slot ('Ha invitato me, non lui' with two blanks for emphasis testing).

**Decision:** does the engine handle multiple markpoints sharing a slot, or do I need to restructure as a single markpoint?

**My default if no answer:** restructure as one markpoint. Currently the second markpoint is essentially a duplicate; the marker can collapse them.

## D8. MCQ items where both correct positions exist (modal items)

**Item:** `op_pos_modal_03`. MCQ-format item testing the attached-to-infinitive form ('Devo parlargli'). The pre-modal form ('Gli devo parlare') is equally valid. In MCQ form only one option can be 'correct'.

**Decision:** rewrite as short-answer to credit both? Keep as MCQ to test recognition of the attached form specifically?

**My default if no answer:** rewrite as short-answer with both forms in any_phrases. Better aligns with the modal_plus_infinitive_either bucket's spirit. The MCQ frame implies one right answer, which is false here.

## D9. Translation marker ambiguity

**Item:** `trans_op_en_it_31` ('Tell him about it' → digliene OR diglielo). Both readings (about it = ne; tell it = neuter lo) are linguistically valid. The marker has to credit either.

**Decision:** is the AI marker robust to this? Or do I need to constrain the source-text to disambiguate?

**My default if no answer:** trust the marker. Both reference translations are present with a clear note explaining the two readings. If the marker turns out to be brittle on this, the fix is to add disambiguating context to the source text (e.g. 'Tell him the news' for the neuter-lo reading).

## D10. Formal/informal ambiguity in 'Le piacciono'

**Item:** `trans_op_it_en_09` ('Le piacciono molto i fiori'). Le could be IOP fem-3sg ('she likes') or formal Lei ('you formal like'). Both grammatical without further context.

**Decision:** same as D9. Constrain the source, or trust marker?

**My default if no answer:** trust the marker. Both reference translations present.

## D11. Left-dislocation in it→en marker handling

**Item:** `trans_op_it_en_03` ('A Marco gli ho parlato ieri sera'). The Italian source has the dislocation-with-resumption construction; English target collapses it to 'I spoke to Marco yesterday evening'. The bucket attribution rests on the source-side feature, which the AI marker has to detect.

**Decision:** does the marker prompt currently handle left-dislocation detection? Anything I need to flag in the item itself to support it?

**My default if no answer:** add a hint in the explanation that explicitly names the dislocation construction. Marker prompt should pick up on the structural cue.

## D12. 'Ce ne abbiamo molto' bucket choice

**Item:** `op_comb_mene_04`. Surface form is `me_ne_family`, but the underlying grammar is existential-locative ci (= 'there are some') rather than personal-IOP ci.

**Decision:** is the surface-grouping under me_ne_family acceptable, or should there be a sub-leaf for existential+ne?

**My default if no answer:** acceptable. The marker pattern is identical regardless of underlying analysis. If a future schema split distinguishes existential ne+ce from IOP ce+ne, the item can be retagged.

## Summary of impacts if defaults are accepted

- D1: no change (keep loose id-to-bucket)
- D2: small explanation edit + permissive any_phrases on `op_refl_essere_03`
- D3: no change (waiting on bucket-rename decision)
- D4: edit `op_spec_fcap_02` to accept lowercase
- D5: edit `op_dop_vi_you_03` to accept invariable participle
- D6: rename and re-section `op_dop_iop_disc_04`
- D7: collapse `op_spec_stressed_06` to one markpoint
- D8: rewrite `op_pos_modal_03` as short-answer
- D9: no change (trust marker)
- D10: no change (trust marker)
- D11: explanation hint on `trans_op_it_en_03`
- D12: no change

Happy to implement any subset. The bigger choices (D2, D3, D6, D8) might be worth a one-line ack before I commit; the rest I can apply on my own.
