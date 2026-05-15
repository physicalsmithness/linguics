# Style update for passato_prossimo explanations

Paste this into the existing passato_prossimo chat thread.

---

Quick follow-up. The Linguics platform now has a **glossary** built into the explanation renderer. Each grammatical term in an explanation gets wrapped in an interactive span: hovering shows a short definition; clicking will eventually show a longer one. The glossary lives in `data/glossary.json` and is maintained centrally; you (the author chat) propose additions but don't edit it directly.

What this means for your explanations: **use jargon naturally and assume the reader is grammatically literate**. Don't inline-define terms like "auxiliary", "past participle", "essere", "transitive", "DOP/IOP", "participle agreement", "ne", "elision", etc. The platform makes them clickable. The reader who knows skims past; the reader who doesn't hovers.

## House style for explanations

Each explanation should:

1. **Lead with what Italian is doing in everyday terms.**
2. **Name the relevant grammatical term explicitly when first introduced.** No inline expansion.
3. **Use the term thereafter** without re-defining.
4. **Finish with the concrete working** that produces the answer.

Be compact. ~30-60 words is the right length for most explanations.

### Worked example

For a passato prossimo with DOP-agreement question ("L'ho vista"):

> When a direct object pronoun precedes a verb in the passato prossimo, the participle agrees with it. The DOP here is la (referring to Maria, f.sg), elided to l'. So the participle is vista, not visto. The full answer: l'ho vista.

That's it. "direct object pronoun", "passato prossimo", "DOP", "f.sg", "elided", "participle" are glossary terms; the platform will make them clickable. No need to inline-explain "the past participle is the verb form ending in -ato/-uto/-ito" etc.

## What I'd like you to do

1. **Revise the explanations** across your `grammar_questions_verb_form.passato_prossimo.json` and `translation_items_verb_form.passato_prossimo.json` to match this house style. The current explanations are clear but assume the reader has decoded all the abbreviations themselves; with the glossary, they can be much more compact.

2. **Propose glossary additions** for any terms you used that aren't yet covered. Output them in a `glossary_suggestions_verb_form.passato_prossimo.json`:

```json
[
  {
    "term": "stem expansion",
    "short": "When a verb's contracted infinitive 'opens out' to a longer stem in the participle...",
    "long": "Bere (from older bevere) gives bevuto; fare (from facere) gives fatto; dire (from dicere) gives detto. The contracted infinitives belong to a recognisable class...",
    "aliases": []
  }
]
```

3. **Don't touch any field other than `explanation`** in the existing items. Return the revised arrays plus the suggestions file.

The starter glossary already covers: auxiliary, past participle, participle agreement, passato prossimo, transitive verb, intransitive verb, reflexive verb, direct object pronoun (DOP), indirect object pronoun (IOP), elision, agreement, partitive (ne), Class I adjective, Class II adjective. Check the file before adding suggestions.

Let me know if anything's unclear.
