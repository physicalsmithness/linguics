# Coverage: verb_form.trapassato_prossimo (formation branch)

**Author:** PluperfectAuthor (formation dispatch, `DISPATCH_trapassato_formation.md`)
**Date:** 2026-06-09; reconciled to brief Rev 19 on 2026-07-15
**Brief:** authored against AUTHOR_BRIEF.md Revision 9; reconciled to Revision 19 (see "Rev 19 reconciliation" below)
**Open threads:** `inter_chat/Architecture_PluperfectAuthor_breadcrumb_label_leak.md` (CLOSED v2, labels shortened at source); `inter_chat/Architecture_PluperfectAuthor_rev19_reconciliation.md` (retrofit report + the wrong-person auxiliary ruling)
**Scope:** formation only. Two leaves: the avere auxiliary and the essere auxiliary. Usage and discrimination are left at the stubs owned by later dispatches (TrapassatoUsage, TenseChoice).

## Headline

34 grammar questions and 14 translation items (EN to IT). The tree is deliberately thin: the one new skill is the imperfect auxiliary (avevo, not ho; ero, not sono), and the weight of the batch is on drilling that single change across both auxiliaries, all six persons, a wide participle spread, and essere agreement across every gender and number. Auxiliary choice, participle form, and agreement itself are inherited from the passato prossimo and are cross-referenced there, not re-taught.

## Item counts by leaf

| Leaf | Grammar items | Translation items |
|------|--------------:|------------------:|
| avere auxiliary (avevo + participle) | 18 | 7 |
| essere auxiliary (ero + participle, agreeing) | 16 | 7 |
| **Total** | **34** | **14** |

Of the grammar items, 16 are single-mark (the avere assembly) and 18 are two-mark (the 16 essere items plus the 2 avere preceding-pronoun items, which add an agreement markpoint). CEFR target is B1 on 32 items and B2 on the two preceding-pronoun items.

## The markpoint design (the one decision worth flagging)

The two leaves are marked differently on purpose, and this is the main thing for the reviewer to sanity-check.

The avere leaf is a **single markpoint** on the whole assembled form (for example, accepts "avevo mangiato", rejects "ho mangiato"). There is no agreement to test on a plain avere verb, so the one skill is "did the learner put the auxiliary into the imperfect rather than the present", and the markpoint scores exactly that. The participle's own correctness is the passato prossimo's territory and is not re-marked here.

The essere leaf is **two markpoints**: an auxiliary-tense markpoint scored against this tree's essere leaf (accepts "era", rejects the present "è andato"), and an agreement markpoint scored against the matching passato prossimo agreement bucket (for example, accepts "andata", rejects "andato / andati / andate" for a feminine singular subject). This follows the brief's one-markpoint-per-skill rule: a learner who reaches for the imperfect auxiliary but botches the agreement, or vice versa, gets a clean hit on one and a miss on the other. The auxiliary markpoint matches the auxiliary word and the agreement markpoint matches the participle ending, so they score independently even with an intervening "già".

The same two-markpoint shape is used on the two avere items that carry a preceding direct-object pronoun ("le avevo messe", "l'aveva fatta"): the auxiliary-tense markpoint sits in this tree, the agreement markpoint cross-references the passato prossimo preceding-pronoun buckets. That agreement is inherited, so it is scored where it lives.

I verified by simulation (both with and without accent-stripping, since the engine's accent handling is soft) that on every grammar item the intended correct answer scores full marks and the present-auxiliary miss is caught by the guard, with no false positives on the correct form.

## The present-auxiliary miss (the key diagnostic)

Every item carries the present-auxiliary form in `must_not_include` on its auxiliary markpoint, so a learner who writes a passato prossimo where a pluperfect is wanted records a miss attributed to the formation skill rather than falling through silently. On the essere third-person-singular items the guard is the full form ("è andato") rather than the bare "è", deliberately: the engine collapses accents softly, so a bare "è" would normalise to "e" and could collide with the conjunction or with the "e" inside "era". The full form avoids that. Five of the translation items also carry an instructive-wrong reference (`polarity: negative`) showing the passato prossimo rendering, to anchor the AI marker against the same substitution.

## Participle spread (inherited surface, exercised here)

The dispatch asked me to confirm the inherited participle surface is exercised. It is, across all three regular classes and a broad set of irregulars, so the learner is never only ever assembling "avevo" plus one participle.

- Regular: -ato (mangiato, studiato, preparato, lavorato, comprato), -uto (venduto, creduto), -ito (finito, capito, dormito).
- Irregular (avere): visto, fatto, letto, detto, preso, scritto, messe (mettere).
- essere participles: andato, partito, venuto, uscito, tornato, arrivato, caduto, entrato, plus the irregulars nato (nascere), morto (morire), rimasto (rimanere).

## Person and agreement coverage

All six persons appear on both leaves. The essere agreement markpoints cover every gender-and-number cell:

| Agreement (essere) | Grammar items |
|--------------------|--------------:|
| masculine singular | 6 |
| feminine singular | 3 |
| masculine plural | 3 |
| feminine plural | 3 |
| mixed gender (defaults to masculine plural) | 1 |

The two preceding-pronoun avere items cover the feminine-plural and feminine-singular preceding-direct-object cases. Across the translation items the same agreement cells are exercised again, plus one preceding-pronoun case.

## Cross-references out of this tree

Every agreement markpoint and the preceding-pronoun markpoints reference passato prossimo buckets (the with-essere agreement set, the with-avere preceding-pronoun set). The translation items additionally list the imperfect tree as an optional bucket where the sentence carries an imperfect background clause ("non avevo fame", "erano stanchi"). All cross-referenced buckets were confirmed to exist in the passato prossimo and imperfect trees at authoring time.

## Breadcrumb suppression (criterion 15): RESOLVED 2026-07-12

I have **not** set `info_display: "suppress"` on any item, following the dispatch's steer that the avere / essere leaf names read as plain auxiliary labels the learner can infer from the verb anyway.

But I want to flag this rather than silently decide it, because it depends on something I cannot see. The leaf **labels as stored** are "avere auxiliary: avevo + participle (...)" and "essere auxiliary: ero + participle, agreeing (...)". If the housing renders the *short* label ("avere auxiliary" / "essere auxiliary") in the pre-answer breadcrumb, there is no leak and leaving it visible is correct. If the housing renders the *full* label, it shows the learner "avevo" / "ero" before they answer, which hands over the exact diagnostic (the imperfect auxiliary) on every item in the tree. In that case every item here should be suppressed.

So the call hinges on what the breadcrumb actually surfaces. I have left the flag off per the dispatch; if the breadcrumb shows the full label, treat this as a request to set `info_display: "suppress"` tree-wide, and I will add the flag on a follow-up. This is the single biggest open point in the batch.

**Update 2026-07-12 (PluperfectAuthor):** confirmed the breadcrumb renders the full friendly label, so the stored labels did leak `avevo` / `ero` on every item. Escalated to Architecture in `inter_chat/Architecture_PluperfectAuthor_breadcrumb_label_leak.md`, recommending the two leaf labels be shortened at source rather than suppressing tree-wide.

**Resolved 2026-07-12 (Architecture, thread v2, CLOSED):** ruling was to shorten the labels at source. The two formation leaves in `data/buckets/verb_form.trapassato_prossimo.json` now read `avere auxiliary` and `essere auxiliary`, with the `avevo` / `ero` worked detail kept verbatim in the `description` fields. No `info_display: "suppress"` on the 34 items: the terse labels restate only what the prompt already gives (the verb, from which the auxiliary follows) and do not name the diagnostic (putting that auxiliary into the imperfect). The batch needs no change. Architecture also added a terse-leaf-label steer to AUTHOR_BRIEF (Rev 12) to head off this class at authoring time.

## Items flagged uncertain

- ~~**tpp_es_nato_01** ("Il nonno raccontava che ____ in un piccolo paese")~~ **RESOLVED 2026-07-15 (Architecture, reconciliation thread v3): confirmed fine as-is, no change.** The question was whether the reported-clause context ("raccontava che"), which pins a past-before-past under standard backshift, was loose enough that a determined reader could argue for a passato remoto ("nacque") in a literary register, and so whether the anteriority wanted sharpening with an explicit prior anchor. Architecture's ruling: it is a formation item, the pluperfect form is unambiguous here, leave it. My read at the time was the same.
- ~~**The "person, not just tense" question on the essere auxiliary markpoint.**~~ **RESOLVED 2026-07-15 by criterion 18 (brief Rev 15); see the reconciliation section below.** The original note judged it acceptable that the auxiliary markpoint did not penalise a wrong-person imperfect auxiliary ("eravamo" on an "era" item), on the grounds that the prompt's subject scaffolds the person. That judgement was wrong, and criterion 18 shows why: the markpoint did not merely fail to penalise "eravamo", it **actively credited** it, because the unanchored phrase "era" substring-matched inside "eravamo". This was a false positive, not a tolerated gap. Anchoring the phrase (`match_at: "word"`) resolves it: the wrong-person auxiliary now records a clean miss on this tree's leaf. Reported to Architecture in the reconciliation thread rather than left in this doc (brief Rev 18).

## Rev 19 reconciliation (2026-07-15, PluperfectAuthor)

The batch was authored against brief Rev 9 and shipped 2026-06-09. The brief has since reached Rev 19. Reconciliation pass; thread `inter_chat/Architecture_PluperfectAuthor_rev19_reconciliation.md`.

**Criterion 18 (Rev 15, superstring safety) — a live marking bug, now fixed.** The batch shipped with **zero** anchored phrases and was not among the seven batches swept by the 2026-07-14 retro-audit. 27 item-phrase pairs were exposed. Two mattered: the bare `era` phrase sits inside `erano` / `eravamo` / `eravate`, and bare `aveva` sits inside `avevano` / `avevamo` / `avevate`. Because the engine checks `any_phrases` before `must_not_include` and a positive match wins, a learner writing "eravamo andati" on an `era` item scored **full credit on the auxiliary markpoint**. All 140 phrases (52 `any_phrases` + 88 `must_not_include`) now carry per-phrase `match_at: "word"`, the criterion-18 default. Verified by simulation against a port of the shipped `norm()` / `occursAt()`: all 34 correct answers still score full marks; "eravamo andati" on `tpp_es_lui_andato_01` drops 1.0/2.0 → 0.0/2.0; "l'avevano fatta" on `tpp_av_dop_la_01` drops 2.0/2.0 → 1.0/2.0 with the auxiliary missing and the agreement still hitting, which is the per-skill decomposition criterion 8 asks for. Elision is safe: `norm()` folds the apostrophe to a space, so `l'aveva fatta` still marks 2/2 under word anchoring.

**Criterion 17 (Rev 13, explanations translate the sentence) — applied to all 34.** Every explanation now opens with the completed correct sentence and its natural English gloss in the house shape (`'<Italian>' means '<English>.'`), followed by the existing four-beat working, which is unchanged. Versions bumped. Glosses verified programmatically against each prompt skeleton and each markpoint's correct form (0 divergences).

**Criterion 19 (Rev 16, accent as morpheme) — not applicable, confirmed.** No `any_phrase` in this tree carries an accent, so no answer has an accent-stripped twin that is itself a plausible answer. This is Rev 16's explicit do-nothing branch (`e` for `è`). The `è andato` guards stay as full forms, which is what the original batch reasoned and remains right.

**Rev 17 (ii) (no `must_not_include` inside a plausible correct attempt) — clean.** Audited all 88 guard entries against each item's plausible correct attempt: zero violations.

**Criterion 15 / Rev 19 recoverability — no change.** Architecture ruled these items breadcrumb-visible (see above). Rev 19's recoverability condition does not disturb that: these are formation items whose base form the cue supplies, and the label names the auxiliary, not the diagnostic.

## Criterion 21 reconciliation (2026-07-20, PluperfectAuthor)

Brief Rev 28 added criterion 21: a formation item must FORCE its target tense, not merely cue it with a bare temporal adverb. A fresh-context audit (`AUDIT_formation_trigger_2026-07-19.md`) flagged 3 of my items as ambiguous (all HIGH), each carrying `wrong_answer_is_form_error_only: true` while a well-formed competing tense was still typable — the live mis-attribution case Rev 28 targets. Thread: `inter_chat/Architecture_PluperfectAuthor_formation_trigger_retrofit.md`. Per Smith's option-B ruling (mechanism is the author's per-item call):

- **tpp_av_dop_la_01** and **tpp_es_sorelle_partite_01** — frame-strengthened. Each gained an explicit past reference clause ("Quando siamo arrivati, la torta era già in tavola: ..."; "Quando le ho cercate a casa, ...") so the anteriority forces the trapassato and the passato-prossimo competitor (l'ha fatta / sono partite) now reads wrong. The present-auxiliary guard, already present, becomes honest against the forced tense.
- **tpp_av_lui_02** — cue-tagged. Its competitor is the stative imperfetto *credeva*, which a frame cannot cleanly exclude, so the cue names the tense as a Rev-26-licensed trigger: "(credere, trapassato prossimo)". Added a criterion-18-safe *credeva* `must_not_include` with a steering note (no misconception tag: imperfetto-for-trapassato is a discrimination-family selection error, not formation's to attribute).

All three keep `wrong_answer_is_form_error_only: true`, now honest. Criterion-17 glosses rewritten to the new sentences; criterion-19 re-run clean (no reframed item has an accented answer, so no stripped twin — the frames add accented words to the PROMPT only); Rev 25 satisfied on the new cue (credere is an A2 citation infinitive at/below the item, exempt). Marking re-simulated against a port of the shipped `norm()` / `occursAt()`: the three correct answers still score full, the three competitors now miss, and the agreement decomposition is unchanged.

**Person backfill (same touch, thread v2).** The 8 items with no derivable person token now carry `person` set by hand: tpp_av_dop_la_01 3sg, tpp_es_nato_01 3sg, tpp_es_morto_01 3sg, tpp_es_rimasti_01 3pl, tpp_es_caduto_01 3sg, tpp_es_mixed_01 3pl, tpp_es_sorelle_partite_01 3pl, tpp_es_entrato_01 3sg. All finite third-person, none null.

**Smith review, 2026-07-20.** Two refinements after Smith read the reworked items in chat: (1) `tpp_es_sorelle_partite_01` was reframed again to a discovery frame ("Ho scoperto che le mie sorelle erano partite per Roma il giorno prima." / "I found out that my sisters had left for Rome the day before."), because the previous "when I looked for them at home" read oddly in English. (2) `tpp_av_lui_02`'s cue now names the tense in English as well as Italian, "(credere, trapassato prossimo / pluperfect)", because prompts are not glossary-wrapped (criterion 12), so an Italian-only tense name in a cue is opaque to a learner who knows the tense as the pluperfect. Marking re-simulated unchanged. The general policy point (English tense names in cues, estate-wide) is raised for Architecture in `inter_chat/Architecture_PluperfectAuthor_cue_tense_language.md`.

## Suggestions

- **bucket_suggestions:** none. The two formation leaves were sufficient; nothing needed a new bucket. (Empty array shipped.)
- **glossary_suggestions:** none. Every term used in the explanations (trapassato prossimo, passato prossimo, past participle, auxiliary, participle agreement, imperfect indicative, verb of motion, change of state, direct object pronoun) is already in `data/glossary.json`. (Empty array shipped.)

## Notes for the next dispatches

- **TrapassatoUsage** owns the usage leaf (the stub): when the pluperfect is the right choice for an action completed before another past point, and the reported-speech backshift ("Disse che era già partito"). My formation items deliberately keep the past-before-past context fixed by the sentence so the learner only builds the form; the *choosing* is usage's job.
- **TenseChoice** owns the discrimination leaf (the stub `Pluperfect vs imperfect / passato prossimo`). My items are never tense-choice items: the context always already calls for the pluperfect. If TenseChoice wants formation items to cite as prerequisites, the avere and essere leaves here are stable.
- The tree leans hard on the passato prossimo (participle, agreement, auxiliary choice) and the imperfect (the auxiliary's own conjugation). If either of those trees renames the cross-referenced buckets, the agreement and preceding-pronoun markpoints here will need the same rename.

## Misconception item-tagging (2026-07-20, PluperfectAuthor)

Phase-3 tagging applied. All 88 `must_not_include` guard entries across the 34 grammar items now carry a single registry id (object shape `{phrase, match_at, misconception}`, per the 2026-07-15 schema ruling), following MisconceptionAnalyst's pass-2 tag-list for this tree (which was built by reading the live guards, not inferred):

- 34 present-auxiliary guards to `auxiliary_choice.wrong_auxiliary_tense` (the specific harvested from these two leaves: "ho parlato" for "avevo parlato", "sono andato" for "ero andato").
- 48 essere agreement guards to `agreement.participle_essere_subject`.
- 6 preceding-direct-object-pronoun agreement guards to `agreement.participle_preceding_dop`.

Marking is untouched (tags are display/stats only): re-simulated 34/34 correct answers scoring full marks and the present-auxiliary miss firing, under both accent normalisations. `match_at: "word"` anchoring preserved on every entry. `any_phrases` deliberately untagged (dodges are never tagged, and they are the correct answers). Versions bumped to 3.

Two judgement calls flagged to Architecture / MisconceptionAnalyst rather than decided here (both in the thread):
1. The tag-list lists `auxiliary_choice.avere_for_essere` on the essere leaf, but no guard in this batch catches an avere-for-essere error (the guards catch the present-tense auxiliary, not the wrong auxiliary). Per "tag the guard that catches the miss", it is unused. Correct, or is a guard expected?
2. The mixed-gender item (`tpp_es_mixed_01`) took the generic `participle_essere_subject` per the uniform bucket-list, though a more specific `agreement.mixed_gender_default` exists in the registry and the item's own agreement bucket is the mixed-gender leaf. Followed the ruled tag-list rather than improvising a per-item refinement; flagging in case the finer tag is wanted.

**Both calls ruled and implemented, 2026-07-21.** Architecture stamped the 88 tags (verified 88/88 from disk) and commissioned the follow-up, now applied:

1. **avere-for-essere guards added, one per essere item (16 total)**, tagged `auxiliary_choice.avere_for_essere`, word-anchored, criterion-18 clean. Design note: Architecture's cited example was the present-avere "ha andato", but in the trapassato the *pure* avere-for-essere error holds the tense constant, so each guard is the imperfect-avere auxiliary matched to the item's person (aveva / avevano / avevi / avevate / avevamo / avevo), catching "aveva andato" rather than "ha andato". "ha andato" is a double error (avere AND present tense) that part-belongs to `wrong_auxiliary_tense`; flagged in the thread for Architecture to add a present-avere guard too if it wants that surface caught here.
2. **tpp_es_mixed_01 retag, per MisconceptionAnalyst's finer ruling**: only the `andate` guard (feminine plural, the last-noun-attraction mixed-gender error) becomes `agreement.mixed_gender_default`; `andato` / `andata` stay `agreement.participle_essere_subject`, because they are failures to pluralise at all, not mixed-gender errors. Architecture's wording was "retag the three"; the Analyst owns the error semantics and the thread header reads "one retag", so the one-guard split is what shipped.

Guard totals now: 34 `wrong_auxiliary_tense`, 16 `avere_for_essere`, 47 `participle_essere_subject`, 6 `participle_preceding_dop`, 1 `mixed_gender_default`, plus 1 deliberately-untagged `credeva` guard (a discrimination-family selection error, not formation's to attribute). Marking re-simulated: no regression on the 34 correct answers, and the avere-for-essere attempt now records a miss the essere items previously passed in silence.
