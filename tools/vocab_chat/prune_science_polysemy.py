"""Prune polysemy-hallucinated science tags per Smith's ruling
(Architecture_Vocab_display_theme_grouping v4 chemistry followup + this turn's
extension to other science sub-themes).

Rule: strip a science_* tag from an entry where science-that-flavour isn't
a real sense of the word. Also strip the science_technology parent tag
alongside, because the entry doesn't actually belong under the tech umbrella
either — the tech tag came in as a roll-up from the spurious child.

Chemistry set (v1, Smith-ratified 2026-07-17):
  20 lemmas listed in STRIPS_CHEMISTRY below.

Extendable to other science sub-themes by adding to STRIPS_PHYSICS, etc.

Run from project root:
    python3 tools/vocab_chat/prune_science_polysemy.py
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

PATCH_MARKER = "[science-polysemy-prune]"

# Each entry is (lemma, pos_or_None, rank_or_None). rank/pos None means "any".
# Adding rank when there are multiple entries with same lemma+pos to disambiguate.
STRIPS_CHEMISTRY = []  # phase 1 already applied on 2026-07-17; kept empty for idempotency

# Phase 2 (Smith-ratified 2026-07-17 turn 2):
STRIPS_PHYSICS = [
    ("corrente", "adverb", 1283),      # "currently; fluently" — time adverb, not electrical
    ("corrente", "adjective", 1431),   # "current; common" — general adj, not electrical
]
STRIPS_BIOLOGY = [
    ("specie", "adverb", 630),         # "especially" — adverb, not species
    ("tessuto", "adjective", 13940),   # "woven" — adj, not biological tissue
]
STRIPS_MATH = [
    ("prodotto", "adjective", 11401),  # "extensive, protracted" — duration adj, not math product
]
STRIPS_ASTRONOMY = [
    ("universo", "adjective", 1988),   # empty translation, corpus noise
]
STRIPS_GENERAL = [
    ("decadenza", "noun", 8483),       # cultural decadence, not physics decay (which is decadimento)
    ("fruizione", "noun", 15426),      # enjoyment/use, no scientific sense
    ("allargamento", "noun", 15730),   # widening, no specific scientific use
]
STRIPS_COMPUTING = [
    ("sito", "adjective", 805),        # "located, situated" — adj, not website
    ("digitale", "noun", 2980),        # "foxglove, digitalis" — plant, not digital
    ("binario", "noun", 4124),         # "platform" — train, not binary
    ("cavo", "adjective", 4732),       # "hollow" — not cable
    ("cuffia", "noun", 6432),          # "bonnet" — not headphones per this entry's translation
    ("account", "verb", 5159),         # empty, noise
    ("account", "adjective", 6859),    # empty, noise
    ("profilo", "adjective", 8249),    # empty, noise
    ("download", "adjective", 9186),   # empty, noise
    ("stampante", "adjective", 9540),  # empty, noise
    ("app", "verb", 9814),             # empty, noise
    ("webcam", "adjective", 11265),    # empty, noise
    ("ram", "adjective", 11457),       # empty, noise
    ("spam", "verb", 13188),           # empty, noise
    ("antivirus", "adjective", 14911), # empty, noise
    ("login", "adjective", 15950),     # empty, noise
    ("spam", "adjective", 16270),      # empty, noise
]


def matches(entry, lemma, pos, rank):
    if entry.get("lemma") != lemma:
        return False
    if pos is not None and entry.get("pos") != pos:
        return False
    if rank is not None and entry.get("rank") != rank:
        return False
    return True


def main():
    print(f"Loading {DATA}")
    with DATA.open() as f:
        entries = json.load(f)
    print(f"  {len(entries)} entries loaded")

    strip_plan = [
        ("science_chemistry", "science_technology", STRIPS_CHEMISTRY),
        ("science_physics",   "science_technology", STRIPS_PHYSICS),
        ("science_biology",   "science_technology", STRIPS_BIOLOGY),
        ("science_math",      "science_technology", STRIPS_MATH),
        ("science_astronomy", "science_technology", STRIPS_ASTRONOMY),
        ("science_general",   "science_technology", STRIPS_GENERAL),
        ("tech_computing",    "science_technology", STRIPS_COMPUTING),
    ]

    total_touched = 0
    tag_removals = Counter()

    for child_theme, parent_theme, strip_list in strip_plan:
        for (lemma, pos, rank) in strip_list:
            hit = False
            for e in entries:
                if not matches(e, lemma, pos, rank):
                    continue
                hit = True
                themes = list(e.get("themes") or [])
                original_len = len(themes)
                removed_here = []

                if child_theme in themes:
                    themes.remove(child_theme)
                    removed_here.append(child_theme)
                    tag_removals[child_theme] += 1

                # Also strip parent when child is being stripped for this entry.
                # Only strip parent if the entry has no OTHER child of the same parent.
                # For science_technology, the children are: science_chemistry, science_physics,
                # science_biology, science_math, science_astronomy, science_general, tech_computing.
                science_children = {
                    "science_chemistry", "science_physics", "science_biology",
                    "science_math", "science_astronomy", "science_general",
                    "tech_computing",
                }
                other_science_children = [t for t in themes if t in science_children]
                if parent_theme in themes and not other_science_children:
                    themes.remove(parent_theme)
                    removed_here.append(parent_theme)
                    tag_removals[parent_theme] += 1

                if removed_here:
                    e["themes"] = themes
                    existing_notes = (e.get("notes") or "").strip()
                    patch_note = f"{PATCH_MARKER} stripped {', '.join(removed_here)}: chemistry-flavoured link was spurious for this lemma"
                    e["notes"] = (existing_notes + " — " + patch_note) if existing_notes else patch_note
                    total_touched += 1
                    print(f"  '{lemma}' ({pos}, r{rank}) → stripped {removed_here}")
                break
            if not hit:
                print(f"  MISS: '{lemma}' ({pos}, r{rank})")

    print(f"\nTotal entries touched: {total_touched}")
    print(f"Tags removed: {dict(tag_removals)}")

    print(f"\nWriting back to {DATA}")
    atomic_write_json(DATA, entries)

    # Verify
    with DATA.open() as f:
        verify = json.load(f)
    chem_count = sum(1 for e in verify if "science_chemistry" in (e.get("themes") or []))
    tech_count = sum(1 for e in verify if "science_technology" in (e.get("themes") or []))
    print(f"\nAfter: science_chemistry has {chem_count} entries; science_technology has {tech_count}")


if __name__ == "__main__":
    main()
