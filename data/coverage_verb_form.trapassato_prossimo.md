# Coverage: verb_form.trapassato_prossimo (formation branch)

**Author:** PluperfectAuthor (formation dispatch, `DISPATCH_trapassato_formation.md`)
**Date:** 2026-06-09
**Brief:** AUTHOR_BRIEF.md Revision 9
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

## Breadcrumb suppression (criterion 15): one thing for Architecture / Housing to decide

I have **not** set `info_display: "suppress"` on any item, following the dispatch's steer that the avere / essere leaf names read as plain auxiliary labels the learner can infer from the verb anyway.

But I want to flag this rather than silently decide it, because it depends on something I cannot see. The leaf **labels as stored** are "avere auxiliary: avevo + participle (...)" and "essere auxiliary: ero + participle, agreeing (...)". If the housing renders the *short* label ("avere auxiliary" / "essere auxiliary") in the pre-answer breadcrumb, there is no leak and leaving it visible is correct. If the housing renders the *full* label, it shows the learner "avevo" / "ero" before they answer, which hands over the exact diagnostic (the imperfect auxiliary) on every item in the tree. In that case every item here should be suppressed.

So the call hinges on what the breadcrumb actually surfaces. I have left the flag off per the dispatch; if the breadcrumb shows the full label, treat this as a request to set `info_display: "suppress"` tree-wide, and I will add the flag on a follow-up. This is the single biggest open point in the batch.

## Items flagged uncertain

- **tpp_es_nato_01** ("Il nonno raccontava che ____ in un piccolo paese"): the reported-clause context ("raccontava che") pins a past-before-past in standard backshift, but a determined reader could argue for a passato remoto ("nacque") in a literary register. The item is formation, not discrimination, and the answer is unambiguously the pluperfect form here, so I kept it; flagging in case the reviewer wants the anteriority sharpened with an explicit prior anchor.
- **The "person, not just tense" question on the essere auxiliary markpoint.** That markpoint tests imperfect-versus-present, and it matches the auxiliary word; it does not separately penalise a wrong-person imperfect auxiliary (for example "eravamo" written on an "era" item), which would land in the passato prossimo person-agreement bucket rather than here. The prompt's subject scaffolds the person, so I judged this acceptable, but if the project wants wrong-person auxiliaries caught in this tree, that is a small change to the matching and worth a ruling.

## Suggestions

- **bucket_suggestions:** none. The two formation leaves were sufficient; nothing needed a new bucket. (Empty array shipped.)
- **glossary_suggestions:** none. Every term used in the explanations (trapassato prossimo, passato prossimo, past participle, auxiliary, participle agreement, imperfect indicative, verb of motion, change of state, direct object pronoun) is already in `data/glossary.json`. (Empty array shipped.)

## Notes for the next dispatches

- **TrapassatoUsage** owns the usage leaf (the stub): when the pluperfect is the right choice for an action completed before another past point, and the reported-speech backshift ("Disse che era già partito"). My formation items deliberately keep the past-before-past context fixed by the sentence so the learner only builds the form; the *choosing* is usage's job.
- **TenseChoice** owns the discrimination leaf (the stub `Pluperfect vs imperfect / passato prossimo`). My items are never tense-choice items: the context always already calls for the pluperfect. If TenseChoice wants formation items to cite as prerequisites, the avere and essere leaves here are stable.
- The tree leans hard on the passato prossimo (participle, agreement, auxiliary choice) and the imperfect (the auxiliary's own conjugation). If either of those trees renames the cross-referenced buckets, the agreement and preceding-pronoun markpoints here will need the same rename.
