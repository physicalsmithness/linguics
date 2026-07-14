# Coverage: The passive (formation branch)

Authored by PassiveAuthor against AUTHOR_BRIEF **Revision 14**, then reconciled author-side to **Revision 17** (the brief moved from Rev 14 to Rev 17 while this batch was being written; see the reconciliation section below). Authored against DISPATCH_passive.md (with its Rev-13 addendum and OIC idea-bank appendix). Counts below are grepped from the shipped files, not from memory of batches.

**Scope of this pass: the formation branch only** (the four leaves under *Forming the passive*). The usage branch (*Passive or active?* and *Passive or si passivante?*) is not yet authored and follows in the next pass. No content existed for this topic before this batch.

## Bucket-to-item counts

| Bucket (label) | Grammar | Translation (required) |
|---|---|---|
| Essere + participle | 8 | 6 |
| Venire + participle | 5 | 3 |
| Andare + participle | 5 | 2 |
| The agent with da | 5 | 2 |
| **Totals** | **23** | **11 items** |

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

**Criterion 15 + Rev 19 (recoverability condition): audited, no changes.** Rev 19 narrows suppress-by-default to items whose candidate set is recoverable pre-answer, because suppressing a choice between different LEXEMES the prompt never reveals (bene/buono, questo/quello) makes the item unanswerable. All 21 suppressed items here survive the test: every prompt names the task and supplies the base form ("Riscrivi al passivo, al presente" plus the source verb; "Completa esprimendo obbligo con andare"; "Completa con la preposizione dell'agente"; the dynamic-vs-state contrast cued in plain meaning on `pas_ven_04`). The learner is always told what to produce, so no miss lands on a bucket they were not invited to engage. The agent items are the closest call (da / di / per are different lexemes), but the prompt names the slot's function outright, so the item stays answerable while the breadcrumb, which literally contains the answer ("The agent with da"), must stay hidden. `pas_ven_04` carries candidate_forms, which Rev 19 confirms still ride along for the post-answer tick.

**Estate POS migration (2026-07-15) landed cleanly here.** All 40 distinct vocab_help refs across the two item files were rewritten to the POS-bearing shape (`vocabulary.it.conto.noun.translation`); none were left un-migrated, and the marking harness is green afterwards (vocab_help does not feed marking).

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
