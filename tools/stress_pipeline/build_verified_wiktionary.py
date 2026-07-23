#!/usr/bin/env python3
"""Build a POS-aware, syllable-verified Italian pronunciation lexicon.

CODEX 2026-07-23

The previous extractor keyed records by bare spelling, ignored part of speech,
overwrote earlier homographs, and treated IPA primary-stress marks as ordinary
characters rather than syllable boundaries.  That made a later verb-form entry
overwrite the noun ``telefonino`` and left the drill with no verified
orthographic syllable boundaries.

This extractor is intentionally conservative:

* Wiktionary's explicit hyphenation supplies the orthographic boundaries.
* A written accent in that hyphenation and/or IPA supplies stress position.
* Records are keyed by normalized spelling AND part of speech.
* Conflicting records remain marked ambiguous and are not drillable.

Reads:
    tools/stress_pipeline/lexicon_data/kaikki.org-dictionary-Italian.jsonl
Writes:
    tools/stress_pipeline/lexicon_data/wiktionary_verified.json
"""

from __future__ import annotations

import argparse
import json
import os
import re
import unicodedata
from collections import Counter, defaultdict
from datetime import datetime, timezone


SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_INPUT = os.path.join(
    SCRIPT_DIR, "lexicon_data", "kaikki.org-dictionary-Italian.jsonl"
)
DEFAULT_OUTPUT = os.path.join(
    SCRIPT_DIR, "lexicon_data", "wiktionary_verified.json"
)

PRIMARY_STRESS = "\u02c8"
HYPHENATION_SEPARATOR = re.compile(r"[\u2027\u00b7]")
ACCENTED_VOWELS = set("àèéìòùáíóúâêîôû")


def strip_diacritics(value: str) -> str:
    """Return a lowercase key with stress/quality diacritics removed."""
    decomposed = unicodedata.normalize("NFD", value.lower())
    return "".join(
        ch for ch in decomposed if unicodedata.category(ch) != "Mn"
    )


def ipa_stress_pos(ipa: str | None) -> int | None:
    """Return primary stress counted from the end of a syllabified IPA.

    In Wiktionary IPA the primary-stress mark itself is a syllable boundary.
    For /pe.do.fiˈli.a/, the substring after ˈ is ``li.a``: two syllables,
    therefore stress_pos=2.
    """
    if not ipa or PRIMARY_STRESS not in ipa:
        return None
    inner = ipa.strip("/[]")
    after = inner.split(PRIMARY_STRESS, 1)[1]
    # Dots after the stress mark separate the stressed syllable from each
    # following syllable. Empty fragments are ignored defensively.
    return len([part for part in after.split(".") if part])


def hyphenation_candidates(entry: dict) -> list[str]:
    """Collect the explicit hyphenation strings carried by a Kaikki entry."""
    values: list[str] = []
    for value in entry.get("hyphenation", []) or []:
        if isinstance(value, str):
            values.append(value)
    for block in entry.get("hyphenations", []) or []:
        for value in block.get("parts", []) if isinstance(block, dict) else []:
            if isinstance(value, str):
                values.append(value)
    return list(dict.fromkeys(values))


def orthographic_syllables(word: str, hyphenation: str) -> list[str] | None:
    """Map accented Wiktionary hyphenation boundaries onto the source word."""
    marked_parts = [
        part for part in HYPHENATION_SEPARATOR.split(hyphenation) if part
    ]
    if len(marked_parts) < 1:
        return None

    marked_joined = "".join(marked_parts)
    if strip_diacritics(marked_joined) != strip_diacritics(word):
        return None

    # Accented pedagogical spelling and the dictionary headword have the same
    # codepoint lengths for ordinary Italian vowels. Slice the real headword so
    # internal stress marks do not leak into the drill prompt.
    chars = list(word)
    result: list[str] = []
    cursor = 0
    for marked in marked_parts:
        width = len(list(marked))
        result.append("".join(chars[cursor : cursor + width]))
        cursor += width
    if cursor != len(chars) or "".join(result).lower() != word.lower():
        return None
    return result


def hyphenation_stress_pos(hyphenation: str) -> int | None:
    """Read the stressed syllable from an accented hyphenation string."""
    parts = [part for part in HYPHENATION_SEPARATOR.split(hyphenation) if part]
    stressed = [
        index
        for index, part in enumerate(parts)
        if any(char.lower() in ACCENTED_VOWELS for char in part)
    ]
    if len(stressed) != 1:
        return None
    return len(parts) - stressed[0]


def candidate_records(entry: dict) -> list[dict]:
    """Return verified pronunciation candidates for one raw entry."""
    word = entry.get("word")
    pos = entry.get("pos")
    if not isinstance(word, str) or not word or not isinstance(pos, str):
        return []

    ipas = [
        sound.get("ipa")
        for sound in entry.get("sounds", []) or []
        if isinstance(sound, dict)
        and isinstance(sound.get("ipa"), str)
        and PRIMARY_STRESS in sound["ipa"]
    ]
    if not ipas:
        return []

    # CODEX 2026-07-23: retain the lemma named by form-of senses. This is what
    # distinguishes homographic verb forms such as càpitano (capitare) from
    # capitàno (capitanare) and prevents a spelling-only lookup from conflating
    # distinct paradigm cells.
    form_of = sorted(
        {
            relation.get("word", "").lower()
            for sense in entry.get("senses", []) or []
            if isinstance(sense, dict)
            for relation in sense.get("form_of", []) or []
            if isinstance(relation, dict) and relation.get("word")
        }
    )

    candidates: list[dict] = []
    for hyphenation in hyphenation_candidates(entry):
        syllables = orthographic_syllables(word, hyphenation)
        if not syllables:
            continue
        hyphen_pos = hyphenation_stress_pos(hyphenation)

        for ipa in ipas:
            ipa_pos = ipa_stress_pos(ipa)
            if ipa_pos is None:
                continue
            # If the accented hyphenation gives a stress position too, the two
            # independent signals must agree.
            if hyphen_pos is not None and hyphen_pos != ipa_pos:
                continue
            if not 1 <= ipa_pos <= len(syllables):
                continue
            candidates.append(
                {
                    "word": word,
                    "pos": pos,
                    "syllables": syllables,
                    "syllable_count": len(syllables),
                    "stress_pos": ipa_pos,
                    "ipa": ipa,
                    "hyphenation": hyphenation,
                    "evidence": "wiktionary_hyphenation+ipa",
                    "form_of": form_of,
                }
            )
    return candidates


def collapse_candidates(candidates: list[dict]) -> dict:
    """Collapse agreeing records; preserve conflicts as non-drillable."""
    unique: dict[tuple, dict] = {}
    for record in candidates:
        signature = (
            tuple(part.lower() for part in record["syllables"]),
            record["stress_pos"],
        )
        unique.setdefault(signature, record)

    variants = list(unique.values())
    if len(variants) == 1:
        result = dict(variants[0])
        result["ambiguous"] = False
        result["variant_count"] = 1
        return result

    return {
        "word": candidates[0]["word"],
        "pos": candidates[0]["pos"],
        "ambiguous": True,
        "variant_count": len(variants),
        "variants": variants,
        "evidence": "conflicting_wiktionary_pronunciations",
    }


def build_verified_lexicon(input_path: str, output_path: str) -> dict:
    grouped: dict[tuple[str, str], list[dict]] = defaultdict(list)
    form_grouped: dict[tuple[str, str, str], list[dict]] = defaultdict(list)
    raw_lines = 0
    italian_entries = 0

    with open(input_path, "r", encoding="utf-8") as source:
        for line in source:
            raw_lines += 1
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                continue
            if (entry.get("lang_code") or entry.get("lang")) not in (
                "it",
                "Italian",
            ):
                continue
            italian_entries += 1
            for record in candidate_records(entry):
                # CODEX 2026-07-23: written accents are lexical data, not
                # decoration. Keep exact orthography so ``sara`` cannot borrow
                # the record for ``sarà`` and ``menu`` cannot borrow ``menù``.
                word_key = record["word"].lower()
                key = (word_key, record["pos"])
                grouped[key].append(record)
                for lemma in record.get("form_of", []):
                    form_grouped[
                        (word_key, record["pos"], strip_diacritics(lemma))
                    ].append(record)

    entries: dict[str, dict[str, dict]] = defaultdict(dict)
    forms: dict[str, dict[str, dict[str, dict]]] = defaultdict(
        lambda: defaultdict(dict)
    )
    ambiguous = 0
    verified = 0
    pos_counts: Counter[str] = Counter()
    for (word_key, pos), candidates in grouped.items():
        record = collapse_candidates(candidates)
        entries[word_key][pos] = record
        pos_counts[pos] += 1
        if record["ambiguous"]:
            ambiguous += 1
        else:
            verified += 1

    verified_forms = 0
    ambiguous_forms = 0
    for (word_key, pos, lemma_key), candidates in form_grouped.items():
        record = collapse_candidates(candidates)
        forms[word_key][pos][lemma_key] = record
        if record["ambiguous"]:
            ambiguous_forms += 1
        else:
            verified_forms += 1

    payload = {
        "_meta": {
            "generated_by": "CODEX",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "source": os.path.basename(input_path),
            "raw_lines": raw_lines,
            "italian_entries": italian_entries,
            "word_pos_records": verified + ambiguous,
            "verified_records": verified,
            "ambiguous_records": ambiguous,
            "verified_form_records": verified_forms,
            "ambiguous_form_records": ambiguous_forms,
            "pos_counts": dict(pos_counts.most_common()),
        },
        "entries": dict(entries),
        "forms": {
            word: {pos: dict(lemmas) for pos, lemmas in by_pos.items()}
            for word, by_pos in forms.items()
        },
    }

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8", newline="\n") as target:
        json.dump(payload, target, ensure_ascii=False, indent=2)
    return payload["_meta"]


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Build a conservative POS-aware Wiktionary lexicon"
    )
    parser.add_argument("--input", default=DEFAULT_INPUT)
    parser.add_argument("--output", default=DEFAULT_OUTPUT)
    args = parser.parse_args()
    meta = build_verified_lexicon(args.input, args.output)
    print(json.dumps(meta, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
