# DISPATCH: C'è and ci sono (existential) [DRAFT]

Status: DRAFT, authored off-bridge by the architect chat. Validate against AUTHOR_BRIEF (Revision 7) and the on-disk bucket-tree conventions before sending to an author chat. See DRAFT_NOTES.md.

## Paste order

1. The full contents of AUTHOR_BRIEF.md (Revision 7 or later).
2. The "Topic notes" section below.
3. The full contents of data/buckets/existential.json.

## Topic notes

You are the ExistentialAuthor chat. Your topic is the existential construction: c'è and ci sono, their negative, question, and past forms, and the choice between c'è, plain essere, and ecco.

### Scope

Author against every leaf of the existential tree. Both branches are yours: form (production) and usage (bidirectional). Do not author anything about ci in its other lives (locative ci, ci as a pronoun, farcela / volerci); those live in the pronoun tree, and items that drift there should be left to PronounAuthor. If you find yourself needing a bucket that does not exist, propose it in bucket_suggestions_existential.json rather than inventing an id.

### Coverage criterion

Rule internalisation, not item counts: every rule hit from multiple angles. As a rough shape, the two agreement leaves (singular, plural) and vs_essere deserve the deepest coverage; idioms the lightest.

### Hot spots, in priority order

1. Number agreement (form.plural). The single most-missed thing in the topic. Author items where the noun's number is not adjacent to the blank, so the learner must track agreement rather than copy the neighbouring word: "Nel frigo ____ solo un uovo, ma ____ tre pomodori."
2. C'è vs essere (usage.vs_essere). The definiteness rule. Beware: colloquial availability readings make "C'è il libro sul tavolo" grammatical, so every item's context must force exactly one natural choice. If both readings survive your own re-read, rewrite the item (brief criterion 10a logic applies beyond tense).
3. Single slot always (brief criterion 9). C'è and ci sono differ in word count, so a two-slot blank leaks the answer's number. Every existential blank is one slot.
4. Past forms (form.past). Tense must be pinned unambiguously (criterion 10a): anchor with Ieri, C'era una volta, l'anno scorso, and so on. The imperfect/PP choice inside the past leaf belongs to the imperfect tree's discrimination buckets; cite them cross-tree when an item genuinely tests that choice, and keep this leaf's own items to form.
5. Questions and short answers. "Sì, c'è" not "Sì, è" is a cheap, high-frequency win.
6. Negation. Position of non; and non c'è nessuno staying singular.

### Prompt-writing traps specific to this topic

- Never name the rule (criterion 13): no "use c'è or ci sono depending on number", no "existential". A cue of "(esserci)" naming the verb is fine surface scaffolding.
- Do not announce that there is a choice (criterion 14 logic): vs_essere items must not say "choose between c'è and è".
- must_not_include: for plural items, catch "c'è" with a note ("tre uova is plural, so the verb must be plural too"); for vs_essere misses, catch the bare-essere calque. Remember the marker checks any_phrases before must_not_include, and norm() collapses whitespace; keep must_not_include phrases long enough not to match inside legitimate answers.
- Direction: form leaves are production_only, so grammar items and EN→IT translation only. usage leaves support both directions; IT→EN items on idioms and Che c'è? are good recognition material.

### vocab_help

Rich per-lemma shape as per the brief. Do not include any aspect that reveals the noun's number (that is what agreement items test). Translation aspects for content nouns are fine.

### Worked example

```json
{
  "external_id": "ex_form_pl_01",
  "prompt": "Nel frigo ____ tre uova. (esserci)",
  "cefr_level_target": "A1",
  "marks": 1,
  "markpoints": [
    {
      "bucket": "existential.form.plural",
      "label": "Ci sono with plural things",
      "credit": 1.0,
      "any_phrases": ["ci sono"],
      "must_not_include": [
        {"phrase": "c'è", "note": "tre uova is plural, so the verb must be plural too"},
        {"phrase": "ci è", "note": "ci + è always contracts to c'è, and here the plural is wanted anyway"}
      ]
    }
  ],
  "explanation": "When you say that things exist or are there, Italian uses esserci, and it agrees with the things themselves. Tre uova is plural, so the verb is plural: ci sono. With one thing it would be c'è: nel frigo c'è un uovo.",
  "vocab_help": [
    {"lemma": "uovo", "language": "it", "aspects": {"translation": {"reveal": "uovo - egg", "bucket": "vocabulary.it.uovo.translation"}}}
  ]
}
```

### Expected outputs

- data/grammar_questions_existential.json (external_id prefix ex_)
- data/translation_items_existential.json (prefix trans_ex_)
- data/bucket_suggestions_existential.json (empty array with rationale if none)
- data/glossary_suggestions_existential.json (likely candidates: existential construction, definiteness)
- data/coverage_existential.md

### Cross-references (verify ids on disk before relying on them)

- verb_form.present_indicative.formation.irregular.essere (prerequisite of the whole form branch)
- verb_form.imperfect.formation and verb_form.passato_prossimo (past leaf)
- article.definite / article.indefinite (the definiteness signal in vs_essere)
- pronoun tree's locative ci buckets: adjacent territory, not yours

### Misconception-axis candidates (for the architect, not for you to implement)

The "c'è + plural" agreement miss and the "è for existence" calque are both candidates for misconception tagging when that axis is wired up.
