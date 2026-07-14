# DISPATCH: Adverbs [DRAFT]

Status: DRAFT, authored off-bridge. Validate per DRAFT_NOTES_A2_TRANCHE.md before sending.

## Paste order

1. AUTHOR_BRIEF.md (Revision 7 or later). 2. Topic notes below. 3. data/buckets/adverb.json.

## Topic notes

You are the AdverbAuthor chat. Your topic is adverbs: the -mente formation, the primary adverbs, and the adjective-or-adverb discriminations.

### Scope

All leaves of the adverb tree, with one hard boundary: compound-tense adverb placement (già/mai/ancora between auxiliary and participle) belongs to the passato prossimo tree's adverb_placement bucket. Cite it cross-tree if an item genuinely needs it; do not author fresh coverage for it.

### Hot spots, in priority order

1. Bene vs buono (usage.bene_vs_buono). Highest-frequency anglophone confusion in the topic. Author production both ways round, plus the wellbeing idiom (sto bene) and the trap that "sto buono" means "I behave".
2. Invariable molto (usage.invariable_vs_adjective). Items where molto/poco/troppo sit next to feminine or plural material, baiting agreement: "Le ragazze sono molto stanche" with must_not_include "molte stanche".
3. -mente formation, both regular and -le/-re. "Form the adverb" is legitimate scaffolding (names the output form, not the rule); do not say "build it on the feminine".
4. Position (simple tenses only, per the boundary above).

### Prompt traps

- Criterion 13: naming "adverb" as the output form is fine; naming the feminine-stem rule or the e-drop rule is not.
- Criterion 9: single slot; adverb answers are single words, so this is easy to honour.
- Substring care: molto/molte differ by one letter; keep must_not_include phrases long enough (catch "molte stanche", not bare "molte").
- Direction: formation leaves production_only except primary (bidirectional); bene_vs_buono bidirectional and good IT→EN material.

### Worked example

```json
{
  "external_id": "adv_lere_01",
  "prompt": "Forma l'avverbio: 'Guida in modo prudente' → 'Guida ____.'",
  "cefr_level_target": "A2",
  "marks": 1,
  "markpoints": [
    {
      "bucket": "adverb.formation.mente_le_re",
      "label": "-le and -re drop the e",
      "credit": 1.0,
      "any_phrases": ["prudentemente"],
      "must_not_include": [
        {"phrase": "prudentamente", "note": "adjectives in -e build the adverb straight on that form; there is no feminine -a to use"}
      ]
    }
  ],
  "explanation": "Adverbs of manner are built with -mente. Adjectives ending in -o use the feminine (lenta + mente), but prudente already ends in -e, so -mente attaches directly: prudentemente. Adjectives in -le and -re drop the e first: facile gives facilmente.",
  "vocab_help": [
    {"lemma": "prudente", "language": "it", "aspects": {"translation": {"reveal": "prudente - careful, cautious", "bucket": "vocabulary.it.prudente.translation"}}}
  ]
}
```

### Expected outputs

grammar_questions_adverb.json (prefix adv_), translation_items_adverb.json (trans_adv_), bucket_suggestions_adverb.json, glossary_suggestions_adverb.json (candidates: adverb of manner, invariable), coverage_adverb.md.

### Cross-references (verify on disk)

verb_form.passato_prossimo.adverb_placement (the boundary); adjective_agreement (the agreeing twin of the invariable forms).

### Misconception-axis candidates

"Cucina buono", "molte stanche", and invented -mente forms from primary adverbs.
