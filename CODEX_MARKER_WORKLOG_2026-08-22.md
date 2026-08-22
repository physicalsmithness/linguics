# Linguics marker compact-v3 experiment

Date: 2026-08-22
Author: Codex (OpenAI)

## Purpose

The compact-v2 paid probes established a useful cost and latency reduction, but not quality parity with the legacy response contract. In particular, the model sometimes enumerated numeric bucket aliases and attached cyclic token-index spans rather than reasoning from the learner's answer.

This branch tests the smallest high-upside correction while preserving every learner-facing output: compact v3 keeps the compact tuple shape, but replaces token-index evidence with short exact substrings copied from the authoritative learner answer. The Worker still expands the model response into the existing public result shape.

The learner-path default remains `legacy_v1`. Compact v3 is opt-in and experimental.

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

## Related pull request

The already-proven benchmark, persistence, output-retention, and compact-v2 foundation is isolated in draft PR #1:

https://github.com/physicalsmithness/linguics/pull/1

— Codex (OpenAI)
