# DISPATCH: Si constructions [DRAFT]

Status: DRAFT, authored off-bridge. Validate per DRAFT_NOTES_A2_TRANCHE.md before sending.

## Paste order

1. AUTHOR_BRIEF.md (Revision 7 or later). 2. Topic notes below. 3. data/buckets/si_constructions.json.

## Topic notes

You are the SiAuthor chat. Your topic is impersonal si and si passivante: the basic patterns, the strange agreements, the sign register, and telling this si apart from the reflexive.

### Scope

All leaves of the si_constructions tree. Reflexive si itself belongs to the pronoun tree; your which_si leaf tests telling them apart in reading, citing pronoun.reflexive cross-tree. The passive-vs-si choice is owned by the passive tree (passive.usage.vs_si_passivante); leave that discrimination to PassiveAuthor.

### Hot spots, in priority order

1. Passivante agreement (passivante.agreement). The si vendono / si vende choice, missed constantly. Keep the noun's number away from the blank's immediate neighbourhood where possible. Same instinct as c'è / ci sono: cross-cite existential.form.plural as a prerequisite, and consider a couple of items juxtaposing the two constructions.
2. Passivante vs impersonal (passivante.vs_impersonal). Transitive-with-noun agrees; intransitive-or-objectless stays singular. Catch "si mangiano bene" with a note.
3. The advanced agreements (impersonal.advanced): plural adjective (si è stanchi), essere in compounds (si è parlato), plural participle for essere verbs (si è arrivati). B2, worth several angles each; per criterion 8, split markpoints when an item tests two of these at once.
4. Basic impersonal production, including si può / si deve / non si sa.
5. Signs (attached_signs): recognition items on Affittasi / Cercasi / Vendesi.

### Prompt traps

- Criterion 13: never "use the impersonal si" as an instruction inside a discrimination item; a cue naming the verb lemma is fine.
- Criterion 9: single slot for si + verb together (they always travel as a unit here).
- Substring care: "si vende" and "si vendono" do not substring-collide, but check every pair you author; the marker's norm() collapses whitespace.
- Direction: impersonal and passivante leaves production_only; which_si and attached_signs bidirectional and recognition-heavy.

### Worked example

```json
{
  "external_id": "si_pass_agr_01",
  "prompt": "In quel negozio ____ libri usati. (vendere)",
  "cefr_level_target": "B1",
  "marks": 1,
  "markpoints": [
    {
      "bucket": "si_constructions.passivante.agreement",
      "label": "Si vendono libri: agreeing with the noun",
      "credit": 1.0,
      "any_phrases": ["si vendono"],
      "must_not_include": [
        {"phrase": "si vende", "note": "libri usati is plural, and in this construction the verb agrees with it"},
        {"phrase": "vendono", "note": "without si this says some unnamed people sell, a different construction; the si version is wanted here"}
      ]
    }
  ],
  "explanation": "With si and a transitive verb, the thing sold is the grammatical subject, so the verb agrees with it: libri is plural, so si vendono. With one thing it drops to singular: si vende una bici. The same number instinct as c'è and ci sono.",
  "vocab_help": [
    {"lemma": "usato", "language": "it", "aspects": {"translation": {"reveal": "usato - used, second-hand", "bucket": "vocabulary.it.usato.translation"}}}
  ]
}
```

### Expected outputs

grammar_questions_si_constructions.json (prefix si_), translation_items_si_constructions.json (trans_si_), bucket_suggestions_si_constructions.json, glossary_suggestions_si_constructions.json (candidates: impersonal si, si passivante), coverage_si_constructions.md.

### Cross-references (verify on disk)

pronoun.reflexive (which_si); existential.form.plural (the agreement sibling); verb_form.passato_prossimo.auxiliary (compound impersonal); passive.usage.vs_si_passivante (owned by PassiveAuthor, cite only).

### Misconception-axis candidates

"Si vende libri", "si mangiano bene", singular adjective after impersonal essere, and impersonal si read as reflexive.
