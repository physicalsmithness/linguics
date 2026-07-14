# DISPATCH: Reported speech [DRAFT]

Status: DRAFT, authored off-bridge. Validate per DRAFT_NOTES_A2_TRANCHE.md before sending. This topic has the heaviest cross-tree citation load of the tranche; read the scope boundary carefully.

## Paste order

1. AUTHOR_BRIEF.md (Revision 7 or later). 2. Topic notes below. 3. data/buckets/reported_speech.json, PLUS the imperfect tree (its indirect_speech branch is cited constantly).

## Topic notes

You are the ReportedSpeechAuthor chat. Your topic is turning quotes into reports: the tense shifts and non-shifts, commands with di + infinitive, indirect questions with se, and the travelling deixis words.

### Scope and the citation rule

The imperfect tree already owns reported_present and reported_intention (verb_form.imperfect.indirect_speech.*). Your tense_shift leaves are the topic-facing home; items in that branch cite BOTH your leaf and the imperfect tree's corresponding bucket, so the skill accumulates in one place for the learner whichever topic produced the item. Do not author fresh items against the imperfect tree alone. Trapassato machinery is cited from the tense_choice tree; conditional formation from the conditional tree.

### Hot spots, in priority order

1. Future to PAST conditional (tense_shift.future_to_past_conditional). The Italian-specific trap and the topic's diagnostic jewel. Catch the present-conditional calque ("ha detto che verrebbe") as a full miss with a note. Ruling to implement: the colloquial imperfetto variant ("ha detto che veniva") is a graded any_phrases entry at 0.5 with a register note.
2. No-shift after a present reporter (tense_shift.no_shift). Over-shifting is the second-order error once backshift is learned; author items with dice/scrive as reporters.
3. Commands: di + infinitive, catching "che vengo" and the bare infinitive without di.
4. Present to imperfect, past to trapassato: transformation items ("Trasforma: ...") are the natural shape. The transformation instruction names the task, not the rule, and is fine.
5. Deixis: domani/ieri/qui/questo shifting. Good IT→EN recognition items too (reading il giorno dopo correctly).
6. Indirect questions with se, including the missing-se miss.

### Prompt traps

- Criterion 13: "trasforma in discorso indiretto" names the task and is fine; "shift the future to the past conditional" is not.
- Criterion 10a: the reporting verb's tense must be unambiguous, since it drives everything. Ha detto / disse anchor past; dice anchors present.
- Criterion 9: single slot for the shifted verb complex (sarebbe venuto is two words).
- Present-to-imperfect items: where the reported fact could still hold ("ha detto che è stanco" is acceptable when the tiredness persists), the context must exclude that reading or both forms must be accepted. Extension of the 10a discipline.
- Direction: tense_shift and commands and questions production_only; future_to_past_conditional and deixis bidirectional.

### Worked example

```json
{
  "external_id": "rep_futcond_01",
  "prompt": "Trasforma: Marco ha detto: 'Verrò alla festa.' → Marco ha detto che ____ alla festa.",
  "cefr_level_target": "B2",
  "marks": 1,
  "markpoints": [
    {
      "bucket": "reported_speech.tense_shift.future_to_past_conditional",
      "label": "Future becomes PAST conditional",
      "credit": 1.0,
      "any_phrases": [
        "sarebbe venuto",
        {"phrase": "veniva", "credit": 0.5, "note": "common in speech; the standard written form is the past conditional, sarebbe venuto"}
      ],
      "must_not_include": [
        {"phrase": "verrebbe", "note": "English says 'would come', but Italian reports a past speaker's future with the PAST conditional: sarebbe venuto"},
        {"phrase": "verrà", "note": "after a past reporting verb the future shifts back"}
      ]
    }
  ],
  "explanation": "When the reporting verb is in the past, a quoted future slides back. English slides to 'would come'; Italian goes one step further, to the past conditional: sarebbe venuto. The present conditional verrebbe is the direct calque and the classic miss.",
  "vocab_help": []
}
```

### Expected outputs

grammar_questions_reported_speech.json (prefix rep_), translation_items_reported_speech.json (trans_rep_), bucket_suggestions_reported_speech.json, glossary_suggestions_reported_speech.json (candidates: reported speech, backshift, reporting verb, deixis), coverage_reported_speech.md.

### Cross-references (verify on disk)

verb_form.imperfect.indirect_speech.reported_present and .reported_intention (cite on every corresponding item); tense_choice.trapassato_vs_imperfect; the conditional tree's past-conditional formation buckets; demonstrative (deixis).

### Misconception-axis candidates

"Che verrebbe" for future-in-the-past, over-shifting after dice, and unshifted domani inside a days-later report.
