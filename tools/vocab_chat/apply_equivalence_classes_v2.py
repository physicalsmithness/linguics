"""Apply the 6 architect-ratified equivalence classes plus the
translation_en harmonisations they require, plus the il (pronoun) cleanup,
per Architecture_Vocab_equivalence_class_proposals v2.

The architect's specific ruling on each class:

1. car_noun — auto + automobile. Harmonise both to "car, automobile".
2. motorbike_noun — moto (f) + motocicletta. Harmonise motocicletta to "motorbike, motorcycle".
3. bicycle_noun — bici + bicicletta. Trim bici to "bicycle, bike" (residue removed). Harmonise bicicletta.
4. airplane_noun — aereo (m noun) + aeroplano. Both to "airplane, aeroplane, plane".
5. fridge_noun — frigo + frigorifero. Already harmonised; just tag.
6. immediately_adv — subito + immediatamente. Harmonise immediatamente to "immediately, right away".

Plus: delete the `il (pronoun)` entry at rank 2 (architect's preference over [skip],
since a wrong-POS entry isn't genuine noise and the row doesn't need to exist for
sum-clean-denominator reasons).

Run from project root:
    python3 tools/vocab_chat/apply_equivalence_classes_v2.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from atomic_io import atomic_write_json  # noqa: E402

DATA = PROJECT_ROOT / "data" / "vocabulary_it_frequency.json"

PATCH_MARKER = "[equivalence-class-v2-apply]"

# (lemma, pos, rank, gender_optional) → (class_id, harmonised_translation_or_None_if_unchanged)
# gender_optional disambiguates (moto f vs moto m, aereo noun vs aereo adj).
PATCHES = [
    # (lemma, pos, rank, gender, class_id, harmonised_translation_en_or_None)
    ("auto",         "noun",   597,  "f", "car_noun",        "car, automobile"),
    ("automobile",   "noun",   3688, "f", "car_noun",        "car, automobile"),
    ("moto",         "noun",   1052, "f", "motorbike_noun",  None),   # unchanged
    ("motocicletta", "noun",   9261, "f", "motorbike_noun",  "motorbike, motorcycle"),
    ("bici",         "noun",   3410, "f", "bicycle_noun",    "bicycle, bike"),
    ("bicicletta",   "noun",   4303, "f", "bicycle_noun",    "bicycle, bike"),
    ("aereo",        "noun",   1206, "m", "airplane_noun",   "airplane, aeroplane, plane"),
    ("aeroplano",    "noun",   9450, "m", "airplane_noun",   "airplane, aeroplane, plane"),
    ("frigo",        "noun",   4996, "m", "fridge_noun",     None),   # unchanged
    ("frigorifero",  "noun",   6804, "m", "fridge_noun",     None),   # unchanged
    ("subito",       "adverb", 118,  None, "immediately_adv", None),   # unchanged
    ("immediatamente", "adverb", 1236, None, "immediately_adv", "immediately, right away"),
]


def main():
    print(f"Loading {DATA}")
    with DATA.open() as f:
        entries = json.load(f)
    print(f"  {len(entries)} entries loaded")

    applied = []
    misses = []
    harmonised = 0

    for (lemma, pos, rank, gender, cls, new_trans) in PATCHES:
        hit = False
        for e in entries:
            if e.get("lemma") == lemma and e.get("pos") == pos and e.get("rank") == rank:
                if gender is not None and e.get("gender") != gender:
                    continue
                hit = True
                e["equivalence_class"] = cls
                old_trans = e.get("translation_en")
                if new_trans is not None and old_trans != new_trans:
                    e["translation_en"] = new_trans
                    harmonised += 1
                existing_notes = (e.get("notes") or "").strip()
                if new_trans is not None and old_trans != new_trans:
                    patch_note = f"{PATCH_MARKER} class={cls}; translation harmonised from '{old_trans}' to '{new_trans}'"
                else:
                    patch_note = f"{PATCH_MARKER} class={cls}; translation_en unchanged"
                e["notes"] = (existing_notes + " — " + patch_note) if existing_notes else patch_note
                applied.append((lemma, pos, rank, gender, cls, old_trans, new_trans))
                break
        if not hit:
            misses.append((lemma, pos, rank, gender, cls))

    print(f"\nClass tags applied: {len(applied)}")
    print(f"Translations harmonised: {harmonised}")
    for lemma, pos, rank, gender, cls, old, new in applied:
        change = f"  '{old}' → '{new}'" if (new is not None and old != new) else "  (translation unchanged)"
        print(f"  {lemma:14} ({pos}, r{rank}, g={gender}) class={cls}")
        print(f"    {change}")

    if misses:
        print(f"\nMISSES: {len(misses)}")
        for m in misses:
            print(f"  {m}")

    # il (pronoun) cleanup — delete the entry per architect's preference.
    before_count = len(entries)
    entries = [
        e for e in entries
        if not (e.get("lemma") == "il" and e.get("pos") == "pronoun" and e.get("rank") == 2)
    ]
    deleted_il = before_count - len(entries)
    if deleted_il:
        print(f"\nDeleted il (pronoun) at rank 2: {deleted_il} row(s)")
    else:
        print(f"\nNote: il (pronoun) at rank 2 was already absent")

    print(f"\nWriting back to {DATA}")
    atomic_write_json(DATA, entries)

    # Verify
    with DATA.open() as f:
        verify = json.load(f)
    from collections import Counter
    class_counts = Counter()
    for e in verify:
        ec = e.get("equivalence_class")
        if ec:
            class_counts[ec] += 1
    print(f"\nFinal entry count: {len(verify)}")
    print("Equivalence-class distribution:")
    for c, n in sorted(class_counts.items()):
        print(f"  {c}: {n}")

    # Spot-check the il (pronoun) is gone
    il_pron = [e for e in verify if e.get("lemma") == "il" and e.get("pos") == "pronoun"]
    print(f"\nil (pronoun) entries remaining: {len(il_pron)}")


if __name__ == "__main__":
    main()
