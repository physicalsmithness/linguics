# Coverage: passato remoto, formation branch

**Dispatch:** PassatoRemotoFormation (formation branch only; usage and discrimination left as stubs for later dispatches). This is the last formation dispatch, so the tense/mood formation system is now complete.
**Author:** PassatoRemotoFormationAuthor
**Date:** 2026-06-09
**Brief revision applied:** authored against AUTHOR_BRIEF Rev 9 (the revision the dispatch cited); **reconciled to Rev 20 on 2026-07-15** (Addendum 1: criteria 17, 18, 19) and **to Rev 28 on 2026-07-20** (Addendum 2: criterion 21 formation-trigger + a false-miss fix). Both addenda at the foot of this report. Versions currently span 2-4 across the 39 items (4 untouched frame-forced survivors at v2, the bulk at v3, the five accent/reframe items at v4); the file is the source of truth for per-item version.

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
- **Accent and doubling guards.** *(Superseded in part by the criterion-19 ruling — see the addendum.)* The 3sg written accents (parlò, dormì, credé) are accepted in `any_phrases`. Only **credé** now rejects its bare twin, because only the -ere class strips onto the same person the prompt demands; on parlò and dormì the bare form is fold-rescued and logs `orthography.accent.italian.missing` instead. The double consonants (mangiammo, capimmo, scrissi, ebbi, stetti, venne) are tested against their single-consonant slips, and those guards are unaffected: doubling is not folded by `norm()`, only accents, apostrophes and hyphens are.

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

---

## Addendum: reconciliation Rev 9 → Rev 20 (2026-07-15)

The batch was authored against AUTHOR_BRIEF Rev 9 (the revision the dispatch cited). The brief has since reached Rev 20. This addendum records the reconciliation; all items are now `version: 2`. Totals are unchanged at **39 grammar + 13 translation**, and no item was added, removed, or re-bucketed.

**Criterion 18 (superstring safety) — a live false-credit bug, found and fixed.** Auditing against *plausible attempts* rather than the items' own guard lists exposed **16 markpoints across 12 items**. Every 3sg passato remoto form is a substring of its own 3pl, so a wrong-person attempt matched the embedded 3sg and scored full marks with the guard unreachable behind the positive: fu ⊂ furono / fui / fummo, ebbe ⊂ ebbero, fece ⊂ fecero, disse ⊂ dissero, mise ⊂ misero, scrisse ⊂ scrissero, lesse ⊂ lessero, venne ⊂ vennero, diede ⊂ diedero, dette ⊂ dettero, credette ⊂ credettero, and on the trapassato items ebbe ⊂ "ebbero finito" and fu ⊂ "furono partiti". Fixed with per-phrase `match_at: "word"` across the batch, both sides, 144 phrases.

The estate-wide retro-audit of 2026-07-14 did not catch this batch because its exposure test compared each any_phrase against that markpoint's own `must_not_include`; the 3pl forms were never in the guard lists (there was no reason to guard the wrong person), so the pair was invisible to it. Reported to Architecture with a recommendation to re-run the standing check with a paradigm-expanded comparison set, since every formation batch carrying a 3sg item is a candidate for the same blind spot.

**Criterion 19 (accent as morpheme) — six flags applied, five since removed; one stands.** This moved several times in a day and the final ruled state is the one below; counts here are read off the file, not carried from the drafting.

Architecture first applied `accent_load_bearing: true` to six of my markpoints centrally, gate-proven dead on the folded path. The cross-topic **AccentAuditor** seat then swept the estate and unpicked most of it, correctly:

- **`prem_ere_credere_3sg_02` (credé) is the only flag that stands** in this batch, and one of only two in the whole estate (the other is ImperativoAuthor's dì). It survives because it is the single *same-person* accent collision in the tree.
- **The auditor's arithmetic is the real finding, and it is conjugation-class arithmetic, not "remoto vs present".** Only the **-ere** class strips onto the same person the prompt's subject demands: credé → crede is 3sg → 3sg. On `parlò` the twin `parlo` is the **1sg** present, but the prompt's subject is Marco (3sg), whose present is *parla*; on `dormì` the twin `dormi` is the **2sg** present, but the subject is *Il bambino*, whose present is *dorme*. So on those two prompts the stripped twin is not a competing answer at all — it is only ever a dropped accent. Smith ruled **no_flag** on both, per the criterion; executed centrally, with the now-dead twin guards (`parlo`, `dormi`) pruned and the non-accent guards (`parlao`, `dormiva`) kept.
- **The other three were the mirror shape** — spurious-accent *guards* on unaccented answers (`fùi`, `fù`, `fù` on the two essere items and the trapassato partire item). These were pruned under the same-day fold-equal ruling: the r8 orthography split (`.missing` / `.added` / `.wrong_mark`) now diagnoses a hypercorrection properly, so routing it to the formation bucket was a false diagnosis. Their non-accent guards (`essei`, `era`) stay live.

Net for this batch: **1 `accent_load_bearing` flag** (credé), five removed, five dead guards pruned, all non-accent guards retained. A dropped accent on parlò / dormì now credits the formation bucket and logs `orthography.accent.italian.missing` — the learner formed the remote past and misspelled it, which is the honest attribution.

**A defect of mine the sweep exposed: three markpoint labels named the form the markpoint guards against.** The auditor caught `prem_ere_credere_3sg_02`, whose label read "3sg crede / credette (dual, accent)" — naming `crede`, the *present*, as though it were an accepted answer, when the dual is credé / credette. Since the label renders as the breadcrumb, the item was showing the learner the wrong answer while the upheld flag turned taking that advice into a hard WRONG. Running the auditor's suggested grep against my own batch found the same defect twice more, on `prem_are_parlare_3sg_02` ("3sg parlo with accent") and `prem_ire_dormire_3sg_02` ("3sg dormi with accent") — **three instances, not one**. Root cause: those three labels were typed in an ASCII context during authoring and silently lost their accents, so each named the stripped twin. All three now name the answer:

| item | was | now |
|---|---|---|
| `prem_are_parlare_3sg_02` | 3sg parlo with accent | 3sg parlò (stressed -ò, written accent) |
| `prem_ere_credere_3sg_02` | 3sg crede / credette (dual, accent) | 3sg credé / credette (dual; credé carries the accent) |
| `prem_ire_dormire_3sg_02` | 3sg dormi with accent | 3sg dormì (stressed -ì, written accent) |

The parlò and dormì **explanations and teaching notes were corrected for person accuracy** at the same time: both had asserted the twin was "the present" as though it competed at that prompt, which the auditor's arithmetic disproves. They now teach the stress point (par-LÒ, not PAR-lo) and state plainly that the subject could not take the twin anyway, so the accent is carrying the tense rather than resolving a clash of persons. The credé note, which was accurate, is sharpened to say why that one *is* a real wrong answer: "it fits this sentence exactly as well as credé does, so only the accent tells the two apart".

**Criterion 17 (explanations translate the sentence).** All 39 grammar explanations now open with the completed correct sentence and a natural English gloss, ahead of the existing four-beat working — e.g. "'Quella sera Marco parlò a lungo davanti a tutti.' (That evening Marco spoke at length in front of everyone.) The lui/lei form of a regular -are passato remoto ends in a stressed -ò …".

**Criterion 15 (recoverability, Rev 19) — the 21 suppressions stand.** Every item supplies the base form in its cue, which is the brief's named recoverable class ("formation items whose base form is given"), so suppress-by-default holds and no item is left unanswerable. The 21 suppressed / 18 visible split is unchanged.

**Criterion 16 (candidate sets) — does not bind.** No formation item cites a `.discrimination.*` bucket or sits in the tense_choice tree, so no `candidate_tenses` / `correct_tense` fields are required. When the passato remoto discrimination stub is authored (TenseChoice's), those items will need `candidate_tenses: ["passato_remoto", "passato_prossimo"]`, a `correct_tense`, and the suppress flag.

**Outstanding, raised to Architecture:** all six formation leaf labels embed their worked examples, which are the answers to my items (`Regular -are: parlai / parlasti / parlò / …`). Under the Rev 19/20 terse-label rule this is prior to the suppress test, and it defeats the 18 deliberately-visible items where suppression is not an available fix. Raised as `inter_chat/Architecture_PassatoRemotoAuthor_breadcrumb_label_leak.md` (OPEN), with six proposed terse labels; the worked paradigms already sit in each leaf's `description`, so nothing is lost. My suppress calculus is unchanged by the shortening, so no re-touch of the batch is needed once it lands.

**Verification.** A marker replica implementing the ratified semantics (norm with accents/apostrophes/hyphens folded, `occursAt` word-anchoring on both boundaries, any_phrases-before-must_not evaluation order, and the `accent_load_bearing` fold-disable) confirms: every canonical answer credits, including the duals (credei/credetti, credé/credette, diede/dette, temerono/temettero) and both markpoints of each trapassato item; all 12 false-credits closed; all six accent twins reachable and guarded; and the five middle-person over-extension guards (presesti, misemmo, venneste, ebbesti, capiscemmo) still firing.

The five items flagged uncertain above (the dare dual, the -ei/-etti default, venire's placement, the uniform C1 tagging, and the archaic short forms) are **unchanged and still open** — the reconciliation did not touch them.

---

## Addendum 2: criterion-21 formation-trigger retrofit + false-miss fix (2026-07-20)

Two work orders landed after the Rev-20 reconciliation and were executed together, since they touch the same items.

**Criterion 21 (Rev 28) — formation must FORCE its target tense.** The estate-wide audit (AUDIT_formation_trigger_2026-07-19) found **35 of my 39 items ambiguous**: a bare temporal frame ("Quella sera", "Quel giorno") does not exclude the modern-register passato prossimo, so a learner writing "ho parlato" for "parlai" took formation misses they never attempted — a mastery mis-attribution, and Smith's live catch generalised. The tense CHOICE is tense_choice's to test; a formation drill must remove it.

Remedy (Smith ruled per-author mechanism): **cue-naming on all 35**, naming the tense after the lemma in the cue (`(parlare, io, passato remoto)`; `(finire, trapassato remoto)` for the three trapassato items). Rev 26 licenses the tense name as the trigger, not a criterion-13 leak. The **4 frame-forced survivors** (arrivare, temere, mettere-3sg, dare — each with a co-text passato remoto verb: occuparono, avanzarono, uscì, andò) were left unchanged. Two items took a body change: mangiare lost its iterative "ogni sera" (which pulled toward the imperfetto), and partire is the false-miss below.

With the tense forced on every item, `wrong_answer_is_form_error_only: true` is now honest across all 39 (it was silently dishonest on the 35 while the frame left the tense open).

**False-miss (AUDIT_false_miss_2026-07-20) — prem_trap_partire_3sg_02.** The old prompt printed "partito" after the blank, so the participle markpoint required the learner to retype a word already on screen and capped a correct answer at 1/2. Fixed by restructuring the blank to cover the whole "fu partito" compound (single combined slot, criterion 9), which also supplies the criterion-21 trigger and forces the trapassato remoto over the simpler "partì". Both markpoints now earn on what the learner types; marker replica confirms 2/2.

**Rails re-run, all green:** criterion 18 containment clean (144 phrases anchored, the new compound blank included); criterion 19 unchanged by the reframe (Rev 23 re-arm check — still one flag, credé; parlò/dormì stay no_flag); Rev 25 holds (lemmas unchanged, temere B1 ≤ C1). Dispositions reported on both threads (formation_trigger v2, false_miss v2), now `Next: Architecture` for verify + the criterion-21 register stamp.

---

## Addendum 3: volume-formation wave (2026-07-21)

Executed `DISPATCH_volume_formation.md` (Smith's drill-volume ruling: more basic formation reps so a learner builds fluency faster, and to populate the person×class grids). **+29 items, batch now 68 grammar** (13 translation unchanged).

**The weighting judgement (flagged to Architecture on the volume_wave thread).** The dispatch weights to A1/A2 core verbs and warns "depth over exotica" — but passato remoto has no A1/A2 tier, and its regular classes (vendei, dormii) are its *least*-met forms, while the irregulars (fu, ebbe, fece, disse, prese) are what a reader meets constantly. Mechanically doubling the regular grid would manufacture the exotica the dispatch says to avoid. So the wave applies the dispatch's intent, not its arithmetic: **suppletives and strong -ere carry it (21 of 29 items), thickened across persons; the three regular classes get single six-person completion, not 2-per-cell doubling.** Recommendation to hold the regulars at single coverage is on the thread for ruling.

**Person coverage after the wave:** essere, avere, fare, dire now span all six persons (the narrative backbone); strong -ere thickened on prendere/vedere/scrivere/mettere; regular classes complete their six-person paradigm once each; trapassato left at 3 (rare literary compound — padding it is not fluency).

**Gates (all seven, non-negotiable):** every new phrase `match_at: "word"`; **guard-verdict gate run strict AND folded across all 68 — zero false-credit, zero dead-guard, every positive credits**; crit-21 tense-named cue on every item (flag honest); crit-13 cue economy; crit-20 citation-form cues (no invariables); `person` on every finite item; Rev-27 single-markpoint items need no split. crit-17 gloss opens every new explanation; crit-19 introduces no new accent flag (batch still carries one, credé). The strong-person-suppress / middle-person-visible split is preserved and extended.

The main "Coverage by leaf" table above reflects the original 39-item delivery; this addendum is the volume-wave delta. The grammar file is the source of truth for per-leaf and per-person counts.
