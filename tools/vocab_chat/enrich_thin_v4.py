"""Enrichment using the sub-theme-aware LEMMA_THEMES table (extend_lemma_themes_v2).

Like v3 but the L dict now carries parent+child theme pairs for the biggest
categories (food_drink, animals, science_technology, arts_entertainment).
Entries that already carry a refined parent theme but no sub-theme can be
upgraded to include the sub-theme via this pass.
"""
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from extend_lemma_themes_v2 import L as LEMMA_THEMES
from enrich_thin_v2 import derive_conjugation, derive_noun_class, derive_plural

CURATED = Path('/sessions/sleepy-wizardly-bohr/mnt/Linguics/data/vocabulary_it_frequency.json')
TMP = CURATED.with_suffix('.json.tmp')

POS_DEFAULT_THEMES = {
    'noun': {'noun_abstract'},
    'verb': {'verb_action_general'},
    'adjective': {'adjective_quality'},
    'adverb': {'adverb_manner'},
}


def refine_themes(entry):
    """Two cases:
      1. Entry is on POS-default themes only and the lookup has it → replace.
      2. Entry has the parent theme (e.g. food_drink) but is missing a sub-theme
         the lookup provides (e.g. food_fruit) → merge in the missing sub-themes.
    Returns True if anything changed.
    """
    lemma = entry['lemma']
    if lemma not in LEMMA_THEMES:
        return False

    current = entry.get('themes') or []
    pos = entry['pos']
    default = POS_DEFAULT_THEMES.get(pos, set())
    is_default = (set(current) == default) or not current

    lookup_themes = list(dict.fromkeys(LEMMA_THEMES[lemma]))

    if is_default:
        entry['themes'] = lookup_themes
        return set(lookup_themes) != set(current)
    else:
        # Merge: add any lookup themes not already present
        new = list(current)
        added = False
        for t in lookup_themes:
            if t not in new:
                new.append(t)
                added = True
        if added:
            entry['themes'] = new
        return added


def main():
    with CURATED.open(encoding='utf-8') as f:
        data = json.load(f)

    n_thin = 0
    n_themes_changed = 0
    n_noun_class_added = 0
    n_plural_added = 0
    n_conjugation_added = 0

    for e in data:
        is_thin = 'thin entry' in (e.get('notes') or '')

        if refine_themes(e):
            n_themes_changed += 1

        if not is_thin:
            continue
        n_thin += 1

        if e.get('pos') == 'noun' and not e.get('noun_class'):
            nc = derive_noun_class(e['lemma'], e.get('gender'))
            if nc:
                e['noun_class'] = nc
                n_noun_class_added += 1

        if e.get('pos') == 'noun' and not e.get('plural'):
            p = derive_plural(e['lemma'], e.get('gender'), e.get('noun_class'))
            if p is not None:
                e['plural'] = p
                n_plural_added += 1

        if e.get('pos') == 'verb' and not e.get('conjugation_class'):
            c = derive_conjugation(e['lemma'])
            if c:
                e['conjugation_class'] = c
                n_conjugation_added += 1

    with TMP.open('w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.flush()
        os.fsync(f.fileno())
    os.replace(TMP, CURATED)

    print(f'Thin entries processed:       {n_thin}')
    print(f'Theme changes (across all):   {n_themes_changed}')
    print(f'  noun_class added:           {n_noun_class_added}')
    print(f'  plural added:               {n_plural_added}')
    print(f'  conjugation_class added:    {n_conjugation_added}')

    with CURATED.open(encoding='utf-8') as f:
        verify = json.load(f)
    print(f'\nVerified parse: {len(verify)} entries total')


if __name__ == '__main__':
    main()
