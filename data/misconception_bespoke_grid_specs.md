# Bespoke grid specs for Housing

**Author:** MisconceptionAnalyst (QoderWork 2026-07-22)
**Status:** PROPOSAL — approved in principle by Smith (reporting_prisms v5 mockups); this is the build spec.
**Context:** Canvas A views 6 and 7 from `data/misconception_canvas_views.md`. Both are bespoke, topic-specific grids that the generic group-by cannot produce. Smith: "the insight often comes from a hand-shaped grid."

House style: serif / cream (#fdfaf4) / navy (#3a4f8a) / data-tables gradient rules (smooth two-tone to cream at zero, black text throughout, diagonal vs off-diagonal as separate colour classes, angled column headings seated at the bottom).

---

## Grid 1: Tense-choice confusion matrix

### What it shows

A square matrix: **rows = tense the learner chose**, **columns = tense that was correct**. The diagonal is "got it right"; off-diagonal cells are "chose X when Y was correct." This is the natural way to see tense_choice errors — it answers "when they should have used the imperfect, what did they reach for instead?"

### Data source

Every tense_choice item carries:
- `candidate_tenses`: array of tense slugs offered (e.g. `["imperfect", "passato_prossimo"]`)
- `correct_tense`: the right answer (e.g. `"imperfect"`)

The learner's CHOSEN tense is inferred from which candidate form they produced (the markpoint's `any_phrases` vs `must_not_include` tell Housing which form was written). On a miss, the chosen tense is the candidate that is NOT `correct_tense`. On a hit, chosen = correct.

**Aggregation unit:** the leaf (bucket), not the individual question. Pool all attempts at a leaf, then roll up to the tense pair.

### Axes

- Row labels: tense slugs, displayed as learner-facing names ("Imperfect", "Passato prossimo", "Future", "Condizionale", "Passato remoto", "Trapassato", "Congiuntivo", "Present").
- Column labels: same set.
- Only tenses that actually appear in `candidate_tenses` across the item bank get a row/column. Today that is mostly imperfect, passato_prossimo, future, present, condizionale, passato_remoto, trapassato. The matrix grows as items are added.

### Interaction (Smith-approved toggles)

1. **Count / Row-% toggle.** Default: raw counts. Row-% mode: each row sums to 100%, "reading from the left" — "of the times they chose imperfect, what % was actually correct?" Smith explicitly asked for both.
2. **Transpose toggle.** Default: rows = chose, columns = correct. Transposed: rows = correct, columns = chose ("of the times the answer was imperfect, what did they pick instead?"). Smith wants both orientations.
3. **Filter incomplete pairs.** Design for a toggle that hides tense pairs with fewer than N attempts (default N=5), so early sparse data doesn't paint misleading cells. Not day 1, but the data model should support it.

### Visual treatment

- **Diagonal cells** (correct): green ramp (same as coverage cells — hue by correctness rate).
- **Off-diagonal cells** (errors): terracotta ramp (single warm ramp, intensity by count or %). NOT red — house style avoids alarm colours.
- **Empty cells** (pair never tested or never attempted): cream, no border emphasis.
- **Column headings:** angled (45°), seated at the bottom of the header row, so columns can be as narrow as their numbers.
- **Row headings:** left-aligned, full tense name.
- **Cell content:** the number (count or %). In row-% mode, show one decimal place.
- **Hover:** tooltip with "Chose [row tense] when [col tense] was correct: N attempts (M% of row)".

### Sizing

Full canvas width. The matrix is at most 8×8 today; it should not stretch to fill — centre it at a comfortable cell size (~64px) and let the surrounding whitespace breathe. Smith's "roomy" directive applies.

### What it does NOT show

- It does not break down by person, conjugation class, or specific verb. Those are the coverage grids (A3, A4). This grid is purely "which tense for which."
- It does not show the misconception id (that's Canvas B's job). Though a future drill could link off-diagonal cells to the discrimination specific that fired.

---

## Grid 2: Piacere per-verb grid

### What it shows

One row per **verb in the piacere family** (piacere, mancare, servire, interessare, bastare, sembrare, restare, dispiacere). Columns are the **error dimensions** Smith named: does the learner get the direction right, do they pluralise correctly, do they handle the figurative/extended uses. This is the "how are you at each of these verbs" grid.

### Data source

The piacere bucket tree has these leaves (from `data/buckets/piacere.json`):
- `piacere.form.agreement` — piace/piacciono (pluralisation)
- `piacere.form.with_infinitive` — mi piace fare (infinitive pattern)
- `piacere.form.experiencer_clitic` — mi/ti/ci/vi/gli (clitic choice)
- `piacere.form.experiencer_a_phrase` — a Luca / a me (a-phrase)
- `piacere.form.past` — è piaciuto / sono piaciuti (past with essere)
- `piacere.usage.subject_flip` — the direction flip (mi piaci vs ti piaccio)
- `piacere.usage.liking_people` — mi piaci (people as liked thing)
- `piacere.usage.agreeing_responses` — anche a me / a me no
- `piacere.usage.dispiacere` — mi dispiace
- `piacere.usage.family_verbs` — mancare, servire, interessare, etc.

Items carry a `subtopic` field matching these leaves. The family_verbs items additionally test specific verbs (mancare, servire, interessare, bastare, sembrare) — the verb identity is recoverable from the item's `any_phrases` or prompt text.

### Proposed columns (the error dimensions)

| Column | What it measures | Source leaves |
|--------|-----------------|---------------|
| Direction | Gets the experiencer/subject flip right (mi piaci, not ti piaccio) | usage.subject_flip, usage.liking_people |
| Pluralisation | Agrees verb with liked thing (piace vs piacciono) | form.agreement |
| Infinitive pattern | Uses mi piace + inf correctly | form.with_infinitive |
| Experiencer form | Right clitic or a-phrase | form.experiencer_clitic, form.experiencer_a_phrase |
| Past tense | è piaciuto / sono piaciuti (essere + agreement) | form.past |
| Extended verbs | mancare/servire/interessare direction + agreement | usage.family_verbs |

### Rows

- **Top section:** one row per verb (Piacere, Mancare, Servire, Interessare, Bastare, Sembrare, Dispiacere). Each row shows that verb's correctness across the applicable columns. Not every verb has every column (bastare rarely tests past tense; dispiacere is mostly frozen as "mi dispiace").
- **Bottom section (optional):** the non-verb-specific leaves (agreeing_responses, experiencer forms) as summary rows.

### Cell treatment

Same as coverage cells: hue = correctness, fill-fraction = attempted-rate (5.3.5). Number shown = % correct. Empty = untried.

### Interaction

- **Hover:** "Mancare × Direction: 3/7 correct (43%). Common miss: 'Ti manco' for 'I miss you'."
- **Click a cell:** drills to the items at that (verb × dimension) intersection (future — links to the item-level view).
- **Filter:** hide verbs with fewer than N attempts (same N=5 default as the confusion matrix).

### Sizing

Narrower than the confusion matrix (7 rows × 6 columns max). Left-aligned within the canvas, with room for the row labels (verb names). Same comfortable cell size.

### What it does NOT show

- It does not show the generic misconception families (that's Canvas B). Though the direction column IS effectively `agreement.subject_verb_finite` + `transfer.calque_argument_structure` in disguise.
- It does not break down by person. Piacere's person axis is the experiencer (mi/ti/gli), not the verb's grammatical person — a future refinement if Smith wants it.

---

## Shared build notes

- Both grids are **Canvas A** (coverage) views, scrolled below the person×tense grid.
- Both read from the **attempt event log** (the same source as the coverage aside), filtered to the relevant topic.
- Both should respect the **join-key model** (Architecture ruling, reporting_prisms v6): the event carries an attempt/item id; the stats layer joins to the item's descriptors. The confusion matrix joins to `candidate_tenses` + `correct_tense`; the piacere grid joins to `subtopic` + verb identity.
- Neither grid needs the misconception registry. They are coverage views, not misconception views. The misconception drill-down (Canvas B) is a separate scroll.
- **Mockups exist:** Smith approved interactive mockups (Linguics skin) for both in the reporting_prisms v5 session. The toggles and visual treatment above are what he reacted to.

---

## Open questions for Architecture (not blocking Housing's build)

1. The confusion matrix's "chosen tense" inference relies on Housing knowing which candidate form the learner produced. The markpoint structure makes this clear (any_phrases = correct form, must_not_include = wrong form), but confirm the event log records WHICH form was written, not just right/wrong.
2. The piacere grid's verb identity for family_verbs items: is this recoverable from the existing item schema, or does it need a `verb_identity` descriptor added to the join-key set? (Smith's "everything retrievable" ruling suggests the latter.)
