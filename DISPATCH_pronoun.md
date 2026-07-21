# Dispatch: Object pronouns

The packet to send to a fresh authoring chat for the `pronoun` topic.

## How to send

Open a fresh chat (Claude, GPT, etc.). Paste, in order, in a single message:

1. The full contents of [`AUTHOR_BRIEF.md`](./AUTHOR_BRIEF.md)
2. The "Topic notes" section below
3. The full contents of [`data/buckets/pronoun.json`](./data/buckets/pronoun.json)

Then ask the chat to produce the three output files per §4 of the brief.

---

## Topic notes

**Topic**: `pronoun`
**Topic short** (for external_ids): `op`
**Files to produce**:
- `grammar_questions_pronoun.json`
- `translation_items_pronoun.json`
- `bucket_suggestions_pronoun.json` (if any)
- `coverage_pronoun.md`

**CEFR weighting**: cover the whole tree. The pronoun system is a B1-B2 backbone: the DOP/IOP basics land at A2, the combined clusters (glielo, me ne) at B1, the position-rule subtleties (consonant doubling, formal imperatives) at B1-B2, the truly idiomatic verbs (farcela, tenerci, andarsene) at B2-C1. Aim for solid coverage of `core`-at-B1 buckets with extras on the hot spots (see below).

**Coverage target**: produce until the topic feels covered. As a rough floor, 3-5 grammar questions per active leaf, plus extras on hot spots. Earlier dispatches landed at 82 grammar + 30 translation for passato_prossimo (~30 leaves), 134 grammar + ~ 30 translation for adjective_agreement (~40 leaves). The pronoun tree has ~55 leaves; expect roughly 150-200 grammar questions and 35-50 translation items.

### Hot spots that deserve extra coverage

Diagnostically rich buckets where learners stumble most:

1. **`pronoun.combined.glielo_family`**: the gli/le + lo/la/li/le → glielo/gliela/glieli/gliele transform. High-frequency at B1, learners variously write `gli lo`, `le lo`, `glie lo`. The fact that feminine `le` becomes `glie-` in this combination is a common surprise.
2. **`pronoun.combined.vowel_changes`**: mi/ti/ci/vi → me/te/ce/ve before another clitic. Learners who've internalised `mi lo` are wrong; the form is `me lo`. Cover with several questions.
3. **`pronoun.position.post_imperative_consonant_doubling`**: dammi, dimmi, fammelo, vacci. The doubling rule on da', di', fa', va', sta' (with the exception that `gli` doesn't double: digli, not diggli). Learners can be at B1+ and still write `dami` or `dimi` or even `dimmelo` with the wrong cluster.
4. **`pronoun.indirect_object.verbs_taking_iop`**: piacere, mancare, sembrare, bastare. The 'inverted' subject is a structural surprise for English speakers and worth heavy coverage with both grammar fill-ins and translations.
5. **`pronoun.position.modal_plus_infinitive_either`**: the freedom to choose `lo voglio vedere` or `voglio vederlo` is a positive skill to recognise; questions can test both and accept either.
6. **`pronoun.ci_vs_ne_disambiguation`**: when to use ci vs ne. A learner at B1 should consistently get this right; B2 should never miss.
7. **`pronoun.ne.with_pp_agreement`**: ne with participle agreement (ne ho mangiate tre). Cross-references the existing PP bucket; worth at least two grammar questions plus a translation item that exercises both buckets.

### Cross-references into existing trees

Some pronoun-tree buckets have `prerequisites` that point at buckets in other trees:

- `pronoun.reflexive.essere_in_compound` → `verb_form.passato_prossimo.auxiliary.essere_reflexive`
- `pronoun.ne.with_pp_agreement` → `verb_form.passato_prossimo.participle_agreement.with_avere.preceding_partitive_ne`
- `pronoun.indirect_object.verbs_taking_iop` → no prereq currently, but translation items will reference `verb_form.passato_prossimo.auxiliary.essere_other_intransitive` for piacere etc.

Translation items will naturally reference `verb_form.passato_prossimo.*` buckets when the example uses past tense. The runtime warns at authoring time on forward-refs but accepts them; cite freely. The `pronoun.special.pronoun_then_subject_noun` bucket explicitly cross-references the with_avere agreement buckets.

### Suggested vocab_help patterns

The brief was updated in Revision 2 to use a **rich per-lemma shape**: each entry is keyed by lemma and lists multiple aspects (translation, gender, auxiliary, etc.) each with its own bucket. The UI builds a button per lemma plus makes the matching word in the prompt clickable. Each aspect reveal records a miss against its own bucket.

For pronoun questions specifically:

- Pronouns themselves aren't usually vocab-help targets (the question is about choosing or positioning the pronoun, not about translation).
- The **content words in the prompt** are: the verbs (in their citation form), the nouns (especially gender-marked ones), the adverbs (for ne/ci context). These deserve `vocab_help` entries.
- For verbs whose pronoun behaviour depends on argument structure (piacere-family verbs), include an aspect like `"requires_iop": { "reveal": "...", "bucket": "vocabulary.it.<verb>.requires_iop" }` to flag the syntactic feature.

Worked example for a pronoun grammar question:

```json
{
  "external_id": "op_dop_lo_01",
  "prompt": "Replace 'il libro' with a pronoun: 'Marco legge il libro.' → 'Marco ____ legge.'",
  "vocab_help": [
    {
      "lemma": "libro",
      "language": "it",
      "aspects": {
        "translation": { "reveal": "libro - book", "bucket": "vocabulary.it.libro.translation" },
        "gender": { "reveal": "masculine (m)", "bucket": "vocabulary.it.libro.gender" }
      }
    },
    {
      "lemma": "legge",
      "language": "it",
      "aspects": {
        "infinitive": { "reveal": "leggere - to read", "bucket": "vocabulary.it.leggere.translation" }
      }
    }
  ],
  ...
}
```

The bucket id pattern is `vocabulary.<lang>.<lemma>.<aspect>`. Forward-reference is fine; these buckets will be promoted in the cross-cutting taxonomy session.

For translation items, include an entry for **every content word** in the source text that the learner might reasonably need help with (verbs in their citation form, nouns, adjectives, adverbs). Use the source language as the lemma's language so the UI phrases the help correctly.

### Resources to consult if you want

- Italian Club's lessons on pronomi diretti, pronomi indiretti, pronomi combinati, ci e ne, pronomi riflessivi. Their treatment is clean and matches the bucket structure here.
- WordReference forums for register and disambiguation edge cases.
- Patota & Della Valle, "Viva il congiuntivo!" and similar usage guides for the imperative + clitic position rules.

### Things to be careful about

- **Surface ambiguity**: `mi` is DOP, IOP, AND reflexive 1sg, surface-identical. The grammar engine can't distinguish without context. For grammar questions targeting one specifically, make the prompt unambiguous via the verb's argument structure or the explicit role (e.g. "tell me" → IOP; "see me" → DOP; "lava + mi" → reflexive). Use the bucket id to attribute correctly.
- **Position vs form**: pronoun position (pre/post/attached) and pronoun form (lo vs li vs glielo) are two different dimensions. Most questions should test ONE of them at a time, not both, unless the question is deliberately about the interaction.
- **Imperative shape**: the tu vs Lei imperative diverges in pronoun position (attached vs pre-verb). When writing imperative questions, make the addressee unambiguous (use a Lei-formal context vs a tu-informal one).
- **Don't give the topic away**: questions should be unambiguous about the form wanted (which pronoun, where) without saying "use a combined pronoun" or "in the IOP form". Context, framing, and the verb's argument structure should make the answer clear.

### Operational

The brief's §4 asks for `coverage_<topic>.md` alongside the JSON. For pronouns, include a section in coverage that breaks counts down by:

- pronoun.direct_object.*
- pronoun.indirect_object.*
- pronoun.reflexive.*
- pronoun.combined.*
- pronoun.ne.*
- pronoun.ci_locative.*
- pronoun.position.*
- pronoun.special.*

plus a list of items you flagged as uncertain (e.g. authentic-but-edge-case usages) for the reviewer.

If you find yourself wanting to write items that exercise interactions between two trees (pronoun + passato_prossimo, for example, on the participle agreement front), do that in the translation items, not in grammar items.
