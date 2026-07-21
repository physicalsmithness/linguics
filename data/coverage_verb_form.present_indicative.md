# Coverage: present indicative, formation branch

**Dispatch:** PresentFormation (formation branch only; usage and discrimination left as stubs for later dispatches).
**Author:** PresentFormationAuthor
**Date:** 2026-06-08
**Brief revision applied:** AUTHOR_BRIEF Rev 7.

**Totals:** 91 grammar questions + 32 translation items (EN→IT only), of which **28 grammar items carry `info_display: "suppress"`** (see chip-suppression section). Every active formation leaf is covered; no zero-coverage leaves. No new buckets were needed (the dispatch tree already had a leaf for every formation distinction I authored against), so `bucket_suggestions_verb_form.present_indicative.json` is empty. Three glossary terms are proposed.

All translation items are EN→IT, because the formation buckets are `direction: "production"` and the marker drops production-only buckets on IT→EN items: only when the learner *produces* the Italian present form does a formation bucket fire.

---

## Coverage by leaf

The "G" column counts grammar markpoints landing on the leaf; "T" counts translation items naming it as a required bucket. Friendly labels below; the engine id is `verb_form.present_indicative.formation.<short>`.

| G | T | Leaf (short) | What it tests |
|--:|--:|---|---|
| 6 | 2 | regular_are | First-conjugation endings, all six persons; the 3pl -ano stress trap |
| 6 | 2 | regular_ere | Second-conjugation endings; the 3sg -e and the 3pl -ono vs -ano slip |
| 5 | 1 | regular_ire | Plain third conjugation; guards against spurious -isc- |
| 9 | 3 | ire_isc *(hot)* | The -isc- four corners AND the noi/voi sleeper where -isc- must NOT appear |
| 5 | 1 | orthographic.care_gare | h-insertion in 2sg/1pl (cerchi, paghiamo); plus an over-application guard (cerco, no h) |
| 5 | 1 | orthographic.ciare_giare | i-drop in 2sg/1pl (cominci, mangiamo); plus the i-kept guard (mangio) |
| 3 | 1 | orthographic.iare_stress | studi (unstressed merges) vs invii / scii (stressed kept) |
| 6 | 2 | irregular.essere *(hot)* | Suppletive paradigm; the è-vs-e accent trap; 1sg=3pl sono |
| 6 | 3 | irregular.avere *(hot)* | Silent-h forms (ho/hai/ha/hanno) and the no-h forms (abbiamo/avete) |
| 9 | 3 | irregular.monosyllabic_core *(hot)* | vado, do/dà, sto, so, faccio across persons; the dà accent |
| 3 | 1 | irregular.dire | dic- stem; the contracted 2pl dite |
| 3 | 1 | irregular.bere | bev- stem expansion across the paradigm |
| 6 | 2 | irregular.go_verbs | -g- insert in 1sg/3pl (vengo, salgono) and its absence in noi (veniamo) |
| 6 | 2 | irregular.dittongo | u→e / e→ie / o→uo shifts in stressed forms and their reversion in noi |
| 7 | 4 | modal_verbs *(hot)* | devo, posso, puoi, può, voglio, vogliono, dobbiamo; the può accent |
| 6 | 3 | reflexive_assembly *(hot)* | Pronoun-plus-verb agreement (mi chiamo … si lavano) across all persons |

CEFR spread (item target level): grammar 45 × A1, 36 × A2, 10 × B1; translation 17 × A1, 13 × A2, 2 × B1. This matches the dispatch's steer: the present is the base tense, so the bulk sits at A1–A2 core, with the subtle edges (iare_stress, the lower-frequency go/dittongo members, sedere/morire/rimanere) carried at B1.

### How the hot spots were weighted

- **The -isc- sleeper.** Of the nine -isc- grammar items, three deliberately test the **noi/voi** forms where the insert must NOT appear (capiamo, finite, preferiamo), with the over-extended wrong forms (capisciamo, finiscite, preferisciamo) in `must_not_include`. The other six test the four-corner -isc- forms. This is the "produces the change" vs "must not over-apply the change" pairing the dispatch asked for.
- **go_verbs and dittongo** likewise pair the change-applies forms (vengo, escono) with the reverting forms (veniamo, usciamo, sediamo), since "esciamo for usciamo" and "vengiamo for veniamo" are the high-frequency misses.
- **Accent traps** are authored as spelling-meaning errors: è / dà / può are accepted, and the bare or wrong-accent forms (e, da, puo, pò) sit in `must_not_include`. Same for avere's silent h (ho accepted, o rejected). An `examiner_note` flags each accent-bearing item as load-bearing.
- **The 3pl cross-class confusion** (-ano vs -ono) is tested in both directions: -are items reject -ono (lavorono) and -ere/-ire items reject -ano (prendano, partano).

---

## Items flagged uncertain (for the project author to rule on)

1. **debbo / devo (dovere 1sg), and debbono / devono (3pl).** Item `pres_irr_modal_dovere_1sg_01` accepts both `devo` and `debbo` at full credit (debbo carried as a graded `any_phrases` object with a register note). Both are fully standard; debbo is more formal/literary and now somewhat dated in speech. I did **not** add a separate debbo item or accept debbo on the 3pl item (which only tests devono → dobbiamo is 1pl, so this is moot there). **Ruling wanted:** is full credit for debbo the house policy, or should debbo be graded below 1.0, or excluded as too dated for an A1 learner?

2. **bicicletta / bici.** `trans_pres_en_it_mono_01` accepts both the full `bicicletta` and the clipped `bici` in references; the vocab_help reveals "bici / bicicletta". The formation skill (vado) is unaffected either way, so I left both. Flag only if you want clipped colloquial forms excluded from reference translations as a matter of policy.

3. **siedo / seggo (sedere 1sg).** I authored only `siedo`. The alternative `seggo` exists but is markedly literary/archaic; I judged it out of scope for an A2–B1 formation drill and did not add it to `any_phrases`. Flag if you want it accepted as a graded variant.

4. **Subject-pronoun-dropped vs included in translation references.** Throughout, I gave both the pro-drop form (the natural default) and the subject-pronoun-included form as neutral reference translations. The AI marker should credit either. No ruling needed unless you want a single canonical reference per item.

---

## Chip suppression (`info_display: "suppress"`)

A class of formation buckets has a name that, if shown in the pre-answer breadcrumb / info chip, leaks the very per-verb class membership the item is testing: the -isc- bucket tells the learner the verb takes -isc-, the -go bucket tells them it inserts -g-, the dittongo bucket tells them the stem vowel shifts, the non-isc -ire bucket tells them it does *not* take -isc-, and the orthographic buckets name the spelling rule to apply. This is the bucket-name-leak pattern the ImperfectAuthor surfaced (`Architecture_ImperfectAuthor_chip_suppression.md`), with the leak-vs-trap refinement worked out in `inter_chat/Architecture_PresentFormationAuthor_breadcrumb_leak.md` (Architecture ruling v2, **CLOSED**).

The flag is applied **per item, not per leaf**, using a leak-vs-trap test: suppress where the breadcrumb hands over the answer (the change-applies forms — capisco, vengo, esco, cerchi, mangi, invii); leave visible where the *same* breadcrumb tempts a wrong answer the `must_not_include` already catches (the reverting / over-extension forms — capiamo, veniamo, usciamo, cerco, mangio, studi). The flag is display-only; engine marking is unchanged.

**28 grammar items suppressed**, by leaf: ire_isc 6, regular_ire 3, go_verbs 5, dittongo 4, care_gare 4, ciare_giare 4, iare_stress 2. The 11 reverting / guard items stay visible. iare_stress splits 2-suppressed (invii, scii: answer keeps the i, so naming the rule is a leak) / 1-visible (studi: answer drops the i, so the rule-name tempts the catchable *studii*). Full item lists are in the thread's v3 section.

This convention is now **criterion 15 in AUTHOR_BRIEF Revision 8** (Architecture, 2026-06-08), so later dispatches inherit it.

---

## Cue economy (person dropped where the subject is supplied)

Per `inter_chat/Architecture_PresentFormationAuthor_cue_person_redundancy.md` (CLOSED) and AUTHOR_BRIEF criterion 13 cue-economy note (Rev 9): the cue parenthetical names the person only when the prompt does not already supply the subject. **75 items** drop the person (67 with an explicit subject pronoun, 8 with an unambiguous nominal subject); **16 pro-drop items** keep it (no surface subject, so the person is the only thing fixing the wanted form). The verb stays in every cue; marking is unaffected (the cue is not matched). Three kept-cued items lean on the cue to exclude a competing reading (aprire 2pl, cominciare 2sg, svegliarsi 2sg); see the thread.

## Update 2026-07-17: Rev 25 cue-level retrofit + sedere reword

Thread: `inter_chat/Architecture_PresentFormationAuthor_rev25_and_stamps.md`.

**Rev 25** conditions criterion 20's citation-form exemption on LEVEL. Audit of all 91 cues found **6** whose cue is a lemma-with-attached-clitic (the `esserci` shape): `chiamarsi`, `svegliarsi`, `lavarsi` ×2, `alzarsi` (A1) and `vestirsi` (A2). Smith ruled: gloss all six. They now carry a bracketed English target and `prompt_supplies_base_form: false`. The other 85 cue a plain infinitive to conjugate — the honest operand, still exempt.

Two authoring notes worth keeping for anyone glossing reflexives:

- The gloss must **pin the reflexive**. A bare `[washes]` on `pres_refl_lavarsi_3sg_01` would invite `lava`, which is that item's own guard — luring the learner into the miss and misdiagnosing it as failed reflexive assembly. Hence `[washes her own hands]`, `[wash themselves]`.
- The Italian `-si` lemma left `vocab_help` (a button label re-leaks what the gloss removed) and returned keyed on the English gloss word (`lemma: "wake up"`, `language: "en"`, reveal `to wake up - svegliarsi`). Without that, a learner who doesn't know the verb takes a **reflexive_assembly** miss for a **vocabulary** gap. Glossing moves knowledge out of the prompt; `vocab_help` is where it has to land.

**Cr17Sweep observation actioned**: `pres_irr_ditt_sedere_1pl_01` reworded from "Noi sediamo in giardino a chiacchierare" (an action, which pulls Italian to `ci sediamo`) to **"Noi sediamo sempre in prima fila."** — the stative frame the accepted 1sg item uses, so the pair now differs only in person.

**Criterion 17**: discharged for this topic by Cr17Sweep (all 91 bare items glossed, marker replica identical, zero marking deltas). **Criterion 13**: self-audit run, 91 prompts, zero rule-naming hits. Both awaiting Architecture stamps; seats do not stamp themselves.

## Update 2026-07-20: criterion-21 retrofit + lemma-retrieval pilot taster

Threads: `Architecture_PresentFormationAuthor_formation_trigger_retrofit.md` (v2, delivered) and `Architecture_PresentFormationAuthor_lemma_retrieval_pilot.md` (v2, taster).

**Criterion 21 (Rev 28) — 7 items reframed.** All 7 flagged in AUDIT_formation_trigger_2026-07-19 carried a smuggled future adverb (domani/stasera) where the futuro competes. Fixed by frame-strengthening: the adverb swapped for a present-time / habitual frame (Ogni anno, di solito, sempre, il sabato, ogni sera, adesso). `prompt_supplies_base_form` now honestly true; crit-19 re-checked clean (no accented answers); marking byte-identical. Items: partire_3pl, fare_2pl, venire_3pl, rimanere_1sg, dovere_1sg, dovere_1pl, avere_2pl.

**Lemma-retrieval pilot (Smith's proposal, option a) — 3-item taster added.** New `pres_lr_*` items (`provenance: lemma_retrieval_pilot`): the cue is an English meaning with a bracketed tense frame instead of the Italian infinitive, so the learner retrieves the verb as well as conjugates it. Two co-crediting markpoints per Rev 27 (formation 0.5 + `vocabulary.it.<lemma>.verb.translation` 0.5, the latter matching the verb stem so a right-verb/wrong-person answer still ticks vocabulary). One item (alzarsi) carries a competitor guard (mi sveglio graded 0.5 + steer) for the get-up/wake-up ambiguity. Held at 3 pending Smith's feel-judgment and one replica check on weight composition; full ~15 in v3. Total item count now 106 grammar (91 original + 12 PresentUsage + 3 pilot).

**Pilot v2 (2026-07-21):** Smith picked option A but fuller — the cue is the whole English sentence with the tense in parentheses ("We speak Italian at home (as a habit)"), learner fills only the verb. The 3-item taster is replaced by a 12-item tranche (4 with a plausible rival verb: sapere/conoscere, guardare/vedere, partire/lasciare, alzarsi/svegliarsi). Two design points from Smith, both actioned: (i) the help offer must be loud — each item carries `retrieval_help_lemma` + an infinitive reveal, and Housing is asked to render a prominent "Don't know the word? → parlare" affordance (`Architecture_Housing_retrieval_help_affordance.md`); (ii) never mark formation wrong when the learner picked a different valid verb — competitor guards handle anticipated rivals, and the harder general case (an unanticipated wrong verb must not log a formation miss) is routed to Architecture/Housing as an engine question. Total now 115 grammar (91 + 12 PresentUsage + 12 pilot). Preview for Smith: `pilot_preview.html`.

Item count note: the 91 formation + 32 translation batch is unchanged in scope; the pilot adds 3 experimental items on top, not yet part of the accepted coverage.

## Volume wave (DISPATCH_volume_formation, 2026-07-21)

Fluency-rep wave: basic high-frequency formation items filling the person×class grid so every band can green on repeat visits. Standard handed-cue shape (fast reps; retrieval is a separate strand). Every finite formation item now carries `person`.

**Wave 1 (+18):** regular_are +6 (lavorare, portare, tornare, arrivare, cantare, abitare), regular_ere +5 (vedere, mettere, chiudere, chiedere, rispondere), regular_ire +3 (aprire, offrire, sentire), ire_isc +2 (pulire 1pl, capire 2pl — noi/voi sleeper), reflexive +2 (svegliarsi 1sg, vestirsi 3sg). Plus `person` backfilled on the 12 pilot items. Formation 91 → 121. Gates: match_at word (crit 18), present-time frames (crit 21), crit-17 glosses, person field. Delivery: `Architecture_PresentFormationAuthor_volume_wave.md`.

Remaining to ~double basic tier: Wave 2 (irregular person-band depth — bere/dire/dittongo/go_verbs/monosyllabic/modals), Wave 3 (regular-class breadth). Non-diagnostic slots (care_gare/ciare_giare beyond 2sg/1pl; iare_stress beyond 2sg) not padded. Possible crit-21 straggler flagged to Architecture: potere_3sg "stasera".

## Notes for later dispatches

- **PresentUsage** (the `verb_form.present_indicative.usage` stub) will own: habitual / gnomic / now readings, present-for-near-future, historic present, polite/performative uses, impersonal `si`, and the `stare + gerundio` progressive (which cross-references the gerundio tree). None authored here.
- **TenseChoice** owns the three discrimination stubs (vs imperfect / future / passato prossimo). The `vs_future` leaf forward-references `verb_form.future`, which does not exist yet (FutureAuthor dispatch is next); that reference is intentional.
- **Cross-tree stems.** bere's bev- and dire's dic- present stems are the same expansions that drive their imperfect and participles; the imperfect tree already has the parallel branch. I mention the connection in the bere/dire explanations but author only the present forms here.
- **Reflexive scope.** Reflexive items fix the subject and test the present-tense pronoun-plus-verb assembly only. Clitic attachment to infinitives / gerunds / imperatives belongs to the pronoun tree, not here.
