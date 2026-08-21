# Linguics marker repair and output compaction

Date: 2026-08-21  
Author: Codex (OpenAI)

## Outcome

I took over the translation-marker repair described in `OUTSIDE_VIEW_the_marking_problem.md` and the surrounding decision history.

The main architectural change is now implemented: the model can return a compact internal response, while the worker deterministically expands it into the same browser-facing result Linguics already uses. Learner-visible outputs have not been removed. Repeated and derivable model output has been removed from the paid generation path.

The compact contract is the worker default. The legacy verbose contract remains selectable in the marker bench and the reproducible Node runner as a control arm. Build identifiers and every housing cache key are synchronised at client r175 / worker `2026-08-21-r175-compact-v2`.

## Which decision log is authoritative

I compared:

- `C:\Claude (not on Gdrive, nor OneDrive)\Linguics\DECISIONS.md`
- `C:\Users\patri\OneDrive\Documents\Claude\Projects\Language Learning\DECISIONS.md`

The OneDrive file is an older May snapshot. Its contents are preserved verbatim at the beginning of the much larger Linguics file; the Linguics copy has 2,974 later lines and no deleted shared lines. The supplied file therefore changes none of the conclusions. The Linguics workspace copy is authoritative.

Important current rules applied here include: binary attempted credit in v1; attempted and correctness kept separate; required versus expected as a safety split; expected buckets judged only when engaged; one accent-blind score followed by one 0.9 answer multiplier; every visible accent slip named; proper nouns excluded from vocabulary credit; and genuine off-tree observations shown quietly without reducing marks.

## What was actually known about cost

There was no saved field-by-field output-token trace, so no honest historical answer existed to “which output field is most expensive?”. The bench discarded raw model output and per-call token details from suite records.

The one direct latency trace did show that total generated output matters greatly:

- 304 output tokens: 4.8 seconds
- 559 output tokens: 12.3 seconds
- 599 output tokens: 27.6 seconds
- 852 output tokens: 57.8 seconds

That evidence supports reducing generated breadth/repetition. It does not prove that any single prose field was the largest cost.

The largest obvious removable block was the repeated markpoint structure: full bucket id, label, two credits, categorical outcome, evidence quotation, expected correction and proposal flag, repeated roughly thirteen times. Several of those fields were already derivable locally.

## Compact model contract

Implemented in `worker/src/marker_contract.ts` and wired through `worker/src/index.ts`.

The model now returns compact v2 tuples:

- numeric aliases instead of repeated full bucket ids;
- binary attempted credit and correctness credit only;
- token-index evidence spans instead of re-quoting the learner;
- expected correction only when useful;
- compact unattributable observations, proposals and notes;
- one overall score/summary/explanation block.

The worker restores:

- full bucket ids;
- canonical labels;
- `outcome`, derived from attempted/correctness;
- exact evidence text sliced from the authoritative learner answer;
- `marks_possible: 1`;
- authoritative `raw_response`;
- proposal fields;
- both `note.text` and the legacy renderer-compatible `note.note`.

Required aliases must occur exactly once. Expected, optional and context aliases are emitted only when engaged. Dynamic `v:<lemma>` vocabulary is legal only for Italian production (`en_it`). Credits, evidence spans, proposals and public results are strictly validated. An invalid compact response is never silently reinterpreted as legacy and never triggers a second paid call.

The public response remains additive/backward compatible. The bench can force `compact_v2` or `legacy_v1` for a lossless comparison.

## Benchmark repairs

The old headline “15/18” result must not be used as the present model ceiling.

The sweep ran before ten broken POS-qualified expectation ids were repaired. Its three shared failures were then stored in a report generated from the old browser rollups; there is no evidence of a rerun after the repairs. One of those cases also asked for `progetto` while the item fire-list contained `progettare`, making the expected answer impossible for a fire-list-bound marker.

Repairs made:

- `marker_expectation_cases.json` is now version 2 with 18 stable `case_id` values.
- Ignored free-text `expect_rules` were converted into executable predicates.
- Eleven genuinely non-mechanical assertions are explicitly `manual_review`; every case carrying `needs_ruling` is excluded from the automatic pass denominator rather than masquerading as settled policy.
- Case preflight rejects broken versions, missing/duplicate ids, zero assertions, invalid predicates, noncanonical positive ids, absent-reason drift and non-fireable positive expectations before any model spend.
- The `progetto` item fire-list now uses `vocabulary.it.progetto.noun.translation.active`; whether `projetto` is partial vocabulary credit or a clean vocabulary hit plus an orthography event remains an explicit manual review.
- The rescued imperfect item now carries `vocabulary.it.di_fila.adverb.translation.passive` instead of the bad `filo` derivation. Its unsettled `could`, `di fila`, and double-attribution decisions are manual rather than hard-coded scores.
- The 17 confirmed phantom `vocabulary.it.anna.verb...` fire-list entries were removed; Anna is a proper noun, not a verb vocabulary event.
- The bench now sets the same shared bucket index as the live app. Previously it silently dropped IT-to-English recognition grammar and therefore did not exercise the production path.
- The bench now indexes vocabulary and canonicalises returned vocabulary ids exactly as the live app does, while retaining both the provider/worker result and the canonical judged result.
- Suite records retain input/output tokens, recorded cost, paid error details, raw model output when diagnostics are requested, worker build, contract, prompt hash, context hash, case-set hash and item-snapshot hash.
- Paid truncation/schema failures retain usage and cost instead of making failed models appear free.
- Manual, broken-case and call-error statuses are separate from the automatic pass/fail denominator.
- The HTML suite report now accepts exported raw sweeps, includes paid failures in recorded cost, names unknown-cost calls, avoids a hard-coded denominator and does not merge provenance-distinct runs.
- Exact negative expectations are canonicalised before matching, so a bare forbidden vocabulary id cannot miss the POS-qualified id returned by the live path.
- Literal `\\u....` text in three learner answers was repaired to real Unicode before the suite could send it to a model.
- `tools/run_marker_paid_ab.mjs` materialises a deterministic, counterbalanced 36-call compact/legacy plan, checkpoints every raw response and refuses all paid calls unless a free health GET reports the exact expected worker build and both contracts.

## Output retention and UI fixes

The following previously paid-for outputs were not being consumed or retained correctly:

- The worker asked for notes as `{kind,text}`, while the UI read `note`; notes rendered blank.
- Translation `overall.explanation` was rendered twice.
- Markpoint `expected` was displayed transiently but dropped from stored events.
- Notes and unattributable observations were not both carried through Pulse.

These are repaired additively in `housing/js/app.js`, `housing/js/store.js` and `housing/js/pulse.js`. Older attempts remain readable. The estate/Pulse receiver must accept the new `unattributable_json` and `notes_json` columns/keys before relying on those two fields remotely.

## Provenance and failure accounting

The worker now reports its build, requested contract, prompt SHA-256, output cap, finish reasons and provider usage on successful calls. Once OpenRouter has returned a JSON envelope, the same accounting is attached to truncation, missing-content, malformed-JSON and schema-invalid errors. Cost is marked known only when the provider supplies both input and output token counts; missing usage and network/opaque upstream errors are explicitly unknown-cost rather than estimated or zero-cost.

Exact raw provider output is returned only when the bench requests diagnostics.

## Verification

`tools/preflight.py` now runs the existing client/HTML checks plus the new marker checks.

Passing verification on 2026-08-21:

- all client JavaScript syntax checks;
- all inline HTML script syntax checks;
- Worker esbuild bundle;
- Worker TypeScript type-check;
- 25 compact-contract tests;
- 41 expectation-suite tests;
- all 18 checked-in cases confirmed fireable through the actual client context and worker legend;
- 9 offline paid-runner/capability-gate tests with zero fetches;
- 2 suite-report accounting/provenance tests;
- `git diff --check` (only the repository's existing LF-to-CRLF notices).

`npm ci` installed the locked ignored Worker development dependencies so the real compiler could run. NPM reported 2 moderate and 4 high advisories in that locked dependency tree. I did not run `npm audit fix --force`, because that would make unrelated breaking dependency changes.

## What remains to measure

No new quality/cost claim should be made until the deployed worker is tested. The minimum useful next experiment is:

1. Deploy this worker build.
2. Run `node tools/run_marker_paid_ab.mjs --url <deployed-url> --out <artifact.json>`; it fixes GPT-4o-mini, lean mode, temperature 0, seed, cases and all settings except the contract arm.
3. Start with one counterbalanced repeat (36 calls); repeat only if the first result is too noisy to discriminate.
4. Compare automatic pass rate, manual count, truncations, output tokens, recorded cost, latency and exact-evidence validity.
5. Keep the output cap at 6,000 for this first comparison; lower it only after compact output length is observed.

The fixed 18-case suite is suitable for this A/B because all currently unresolved policy questions are explicitly manual rather than automatic. A manual case can still record a definite automatic failure, but it cannot inflate the pass denominator. These questions should be ruled deliberately, not optimised around as if an old model score settled them.

## Files deliberately left alone

- The historical `DECISIONS.md` was not rewritten to claim work after the fact.
- The user's existing uncommitted GPT-4o-mini default change was preserved and built upon.
- `OUTSIDE_VIEW_the_marking_problem.md` and the pre-existing expectation-case backup were not modified.
- At the time this implementation note was prepared, deployment and the live paid A/B had not yet run. Their exact branch, worker health, spend and result artifact will be appended after execution.

— Codex (OpenAI), 2026-08-21
