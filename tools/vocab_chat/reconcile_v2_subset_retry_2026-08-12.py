"""Reconcile v2 with subset-retry per Architecture marker_semantics v15 §3.

The v1 reconcile deferred any proposal where the shared-tokens set was
<50% of ANY member's tokens (S4b). This was too strict: it lost
sebbene/benché (3/3 shared) because a weaker third member (malgrado,
gloss 'although') dragged the shared-set-over-total to 1/3 for one leg.

v2 fix: when the full class fails S4b, retry on the LARGEST SUBSET of
members that passes. Greedy — enumerate subsets by size descending, pick
the biggest one where shared-tokens meet the 50% threshold for every
member of the subset.

Two-phase run:
  Phase 1: proposal-of-proposals audit — enumerate the subsets that
           would be applied, dump to a JSON for eyeball review.
  Phase 2: (this file also runs it, once you're satisfied) apply the
           subsets to the vocabulary file.

Runs from project root. Reads FILTERED file. Skips proposals already
applied. Sensitive to existing eq-class collisions.
"""
from __future__ import annotations

import json
import re
import sys
from itertools import combinations
from pathlib import Path
from collections import Counter

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from atomic_io import atomic_write_json  # noqa: E402

DATA = PROJECT_ROOT / "data" / "vocabulary_it_frequency.json"
FILTERED = PROJECT_ROOT / "data" / "equivalence_class_proposals_2026-08_FILTERED.json"
AUDIT_OUT = PROJECT_ROOT / "data" / "eqclass_subset_retry_audit_2026-08-12.json"
PATCH = "[eq-class-subset-retry-2026-08-12]"


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


def find_best_subset(members_with_tokens, min_size=2):
    """Return largest subset (by index) whose shared tokens are >=50% of
    each member's tokens. members_with_tokens = [(idx, token_set), ...].
    Returns list of indices, or None if no valid subset."""
    n = len(members_with_tokens)
    for size in range(n, min_size - 1, -1):
        for combo in combinations(range(n), size):
            token_sets = [members_with_tokens[i][1] for i in combo]
            if not all(token_sets):
                continue
            shared = set.intersection(*token_sets)
            if not shared:
                continue
            if all(len(shared) / len(ts) >= 0.5 for ts in token_sets):
                return [members_with_tokens[i][0] for i in combo]
    return None


def main():
    with FILTERED.open() as f:
        pdata = json.load(f)
    proposals = pdata.get("proposals", [])

    with DATA.open() as f:
        entries = json.load(f)

    entry_lookup = {}
    for e in entries:
        entry_lookup[(e.get("lemma"), e.get("pos"), e.get("rank"))] = e
    existing_class_tuples = {(e.get("lemma"), e.get("pos"))
                             for e in entries if e.get("equivalence_class")}
    already_applied_ids = {e.get("equivalence_class")
                           for e in entries if e.get("equivalence_class")}

    audit = {
        "generated": "2026-08-12",
        "source": str(FILTERED.name),
        "rule": "subset-retry per marker_semantics v15 §3",
        "recoveries": [],
    }

    stats = Counter()
    to_apply = []

    for prop in proposals:
        sid = prop.get("suggested_id")
        members = prop.get("members", [])

        if not members or len(members) < 2:
            stats["proposal has <2 members"] += 1
            continue
        if sid in already_applied_ids:
            stats["already applied"] += 1
            continue

        # Same POS
        if len({m.get("pos") for m in members}) > 1:
            stats["mixed POS"] += 1
            continue

        # None-in-existing check (any member already in a class → defer)
        if any((m.get("lemma"), m.get("pos")) in existing_class_tuples for m in members):
            stats["member already in existing class"] += 1
            continue

        # Junk translation check
        bad = False
        for m in members:
            e = entry_lookup.get((m.get("lemma"), m.get("pos"), m.get("rank")))
            if not e or not e.get("translation_en") or e.get("translation_en") == "[skip]" or "?" in e.get("translation_en", ""):
                bad = True
                break
        if bad:
            stats["junk translation in member"] += 1
            continue

        # Try subset-retry
        member_tokens = []
        for i, m in enumerate(members):
            e = entry_lookup.get((m.get("lemma"), m.get("pos"), m.get("rank")))
            if e:
                member_tokens.append((i, tokens_of(e.get("translation_en", ""))))

        # First check if full class would pass v1 rule
        all_tokens = [t for _, t in member_tokens]
        if all_tokens and all(all_tokens):
            shared = set.intersection(*all_tokens)
            if shared and all(len(shared) / len(t) >= 0.5 for t in all_tokens):
                # Full class passes; apply all
                to_apply.append((sid, [members[i] for i, _ in member_tokens]))
                stats["applied FULL class"] += 1
                continue

        # Full class fails — try subsets
        best = find_best_subset(member_tokens, min_size=2)
        if best is None:
            stats["no subset passes"] += 1
            continue

        if len(best) == len(members):
            stats["applied full via subset-retry"] += 1
        else:
            stats[f"applied subset {len(best)}/{len(members)}"] += 1
        subset_members = [members[i] for i in best]
        dropped = [members[i] for i in range(len(members)) if i not in best]
        to_apply.append((sid, subset_members))
        audit["recoveries"].append({
            "class_id": sid,
            "kept": [{"lemma": m["lemma"], "pos": m["pos"], "rank": m["rank"]} for m in subset_members],
            "dropped": [{"lemma": m["lemma"], "pos": m["pos"], "rank": m["rank"]} for m in dropped],
        })

    print("Stats:")
    for k, n in stats.most_common():
        print(f"  {k}: {n}")
    print(f"\nProposals to apply: {len(to_apply)}")
    print(f"Recoveries via subset-retry: {len(audit['recoveries'])}")

    # Show first 15 recoveries
    print("\nFirst 15 subset-retry recoveries:")
    for r in audit["recoveries"][:15]:
        kept_str = ", ".join(f"{m['lemma']}({m['pos'][:3]})" for m in r["kept"])
        drop_str = ", ".join(f"{m['lemma']}({m['pos'][:3]})" for m in r["dropped"])
        print(f"  {r['class_id']}: keep {kept_str}  |  drop {drop_str}")

    # Apply
    applied_count = 0
    for cid, members in to_apply:
        for m in members:
            e = entry_lookup.get((m.get("lemma"), m.get("pos"), m.get("rank")))
            if not e:
                continue
            if e.get("equivalence_class"):
                continue  # safety
            e["equivalence_class"] = cid
            existing = (e.get("notes") or "").strip()
            note = f"{PATCH} class={cid} (subset-retry)"
            e["notes"] = (existing + " — " + note) if existing else note
            applied_count += 1

    print(f"\nEq-class member applies: {applied_count}")
    print(f"Writing audit: {AUDIT_OUT}")
    atomic_write_json(AUDIT_OUT, audit)
    print(f"Writing data: {DATA}")
    atomic_write_json(DATA, entries)

    # verify
    with DATA.open() as f:
        v = json.load(f)
    classes = Counter(e.get("equivalence_class") for e in v if e.get("equivalence_class"))
    print(f"\nGrand total: {sum(classes.values())} entries in {len(classes)} classes; singletons: {sum(1 for c,n in classes.items() if n==1)}")


if __name__ == "__main__":
    main()
