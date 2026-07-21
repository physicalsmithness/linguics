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

---

## Update 2026-05-28: criterion 10 audit + two-markpoint retrofits

Following architecture chat rulings on `Architecture_ImperfectAuthor_other_open_questions.md` (v3 introducing criterion 10) and `Architecture_ImperfectAuthor_two_markpoint_pattern.md` (v2 accepting the two-markpoint convention with three extensions), the following changes have been applied to the items in this batch.

### Criterion 10 fixes (4 items rewritten + 1 must_not_include addition)

- `imp_disc_gen_05` prompt prepended with "Negli anni Novanta," (architecture's suggested fix). Explanation and examiner_note updated to describe a period-frame rather than implicit-cue diagnostic.
- `imp_disc_gen_08` prompt prepended with "Da bambino," to pin the habit in a past period.
- `imp_disc_gen_11` prompt prepended with "Quel giorno," to pin a single past day.
- `imp_disc_pot_02` prompt prepended with "Ieri," because the original allowed a present-tense reading of "finalmente posso vedere... dopo mesi di attesa".
- `imp_disc_gen_01` `must_not_include` extended with "ho" so a bare-present attempt records as a miss against the discrimination bucket.

All other items in the batch already complied with 10a (past-pinning) and 10b (present-tense in must_not_include) as authored.

### Two-markpoint retrofits (16 items now multi-markpoint)

Per the architecture ruling, items where the form is separately diagnostic get split into discrimination + form markpoints, each at credit 0.5.

**5 background-with-pp items, both blanks split where present (bg_03, bg_06, bg_08 also got the symmetric retrofit on their imperfect blank per Q3 ruling):**

- `imp_use_bg_03`: 4 markpoints (imp discrim + imp form for cenavamo; PP discrim + PP form for ha bussato).
- `imp_use_bg_04`: 2 markpoints (PP discrim + PP form only; no imperfect blank in this item).
- `imp_use_bg_06`: 4 markpoints (imp discrim + imp form for camminavo; PP discrim + PP form for ho incontrato).
- `imp_use_bg_07`: 2 markpoints (PP discrim + PP form only; no imperfect blank).
- `imp_use_bg_08`: 4 markpoints (imp discrim + imp form for guardavano; PP discrim + PP form for è saltata).

**11 modal-discrimination items, PP-answer items split** (per the rule of thumb in the v2 ruling: form is separately diagnostic when the verb involves an irregular participle, stress-shift, stem-expansion, vowel-change, or syncope):

- Irregular participle (saputo, conosciuto):
  - `imp_disc_sap_01`, `imp_disc_sap_03` — split against `verb_form.passato_prossimo.participle_form.irregular.saputo` for the form markpoint.
  - `imp_disc_con_02`, `imp_disc_con_04` — split against `verb_form.passato_prossimo.participle_form.irregular.conosciuto`.

- Modal auxiliary inheritance (when the infinitive triggers essere):
  - `imp_disc_dov_02` (dovere + andare, motion intransitive) — form markpoint cites `verb_form.passato_prossimo.modal_auxiliary_inheritance`.
  - `imp_disc_vol_02` (volere + diventare, change-of-state) — same.

- Modal + transitive/avere-taking infinitive (form markpoint cites `auxiliary.avere_default`; must_not catches the essere-inheritance over-generalisation):
  - `imp_disc_dov_04` (dovere + lavorare), `imp_disc_dov_05` (dovere + finire), `imp_disc_pot_02` (potere + vedere), `imp_disc_pot_04` (potere + comprare), `imp_disc_vol_04` (volere + vedere).

**Modal-discrimination items NOT split** (form is straightforwardly regular, not separately diagnostic): all imperfect-answer items (sapevo, sapevano, sapeva, sapevi, dovevo, dovevamo, potevo, poteva, volevo, voleva, volevano, conoscevo, conosceva, conoscevi). 14 of the 25 modal items remain single-markpoint.

### Forward-referenced PP-tree buckets

The retrofits introduce three PP-tree bucket references that may not yet exist in `data/buckets/verb_form.passato_prossimo.json`:

- `verb_form.passato_prossimo.participle_form.irregular.saputo`
- `verb_form.passato_prossimo.participle_form.irregular.conosciuto`
- `verb_form.passato_prossimo.modal_auxiliary_inheritance`

These are forward-references per the brief's "warn at authoring, strict-reject at production" convention. Flagged here so the next PP-tree audit can ratify or rename them. The other PP-tree references used (`auxiliary.avere_default`, `auxiliary.essere_motion_intransitive`) already exist.

### Marks/credit accounting

All edits preserve `marks` totals (sum of markpoint credits = `marks` field per item). Validated programmatically: 0 mismatches across all 121 grammar items. 16 items now have multi-markpoint structures; the remaining 105 use single-markpoint as before.

### Dual-register convention applied to 4 translation items

Per the architecture chat's ruling (surfaced via `ImperfectAuthor_TenseChoiceAuthor_cross_tree_citations.md` v3): translation items accepting multiple register variants put ALL acceptable-register buckets in `required_buckets`. The marker fires whichever register the learner's answer matches; the others stay untouched. Items affected:

- `trans_imp_en_it_use_pol_01` ("I'd like an espresso") — added `verb_form.condizionale.present.polite_use` alongside the imperfect-polite bucket (volevo / vorrei both accepted).
- `trans_imp_en_it_use_pol_02` ("Excuse me, I wanted to ask you a question") — same conditional-polite addition.
- `trans_imp_en_it_isp_int_01` ("He said he was going to call back later") — added `verb_form.condizionale.past.indirect_speech_reported_intention` alongside the imperfect prospective bucket (richiamava / avrebbe richiamato both accepted).
- `trans_imp_en_it_st_cc_01` ("If you had told me earlier, I would have come") — added `verb_form.congiuntivo.trapassato.counterfactual_protasis` and `verb_form.condizionale.past.counterfactual_apodosis` for the prescriptive variant alongside the colloquial-imperfect bucket.

These add four forward-referenced bucket paths to non-imperfect trees (condizionale, congiuntivo) that don't yet exist:
- `verb_form.condizionale.present.polite_use`
- `verb_form.condizionale.past.indirect_speech_reported_intention`
- `verb_form.congiuntivo.trapassato.counterfactual_protasis`
- `verb_form.condizionale.past.counterfactual_apodosis`

Flagged for the conditional and subjunctive dispatches when they happen; per the brief's policy, forward-references warn at authoring and strict-reject at production.

### Open thread state at this snapshot

- `Architecture_ImperfectAuthor_two_markpoint_pattern.md`: CLOSED. Two-markpoint convention accepted, retrofits applied.
- `Architecture_ImperfectAuthor_other_open_questions.md`: CLOSED at v5.
- `ImperfectAuthor_TenseChoiceAuthor_cross_tree_citations.md`: CLOSED. Pattern B confirmed both sides; both chats' items coexist in the discrimination buckets.
- `Architecture_ImperfectAuthor_chip_suppression.md`: OPEN, v3 implementation reported.

### Chip-suppression hybrid A+C applied (2026-06-07)

Per the architect's v2 ruling on `Architecture_ImperfectAuthor_chip_suppression.md`:

**Option C (item recast as constrained translation, 3 items):**

- `imp_use_pol_01`, `imp_use_pol_02`, `imp_use_pol_03` deleted from `grammar_questions_verb_form.imperfect.json`.
- Replaced by `trans_imp_en_it_use_pol_03`, `_04`, `_05` in `translation_items_verb_form.imperfect.json`. Each has the "use a tense other than the conditional" constraint embedded in `source_text`. The conditional variants (vorrei, potrei) are listed as `polarity: "negative"` reference translations.

**Option A (info_display: "suppress" flag, 25 items):**

- 8 background_with_pp items (`imp_use_bg_01..08`)
- 7 age_time_weather items (`imp_use_atw_01..07`)
- 5 modals.sapere items (`imp_disc_sap_01..05`)
- 3 colloquial_counterfactual items (`imp_st_cc_01..03`)
- 2 narrative items (`imp_st_narr_01..02`)

The flag is display-only; engine behaviour (marking, bucket attribution, must_not_include) is unchanged. Housing will substitute a generic label (e.g. "Imperfect drill") for the bucket name pre-answer; the bucket name appears with the explanation post-answer. Housing's rendering of the flag depends on the parallel `Architecture_Housing_info_display_suppress.md` thread the architect is opening.

### Totals post-chip_suppression

- Grammar items: **118** (was 121, minus 3 polite items recast as translation)
- Translation items: **54** (was 51, plus 3 polite items recast)
- Items carrying `info_display: "suppress"`: **57**

Validated programmatically: 0 mark/credit mismatches; JSON parses on both files.

---

## Update 2026-07-17: chip_suppression v4 extension applied

Per architect's v4 ruling on `Architecture_ImperfectAuthor_chip_suppression.md`: extend `info_display: "suppress"` to all discrimination items, not just sapere. Applied to the 32 items previously left unflagged (20 non-sapere modal-discrim + 12 general-discrim). Thread posted v5 close.

New totals:

- Total grammar items: 118 (unchanged)
- Total items carrying `info_display: "suppress"`: **57** (up from 25)
- Marks/credit accounting: 0 mismatches

Corresponding project-wide rule (criterion 15 in AUTHOR_BRIEF Rev 8 + DECISIONS 2026-06-08): discrimination items are suppress-by-default. Extension to be folded into criterion 15 by architect on next pass.

### Open thread state, refreshed

- `Architecture_ImperfectAuthor_chip_suppression.md`: OPEN at v5 (my close), awaiting architect CLOSED stamp.
- `Architecture_ImperfectAuthor_isc_overextension_coverage.md`: OPEN at v1, Next: ImperfectAuthor.
- `Architecture_ImperfectAuthor_vocab_lemma_hygiene.md`: OPEN at v2, Next: ImperfectAuthor.


---

## Update 2026-07-17 (2nd): isc_overextension_coverage v2 applied

Per architect's v1 ruling on `Architecture_ImperfectAuthor_isc_overextension_coverage.md`:

- **10 formation items rewritten** to add a genuine past anchor. Rewrites include the canonical preferire bug (`imp_form_ire_05` now prepends "Da studenti,"). Full list in the thread's v2.
- **5 -isc- retention entries tagged** with the misconception `stem_change.isc_over_extension` (object-form must_not_include). Items: `imp_form_ire_03` (capiscevo, capisceva, capisciva), `imp_form_ire_04` (finiscevamo), `imp_form_ire_05` (preferiscevano).
- **0 present-tense entries removed** because all three -isc- items now carry a strong past anchor.

Grammar total remains 118. Marks/credit accounting 0 mismatches. Thread posted v2 close; awaiting architect CLOSED stamp.


---

## Update 2026-07-17 (3rd): vocab_lemma_hygiene v3 applied

Per architect's v1+v2 ruling on `Architecture_ImperfectAuthor_vocab_lemma_hygiene.md`:

**Vocab lemma-key hygiene + POS migration:**

- 18 unique lemma keys touched across 26 vocab_help bucket refs. Applied Rev 3 §2 conventions plus the migrated `vocabulary.it.<lemma>.<pos>.<aspect>` shape.
- 5 squashed multiwords underscored: `stareper`→`stare_per`, `allimprovviso`→`all_improvviso`, `difila`→`di_fila`, `piutardi`→`piu_tardi`, `cartonianimati`→`cartoni_animati`.
- 1 missing accent: `verita`→`verità`.
- 2 proper nouns (`africa`, `toscana`) kept lowercase-key per Rev 3 rule 2; POS added.
- 2 missing-registry lemmas (`sveglia`, `passeggiata`) verified as canonical; POS added.
- 8 homographs given batch-appropriate POS assignments (`cosa`,`ora`,`dolce` = noun; `alto`,`caldo`,`solo` = adjective; `forte` = adverb; `sotto` = preposition).
- 2 extras outside the worklist (`dirotto`, `fluentemente`) also migrated so the batch is 100% new-shape.

**candidate_tenses / correct_tense on 37 discrimination items:**

Item-level fields added to every `discrimination.*` grammar item (all 37 of my shared-tree items). `candidate_tenses: ["imperfect", "passato_prossimo"]` uniform; `correct_tense` classified per markpoint 0's answer form (20 imperfect, 17 passato_prossimo). Same shape as TenseChoiceAuthor's wave-2 items.

**Batch state after this sitting:**

- Grammar items: 118, Translation items: 54
- Old-shape vocab refs remaining: 0
- `info_display: "suppress"` items: 57
- Discrimination items with `candidate_tenses` + `correct_tense`: 37
- Marks/credit mismatches: 0

One-sitting bundle complete. All three OPEN threads (chip_suppression, isc_overextension_coverage, vocab_lemma_hygiene) posted close-outs; awaiting Architecture CLOSED stamps.


---

## Update 2026-07-21: four-thread sitting (vol_01 + gen_09 + sap_02 + isp_int_03 + criterion 21 + person backfill)

Full sitting completed in one pass covering three inter_chat threads:

**vol_01_prompt_bug v2** — closes 3 items:
- `imp_disc_vol_01` prose fix: `quando fossi cresciuto` → `da grande` (native phrasing; the subjunctive-under-temporal-quando was ungrammatical Italian).
- `imp_disc_gen_09` answer-leak fix: prompt second clause rewritten from `ma era anche affettuoso` to `però anche affettuoso e paziente` (removed the verbatim `era`).
- `imp_disc_sap_02` answer-leak fix: `ma non sapevo come parlartene` → `ma non trovavo il coraggio di parlartene` (removed the verbatim `sapevo`; kept imperfect scaffolding via `trovavo`).

**false_miss_packet v2** — closes 1 item:
- `imp_isp_int_03` blank-boundary: `any_phrases` narrowed from `"stavano per"` to `"stavano"` (with `match_at: word`); must_not similarly narrowed. The prompt-supplied `per` no longer bleeds into the accepted answer, so a correct blank fill (`stavano`) now scores full credit.

**formation_trigger_retrofit v3** — closes 11 items + 52 person backfills:
- Criterion 21 forcing via mechanism (a) named-tense-in-cue on 11 items. Chips gain `imperfetto` or `passato prossimo` (Rev-26 licensed as formation trigger, not crit-13 leak). Same 3 HIGH items (dov_05, vol_02, vol_04) plus 8 normal. No re-home to tense_choice proposed; items are already tense-choice-shaped via existing candidate_tenses/correct_tense/suppress fields.
- Person field backfilled on 52 items (49 single-value derived from answer form, 3 null for multi-blank bg items). Distribution: 15×1sg, 11×3sg, 9×1pl, 9×3pl, 4×2sg, 1×2pl, 3×null.

**Batch state after this sitting:**

- Grammar items: 118, Translation items: 54
- Items with `person` set: 54 (of 118 targeted; the remaining 64 outside architect's commissioned list)
- Items with `info_display: "suppress"`: 57
- Items with `candidate_tenses` + `correct_tense`: 37
- All 118 carry `wrong_answer_is_form_error_only`
- Marks/credit mismatches: 0

All three sitting threads closed on my end; awaiting Architecture CLOSED stamps + DECISIONS discharge stamps on criterion 21 register.


---

## Update 2026-07-21 (second): volume formation wave (+34 items, DISPATCH_volume_formation)

Delivered against Smith's drill-volume ruling per DISPATCH_volume_formation.md. Roughly doubles the basic-tier formation coverage; every regular-class × person cell now has ≥1 item (most have 2+); essere and core stem-expansion irregulars (fare, dire, bere) all reach ≥1 per person.

### New items by leaf

| Leaf | Was | Added | Now | Notes |
|---|---|---|---|---|
| formation.regular_are | 6 | +6 | 12 | Fills 1sg×2, 2sg×2, 3sg×2, 1pl×2, 2pl×2, 3pl×2. A1 core verbs (lavorare, abitare, mangiare, guardare, ascoltare, giocare). |
| formation.regular_ere | 5 | +5 | 10 | Fills 1sg×2, 2sg×2, 3sg×2, 1pl×2, 2pl×1, 3pl×1. Adds credere, ricevere, vendere, perdere, rispondere. |
| formation.regular_ire | 5 | +5 | 10 | Fills 1sg×2, 2sg×1, 3sg×2, 1pl×2, 2pl×1, 3pl×2. Adds partire, offrire, servire, aprire, pulire (pulire chosen deliberately to hit the -isc-drop-in-imperfect point again). |
| irregular.essere | 8 | +8 | 16 | Every person now has ≥2 items (1sg, 2sg, 1pl, 2pl at 2; 3sg, 3pl at 4 including 2 existentials each). |
| stem_expansion.fare | 4 | +4 | 8 | Adds 2sg (facevi) and 2pl (facevate); fac- stem reinforced. |
| stem_expansion.dire | 3 | +3 | 6 | Adds 1sg (dicevo), 2sg (dicevi), 2pl (dicevate); dic- stem reinforced. |
| stem_expansion.bere | 3 | +3 | 6 | Adds 2sg (bevevi), 3sg (beveva), 2pl (bevevate); bev- stem reinforced. |
| stem_expansion.porre | 2 | +0 | 2 | Lower-freq; skipped per dispatch's A1/A2-core steer. |
| stem_expansion.tradurre | 2 | +0 | 2 | Lower-freq; skipped per dispatch's A1/A2-core steer. |

**Formation totals:** was 38 → now 72 (+34). Grammar file total: was 118 → now 152. Translation file untouched.

### Person × class grid (formation only, post-wave)

| Class | 1sg | 2sg | 3sg | 1pl | 2pl | 3pl |
|---|---|---|---|---|---|---|
| regular_are | 2 | 2 | 2 | 2 | 2 | 2 |
| regular_ere | 2 | 2 | 2 | 2 | 1 | 1 |
| regular_ire | 2 | 1 | 2 | 2 | 1 | 2 |
| irregular.essere | 2 | 2 | 4 | 2 | 2 | 4 |
| stem_expansion.fare | 2 | 1 | 2 | 1 | 1 | 1 |
| stem_expansion.dire | 1 | 1 | 1 | 1 | 1 | 1 |
| stem_expansion.bere | 1 | 1 | 1 | 1 | 1 | 1 |

Every non-lower-freq cell green at ≥1; most at ≥2. The mastery floor (two items to green a cell on repeat visit) is met almost everywhere. Only `regular_ere.2pl`, `regular_ere.3pl`, `regular_ire.2sg`, `regular_ire.2pl` and all `stem_expansion.dire/bere` cells sit at exactly 1 — those are candidates for a follow-up top-up wave if Architecture wants.

### Rails compliance (all 34 wave items)

Marker replica ran (strict + folded normalization):
- (a) correct-answer scores full mark: **34/34 PASS** (strict + folded)
- (b) guard-verdict test — no `must_not` string false-credits: **PASS** (0 failures)
- (b2) dead-guard scan — every guard fires as a `miss` when tested standalone: **PASS** (0 dead guards)
- (c) match_at word — target string embedded in a false-positive candidate does NOT credit: **PASS** (0 failures)
- crit-21: every cue names the tense (e.g. `(lavorare, 3sg, imperfetto)`).
- crit-13: chips carry lemma + person + tense-name; never the answer form.
- crit-20 / Rev 29/30: item prompts glossed only where an English or Italian bare fragment would read as the answer — not applied on these formation items because the tense-named cue in Italian is citation form.
- `person` on every item (all 34 finite).
- `wrong_answer_is_form_error_only: true` on every item.
- Rev 27 cross-credit: not applicable to formation drills (single-skill items).

### Batch state after this wave

- Grammar items: 152 (was 118 + 34)
- Translation items: 54 (unchanged)
- Marks/credit mismatches: 0
- Items with `person` set: 88 (54 pre-wave + 34 new)
- Items with `info_display: "suppress"`: 57 (unchanged — formation items default visible)

### Uncertain / borderline

None flagged. All 34 items are drill-style basic-tier formation with a single narrow markpoint; no register calls, no auxiliary-inheritance ambiguities, no `sapessi`-style borderline cases.
