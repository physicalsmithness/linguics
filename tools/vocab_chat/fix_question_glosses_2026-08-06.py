"""Hand-fix the '?' glosses and null-gloss nominalisations from architect
audit 2026-08-06.

Widens:
  986 ricordo     '?' → 'memory, recollection; souvenir'
  987 intenzione  '?' → 'intention, intent, purpose'
  988 muro        '?' → 'wall (building, dividing structure)'
  992 dolce (adj) '?' → 'sweet, mild, gentle'
  993 materiale   '?' → 'material, substance, matter'
  996 risorsa     '?' → 'resource, asset'
  805 sito (adj)  'located, situated?' → 'located, situated (formal, participial use)'

Deletes:
  152  senza (interjection): duplicate of the 150 preposition entry;
       its own note flags 'POS from lemma-CSV is wrong' — this IS the
       gap-fill artefact.
  10936 importante (noun m):  'l'importante' is a grammatical
       substantivisation of the adjective; not a distinct lexeme.
  12469 ampio (noun m):       nominalisation not attested outside
       'l'ampio' as adjective substantivisation.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from atomic_io import atomic_write_json  # noqa: E402

DATA = PROJECT_ROOT / "data" / "vocabulary_it_frequency.json"
PATCH = "[gloss-fix-qmark-2026-08-06]"

# (rank, lemma, pos, new_gloss, sense)
WIDEN = [
    (986,  "ricordo",    "noun",      "memory, recollection; souvenir",
        "mental + physical sense; homograph of 1sg 'ricordo' verb form (separate entry if needed)"),
    (987,  "intenzione", "noun",      "intention, intent, purpose",
        "aver l'intenzione di + inf; also 'con l'intenzione di'"),
    (988,  "muro",       "noun",      "wall (of a building; dividing structure)",
        "distinguishes from parete (interior wall) and mura (city walls, f-pl per gender_class 7)"),
    (992,  "dolce",      "adjective", "sweet, mild, gentle",
        "adj sense; noun sense 'dessert' is at rank 2883, adverb 'sweetly' at 756"),
    (993,  "materiale",  "noun",      "material, substance, matter",
        "physical substance; also adjective sense at other entries (materiale = tangible)"),
    (996,  "risorsa",    "noun",      "resource, asset",
        "means available for use; general — economic, natural, or personal"),
    (805,  "sito",       "adjective", "located, situated (formal, participial)",
        "past-participle-derived; formal register; noun sense 'site/website' at rank 604"),
]

# (rank, lemma, pos, reason)
DELETES = [
    (152,   "senza",      "interjection",
        "duplicate of 150 preposition entry; POS-tag is wrong per own notes; interjection use is not attested"),
    (10936, "importante", "noun",
        "grammatical substantivisation (l'importante) not a distinct lexeme; the adjective sense at 241 covers usage"),
    (12469, "ampio",      "noun",
        "grammatical substantivisation not attested; the adjective sense at 1591 covers usage"),
]


def main():
    with DATA.open() as f:
        entries = json.load(f)
    print(f"Loaded {len(entries)} entries")

    # ---- widens ----
    widened = 0
    for rank, lemma, pos, new_gloss, sense in WIDEN:
        hits = [e for e in entries if e.get("rank") == rank and e.get("lemma") == lemma and e.get("pos") == pos]
        if len(hits) != 1:
            print(f"  MISS/AMBIG rank {rank} {lemma} ({pos}) — {len(hits)} hits")
            continue
        e = hits[0]
        old = e.get("translation_en")
        e["translation_en"] = new_gloss
        existing = (e.get("notes") or "").strip()
        note = f"{PATCH} widened gloss from {old!r} to {new_gloss!r}: {sense}"
        e["notes"] = (existing + " — " + note) if existing else note
        widened += 1
        print(f"  widened: {lemma} ({pos}) rank {rank} → {new_gloss!r}")
    print(f"\nWidened: {widened}\n")

    # ---- deletes ----
    delete_keys = {(r, l, p) for r, l, p, _ in DELETES}
    kept = []
    deleted = 0
    for e in entries:
        key = (e.get("rank"), e.get("lemma"), e.get("pos"))
        if key in delete_keys:
            reason = next(n for r, l, p, n in DELETES if (r, l, p) == key)
            print(f"  DELETE rank {key[0]} lemma={key[1]!r} pos={key[2]!r}: {reason}")
            deleted += 1
        else:
            kept.append(e)
    print(f"\nDeleted: {deleted}")

    print(f"\nWriting back {len(kept)} entries (was {len(entries)})")
    atomic_write_json(DATA, kept)

    # Verify no '?' left in top 2000
    with DATA.open() as f:
        v = json.load(f)
    qmark = [e for e in v if e.get("translation_en") and "?" in e.get("translation_en", "")]
    print(f"\nRemaining '?' glosses: {len(qmark)}")
    for e in qmark:
        print(f"  rank {e.get('rank')} {e.get('lemma')} ({e.get('pos')}): {e.get('translation_en')!r}")


if __name__ == "__main__":
    main()
