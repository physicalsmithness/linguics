# Dispatch: Tense choice (cross-cutting, diagnostic-only)

The packet to send to a fresh authoring chat for the `tense_choice` topic. Important: this dispatch produces a different shape of item from the other dispatches. Read carefully.

## Status (2026-06-09)

**Wave 1 is done.** The imperfetto-vs-passato-prossimo area is authored and live (it cites `verb_form.imperfect.discrimination.*`). The live `grammar_questions_tense_choice.json` already holds those items; do not redo them.

**This is wave 2.** It covers the remaining seven contrast areas, all homed in the `tense_choice` tree. It also introduces the `candidate_tenses` convention (AUTHOR_BRIEF criterion 16), which all items in this batch must carry.

## How to send

Open a fresh chat. Paste, in order, in a single message:

1. The full contents of [`AUTHOR_BRIEF.md`](./AUTHOR_BRIEF.md) (Revision 11; pay attention to criteria 15 and 16)
2. The "Topic notes" section below
3. The full contents of [`data/buckets/tense_choice.json`](./data/buckets/tense_choice.json) (the canonical home for every contrast in this batch)
4. The full contents of [`data/buckets/verb_form.imperfect.json`](./data/buckets/verb_form.imperfect.json) (only so the chat can see the imp/PP buckets it must NOT re-author)

Then ask the chat to produce the four output files per §4 of the brief.

---

## Topic notes

**Topic**: `tense_choice`
**Topic short** (for external_ids): `tc`
**Files to produce**:
- `grammar_questions_tense_choice.json` (append wave-2 items; do not touch the existing imp/PP items)
- `translation_items_tense_choice.json` (optional; pick-the-form items can be authored as grammar items)
- `bucket_suggestions_tense_choice.json` (if any new contrast areas surface)
- `coverage_tense_choice.md`
- `glossary_suggestions_tense_choice.json` (if any new grammatical terms appear)

### What makes this dispatch different

Every other dispatch asks the chat to produce items where the learner forms the answer. This one asks for items where the learner picks between fully-formed options. The point is diagnostic purity: separate the form-knowing skill from the tense-choosing skill so the data signal on tense choice does not get muddied by formation misses.

Concretely, an item looks like this:

> Complete: 'All'inizio io _____ alla tua storia, ma poi ho capito.' Choose: credevo / ho creduto.

The prompt presents two fully-formed verb forms. The learner types one. The marker scores against the right choice and fires a single tense-choice miss if they pick the wrong one. The auxiliary-formation and participle-form buckets are NOT cited and do NOT fire.

### Critical rule for this dispatch: where items attribute

The `tense_choice` tree is the single canonical home for every cross-tense contrast. Attribute to it, not to the per-tree discrimination branches.

- For the seven wave-2 areas below, cite the matching `tense_choice.*` bucket.
- The imperfetto-vs-passato-prossimo area is the one exception: it lives in `verb_form.imperfect.discrimination.*` (built deep with five modal contrasts), and it is already authored, so you do not touch it.
- **Do NOT cite any `verb_form.<tense>.discrimination.*` bucket.** Those stubs are now deprecated cross-reference pointers (each carries `attributes.deprecated_authoring_target: true` and a `cross_reference` to the canonical `tense_choice.*` bucket). They exist only so prerequisites and citations resolve. Authoring against them would split the data.

If an item's diagnostic in your mind ever drifts toward formation ("the learner should also know how to conjugate this"), the item belongs in another dispatch. Set it aside.

### The candidate_tenses convention (criterion 16, required on every item)

Each item carries two new fields alongside the markpoints:

- `candidate_tenses`: an array of two or more controlled tense-tags, the legitimate options in play for that context.
- `correct_tense`: the single member of `candidate_tenses` the context demands.

The correct surface form still lives in `any_phrases`; these two fields are tense-level labels that drive the post-answer tick and the per-context stats, and do not affect marking. Controlled tense-tags: present, passato_prossimo, imperfect, trapassato_prossimo, passato_remoto, future, futuro_anteriore, condizionale, condizionale_passato, congiuntivo_presente, congiuntivo_imperfetto, congiuntivo_passato, congiuntivo_trapassato, imperativo, gerundio, infinito.

Because the candidate set is shown to the learner only after they answer (showing it earlier would tip that a choice is in play), every item in this batch also carries `info_display: "suppress"` per criterion 15.

### The seven wave-2 contrast areas

In rough priority order. All cite `tense_choice.*` buckets.

1. **Progressive vs simple.** `tense_choice.progressive_vs_simple.*`. Two leaves: present-progressive-vs-present (sto parlando vs parlo) and past-progressive-vs-imperfetto (stavo parlando vs parlavo). Italian uses the progressive far less than English; over-use is the main miss. `candidate_tenses`: [present, gerundio] or [imperfect, gerundio] as appropriate.

2. **Future vs present-for-future.** `tense_choice.future_vs_present.*`. Two leaves: future-for-unambiguous-future (parlerò) and present-for-near-future (parto domani). The diagnostic is whether the future reference is anchored by a time adverb (then present-for-future is natural) or genuinely uncertain/distant (then future). `candidate_tenses`: [present, future].

3. **Present vs passato prossimo.** `tense_choice.present_vs_passato_prossimo.*`. Two leaves: the durative `da` present (Studio da due anni, where English 'have studied' tempts the perfect) and the completed event (ho mangiato). The `da` construction is the high-value trap. `candidate_tenses`: [present, passato_prossimo].

4. **Conditional vs imperfetto in counterfactuals.** `tense_choice.conditional_vs_imperfect_counterfactual.*`. Two leaves: prescriptive (subjunctive + conditional, se avessi tempo, verrei) and colloquial (imperfetto + imperfetto, se avevo tempo, venivo). Test recognition of both registers. `candidate_tenses`: [condizionale, imperfect] (and note both are acceptable where the register is informal).

5. **Indicative vs subjunctive.** `tense_choice.indicative_vs_subjunctive.*`. Four leaves: opinion triggers, emotion triggers, hypothetical conjunctions, negation-induced triggers. Opinion triggers are most colloquially variable (penso che sia vs penso che è); hypothetical conjunctions are most rigid (sebbene piova, almost never indicative). `candidate_tenses`: [present, congiuntivo_presente] (or the relevant indicative/subjunctive pair).

6. **Trapassato vs imperfetto.** `tense_choice.trapassato_vs_imperfect.*`. Two leaves: trapassato for completed-prior-to-prior (aveva già mangiato) and imperfetto for ongoing background (mangiavo quando sei entrato). The adverb cues (già, appena, da poco vs mentre, quando) are reliable diagnostics. `candidate_tenses`: [trapassato_prossimo, imperfect].

7. **Passato remoto vs passato prossimo.** `tense_choice.passato_remoto_vs_passato_prossimo.*`. Two leaves: literary/historical narration (passato remoto, Dante nacque nel 1265) and spoken/present-relevant past (passato prossimo). Largely a register and regional choice, not a strict aspectual rule; items should frame the register (literary narration vs conversation). `candidate_tenses`: [passato_remoto, passato_prossimo].

A marginal eighth area, **present vs imperfect** (`tense_choice.present_vs_imperfect.*`, present vs past habitual frame), exists in the tree for completeness. Author it lightly, a couple of items at most; the diagnostic is weak because the time frame is usually obvious.

### Item shape and schema

Use the grammar-question schema with the choice presented explicitly, both forms shown.

**Format 1: inline choice in the prompt.** "Complete: 'X _____ Y.' Choose: form1 / form2."
**Format 2: completion with cue at end.** "Complete: 'X _____ Y.' (form1 or form2)"

Either is fine. Pick whichever reads more naturally.

```json
{
  "external_id": "tc_fut_pres_near_01",
  "topic": "tense_choice",
  "subtopic": "future_vs_present.present_for_near_future",
  "prompt": "Complete: 'Domani _____ a Roma in treno.' Choose: parto / partirò.",
  "type": "short",
  "info_display": "suppress",
  "candidate_tenses": ["present", "future"],
  "correct_tense": "present",
  "markpoints": [
    {
      "order_index": 0,
      "credit": 1.0,
      "bucket": "tense_choice.future_vs_present.present_for_near_future",
      "label": "present-for-near-future (parto)",
      "any_phrases": ["parto"],
      "must_not_include": ["partirò"]
    }
  ],
  "explanation": "...",
  "cefr_level_target": "B1"
}
```

The wrong form goes in `must_not_include` and attributes to the same bucket (an attempted-but-wrong miss). The right form is the single `any_phrase`. No formation buckets. No vocab_help on the verbs themselves (they are handed to the learner already).

### Coverage criterion

Rule-internalisation, not item count. For each contrast area, produce enough items that a learner internalises the diagnostic rule. The subjunctive-trigger cluster (four leaves) and the counterfactual register split are pedagogically rich and deserve several items each. Stop when the rules feel covered. Don't anchor on counts from earlier dispatches.

### Explanation house style and glossary

Same four-beat structure as other topics: everyday lead, named term without inline expansion, term used thereafter, concrete working. The glossary at `data/glossary.json` wraps known terms automatically; check it before inlining definitions. New terms likely to come up: `protasis`, `apodosis`, `counterfactual`, `progressive aspect`, `prospective reading`, `trigger verb`, `durative`. Propose any missing ones in `glossary_suggestions_tense_choice.json`.

### Communication style

When you write coverage reports or replies, use the bucket's `label`, not its dot-separated `id`, in human-facing prose. So "the near-future present leaf", not "tense_choice.future_vs_present.present_for_near_future".

### Things to be careful about

- **Don't give the choice away.** "Use the imperfect or the perfect" in the prompt itself is wrong; the cue comes from context (the time adverb, the aspectual frame, the modal's meaning shift, the trigger verb). "Choose: parto / partirò" presents the options but the learner still has to decide. That is the diagnostic. The breadcrumb is suppressed for the same reason (criterion 15/16).

- **Both forms shown must be grammatically correct.** Both options must be correctly conjugated for the implied subject, in the right person, with the right auxiliary if compound. Only the tense (or mood) differs.

- **For modal and subjunctive items, the English gloss should not give the answer away.** Make the intended reading clear from context without stating the rule.

- **Colloquial-vs-prescriptive cases need both as acceptable answers** where they genuinely both work. For "se avevo tempo, venivo" style items, both the prescriptive and the colloquial are correct; target one register via the prompt's framing, or accept both with the appropriate bucket attribution. Set `candidate_tenses` to the pair in play and `correct_tense` to the one the framing demands.

### Operational

Per §4 of the brief, output four files. For `coverage_tense_choice.md`, break counts down by the seven wave-2 areas (plus the marginal present-vs-imperfect), and add a section listing items you flagged as uncertain (ambiguous diagnostic, both forms genuinely acceptable, debatable register). The project author reviews uncertain items.

If you find a contrast worth a dedicated bucket that isn't in the tree, propose it in `bucket_suggestions_tense_choice.json` rather than silently extending the taxonomy.
