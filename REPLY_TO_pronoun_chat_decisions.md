# Reply to your twelve decisions (pronoun dispatch)

Thanks for laying these out so clearly. Here are the rulings against each item in `DECISIONS_FROM_pronoun_chat.md`. The short story: defaults accepted on D1, D4, D5, D7, D9, D10, D11, D12; minor amendment on D2; D3 needs you to know about a bucket change that happened on the project side that you weren't told about; D6 and D8 go with your defaults but with a small generalisation worth carrying into future authoring.

Apply on your own. No further sign-off needed before you push the revised items.

## D1: external-id-to-bucket correspondence

**Accept default.** Keep loose. The external_id is for human editorial grouping; the bucket attribution is the diagnostic. `op_dop_li_03` can stay as-is, or rename to `op_dop_le_contrast_01` if you prefer; either is fine. The bucket field is what the engine reads.

## D2: reflexive + post-verb DO (lavati vs lavate)

**Accept default, with one explanation tweak.**

Accept both as `any_phrases`: `["lavati", "lavate"]`. Keep `must_not_include` catching the wrong-gender/wrong-number forms only (so `lavato`, `lavata` still fire as misses).

The tweak: in the explanation, flag `lavate` as an older/prescriptive alternative. Something like:

> Modern Italian agrees the past participle with the subject (`lavati`, agreeing with `i ragazzi`). Older usage and some prescriptive grammars agree it instead with the post-verb direct object (`lavate`, agreeing with `le mani`); both are accepted here.

The reason for the tweak: a learner who was taught the prescriptive form shouldn't be left thinking they got it wrong even though the marker accepted it. Naming both registers is more informative than silent acceptance.

The bucket attribution doesn't change.

## D3: fregarsene/starsene/venirsene bucket placement

**This is not waiting on a rename. A sibling bucket now exists.**

Sometime between your initial output and now, the project side ratified four pronoun bucket additions, including a sibling of `motion_andarsene` named `pronoun.ne.pronominal_idiomatic_verbs`. It's now live in `data/buckets/pronoun.json` at lines 728-739. Its definition (paraphrased):

> Verbs where `ne` is lexicalised into an idiomatic non-motion pattern. `attributes.verbs`: starsene, fregarsene, intendersene, uscirsene.

So the resolution is reallocation, not renaming:

- `op_ne_motion_02` (fregarsene): change bucket attribution to `pronoun.ne.pronominal_idiomatic_verbs`.
- `op_comb_mene_05` (starsene): change to `pronoun.ne.pronominal_idiomatic_verbs`.
- `op_comb_mene_06` (venirsene): keep in `pronoun.ne.motion_andarsene`. Venirsene IS motion ("to come away from somewhere"); the existing `motion_andarsene.attributes.verbs` array already lists it.

Also clean up `motion_andarsene.attributes.verbs`: the array currently lists `["andarsene", "venirsene", "starsene", "fregarsene"]`, which is the source of your confusion. It should now read `["andarsene", "venirsene"]` only. The other two have moved.

Any other items currently citing `motion_andarsene` should be audited against the same rule: if the verb is genuinely about leaving/going-from, keep in motion_andarsene; if the verb's `ne` is lexicalised into a non-motion idiom (starsene = keep oneself, fregarsene = not care, intendersene = be an expert in, uscirsene = come out with a remark), move to pronominal_idiomatic_verbs.

## D4: capital Si in formal address

**Accept default.** Soften. Accept both `Si` and `si` as `any_phrases` on `op_spec_fcap_02`. Explanation notes that the prescriptive convention is to capitalise formal-address pronouns (including `Si`) but that modern usage commonly leaves them lowercase. Both are credited.

## D5: optional participle agreement with mi/ti/ci/vi

**Accept default.** Soften. Remove `visto` from `must_not_include` on `op_dop_vi_you_03`; keep `vista` and `visti` in (those are wrong-gender/wrong-number, not register variation). Explanation flags the agreement as more typical in narrative/literary register and slightly old-fashioned in everyday speech.

Same principle applies if there are sibling items with mi/ti/ci patterns testing the same optional rule.

## D6: fidarsi-style discrimination item

**Accept default, with a general principle worth carrying forward.**

For the specific item: rename `op_dop_iop_disc_04` to `op_spec_stressed_after_verbprep_01` and reattribute the primary bucket to `pronoun.special.stressed_forms`. The pedagogical value of showing where the DOP/IOP framework runs out survives the move, just in the right neighbourhood.

The general principle worth applying to future authoring: an item that exists to mark the boundary of a rule belongs with the rule's edge cases, not in its main discrimination batch. A discrimination batch is for "did the learner pick the right one of two normally-applicable options". A counter-example breaks that frame and confuses the diagnostic. Other items in the DOP/IOP discrimination batch that exist to mark a boundary should be audited and moved similarly.

## D7: two-blank contrast item

**Accept default.** Collapse `op_spec_stressed_06` to a single markpoint. The duplicate slot was an authoring artefact; the engine handles one markpoint per slot cleanly.

## D8: MCQ when both forms equally valid

**Accept default, with a general principle worth articulating.**

For the specific item: rewrite `op_pos_modal_03` as short-answer with both `Devo parlargli` and `Gli devo parlare` in `any_phrases`.

The general principle: any item whose bucket spirit is "either of these is correct" must be short-answer, not MCQ. MCQ implies a single correct answer; using MCQ for an either-works rule actively miseducates the learner about the rule. Apply this rule across the rest of the pronoun batch: any modal-position items (or any item under `pronoun.position.modal_plus_infinitive_either` or similar "either is fine" buckets) should be short-answer with both forms accepted.

## D9: 'Tell him about it' translation ambiguity

**Accept default.** Trust the marker. Keep both reference translations (digliene, diglielo) with the clear note explaining the two readings. If the marker turns out brittle in practice we'll add disambiguating context to the source text, but the structural answer is the marker.

## D10: Le piacciono ambiguity (3sg fem vs formal Lei)

**Accept default.** Trust the marker. Both reference translations present. The marker should credit either. If it turns out flaky, same fix as D9.

## D11: left-dislocation in it→en marker handling

**Accept default.** Add an explicit hint in the explanation that names the dislocation construction (and flags that the English target collapses it). The marker prompt will pick up structural cues; the explanation hint is for the learner who got it wrong and needs to know what the construction is called.

## D12: 'Ce ne abbiamo molto' bucket choice

**Accept default.** Surface-grouping under `me_ne_family` is fine. The marker pattern is identical regardless of the underlying analysis. Item can be retagged later if a future schema split distinguishes existential ne+ce from IOP ce+ne.

## What to do with this

1. Apply D1-D12 as above; push the revised items.
2. Update your `coverage_pronoun.md` to note the resolved items.
3. If any of the rulings raise new uncertainty in the surrounding items, flag those in a brief follow-up note and we'll handle them the same way.

Separately: the project side has also sent a house-style feedback packet (`FEEDBACK_HOUSE_STYLE_pronoun_chat.md`) about the explanation prose. That's independent of this reply and can be worked in parallel; both revisions land in the same set of files.
