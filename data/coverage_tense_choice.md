# Coverage summary: tense choice

Authored as a single dispatch against the diagnostic-only tense_choice topic. Brief revision 3. Dispatch DISPATCH_tense_choice.md.

**Totals**: 92 grammar items, 48 translation items (26 en→it, 22 it→en). 140 items total.

The dispatch is unusual in two ways. First, every item presents two fully-formed verbs and asks the learner to pick; no formation buckets are cited and none fire. Second, the imperfetto-vs-PP cluster cites buckets on the existing imperfect tree (`verb_form.imperfect.discrimination.*`) rather than creating duplicates under the new tense_choice tree; the other five contrast areas cite the new `tense_choice.*` buckets.

## Post-dispatch updates (2026-05-28)

After the initial dispatch closed, Architecture ruled on all six points in `inter_chat/Architecture_TenseChoiceAuthor_dispatch_outputs.md` (now CLOSED). Material outcomes affecting this file:

- **Point 2 (marker policy on multi-register items): asymmetric per-bucket tracking confirmed.** `trans_tc_cf_coll_en_it_01` has been refactored to put BOTH register buckets in `required_buckets` (no more required + optional split). The marker fires whichever register's bucket matches the learner's answer; the other stays untouched. Item credit is full per attempt. Item version bumped to 2.
- **Point 5 (glossary): all 5 proposed terms accepted.** Will land in canonical `data/glossary.json` at the next merge pass.
- **Point 6 (cross-tree citation pattern): acknowledged**, with a downstream housing thread pending on the runtime's per-topic miss-filtering behaviour.
- **Points 1, 3, 4: ruled or confirmed**, no action on the tense_choice dispatch.

Separately, the ImperfectAuthor chat ran in parallel and authored 37 grammar + 21 translation items in the same `verb_form.imperfect.discrimination.*` leaves (id prefix `imp_disc_*` / `trans_imp_disc_*`). Project author ruled **Pattern B**: both dispatches coexist in the shared buckets, no retroactive deletion. Combined coverage on each modal-discrimination leaf now sits at 16-17 items; the general-aspect leaf at 31. Thread `inter_chat/ImperfectAuthor_TenseChoiceAuthor_cross_tree_citations.md` is CLOSED.

## Bucket-to-item-count table

Counts are dedicated items per leaf, plus co-fires inside grammar items where another bucket is the primary marker target (there are no co-fires in this dispatch because each item attributes to exactly one bucket). Translation items count once each per `required_bucket`.

### Imperfetto vs passato prossimo (cited from the imperfect tree)

| Friendly label | Bucket id | Grammar | Translation | CEFR target |
|---|---|---|---|---|
| Choosing imperfect or PP (general aspect rule) | `verb_form.imperfect.discrimination.vs_passato_prossimo_general` | 8 | 6 | A2-B2 |
| Sapere contrast (knew vs found out) | `verb_form.imperfect.discrimination.modals.sapere` | 5 | 3 | A2-B2 |
| Dovere contrast (was supposed to vs had to and did) | `verb_form.imperfect.discrimination.modals.dovere` | 5 | 3 | B1-B2 |
| Potere contrast (could have vs managed to) | `verb_form.imperfect.discrimination.modals.potere` | 5 | 3 | B1-B2 |
| Volere contrast (wanted to vs insisted on) | `verb_form.imperfect.discrimination.modals.volere` | 5 | 3 | B1-B2 |
| Conoscere contrast (was acquainted vs met) | `verb_form.imperfect.discrimination.modals.conoscere` | 5 | 3 | A2-B2 |

Cluster subtotal: 33 grammar, 21 translation = **54 items**.

The general aspect rule got the heaviest count because the diagnostic spans a wide family of adverb cues (sempre, di solito, ogni domenica, mentre, all'improvviso, ieri, l'altro giorno, una volta, l'estate scorsa) and clause types. The five modal contrasts each got equal coverage (5 grammar + 3 translation) because they're pedagogically equivalent in difficulty; the dispatch's "richest coverage here" steer is honoured by the cluster as a whole, not by overweighting one modal.

### Progressive vs simple form (new buckets)

| Friendly label | Bucket id | Grammar | Translation | CEFR target |
|---|---|---|---|---|
| Present progressive vs present | `tense_choice.progressive_vs_simple.present_progressive_vs_present` | 5 | 3 | A2-B2 |
| Past progressive vs imperfetto | `tense_choice.progressive_vs_simple.past_progressive_vs_imperfetto` | 4 | 2 | B2-C1 |

Area subtotal: 9 grammar, 5 translation = **14 items**.

The present-leaf got more coverage because the over-applied-progressive miss is more common at B1, where learners are still building the simple-present-for-habit reflex. The past leaf is more advanced (the imperfetto already carries the ongoing reading, so the past progressive is genuinely an emphasis form rather than a default).

### Future vs present-for-future (new buckets)

| Friendly label | Bucket id | Grammar | Translation | CEFR target |
|---|---|---|---|---|
| Future for unambiguous future | `tense_choice.future_vs_present.future_for_unambiguous_future` | 5 | 3 | B1-B2 |
| Present for near-future | `tense_choice.future_vs_present.present_for_near_future` | 5 | 2 | B1-B2 |

Area subtotal: 10 grammar, 5 translation = **15 items**.

Balanced coverage between the two leaves. The future-for-unambiguous-future leaf includes two probability-reading items per the dispatch (saranno le tre, avrà una sessantina d'anni) so the construction is represented.

### Conditional vs imperfetto in counterfactuals (new buckets)

| Friendly label | Bucket id | Grammar | Translation | CEFR target |
|---|---|---|---|---|
| Prescriptive: subjunctive + conditional | `tense_choice.conditional_vs_imperfect_counterfactual.prescriptive_conditional` | 5 | 3 | B2-C1 |
| Colloquial: imperfetto + imperfetto | `tense_choice.conditional_vs_imperfect_counterfactual.colloquial_imperfect` | 5 | 2 | B2-C1 |

Area subtotal: 10 grammar, 5 translation = **15 items**.

Each item carries an explicit register cue (formal writing context, historical essay, formal letter, scientific paper, casual speech to a friend, chatty colleague-to-colleague, informal storytelling, informal complaint), because the diagnostic is precisely "which register is licensed". One translation item (`trans_tc_cf_coll_en_it_01`) follows the dispatch's "both registers acceptable" pattern, accepting both the colloquial and the prescriptive form with a negative anchor against mixing them within one sentence.

### Indicative vs subjunctive in subordinates (new buckets)

| Friendly label | Bucket id | Grammar | Translation | CEFR target |
|---|---|---|---|---|
| Opinion verbs (penso che, credo che, mi sembra che, suggerisce che, trovo che) | `tense_choice.indicative_vs_subjunctive.opinion_triggers` | 6 | 3 | B2-C1 |
| Emotion expressions (sono contento che, mi dispiace che, spero che, temo che, sono sorpreso che) | `tense_choice.indicative_vs_subjunctive.emotion_triggers` | 5 | 2 | B2-C1 |
| Hypothetical conjunctions (sebbene, benché, prima che, affinché, purché) | `tense_choice.indicative_vs_subjunctive.hypothetical_triggers` | 5 | 2 | B2-C1 |
| Negation flip (non penso che, non è vero che, non dico che, non sapevo che) | `tense_choice.indicative_vs_subjunctive.negative_triggers` | 4 | 1 | B2-C1 |

Area subtotal: 20 grammar, 8 translation = **28 items**.

Opinion got the most coverage because it's the most colloquially-variable trigger family, and the items deliberately frame each with a formal-context cue (formal writing, formal review, formal academic context, academic article, policy paper, formal analysis) so the prescriptive answer is unambiguous despite the live colloquial form. Hypothetical conjunctions got five items covering the main concessive (sebbene, benché), time-before (prima che), purpose (affinché), and conditional (purché) members, each of which is a structural trigger that resists colloquial slippage. Negation flip got four items spanning the main flip patterns (penso che under negation, è vero che under negation, dico che under negation, sapevo che under negation).

### Trapassato prossimo vs imperfetto (new buckets)

| Friendly label | Bucket id | Grammar | Translation | CEFR target |
|---|---|---|---|---|
| Trapassato for completed-prior-to-prior (già, appena, da poco) | `tense_choice.trapassato_vs_imperfect.completed_prior_to_prior` | 5 | 2 | B2-C1 |
| Imperfetto for ongoing background (mentre, quando, parallel actions) | `tense_choice.trapassato_vs_imperfect.ongoing_background` | 5 | 2 | B2 |

Area subtotal: 10 grammar, 4 translation = **14 items**.

Equal coverage between the two leaves. Adverb cues do most of the diagnostic work: già, appena, da poco for the trapassato side; mentre, quando, ancora, parallel-imperfetto frames for the ongoing-background side.

## CEFR distribution

| Level | Grammar items | Translation items | Notes |
|---|---|---|---|
| A2 | 7 | 0 | Entry points on the cleanest imperfetto-vs-PP cases (general aspect and conoscere/sapere) |
| B1 | 39 | 22 | The dispatch's centre of gravity. All five modal contrasts and most basic contrast-area items. |
| B2 | 38 | 22 | Counterfactual, subjunctive, trapassato, and harder modal items. |
| C1 | 8 | 4 | Hypothetical conjunctions, negation flip, advanced counterfactuals, advanced trapassato/sapere. |

The runtime filters by `cefr_level_target`, so a B1-restricted user sees a B1-and-below subset (46 items) while a C1+ user sees everything.

## Items flagged uncertain

These items have a diagnostic call that is debatable and worth the project author's review:

- **tc_imp_pp_pot_05** (B2) and **tc_imp_pp_vol_05** (B2): both use "alla fine" + insistence cues. The reading is clear in context, but "alla fine" can also be read as "in the end" (managed-to nuance for potere, insisted-on for volere). The intended diagnostic is the modal-meaning shift, but a learner who reads "alla fine" as "as it turned out" might land on a different mood interpretation. Counter-argument: the surrounding clauses ("anche se ero stanchissima", "per via del lavoro") fix the reading.

- **tc_cf_coll_03** (B2): the source uses direct-speech quotation marks inside the prompt and asks the learner to pick the colloquial form inside quoted speech. The quotation framing is a strong register cue, but learners who read past the quotation marks might miss the implicit register switch. Worth a usability check; if learners systematically miss this style of cue, the framing convention should be revisited.

- **trans_tc_cf_coll_en_it_01** (B2) — RESOLVED 2026-05-28. Architecture ruled asymmetric per-bucket tracking: both register buckets sit in `required_buckets`, the marker fires whichever the learner matches, the other stays untouched, item credit is full per attempt. Item refactored to version 2; the previous required + optional shape is gone.

- **tc_trap_compl_05** (C1) "Solo dopo molti anni scoprì che la sorella aveva bruciato il manoscritto...": the trapassato is clearly right here, but the bucket "completed prior to prior" depends on the reading that the burning is a single completed event. A learner who reads it as "the sister was in the habit of burning manuscripts" could justify imperfetto bruciava on aspect grounds. The single-completed-event reading is overwhelmingly preferred by native speakers, but the item is at the genuine edge of the bucket's scope.

- **tc_subj_op_04** (C1) "Nel suo studio l'autore sostiene che la riforma abbia effetti negativi": "sostenere che" sits in a slightly ambiguous space between an opinion verb (which prescriptively takes subjunctive) and a reporting verb (which colloquially takes indicative when reporting a position as fact). The formal-academic register fixes the prescriptive choice, but the dispatch reviewer might prefer to retag this under a new "reporting verbs" leaf if one is added.

## Notes on schema and convention

**Schema reconciliation (dispatch's flat-answer example vs brief's markpoints array).** The dispatch's example schema shows a flat `answer` block, but the marker engine reads `markpoints`. All 92 grammar items use the brief's markpoints shape with exactly one markpoint per item, the right form in `any_phrases`, the wrong form in `must_not_include`, both attributing to the same tense-choice bucket. The wrong-form miss fires as attempted-but-wrong, which gives the dispatch's intended single-miss-on-mistake behaviour. Total credit sums to marks (both 1.0) on every item.

**Modal-auxiliary-inheritance avoidance.** The imperfetto-vs-PP modal items deliberately avoid infinitive complements that take essere (no `dovere/potere/volere + andare/partire/arrivare/reflexives`), because that drags in the modal-auxiliary-inheritance diagnostic. Where a verb of motion was needed in the scene, it lives in a separate clause from the modal verb. The handful of essere-inheriting items that do appear (e.g. `tc_imp_pp_dov_04` "Anna doveva presentare la tesi") use transitive infinitive complements ('presentare la tesi') so the auxiliary question doesn't arise.

**Gender variants in any_phrases / must_not_include.** Where speaker gender is implicit and the form uses essere as auxiliary, both gendered participles are listed (`["sono andato", "sono andata"]`). This catches the learner's choice regardless of how they gendered the form. The imperfetto is gender-invariable so the question doesn't arise on the imperfetto side.

**Vocab help sparseness.** Per the dispatch, vocab_help is omitted on the verbs in the choice pair (they're handed to the learner and the housing's active-production rule would skip them anyway). vocab_help appears only on plausibly-unknown non-verb content words: `preavviso`, `incinta`, `sconvolto`, `a memoria`, `pronto soccorso`, `concorso`, `trasloco`, `tentativo`, `mostra`, `per via di`, `relazione`, `di fila`, `conto`, `rivista`, `trasferirsi`, `all'improvviso`, `binario`, `casino`, `falla`, `pallida`, `azzardata`, `sessantina`, `battente`, `manoscritto`, `passato di mente`. Translation items add vocab_help on key English verb-lemma pointers when the Italian lemma isn't obvious from English (e.g. "found out" → sapere in PP, "moved" → trasferirsi).

**Bucket id strategy across the cross-tree boundary.** All items have `topic: "tense_choice"` (this is the dispatch's home topic). The `subtopic` field uses a structural label that reflects the cited bucket: `imperfect_vs_pp.general`, `imperfect_vs_pp.modals.sapere`, `progressive_vs_simple.present_progressive_vs_present`, etc. The cited `bucket` lives on whichever tree owns it. The `external_id` prefix is `tc_` for every item in this dispatch including the imperfect-tree ones.

## Bucket suggestions

The `bucket_suggestions_tense_choice.json` file is empty.

The watch list (mentioned in the coverage plan) was:
1. **Passato remoto vs passato prossimo in literary register.** Did not surface. The dispatch deliberately stayed clear of the literary-narrative register, and items in this batch are all neutral or formally-but-not-literarily framed.
2. **Future-perfect vs trapassato.** Did not surface. Future-perfect of probability appears in passing (e.g. "avrà finito" mentioned in the glossary suggestion's long-form), but no item dispatches it as a diagnostic.
3. **Sequence of tenses in embedded subjunctive.** Did not surface. The subjunctive items use either present subjunctive (when the matrix verb is present) or imperfect/past subjunctive (when the matrix verb is past), and the rule is applied consistently. A dedicated bucket for the sequence-of-tenses rule would be a useful future addition for C1-C2 learners but isn't needed for the items in this batch.
4. **"Sostenere che" / "dichiarare che" as a separate trigger family.** `tc_subj_op_04` and the closely-related "suggerire che" item (`tc_subj_op_05`) sit at the edge of the opinion-triggers bucket. If feedback shows learners are systematically confused by these, a new leaf "reporting verbs with embedded subjunctive in formal register" could be carved out from the opinion-triggers bucket. Flagged but not proposed in this dispatch.

## Glossary suggestions

Five terms proposed in `glossary_suggestions_tense_choice.json`:
- **counterfactual** — the cross-linguistic concept (distinct from the imperfect dispatch's "periodo ipotetico", which names the Italian-grammar-tradition classification)
- **future of probability** — Italian's morphological future used for present-time guessing
- **subjunctive trigger** — the unifying name for opinion verbs, emotion expressions, hypothetical conjunctions, negation-flip cases
- **concessive conjunction** — sebbene/benché/nonostante family
- **polarity flip** — the negation-induced subjunctive rule

Terms not proposed because the imperfect dispatch already suggested them: aspect, progressive aspect, prospective reading, protasis, apodosis, periodo ipotetico, polite-present.

Terms not proposed because the existing glossary v2 already covers them: subjunctive, conditional, future, imperfect indicative, passato prossimo, trapassato prossimo, gerund, modal verb.

## Notes for the next dispatch

1. **Marker behaviour on the "both registers acceptable" pattern — RESOLVED 2026-05-28.** Architecture ruled asymmetric per-bucket tracking (both buckets in `required_buckets`, marker fires whichever the learner matches). The convention scales: future dispatches should put each register bucket directly into `required_buckets` rather than using the required + optional split.

2. **Sequence-of-tenses bucket.** The subjunctive items in this batch use the correct sequence-of-tenses (present subjunctive after present matrix, imperfect or past subjunctive after past matrix) but the bucket doesn't track sequence-of-tenses misses. A future dispatch on subjunctive formation (rather than indicative-vs-subjunctive choice) should consider whether sequence-of-tenses deserves its own leaf.

3. **Reporting-verbs carve-out from opinion_triggers.** As above. Flag if feedback shows this is a confused area for learners.

4. **Translation items' diagnostic purity.** All 48 translation items list only tense-choice buckets in `required_buckets`. Formation misses (wrong auxiliary, wrong participle, wrong subjunctive ending) will still be recorded by the marker against their own buckets via the standard taxonomy, but this dispatch's tracking stays clean. If the housing's marker policy on `required_buckets` vs incidental-miss-attribution shifts, this dispatch's items should be revisited.

5. **The optional `match_at: "end"` engine flag was not used.** All any_phrases and must_not_include entries are full verb forms or short verb phrases, so substring matching is adequate. No item in this dispatch needs end-of-word anchoring.

## File inventory

- `data/grammar_questions_tense_choice.json` — 92 items
- `data/translation_items_tense_choice.json` — 48 items
- `data/bucket_suggestions_tense_choice.json` — empty array (deliberate; rationale above)
- `data/glossary_suggestions_tense_choice.json` — 5 proposed terms
- `data/coverage_tense_choice.md` — this file
