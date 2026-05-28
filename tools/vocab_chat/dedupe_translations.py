"""Phase 1 of the translation_en comma-correctness audit: mechanically dedupe
duplicate elements within each entry's translation_en.

Wiktionary's bulk pull often gave entries like:
    regista: "director, director, producer, organizer, coordinator"
where the same English word appears twice because wiktionary has two separate
sense-numbered entries that collapse to the same gloss. The marker's
partial-credit divisor is the entry's element count, so duplicates inflate
the divisor and dilute cross-lemma credit when this entry is the target.

This pass dedupes mechanically, preserving the first occurrence of each
distinct element (so order matches source intent). It also strips internal
whitespace runs and normalises around commas/semicolons.

Run from project root:
    python3 tools/vocab_chat/dedupe_translations.py
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from atomic_io import atomic_write_json  # noqa: E402

DATA = PROJECT_ROOT / "data" / "vocabulary_it_frequency.json"

PATCH_MARKER = "[translation-audit-dedupe]"


def dedupe_translation(translation_en: str) -> tuple[str, list[str], list[str]]:
    """Dedupe elements in a translation_en string.

    Returns (new_translation, original_elements_lower, removed_lower).
    """
    # Find any trailing parenthetical clarifier (e.g. "(determiner)" or "(direct object)")
    # Trailing parens preserved as-is.
    paren_re = re.compile(r"\s*\([^)]*\)\s*$")
    trailing_paren = ""
    main = translation_en.rstrip()
    m = paren_re.search(main)
    if m:
        trailing_paren = " " + main[m.start():].strip()
        main = main[:m.start()].rstrip()

    # Now split main on commas AND semicolons but PRESERVE which separator was used,
    # so we can reconstruct sensibly. Simplest: pick one canonical separator.
    # The architect's spec splits on both. For storage we can join with ", " (commas).
    # But semicolons in our data sometimes deliberately mark sense-groups (vocab_chat
    # style). For now, treat semicolon as another comma for dedupe purposes but
    # preserve the original separator pattern when reconstructing.
    # Simpler approach: split on commas/semicolons, dedupe, rejoin with commas.

    parts = re.split(r"[,;]", main)
    seen = set()
    kept = []
    removed = []
    for p in parts:
        p_stripped = p.strip()
        if not p_stripped:
            continue
        key = p_stripped.lower()
        if key in seen:
            removed.append(p_stripped)
            continue
        seen.add(key)
        kept.append(p_stripped)

    new = ", ".join(kept) + trailing_paren
    return new, [p.strip().lower() for p in parts if p.strip()], removed


def main():
    print(f"Loading {DATA}")
    with DATA.open() as f:
        entries = json.load(f)
    print(f"  {len(entries)} entries loaded")

    changed = []
    examined = 0
    for e in entries:
        trans = e.get("translation_en")
        if not trans or trans == "[skip]":
            continue
        examined += 1
        new, original_elements, removed = dedupe_translation(trans)
        if removed:
            old = trans
            e["translation_en"] = new
            existing_notes = (e.get("notes") or "").strip()
            patch_note = f"{PATCH_MARKER} removed duplicate elements: {', '.join(removed)}"
            e["notes"] = (existing_notes + " — " + patch_note) if existing_notes else patch_note
            changed.append((e.get("rank"), e.get("lemma"), e.get("pos"), old, new, removed))

    print(f"Examined {examined} translatable entries")
    print(f"Deduped: {len(changed)} entries")
    print()

    # Show changes by source
    from collections import Counter
    sources = Counter()
    for r, lemma, pos, old, new, removed in changed:
        # find source by matching lemma+pos+rank
        for e in entries:
            if e.get("lemma") == lemma and e.get("pos") == pos and e.get("rank") == r:
                sources[e.get("translation_source") or "(none)"] += 1
                break
    print("By translation_source:")
    for src, c in sources.most_common():
        print(f"  {src}: {c}")
    print()

    # Sample
    print("Sample of dedupes (first 20):")
    for r, lemma, pos, old, new, removed in sorted(changed, key=lambda x: x[0] or 99999)[:20]:
        print(f"  r{r:>5} {lemma:18} {pos[:10]:10}  removed [{', '.join(removed)}]")
        print(f"        OLD: '{old[:100]}'")
        print(f"        NEW: '{new[:100]}'")
    print()

    print(f"Writing back to {DATA}")
    atomic_write_json(DATA, entries)

    # Verify
    with DATA.open() as f:
        verify = json.load(f)

    # Recheck duplicates remaining
    remaining_dup = 0
    for e in verify:
        trans = e.get("translation_en")
        if not trans or trans == "[skip]":
            continue
        _, _, removed = dedupe_translation(trans)
        if removed:
            remaining_dup += 1
    print(f"\nVerification: {len(verify)} entries, {remaining_dup} entries still have duplicate elements after pass")


if __name__ == "__main__":
    main()
