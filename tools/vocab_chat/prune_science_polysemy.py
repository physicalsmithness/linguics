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
STRIPS_CHEMISTRY = [
    ("roba", "noun", 1201),
    ("nodo", "noun", 3046),
    ("asse", "noun", 3687),
    ("corno", "noun", 4325),
    ("neo", "noun", 5119),
    ("persiano", "noun", 12447),
    ("marocchino", "noun", 11745),
    ("bulgaro", "noun", 12935),
    ("pelliccia", "noun", 6371),
    ("ceppo", "noun", 7222),
    ("sarda", "noun", 15220),
    ("cacca", "noun", 6991),
    ("merda", "noun", 1946),
    ("stronzo", "noun", 3654),
    ("attivo", "noun", 11754),
    ("rimanente", "noun", 8195),
    ("cartina", "noun", 6770),
    ("malta", "noun", 11486),
    ("e", "noun", 10729),
    ("e", "noun", 10730),
    ("azoto", "verb", 11131),
    ("azoto", "adjective", 13766),
    # Smith also flagged: linfa (body fluid, biochemistry-adjacent but really body)
    ("linfa", "noun", 10690),
]

STRIPS_PHYSICS = []  # populated in phase 2 after survey
STRIPS_BIOLOGY = []
STRIPS_MATH = []
STRIPS_ASTRONOMY = []
STRIPS_GENERAL = []
STRIPS_COMPUTING = []


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
