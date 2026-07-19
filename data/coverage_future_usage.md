# Coverage: future, USAGE branch (wave 2)

**Dispatch:** DISPATCH_usage_wave2.md (the usage axis, wave 2), FutureFormationAuthor section.
**Author:** FutureFormationAuthor
**Date:** 2026-07-18
**Brief revision applied:** AUTHOR_BRIEF Rev 27.

**Totals:** 15 grammar questions + 8 translation items, merged into `grammar_questions_verb_form.future.json` (now 65) and `translation_items_verb_form.future.json` (now 27); the separate deliverables are kept as `*_future_usage.json.merged.bak`. Of the 15 grammar items, **11 carry `info_display: "suppress"`** and **5 carry `candidate_tenses`** (the temporal-subordinate set). **7 items carry a second, co-crediting markpoint** per Rev 27.

**Three usage leaves are PROPOSED, not yet registered** (see `bucket_suggestions_verb_form.future.json`). They appear in the future tree's prose but are not bucket entries, so **until Architecture registers them the batch's citations strict-reject at production load** (the same class of load risk ConditionalFormationAuthor flagged for the imperfect→condizionale citations). This is the one blocking ask.

---

## Coverage by leaf

| G | T | Leaf (short) | What it teaches |
|--:|--:|---|---|
| 6 | 3 | usage.probability *(B1 core)* | Future = a guess about the present (Saranno le tre, Avrà vent'anni); futuro anteriore = a guess about the past (Avrà perso il treno). The headline gap; no contrast partner. |
| 4 | 2 | usage.command_promise *(B2)* | Firm promise / emphatic-legalistic command in the future (Ti prometto che verrò; Farai i compiti!; Non ucciderai). |
| 5 | 3 | usage.temporal_subordinate *(B1)* | Future required after quando / appena / finché (non) where English uses the present (Quando arriverai, ti chiamerò). |

CEFR spread (grammar): 9 × B1, 6 × B2. Translation: 6 × B1, 2 × B2. This matches the dispatch: probability and temporal-subordinate are B1-core, the emphatic future and the past-probability compound are B2.

---

## Rev 27 cross-crediting (this batch is a heavy user)

Per Rev 27, an answer credits every bucket it genuinely evidences; co-crediting markpoints weight `credit` to sum to the item's marks (so marks are not inflated) while each bucket event records full mastery.

- **The 5 temporal-subordinate items** each carry two markpoints on the one correct answer: `verb_form.future.usage.temporal_subordinate` (the function: future required after quando) **and** `tense_choice.future_vs_present.future_for_unambiguous_future` (the choice: future over the English-style present), 0.5 each, marks 1. This is the textbook Rev 27 case: the item teaches a standalone usage function AND evidences the contrast, so it credits both rather than being split off to tense_choice. **This is the item worth your scrutiny** (see the ratification ask): the dispatch boundary says "tense_choice.future_vs_present owns future-vs-present; do not re-author that here", and I am reading Rev 27 as licensing a *co-credit* (not a re-authoring) because the temporal-subordinate requirement is a genuine function, not a bare choice.
- **The 2 past-probability items** (fu_prob_ant_01/02) co-credit `usage.probability` **and** `verb_form.future.formation.future_anteriore` (0.5 each), because producing "avrà perso" / "saranno usciti" genuinely evidences both the probability reading and the compound formation.

The 8 single-markpoint items (probability present-guess ×4, command_promise ×4) credit their one usage leaf at 1.0.

---

## Chip suppression (`info_display: "suppress"`)

- **probability (all 6) — suppressed.** Using the future to express a PRESENT guess is marked and counterintuitive; a "future of probability" breadcrumb hands over that the guess wants the future, which is the whole skill. The guess is recoverable from the prompt context (non lo so, immagino, ...), so suppression does not make the item unanswerable (Rev 19 satisfied).
- **temporal_subordinate (all 5) — suppressed** and carry `candidate_tenses: ["presente","futuro_semplice"]` + `correct_tense: "futuro_semplice"` (criterion 16), because they test a tense choice; a "future after quando" breadcrumb would hand over the answer the English intuition fights.
- **command_promise (all 4) — visible.** A promise or emphatic command about a future action naturally takes the future, so the breadcrumb restates the register/context rather than leaking; the register is stated in each prompt (criterion 11).

---

## Wrong-form catches (criterion 10b)

Every usage item lists the tense a learner would wrongly reach for in `must_not_include`: the present (sono, ha, è, arrivi, finisco, so, sei) on the probability and temporal-subordinate items; the imperative/present (fai, uccidere, vengo) on the command items; the passato prossimo (ha perso, sono usciti) on the past-probability items. Correct answers all carry `match_at: "word"` (criterion 18).

---

## Items flagged uncertain (for the project author to rule on)

1. **The temporal-subordinate co-credit into tense_choice (the big one).** I credited each temporal-subordinate item to both `usage.temporal_subordinate` and `tense_choice.future_vs_present.future_for_unambiguous_future`, reading Rev 27's "overlap is a feature, author the second markpoint" against the dispatch's "do not re-author tense_choice.future_vs_present here". My reasoning: the future-after-quando is a grammatical REQUIREMENT (a function this leaf teaches), and it merely also evidences the contrast, so it co-credits rather than re-authors. If you would rather these credit ONLY the usage leaf (leaving the contrast to tense_choice's own items), I drop the second markpoint and set marks back to 1 on one markpoint. Ratification asked in the thread.

2. **finché (non) expletive.** fu_tsub_03 uses "finché non finirà" (the expletive non that does not negate). Standard, but flag if you want finché items to avoid the expletive-non subtlety at B1.

3. **command_promise register.** I stated the register in each prompt ("nel registro solenne dei comandamenti", "il rimprovero enfatico di un genitore") per criterion 11, since the emphatic future is register-conditional. Confirm that in-prompt Italian register framing is acceptable (the alternative is an English bracketed cue).

---

## Notes for later dispatches / the record

- **tense_choice.future_vs_present** now receives credit from these 5 temporal-subordinate items even though TenseChoice did not author them; that is the intended Rev 27 behaviour (56 items already cross-credit across topics), but TenseChoice should know its future-vs-present mastery signal now includes this evidence.
- **The parent `verb_form.future.usage`** still carries its old stub-era description (prediction/scheduling/mild commands). Updating it to point at the three real leaves is Architecture's call, not mine; flagged.
- **Not authored** (boundary held): the future-vs-present-for-future *scheduling* choice (parto domani vs partirò domani) stays with tense_choice; I authored only the obligatory-future-after-quando function.
