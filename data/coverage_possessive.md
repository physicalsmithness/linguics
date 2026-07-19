# Coverage: possessive

**Author:** PossessiveAuthor. **Brief:** Rev 25+ (live). **Updated:** 2026-07-18 (wave-2 pass: three new leaves + two retrofits). **Totals:** 63 grammar (38 short, 25 MCQ), 35 translation, across 7 active leaves.

## Coverage table

| Leaf (label) | id | Grammar | Translation |
|---|---|---:|---:|
| Possessive + article, agreeing | `possessive.adjective.forms` | 20 | 7 |
| Family nouns drop the article | `possessive.adjective.family_exception` | 15 | 7 |
| Possessive pronouns | `possessive.pronoun` | 8 | 4 |
| suo: his, her, your (formal) | `possessive.discrimination.suo` | 5 | 8 |
| Predicate: è mio | `possessive.predicate` | 5 | 3 |
| Postposed: casa mia | `possessive.postposed` | 4 | 3 |
| Proprio | `possessive.proprio` | 6 | 3 |

## What changed this pass (2026-07-18)

Three newly-ratified leaves authored, and two retrofits applied to the original batch.

- **Predicate (è mio)** - 5 MCQ + 3 translation. Ownership after essere drops the article; that absence is the whole test, so grammar is MCQ (index-scored) + translation, the same marker constraint as the family drop. Distinct from the article-bearing pronoun leaf.
- **Postposed (casa mia)** - 4 MCQ + 3 translation. The productive fixed patterns (a casa mia, colpa mia, piacere mio, a casa tua); word order is the skill, tested by MCQ with the calqued alla mia casa / a mia casa as distractors.
- **Proprio** - 4 short + 2 MCQ + 3 translation. The reflexive possessive with impersonal / generic subjects (ognuno, bisogna, ciascuno, chiunque, impersonal si); short items require the article (anchored match_at word) and guard suo as the named miss (WRONG, not a 0.9 dodge, per Rev 20(i)); MCQ pit proprio against suo directly.
- **Cue notation (criterion 20)** - every round-paren English meaning cue converted to the house square-bracket gloss with prompt_supplies_base_form false: 34 short items + 2 MCQ register notes = 36 conversions. (These were always English cues, never the Italian answer-fragments criterion 20 targets, so by its Rev-23 harm test they were the safe case; conversion is notation-standardisation + enabling the cue-misread rescue. Criterion 19 re-run after glossing: no-op, no accented answers.)
- **candidate_forms (criterion 16)** - the five suo grammar items now carry candidate_forms + correct_form (his / her / your-formal; register set on the formal-recognition item). The eight suo translation items need nothing.

## The marker constraint (unchanged, still governs three leaves)

Article-presence and word-order discriminations cannot be marked in free text: the correct core is a substring of the wrong form and a positive match wins first, and match_at "start" is word-start so a leading article cannot be rejected. So the family drop, the predicate drop, and the postposed word-order are authored as MCQ (index-scored) + translation. Short-answer is used only where the article/word is required (plural / modified / loro; proprio with its article), anchored match_at word.

## Open threads (all now awaiting Architecture, nothing my side)

- `Architecture_PossessiveAuthor_edge_patterns` v3 - three leaves authored, ready to clear stubs on acceptance.
- `Architecture_PossessiveAuthor_suo_leaf_and_discrimination_fields` v3 - candidate_forms retrofit done, ready to close.
- `Architecture_PossessiveAuthor_class_retrofit_audits` v1 - criterion-20 cue conversion + crit 13/17/18/19 discharge evidence, awaiting compliance-table stamps.

## For the Misconception Analyst (registry is Architecture-owned)

Patterns worth an entry: owner-agreement (suo/sua by owner not noun); spurious article on a family noun; dropped article on plural/standalone; article intrusion in the predicate (è la mia for è mia); suo where proprio is required with an impersonal subject.

## Decisions you may want to push back on (largest first)

1. **Cue conversions came to 36, not the architect's 29.** I took the full principled set by §2.20; if a narrower 29 was intended, say which and I revert the surplus.
2. **Predicate and postposed are MCQ-heavy** for the same marker reason as the family leaf. Free-text would need an engine change.
3. **proprio guards suo as WRONG** (not a 0.9 dodge), because suo-for-proprio is the leaf's named miss (Rev 20(i)). Colloquial Italian does use suo here, so if you'd rather it score a graded 0.7-0.8 with a steering note, that's a one-line change per item.
