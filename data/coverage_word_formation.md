# Coverage: Word formation (`word_formation`, topic_short `wf`)

Author: WordFormationAuthor. Dispatch: `DISPATCH_word_formation.md`. Brief: Rev 20 (authored at Rev 16, reconciled Rev 17/18/19, Rev 20 verified a no-op here).
Second pass delivered 2026-07-15. Batch ACCEPTED at thread v1; all six asks ruled at thread v5, thread CLOSED.

**Thread (the channel, per Rev 18): `inter_chat/Architecture_WordFormationAuthor_batch_disposition.md` (v6, CLOSED).** The sections below are the record.

Outputs: `grammar_questions_word_formation.json` (39), `translation_items_word_formation.json` (11), `glossary_suggestions_word_formation.json` (6 terms, all MERGED into glossary v6), `bucket_suggestions_word_formation.json` (1, RATIFIED).

## Bucket-to-item counts

| Bucket (friendly label) | CEFR at target | Grammar | Translation |
|---|---|---:|---:|
| Diminutives (-ino/-etto/-ello/-uccio, and -otto) | B2 core | 7 | 2 |
| Augmentative & pejorative (-one/-accio) | B2 core | 4 | 2 |
| -one gender shift (la porta, il portone) | B2 core | 2 | 1 |
| Falsi alterati | C1 core | 16 | 2 |
| Prefix intensifiers (stra-/arci-/super-/ultra-) | B2 core | 5 | 2 |
| Neo- / ex- | C1 core | 5 | 2 |
| Relational adjectives | (stub, ruled to stay) | — | — |
| **Total** | | **39** | **11** |

Rendering: 18 `short` (production) + 21 `mcq` (closed two-label choices). 24 items suppressed, 3 carry `candidate_forms`.

## Second pass (approved at thread v5)

- **`-otto`**: one item, `wf_dim_07` (passero > passerotto), teaching -otto's young-animal sense (aquilotto, leprotto). Clean non-lexicalised bases are thin, so one suffices as ruled.
- **Four reserve falsi**: postino (postman, agentive -ino not a small posto), rossetto (lipstick), mulino (mill, not a small mulo), matterello (rolling pin, sibling of mattino).
- **Four balancing real alterati (author's call, flagged at v6)**: casetta, nasone, manina, pesciolino. Adding the four approved falsi alone would have taken the leaf to 10 independent : 2 real, i.e. 83% "independent", so a learner could autopilot one answer and still score 83%. The leaf now runs **10 independent : 6 real (62%)**, which keeps the classification a real discrimination.
- **`relational_adjectives` stays a stub** per the ruling; its scoping against the adjective topic is parked in OPEN_QUESTIONS as a future-seat ask and is not filled from this seat.

## Rulings applied (thread v5)

- **candidate_forms on verdict items: NO.** The field carries alternatives that ARE the answer content; verdict labels are meta-judgements and a tick reading "sì / no" is noise. The 13 verdict items therefore carry none. The 3 meaning-pair items (`wf_dim_03` affetto/statura, `wf_dim_05` oggetto preciso/piccolo cucchiaio, `wf_pej_03` si comporta male/molto grande) keep candidate_forms + correct_form + suppress under the noun precedent.
- **MCQ where the stats matter.** The falsi set and the other verdict items are converted to `mcq` (index-scored, markpoint retained for bucket attribution, suppress kept because the criterion-15 breadcrumb leak is unaffected by rendering). Production items stay `short`, where typing the form is the honest work.
- **gender_shift RATIFIED** and registered; `wf_aug_02`, `wf_aug_03` and `trans_wf_en_it_aug_01` retargeted centrally by Architecture.
- **tavolino confirmed vero alterato**; **montone confirmed falso**.

## Marker safety

- Marker replica (strict any_phrases -> accent-folded rescue -> must_not strict, per grammar_engine.js order): **39/39 accepted answers score, 55/55 guards reachable, 0 dead.** Agrees with the canonical gate's independent finding of 0 dead for word_formation.
- **Two dead guards were found and fixed in this topic, and they were a live false-credit bug.** `wf_aug_02`/`wf_aug_03` carried the bare augmentative (`portone`, `macchinone`) alongside the full answer, so "la portone" (the exact common_miss) matched the positive, was credited full marks, and the guard never fired: the gender-shift test was silently deleted. Bare forms dropped; the article is now required.
- **The distinction that matters** (now criterion 18's fourth direction): where a wrong attempt EXTENDS a word (`dal` inside `dallo`) match_at "word" blocks it and the guard is alive; where it ADDS a word (`portone` inside "la portone") the correct string sits at clean boundaries inside the wrong one and no anchoring can save it.
- Crit-18 re-run WITH accent folding: CLEAN 0/0. Crit 19 a no-op (`sì` was the only accented phrase and is a guard, not an answer; now an MCQ choice).
- Rev 19/20 recoverability: all suppressed items are closed choices whose options are on screen, so the candidate set is recoverable and suppression stands.
- Rev 20 verified a no-op here: (i) no graded credits in the batch so the dodge-precedence rule does not bite; (ii) frame-forced recoverability not needed (options are explicit); (iii) no instruction-pinned guards remain after the MCQ conversion; §3 brackets unused.

## Notes for the next dispatch

- Deliberately omitted borderline falsi are now exhausted (postino, rossetto, mulino, matterello all used). Further falsi volume would need new candidates.
- `relational_adjectives` remains the one unscoped part of this tree, parked by ruling.
