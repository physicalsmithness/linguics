# Italian Stress + Syllable Pipeline [created by Antigravity]

Tiered stress assignment and syllabification for the StressAuthor drill.
Commissioned by Architecture (2026-07-21); spec ratified across
`inter_chat/Architecture_StressAuthor_data_spec.md` v1-v4.

## Quick Start

```bash
# From project root:

# 1. (Optional) Download lexicon data for Tier 4 coverage
python tools/stress_pipeline/prepare_lexicon_data.py

# 2. Run the full pipeline
python tools/stress_pipeline/run_pipeline.py

# 3. Or run individual steps:
python tools/stress_pipeline/stress_pipeline.py      # Tiers 1-5, lemma sidecar
python tools/stress_pipeline/wordform_stress.py      # Wordform layer
python tools/stress_pipeline/validate_seed.py        # Seed validation (58 entries)
python tools/stress_pipeline/generate_report.py      # Coverage report
```

## Architecture

### Tiered Sourcing (each later tier confirms the earlier)

| Tier | Source | Confidence | Coverage |
|------|--------|------------|----------|
| 1 | **Orthographic** — final written accent IS the stress | high | All tronche with accents |
| 2 | **Derivational suffix** — suffix fixes the class (-zione, -mente, -issimo, etc.) | high | Suffixed words |
| 3 | **Inflectional paradigm** — verb stress by conjugation class | high* | All verbs |
| 4 | **Pronunciation lexicon** — Wiktionary IPA / espeak-ng | high | Lexical residue |
| 5 | **Etymological prior** — Greek/Latin learned-word heuristic | low | Guess only |

*Except the -ere infinitive split (stem vs end stressed), which is lexical.

### Confidence Discipline

- **High**: orthographic mark, confirmed suffix rule, dictionary-verified
- **Medium**: espeak-ng fallback, plausible but unconfirmed
- **Low**: rule_default (penult assumed), etymological guess — **NOT drilled**

### Output Fields (per entry)

| Field | Type | Description |
|-------|------|-------------|
| `stress_pos` | int 1-4 | Position from END: 1=tronca, 2=piana, 3=sdrucciola, 4=bisdrucciola |
| `syllables` | string[] | Ordered syllable array: `["cit", "tà"]` |
| `syllable_count` | int | Stored for report filtering by word length |
| `stress_source` | enum | Evidence: `orthographic_mark \| dictionary \| rule \| author \| derived \| rule_default` |
| `stress_confidence` | enum | `high \| medium \| low` |
| `stress_mechanism` | enum | Cause (diagnostic axis): `orthographic \| derivational \| inflectional \| lexical` |
| `stress_mechanism_detail` | string | Sub-type: `accent_final`, `suffix_zione`, `infinitive_ere_stem`, etc. |
| `etymological` | bool | Greek/Latin learned-word flag |
| `accent_cue` | bool | Stress is orthographically signalled (written accent) |
| `stress_tags` | string[] | Secondary memberships: `["derivational:suffix_ta", "lexical:loanword"]` |

## Files

| File | Purpose |
|------|---------|
| `run_pipeline.py` | Entry point — orchestrates all steps |
| `stress_pipeline.py` | Core tiered pipeline (Tiers 1-5) |
| `syllabify_it.py` | Production Italian syllabifier |
| `wordform_stress.py` | Wordform layer (conjugation model + minimal pairs) |
| `prepare_lexicon_data.py` | Downloads Wiktionary + Morph-it! data |
| `validate_seed.py` | Validates against 58-entry seed |
| `generate_report.py` | Coverage/confidence report |

## Output Files

| File | Description |
|------|-------------|
| `data/stress_sidecar_lemma.json` | Stress metadata for ~18k lemmas (keyed by rank+lemma+pos) |
| `data/stress_sidecar_wordform.json` | Stress metadata for verb paradigm cells + minimal pairs |
| `outputs/stress_coverage_report.md` | Coverage breakdown for StressAuthor |

## Dependencies

- Python 3.10+ (stdlib only — no pip installs)
- Optional: espeak-ng for Tier 4 fallback (`winget install espeak-ng.espeak-ng`)

## Coordination

- **Vocab owns the entries.** Sidecars are keyed by entry identifiers; Vocab merges.
- **StressAuthor** builds items off the high+medium confidence set (Deliverable 2).
- **Housing** consumes mechanism/detail/etymological/accent_cue/syllable_count as
  filterable report axes.
