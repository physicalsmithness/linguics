# Linguics marker compact-v3 and compact-v4 experiments

Date: 2026-08-22
Author: Codex (OpenAI)

## Purpose

The compact-v2 paid probes established a useful cost and latency reduction, but not quality parity with the legacy response contract. In particular, the model sometimes enumerated numeric bucket aliases and attached cyclic token-index spans rather than reasoning from the learner's answer.

This branch first tested the smallest high-upside correction while preserving every learner-facing output: compact v3 kept the compact tuple shape, but replaced token-index evidence with short exact substrings copied from the authoritative learner answer. The paid result showed that exact strings alone were not enough: GPT-4o-mini still copied a canonical bucket lemma into the evidence position.

Compact v4 therefore changes the representation rather than adding another prompt-only instruction. Its markpoints use evidence-first named fields and exact allow-listed bucket IDs, borrowing the separation that worked in the legacy control while retaining deterministic expansion of redundant learner-facing fields.

The learner-path default remains `legacy_v1`. Compact v3 and v4 are opt-in and experimental.

## Changes in r178

- Added the opt-in `compact_v3` response contract alongside `compact_v2` and `legacy_v1`.
- Removed the evidence-token table from v3 requests.
- Required each v3 evidence value to be an exact contiguous substring of `learner.attempt`.
- Instructed the model to build markpoints from learner evidence rather than enumerating the bucket legend.
- Preserved the legitimate omitted-form exception: an engaged miss may carry null evidence only when it supplies the expected correction.
- Kept strict rejection for invented evidence; there is no clamping, modulo arithmetic, fuzzy matching, or silent evidence repair.
- Added a neutral `parlo` serialization example so the probe is not taught the decisive `facevo` answer from `false_pos_lemma_01`.
- Added a targeted wrong-language rule and a deterministic holistic consistency check. A wholly unengaged answer must have zero marks, zero attempted credit, and zero correctness; contradictory model output is rejected.
- Removed the phantom `marcare` vocabulary candidate derived from the proper noun `Marco`, and added a benchmark assertion that `vocabulary.it.marcare.*` must not fire.
- Updated the reproducible paid runner to target Worker build `2026-08-22-r178-compact-v3-exp` and compare v3 with the unchanged learner default.

## Safety and acceptance gates

The first paid gate is deliberately small: `false_pos_lemma_01` and `direction_01`, one call in compact v3 and one in legacy for each case (four calls total).

Compact v3 must satisfy all of the following before the probe expands:

- HTTP success with `marker_format_used: compact_v3`.
- No schema/contract error.
- The false-positive case returns the required tense discrimination hit and no `orecchio`, `proprio`, `marco`, or `marcare` bucket.
- Every evidence string in that broad case genuinely supports its bucket; exact substring membership alone is not treated as semantic proof.
- The wrong-language case returns all three holistic scores as zero and no hit, miss, or partial markpoint.

If the smoke gate passes, the next comparison will use repeated calls and explicit evidence checks. Legacy remains the learner default until compact v3 reaches semantic parity with zero schema failures. Cost and latency are secondary gates.

## Offline verification before deployment

The full `tools/preflight.py` run passed on 2026-08-22:

- Worker contract tests: 33 passed.
- Worker TypeScript type-check: passed.
- Expectation-suite tests: 41 passed.
- Corpus fireability: all 18 cases passed through the real context path.
- Paid-runner tests: 10 passed with zero fetch calls.
- Suite-report accounting tests: passed.
- Runner validation: 18 cases, 59 automatic assertions, 11 manual reviews, and lean contexts of 4 to 24 buckets.

## r178 paid smoke result

Artifact: `outputs/marker_paid_ab_2026-08-22_r178_v3_smoke.json`

The four-call smoke completed with a fully known recorded cost of `$0.004011`:

- Legacy passed both controls.
- Compact v3 returned valid, complete JSON in both cases, but strict Worker validation rejected both calls.
- `false_pos_lemma_01` no longer enumerated the 24-row legend. It selected eight relevant skills, avoided the forbidden `orecchio`, `proprio`, `marco`, and `marcare` buckets, and correctly hit the required tense-discrimination bucket. One vocabulary row cited the dictionary lemma `incontrare` instead of the learner's written surface form `incontrato`, so the exact-substring gate rejected it.
- `direction_01` correctly emitted holistic `[0,0,0]` and all required rows as unattempted, but also emitted a descriptive unattributable observation. Because that observation asserts engagement while the holistic score says none, the consistency gate rejected it.

The smoke therefore failed its zero-schema-error gate and the larger paid probe was not started. The failures were retained rather than repaired or hidden.

## r179 narrow smoke corrections

Worker build `2026-08-22-r179-compact-v3-smoke-fix` makes two prompt-only corrections supported by the retained r178 bytes:

- Evidence must cite the learner's written surface form, never substitute a dictionary lemma. The neutral example is `parlato`, not a probe answer.
- A wholly wrong-language response must keep `u`, `p`, and `n` empty as well as returning holistic zeroes and unattempted required rows.

No validator was loosened. Legacy remains the default while the identical four-call gate is repeated.

## r179 paid smoke result and the r180 stop decision

Artifact: `outputs/marker_paid_ab_2026-08-22_r179_v3_smoke.json`

The repeated four-call gate recorded `$0.0038505` with all costs known:

- The wrong-language compact call passed. It returned holistic `[0,0,0]`, only unattempted required markpoints, and empty observation/proposal/note arrays.
- The broad compact call again chose eight relevant skills, avoided every forbidden bucket, and attached sensible learner substrings to seven of them.
- The same vocabulary row again copied `incontrare` from the bucket lemma instead of citing the learner's written `incontrato`. Strict validation rejected the call.
- Both legacy controls passed.

Worker build `2026-08-22-r180-compact-v3-vocab-evidence` added one final neutral worked JSON example: a `parlare` bucket over learner text `ho parlato` must cite `parlato`, never the dictionary lemma. It was deployed, but no paid r180 call was made. Re-analysis showed that r178 and r179 had produced the same 203-token compact completion despite the added instruction, and that the model was systematically copying canonical legend values into positional tuple fields. Another wording-only call was not sufficiently discriminating to justify spending money.

No validator was weakened and no invalid paid result was silently repaired. Compact-v3 prompt iteration stopped.

## r181 compact-v4 legacy-lite candidate

Compact v4 changes only the model-facing representation. The Worker continues to expand it into the existing public result and therefore preserves the learner-visible outputs.

- Each model markpoint is an evidence-first named object: `evidence`, `bucket`, `attempted`, `correctness`, and optional `expected`.
- Supplied skills use their exact allow-listed full bucket IDs. A narrowly sanctioned dynamic vocabulary ID remains available only for a genuinely unlisted Italian production word.
- Evidence remains an exact, case-sensitive Unicode substring of the learner answer. There is no lower-casing, lemmatisation, fuzzy matching, clamping, modulo arithmetic, or silent repair.
- A hit may retain `expected` when that carries a useful canonical lemma; this preserves an existing output without confusing it with learner evidence.
- Null evidence is accepted only for an unattempted required row or an engaged omitted-form miss with an expected correction. Hits and partials cannot evade the evidence rule by supplying a lemma in `expected`.
- V4 rejects serialized blank expected/optional/context rows instead of discarding unchecked fields. If no skill or observation is engaged, notes must be empty even when the model supplied a contradictory positive attempted score that the Worker can otherwise normalise.
- A wholly wrong-language response may return an empty model markpoint array with all holistic values zero; the Worker adds required not-attempted rows deterministically.
- Labels, outcomes, marks possible, raw response, and proposal flags are still derived by the Worker rather than paid for repeatedly in model output.
- `legacy_v1` remains the production default. V4 is available only through an explicit request contract.

The benchmark now has an executable `evidence_one_of` predicate. Ten checks across five existing cases require the returned evidence to equal one of a small, explicitly accepted set, rather than merely containing a token. The decisive smoke case now requires the `ieri` and `incontrare` vocabulary hits with evidence `Ieri` and either `incontrato` or `ho incontrato`; quoting the whole answer, another valid answer token, or the canonical lemma `incontrare` fails. Other checks cover unambiguous evidence such as `mangiato`, `azzurra`, `nuove`, `settimana`, and `di`/`smesso di`.

Two proposed evidence checks were deliberately removed because they would have encoded an ambiguous attribution: a gerund omission can legitimately use null evidence plus the expected gerund, and the tense-choice bucket can be evidenced by either side of the imperfect/passato-prossimo contrast. The stale `nuove` vocabulary expectation was corrected from miss to hit in line with the settled rule that lexical choice and inflection are independent; the separate masculine-singular agreement miss is now asserted explicitly over the same surface evidence.

The paid runner now compares `compact_v4` with `legacy_v1`, verifies the exact r181 Worker build through a cache-busted health request and again on every call, preserves raw responses and usage, makes no retries, and checkpoints after every returned call. An HTTP-success response is still a call error unless both `response_contract_requested` and `marker_format_used` exactly match its experimental arm; any provenance mismatch is stored and printed rather than silently counted as a semantic pass.

## r181 offline release gate

The complete preflight passed before any r181 deployment or spend:

- Worker contract tests: 36 passed.
- Worker TypeScript type-check: passed.
- Expectation-suite tests: 44 passed.
- Executable benchmark assertions: 72, with 11 separately identified manual reviews.
- Corpus fireability: all 18 cases passed through the real context path.
- Paid-runner tests: 12 passed with zero fetch calls.
- Suite-report accounting tests: passed.
- Lean contexts: 4 to 24 buckets.

The first paid r181 gate remains deliberately small: `false_pos_lemma_01` and `direction_01`, one v4 and one legacy call per case, four calls total and no retries. V4 must pass the strict schema, the existing semantic assertions, the new exact `Ieri` and `incontrato`/`ho incontrato` evidence assertions, and manual inspection of every remaining vocabulary evidence string before a larger repeated comparison is permitted.

## Related pull request

The already-proven benchmark, persistence, output-retention, and compact-v2 foundation is isolated in draft PR #1:

https://github.com/physicalsmithness/linguics/pull/1

— Codex (OpenAI)
