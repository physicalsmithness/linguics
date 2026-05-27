"""Apply a batch of curated translations to the curated dictionary.

Usage: pass the path of a module that defines a TRANSLATIONS dict keyed by
(lemma, pos, gender_or_None). The dict values are dicts containing any of:
  translation_en, gloss_en, themes, plural, conjugation_class, noun_class,
  adj_class, auxiliary, notes, skip (if True, mark as 'skip - corpus artefact').

For each matching entry in the curated JSON, fields are populated where they're
currently NULL. Fields already populated by hand stay as they are unless the
batch explicitly provides a different value AND prefixes the key with 'force_'.

Atomic tmp+rename write.
"""
import json
import os
import sys
import importlib.util
from pathlib import Path

CURATED = Path('/sessions/sleepy-wizardly-bohr/mnt/Linguics/data/vocabulary_it_frequency.json')
TMP = CURATED.with_suffix('.json.tmp')

UPDATABLE_FIELDS = {
    'translation_en', 'gloss_en', 'themes', 'plural', 'conjugation_class',
    'noun_class', 'adj_class', 'auxiliary', 'notes',
}


def load_batch(path):
    spec = importlib.util.spec_from_file_location('batch', path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.TRANSLATIONS


def normalise_key(lemma, pos, gender):
    g = gender if pos == 'noun' else None
    return (lemma, pos, g)


def main():
    if len(sys.argv) != 2:
        print(f'Usage: {sys.argv[0]} <batch_file.py>')
        sys.exit(1)

    batch = load_batch(sys.argv[1])
    print(f'Loaded batch: {len(batch)} translations')

    with CURATED.open(encoding='utf-8') as f:
        data = json.load(f)

    # Index entries by key
    by_key = {}
    for e in data:
        k = normalise_key(e['lemma'], e['pos'], e.get('gender'))
        by_key.setdefault(k, []).append(e)

    applied = 0
    missing = 0
    skipped = 0
    field_counts = {}

    for key, updates in batch.items():
        if key not in by_key:
            print(f'  MISSING: {key}')
            missing += 1
            continue

        # Handle "skip - corpus artefact" case
        if updates.get('skip'):
            for e in by_key[key]:
                e['notes'] = updates.get('notes', 'corpus artefact, not a true lemma; skip for marker')
                e['translation_en'] = '[skip]'
                skipped += 1
            continue

        # Apply non-skip fields
        for e in by_key[key]:
            applied_one = False
            for field in UPDATABLE_FIELDS:
                if field not in updates:
                    continue
                # Only overwrite NULL/missing fields, OR if a force_ prefix is used
                force = updates.get(f'force_{field}', False)
                current = e.get(field)
                is_empty = current is None or (field == 'themes' and not current)
                # For themes: if entry is on POS-default only, that counts as 'empty'
                if field == 'themes':
                    POS_DEFAULTS = {
                        'noun': ['noun_abstract'],
                        'verb': ['verb_action_general'],
                        'adjective': ['adjective_quality'],
                        'adverb': ['adverb_manner'],
                    }
                    if current and set(current) == set(POS_DEFAULTS.get(e['pos'], [])):
                        is_empty = True
                if is_empty or force:
                    e[field] = updates[field]
                    field_counts[field] = field_counts.get(field, 0) + 1
                    applied_one = True
            if applied_one:
                # Clear 'thin entry' notes prefix when rich content lands, but only
                # if the user didn't supply their own notes for this entry
                if 'notes' not in updates and e.get('notes') and 'thin entry' in e['notes']:
                    e['notes'] = None
                applied += 1

    print()
    print(f'Applied: {applied} entries updated')
    print(f'Skipped (corpus artefacts): {skipped}')
    print(f'Missing (no matching curated entry): {missing}')
    print('Field-level counts:')
    for f, n in sorted(field_counts.items(), key=lambda x: -x[1]):
        print(f'  {f}: {n}')

    with TMP.open('w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.flush()
        os.fsync(f.fileno())
    os.replace(TMP, CURATED)

    with CURATED.open(encoding='utf-8') as f:
        verify = json.load(f)
    print(f'\nVerified parse: {len(verify)} entries total')


if __name__ == '__main__':
    main()
