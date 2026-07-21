# Coverage: The passive (formation branch)

Authored by PassiveAuthor against AUTHOR_BRIEF **Revision 14**, then reconciled author-side to **Revision 17** and audited clean against **Revisions 19 to 22** (the brief moved from Rev 14 to Rev 17 while this batch was being written; see the reconciliation section below). Authored against DISPATCH_passive.md (with its Rev-13 addendum and OIC idea-bank appendix). Counts below are grepped from the shipped files, not from memory of batches.

**Both branches are authored, and a volume/person-band wave was added 2026-07-20.** The formation branch (four leaves) landed 2026-07-14 and was accepted; the usage branch (*Passive or active?*, *Passive or si passivante?*) landed 2026-07-17 authored against Rev 23 from the start, closing the residual the batch disposition left open. The tree has no unauthored leaves.

## Bucket-to-item counts

| Bucket (label) | Grammar | Translation (required) |
|---|---|---|
| Essere + participle | 8 | 8 |
| Venire + participle | 5 | 3 |
| Andare + participle | 5 | 2 |
| The agent with da | 5 | 3 |
| Passive or active? | 7 | 4 |
| Passive or si passivante? | 7 | 4 |
| **Totals** | **37** | **19 items** |

Grammar is counted by each item's primary (voice) markpoint. Translation counts required-bucket citations of a formation leaf; the essere and agent rows overlap on the two agent-bearing translation items (an agent item necessarily also exercises essere).

Direction: grammar is 21 production (Italian answer) + 2 recognition (it->en, English answer, both on the andare obligation reading). Translation is 7 en->it + 4 it->en. CEFR spread of the grammar: 1 A2, 9 B1, 11 B2, 2 C1, tracking the tree's bands (venire and andare weight to B2, agent and core essere to B1).

### Cross-tree agreement citations

The essere and andare double-agreement items split into two markpoints per criterion 8: a voice markpoint on the passive leaf, and a participle-agreement markpoint that cites the passato prossimo agreement tree, so the agreement skill accumulates in one place across topics. Citations landed:

- `verb_form.passato_prossimo.participle_agreement.with_essere.feminine_singular`: 4
- `verb_form.passato_prossimo.participle_agreement.with_essere.feminine_plural`: 4
- `verb_form.passato_prossimo.participle_agreement.with_essere.masculine_plural`: 1

All verified present on disk before citing.

## Rule-internalisation check

Per the content-authoring criterion, each rule is hit from several angles rather than to a target count.

- **Essere + participle** is drilled across all four tenses the tree cares about (present, passato prossimo, future, imperfect), across every gender/number of subject (fem sg, fem pl, masc pl, masc sg default), as fill-and-rewrite production and as translation both directions, with the compound double-participle stack (e stata inventata) isolated as its own agreement markpoint. The avere-passive miss is caught on every item.
- **Venire** is hit on the dynamic-vs-stative nuance (viene chiuso the action vs e chiuso the state), on the simple-tense-only restriction (a passato prossimo item where "e venuto arrestato" is the trap and essere is the answer), in the passato remoto narrative register, and in the plural. Both the dynamic and the essere alternative take full credit where context does not force one.
- **Andare** is hit on obligation in both directions (it->en recognition twice, en->it production twice), on the motion-misreading trap ("va" is not "goes"), and on the separate lexical loss sense (e andato perso), which motivates a bucket suggestion below.
- **The agent with da** is hit on the bare preposition (da + proper noun), all three article contractions (dal, dalla, dai), the di calque (possessive-looking), and the per calque (English "by" via Spanish por), each as the primary miss on at least one item.

## Marker-safety rulings

The engine checks `any_phrases` before `must_not_include` (positive match wins) and matches on substrings after `norm()` whitespace-collapse; per-phrase `match_at` (start/word/end) shipped 2026-07-13 and is honoured. This batch relies on both facts:

1. **Voice/agreement decomposition uses the bare auxiliary as the voice anchor.** The voice markpoint's `any_phrases` are the finite auxiliary alone (e / sono / viene / vengono / sara / era / veniva / fu / venne), and the agreement markpoint carries the participle (stack). So "e stato inventato" on a feminine item scores the voice markpoint (essere used) and misses the agreement markpoint (attributed correctly), rather than failing wholesale. Proven with a 29-case marking harness mirroring norm() + occursAt() + the positive-wins order (re-run green after the estate POS migration of 2026-07-15); all pass.
2. **`match_at: "word"` on every phrase, per criterion 18** (all 51 `any_phrases` and all 78 `must_not_include` entries; see the reconciliation section for the two false-credit bugs this caught). This stops "da" from satisfying itself inside "dal", stops "fa" (active reversion) from firing on "fatto", and stops "ha" from firing inside a participle. Verified: bare-"da" answers credit, "dal" on a bare-proper-noun agent falls through to no-credit (not a false hit), and "fa" catches only the standalone active verb.
3. **Both "e pagato" and "viene pagato" take full credit** in simple-tense rewrites, per the dispatch ruling; venire-leaf items also credit the essere alternative unless the item's context selects the dynamic reading (pas_ven_04, where "e chiuso" is a meaning miss and sits in must_not_include with a note).
4. **The venire compound-tense restriction** (pas_ven_02) cites the venire leaf but its correct answer is essere (e stato arrestato); the breadcrumb is left visible because naming venire tempts exactly the catchable "e venuto arrestato" error (the leak-vs-trap test, criterion 15).
5. **Andare obligation items cue the construction** ("con andare"), keeping the andare choice the tested skill. The equally-correct periphrastic "deve essere compilato" scores **0.9 with a steering note** under the Rev 17 dodge rule; at Rev 14 it was wrongly in `must_not_include`, which would have marked correct Italian wrong. See the reconciliation section.


## Volume wave: person bands (added 2026-07-20, brief Rev 31)

Smith added PassiveAuthor to the `DISPATCH_volume_formation.md` wave (I was not in the original To: list; the passive is a construction, not a tense paradigm, but its auxiliary conjugates and the person grid was third-person-only). Eight new first/second-person passive items plus a `person` backfill on the existing batch.

**Why it was needed.** Passives foreground the thing acted upon, so the batch was 22 items with 3sg subjects and 10 with 3pl, and *zero* first or second person. The six-band grid saw passive as a third-person-only construction. The new items add io / tu / noi / voi passive subjects (sono stato invitato, sei stata scelta, siamo stati invitati, siete stati eletti, ...), weighted to A1/A2 verbs (invitare, scegliere, pagare, chiamare, controllare, giudicare) per the wave's depth-over-exotica steer.

**Person bands now:** 1sg:2 / 2sg:2 / 3sg:12 / 1pl:2 / 2pl:2 / 3pl:11 (plus 14 items with `person: null`).

**The `person` field convention I used, flagged for ratification.** The dispatch says "`person` on every finite item, `null` on non-finite". A passive always has a finite auxiliary, so a literal reading would tag all 45. I set `person` only where the item's *marked answer produces* the finite passive verb (the essere/venire/andare production items, person = the auxiliary's person = the subject's person), and `null` where the answer is a preposition (agent-da items), an MCQ index (register / well-formedness), or English (it->en recognition). Reasoning: the person grid wants the person a learner *produces*, and an agent-da item that happens to sit in a 3sg sentence does not exercise person production. If the grid instead wants the clause's person regardless of what is blanked, say so and I will tag the other 14.

**Gates, all green on the replica (45 grammar, strict + folded).** Uniform per-phrase `match_at: "word"` (crit 18); every `must_not_include` guard fed as its own answer scores a miss, so zero dead guards and zero positive-nested-in-guard false credit (the dispatch's non-negotiable gate 2); tense forced by the rewrite source + named tense, never a bare adverb (crit 21 / Rev 26 trigger); no prompt contains its own answer (crit 20, plain-substring check); two-markpoint voice+agreement decomposition cross-credits the PP agreement tree (Rev 27). One gender-openness fix: `pas_ess_13` (1sg present, no named speaker) accepts both sono/vengo pagato and pagata, since Italian has no masculine default for a single speaker.

## Usage branch (added 2026-07-17, authored against Rev 23)

Fourteen grammar (5 of them MCQ) + 8 translation across the two usage leaves. Authored against the current brief from the start rather than reconciled afterwards, so no Rev 15-23 retrofit was needed.

**Why five MCQs.** *Passive or active?* is a register judgement and *which of these is impossible?* is a well-formedness judgement; neither is reachable by a substring marker over a free-typed blank. Index-scored MCQ is the honest instrument, and it is also the supplied-choice case, so criterion 19 does not apply (accent_load_bearing stays unset, per the Rev 21 carve-out). The rewrite items carry the load where the answer is a short verb complex.

**Rev 20 (i) dodge-vs-named-miss did real work here, in both directions.** The two usage leaves have opposite named misses, so the same construction is graded differently depending on the leaf:

- *Passive or active?* names **passive overuse** as its common_miss. So on `pas_use_reg_03` and `pas_use_reg_05`, keeping the passive where speech wants the active or the si form is the named diagnosis: **flat WRONG**, no 0.9 kindness.
- *Passive or si passivante?* names the **agent bolted onto the si form** as its common_miss. So on `pas_use_vsi_02`, the full passive on signage is merely correct-but-off-pattern: it **keeps the 0.9** with a steering note. On `pas_use_vsi_01`, where a da-agent is in the frame, the si form IS the named miss: **flat WRONG**.

**Cross-tree parity applied.** `si vende` + a plural noun scores **0.5 with a register note** on `pas_use_vsi_02` / `pas_use_vsi_04`, mirroring the ratified ruling on the si_constructions batch (`Architecture_SiConstructionsAuthor_graded_credit_parity`, RULED v2: the a-me-mi-piace class, ubiquitous, native, non-standard). Flagged for ratification since it is applied from another seat's thread.

**One ordering-protected guard, deliberate and exempt.** `pas_use_vsi_02` guards a bare `vendono` (the dropped-si active) while the correct answer `si vendono` contains it. Criterion 18 direction 3 flags the containment, but this is the brief's own exempt mirror case (`venire` inside `di venire`): the positive is checked first and wins, so the guard can never misfire and fires only on the dropped-si miss. Verified on all five paths (`si vendono` -> 1.0, `vendono libri` -> WRONG, `sono venduti` -> 0.9, `si vende` -> 0.5, `è venduto` -> WRONG).

**Suppression.** All 14 usage items suppress. Every one is recoverable: the MCQs supply the candidate set outright, the rewrites pin the register in plain words, and `pas_use_vsi_01` is frame-forced (the da-phrase in the sentence admits exactly one of the two candidates), which is the Rev 20 (ii) class.

## Rev 15/16/17 reconciliation (done author-side, same session, pre-consumption)

This batch was authored against Rev 14 and the brief reached Rev 17 mid-session. Reconciled as follows, verified by an engine-mirroring harness (29 attack/regression cases, all passing; it mirrors norm(), occursAt() and the any-before-must_not order read off `housing/js/norm.js`).

**Criterion 18 (Rev 15 superstring safety, plus the Rev 17 (ii) third direction).** All 51 `any_phrases` and all 78 `must_not_include` entries are now per-phrase `match_at: "word"`. Two genuine false-credit bugs were found and killed, both of the exact class the criterion targets:

- `pas_ven_03`: the unanchored `fu` credited a learner writing **furono chiuse** (wrong number). Now anchored: no credit.
- `pas_ess_07`: the unanchored `era` credited a learner writing **erano celebrate** (wrong number). Now anchored: no credit.

Checked in the Rev 17 (ii) direction too (no `must_not_include` entry may fire on a plausible CORRECT attempt): no violations, verified programmatically against every same-markpoint correct form.

**Not affected by the PiacereAuthor markpoint-level trap.** The ticker warning that `match_at` at markpoint level is silently inert does not touch this batch: every entry was authored per-phrase from the start, confirmed against `findMatchingPhrase` in norm.js.

**Criterion 19 (Rev 16, accent as morpheme): no action, by the criterion's own carve-out.** The only accented answers here are `è` (stripped twin `e`), `sarà`/`verrà` (`sara`/`verra`) and `andò` (`ando`). In none of these is the stripped form a plausible alternative ANSWER to the same prompt, and Rev 16 names `e for è` and `ando for andò` explicitly as do-nothing cases. No markpoint carries `accent_load_bearing`.

**Rev 17 (iv), the 0.9-for-dodges rule: three entries regraded.** This corrected one real authoring error where good Italian would have been marked wrong:

- `pas_and_03`: **deve essere compilato** was in `must_not_include` at Rev 14. It is correct Italian that merely sidesteps the drilled andare pattern, so a learner writing it would have been told they were wrong. Now a 0.9 any_phrase with a steering note.
- `pas_and_02`: **devono essere prese** scored a silent zero (uncredited cue miss). Now 0.9 with a steering note; the agreement markpoint still credits `prese` fully.
- `pas_ven_02`: **fu arrestato** scored full credit. It is a correct passive that rightly dodges the impossible venire compound, but the prompt asked for the passato prossimo. Now 0.9 with a steering note.

The state readings (`è compilato`, `è chiuso`) stay in `must_not_include`: they are meaning misses against an explicit cue, not dodges of a pattern.

**Rev 17 (iii), candidate_forms:** added to `pas_ven_04` (`["viene chiuso", "è chiuso"]`, correct_form `viene chiuso`), the one venire-vs-essere form discrimination in the branch. Flagged for ratification: the criterion's trigger is a `.discrimination.*` bucket and this is a formation leaf, so the field is offered, not assumed. The usage branch's *Passive or si passivante?* items will need it properly.

**Rev 20: audited, no changes needed (all four points verified, not assumed).**

- *(i) Dodge-vs-named-miss precedence.* The 0.9 kindness is withdrawn where the sidestep IS the bucket's named `common_miss`. Checked all three dodges against their leaf's `common_miss` text: none collides. The andare leaf's named miss is "reading 'va fatto' as motion, and missing the obligation sense entirely", and *deve essere compilato* / *devono essere prese* both EXPRESS obligation, so they are off-pattern, not the diagnosis. The venire leaf's named miss is the compound venire / motion reading, which *fu arrestato* is not. All three keep 0.9.
- *(ii) Frame-forced recoverability (the new sixth class).* This strengthens the agent items rather than changing them: the frame `è stato dipinto ____ Caravaggio` admits exactly a preposition, so the candidate set is recoverable from the sentence itself and suppression stands on the criterion's own terms, not merely on the prompt naming the slot.
- *(iii) Criterion 18's instruction-pinned mitigation class.* Not needed here: direction 3 is clean, no guard fires on any correct attempt.
- *(iv) §3 square-bracket meta-instruction convention.* Not engaged: no translation `source_text` in this batch carries a bracketed instruction.

**Rev 22 criterion 20 (cue by meaning, not by fragment): ONE real bug found and fixed, though passive was not in the next-touch census.** `pas_and_02` cued with an Italian gloss `(l'idea: devono essere prese)` that contained both `prese` (markpoint 1's entire agreement test) and the item's own 0.9 dodge phrase, so a learner could copy the cue for 1.9/2 without reaching for andare. Recued by bracketed English meaning `(meaning: they must be taken)`; the citation-form trigger `(prendere, con andare)` is exempt and stays, and `prompt_supplies_base_form` is now explicitly true. A mechanical leak check (does the prompt contain its own `any_phrase`?) is now clean across all 23. **The check must use plain substring, not word-boundary matching**: my first pass anchored it and returned a false CLEAN, because cue fragments are bounded by parentheses, not spaces. Routed to Architecture in `Architecture_PassiveAuthor_criterion20_cue_leak.md`.

**Rev 21: no changes.** (i) The criterion-19 supplied-choice carve-out ratifies the verdict this batch already recorded (accent_load_bearing unset throughout); the AccentAuditor sweep independently scores `passive 7/0`. (ii) The criterion-16 tense-tag additions do not apply: `pas_ven_04` uses `candidate_forms`, not tense tags. **Housing cleared the English-answer items** (thread CLOSED, all three assumptions confirmed, no code change).

**Disposition: batch ACCEPTED; delivery-review thread CLOSED at v4** with all six asks ruled (dodge boundary ratified as drawn; candidate_forms confirmed; brief documentation gap fixed in §2; English-answer items routed to Housing; proper nouns ruled to take `.noun`; the match_at-aware dead-guard refinement adopted verbatim into the canonical gate).

**Criterion 15 + Rev 19 (recoverability condition): audited, no changes.** Rev 19 narrows suppress-by-default to items whose candidate set is recoverable pre-answer, because suppressing a choice between different LEXEMES the prompt never reveals (bene/buono, questo/quello) makes the item unanswerable. All 21 suppressed items here survive the test: every prompt names the task and supplies the base form ("Riscrivi al passivo, al presente" plus the source verb; "Completa esprimendo obbligo con andare"; "Completa con la preposizione dell'agente"; the dynamic-vs-state contrast cued in plain meaning on `pas_ven_04`). The learner is always told what to produce, so no miss lands on a bucket they were not invited to engage. The agent items are the closest call (da / di / per are different lexemes), but the prompt names the slot's function outright, so the item stays answerable while the breadcrumb, which literally contains the answer ("The agent with da"), must stay hidden. `pas_ven_04` carries candidate_forms, which Rev 19 confirms still ride along for the post-answer tick.

**Estate POS migration (2026-07-15): shape clean, two sense-guesses wrong, both fixed.** All 40 distinct vocab_help refs were rewritten to the POS-bearing shape (`vocabulary.it.conto.noun.translation`) and none were left un-migrated, but having a POS segment is not the same as having the right one. Two refs carried bad guesses and are corrected: `napoli.adjective` -> `napoli.noun` (a place name) and `colpevole.adjective` -> `colpevole.noun` (the item substantivises it: "Il colpevole sarà punito"). Corpus-wide, proper nouns are mis-tagged 2 for 2 (the other is `italia.verb` in NounAuthor's file), and the controlled POS set has no `proper_noun` tag; routed to Architecture. The marking harness is green throughout (vocab_help does not feed marking).

**Dead guards: zero.** The containment check (no `must_not_include` phrase may contain a same-markpoint `any_phrase`) throws one hit here, `dallo` containing `dal` on `pas_agt_02`, but `dal` is word-anchored so it cannot match inside `dallo` and the guard is reached correctly (verified: `dallo` -> wrong, `dal` -> credit, `del` -> wrong). The check is anchoring-blind as proposed; refinement routed.

**Accent-folded path: clean.** Mirroring the engine's real precedence (strict -> accent-folded unless `accent_load_bearing` -> `must_not_include`, strict-only), `era spedita` does not credit `è` on the present item and `è celebrata` does not credit `era` on the imperfect item, while the fold-rescue still credits accent-omitted correct answers (`e stata inventata`, `e andato perso`). Word-anchoring is what closes the folded path too.

Version fields left at 1: these edits are same-session and pre-consumption, aligning with the reading RelativePronounAuthor has open with Architecture on the version-bump convention.

## Authoring decisions worth review

- **info_display: suppress on 21/23 grammar items** (grepped). The two visible are `pas_ess_02` (masculine-singular voice-only: the breadcrumb "Essere + participle" only restates the named task "riscrivi al passivo", so it leaks nothing) and `pas_ven_02` (the compound-restriction trap, kept visible by the leak-vs-trap test above). Every agreement item and every recognition item is suppressed because its breadcrumb names the -a/-e/-i output or the obligation reading.
- **The two andare recognition items are it->en with an English answer** (`language_code: "en"`), marked by substring on "must be / has to be / needs to be". This is the cleanest way to test that a learner reads "va compilato" as obligation, per the dispatch's recognition-heavy steer for andare. Flag if the housing does not expect an English-answer grammar item in an otherwise Italian topic.
- **Agent nouns carry no `gender` aspect in vocab_help.** Because the dal/dalla/dai contraction depends on the agent noun's gender, revealing it would hand over the answer (principle 1). Translation-only help is given; the gender is stated in the explanation post-answer.
- **No graded-credit entries were needed** in the formation branch (the dispatch's graded cases live in the usage branch's vs-si discrimination, still to come). All markpoints are 1.0.

## Items flagged uncertain

- `pas_and_01` / `pas_and_05` (the English-answer recognition items): the `must_not_include` guards the "goes / is going" motion misreading, but a free-typed English answer has more surface variety than an Italian one. If the housing's short-answer marker is strict-substring, the accepted set ("must be", "has to be", "needs to be", "should be") should cover the common phrasings; worth one look from Housing on whether English answers want a laxer match.
- `pas_and_04` (andare perso, loss sense): shipped citing the parent andare leaf, but it is arguably a different construction from obligation (see below).

## For the next dispatch / Architecture

- **Manifest wiring needed.** `passive` is not yet in `data/manifest.json` topics, so the housing will not load these files until it is added (standing ruling: a tree enters the manifest when its first content lands, which is now). Per the "authors flag, architect wires" norm restated on the relative batch, I am flagging rather than editing the shared file: please add `passive` to `manifest.topics`.
- **`bucket_suggestions_passive.json`** proposes splitting the andare leaf into `passive.formation.andare.obligation` and `passive.formation.andare.loss`. The single leaf conflates two constructions (present-tense obligation "va compilato" vs the compound loss idiom "e andato perso") that behave and miss differently; items already cite the parent so nothing strict-rejects. Low priority, an honest taxonomy flag, not a blocker.
- **`glossary_suggestions_passive.json`** proposes *passive voice* and *dynamic passive*. It deliberately does NOT re-propose *agent*: the glossary already carries "passive agent" (merged to v3, 2026-07-14).
- **DISPATCH_passive.md status line is stale.** Its top still reads "DRAFT, authored off-bridge, validate before sending", but `_COMMITTED.md` and DECISIONS confirm the tree and dispatch went live 2026-07-14. Worth a one-line correction so the next author is not misled. (I treated the committed tree as canonical.)
- **Usage branch pending.** *Passive or active?* (register skill) and *Passive or si passivante?* (the agent test: the si form cannot take da + agent) are not authored yet. The vs-si discrimination is suppress-by-default (criterion 15) and cites `si_constructions.passivante.agreement` (verified present).
- **Misconception-axis candidates** ready for Phase 3 tagging (registry is Architecture-owned): the avere-passive (must_not "ha"/"hanno" across the essere items), the di/per agent calques (agent items), and "va fatto" read as motion (the andare recognition items and pas_ven/pas_and traps).
