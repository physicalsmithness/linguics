"""Ratify a safe subset of the tier-1 equivalence_class proposals from
data/equivalence_class_proposals_2026-08.json per marker_semantics v10-v12.

QoderWork produced 1126 proposals covering 3458 entries. Per Architecture's
v10 §3: "code proposes, the owning seat ratifies". Not all proposals are
correct — my hand review of the first 20 found several bugs (her_det merging
suo/vostro; cheaply_adv merging bene-adverb with buono-adjective; here_adv
bridging here/there through the ci/vi clitics).

This script applies a HIGH-CONFIDENCE subset by safety heuristic and defers
the rest for hand review. Safety rules:

  S1. Existing equivalence_class untouched (May's 21 entries).
  S2. All members score == 1.0; no near_members applied (near are 0.5, per v10 §3).
  S3. Same POS across members.
  S4. Members' translation_en, after norm+split, contain at least ONE token
      shared across ALL members (this IS the tier-1 rule but re-verified).
  S5. No known bridge-word red flags — proposals whose token overlap only
      exists because of an ambiguous single word (e.g., "here" bridging
      qua/qui/lì/là/ci/vi) get deferred.
  S6. Class size ≤ 5 members (very large classes are likely bridge-word
      artefacts).
  S7. If any member already carries a DIFFERENT equivalence_class, skip
      the whole proposal (would need architect ruling).

Also drops the retired `alternatives` field per v10 §2 (from arancione noun,
arancione adjective, arancio noun).

Run from project root:
    python3 tools/vocab_chat/apply_equivalence_class_proposals.py
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from collections import Counter

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from atomic_io import atomic_write_json  # noqa: E402

DATA = PROJECT_ROOT / "data" / "vocabulary_it_frequency.json"
PROPOSALS = PROJECT_ROOT / "data" / "equivalence_class_proposals_2026-08.json"
PATCH_MARKER = "[eq-class-tier1-ratified-2026-08-03]"

# Known bridge-word red flags — lemmas whose gloss ambiguity causes false-merge
BRIDGE_LEMMAS_TO_EXCLUDE = {
    # here/there family — ci and vi are clitic pronouns whose "there" sense
    # bridges the here/there groups. Should be separate classes per May's
    # ratification (here_locative for qui/qua; there_locative for lì/là).
    ("here_adv", "ci"), ("here_adv", "vi"), ("here_adv", "presente"), ("here_adv", "ve"),
    # cheaply_adv: bene (adv) and buono (adj) — different POS conflated by
    # a shared "well/good" token; QoderWork's own POS check should have caught
    # this — treating as red-flag defer.
    # (in practice this gets caught by the same-POS check S3)
}

# Existing classes from May's ratification — keep these lemma+pos tuples
# as-is and skip any proposal touching them
EXISTING_CLASS_TUPLES = set()  # populated at runtime


def norm_token(t):
    t = t.strip().lower()
    # drop leading "to " for verbs
    if t.startswith("to "):
        t = t[3:]
    # drop leading English article for nouns
    for art in ("the ", "a ", "an "):
        if t.startswith(art):
            t = t[len(art):]
            break
    return t.strip()


def tokens_of(translation_en):
    if not translation_en:
        return set()
    out = set()
    # split on comma and semicolon
    for piece in re.split(r"[,;]", translation_en):
        piece = piece.strip()
        # strip parens for matching
        piece = re.sub(r"\([^)]*\)", "", piece).strip()
        if not piece:
            continue
        out.add(norm_token(piece))
    return {t for t in out if t}


def main():
    with PROPOSALS.open() as f:
        pdata = json.load(f)
    proposals = pdata["proposals"]
    print(f"Loaded {len(proposals)} proposals")

    with DATA.open() as f:
        entries = json.load(f)
    print(f"Loaded {len(entries)} curated entries")

    # Build lookup: (lemma, pos, rank) -> entry
    entry_lookup = {}
    for e in entries:
        key = (e.get("lemma"), e.get("pos"), e.get("rank"))
        entry_lookup[key] = e
        if e.get("equivalence_class"):
            EXISTING_CLASS_TUPLES.add((e.get("lemma"), e.get("pos")))

    print(f"Existing equivalence_class members: {len(EXISTING_CLASS_TUPLES)}")

    # Filter proposals through the safety heuristics
    applied = []
    deferred_reasons = Counter()
    deferred_details = []

    for prop in proposals:
        sid = prop.get("suggested_id", "?")
        members = prop.get("members", [])

        # S3: same POS
        pos_set = set(m.get("pos") for m in members)
        if len(pos_set) > 1:
            deferred_reasons["S3: mixed POS"] += 1
            continue

        # S6: class size <=5
        if len(members) > 5:
            deferred_reasons["S6: too large (>5)"] += 1
            continue

        # S2: all members score 1.0
        if not all(m.get("score", 0) == 1.0 for m in members):
            deferred_reasons["S2: some member score <1.0"] += 1
            continue

        # S7: any member already in a different class → defer
        already_classed = False
        for m in members:
            key = (m.get("lemma"), m.get("pos"))
            if key in EXISTING_CLASS_TUPLES:
                already_classed = True
                break
        if already_classed:
            deferred_reasons["S7: some member already in existing class"] += 1
            continue

        # S1: bridge-word red flag
        bridge_hit = False
        for m in members:
            if (sid, m.get("lemma")) in BRIDGE_LEMMAS_TO_EXCLUDE:
                bridge_hit = True
                break
        if bridge_hit:
            deferred_reasons["S1: bridge-word red flag"] += 1
            continue

        # S4: verify shared tokens — all members must share at least one token
        member_tokens = [tokens_of(m.get("translation_en", "")) for m in members]
        shared = set.intersection(*member_tokens) if member_tokens else set()
        if not shared:
            deferred_reasons["S4: no shared token after norm"] += 1
            continue

        # Extra: token count sanity — if the shared tokens are LESS than half
        # of each member's tokens, this is more like partial-overlap than
        # true equivalence; defer.
        low_overlap = False
        for mtok in member_tokens:
            if mtok and len(shared) / len(mtok) < 0.5:
                low_overlap = True
                break
        if low_overlap:
            deferred_reasons["S4b: shared tokens are minority of each member"] += 1
            continue

        # Passes all safety heuristics — apply
        applied.append(prop)

    print(f"\nAfter safety filter:")
    print(f"  Applied: {len(applied)}")
    print(f"  Deferred: {len(proposals) - len(applied)}")
    for reason, n in deferred_reasons.most_common():
        print(f"    {reason}: {n}")

    # Apply the class tags
    tag_applies = 0
    for prop in applied:
        sid = prop["suggested_id"]
        for m in prop["members"]:
            key = (m.get("lemma"), m.get("pos"), m.get("rank"))
            e = entry_lookup.get(key)
            if not e:
                continue
            e["equivalence_class"] = sid
            existing_notes = (e.get("notes") or "").strip()
            note = f"{PATCH_MARKER} class={sid}"
            if note not in existing_notes:
                e["notes"] = (existing_notes + " — " + note) if existing_notes else note
            tag_applies += 1

    print(f"\nEquivalence_class tags applied: {tag_applies}")

    # Also drop the retired `alternatives` field per v10 §2
    alt_drops = 0
    for e in entries:
        if "alternatives" in e:
            del e["alternatives"]
            alt_drops += 1
    print(f"Alternatives fields dropped: {alt_drops}")

    print(f"\nWriting back to {DATA}")
    atomic_write_json(DATA, entries)

    # Verify
    with DATA.open() as f:
        verify = json.load(f)
    class_count = sum(1 for e in verify if e.get("equivalence_class"))
    class_ids = Counter()
    for e in verify:
        c = e.get("equivalence_class")
        if c:
            class_ids[c] += 1
    print(f"\nAfter: {class_count} entries with equivalence_class ({len(class_ids)} distinct classes)")

    # Show top new classes
    print(f"\nTop 20 classes by entry count:")
    for c, n in class_ids.most_common(20):
        print(f"  {c}: {n}")


if __name__ == "__main__":
    main()
