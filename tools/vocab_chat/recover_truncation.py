"""Recover entries lost in Code's truncated gap-fill write.
Merges current truncated file (ranks <=982) with v2 backup (entries above 982).
Dedupes by (lemma, pos, gender), preferring the richer entry.
"""
import json
from pathlib import Path

CURATED = Path('/sessions/sleepy-wizardly-bohr/mnt/Language Learning/data/vocabulary_it_frequency.json')
BACKUP = Path('/sessions/sleepy-wizardly-bohr/mnt/outputs/vocabulary_it_frequency.PRE_RERANK_v2.json')


def richness(e):
    score = 0
    if e.get('themes'): score += 100
    if e.get('gloss_en'): score += 10
    if e.get('noun_class'): score += 5
    score += len(e.get('notes') or '') / 100
    # Prefer non-thin entries
    if 'thin entry' not in (e.get('notes') or ''):
        score += 50
    return score


def main():
    with CURATED.open() as f:
        current = json.load(f)
    with BACKUP.open() as f:
        backup = json.load(f)

    # Recovery set: backup entries with rank > 982
    backup_above = [e for e in backup if e.get('rank', 0) > 982]
    print(f'Current (truncated): {len(current)} entries')
    print(f'Backup-v2: {len(backup)} entries, {len(backup_above)} above rank 982')

    # Merge by (lemma, pos, gender), preferring richer
    by_key = {}
    for e in current + backup_above:
        key = (e['lemma'], e['pos'], e.get('gender'))
        if key not in by_key or richness(e) > richness(by_key[key]):
            by_key[key] = e

    merged = sorted(by_key.values(), key=lambda e: (e.get('rank', 999999), e['lemma'], e['pos']))
    print(f'After merge + dedupe: {len(merged)} entries')

    with CURATED.open('w') as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)
    print(f'Wrote back to {CURATED.name}')

    # Sanity
    above = sum(1 for e in merged if e.get('rank', 0) > 982)
    thin = sum(1 for e in merged if 'thin entry' in (e.get('notes') or ''))
    print(f'  Above rank 982: {above}')
    print(f'  Thin gap-fill entries from Code: {thin}')


if __name__ == '__main__':
    main()
