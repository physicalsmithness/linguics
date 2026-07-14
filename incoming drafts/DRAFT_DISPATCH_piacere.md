# DISPATCH: Piacere and friends [DRAFT]

Status: DRAFT, authored off-bridge by the architect chat. Validate against AUTHOR_BRIEF (Revision 7) and the on-disk bucket-tree conventions before sending to an author chat. See DRAFT_NOTES.md.

## Paste order

1. The full contents of AUTHOR_BRIEF.md (Revision 7 or later).
2. The "Topic notes" section below.
3. The full contents of data/buckets/piacere.json.

## Topic notes

You are the PiacereAuthor chat. Your topic is the piacere construction: the liked thing as subject, the liker as indirect object, agreement, the a-phrase, the past with essere, and the surrounding traps (dispiacere, anche a me, the family verbs).

### Scope

Author against every leaf of the piacere tree. The indirect-object clitics themselves (their forms, positions, clusters) belong to the pronoun tree; your experiencer_clitic leaf tests choosing the right clitic in a piacere frame, not clitic grammar at large. If you need buckets that do not exist, propose them in bucket_suggestions_piacere.json.

### Coverage criterion

Rule internalisation, not counts. The subject flip and piace/piacciono agreement are the diagnostic heart and deserve the deepest, most varied coverage: multiple persons, tenses within scope, distances between blank and liked noun, and both bare-noun and infinitive frames.

### Hot spots, in priority order

1. The subject flip (usage.subject_flip). Richest must_not_include territory in the whole A1 catalogue: catch "io piaccio", "piaccio la", "io piace" variants with notes explaining that the liked thing is the subject. EN→IT translation items ("I like the sea") are the natural shape here.
2. Agreement (form.agreement). Keep the liked noun away from the blank where possible, and mix in plural experiencers with singular liked things (ci piace la montagna) to catch agreement copied from the wrong noun.
3. Piace + infinitive (form.with_infinitive). Always bait with a plural object after the infinitive: mi piace leggere i gialli.
4. Past (form.past). Two skills in one answer: essere as auxiliary and participle agreement with the liked thing. Per brief criterion 8, author these as separate markpoints (one for the auxiliary/verb form, one for the agreement) so a learner who writes "mi ha piaciuto" and one who writes "mi è piaciuto" for a feminine noun get different diagnostics. Tense anchors per criterion 10a.
5. Clitic choice (form.experiencer_clitic). gli vs le, and formal Le. When the formal register is wanted, state the register in the prompt (criterion 11), never the form.
6. Anche a me (usage.agreeing_responses). Short dialogue items; catch "anch'io" with a note.
7. Dispiacere (usage.dispiacere). Recognition (IT→EN) items are the natural shape for "non mi dispiace" understatement; production items for "mi dispiace" = sorry.
8. Family verbs (usage.family_verbs). Mancare's direction flip is the sharpest test: "I miss you" → "mi manchi". Catch "ti manco" with a note. Keep counts modest; this leaf is B1-weighted.

### Architect ruling to implement: "a me mi piace"

Treat "a me mi piace" (and person-variants) as a graded any_phrases entry at credit 0.5 with a note, for example: {"phrase": "a me mi piace", "credit": 0.5, "note": "heard everywhere in speech, but standard Italian uses either 'mi piace' or 'a me piace', not both at once"}. Not a flat miss. The engine honours graded entries.

### Prompt-writing traps specific to this topic

- Never name the rule (criterion 13): no "remember the verb agrees with the thing liked", no "inverted construction", no "use an indirect object pronoun". A cue of "(piacere)" naming the verb is fine; so is "(piacere, formal)" when register matters.
- One slot for the whole verb answer (criterion 9): piace vs piacciono differ only within one word, but past answers (è piaciuto) are multi-word, so use a single combined slot throughout.
- Do not glossary-wrap prompts (criterion 12): jargon like "experiencer" belongs in explanations, where the glossary will catch it.
- Direction: form leaves are production_only (grammar items and EN→IT only). usage leaves are bidirectional; liking_people and dispiacere are particularly good IT→EN recognition material ("mi piaci" read correctly is a pure recognition win).

### vocab_help

Rich per-lemma shape. Never include an aspect revealing the liked noun's number (that is what agreement tests). Gender aspects are fine here since gender is only tested in past-participle items; omit gender help on those specific items.

### Worked example

```json
{
  "external_id": "pia_form_agr_03",
  "prompt": "A Luca ____ i film dell'orrore. (piacere)",
  "cefr_level_target": "A1",
  "marks": 1,
  "markpoints": [
    {
      "bucket": "piacere.form.agreement",
      "label": "Piace or piacciono? Agreeing with the liked thing",
      "credit": 1.0,
      "any_phrases": ["piacciono"],
      "must_not_include": [
        {"phrase": "piace", "note": "the subject here is i film, which is plural, so the verb must be plural"},
        {"phrase": "piacere", "note": "a conjugated form is needed, not the infinitive"}
      ]
    }
  ],
  "explanation": "With piacere, the thing that is liked is the subject of the sentence, so the verb agrees with it. I film dell'orrore is plural, so the verb is piacciono. Luca, the person who likes them, sits in the a-phrase and does not affect the verb.",
  "vocab_help": [
    {"lemma": "film", "language": "it", "aspects": {"translation": {"reveal": "film - film, movie", "bucket": "vocabulary.it.film.translation"}}}
  ]
}
```

### Expected outputs

- data/grammar_questions_piacere.json (external_id prefix pia_)
- data/translation_items_piacere.json (prefix trans_pia_)
- data/bucket_suggestions_piacere.json (empty array with rationale if none)
- data/glossary_suggestions_piacere.json (likely candidates: experiencer, indirect object already exists, litotes probably too arcane)
- data/coverage_piacere.md

### Cross-references (verify ids on disk before relying on them)

- pronoun.indirect_object (experiencer_clitic prerequisite)
- verb_form.passato_prossimo.auxiliary and verb_form.passato_prossimo.participle_agreement.with_essere (past leaf)
- verb_form.present_indicative.formation (form branch prerequisite)
- vocabulary tree: piacere-family lemmas (mancare, servire, bastare, interessare, sembrare) for vocab_help buckets

### Misconception-axis candidates (for the architect, not for you to implement)

The subject flip ("io piaccio X"), the mancare direction flip ("ti manco" for "I miss you"), and dispiacere-as-dislike are all first-class misconception candidates when that axis is wired up.
