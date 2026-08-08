"""Hand-apply the two equivalence classes the FILTERED-reconcile dropped.

Root cause: my reconcile's S2 heuristic required `m.get("score", 0) == 1.0`.
Architecture's FILTERED file emits proposals with no `score` key (the filter
IS the ratification), so the check was False for every proposal there. That
kept the pre-existing 822-in-384 body correct but let two live cases sit.

Applies:
  1. albeit_conj: sebbene + benché (adverbial subordinator, both take
     subjunctive, gloss-identical, architect ratified as safe 2026-08-06)
  2. curt_adje:   secco + asciutto (adjective for 'dry'; my judgement below)

secco/asciutto judgement:
  The prompt-facing vocab drill asks "the Italian for 'dry'" — both are
  correct answers to that prompt. The interchangeability breaks at
  usage/collocation level (vino secco, panni asciutti), but the drill is
  prompt-driven single-word production and asymmetric mastery tracking
  already handles the imbalance: producing 'secco' when the target was
  'asciutto' credits secco's mastery only. This is exactly what the
  equivalence_class field was designed for — accepting the union, tracking
  the individual. One class, with a collocation note in the entries.

Run:
    python3 tools/vocab_chat/apply_two_hand_classes_2026-08-06.py
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
PATCH_MARKER = "[eq-class-hand-2026-08-06]"

# (lemma, pos, class_id, per-entry note)
APPLIES = [
    ("sebbene", "conjunction", "albeit_conj",
     "adverbial subordinator, subjunctive-taking; identical semantics to benché"),
    ("benché", "conjunction", "albeit_conj",
     "adverbial subordinator, subjunctive-taking; identical semantics to sebbene"),
    ("secco", "adjective", "curt_adje",
     "both accepted for prompt 'dry'; collocation-preferred with wine/food (vino secco)"),
    ("asciutto", "adjective", "curt_adje",
     "both accepted for prompt 'dry'; collocation-preferred with laundry/skin (panni asciutti)"),
]


def main():
    with DATA.open() as f:
        entries = json.load(f)

    changed = 0
    for lemma, pos, class_id, rider in APPLIES:
        hits = [e for e in entries if e.get("lemma") == lemma and e.get("pos") == pos]
        if not hits:
            print(f"  MISS: {lemma} ({pos}) not found")
            continue
        for e in hits:
            if e.get("equivalence_class") == class_id:
                print(f"  skip (already tagged): {lemma} ({pos}) → {class_id}")
                continue
            if e.get("equivalence_class"):
                print(f"  CLASH: {lemma} ({pos}) already tagged {e['equivalence_class']}, refusing to overwrite")
                continue
            e["equivalence_class"] = class_id
            existing = (e.get("notes") or "").strip()
            note = f"{PATCH_MARKER} class={class_id} — {rider}"
            e["notes"] = (existing + " — " + note) if existing else note
            print(f"  applied: {lemma} ({pos}) → {class_id}")
            changed += 1

    print(f"\nEntries modified: {changed}")
    atomic_write_json(DATA, entries)

    # Verify
    with DATA.open() as f:
        v = json.load(f)
    for cid in ("albeit_conj", "curt_adje"):
        members = [(e["lemma"], e["pos"]) for e in v if e.get("equivalence_class") == cid]
        print(f"  {cid}: {members}")

    classes = Counter(e.get("equivalence_class") for e in v if e.get("equivalence_class"))
    print(f"\nGrand total: {sum(classes.values())} entries in {len(classes)} classes; singletons: {sum(1 for c,n in classes.items() if n==1)}")


if __name__ == "__main__":
    main()
