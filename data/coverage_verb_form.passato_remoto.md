# Coverage: passato remoto, formation branch

**Dispatch:** PassatoRemotoFormation (formation branch only; usage and discrimination left as stubs for later dispatches). This is the last formation dispatch, so the tense/mood formation system is now complete.
**Author:** PassatoRemotoFormationAuthor
**Date:** 2026-06-09
**Brief revision applied:** AUTHOR_BRIEF Rev 9.

**Totals:** 39 grammar questions + 13 translation items (EN→IT only), of which **21 grammar items carry `info_display: "suppress"`** (see chip-suppression section). Every active formation leaf is covered; no zero-coverage leaves. The usage and discrimination branches were left untouched (they are stubs owned by a later PassatoRemotoUsage dispatch and by TenseChoice). No new buckets were needed, so `bucket_suggestions_verb_form.passato_remoto.json` is empty. Three glossary terms are proposed.

The volume is deliberately **lighter** than the core-tense batches (future was 50+19, the imperfect far more), per the dispatch: the passato remoto is a recognition-primary, low-frequency-production tree (B2 to read, C1 to produce). The weight sits where a reader actually meets the forms, on the strong 1-3-3 -ere class and the high-frequency suppletives.

All translation items are EN→IT, because the formation buckets are `direction: "production"`: a formation bucket fires only when the learner *produces* the Italian form. The valuable recognition items (IT→EN, "what verb is `prese`?") belong to the later usage/recognition phase and are not authored here.

---

## Coverage by leaf

The "G" column counts grammar markpoints landing on the leaf; "T" counts translation items naming it as a required bucket. Friendly labels below; the engine id is `verb_form.passato_remoto.formation.<short>`.

| G | T | Leaf (short) | What it tests |
|--:|--:|---|---|
| 4 | 1 | regular_are | The tidy -ai/-asti/-ò/-ammo/-aste/-arono set; the obligatory 3sg accent (parlò vs parlo); the double-m 1pl (mangiammo vs mangiamo); the clipped 3pl (arrivarno) |
| 4 | 1 | regular_ere *(dual)* | Both accepted patterns at full credit: credei *or* credetti, credé *or* credette, temerono *or* temettero; guards against borrowing the -ire shape (credii) |
| 3 | 1 | regular_ire | The double-i 1sg (dormii vs dormi); the 3sg accent (dormì); no -isc- in the past (capimmo, never capiscemmo) |
| 14 | 4 | irregular_strong_ere *(hot)* | The 1-3-3 alternation across prendere, scrivere, vedere, mettere, chiedere, leggere, vivere, venire. **Both sides authored:** strong persons (presi, prese, presero, scrissi, vidi, lesse, vissero, venne) AND the regular middle persons (prendesti, mettemmo, veniste) that catch the two signature misses |
| 11 | 4 | irregular_suppletive *(hot)* | essere (fui, fu, furono), avere (ebbi, ebbe; regular middle avesti), fare (feci, fece), dare (diede/dette), stare (stetti), dire (disse). fu, ebbe, fece weighted as the high-frequency narrative forms |
| 3 | 2 | trapassato_remoto | The rare literary compound in its temporal-conjunction frame (Appena ebbe finito, …; Dopo che fu partito, …); avere vs essere auxiliary in the passato remoto; the pluperfect-instead-of-remote miss (aveva finito) |

**Cross-tree markpoints (trapassato remoto participles).** The three trapassato grammar items and the two trapassato translation items each fire a passato-prossimo participle bucket as a second markpoint / required bucket, per criterion 8 (one markpoint per skill): the regular -ito participle (`participle_form.regular.ire_ito`, for finito and partito), fare's irregular participle (`participle_form.irregular.fare_fatto`), and, on the essere item, the masculine-singular agreement leaf (`participle_agreement.with_essere.masculine_singular`). All four PP buckets cited were confirmed present in `data/buckets/verb_form.passato_prossimo.json`.

**CEFR spread.** Every item is tagged `cefr_level_target: C1`. This follows the tree: the whole formation branch is `arcane` through B1, `preview` at B2, `core` at C1. These are production items (build the form), and production of the passato remoto is a C1 skill. The B2 *recognition* skill (reading `fu`/`ebbe`/`prese` and mapping it to a completed past) is a different diagnostic in the IT→EN direction and is deferred to the usage phase. See flagged item 4 below on whether a B2 recognition-lite tier is wanted.

### How the hot spots were weighted

- **The 1-3-3 alternation is the whole game, so both sides are tested.** Of the 14 strong-class grammar items, ten sit on the strong persons (io/lui/loro) and four deliberately sit on the regular middle persons (prendesti, mettemmo, veniste, and avere's avesti in the suppletive leaf). The strong-person items reject the regularised form (prendei, prendetti) in `must_not_include`; the middle-person items reject the over-extended strong stem (presesti, misemmo, venneste, ebbesti). The teaching on each side points at the other.
- **The suppletives are weighted toward the narrative high-frequency forms.** fu, ebbe, fece, fui, furono carry the most items because they are the forms a reader of any Italian novel meets on the first page. dare and stare get one apiece (diede/dette, stetti); dire gets disse.
- **The two regular -ere patterns are both accepted without penalty.** Every regular_ere item carries both -ei and -etti family forms in `any_phrases` at full credit (credei/credetti, credé/credette, temerono/temettero). Neither is marked preferred.
- **Accent and doubling guards.** The 3sg written accents (parlò, dormì, credé) are accepted in `any_phrases` and the bare forms rejected in `must_not_include`; the double consonants (mangiammo, capimmo, scrissi, ebbi, stetti, venne) are tested against their single-consonant slips. As in the sibling dispatches, these guards assume the marker preserves diacritics and doubled consonants when matching (the same basis as the present/future è/può and accent guards).

---

## Chip suppression (`info_display: "suppress"`)

Criterion 15 (AUTHOR_BRIEF Rev 8), applied per item with the leak-vs-trap test. The passato remoto splits cleanly along the 1-3-3 alternation:

**21 items suppressed** — all the **strong persons** of the irregular classes, where the breadcrumb would hand over non-derivable class membership or the strong stem itself:

- **irregular_strong_ere strong persons (11):** every io/lui/loro item (presi, presero, scrissi, scrisse, vidi, videro, mise, chiesi, lesse, vissero, venne). The breadcrumb "Strong 1-3-3 -ere" tells the learner the verb is strong, which the -ere (or -ire, for venire) infinitive does not reveal. Pure leak.
- **irregular_suppletive strong persons (10):** every essere/avere/fare/dare/stare/dire item except the regular middle avesti (fui, fu, furono, ebbi, ebbe, feci, fece, diede/dette, stetti, disse). The breadcrumb names the suppletive/strong stem the item tests.

The count reconciles as 11 strong-ere + 10 suppletive = 21.

**18 items left visible**, in two groups:

1. **The regular leaves** (regular_are 4, regular_ere 4, regular_ire 3 — all visible): the breadcrumb only restates what the `-are`/`-ere`/`-ire` cue already gives, so it leaks nothing.
2. **The regular middle persons of the irregular leaves** (prendesti, mettemmo, veniste, avesti) **and the -isc- temptation item** (capimmo): here naming the class is a *productive trap*, not a leak. A "Strong 1-3-3 -ere" breadcrumb on the prendesti item tempts the catchable `presesti`; a "Regular -ire" breadcrumb on capimmo tempts the catchable `capiscemmo`. Both wrong forms sit in `must_not_include`, so leaving the breadcrumb visible is useful, exactly the leave-visible case in criterion 15.

So within a single leaf the flag is set per item: strong-person forms suppressed, regular-middle / reverting forms visible. This mirrors the split PresentFormationAuthor used on the -isc-/dittongo leaves and follows the closed ruling in `inter_chat/Architecture_PresentFormationAuthor_breadcrumb_leak.md`. The trapassato_remoto items are left visible: the prompt's "Appena … / Dopo che … + remote-past main clause" framing already signals the compound, so the breadcrumb restates the cue.

---

## Cue economy (person dropped where the subject is supplied)

Per criterion 13's cue-economy note (Rev 9): the cue parenthetical names the person only when the prompt does not already supply the subject. Items whose sentence carries an explicit subject (Marco, i soldati, il bambino, noi, tu, Voi, Lei, il professore, i miei nonni, Leonardo, Manzoni, il viaggio, quelli) cue the verb alone, e.g. `(parlare)`, `(venire)`, `(avere)`. Items whose subject is pro-dropped keep the person, e.g. `(parlare, io)`, `(mangiare)` (noi from context "Quell'estate noi" — actually supplied, so dropped), `(prendere, io)`. Final audit: zero redundant person-cues remain.

---

## Items flagged uncertain (for the project author to rule on)

1. **dare: diede / dette dual.** I accept both `diede` and `dette` (and would accept diedi/detti in the io) at full credit, treating them as equal standard variants, matching how the leaf description lists them. If you would rather mark `diede`/`diedi` as the primary modern form and grade `dette`/`detti` down (e.g. 0.9, "more old-fashioned"), say so and I will switch the affected `any_phrases` to the graded object shape. One item is affected (`prem_supp_dare_3sg_09`).

2. **The -ei vs -etti default for regular -ere.** I treat the two as fully equal everywhere (no preference, both at 1.0). Some style guides lean to -ei as the lighter modern default and reserve -etti for verbs whose -ei would clash (e.g. with potei). If you want a house preference, I would set -ei at 1.0 and -etti at 0.95 across the four regular_ere items; flagging because it is a project-wide call, not a per-item one.

3. **venire filed under the strong -ere leaf.** venire is morphologically -ire but follows the strong 1-3-3 pattern (venni, venne, vennero), and the dispatch lists it under `irregular_strong_ere`. I authored it there (one strong item venne, one middle item veniste). If you would rather strong -ire-but-1-3-3 verbs (venire, and arguably its compounds) sit in their own sub-bucket, that is a `bucket_suggestions` matter for the architecture chat; I did not propose it, since the dispatch explicitly placed venire here.

4. **Everything is tagged C1; no B2 recognition tier.** All 52 items are production-direction and tagged C1. The high-frequency suppletives a B2 reader genuinely needs to *recognise* (fu, fui, ebbe, fece, furono) are present only as production items at C1. If you want a thin B2 recognition-lite slice surfaced earlier, that belongs to the deferred usage/recognition dispatch (IT→EN direction, which formation buckets do not fire on). No action unless you want me to down-tag the five highest-frequency suppletive production items to B2.

5. **fece / fé and archaic short forms not authored.** I left out the archaic/poetic short third-singulars (fé for fece, dié for diede) entirely, including from `must_not_include`, to keep the lists clean. If you want them caught as recognised-but-archaic (graded, 0.7) rather than ignored, that is a small addition; flagging since a reader of older literature does meet them.

---

## Notes for later dispatches

- **PassatoRemotoUsage** (the `verb_form.passato_remoto.usage` stub) will own the dominant real-world skill: **recognition** (reading the passato remoto in literature and mapping it to a completed past), plus the register/regional account of *when* it is used (literary and formal narrative, historical/biographical statement, southern spoken default). All of that is IT→EN-flavoured and was not authored here.
- **TenseChoice** owns the discrimination stub (`verb_form.passato_remoto.discrimination.vs_passato_prossimo`): the register/regional choice of remote past vs passato prossimo for a completed event. The stub leaf exists so cross-tree citations resolve; not authored here.
- **Cross-tree dependency on the passato prossimo participle machinery.** The trapassato remoto reuses the PP participle forms and agreement wholesale (it is just the PP compound with the auxiliary in the passato remoto). Five items cross-reference four PP buckets. If the PP participle tree is ever restructured, those references need revisiting.
- **The avere strong stem straddles two leaves.** avere's ebbi/ebbe/ebbero are authored in `irregular_suppletive`, but they are 1-3-3 strong forms by mechanism; a learner shaky on the strong-stem concept will miss both the prendere-class items and the avere items. Worth keeping in mind when sequencing — teach the strong stem once, apply it to both.
- **Pending glossary dependency.** My explanations lean on "suppletive", which PresentFormationAuthor already proposed in `glossary_suggestions_verb_form.present_indicative.json` (still pending merge); I did not re-propose it. The three terms I do propose are new: **passato remoto**, **strong stem** (alias "1-3-3 pattern"), and **trapassato remoto**.
