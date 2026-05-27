"""Phase-1 rich enrichment using the EXTENDED LEMMA_THEMES table.

Like enrich_thin_v2 but imports L from extend_lemma_themes.py instead of
apply_themes.py, so the lookup covers ~2,850 lemmas instead of ~640.

Only updates entries currently on POS-default themes. Specific themes already
set (from hand-authoring) are preserved.

Atomic tmp+rename write.
"""
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from extend_lemma_themes import L as LEMMA_THEMES, POS_DEFAULTS
from enrich_thin_v2 import derive_conjugation, derive_noun_class, derive_plural

CURATED = Path('/sessions/sleepy-wizardly-bohr/mnt/Linguics/data/vocabulary_it_frequency.json')
TMP = CURATED.with_suffix('.json.tmp')

# Which themes are POS-default placeholders that should be replaced if a
# lemma-specific lookup hits?
POS_DEFAULT_THEMES = {
    'noun': {'noun_abstract'},
    'verb': {'verb_action_general'},
    'adjective': {'adjective_quality'},
    'adverb': {'adverb_manner'},
}


def refine_themes(entry):
    """If the entry's current themes are POS-default-only, replace with the
    lemma-specific lookup if available."""
    lemma = entry['lemma']
    current = entry.get('themes') or []
    pos = entry['pos']
    default = POS_DEFAULT_THEMES.get(pos, set())
    is_default = (set(current) == default) or not current

    if lemma in LEMMA_THEMES and is_default:
        new = list(dict.fromkeys(LEMMA_THEMES[lemma]))
        if set(new) != set(current):
            entry['themes'] = new
            return True
    return False


def main():
    with CURATED.open(encoding='utf-8') as f:
        data = json.load(f)

    n_thin = 0
    n_themes_refined = 0
    n_noun_class_added = 0
    n_plural_added = 0
    n_conjugation_added = 0
    n_themes_refined_non_thin = 0

    for e in data:
        is_thin = 'thin entry' in (e.get('notes') or '')

        # Theme refinement applies to ALL entries on POS-default themes,
        # not just thin ones — picks up entries authored before the extended L
        # was built.
        refined = refine_themes(e)
        if refined:
            if is_thin:
                n_themes_refined += 1
            else:
                n_themes_refined_non_thin += 1

        if not is_thin:
            continue
        n_thin += 1

        # Noun class / plural / conjugation only for thin entries
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

    print(f'Thin entries processed: {n_thin}')
    print(f'  themes refined (thin):     {n_themes_refined}')
    print(f'  themes refined (non-thin): {n_themes_refined_non_thin}')
    print(f'  noun_class added:          {n_noun_class_added}')
    print(f'  plural added:              {n_plural_added}')
    print(f'  conjugation_class added:   {n_conjugation_added}')

    with CURATED.open(encoding='utf-8') as f:
        verify = json.load(f)
    print(f'\nVerified parse: {len(verify)} entries total')


if __name__ == '__main__':
    main()
