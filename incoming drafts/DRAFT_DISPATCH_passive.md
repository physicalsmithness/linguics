# DISPATCH: The passive [DRAFT]

Status: DRAFT, authored off-bridge. Validate per DRAFT_NOTES_A2_TRANCHE.md before sending.

## Paste order

1. AUTHOR_BRIEF.md (Revision 7 or later). 2. Topic notes below. 3. data/buckets/passive.json.

## Topic notes

You are the PassiveAuthor chat. Your topic is the passive: essere, venire and andare as auxiliaries, the da agent phrase, and the choice against the si passivante.

### Scope

All leaves of the passive tree. The si passivante's own machinery belongs to the si_constructions tree; your vs_si_passivante leaf tests the CHOICE between the two, citing si_constructions.passivante.agreement cross-tree where an item exercises both.

### Hot spots, in priority order

1. Essere + participle with double agreement (formation.essere). Rewrite-to-passive items where the subject is feminine or plural, so the participle agreement is genuinely tested. Per criterion 8, when an item tests both the auxiliary tense and the participle agreement, split them into two markpoints.
2. Venire's simple-tense restriction. Catch "è venuto pagato" style compounds with a note. Recognition items on venire vs essere nuance are B2 material.
3. Andare = obligation (formation.andare). Recognition-heavy: IT→EN items where "va compilato" must be read as necessity. Production at B2.
4. Agent da. Catch di and per calques.
5. Vs si passivante: the agent test (si form cannot take da + agent) makes clean discrimination items.

### Prompt traps

- Criterion 13: "riscrivi al passivo" names the output form and is fine; "remember the participle agrees with the subject" is not.
- Criterion 9: one slot for the whole verb complex (auxiliary + participle together), since its word count varies by tense.
- Criterion 10a: pin the tense of the source sentence in rewrite items.
- Direction: formation leaves production_only except andare (bidirectional, meaning-laden); usage leaves bidirectional.
- Both "viene pagato" and "è pagato" are correct in simple-tense rewrites: put both in any_phrases at full credit unless the item's context selects one (a habitual-process frame slightly favours venire; do not penalise either without context that forces it).

### Worked example

```json
{
  "external_id": "pas_ess_03",
  "prompt": "Riscrivi al passivo: 'Il cliente paga il conto.' → 'Il conto ____ dal cliente.'",
  "cefr_level_target": "B1",
  "marks": 1,
  "markpoints": [
    {
      "bucket": "passive.formation.essere",
      "label": "Essere + participle",
      "credit": 1.0,
      "any_phrases": ["è pagato", "viene pagato"],
      "must_not_include": [
        {"phrase": "pagata", "note": "il conto is masculine, and the participle agrees with it"},
        {"phrase": "ha pagato", "note": "the passive is built on essere (or venire), never avere"}
      ]
    }
  ],
  "explanation": "The passive flips the sentence around the verb: the thing affected becomes the subject, and the verb becomes essere plus the past participle, agreeing with the new subject. Il conto è pagato (or viene pagato, the more dynamic variant) dal cliente, with da introducing whoever does it.",
  "vocab_help": [
    {"lemma": "conto", "language": "it", "aspects": {"translation": {"reveal": "conto - bill, account", "bucket": "vocabulary.it.conto.translation"}}}
  ]
}
```

### Expected outputs

grammar_questions_passive.json (prefix pas_), translation_items_passive.json (trans_pas_), bucket_suggestions_passive.json, glossary_suggestions_passive.json (candidates: passive voice, agent, dynamic passive), coverage_passive.md.

### Cross-references (verify on disk)

verb_form.passato_prossimo.participle_agreement.with_essere; si_constructions.passivante.agreement; the future and imperfect trees for tense-carried-by-essere items.

### Misconception-axis candidates

The avere-passive, "di" for the agent, and "va fatto" read as motion.
