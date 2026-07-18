# Coverage: subjunctive (congiuntivo), formation branch

**Dispatch:** Congiuntivo formation (formation branch only, authored in three waves; usage and discrimination are stubs owned by a later CongiuntivoUsage dispatch and by TenseChoice).
**Author:** CongiuntivoFormationAuthor
**Date:** wave 1 2026-06-09; waves 2 and 3 2026-07-18.
**Brief revision applied:** wave 1 authored at Rev 9; waves 2 and 3 at Rev 25.
**This file:** **ALL THREE WAVES DELIVERED.** Presente (wave 1), imperfetto (wave 2), and the two compounds (wave 3). The formation branch is complete: every active leaf is covered, no zero-coverage leaves.
**Brief revision at wave 2:** Rev 25 (wave 2 authored natively against criteria 17-20; wave 1 was authored at Rev 9 and brought up by later central passes).

**Final totals: 75 grammar questions + 26 translation items** (EN→IT only). Wave 1 (presente): 43 grammar + 14 translation, 29 suppressed / 14 visible. Wave 2 (imperfetto): 16 grammar + 6 translation, 8 suppressed / 8 visible. Wave 3 (compounds): 16 grammar + 6 translation, all 16 suppressed. **53 of 75 grammar items carry `info_display: "suppress"`.** Every active formation leaf across all three waves is covered; no zero-coverage leaves. No new buckets were needed in any wave (the dispatch tree already had a leaf for every distinction authored), so `bucket_suggestions_verb_form.congiuntivo.json` is an empty array. Two glossary terms are proposed (present subjunctive, suppletive), both from wave 1.

All translation items are EN→IT, because the formation buckets are `direction: "production"`: a formation bucket only fires when the learner *produces* the Italian subjunctive form. Every item sits behind a trigger so the subjunctive is contextually required; the trigger is scaffolding, the form is the test. Wave 1 (presente) uses present-tense triggers (penso che, voglio che, spero che, dubito che, è importante che, bisogna che, non credo che, sembra che, mi dispiace che, è strano che). Wave 2 (imperfetto) uses the past and conditional triggers that select it (pensavo che, volevo che, speravo che, non credevo che, bisognava che, era meglio che, vorrei che, and the unreal se-clause). Wave 3 (compounds) uses a present trigger for the passato (penso che, credo che, spero che, mi dispiace che) and a past trigger or unreal past se-clause for the trapassato (pensavo che, credevo che, non sapevo che, se avessi/fosse). Choosing whether to use the subjunctive is left to the usage/discrimination stubs, out of scope here.

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

## Coverage by leaf (Wave 2, imperfetto)

Added 2026-07-18. Engine id is `verb_form.congiuntivo.formation.imperfetto.<short>`.

| G | T | Leaf (short) | What it tests |
|--:|--:|---|---|
| 8 | 3 | regular | -assi / -essi / -issi across all six persons; the obligatory double s (parlasi is the spelling slip); the class vowel (prendasse for prendesse); the imperfect-indicative trap (parlava); the 2pl single-s exception (parlaste) |
| 8 | 3 | irregular *(hot)* | essere (fossi / fosse / fossero), the only non-derivable set; the stem-expansion group facesse / dicesse / desse / stesse / bevesse; the passato-remoto trap (disse, diede, bevve) |

CEFR spread (wave 2): grammar 13 × B2, 3 × B1; translation 5 × B2, 1 × B1. The B1 items are the two `se`-counterfactual set pieces (se avessi, se fossi in te) plus their translation, which learners meet early as whole phrases.

### How wave 2 was weighted

- **The two simplifiers are the teaching spine.** Every irregular explanation routes through the imperfect indicative: fare gives facevo, so facessi/facesse; dire gives dicevo, so dicesse; bere gives bevevo, so bevesse. If the learner knows the imperfect indicative stem, they can build the imperfect subjunctive. Only essere (fossi) must be learned outright, and only dare/stare contract (desse, stesse).
- **The double s is the signature spelling miss**, so the single-s form (parlasi, scrivesi, dormisero) sits in `must_not_include` on the regular items. The **2pl is the one person without it** (parlaste), and that item makes the exception the test, rejecting the over-applied parlassete.
- **The imperfect indicative is the defining wrong tense** (parlava, faceva, era, stava), guarded on every item, mirroring how wave 1 guards the present indicative.
- **The passato remoto is a second, subtler trap** on the irregular leaf: a learner reaching for "some past form" produces disse / diede / bevve / stette. Guarded where plausible.
- **se avessi / se fossi in te** are carried deliberately at B1: the unreal if-clause is where a B1 learner first *needs* the imperfect subjunctive, and the "se avrei" error (conditional in the if-clause) is the signature miss. The counterfactual RULE belongs to usage; these items supply the frame and test only the form.

### Chip suppression, wave 2

| Leaf | Flag | Why |
|---|---|---|
| regular (8) | visible | The breadcrumb names the -assi/-essi/-issi endings, but the cue's infinitive already shows the conjugation class, so it restates the cue (criterion 15) |
| irregular (8) | **suppress** | The breadcrumb names essere's non-derivable set and the stem-expansion pattern, neither recoverable from the infinitive |

### Verification (wave 2, real engine in node)

Run against `housing/js/norm.js` + `grammar_engine.js`:

- 16/16 wave-2 correct answers credited (`hit`).
- **48/48 `must_not_include` guards reject correctly** — no dead guards, no false credits. (Positives carry per-phrase `match_at: "word"` from authoring, so no guard is shadowed by a nested positive.)
- Whole-file regression: 59/59 correct answers still credited across waves 1+2.
- All buckets resolve; no duplicate external_ids; `marks` equals sum of markpoint credit on every item.
- Accent audit: 9 defects (piu / cosi / gia) caught and fixed before delivery. No wave-2 correct answer carries an accent, so criterion 19 (`accent_load_bearing`) remains N/A.

### Wave 2 notes / nothing flagged uncertain

No new buckets needed (the tree's two imperfetto leaves covered every distinction), so `bucket_suggestions` stays empty. No new glossary terms proposed: the wave-1 proposals (present subjunctive, suppletive) plus the existing "imperfect indicative" and "stem expansion" entries carry wave 2. **Possible term for Architecture's call:** "imperfect subjunctive" as a sibling to the proposed "present subjunctive" — I did not add it, since the wave-1 "present subjunctive" entry already contrasts the two. Flag if you want it split out.

## Status: formation branch COMPLETE

All three waves delivered (75 grammar + 26 translation). Every active formation leaf is covered; no zero-coverage leaves:

| Leaf | Items |
|---|--:|
| presente.regular_are / regular_ere_ire / ire_isc / orthographic / irregular_from_1sg / irregular_suppletive | 6 / 6 / 5 / 4 / 12 / 10 |
| imperfetto.regular / irregular | 8 / 8 |
| passato / trapassato | 8 / 8 |

Usage and discrimination remain stubs, owned by a later CongiuntivoUsage dispatch and by TenseChoice — untouched here, as the dispatch scoped.

---

## Coverage by leaf (Wave 3, the compounds)

Added 2026-07-18. Engine ids `verb_form.congiuntivo.formation.passato` / `.trapassato`.

| G | T | Leaf | What it tests |
|--:|--:|---|---|
| 8 | 3 | passato | The auxiliary in the PRESENT subjunctive (abbia / sia parlato); the indicative-auxiliary miss (ha parlato); participle agreement under essere; the avere no-agreement trap (abbia mangiata) |
| 8 | 3 | trapassato | The auxiliary in the IMPERFECT subjunctive (avessi / fossi parlato); the indicative-auxiliary miss (aveva parlato); the unreal past if-clause (se avessi saputo) and its "se avrei" error |

CEFR: all 16 grammar at B2, all 6 translation at B2. Both leaves are B2 (trapassato B2-C1) per the tree.

### Criterion 8: the two-markpoint decision (noted as the dispatch asked)

The compounds are the first items in this tree where the answer combines **two distinct skills**: the auxiliary must be subjunctive, and the participle must be correctly formed and (under essere) agree. I split them by where the blank falls:

- **Aux-only blank** — the prompt supplies the participle ("Penso che Marco ____ parlato con lei"). **One markpoint**: the single skill is "the auxiliary is subjunctive". 3 items.
- **Full-compound blank** — the learner produces both words. **Two markpoints**, marks = 2: one on the congiuntivo compound leaf for the auxiliary, one **cross-referencing the passato prossimo tree**, which owns participle form and agreement. 13 items.

This buys real diagnostic decomposition, verified on the engine:

| Attempt | Score | Attribution |
|---|--:|---|
| `hanno detto` (indicative aux, right participle) | 1/2 | auxiliary **miss**, participle **hit** |
| `era uscita` (indicative aux, right agreement) | 1/2 | auxiliary **miss**, agreement **hit** |
| `abbia mangiata` (right aux, over-applied agreement) | 1/2 | auxiliary **hit**, agreement **miss** |

A learner who knows the participle but not that the auxiliary goes subjunctive gets exactly that picture, rather than a single "Wrong".

### How wave 3 was weighted

- **The defining miss is an indicative auxiliary**, guarded on every item: `ha`/`hanno`/`è`/`sono` for the passato, `aveva`/`avevano`/`era`/`erano` for the trapassato.
- **The avere no-agreement trap.** "Credo che Anna abbia mangiato tutta la torta" — with avere the participle does NOT agree with the feminine subject, so `mangiata` is the over-application and sits in `must_not_include`. The mirror of the essere-agreement items.
- **The unreal past if-clause** (se avessi saputo / se fosse stato) carries the trapassato's highest-frequency use, with the "se avrei" conditional-in-the-if-clause error guarded. As in wave 2, the counterfactual RULE is usage's; these items supply the frame and test only the form.
- **The auxiliaries were pre-seeded on purpose**: sia/abbia drilled heavily in wave 1, avessi/fossi in wave 2, so wave 3 asks the learner to combine forms they have already met rather than meet them for the first time inside a compound.
- **`fosse stato`** covers essere's own compound (essere takes essere).

### Chip suppression, wave 3: all 16 suppressed — and why that is a finding

Every wave-3 item carries `info_display: "suppress"`, because **the two compound leaf labels embed the worked answer**:

> `Congiuntivo passato (compound): che io abbia parlato, che lei sia andata`
> `Congiuntivo trapassato (compound): che io avessi parlato, che lei fosse andata`

A learner shown that breadcrumb pre-answer has been handed `abbia parlato` verbatim. Suppression is the correct criterion-15 response, but the underlying defect is the **label**, not the item: this violates the breadcrumb-hygiene ruling (DECISIONS 2026-07-12, "leaf labels stay terse; worked examples go in description"), which was applied to the trapassato_prossimo and imperativo leaves but **missed the congiuntivo compound leaves**. Bucket labels are Architecture's to edit, so I have flagged it rather than changed it — see `inter_chat/Architecture_CongiuntivoFormationAuthor_compound_leaf_label_hygiene.md`. Once the labels are terse, some of these 16 could revert to visible.

### Verification (wave 3, real engine in node)

- 16/16 full correct answers score **full marks** (2/2 on the two-markpoint items).
- **67/67 guards reject correctly**, checked per-markpoint.
- Decomposition probes behave as tabled above.
- `veduto` graded 0.8 on the vedere item (1.8/2), following the passato prossimo tree's precedent.
- Whole-file regression: **75/75** items award full marks on their correct answer.
- All cross-tree participle buckets resolve against the real `verb_form.passato_prossimo` tree. No unknown buckets anywhere.

### Wave 3 flagged uncertain

1. **`veduto` at 0.8, not 0.9.** DECISIONS 2026-07-12 puts a *secondary standard* variant at 0.9 and says archaic variants are "rejected or scored low". veduto is archaic, so 0.8 mirrors the passato prossimo tree rather than the 0.9 tier. **Ruling wanted** if you'd rather archaic variants take a single estate-wide number.
2. **Participle markpoints cite the passato prossimo tree.** This is deliberate (that tree owns participle form/agreement) and the brief permits forward references, but it means a congiuntivo item can register a miss against a passato_prossimo bucket. Flag if you'd rather compound misses stay inside the congiuntivo tree.

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
- **Imperfetto (wave 2) — DELIVERED 2026-07-18.** As planned, it leans on the same-stem-as-the-imperfect-indicative simplifier (facevo gives facessi) and the obligatory double s (parlassi, not parlasi). The 1sg/2sg are identical (parlassi), so the person stays load-bearing on those, same as the present's identical singulars; supply it via an explicit subject or the cue.
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
