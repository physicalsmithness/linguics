"""Strip proper-noun pollution from translation_en strings.

Wiktionary entries often include the proper-noun sense (surname, given name,
place name) of a lemma alongside the common sense. Code's bulk pull pasted
these straight into translation_en, causing learner-marker failures like the
'fortunato → lucky' rejection.

Strategy: split translation_en by comma; for each chunk, decide if it's a
proper-noun fragment (matches one of the patterns below). Drop the proper-noun
chunks. If chunks remain, re-join. If no chunks remain (the WHOLE translation
was proper-noun), mark the entry as [skip].

Atomic write.
"""
import json
import os
import re
from pathlib import Path

P = Path('/sessions/sleepy-wizardly-bohr/mnt/Linguics/data/vocabulary_it_frequency.json')
TMP = P.with_suffix('.json.tmp')

# Regex patterns identifying proper-noun chunks. Case-insensitive match.
PROPER_NOUN_PATTERNS = [
    r'^\s*a\s+surname\b',
    r'^\s*a\s+(?:common|habitational)\s+surname\b',
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
    r'^\s*a\s+(?:large\s+)?town\s+(?:and\s+(?:province|comune|commune)\s+(?:of|in))\b',
    r'^\s*a\s+commune\s+(?:in|of)\s+',
    r'^\s*a\s+comune\s+(?:in|of)\s+',
    r'^\s*a\s+frazione\s+(?:in|of)\s+',
    r'^\s*a\s+(?:small\s+)?town\s+in\s+',
    r'^\s*a\s+(?:small\s+)?(?:coastal\s+|fishing\s+)?(?:town|village|city|hamlet|district)\s+(?:in|of)\s+',
    r'^\s*a\s+village\s+in\s+',
    r'^\s*a\s+city\s+in\s+',
    r'^\s*a\s+(?:river|mountain|lake|island)\s+(?:in|of)\s+',
    r'^\s*the\s+(?:river|mountain|lake)\s+\w+',
    r'^\s*the\s+dialect\s+of\s+',
    r'^\s*name\s+of\s+a\s+saint\b',
    r'^\s*a\s+saint\b',
    r'^\s*native\s+(?:or\s+inhabitant\s+)?of\s+',
    r'^\s*inhabitant\s+of\s+',
    r'^\s*italian\s+(?:author|footballer|politician|actor|actress|director|singer|painter|composer|poet|writer|cardinal)\b',
    r'^\s*\w+\s+is\s+a\s+(?:male|female)\s+given\s+name\b',
    r'^\s*originating\s+as\s+a\s+(?:patronymic|matronymic|ethnonym|occupation|toponym)\b',
    r'^\s*a\s+surname\s+(?:from|originating|originally)\b',
    r'^\s*(?:Italy|France|Spain|Germany|Switzerland|Austria)\s*$',
    r'^\s*acronym\s+of\s+',
    r'^\s*site\s+of\s+',
    r'^\s*a\s+(?:building|monument|statue|piazza)\s+in\s+',
    r'^\s*a\s+(?:chain|line)\s+of\s+',
    r'^\s*a\s+fictional\s+character\b',
    r'^\s*character\s+in\s+',
    r'^\s*film\s+by\s+',
    r'^\s*hosting\s+the\b',
    r'^\s*Campania,\s*Italy\b',
    r'^\s*Sicily,\s*Italy\b',
]

PROPER_NOUN_REGEX = re.compile('|'.join(PROPER_NOUN_PATTERNS), re.IGNORECASE)


def is_proper_noun_chunk(chunk):
    chunk = chunk.strip()
    if not chunk:
        return True  # empty chunks aren't useful
    return PROPER_NOUN_REGEX.match(chunk) is not None


def split_translation(s):
    """Split on commas, but only at the top level (not inside parens)."""
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
    """Return (cleaned_translation_or_None, was_changed)."""
    if not s or s == '[skip]':
        return s, False
    chunks = split_translation(s)
    kept = [c for c in chunks if not is_proper_noun_chunk(c)]
    if not kept:
        return None, True  # signal: mark as skip
    if len(kept) == len(chunks):
        return s, False  # no change
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
            # Entire translation was proper-noun — mark as skip
            note_addition = f'proper-noun-only entry (was: {original!r}); marked skip — not useful for vocab practice'
            existing_notes = e.get('notes') or ''
            if 'thin entry' in existing_notes:
                existing_notes = existing_notes  # keep thin-entry trail
            e['notes'] = note_addition if not existing_notes else f'{existing_notes}. {note_addition}'
            e['translation_en'] = '[skip]'
            e['translation_source'] = 'corpus_artefact'
            n_skipped += 1
            if len(examples) < 8:
                examples.append((e.get('rank'), e['lemma'], 'SKIP', original, '[skip]'))
        else:
            e['translation_en'] = cleaned
            n_cleaned += 1
            if len(examples) < 16:
                examp