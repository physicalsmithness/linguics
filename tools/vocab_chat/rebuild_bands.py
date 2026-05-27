"""Generate granular 100-wide bucket bands (1-100 through 7901-8000).
Re-band every curated entry to match."""
import json
from pathlib import Path

PROJECT = Path('/sessions/sleepy-wizardly-bohr/mnt/Language Learning')
BUCKETS = PROJECT / 'data' / 'buckets' / 'vocabulary_frequency.json'
CURATED = PROJECT / 'data' / 'vocabulary_it_frequency.json'
MAX_RANK = 8000


def cefr(lo):
    if lo == 1:
        return {"A1": "core", "A2": "core", "B1": "review", "B2": "fluency", "C1": "fluency", "C2": "fluency"}
    if lo == 101:
        return {"A1": "preview", "A2": "core", "B1": "review", "B2": "fluency", "C1": "fluency", "C2": "fluency"}
    if lo in (201, 301):
        return {"A1": "stretch", "A2": "core", "B1": "core", "B2": "review", "C1": "fluency", "C2": "fluency"}
    if lo == 401:
        return {"A1": "preview", "A2": "stretch", "B1": "core", "B2": "review", "C1": "fluency", "C2": "fluency"}
    if lo in (501, 601):
        return {"A1": "out_of_scope", "A2": "preview", "B1": "core", "B2": "core", "C1": "review", "C2": "fluency"}
    if lo == 701:
        return {"A1": "out_of_scope", "A2": "out_of_scope", "B1": "preview", "B2": "core", "C1": "core", "C2": "fluency"}
    if lo == 801:
        return {"A1": "out_of_scope", "A2": "out_of_scope", "B1": "stretch", "B2": "core", "C1": "core", "C2": "review"}
    if lo == 901:
        return {"A1": "out_of_scope", "A2": "out_of_scope", "B1": "preview", "B2": "core", "C1": "core", "C2": "review"}
    if 1001 <= lo <= 1900:
        return {"A1": "out_of_scope", "A2": "out_of_scope", "B1": "out_of_scope", "B2": "stretch", "C1": "core", "C2": "core"}
    if 2001 <= lo <= 3900:
        return {"A1": "out_of_scope", "A2": "out_of_scope", "B1": "out_of_scope", "B2": "out_of_scope", "C1": "stretch", "C2": "core"}
    if 4001 <= lo <= 5900:
        return {"A1": "out_of_scope", "A2": "out_of_scope", "B1": "out_of_scope", "B2": "out_of_scope", "C1": "preview", "C2": "core"}
    return {"A1": "out_of_scope", "A2": "out_of_scope", "B1": "out_of_scope", "B2": "out_of_scope", "C1": "out_of_scope", "C2": "stretch"}


def make_band(lo):
    hi = lo + 99
    bid = f'vocabulary.it.freq_{lo}_{hi}'
    prev = None if lo == 1 else f'vocabulary.it.freq_{lo - 100}_{lo - 1}'
    label = "Italian top 100 (most common)" if lo == 1 else f"Italian words {lo}-{hi}"
    desc = f"Words {lo}-{hi} by merged-lemma frequency. See coverage notes for what this band contains in detail."
    return {
        "id": bid,
        "parent_id": "vocabulary.it",
        "language_code": "it",
        "label": label,
        "description": desc,
        "cefr_importance": cefr(lo),
        "prerequisites": [prev] if prev else [],
        "attributes": {
            "is_aggregate": True,
            "band_lo": lo,
            "band_hi": hi,
            "direction": "bidirectional"
        },
        "active": True,
        "version": 1
    }


def main():
    bands = [make_band(lo) for lo in range(1, MAX_RANK + 1, 100)]
    with BUCKETS.open('w', encoding='utf-8') as f:
        json.dump(bands, f, ensure_ascii=False, indent=2)
    print(f'Wrote {len(bands)} bands to {BUCKETS.name}')

    with CURATED.open(encoding='utf-8') as f:
        curated = json.load(f)
    changed = 0
    for e in curated:
        r = e.get('rank', 1)
        lo = ((r - 1) // 100) * 100 + 1
        nb = f'vocabulary.it.freq_{lo}_{lo + 99}'
        if e.get('band') != nb:
            e['band'] = nb
            changed += 1
    with CURATED.open('w', encoding='utf-8') as f:
        json.dump(curated, f, ensure_ascii=False, indent=2)
    print(f'Updated band field on {changed} curated entries')


if __name__ == '__main__':
    main()
