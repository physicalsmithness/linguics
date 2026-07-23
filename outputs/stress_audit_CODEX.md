# Stress pipeline release audit — CODEX 2026-07-23

Generated: 2026-07-23T23:39

Result: **PASS**

## Checked

- drillable_lemma_records: 13,535
- wordform_records: 536
- attested_present_3pl: 523
- author_seed_wordforms: 3
- known_invented_forms_absent: 5
- questions: 12,446
- mechanism_explanations: 12,446
- unique_nonconflicting_prompts: 12,446
- pedofilia_regression: 1

## Failures

- None.

## Deliberate limitations

- 4,536 lemma records remain quarantined (low confidence).
- Passato-remoto and imperative+clitic generation remain disabled until surface form and syllable boundaries are jointly verified.

The audit is release-blocking: the script exits non-zero if any failure above is present.
