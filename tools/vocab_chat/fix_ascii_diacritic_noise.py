"""Mark ASCII-residue duplicates of accented Italian lemmas as [skip].

Per AUTHOR_BRIEF rev 6 §2 rule 1: "Carry the citation form's full diacritics.
The lemma is città, not citta." Several entries in the curated dictionary have
the ASCII (no-diacritic) form of a real Italian accented lemma:

- corpus tokenisation stripped the accent
- the entry has NULL translation_en (the bulk pipeline didn't recognise it)
- the canonical accented form already exists elsewhere with a real translation

These ASCII entries are corpus artefacts. Mark them [skip] with translation_source
"corpus_artefact" and the [ascii-diacritic-noise] notes patch.

Also handles the puo / può case: `può` is a conjugation of potere (not a
standalone lemma), but the ASCII `puo` rows are still noise.

Run from project root:
    python3 tools/vocab_chat/fix_ascii_diacritic_noise.py
"""
from __future__ import annotations

import json
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from atomic_io import atomic_write_json  # noqa: E402

DATA = PROJECT_ROOT / "data" / "vocabulary_it_frequency.json"

PATCH_MARKER = "[ascii-diacritic-noise]"

# Manual list of (lemma, accented_form) where the ASCII lemma is noise
# AND the proper Italian word doesn't exist as a separate lemma in the data
# (so the broader scan can't catch them). These are conjugations / phrases.
EXTRA_NOISE = {
    "puo": "può",  # 3sg of potere, not a standalone lemma; canonical is `potere`
}


def main():
    print(f"Loading {DATA}")
    with DATA.open() as f:
        entries = json.load(f)
    print(f"  {len(entries)} entries loaded")

    # Build map: ASCII-normalised form → list of accented entries with real translations
    norm_to_accented = defaultdict(list)
    for e in entries:
        lemma = e.get("lemma") or ""
        if not lemma or lemma.isascii():
            continue
        if not e.get("translation_en") or e["translation_en"] == "[skip]":
            continue
        norm = unicodedata.normalize("NFD", lemma).encode("ascii", "ignore").decode("ascii").lower()
        if norm:
            norm_to_accented[norm].append(lemma)

    skipped = []

    # 1. Broader pattern: ASCII lemmas with NULL translation whose accented twin exists
    for e in entries:
        lemma = e.get("lemma") or ""
        if not lemma or not lemma.isascii():
            continue
        if e.get("translation_en"):
            continue
        L = lemma.lower()
        if L in norm_to_accented:
            twins = norm_to_accented[L]
            e["translation_en"] = "[skip]"
            e["translation_source"] = "corpus_artefact"
            existing_notes = (e.get("notes") or "").strip()
            twin_str = " / ".join(twins[:3])
            patch_note = f"{PATCH_MARKER} ASCII duplicate; canonical lemma with diacritics: '{twin_str}'"
            e["notes"] = (existing_notes + " — " + patch_note) if existing_notes else patch_note
            skipped.append((e.get("rank"), lemma, e.get("pos"), twin_str))

    # 2. Extra manual list (puo etc.)
    for ascii_lemma, canonical in EXTRA_NOISE.items():
        for e in entries:
            if (e.get("lemma") == ascii_lemma
                    and not e.get("translation_en")):
                e["translation_en"] = "[skip]"
                e["translation_source"] = "corpus_artefact"
                existing_notes = (e.get("notes") or "").strip()
                patch_note = f"{PATCH_MARKER} ASCII residue; canonical accented form '{canonical}' is a verb conjugation of potere (no standalone lemma)"
                e["notes"] = (existing_notes + " — " + patch_note) if existing_notes else patch_note
                skipped.append((e.get("rank"), ascii_lemma, e.get("pos"), canonical + " (conj)"))

    print(f"\nSkip-marked: {len(skipped)} entries")
    for rank, lemma, pos, twin in sorted(skipped):
        print(f"  r{rank:>5} '{lemma}' {pos:10}  → [skip] (twin: {twin})")

    print(f"\nWriting back to {DATA}")
    atomic_write_json(DATA, entries)

    # Verify
    with DATA.open() as f:
        verify = json.load(f)
    print(f"\nVerification: {len(verify)} entries")

    # Recount: how many ASCII-NULL-with-accented-twin remain?
    remaining = 0
    for e in verify:
        lemma = e.get("lemma") or ""
        if not lemma or not lemma.isascii():
            continue
        if e.get("translation_en"):
            continue
        L = lemma.lower()
        if L in norm_to_accented:
            remaining += 1
    print(f"  Remaining ASCII-NULL-with-accented-twin entries: {remaining}")


if __name__ == "__main__":
    main()
