# Dispatch: Tense choice (cross-cutting, diagnostic-only)

The packet to send to a fresh authoring chat for the `tense_choice` topic. Important: this dispatch produces a different shape of item from the other dispatches. Read carefully.

## How to send

Open a fresh chat. Paste, in order, in a single message:

1. The full contents of [`AUTHOR_BRIEF.md`](./AUTHOR_BRIEF.md) (Revision 3)
2. The "Topic notes" section below
3. The full contents of [`data/buckets/tense_choice.json`](./data/buckets/tense_choice.json)
4. The full contents of [`data/buckets/verb_form.imperfect.json`](./data/buckets/verb_form.imperfect.json) (the chat will cite these for imperfetto/PP items rather than the new tree)

Then ask the chat to produce the four output files per §4 of the brief.

---

## Topic notes

**Topic**: `tense_choice`
**Topic short** (for external_ids): `tc`
**Files to produce**:
- `grammar_questions_tense_choice.json`
- `translation_items_tense_choice.json` (optional; pick-the-form items can be authored as grammar items)
- `bucket_suggestions_tense_choice.json` (if any new contrast areas surface)
- `coverage_tense_choice.md`
- `glossary_suggestions_tense_choice.json` (if any new grammatical terms appear)

### What makes this dispatch different

Every other dispatch has asked the chat to produce items where the learner forms the answer. This one asks for items where the learner picks between fully-formed options. The point is diagnostic purity: separate the form-knowing skill from the tense-choosing skill so the data signal on tense choice doesn't get muddied by formation misses.

Concretely, an item looks like this:

> Complete: 'All'inizio io _____ alla tua storia, ma poi ho capito.' Choose: credevo / ho creduto.

The prompt presents two fully-formed verb forms. The learner types one. The marker scores against the right choice and fires a single tense-choice miss if they pick the wrong one. The auxiliary-formation and participle-form buckets are NOT cited and do NOT fire.

### Critical rule for this dispatch

**Do not cite formation buckets.** Items in this batch attribute only to tense-choice buckets:

- For imperfetto vs passato prossimo contrasts, cite `verb_form.imperfect.discrimination.*` buckets (these already exist in the imperfect tree).
- For all other tense-choice contrasts, cite the new `tense_choice.*` buckets in the tree provided.

If the item's diagnostic in your mind ever drifts toward formation ("the learner should also know how to conjugate this"), the item belongs in another dispatch. Set it aside.

### The six contrast areas

In rough priority order:

1. **Imperfetto vs passato prossimo.** Already has a deep bucket structure on the imperfect tree (`verb_form.imperfect.discrimination`), with the general aspect rule and five modal-contrast leaves (sapere, dovere, potere, volere, conoscere). Aim for richest coverage here because the diagnostic is most distinctive. Use BOTH the general aspect-rule contrast (sempre / di solito / ieri / l'altro giorno style cues) AND the modal-meaning shifts.

2. **Progressive vs simple.** New buckets in the tense_choice tree at `tense_choice.progressive_vs_simple.*`. Two leaves: present-progressive-vs-present (sto parlando vs parlo) and past-progressive-vs-imperfetto (stavo parlando vs parlavo). Italian uses the progressive far less than English; over-use is the main miss.

3. **Future vs present-for-future.** New buckets at `tense_choice.future_vs_present.*`. Two leaves: future-for-unambiguous-future (parlerò) and present-for-near-future (parto domani). The diagnostic is whether the future reference is anchored by a time adverb (then present-for-future is natural) or genuinely uncertain/distant (then future).

4. **Conditional vs imperfetto in counterfactuals.** New buckets at `tense_choice.conditional_vs_imperfect_counterfactual.*`. Two leaves: prescriptive (subjunctive + conditional, 'se avessi tempo, verrei') and colloquial (imperfetto + imperfetto, 'se avevo tempo, venivo'). Items should test recognition of both registers.

5. **Indicative vs subjunctive.** New buckets at `tense_choice.indicative_vs_subjunctive.*`. Four leaves: opinion triggers, emotion triggers, hypothetical conjunctions, and negation-induced triggers. Opinion triggers are most colloquially-variable (penso che sia vs penso che è); hypothetical conjunctions are most rigid (sebbene piova, almost never with indicative).

6. **Trapassato vs imperfetto.** New buckets at `tense_choice.trapassato_vs_imperfect.*`. Two leaves: trapassato for completed-prior-to-prior (aveva già mangiato) and imperfetto for ongoing-background (mangiavo quando sei entrato). The adverb cues (già, appena, da poco vs mentre, quando) are reliable diagnostics.

### Item shape and schema

Use the existing grammar-question schema with one convention: the prompt presents the choice explicitly, both forms shown.

**Format 1: inline choice in the prompt.** "Complete: 'X _____ Y.' Choose: form1 / form2."

**Format 2: completion with cue at end.** "Complete: 'X _____ Y.' (form1 or form2)"

Either is fine. Pick whichever reads more naturally for the sentence.

The schema fields then work as follows:

```json
{
  "external_id": "tc_imp_pp_general_01",
  "prompt": "Complete: 'All'inizio io _____ alla tua storia, ma poi ho capito.' Choose: credevo / ho creduto.",
  "answer": {
    "any_phrases": ["credevo"],
    "must_not_include": ["ho creduto"]
  },
  "primary_bucket": "verb_form.imperfect.discrimination.vs_passato_prossimo_general",
  "explanation": "...",
  "cefr_level_target": "B1"
}
```

The wrong form goes in `must_not_include` and attributes to the same bucket (an attempted-but-wrong miss). The right form is the single any_phrase. No formation buckets. No vocab_help on the verbs themselves (they're handed to the learner already; the visibility rule in the housing's marker would skip active-production credit anyway, but be explicit and don't list them).

### Coverage criterion

Rule-internalisation, not item count. For each contrast area, the chat should produce enough items that a learner internalises the diagnostic rule. The modal-contrast cluster under imperfetto vs PP is uniquely deep (five modals, each with its own meaning shift) and deserves several items each. The progressive-vs-simple contrast is two leaves but both are high-frequency. Counterfactuals are pedagogically rich. Subjunctive triggers vary in register strength and worth covering with items showing both prescriptive and colloquial answers where they diverge.

Don't anchor on counts from earlier dispatches. The tense_choice tree is smaller than pronoun or PP but goes wide across many contrasts. Stop when the rules feel covered.

### Cross-tree references

For imperfetto/PP items: cite the existing `verb_form.imperfect.discrimination.vs_passato_prossimo_general` for general aspect items, and the five modal-contrast leaves (`verb_form.imperfect.discrimination.modals.sapere`, `.dovere`, `.potere`, `.volere`, `.conoscere`) for modal items. Do not create new imp/PP buckets.

For all other items: cite the new `tense_choice.*` buckets directly.

### Explanation house style and glossary

Same four-beat structure as other topics: everyday lead, named term without inline expansion, term used thereafter, concrete working. The glossary at `data/glossary.json` v2 wraps known terms automatically; check it before inlining definitions. New terms likely to come up: `protasis`, `apodosis`, `counterfactual`, `progressive aspect`, `prospective reading`, `trigger verb`. Propose them in `glossary_suggestions_tense_choice.json` if they don't already exist.

### Communication style (Revision 3 §7)

When you write back coverage reports, replies, or feedback, use the bucket's `label`, not its dot-separated `id`, in any human-facing prose. So: "the progressive contrast bucket" or "the present-progressive-vs-present leaf", not "tense_choice.progressive_vs_simple.present_progressive_vs_present".

### Vocab help

This topic minimises vocab_help because the items hand the learner both verbs in the prompt. Per the housing's active-production rule, lemmas appearing in the prompt are skipped anyway. So vocab_help can be omitted on most items. If a non-verb word in the prompt is plausibly unknown (a specific noun, an adverb cue like 'appena' or 'sebbene'), include a vocab_help entry on that word using the rich per-lemma shape from Revision 2.

### Things to be careful about

- **Don't give the choice away.** "Use the imperfect or the perfect" in the prompt itself is wrong; the cue should come from context (the time adverb, the aspectual frame, the modal's meaning shift). "Choose: credevo / ho creduto" presents the options but the learner still has to decide which fits. That's the diagnostic. Don't add "(use the imperfect)" hints.

- **Both forms shown must be grammatically correct.** If you offer "credevo / ha creduto", that's three failures stacked into one item (wrong person + wrong tense + ambiguous diagnostic). Both options should be correctly conjugated for the implied subject, in the right person, with the right auxiliary if compound. Only the tense (or mood, for subjunctive items) differs.

- **For modal-contrast items, the English gloss should not give the answer away.** "I knew" maps to both 'sapevo' (state) and 'ho saputo' (event-of-learning, which English glosses as 'found out' not 'knew'). The item's English source for translation items, or the contextual cue for grammar items, should make the intended reading clear without saying so explicitly.

- **Colloquial-vs-prescriptive cases need both as acceptable answers.** For "se avevo tempo, venivo" style items, both the prescriptive ('se avessi avuto tempo, sarei venuto') and the colloquial ('se avevo tempo, venivo') are correct. Items can target one register specifically (the prompt frames it as informal speech, accept the colloquial) or accept both as alternatives with the appropriate bucket attribution.

### Operational

Per §4 of the brief, output four files. For `coverage_tense_choice.md`, break counts down by contrast area:

- imp_vs_pp (citing existing imperfect.discrimination buckets)
- progressive_vs_simple
- future_vs_present
- conditional_vs_imperfect_counterfactual
- indicative_vs_subjunctive
- trapassato_vs_imperfect

Plus a section listing items you flagged as uncertain (cases where the diagnostic was ambiguous, items where both forms feel genuinely acceptable, items where the register call is debatable). The project author reviews uncertain items.

If you find a contrast area worth a dedicated bucket that isn't in the tree (e.g. passato remoto vs passato prossimo in literary register, future-perfect vs trapassato), propose it in `bucket_suggestions_tense_choice.json` rather than silently extending the taxonomy.
