# Coverage summary: passato prossimo

Authored across two dispatches (initial + post-architecture-feedback revision). Brief revision 2. Rev 5/8/9/13/15 catch-up applied 2026-07-14.

**Totals**: 135 grammar questions, 50 translation items (24 en→it, 26 it→en). Volume-formation wave 2026-07-21 added 32 items.

**Prompt-leak fix (2026-05-15)**: rewrote prompts on `pp_aux_modal_01..05` (stripped "using prescriptive inheritance" and the redundant agreement cue) and `pp_aux_amb_01..03` (stripped "(transitive use ...)" and "(intransitive, motion)" parentheticals that named the bucket diagnostic). The diagnostic survives via participle agreement and sentence structure; the parentheticals now carry only the infinitive cue.

**Criterion-21 formation-trigger retrofit (2026-07-21)**: 22 items reframed under AUTHOR_BRIEF criterion 21 (Rev 28) after the 2026-07-19 audit flagged them as ambiguous for the imperfetto competitor. 21 items got mechanism (a) — appended `, passato prossimo` to the existing verb parenthetical (Rev 26 licenses tense-name as trigger). One frame rework: `pp_reg_ere_04` (Smith's live type case) moved from `All'inizio io ____ alla tua storia, ma poi ho capito` to `Alla fine io ____ alla tua storia senza esitazione` — the "at first ... but then" contour was aspectually imperfective and no cue tag could honestly settle it; the new frame is decisively perfective. All 22 also gained `prompt_supplies_base_form: true` (they were the only PP items missing the key entirely per the audit). Markpoints untouched throughout. Explanation gloss on pp_reg_ere_04 updated to match the new sentence. Report in `inter_chat/Architecture_PassatoAuthor_formation_trigger_retrofit.md` v3.

**Person field backfill (2026-07-21)**: same touch. 70 items got `person:` set per the newly-ratified schema (`1sg..3pl` for finite items, `null` for the 10 form-only fragments). Distribution: 12 × 1sg, 5 × 2sg, 24 × 3sg, 4 × 1pl, 3 × 2pl, 12 × 3pl, 10 × null. pp_aux_person_04 (`Tu e Maria ieri sera ____ visto il film`) tagged 2pl on the tu-and-X voi-collapse.

**Volume-formation wave (2026-07-21)**: 32 new items authored under `DISPATCH_volume_formation.md`. **File total 103 → 135.** 27 regular items fill the 3-class × 6-person formation grid to the 2-for-green floor (every person×class cell now at 2 items; ID convention `pp_reg_<class>_<verb>_<person>_<nn>` for grep-by-band). 5 irregular items add a second person-band to the highest-frequency irregular verbs (fare, dire, essere_stato, venire, prendere). Every new item: cue-names passato prossimo per crit 21, carries `prompt_supplies_base_form: true`, sets `person`, uses two-markpoint aux+participle design with `credit: 1.0` each (Rev 27 cross-credit), `match_at: "word"` on all any_phrases, person-matched imperfetto competitor in `must_not_include` (crit 21 rider 2, guard-verdict verified against replica), `info_display: "suppress"`, and crit-17 English gloss. Two content fixes on eyeball pass (venire ieri/stamattina conflict; dire past-anchor); 30 auto-generated vocab_help translation reveals corrected. **Irregular residual flagged not authored**: 10 irregulars still at one person-band each; ~10 more items would round them out if Architecture wants a second touch. Report: `inter_chat/Architecture_PassatoAuthor_volume_wave.md` v1.

**Slot-count collapse (2026-05-28)**: collapsed all 6 multi-slot prompts to single slot per AUTHOR_BRIEF §2 criterion 9 (multi-slot blanks cue compound-form-family). Affected items: `pp_aux_refl_05` (was 2-slot for `sono divertiti`) and `pp_adv_pos_01..05` (were 2-slot for auxiliary+adverb or adverb+participle pairings). Markpoints unchanged — substring matching handles the new format.

**Brief-revision catch-up (2026-07-14)**: four rev-driven passes applied in one sweep, no content change to prompts / any_phrases / must_not_include / markpoints.

- **Rev 13 (criterion 17, English sentence gloss on explanations)**: prepended a completed-sentence gloss to all 103 grammar explanations. Full-sentence items open with `'<Italian>' (= '<English>').`; the 10 fragment-prompt items (form-only participle drills) open with `<Italian target> = '<English>'.`. Four-beat working preserved. Translation items untouched (they're inherently about translation).
- **Rev 5 (vocab_help bucket-id pos slot)**: retrofitted 112 vocab_help entry buckets to insert the `.<pos>.` segment between lemma and aspect (e.g. `vocabulary.it.parlare.translation` → `vocabulary.it.parlare.verb.translation`). Covers all lemmas in the batch across both grammar and translation files (verbs, nouns, adverbs).
- **Rev 9 (criterion 13 cue economy)**: audit surfaced 7 items with parentheticals containing `masc/fem/N-sg/N-pl` cues; on inspection every one is doing gender or number disambiguation the sentence itself doesn't supply (Loro / io / lei without a gender-marked possessive nearby). No rev 9 rewrites needed — the parentheticals aren't naming a person that the sentence already provides.
- **Rev 8/15 (criterion 15 info_display suppress)**: per-item leak-vs-trap test applied. 92 items get `info_display: "suppress"` (participle-form regulars and irregulars, essere/avere auxiliary choice, agreement with essere / avere / partitive-ne / mixed-gender, modal inheritance, adverb placement — all cases where the bucket breadcrumb would name the class / rule-output the item tests). 11 items stay visible: `auxiliary.ambiguous` (breadcrumb "Verbs that take either auxiliary" doesn't commit), `auxiliary.person_agreement` (breadcrumb names the diagnostic axis but not the answer form), `negation` (topic-level "Negation" label doesn't leak).

**Not applied**: rev 12's terse-label rule is a bucket-tree concern for Architecture, not for items (items reference the tree by id path, not by label). Rev 14's House Techniques are encouraged patterns; the batch already applies technique #3 (same-surface opposite-answer pair, via `pp_aux_amb_01/02` = correre transitive vs intransitive); the other four techniques are batch-composition concerns for future dispatches rather than per-item rewrites.

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
| `participle_form.regular.are_ato` | 14 dedicated (5 pre-wave + 9 wave) + ~25 co-fires | ~15 | A1-A2 | Volume wave: 6-person band at 2 items/cell. |
| `participle_form.regular.ere_uto` | 14 dedicated (5 pre-wave + 9 wave) + co-fires | 2 | A2 | Volume wave: 6-person band at 2 items/cell. Vendere, ricevere, credere; wave adds ricevere/vendere/credere across all persons. |
| `participle_form.regular.ire_ito` | 14 dedicated (5 pre-wave + 9 wave) + co-fires | 3 | A2 | Volume wave: 6-person band at 2 items/cell. Dormire, finire, capire, sentire, pulire, preferire across all persons. |
| `participle_form.irregular.fare_fatto` | 3 (wave +1 3sg) | 1 | A2 | |
| `participle_form.irregular.dire_detto` | 3 (wave +1 3sg) | 1 (trans_pp_dire_01) | A2 | |
| `participle_form.irregular.prendere_preso` | 2 (wave +1 1sg) | 2 | B1 | |
| `participle_form.irregular.vedere_visto` | 2 | 3 | A2 | **Now uses graded any_phrases**: veduto = 0.8 partial credit (archaic form). |
| `participle_form.irregular.scrivere_scritto` | 2 | 1 | B1 | |
| `participle_form.irregular.leggere_letto` | 1 | 2 | B1 | |
| `participle_form.irregular.mettere_messo` | 1 | 1 | B1 | |
| `participle_form.irregular.aprire_aperto` | 1 | 1 | B1 | |
| `participle_form.irregular.chiudere_chiuso` | 1 | 1 | B1 | |
| `participle_form.irregular.nascere_nato` | 1 | 1 | A2-B1 | |
| `participle_form.irregular.morire_morto` | 1 | 1 (trans_pp_morire_01) | B1 | |
| `participle_form.irregular.venire_venuto` | 2 (wave +1 3sg) | 1 (trans_pp_venire_01) | A2 | |
| `participle_form.irregular.essere_stato` | 2 (wave +1 3sg) | 1 | A2 | |
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
