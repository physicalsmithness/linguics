# DISPATCH: Comparatives and superlatives [DRAFT]

Status: DRAFT, authored off-bridge. Validate per DRAFT_NOTES_A2_TRANCHE.md before sending.

## Paste order

1. AUTHOR_BRIEF.md (Revision 7 or later). 2. Topic notes below. 3. data/buckets/comparison.json.

## Topic notes

You are the ComparisonAuthor chat. Your topic is comparatives and superlatives: più/meno with di and che, equality, the irregular forms, and both superlatives.

### Scope

All leaves of the comparison tree. Adjective agreement inside your answers (bellissima agreeing) cites the adjective tree cross-tree rather than becoming your markpoint, unless agreement IS the tested skill of the item.

### Hot spots, in priority order

1. Di vs che (comparative.di_vs_che). The topic's diagnostic heart. Cover all four che triggers (two qualities, two verbs, two nouns in quantity, two prepositional phrases) and the di-before-numerals exception. must_not_include the wrong connector with a note on every item.
2. Migliore vs meglio. Author both directions of the confusion. Ruling to implement: "è meglio" with a noun subject (questo libro è meglio) is a graded any_phrases entry at 0.5 with a register note, not a flat miss.
3. Relative superlative article discipline: catch "la città la più bella" (the French calque) with a note.
4. -issimo spelling at the join: stanchissimo keeps the h, simpaticissimo does not. Cross-cite the adjective tree's stem-change buckets where the item genuinely tests the spelling shift.
5. Double comparatives: catch "più migliore", "molto ottimo", "molto bellissimo" wherever plausible.

### Prompt traps

- Criterion 13: never "use che because you are comparing two qualities"; a cue naming the adjective is fine.
- Criterion 9: single slot. Since di/che answers are short and substring-risky, prefer full-phrase markpoints (any_phrases "che agire", not bare "che"); the marker's norm() makes two-letter needles match inside longer words.
- Criterion 10a logic: equality items must not also admit a comparative reading.
- Direction: formation leaves production_only; di_vs_che, migliore_vs_meglio, superlative.irregular are bidirectional and want IT→EN recognition items too.

### Worked example

```json
{
  "external_id": "cmp_dique_02",
  "prompt": "Completa: È più facile criticare ____ agire.",
  "cefr_level_target": "B1",
  "marks": 1,
  "markpoints": [
    {
      "bucket": "comparison.comparative.di_vs_che",
      "label": "Di or che?",
      "credit": 1.0,
      "any_phrases": ["che agire"],
      "must_not_include": [
        {"phrase": "di agire", "note": "comparing two verbs takes che, not di"}
      ]
    }
  ],
  "explanation": "When a comparison sets two of the same kind of thing side by side, two actions here (criticare and agire), the connector is che. Di is for comparing two different entities against one quality: Marco è più alto di Luca.",
  "vocab_help": [
    {"lemma": "agire", "language": "it", "aspects": {"translation": {"reveal": "agire - to act", "bucket": "vocabulary.it.agire.translation"}}}
  ]
}
```

### Expected outputs

grammar_questions_comparison.json (prefix cmp_), translation_items_comparison.json (trans_cmp_), bucket_suggestions_comparison.json, glossary_suggestions_comparison.json (candidates: comparative, superlative, absolute superlative, relative superlative), coverage_comparison.md.

### Cross-references (verify on disk)

adjective_agreement and its stem_changes branch; article.definite (relative superlative); preposition.articulated (di + article contractions).

### Misconception-axis candidates

The di/che swap, "più migliore", and the repeated-article superlative calque.
