"""Second-pass proper-noun cleanup. Same shape as strip_proper_nouns.py but
with extended patterns to catch residuals from the first pass (orphan country
names, 'a common surname', 'a habitational surname', 'a comune of', etc.).
"""
import json
import os
import re
from pathlib import Path

P = Path('/sessions/sleepy-wizardly-bohr/mnt/Linguics/data/vocabulary_it_frequency.json')
TMP = P.with_suffix('.json.tmp')

PROPER_NOUN_PATTERNS = [
    # First-pass patterns (already applied, included for safety)
    r'^\s*a\s+surname\b',
    r'^\s*a\s+male\s+given\s+name\b',
    r'^\s*a\s+female\s+given\s+name\b',
    r'^\s*a\s+given\s+name\b',
    r'^\s*female\s+equivalent\s+of\s+\w+\s*$',
    r'^\s*male\s+equivalent\s+of\s+\w+\s*$',
    r'^\s*feminine\s+equivalent\s+\w+\s*$',
    r'^\s*equivalent\s+to\s+english\s+',
    r'^\s*a\s+diminutive\s+of\s+',
    r'^\s*the\s+female\s+form\s+of\s+',
    r'^\s*a\s+town\s+(?:and\s+\w+\s+)?(?:of|in)\s+',
    r'^\s*a\s+commune\s+(?:in|of)\s+',
    r'^\s*a\s+frazione\s+(?:in|of)\s+',
    r'^\s*a\s+(?:small\s+)?town\s+in\s+',
    r'^\s*a\s+village\s+in\s+',
    r'^\s*a\s+city\s+in\s+',
    r'^\s*a\s+(?:river|mountain|lake)\s+in\s+',
    r'^\s*the\s+dialect\s+of\s+',
    r'^\s*name\s+of\s+a\s+saint\b',
    r'^\s*a\s+saint\b',
    r'^\s*native\s+(?:or\s+inhabitant\s+)?of\s+',
    r'^\s*inhabitant\s+of\s+',
    r'^\s*italian\s+(?:author|footballer|politician|actor|actress|director|singer|painter|composer|poet|writer)\b',
    r'^\s*\w+\s+is\s+a\s+(?:male|female)\s+given\s+name\b',
    r'^\s*originating\s+as\s+a\s+(?:patronymic|matronymic|ethnonym|occupation|toponym)\b',
    r'^\s*a\s+surname\s+(?:from|originating|originally)\b',

    # NEW patterns for second pass
    r'^\s*a\s+(?:common|habitational)\s+surname\b',
    r'^\s*a\s+(?:large\s+)?town\s+and\s+(?:province|comune|commune)\s+(?:of|in)\b',
    r'^\s*a\s+comune\s+(?:in|of)\s+',
    r'^\s*a\s+(?:small\s+)?(?:coastal\s+|fishing\s+)?(?:town|village|city|hamlet|district)\s+(?:in|of)\s+',
    r'^\s*a\s+former\s+(?:town|comune|village)\s+(?:in|of)\s+',
    r'^\s*a\s+(?:river|mountain|lake|island|peninsula|sea)\s+(?:in|of)\s+',
    r'^\s*the\s+(?:river|mountain|lake)\s+\w+',
    r'^\s*(?:Italy|France|Spain|Germany|Switzerland|Austria|England|Greece|Russia|Portugal)\s*$',
    r'^\s*acronym\s+of\s+',
    r'^\s*synonym\s+of\s+\w+\s*$',
    r'^\s*site\s+of\s+',
    r'^\s*a\s+(?:building|monument|statue|piazza|street|road)\s+in\s+',
    r'^\s*a\s+(?:chain|line)\s+of\s+',
    r'^\s*a\s+fictional\s+character\b',
    r'^\s*character\s+in\s+',
    r'^\s*film\s+by\s+',
    r'^\s*hosting\s+the\b',
    r'^\s*Campania,\s*Italy\b',
    r'^\s*Sicily,\s*Italy\b',
    r'^\s*Lazio,\s*Italy\b',
    r'^\s*Tuscany,\s*Italy\b',
    r'^\s*\w+,\s*Italy\s*$',  # e.g., "Veneto, Italy" alone
    r'^\s*\w+ese\s+is\s+',  # "Bolognese is a..."
    r'^\s*the\s+\w+\s+(?:Senate|Republic|Parliament|Empire)\b',
    r'^\s*the\s+(?:planned|former|current)\s+',
    r'^\s*or\s+derived\s+from\s+',  # tail like "...or derived from the given name"
    r'^\s*from\s+(?:Latin|Greek|Old|Middle)\s+',  # etymological
    r'^\s*the\s+(?:Italian|French|German|Spanish|Latin)\s+(?:author|footballer|politician|actor|composer|poet|writer|river|sea)\b',
]

PROPER_NOUN_REGEX = re.compile('|'.join(PROPER_NOUN_PATTERNS), re.IGNORECASE)


def is_proper_noun_chunk(chunk):
    chunk = chunk.strip()
    if not chunk:
        return True
    return PROPER_NOUN_REGEX.match(chunk) is not None


def split_translation(s):
    chunks = []
    depth = 0
    buf = []
    for ch in s:
        if ch in '([{':
            depth += 1
            buf.append(ch)
        elif ch in ')]}':
            depth -= 1
            buf.append(ch)
        elif ch == ',' and depth == 0:
            chunks.append(''.join(buf))
            buf = []
        else:
            buf.append(ch)
    if buf:
        chunks.append(''.join(buf))
    return [c.strip() for c in chunks if c.strip()]


def clean_translation(s):
    if not s or s == '[skip]':
        return s, False
    chunks = split_translation(s)
    kept = [c for c in chunks if not is_proper_noun_chunk(c)]
    if not kept:
        return None, True
    if len(kept) == len(chunks):
        return s, False
    return ', '.join(kept), True


def main():
    data = json.load(open(P, encoding='utf-8'))

    n_cleaned = 0
    n_skipped = 0
    examples = []

    for e in data:
        original = e.get('translation_en')
        cleaned, changed = clean_translation(original)
        if not changed:
            continue
        if cleaned is None:
            existing_notes = e.get('notes') or ''
            note_addition = f'proper-noun-only entry (was: {original!r}); marked skip'
            e['notes'] = note_addition if not existing_notes else f'{existing_notes}. {note_addition}'
            e['translation_en'] = '[skip]'
            e['translation_source'] = 'corpus_artefact'
            n_skipped += 1
            if len(examples) < 10:
                examples.append((e.get('rank'), e['lemma'], 'SKIP', original, '[skip]'))
        else:
            e['translation_en'] = cleaned
            n_cleaned += 1
            if len(examples) < 20:
                examples.append((e.get('rank'), e['lemma'], 'CLEAN', original, cleaned))

    print(f'Cleaned (proper-noun tail stripped): {n_cleaned}')
    print(f'Marked as skip (proper-noun-only):  {n_skipped}')
    print()
    print('Sample changes:')
    for r, l, kind, before, after in examples:
        print(f'  [{kind}] rank {r}  {l}')
        print(f'         before: {before!r}')
        print(f'         after:  {after!r}')

    with TMP.open('w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.flush()
        os.fsync(f.fileno())
    os.replace(TMP, P)

    verify = json.load(open(P, encoding='utf-8'))
    print(f'\nVerified parse: {len(verify)} entries total')


if __name__ == '__main__':
    main()
