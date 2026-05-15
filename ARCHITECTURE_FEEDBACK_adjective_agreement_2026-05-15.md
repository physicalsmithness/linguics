# Architecture feedback: adjective_agreement batch

Date: 2026-05-15
From: adjective_agreement authoring chat
For: architecture chat
Supersedes: `ARCHITECTURE_FEEDBACK_adjective_agreement_2026-05-12.md` (everything in the 2026-05-12 file is either actioned in the revised brief or carried forward into this document)

This is the single handoff document. Everything the architect needs to action is below. Cross-references to other files are explicit; nothing important lives only in another file without a pointer from here.

## TL;DR

- **Four decisions required** (see "Decisions" section).
- **Two ratification tasks**: three re-proposed bucket entries, fourteen proposed glossary terms.
- **Several mechanical follow-ups** that depend on the decisions landing.
- **No work blocks the batch from being usable**: the items can ship as-is; the open work is about tightening.

Status of prior architecture feedback that I sent or received:

- `ARCHITECTURE_FEEDBACK_adjective_agreement_2026-05-12.md` — actioned in the revised brief.
- `FEEDBACK_HOUSE_STYLE_adjective_chat.md` — fully actioned 2026-05-15. All 216 explanations (185 grammar + 31 translation) revised to the four-beat structure.

## Batch state on the day of handoff

| File | Count | State |
|---|---|---|
| `data/grammar_questions_adjective_agreement.json` | 185 items | All explanations in four-beat house style. `severity` stripped. `vocab_help` in rich shape. Naming-the-rule prompts rewritten. "Smith-flagged" surface text normalised. |
| `data/translation_items_adjective_agreement.json` | 31 items | All explanations in four-beat house style. `vocab_help` in rich shape. Eight items use `polarity: "negative"` reference translations. |
| `data/bucket_suggestions_adjective_agreement.json` | 16 proposals | 13 ratified by architect; 3 re-proposed with item sets attached (see Decision 3 below). |
| `data/glossary_suggestions_adjective_agreement.json` | 14 terms | Awaiting ratification (see Ratification 2 below). |
| `data/vocab_bucket_references_adjective_agreement.json` | 161 lemmas | Compiled 2026-05-15; input for the cross-cutting vocabulary taxonomy session. |
| `data/coverage_adjective_agreement.md` | n/a | Full status, schema notes, item inventory, per-leaf coverage tables. |

## Decisions required from the architect

### Decision 1 — `must_not_include` policy for `position.pre_noun_canonical`

**Affected items:** `adj_pos_pre_01` (piccola casa), `adj_pos_pre_02` (nuova casa), `adj_pos_pre_04` (piccolo problema), `adj_pos_pre_05` (bravo studente). `adj_pos_pre_03` (giovane studente) is the cleanest case.

**Issue:** All five items ban the post-noun ordering via `must_not_include`. The bans catch the most common learner miss (English-style ordering), but the post-noun ordering is grammatical Italian in every case — it just carries a marked or shifted reading:
- `una casa piccola` — grammatical, emphasises literal size.
- `una casa nuova` — grammatical, emphasises 'brand-new' physically.
- `un problema piccolo` — borderline; literal reading is hard to apply to abstract nouns.
- `uno studente bravo` — grammatical, less common.

**The decision:** one of
- **(a) Keep the bans consistently.** Items mark wrong but the explanation teaches the canonical-position rule.
- **(b) Relax the bans consistently.** Items accept both orders at full credit; explanation flags the canonical reading.
- **(c) Graded credit.** Post-noun gets 0.7 or so; explanation teaches the canonical position.

**My weak preference:** (c). It rewards the learner for getting agreement right while still preferring the canonical order pedagogically.

### Decision 2 — `gran` vs `grande` grading in `special.grande_prenominal`

**Affected items:** `adj_grande_04` (una gran passione) and `adj_grande_05` (un gran cuore). Both feminine and masculine variants currently accept `gran` and `grande` at credit 1.0.

**Issue:** Native usage is asymmetric:
- Masculine `un gran successo` and `un grande successo` are both very common.
- Feminine `una gran festa` is licit but more stylistic; `una grande festa` is the everyday choice.

**The decision:** one of
- **(a) Keep both at 1.0.** Simple, matches the bucket description as written.
- **(b) Graded credit on feminine `gran`** (e.g. 0.8), like the `saggie`/`sagge` shape in `gia_ge`.

**My weak preference:** (a) for simplicity. The asymmetry is real but not strong enough to be worth diagnostic complexity here.

### Decision 3 — Promote three deferred bucket leaves

**Currently re-proposed in `data/bucket_suggestions_adjective_agreement.json`:**

- `position.semantic_shift.vecchio`
- `position.semantic_shift.grande`
- `position.semantic_shift.povero`

**State:** Items now point at these leaves via forward reference. Currently 4 items / 5 items / 4 items respectively in grammar, plus 1 translation item each. The migrated items (`adj_pos_shift_01`, `_02`, `_03`, `_05`) carry dated examiner_notes flagging the forward-reference dependency.

**The decision:** promote them in the bucket tree, or send back for revision. If promoted, vecchio and povero need one more grammar item each to hit the 5-floor (mechanical follow-up below).

### Decision 4 — Add a `position.semantic_shift.caro` leaf?

**Not currently proposed.** `adj_pos_shift_04` (un caro amico) is the only item left pointing at the aggregate `position.semantic_shift` bucket because no caro word-leaf was proposed when the other three went forward.

**Argument for:** Consistency with vecchio/grande/povero. Caro has a strong semantic shift (dear vs expensive) with high learner interest.

**Argument against:** Caro is less well-attested in the canonical lists than the other three. Adding it would mean authoring four more items (to hit the 5-floor) plus a translation item.

**The decision:** add the leaf and commission the new items, or leave caro at the aggregate bucket as the canonical "no word-leaf" example.

## Ratification tasks

### Ratification 1 — Three re-proposed bucket entries

**File:** `data/bucket_suggestions_adjective_agreement.json`

The three re-proposed leaves (vecchio, grande, povero) are the ones from Decision 3. If you take that decision in favour of promotion, ratifying these entries is the same act.

### Ratification 2 — Glossary terms

**File:** `data/glossary_suggestions_adjective_agreement.json`

Fourteen terms used throughout the house-style revision. The renderer will wrap each in an interactive span once these are merged into `data/glossary.json`. Used heavily in: every Class I, Class II, stem-change, position, special-allomorph, and invariable item.

If any term wording needs revision, the JSON file is the right place to edit it; the merged glossary is where the renderer reads from.

## Mechanical follow-ups (after decisions land)

These are tracked here so they don't get lost; none of them block the batch.

1. **Once Decision 1 lands**: rewrite the `must_not_include` arrays across the five `position.pre_noun_canonical` items consistently. If (c) graded credit, switch to the `any_phrases` graded shape.
2. **Once Decision 2 lands**: if (b), apply graded credit to `gran` in feminine `adj_grande_04` and `adj_grande_05`.
3. **Once Decision 3 lands**: top up `position.semantic_shift.vecchio` and `position.semantic_shift.povero` to the 5-floor (one item each in grammar). Translation coverage already at 1 item per leaf.
4. **Once Decision 4 lands** (if yes): author 4 grammar items + 1 translation item for `position.semantic_shift.caro`; migrate `adj_pos_shift_04`.
5. **Anytime**: one-shot JSON prettifier (e.g. `python -m json.tool` round-trip) to normalise the indentation of the older 96 items against the newer ones. Cosmetic; the JSON parses fine either way.
6. **Anytime**: the "Re-order" prompt rewrites stripped the word "canonically". The pedagogical signal is now in the explanation only. If you want it back in the prompt, the rewrites can be re-walked.

## Optional extensions (not asked for, just on the table)

- Author items for un-bucketed nominalisation (italiano-language vs italiano-adj). Would need a new top-level family.
- Author further compound colours under `invariable.compound_colour`: azzurro cielo, grigio perla, rosa cipria, etc. Bucket can hold many.
- More irregular stem-change leaves under `stem_changes.irregular`: medico, monaco, porco, fico, etc. (currently three: amico, greco, antico).

## Forward references to other taxonomy work

These are inputs the architect may want to pass along to other authoring sessions:

- `data/vocab_bucket_references_adjective_agreement.json` — 161 unique lemmas with their aspects, ready for a vocabulary taxonomy session.
- Forward-referenced non-topic buckets in translation `optional_buckets` (full list in `data/coverage_adjective_agreement.md` "Carried-over context section 3"): `article.partitive.delle`, `article.partitive.dei`, `preposition.articulated.della`, `possessive.attributive_with_article`, `possessive.miei`, `possessive.di_mio`, `verb_form.imperfetto`, `verb_form.passato_prossimo`, `verb.piacere`, `verb.tense_for_ongoing_duration`, `exclamative.che`, `time_expression`.

## Where to find things

- This file = decisions + ratifications + follow-ups, the architect's entry point.
- `data/coverage_adjective_agreement.md` = per-leaf coverage tables, schema notes, "items I would like a reviewer to look at", and the historical "carried-over context" section for back-references.
- `data/bucket_suggestions_adjective_agreement.json` = the canonical place to ratify bucket changes.
- `data/glossary_suggestions_adjective_agreement.json` = the canonical place to ratify glossary terms.
- `data/grammar_questions_adjective_agreement.json` and `data/translation_items_adjective_agreement.json` = the item bank itself.
