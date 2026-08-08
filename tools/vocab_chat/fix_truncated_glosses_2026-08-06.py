"""Hand-fix the 29 remaining truncated glosses from Job 7c audit
(data/gloss_audit_2026-08-06.json), after the 5 verb:take fixes.

Groups fixed here:
  - adjective:dark (3 fixes + 1 English-junk delete)
  - noun:basket (4)
  - noun:collection (4)
  - noun:driver (4)
  - noun:fan (4; 2356 already fixed)
  - noun:helmet (3 fixes + 1 duplicate-gender-error delete)
  - noun:mole (3 fixes + 1 duplicate-gender-error delete)

Each fix widens the gloss to disambiguate from siblings AND (where the
tier-1 equivalence rule would false-equivalent them) removes the shared
one-word gloss from the leading position. Notes updated with a rationale
line so future audits can see the reasoning.

Deletes:
  - rank 6851 lemma "dark": English lemma+English gloss (gap-fill artefact,
    same class as the 23 we killed earlier).
  - rank 8773 casco (f): "il casco" is masculine; the f entry is a gap-fill
    artefact — 8774 (m) carries the correct gender + noun_class.
  - rank 8866 talpa (m): "la talpa" is feminine invariable for both the
    animal AND the figurative spy sense; the m entry is a gap-fill artefact.

Run:
    python3 tools/vocab_chat/fix_truncated_glosses_2026-08-06.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from atomic_io import atomic_write_json  # noqa: E402

DATA = PROJECT_ROOT / "data" / "vocabulary_it_frequency.json"
PATCH = "[gloss-widen-2026-08-06]"

# (rank, expected_lemma, new_gloss, sense_note)
WIDEN = [
    # ---- dark ----
    (394,   "scuro",       "dark (colour), dim, deep",
        "colour-modifier + light-quality sense; opposite of chiaro"),
    (2485,  "buio",        "dark, gloomy; darkness",
        "adjective for dark/gloomy; also noun 'darkness' (nel buio)"),
    (4042,  "moro",        "dark-haired, dark-skinned; Moorish",
        "personal-description sense; not the general colour adjective"),

    # ---- basket ----
    (9167,  "canestro",    "basket (basketball hoop; woven basket)",
        "sports + woven basket; distinct from cesta (large hamper)"),
    (12901, "cesta",       "large basket, hamper",
        "big woven basket for laundry/produce; larger than cestino"),
    (13998, "cestino",     "small basket, waste-paper basket, packed lunch",
        "diminutive; also 'trash' icon and 'lunch box'"),
    (15558, "paniere",     "market basket, basket (economics: of goods, of currencies)",
        "wicker basket for wares; also the economics term 'basket of goods'"),

    # ---- collection ----
    (2247,  "collezione",  "collection (art, stamps, curated set)",
        "curated set: art/stamps/coins; not gathering or harvest"),
    (4518,  "raccolta",    "collection (anthology, gathering), harvest",
        "gathering-of-things sense: anthology, book collection, harvest"),
    (12567, "colletta",    "collection (whip-round, church offering)",
        "money collected from a group for a cause; not a curated set"),
    (15161, "riscossione", "collection (of taxes, debts, payments)",
        "financial-collection sense; act of collecting money owed"),

    # ---- driver ----
    (4821,  "conduttore",  "driver, conductor (physics; TV host)",
        "person who drives/conducts; also physics 'conductor' and TV host"),
    (6089,  "conducente",  "driver (professional, of bus/taxi/train)",
        "professional-driver sense; formal register"),
    (8330,  "guidatore",   "driver (anyone driving a vehicle)",
        "generic driver-of-a-vehicle; less formal than conducente"),
    (9789,  "driver",      "driver (software; golf club)",
        "English loanword: computing sense + golf club"),

    # ---- fan ----
    (2355,  "fan",         "fan, enthusiast, supporter",
        "English loanword: person who admires/follows; not device"),
    (4575,  "tifoso",      "fan (sports supporter), ultra",
        "specifically a sports supporter; more intense than 'appassionato'"),
    (10890, "ventaglio",   "hand fan; range (fig., ventaglio di scelte)",
        "handheld fan; also figurative 'range/spread'"),
    (11261, "ventilatore", "electric fan, ventilator",
        "the mechanical device; not the person nor the handheld"),

    # ---- helmet ----
    (8774,  "casco",       "helmet (motorcycle, safety); hair-dryer hood",
        "il casco: protective headgear; distinct from military elmetto"),
    (9941,  "elmo",        "helmet (ancient, ceremonial, medieval)",
        "historical/ceremonial armour helmet; not modern safety gear"),
    (14701, "elmetto",     "helmet (military, hard hat)",
        "combat / construction protective helmet; formal register"),

    # ---- mole ----
    (5119,  "neo",         "mole (skin), beauty mark; flaw",
        "birthmark sense; figuratively a small flaw"),
    (7495,  "mole",        "mass, bulk, size, magnitude",
        "Italian mole = size/bulk; NOT the English animal/skin senses"),
    (8867,  "talpa",       "mole (animal); mole (informant, spy)",
        "la talpa: burrowing mammal + espionage sense; grammatically f"),
]

# Deletes
DELETES = [
    (6851, "dark",  "adjective",
        "English lemma with English gloss — gap-fill artefact; same class as the 23 English-junk deletes 2026-08-05"),
    (8773, "casco", "noun",
        "duplicate of rank 8774 with wrong gender=f; il casco is masculine — this entry is gap-fill artefact"),
    (8866, "talpa", "noun",
        "duplicate of rank 8867 with wrong gender=m; la talpa is feminine invariable (both animal & spy senses) — this entry is gap-fill artefact"),
]


def main():
    with DATA.open() as f:
        entries = json.load(f)
    print(f"Loaded {len(entries)} entries")

    by_rank = {e.get("rank"): e for e in entries}

    # ---- widens ----
    widened = 0
    for rank, expected_lemma, new_gloss, sense in WIDEN:
        e = by_rank.get(rank)
        if not e:
            print(f"  MISS rank {rank}")
            continue
        if e.get("lemma") != expected_lemma:
            print(f"  SKIP rank {rank}: lemma is {e.get('lemma')!r}, expected {expected_lemma!r}")
            continue
        old = e.get("translation_en")
        e["translation_en"] = new_gloss
        existing = (e.get("notes") or "").strip()
        note = f"{PATCH} widened gloss from {old!r} to {new_gloss!r}: {sense}"
        e["notes"] = (existing + " — " + note) if existing else note
        widened += 1
    print(f"Widened glosses: {widened}")

    # ---- deletes ----
    delete_keys = {(r, l, p) for r, l, p, _ in DELETES}
    kept = []
    deleted = 0
    for e in entries:
        key = (e.get("rank"), e.get("lemma"), e.get("pos"))
        if key in delete_keys:
            reason = next((n for r, l, p, n in DELETES if (r, l, p) == key), "")
            print(f"  DELETE rank {key[0]} lemma={key[1]} pos={key[2]}: {reason}")
            deleted += 1
        else:
            kept.append(e)
    print(f"Deleted: {deleted}")

    # Housekeeping: helmet_noun class may have lost a member; report if singleton
    from collections import Counter
    classes = Counter(e.get("equivalence_class") for e in kept if e.get("equivalence_class"))
    singletons = {c: n for c, n in classes.items() if n == 1}
    if singletons:
        print(f"\n  WARN singletons post-delete: {singletons}")
    else:
        print(f"\n  No singletons (good)")

    print(f"\nWriting back {len(kept)} entries (was {len(entries)})")
    atomic_write_json(DATA, kept)


if __name__ == "__main__":
    main()
