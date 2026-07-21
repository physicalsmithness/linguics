# Coverage: conditional (formation + usage, one merged topic file)

**Dispatch:** ConditionalFormation (formation) + the wave-2 usage dispatch (usage branch, same seat).
**Author:** ConditionalFormationAuthor
**Date:** 2026-06-09 (formation); reconciled to Rev 19 on 2026-07-15; usage branch + criterion-21 retrofit 2026-07-20.
**Brief revision applied:** formation authored against Rev 9, reconciled to Rev 19; usage + retrofit against Rev 28.
**File layout:** formation and usage items live together in `grammar_questions_verb_form.condizionale.json` (72 = 49 formation + 23 usage) and `translation_items_verb_form.condizionale.json` (38 = 19 formation + 19 usage), because the loader derives the filename from the topic id and does not read a `_usage`-suffixed file. (The usage items were briefly mis-shipped as separate `_usage` files on 2026-07-20 and merged in the same day.)
**Threads (Rev 18: this doc is the record, the threads are the channel):**
- `inter_chat/Architecture_ConditionalFormationAuthor_batch_delivery.md` — formation delivery + reconciliation (CLOSED, ACCEPTED).
- `inter_chat/Architecture_ConditionalFormationAuthor_breadcrumb_label_leak.md` — leaf labels shortened at source (CLOSED).
- `inter_chat/Architecture_ConditionalFormationAuthor_broken_usage_citations.md` — usage stub-leaves minted (CLOSED).
- `inter_chat/Architecture_ConditionalFormationAuthor_usage_wave2.md` — the usage branch delivery + the manifest-merge correction (OPEN, Next: Architecture).
- `inter_chat/Architecture_ConditionalFormationAuthor_formation_trigger_retrofit.md` — criterion-21 retrofit of 19 ambiguous formation items (OPEN, Next: Architecture).

## Usage branch (wave 2, 2026-07-20)

23 grammar + 19 translation across three leaves, translation **bidirectional** (10 EN→IT, 9 IT→EN): `usage.polite` (A2 core, heaviest: 10G+7T), `usage.reported_future_in_past` (B1-B2: 6G+6T), `usage.hypothetical_apodosis` (B2: 7G+6T). The diagnostic is the functional CHOICE (blunt present vs polite conditional; simple future/conditional vs compound in reported speech; present/future vs conditional in an apodosis), not formation. Three items cross-credit `tense_choice…prescriptive_conditional` per Rev 27, weighted to sum to 1, and the choice bucket never appears without a usage leaf beside it (the dispatch boundary). Two asks parked in the usage thread: whether reported-future items should also dual-credit the formation compound leaf, and the stub-flag clearance.

## Criterion-21 formation-trigger retrofit (Rev 28, 2026-07-20)

The estate-wide 2026-07-19 audit found 19 of the 49 formation items ambiguous — a well-formed competing tense (mostly the present indicative on the polite/gnomic items; the simple conditional on the three compound items) fitted the frame, so a learner choosing that competitor took formation misses on skills they never engaged. Fixed by cue-naming: the tense is now named in the cue (`(potere, tu, condizionale)`, `(finire, io, condizionale passato)`), Rev-26-licensed as the trigger, and the named competitor is guarded in `must_not_include` (word-anchored) on 17 of 19. Per-item disposition table is in the retrofit thread. The `Al posto tuo…` / `se + congiuntivo` items were already excluding frames and were not in scope.

**Totals:** 49 grammar questions + 19 translation items (EN→IT only), of which **33 grammar items carry `info_display: "suppress"`** (see chip-suppression section). Every active formation leaf is covered; no zero-coverage leaves. The usage and discrimination branches were left untouched (they are stubs owned by ConditionalUsage and TenseChoice). No new buckets were needed, so `bucket_suggestions_verb_form.condizionale.json` is empty. One glossary term is proposed (the conditional perfect / condizionale passato); three more that the explanations lean on are already proposed by sibling dispatches and were not re-proposed (see the glossary note at the end).

All translation items are EN→IT, because the formation buckets are `direction: "production"`: a conditional formation bucket only fires when the learner *produces* the Italian conditional form. IT→EN would not exercise formation.

The governing idea, per the dispatch: **the conditional is built on the exact same stem as the future**, with a different set of endings (-ei, -esti, -ebbe, -emmo, -este, -ebbero). So the weight here is on the endings and on reusing the future stems, not on new stems. Every explanation says so explicitly ("the future stem you already know, plus these endings").

---

## Rev 19 reconciliation (2026-07-15)

The batch was authored against Rev 9 and reconciled to Rev 19 today. It was not part of the Rev 15 retro-audit that anchored 53 phrases across seven live batches, so it carried the criterion-18 exposure until now.

- **Criterion 18 (Rev 15, plus Rev 17's third direction): one real defect, fixed.** Ten items accepted a bare 3sg `-ebbe` phrase that is a substring of its own 3pl `-ebbero` form, so a wrong-person plural attempt (`sarebbero` on a `sarebbe` item) scored **full credit**. All 155 phrases in the batch now carry per-phrase `match_at: "word"` on both `any_phrases` and `must_not_include`. Proved by simulating the marker against each 3pl twin: credited-before → not-credited-after on all ten. The doubled-letter guards were already structurally safe in the other direction (a single-letter form is never a substring of its double-letter twin, so `abiteremo` never matched inside `abiteremmo`), and no `must_not_include` entry fires on a plausible correct attempt.
- **Criterion 17 (Rev 13): applied to all 49.** Every grammar explanation now opens with the completed correct sentence quoted, followed by a natural English translation in parentheses, then the existing four-beat working. Item versions bumped to 2.
- **Criterion 19 (Rev 16, accent as morpheme): no action, deliberately.** The simple conditional carries no final accent (parlerei, not parlerò), so no accent-stripped form is a rival answer to any prompt here. The conditional is the one half of the future/conditional pair that escapes the accent retrofit its siblings needed. This supersedes the accent caveat in "Items flagged uncertain" #2 below, which is now closed.
- **Criterion 15 recoverability (Rev 19): no change, all 33 suppressions stand.** Every item is a formation item whose base form the cue supplies, so the candidate set is recoverable pre-answer and suppress-by-default applies. The different-lexeme case Rev 19 carves out (bene/buono) does not arise in this tree.
- **Criteria 16 / 17(iii) (candidate_tenses, candidate_forms): not applicable.** Both bind discrimination and tense_choice items; this batch authors none (they are stubs).
- **Outstanding at tree level, not fixable from here:** the leaf labels still spell the paradigm (Rev 12's terse-label rule never swept this tree), which leaks the double-m and double-b on the 16 visible items. Raised in the breadcrumb thread; the bucket tree is Architecture's artefact.

---

## Coverage by leaf

"G" counts grammar markpoints landing on the leaf; "T" counts translation items naming it as a required bucket. Friendly labels below; the engine id is `verb_form.condizionale.formation.<short>`.

| G | T | Leaf (short) | What it tests |
|--:|--:|---|---|
| 6 | 2 | regular_are *(hot)* | The -ei/-esti/-ebbe/-emmo/-ebbero endings on the a-to-e shifted stem; the **double-m 1pl** (abiteremmo vs future abiteremo); the double-b 3sg/3pl; the a-kept slip (parlarei) |
| 4 | 1 | regular_ere | -ere stem kept; the double-m 1pl (leggeremmo); guards against false syncope of a regular verb (prendrei) |
| 4 | 1 | regular_ire | i kept, **no -isc-** ever (capirei, not capiscirei); the double-m 1pl (partiremmo) |
| 4 | 1 | orthographic.care_gare | h-insertion across persons (cercherei, pagherebbe); the no-h miss; one item also carries the double-m |
| 4 | 1 | orthographic.ciare_giare | i-drop across persons (comincerei, mangerebbe); the i-kept miss; one item also carries the double-m |
| 7 | 3 | irregular.syncopated *(hot)* | The dropped theme vowel: avrei, potresti, dovrebbe, andremmo, saprei, vedrebbero, potrei; the vowel-kept miss (averei, poterei) |
| 6 | 3 | irregular.double_r *(hot)* | The assimilated -rr-: **vorrei** (×2, the highest-frequency form), verremmo, terrebbe, rimarrei, berrebbero; the single-r miss (vorei) on every item |
| 4 | 2 | irregular.essere | The suppletive sar- stem (sarei, sarebbe, saremmo, sarebbero); the infinitive-built miss (esserei) |
| 5 | 2 | irregular.dare_stare_fare *(hot)* | The exception that keeps -ar-: farei, faresti, darebbe, staremmo, farebbero; the over-applied-shift miss (ferei, derei) |
| 5 | 3 | condizionale_passato | The compound: avrei finito, sarebbe andata, saresti partita, saremmo arrivati, avrebbe dato; reported-future-in-the-past framing; auxiliary choice and participle agreement cross-referenced to the PP tree |

### The double-m 1pl, hit from every angle

The dispatch named **-emmo vs the future's -emo** as the whole ballgame, and it gets the heaviest treatment of any single feature. Eight grammar items land a 1pl conditional whose single-m future counterpart sits in `must_not_include`: abiteremmo/abiteremo, torneremmo/torneremo (regular_are); leggeremmo/leggeremo (regular_ere); partiremmo/partiremo (regular_ire); giocheremmo/giocheremo (orthographic); andremmo/andremo (syncopated); saremmo/saremo (essere); staremmo/staremo (dare_stare_fare); plus verremmo (double_r), which guards *both* the single-m future verremo and the single-r veremmo. The translation set echoes it: torneremmo, viaggeremmo, verremmo, saremmo and saremmo arrivati each carry a single-m negative reference.

### vorrei and the double-r set

vorrei (I would like) is the single most frequent conditional a learner meets, so it gets two dedicated grammar items (1sg vorrei, 2sg vorresti) plus the canonical translation "I would like a coffee, please." Every double-r item rejects the single-r form (vorei, voresti, veremmo, terebbe, rimarei, berebbero) in `must_not_include`, since that is the signature double-r miss. The bere item additionally guards the present's bev- stem (beverebbero), because bere's conditional is built on the short ber- (berrei), exactly as the future is.

### The double-b endings

-ebbe (3sg) and -ebbero (3pl) are guarded as spelling errors throughout: comprerebe, canterebero, scriverebe, finirebe, pagherebe, spiegherebero, mangerebe, dovrebe, vedrebero, terrebe, sarebe, sarebero, darebe, farebero all sit in `must_not_include` on their items.

### dare / stare / fare against the shift

Authored as a matched pair with regular_are, as the dispatch asked: the regular -are items reject the non-shifted parlarei, while the dare/stare/fare items reject the *over-applied* shift (ferei, feresti, derebbe, steremmo, ferebbero). The teaching is the contrast, and the explanations on both sides point at it.

**Cross-tree markpoints (condizionale passato agreement).** Three grammar items and two translation items also fire passato-prossimo buckets as secondary references, for the auxiliary + participle machinery the compound reuses:

- `verb_form.passato_prossimo.participle_agreement.with_essere.feminine_singular` — sarebbe andata, saresti partita (grammar); sarebbe venuta (translation).
- `verb_form.passato_prossimo.participle_agreement.with_essere.masculine_plural` — saremmo arrivati (grammar + translation).
- `verb_form.passato_prossimo.auxiliary.essere_motion_intransitive` — cited as an *optional* bucket on the two essere-motion translation items (venire, arrivare).

All three PP buckets were confirmed to exist in `data/buckets/verb_form.passato_prossimo.json`.

**CEFR spread.** Grammar: 42 × B1, 4 × B2, 3 × A2. Translation: 15 × B1, 3 × B2, 1 × A2. This follows the dispatch and `CEFR_GROUNDING.md`: the simple conditional is a B1-core form, so the regular classes, orthographic adjustments and irregular stems all sit at B1; the condizionale passato is B1-B2 (one basic avrei-finito item at B1, the four agreement / reported-speech items at B2); and the three fixed polite forms (vorrei, vorresti, potrei) are tagged A2 because learners meet them early as set phrases, even though the system as a whole is B1.

---

## Chip suppression (`info_display: "suppress"`)

As in the future, the conditional simplifies suppression in one structural way: **the irregular stem is constant across all six persons** (avrei, avresti, avrebbe … all share avr-), so there is no "reverting person" where naming the class would set a productive trap. The leak-vs-trap split therefore mostly collapses to "suppress the irregular and orthographic items".

**33 grammar items suppressed**, by leaf:

- **syncopated (7), double_r (6), essere (4), dare_stare_fare (5)** — all suppressed. Each breadcrumb names a non-derivable stem class or the stem itself ("syncopated stems" hands over that the vowel drops; "double-r stems" hands over the -rr-; "essere: sarei …" shows the form; "dare/stare/fare keep -ar-" hands over the exception). None is derivable from the infinitive cue, so each is a leak.
- **orthographic.care_gare (4), ciare_giare (4)** — all suppressed. The breadcrumb names the rule-output ("add h", "drop the i"), which is the skill, exactly as PresentFormationAuthor and FutureFormationAuthor reasoned for the same leaves.
- **regular_ire (3 of 4)** — the three -isc--temptation items (capirei, finirebbe, preferirebbero) are suppressed, because a "Regular -ire" breadcrumb would tell the learner the conditional drops the present's -isc-. The one plain -ire item (partiremmo) stays visible: partire has no -isc- association, so the breadcrumb leaks nothing.

**The 16 visible items:** all of regular_are (6), regular_ere (4), the one plain regular_ire (partiremmo), and all of condizionale_passato (5). Regular_are/ere stay visible for the same reason the future tree gave: the class is given by the cue, and naming it actively *tempts* the catchable a-kept slip (parlarei) — the leave-visible "productive trap" case. The condizionale passato items stay visible because their framing ("Maria aveva detto che …", "Con un'ora in più, ____") already signals a compound / counterfactual, so the breadcrumb only restates what the prompt gives.

This applies criterion 15 (AUTHOR_BRIEF Rev 8) and follows the closed ruling in `inter_chat/Architecture_PresentFormationAuthor_breadcrumb_leak.md`.

---

## Cue economy (person dropped where the subject is supplied)

Per criterion 13's cue-economy note (Rev 9): the cue parenthetical names the person only when the prompt does not already supply the subject. In this batch, items whose sentence carries an explicit subject (Tu, Voi, Lui, Lei, Loro, Marco, Maria, il lavoro, tutto, i professori, Molti, i tuoi genitori) drop the person and cue the verb alone, e.g. `(lavorare)`, `(comprare)`, `(scrivere)`, `(finire)`, `(pagare)`, `(mangiare)`, `(tenere)`, `(dare)`. Items whose subject is pro-dropped keep the person, e.g. `(parlare, io)`, `(abitare, noi)`, `(potere, tu)`, `(volere, io)`, `(arrivare, noi)`. Marking is unaffected; the cue is not matched.

A note on how the conditional is forced without naming it (criteria 5 and 13): grammar items never say "the conditional" or name a stem class. Instead the sentence carries a transparent conditional trigger — a polite request ("____ un caffè, per favore"), a counterfactual contrast ("…, ma non possiamo"), a hypothetical tag ("Al posto tuo, ____"), an if-clause with the subjunctive ("Se potessimo, ____"), advice ("Secondo me, Marco ____ riposare"), or, for the compound, reported speech ("Maria aveva detto che ____"). This is the same device the future dispatch used with "Domani": the context disambiguates the wanted form, while the markpoint and `must_not_include` test only the formation.

---

## Items flagged uncertain (for the project author to rule on)

> **Channel:** all five asks below are carried in `inter_chat/Architecture_ConditionalFormationAuthor_batch_delivery.md` (Rev 18: this section is the record, the thread is the contract). Item 2's accent caveat is **closed** by the Rev 19 reconciliation above; the rest are open.

1. **The conditional-forcing frames are contextual, not lexical.** Unlike the future's "Domani", the conditional has no one-word trigger, so each item relies on a polite / hypothetical / counterfactual frame to make the conditional the wanted form. Most are watertight (polite requests, "se + congiuntivo" apodoses, reported speech). Two are slightly softer and I flag them: **cond_are_lavorare_2sg_01** ("Tu ____ di più, ma sei troppo stanco") and **cond_are_cantare_3pl_01** ("Volentieri ____ con noi, ma sono timidi") lean on the contrastive "ma …" clause to force the conditional reading. A determined learner could read a present there. I judged them clear enough in context, but if you'd rather they were ironclad, say so and I'll add an explicit "Al posto tuo" / "se potessero" frame.

2. **Accent guards depend on diacritic-preserving normalisation.** Every 1sg item accepts the accented stem-internal forms (parlerei, vorrei, sarei — no final accent here, unlike the future's parlerò) but the lemma buckets carry full diacritics (caffè, tè). This is the same diacritic-preserving assumption the present/future/imperfect trees already ship on. No action needed unless that policy is under review.

3. **Condizionale passato scope.** I authored the compound as **formation** only: building it (conditional auxiliary + participle) with correct auxiliary choice and agreement, including the reported-future-in-the-past framing, which is structurally a formation context (the compound *is* the form English renders with "would have / would"). I did **not** author the counterfactual-apodosis *choice* (conditional perfect vs colloquial imperfect — "sarei venuto" vs "venivo"), which is discrimination and belongs to TenseChoice. Confirm you want that line held; the condizionale passato straddles formation and usage a little more than the simple conditional does.

4. **Reported-future-in-the-past as formation.** Two compound items ("Maria aveva detto che sarebbe venuta", "Aveva promesso che ci avrebbe dato una mano") use the reported-speech frame because it is the cleanest unambiguous trigger for the condizionale passato. The *usage* point (that Italian uses the compound conditional where English keeps "would") is left to ConditionalUsage; here the item only tests building sarebbe venuta / avrebbe dato. Flag if you'd rather the reported-speech frame be reserved entirely for the usage dispatch.

5. **Subject-pronoun-dropped vs included in translation references.** As in the sibling dispatches, I gave the pro-drop form as the natural default; the polite potere item also offers both the formal potrebbe (Lei) and informal potresti (tu) as neutral references, since "could you" is ambiguous between them. The AI marker should credit either. No ruling needed unless you want a single canonical reference per item.

---

## Notes for later dispatches

- **ConditionalUsage** (the `verb_form.condizionale.usage` stub) will own: politeness and softened requests (the *choice* to use vorrei / potresti / mi piacerebbe rather than the bare present), the apodosis of a hypothetical period (se avessi tempo, verrei), advice and opinion (dovresti, sarebbe meglio), the reported future-in-the-past as a *usage* point, and unconfirmed / attributed news (il presidente sarebbe arrivato). None of the *choice* is authored here — only the forms.
- **TenseChoice** owns the discrimination stub (`verb_form.condizionale.discrimination.vs_imperfect_counterfactual`), the prescriptive conditional-in-the-apodosis (se avessi tempo, verrei) versus the colloquial spoken imperfect (se avevo tempo, venivo). It mirrors the tense_choice tree's counterfactual buckets. Not authored here; the stub exists so cross-tree citations resolve.
- **Shared stems with the future.** Every irregular and orthographic stem in this batch is identical to the corresponding future stem (avr-, andr-, vorr-, verr-, sar-, far-, cercher-, comincer-). A learner shaky on a future stem will miss the matching conditional leaf and vice versa; the two trees are tightly coupled and worth sequencing together. The one stem note to carry forward: bere uses the short ber- (berrei), not the present's bev-, in both future and conditional.
- **avrei / sarei do double duty.** The 1sg avere and essere conditionals (avrei, sarei) are also the auxiliaries for the condizionale passato, so a learner shaky on them misses both the syncopated/essere leaf and the compound. Worth keeping in mind when sequencing, exactly as the future tree noted for avrò / sarò and the futuro anteriore.
- **Glossary dependency.** The explanations lean on **theme vowel**, **syncopation** and **assimilation** (all proposed in `glossary_suggestions_verb_form.future.json`, still pending merge) and **suppletive** (proposed in `glossary_suggestions_verb_form.present_indicative.json`, still pending). The conditional shares these exactly with the future, so I did not re-propose them. The one new term I do propose is **conditional perfect** (condizionale passato), parallel to the future author's **future perfect** (futuro anteriore).
