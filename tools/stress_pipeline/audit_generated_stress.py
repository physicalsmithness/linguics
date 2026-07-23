#!/usr/bin/env python3
"""Release-gate audit for the generated Italian stress drill.

CODEX 2026-07-23

This audit checks the data contract the UI actually consumes, not merely that
an ordinal stress number falls within an array. It exits non-zero on any
release-blocking failure and writes a human-readable handoff report.
"""

from __future__ import annotations

import json
import os
import re
import unicodedata
from collections import Counter, defaultdict
from datetime import datetime


SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
DATA = os.path.join(ROOT, "data")
LEXICON = os.path.join(SCRIPT_DIR, "lexicon_data")
REPORT = os.path.join(ROOT, "outputs", "stress_audit_CODEX.md")

LEMMA_PATH = os.path.join(DATA, "stress_sidecar_lemma.json")
WORDFORM_PATH = os.path.join(DATA, "stress_sidecar_wordform.json")
QUESTION_PATH = os.path.join(DATA, "grammar_questions_stress.json")
VERIFIED_PATH = os.path.join(LEXICON, "wiktionary_verified.json")
MORPHIT_PATH = os.path.join(LEXICON, "morphit_forms.json")
SEED_PATH = os.path.join(ROOT, "incoming drafts", "stress_seed_v0.json")

POS_MAP = {
    "adjective": "adj",
    "adverb": "adv",
    "conjunction": "conj",
    "preposition": "prep",
    "pronoun": "pron",
    "numeral": "num",
    "determiner": "det",
    "interjection": "intj",
}
CLASS_BY_POS = {
    1: "tronca",
    2: "piana",
    3: "sdrucciola",
    4: "bisdrucciola",
}


def load(path: str):
    with open(path, "r", encoding="utf-8") as source:
        return json.load(source)


def plain(value: str) -> str:
    decomposed = unicodedata.normalize("NFD", value.lower())
    return "".join(
        char for char in decomposed if unicodedata.category(char) != "Mn"
    )


def bare_drill_form(marked: str) -> str:
    """Remove internal pedagogical stress, preserving a written final accent."""
    stripped = plain(marked)
    if marked and marked[-1].lower() in "àèéìòù":
        return stripped[:-1] + marked[-1].lower()
    return stripped


def main() -> int:
    lemmas = load(LEMMA_PATH)
    wordforms = load(WORDFORM_PATH)
    questions = load(QUESTION_PATH)
    verified = load(VERIFIED_PATH)
    morphit = load(MORPHIT_PATH)
    seed = load(SEED_PATH)
    seed_wordforms = {
        (bare_drill_form(entry["form"].lower()), entry["stress_pos"]): entry
        for entry in seed.get("wordform_extension", [])
    }

    failures: list[str] = []
    warnings: list[str] = []
    checks: Counter[str] = Counter()

    # Lemma release gate: every high/medium record must reproduce the exact
    # POS-matched verified dictionary record.
    for entry in lemmas:
        if entry.get("stress_confidence") not in ("high", "medium"):
            continue
        checks["drillable_lemma_records"] += 1
        pos = POS_MAP.get(entry.get("pos"), entry.get("pos"))
        record = (
            verified.get("entries", {})
            .get(entry["lemma"].lower(), {})
            .get(pos)
        )
        if not record or record.get("ambiguous"):
            failures.append(
                f"drillable lemma lacks unique POS record: "
                f"{entry['lemma']} ({entry.get('pos')})"
            )
            continue
        if (
            entry.get("syllables") != record.get("syllables")
            or entry.get("stress_pos") != record.get("stress_pos")
        ):
            failures.append(
                f"lemma differs from verified record: {entry['lemma']} "
                f"{entry.get('syllables')}/{entry.get('stress_pos')} vs "
                f"{record.get('syllables')}/{record.get('stress_pos')}"
            )

    # Morph-it attestation index for the generated paradigm subset.
    attested: set[tuple[str, str]] = set()
    for form, analyses in morphit.items():
        for analysis in analyses:
            if re.match(
                r"^(VER|AUX|ASP):ind\+pres\+3\+p$",
                analysis.get("features", ""),
            ):
                attested.add((plain(form), plain(analysis.get("lemma", ""))))

    for entry in wordforms:
        checks["wordform_records"] += 1
        if entry.get("syllable_source") == "author_seed":
            seed_entry = seed_wordforms.get(
                (entry.get("form", "").lower(), entry.get("stress_pos"))
            )
            if (
                not seed_entry
                or entry.get("syllables") != seed_entry.get("syllables")
            ):
                failures.append(
                    f"author-seed wordform does not reproduce seed: "
                    f"{entry.get('form')}"
                )
            else:
                checks["author_seed_wordforms"] += 1
        elif entry.get("syllable_source") != "wiktionary_hyphenation":
            failures.append(
                f"wordform has unverified boundaries: {entry.get('form')}"
            )
        if entry.get("stress_mechanism_detail") == "present_3pl":
            # Contextual hand-authored minimal-pair entries are separately
            # dictionary verified; generated paradigm entries must be attested.
            if entry.get("verification_status") == "verified_attested_form":
                checks["attested_present_3pl"] += 1
                key = (plain(entry["form"]), plain(entry["lemma"]))
                if key not in attested:
                    failures.append(
                        f"unattested generated form: {entry['form']} "
                        f"from {entry['lemma']}"
                    )

    banned = {"essono", "avono", "andano", "potono", "fano"}
    leaked = sorted(
        entry["form"] for entry in wordforms if plain(entry["form"]) in banned
    )
    if leaked:
        failures.append(f"known invented forms leaked: {', '.join(leaked)}")
    checks["known_invented_forms_absent"] = len(banned) - len(leaked)

    # Question contract and exact choice rendering.
    prompt_signatures: dict[str, set[tuple]] = defaultdict(set)
    for question in questions:
        checks["questions"] += 1
        meta = question.get("stress_meta", {})
        syllables = meta.get("syllables", [])
        stress_pos = meta.get("stress_pos")
        choices = question.get("choices", [])
        answer_index = question.get("answer_index")
        word = meta.get("word", "")
        explanation = question.get("explanation", "")

        if question.get("generated_by") != "CODEX stress_pipeline":
            failures.append(
                f"legacy/unmarked item: {question.get('external_id')}"
            )
        if meta.get("syllable_source") not in {
            "wiktionary_hyphenation",
            "author_seed",
        }:
            failures.append(
                f"question has unverified split: {question.get('external_id')}"
            )
        if "".join(syllables).lower() != word.lower():
            failures.append(
                f"syllables do not reconstruct word: {word} -> {syllables}"
            )
        expected_count = min(len(syllables), 4)
        if len(choices) != expected_count:
            failures.append(f"wrong choice count for {word}")
            continue
        if answer_index != stress_pos - 1:
            failures.append(f"answer index mismatch for {word}")
        if meta.get("stress_class") != CLASS_BY_POS.get(stress_pos):
            failures.append(f"stress class mismatch for {word}")
        # CODEX 2026-07-23: the post-answer "Why" must state the mechanism
        # and evidence, not merely repeat "this word is piana/sdrucciola".
        if (
            not explanation
            or "The verified pronunciation is " not in explanation
            or meta.get("explanation_basis")
            != meta.get("stress_mechanism_detail")
        ):
            failures.append(f"missing mechanism-specific explanation for {word}")
        else:
            checks["mechanism_explanations"] += 1

        expected_choices = []
        for pos in range(1, expected_count + 1):
            target = len(syllables) - pos
            expected_choices.append(
                "".join(
                    f"**{part}**" if index == target else part
                    for index, part in enumerate(syllables)
                )
            )
        if choices != expected_choices:
            failures.append(f"choice rendering mismatch for {word}")

        signature = (tuple(choices), answer_index)
        prompt_signatures[question.get("prompt", "").lower()].add(signature)

    conflicting = {
        prompt: signatures
        for prompt, signatures in prompt_signatures.items()
        if len(signatures) > 1
    }
    if conflicting:
        failures.append(
            f"{len(conflicting)} prompts map to conflicting questions"
        )
    checks["unique_nonconflicting_prompts"] = len(prompt_signatures)

    # Regression for the user-reported failure.
    pedofilia = [
        item for item in questions if item.get("stress_meta", {}).get("word") == "pedofilia"
    ]
    if len(pedofilia) != 1:
        failures.append(f"pedofilia regression count is {len(pedofilia)}, not 1")
    else:
        item = pedofilia[0]
        expected = ["pe", "do", "fi", "li", "a"]
        if (
            item["stress_meta"]["syllables"] != expected
            or item["stress_meta"]["stress_pos"] != 2
            or item["choices"][item["answer_index"]] != "pedofi**li**a"
            or "hiatus" not in item.get("explanation", "")
            or "pe-do-fi-LI-a" not in item.get("explanation", "")
        ):
            failures.append(
                "pedofilia regression still targets or explains the wrong syllable"
            )
        else:
            checks["pedofilia_regression"] = 1

    # Warnings preserve honest limitations without failing a safe deck.
    low_lemmas = sum(
        1 for entry in lemmas if entry.get("stress_confidence") == "low"
    )
    warnings.append(
        f"{low_lemmas:,} lemma records remain quarantined (low confidence)."
    )
    warnings.append(
        "Passato-remoto and imperative+clitic generation remain disabled until "
        "surface form and syllable boundaries are jointly verified."
    )

    lines = [
        "# Stress pipeline release audit — CODEX 2026-07-23",
        "",
        f"Generated: {datetime.now().isoformat(timespec='minutes')}",
        "",
        f"Result: **{'PASS' if not failures else 'FAIL'}**",
        "",
        "## Checked",
        "",
    ]
    lines.extend(f"- {name}: {count:,}" for name, count in checks.items())
    lines += ["", "## Failures", ""]
    lines.extend(f"- {failure}" for failure in failures)
    if not failures:
        lines.append("- None.")
    lines += ["", "## Deliberate limitations", ""]
    lines.extend(f"- {warning}" for warning in warnings)
    lines += [
        "",
        "The audit is release-blocking: the script exits non-zero if any "
        "failure above is present.",
        "",
    ]

    os.makedirs(os.path.dirname(REPORT), exist_ok=True)
    with open(REPORT, "w", encoding="utf-8", newline="\n") as target:
        target.write("\n".join(lines))
    print("\n".join(lines[:8]))
    print(f"Failures: {len(failures)}")
    print(f"Report: {REPORT}")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
