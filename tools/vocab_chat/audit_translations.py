"""Heuristic audit of translation_en values for comma-correctness.

The partial-credit formula in Architecture_Vocab_marker_semantics §3 is
overlap-over-target — `credit = |overlap| / |target.translation_en|`. This
means the number of comma-separated elements in each entry's translation_en is
load-bearing for the math:

- Over-padding (long lists with rare or duplicate senses) shrinks every
  match's credit. A learner who knows the dominant sense should still get
  near-100%, but if the entry has 7 senses and they only know one, they get
  ~14%.
- Under-specifying (missing common senses) means cross-lemma hits don't fire
  when they should, and learners get less credit than they've earned.

This script flags entries by heuristic patterns so the audit can be triaged
rather than walked entry-by-entry. It does not modify the data.

Run from project root:
    python3 tools/vocab_chat/audit_translations.py
"""
from __future__ import annotations

import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA = PROJECT_ROOT / "data" / "vocabulary_it_frequency.json"


PAREN_RE = re.compile(r"\([^)]*\)")


def clean_and_split(translation_en: str | None) -> list[str]:
    """Apply the marker's cleaning rules to get the matchable element list."""
    if not translation_en:
        return []
    # Strip parenthetical clarifiers
    s = PAREN_RE.sub("", translation_en)
    # Split on commas AND semicolons (per architect's clean spec)
    parts = re.split(r"[,;]", s)
    elements = []
    for p in parts:
        p = p.strip().lower()
        # Strip leading "to " for verbs? No - that's part of the gloss.
        # Strip hyphens? Architect said "hyphen-strip" but that's odd; skip for now
        if p:
            elements.append(p)
    return elements


def main():
    with DATA.open() as f:
        entries = json.load(f)

    # Filter to entries with a real translation
    askable = [
        e for e in entries
        if e.get("translation_en")
        and e["translation_en"] != "[skip]"
    ]
    print(f"Total entries: {len(entries)}")
    print(f"Askable (non-null, non-[skip]) translations: {len(askable)}")
    print()

    # Element-count distribution by source
    elem_counts_by_source = defaultdict(list)
    for e in askable:
        src = e.get("translation_source") or "(none)"
        elements = clean_and_split(e["translation_en"])
        elem_counts_by_source[src].append(len(elements))

    print("Element-count distribution by translation_source:")
    print(f"  {'source':18} {'n':>6} {'min':>4} {'med':>4} {'p90':>4} {'max':>4} {'mean':>5}")
    for src in sorted(elem_counts_by_source):
        counts = sorted(elem_counts_by_source[src])
        n = len(counts)
        if n == 0:
            continue
        mn = counts[0]
        med = counts[n // 2]
        p90 = counts[int(n * 0.9)]
        mx = counts[-1]
        mean = sum(counts) / n
        print(f"  {src:18} {n:>6} {mn:>4} {med:>4} {p90:>4} {mx:>4} {mean:>5.2f}")
    print()

    # Flag categories
    flags = {
        "duplicate_elements": [],     # same element appears twice in one translation_en
        "very_long": [],              # > 6 elements
        "extremely_long": [],         # > 10 elements
        "semicolon_only": [],         # split on ; only, no commas — often signals sense-groups
        "english_leak": [],           # the lemma itself appears identical in translation_en
        "all_caps_word": [],          # ALL-CAPS suggests proper noun residue
        "wiktionary_residue": [],     # specific Wiktionary trigger phrases
    }

    eng_leak_re = re.compile(r"^[a-z]+$")
    wiki_phrases = [
        "given name", "surname", "patronymic", "habitational",
        "a male", "a female", "comune of", "town in", "village in",
        "river in", "mountain", "frazione",
    ]

    for e in askable:
        lemma = e.get("lemma") or ""
        translation = e["translation_en"]
        elements = clean_and_split(translation)
        if not elements:
            continue

        # duplicate_elements
        if len(elements) != len(set(elements)):
            flags["duplicate_elements"].append(e)

        # very_long / extremely_long
        if len(elements) > 10:
            flags["extremely_long"].append(e)
        elif len(elements) > 6:
            flags["very_long"].append(e)

        # semicolon_only
        if ";" in translation and "," not in translation:
            flags["semicolon_only"].append(e)

        # english_leak: lemma matches a translation element exactly
        # (rare for Italian, suspicious — almost always tokenisation noise)
        if lemma.lower() in elements:
            flags["english_leak"].append(e)

        # wiktionary_residue
        lower_trans = translation.lower()
        if any(phrase in lower_trans for phrase in wiki_phrases):
            flags["wiktionary_residue"].append(e)

    print("Flag tallies:")
    for k, v in flags.items():
        print(f"  {k}: {len(v)}")
    print()

    # Show samples
    def show_sample(flag_name, n=15):
        print(f"\n--- Sample: {flag_name} (first {n} of {len(flags[flag_name])}) ---")
        # Sort by rank ascending so high-traffic entries appear first
        samples = sorted(flags[flag_name], key=lambda e: e.get("rank") or 99999)[:n]
        for e in samples:
            rank = e.get("rank") or 0
            lemma = (e.get("lemma") or "")[:18]
            pos = (e.get("pos") or "")[:10]
            src = (e.get("translation_source") or "(none)")[:14]
            elements = clean_and_split(e["translation_en"])
            print(f"  r{rank:>5} {lemma:18} {pos:10} [{src:14}] ({len(elements):>2} el): '{e['translation_en'][:80]}'")

    for flag in ["duplicate_elements", "extremely_long", "very_long", "english_leak", "wiktionary_residue", "semicolon_only"]:
        show_sample(flag, n=12)

    # Cross-tabulation: source × flag
    print("\n\nSource × flag (counts):")
    print(f"  {'flag':22} {'apertium':>10} {'wiktionary':>10} {'vocab_chat':>10} {'omw':>10}")
    for fname, items in flags.items():
        counts = Counter(e.get("translation_source") for e in items)
        print(f"  {fname:22} {counts.get('apertium', 0):>10} {counts.get('wiktionary', 0):>10} {counts.get('vocab_chat', 0):>10} {counts.get('omw', 0):>10}")


if __name__ == "__main__":
    main()
