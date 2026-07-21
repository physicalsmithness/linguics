# Coverage: future, formation branch

**Dispatch:** FutureFormation (formation branch only; usage and discrimination left as stubs for later dispatches).
**Author:** FutureFormationAuthor
**Date:** 2026-06-09
**Brief revision applied:** AUTHOR_BRIEF Rev 9.

**Totals:** 50 grammar questions + 19 translation items (EN→IT only), of which **33 grammar items carry `info_display: "suppress"`** (see chip-suppression section). Every active formation leaf is covered; no zero-coverage leaves. The usage and discrimination branches were left untouched (they are stubs owned by FutureUsage and TenseChoice). No new buckets were needed, so `bucket_suggestions_verb_form.future.json` is empty. Four glossary terms are proposed.

All translation items are EN→IT, because the formation buckets are `direction: "production"`: only when the learner *produces* the Italian future form does a formation bucket fire. IT→EN would not exercise formation.

---

## Coverage by leaf

The "G" column counts grammar markpoints landing on the leaf; "T" counts translation items naming it as a required bucket. Friendly labels below; the engine id is `verb_form.future.formation.<short>`.

| G | T | Leaf (short) | What it tests |
|--:|--:|---|---|
| 6 | 2 | regular_are *(hot)* | The defining a-to-e shift across all six persons; the parlarò non-shift miss; the plain-iare i kept (studieremo); 1sg/3sg accents; 3pl double n |
| 4 | 2 | regular_ere | e kept (no shift); guards against false syncope of a regular verb (prendrò) |
| 4 | 1 | regular_ire | i kept; guards against the present's -isc- carried into the future (capiscirò) |
| 4 | 1 | orthographic.care_gare | h-insertion across all persons (cercherò, pagheremo); the no-h miss |
| 4 | 1 | orthographic.ciare_giare | i-drop across all persons (comincerò, mangeranno); the i-kept miss |
| 8 | 3 | irregular.syncopated *(hot)* | The dropped theme vowel: avrò, andrò, dovremo, potranno, saprai, vedrò, vivranno, cadrai; the vowel-kept miss (averò) |
| 6 | 2 | irregular.double_r *(hot)* | The assimilated -rr-: vorrò, verrà, terrai, rimarremo, berranno, vorranno; the single-r miss (vorò) on every item |
| 4 | 2 | irregular.essere *(hot)* | The suppletive sar- stem (sarò, sarà, saranno, sarete); the infinitive-built miss (esserò) |
| 5 | 2 | irregular.dare_stare_fare *(hot)* | The exception that keeps -ar-: farò, darà, staremo, faranno, starai; the over-applied-shift miss (ferò) |
| 5 | 3 | future_anteriore | The compound: avrò finito, sarà andata, saranno partiti, avremo mangiato, saranno arrivate; auxiliary choice and participle agreement cross-referenced to the PP tree |

**Cross-tree markpoints (futuro anteriore agreement):** three grammar items and two translation items also fire passato-prossimo participle-agreement buckets as secondary references: the feminine-singular agreement (sarà andata / Maria sarà partita), the masculine-plural agreement (i bambini saranno partiti), and the feminine-plural agreement (le ragazze saranno arrivate). All four PP buckets cited (the three agreement leaves plus the essere-motion auxiliary) were confirmed to exist in `data/buckets/verb_form.passato_prossimo.json`.

CEFR spread (item target level): grammar 41 × A2, 9 × B1; translation 16 × A2, 3 × B1. This follows the dispatch steer and the CEFR grounding: the futuro semplice is an A2-core form, so the regular classes, orthographic adjustments and irregular stems all sit at A2; the lower-frequency irregulars (vivere, cadere, rimanere, bere) and the whole futuro anteriore (B1-B2) carry the B1 items.

### How the hot spots were weighted

- **The a-to-e shift and the dare/stare/fare exception are a matched pair**, authored together as the dispatch asked. The regular -are items reject the non-shifted form (parlarò); the dare/stare/fare items reject the over-applied shift (ferò, derò, sterò). The teaching is the contrast: every -are verb shifts a to e (parlerò) *except* these three (farò), and the explanations on both sides point at each other.
- **The irregular stems carry the most weight** (8 + 6 + 4 + 5 = 23 grammar items) because the endings never vary; the whole challenge of the future is the stem. The syncopated set covers all eight high-frequency members; the double-r set rejects the single-r form on every item, since that is the signature future miss.
- **Single r vs double r** is guarded on all six double-r items: vorò, verà, terai, rimaremo, beranno, vorano all sit in `must_not_include`.
- **The 1sg/3sg written accents** (parlerò, lavorerà, avrò, sarà, darà, …) are flagged in every explanation as obligatory, but the *grading* of a dropped accent is left to the marker's soft accent guard, not to `must_not_include`. Per the OPEN `inter_chat/Architecture_Housing_accent_as_morpheme.md` thread (v2, 2026-07-14), a dropped accent earns full credit on the formation markpoint plus an automatic `orthography.accent_*` miss, and the hard `accent_load_bearing` flag is reserved for collision cases where the unaccented twin is a real competing form. The future has none of those (1sg/3sg differ in their final vowel even unaccented: parlerò/parlerà → parlero/parlera), which v2 states explicitly. So I removed the pure accent-drop twins (parlero, sara, avro, and kin) from every `must_not_include` in this batch; the guards that remain are all genuine formation errors (the non-shifted parlarò, the un-syncopated averò, the single-r vorò, the wrong-stem esserò, the over-applied ferò). This is a change from how the batch was first drafted; see uncertain item 1.
- **The futuro anteriore agreement set** is complete across the three essere-agreement shapes (feminine singular, masculine plural, feminine plural) plus an avere item that deliberately tests the *invariable* participle (avremo mangiato, never mangiati). Each agreement item is two markpoints per criterion 8: one for the future auxiliary (this tree), one for the participle agreement (PP tree).

---

## Chip suppression (`info_display: "suppress"`)

The future differs from the present in one structural way that simplifies suppression: **the irregular stem is constant across all six persons** (avrò, avrai, avrà … all share avr-), so there is no "reverting person" where naming the class would set a productive trap. The leak-vs-trap split that the present tree needed therefore mostly collapses to "suppress the irregular and orthographic items".

**33 grammar items suppressed**, by leaf:

- **syncopated (8), double_r (6), essere (4), dare_stare_fare (5)** — all suppressed. The breadcrumb on each names a non-derivable stem class or the stem itself ("syncopated stems" hands over that the vowel drops; "double-r stems" hands over the -rr-; "essere: sarò" literally shows the form; "dare/stare/fare keep -ar-" hands over the exception). None is derivable from the infinitive cue, so each is a leak.
- **orthographic.care_gare (4), ciare_giare (4)** — all suppressed. The breadcrumb names the rule-output ("add h", "drop the i"), which is the skill, exactly as PresentFormationAuthor reasoned for the same leaves.
- **regular_ire (2 of 4)** — the two -isc--temptation items (capirò, finiranno) are suppressed, because a "Regular -ire" breadcrumb would tell the learner the future drops the present's -isc-. The two plain -ire items (partirà, dormirai) stay visible: those verbs have no -isc- association, so the breadcrumb leaks nothing.

**The 17 visible items:** all of regular_are (6), regular_ere (4), the two plain regular_ire (2), and all of future_anteriore (5). Regular_are stays visible for the reason the present tree did, plus a second: the "-are" class is given by the cue, and naming it actively *tempts* the catchable parlarò non-shift (the leave-visible "productive trap" case). The futuro anteriore items stay visible because the prompt's "azione completata prima …" framing already signals a compound, so the breadcrumb only restates the cue.

This applies criterion 15 (AUTHOR_BRIEF Rev 8) and follows the closed ruling in `inter_chat/Architecture_PresentFormationAuthor_breadcrumb_leak.md`.

---

## Cue economy (person dropped where the subject is supplied)

Per criterion 13's cue-economy note (Rev 9): the cue parenthetical names the person only when the prompt does not already supply the subject. In this batch, items whose sentence carries an explicit subject (Tu, Voi, Lei, Marco, i bambini, gli ospiti, le ragazze, la squadra, i professori, il volo, i miei amici) drop the person and cue the verb alone, e.g. `(abitare)`, `(lavorare)`, `(venire)`. Items whose subject is pro-dropped keep the person, e.g. `(parlare, io)`, `(dovere, noi)`, `(cadere, tu)`, `(stare, tu)` in "Vedrai che presto ____ meglio" (subject pro-dropped after the leading clause). Marking is unaffected; the cue is not matched.

---

## Items flagged uncertain (for the project author to rule on)

1. **Accent handling: aligned to the soft guard, not `must_not_include` (resolved against the accent-as-morpheme thread).** The batch was first drafted with the unaccented twins (parlero, sara, avro …) sitting in `must_not_include`. On reading the OPEN `Architecture_Housing_accent_as_morpheme.md` thread I removed all 16, because v2 rules that a dropped accent should earn full credit plus an `orthography.accent_*` miss via the soft guard, and that the future needs no `accent_load_bearing` flag (no unaccented-twin collisions). I have replied on that topic in `inter_chat/Architecture_FutureFormationAuthor_accent_load_bearing.md`. **One thing to confirm:** v1 of the thread says the soft accent guard is "behaviour exactly as today", i.e. already live in the engine; my removal is correct against that current behaviour. If for some reason the soft guard is NOT yet live (still pending Housing's engine work), then dropped accents would currently fall through uncredited, and I would want to restore a handful of guards as an interim. I have assumed it is live; flag if not.

2. **Futuro anteriore scope.** I authored the futuro anteriore as **formation** only: building the compound (future auxiliary + participle) with correct auxiliary choice and agreement. The *suppositional* reading of the futuro anteriore ("Sarà già partito", he has probably already left) is a usage and is **not** authored here; it belongs to a later FutureUsage dispatch. Confirm you want that line held, since the futuro anteriore straddles formation and usage more than the simple future does.

3. **`dovremo partire` / `potranno venire` style items carry a bare infinitive.** In the syncopated translation items, only the modal/auxiliary is conjugated and the following infinitive (partire, venire) stays in citation form. I marked venire's double-r future as an *optional* bucket on `trans_fut_en_it_irr_sync_02` in case a learner wrongly conjugates it; flag if you'd rather such over-production not be tracked at all.

4. **Subject-pronoun-dropped vs included in translation references.** As in the sibling dispatches, I gave both the pro-drop form (the natural default) and, where natural, the subject-pronoun-included form as neutral references. The AI marker should credit either. No ruling needed unless you want a single canonical reference per item.

---

## Notes for later dispatches

- **FutureUsage** (the `verb_form.future.usage` stub) will own: prediction and scheduling, promises and intentions, mild commands ("Farai i compiti"), and the future-of-probability / supposition about the present ("Saranno le tre"; "Avrà fame") and about the past (the suppositional futuro anteriore, "Sarà già partito"). None authored here.
- **TenseChoice** owns the discrimination stub (`verb_form.future.discrimination.vs_present`), the future vs present-for-future contrast ("Parto domani" vs "Partirò domani"). It mirrors the present tree's `discrimination.vs_future`. Not authored here; the stub exists so cross-tree citations resolve.
- **Cross-tree stems.** bere's future is built on the short ber- (berrò), not the bev- stem of its present and imperfect; I flag this in the bere explanation, paralleling the present tree's bev- note. The two stems genuinely diverge in the future.
- **The avrò / sarò overlap with the futuro anteriore.** The 1sg avere and essere futures (avrò, sarò) are also the auxiliaries for the compound, so they get double duty: a learner shaky on avrò will miss both the syncopated leaf and the futuro anteriore. Worth keeping in mind when sequencing.
- **Pending glossary dependency.** The essere explanations use "suppletive", which PresentFormationAuthor already proposed (still pending merge into `data/glossary.json`); I did not re-propose it. The four terms I do propose (theme vowel, syncopation, assimilation, future perfect) are new.

---

## Post-delivery revisions (2026-07-18)

- **Criterion 17 (gloss):** all 50 grammar items glossed by Cr17Sweep, gloss-first, zero marking delta.
- **Criterion 18 (anchoring):** all 53 any_phrases now `match_at: "word"` (central gate); Cr17Sweep substring gate found 0 future hits.
- **Criterion 19 (accent):** 16 dead accent twins removed; `accent_load_bearing` thread CLOSED (soft guard confirmed live, no futuro flags needed).
- **Criterion 13 (chip audit):** run, clean, 0 rewrites (no rule-names in any cue); reported to Architecture for stamp.
- **POS buckets:** all vocab_help buckets POS-segmented by the estate migration.
- **già dropped** from the five futuro anteriore prompts (single blank, native surface; già redundant with the compound form + anteriority cue, and criterion 9 prefers a single slot).
- **pagare** (`fut_orth_cg_pagare_1pl_01`) gains the resumptive clitic: "Il conto lo pagheremo noi", cue trimmed to `(pagare)`.
- **Open:** vedrò content bug (`fut_irr_sync_vedere_1sg_01`) — "Ci vedrò" with an io subject means "I'll be able to see", not "I'll see you". Repair pick handed to Architecture (recommend `Ti vedrò`, which keeps the 1sg syncope test).

## Criterion-21 retrofit (2026-07-20)

- **All 45 formation items now force the tense**: the cue names `futuro` (Rev-26 trigger), fixing the criterion-21 mis-attribution where a bare "Domani ..." let a learner write the natural present-for-future and take formation misses they never attempted. Mechanism was cue-naming throughout (the present-for-future competitor beats any frame); the optional present guard was declined (it would mis-attribute a tense error to formation). prompt_supplies_base_form stays true and is now honest. Criterion-19 re-checked after the reframe: clean.
- **vedere repaired**: fut_irr_sync_vedere_1sg_01 is now "Ti ____ domani in ufficio" (Ti vedrò), fixing the ci-reciprocal bug; repair choice awaiting Architecture ratification.
- **person field**: set on all 65 items (the 7 futuro-anteriore / past-probability items and the 13 merged usage items the central migration missed; the 45 formation items were already migrated).

## Volume wave (2026-07-21, DISPATCH_volume_formation)

Added **53 basic A1/A2 fluency-rep formation items** (grammar file now 118: 103 formation + 15 usage), populating the person×conjugation-class grid to the two-for-green floor. Weighted to core verbs; depth over exotica.

Person×leaf after the wave (every band, target >=2):

| leaf | 1sg | 2sg | 3sg | 1pl | 2pl | 3pl | status |
|---|--:|--:|--:|--:|--:|--:|---|
| regular_are | 2 | 2 | 2 | 2 | 2 | 2 | all >=2 |
| regular_ere | 2 | 2 | 2 | 2 | 2 | 2 | all >=2 |
| regular_ire | 2 | 2 | 2 | 2 | 2 | 2 | all >=2 |
| irregular.essere | 2 | 2 | 2 | 2 | 2 | 2 | all >=2 |
| irregular.syncopated | 2 | 3 | 2 | 2 | 2 | 3 | all >=2 (avere paradigm added) |
| irregular.dare_stare_fare | 2 | 2 | 2 | 2 | 2 | 2 | all >=2 |
| irregular.double_r | 2 | 2 | 2 | 2 | 2 | 2 | all >=2 (volere/venire) |
| orthographic.care_gare | 1 | 1 | 1 | 1 | 1 | 1 | zero-free, at 1/band |
| orthographic.ciare_giare | 1 | 1 | 1 | 1 | 1 | 1 | zero-free, at 1/band |
| future_anteriore | 1 | 0 | 1 | 1 | 0 | 2 | left (B1-B2, not basic fluency) |

**Held back deliberately:** orthographic is now zero-free but sits at one item per band; greening it fully is +12 spelling drills, held per "depth over exotica" (flagged to Architecture as an optional follow-up). Futuro anteriore is B1-B2, outside the basic-fluency remit.

**Gates (marker replica, strict + accent-folded, all 118 items):** 0 guard false-credits; every guard a live miss; every correct answer a hit; all any_phrases match_at word (crit 18); crit-21 futuro forced in every formation cue; person on all 118; marks == sum(credit); all buckets resolve. Reported in `inter_chat/Architecture_FutureFormationAuthor_volume_formation.md`.

