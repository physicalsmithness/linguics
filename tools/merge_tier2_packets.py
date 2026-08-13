#!/usr/bin/env python3
"""
Merge returned tier-2 review packets into translation items' expected_buckets.

Architecture-owned central pass (2026-08-13). Reads BOTH directories:
  data/review_packets_tier2/returned/   (the documented return path)
  data/review_packets_tier2/            (three seats returned in place: pronoun,
                                         indefinite, relative_pronoun -- 985 verdicts
                                         that a returned/-only merge skips silently)

Semantics, from the packet README and the 2026-08-11 ruling:
  verdict "strike" -> the item does NOT demonstrate that construction. Job 9 re-derived
                      expected_buckets on 08-12 from orthography+vocabulary only, so no
                      grammar id survives in the field; every strike is therefore already
                      satisfied and merges as a no-op. Recorded, not applied.
  verdict "keep"   -> add the bucket to expected_buckets (author additions arrive as keeps
                      carrying added_by / added_by_owner; same rule).

Three exclusions, all Architecture rulings of 2026-08-13:
  1. Already in required_buckets or optional_buckets -> skip. That is the item's own
     declared skill; expected_buckets is the INCIDENTAL set and the two are disjoint by
     Job 9's own assertion (job9_rederive_expected_buckets.py:445).
  2. A candidate that is a proper ANCESTOR of any other id the item will carry -> skip.
     Coverage rolls up automatically ("an item counts for every ancestor of every bucket
     it cites", housing/js/app.js:8051), so storing article.definite beside
     article.definite.forms buys no coverage and costs one redundant fire-list entry that
     the marker must separately judge. Store the most specific claim; ancestors are derived.
  3. Ids that do not resolve in data/buckets/ -> skip (none at time of writing).

Run with --apply to write. Default is a dry run. Always reports per seat.
"""
import json, glob, os, sys, shutil, collections, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PKT_DIR = os.path.join(ROOT, 'data', 'review_packets_tier2')
RET_DIR = os.path.join(PKT_DIR, 'returned')
APPLY = '--apply' in sys.argv
ONLY = None
for a in sys.argv[1:]:
    if a.startswith('--only='):
        ONLY = a.split('=', 1)[1]


def load_packets():
    """Every packet carrying at least one filled verdict, from either directory."""
    seen, out = set(), []
    for path in sorted(glob.glob(os.path.join(RET_DIR, '*.json'))) + \
                sorted(glob.glob(os.path.join(PKT_DIR, '*.json'))):
        name = os.path.basename(path)
        if name in seen:
            continue
        try:
            d = json.load(open(path, encoding='utf-8'))
        except Exception:
            continue
        if not isinstance(d, dict) or 'buckets' not in d:
            continue
        n = sum(1 for b in d['buckets'] for r in b['items']
                if isinstance(r.get('verdict'), str) and r['verdict'].strip())
        if n:
            seen.add(name)
            out.append((path, d, n))
    return out


def load_items():
    """external_id -> (filepath, item dict). Items are mutated in place."""
    files, idx = {}, {}
    for p in sorted(glob.glob(os.path.join(ROOT, 'data', 'translation_items*.json'))):
        d = json.load(open(p, encoding='utf-8'))
        items = d if isinstance(d, list) else d.get('items', d)
        if not isinstance(items, list):
            continue
        files[p] = d
        for it in items:
            eid = it.get('external_id') or it.get('id')
            if eid:
                idx[eid] = (p, it)
    return files, idx


def main():
    packets = load_packets()
    files, idx = load_items()

    # Conflict scan across packets before touching anything: two seats may judge the
    # same (item, bucket) pair differently, and a silent last-writer-wins is not a merge.
    pair = collections.defaultdict(dict)
    for path, d, _ in packets:
        seat = d.get('owner') or d.get('reviewer') or os.path.basename(path)
        for b in d['buckets']:
            for r in b['items']:
                v = (r.get('verdict') or '').strip()
                if v:
                    pair[(r['item_id'], b['bucket_id'])][seat] = v
    conflicts = {k: v for k, v in pair.items() if len(set(v.values())) > 1}
    if conflicts:
        print(f'!! {len(conflicts)} (item,bucket) pairs judged BOTH ways -- not applied:')
        for k, v in list(conflicts.items())[:20]:
            print('   ', k, v)
        print()

    if APPLY:
        stamp = datetime.datetime.now().strftime('%Y-%m-%d')
        bdir = os.path.join(ROOT, 'outputs', f'backup_tier2_merge_{stamp}')
        os.makedirs(bdir, exist_ok=True)
        for p in files:
            shutil.copy2(p, os.path.join(bdir, os.path.basename(p)))
        print(f'backup -> {bdir}\n')

    # Every id declared anywhere in the bucket trees, for the resolve gate.
    tree = set()

    def walk(o):
        if isinstance(o, dict):
            if isinstance(o.get('id'), str):
                tree.add(o['id'])
            for v in o.values():
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)
    for p in glob.glob(os.path.join(ROOT, 'data', 'buckets', '*.json')):
        walk(json.load(open(p, encoding='utf-8')))

    # Pass 1 -- collect candidate additions per item, per seat.
    cand = collections.defaultdict(set)          # item_id -> {bucket_id}
    provenance = collections.defaultdict(dict)   # item_id -> {bucket_id: seat}
    grand = collections.Counter()
    rows = []
    for path, d, n in packets:
        seat = d.get('owner') or d.get('reviewer') or '?'
        if ONLY and ONLY.lower() not in (seat + os.path.basename(path)).lower():
            continue
        c = collections.Counter()
        for b in d['buckets']:
            bid = b['bucket_id']
            for r in b['items']:
                v = (r.get('verdict') or '').strip()
                if not v:
                    continue
                if (r['item_id'], bid) in conflicts:
                    c['conflict'] += 1
                    continue
                hit = idx.get(r['item_id'])
                if not hit:
                    c['no_item'] += 1
                    continue
                it = hit[1]
                if v == 'strike':
                    c['strike_noop' if bid not in (it.get('expected_buckets') or [])
                      else 'struck'] += 1
                    continue
                if v != 'keep':
                    c['unknown_verdict'] += 1
                    continue
                if bid in (it.get('required_buckets') or []) or \
                   bid in (it.get('optional_buckets') or []):
                    c['skip_own'] += 1
                elif bid not in tree:
                    c['skip_dangling'] += 1
                elif bid in (it.get('expected_buckets') or []):
                    c['already'] += 1
                else:
                    cand[r['item_id']].add(bid)
                    provenance[r['item_id']][bid] = seat
                    c['author_add' if (r.get('added_by') or r.get('added_by_owner'))
                      else 'candidate'] += 1
        loc = 'returned/' if os.path.dirname(path).endswith('returned') else 'MISFILED'
        rows.append((seat, loc, n, c))
        grand.update(c)

    # Pass 2 -- drop candidates that are proper ancestors of anything the item carries.
    dropped = collections.Counter()
    applied = collections.Counter()
    for iid, s in cand.items():
        it = idx[iid][1]
        final = set(it.get('required_buckets') or []) | \
            set(it.get('optional_buckets') or []) | \
            set(it.get('expected_buckets') or []) | s
        for bid in sorted(s):
            if any(o != bid and o.startswith(bid + '.') for o in final):
                dropped[provenance[iid][bid]] += 1
                continue
            applied[provenance[iid][bid]] += 1
            if APPLY:
                it.setdefault('expected_buckets', []).append(bid)

    w = max((len(r[0]) for r in rows), default=10)
    print(f'{"seat":<{w}}  {"loc":<9} {"rows":>5} {"strike":>7} {"own":>5} '
          f'{"cand":>6} {"+auth":>6} {"ancest":>7} {"APPLIED":>8}')
    for seat, loc, n, c in sorted(rows):
        print(f'{seat:<{w}}  {loc:<9} {n:>5} {c["strike_noop"] + c["struck"]:>7} '
              f'{c["skip_own"]:>5} {c["candidate"]:>6} {c["author_add"]:>6} '
              f'{dropped[seat]:>7} {applied[seat]:>8}')
    print('\nROW DISPOSITION', dict(grand))
    print(f'ancestors dropped {sum(dropped.values())} | ADDED {sum(applied.values())}')

    if APPLY:
        for p, d in files.items():
            items = d if isinstance(d, list) else d.get('items', d)
            for it in items:
                if 'expected_buckets' in it:
                    it['expected_buckets'] = sorted(set(it['expected_buckets']))
            with open(p, 'w', encoding='utf-8') as f:
                json.dump(d, f, ensure_ascii=False, indent=2)
                f.write('\n')
        print('\nWRITTEN.')
    else:
        print('\nDRY RUN -- rerun with --apply to write.')


if __name__ == '__main__':
    main()
