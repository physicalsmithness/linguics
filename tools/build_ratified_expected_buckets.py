#!/usr/bin/env python3
"""Derive the RATIFIED expected_buckets set from the returned tier-2 packets.

Architecture 2026-08-14. Why this file exists:

`expected_buckets` has two authors. Job 9 derives orthography and vocabulary ids
mechanically from the reference translation; the tier-2 packets add grammar ids that a
human seat judged one at a time. Job 9's `--apply` REPLACES the field, so on 2026-08-13
it silently deleted every grammar id the packets had contributed -- and its validation
gate never noticed, because the gate checks shape (sorted, deduped, disjoint from
required) and never asks whether something a person ratified went missing.

The fix is provenance. This script rebuilds, from the packets themselves, the set of
(item, bucket) pairs a seat has ratified. Job 9 unions that set into its output and
FAILS if any member of it is absent. The packets stay the source of truth, so the set is
reproducible rather than a second copy that can drift.

Sources:
  data/review_packets_tier2/returned/REVIEW_*.json   verdict == "keep"
  data/review_packets_tier2/returned/SEARCH_*.json   findings[] with verdict "keep"
  data/review_packets_tier2/REVIEW_*.json            three seats returned in place

Excluded: any packet listed in HELD -- returns received but not yet accepted by
Architecture, which must not be smuggled into the ratified set by a rebuild.

Run:  python3 tools/build_ratified_expected_buckets.py         (writes the sidecar)
"""
import json, glob, os, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PKT = os.path.join(ROOT, 'data', 'review_packets_tier2')
OUT = os.path.join(ROOT, 'data', 'expected_buckets_ratified.json')

# Families whose return is on disk but NOT accepted. Keep the reason with the entry.
HELD = {
    'vocabulary': 'Held 2026-08-14: 7,765 of 8,677 findings are frequency-band claims and '
                  '912 are the bare root, because 180 of the 183 buckets the packet offered '
                  'were bands. Open question on the Vocab search-packet thread: marking axis '
                  'or reporting lens?',
}


def tree_ids():
    ids = set()

    def walk(o):
        if isinstance(o, dict):
            if isinstance(o.get('id'), str):
                ids.add(o['id'])
            for v in o.values():
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)
    for p in glob.glob(os.path.join(ROOT, 'data', 'buckets', '*.json')):
        walk(json.load(open(p, encoding='utf-8')))
    return ids


def main():
    ids = tree_ids()
    ratified = collections.defaultdict(set)
    provenance = {}
    seen = set()
    held_seen = {}
    for path in sorted(glob.glob(os.path.join(PKT, 'returned', '*.json'))) + \
            sorted(glob.glob(os.path.join(PKT, '*.json'))):
        name = os.path.basename(path)
        if name in seen or not name.endswith('.json'):
            continue
        try:
            d = json.load(open(path, encoding='utf-8'))
        except Exception:
            continue
        if not isinstance(d, dict):
            continue
        seat = d.get('owner') or d.get('reviewer')
        fam = d.get('family')
        rows = []
        if 'buckets' in d:
            rows = [(b['bucket_id'], r['item_id']) for b in d['buckets'] for r in b['items']
                    if (r.get('verdict') or '').strip() == 'keep']
        elif 'findings' in d:
            rows = [(x['bucket_id'], x['item_id']) for x in d['findings']
                    if (x.get('verdict') or 'keep') == 'keep']
        if not rows:
            continue
        seen.add(name)
        if fam in HELD:
            held_seen[fam] = {'packet': name, 'rows': len(rows), 'reason': HELD[fam]}
            continue
        for bid, iid in rows:
            if bid in ids:
                ratified[iid].add(bid)
                provenance.setdefault(f'{iid}|{bid}', seat)

    out = {
        '$note': ('RATIFIED (item -> buckets) contributed by seat review of the tier-2 packets. '
                  'Job 9 must union this into its output and FAIL if any pair is missing. '
                  'Regenerate with tools/build_ratified_expected_buckets.py; never hand-edit.'),
        'generated': '2026-08-14',
        'source': 'data/review_packets_tier2/{,returned/}',
        'held_not_ratified': held_seen,
        'pairs': sum(len(v) for v in ratified.values()),
        'items': len(ratified),
        'ratified': {k: sorted(v) for k, v in sorted(ratified.items())},
    }
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'{out["pairs"]} ratified pairs across {out["items"]} items -> {OUT}')
    for f, h in held_seen.items():
        print(f'  HELD, excluded: {f} ({h["rows"]} rows)')


if __name__ == '__main__':
    main()
