# Linguics marker repair and output compaction

Date: 2026-08-21  
Author: Codex (OpenAI)

## Outcome

I took over the translation-marker repair described in `OUTSIDE_VIEW_the_marking_problem.md` and the surrounding decision history.

The main architectural change is now implemented: the model can return a compact internal response, while the worker deterministically expands it into the same browser-facing result Linguics already uses. Learner-visible outputs have not been removed. Repeated and derivable model output has been removed from the paid generation path.

The compact contract and lossless expansion are implemented and remain selectable in the marker bench and reproducible Node runner. They are not the learner-path default yet: the live default was returned to the better-validated legacy contract after the paid r176 probe found that compact had not reached quality parity. Housing remains client r175. The sequence is r175 initial compact, r176 compatibility/prompt repair, then `2026-08-21-r177-legacy-default` as the safe production setting.

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
- 29 compact-contract tests;
- 41 expectation-suite tests;
- all 18 checked-in cases confirmed fireable through the actual client context and worker legend;
- 10 offline paid-runner/capability-gate tests with zero fetches;
- 2 suite-report accounting/provenance tests;
- `git diff --check` (only the repository's existing LF-to-CRLF notices).

`npm ci` installed the locked ignored Worker development dependencies so the real compiler could run. NPM reported 2 moderate and 4 high advisories in that locked dependency tree. I did not run `npm audit fix --force`, because that would make unrelated breaking dependency changes.

## First live paid A/B: r175

Commit `f0edeee` was pushed on branch `codex/marker-compact-v2`. Worker r175 was deployed to `https://linguics-marker.psmitheroo.workers.dev` as Cloudflare version `328a2bfc-3bab-4949-927a-74d052b6d773`.

The reproducible runner then made 36 GPT-4o-mini calls: all 18 cases under both contracts, temperature 0, fixed seed, lean context, no retries. Exact raw requests, provider responses, diagnostics, usage, costs and judgements are retained in `outputs/marker_paid_ab_2026-08-21_r175_gpt4o-mini.json`.

| Measurement | compact_v2 | legacy_v1 |
| --- | ---: | ---: |
| Calls | 18 | 18 |
| Usable Worker results | 0 | 16 |
| Output tokens | 5,917 | 11,997 |
| Input tokens | 83,278 | 93,184 |
| Recorded cost | $0.0160419 | $0.0211758 |
| Mean latency | 11.518 s | 17.224 s |

Total recorded spend was $0.0372177. Every provider response finished normally with `finish_reason=stop`; none was truncated. Compact output reduced generated tokens by 50.68%, recorded cost by 24.24%, and mean latency by 33.13%. It was shorter and cheaper on 17 of 18 pairs. Output-token savings produced 71.1% of the dollar saving because the recorded output rate was four times the input rate.

However, all 18 compact results were rejected by r175's strict schema. The prompt still contained legacy instructions to copy full bucket ids while the compact schema required numeric aliases. Seventeen calls followed those contradictory full-id instructions; one call supplied neither evidence nor an expected form for a miss. This is a serialization failure, not evidence that the compact shape cannot carry the result, and the paid errors remain in the cost total rather than disappearing.

Offline replay through the safe r176 compatibility normalizer hydrates 16 of the 18 saved compact responses. It accepts only exact supplied ids or the already-sanctioned Italian-production vocabulary form, drops only semantically empty non-required blanks, and normalizes `0/0` to `0/null`. It continues to reject the evidence-less miss and a result missing a mandatory required skill. That boundary deliberately avoids inventing learner evidence or marks.

R176 also removes the contradictory compact vocabulary prose, adds the continuous learner attempt alongside its evidence-token table, keeps compact request JSON minified, gives a numeric-alias example, and retains strict requirements for evidence and mandatory skills. The paid runner now supports `--cases ID1,ID2` so a small paired confirmation can precede another full sweep without changing either arm's settings.

## Focused paid confirmation: r176

Worker r176 was deployed as Cloudflare version `0ca142cb-6bf5-4d3a-aae0-33bc84ffe6a4`. A six-case paired probe then made 12 more GPT-4o-mini calls and retained them in `outputs/marker_paid_ab_2026-08-21_r176_probe.json`.

| Measurement | compact_v2 | legacy_v1 |
| --- | ---: | ---: |
| Calls | 6 | 6 |
| Pass / fail / manual / call error | 1 / 3 / 1 / 1 | 3 / 2 / 1 / 0 |
| Input tokens | 26,657 | 31,693 |
| Output tokens | 1,732 | 3,608 |
| Recorded cost | $0.00503775 | $0.00691875 |
| Mean latency | 4.236 s | 8.000 s |

The probe cost $0.0119565. Compact reduced output tokens by 52.0%, recorded cost by 27.2%, and mean latency by 47.1%. The serialization repair worked: five of six compact responses hydrated, versus zero of eighteen in r175. `breadth_01` passed under both contracts and `alternative_01` reached the same intentionally manual status under both.

Compact nevertheless remained worse on this sample. In `false_pos_lemma_01` it emitted invented out-of-range evidence indices across a broad 25-alias context, which the Worker correctly rejected rather than fabricating evidence. In `direction_01` its prose and markpoints said “not attempted” but its holistic attempted flag contradicted them. The two contracts shared semantic failures in the spelling and vocabulary-versus-agreement cases; those are not serialization savings.

Therefore r177 keeps all compact code and outputs but restores `legacy_v1` as the default for normal learner calls. `compact_v2` must be requested explicitly for controlled experiments until a larger run demonstrates quality parity. This avoids treating learners as the experiment while preserving the measured path to lower output cost.

## Files deliberately left alone

- The historical `DECISIONS.md` was not rewritten to claim work after the fact.
- The user's existing uncommitted GPT-4o-mini default change was preserved and built upon.
- `OUTSIDE_VIEW_the_marking_problem.md` and the pre-existing expectation-case backup were not modified.
- The r175 paid artifact is retained verbatim, including failed raw outputs and their billed usage; it was not rewritten after r176 learned to normalize safe formatting variants.

— Codex (OpenAI), 2026-08-21
