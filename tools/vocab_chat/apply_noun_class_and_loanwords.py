"""Apply noun_class_taxonomy Job 6b residue + Job 6c loanword proposals safely.

Per noun_class_taxonomy v2 (QoderWork, 2026-08-06):
  - 542 noun_class residue entries in data/noun_class_residue_2026-08-06.json
  - 644 loanword gender proposals in data/loanword_gender_proposals_2026-08-06.json
    with method "consonant-final → m at 0.75 confidence"

Safety approach:
  - LOANWORDS: only apply proposal where the target entry has a real translation
    (non-null, non-[skip]). English-word junk previously deleted or skip-marked
    stays untouched — no gender for junk.
  - NOUN_CLASS RESIDUE: apply MECHANICAL RULES only:
    * lemma ends in -ma and gender=m → greek_ma_masc (schema class already
      exists with 23 members; extend)
    * lemma ends in -ista/-cida/-eta/-ega and any gender → ista_common_gender
    Everything else stays unclassified for hand review later.

Run from project root:
    python3 tools/vocab_chat/apply_noun_class_and_loanwords.py
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
RESIDUE = PROJECT_ROOT / "data" / "noun_class_residue_2026-08-06.json"
LOANWORD = PROJECT_ROOT / "data" / "loanword_gender_proposals_2026-08-06.json"

PATCH_MARKER = "[noun-class-loanword-2026-08-03]"


def main():
    with DATA.open() as f:
        entries = json.load(f)
    print(f"Loaded {len(entries)} entries")

    with RESIDUE.open() as f:
        residue = json.load(f)
    with LOANWORD.open() as f:
        loanwords = json.load(f)

    # Build lookup by lemma+pos (residue doesn't carry rank precisely)
    entry_lookup = {}
    for e in entries:
        key = (e.get("lemma"), e.get("pos"), e.get("rank"))
        entry_lookup[key] = e

    # ---------- LOANWORDS ----------
    print("\n=== Loanword proposals ===")
    loan_applied = 0
    loan_skipped_junk = 0
    loan_skipped_notfound = 0

    for prop in loanwords["proposals"]:
        lemma = prop.get("lemma")
        proposed_gender = prop.get("proposed_gender", "m")
        # Find matching entry
        candidates = [e for e in entries
                      if e.get("lemma") == lemma
                      and e.get("pos") == "noun"
                      and e.get("gender") == "ambiguous"]
        if not candidates:
            loan_skipped_notfound += 1
            continue

        # Filter: only apply if entry has a real translation (not null, not [skip])
        for e in candidates:
            t = e.get("translation_en")
            if not t or t == "[skip]":
                loan_skipped_junk += 1
                continue
            e["gender"] = proposed_gender
            existing = (e.get("notes") or "").strip()
            note = f"{PATCH_MARKER} loanword gender proposal accepted: consonant-final → {proposed_gender} (conf 0.75)"
            e["notes"] = (existing + " — " + note) if existing else note
            loan_applied += 1

    print(f"  Applied: {loan_applied}")
    print(f"  Skipped (junk/no translation): {loan_skipped_junk}")
    print(f"  Skipped (no matching ambiguous-gender entry): {loan_skipped_notfound}")

    # ---------- NOUN_CLASS RESIDUE — MECHANICAL RULES ----------
    print("\n=== noun_class residue — mechanical rules ===")

    # Rule 1: -ma ending with gender=m → greek_ma_masc
    # (problema, sistema, tema, programma, poema, dogma, drama, ...)
    r_greek_ma = 0
    for e in entries:
        if (e.get("pos") == "noun"
            and e.get("noun_class") is None
            and (e.get("lemma") or "").endswith("ma")
            and e.get("gender") == "m"):
            e["noun_class"] = "greek_ma_masc"
            existing = (e.get("notes") or "").strip()
            note = f"{PATCH_MARKER} noun_class=greek_ma_masc (m-noun ending -ma; Greek-derived class)"
            e["notes"] = (existing + " — " + note) if existing else note
            r_greek_ma += 1
    print(f"  greek_ma_masc: +{r_greek_ma}")

    # Rule 2: -ista / -cida / -iatra / -logo / -grafa endings with any gender → ista_common_gender
    # (giornalista, artista, terrorista, omicida, pediatra, biologo, geologo, ...)
    # Actually biologo/geologo are m only; ista family is common. Restrict to true -ista.
    r_ista = 0
    ISTA_ENDINGS = ("ista", "cida", "iatra")
    for e in entries:
        if (e.get("pos") == "noun"
            and e.get("noun_class") is None
            and any((e.get("lemma") or "").endswith(end) for end in ISTA_ENDINGS)):
            e["noun_class"] = "ista_common_gender"
            existing = (e.get("notes") or "").strip()
            note = f"{PATCH_MARKER} noun_class=ista_common_gender (-ista/-cida/-iatra invariant common-gender)"
            e["notes"] = (existing + " — " + note) if existing else note
            r_ista += 1
    print(f"  ista_common_gender: +{r_ista}")

    # Rule 3: -eta / -oma endings with gender=m and Greek origin — probably greek_ma_masc-like
    # Skip for now, too varied

    # Report the remaining unclassified count
    still_null = sum(1 for e in entries
                     if e.get("pos") == "noun" and e.get("noun_class") is None)
    print(f"\nRemaining nouns with no noun_class: {still_null}")

    print(f"\nWriting back to {DATA}")
    atomic_write_json(DATA, entries)

    # Final class distribution
    with DATA.open() as f:
        verify = json.load(f)
    from collections import Counter
    dist = Counter(e.get("noun_class") for e in verify if e.get("pos") == "noun")
    print(f"\nFinal noun_class distribution (noun entries only):")
    for c, n in dist.most_common():
        print(f"  {c or '(null)'}: {n}")

    # Loanword-affected count
    loan_after = sum(1 for e in verify if e.get("gender") == "ambiguous")
    print(f"\nEntries with gender='ambiguous' still: {loan_after}")


if __name__ == "__main__":
    main()
