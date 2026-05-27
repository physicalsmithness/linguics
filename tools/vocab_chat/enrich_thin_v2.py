"""Phase-1 rich enrichment of all thin entries.

Processes every entry whose notes contain 'thin entry' (catches Brief A's
gap-fills AND today's mass thin fill). Derivations happen in order:

  1. noun_class  (from lemma + gender + ending)
  2. plural      (uses the noun_class just derived)
  3. conjugation_class (verbs only, regular patterns)
  4. themes      (lemma-specific lookup overrides POS-defaults)

Atomic tmp+rename write. Never overwrites a field that's already non-NULL.
"""
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from apply_themes import L as LEMMA_THEMES, POS_DEFAULTS
from enrich_thin import ISC_VERBS, REGULAR_ERE, REGULAR_IRE, derive_conjugation

CURATED = Path('/sessions/sleepy-wizardly-bohr/mnt/Linguics/data/vocabulary_it_frequency.json')
TMP = CURATED.with_suffix('.json.tmp')


# -ma masculine nouns of Greek origin (regular pluralise -i, masculine despite -a ending)
GREEK_MA_MASC = {
    'problema', 'sistema', 'tema', 'programma', 'schema', 'clima', 'diagramma',
    'dilemma', 'dramma', 'enigma', 'fantasma', 'panorama', 'poema', 'stigma',
    'telegramma', 'teorema', 'trauma', 'aroma', 'carisma', 'cinema', 'diploma',
    'dogma', 'epigramma', 'fonema', 'lemma', 'magma', 'monogramma', 'morfema',
    'pentagramma', 'plasma', 'pneuma', 'prisma', 'sarcoma', 'sintagma',
    'sintomo',  # actually -o, but related; skip
}
GREEK_MA_MASC.discard('sintomo')  # belt and braces

# -ista common-gender nouns (same form for m and f; plural -isti / -iste)
ISTA_COMMON = {
    'artista', 'autista', 'dentista', 'farmacista', 'giornalista', 'pianista',
    'turista', 'pessimista', 'ottimista', 'realista', 'idealista', 'specialista',
    'analista', 'attivista', 'comunista', 'fascista', 'femminista', 'razzista',
    'socialista', 'capitalista', 'protagonista', 'antagonista', 'violinista',
    'chitarrista', 'batterista', 'novellista', 'romanziere',  # last one not -ista, skip
}
ISTA_COMMON.discard('romanziere')

# Gender-shift plurals (m sg → f pl)
GENDER_SHIFT_PLURAL = {
    'braccio', 'dito', 'uovo', 'paio', 'ginocchio', 'lenzuolo', 'osso', 'labbro',
    'ciglio', 'sopracciglio', 'centinaio', 'migliaio', 'miglio', 'staio',
    'fondamento', 'membro', 'budello', 'cervello', 'cuoio', 'filo', 'frutto',
    'fuso', 'gesto', 'grido', 'muro', 'urlo',
}

# Accented final vowels (always invariable)
ACCENTED_VOWELS = ('à', 'è', 'é', 'ì', 'í', 'ò', 'ó', 'ù', 'ú')

# Foreign / loanword consonant endings (usually invariable)
LOANWORD_CONSONANT_ENDINGS = ('sport', 'film', 'bar', 'computer', 'gas', 'tram',
                              'autobus', 'lapis', 'virus')  # heuristic only


def derive_noun_class(lemma, gender):
    """Return noun_class string based on lemma + gender + ending. None if unsure."""
    if not lemma or not gender:
        return None
    g = gender.lower() if isinstance(gender, str) else None

    # Accented final vowel → invariable
    if any(lemma.endswith(v) for v in ACCENTED_VOWELS):
        return 'invariable_accented_final'

    # Loanword / consonant final → invariable
    if lemma and lemma[-1] not in 'aeiou' + ''.join(ACCENTED_VOWELS):
        return 'invariable_loanword'

    # Greek-origin -ma masculine
    if lemma in GREEK_MA_MASC and g == 'm':
        return 'greek_ma_masc'

    # -ista common gender
    if lemma in ISTA_COMMON:
        return 'ista_common_gender'

    # Gender-shift plurals (m sg becomes f pl)
    if lemma in GENDER_SHIFT_PLURAL and g == 'm':
        return 'gender_shift_plural'

    # Regular -o masculine
    if g == 'm' and lemma.endswith('o'):
        # Check tricky endings that need review
        tricky = ('co', 'go', 'io')
        for t in tricky:
            if lemma.endswith(t):
                return None  # leave for review (might be regular_o_masc, but plural is tricky)
        return 'regular_o_masc'

    # Regular -a feminine
    if g == 'f' and lemma.endswith('a'):
        tricky = ('ca', 'ga', 'ia', 'cia', 'gia')
        for t in tricky:
            if lemma.endswith(t):
                return None
        return 'regular_a_fem'

    # -e: ambiguous gender (both m and f possible, signalled by gender field)
    if lemma.endswith('e'):
        return 'e_ambiguous'

    return None


def derive_plural(lemma, gender, noun_class):
    """Derive plural for nouns. Returns None if uncertain."""
    if not lemma or not noun_class:
        return None
    if noun_class in ('invariable_loanword', 'invariable_accented_final'):
        return lemma
    if noun_class == 'regular_o_masc' and lemma.endswith('o'):
        return lemma[:-1] + 'i'
    if noun_class == 'regular_a_fem' and lemma.endswith('a'):
        return lemma[:-1] + 'e'
    if noun_class == 'greek_ma_masc' and lemma.endswith('a'):
        return lemma[:-1] + 'i'
    if noun_class == 'e_ambiguous' and lemma.endswith('e'):
        return lemma[:-1] + 'i'
    if noun_class == 'ista_common_gender' and lemma.endswith('a'):
        # Plural differs by gender: -isti (m) / -iste (f)
        if gender == 'm':
            return lemma[:-1] + 'i'
        if gender == 'f':
            return lemma[:-1] + 'e'
        return None  # gender unspecified
    if noun_class == 'gender_shift_plural':
        # These are irregular individually; leave for hand authoring
        return None
    return None


def refine_themes(entry):
    lemma = entry['lemma']
    current_themes = entry.get('themes', [])
    if lemma in LEMMA_THEMES:
        new = list(dict.fromkeys(LEMMA_THEMES[lemma]))
        if set(new) != set(current_themes):
            entry['themes'] = new
            return True
    return False


def main():
    with CURATED.open(encoding='utf-8') as f:
        data = json.load(f)

    n_thin = 0
    n_noun_class_added = 0
    n_plural_added = 0
    n_conjugation_added = 0
    n_themes_refined = 0

    for e in data:
        if 'thin entry' not in (e.get('notes') or ''):
            continue
        n_thin += 1

        # 1. noun_class (before plural, so plural can use it)
        if e.get('pos') == 'noun' and not e.get('noun_class'):
            nc = derive_noun_class(e['lemma'], e.get('gender'))
            if nc:
                e['noun_class'] = nc
                n_noun_class_added += 1

        # 2. plural
        if e.get('pos') == 'noun' and not e.get('plural'):
            p = derive_plural(e['lemma'], e.get('gender'), e.get('noun_class'))
            if p is not None:
                e['plural'] = p
                n_plural_added += 1

        # 3. conjugation_class for verbs
        if e.get('pos') == 'verb' and not e.get('conjugation_class'):
            c = derive_conjugation(e['lemma'])
            if c:
                e['conjugation_class'] = c
                n_conjugation_added += 1

        # 4. themes refinement
        if refine_themes(e):
            n_themes_refined += 1

    # Atomic write
    with TMP.open('w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.flush()
        os.fsync(f.fileno())
    os.replace(TMP, CURATED)

    print(f'Thin entries processed: {n_thin}')
    print(f'  noun_class added:       {n_noun_class_added}')
    print(f'  plural added:           {n_plural_added}')
    print(f'  conjugation_class added:{n_conjugation_added}')
    print(f'  themes refined:         {n_themes_refined}')

    # Verify
    with CURATED.open(encoding='utf-8') as f:
        verify = json.load(f)
    print(f'\nFile parses cleanly: {len(verify)} entries total')


if __name__ == '__main__':
    main()
