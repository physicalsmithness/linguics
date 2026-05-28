"""Add `equivalence_class` field (null by default) to every entry in the
curated dictionary. Populate the four classes ratified by the architect in
REPLY_TO_vocab_chat_marker_semantics.md §4.

Also applies two related fixes:

1. Trim `là`'s translation_en from "there, over there" to just "there", so the
   overlap math gives 100% credit when `lì` and `là` cross-match (per the
   architect's audit note in REPLY §3).

2. Patch the `ecc` entries: rank 9768 noun gets updated to lemma "ecc." with
   translation_en "etcetera" and the etc_abbrev class; rank 7394 adjective
   gets marked [skip] since "ecc" isn't an adjective.

Run from project root:
    python3 tools/vocab_chat/add_equivalence_class.py
"""
from __future__ import annotations

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from atomic_io import atomic_write_json  # noqa: E402
import json

DATA = PROJECT_ROOT / "data" / "vocabulary_it_frequency.json"

# Mapping: (lemma, pos, rank) -> equivalence_class
# Rank disambiguates when (lemma, pos) is ambiguous (e.g. solo adverb vs conjunction).
CLASS_MEMBERSHIP = {
    # only_adv: solo / soltanto / solamente, adverb senses only
    ("solo", "adverb", 48): "only_adv",
    ("soltanto", "adverb", 666): "only_adv",
    ("solamente", "adverb", 1572): "only_adv",

    # here_locative
    ("qui", "adverb", 92): "here_locative",
    ("qua", "adverb", 497): "here_locative",

    # there_locative
    ("lì", "adverb", 373): "there_locative",
    ("là", "adverb", 625): "there_locative",

    # etc_abbrev
    ("eccetera", "adverb", 5140): "etc_abbrev",
    # `ecc` noun (rank 9768) gets renamed to `ecc.` and joins the class — see fix below
    ("ecc.", "noun", 9768): "etc_abbrev",
}


def main():
    print(f"Loading {DATA}")
    with DATA.open() as f:
        entries = json.load(f)
    print(f"  {len(entries)} entries loaded")

    # 1. Add equivalence_class: null to every entry that lacks it
    added = 0
    for e in entries:
        if "equivalence_class" not in e:
            e["equivalence_class"] = None
            added += 1
    print(f"Added equivalence_class: null to {added} entries")

    # 2. Trim là to "there" — currently "there, over there" — for clean overlap math
    trimmed_la = 0
    for e in entries:
        if (e.get("lemma") == "là"
                and e.get("pos") == "adverb"
                and e.get("rank") == 625):
            old = e.get("translation_en")
            e["translation_en"] = "there"
            existing_notes = (e.get("notes") or "").strip()
            patch_note = (
                "[overlap-audit] translation_en trimmed from "
                f"'{old}' to 'there' so equivalence with lì gives clean 100% overlap math"
            )
            e["notes"] = (existing_notes + " — " + patch_note) if existing_notes else patch_note
            trimmed_la += 1
    print(f"Trimmed là translation_en: {trimmed_la}")

    # 3. Fix the ecc entries
    # - noun rank 9768 → lemma 'ecc.', translation 'etcetera', theme function_word
    # - adjective rank 7394 → translation '[skip]' since 'ecc' isn't an adjective
    fixed_ecc_noun = 0
    fixed_ecc_adj = 0
    for e in entries:
        if e.get("lemma") == "ecc" and e.get("rank") == 9768 and e.get("pos") == "noun":
            e["lemma"] = "ecc."
            e["translation_en"] = "etcetera"
            e["themes"] = ["function_word"]
            existing_notes = (e.get("notes") or "").strip()
            patch_note = "[ecc-patch] CSV stripped trailing dot; restored as ecc. abbreviation of eccetera"
            e["notes"] = (existing_notes + " — " + patch_note) if existing_notes else patch_note
            if e.get("translation_source") is None or e.get("translation_source") == "corpus_artefact":
                e["translation_source"] = "vocab_chat"
            fixed_ecc_noun += 1
        elif e.get("lemma") == "ecc" and e.get("rank") == 7394 and e.get("pos") == "adjective":
            e["translation_en"] = "[skip]"
            existing_notes = (e.get("notes") or "").strip()
            patch_note = "[ecc-patch] ecc is the abbreviation of eccetera, not an adjective; corpus POS-tagging artefact"
            e["notes"] = (existing_notes + " — " + patch_note) if existing_notes else patch_note
            e["translation_source"] = "corpus_artefact"
            fixed_ecc_adj += 1
    print(f"Fixed ecc noun (rank 9768): {fixed_ecc_noun}")
    print(f"Marked ecc adjective (rank 7394) as [skip]: {fixed_ecc_adj}")

    # 4. Populate the four ratified equivalence classes
    populated = {}
    misses = []
    for (lemma, pos, rank), cls in CLASS_MEMBERSHIP.items():
        hit = False
        for e in entries:
            if e.get("lemma") == lemma and e.get("pos") == pos and e.get("rank") == rank:
                e["equivalence_class"] = cls
                populated.setdefault(cls, []).append((lemma, pos, rank))
                hit = True
                break
        if not hit:
            misses.append((lemma, pos, rank, cls))
    print("\nEquivalence classes populated:")
    for cls, members in sorted(populated.items()):
        print(f"  {cls}: {len(members)} members")
        for lemma, pos, rank in members:
            print(f"    - {lemma} ({pos}, rank {rank})")
    if misses:
        print("\nMISSES:")
        for m in misses:
            print(f"  {m}")

    # 5. Write back atomically
    print(f"\nWriting back to {DATA}")
    atomic_write_json(DATA, entries)

    # 6. Verify on disk
    with DATA.open() as f:
        verify = json.load(f)
    eq_count = sum(1 for e in verify if "equivalence_class" in e)
    eq_set = sum(1 for e in verify if e.get("equivalence_class") is not None)
    print(f"Verification: {len(verify)} entries, {eq_count} have equivalence_class key, {eq_set} have non-null class")


if __name__ == "__main__":
    main()
