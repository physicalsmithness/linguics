# DISPATCH: Pronominal verbs [DRAFT]

Status: DRAFT, authored off-bridge. Validate per DRAFT_NOTES_A2_TRANCHE.md before sending. This topic overlaps ratified pronoun-tree buckets; the overlap audit there MUST run before this dispatch goes out.

## Paste order

1. AUTHOR_BRIEF.md (Revision 7 or later). 2. Topic notes below. 3. data/buckets/pronominal_verbs.json, PLUS the pronoun tree (its ne and locative-ci idiom buckets are cited constantly).

## Topic notes

You are the PronominalVerbsAuthor chat. Your topic is the verbs whose clitics are part of the word: farcela, andarsene, cavarsela, prendersela, volerci, metterci, avercela, and the frozen ce l'ho pattern.

### Scope and the citation rule

The pronoun tree owns the clitic mechanics: motion_andarsene, the pronominal-idiomatic ne verbs (starsene, fregarsene, intendersene, uscirsene), the locative-ci idiom cluster (farcela, volerci, tenerci), and the combined-cluster rules. Your topic is the learner-facing home for these verbs' meaning and whole-verb conjugation. Items that exercise a clitic rule cite the pronoun bucket cross-tree alongside your leaf. Do not propose new buckets under the pronoun tree; anything missing goes in your own suggestions file for the architect to place.

### Hot spots, in priority order

1. Volerci vs metterci (meaning.volerci_vs_metterci). Impersonal requirement vs personal time-taking, plus volerci's own number agreement (ci vuole un'ora, ci vogliono due ore). Beware: many time frames admit both readings ("da casa mia ci metto/ci vogliono venti minuti" are both natural); either pin the frame or accept both. The agreement-only items (verb cued) are the clean shape.
2. The -sela past agreement (mechanics.sela_type). Ce l'ho fatta, se l'è cavata: the invariably feminine participle. Catch "ce l'ho fatto" with a note; it is among the most common advanced-learner slips in the language.
3. Ce l'ho possession (meaning.ce_lho_possession). Short dialogue items; catch bare "l'ho" and "ci l'ho".
4. Core-set recognition (meaning.core_set). IT→EN items reading non ce la faccio, ce l'ha con me, non me la sento in context. This leaf is recognition-first.
5. The -sene family: vowel shift (me ne, not mi ne) and essere in compounds, citing the pronoun ne buckets.

### Prompt traps

- Criterion 13: a cue naming the verb in citation form ("(farcela)", "(cavarsela)") is fine and usually necessary; never explain the frozen-clitic rule in the prompt.
- Criterion 9: single slot for the whole cluster + verb ("____" answered by "me la cavo"), since word count varies wildly by person and tense.
- Substring care: "ci vuole" and "ci vogliono" are safe from each other; "l'ho" is short and risky, so full-phrase markpoints ("ce l'ho", "non ce l'ho") throughout.
- Criterion 10a: past items pin tense; volerci items pin the impersonal frame or accept metterci variants.
- Direction: mechanics leaves production_only; meaning leaves bidirectional, and core_set items lean IT→EN.

### Worked example

```json
{
  "external_id": "pv_ci_agr_01",
  "prompt": "Per questa ricetta ____ tre uova. (volerci)",
  "cefr_level_target": "B1",
  "marks": 1,
  "markpoints": [
    {
      "bucket": "pronominal_verbs.mechanics.ci_type",
      "label": "Ci verbs: ci vuole, ci metto, ce l'ho",
      "credit": 1.0,
      "any_phrases": ["ci vogliono"],
      "must_not_include": [
        {"phrase": "ci vuole", "note": "tre uova is plural, and volerci agrees with what is required"},
        {"phrase": "vogliono", "note": "without ci this is plain volere (someone wants); the requirement sense needs volerci"}
      ]
    }
  ],
  "explanation": "Volerci says what is needed, and it agrees with the needed thing: ci vuole un uovo, ci vogliono tre uova. The ci is part of the verb, not a location. Metterci is its personal cousin: io ci metto un'ora.",
  "vocab_help": [
    {"lemma": "uovo", "language": "it", "aspects": {"translation": {"reveal": "uovo - egg", "bucket": "vocabulary.it.uovo.translation"}}}
  ]
}
```

### Expected outputs

grammar_questions_pronominal_verbs.json (prefix pv_), translation_items_pronominal_verbs.json (trans_pv_), bucket_suggestions_pronominal_verbs.json, glossary_suggestions_pronominal_verbs.json (candidates: pronominal verb, frozen clitic, lexicalised), coverage_pronominal_verbs.md.

### Cross-references (verify on disk)

pronoun.ne.motion_andarsene, pronoun.ne.pronominal_idiomatic_verbs, pronoun.ci_locative.idiomatic_verbs (and its farcela leaf), pronoun.combined, pronoun.reflexive; verb_form.passato_prossimo.auxiliary for the compound tenses.

### Misconception-axis candidates

"Ce l'ho fatto", "mi ne vado", "ci l'ho", volerci/metterci frame swaps, and literal readings of ce l'ha con me.
