"""Bulk-enrich Code's thin gap-fill entries:
- Refine themes from POS-default to lemma-specific (where the vocab chat's lookup knows it)
- Derive plurals for nouns with regular gender/ending patterns
- Set conjugation_class for regular verbs (-are most reliable)

Writes via tmp-then-rename to avoid the truncation issue we keep hitting.
"""
import json
import os
import sys
from pathlib import Path

# Import the LEMMA_THEMES lookup from the earlier apply_themes module by reading it inline
sys.path.insert(0, str(Path(__file__).parent))
from apply_themes import L as LEMMA_THEMES, POS_DEFAULTS

CURATED = Path('/sessions/sleepy-wizardly-bohr/mnt/Language Learning/data/vocabulary_it_frequency.json')
TMP = CURATED.with_suffix('.json.tmp')

# Common -isc class -ire verbs (takes -isc- in present sg + 3pl)
ISC_VERBS = {
    'finire', 'capire', 'preferire', 'costruire', 'pulire', 'punire', 'costituire',
    'garantire', 'distribuire', 'contribuire', 'attribuire', 'gestire', 'fornire',
    'agire', 'riferire', 'restituire', 'sostituire', 'sparire', 'scomparire',
    'ferire', 'guarire', 'impedire', 'proibire', 'suggerire', 'tradire',
    'inghiottire', 'condire', 'spedire', 'starnutire', 'tossire', 'unire',
    'reagire', 'aggredire', 'arrostire', 'arricchire', 'chiarire', 'definire',
    'demolire', 'digerire', 'diminuire', 'esibire', 'esaurire', 'fallire',
    'favorire', 'fiorire', 'fornire', 'imporre', 'indebolire', 'intuire',
    'languire', 'obbedire', 'partorire', 'percepire', 'presentire', 'pulire',
    'reagire', 'rincorrere', 'rinforzare', 'rispedire', 'sancire', 'sbalordire',
    'scolpire', 'scucire', 'seppellire', 'smentire', 'sparire', 'stabilire',
    'stupire', 'subire', 'supplire', 'svanire', 'svelare', 'tossire', 'tradire',
    'trasferire', 'ubbidire', 'unire', 'usufruire', 'vagire',
}

# Common regular -ere class (most -ere are irregular; this is the small regular set)
REGULAR_ERE = {
    'credere', 'ricevere', 'vendere', 'temere', 'battere', 'cedere', 'godere',
    'premere', 'ripetere', 'sedere', 'spremere', 'tessere', 'volere',
}

# Common regular -ire class (no -isc- infix)
REGULAR_IRE = {
    'dormire', 'sentire', 'partire', 'servire', 'aprire', 'coprire', 'offrire',
    'soffrire', 'bollire', 'avvertire', 'consentire', 'divertire', 'fuggire',
    'investire', 'pentirsi', 'seguire', 'vestire', 'mentire',
}


def derive_plural(lemma, gender, noun_class):
    """Derive plural for nouns with clean patterns. Returns None if uncertain."""
    if noun_class in ('invariable_loanword', 'invariable_accented_final'):
        return lemma
    if not lemma:
        return None
    # Tricky endings — skip, let humans handle
    tricky_endings = ('co', 'go', 'ca', 'ga', 'io', 'ia', 'cia', 'gia', 'cio', 'gio', 'che', 'ghe')
    for ending in tricky_endings:
        if lemma.endswith(ending):
            return None  # signals "uncertain, leave for review"
    if noun_class == 'regular_o_masc' and lemma.endswith('o'):
        return lemma[:-1] + 'i'
    if noun_class == 'regular_a_fem' and lemma.endswith('a'):
        return lemma[:-1] + 'e'
    if noun_class == 'greek_ma_masc' and lemma.endswith('a'):
        return lemma[:-1] + 'i'
    if noun_class == 'e_ambiguous' and lemma.endswith('e'):
        return lemma[:-1] + 'i'
    return None


def derive_conjugation(lemma):
    """Return conjugation_class for a verb infinitive. None if not a recognised pattern."""
    if not lemma:
        return None
    if lemma in ISC_VERBS:
        return 'ire_isco'
    if lemma in REGULAR_ERE:
        return 'ere_regular'
    if lemma in REGULAR_IRE:
        return 'ire_regular'
    if lemma.endswith('arsi') or lemma.endswith('ersi') or lemma.endswith('irsi'):
        # Reflexive — its class matches the base verb's class
        base_ending = lemma[-3]  # 'a', 'e', or 'i'
        if base_ending == 'a':
            return 'are_regular'
        # -ersi and -irsi are usually irregular or -isc; leave for review
        return None
    if lemma.endswith('are'):
        return 'are_regular'
    if lemma.endswith('ere'):
        return None  # most -ere are irregular; safer to leave blank
    if lemma.endswith('ire'):
        return None  # ambiguous between -isc and pure -ire
    return None


def refine_themes(entry):
    """If entry has POS-default themes, try to refine via LEMMA_THEMES lookup."""
    lemma = entry['lemma']
    current_themes = entry.get('themes', [])
    pos_default = POS_DEFAULTS.get(entry['pos'])
    # If themes were just POS-default placeholder, look up something better
    if lemma in LEMMA_THEMES:
        # Use the lemma-specific themes
        new = list(dict.fromkeys(LEMMA_THEMES[lemma]))
        if set(new) != set(current_themes):
            entry['themes'] = new
            return True
    return False


def main():
    with CURATED.open(encoding='utf-8') as f:
        data = json.load(f)

    n_thin = 0
    n_themes_refined = 0
    n_plural_added = 0
    n_conjugation_added = 0

    for e in data:
        if 'thin entry' not in (e.get('notes') or ''):
            continue
        n_thin += 1

        # Refine themes
        if refine_themes(e):
            n_themes_refined += 1

        # Derive plural for nouns
        if e.get('pos') == 'noun' and not e.get('plural'):
            p = derive_plural(e['lemma'], e.get('gender'), e.get('noun_class'))
            if p is not None:
                e['plural'] = p
                n_plural_added += 1

        # Derive conjugation_class for verbs
        if e.get('pos') == 'verb' and not e.get('conjugation_class'):
            c = derive_conjugation(e['lemma'])
            if c is not None:
                e['conjugation_class'] = c
                n_conjugation_added += 1

    # Write via tmp + rename to avoid truncation
    with TMP.open('w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.flush()
        os.fsync(f.fileno())
    os.replace(TMP, CURATED)

    print(f'Thin entries processed: {n_thin}')
    print(f'  Themes refined: {n_themes_refined}')
    print(f'  Plurals added: {n_plural_added}')
    print(f'  Conjugation classes added: {n_conjugation_added}')

    # Verify
    with CURATED.open() as f:
        verify = json.load(f)
    print(f'  File parses cleanly: {len(verify)} entries')


if __name__ == '__main__':
    main()
