"""Continue the il/lo gloss-disambiguation patch per
Architecture_Vocab_marker_semantics §7. Applies the (direct object) /
(indirect object) clarifier to clitic-pronoun entries that collide with
article entries (same lemma, distinct POS, distinct meaning — hard disambig),
and the (determiner) / (pronoun) clarifier to demonstrative and possessive
entries where both POS are present.

Articles themselves were patched by Code's earlier pass (il, la, lo, un, una,
uno) plus the plural articles I added in tools/vocab_chat/add_plural_articles.py
(i, gli, le). This script handles the remaining items in §7's convention list.

The convention: append the clarifier at the END of the translation_en string,
in parens. The marker's clean+split pipeline strips parens before element
matching, so the clarifier is purely for prompt rendering / mastery-state
disambiguation, never matched against learner answers.

A `notes` patch-marker `[clitic-demo-poss-disambig]` is added for traceability.

Run from project root:
    python3 tools/vocab_chat/patch_clitic_demo_poss_disambig.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from atomic_io import atomic_write_json  # noqa: E402

DATA = PROJECT_ROOT / "data" / "vocabulary_it_frequency.json"

# (lemma, pos, rank) → (clarifier, extra_note_or_None)
# Each patch appends ` (clarifier)` to the entry's translation_en, unless the
# translation_en already ends in a parenthetical (idempotency check).
PATCHES = {
    # Clitic-pronoun + article collisions (hard disambig)
    # lo article exists at r14 ("the (m sg, before s+cons / z / gn / ps / x / y / i+vowel)");
    # lo pronoun at r14 is the m-sg direct-object clitic.
    ("lo", "pronoun", 14): (
        "direct object",
        None,
    ),
    # il pronoun at r2 — suspect (modern Italian uses lo for the m-sg direct object clitic,
    # not il). Applied for convention consistency; flagged in notes for the audit.
    ("il", "pronoun", 2): (
        "direct object",
        "translation_en source is suspect; il is not a clitic in modern Italian (lo is the m-sg direct-object clitic). Likely CSV-source artefact or archaic form. Flagged for audit.",
    ),

    # Demonstratives — soft disambig (both senses sit at the same lemma; meanings closely related)
    ("questo", "determiner", 20): ("determiner", None),
    ("questo", "pronoun", 20): ("pronoun", None),
    ("quello", "determiner", 36): ("determiner", None),
    ("quello", "pronoun", 36): ("pronoun", None),

    # Possessives — soft disambig
    ("mio", "determiner", 35): ("determiner", None),
    ("mio", "pronoun", 35): ("pronoun", None),
    ("tuo", "determiner", 64): ("determiner", None),
    ("tuo", "pronoun", 64): ("pronoun", None),
    ("suo", "determiner", 41): ("determiner", None),
    ("suo", "pronoun", 41): ("pronoun", None),
    ("nostro", "determiner", 104): ("determiner", None),
    ("nostro", "pronoun", 104): ("pronoun", None),
    ("vostro", "determiner", 238): ("determiner", None),
    ("vostro", "pronoun", 238): ("pronoun", None),
}

PATCH_MARKER = "[clitic-demo-poss-disambig]"


def already_clarified(translation_en: str | None) -> bool:
    """True if the translation already ends with a parenthetical (idempotent guard)."""
    if not translation_en:
        return False
    s = translation_en.rstrip()
    return s.endswith(")")


def main():
    print(f"Loading {DATA}")
    with DATA.open() as f:
        entries = json.load(f)
    print(f"  {len(entries)} entries loaded")

    applied = []
    skipped_already_clarified = []
    misses = []

    for (lemma, pos, rank), (clarifier, extra_note) in PATCHES.items():
        hit = False
        for e in entries:
            if e.get("lemma") == lemma and e.get("pos") == pos and e.get("rank") == rank:
                hit = True
                trans = e.get("translation_en")
                if already_clarified(trans):
                    skipped_already_clarified.append((lemma, pos, rank, trans))
                else:
                    new_trans = f"{trans} ({clarifier})" if trans else f"({clarifier})"
                    e["translation_en"] = new_trans
                    existing_notes = (e.get("notes") or "").strip()
                    patch_note = f"{PATCH_MARKER} translation_en clarified as '({clarifier})' per Architecture_Vocab_marker_semantics §7"
                    if extra_note:
                        patch_note += f"; {extra_note}"
                    e["notes"] = (existing_notes + " — " + patch_note) if existing_notes else patch_note
                    applied.append((lemma, pos, rank, trans, new_trans))
                break
        if not hit:
            misses.append((lemma, pos, rank))

    print(f"\nApplied: {len(applied)}")
    for lemma, pos, rank, old, new in applied:
        print(f"  {lemma:10} {pos:11} r{rank:>4}  '{old}' → '{new}'")

    if skipped_already_clarified:
        print(f"\nSkipped (already clarified): {len(skipped_already_clarified)}")
        for lemma, pos, rank, trans in skipped_already_clarified:
            print(f"  {lemma:10} {pos:11} r{rank:>4}  '{trans}'")

    if misses:
        print(f"\nMISSES: {len(misses)}")
        for m in misses:
            print(f"  {m}")

    print(f"\nWriting back to {DATA}")
    atomic_write_json(DATA, entries)

    # Verify
    with DATA.open() as f:
        verify = json.load(f)
    clarified_count = 0
    for (lemma, pos, rank), _ in PATCHES.items():
        for e in verify:
            if e.get("lemma") == lemma and e.get("pos") == pos and e.get("rank") == rank:
                if already_clarified(e.get("translation_en")):
                    clarified_count += 1
                break
    print(f"\nVerification: {clarified_count}/{len(PATCHES)} target entries end in a parenthetical clarifier")


if __name__ == "__main__":
    main()
