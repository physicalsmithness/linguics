# Architecture feedback from the adjective_agreement authoring run

Date: 2026-05-12
From: adjective_agreement authoring chat
To: the architecture chat that owns `AUTHOR_BRIEF.md`

This is feedback gathered while drafting the first full content batch for adjective agreement. Group by theme below. The user has approved all of these in conversation; they are flagged here so the brief can be edited centrally.

## 1. Default target counts are too low

The brief currently suggests 30 grammar questions and 15 translation items per topic. With ~20 to 25 leaf buckets in the adjective_agreement tree, that gives roughly 1 item per leaf, which is not enough to expose the miss pattern reliably. Recommend the brief instead pins the floor to the bucket tree:

- At least 5 grammar questions per active leaf bucket. Two as a hard minimum where the bucket is very narrow.
- Plus extra items for the bucket the project has flagged as a hot spot. For Italian adjectives that is Class II feminine plural ("the Smith-noted hardest case"). For other topics the architect should mark equivalents.
- Translation items: not pinned to a flat number. Pinning to "one item per core-at-target aggregate node plus a few diagnostic mixes" is more useful. For adjective_agreement that lands at 25 to 35 items.

Net result: the actual run is closer to 120 to 140 grammar items and 25 to 35 translation items, not 30 and 15.

## 2. CEFR target should not drive authoring

The brief tells the author chat to pick a CEFR target up front and bias content toward it. The user's preference is the opposite: write coverage-first content that does each bucket justice, then tag each item with the CEFR level it lands at, and let the runtime filter or schedule by level. Authoring with a CEFR tilt risks under-covering buckets that happen to fall outside the target band.

Recommend the brief reframes §1.D as: "Set a recommended CEFR balance for review. Do not gate authoring on it. Tag each item's level on output."

## 3. Vocab vs grammar disambiguation in marking

Open marking question raised by the user: when a learner gets a grammar item wrong, we cannot always tell whether they missed the agreement rule or the vocabulary. For prompts that supply the base form (e.g. "form the right form of `vecchio`"), the miss is unambiguous. For prompts that do not supply it (e.g. translate "an old book"), a wrong answer mixes vocab and grammar.

Proposed UI affordance (architectural): show two optional checkboxes next to the answer field:

- "I do not know what `vecchio` means" (when the Italian is supplied)
- "I am guessing the Italian for `old`" (when only the English is supplied)

The marker uses these flags to attribute the miss correctly to a vocabulary bucket or to a grammar bucket. This is a brief-level decision because the item schema needs to grow a "vocab_word" field (or similar) so the UI knows which word to put in the checkbox.

## 4. When does a grammar item become a translation item

The brief currently says grammar items are short (one or two words). In practice some adjective questions naturally want noun-phrase answers (`le case rosse`) because the grammar of agreement is most clearly tested in the phrase, not the bare adjective. Two options for the brief:

- A. Loosen the "one or two words" rule for grammar items, and let `any_phrases` carry a phrase plus optional surroundings. Acceptable if the marker is substring-based and tolerant.
- B. Keep grammar tight at one word, and let phrase-level marking always be a translation item with reference translations.

The user has signed off A. The brief should be updated to say grammar answers can be a noun phrase up to ~4 words when the agreement context matters.

## 5. Translation taxonomy is unfinished

Translation `required_buckets` and `optional_buckets` currently borrow from the topic taxonomy. But translation items naturally invoke buckets from outside the topic (articles, prepositions, word order, etc.) and there is no settled taxonomy for those yet. The author chat is allowed to point at non-topic buckets where they exist, and to leave a comment in `examiner_note` where they would point at a bucket that does not yet exist.

Recommend: the architecture chat schedules a session to produce a cross-cutting translation taxonomy that covers articles, prepositions, word order, register, idiom, and so on. Until then, translation items will be slightly under-bucketed.

## 6. Concrete bucket gaps in `adjective_agreement.json`

These were spotted while authoring. They are written up properly in `data/bucket_suggestions_adjective_agreement.json` but called out here so the architect can ratify them:

- Irregular stem changes need real leaves. The aggregate node `adjective_agreement.stem_changes.irregular` has no children. Proposed leaves: `amico_amici` (irregular -ci), `greco_greci` (irregular -ci with penult stress), `antico_antichi` (regular -chi despite the antepenult feel).
- Predictable stem changes are missing the -cio / -gio family. Adjectives like `vecchio`, `grigio` lose the -i before the plural ending (`vecchi`, not `vecchii`). Same for -cia / -gia in the feminine when unstressed (`grigia → grigie`). Propose four leaves under `stem_changes.predictable`.
- Mixed-gender plural default is not in the tree. The rule "mixed group takes masculine plural" is a common A2/B1 miss. Propose `adjective_agreement.mixed_gender_plural_defaults_masculine` as a sibling of `o_class` and `e_class`, since it applies across both.
- Invariable adjectives are not in the tree at all. Big gap. Colours from nouns (`blu`, `rosa`, `viola`, `marrone`, `beige`), compound colours (`verde scuro`, `blu marino`), and `pari` / `dispari` are all invariable. Propose `adjective_agreement.invariable` as an aggregate with three children.
- The `position.semantic_shift` bucket is a single leaf but the pattern is word-specific. Propose breaking out at least the high-frequency cases as sub-leaves: `vecchio`, `grande`, `povero`, `caro`, `nuovo`, `unico`. Optional. The current single leaf works if the marker is happy to fire it without knowing which word.

## 7. Tree typo

`adjective_agreement.e_class.feminine_plural.attributes.common_miss` reads `case grande (no number) or case grande (Class I confusion)`. The second occurrence should be `case grandi` (the Class I confusion miss is writing -e instead of -i). One-character fix.

## 8. Brief should ask the author for a coverage summary

The author chat naturally produces this as it writes. Recommend the brief asks for `coverage_<topic>.md` alongside the JSON, with a bucket-to-item-count table and a list of items flagged as uncertain. The reviewer wants this; producing it after the fact is wasted effort.

## 9. Severity field is hard to author for

`severity` (trivial / minor / major) is described in the brief as "change-impact flagging" but there is no rubric for deciding. The author chat defaults to `minor` everywhere. Suggest the brief either drops the field for first-write items or gives a one-line rule (e.g. "major = a learner who masters this item should not need to retake it; minor = standard item").

## 10. examiner_note convention

The brief marks `examiner_note` as optional. Recommend: required on any item with more than one markpoint, or where the miss interpretation is ambiguous; otherwise optional. The author chat is following this convention in the absence of a stated one.
