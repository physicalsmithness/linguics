# CEFR band grounding for the verb-tense trees

Purpose: sanity-check the `cefr_importance` bands in the bucket trees against an authoritative external source, rather than leaving them as architect-riffed defaults. Triggered by Smith asking (2026-06-08) whether the bands are "way off".

**Source of record:** the *Profilo della lingua italiana* (Spinelli & Parizzi, the official CEFR reference-level description for Italian), grammar / verbs section, hosted by the Università per Stranieri di Perugia. The A2 verbs page was fetched directly; B1/B2 confirmed via the framework summary. See Sources at the bottom.

## Verdict

**Not way off.** The existing bands track the Profilo closely, including the one call I had privately worried was too conservative (imperfetto core at B1, not A2). The Profilo vindicates it. No urgent corrections to the built trees; the value of this pass is mostly in **locking the levels for the trees not yet built** (future, conditional, subjunctive) so we don't riff those.

## Band-label convention (how to read `cefr_importance`)

- `arcane`: below or irrelevant at this level.
- `preview`: introduced here, in limited or partial form.
- `core`: the level at which this is the central thing to learn (the Profilo's "consolidation" point).
- `review`: already known, maintained.
- `fluency`: refinement / native-like nuance.

The rule of thumb: a tense's `core` band should sit at the Profilo level where it is taught as a full system, not where it is first glimpsed.

## Sourced per-tense levels

From the Profilo (A2 page fetched verbatim; B1/B2 from the framework):

| Form | Introduced | Core (full system) | Notes from Profilo |
|---|---|---|---|
| presente indicativo | A1 | A1-A2 | regular + high-freq irregular, reflexive, reciprocal |
| passato prossimo | A1-A2 | A2 | listed at A2 |
| imperfetto | A2 (essere/avere, descriptive only) | B1 | A2 page explicitly limits it to "imperfetto **di essere e avere** nella descrizione"; the full system (all verbs, habitual, narrative) is B1 |
| futuro semplice | A2 | A2 | "valore temporale, es. Domani pioverà" listed at A2 |
| imperativo | A2 (informal tu/noi/voi, affirm.+neg.) | A2-B1 | formal Lei imperative is B1 |
| stare + gerundio (progressive) | A2 | A2-B1 | "forma perifrastica / presente progressivo" listed at A2 |
| modals (dovere/potere/volere) | A1-A2 | A2 | A2 page, "con consapevolezza del valore pragmatico" |
| condizionale presente | B1 | B1 | possibility, desire, attenuated request (vorrei, potresti) |
| congiuntivo presente | B1 (exhortative 3sg) | B2 | full use in subordinate clauses is B2 |
| condizionale composto | B1-B2 | B2 | pairs with the subjunctive system |
| congiuntivo imperfetto / passato / trapassato | B2 | B2 | |
| periodo ipotetico | B1 (reale) | B2 (irreale/impossibile) | |
| trapassato prossimo | B1 | B1 | |
| passato remoto | B2 (recognition) | C1 (active/literary) | |

## Check against the built trees

- **present_indicative** root: A1 core, A2 core. ✓ matches.
- **passato_prossimo** root: A1 preview, A2 core. ✓ (A1-preview is fine; the Profilo groups PP A1-A2.)
- **imperfect** root: A2 preview, B1 core. ✓ **vindicated** by the A2 page's essere/avere-only limit.
- **tense_choice** `indicative_vs_subjunctive`: B1 preview, B2 core. ✓ matches (B1 exhortative intro, B2 full).
- **tense_choice** `future_vs_present`: B1 core. ✓ The future *form* is A2, but the *choice* (present-for-future vs morphological future) is genuinely a B1 discrimination, so the band is right for what this bucket tests.

No band in the built trees needs to move. Optional micro-nudge if ever revisited: none required.

## Forward locks for trees not yet built

These are the levels the upcoming dispatches must use, so the bands are grounded from the start:

- **Future tree** (`verb_form.future`): formation **core at A2**, not B1. Futuro semplice is an A2 form per the Profilo. Future-of-probability / supposition is B1-B2. Futuro anteriore is B1-B2.
- **Conditional tree** (`verb_form.condizionale`): present conditional **core at B1**. Past conditional B1-B2. The counterfactual use inside the periodo ipotetico is B2.
- **Subjunctive tree** (`verb_form.congiuntivo`), when built: congiuntivo presente preview at B1 (exhortative), **core at B2**; imperfetto/passato/trapassato congiuntivo B2; full hypothetical-period command B2-C1.
- **Passato remoto** (if built): B2 recognition, C1 active. Keep it low-priority (arcane/preview until B2).

## Status

Grounding complete; bands confirmed sound. This file is the reference for CEFR levels on any future tense tree. If a future authoring chat or the housing CEFR filter needs a defensible level, cite this.

## Sources

- [Profilo della lingua italiana, Grammatica, i verbi, livello A2](https://www.unistrapg.it/profilo_lingua_italiana/site/gram_verbi_a2.html) (fetched directly)
- [Profilo della lingua italiana, Grammatica, i verbi, livello B1](https://www.unistrapg.it/profilo_lingua_italiana/site/gram_verbi_b1.html)
- [Profilo della lingua italiana, Grammatica, i verbi, livello B2](https://www.unistrapg.it/profilo_lingua_italiana/site/gram_verbi_b2.html)
