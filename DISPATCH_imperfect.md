# Dispatch: Imperfect (imperfetto)

The packet to send to a fresh authoring chat for the `verb_form.imperfect` topic.

## How to send

Open a fresh chat (Claude, GPT, etc.). Paste, in order, in a single message:

1. The full contents of [`AUTHOR_BRIEF.md`](./AUTHOR_BRIEF.md) (Revision 2)
2. The "Topic notes" section below
3. The full contents of [`data/buckets/verb_form.imperfect.json`](./data/buckets/verb_form.imperfect.json)

Then ask the chat to produce the four output files per §4 of the brief.

---

## Topic notes

**Topic**: `verb_form.imperfect`
**Topic short** (for external_ids): `imp`
**Files to produce**:
- `grammar_questions_verb_form.imperfect.json`
- `translation_items_verb_form.imperfect.json`
- `bucket_suggestions_verb_form.imperfect.json` (if any)
- `coverage_verb_form.imperfect.md`
- `glossary_suggestions_verb_form.imperfect.json` (if any new grammatical terms appear in your explanations that aren't in `data/glossary.json` v2; check before adding)

**CEFR weighting**: imperfect is introduced at A2, consolidated through B1, with the modal-nuance area landing at B1-B2. Cover the whole tree; the bucket tree's `cefr_importance` map already encodes the priority. The truly stylistic uses (narrative imperfect, colloquial counterfactual) are C1+ and need only light coverage. Most authoring effort belongs in formation (A2-B1), usage (A2-B1), and the discrimination area (B1-B2).

**Coverage criterion**: the criterion is rule-internalisation, not item count. For every rule in the topic, hit it from enough distinct angles that a learner could internalise the rule rather than memorise the question. "Enough" means different verbs across the conjugations, different aspect cues, different adverb pairings, different ambiguity directions, and (for discrimination items) both directions of the choice. The discrimination area is the diagnostically richest and deserves the most varied coverage.

Don't anchor on counts from earlier dispatches. Earlier dispatches landed at 82-211 grammar items across topics with very different shapes. Imperfect is structurally smaller than pronouns or PP, but the modal-nuance branch is uniquely deep and benefits from many angles. Stop authoring when the rules feel covered, not when a target number is hit.

### Hot spots that deserve heavy coverage

Diagnostically rich buckets where learners stumble most:

1. **`verb_form.imperfect.discrimination.modals.*`** (five leaves). The most distinctive thing about Italian's imperfect/PP system. Each modal verb's imperfect-vs-PP contrast changes the verb's English equivalent, not just its aspect. Sapevo / ho saputo, dovevo / ho dovuto, potevo / ho potuto, volevo / ho voluto, conoscevo / ho conosciuto. Cover each modal from both directions and with both translation directions. Several translation items per modal.

2. **`verb_form.imperfect.discrimination.vs_passato_prossimo_general`**. The big general-aspect discrimination. Pair with the strongest adverb cues (sempre, di solito, ogni X, mentre, da X for imperfect; ieri, l'altro giorno, una volta, all'improvviso, X fa for PP). Mix verbs across the three conjugations. Include items where the adverb is implicit ("when I was a child" not "every Monday") so learners can't pattern-match on lexical cues alone.

3. **`verb_form.imperfect.usage.background_with_pp`**. Single sentences with both tenses ("mentre studiavo, ha suonato il telefono"). These items necessarily reference PP buckets. Worth several grammar items plus translation items testing both tenses simultaneously.

4. **`verb_form.imperfect.formation.irregular.essere`**. Highest-frequency irregular. Cover all six forms (ero, eri, era, eravamo, eravate, erano), with both predicative ("ero stanco") and existential ("c'era un libro sul tavolo") uses.

5. **`verb_form.imperfect.formation.irregular.stem_expansion.*`** (five leaves). Especially fare/dire/bere, which are A2-B1 frequency. Porre and tradurre lower-frequency but the same pattern.

6. **`verb_form.imperfect.usage.age_time_weather`**. Fixed-pattern uses that English speakers routinely get wrong by defaulting to PP. "I was ten years old" (avevo dieci anni, not ho avuto), "it was three o'clock" (erano le tre, not sono state), "it was raining" (pioveva, not ha piovuto). Several quick fill-ins plus translation items.

7. **`verb_form.imperfect.usage.polite`** (volevo un caffè). Specifically a polite-present reading via the imperfect. Translation items should test both directions: render an English polite request as Italian, and recognise the polite reading of an Italian imperfect.

### Cross-references into other trees

This topic has heavier cross-references than the previous dispatches because every imperfect/PP discrimination item lives in the intersection of both trees.

- `verb_form.imperfect` (root) has prerequisites `verb_form.present_indicative` and `verb_form.passato_prossimo`.
- `verb_form.imperfect.formation.irregular.stem_expansion` has a `cross_reference` attribute pointing at the PP tree, because the same stem expansion drives the irregular participles (fac- giving fatto, dic- giving detto, bev- giving bevuto, pon- giving posto, traduc- giving tradotto). Grammar items in this branch can legitimately invoke PP participle buckets as secondary references.
- `verb_form.imperfect.discrimination` has prerequisites `verb_form.imperfect.usage` and `verb_form.passato_prossimo`. Translation items in the discrimination branch will fire markpoints in BOTH trees on the same attempt: imperfect for the imperfect verbs, PP for the PP verbs in the same sentence. This is intended; the marker is happy to attribute events across trees.
- Indirect-speech items may invoke a future `verb_form.condizionale` tree (reported future intentions); cite the bucket id `verb_form.condizionale.*` even though the tree doesn't exist yet. Warn-at-authoring, strict-at-production policy applies.

Translation items in the modal-discrimination area can be among your richest. A single sentence ("I had to study but I went out anyway") activates imperfect.discrimination.modals.dovere + usage cues + the contrast with an implicit PP event.

### Suggested vocab_help patterns

Use the rich per-lemma shape from Revision 2 of the brief. For imperfect questions:

- Verbs in the prompt deserve `infinitive` aspects (citation form reveal). Especially the stem-expansion verbs, where the modern infinitive (bere, dire, fare, porre, tradurre) gives no hint of the imperfect stem; if a learner asks for the infinitive of bevevo, the help should reveal "bevevo from bere - to drink".
- Time-of-day, age, and weather items deserve translation aspects on the relevant nouns (anno, ora, freddo, etc.) and on adverbs (sempre, di solito, mentre).
- For modal-discrimination items, the four modals (sapere, dovere, potere, volere) plus conoscere should appear as vocab_help entries on the few prompts where the learner needs the citation form. Don't include the modal's imperfect form as an aspect; that's what the question is testing.
- The two strict rules from Revision 2: don't include an aspect the answer directly tests, and reveal the lemma (citation) form, not an inflected surface form. Translation reveals are bare citation pairs: `bere - to drink`, not `bere (irregular) - to drink`.

Worked example for a modal-discrimination grammar question:

```json
{
  "external_id": "imp_disc_modals_sapere_01",
  "prompt": "Complete with the right past tense: 'Ieri _____ che eri malato.' (sapere)",
  "vocab_help": [
    {
      "lemma": "sapere",
      "language": "it",
      "aspects": {
        "translation": { "reveal": "sapere - to know", "bucket": "vocabulary.it.sapere.translation" }
      }
    },
    {
      "lemma": "malato",
      "language": "it",
      "aspects": {
        "translation": { "reveal": "malato - ill / sick", "bucket": "vocabulary.it.malato.translation" }
      }
    }
  ],
  "answer": {
    "any_phrases": ["ho saputo"],
    "must_not_include": ["sapevo"]
  },
  "primary_bucket": "verb_form.imperfect.discrimination.modals.sapere",
  "explanation": "When sapere takes the passato prossimo it shifts meaning to 'found out' rather than 'knew'. The cue 'ieri' (yesterday) marks a single event, so the answer is the event-of-learning reading: 'ho saputo'. The imperfect 'sapevo' would describe an ongoing state of knowing, which doesn't fit a one-off discovery."
}
```

(The "any_phrases" / "must_not_include" / "primary_bucket" fields above are sketches; the actual schema is in the brief's §3. The explanation follows the four-beat house style: leads with the everyday meaning, names the technical contrast, uses it thereafter, finishes with the working.)

### Explanation house style and glossary awareness

Revision 2 of the brief and the project's house-style note both ask for four-beat explanations: everyday lead, named grammatical term, term used thereafter, concrete working. The glossary at `data/glossary.json` (v2) auto-wraps known terms with hover-definitions, so don't inline-expand. The terms relevant to imperfect that ARE in the glossary: `imperfect indicative`, `passato prossimo`, `auxiliary`, `past participle`, `tense mapping`, `modal verb`, `modal auxiliary inheritance`, `stem expansion`, `transitive verb`, `intransitive verb`, `agreement`, `infinitive`, all the abbreviations (1sg through 3pl, m.sg through f.pl), plus all the cross-cutting terms (clitic, fronting, register, etc.).

If your explanations introduce a grammatical term not in the glossary, propose it in `glossary_suggestions_verb_form.imperfect.json`. Candidates likely to come up: `aspect`, `aspectual contrast`, `progressive aspect`, `prospective reading`, `protasis`, `apodosis`, `polite-present`. Check `data/glossary.json` v2 before adding; many terms already exist.

### Things to be careful about

- **Don't give the topic away in prompts.** "Use the imperfect" or "form the imperfect tense" in the prompt itself defeats the diagnostic. The cue should come from context: a time adverb, a habit framing, a clear background-foreground pairing. The learner should be discriminating between tenses because that's the skill; if you tell them which to use, you're testing form-recall, not the skill.

- **Modal discrimination items need both directions.** A sentence that tests sapevo as imperfect (state of knowing) is half the diagnostic. The companion is a sentence that tests ho saputo as PP (event of finding out). Pair them across the batch, ideally with similar contexts so the learner sees that the verb form is what's doing the meaning-work.

- **Stem-expansion verbs are about the stem, not the irregularity per se.** A grammar item testing fare's imperfect should expect facevo, not just "any irregular form". Make the prompt unambiguous about the person; don't write "fare in the imperfect" and accept all six forms.

- **The -ire / -isc- confusion is a sleeper.** capire is regular in the imperfect (capivo, not capiscevo). Worth a few items specifically targeting this miss.

- **Background-foreground translation items are tricky.** When testing "while I was studying, the phone rang", the marker fires both verb_form.imperfect.usage.background_with_pp AND verb_form.passato_prossimo.auxiliary.* buckets. Reference both clearly in the item's markpoint list. The learner who gets one and not the other (e.g. translates with two PP forms, or with two imperfects) should see distinct miss attributions.

- **Indirect speech needs care with verbs of saying.** "He said he was coming" → "Ha detto che veniva" uses PP for the reporting verb AND imperfect for the embedded clause. Items testing this should be unambiguous about both; don't reduce ambiguity by adopting the structure of the English original.

### Operational

Per §4 of the brief, output four files (JSON + the coverage markdown + the glossary suggestions if applicable).

For `coverage_verb_form.imperfect.md`, break counts down by:

- formation.regular_* (three leaves)
- formation.irregular.essere
- formation.irregular.stem_expansion.* (five leaves)
- usage.* (six leaves)
- discrimination.vs_passato_prossimo_general
- discrimination.modals.* (five leaves)
- indirect_speech.* (two leaves)
- stylistic.* (two leaves)

plus a section listing items you flagged as uncertain (regional variants, register-edge cases, items that could plausibly accept multiple forms with different acceptability). The project author reviews uncertain items and rules on each.

Cross-tree references are fine; cite buckets in `verb_form.passato_prossimo.*` and elsewhere freely. The runtime warns at authoring time on missing references but doesn't block.

If during authoring you find a bucket that would clarify a recurring pattern but isn't in the tree, propose it in `bucket_suggestions_verb_form.imperfect.json` rather than silently extending the taxonomy. The project author ratifies or declines proposals.
