# Coverage: subjunctive (congiuntivo), formation branch

**Dispatch:** Congiuntivo formation (formation branch only, authored in three waves; usage and discrimination are stubs owned by a later CongiuntivoUsage dispatch and by TenseChoice).
**Author:** CongiuntivoFormationAuthor
**Date:** 2026-06-09
**Brief revision applied:** AUTHOR_BRIEF Rev 9.
**This file:** **Wave 1 (present subjunctive) only.** Waves 2 (imperfetto) and 3 (the two compounds) will append to the same output files after this wave is reviewed.

**Wave 1 totals:** 43 grammar questions + 14 translation items (EN→IT only), of which **29 grammar items carry `info_display: "suppress"`** and 14 stay visible (see chip-suppression section). Every active present-subjunctive leaf is covered; no zero-coverage leaves. No new buckets were needed (the dispatch tree already had a leaf for every present-subjunctive distinction), so `bucket_suggestions_verb_form.congiuntivo.json` is an empty array. Two glossary terms are proposed (present subjunctive, suppletive).

All translation items are EN→IT, because the formation buckets are `direction: "production"`: a formation bucket only fires when the learner *produces* the Italian subjunctive form. Every item sits behind a present-tense trigger (penso che, voglio che, spero che, dubito che, è importante che, bisogna che, è bene che, è giusto che, non credo che, sembra che, mi dispiace che, mi auguro che, è strano che, è meglio che) so the subjunctive is contextually required; the trigger is scaffolding, the form is the test. Choosing whether to use the subjunctive is left to the usage/discrimination stubs, out of scope here.

---

## Coverage by leaf (Wave 1, presente)

"G" counts grammar markpoints landing on the leaf; "T" counts translation items naming it as a required bucket. Friendly labels below; the engine id is `verb_form.congiuntivo.formation.presente.<short>`.

| G | T | Leaf (short) | What it tests |
|--:|--:|---|---|
| 6 | 2 | regular_are | The all-identical singular -i; the 3pl -ino vs indicative -ano trap; the voi -iate vs indicative -ate trap |
| 6 | 2 | regular_ere_ire | The singular -a (one set for both classes); the -i-misuse slip (prendi for prenda); the 3pl -ano vs indicative -ono trap |
| 5 | 2 | ire_isc *(hot)* | The -isc- in singular + 3pl (capisca, preferiscano); the noi/voi sleeper where -isc- must NOT appear (capiamo, finiate) |
| 4 | 2 | orthographic | -care/-gare add h (cerchi, paghino); -ciare/-giare drop the i (cominci, mangino) |
| 12 | 3 | irregular_from_1sg *(hot)* | The from-the-1sg derivation (venga, faccia, vada, possa, voglia, dica, esca, tenga); the indicative-3pl trap (vengono for vengano); debba/deva |
| 10 | 3 | irregular_suppletive *(hot)* | The suppletive five (sia, abbia, sappia, dia, stia) across persons; sia and abbia weighted heaviest as the compound auxiliaries |

CEFR spread (item target level): grammar 40 × B1, 3 × B2; translation 13 × B1, 1 × B2. The three B2 grammar items are the two -isc- noi/voi sleepers (capiamo, finiate) and the debba/deva item; the one B2 translation item is the -isc- voi sleeper. This matches the dispatch steer: the present subjunctive is B1-B2 core, weighted most heavily on the from-1sg irregulars and the suppletive five.

### How the hot spots were weighted

- **irregular_from_1sg (12 items)** is the biggest leaf and got the heaviest coverage. The teaching spine, build from the 1sg present indicative, is shown in every explanation (vengo gives venga). High-frequency members covered across singular and plural: venire, fare, andare, potere, volere, dire, uscire, tenere, plus dovere (debba/deva). The signature catch is the indicative 3pl (vengono, vanno, fanno, dicono), held in `must_not_include` on every plural item.
- **irregular_suppletive (10 items)** is weighted toward **sia (3 items) and abbia (3 items)** because they are also the compound auxiliaries that wave 3's passato and trapassato depend on; sapere, dare, stare get one or two each. The defining catch is the indicative (è, ha, sa, dà, sta), with the imperative forms (sii, abbi, sappi) also rejected where they are plausible wrong answers for tu.
- **ire_isc** pairs the change-applies forms (capisca, finisca, preferiscano) with the **noi/voi sleeper** (capiamo, finiate) where the insert must NOT appear; the over-extensions (capisciamo, finisciate) sit in `must_not_include`. This is the "produces the change" vs "must not over-apply the change" pairing the present-indicative dispatch also used.
- **The 3pl cross-class confusion** is tested in both directions: -are items reject the indicative -ano (parlano, aspettano) in favour of -ino, and -ere/-ire items reject the indicative -ono (partono, preferiscono) in favour of -ano.

---

## Chip / breadcrumb suppression (`info_display: "suppress"`)

29 of 43 grammar items carry `info_display: "suppress"`; 14 stay visible. The rule applied is criterion 15's leak-vs-trap test.

**Suppressed (29)** — the breadcrumb would name a non-derivable class or a rule-output the item tests:

| Leaf | Suppressed | Why |
|---|--:|---|
| ire_isc (insert forms) | 3 | "-ire with -isc-" hands over the -isc- membership, which the -ire infinitive does not reveal |
| orthographic | 4 | breadcrumb names the rule-output ("add h", "drop the i"), which is the skill |
| irregular_from_1sg | 12 | breadcrumb names the from-1sg class, not derivable from the infinitive |
| irregular_suppletive | 10 | suppletive forms are non-derivable by definition; the breadcrumb would hand over the answer-class |

**Visible (14)** — the breadcrumb only restates the cue, or naming the class sets a productive trap:

| Leaf | Visible | Why |
|---|--:|---|
| regular_are | 6 | breadcrumb names the ending, but the -are infinitive in the cue already shows the class (criterion 15 "restates the cue") |
| regular_ere_ire | 6 | same: the -ere/-ire infinitive in the cue shows the class; the 3pl partano item is visible too, for consistency with its siblings |
| ire_isc (noi/voi sleeper) | 2 | naming the -isc- class here *tempts* the catchable over-extension (capisciamo, finisciate) that `must_not_include` catches — a productive trap, not a leak |

Within the single `ire_isc` leaf the flag is set per item, exactly as Rev 8 intends: the insert-applies forms are suppressed while the revert/over-extension forms stay visible.

---

## Items flagged uncertain (for the project author to rule on)

1. **debba / deva (dovere singular subjunctive). RULED 2026-06-09 (Smith):** keep the 1.0/0.9 split as authored (debba 1.0, deva 0.9), open to an Architecture overrule if there is a subtlety being missed. The cross-tree consistency question (the present-indicative tree carries a parallel debbo/devo flag) is raised to Architecture in `inter_chat/Architecture_CongiuntivoFormationAuthor_dovere_variant_policy.md` so the two trees land on one policy. No content change needed; this item is closed pending any Architecture revision.

2. **Archaic sieno (essere 3pl).** I rejected the archaic `sieno` via `must_not_include` on `cong_pres_supp_essere_3pl_01`, treating it as a wrong form rather than a graded variant. It is genuinely archaic/literary and out of scope for a B1-B2 formation drill, but flag if you would rather it be accepted as a low-credit variant (consistent with how the passato chat handled veduto).

3. **Manifest registration (action needed, not mine to do).** `verb_form.congiuntivo` is **not yet in `data/manifest.json`**, so the housing will not load these files even though they now exist. Adding the topic is housing/architecture territory (per the stay-in-role boundary), so I have not edited the manifest. **Please route to the Housing or Architecture chat:** add `"verb_form.congiuntivo"` to the `topics` array in `data/manifest.json`. The curriculum-order question (where the subjunctive sits relative to the indicative trees) is already an open Housing thread (`Architecture_Housing_curriculum_order_new_trees.md`); this registration belongs with it.

4. **Trigger variety vs the usage boundary. CONFIRMED 2026-06-09 (Smith):** requiring the subjunctive on formation items (by always supplying a trigger) is the intended design. It keeps the formation diagnostic clean and avoids the can't-form vs didn't-realise-it-was-subjunctive attribution problem, which is usage's concern, not formation's. I deliberately did NOT vary triggers as a *test* (that would be discrimination). If the usage author later wants a canonical trigger inventory, the set I used (listed in the intro above) is a reasonable starting catalogue; it is not meant to be exhaustive or authoritative.

   **Note for the usage author:** Smith's steer is that usage can reuse many of these formation questions *with the trigger stripped out*, accepting the misattribution (a miss might be "didn't realise the subjunctive was wanted" rather than "couldn't form it"). That is a legitimate trade usage can make; the formation versions keep the trigger precisely so formation misses are unambiguous.

5. **Subject-pronoun-dropped vs included in translation references.** As in sibling trees, I gave both the pro-drop form (the natural default) and the subject-pronoun-included form as neutral references where relevant. The AI marker should credit either. No ruling needed unless you want a single canonical reference per item.

---

## Notes for waves 2 and 3 (so the next sub-batch stays consistent)

- **External-id scheme.** Wave 1 uses `cong_pres_<leaf>_<verb>_<person>_NN`. Wave 2 will use `cong_imp_...` (imperfetto) and wave 3 `cong_pass_...` / `cong_trap_...`. Translation ids: `trans_cong_en_it_<leaf>_NN`, continuing the ordinals.
- **Imperfetto (wave 2)** leans on the same-stem-as-the-imperfect-indicative simplifier (facevo gives facessi) and the obligatory double s (parlassi, not parlasi). The 1sg/2sg are identical (parlassi), so the person stays load-bearing on those, same as the present's identical singulars; supply it via an explicit subject or the cue.
- **Compounds (wave 3)** are where the auxiliary is itself subjunctive: passato uses the *present* subjunctive of the aux (abbia/sia parlato), trapassato the *imperfect* subjunctive of the aux (avessi/fossi parlato). The defining catch is an indicative auxiliary (ha parlato for abbia parlato). With sia/fosse the participle agrees with the subject, which per criterion 8 may warrant a second markpoint (one for the subjunctive auxiliary, one for participle agreement); I will note the choice per item when I get there.
- **Suppletive auxiliaries already seeded.** sia and abbia are heavily covered in wave 1, which is deliberate: wave 3's compounds reuse them, so the learner meets them as standalone forms first.

---

## Validation (recounted directly from the JSON, not from memory)

- Grammar items: 43. Translation items: 14. Bucket suggestions: 0. Glossary suggestions: 2.
- `info_display: "suppress"`: 29 grammar items (ire_isc 3, orthographic 4, irregular_from_1sg 12, irregular_suppletive 10); 14 visible.
- Every `bucket` / `required_bucket` referenced resolves to an existing leaf in `data/buckets/verb_form.congiuntivo.json` (the six present-subjunctive leaves). No forward-references outside the tree were needed.
- `marks` equals the sum of markpoint `credit` on every item (all single-markpoint, marks = 1.0).
- External ids are unique within each file; no prompt names the diagnostic rule (no "subjunctive/congiuntivo/indicative/from the 1sg/suppletive" in any prompt string).
- Files were rewritten atomically to clear the FUSE NUL-padding artefact noted in the Housing atomic-write thread.
