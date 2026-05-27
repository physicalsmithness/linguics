"""Apply architect-ratified schema updates to the curated vocabulary file:

1. Rename auxiliary 'either' → 'modal_aux_inheritance' (for modals) or
   'aux_varies_by_transitivity' (for transitivity-varying verbs).
2. Add noun_class field to every noun entry.
3. Report themes coverage (how many entries already have themes).
"""
import json
from pathlib import Path

CURATED = Path('/sessions/sleepy-wizardly-bohr/mnt/Language Learning/data/vocabulary_it_frequency.json')

# Modal verbs that inherit auxiliary from following infinitive
MODAL_VERBS = {'potere', 'dovere', 'volere'}

# Known invariable loanwords (gender doesn't shift, plural same as singular)
INVARIABLE_LOANWORDS = {
    'film', 'bar', 'menu', 'chef', 'computer', 'sport', 'taxi', 'tram', 'camion',
    'autobus', 'garage', 'jeans', 'foto', 'auto', 'moto', 'radio', 'metro',
    'tv', 'video',
}

# Nouns with irregular gender-shift plurals (m sg → f pl)
GENDER_SHIFT = {
    'braccio', 'uovo', 'dito', 'paio', 'osso', 'ginocchio', 'ciglio',
    'sopracciglio', 'lenzuolo', 'labbro', 'orecchio', 'miglio',
}

# Feminine nouns that end in -o (look masculine but aren't)
IRREGULAR_FEM_O = {
    'mano', 'radio', 'foto', 'auto', 'moto', 'eco',
}

# Known Greek-origin -ma masculines
GREEK_MA = {
    'problema', 'sistema', 'programma', 'dramma', 'tema', 'clima',
    'poema', 'schema', 'dilemma', 'panorama', 'fantasma', 'dogma',
}


def classify_noun(lemma, gender, plural):
    """Return the noun_class for an entry. Heuristic; rely on known sets where needed."""
    if lemma in INVARIABLE_LOANWORDS:
        return 'invariable_loanword'
    # Accented final vowel → invariable
    if lemma and lemma[-1] in ('à', 'è', 'ì', 'ò', 'ù'):
        return 'invariable_accented_final'
    if lemma in GENDER_SHIFT:
        return 'gender_shift_plural'
    if lemma in GREEK_MA:
        return 'greek_ma_masc'
    if lemma.endswith('ista'):
        return 'ista_common_gender'
    if lemma in IRREGULAR_FEM_O:
        return 'irregular_gender'
    # Pattern-based classification
    if lemma.endswith('o') and gender == 'm':
        return 'regular_o_masc'
    if lemma.endswith('a') and gender == 'f':
        return 'regular_a_fem'
    if lemma.endswith('e'):
        return 'e_ambiguous'
    # Catch-all for anything that doesn't fit a regular pattern
    return 'irregular_gender'


def main():
    with CURATED.open(encoding='utf-8') as f:
        data = json.load(f)

    aux_modal = 0
    aux_trans = 0
    noun_classes = {}
    themed = 0
    unthemed_by_band = {}

    for e in data:
        # Task 17: auxiliary rename
        if e.get('auxiliary') == 'either':
            if e.get('pos') == 'verb' and e.get('lemma') in MODAL_VERBS:
                e['auxiliary'] = 'modal_aux_inheritance'
                aux_modal += 1
            else:
                e['auxiliary'] = 'aux_varies_by_transitivity'
                aux_trans += 1

        # Task 18: noun_class
        if e.get('pos') == 'noun':
            nc = classify_noun(e['lemma'], e.get('gender'), e.get('plural'))
            e['noun_class'] = nc
            noun_classes[nc] = noun_classes.get(nc, 0) + 1

        # Themes coverage report
        if e.get('themes'):
            themed += 1
        else:
            band = e.get('band', 'unknown')
            unthemed_by_band[band] = unthemed_by_band.get(band, 0) + 1

    with CURATED.open('w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print('=== Task 17: auxiliary rename ===')
    print(f'  modal_aux_inheritance: {aux_modal}')
    print(f'  aux_varies_by_transitivity: {aux_trans}')
    print()
    print('=== Task 18: noun_class assigned ===')
    for nc, count in sorted(noun_classes.items(), key=lambda x: -x[1]):
        print(f'  {nc}: {count}')
    print()
    print('=== Themes coverage (task 12 status) ===')
    print(f'  Entries with themes: {themed} / {len(data)}')
    print(f'  Untagged by band (top 20 bands by untagged count):')
    items = sorted(unthemed_by_band.items(), key=lambda x: -x[1])[:20]
    for band, count in items:
        print(f'    {band}: {count}')


if __name__ == '__main__':
    main()
