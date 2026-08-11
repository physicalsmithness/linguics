"""Revert the 2026-08-12 v2 subset-retry apply.

Reason: post-apply spot-check found the homograph pattern from marker_semantics
v15 §1 firing on ~15/28 subset-retries AND on a substantial fraction of the
322 "full-class-lifted" applies. Concrete false positives found in sampling:

  bat_noun:            mazza (baseball bat)     ≡ pipistrello (animal bat)
  arch_noun:           arco (arch, bow)         ≡ fiocco (ribbon bow)
  at_least_adve:       almeno (at least)        ≡ neppure (not even)  [gloss noise]
  already_adve:        già (already, yes)       ≡ sì (yes)  [colloquial "yes" bridge]
  ear_noun:            orecchio (body ear)      ≡ spiga (ear of grain)
  mud_noun:            fango (mud)              ≡ ceramica (ceramic)
  marble_noun:         marmo (stone marble)     ≡ pallina (toy marble)
  speaker_noun:        altoparlante (loudspkr)  ≡ interlocutore (interlocutor)
  desire_noun:         testamento (testament)   ≡ arbitrio (free will)
  source_noun:         fonte (source/spring)    ≡ primavera (Spring season)
  hard_adve:           duro (hit hard)          ≡ fitto (densely)
  die_by_drowning_verb:affogare (to drown)      ≡ inondare (to flood)
  appearance_noun:     apparenza (look)         ≡ comparizione (court appearance)
  cheat_noun:          trappola (trap)          ≡ baro (cheater person)

The v1 reconcile was correctly conservative on these (its score gate happened
to reject them all). The v2 subset-retry logic recovers sebbene/benché as
architect requested, but the same logic — enumerated over 486 filtered
proposals — surfaces homograph traps at scale.

Correct path: emit a proposal-of-proposals audit, ask architect for the
homograph guard spec, then re-apply with the guard bundled in. Not this
session's work; queued to inter_chat/Architecture_Vocab_marker_semantics.

This script untags every entry that carries the
[eq-class-subset-retry-2026-08-12] patch marker.
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
MARK = "[eq-class-subset-retry-2026-08-12]"


def main():
    with DATA.open() as f:
        entries = json.load(f)
    print(f"Loaded {len(entries)}")

    reverted = 0
    classes = set()
    for e in entries:
        notes = e.get("notes") or ""
        if MARK in notes:
            cid = e.get("equivalence_class")
            if cid:
                classes.add(cid)
            del e["equivalence_class"]
            # Strip the added note segment
            # (segments joined by ' — '; remove any containing the mark)
            segs = notes.split(" — ")
            kept_segs = [s for s in segs if MARK not in s]
            revert_note = "[eq-class-subset-retry-REVERTED-2026-08-12] apply reverted pending homograph-guard spec (marker_semantics v15 §1)"
            kept_segs.append(revert_note)
            e["notes"] = " — ".join(kept_segs)
            reverted += 1

    print(f"Reverted {reverted} entries across {len(classes)} classes")
    atomic_write_json(DATA, entries)

    with DATA.open() as f:
        v = json.load(f)
    cc = Counter(e.get("equivalence_class") for e in v if e.get("equivalence_class"))
    print(f"Post-revert: {sum(cc.values())} entries in {len(cc)} classes; singletons: {sum(1 for c,n in cc.items() if n==1)}")


if __name__ == "__main__":
    main()
