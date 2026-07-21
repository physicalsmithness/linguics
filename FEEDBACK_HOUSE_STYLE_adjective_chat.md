# Style update for adjective_agreement explanations

Paste this into the existing adjective_agreement chat thread.

---

Quick follow-up. The Linguics platform now has a **glossary** built into the explanation renderer. Each grammatical term in an explanation gets wrapped in an interactive span: hovering over it shows a short definition; clicking will eventually show a longer one. The list of terms is in `data/glossary.json` and is maintained centrally; you (the author chat) propose additions but don't edit it directly.

What this means for your explanations: **use jargon naturally and assume the reader is grammatically literate**. Don't inline-define terms like "Class I", "Class II", "agreement", "stem change", "elision", "definite article" etc. The platform makes them clickable. The reader who knows skims past; the reader who doesn't hovers.

## House style for explanations

Each explanation should:

1. **Lead with what Italian is doing in everyday terms.** Not a textbook sentence; a conversational one.
2. **Name the relevant grammatical term explicitly when first introduced.** No expansion; the platform handles the lookup.
3. **Use the term thereafter** without re-defining.
4. **Finish with the concrete working** that produces the answer.

Be compact. ~30-60 words is the right length for most explanations. Longer is OK for genuinely complex items, but resist the temptation to define terms in prose.

### Worked example

For a Class II feminine plural question (e.g. "Le case sono grandi"):

> Grande is a Class II adjective: the singular ends in -e for both genders, and the plural is -i for both. So "le case sono grandi". Don't be tempted to use Class I patterns (-e for fem.pl); -i is correct here for Class II.

That's it. "Class II", "Class I", "fem.pl" are all glossary terms; the platform will make them clickable. No need to inline-explain "Class I has four forms" etc.

## What I'd like you to do

1. **Revise the explanations** across your `grammar_questions_adjective_agreement.json` and `translation_items_adjective_agreement.json` to match this house style. The current explanations are clear but verbose; trim. Many can lose 50-70% of their length.

2. **Propose glossary additions** for terms you used that aren't yet in `data/glossary.json`. Output them in a `glossary_suggestions_adjective_agreement.json`:

```json
[
  {
    "term": "stem change",
    "short": "A predictable change in a word's stem when forming the plural...",
    "long": "Italian Class I adjectives ending in -co, -ca, -go, -ga, -cio, -gio, -cia, -gia change their stem when forming the plural to preserve the hard/soft consonant sound...",
    "aliases": ["stem-change", "stem changes"]
  }
]
```

Don't add aliases unless they're meaningfully distinct from inflections of the canonical term (the glossary renderer handles plurals via word-boundary matching, not literal alias matching, so "stems" doesn't need to alias "stem").

3. **Don't touch any field other than `explanation`** in the existing items. Return the revised arrays plus the suggestions file.

The starter glossary already covers: Class I adjective, Class II adjective, agreement, definite article, indefinite article, m.sg, f.sg, m.pl, f.pl. Look at the file before adding suggestions.

Let me know if anything's unclear.
