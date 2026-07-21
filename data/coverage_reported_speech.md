# Coverage: Reported speech

**Authored by:** ReportedSpeechAuthor, 2026-07-14
**Against:** AUTHOR_BRIEF Revision 14, DISPATCH_reported_speech.md (incl. the Rev 13 addendum and the OIC idea bank)
**Delivered:** 39 grammar items (`rep_`), 20 translation items (`trans_rep_`), 3 bucket suggestions, 4 glossary suggestions

---

## Bucket-to-item counts

All seven active leaves are covered. Weighting follows the dispatch's hot-spot order: Future becomes PAST conditional is the heaviest, followed by the two backshift-discipline leaves.

| Leaf (label) | id | Grammar | Translation |
|---|---|---:|---:|
| Future becomes PAST conditional | `tense_shift.future_to_past_conditional` | 7 | 4 |
| Present becomes imperfect | `tense_shift.present_to_imperfect` | 6 | 6* |
| Domani becomes il giorno dopo | `deixis` | 6 | 5* |
| No shift after dice | `tense_shift.no_shift` | 5 | 2 |
| Past becomes trapassato | `tense_shift.past_to_trapassato` | 5 | 2 |
| Reporting commands: di + infinitive | `commands` | 5 | 3 |
| Reporting questions: se and the wh-words | `questions` | 5 | 3 |

\* Counts include items whose primary target is another leaf but which carry this leaf in `required_buckets` (reported questions backshift; deixis rides along on several shift items). Primary-target counts are 3 and 3 respectively.

Direction split on translation: 16 en→it, 4 it→en. The it→en items sit exactly where the dispatch marks the tree bidirectional — the jewel leaf (2) and deixis (2) — and they carry the recognition-side traps: reading `sarebbe arrivato` as "would have arrived", and reading `il giorno prima` as "yesterday".

## Cross-tree citations made

Per the dispatch's citation rule, tense-shift items fire both the topic-facing leaf and the structural home in the sibling tree:

| My leaf | Also fires | Grammar items |
|---|---|---:|
| Future becomes PAST conditional | `verb_form.imperfect.indirect_speech.reported_intention` | 7 |
| Present becomes imperfect | `verb_form.imperfect.indirect_speech.reported_present` | 6 |
| Past becomes trapassato | `tense_choice.trapassato_vs_imperfect.completed_prior_to_prior` | 5 |
| Domani becomes il giorno dopo | `demonstrative.quello` | 1 |

Translation items add the same pairs via `required_buckets`, plus `verb_form.condizionale.formation.condizionale_passato` as an optional bucket on the two jewel en→it items.

All cross-tree ids were verified on disk before authoring. No `rep_` / `trans_rep_` prefix collision existed.

## Decisions and interpretations taken

**1. The dual-citation mechanism (needs ratification).** The dispatch requires tense-shift items to cite both my leaf and the sibling tree's bucket, but the schema allows one bucket per markpoint. I implemented this as **two markpoints at 0.5**, carrying identical `any_phrases` and `must_not_include`, one per bucket. Verified consequences: a correct answer fires both buckets and nets 1.0; the graded colloquial variants net exactly their intended value, because the engine awards `markpoint_credit × phrase_credit` (confirmed against `Architecture_Housing_engine_graded_any_phrases.md` v2). So `veniva` nets 0.50 and the agreement slips net 0.80, as the tranche ruling intends.

The tension worth Architecture's eye: this puts *one* skill on *two* markpoints, which is looser than criterion 8's "one markpoint per skill". The precedent runs the other way — tense_choice cites the imperfect tree with a *single* markpoint on the imperfect bucket only — but that pattern would leave the reported-speech leaves with zero coverage, contradicting the dispatch's "topic-facing home". Flagged rather than assumed.

**2. Trapassato citation targets the leaf, not the aggregate.** The tree names `tense_choice.trapassato_vs_imperfect` (an aggregate) as the prerequisite. I fire the child leaf `completed_prior_to_prior`, since firing an aggregate looked wrong and that leaf is the exact semantics of a quoted past reported from a past vantage point. Change if Architecture prefers the aggregate.

**3. The questo → quel item is a genuine two-skill split, not a dual citation.** `rep_deixis_05` credits the deixis travel on markpoint 0 (either `quel libro` or `quello libro` shows the shift happened) and the apocopated form on markpoint 1 via `demonstrative.quello`. So `quello libro` credits the travel and misses the form; `questo libro` misses the travel. This is the canonical discrimination-plus-form pattern doing real work, and blanking the full noun phrase also sidesteps the `quel` ⊂ `quello` substring false positive that the demonstrative tree already knows about.

**4. Reported questions authored under present reporters.** The five question items use present reporting verbs, so no backshift occurs and each item isolates the se/wh skill on a single markpoint. Past-reporter reported questions (which combine se-insertion *and* backshift) are carried on the translation side instead, where `required_buckets` expresses the combination without forcing a markpoint split.

**5. Suppression is universal in this batch.** Every one of the 39 items carries `info_display: "suppress"`. The four tense-shift leaves are discrimination and suppress by default under criterion 15. The other three suppress because their labels leak — see below.

## Flags for Architecture

**Leaf labels leak the answer (Rev 12).** Four labels embed the worked example or the rule-output, and the label renders as the pre-answer breadcrumb: "Reporting commands: di + infinitive" names the answer shape; "Reporting questions: se and the wh-words" names the answer word; "No shift after dice" names both the answer and the trigger; "Future becomes PAST conditional" names the answer outright. Rev 12 wants terse class-names with the worked example in `description`. Suppression neutralises this for my items, but the labels are a tree edit and not mine to make. Precedent: the Imperativo, Pluperfect and PresentFormation breadcrumb-leak threads.

**Criterion 16 has no answer for accept-both items.** The dispatch requires that a present-to-imperfect item either exclude the still-true reading or accept both forms. Every one of my six takes the first branch, pinning context with a parenthetical, because the second branch is currently unauthorable: criterion 16 demands a single `correct_tense`, and an accept-both item has none. The skill is real and currently homeless — see the first bucket suggestion.

**Dispatch errata.** The dispatch refers to "the conditional tree's past-conditional formation *buckets*"; on disk that is a single leaf, `verb_form.condizionale.formation.condizionale_passato`. No impact.

## Items flagged uncertain

- **`rep_deixis_04`** (qui → lì). The answer is a two-character accented word. The engine's accent-folded fallback should credit an unaccented `li`, but `li` is also a clitic pronoun, so the folded path is doing more work here than on a long word. Worth a live check.
- **`rep_futcond_03` / `rep_trap_02`** use graded credit at 0.8 for a participle-agreement slip inside a correct tense shift. This credits the shift and marks the agreement, rather than misdiagnosing an agreement error as a failed shift — but it is a judgement call about how much an agreement slip should cost on an item that is not about agreement.
- **`rep_cmd_04`** asks for `di non preoccuparsi`, combining the negative command frame with a person shift on the reflexive clitic. Defensible as one reported-command skill and it matches the tree's own canonical example, but it is the densest item in the commands leaf.
- **Bare-infinitive and dropped-se misses** are caught by putting the bare form in `must_not_include` (e.g. `venire`, `vengo`). This is safe only because the engine checks `any_phrases` first, so the correct `di venire` / `se vengo` always wins before the greedy entry is consulted. If that ordering ever changes, these entries invert and must be removed.

## Deliberate departures from the house techniques (Rev 14)

- **Same-surface, opposite-answer pairs** are used deliberately: `rep_noshift_05` and `rep_futcond_01` carry the identical quote ("Verrò alla festa"), flipped only by the reporting verb's tense. This is the OIC contrast pair, and it teaches that the reporting verb is the conditioning factor better than either item alone.
- **One out-of-paradigm trap per drill** is not used. In a topic whose whole diagnostic is *which* shift applies, every item is already a discrimination; planting a further out-of-paradigm item would add noise rather than kill autopilot.
- **Word-bank distractor sets** are not used; no item in this batch is bank-based.

## Notes for the next dispatch

1. **The register branch is unauthored.** Two of the three bucket suggestions exist because the tree acknowledges a formal register (che + subjunctive for commands; the subjunctive in indirect questions) that has no bucket. Once those land, the branch needs items with explicit register cues per criterion 11.
2. **The condizionale non-shift is deliberately absent.** The OIC bank offers "Mi dispiacerebbe tanto..." as non-shift bait, since a quoted conditional is supposed to stay put. Whether a quoted *present* conditional under a past reporter genuinely stays or moves to the condizionale passato is contested enough that I did not author it without a ruling. It is a good item if Architecture settles the call.
3. **Two-rules-in-one items are only half-exploited.** `rep_futcond_07` and several translation items carry a shift plus a deixis move, but with the second rule supplied in the stem. Once the dual-citation mechanism is ratified, deliberate two-markpoint items testing both at once (the OIC "Da oggi in poi non commetterò più sciocchezze" pattern) become authorable.
4. **The manifest is untouched**, per the standing ruling that new trees enter `data/manifest.json` only when the housing is ready to surface them.


---

## Addendum — Wave 1b (2026-07-20), reconciled Rev 14 -> Rev 25

Batch grew 39 -> 45 grammar on the v4 ruling (thread `Architecture_ReportedSpeechAuthor_batch_disposition` v4). Translation unchanged at 20.

**New items (6):**

| id(s) | leaf | note |
|---|---|---|
| rep_persist_01..04 | Still true: shift optional | Accept-both (è/era, abita/abitava at full credit each); NOT a discrimination, so no candidate_tenses (v4 ruling 4). Visible. The persistence cue is the inverse of the criterion-10a exclusion on present_to_imperfect. |
| rep_futcond_08..09 | Future in the past | Condizionale non-shift (v4 closing ruling): a hypothetical conditional STAYS (dispiacerebbe, farebbe); the compound over-shift is guarded and its meaning-change taught. Single markpoint, **no reported_intention co-cite** — a hypothetical is not a reported intention. |

**Leaf home flag (future_to_past):** the two stays-items live on future_to_past as boundary cases (testing when the shift does NOT apply), per the v4 wording "cited to your future_to_past leaf". If Architecture would rather they had a dedicated "conditional stays / already-back-far-enough" leaf, say so; I cited the existing leaf rather than mint one.

**Suppression flip.** Architecture shortened the four leaking labels at source, so the 15 commands/questions/deixis items suppressed ONLY for the leak are now visible (Rev 19: over-suppression is itself a fault). **`rep_deixis_05` held suppressed** — it co-fires `demonstrative.quello` ("quello (that, far)"), the one item where a shown breadcrumb could hint the travel target beyond the prompt. The 23 tense-shift discrimination items stay suppressed (candidate_tenses, Rev 10/15).

**Standing-criteria reconciliation (all clean, evidence in the thread v5):** uniform per-phrase `match_at: "word"` (crit 18); dead-guard engine-sim 0/45; crit-13 chip audit 0 rule-naming cues; Rev-25 cue-level audit 0 citation-form cues (prompt_supplies_base_form false on all 45); crit-19 no-op by carve-out. Batch now: 45 grammar, 20 translation, 0 dead guards, all anchored.
