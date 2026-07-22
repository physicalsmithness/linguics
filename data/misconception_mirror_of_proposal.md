# Proposal: `mirror_of` field on the misconception registry

**Author:** MisconceptionAnalyst (QoderWork 2026-07-22)
**Status:** PROPOSAL for Architecture to ratify
**Gates:** Canvas B6 (over- vs under-application view) — Smith: "I love that a lot."

---

## The problem

Some misconceptions come in OPPOSING PAIRS: the learner either hasn't learnt the rule (under-application) or has learnt it and over-applies it. These are genuinely different learner states at different maturity stages, and Smith wants a view that distinguishes them ("haven't learnt the rule" vs "learnt it, over-applying").

Today the pairs exist as separate registry entries but nothing in the schema LINKS them. The over/under view cannot compute without knowing which specifics are mirrors of which.

## The proposal

Add an optional `mirror_of` field to each misconception entry in `data/misconceptions.json`. Value: the id of the opposing specific (or null/absent if unpaired).

```json
{
  "id": "discrimination.pp_for_imperfect",
  "family": "discrimination",
  "label": "Passato prossimo used where imperfect required",
  "mirror_of": "discrimination.imperfect_for_pp",
  ...
}
```

Symmetry rule: if A has `mirror_of: B`, then B must have `mirror_of: A`. Architecture enforces on ratification.

## The pairs I'd mark (from the registry as it stands)

These are the 9 pairs v12 already identified as live mirrors:

| Specific A | Specific B | The axis |
|-----------|-----------|----------|
| `discrimination.pp_for_imperfect` | `discrimination.imperfect_for_pp` | aspect (perfective ↔ imperfective) |
| `discrimination.progressive_overuse` | `discrimination.progressive_underuse` | progressive aspect |
| `discrimination.perfect_for_durative_da` | `discrimination.durative_present_over_extension` | da-durative |
| `stem_change.isc_over_extension` | `stem_change.isc_under_application` | -isc- infix |
| `regularisation.irregular_verb` | (no mirror — regularisation is one-directional) | — |
| `agreement.participle_overagreement` | `agreement.participle_underagreement` (if minted) | participle agreement |
| `orthography.omitted_h_hard_cg` | `orthography.redundant_h` (if minted) | h-rule direction |
| `accent_silent_letter.accent_omitted` | `accent_silent_letter.accent_added` (if minted) | accent direction |
| `gemination.geminate_simplified` | `gemination.geminate_added` (if minted) | geminate direction |

Of these, only the first four have BOTH halves minted today. The others have one half only (the "under" side is the common error; the "over" side is rarer and often unminted). The `mirror_of` field should still be added to the minted half, pointing at the id the mirror WOULD have, so that when the mirror is minted the link is ready. Alternatively: mark only live pairs and add the field to the second half at minting time.

**My recommendation:** mark only live pairs (both halves exist). Unminted mirrors get their `mirror_of` at minting time. This avoids pointing at ids that don't exist.

## What the view does with it

Canvas B6 groups the learner's misconception events by mirror-pair. For each pair, it shows:
- Which direction dominates (over or under)
- The maturity read: "you're past not knowing the rule — you're now over-applying it" (Smith's framing)
- A small bar or two-cell strip per pair: left = under, right = over, shaded by count

This is a MATURITY prism, not a correctness prism. It answers "where am I on the learning curve for this rule" rather than "how often do I get it wrong."

## Direction-neutral specifics

Per v12's direction rule, some specifics are explicitly direction-neutral (e.g. `discrimination.remoto_register_mismatch`, `discrimination.habitual_frame_mismatch`). These do NOT get a `mirror_of` — they are not one half of a pair. The `$direction_rule` in the tag-lists file already marks them; the registry field should respect the same declaration.

## Schema impact

- One optional string field per entry. No breaking change.
- Validation: if `mirror_of` is present, the target id must exist in the registry AND must carry the reciprocal `mirror_of` back. (Symmetry check.)
- The four direction-merged ids from v12 (still awaiting Architecture's ruling) should be resolved BEFORE marking mirrors, since splitting them would create new pairs.

## Routing

Architecture to ratify the field and the symmetry rule. Once ratified, I mark the live pairs. Housing builds B6 against the field.
