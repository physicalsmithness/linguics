"""Apply the marker_semantics reopen fixes (2026-07-21, 2026-07-27):
  1. Orange: split-by-sense on translation_en with paren disambiguators, plus
     `alternatives` field listing acceptable Italian synonyms for the same sense.
  2. Quanto (adverb): extend translation_en to include "how many" per architect's
     2026-07-27 ruling.
  3. Multi-valid audit: same shape for the other colours where noun sense may
     differ from adjective sense; ensure the noun entries carry sensible cross-
     lemma alternatives where a synonym exists.

The `alternatives` field is populated per architect's ratified design. Housing's
markVocab currently derives acceptable-answer via cross-lemma union (line 5597)
in soft/none regime, so this field is speculative for the moment — but populating
it is the ratified data shape, and Housing can wire an explicit reader for the
hard-regime case where cross-lemma is skipped.

Run from project root:
    python3 tools/vocab_chat/fix_multi_valid_translations.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from atomic_io import atomic_write_json  # noqa: E402

DATA = PROJECT_ROOT / "data" / "vocabulary_it_frequency.json"
PATCH_MARKER = "[multi-valid-fix-2026-08]"

# (lemma, pos, rank, gender_or_None) -> {"translation_en": ..., "alternatives": [...]}
PATCHES = {
    # ORANGE — fruit vs colour, both nouns. arancia is only fruit; arancione
    # and arancio share the colour sense; arancio also means the fruit tree.
    ("arancia", "noun", 6171, "f"): {
        "translation_en": "orange (the fruit)",
        "alternatives": [],  # arancia has no synonym for the fruit sense
    },
    ("arancione", "noun", 10948, "m"): {
        "translation_en": "orange (the colour)",
        "alternatives": ["arancio"],  # arancio also names the colour
    },
    ("arancione", "adjective", 5629, None): {
        # keep as-is; adjective is unambiguously the colour, no fruit/colour
        # noun-sense confusion here. Populate alternatives with the adj synonym.
        "translation_en": "orange (colour)",
        "alternatives": ["arancio"],  # arancio also works as colour adjective
    },
    ("arancio", "noun", 9844, "m"): {
        # Two senses: colour AND fruit-tree. Ambiguous but the fruit-tree
        # sense is niche; the colour is dominant.
        "translation_en": "orange (the colour); orange tree",
        "alternatives": ["arancione"],  # arancione as colour synonym
    },

    # QUANTO — adverb — architect ratified adding "how many"
    ("quanto", "adverb", 113, None): {
        "translation_en": "how much, as much as, how many",
        "alternatives": [],
    },

    # AUDIT PASS: colour-adj-vs-noun pattern. Where the noun sense (as
    # substantive, "the colour") could be confused with a homographic fruit /
    # plant / object, disambiguate. For most colours the noun sense IS just
    # "the colour" with no other meaning — no fix needed. Cases that ARE
    # ambiguous:
    #
    # - `rosa` — colour "pink" AND flower "rose". Split with parens.
    # - `giallo` — colour "yellow" AND detective story genre. Existing
    #   translation_en captures both; add sense parens.
    # - `viola` — colour "purple" AND flower "violet" AND instrument "viola".
    #   Existing translations already list; add sense parens.
    #
    # Non-ambiguous (no fix needed): rosso, verde, blu, marrone, grigio,
    # nero, bianco, azzurro — the noun sense is unambiguously "the colour".

    ("rosa", "noun", 3384, "f"): {
        # rosa (f) is the flower rose
        "translation_en": "rose (the flower)",
        "alternatives": [],
    },
    ("rosa", "noun", 3384, "m"): {
        # rosa (m) is the colour pink
        "translation_en": "pink (the colour)",
        "alternatives": [],
    },
    ("giallo", "noun", 1786, "m"): {
        # Multi-sense; the colour is dominant but the "giallo" genre (detective
        # story) is very common in Italian usage
        "translation_en": "yellow (the colour); detective story; detective film",
        "alternatives": [],
    },
    ("viola", "noun", 3750, "m"): {
        # viola (m) is the flower / the colour
        "translation_en": "violet (the flower or colour)",
        "alternatives": [],
    },
    ("viola", "noun", 3751, "f"): {
        # viola (f) is the musical instrument
        "translation_en": "viola (the musical instrument)",
        "alternatives": [],
    },
}


def matches(entry, lemma, pos, rank, gender):
    if entry.get("lemma") != lemma:
        return False
    if entry.get("pos") != pos:
        return False
    if entry.get("rank") != rank:
        return False
    # gender: None means "don't care" (matches any); "-" means the entry has
    # no gender set. We accept a match when gender is None in the key OR
    # when the entry's gender matches the key.
    if gender is not None and entry.get("gender") != gender:
        return False
    return True


def main():
    print(f"Loading {DATA}")
    with DATA.open() as f:
        entries = json.load(f)
    print(f"  {len(entries)} entries loaded")

    applied = []
    misses = []
    for (lemma, pos, rank, gender), patch in PATCHES.items():
        hit = False
        for e in entries:
            if not matches(e, lemma, pos, rank, gender):
                continue
            hit = True
            old_trans = e.get("translation_en")
            old_alts = e.get("alternatives")
            new_trans = patch["translation_en"]
            new_alts = patch["alternatives"]

            changes = []
            if old_trans != new_trans:
                e["translation_en"] = new_trans
                changes.append(f"trans: '{old_trans}' → '{new_trans}'")
            if e.get("alternatives") != new_alts:
                e["alternatives"] = new_alts
                changes.append(f"alternatives: {old_alts} → {new_alts}")

            if changes:
                existing_notes = (e.get("notes") or "").strip()
                patch_note = f"{PATCH_MARKER} " + "; ".join(changes)
                e["notes"] = (existing_notes + " — " + patch_note) if existing_notes else patch_note
                applied.append((lemma, pos, rank, gender, changes))
                print(f"  {lemma:12} ({pos:10} g={gender}, r{rank})")
                for c in changes:
                    print(f"    {c}")
            break
        if not hit:
            misses.append((lemma, pos, rank, gender))

    print(f"\nApplied: {len(applied)} entries")
    if misses:
        print(f"MISSES: {len(misses)}")
        for m in misses:
            print(f"  {m}")

    print(f"\nWriting back to {DATA}")
    atomic_write_json(DATA, entries)

    # Verify
    with DATA.open() as f:
        verify = json.load(f)
    with_alts = sum(1 for e in verify if e.get("alternatives") is not None)
    print(f"\nEntries with alternatives field set: {with_alts}")


if __name__ == "__main__":
    main()
