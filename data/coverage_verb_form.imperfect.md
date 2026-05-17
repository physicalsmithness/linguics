# Coverage: verb_form.imperfect

Dispatch authored 2026-05-17 against `data/buckets/verb_form.imperfect.json` and `DISPATCH_imperfect.md`. Brief: Revision 2 (2026-05-13).

## Totals (audited by grep on the output files)

- Grammar items: **121**
- Translation items: **51**
- Bucket suggestions: 0 (none needed; bucket tree was complete for this topic)
- Glossary suggestions: **7 terms** proposed (`aspect`, `progressive aspect`, `prospective reading`, `polite-present`, `protasis`, `apodosis`, `periodo ipotetico`) plus three aliases

## Leaf-by-leaf breakdown

### formation.regular_* (3 leaves)

| Leaf | Grammar | Translation (primary) | Notes |
|---|---|---|---|
| regular_are | 6 | 0 | Covers 1sg/2sg/3sg/1pl/2pl/3pl across six different verbs; stress-shift on 1pl/2pl flagged twice (studiare, nuotare); regular-imperfect of an irregular-elsewhere verb (andare) shown |
| regular_ere | 5 | 0 | Covers all persons; 3 of 5 items deliberately use verbs with irregular participles (leggere, scrivere, prendere, mettere) to hit the "imperfect-regular-despite-PP-irregular" rule |
| regular_ire | 5 | 0 | Covers all persons; 3 of 5 items target the -isc- sleeper (capire, finire, preferire all regular in imperfect, contra their present-tense -isc- pattern) |

### formation.irregular.essere

| Leaf | Grammar | Translation (primary) | Notes |
|---|---|---|---|
| irregular.essere | 8 | 2 | All six personal forms present (ero, eri, era, eravamo, eravate, erano); 2 existential items (c'era, c'erano including nearest-conjunct case) |

### formation.irregular.stem_expansion.* (5 leaves)

| Leaf | Grammar | Translation (primary) | Notes |
|---|---|---|---|
| fare | 4 | 1 | 1sg, 3sg, 1pl, 3pl; fac- stem repeatedly emphasised |
| dire | 3 | 1 | 3sg, 1pl, 3pl; dic- stem emphasised |
| bere | 3 | 1 | 1sg, 1pl, 3pl; bev- stem emphasised |
| porre | 2 | 0 | 3sg porre + 1sg compound (proporre); rarer verb so lighter |
| tradurre | 2 | 0 | 1pl tradurre + 3pl compound (introdurre); rarer verb so lighter |

### usage.* (6 leaves)

| Leaf | Grammar | Translation (primary) | Notes |
|---|---|---|---|
| habitual | 6 | 3 | Mix of explicit (sempre, di solito, ogni X, da bambino) and implicit (in quel periodo) cues; includes one reflexive |
| ongoing_descriptive | 6 | 3 | Weather + descriptive + emotional state + parallel-ongoing items |
| background_with_pp | 8 | 4 | **Hot spot.** 3 two-blank items testing both halves of the contrast. After feedback, refactored to two-markpoint pattern on PP blanks: discrimination markpoint against `usage.background_with_pp`, form markpoint against the PP-auxiliary bucket |
| duration | 4 | 2 | Da + time + imperfect; per/da contrast flagged in explanations |
| age_time_weather | 7 | 4 | **Hot spot.** Age (avere + anni), time of day (essere singular + plural), weather (fare, piovere, nevicare) |
| polite | 3 | 2 | Volere ×2, potere ×1; potere-polite flagged as register-borderline |

### discrimination.vs_passato_prossimo_general

| Leaf | Grammar | Translation (primary) | Notes |
|---|---|---|---|
| vs_passato_prossimo_general | 12 | 5 | Balanced 6 imperfect + 6 PP expected; -are/-ere/-ire verbs all represented; includes reflexives; 2 items have only implicit cues (in quel periodo, no adverb at all) |

### discrimination.modals.* (5 leaves)

Each modal at 5 grammar + 3 translation items, both directions covered:

| Leaf | Grammar | Translation (primary) | Notes |
|---|---|---|---|
| sapere | 5 | 3 | State-of-knowing (sapevo) vs event-of-learning (ho saputo); includes one mixed item (sap_03, originally a potere item, reclassified as sapere — the "could speak a language = sapere" point) |
| dovere | 5 | 2 | Was-supposed-to (dovevo) vs had-to-and-did (ho dovuto); one item flags auxiliary inheritance (sono dovuto vs ho dovuto) |
| potere | 5 | 3 | Ability-state (potevo) vs managed-to (ho potuto); includes pot_02 (museum permission item, deliberately no skill/sapere ambiguity) |
| volere | 5 | 2 | Wanted-didn't-act (volevo) vs insisted-and-got-way (ho voluto) |
| conoscere | 5 | 3 | Was-acquainted (conoscevo) vs met-for-first-time (ho conosciuto); includes the explicit denial-of-first-meeting framing |

### indirect_speech.* (2 leaves)

| Leaf | Grammar | Translation (primary) | Notes |
|---|---|---|---|
| reported_present | 4 | 2 | Present-to-imperfect shift under past reporting; modal (potere) variant included |
| reported_intention | 3 | 2 | Imperfect for reported future intention (colloquial); includes stare per + infinitive |

### stylistic.* (2 leaves, C1+)

| Leaf | Grammar | Translation (primary) | Notes |
|---|---|---|---|
| narrative | 2 | 1 | Light per dispatch: historical-style + journalistic-style |
| colloquial_counterfactual | 3 | 2 | Slightly heavier because diagnostic-rich; both protasis and apodosis collapse; sapessi (over-applied subjunctive) flagged as a likely miss |

## Items flagged as uncertain (for review)

These items have judgement calls the project author may wish to ratify or override:

1. **`imp_form_essere_07`** — accepts both `c'era` and `c'erano` for the nearest-conjunct existential ("Sul tavolo ____ un libro e una tazza di caffè"). Italian usage is genuinely split; I credit either. If you want to force one, narrow `any_phrases` to a single form.

2. **`imp_use_bg_08`** — uses the idiom "saltare la corrente" (the power went out) with auxiliary essere. This is colloquial-natural Italian but register-marked compared to the more textbook "è andata via la luce". Cleanly diagnostic of essere-with-change-of-state but you may prefer the neutral idiom. The matching translation item (`trans_imp_en_it_use_bg_03`) accepts both.

3. **`imp_use_pol_03`** — potere-polite ("potevo avere un'informazione, per favore?"). The bucket description endorses polite use of potere but it's less common than volere-polite, and many speakers default to conditional `potrei`. Flagged in examiner_note as borderline.

4. **`imp_disc_dov_02`** — accepts `ho dovuto andare`, `sono dovuto andare`, and `sono dovuta andare` for "I had to go to the doctor". This reflects the modern auxiliary-inheritance spread; both essere and avere are widespread. Prescriptive grammar prefers essere with motion-intransitive infinitives; colloquial Italian uses avere uniformly. If you want one variant only, narrow accordingly.

5. **`imp_disc_pot_02`** translation item ("After much effort... finally managed to talk to him") — credits both `sono riuscito a parlargli` and `ho potuto parlargli` as natural Italian for English "managed to". The riuscire-version is more common; the ho potuto version is the imperfect-topic-specific skill. Marker should attribute the modals.potere bucket on the ho potuto path.

6. **`imp_st_cc_02`** and **`imp_st_cc_03`** — colloquial counterfactual items include `sapessi` / `parlassi` in `must_not_include`. These are imperfect subjunctive forms, which are NOT prescriptively right for past counterfactual (prescriptive needs trapassato subjunctive: avessi saputo, avessi parlato), so flagging them as wrong-attempts is correct. But a learner producing them is partway-applying the formal rule. The bucket attribution catches this as a colloquial-counterfactual miss; an alternative would be to flag separately as a half-applied-formal-rule miss. Current attribution is the simpler choice.

7. **Cross-tree references in translation items** — many translation items list PP-tree buckets in `required_buckets` (e.g. `verb_form.passato_prossimo.auxiliary.essere_motion_intransitive` on `trans_imp_en_it_use_bg_01`). The AI marker can fire these correctly because it sees the whole attempt. The grammar items had a related issue earlier; those were refactored to the two-markpoint discrimination + form pattern so the substring engine attributes wrong-tense and wrong-form to the right buckets.

## Notes for next dispatch

### What worked well
- The four-beat explanation house style (everyday lead, named term, term-used-thereafter, concrete working) gave room to make each rule explicit without inline glossary-expansion. The glossary suggestions file proposes the seven new terms that will let the renderer auto-wrap them once merged.
- The dispatch's hot-spot guidance was load-bearing: background_with_pp, age_time_weather, and the modal-discrimination buckets each got their fair share of distinct angles.
- The vocab_help rich shape (per-lemma with multiple aspects) gave each item clean help-attribution without giveaways.

### Open questions for the project author

1. **External_id convention**: I followed the brief's `trans_<topic_short>_<direction>_<subtopic_short>_<NN>` pattern (e.g. `trans_imp_en_it_disc_sap_03`). The project author noted these IDs are hard to read at a glance. If a more transparent scheme is wanted (e.g. `imperfect.discrimination.sapere.translation.03`), the whole dispatch needs a rename pass.

2. **PP-tree bucket suggestion (cross-tree, NOT for this file)**: The auxiliary `essere_motion_intransitive` is what I used for "è saltata la corrente" (saltare-as-change-of-state) and similar items. The PP tree might benefit from a separate `auxiliary.essere_change_of_state` bucket distinct from motion-intransitive. This isn't an imperfect-tree concern — flagging here for the next PP-tree audit.

3. **Discrimination form-attribution**: For the modal-discrimination grammar items I used single-markpoint (bucket = `discrimination.modals.X`). This attributes wrong-tense cleanly but leaves wrong-form-within-right-tense (e.g. "ho sapeto" with wrong participle) silently unrecorded. If you want symmetric two-markpoint attribution (discrimination + form) for discrimination items, I can retrofit. For now they match the simpler pattern.

4. **The colloquial counterfactual / past conditional overlap**: Items in `stylistic.colloquial_counterfactual` test the imperfect-only collapse. The prescriptive alternative (trapassato subjunctive + past conditional) is mentioned in explanations but isn't a tested skill in the imperfect topic. When the conditional dispatch eventually happens, those forms will get their own items.

5. **Indirect speech reported future**: The brief notes indirect-speech reported future intentions may invoke `verb_form.condizionale.*` buckets that don't yet exist. I forward-referenced these implicitly in explanations (mentioning "past conditional avrebbe richiamato" as the prescriptive alternative to imperfect richiamava). When the conditional dispatch happens, the cross-references can be wired up.

### Cross-tree references actually used in this dispatch

In the grammar file (`verb_form.passato_prossimo.*` buckets appear in 5 items, all on PP-blank slots in background_with_pp items, paired with the discrimination markpoint per the user-requested attribution model):

- `verb_form.passato_prossimo.auxiliary.avere_default` — 4 occurrences (bg_03, bg_04, bg_06, bg_07: bussato, incontrato, rotto)
- `verb_form.passato_prossimo.auxiliary.essere_motion_intransitive` — 1 occurrence (bg_08: saltata)

In translation items (`required_buckets`), PP-tree references appear in several items as supplementary skill-tracking. These don't break the discrimination/form separation principle because the AI marker can attribute correctly based on the actual answer.
