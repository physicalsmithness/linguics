# DRAFT NOTES: existential + piacere packages (2026-07-13)

These four files were drafted by the architect chat in a session where the device bridge was down: no read access to the canonical folder, so the schema was reconstructed from the handoff record, not verified against an on-disk tree. Nothing here is canonical until the checklist below passes in a bridged session.

## Files in this package

- DRAFT_buckets_existential.json (11 nodes) → destined for data/buckets/existential.json
- DRAFT_buckets_piacere.json (13 nodes) → destined for data/buckets/piacere.json
- DRAFT_DISPATCH_existential.md → destined for DISPATCH_existential.md
- DRAFT_DISPATCH_piacere.md → destined for DISPATCH_piacere.md

## Validation checklist before commit (bridged architect session)

1. Diff the node field set against the newest small tree on disk (data/buckets/demonstrative.json is the likely template): field names, whether aggregates carry any marker field, whether leaves carry anything I have omitted.
2. Verify cefr_importance conventions: level keys (A1..C2 assumed) and band vocabulary (core / preview / review / fluency / arcane assumed).
3. Verify attributes.direction values (production_only / bidirectional assumed) and that direction belongs inside attributes.
4. Verify every cross-tree prerequisite id actually exists:
   - verb_form.present_indicative.formation.irregular.essere
   - verb_form.present_indicative.formation
   - verb_form.imperfect.formation
   - verb_form.passato_prossimo (root), .auxiliary, .participle_agreement.with_essere
   - pronoun.indirect_object
   - article.definite, article.indefinite
   Correct to the real ids where these are wrong; downgrade to the nearest existing aggregate where a leaf id does not exist.
5. Verify the item-schema field names used in the two worked examples (external_id, prompt, cefr_level_target, marks, markpoints, any_phrases, must_not_include with graded object entries, explanation, vocab_help rich shape) against a recent authored batch.
6. Check topic ids do not collide with anything on disk (existential, piacere; topic_short ex, pia; external_id prefixes ex_, pia_, trans_ex_, trans_pia_).
7. Do NOT add either topic to data/manifest.json until its first content batch lands (standing ruling: no empty-count noise in the stats panel).
8. Run the standard tree validation: JSON parses, ids unique, all parent_ids resolve, no em-dash-space anywhere.
9. On commit, append DECISIONS.md entries for: the two new trees; the "a me mi piace" graded-credit-0.5 ruling; the boundary rulings (locative ci stays in the pronoun tree; clitic grammar at large stays in the pronoun tree; dispiacere false friend lives in the piacere tree rather than vocab); external_id prefixes.
10. Overlap audit: check whether the pronoun tree's piacere-adjacent bucket (the piacere-family indirect-object leaf with essere in PP, ratified back in May) overlaps piacere.form.past, and cross-link or dedupe as needed. Same for any existing ci_locative existential bucket (the c'è/ci sono existence leaf under pronoun.ci_locative, if present) vs this tree's root: the pronoun tree one is about ci-as-clitic; this tree is the learner-facing topic. Decide whether one should reference the other.

## Architect rulings made in this draft (for Smith's eye, largest first)

1. "A me mi piace" is graded at 0.5 with a register note, not a flat miss.
2. Topic boundaries: existential owns esserci only; all other ci lives stay with the pronoun tree. Piacere owns clitic-choice-in-frame only; clitic grammar stays with the pronoun tree. Dispiacere false friend placed in piacere.usage rather than the vocabulary axis.
3. Liking-people (mi piaci / ti piaccio) gets its own leaf, weighted B1-core, A2-preview.
4. Family verbs (mancare, servire, bastare, interessare, sembrare, restare) are one leaf inside piacere rather than a separate topic, with mancare's direction flip called out as the sharpest diagnostic.
5. vs_essere items must pin context because colloquial availability readings of "C'è il libro" are grammatical; flagged as an authoring rule in the dispatch.
6. Neither topic enters manifest.json until content lands.
