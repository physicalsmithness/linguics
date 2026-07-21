# Follow-up for the passato_prossimo authoring chat

Paste this into the existing passato_prossimo chat thread.

---

Hi. Since you produced the passato_prossimo batch (82 grammar + 30 translation, 9 bucket suggestions), the brief has been revised based on your feedback and the adjective_agreement chat's. Several decisions ratified directly affect what you wrote and may want a small revision pass.

## Decisions made since your run

1. **Your bucket-tree proposals were mostly accepted.** Added to the canonical tree:
   - `auxiliary.person_agreement` (your #1; resolves the "1-3 any_phrases" auxiliary-choice problem)
   - `auxiliary.modal_inheritance` (sono dovuto vs ho dovuto)
   - `adverb_placement` (mai / ancora / già between aux and participle)
   - `translation_mapping.en_simple_past` and `translation_mapping.en_present_perfect`
   - `participle_agreement.with_avere.preceding_partitive_ne`
   - `participle_agreement.with_essere.mixed_gender_default`
   - **Deferred**: `conoscere_conosciuto`, `stem_expansion_class` aggregate. Both useful but lower priority.

2. **Brief revisions in response to your feedback**:
   - Target counts are now framed as "produce until coverage feels honest" rather than 30/15. Your 82/30 was the right call.
   - CEFR is a steer not a gate. Your coverage-first approach was right.
   - `topic_short` is now an explicit field on each bucket-tree root's `attributes`. For PP it's `pp` (which you used). For adj it's `aa`. For pronouns it's `op`.
   - Negative reference translations now have explicit `polarity: "negative"` instead of using `notes`. Your existing entries using `notes` will keep working but the formal field is now there if you want to use it.

3. **`severity` field is dropped from the v1 schema.** Please omit it from any new items; ignore in revisions.

4. **`any_phrases` can be graded.** Each entry is now either a plain string (full credit) or `{"phrase": "...", "credit": 0.8, "note": "archaic but grammatical"}` for partial-credit acceptance. **Specifically relevant to you**: this solves the `visto / veduto` problem you flagged. Use `{"phrase": "veduto", "credit": 0.8, "note": "archaic but grammatical"}` for the older form.

5. **Prompt should not give away the topic.** Your prompts mostly already follow this (you used parenthetical infinitives and time markers). But please double-check: any prompt that says "in passato prossimo" or "form the past tense" is giving the topic away. The grammar engine no longer displays the topic breadcrumb on the question card, but the prompt itself shouldn't either.

6. **`explanation` required on every question.** Most of yours already have one. A handful of the simpler regular-participle items may not; please add a one-liner where missing. The explanation now appears in a "Why:" block under the result panel.

7. **`vocab_help` schema is now per-lemma with aspects** (this is the biggest change):

   ```json
   "vocab_help": [
     {
       "lemma": "went",
       "language": "en",
       "aspects": {
         "translation": { "reveal": "to go - andare", "bucket": "vocabulary.it.andare.translation" },
         "auxiliary": { "reveal": "essere (motion intransitive)", "bucket": "vocabulary.it.andare.auxiliary" }
       }
     }
   ]
   ```

   The UI builds a button per lemma plus makes the matching word in the prompt clickable. Each aspect reveal records a miss against its specific bucket.

   **Four rules**:

   - **Include an aspect only if the answer doesn't directly test that knowledge.** So for a grammar question "Maria ____ andata" (testing the auxiliary), don't include `auxiliary` as an aspect of `andata` (it would be a giveaway). For a translation item where the answer is a whole compound verb, `auxiliary` IS valid help (it reveals one piece of the multi-piece answer).
   - **Reveal the lemma form, not inflected forms.** "went" reveals `andare`, not `andato/a`. The learner has to produce the inflection themselves.
   - **For translation aspects, format the reveal as `<source citation> - <target citation>`.** So "went" reveals `to go - andare` (English infinitive then Italian infinitive). "Houses" reveals `house - casa`. For Italian source lemmas: "casa" reveals `casa - house`.
   - **Each aspect reveals only its own information.** No leaking across aspects. The translation reveal contains no gender, no auxiliary, no class. So don't write `casa (f) - house` or `to go - andare (essere)`; those leak gender and auxiliary into the translation reveal. The learner asks for those separately if they want them. Non-translation aspects give just their fact: `gender` reveals "feminine (f)", `auxiliary` reveals "essere (motion intransitive)", `adj_class` reveals "Class I (-o/-a/-i/-e)".

   Canonical aspect names: `translation`, `gender`, `adj_class`, `auxiliary`, `infinitive`. Avoid `plural`, `participle`, `conjugation` (they're usually giveaways).

   See the revised AUTHOR_BRIEF §2 for the full table.

## What to do

1. Review your earlier `grammar_questions_verb_form.passato_prossimo.json` and `translation_items_verb_form.passato_prossimo.json` against the new conventions:
   - Strip any `severity` fields.
   - Confirm every question has an `explanation`. Add where missing.
   - Confirm no prompt explicitly names the tense or topic. Rewrite if it does.
   - For `vedere → visto / veduto` cases, migrate to the graded `any_phrases` form (visto = 1.0, veduto = 0.8).
   - Migrate `vocab_help` to the rich per-lemma shape where you've used it.

2. Cover the new bucket-tree additions you proposed:
   - `auxiliary.person_agreement`: 4-6 grammar items.
   - `auxiliary.modal_inheritance`: 4-6 grammar items.
   - `adverb_placement`: 4-6 grammar items, 2-3 translation items.
   - `translation_mapping.en_simple_past` / `en_present_perfect`: 6-10 translation items exercising the it→en direction.
   - `participle_agreement.with_avere.preceding_partitive_ne`: 2-3 grammar + a translation item.
   - `participle_agreement.with_essere.mixed_gender_default`: 2-3 grammar + a translation item.

3. Return the revised + new JSON files. The housing's manifest-loader will pick them up automatically.

Let me know which of these you want to take on.
