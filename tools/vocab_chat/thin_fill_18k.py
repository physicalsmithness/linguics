"""Mass thin-fill of curated dictionary up to the full 18K lemma CSV.

For every (lemma, pos, gender) row in the lemma CSV not already represented in
the curated JSON, add a structural-only entry: rank, lemma, pos, gender, band,
POS-default theme, notes flag. translation_en is NULL — rich fill populates that.

Atomic tmp+rename write to avoid truncation.
"""
import csv
import json
import os
from pathlib import Path

DATA = Path('/sessions/sleepy-wizardly-bohr/mnt/Linguics/data')
LEMMAS_CSV = DATA / 'vocabulary_it_frequency_lemmas.csv.bak.preF'  # bash mount stale on the live file; preF is byte-identical for lemma/pos/gender/rank
CURATED = DATA / 'vocabulary_it_frequency.json'
TMP = CURATED.with_suffix('.json.tmp')

POS_DEFAULT_THEMES = {
    'noun': ['noun_abstract'],
    'verb': ['verb_action_general'],
    'adjective': ['adjective_quality'],
    'adverb': ['adverb_manner'],
    'pronoun': ['function_word', 'pronoun_personal'],
    'article': ['function_word'],
    'preposition': ['function_word'],
    'conjunction': ['function_word'],
    'interjection': ['interjection'],
    'numeral': ['numeral'],
    'determiner': ['function_word'],
}


def band_for_rank(rank):
    lo = ((rank - 1) // 100) * 100 + 1
    hi = lo + 99
    return f'vocabulary.it.freq_{lo}_{hi}'


def normalise_gender(g):
    if g in (None, '', 'na', 'NA'):
        return None
    return g


def normalise_field(v):
    if v in (None, '', 'na'):
        return None
    return v


def make_key(lemma, pos, gender):
    """Match-key consistent with curated JSON's (lemma, pos, gender) rule."""
    g = gender if pos == 'noun' else None
    return (lemma, pos, g)


def main():
    print(f'Loading curated: {CURATED}')
    with CURATED.open(encoding='utf-8') as f:
        curated = json.load(f)
    print(f'  current curated entries: {len(curated)}')

    existing = set(make_key(e['lemma'], e['pos'], e.get('gender')) for e in curated)
    print(f'  unique (lemma, pos, gender) keys: {len(existing)}')

    print(f'Loading lemma CSV: {LEMMAS_CSV}')
    with LEMMAS_CSV.open(encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    print(f'  lemma CSV rows: {len(rows)}')

    new_entries = []
    skipped_dupe = 0
    per_pos = {}
    for row in rows:
        lemma = row['lemma'].strip()
        pos = row['pos'].strip()
        gender_raw = normalise_gender(row.get('gender'))
        key = make_key(lemma, pos, gender_raw)
        if key in existing:
            skipped_dupe += 1
            continue
        try:
            merged_rank = int(row['rank'])
        except (ValueError, TypeError):
            continue

        gender = gender_raw if pos == 'noun' else None
        auxiliary = normalise_field(row.get('auxiliary')) if pos == 'verb' else None
        adj_class = normalise_field(row.get('adj_class')) if pos == 'adjective' else None

        entry = {
            'rank': merged_rank,
            'lemma': lemma,
            'pos': pos,
            'translation_en': None,
            'themes': list(POS_DEFAULT_THEMES.get(pos, ['unclassified'])),
            'band': band_for_rank(merged_rank),
            'gender': gender,
            'plural': None,
            'auxiliary': auxiliary,
            'conjugation_class': None,
            'adj_class': adj_class,
            'noun_class': None,
            'gloss_en': None,
            'notes': f'thin entry, mass gap-fill from lemma CSV merged_rank {merged_rank}; needs translation, theme refinement, derivation of plural/conjugation/noun_class as applicable',
        }
        new_entries.append(entry)
        existing.add(key)
        per_pos[pos] = per_pos.get(pos, 0) + 1

    print(f'\nNew thin entries to add: {len(new_entries)}')
    print(f'Skipped (already in curated): {skipped_dupe}')
    print('Per-POS breakdown of new entries:')
    for p, n in sorted(per_pos.items(), key=lambda x: -x[1]):
        print(f'  {p:14s}: {n}')

    if not new_entries:
        print('Nothing to add; bailing.')
        return

    merged = curated + new_entries
    merged.sort(key=lambda e: (e.get('rank') if e.get('rank') is not None else 999999, e['lemma'], e['pos']))

    print(f'\nWriting {len(merged)} entries to {TMP} ...')
    with TMP.open('w', encoding='utf-8') as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)
        f.flush()
        os.fsync(f.fileno())
    os.replace(TMP, CURATED)
    print(f'Renamed to {CURATED}')

    # Verify parse-clean
    with CURATED.open(encoding='utf-8') as f:
        verify = json.load(f)
    print(f'Verified parse: {len(verify)} entries')


if __name__ == '__main__':
    main()
