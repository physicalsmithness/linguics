"""Wake sweep 2026-08-12: touch-up per marker_semantics v14 (QoderWork Job 7)
and v15 (Architecture ratifying v13).

Two deliverables:

  1. Delete 7 gap-fill artefacts. QoderWork's Job 7 flagged 6 "real words"
     among the 29 top-2000 [skip] entries. Investigation on 2026-08-12
     shows every one of those six is a POS-tagging or gender-tagging
     DUPLICATE — the correctly-tagged sibling entry already exists at
     another rank. Ruling: delete the artefacts rather than re-gloss.

     Also deleting alcuno rank 3589 (noun ambiguous, null gloss) — same
     shape: nominalisation of a pronoun, artefact.

  2. Apply arancio + arancione (both nouns) as equivalence class
     'orange_colour_noun' per Architecture v15 §2. The pair are noun
     synonyms for the colour orange; the adjective arancione is a
     separate lexeme (rank 5629) and stays out; arancia (the fruit)
     stays out per §1's homograph rule.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from atomic_io import atomic_write_json  # noqa: E402

DATA = PROJECT_ROOT / "data" / "vocabulary_it_frequency.json"
PATCH = "[wake-20260812]"

# (rank, lemma, pos, reason)
DELETES = [
    (1196, "produzione", "noun",
        "gap-fill dup: gender=m tagging error; correct entry is 1197 f (production)"),
    (1320, "pianeta", "noun",
        "gap-fill dup: gender=f tagging error; correct entry is 1319 m (planet, Greek -ma masc)"),
    (1401, "verde", "noun",
        "gap-fill dup: gender=f tagging error; noun sense is 1128 m (green, greenery), adj at 1078"),
    (1676, "massa", "adverb",
        "gap-fill dup: pos=adverb tagging error; correct entry is 1477 f noun (mass, bulk; physics)"),
    (1838, "alcuno", "verb",
        "gap-fill dup: pos=verb tagging error; correct entries are 237 pronoun + 3209 adjective"),
    (1497, "esercire", "verb",
        "corpus artefact: non-standard/archaic; standard form is esercitare (already in corpus)"),
    (3589, "alcuno", "noun",
        "gap-fill dup: nominalisation of pronoun (237 pronoun + 3209 adjective cover usage); null gloss + ambiguous gender = artefact"),
]

# (lemma, pos, class_id, per-entry rider)
APPLY_EQCLASS = [
    ("arancio", "noun", "orange_colour_noun",
        "orange (colour, noun); tree sense secondary — architect v15 §2 ratified as noun-only class"),
    ("arancione", "noun", "orange_colour_noun",
        "orange (colour, noun); adj sense at 5629 stays a separate lexeme per §2"),
]


def main():
    with DATA.open() as f:
        entries = json.load(f)
    print(f"Loaded {len(entries)} entries")

    # --- deletes ---
    delete_keys = {(r, l, p) for r, l, p, _ in DELETES}
    kept = []
    deleted = 0
    for e in entries:
        key = (e.get("rank"), e.get("lemma"), e.get("pos"))
        if key in delete_keys:
            reason = next(n for r, l, p, n in DELETES if (r, l, p) == key)
            print(f"  DELETE rank {key[0]:>4} lemma={key[1]!r} pos={key[2]!r}: {reason}")
            deleted += 1
        else:
            kept.append(e)
    print(f"\nDeleted: {deleted}\n")

    # --- eq-class apply ---
    applied = 0
    for lemma, pos, cid, rider in APPLY_EQCLASS:
        hits = [e for e in kept if e.get("lemma") == lemma and e.get("pos") == pos]
        if len(hits) != 1:
            print(f"  MISS/AMBIG: {lemma} ({pos}) — {len(hits)} hits")
            continue
        e = hits[0]
        if e.get("equivalence_class"):
            print(f"  CLASH: {lemma} ({pos}) already tagged {e['equivalence_class']}")
            continue
        e["equivalence_class"] = cid
        existing = (e.get("notes") or "").strip()
        note = f"{PATCH} class={cid} — {rider}"
        e["notes"] = (existing + " — " + note) if existing else note
        print(f"  applied: {lemma} ({pos}) → {cid}")
        applied += 1
    print(f"\nApplied: {applied}\n")

    print(f"Writing back {len(kept)} entries (was {len(entries)})")
    atomic_write_json(DATA, kept)

    # verify
    with DATA.open() as f:
        v = json.load(f)
    from collections import Counter
    classes = Counter(e.get("equivalence_class") for e in v if e.get("equivalence_class"))
    print(f"\nGrand total: {sum(classes.values())} eq-class entries in {len(classes)} classes; singletons: {sum(1 for c,n in classes.items() if n==1)}")

    # verify [skip] count in top 2000 dropped
    skip_top2k = [e for e in v if e.get("translation_en") == "[skip]" and (e.get("rank") or 99999) <= 2000]
    print(f"[skip] in top 2000 now: {len(skip_top2k)} (was 29; expected 23 = 29 - 6 deleted)")


if __name__ == "__main__":
    main()
