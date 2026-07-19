# Coverage: gerund, USAGE branch (adverbial gerund)

**Dispatch:** DISPATCH_usage_wave2.md — GerundioAuthor, `verb_form.gerundio.usage`, 2 leaves. (The formation branch was a separate earlier dispatch; the progressive-vs-simple discrimination belongs to `tense_choice`.)
**Author:** GerundioAuthor
**Date:** 2026-07-18
**Brief revision applied:** AUTHOR_BRIEF Rev 27 (read from disk).

**Totals:** 16 grammar questions (13 short-answer + 3 MCQ) and 12 translation items (7 EN→IT, 5 IT→EN). The two leaves get 8 grammar items each; translation is bidirectional because the `.usage` node is `direction: bidirectional` (unlike formation, which is production-only).

**Bucket status:** the two leaves this dispatch names — `.usage.modal_means` and `.usage.temporal_causal` — are **not yet on disk** (only the `.usage` aggregate is). I proposed them in `bucket_suggestions_verb_form.gerundio.usage.json` and authored against the ids. They need minting and destubbing on acceptance; the ask is in the delivery thread.

---

## Coverage by leaf

| G items | G markpoints | T required | Leaf | What it teaches |
|--:|--:|--:|---|---|
| 8 | 8 | 5 | Adverbial gerund: manner / means (B1) | HOW / BY WHAT MEANS (sbagliando s'impara, è entrato correndo); the means-vs-purpose contrast (gerund, not per + infinitive); the same-subject constraint |
| 8 | 8 | 7 | Adverbial gerund: time / cause / condition (B2) | gerund heading a subordinate of time (tornando), cause (essendo tardi), condition (volendo), concession (pur essendo); the compound gerund for anteriority; the same-subject constraint |

One extra grammar markpoint and one extra translation required-bucket land on `verb_form.gerundio.formation.gerundio_passato` — the genuine cross-credit, see below.

**CEFR spread:** grammar 6×B1, 8×B2, 2×C1; translation 4×B1, 7×B2, 1×C1. Manner/means is the B1 core; the subordinating gerund and the concessive pur are B2-C1.

---

## The same-subject constraint is the headline diagnostic

The `.usage` node's own description names it: the gerund's implicit subject must be the main clause's subject, so *vedendo Maria, l'ho salutata* means I saw her, not she saw me. This is the single thing the adverbial gerund adds over formation, and formation never touches it. It is tested three ways:

- **Two same-subject MCQs** (`ger_use_mm_samesubj_01`, `ger_use_tc_samesubj_01`) where the two subjects DIFFER, so the gerund is wrong and a full clause is right. The distractors are the bare gerund and the compound gerund, both violating the rule; the correct answer is the mentre/quando clause. Index-scored, verified against an engine port.
- **One translation item** (`trans_ger_en_it_use_tc_samesubj_01`, "While I was cooking, the phone rang") whose correct answer is deliberately NOT a gerund, with the gerund rendering as a `polarity: negative` anti-anchor.
- Every production explanation states the same-subject fact for the sentence in hand.

Testing when NOT to use the gerund is a legitimate usage diagnostic, not a gap; flagged here so it is not read as off-topic.

---

## Rev 27 cross-crediting: the overlap is with FORMATION, not tense_choice

The dispatch's headline rule (a usage leaf teaches its function but does not monopolise credit; where an item evidences a usage function AND a tense_choice contrast, credit both). **For the adverbial gerund there is no tense_choice contrast partner.** `tense_choice.progressive_vs_simple` owns *stare* + gerund vs the simple tense; the adverbial gerund is a different construction, and there is no registered "gerund vs explicit subordinate clause" tense_choice bucket. So no usage↔tense_choice co-credit arises here — Rev 27 says overlap is a feature where it exists, not that it must be manufactured.

The genuine overlap is **usage↔formation**: a `.temporal_causal` item built on the compound gerund (avendo finito) evidences both the usage function (a gerund heading a subordinate of prior time) and the compound form. Two items apply the ratified dual-citation pattern (two markpoints at `credit: 0.5`, identical anchored phrase, one on `.usage.temporal_causal` and one on `.formation.gerundio_passato`): the grammar item `ger_use_tc_avendo_finito_01` and the translation item `trans_ger_en_it_use_tc_03`. Verified: producing "avendo finito" scores item marks 1/1 and a full hit on BOTH buckets; the simple-gerund error "finendo" scores 0 on both.

---

## Boundaries held

- **No progressive items.** Every item is the bare adverbial gerund; none uses stare + gerund. That construction is formation (assembly) and, for the choice, `tense_choice`.
- **No formation re-authoring.** Production items cue the infinitive (the honest operand) and the context establishes the FUNCTION; the diagnostic is "use the gerund for this adverbial meaning / respect the same-subject rule", not "build the -ando/-endo form", which the formation batch owns.
- **Compound gerund** is cross-credited, not re-taught: the two dual-cite items reuse the formation leaf rather than adding new formation coverage.

---

## Criterion compliance

- **Criterion 17 (gloss):** every grammar explanation opens with the completed sentence and its English translation (MCQ explanations gloss the correct choice).
- **Criterion 18 (anchoring):** every single-form phrase carries `match_at: "word"` on both `any_phrases` and `must_not_include`, including the MCQ option fragments. Verified no phrase self-flags and no distractor is positively credited.
- **Criteria 13 / 26 (chips):** production cues name only the operand infinitive, e.g. `(tornare)`. Where a construction marker is needed (pur for concession, non for negation) it is supplied in the PROMPT as the trigger, not named as the diagnostic.
- **Criterion 20 / Rev 25 (cue by meaning / level):** cues are citation infinitives at or below each item's level (tornare, essere, sapere, volere, arrivare, ...), the exempt citation-form trigger. The bracketed English adverbial meaning (`[while coming home]`) is added to fix WHICH function is intended without naming the rule — it pins meaning, criterion-20 style, rather than handing over a bare Italian answer-fragment.

---

## Items flagged uncertain (for the project author)

1. **The two leaves need minting.** Authored against `verb_form.gerundio.usage.modal_means` and `.temporal_causal`, which do not exist on disk yet (dispatch says stub-until-items-land). Ask in the thread.
2. **`sorridere` participle agreement in `trans_ger_en_it_use_mm_02`.** I gave both `ci ha salutati` (agreeing) and `ci ha salutato` (invariable) as neutral references; agreement with a preceding ci under avere is optional. Confirm you are happy accepting both, or tell me to pin one.
3. **Absolute gerund deliberately excluded.** The literary absolute gerund with its OWN expressed subject (*sorgendo il sole, partimmo*) is C1-C2 and contradicts the same-subject rule I teach at B2. I kept it out entirely rather than teach a rule and its literary exception in the same batch. Flag if you want a single C2 item introducing it, or a `usage.absolute` leaf proposed.
4. **`pur essendo` is filed under `.temporal_causal`.** Concession is arguably its own function, but the dispatch names only two leaves and concession rides naturally with cause/condition (same pur/gerund machinery). Did not propose a third leaf; say if you want one.

---

## Notes for later work

- **Glossary:** one term proposed, **adverbial gerund** (the bare gerund as adverbial subordinator, with the same-subject constraint). It is the fourth distinct gerund sense after `gerund` (exists), `progressive` and `compound gerund` (proposed with the formation batch).
- **My earlier open thread** `Architecture_GerundioAuthor_selfcheck_discharge.md` is still awaiting Architecture (three stamps + the porre/tradurre ruling from the formation batch); unrelated to this usage delivery but noted so the seat's two open threads are both visible.
