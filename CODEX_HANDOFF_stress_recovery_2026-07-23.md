# CODEX handoff: stress pipeline recovery — 2026-07-23

## Outcome

The stress drill has been rebuilt around a release-blocking verification gate.
The generated deck now contains **12,446 questions** whose displayed syllable
boundaries and stress are verified, deduplicated, and non-ambiguous.

The reported regression is fixed:

- `pedofilia` → `["pe", "do", "fi", "li", "a"]`
- stress position → `2` (piana)
- correct rendered choice → `pedofi**li**a`
- explanation → stress falls on `li`

`tools/stress_pipeline/audit_generated_stress.py` passes with zero failures.
The original hand-authored seed also passes **58/58**.

## Why the previous 20,005-item deck went wrong

1. **The Wiktionary extract was keyed only by bare spelling and ignored POS.**
   Later entries overwrote earlier ones. For example, the verb-form
   `telefonino` (stress on `le`) overwrote the noun `telefonino` (stress on
   `ni`).
2. **The IPA parser did not treat `ˈ` as a syllable boundary.** In
   `/pe.do.fiˈli.a/`, it counted `fiˈli` as one segment. The stress ordinal
   could still be `2`, hiding the bad count.
3. **The local syllabifier merged ambiguous vowel sequences.** It had one
   explicit exception for `farmacia`, but no general solution for learned
   `-ia` hiatus. Thus `pedofilia` became `pe-do-fi-lia`.
4. **“High confidence” certified stress position, not the visible syllable
   split.** A matching ordinal number was allowed to “confirm” incompatible
   segmentations.
5. **The wordform model invented surface forms.** It chopped infinitives and
   appended endings, producing high-confidence items such as `essono`,
   `avono`, `andano`, `potono`, and `fano`. Of 4,545 modeled cells, 2,396 did
   not match the intended Morph-it lemma/form relation in the audit that
   prompted this recovery.
6. **Bare homographs were impossible questions.** Separate items for
   `capitano` could mean “captain” or “they happen” without context.
7. **Accent normalization was unsafe.** It conflated written-accent spellings
   (`sarà`, `realtà`, `menù`) with unaccented strings, and an inherited
   translation table mapped `ù→o` and `á→u`.
8. **The “bisdrucciole only exist at wordform level” conclusion was false.**
   Verified lemma examples include `farmaceutico` and `mitologico`.

## What CODEX changed

- Added `build_verified_wiktionary.py`.
  - uses exact written spelling;
  - keys by spelling + POS;
  - keeps form-of lemma identity for inflections;
  - uses explicit Wiktionary hyphenation for orthographic syllables;
  - requires IPA/hyphenation stress agreement;
  - quarantines conflicting pronunciations.
- Rewired the lemma pipeline to make verified syllable boundaries part of the
  confidence gate.
- Replaced bulk conjugation guessing with Morph-it-attested,
  lemma-specific, Wiktionary-verified present-3pl forms.
- Retained three missing hand-checked seed backstops (`abitano`,
  `compratemelo`, `abitò`) without reopening bulk guessing.
- Contextualized stress minimal pairs, e.g.:
  - `capitano — captain (noun)`
  - `capitano — they happen (verb 3pl of capitare)`
- Quarantined duplicate/conflicting bare prompts.
- Added provenance fields to generated sidecars/questions:
  `verification_status`, `syllable_source`, and `verified_by`.
- Corrected Housing’s misleading stress hints and the `tèlefona` typo.
- CODEX 2026-07-23 follow-up: replaced the circular post-answer declaration
  with mechanism-specific "Why" text for suffixes, infinitive classes,
  written accents, present-3pl forms, clitics, contextual homographs, learned
  patterns, and genuinely lexical stress. Housing no longer repeats the
  explanation or appends a generic class slogan.

## Current verified totals

| Layer | Verified/high | Quarantined/low |
|---|---:|---:|
| Lemmas | 13,535 | 4,536 |
| Wordforms | 536 | 0 |
| Final questions after filtering | 12,446 | — |

The final question total is lower than the sidecar total because monosyllables,
duplicate vocabulary rows, and conflicting bare prompts are excluded.

## Verification performed

- `audit_generated_stress.py`: **PASS**, zero failures.
  - all 13,535 drillable lemma records reproduce the exact POS-aware
    dictionary record;
  - all 523 generated present-3pl forms are Morph-it-attested;
  - all 12,446 questions reconstruct the word, render the expected choices,
    and map `answer_index` to `stress_pos`;
  - all 12,446 questions carry a mechanism-specific explanation plus the
    verified, visibly stress-marked syllabification;
  - no prompt maps to conflicting answers;
  - known invented forms are absent;
  - the `pedofilia` regression passes.
- `validate_seed.py`: **58/58 PASS**.
- `node --check` passes for Housing `app.js`, `store.js`, and `pulse.js`.
- Browser-level local testing was attempted, but the in-app browser security
  policy blocked the workspace `file:` URL and could not reach the loopback
  server. No bypass was attempted.

## Deliberate remaining limits

- The **4,536 low-confidence lemma records remain out of the drill** until both
  stress and visible syllable boundaries are verified.
- Bulk passato-remoto and clitic generation remains disabled. Only the
  hand-verified seed examples are present.
- Housing’s toggleable diagnostic axes and stress↔accent cross-analysis are
  still the outstanding Housing/Architecture work already noted in the thread.
- Do not use the legacy `wiktionary_stress.json` as a production drill gate.
  It is retained only as provenance/input to older work.

## Files owned/changed by CODEX

- `tools/stress_pipeline/build_verified_wiktionary.py`
- `tools/stress_pipeline/audit_generated_stress.py`
- `tools/stress_pipeline/stress_pipeline.py`
- `tools/stress_pipeline/wordform_stress.py`
- `tools/stress_pipeline/generate_stress_items.js`
- `tools/stress_pipeline/generate_report.py`
- `tools/stress_pipeline/run_pipeline.py`
- `tools/stress_pipeline/validate_seed.py`
- `housing/js/app.js`
- `data/stress_sidecar_lemma.json`
- `data/stress_sidecar_wordform.json`
- `data/grammar_questions_stress.json`
- `tools/stress_pipeline/lexicon_data/wiktionary_verified.json`
- `outputs/stress_coverage_report.md`
- `outputs/stress_audit_CODEX.md`
- `_status/StressAuthor.md`
- this handoff file
