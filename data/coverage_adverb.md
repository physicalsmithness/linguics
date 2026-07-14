# Coverage: Adverbs (AdverbAuthor, first pass, 2026-07-14)

First authoring pass on the adverb tree, against AUTHOR_BRIEF Revision 18 and DISPATCH_adverb.md (with its Brief Revision 13 addendum). The brief advanced from Rev 14 to Rev 18 during this session, so this batch is reconciled to Rev 18: criterion 18 (superstring safety, all three directions) applied, criterion 19 (accent as morpheme) checked and not applicable, criterion 16's `candidate_forms` / `correct_form` carried on the discrimination items. 46 grammar items and 16 translation items, covering all six active leaves. No new buckets were needed to author; one forward bucket proposal and three glossary terms are raised separately.

**Open threads (this doc is the record, the threads are the asks, per Rev 18):**
`inter_chat/AdverbAuthor_Architecture_lexical_discrimination_answerability.md` (suppression finding, label rename, retro-audit ask) and `inter_chat/AdverbAuthor_Architecture_batch_delivery.md` (locuzioni leaf registration, glossary term merge).

## Coverage by leaf

Counts read from the output files, not memory. "Grammar" is items whose markpoint cites that leaf; "Translation" is items whose `required_buckets` cite it.

| Leaf (label) | Grammar | Translation | Rule angles covered |
|---|---:|---:|---|
| Molto that agrees, molto that doesn't | 10 | 4 | invariable before adjective, invariable modifying a verb, agrees before a noun; four same-surface opposite-answer pairs across molto/poco/troppo/tanto; feminine-adjective agreement bait |
| Bene or buono? | 9 | 5 | adverb for an action, adjective on a thing, wellbeing (sto bene), the sto-buono = behave trap, buono agreeing on a noun, the "molto buono" anglophone slip, both directions |
| -le and -re drop the e | 8 | 1 | -le drop (facile, difficile, gentile, probabile, normale), -re drop (regolare, particolare), the leggero irregular planted as an exception |
| -mente from the feminine | 7 | 2 | -o class builds on the feminine (lento, vero, sicuro, raro), -e class adds -mente directly (veloce, forte, semplice) |
| Bene, male, presto and friends | 7 | 2 | production (presto, volentieri, spesso, male, bene), IT to EN recognition (subito, tardi), three "don't invent -mente" guards |
| Where the adverb goes | 5 | 1 (+1 cross-tree) | manner adverb after the verb, frequency adverb after the verb (anti-calque), intensifier before adjective, intensifier before adverb |

CEFR spread: grammar 1 A1, 38 A2, 7 B1; translation 13 A2, 3 B1. The topic is A2-core, so the weight is deliberate; B1 items are the trickier discriminations (feminine-adjective bait, molto-buono, stai-buono, leggero, the compound-placement boundary demo).

## The one hard boundary (position vs passato prossimo)

Compound-tense placement (già/mai/ancora between auxiliary and participle) stays with the passato prossimo tree. Verified on disk: `verb_form.passato_prossimo.adverb_placement` exists and its description keeps to compound tenses, so there is no overlap with my simple-tense position leaf.

I authored no fresh grammar for compound placement. One translation item, `trans_adv_pos_en_it_02` ("I have already eaten"), deliberately demonstrates the boundary: its `required_buckets` cites the passato prossimo placement bucket cross-tree (not my tree), with the position leaf only in `optional_buckets`, and the explanation says the skill is credited there. This is the cite-not-duplicate contract in action, not a stray citation.

## Design decisions and judgment calls (for review; push back on any)

- **Suppression (corrected after Smith's catch).** 22 of 46 suppressed, not 41. My first cut suppressed the two discrimination leaves as well, per criterion 15's discrimination-by-default. That was wrong and Smith caught it: on a *lexical* discrimination the candidate set is not recoverable from the sentence ("Lucia cucina ____" admits velocemente, spesso, male, poco and many more), so hiding the breadcrumb does not test the discrimination, it makes the item unanswerable. Criterion 15's default was derived from tense choice, where context pins the answer and the candidates are forms of the cued verb; it does not transfer to a choice between lexemes. Now: the 22 formation and primary items stay suppressed (their breadcrumbs name the derivation rule or list the answer word, and the prompt already supplies the base form, so only the rule is hidden; Smith confirmed all three leaves). The 19 discrimination items carry explicit `info_display: "show"` plus `candidate_forms` / `correct_form`. The 5 position items carry no flag and default to visible. Full reasoning and the asks are in the answerability thread.
- **Leaf label rename pending (architecture-owned).** "Molto that agrees, molto that doesn't" names the rule, so it is not safe to show as-is; the ask is to rename it to the form list "molto / molte / molta / molti". Until that lands, those 10 items are visible with a label that hints the rule. "Bene or buono?" already names the forms and is safe shown.
- **Single combined slot (criterion 9).** Position items put the whole ordering in one blank rather than two slots, so the number of slots does not leak the answer shape. I avoided any two-blank bene/buono item, because each word is the other's `must_not_include`, and the substring marker scans the whole answer string, which would misfire across slots.
- **Superstring safety (criterion 18, Rev 15).** All 130 phrase entries (47 any_phrases, 83 must_not_include) carry per-phrase `match_at: "word"`, matching the negation, existential and relative-pronoun batches. This anchors the exposed cases: bene inside benissimo, male inside malissimo, the quantifiers, and the -mente stems. I followed the Rev 15 criterion text over the still-stale §2 `match_at` bullet (the one the relative-pronoun errata thread already flags as describing match_at as a "future extension"). Criterion 19 (accent_load_bearing) does not bite here: no adverb answer carries an accent whose stripped twin is another valid answer.
- **No target count (Principle 7).** I authored to rule-internalisation, not to a number; the leaf counts fall out of covering each rule from several angles, weighted to the two hot spots.
- **Lean vocab_help.** Entries are sparse and forward-reference `vocabulary.it.*` buckets that do not exist yet (as the brief permits). The sentences are mostly A2-basic, so I helped only the less-obvious content words. Easy to enrich once the cross-cutting vocab taxonomy lands.
- **Direction split.** 12 en to it, 4 it to en in translation, plus two IT-to-EN recognition items inside the grammar set. Skewed to production, appropriate for an A2 topic; more it to en can come in a B1 pass.

## Misconception-axis candidates (surfaced explicitly, not absorbed silently)

Per the estate principle on adding new misconceptions openly rather than burying them, these are the wrong-forms my `must_not_include` lists already catch, offered to the Misconception Analyst as candidates:

- **Agreement leaking onto the adverb**: "molte stanche", "sono molta stanca", "troppa" for the adverbial troppo. The single sharpest diagnostic in the topic.
- **Adjective for adverb**: "cucina buono", "parlo italiano molto buono", "canta buono".
- **Wrong idiom sense**: "sto buono" for "I feel well" (it means "I behave").
- **Invented -mente on primary adverbs**: "benemente", "malemente", "prestamente", "spessamente".
- **Undropped e on -le/-re**: "facilemente", "regolaremente".
- **-mente built on the masculine**: "lentomente", or the -e class over-feminised "velocamente".
- **English word order**: "sempre arriva", adverb after the object ("parla l'italiano bene").

## Uncertain items / things to check

- `trans_adv_bb_it_en_01` accepts "You speak good Italian" as a sense-mode variant alongside "You speak Italian well". If the marker is strict about the adverb surfacing as an adverb in English, tighten it.
- The "stai buono = behave" pair (`adv_bb_08`) is the one item whose correct answer is buono rather than bene, planted to break the bene autopilot. Confirm you are happy teaching stare buono at A2/B1; I set it B1.
- "malamente" and "cattivamente" are real (marked) Italian adverbs, so I kept them out of `must_not_include` on the male item to avoid flagging a grammatical form as wrong. Only the clearly-invented "malemente" is guarded.

## Forward proposals (architecture-owned, raised not decided)

- **bucket_suggestions_adverb.json**: one leaf, *Fixed adverbial phrases* (locuzioni avverbiali), under the adverb root. Not needed for this pass; a real B1 gap surfaced by the OIC drill (a poco a poco, di solito, all'improvviso, and the distractor-rich set a squarciagola / alla rinfusa / a bizzeffe). If accepted it may want sub-leaves rather than one flat leaf; that shape is yours to set.
- **glossary_suggestions_adverb.json**: three terms used in my explanations and absent from glossary.json v4: *adverb of manner*, *primary adverb*, *intensifier*. "invariable" is already canonical, so it is deliberately omitted.

## Notes for the next dispatch

The topic is covered at A2. Natural next tranches: a B1 pass on the locuzioni leaf if Architecture registers it; a second it-to-en wave for intermediate learners; and, once the vocab taxonomy exists, backfilling vocab_help. No blockers, no open inter_chat threads on adverbs.
