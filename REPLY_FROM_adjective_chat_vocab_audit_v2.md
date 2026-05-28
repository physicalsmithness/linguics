# Reply (v2): vocab_help audit revision — adjective_agreement

Date: 2026-05-15
From: adjective_agreement authoring chat
Re: `REPLY_TO_adjective_chat_vocab_audit.md` (architect's reply to v1 audit)

All three actions from your reply are done. The regenerated audit is at `data/vocab_bucket_references_adjective_agreement.json` (v2 stamp in `generated` and `notes`). Summary of the changes plus one deliberate omission with rationale.

## Action 1 — Diacritics restored in lemma keys

Two bucket keys renamed:

- `vocabulary.it.citta.translation` → `vocabulary.it.città.translation`
- `vocabulary.it.citta.gender` → `vocabulary.it.città.gender`
- `vocabulary.it.opportunita.translation` → `vocabulary.it.opportunità.translation`
- `vocabulary.it.opportunita.gender` → `vocabulary.it.opportunità.gender`

The reveal text already carried the accent in both cases (`città - city`, `opportunità - opportunity`), so only the bucket strings needed change.

I audited the rest of the batch for other accent-bearing lemmas. The candidates I checked — `caffè`, `perché`, `però`, `così`, `più`, `può`, `gioventù`, `università`, `libertà`, `novità`, `possibilità`, `attività`, `qualità` — none appear in this batch's prompts or vocab_help. So the only two diacritic fixes were the ones you named.

## Action 2 — Aspect coverage normalised

The five lemmas you flagged:

| Lemma | Was | Now |
|---|---|---|
| cantina (f) | translation only | translation + gender |
| cestino (m) | translation only | translation + gender |
| vetrina (f) | translation only | translation + gender |
| cugino (m) | translation only (in audit, via cross-pointer on cugina) | removed from audit |
| cugina (f) | gender only (in audit, due to cross-pointer) | translation + gender (both own buckets) |

The cugina/cugino entry in `adj_o_f_pl_05` had a quirk: cugina's translation bucket was cross-pointing at `cugino.translation`, presumably as a "lemma family" cue. That cross-pointer was the source of the asymmetry your audit caught: my audit script extracted lemmas from bucket names, so cugina looked like it had only gender (its own) while cugino looked like it had only translation (cugina's cross-pointer). Removing the cross-pointer cleans both up: cugina now has translation + gender, each at its own bucket. Cugino has no entries because the noun cugino doesn't appear in any item in this batch — only the f.pl `cugine` does, with the reveal text mentioning the m form for context.

I audited the remaining noun lemmas in the batch (going through the per_lemma_aspects list and checking which were nouns vs adjectives/verbs). The only single-aspect noun I deliberately left as single-aspect is **rinascimento** (see below).

## Action 3 — Proper-noun key lowercased

`vocabulary.it.Rinascimento.translation` → `vocabulary.it.rinascimento.translation`

Reveal text unchanged (`Rinascimento - Renaissance`). The matcher is case-insensitive per your note, so the clickable-word match against the prompt's capitalised `Rinascimento` still works.

Audited for other proper nouns. The batch has a handful of names embedded in prompts (Marco, Maria, Carlo, Luigi, Anna, Antonio, Giulia, Stefano, Dante, Leonardo, Garibaldi, Roma, Atene, Nord Italia) but none of them are vocab_help'd as lemmas. So the only fix was Rinascimento.

## Deliberate single-aspect entry

**rinascimento** (in `adj_pos_shift_grande_03`): translation only, no gender aspect.

Rationale: the prompt is "Leonardo era un ____ pittore del Rinascimento, ricordato da tutti." with `(grande)`. The agreement test is on pittore (m.sg, supplied via its own vocab_help). Rinascimento appears as the object of `del` (= di + il), so the article already exposes m.sg. Adding a `gender` aspect to rinascimento's vocab_help wouldn't expose anything the prompt doesn't already make visible, and the brief rule "include only aspects that are diagnostically meaningful AND that a learner at the target level might not know" applies. This is the only lemma where I made that judgment call deliberately rather than as an oversight; flagged in the audit's `notes` array as such.

If you'd prefer uniform aspect coverage regardless of diagnostic relevance, say the word and I'll add gender to rinascimento too.

## Numbers

| | v1 | v2 |
|---|---|---|
| Unique lemmas | 161 | 160 |
| Total bucket references | 260 | 263 |

The lemma count went down by 1 (cugino removed: no items use it directly). The reference count went up by 3 (cantina.gender, cestino.gender, vetrina.gender added; cugina.translation moved from cugino.translation; net +3).

## Files updated

- `data/grammar_questions_adjective_agreement.json` — bucket key changes on three vocab_help entries (citta→città, opportunita→opportunità, Rinascimento→rinascimento), plus cugina cross-pointer fix and cantina gender add.
- `data/translation_items_adjective_agreement.json` — gender aspect added to cestino and vetrina.
- `data/vocab_bucket_references_adjective_agreement.json` — regenerated, v2 stamp.

## Where this leaves us

All three actions complete. No remaining open items on the audit thread. The four conventions you ratified are now consistently applied across this batch; future authoring chats will follow them via Revision 3 of the brief.

If the v2 audit surfaces any other issues, please reply via the same channel. Otherwise the thread closes.
