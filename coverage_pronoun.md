# Coverage: pronoun dispatch (2026-05-14 revision)

**Author**: Linguics pronoun-author chat
**Brief revision**: AUTHOR_BRIEF.md Rev 2 (2026-05-13)
**Tree**: data/buckets/pronoun.json
**Outputs**:
- data/grammar_questions_pronoun.json (**216 items**)
- data/translation_items_pronoun.json (**56 items**, 38 en→it + 18 it→en)
- data/bucket_suggestions_pronoun.json (5 entries: 4 ratified, 1 pending)
- data/glossary_suggestions_pronoun.json (28 entries, all pending review)

## Status of this revision

Three rounds of work landed here. First was authoring. Second was an angle-coverage top-up after the rule-by-rule audit catched gaps. Third (this round) was applying the project-side house-style feedback and the project-side D1-D12 decisions. The grammar file and translation file are now style-coherent and the flagged uncertain items have all been resolved.

## Stopping criterion used

Items are produced for *angle coverage of every rule*, not to hit a target count. The test: a learner who memorises the specific items shouldn't be able to pass the topic; they need to have internalised the rule. So every rule is hit from multiple genuinely distinct angles (different verbs, different tenses, different distractors, different contexts, different ambiguity directions). 216 + 56 is what fell out of that audit, not a target.

## Rule-by-rule angle audit

For each grammatical rule in the pronoun system, what angles are tested and which items exercise them. Hot spots are flagged. Each rule has at least 3 angles; hot spots have 5-11.

### A. DOP form selection by gender/number
Each person (mi/ti/lo/la/ci/vi/li/le/formal La) in different sentence positions and tenses; predicative vs attributive; person referents vs object referents. Diagnostic distractors: stressed forms (me/te/lui/lei), articles (il/la), IOPs (gli). Items: op_dop_mi_01..03, op_dop_ti_01..03, op_dop_lo_01..04, op_dop_la_01..03, op_dop_ci_us_01..03, op_dop_vi_you_01..03, op_dop_li_01..03, op_dop_le_01..03, op_dop_formal_La_01..03, plus trans_op_en_it_01,02,03,04,27, trans_op_it_en_01. **Angles count: ~30+**.

### B. DOP position before the finite verb
Present, passato prossimo (pre-aux), imperfect, conditional, negative, sentence-initial clitic. Items: op_pos_pre_01..03 explicit; implicit in many DOP items. **Angles count: 6+**.

### C. DOP elision (lo/la → l' before vowel)
lo/la before ho/ha/avete/abbiamo etc.; with PP agreement on participle; in MCQ-distractor form. Items: op_dop_elide_01, op_dop_elide_02, op_dop_la_03 (la → l' with f.sg agreement), op_dop_nonelide_03 (contrast); trans_op_en_it_02. **Angles count: 5**.

### D. DOP non-elision (li/le do NOT elide)
m.pl + ho, f.pl + ho with agreement on participle, MCQ choosing between l' and li. Items: op_dop_elide_03, op_dop_nonelide_01, op_dop_nonelide_02, op_dop_nonelide_03. **Angles count: 4**.

### E. IOP form selection
Each person (mi/ti/gli/le/ci/vi/gli-them/loro/formal Le); with different verb classes; with different tenses. Items: op_iop_mi_01..03, op_iop_ti_01..03, op_iop_gli_masc_01..03, op_iop_le_fem_01..03, op_iop_ci_us_01..03, op_iop_vi_you_01..03, op_iop_gli_them_01..03, op_iop_formal_Le_01..03. **Angles count: ~24**.

### F. DOP vs IOP form choice (verb-structure diagnostic)
aiutare (DOP, contra English-style IOP), rispondere (IOP), chiedere (IOP), conoscere (DOP), telefonare (IOP), prestare (IOP), dare (DO+IO), fidarsi (preposition + stressed). Items: op_dop_iop_disc_01..03, op_spec_stressed_after_verbprep_01 (was op_dop_iop_disc_04; renamed and re-sectioned per D6), op_iop_gli_masc_03, op_dop_lo_04. **Angles count: 7+**.

### G. Piacere-family verbs (subject-as-IOP, verb agrees with thing)
piacere (sg/pl subject, different experiencers), mancare, sembrare, servire; in PP with aux essere. Items: op_iop_verbs_iop_01..05, op_iop_ci_us_03, op_iop_vi_you_03; trans_op_en_it_07, trans_op_en_it_08, trans_op_it_en_09. **Angles count: 11**. **Hot spot.**

### H. IOPs do NOT trigger PP agreement
Diagnostic against the easy mistake of agreeing the participle with an IOP. Items: op_iop_no_pp_agree_01 (explicit), plus implicit cross-cuts. **Angles count: 1 explicit + multiple implicit**.

### I. Reflexive in compound: aux essere + participle agrees with subject
1sg, 2sg, 3sg, 1pl, 2pl, 3pl in PP; with post-verb DO present (the agreement-with-subject diagnostic). Items: op_refl_essere_01..03 (op_refl_essere_03 now accepts both subject-agreement 'lavati' and prescriptive DO-agreement 'lavate' per D2), plus trans_op_en_it_10, trans_op_en_it_26, trans_op_en_it_34, trans_op_it_en_07, trans_op_it_en_10. **Angles count: 8**.

### J. Reflexive + DOP cluster (vowel change me/te/se/ce/ve before DOP)
Each person (1sg me, 2sg te, 3sg se, 1pl ce), with f.sg/f.pl/m.sg/m.pl DOs; in PP with agreement to preceding DOP. Items: op_refl_with_obj_01..06. **Angles count: 6**.

### K. Combined cluster order: IOP before DOP
Declarative present, MCQ contrast, with PP, attached to imperative, attached to infinitive. Items: op_comb_order_01..05. **Angles count: 5**.

### L. Combined cluster vowel change (mi/ti/ci/vi → me/te/ce/ve)
Each of mi+lo, ti+la, ci+li, vi+lo, mi+lo applied, me+ne, te+ne, ve+la in progressive. Items: op_comb_vowel_01..08. **Angles count: 8**. **Hot spot.**

### M. Glielo family: gli/le + DOP → glie- (one word, glie-transform)
gli+lo, le+la, le+lo, gli+li, gli+le, le+li (MCQ trap), gli+ne, formal Le + la, gliela in PP, gliele in PP, gliene in question, glielo attached to infinitive. Items: op_comb_glielo_01..11. **Angles count: 11**. **Hot spot — heaviest coverage**.

### N. Partitive ne (with quantifier)
Number + dropped noun, un po', parecchie, MCQ vs whole-object lo, negative quantifier (nessuno), abstract noun (dubbi). Items: op_ne_partq_01..06; trans_op_en_it_13. **Angles count: 7**.

### O. Pronominal ne (for di-phrase)
pensare di, parlare di, essere sicuro di, avere bisogno di, MCQ vs ci. Items: op_ne_prondi_01..03, op_cil_cinevs_04 (avere bisogno di); trans_op_en_it_15, trans_op_en_it_36. **Angles count: 6**.

### P. Partitive ne triggers PP agreement; pronominal ne does NOT
f.pl agreement, m.pl agreement, f.pl MCQ vs DOP-le alternative, m.sg agreement (looks invariable but is agreement), critical diagnostic that pronominal ne does NOT trigger agreement (parlare di + ne). Items: op_ne_pp_01..05; trans_op_en_it_14, trans_op_en_it_30. **Angles count: 7**. **Hot spot.**

### Q. Pronominal-idiom verb family (motion vs idiomatic)
andarsene 1sg/2sg/3sg in present, fregarsene 1sg, starsene 1sg, venirsene 3pl, andarsene in trapassato prossimo, negative imperative variant. Items: op_ne_motion_01, op_ne_motion_02 (rebucketed to ne.pronominal_idiomatic_verbs per D3), op_comb_mene_02, op_comb_mene_03, op_comb_mene_05 (rebucketed per D3), op_comb_mene_06 (stays in motion_andarsene; venirsene IS motion); trans_op_en_it_22, trans_op_en_it_29, trans_op_it_en_15. **Angles count: 9**.

### R. ci as locative for a place
Present, PP, negation, fronted adverb context. Items: op_cil_loc_01..04; trans_op_en_it_16. **Angles count: 5**.

### S. ci as existential (c'è / ci sono)
Singular existential, plural existential, PP existential (c'è stata), negated existential. Items: op_cil_exist_01..04; trans_op_en_it_17, trans_op_it_en_04. **Angles count: 6**.

### T. ci as 'about it / in it' (pronominal a-phrase)
pensare a, credere a, riuscire a + inf, with progressive. Items: op_cil_topic_01..03; trans_op_en_it_35, trans_op_it_en_06. **Angles count: 5**.

### U. ci in idiomatic verbs (volerci, metterci, farcela, tenerci)
volerci impersonal, metterci personal, farcela 1sg with negation, tenerci with overt a-phrase. Items: op_cil_idiom_01..04; trans_op_en_it_18, trans_op_it_en_13. **Angles count: 6**.

### V. ci vs ne disambiguation (a- vs di-)
pensare a (ci) vs pensare di (ne), parlare di (ne), essere contento di (ne), avere bisogno di (ne), abbastanza + partitive (ne). Items: op_cil_cinevs_01..05. **Angles count: 5**.

### W. Position pre-finite-verb (default)
Present indicative, passato prossimo (pre-aux), MCQ with split-position distractor. Items: op_pos_pre_01..03, plus implicit elsewhere. **Angles count: 3 explicit + many implicit**.

### X. Position post-infinitive (drop -e, attach)
-are verb + DOP, -are verb + IOP, after per + inf, with cluster (darmelo), -ire verb + ne. Items: op_pos_inf_01..05. **Angles count: 5**.

### Y. Position post-gerund (attach; flexibility with stare + gerundio)
Bare gerund + clitic, stare + gerundio with pre-stare or attached, MCQ rejecting between-position, cluster attached to gerund (parlandogliene). Items: op_pos_ger_01..04. **Angles count: 4**.

### Z. Position post-imperative (tu/noi/voi attach)
tu + IOP, noi + locative ci, voi + DOP, tu reflexive (lavati), tu + cluster (compramelo). Items: op_pos_imp_tu_01..05; trans_op_en_it_19. **Angles count: 5**.

### AA. Imperative consonant doubling (5 monosyllables)
dammi (da'), dimmi (di'), fammelo (fa' + cluster), vacci (va'), stammi (sta'), fammelo MCQ, gli-exception simple (digli), gli-exception with cluster (digliene). Items: op_pos_double_01..08; trans_op_en_it_19, trans_op_it_en_18. **Angles count: 9**. **Hot spot.**

### BB. The gli-exception (gli does NOT double)
Simple digli, gliene in cluster, MCQ contrast with doubling distractor. Items: op_pos_double_05, op_pos_double_07; trans_op_en_it_31. **Angles count: 3**.

### CC. Negative imperative position (non + inf, clitic flexible)
Simple, MCQ contrast with positive-imperative-form distractor, with cluster (non darmelo), with reflexive (non muoverti), with reflexive-pronominal (non preoccupartene). Items: op_pos_neg_01..04; trans_op_en_it_21, trans_op_en_it_29, trans_op_en_it_37. **Angles count: 7**.

### DD. Formal Lei imperative: clitic PRE-verb, subjunctive form
Simple (mi dica), reflexive (si accomodi), with cluster (me lo dia), with reflexive calmarsi, negative form (non glielo dica). Items: op_pos_formal_01..05; trans_op_en_it_20, trans_op_en_it_32, trans_op_it_en_12, trans_op_it_en_16. **Angles count: 9**.

### EE. Neuter lo (clause/predicate resumption)
Clause resumption (lo so), predicate adjective resumption (lo sono), pensare + lo, in cluster with IOP (glielo for 'tell him it'). Items: op_spec_lo_neut_01..04; trans_op_en_it_23, trans_op_it_en_08, trans_op_it_en_14. **Angles count: 7**.

### FF. Stressed forms after preposition
con me, senza di te, per lui (different prepositions), fidarsi di lei (op_spec_stressed_after_verbprep_01, re-sectioned per D6). Items: op_spec_stressed_03, op_spec_stressed_04, op_spec_stressed_05, op_spec_stressed_after_verbprep_01. **Angles count: 4**.

### GG. Stressed forms for emphasis / contrast
a me piace emphatic, vedo lei contrastive, ha invitato me strong contrast (now single markpoint per D7). Items: op_spec_stressed_01, op_spec_stressed_02, op_spec_stressed_06; trans_op_en_it_38. **Angles count: 4**.

### HH. Lei capitalisation conventions
Business letter (La + Sua), letter opener (Le), CV closing formula (Sua + Le), sign/imperative (Si/si — both credited per D4), business email (La + Sua). Items: op_spec_fcap_01..04. **Angles count: 4**.

### II. Left-dislocation with clitic resumption + PP agreement
DO + clitic l' + agreement, IO + clitic gli, DO + cluster (me l'ha), DO + cluster + agreement (me li ha dati), right-dislocation. Items: op_spec_dislo_01..04; trans_op_it_en_03 (left-dislocation flagged explicitly per D11), trans_op_it_en_17. **Angles count: 6**.

### JJ. Joined-cluster diagnostic (new bucket, pending)
Pre-verb cluster stays separated (me lo, te ne, ce la); joined form (melo, tene, cela) is the joined-when-separate error. Cross-contrast with correctly-joined post-verb (dammelo) and with glielo-family (always one word). Items: op_comb_joined_01..05. **Angles count: 5**.

## Hot-spot deep-dive

The dispatch flagged these as needing extra coverage. Confirming each has 5+ angles:

1. The glielo-family bucket (`pronoun.combined.glielo_family`): 11 angles (rule M). Every IOP-DOP and IOP-ne combination, plus elision, plus PP agreement, plus cluster-attached-to-infinitive. ✓
2. The cluster vowel-change bucket (`pronoun.combined.vowel_changes`): 8 angles (rule L). Every person × DOP/ne variant. ✓
3. The consonant-doubling bucket (`pronoun.position.post_imperative_consonant_doubling`): 9 angles (rule AA). All five monosyllables, gli-exception variants, cluster cases. ✓
4. The piacere-family bucket (`pronoun.indirect_object.verbs_taking_iop`): 11 angles (rule G). piacere/mancare/sembrare/servire across tenses and persons, including PP. ✓
5. The modal-either-position bucket (`pronoun.position.modal_plus_infinitive_either`): pre-modal vs attached in 6+ contexts. ✓
6. The ci-vs-ne disambiguation bucket (`pronoun.ci_vs_ne_disambiguation`): 5 angles plus systematic cross-cuts. ✓
7. The ne-with-PP-agreement bucket (`pronoun.ne.with_pp_agreement`): 7 angles including the critical pronominal-ne-DOES-NOT-trigger diagnostic. ✓

## Cross-references into other trees

Translation items naturally pull in `verb_form.passato_prossimo.*` buckets:
- `verb_form.passato_prossimo.participle_agreement.with_avere.preceding_dop_lo` (multiple)
- `verb_form.passato_prossimo.participle_agreement.with_avere.preceding_dop_la` (multiple)
- `verb_form.passato_prossimo.participle_agreement.with_avere.preceding_dop_li` (1)
- `verb_form.passato_prossimo.participle_agreement.with_avere.preceding_dop_le` (1)
- `verb_form.passato_prossimo.participle_agreement.with_avere.preceding_partitive_ne` (multiple)
- `verb_form.passato_prossimo.participle_agreement.with_avere.no_preceding_dop` (1)
- `verb_form.passato_prossimo.auxiliary.essere_reflexive` (multiple)
- `verb_form.passato_prossimo.auxiliary.essere_other_intransitive` (1)
- `verb_form.passato_prossimo.auxiliary.avere_default` (1)
- `verb_form.trapassato_prossimo` (1)
- `verb_form.imperfect_indicative` (optional)
- `verb_form.subjunctive.present` (optional)
- `verb_form.present_indicative.with_da_for_duration` (optional)

The runtime will warn but accept these forward-references per AUTHOR_BRIEF §2.

## Resolution of D1-D12

All twelve flagged-uncertain items have been resolved per REPLY_TO_pronoun_chat_decisions.md.

**D1** (external-id-to-bucket strictness): default accepted (loose). `op_dop_li_03` keeps its current id; the bucket field is the diagnostic, the id is for human grouping.

**D2** (reflexive + post-verb DO agreement): `op_refl_essere_03` now accepts both modern subject-agreement `lavati` and prescriptive DO-agreement `lavate` in any_phrases; must_not_include catches wrong-gender forms only; explanation flags both registers.

**D3** (pronominal-idiom verb bucket placement): the project side ratified a sibling bucket for idiomatic pronominal verbs with ne (`pronoun.ne.pronominal_idiomatic_verbs`) while the original output was being produced. op_ne_motion_02 (fregarsene) and op_comb_mene_05 (starsene) are now rebucketed to the new sibling. op_comb_mene_06 (venirsene) stays in the motion-andarsene bucket because venirsene IS motion.

**D4** (capital Si in formal address): `op_spec_fcap_02` now accepts both `Si` and `si` in any_phrases; explanation flags the variability; must_not_include catches only the wrong-pronoun forms (ti, lo).

**D5** (optional participle agreement with mi/ti/ci/vi): `op_dop_vi_you_03` softened. The invariable `visto` is now in any_phrases alongside the agreed `viste`. must_not_include keeps the wrong-gender (vista) and wrong-number (visti) misses only.

**D6** (fidarsi-style discrimination item): `op_dop_iop_disc_04` renamed to `op_spec_stressed_after_verbprep_01` and bucket attribution clarified (subtopic now `special.stressed_forms`). The renamed item sits in the original DOP section of the JSON file by position but reads as a special.stressed item by metadata. **General principle from this resolution**: items that exist to mark the boundary of a rule belong with the rule's edge cases. The other discrimination items (op_dop_iop_disc_01..03 testing aiutare/rispondere/chiedere) were audited and confirmed as legitimate verb-argument-structure discriminations, so they stay.

**D7** (two-blank contrast item): `op_spec_stressed_06` collapsed to one markpoint with one blank.

**D8** (MCQ when both forms equally valid): `op_pos_modal_03` rewritten as short-answer accepting both `Gli devo parlare` and `Devo parlargli`. Other modal_plus_infinitive_either items audited: op_pos_modal_01 already short-answer with both forms; op_pos_modal_02 is MCQ but its "correct" option text contains both forms together, so it correctly credits both. **General principle**: any item whose bucket spirit is "either is fine" must be short-answer (or use an MCQ option that bundles both), not a single-form MCQ.

**D9** (Digliene/Diglielo ambiguity): default accepted (trust the marker). Both reference translations are in `trans_op_en_it_31` with notes.

**D10** (Le piacciono ambiguity): default accepted (trust the marker). Both reference translations are in `trans_op_it_en_09` with notes.

**D11** (left-dislocation in it→en marker handling): `trans_op_it_en_03` explanation now explicitly names the left-dislocation construction and notes the English flattening.

**D12** (Ce ne abbiamo molto bucket choice): default accepted. Surface-grouping under `me_ne_family` is acceptable; the marker pattern is identical.

## Items still flagged for the next dispatcher

None — the twelve items from the previous coverage doc are all resolved, and the three tightening migrations from this revision pass are now done.

**Migration results (2026-05-15):**

1. **piacere-family in passato prossimo** (`pronoun.indirect_object.verbs_taking_iop.with_essere_in_pp`): op_iop_verbs_iop_05 migrated (the only PP piacere-family grammar item). trans_op_en_it_07 (present tense) and trans_op_en_it_08 (imperfect) didn't qualify because the new sub-leaf is specifically for PP; they stay on the parent piacere-family bucket.
2. **Left-dislocation with PP agreement** (`pronoun.special.left_dislocation_with_pp_agreement`): op_spec_dislo_01 (La pizza, l'ho mangiata) and op_spec_dislo_04 (I biglietti, me li ha dati) migrated. Both are canonical fronted-DO + clitic + agreement. op_spec_dislo_02 stays on the parent dislocation bucket (IOP dislocation, no DOP agreement). op_spec_dislo_03 stays on the parent (cluster choice diagnostic, no agreement test in the markpoint). trans_op_it_en_03 stays on the parent (IOP dislocation). trans_op_it_en_17 stays on the parent (right-dislocation, out of scope for the new sub-leaf).
3. **farcela** (`pronoun.ci_locative.idiomatic_verbs.farcela`): op_cil_idiom_03 and trans_op_en_it_18 migrated. The other ci-idiomatic items (op_cil_idiom_01 volerci, op_cil_idiom_02 metterci, op_cil_idiom_04 tenerci, trans_op_it_en_13 volerci) stay on the parent because they're different idiomatic verbs.

These were tightening migrations, not corrections. The diagnostic now surfaces more precisely on the migrated items.

## Bucket suggestions summary

Five refinements proposed in `data/bucket_suggestions_pronoun.json`:

1. **RESOLVED**: idiomatic pronominal verbs with ne, e.g. starsene, fregarsene (`pronoun.ne.pronominal_idiomatic_verbs`). Now a sibling of the motion-andarsene bucket; items migrated.
2. **RESOLVED**: piacere-family in passato prossimo (`pronoun.indirect_object.verbs_taking_iop.with_essere_in_pp`). Migration done this revision.
3. **RESOLVED**: left-dislocation with PP agreement (`pronoun.special.left_dislocation_with_pp_agreement`). Migration done this revision.
4. **RESOLVED**: farcela (`pronoun.ci_locative.idiomatic_verbs.farcela`). Migration done this revision.
5. **PENDING**: joining a pre-verb clitic cluster into one word (`pronoun.combined.joined_when_should_be_separate`). Added per the project-side house-style feedback. Five items (op_comb_joined_01..05) already author against this proposed bucket.

## Glossary suggestions summary

28 entries in `data/glossary_suggestions_pronoun.json`, all pending review. The new ones added during the translation revision pass: "preceding-DOP rule", "negative imperative", "glie-cluster". Others previously proposed cover: vowel change, consonant doubling, antecedent, experiencer, right-dislocation, neuter lo, modal verb, predicate, compound tense, imperfect indicative, conditional, trapassato prossimo, future, 1sg/2sg/1pl/2pl/3pl, DOP cluster, ne (partitive), ne (pronominal), ci (locative), pro-drop, lexicalised, pronominal verb, reciprocal, argument structure, resumption, pre-verb position, attached position, joined cluster, separated cluster, monosyllabic imperative.

## Schema notes for the reviewer

- Followed Rev 2 conventions: no `severity` field anywhere; rich per-lemma `vocab_help` shape with aspect-keyed reveals throughout.
- Pronouns themselves are not vocab_help targets (per dispatch guidance).
- Avoided `position` and `conjugation` aspects to prevent giveaways on position questions.
- For verbs whose pronoun behaviour depends on argument structure (telefonare, piacere, mancare, sembrare, servire, rispondere, chiedere), used a `requires_iop` aspect with its own bucket (forward-referenced).
- Forward-referenced `vocabulary.it.<lemma>.<aspect>` buckets throughout; these will be promoted in the cross-cutting taxonomy session.
- The `match_at` field is not used in any item; substring matching is acceptable for the answer shapes produced.
- Several items have multiple markpoints (PP items combining pronoun selection with auxiliary/agreement diagnostics); they cross-reference the passato_prossimo tree.
- Joined-cluster items (op_comb_joined_01..05) reference the pending joined-when-separate bucket and will warn at authoring-time load until that bucket is ratified.

## Rev 3 conformance pass (2026-05-15)

Two retroactive fixes for the Author Brief Rev 3 updates:

**Lemma key conventions (§2)**: Five bucket-id references had stripped diacritics. Fixed three occurrences of `vocabulary.it.caffe.*` to `vocabulary.it.caffè.*` and two of `vocabulary.it.verita.translation` to `vocabulary.it.verità.translation`. The lemma key fields themselves already carried the diacritics; the violation was that the bucket-id slot stripped them. Now consistent.

The other six §2 rules were already in compliance: no uppercase lemma keys; participle and inflected forms all point their bucket at the canonical infinitive or noun lemma; adjective lemmas carry only the translation aspect (no gender); no multi-word Italian invariables in scope; mixed-gender pairs aren't represented as collapsed lemmas (the closest case is the English "friends" lemma in trans_op_en_it_08 which displays `friend - amico/amica` but points to the amico bucket — judgement call, the rule is clearer on the Italian-side direction).

**Friendly bucket labels in prose (§7)**: rewrote the hot-spot deep-dive, D3 resolution, migration results, and bucket-suggestions summary so each bucket reference leads with the friendly label (e.g. "the glielo-family bucket") and keeps the dot-separated id parenthetically in backticks for precision. The Cross-references section still lists external bucket ids in code-list format (allowed per §7 as data, and the ids are the action substance there).

## House-style revision pass (2026-05-14)

All 216 grammar-question explanations and all 56 translation-item explanations have been revised to the project's four-beat house style: (1) lead with what Italian is doing in everyday terms, (2) name the relevant grammatical term explicitly when first introduced (no inline expansion), (3) use the term thereafter, (4) finish with the concrete working ("Stack: ..."). Each explanation is roughly 30-60 words.

The 22+ cluster items with pre-verb separated forms now have the joined-cluster wrong forms added to `must_not_include`: melo, telo, celo, velo, mela, tela, cela, vela, mene, tene, cene, vene (where applicable to the specific cluster). This converts a "didn't try" verdict into a specific diagnostic miss.

## Pacing notes for the next dispatcher

The angle-based audit approach worked well a second time on the house-style pass. Recommend the next dispatcher use the rule-by-rule frame from the start: count distinct angles, not items. A rule like "the gli-exception to consonant doubling" needs three or four angles even though it has only one underlying fact, because the angles are where learners stumble in different ways.

The pronoun tree is dense and the cross-references to passato_prossimo are heavy. A future dispatch combining both topics (perhaps for B2-C1 deep-coverage items) would generate efficiencies. Consider also a 'register' dispatch that covers the Lei-formal patterns systematically across verb tenses, possessives, and pronouns together.

Two specific gaps worth a future top-up:
- Tag-question patterns ("Lo capisci, vero?") aren't tested anywhere in the current set.
- The colloquial reduction of negative + imperative + clitic ("Nondire!") is a real spoken pattern but might be out of scope at B2.
