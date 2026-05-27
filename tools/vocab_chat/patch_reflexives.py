"""Patch reflexive verb entries to inherit rank from their non-reflexive base.

Reflexives like `lavarsi` aren't in the lemma CSV because simplemma collapses
them to `lavare`. Map each reflexive to its base, look up the base in the CSV,
assign the same rank to the reflexive entry (so they cluster together in the data).
"""
import csv
import json
from pathlib import Path

PROJECT = Path('/sessions/sleepy-wizardly-bohr/mnt/Language Learning')
CURATED = PROJECT / 'data' / 'vocabulary_it_frequency.json'
LEMMA_CSV = PROJECT / 'data' / 'vocabulary_it_frequency_lemmas.csv'


def reflexive_base(lemma):
    """Strip the reflexive ending -si to get the infinitive. lavarsi -> lavare."""
    if lemma.endswith('si') and len(lemma) > 4:
        return lemma[:-2] + 'e'   # lavarsi -> lavar + e = lavare
    return None


def main():
    # Build lemma → rank lookup from CSV
    rank_by_lemma = {}
    with LEMMA_CSV.open(encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row['pos'] == 'verb' and row['lemma'] not in rank_by_lemma:
                rank_by_lemma[row['lemma']] = int(row['rank'])

    with CURATED.open(encoding='utf-8') as f:
        data = json.load(f)

    patched = []
    skipped = []
    for e in data:
        if e.get('pos') != 'verb':
            continue
        lemma = e['lemma']
        base = reflexive_base(lemma)
        if base is None:
            continue
        # Only patch if the entry wasn't matched (rank likely > 5000 from old assignment or still original)
        # Heuristic: patch if base is in CSV
        if base in rank_by_lemma:
            old_rank = e.get('rank')
            new_rank = rank_by_lemma[base]
            if old_rank != new_rank:
                e['rank'] = new_rank
                lo = ((new_rank - 1) // 100) * 100 + 1
                e['band'] = f'vocabulary.it.freq_{lo}_{lo + 99}'
                patched.append((lemma, base, old_rank, new_rank))
        else:
            skipped.append((lemma, base))

    with CURATED.open('w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f'Patched {len(patched)} reflexives:')
    for lemma, base, old, new in sorted(patched, key=lambda x: x[3]):
        print(f'  {lemma:<20} -> {base:<18} rank {old} -> {new}')
    print()
    if skipped:
        print(f'Skipped {len(skipped)} (base not in CSV):')
        for lemma, base in skipped:
            print(f'  {lemma} -> {base}')


if __name__ == '__main__':
    main()
