# Style update + content note for pronoun explanations

Paste this into the existing pronoun chat thread.

---

Two things.

## 1. Glossary and house style for explanations

The Linguics platform now has a **glossary** built into the explanation renderer. Each grammatical term in an explanation gets wrapped in an interactive span: hovering shows a short definition; clicking will eventually show a longer one. The glossary lives in `data/glossary.json` and is maintained centrally; you (the author chat) propose additions but don't edit it directly.

This is especially relevant for pronouns because your explanations carry a lot of vocabulary: clitic, clitic cluster, DOP, IOP, fronting, left-dislocation, elision, partitive, locative, formal address, articulated preposition, stressed pronoun, reflexive, etc.

**House style**:

1. **Lead with what Italian is doing in everyday terms.**
2. **Name the relevant grammatical term explicitly when first introduced.** No inline expansion.
3. **Use the term thereafter** without re-defining.
4. **Finish with the concrete working** that produces the answer.

Be compact. ~30-60 words for most explanations.

### Worked example

For your `op_dop_dislocation_01` style question (Quel libro, me l'ha prestato Marco):

> Italian often puts the topic at the start; this is fronting. The fronted direct object then has to be resumed by a DOP: here lo (m.sg, libro), elided to l' before "ha". The "to me" part is the IOP, normally mi but it becomes me when it precedes another clitic. Stack: me + l' giving me l'ha prestato Marco.

That's it. "fronting", "direct object", "DOP", "m.sg", "elided", "IOP", "clitic" are all glossary terms; the platform will make them clickable. No need to inline-explain what an IOP is.

## 2. Pronoun-cluster confusions in must_not_include

A learner attempted question `op_dop_dislocation_01` and wrote **"melo"** (one word). The current `must_not_include` for that question is `["mi lo", "lo me"]`, which doesn't include "melo". So the marker treated the answer as "didn't try" (now fixed to mark it as a generic Wrong miss, but with no specific diagnostic).

The wrong form "melo" is a real conceptual confusion: the learner has noticed that clitics join into a single word when attached to a verb (`vedermelo`, `dammelo`) and is over-generalising that to the pre-verb position (where the cluster stays as two separate words: `me lo`).

**Please add the following wrong forms to your `must_not_include` lists across the relevant pronoun-cluster questions**:

- `melo` (for items expecting `me lo`)
- `telo` (for items expecting `te lo`)
- `celo` / `velo` (for items expecting `ce lo` / `ve lo`)
- `mela`, `tela`, `cela`, `vela` (for items expecting separated forms with la)
- `mene`, `tene`, `cene`, `vene` (for items expecting separated forms with ne)
- `glielo` joined-when-should-be-separate isn't an issue (it's correctly joined in modern Italian anyway).

These should appear in `must_not_include` on any pre-verb cluster question. Even though they don't change the marker's overall verdict (still a miss), they let the diagnostic show "you joined the cluster" rather than "I couldn't grade your answer".

**While you're at it**, propose a new bucket to capture this specific confusion:

```json
{
  "proposed_id": "pronoun.combined.joined_when_should_be_separate",
  "proposed_parent_id": "pronoun.combined",
  "proposed_label": "Joining a pre-verb clitic cluster into one word",
  "proposed_description": "Pre-verb clitic clusters (me lo, te ne, etc.) stay as two written words. The joined form (melo, tene) is what learners write when over-generalising from the post-verb attached pattern (vedermelo, dammene). Distinct from the choice of cluster (which combined.glielo_family etc. handle) and from the IOP/DOP ordering (combined.order_iop_before_dop).",
  "proposed_cefr_importance": {"A1": "arcane", "A2": "preview", "B1": "core", "B2": "core", "C1": "review", "C2": "fluency"},
  "proposed_prerequisites": ["pronoun.combined.vowel_changes"],
  "proposed_attributes": {"common_miss": "melo, telo, cene"},
  "rationale": "Real-world miss that the existing tree treats as 'didn't try' rather than as a specific known confusion. Worth its own bucket so we can track this learner pattern across many questions."
}
```

Put it in your `bucket_suggestions_pronoun.json`.

## 3. Twelve flagged items

Your `coverage_pronoun.md` lists twelve items you marked uncertain. I haven't yet got to them. When you next produce a revision pass, please surface any decisions you'd like resolved (e.g. the `op_dop_li_03` id-mismatch, the modern-vs-prescriptive PP agreement on reflexive+post-verb DO).

## What to do

1. Revise explanations in `grammar_questions_pronoun.json` and `translation_items_pronoun.json` to the house style.
2. Add the joined-when-separate wrong forms to `must_not_include` on relevant items.
3. Output the proposed bucket addition in `bucket_suggestions_pronoun.json`.
4. Output a `glossary_suggestions_pronoun.json` for any terms you use that aren't yet in `data/glossary.json`.

The starter glossary already covers: clitic, clitic cluster, DOP, IOP, fronting, left-dislocation, elision, agreement, participle agreement, formal address, reflexive verb, reflexive pronoun, articulated preposition, partitive, locative, stressed pronoun, subject pronoun. Check the file before suggesting additions.

Let me know if anything's unclear.
