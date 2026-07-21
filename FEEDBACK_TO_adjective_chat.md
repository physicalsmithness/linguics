# Follow-up for the adjective_agreement authoring chat

Paste this into the existing adjective_agreement chat thread. The chat already has full context about its earlier output; this message asks it to review with the new conventions.

---

Hi. Since you produced the adjective_agreement batch (134 grammar + ~30 translation, plus the 16 bucket suggestions), the brief has been revised based on your feedback and the passato_prossimo chat's. Several decisions ratified directly affect what you wrote and may want a small revision pass.

## Decisions made since your run

1. **Bucket tree additions ratified.** The following proposals from your `bucket_suggestions_adjective_agreement.json` have been added to the canonical tree:
   - `stem_changes.predictable.cio_ci`, `gio_gi`, `cia_ce`, `gia_ge`
   - `stem_changes.irregular.amico_amici`, `greco_greci`, `antico_antichi`
   - `mixed_gender_plural_defaults_masculine`
   - `invariable` aggregate with `colour_from_noun`, `compound_colour`, `pari_family` leaves
   - The typo in `e_class.feminine_plural.attributes.common_miss` is fixed.
   - **Deferred** (the aggregate works without them): position semantic_shift word-leaves (vecchio, grande, povero). If you'd like to add items to these specific leaves, propose them again and we'll promote.

2. **`severity` field is dropped from the v1 schema.** Please omit it from any new items; ignore in revisions.

3. **Reference-translation `polarity`.** Translation references can now carry `"polarity": "negative"` to flag instructive-wrong anchors (something the AI marker should NOT credit). Useful for guarding common false-friend mistakes.

4. **`any_phrases` can be graded.** Each entry is now either a plain string (full credit) or `{"phrase": "...", "credit": 0.8, "note": "archaic but grammatical"}` for partial-credit acceptance. Use the object form for "right but not the modern/preferred" forms (e.g. an old-fashioned spelling).

5. **Prompt should not give away the topic.** The system used to render the topic breadcrumb on the question card (which read like a free hint). That's been removed. But the prompts themselves should also not name the topic. The prompt should be unambiguous about the form wanted without saying "in the feminine plural" or "Class II". Use context, articles, time markers, and the "(infinitive)" parenthetical instead. If a prompt you wrote violates this, please rewrite.

6. **`explanation` required, always.** Even on items where the answer feels obvious. The explanation now appears in a "Why:" block under the result panel and is shown after marking. For irregular forms, the explanation is doing real work; for regular forms, a one-liner suffices.

7. **`vocab_help` schema is now per-lemma with aspects.** This is the biggest change. The previous flat shape (`{"label": "...", "reveal": "...", "bucket": "..."}`) still works for back-compat, but new and revised items should use the rich shape:

   ```json
   "vocab_help": [
     {
       "lemma": "rosso",
       "language": "it",
       "aspects": {
         "translation": { "reveal": "rosso - red", "bucket": "vocabulary.it.rosso.translation" },
         "adj_class": { "reveal": "Class I (-o/-a/-i/-e)", "bucket": "vocabulary.it.rosso.adj_class" }
       }
     },
     {
       "lemma": "casa",
       "language": "it",
       "aspects": {
         "translation": { "reveal": "casa - house", "bucket": "vocabulary.it.casa.translation" },
         "gender": { "reveal": "feminine (f)", "bucket": "vocabulary.it.casa.gender" }
       }
     }
   ]
   ```

   The UI builds a button per lemma plus makes the matching word in the prompt clickable. Each aspect reveal records a miss against its specific bucket. So a learner who asks "what gender is casa?" gets `vocabulary.it.casa.gender` logged distinct from `vocabulary.it.casa.translation`.

   **Four rules for the rich shape:**

   - **Include an aspect only if the answer doesn't directly test that knowledge.** Otherwise the help is giving away the answer. So `plural` is never an aspect (the answer is the plural form). `gender` IS a valid aspect (a wrong agreement could be wrong-rule OR wrong-gender; the help separates the two).
   - **Reveal the lemma form, not the inflected surface form.** So "houses" reveals `casa`, not `case`. "Went" reveals `andare`, not `andato/a`. The learner has to produce the inflection.
   - **For translation aspects, format the reveal as `<source citation> - <target citation>`.** So "rosso" reveals `rosso - red`. "Case" (the inflected form in the prompt) reveals `casa - house` (both citation forms). "Went" reveals `to go - andare`.
   - **Each aspect reveals only its own information.** The translation reveal contains no gender hint, no class hint, no auxiliary hint. Don't write `casa (f) - house` for the translation reveal; that leaks the gender, which the learner can ask about separately if they want. Non-translation aspects give just their fact: `gender` reveals "feminine (f)", `adj_class` reveals "Class I (-o/-a/-i/-e)", `auxiliary` reveals "essere (motion intransitive)".

   Canonical aspect names: `translation`, `gender`, `adj_class`, `auxiliary`, `infinitive`. (NOT `plural`, NOT `participle`, NOT `conjugation` unless the question explicitly doesn't test those things, which is rare.)

   See the revised AUTHOR_BRIEF §2 for the full table.

## What to do

1. Review your earlier `grammar_questions_adjective_agreement.json` and `translation_items_adjective_agreement.json` against the new conventions. Specifically:
   - Strip any `severity` fields.
   - Confirm every question has an `explanation`. Add where missing.
   - Confirm no prompt explicitly names the tense/topic/rule. Rewrite if it does.
   - Migrate `vocab_help` from the flat shape to the rich per-lemma shape, applying the two strict rules above.
2. If you want to propose any of the deferred buckets (vecchio / grande / povero as position-shift leaves), please do.
3. Return the revised JSON files. The housing's manifest-loader will pick them up automatically.

No re-author required for items that don't have `vocab_help` and don't have prompt giveaways; those are fine as-is.

Coverage of the new bucket-tree additions (cio_ci, gio_gi, cia_ce, gia_ge, amico_amici, greco_greci, antico_antichi, mixed_gender_plural, invariable + children) would also be welcome if you'd like to extend the batch. Roughly 3-5 grammar items per new leaf, plus a few translation items that exercise the invariable / colour cases.

Let me know which of these you want to take on.
