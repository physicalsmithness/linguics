"""Extend data/buckets/vocabulary_frequency.json from 80 bands (freq_1_100 through
freq_7901_8000) to 180 bands (... through freq_17901_18000) so every curated entry's
band ID resolves against the canonical registry.

Atomic tmp+rename write.

CEFR sub-band assignment for the new bands (continues the user's pattern):
  8001-8900: C1-secure
  8901-9000: [C1-secure, C1-stretch] (transition)
  9001-9900: C1-stretch
  9901-10000: [C1-stretch, out_of_scope] (transition)
  10001-18000: out_of_scope (tail; rarely seen, not part of CEFR canonical coverage)
"""
import json
import os
from pathlib import Path

P = Path('/sessions/sleepy-wizardly-bohr/mnt/Linguics/data/buckets/vocabulary_frequency.json')
TMP = P.with_suffix('.json.tmp')


def cefr_for(lo, hi):
    """Return the cefr_subbands list for a band spanning [lo, hi]."""
    if hi <= 8900:
        return ['C1-secure']
    elif lo >= 8901 and hi <= 9000:
        return ['C1-secure', 'C1-stretch']
    elif lo >= 9001 and hi <= 9900:
        return ['C1-stretch']
    elif lo >= 9901 and hi <= 10000:
        return ['C1-stretch', 'out_of_scope']
    else:
        return ['out_of_scope']


def make_band(lo, hi):
    return {
        'id': f'vocabulary.it.freq_{lo}_{hi}',
        'parent_id': 'vocabulary.it',
        'language_code': 'it',
        'label': f'Italian words ranked {lo}-{hi}',
        'description': f'Words {lo}-{hi} by merged-lemma frequency. See coverage notes for what this band contains in detail.',
        'prerequisites': [],
        'attributes': {
            'is_aggregate': True,
            'band_lo': lo,
            'band_hi': hi,
            'direction': 'bidirectional',
        },
        'active': True,
        'version': 1,
        'cefr_subbands': cefr_for(lo, hi),
    }


def main():
    with P.open(encoding='utf-8') as f:
        bands = json.load(f)
    print(f'Existing bands: {len(bands)}')

    existing_ids = {b['id'] for b in bands}

    # Generate new bands for freq_8001_8100 through freq_17901_18000
    new = []
    for lo in range(8001, 18001, 100):
        hi = lo + 99
        b = make_band(lo, hi)
        if b['id'] in existing_ids:
            continue
        new.append(b)

    print(f'New bands to add: {len(new)}')
    bands.extend(new)
    # Sort by band_lo for tidiness
    bands.sort(key=lambda b: b['attributes']['band_lo'])

    with TMP.open('w', encoding='utf-8') as f:
        json.dump(bands, f, ensure_ascii=False, indent=2)
        f.flush()
        os.fsync(f.fileno())
    os.replace(TMP, P)

    # Verify
    with P.open(encoding='utf-8') as f:
        verify = json.load(f)
    print(f'After write: {len(verify)} bands')
    print(f'First: {verify[0]["id"]}')
    print(f'Last: {verify[-1]["id"]}')


if __name__ == '__main__':
    main()
