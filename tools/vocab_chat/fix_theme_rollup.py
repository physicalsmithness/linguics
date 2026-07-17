"""Enforce the parent+child theme roll-up convention across the curated
vocabulary file.

Per vocab_themes.json v3 description and Architecture_Vocab_other_open_questions
Q1 (ratified): "entries tagged with a child theme are ALSO tagged with its
parent". This lets consumers query by parent and pick up the whole subtree
with a single membership check, without walking the hierarchy.

Scanning found 227 violations: entries carrying a child theme but not the
parent. Add the missing parent themes.

Run from project root:
    python3 tools/vocab_chat/fix_theme_rollup.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from collections import Counter

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from atomic_io import atomic_write_json  # noqa: E402

DATA = PROJECT_ROOT / "data" / "vocabulary_it_frequency.json"
TAX = PROJECT_ROOT / "data" / "vocab_themes.json"


def main():
    with TAX.open() as f:
        tax = json.load(f)

    # Build child → parent map
    child_to_parent = {}
    for t in tax["themes"]:
        if t.get("parent_id"):
            child_to_parent[t["id"]] = t["parent_id"]

    print(f"Loaded {len(tax['themes'])} themes; {len(child_to_parent)} have parents")

    with DATA.open() as f:
        entries = json.load(f)
    print(f"Loaded {len(entries)} curated entries")

    fixed_by_parent = Counter()
    entries_touched = 0
    for e in entries:
        themes = list(e.get("themes") or [])
        themes_set = set(themes)
        added_here = set()
        for t in themes:
            parent = child_to_parent.get(t)
            if parent and parent not in themes_set and parent not in added_here:
                themes_set.add(parent)
                added_here.add(parent)
                fixed_by_parent[parent] += 1
        if added_here:
            e["themes"] = sorted(themes_set)
            entries_touched += 1

    print(f"\nEntries touched: {entries_touched}")
    print(f"Parent tags added: {sum(fixed_by_parent.values())}")
    print("\nBy parent added:")
    for parent, n in fixed_by_parent.most_common():
        print(f"  {parent}: +{n}")

    print(f"\nWriting back to {DATA}")
    atomic_write_json(DATA, entries)

    # Verify: zero violations
    with DATA.open() as f:
        verify = json.load(f)
    residual = 0
    for e in verify:
        themes = set(e.get("themes") or [])
        for t in themes:
            parent = child_to_parent.get(t)
            if parent and parent not in themes:
                residual += 1
    print(f"\nVerification: {residual} roll-up violations remaining (target: 0)")


if __name__ == "__main__":
    main()
