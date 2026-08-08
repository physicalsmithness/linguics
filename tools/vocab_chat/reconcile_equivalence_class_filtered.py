"""Reconcile my equivalence_class apply to the FILTERED spec.

Missed on the previous sweep: WORK_ORDER_2026-08-05 says Job 1 should use the
FILTERED file, and my apply used the unfiltered. Architect's filter rejected
640 of the 1126 tier-1 proposals for being imprecise, trivially-same-lemma,
or near-synonyms with meaning drift (adore/love, ancient/old, align/vary).

Steps:
  1. Untag classes I applied that are NOT in the FILTERED file.
  2. Apply any classes in the FILTERED file that I haven't yet applied
     (same safety heuristics as before — same POS, real token overlap, etc.)
  3. Keep May's original 10 classes untouched.

Run from project root:
    python3 tools/vocab_chat/reconcile_equivalence_class_filtered.py
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
FILTERED = PROJECT_ROOT / "data" / "equivalence_class_proposals_2026-08_FILTERED.json"
PATCH_MARKER = "[eq-class-reconciled-filtered-2026-08-03]"

MAY_CLASSES = {
    'only_adv', 'here_locative', 'there_locative', 'etc_abbrev',
    'car_noun', 'motorbike_noun', 'bicycle_noun', 'airplane_noun',
    'fridge_noun', 'immediately_adv',
}


def norm_token(t):
    t = t.strip().lower()
    if t.startswith("to "):
        t = t[3:]
    for art in ("the ", "a ", "an "):
        if t.startswith(art):
            t = t[len(art):]
            break
    return t.strip()


def tokens_of(translation_en):
    if not translation_en:
        return set()
    out = set()
    for piece in re.split(r"[,;]", translation_en):
        piece = re.sub(r"\([^)]*\)", "", piece).strip()
        if piece:
            out.add(norm_token(piece))
    return {t for t in out if t}


def main():
    with FILTERED.open() as f:
        pdata = json.load(f)
    filtered_proposals = pdata.get("proposals", [])
    filtered_ids = {p.get("suggested_id") for p in filtered_proposals}
    print(f"Filtered proposals: {len(filtered_proposals)} ({len(filtered_ids)} distinct ids)")

    with DATA.open() as f:
        entries = json.load(f)

    # 1. Untag classes NOT in filtered (except May's)
    untagged = 0
    untagged_classes = set()
    for e in entries:
        c = e.get("equivalence_class")
        if not c:
            continue
        if c in MAY_CLASSES:
            continue  # keep
        if c not in filtered_ids:
            del e["equivalence_class"]
            existing = (e.get("notes") or "").strip()
            note = f"{PATCH_MARKER} untagged '{c}' (architect's filter rejected this proposal)"
            e["notes"] = (existing + " — " + note) if existing else note
            untagged += 1
            untagged_classes.add(c)

    print(f"Untagged: {untagged} entries in {len(untagged_classes)} classes rejected by architect's filter")

    # 2. Apply filtered proposals not yet applied — same safety heuristics
    entry_lookup = {}
    for e in entries:
        key = (e.get("lemma"), e.get("pos"), e.get("rank"))
        entry_lookup[key] = e

    existing_class_tuples = set()
    for e in entries:
        if e.get("equivalence_class"):
            existing_class_tuples.add((e.get("lemma"), e.get("pos")))

    applied = []
    deferred_reasons = Counter()
    for prop in filtered_proposals:
        sid = prop.get("suggested_id")
        members = prop.get("members", [])

        # Skip if already applied (any member already carries the class id)
        already_applied = False
        for m in members:
            e = entry_lookup.get((m.get("lemma"), m.get("pos"), m.get("rank")))
            if e and e.get("equivalence_class") == sid:
                already_applied = True
                break
        if already_applied:
            deferred_reasons["already applied"] += 1
            continue

        # Same POS
        pos_set = set(m.get("pos") for m in members)
        if len(pos_set) > 1:
            deferred_reasons["mixed POS"] += 1
            continue

        # All members score 1.0
        if not all(m.get("score", 0) == 1.0 for m in members):
            deferred_reasons["some score <1.0"] += 1
            continue

        # Any member in existing class → skip
        clash = False
        for m in members:
            if (m.get("lemma"), m.get("pos")) in existing_class_tuples:
                clash = True
                break
        if clash:
            deferred_reasons["member in existing class"] += 1
            continue

        # Class size <=5
        if len(members) > 5:
            deferred_reasons["too large (>5)"] += 1
            continue

        # Shared tokens (>=50% of each)
        member_tokens = [tokens_of(m.get("translation_en", "")) for m in members]
        shared = set.intersection(*member_tokens) if member_tokens else set()
        if not shared:
            deferred_reasons["no shared token"] += 1
            continue
        low_overlap = any(mtok and len(shared) / len(mtok) < 0.5 for mtok in member_tokens)
        if low_overlap:
            deferred_reasons["shared tokens minority"] += 1
            continue

        # Skip if any member has junk translation
        bad = False
        for m in members:
            e = entry_lookup.get((m.get("lemma"), m.get("pos"), m.get("rank")))
            if not e:
                bad = True
                break
            t = e.get("translation_en", "")
            if not t or t == "[skip]" or "?" in t:
                bad = True
                break
        if bad:
            deferred_reasons["member with junk translation"] += 1
            continue

        # Apply
        applied.append(prop)
        for m in members:
            e = entry_lookup.get((m.get("lemma"), m.get("pos"), m.get("rank")))
            e["equivalence_class"] = sid
            existing_notes = (e.get("notes") or "").strip()
            note = f"{PATCH_MARKER} class={sid} (from FILTERED)"
            if note not in existing_notes:
                e["notes"] = (existing_notes + " — " + note) if existing_notes else note
            existing_class_tuples.add((m.get("lemma"), m.get("pos")))

    print(f"\nFrom FILTERED file:")
    print(f"  Applied additional: {len(applied)}")
    print(f"  Deferred:")
    for r, n in deferred_reasons.most_common():
        print(f"    {r}: {n}")

    print(f"\nWriting back to {DATA}")
    atomic_write_json(DATA, entries)

    # Verify
    with DATA.open() as f:
        verify = json.load(f)
    total_tagged = sum(1 for e in verify if e.get("equivalence_class"))
    classes = Counter(e.get("equivalence_class") for e in verify if e.get("equivalence_class"))
    print(f"\nAfter reconcile: {total_tagged} entries in {len(classes)} distinct classes")


if __name__ == "__main__":
    main()
