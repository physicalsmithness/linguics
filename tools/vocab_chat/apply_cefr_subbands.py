"""Replace the cefr_importance dict on each band with a cefr_subbands list,
using Smith's three-sub-level mapping (core / secure / stretch per CEFR level)
with deliberate boundary overlaps.
"""
import json
from pathlib import Path

BUCKETS = Path('/sessions/sleepy-wizardly-bohr/mnt/Language Learning/data/buckets/vocabulary_frequency.json')

# (name, range_lo, range_hi) — sub-band rank ranges
SUBBANDS = [
    ("A1-core",    0,     500),
    ("A1-secure",  500,   800),
    ("A1-stretch", 800,   1000),
    ("A2-core",    800,   1300),
    ("A2-secure",  1300,  1700),
    ("A2-stretch", 1700,  2000),
    ("B1-core",    1700,  2500),
    ("B1-secure",  2500,  3200),
    ("B1-stretch", 3200,  4000),
    ("B2-core",    3200,  5000),
    ("B2-secure",  5000,  6500),
    ("B2-stretch", 6500,  7500),
    ("C1-core",    6500,  9000),
    ("C1-secure",  9000,  11000),
    ("C1-stretch", 11000, 13000),
]


def cefr_subbands_for(lo, hi):
    """Return list of sub-band tags that overlap with the 100-wide band lo-hi."""
    result = []
    for name, r_lo, r_hi in SUBBANDS:
        # Overlap condition: band's lo must be < sub-band's hi AND band's hi must be >= sub-band's lo
        if lo < r_hi and hi >= r_lo:
            result.append(name)
    return result


def main():
    with BUCKETS.open(encoding='utf-8') as f:
        bands = json.load(f)

    updated = 0
    for band in bands:
        attrs = band.get('attributes', {})
        lo = attrs.get('band_lo')
        hi = attrs.get('band_hi')
        if lo is None or hi is None:
            continue
        subbands = cefr_subbands_for(lo, hi)
        # Replace the old cefr_importance dict with the new sub-band list
        if 'cefr_importance' in band:
            del band['cefr_importance']
        band['cefr_subbands'] = subbands
        updated += 1

    with BUCKETS.open('w', encoding='utf-8') as f:
        json.dump(bands, f, ensure_ascii=False, indent=2)

    print(f'Updated {updated} bands')
    # Show first 20 for verification
    print()
    print(f'{"band":>12}  cefr_subbands')
    print('-' * 60)
    for band in bands[:20]:
        attrs = band['attributes']
        print(f'  {attrs["band_lo"]:>4}-{attrs["band_hi"]:<4}  {", ".join(band["cefr_subbands"])}')
    print('  ...')
    # Show some interesting transitions
    print('  Transitions:')
    for band in bands:
        lo = band['attributes']['band_lo']
        if lo in (801, 1001, 1701, 2001, 3201, 5001, 6501, 7501):
            print(f'  {lo:>4}-{lo+99:<4}  {", ".join(band["cefr_subbands"])}')


if __name__ == '__main__':
    main()
