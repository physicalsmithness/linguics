# Coverage: Nouns (`noun`)

Authored by NounAuthor against AUTHOR_BRIEF **Revision 14**, then **reconciled to Revision 17** the same evening (the brief moved 14 to 15 to 16 to 17 mid-pass; see the reconciliation section below). DISPATCH_noun.md topic notes and OIC idea bank applied. Counts below are grepped from the shipped files, not from memory of batches.

## Bucket-to-item counts

| Bucket (label) | Grammar | Translation (required) |
|---|---|---|
| -o masculine, -a feminine | 4 | 1 |
| -e nouns (gender to learn) | 9 | 3 |
| Irregular gender | 7 | 3 |
| Regular plurals | 6 | 3 |
| Spelling shifts in the plural | 11 | 5 |
| Invariable nouns | 6 | 2 |
| Irregular plurals | 6 | 4 |
| Plural of compound nouns | 3 | 1 |
| **Totals** | **52** | **22 items** |

Translation direction split: 14 en-it, 8 it-en (novice topic, so weighted toward production into Italian, per the brief's "maybe more en->it for novices"). Several translation items also cite optional buckets in sibling trees (articulated prepositions alla/sui; noun gender on the mani item).

## Rule-internalisation check (per the content-authoring criterion)

Judged by whether each rule is hit from several angles, not by item counts. The two hot bedrock leaves carry the load:

- **Gender** is drilled three ways: article completion (il/un vs la/una, both definiteness values of the correct gender accepted so only gender is tested), predicate-adjective agreement (feminine-tested only, so the masculine citation revealed by help is never the answer), and translation in both directions. The -e leaf gets a wide lexical spread (fiore, notte, pane, chiave, fiume, nave, nome) because it is pure per-word learning, plus the meaning-conditioned homograph pair il capitale / la capitale (house technique 3). Irregular gender covers all four sub-patterns: Greek -ma (problema, programma, tema), feminine -o (mano, foto, radio), and masculine -a person (poeta).
- **Plural** hits -o/-e to -i and -a to -e from six regular angles, then the spelling leaf (the heaviest at 11) covers every branch: soft -co/-ci (amico, medico), hard -co/-go +h (fuoco, ago), feminine -ca/-ga +h (amica, barca), -cia keep-vs-drop i split (camicie vs arance), -gia drop (piogge), and the stressed/unstressed -io contrast (zii vs figli). amico is planted inside the regular-looking set as the exception (house technique 2). Invariable covers accented finals, foreign words, monosyllables, -i endings and clipped words. Irregular plural covers suppletive (uomo), gender-switchers (uovo, paio) and the meaning-split braccia/bracci pair. Compound covers the three behaviours (final-element capolavori, noun-part asciugamani, invariable portachiavi).

## Reconciliation to Rev 15 / 16 / 17

The brief advanced three revisions during this pass. Audited item-by-item, mechanically where possible:

- **Criterion 18 (Rev 15), superstring safety - compliant, by convergence not luck.** The batch was authored with `match_at: "word"` on *every* any_phrase and *every* must_not_include entry from the outset, because the same hazard was found independently while porting the engine to build the harness. Harness reports **0 unanchored phrases** across 52 items. One retrofit applied on reconciliation: `noun_plur_irr_04` (bracci) used `match_at: "end"`; moved to `"word"`, the criterion's stated default, closing the leftward edge. Re-verified after the change: wrong `braccia` / `le braccia` to miss, correct `bracci` to hit.
- **Criterion 18 third direction (Rev 17 ii), must_not not a substring of a plausible CORRECT attempt - compliant, 0 defects.** Tested against plausible correct attempts (bare, with article, with quantifier, frame retyped) using the real defect condition: a must_not that fires *while no positive match rescues it*. Zero. The singular forms deliberately sitting in must_not (fiore, cane, studente, zio) catch the didn't-pluralise miss and can never fire on a correct answer, because the correct plural is always in any_phrases and the positive path is checked first.
- **Criterion 19 (Rev 16), accent as morpheme - no action, per the ruling's own second limb.** Two accented answers exist (`citta`, `caffe`, written with their accents in the data). Their accent-stripped twins are not words, so neither is "a plausible alternative ANSWER to the same prompt". The ruling states that where the stripped form is not a candidate answer, do nothing: the standard fold-rescue plus orthography miss is the right verdict. `accent_load_bearing` is set nowhere in this batch. Noun minimal pairs that *would* trigger it (papa with and without the accent, pero) are not in this batch.
- **Criterion 17 (Rev 13), explanations translate the sentence - carried throughout.** All 52 explanations open with or contain a plain English gloss of the completed sentence.
- **Rev 17 (iv), the 0.9-for-dodges rule - no exposure found.** No item here admits correct Italian that sidesteps the drilled pattern: the plural drills demand the plural form outright, and the gender items demand an article or an agreeing adjective. Nothing to grade at 0.9. Recorded as checked, not skipped.
- **Rev 17 (iii), candidate_forms for non-tense discriminations - RULED by Architecture 2026-07-15 (make them candidate_forms), APPLIED 2026-07-21. See the residual-pass section at the end.**

## info_display: suppress rationale (30 of 52 grammar items; was 26 before the 4 meaning-pair items became candidate_forms discriminations on 2026-07-21)

Applied per criterion 15's leak-vs-trap test, decided per item, not per leaf:

- **Suppressed** where the breadcrumb names a non-derivable class the item tests: all **Irregular gender** items (the "-a is a trap" fact is exactly what is tested), all **Invariable** items (the breadcrumb *is* the answer, "doesn't change"), all **Irregular-plural** items except the braccia/bracci pair, all **Compound** items, and the **Spelling** items where the naive ending-swap yields a wrong form (ago to aghi, fuoco to fuochi, amica to amiche, barca to barche, arancia to arance, pioggia to piogge): naming "spelling shift" there hands that an extra change is needed.
- **Left visible** where the breadcrumb only restates the cue or sets a productive trap the `must_not_include` catches: all **Regular gender** and **Regular plural** items; the **-e nouns** items (the class is visible from spelling and the breadcrumb never says which gender); and the **Spelling** items where the naive swap is already correct so the breadcrumb only tempts a catchable over-correction (amico to amici tempts amichi; figlio to figli tempts figlii; camicia to camicie tempts camice; zio to zii). The braccia/bracci pair stays visible because *meaning*, stated in the prompt, conditions the answer, not the breadcrumb.

Note for Rev 17's `default_info_display` aggregate flag: **Invariable nouns** is a clean candidate (6 of 6 suppressed), and **Irregular gender** likewise (7 of 7). Not adopted here since Housing resolver support is pending; per-item flags are set and would be harmlessly redundant.

## Marker-safety (verified by harness, not asserted)

A Python port of `housing/js/norm.js` + `grammar_engine.js` (any_phrases-before-must_not_include, `match_at` word/start/end anchoring, accent-folded fallback) was run over every item, and re-run against the **shipped** files after copy: each correct form to hit; each `must_not_include` form to attempted-miss with no false credit; blank to not-attempted. 0 failures, 0 warnings.

Three engine facts drove the authoring and are worth recording:

1. **`norm()` turns apostrophes into spaces**, so an elided indefinite before a vowel normalises to the same string as the bare masculine, and the elision gender-tell collapses. Every gender item therefore cues via a consonant-initial article or a predicate adjective, never via the elided form before a vowel. (This is the noun-side twin of the apostrophe-fold problem ArticleAuthor flagged.)
2. **Positive match wins before `must_not_include`**, so any answer that is a prefix of a plausible wrong form is anchored. The load-bearing case is `bracci` (mechanical arms), a prefix of `braccia` (body): without anchoring, a learner wrongly typing `braccia` on the mechanical item would false-match the `bracci` phrase and be credited. Same discipline on `un` (inside `una`), `figli` (inside `figlii`), `zi` (inside `zii`), `re` (inside `tre`).
3. **The accent-folded fallback makes accents soft by default.** The accented invariable items credit a missing accent as a recorded orthography slip, not a wrong answer - which criterion 19 confirms is the right verdict here.

## Phase-3 misconception tagging (registry is Architecture-owned; not tagged here)

The wrong forms in `must_not_include` are ready for Phase-3 attribution. One correction for whoever runs that pass: **DISPATCH_noun.md names `omitted_h_hard_cg` and `double_i_retained` as the targets, but those two registry entries are the verb-formation tags** (for -care/-gare and -ciare/-giare verbs). The noun-plural analogue that already exists is **`orthography.cg_plural_stress_misapplied`** (its label literally says "plural"), which is the right home for the -co/-go/-ca/-ga misses (amichi, agi, fuoci, amice, barce). The **-cia/-gia noun i-retention split** (arance vs arancie, camicie vs camice, piogge) has **no exact registry tag**: the closest are the verb tags `double_i_retained` / `i_retention_error`. Flagged for Architecture: either widen one of those to cover nouns, or add an `orthography.cia_gia_plural_i` entry. I did not invent a tag (stay-in-role).

## Open question for Architecture: do the meaning-pair items become candidate_forms discriminations?

Rev 17 (iii) generalises criterion 16 to non-tense discriminations (`candidate_forms` + `correct_form`, suppressed pre-answer), off the back of PossessiveAuthor's suo-referent and DemonstrativeAuthor's questo/quello cases. Four items here are structurally similar - the braccia/bracci pair (`noun_plur_irr_03`/`04`) and the il capitale / la capitale pair (`noun_gen_e_08`/`09`) - and I have **not** applied candidate_forms to them. Reasoning, for you to overrule:

Criterion 16 targets items where the learner must **detect from context** that a choice is in play. These four **supply the sense explicitly in the prompt** ("(parte del corpo)", "(di una macchina)", "In economia, ..."). Per the project's own formation-supplies-the-trigger principle, supplying the trigger makes a miss unambiguously "couldn't form it" rather than "didn't realise a choice applied", which makes these formation items with a stated sense, not discriminations. On that reading candidate_forms would miscategorise them, and the suppress that rides with it would hide a breadcrumb that leaks nothing.

If you disagree, the change is mechanical but not mine to make unilaterally: it needs a discrimination leaf under each parent (the noun tree has none), then candidate_forms/correct_form plus `info_display: "suppress"` on the four items. Say the word and I will do it; the bucket itself would be architecture-side.

## Items flagged uncertain

- **`noun_plur_irr_05` (dito to dita).** The standard collective plural is `dita`; the technical `diti` (fingers counted individually) is deliberately kept out of `must_not_include` so it falls to a generic miss rather than being branded a clear error. If Architecture wants `diti` credited at reduced weight, add it to `any_phrases` as an object entry with credit 0.6 and match_at word.
- **Predicate-adjective gender items** (`noun_gen_reg_03`, and the design generally) bucket the miss at a noun gender leaf while the surface skill is adjective agreement. Intentional (the diagnostic is the noun's gender, stated in `examiner_note`), but if the cross-tree double-counting bothers the stats panel, these could be re-pointed or dropped without hurting coverage.
- **Both-articles acceptance on gender items.** Masculine items credit both `il` and `un` (feminine, both `la` and `una`), because definiteness is not what is tested. If Housing renders a single-slot blank the learner may not realise both are fine; the explanation says which is natural. No marker risk. This is the batch's single largest design decision (it touches roughly 20 items), so it is the first thing to overrule if it reads wrong.

## For the next dispatch / Architecture

- `bucket_suggestions_noun.json` **NOT produced**: the supplied tree covered everything authored; no new noun buckets were needed (unless the discrimination question above is answered yes).
- `glossary_suggestions_noun.json` proposes three new terms - **gender**, **suppletive plural**, **clipped word**. `agreement`, `invariable` and `articulated preposition` already exist and are reused, not re-proposed.
- **`data/manifest.json` needs `noun` added** to the topics list so the loader discovers the two item files. I have **not** touched the manifest (shared/architecture-owned per stay-in-role); flagging it here, as the relative_pronoun, piacere, existential and passive batches each did.
- **No engine ask, and no brief errata outstanding.** The `match_at` documentation errata that the relative_pronoun coverage and my own first draft both flagged was **resolved in Rev 17 (i)**; that note is withdrawn.

## Residual pass, 2026-07-21 (reconciliation to brief Rev 28, on wake)

The brief advanced 17 -> 28 after delivery; Architecture ACCEPTED the batch (disposition thread v1, 2026-07-15) and answered both coverage-doc asks. This pass delivers the residuals. Evidence and stamp requests are in `inter_chat/Architecture_NounAuthor_batch_disposition.md` v2 (the thread is the contract, per Rev 18; this doc is the record).

**candidate_forms applied to the 4 meaning-pair items** (Architecture ruled YES on the open question this doc raised). `noun_gen_e_08`/`_09` carry `candidate_forms: ["la capitale (capital city)","il capitale (money, funds)"]`; `noun_plur_irr_03`/`_04` carry `["braccia (parts of the body)","bracci (mechanical arms)"]`; each `correct_form` is the asked sense; `info_display: suppress` added (count 26 -> 30). **Rev 19 recoverability is satisfied on all four** — the prompt pins the sense pre-answer (sentence context for capitale; the explicit `(parte del corpo)`/`(di una macchina)` gloss for braccio) and supplies the base — so suppress is answerable, not a bene/buono-style lexical guess. Marking is unchanged (the fields are display-only); harness re-run 0 fails. This overrides the earlier "stays visible" call recorded above for the braccia/bracci pair.

**Misconception tags applied inline to the spelling leaf** (9 must_not entries): `orthography.cg_plural_stress_misapplied` x6 (amichi, medichi, agi, fuoci, amice, barce) and `orthography.cia_gia_plural_i` x3 (camice, arancie, pioggie) — both confirmed registry ids (Architecture created cia_gia_plural_i after last pass's flag). Because `noun` is not yet a topic in `misconception_tag_lists.json`, provenance is filed in `misconception_suggestions_noun.json`. **One new gap flagged, not invented:** the -io i-count misses `figlii`/`zi` have no registry home (the -ciare/-giare and -iare tags are verb-only); `orthography.io_plural_i_count` proposed, those two left untagged pending Architecture's ruling.

**Cue / class-token retrofits, audited plain-substring (never word-anchored, per PassiveAuthor's paren-boundary warning) — all no-ops:** crit 13 centrally discharged for noun (all-authors except PronounAuthor); crit 25 no-op (every cue is the target's own singular or base, <= item level; the one base cue `(dito)` on a B1 item is A1); crit 20 no-op (0 fragment-cue-equals-answer; Rev 23 predictor confirms bare cues yield visibly-broken Italian); crit 19 no-op and recorded NOT FIRED (no crit-20 gloss, so Rev 23's disarm path never triggered); crit 21 (Rev 28) N/A (noun plural has no tense/aspect axis). Evidence in thread v2, stamps requested.

