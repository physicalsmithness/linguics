#!/usr/bin/env python3
"""Generate the stress coverage/confidence report. [created by Antigravity]

Reads the lemma and wordform sidecars and produces a markdown report
showing coverage breakdowns that StressAuthor needs to build items.

Output: outputs/stress_coverage_report.md
"""

import json
import os
import sys
from datetime import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
OUTPUTS_DIR = os.path.join(PROJECT_ROOT, "outputs")

LEMMA_SIDECAR = os.path.join(DATA_DIR, "stress_sidecar_lemma.json")
WORDFORM_SIDECAR = os.path.join(DATA_DIR, "stress_sidecar_wordform.json")
REPORT_PATH = os.path.join(OUTPUTS_DIR, "stress_coverage_report.md")
QUESTIONS_PATH = os.path.join(DATA_DIR, "grammar_questions_stress.json")


def _pct(n: int, total: int) -> str:
    if total == 0:
        return "0.0%"
    return f"{100 * n / total:.1f}%"


def generate_report(output_path: str = REPORT_PATH):
    """Generate the coverage/confidence report."""
    print("Generating stress coverage report...")

    # Load data
    with open(LEMMA_SIDECAR, "r", encoding="utf-8") as f:
        lemmas = json.load(f)
    wordforms = []
    if os.path.exists(WORDFORM_SIDECAR):
        with open(WORDFORM_SIDECAR, "r", encoding="utf-8") as f:
            wordforms = json.load(f)
    questions = []
    if os.path.exists(QUESTIONS_PATH):
        with open(QUESTIONS_PATH, "r", encoding="utf-8") as f:
            questions = json.load(f)

    # Compute stats
    total_lemmas = len(lemmas)
    total_wordforms = len(wordforms)
    total_all = total_lemmas + total_wordforms

    # Confidence breakdown
    conf_lemma = {"high": 0, "medium": 0, "low": 0}
    conf_wf = {"high": 0, "medium": 0, "low": 0}
    for e in lemmas:
        conf_lemma[e.get("stress_confidence", "low")] += 1
    for e in wordforms:
        conf_wf[e.get("stress_confidence", "low")] += 1

    drillable_lemma = conf_lemma["high"] + conf_lemma["medium"]
    drillable_wf = conf_wf["high"] + conf_wf["medium"]

    # CODEX 2026-07-23: confidence alone formerly hid guessed syllable splits.
    verification_counts = {}
    for e in lemmas:
        status = e.get("verification_status", "legacy_unverified")
        verification_counts[status] = verification_counts.get(status, 0) + 1

    # Class breakdown
    class_counts = {"tronca": 0, "piana": 0, "sdrucciola": 0, "bisdrucciola": 0}
    for e in lemmas:
        cls = e.get("stress_class", "unknown")
        class_counts[cls] = class_counts.get(cls, 0) + 1

    wf_class = {"tronca": 0, "piana": 0, "sdrucciola": 0, "bisdrucciola": 0}
    for e in wordforms:
        cls = e.get("stress_class", "unknown")
        wf_class[cls] = wf_class.get(cls, 0) + 1

    # Mechanism breakdown
    mech_counts = {}
    for e in lemmas:
        m = e.get("stress_mechanism", "unknown")
        mech_counts[m] = mech_counts.get(m, 0) + 1

    # Detail breakdown
    detail_counts = {}
    for e in lemmas:
        d = e.get("stress_mechanism_detail", "unknown")
        detail_counts[d] = detail_counts.get(d, 0) + 1

    # Source tier breakdown
    source_counts = {}
    for e in lemmas:
        s = e.get("stress_source", "unknown")
        source_counts[s] = source_counts.get(s, 0) + 1

    # Special counts
    accent_cue = sum(1 for e in lemmas if e.get("accent_cue"))
    etymological = sum(1 for e in lemmas if e.get("etymological"))

    # Syllable count bands
    syll_bands = {}
    for e in lemmas:
        sc = e.get("syllable_count", 0)
        if sc <= 1:
            band = "1 syllable"
        elif sc == 2:
            band = "2 syllables"
        elif sc == 3:
            band = "3 syllables"
        elif sc == 4:
            band = "4 syllables"
        else:
            band = "5+ syllables"
        syll_bands[band] = syll_bands.get(band, 0) + 1

    # Build report
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    lines = [
        f"# Stress Coverage Report",
        f"",
        f"Generated: {timestamp}",
        f"",
        f"> **CODEX 2026-07-23 correction.** “Drillable” now requires a "
        f"POS-matched, non-ambiguous Wiktionary hyphenation **and** IPA stress "
        f"record. Rule-only syllable splits and invented paradigm forms are "
        f"quarantined.",
        f"",
        f"## Summary",
        f"",
        f"| Layer | Total | High | Medium | Low | Drillable (H+M) |",
        f"|-------|------:|-----:|-------:|----:|----------------:|",
        f"| Lemma | {total_lemmas:,} | {conf_lemma['high']:,} | "
        f"{conf_lemma['medium']:,} | {conf_lemma['low']:,} | "
        f"{drillable_lemma:,} ({_pct(drillable_lemma, total_lemmas)}) |",
        f"| Wordform | {total_wordforms:,} | {conf_wf['high']:,} | "
        f"{conf_wf['medium']:,} | {conf_wf['low']:,} | "
        f"{drillable_wf:,} ({_pct(drillable_wf, total_wordforms)}) |",
        f"| **Total** | **{total_all:,}** | "
        f"**{conf_lemma['high'] + conf_wf['high']:,}** | "
        f"**{conf_lemma['medium'] + conf_wf['medium']:,}** | "
        f"**{conf_lemma['low'] + conf_wf['low']:,}** | "
        f"**{drillable_lemma + drillable_wf:,}** |",
        f"",
        f"> StressAuthor builds items from the **drillable** set "
        f"(high + medium confidence).",
        f"> Low-confidence entries are NOT drilled until dictionary-confirmed.",
        f"> Final generated question deck after monosyllable, duplicate, and "
        f"ambiguity filtering: **{len(questions):,} items**.",
        f"",
        f"## Verification gate",
        f"",
        f"| Status | Lemmas | % |",
        f"|--------|-------:|--:|",
    ]
    for status, n in sorted(
        verification_counts.items(), key=lambda item: -item[1]
    ):
        lines.append(f"| {status} | {n:,} | {_pct(n, total_lemmas)} |")

    lines += [
        f"",
        f"## Lemma layer: stress class distribution",
        f"",
        f"| Class | Count | % |",
        f"|-------|------:|--:|",
    ]
    for cls in ("tronca", "piana", "sdrucciola", "bisdrucciola"):
        n = class_counts.get(cls, 0)
        lines.append(f"| {cls} | {n:,} | {_pct(n, total_lemmas)} |")

    lines += [
        f"",
        f"## Lemma layer: mechanism breakdown (diagnostic axis)",
        f"",
        f"| Mechanism | Count | % |",
        f"|-----------|------:|--:|",
    ]
    for m, n in sorted(mech_counts.items(), key=lambda x: -x[1]):
        lines.append(f"| {m} | {n:,} | {_pct(n, total_lemmas)} |")

    lines += [
        f"",
        f"## Lemma layer: mechanism detail (L2 drill-down)",
        f"",
        f"| Detail | Count | % |",
        f"|--------|------:|--:|",
    ]
    for d, n in sorted(detail_counts.items(), key=lambda x: -x[1])[:25]:
        lines.append(f"| {d} | {n:,} | {_pct(n, total_lemmas)} |")
    if len(detail_counts) > 25:
        lines.append(f"| *(+{len(detail_counts) - 25} more)* | | |")

    lines += [
        f"",
        f"## Lemma layer: stress source (evidence/provenance)",
        f"",
        f"| Source | Count | % |",
        f"|--------|------:|--:|",
    ]
    for s, n in sorted(source_counts.items(), key=lambda x: -x[1]):
        lines.append(f"| {s} | {n:,} | {_pct(n, total_lemmas)} |")

    lines += [
        f"",
        f"## Lemma layer: syllable count bands",
        f"",
        f"| Band | Count | % |",
        f"|------|------:|--:|",
    ]
    for band in ("1 syllable", "2 syllables", "3 syllables",
                 "4 syllables", "5+ syllables"):
        n = syll_bands.get(band, 0)
        lines.append(f"| {band} | {n:,} | {_pct(n, total_lemmas)} |")

    lines += [
        f"",
        f"## Special categories",
        f"",
        f"| Category | Count | % of lemmas |",
        f"|----------|------:|------------:|",
        f"| accent_cue = true | {accent_cue:,} | {_pct(accent_cue, total_lemmas)} |",
        f"| etymological = true | {etymological:,} | {_pct(etymological, total_lemmas)} |",
        f"",
        f"## Wordform layer: stress class distribution",
        f"",
        f"| Class | Count | % |",
        f"|-------|------:|--:|",
    ]
    for cls in ("tronca", "piana", "sdrucciola", "bisdrucciola"):
        n = wf_class.get(cls, 0)
        lines.append(f"| {cls} | {n:,} | {_pct(n, total_wordforms)} |")

    lines += [
        f"",
        f"---",
        f"*Corrected and regenerated by CODEX 2026-07-23; original pipeline "
        f"provenance remains in source comments.*",
    ]

    # Write
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    report_text = "\n".join(lines)
    with open(output_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(report_text)

    print(f"  Report written to {output_path}")
    print(f"  Drillable lemmas: {drillable_lemma:,}/{total_lemmas:,}")
    return {"drillable_lemma": drillable_lemma, "total_lemmas": total_lemmas}


if __name__ == "__main__":
    generate_report()
