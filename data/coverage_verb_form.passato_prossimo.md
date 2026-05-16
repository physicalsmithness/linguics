# Coverage summary: passato prossimo

Authored across two dispatches (initial + post-architecture-feedback revision). Brief revision 2.

**Totals**: 103 grammar questions, 50 translation items (24 en→it, 26 it→en).

**Prompt-leak fix (2026-05-15)**: rewrote prompts on `pp_aux_modal_01..05` (stripped "using prescriptive inheritance" and the redundant agreement cue) and `pp_aux_amb_01..03` (stripped "(transitive use ...)" and "(intransitive, motion)" parentheticals that named the bucket diagnostic). The diagnostic survives via participle agreement and sentence structure; the parentheticals now carry only the infinitive cue.

## Bucket-to-item-count table

Counts are "dedicated items" + "co-fires" where the bucket is one of several skills the item tests. A dedicated item is the one whose `subtopic` field names this bucket; co-fires happen when a bucket is a markpoint or `required_bucket` on an item whose primary focus is elsewhere.

### Auxiliary choice

| Bucket | Grammar (dedicated) | Translation (required_bucket) | CEFR target | Notes |
|---|---|---|---|---|
| `auxiliary.avere_default` | 6 (pp_aux_avere_01..06) plus ~30 co-fires | ~15 | A2 | Highest-frequency bucket. |
| `auxiliary.essere_motion_intransitive` | 8 (pp_aux_essere_mot_01..08) plus co-fires (irregulars, agreement, modal) | ~10 | A2 | Andare, venire, partire, arrivare, uscire, entrare, scendere, tornare each represented. |
| `auxiliary.essere_reflexive` | 6 (pp_aux_refl_01..06) | 2 | B1 | Alzarsi, lavarsi, vestirsi, svegliarsi, divertirsi, addormentarsi. |
| `auxiliary.essere_other_intransitive` | 4 (pp_aux_other_01..04) plus 3 co-fires (nascere, morire pairs) | 2 | B1 | Piacere, bastare, mancare, sembrare. |
| `auxiliary.ambiguous` | 3 (pp_aux_amb_01..03) | 1 (trans_pp_it_en_08) | B2 | Correre transitive vs intransitive; passare. |
| `auxiliary.person_agreement` | **5 (pp_aux_person_01..05)** | **2 (trans_pp_person_01..02)** | A2-B1 | Family + person dual-markpoint design. Translation items include negative anchors for right-family-wrong-person misses. |
| `auxiliary.modal_inheritance` | **5 (pp_aux_modal_01..05)** | **2 (trans_pp_modal_01..02)** | B2 | Volere/dovere/potere + essere/avere infinitives. Translation items accept both prescriptive and colloquial forms; negative anchors catch agreement failures. |

### Participle form

| Bucket | Grammar | Translation | CEFR | Notes |
|---|---|---|---|---|
| `participle_form.regular.are_ato` | 5 dedicated + ~25 co-fires | ~15 | A1-A2 | |
| `participle_form.regular.ere_uto` | 5 dedicated + co-fires | 2 | A2 | Vendere, ricevere, credere, dovere (citation form). |
| `participle_form.regular.ire_ito` | 5 dedicated + co-fires | 3 | A2 | Dormire, finire, capire, sentire. |
| `participle_form.irregular.fare_fatto` | 2 | 1 | A2 | |
| `participle_form.irregular.dire_detto` | 2 | 1 (trans_pp_dire_01) | A2 | |
| `participle_form.irregular.prendere_preso` | 1 | 2 | B1 | |
| `participle_form.irregular.vedere_visto` | 2 | 3 | A2 | **Now uses graded any_phrases**: veduto = 0.8 partial credit (archaic form). |
| `participle_form.irregular.scrivere_scritto` | 2 | 1 | B1 | |
| `participle_form.irregular.leggere_letto` | 1 | 2 | B1 | |
| `participle_form.irregular.mettere_messo` | 1 | 1 | B1 | |
| `participle_form.irregular.aprire_aperto` | 1 | 1 | B1 | |
| `participle_form.irregular.chiudere_chiuso` | 1 | 1 | B1 | |
| `participle_form.irregular.nascere_nato` | 1 | 1 | A2-B1 | |
| `participle_form.irregular.morire_morto` | 1 | 1 (trans_pp_morire_01) | B1 | |
| `participle_form.irregular.venire_venuto` | 1 | 1 (trans_pp_venire_01) | A2 | |
| `participle_form.irregular.essere_stato` | 1 | 1 | A2 | |
| `participle_form.irregular.bere_bevuto` | 1 | 1 | B1 | |

### Participle agreement

| Bucket | Grammar | Translation | CEFR | Notes |
|---|---|---|---|---|
| `participle_agreement.with_essere.masculine_singular` | 2 dedicated + ~6 co-fires | 3 | A2 | |
| `participle_agreement.with_essere.feminine_singular` | 2 dedicated + ~5 co-fires | 3 | A2 | |
| `participle_agreement.with_essere.masculine_plural` | 2 dedicated + co-fires (reflexives, irregulars) | 1 | B1 | |
| `participle_agreement.with_essere.feminine_plural` | 3 (incl. pp_agr_ess_mix_01 Maria e Giulia — all-female so genuinely fem pl) | 1 | B1 | |
| `participle_agreement.with_essere.mixed_gender_default` | **4 (3 new + 1 retagged from masculine_plural)** | 1 (NEW) | B1 | NEW. The retagged item is `pp_agr_ess_mix_02` (Marco e Anna sono andati). |
| `participle_agreement.with_avere.no_preceding_dop` | 3 dedicated + co-fires | 2 | A2-B1 | |
| `participle_agreement.with_avere.preceding_dop_lo` | 1 | 1 | B1 | |
| `participle_agreement.with_avere.preceding_dop_la` | 2 | 1 (trans_pp_dop_la_01) | B1 | Translation item juxtaposes no-DOP and preceding-DOP-la within one sentence. |
| `participle_agreement.with_avere.preceding_dop_li` | 1 | 1 | B1 | |
| `participle_agreement.with_avere.preceding_dop_le` | 2 | 1 | B1 | |
| `participle_agreement.with_avere.preceding_partitive_ne` | **3 (pp_agr_av_ne_01..03, NEW)** | 1 (NEW) | B2 | NEW. |

### Other

| Bucket | Grammar | Translation | CEFR | Notes |
|---|---|---|---|---|
| `negation` | 3 dedicated | ~2 co-fires inside larger items | A2-B1 | |
| `adverb_placement` | **5 (pp_adv_pos_01..05, NEW)** | **2 (trans_pp_adv_01, _02, NEW)** | B1 | NEW. Covers già, ancora, mai, sempre, appena. |
| `translation_mapping.en_simple_past` | 0 (n/a — translation-direction bucket) | **4 (trans_pp_map_sp_01..04, NEW)** | B1 | NEW. All it→en. Negative anchors for the "have + yesterday" miss. |
| `translation_mapping.en_present_perfect` | 0 (n/a) | **4 (trans_pp_map_pp_01..04, NEW)** | B1 | NEW. All it→en. Tests adverbs già/ancora/mai/appena triggering English present perfect. |

## Items flagged uncertain

- **`pp_aux_modal_03`**: Loro ____ potuti partire in orario. The masc-pl participle 'potuti' is visible in the prompt; one could argue it gives the auxiliary family away. Counter-argument: the auxiliary FORM still needs to be picked (sono vs hanno is the actual choice), and the participle agreement is a separate prior-knowledge cue rather than a giveaway of the answer. Same pattern across all five modal items. Worth review.

- **`pp_adv_pos_03`**: any_phrases is `["mai andato", "mai stato"]` (two options). This is over the typical 1-3 entries cap by spirit — they're paraphrases for the same skill but they map to different verbs (andare vs stare). If the engine treats this as a single-bucket question, it's fine; if the reviewer wants the verb-choice to fire its own bucket, the question should be tightened or split.

- **`trans_pp_map_pp_04`** (Mia sorella è appena arrivata): one reference flags "My sister just arrived" (simple past) as widely-acceptable in AmE for very-recent past. The marker should not penalise this English rendering; if it does, the bucket attribution becomes noisy. Flag for marker config.

- **`trans_pp_map_pp_03`**: One reference notes "I never ate sushi" (simple past) as "acceptable when implying a closed period." This is a genuine semantic ambiguity, not just a grammar one. The marker should accept either tense rendering unless the source text fixes the implication.

- **`pp_aux_person_04`** (Tu e Maria ____ visto il film): the 'tu e X → voi' collapse is a tricky pre-requisite. Some learners will read "Tu e Maria" as third-person on the strength of Maria; the question is designed precisely to surface this. May warrant pairing with explicit pre-teaching.

## Per-item CEFR distribution

Rough counts at the requested levels (each item has one `cefr_level_target`):

| CEFR | Grammar | Translation |
|---|---|---|
| A1 | 6 (form-only and simple regulars) | 0 |
| A2 | 28 | 11 |
| B1 | 51 | 23 |
| B2 | 18 | 16 |
| C1 | 0 | 0 |
| C2 | 0 | 0 |

C1/C2 coverage is deliberately absent. The PP isn't a level-distinctive skill at C1+ (it's `fluency` on the cefr_importance map across most leaves); a handful of B2 items handle the harder edges (DOP agreement, ambiguous auxiliary, modal inheritance, preceding-ne, translation_mapping). If a C1 batch is later wanted, focus on register variation (literary vs colloquial PP/passato-remoto alternation) which would need a separate tree.

## Notes for the next dispatch

### Coverage gaps still open

All four gaps from the prior version of this document have been closed in the follow-up pass. Remaining smaller items:

1. **C1/C2 grammar items absent.** Deliberate: PP is `fluency` on the cefr_importance map at those levels, not skill-distinctive. A C1 batch would be a separate scope focusing on PP/passato-remoto register alternation, which would require its own bucket tree.

2. **No translation coverage for the `ambiguous` auxiliary bucket beyond the single trans_pp_it_en_08 item.** A second item flipping the transitive/intransitive distinction (e.g. "I ran the marathon" vs "I ran home") would round it out.

3. **vocab_help still absent on the v1 82 grammar + 30 translation items.** All v2 additions (33 items total: 21 grammar + 12 translation) carry the rich shape. Retrofit is mechanical but high-volume.

4. **No `prompt_supplies_base_form` flag on v1 items.** All v2 items have it where the citation form appears in parens. The v1 items would benefit from a sweep.

### Conventions used

- **External_id format**: `pp_<subtopic_short>_<NN>` for grammar; `trans_pp_<subtopic_short>_<NN>` for translation. Per AUTHOR_BRIEF rev 2, the topic_short `pp` comes from the bucket tree root's attributes (not yet present on the tree's root entry — flagging for the architecture chat to add).

- **Prompts anchor to past tense.** Every fill-in either contains a past-time adverbial (ieri, stamattina, l'anno scorso, etc.), has a visible PP participle in the unblanked text, or uses an imperfetto subordinate clause for anchoring. No prompt names the tense.

- **Graded any_phrases used on**: `pp_irr_vedere_01` and `pp_irr_vedere_02` for the visto/veduto distinction (visto = 1.0, veduto = 0.8 with note "archaic but grammatical").

- **Negative reference translations used on**: trans_pp_adv_01 (wrong adverb placement), trans_pp_map_sp_01/_02/_03/_04 (present-perfect-with-yesterday English errors), trans_pp_map_pp_01 (simple-past-without-anchor English error), trans_pp_ne_01 (no-agreement Italian error), trans_pp_mix_01 (over-applied fem-pl on mixed-gender). All use `polarity: "negative"` per the v2 schema.

- **Person/family dual-markpoint design** on person_agreement questions: markpoint 1 credits the auxiliary FAMILY (6 any_phrases for all avere forms or 5 for all essere forms; over the 1-3 guideline but justified because the bucket is intrinsically family-shaped). Markpoint 2 credits the specific PERSON. This gives the diagnostic "right family, wrong person" cleanly.

- **vocab_help status**: present on all 21 new grammar items and all 12 new translation items, in the v2 rich per-lemma shape. **NOT retrofitted onto the v1 82 grammar + 30 translation items** because the feedback letter said "migrate where you've used it" and v1 didn't use it. Retrofit is a future task if wanted.

### Schema check

- `severity` field removed throughout both files.
- `explanation` present on every item.
- No prompt names the tense or topic. `pp_neg_02` was rewritten to remove its "in PP" mention.
- All bucket references resolve against the v2 tree (verified by Grep cross-reference). Off-tree optional_buckets (`preposition.articulated.*`, `pronoun.indirect_object`, `article.definite`, `adjective_agreement.o_class`) are forward-references to sibling trees, per the brief's allowance.

### Open feedback items the next dispatch should know about

- The `topic_short` field is mentioned in AUTHOR_BRIEF rev 2 §1.B as living on the bucket-tree root's `attributes`, but it isn't actually present on the current tree's root entry. Either the brief needs updating or the tree needs the attribute added. I used `pp` based on the architecture chat's confirmation in `FEEDBACK_TO_passato_chat.md`.

- The `prompt_supplies_base_form` boolean is now used on grammar items where the prompt provides the verb's citation form in parens. Carried through new items; not retrofitted onto v1 items. Worth a sweep.

- Adverb placement and translation-mapping buckets ended up being heavily cross-referenced (most translation_mapping items also `required_bucket` adverb_placement). That feels right structurally, but the architecture chat should sanity-check that the marker doesn't double-count when both buckets fire on the same skill.
