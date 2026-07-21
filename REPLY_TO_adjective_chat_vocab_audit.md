# Reply: vocab_help audit (adjective_agreement)

Thanks for the comprehensive audit in `data/vocab_bucket_references_adjective_agreement.json`. The transparency on conventions used is useful and most of what you've done is exactly right. This reply covers: four conventions ratified, three issues to fix in a revision pass, and a note on how the rules now propagate to other dispatches.

## Conventions ratified

The four conventions you flagged in the audit's `notes` array are accepted as-is and have been written into `AUTHOR_BRIEF.md` as part of Revision 3 (the new §2 "Lemma key conventions"):

1. **Multi-word invariable items use underscores** in the lemma key (`blu_marino`, `giallo_limone`, `rosso_fuoco`, `verde_acqua`, `verde_scuro`). The bucket separator is `.`, so the lemma slot can't carry dots; underscore is the right escape.

2. **Inflected and elided surface forms point at the canonical lemma.** `sant'Antonio`, `mele`, `mezza`, `begli` all carry their own `vocab_help` entry so the clickable-word matcher can find each surface form, but the entry's `bucket` field references the canonical lemma's bucket. This is the lemma-not-inflection rule applied at the bucket level.

3. **Past participles point at the infinitive.** `apprezzata` is help for `apprezzare`. Same principle: the participle is inflected, the infinitive is the citation form.

4. **Adjective lemmas don't carry a `gender` aspect.** The agreement test makes gender of the adjective stem a giveaway, and the adjective stem's gender doesn't reveal the noun's gender anyway. Adjective lemmas carry `translation` only.

These four are now in the brief explicitly, so the in-flight vocab-frequency chat and future dispatches will follow the same shape without round-tripping.

## Issues to fix in a revision pass

Three issues surfaced. Please revise the `grammar_questions_adjective_agreement.json` and `translation_items_adjective_agreement.json` files to address each, then regenerate the `vocab_bucket_references_adjective_agreement.json` audit so we can confirm the fix.

### 1. Restore diacritics in lemma keys

`vocabulary.it.citta.*` and `vocabulary.it.opportunita.*` strip the grave accent from the canonical Italian spellings (`città`, `opportunità`). The bucket-id system stores unicode strings; there's no ASCII restriction. The clickable-word matcher does a unicode-aware substring match against the prompt text, so the lemma key must carry the accent to be findable.

Action: rename the affected buckets and lemmas:

- `vocabulary.it.citta.translation` and `vocabulary.it.citta.gender` become `vocabulary.it.città.translation` and `vocabulary.it.città.gender`.
- `vocabulary.it.opportunita.translation` and `vocabulary.it.opportunita.gender` become `vocabulary.it.opportunità.translation` and `vocabulary.it.opportunità.gender`.

Then audit your full output for any other accent-bearing words (Italian's main suspects are anything ending in stressed `-à`, `-è`, `-ì`, `-ò`, `-ù`, plus words like `caffè`, `perché`, `però`, `così`). The audit only covers what was `vocab_help`'d; prompts may contain accented words that weren't surfaced. Restore accents anywhere they appear in a lemma key.

For reference, the new brief §2 rule reads: "Carry the citation form's full diacritics. The lemma is `città`, not `citta`."

### 2. Resolve inconsistent aspect coverage

The audit's `per_lemma_aspects` shows several noun lemmas carrying only one of the two expected aspects. Looking at the canonical pattern (nouns should have both `translation` and `gender` when both are diagnostically meaningful), the following look like authoring slips rather than deliberate choices:

- `cantina` (f) - only `translation`, missing `gender`
- `cestino` (m) - only `translation`, missing `gender`
- `vetrina` (f) - only `translation`, missing `gender`
- `cugina` (f) - only `gender`, missing `translation` (asymmetric with `cugino`, which has only `translation` and is missing `gender`)
- `cugino` (m) - only `translation`, missing `gender`

Action: for each of the five, either add the missing aspect, or leave a one-line note in `examiner_note` on the item(s) explaining why it was omitted. Please also audit the rest of your noun lemmas (the audit is full; a quick scan will catch any I missed) and treat them the same way.

The principle from the brief: "For each lemma, include only the aspects that are diagnostically meaningful AND that a learner at the target level might not know." That's the test. If you decide a given noun's gender isn't worth surfacing for the level the item targets, that's fine, but the decision should be explicit not accidental, and asymmetric pairs (cugino / cugina) should be either both-aspects or both-with-rationale.

While you're there: please also add `gender` aspects to mixed-gender pair members where the partner has both. Specifically `cugino` and `cugina` should each carry both `translation` and `gender`; the diagnostic at stake is "did the learner know the m form vs the f form?" and that's different for each.

### 3. Lowercase the proper-noun key

`vocabulary.it.Rinascimento.*` is the only capitalised lemma key. The brief §2 rule (now in Revision 3) is: lowercase the bucket key, capitalise the reveal. So:

- Key: `rinascimento`
- Reveal: `Rinascimento - Renaissance`

Action: rename `vocabulary.it.Rinascimento.*` to `vocabulary.it.rinascimento.*`. The matcher is case-insensitive, so the clickable-word match on the actual word `Rinascimento` in the prompt still works.

If you have any other proper nouns I haven't spotted (city names, person names, historical references), apply the same rule.

## What to send back

When done:

1. Updated `grammar_questions_adjective_agreement.json` and `translation_items_adjective_agreement.json`.
2. A regenerated `vocab_bucket_references_adjective_agreement.json` reflecting the changes, with the same `notes` array updated to capture any reasoning for asymmetric aspect coverage that you preserve as deliberate.
3. A short summary (a few lines is enough) of any items where you chose to leave an aspect off for a reason worth flagging.

If the revision turns up cases where the rules in §2 are ambiguous or hard to apply, surface them and we'll either clarify in the brief or extend the rule. The aim is to make the convention crisp enough that future authoring chats don't have to re-derive it.

## Where this fits in the wider project

Two parallel things happening simultaneously, in case it's useful context:

- The pronoun chat received its own reply packet (`REPLY_TO_pronoun_chat_decisions.md`) plus a house-style feedback packet. They're working on a revision that incorporates both. Their content uses the same vocab_help shape and will follow the same Revision 3 rules.
- A vocab-frequency chat is in flight, producing the top-1000 Italian frequency list as a separate strand. When their output lands, the project will have actual vocabulary content (not just buckets), and the cross-cutting taxonomy concerns we raised earlier will start to resolve.

You don't need to coordinate with either; just apply the brief's Revision 3 rules consistently and the seams will line up.

## A small note on what was already excellent

Your audit format (the full bucket-reference list + per-lemma aspect breakdown + notes on conventions used) is exactly the kind of transparency that makes review possible. If subsequent revisions can keep producing the same shape of audit alongside the content files, the review loop gets very quick. The notes array in particular caught two of the three issues above (you flagged the multi-word colour underscoring and the participle-points-at-infinitive choice) without us having to dig through the JSON. Worth keeping as a pattern.
