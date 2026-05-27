"""Re-rank the curated vocabulary file using the merged lemma CSV as the authority.

For each curated entry, join to the lemma CSV on (lemma, pos, gender) → (lemma, pos) → (lemma).
Rewrite `rank` and `band` based on the matched lemma-CSV row.
Collapse cross-band duplicate entries (same lemma+pos+gender appearing twice).
Extend bands beyond freq_901_1000 for entries that land at higher ranks.
Write a markdown report summarising matches, fallbacks, unmatched, and duplicates dropped.
"""

import csv
import json
from collections import defaultdict
from pathlib import Path

PROJECT = Path('/sessions/sleepy-wizardly-bohr/mnt/Language Learning')
CURATED = PROJECT / 'data' / 'vocabulary_it_frequency.json'
LEMMA_CSV = PROJECT / 'data' / 'vocabulary_it_frequency_lemmas.csv'
REPORT = Path('/sessions/sleepy-wizardly-bohr/mnt/outputs/rerank_report.md')


def derive_band(rank):
    """Map a rank to the band id it belongs to. Extends bands beyond 1000."""
    if rank <= 100:
        return 'vocabulary.it.freq_1_100', 1, 100
    if rank <= 1000:
        lo = ((rank - 1) // 100) * 100 + 1
        hi = lo + 99
        return f'vocabulary.it.freq_{lo}_{hi}', lo, hi
    if rank <= 2000:
        return 'vocabulary.it.freq_1001_2000', 1001, 2000
    if rank <= 5000:
        return 'vocabulary.it.freq_2001_5000', 2001, 5000
    return 'vocabulary.it.freq_5001_plus', 5001, 99999


def entry_richness(entry):
    """Pick the better of two duplicate entries: prefer themes, gloss, longer notes."""
    score = 0
    if entry.get('themes'):
        score += 100
    if entry.get('gloss_en'):
        score += 10
    score += len(entry.get('notes') or '') / 100
    return score


def load_lemma_csv():
    """Return three lookup dicts: by (lemma, pos, gender), by (lemma, pos), by lemma."""
    by_lpg = {}
    by_lp = {}
    by_l = {}
    with LEMMA_CSV.open(encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            lemma = row['lemma']
            pos = row['pos']
            gender = row.get('gender') or ''
            row['_rank'] = int(row['rank'])
            by_lpg.setdefault((lemma, pos, gender), row)
            by_lp.setdefault((lemma, pos), row)
            by_l.setdefault(lemma, row)
    return by_lpg, by_lp, by_l


def match_entry(entry, by_lpg, by_lp, by_l):
    """Try increasingly loose joins. Return (matched_row, match_kind)."""
    lemma = entry['lemma']
    pos = entry['pos']
    gender = entry.get('gender') or ''
    if gender:
        m = by_lpg.get((lemma, pos, gender))
        if m:
            return m, 'lpg'
        # Also try the noun_csv form where gender is 'na' for non-nouns
        m = by_lpg.get((lemma, pos, 'na'))
        if m:
            return m, 'lpg_na'
    m = by_lp.get((lemma, pos))
    if m:
        return m, 'lp'
    m = by_l.get(lemma)
    if m:
        return m, 'l'
    return None, None


def main():
    by_lpg, by_lp, by_l = load_lemma_csv()

    with CURATED.open(encoding='utf-8') as f:
        curated = json.load(f)

    matched_counts = defaultdict(int)
    unmatched = []
    rerank_diffs = []  # (lemma, pos, old_rank, new_rank)

    for entry in curated:
        old_rank = entry.get('rank')
        m, kind = match_entry(entry, by_lpg, by_lp, by_l)
        if m:
            new_rank = m['_rank']
            entry['rank'] = new_rank
            band_id, _lo, _hi = derive_band(new_rank)
            entry['band'] = band_id
            matched_counts[kind] += 1
            if abs((old_rank or 0) - new_rank) > 100:
                rerank_diffs.append((entry['lemma'], entry['pos'], old_rank, new_rank, kind))
        else:
            unmatched.append((entry['lemma'], entry['pos'], old_rank))
            matched_counts['none'] += 1

    # Dedupe by (lemma, pos, gender) — pick richest
    groups = defaultdict(list)
    for entry in curated:
        key = (entry['lemma'], entry['pos'], entry.get('gender'))
        groups[key].append(entry)

    final = []
    dupes_dropped = []
    for key, entries in groups.items():
        if len(entries) == 1:
            final.append(entries[0])
        else:
            entries.sort(key=entry_richness, reverse=True)
            final.append(entries[0])
            for e in entries[1:]:
                dupes_dropped.append((e['lemma'], e['pos'], e.get('gender'), e.get('rank')))

    final.sort(key=lambda e: (e.get('rank', 999999), e['lemma'], e['pos']))

    with CURATED.open('w', encoding='utf-8') as f:
        json.dump(final, f, ensure_ascii=False, indent=2)

    # Report
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    with REPORT.open('w', encoding='utf-8') as f:
        f.write('# Re-rank pass report\n\n')
        f.write(f'Joined `vocabulary_it_frequency.json` to `vocabulary_it_frequency_lemmas.csv` on (lemma, pos, gender) with fallbacks.\n\n')
        f.write('## Match summary\n\n')
        f.write(f'| Match kind | Count |\n|---|---|\n')
        f.write(f'| (lemma, pos, gender) — strict | {matched_counts["lpg"]} |\n')
        f.write(f'| (lemma, pos, "na") — non-noun strict | {matched_counts["lpg_na"]} |\n')
        f.write(f'| (lemma, pos) — gender fallback | {matched_counts["lp"]} |\n')
        f.write(f'| (lemma) — POS fallback | {matched_counts["l"]} |\n')
        f.write(f'| unmatched | {matched_counts["none"]} |\n')
        f.write(f'\nTotal entries before dedupe: {sum(matched_counts.values())}\n')
        f.write(f'Total entries after dedupe: {len(final)}\n')
        f.write(f'Duplicates dropped: {len(dupes_dropped)}\n\n')

        f.write('## Unmatched entries\n\n')
        f.write('These curated lemmas have no row in the lemma CSV. They keep their old rank.\n\n')
        for lemma, pos, old_rank in sorted(unmatched, key=lambda x: (x[0], x[1])):
            f.write(f'- {lemma} ({pos}) — was rank {old_rank}\n')

        f.write('\n## Duplicates dropped\n\n')
        f.write('Entries that shared (lemma, pos, gender) with another after re-rank. Richer one kept.\n\n')
        for lemma, pos, gender, rank in sorted(dupes_dropped, key=lambda x: (x[0], x[1])):
            f.write(f'- {lemma} ({pos}, gender={gender}, was rank {rank})\n')

        f.write('\n## Large rank shifts (>100 positions)\n\n')
        f.write('| lemma | pos | old rank | new rank | match kind |\n|---|---|---|---|---|\n')
        rerank_diffs.sort(key=lambda x: x[3])
        for lemma, pos, old_r, new_r, kind in rerank_diffs:
            f.write(f'| {lemma} | {pos} | {old_r} | {new_r} | {kind} |\n')

    print(f'Re-rank complete.')
    print(f'  Entries before: {sum(matched_counts.values())}')
    print(f'  Entries after dedupe: {len(final)}')
    print(f'  Duplicates dropped: {len(dupes_dropped)}')
    print(f'  Unmatched: {matched_counts["none"]}')
    print(f'  Report: {REPORT}')


if __name__ == '__main__':
    main()
