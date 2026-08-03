# Coverage: verb_form.imperativo — usage + register (wave 2)

**Author:** ImperativoAuthor (DISPATCH_usage_wave2.md), authored against AUTHOR_BRIEF Rev 27, 2026-07-18
**Scope:** the usage axis and the register discrimination for the imperative. Formation was wave 1 (delivered, accepted).

## What shipped

- `grammar_questions_verb_form.imperativo.usage.json` — 18 (10 pragmatic_softening + 8 impersonal_infinitive)
- `translation_items_verb_form.imperativo.usage.json` — 10 (6 + 4)
- `grammar_questions_verb_form.imperativo.discrimination.json` — 14 (register)
- `translation_items_verb_form.imperativo.discrimination.json` — 6 (register)
- `bucket_suggestions_verb_form.imperativo.usage.json` — 2 proposed leaves
- **Total: 32 grammar + 16 translation.** Validates 0 errors.

## Bucket-to-item count

| Leaf (friendly label) | Grammar | Translation | Status |
|---|---|---|---|
| Pragmatic softening (frozen markers + `pure`) | 10 | 6 | leaf PROPOSED (not on disk) |
| Impersonal infinitive (recipes/signs) | 8 | 4 | leaf PROPOSED (second leaf) |
| Register: informal (tu) vs formal (Lei) | 14 | 6 | leaf exists (was stub) |

## The Rev 27 cross-crediting — the headline of this batch

**19 of 32 grammar items carry two markpoints, crediting both buckets at full correctness** (weights 0.5/0.5 so item marks stay 1). This is where the leaf's teaching and the formation skill genuinely coincide:

- Every register item credits BOTH the register choice (`discrimination.register_informal_vs_formal`) AND the form built (`formation.formal` / `.informal_affirmative` / `.irregular_tu`). "Signora, ____ (parlare)" → parli evidences *chose Lei for a formal addressee* and *built the formal imperative*. Both record a full hit.
- The `pure`-softener items credit the softening function AND the underlying command form (entri pure = `pragmatic_softening` + `formation.formal`).
- The formal attention marker credits `pragmatic_softening` + `formation.formal` (senta).

## Register leaf: criteria 15/16/19 treatment

- **`info_display: "suppress"` on all 14** (Rev 19 recoverability satisfied: the addressee in the sentence pins the register and both candidate forms are derivable from the supplied verb, so the item stays answerable suppressed; showing the breadcrumb would tip that a register choice is in play, which the learner must read from context).
- **`candidate_forms` + `correct_form` on all 14** (criterion 16 generalised to non-tense discriminations, Rev 17(iii)), labelled by register: `["parla (informal, tu)", "parli (formal, Lei)"]`, correct `"parli (formal, Lei)"`. Shown post-answer only, for the tick.
- **Cues name the verb only** — `(parlare)`, never the register. The register is the thing under test and must be read from the addressee (Signora / Marco / Mi scusi / Tesoro), so naming it in the cue would defeat the item (criterion 13).

## Misconception tagging

`register.tu_lei_mismatch` (already in the registry, topics: `["pronoun"]`) tags the wrong-register guard on all 19 register-bearing markpoints. **Architecture needs to add `verb_form.imperativo` to that id's `topics`** — flagged in the thread. This is the estate's only registered home for the reserved `register` family, and the dispatch pointed it here; the guard population is clean (one wrong-register form per item), so no new mint is needed, only the topic addition.

## Items flagged for the project author

1. **`pragmatic_softening` and `impersonal_infinitive` leaves are not on disk** — authored as forward-references, proposed in `bucket_suggestions`. Architecture mints/confirms and destubs on acceptance.
2. **The `usage` parent description is stale** — still lists commands/directions/invitations/recipe-infinitive/softened from the pre-narrowing era, and is not flagged `stub`. Needs updating to the narrowed scope (softening + the proposed impersonal-infinitive). Architecture's artefact; flagged, not touched.
3. **The second leaf (`impersonal_infinitive`) slightly exceeds the dispatch's "deliberately one leaf" steer.** I proposed it because it passes the dispatch's own test (duplicates neither present-usage's si-impersonal nor the register leaf) and it is the orphan the stale parent description already names. If Architecture would rather fold recipe/sign instructions into `present_indicative.usage.instructions` or keep imperativo.usage single-leaf, the 12 items re-home cleanly.
4. **Encouragement markers accepted as an interchangeable set** (dai / su / forza / coraggio at full credit): the leaf tests deploying a frozen marker, not a specific lexeme, so no misconception tag on those guards. Confirm you are happy with the OR-set grading.

## Cross-references / boundaries respected

- Direct instructions (si-impersonal) left to `present_indicative.usage.instructions`.
- Clitics in a few examples (mi dica, aspettami) cite the pronoun tree as `optional_buckets`; markpoints target the verb form only.
- Register discrimination stays in the imperativo tree (not superseded into tense_choice) because it is a REGISTER choice, per the dispatch.

---

## Update 2026-08-03 — item-shape (no-change forms) reconciliation

The 8 impersonal-infinitive items were reshaped to **instrument A** per `ITEM_SHAPE_no_change_forms.md` (Smith overruled Architecture: the shape is sound, only the answer-handover cue goes). The Italian `(spingere ...)` parenthetical — which let a learner copy the cue for full marks — is removed; each item now shows the English meaning in `[brackets]`, clickable to reveal the Italian. Extended from the gate's 6 to all 8 (adding the two prohibition items) for Smith's uniformity constraint: an Italian cue on only some items of a no-change leaf is a tell. `prompt_supplies_base_form` set false on the 8. No marking change; the personal-form guards (spingi/spinga) still fire. Thread: `Architecture_ALLAUTHORS_item_shape_no_change_forms.md` v5.

Not owed elsewhere (checked 2026-08-03): the answer-leak dispatch names 9 seats, not imperativo; the cue-notation retrofit counts imperativo at 0 English-in-parens (verified on the merged file); Rev 29-32 add no imperativo retrofit (Rev 30 reinforces the English-gloss choice above). person backfill (28 items) and discharges are CLOSED/stamped; wave-2 accepted.
