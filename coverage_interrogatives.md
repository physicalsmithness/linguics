# Coverage: interrogatives

**Author:** InterrogativesAuthor. **Brief:** authored against disk (post no-change-forms law, ratified 2026-08-03).
**Engine:** every grammar phrase and guard marked through the real `norm.js` + `grammar_engine.js` (not a replica).

## Grammar + translation by leaf

| Leaf (label) | Grammar | of which MCQ | Translation (required) | Notes |
|---|---|---|---|---|
| chi (who) | 4 | 0 | 3 | subject/object recall dropped per the law; prep-fronting con/a/per chi + di chi (whose) carry it |
| che / cosa / che cosa (what) | 3 | 1 | 2 | equivalence item HELD for instrument A; che-before-noun MCQ, a che ora, cos'e elision ship |
| quale (which) | 4 | 0 | 3 | quali/quale number agreement, qual e (no apostrophe), selection pronoun |
| quanto (how much/many) | 6 | 2 | 3 | quanti/quante/quanta agreement free-text; base-form quanto (adverbial + m.sg) as MCQ |
| adverbs (come/dove/quando/perche) | 7 | 3 | 3 | dov'e, come mai, di dove, da quando free-text; come/quando/perche as interim word-choice MCQ |
| discrimination (chi vs che vs quale) | 5 | 5 | (via the leaves) | MCQ, info_display suppress, candidate_forms; incl. quanto for quantity |
| **exclamatives** (che/come/quanto) | **5 pending** | 3 | 2 pending | bucket NOT minted; held in `_pending_interrogatives_exclamatives.json` + bucket_suggestions |

**Totals shipped:** 29 grammar (18 free-text, 11 MCQ) + 14 translation (9 en->it, 5 it->en, 5 negative anchors).
**Held/pending:** 1 grammar (che equivalence, instrument A) + 5 grammar & 2 translation (exclamatives, pending mint).
CEFR: A1 3, A2 18, B1 8 (grammar).

## no-change-forms law: what I did (pushback wanted)

- KEPT free-text only where the item tests a CHANGE or a CONSTRUCTION (copying a cue cannot win): prep-fronting,
  di chi, a che ora, cos'e/dov'e elision, di dove, da quando, all quale agreement, agreeing quanto.
- CONVERTED to MCQ the base-form quanto (Quanto costa / quanto pane) and the bare come/quando/perche adverbs.
- DROPPED bare chi (subject, object) and bare dove: pure invariable recall, covered elsewhere.
- HELD the che/cosa/che cosa equivalence: its right instrument is A (English clickable + membership marking),
  which the law itself says is engine-blocked until `Architecture_Housing_candidate_forms_membership_test` lands.
- The 3 adverb MCQs are INTERIM: their ideal instrument is A (records a vocabulary miss); revisit when A ships.

## Flagged / uncertain

- **Exclamatives bucket not minted.** Items forward-reference `interrogatives.exclamatives`; held out of the
  shippable files so they cannot strict-reject a production load. Architecture to mint, then merge.
- **topic_short** `interr` used for all external_ids; the bucket-tree root `attributes` is empty ({}), so this
  needs adding to the root (same gap passato flagged for `pp`).
- **Misconception registry** carries no interrogatives entries; guards ship with plain-language notes, ids
  retro-addable (ImperativoAuthor precedent). Candidate ids: who/what confusion (chi<->che), preposition
  stranding, dropped di/da (di chi / di dove / da quando), quanto over-/under-agreement, qual'e apostrophe.
- **common_miss attributes** are empty ({}) on every interrogatives leaf; my guards are the de-facto common_miss
  set and could be lifted into the tree attributes if Architecture wants them there.
- **qual e apostrophe** is ungradable in the grammar strand (norm folds the apostrophe); it is taught in
  explanations and GRADED in translation (trans_interr_04, negative anchor on qual'e).
- **Accent/residue false-miss** (my standalone flag `Architecture_InterrogativesAuthor_residue_zeroes_accent_fold`)
  affects the accent-off path of every single-markpoint accented item, mine included; not worked around per-item.

## For the next dispatch

- Mint `interrogatives.exclamatives`, then merge the pending file.
- Add `attributes.topic_short = "interr"` to the tree root.
- When instrument A ships, restore the che equivalence item and reconsider the interim adverb MCQs.
