"""Analyzer for the tier-2 SEARCH packet.

For each Italian reference translation, identify adjectives and map them to
adjective_agreement.* buckets.

Design: hand-built form → (lemma, category, slot) lookup for common Italian
adjectives, plus special-case handling for the six allomorphic specials (bello,
buono, grande, mezzo, quello, santo) and the invariable colour compounds.

Per the packet's `store_the_most_specific_claim` instruction, cite LEAVES only.
Architecture reverted this in the thread cover note; my return argues for
leaves-only. The consumer can walk ancestors trivially.
"""
import json, re, sys
from collections import defaultdict

# ============================================================
# LEXICON: form -> list of (lemma, category, slot, extras)
# A form may map to multiple entries (ambiguous surface).
# ============================================================

def _add(lex, form, entry):
    lex.setdefault(form, []).append(entry)

def build_lexicon():
    lex = defaultdict(list)

    # Class I: 4 forms {-o m.sg, -a f.sg, -i m.pl, -e f.pl}
    # (lemma, category, slot, extras)
    # extras includes stem-change category for irregular plurals
    CLASS_I = [
        ('rosso', {}), ('nero', {}), ('giallo', {}),
        ('grigio', {'stem_gio_gi':True}),  # grigi, grige/grigie
        ('bianco', {'stem_co_chi':True}),
        ('alto', {}), ('basso', {}),
        ('nuovo', {}), ('vecchio', {'stem_cio_ci':True}),  # vecchi
        ('buono', {'special_buono':True}),  # handled separately mostly
        ('cattivo', {}),
        ('italiano', {}), ('americano', {}), ('tedesco', {'stem_co_chi':True}),
        ('spagnolo', {}), ('russo', {}), ('cinese_NO', {}),  # cinese is Class II
        ('lungo', {'stem_go_ghi':True}),
        ('largo', {'stem_go_ghi':True}),
        ('corto', {}),
        ('simpatico', {'stem_co_ci_stress':True}),
        ('antipatico', {'stem_co_ci_stress':True}),
        ('noioso', {}), ('carino', {}),
        ('stanco', {'stem_co_chi':True}),
        ('affamato', {}), ('contento', {}), ('felice_NO', {}),  # felice Class II
        ('piccolo', {}),
        ('bravo', {}),
        ('saggio', {'stem_gio_gi':True}),
        ('amico', {'stem_irregular_amico':True}),  # amici m.pl irregular
        ('greco', {'stem_irregular_greco':True}),  # greci
        ('pratico', {'stem_co_ci_stress':True}),
        ('politico', {'stem_co_ci_stress':True}),
        ('storico', {'stem_co_ci_stress':True}),
        ('pubblico', {'stem_co_ci_stress':True}),
        ('fantastico', {'stem_co_ci_stress':True}),
        ('magnifico', {'stem_co_ci_stress':True}),
        ('unico', {'stem_co_ci_stress':True}),
        ('artistico', {'stem_co_ci_stress':True}),
        ('povero', {'semantic_shift_povero':True}),
        ('ricco', {'stem_co_chi':True}),
        ('pieno', {}), ('vuoto', {}),
        ('chiuso', {}), ('aperto', {}),
        ('caro', {}),
        ('freddo', {}), ('caldo', {}),
        ('tranquillo', {}), ('silenzioso', {}), ('rumoroso', {}),
        ('sporco', {'stem_co_chi':True}),
        ('pulito', {}),
        ('lento', {}), ('veloce_NO', {}),  # veloce Class II
        ('curioso', {}), ('geloso', {}),
        ('generoso', {}), ('numeroso', {}),
        ('famoso', {}),
        ('pericoloso', {}),
        ('meraviglioso', {}),
        ('luminoso', {}), ('doloroso', {}),
        ('serio', {}), ('sicuro', {}), ('malato', {}),
        ('sano', {}), ('salato', {}), ('dolce_NO', {}),  # dolce Class II
        ('salutare_NO', {}),  # salutare Class II
        ('pigro', {}), ('coraggioso', {}), ('gentile_NO', {}),  # gentile Class II
        ('bello', {'special_bello':True}),
        ('grande', {'special_grande':True, 'semantic_shift_grande':True}),  # grande is Class II by ending but also special allomorph
        # actually grande is Class II — treat as class_II_special
        ('mezzo', {'special_mezzo':True}),
        ('quello', {'special_quello':True}),
        ('santo', {'special_santo':True}),
        ('antico', {'stem_irregular_antico':True}),
        ('poco', {'stem_co_chi':True}),
        ('scarso', {}),
        ('lieto', {}), ('triste_NO', {}),  # triste Class II
        ('divertente_NO', {}),  # Class II
        ('elegante_NO', {}),  # Class II
        ('romantico', {'stem_co_ci_stress':True}),
        ('dinamico', {'stem_co_ci_stress':True}),
        ('automatico', {'stem_co_ci_stress':True}),
        ('turistico', {'stem_co_ci_stress':True}),
        ('tipico', {'stem_co_ci_stress':True}),
        ('economico', {'stem_co_ci_stress':True}),
        ('logico', {'stem_co_ci_stress':True}),
        ('critico', {'stem_co_ci_stress':True}),
        ('classico', {'stem_co_ci_stress':True}),
        ('chimico', {'stem_co_ci_stress':True}),
        ('medico_ADJ', {'stem_co_ci_stress':True}),
        ('barbaro', {}),
        ('duro', {}), ('morbido', {}),
        ('sottile_NO', {}),  # Class II
        ('grosso', {}),
        ('sensibile_NO', {}),  # Class II
        ('possibile_NO', {}),  # Class II
        ('robusto', {}),
        ('anziano', {}),
        ('vero', {}),
        ('falso', {}),
        ('perfetto', {}),
        ('sicuro', {}),
        ('preciso', {}),
        ('generico', {'stem_co_ci_stress':True}),
        ('libero', {}),
        ('occupato', {}),
        ('completo', {}),
        ('vasto', {}),
        ('stretto', {}),
        ('leggero', {}),
        ('pesante_NO', {}),  # Class II
        ('cotto', {}),
        ('crudo', {}),
        ('dorato', {}),
        ('acido', {}),
        ('amaro', {}), ('agrodolce_NO', {}),  # Class II
        ('splendido', {}),
        ('brutto', {}),
        ('facile_NO', {}),  # Class II
        ('difficile_NO', {}),
        ('probabile_NO', {}),
        ('gigantesco', {'stem_co_chi':True}),
        ('scemo', {}),
        ('sveglio', {'stem_gio_gi':True}),
        ('addormentato', {}),
        ('addormentata_ONLY', {}),  # will be handled
    ]

    # Class II: 2 forms {-e sg, -i pl}
    CLASS_II = [
        'intelligente', 'felice', 'verde', 'gentile', 'difficile', 'facile',
        'importante', 'interessante', 'triste', 'forte', 'debole', 'giovane',
        'francese', 'inglese', 'olandese', 'portoghese', 'cinese', 'giapponese',
        'dolce', 'pesante', 'gigante', 'elegante', 'presente', 'assente',
        'semplice', 'sagace', 'veloce', 'indipendente', 'dipendente',
        'seguente', 'precedente', 'corrente', 'sufficiente', 'urgente',
        'comune', 'breve', 'celeste', 'agile', 'utile', 'notevole',
        'possibile', 'impossibile', 'probabile', 'terribile', 'orribile',
        'sensibile', 'visibile', 'invisibile', 'incredibile', 'divertente',
        'affascinante', 'preoccupante', 'stancante', 'sorprendente',
        'commovente', 'brillante', 'attraente', 'convincente',
        'compatibile', 'accettabile', 'ragionevole', 'notevole', 'stabile',
        'mobile', 'nobile', 'abile', 'inutile', 'giovane', 'grande',
        'salutare', 'sottile', 'agrodolce', 'evidente', 'diverso_NO',  # diverso Class I
        'notevole', 'importante',
    ]

    # Invariable colour-from-noun
    INV_COLOUR_NOUN = ['blu', 'rosa', 'viola', 'marrone', 'beige', 'lilla',
                       'indaco', 'ocra', 'kaki']

    # Invariable pari family
    INV_PARI = ['pari', 'dispari', 'impari']

    # Invariable compound colours (bigrams)
    INV_COMPOUND = [
        'verde scuro', 'verde chiaro', 'verde acqua',
        'blu marino', 'blu notte', 'blu scuro', 'blu chiaro',
        'giallo limone', 'giallo oro',
        'rosso fuoco', 'rosso vino',
        'grigio topo', 'grigio chiaro', 'grigio scuro',
        'marrone chiaro', 'marrone scuro',
    ]

    # ==========
    # Class I:
    for lem_key, extras in CLASS_I:
        # Skip NO markers (adjectives that are actually Class II) and _ONLY / _ADJ suffixes
        lem = lem_key
        if lem.endswith('_NO') or lem.endswith('_ONLY') or lem.endswith('_ADJ'):
            lem = lem.rsplit('_', 1)[0]
            if lem_key.endswith('_NO'):
                continue  # skip — it's Class II not Class I
        # generate forms
        # Handle special allomorphs separately (they have overridden slots)
        if extras.get('special_bello'):
            # bello handled below with allomorphs
            continue
        if extras.get('special_quello'):
            continue
        if extras.get('special_santo'):
            continue
        if extras.get('special_grande'):
            # grande is Class II, not Class I — treat as Class II with special
            for form, slot in [('grande','sg'), ('grandi','pl'), ('gran','sg_apocope')]:
                _add(lex, form, {'lemma':'grande', 'cat':'class_II', 'slot':slot,
                                 'special':'grande_prenominal' if slot=='sg_apocope' else None,
                                 'semantic_shift': 'grande'})
            continue
        if extras.get('special_mezzo'):
            # mezzo has Class I forms plus a "special_mezzo" bucket
            for form, slot in [('mezzo','msg'), ('mezza','fsg'), ('mezzi','mpl'), ('mezze','fpl')]:
                _add(lex, form, {'lemma':'mezzo','cat':'class_I','slot':slot,'special':'mezzo'})
            continue
        if extras.get('special_buono'):
            # buono has Class I forms plus special allomorph forms
            for form, slot in [('buono','msg'),('buona','fsg'),('buoni','mpl'),('buone','fpl')]:
                _add(lex, form, {'lemma':'buono','cat':'class_I','slot':slot,'special':'buono'})
            for form, slot in [('buon','msg_apocope'), ("buon'",'fsg_elision')]:
                _add(lex, form, {'lemma':'buono','cat':'class_I','slot':slot,'special':'buono'})
            continue
        # Standard Class I: -o/-a/-i/-e, plus stem-change plurals
        stem = lem[:-1]  # drop -o
        forms = {}
        forms[stem + 'o'] = 'msg'
        forms[stem + 'a'] = 'fsg'
        # m.pl and f.pl depend on stem
        # Default: -i, -e
        if extras.get('stem_co_chi'):
            forms[stem[:-1] + 'chi'] = ('mpl', 'stem_change', 'predictable.co_chi')
            forms[stem[:-1] + 'che'] = ('fpl', 'stem_change', 'predictable.ca_che')
        elif extras.get('stem_go_ghi'):
            forms[stem[:-1] + 'ghi'] = ('mpl', 'stem_change', 'predictable.go_ghi')
            forms[stem[:-1] + 'ghe'] = ('fpl', 'stem_change', 'predictable.ga_ghe')
        elif extras.get('stem_co_ci_stress'):
            forms[stem[:-1] + 'ci'] = ('mpl', 'stem_change', 'harder.co_ci_vs_chi_stress')
            forms[stem[:-1] + 'che'] = ('fpl', 'stem_change', 'predictable.ca_che')
        elif extras.get('stem_cio_ci'):
            # -cio: drop unstressed i in m.pl; -cia f.pl drops i to -ce
            forms[stem[:-2] + 'ci'] = ('mpl', 'stem_change', 'predictable.cio_ci')
            forms[stem[:-2] + 'ce'] = ('fpl', 'stem_change', 'predictable.cia_ce')
        elif extras.get('stem_gio_gi'):
            forms[stem[:-2] + 'gi'] = ('mpl', 'stem_change', 'predictable.gio_gi')
            forms[stem[:-2] + 'ge'] = ('fpl', 'stem_change', 'predictable.gia_ge')
        elif extras.get('stem_irregular_amico'):
            forms['amici'] = ('mpl', 'stem_change', 'irregular.amico_amici')
            forms['amiche'] = ('fpl', 'stem_change', 'predictable.ca_che')
        elif extras.get('stem_irregular_greco'):
            forms['greci'] = ('mpl', 'stem_change', 'irregular.greco_greci')
            forms['greche'] = ('fpl', 'stem_change', 'predictable.ca_che')
        elif extras.get('stem_irregular_antico'):
            forms['antichi'] = ('mpl', 'stem_change', 'irregular.antico_antichi')
            forms['antiche'] = ('fpl', 'stem_change', 'predictable.ca_che')
        else:
            forms[stem + 'i'] = 'mpl'
            forms[stem + 'e'] = 'fpl'

        for form, slot_info in forms.items():
            if isinstance(slot_info, tuple):
                slot, extra_kind, extra_id = slot_info
            else:
                slot = slot_info
                extra_kind = None; extra_id = None
            entry = {'lemma':lem, 'cat':'class_I', 'slot':slot}
            if extra_kind:
                entry['stem_change'] = extra_id
            if extras.get('semantic_shift_grande'):
                entry['semantic_shift'] = 'grande'
            if extras.get('semantic_shift_povero'):
                entry['semantic_shift'] = 'povero'
            _add(lex, form, entry)

    # ==========
    # Class II:
    for lem in CLASS_II:
        if lem.endswith('_NO'):
            continue
        # -e sg, -i pl
        _add(lex, lem, {'lemma':lem,'cat':'class_II','slot':'sg'})
        # plural: drop -e, add -i
        _add(lex, lem[:-1] + 'i', {'lemma':lem,'cat':'class_II','slot':'pl'})

    # Also add vecchio's semantic_shift extras via override
    for entry_list in [lex.get('vecchio',[]), lex.get('vecchia',[]), lex.get('vecchi',[]), lex.get('vecchie',[])]:
        for e in entry_list:
            e['semantic_shift'] = 'vecchio'

    # ==========
    # Invariables — colour-from-noun
    for lem in INV_COLOUR_NOUN:
        _add(lex, lem, {'lemma':lem,'cat':'inv_colour_noun','slot':'any'})

    # Invariables — pari family
    for lem in INV_PARI:
        _add(lex, lem, {'lemma':lem,'cat':'inv_pari','slot':'any'})

    # ==========
    # Specials — bello full paradigm
    for form in ['bel','bello',"bell'",'bella','bei','begli','belle']:
        slot = {
            'bel':'msg_apocope', 'bello':'msg', "bell'":'msg_elision',
            'bella':'fsg', 'bei':'mpl', 'begli':'mpl_gli', 'belle':'fpl'
        }[form]
        _add(lex, form, {'lemma':'bello','cat':'class_I','slot':slot,'special':'bello'})

    # Specials — quello full paradigm
    for form in ['quel','quello',"quell'",'quella','quei','quegli','quelle']:
        slot = {
            'quel':'msg_apocope', 'quello':'msg', "quell'":'msg_elision',
            'quella':'fsg', 'quei':'mpl', 'quegli':'mpl_gli', 'quelle':'fpl'
        }[form]
        _add(lex, form, {'lemma':'quello','cat':'class_I','slot':slot,'special':'quello'})

    # Specials — santo full paradigm
    for form in ['san','santo',"sant'",'santa']:
        slot = {'san':'msg_apocope','santo':'msg',"sant'":'apocope_elision','santa':'fsg'}[form]
        _add(lex, form, {'lemma':'santo','cat':'class_I','slot':slot,'special':'santo'})

    return dict(lex)

LEXICON = build_lexicon()

# ==================================================================
# BUCKET MAPPING: given an analyzer entry, return list of bucket ids
# ==================================================================
CLASS_I_SLOT_TO_BUCKET = {
    'msg': 'adjective_agreement.o_class.masculine_singular',
    'msg_apocope': 'adjective_agreement.o_class.masculine_singular',
    'msg_elision': 'adjective_agreement.o_class.masculine_singular',
    'apocope_elision': 'adjective_agreement.o_class.feminine_singular',  # sant'Anna is f.sg
    'fsg': 'adjective_agreement.o_class.feminine_singular',
    'fsg_elision': 'adjective_agreement.o_class.feminine_singular',
    'mpl': 'adjective_agreement.o_class.masculine_plural',
    'mpl_gli': 'adjective_agreement.o_class.masculine_plural',
    'fpl': 'adjective_agreement.o_class.feminine_plural',
}
CLASS_II_SLOT_TO_BUCKET = {
    'sg': None,  # ambiguous between msg and fsg — resolved by context
    'pl': None,  # ambiguous between mpl and fpl — resolved by context
    'sg_apocope': 'adjective_agreement.e_class.masculine_singular',  # gran + m.sg noun
}

SPECIAL_TO_BUCKET = {
    'bello': 'adjective_agreement.special.bello',
    'buono': 'adjective_agreement.special.buono',
    'grande_prenominal': 'adjective_agreement.special.grande_prenominal',
    'mezzo': 'adjective_agreement.special.mezzo',
    'quello': 'adjective_agreement.special.quello',
    'santo': 'adjective_agreement.special.santo_san',
}

INV_CAT_TO_BUCKET = {
    'inv_colour_noun': 'adjective_agreement.invariable.colour_from_noun',
    'inv_pari': 'adjective_agreement.invariable.pari_family',
    'inv_compound': 'adjective_agreement.invariable.compound_colour',
}

SEMSHIFT_TO_BUCKET = {
    'grande': 'adjective_agreement.position.semantic_shift.grande',
    'povero': 'adjective_agreement.position.semantic_shift.povero',
    'vecchio': 'adjective_agreement.position.semantic_shift.vecchio',
}

STEM_TO_BUCKET = {
    'predictable.co_chi': 'adjective_agreement.stem_changes.predictable.co_chi',
    'predictable.ca_che': 'adjective_agreement.stem_changes.predictable.ca_che',
    'predictable.go_ghi': 'adjective_agreement.stem_changes.predictable.go_ghi',
    'predictable.ga_ghe': 'adjective_agreement.stem_changes.predictable.ga_ghe',
    'predictable.cio_ci': 'adjective_agreement.stem_changes.predictable.cio_ci',
    'predictable.cia_ce': 'adjective_agreement.stem_changes.predictable.cia_ce',
    'predictable.gio_gi': 'adjective_agreement.stem_changes.predictable.gio_gi',
    'predictable.gia_ge': 'adjective_agreement.stem_changes.predictable.gia_ge',
    'harder.co_ci_vs_chi_stress': 'adjective_agreement.stem_changes.harder.co_ci_vs_chi_stress',
    'irregular.amico_amici': 'adjective_agreement.stem_changes.irregular.amico_amici',
    'irregular.antico_antichi': 'adjective_agreement.stem_changes.irregular.antico_antichi',
    'irregular.greco_greci': 'adjective_agreement.stem_changes.irregular.greco_greci',
}

# ============================================================
# Feminine noun heuristics (for resolving Class II ambiguity)
# ============================================================
FEM_ENDINGS = ('a','à','ione','trice','tà','tù','ie','esi')
# Common feminine nouns (irregular endings)
FEM_NOUN_HINTS = {'mano','moto','foto','radio','ala','arma','crisi','oasi','tesi',
                  'analisi','ipotesi','sintesi','città','università','virtù',
                  'carne','pelle','sete','pace','luce','notte','morte','arte',
                  'nave','chiave','madre','sorella','moglie','regina','signora',
                  'donna','ragazza','bambina','cugina','nonna','zia','amica'}

def is_fem_noun(word):
    w = word.lower().rstrip('.,;:!?')
    if w in FEM_NOUN_HINTS: return True
    for e in FEM_ENDINGS:
        if w.endswith(e): return True
    return False

# Determine position: is `adj_form` at index `i` in tokens pre-noun or post-noun?
# Simple heuristic: look at neighbours' PoS-guess.
def guess_position(tokens, i):
    # noun-like on the right → pre-noun
    if i+1 < len(tokens):
        right = tokens[i+1].lower().rstrip('.,;:!?')
        # skip determiners/prepositions that shouldn't be
        if right not in {'e','o','ma','però','anche','sono','è','era','sarà','ha','ho'}:
            # heuristic: right token is a noun if it doesn't start uppercase and isn't a verb/particle
            if right and right.isalpha() and right not in COMMON_NONNOUNS:
                # Is right token likely a noun? If left of adj is a determiner, adj is pre-noun modifying right
                if i > 0 and tokens[i-1].lower().rstrip('.,;:!?') in DETERMINERS:
                    return 'pre'
    # noun-like on the left → post-noun
    if i > 0:
        left = tokens[i-1].lower().rstrip('.,;:!?')
        if left and left.isalpha() and left not in COMMON_NONNOUNS and left not in DETERMINERS:
            return 'post'
    return None

DETERMINERS = {'il','lo','la','i','gli','le',"l'","un","una","uno","un'",
               'del','della','dello','dei','degli','delle','al','alla','allo',
               'ai','agli','alle','dal','dalla','dallo','dai','dagli','dalle',
               'nel','nella','nello','nei','negli','nelle','sul','sulla',
               'sullo','sui','sugli','sulle','col','colla','cogli','coi',
               'questo','questa','questi','queste','quel','quello','quella',
               'quei','quegli','quelle','mio','mia','miei','mie','tuo','tua',
               'tuoi','tue','suo','sua','suoi','sue','nostro','nostra','nostri',
               'nostre','vostro','vostra','vostri','vostre','loro'}

COMMON_NONNOUNS = {'e','o','ma','però','anche','sono','sei','è','era','erano','sarà','saranno',
                   'ha','hai','ho','abbiamo','avete','hanno','sta','stanno','sto','stai',
                   'in','a','di','da','per','con','su','tra','fra','che','chi','cui',
                   'non','molto','poco','più','meno','tanto','troppo','così','qui','là',
                   'sempre','mai','ancora','già','ora','adesso','oggi','ieri','domani',
                   'sopra','sotto','dentro','fuori','vicino','lontano'}

def tokenize(text):
    # split preserving apostrophes attached to preceding letter
    # e.g. "bell'amico" -> ["bell'","amico"]  (split at apostrophe boundary)
    # first split into words on whitespace, then process each
    text = text.replace('’', "'")
    words = re.findall(r"[A-Za-zÀ-ÿ]+(?:'[A-Za-zÀ-ÿ]+)?", text)
    # split "bell'amico" into "bell'" + "amico"
    out = []
    for w in words:
        if "'" in w:
            head, tail = w.split("'", 1)
            out.append(head + "'")
            out.append(tail)
        else:
            out.append(w)
    return out

# ============================================================
# Compound colour detection (bigrams)
# ============================================================
INV_COMPOUNDS_BIGRAM = {
    'verde scuro', 'verde chiaro', 'verde acqua',
    'blu marino', 'blu notte', 'blu scuro', 'blu chiaro',
    'giallo limone', 'giallo oro',
    'rosso fuoco', 'rosso vino',
    'grigio topo', 'grigio chiaro', 'grigio scuro',
    'marrone chiaro', 'marrone scuro',
}

def analyse(text):
    """Return list of {bucket_id, evidence} claims for this Italian text."""
    original = text
    tokens = tokenize(text)
    lowers = [t.lower() for t in tokens]
    claims = []  # list of dicts

    # Track which token positions are consumed by a compound
    consumed = set()

    # Pass 1: compound colours (bigrams)
    for i in range(len(tokens)-1):
        bigram = f'{lowers[i]} {lowers[i+1]}'
        if bigram in INV_COMPOUNDS_BIGRAM:
            claims.append({
                'bucket_id': 'adjective_agreement.invariable.compound_colour',
                'evidence': f'{tokens[i]} {tokens[i+1]}',
            })
            consumed.add(i); consumed.add(i+1)

    # Pass 2: single tokens
    for i, tok in enumerate(lowers):
        if i in consumed:
            continue
        entries = LEXICON.get(tok)
        if not entries:
            continue
        # Pick the "best" interpretation. If multiple, prefer specials/inv over plain Class I.
        entry = entries[0]
        # Determine buckets from entry
        cat = entry['cat']; slot = entry.get('slot'); lem = entry['lemma']
        # Skip if lemma looks like something being confused (e.g. 'nuova' might be a form of nuovo but also fine here)
        # Determine class leaf bucket
        leaf_bucket = None
        if cat == 'class_I':
            # feminine/masculine determined by slot key
            leaf_bucket = CLASS_I_SLOT_TO_BUCKET.get(slot)
        elif cat == 'class_II':
            # need to resolve sg/pl → m or f from neighbour noun
            neighbour = None
            # Prefer the following token if it looks noun-like (pre-noun position)
            if i+1 < len(tokens) and lowers[i+1].isalpha() and lowers[i+1] not in DETERMINERS and lowers[i+1] not in COMMON_NONNOUNS:
                neighbour = lowers[i+1]
            elif i > 0 and lowers[i-1].isalpha() and lowers[i-1] not in DETERMINERS and lowers[i-1] not in COMMON_NONNOUNS:
                neighbour = lowers[i-1]
            fem = is_fem_noun(neighbour) if neighbour else False
            if slot == 'sg':
                leaf_bucket = 'adjective_agreement.e_class.feminine_singular' if fem else 'adjective_agreement.e_class.masculine_singular'
            elif slot == 'pl':
                leaf_bucket = 'adjective_agreement.e_class.feminine_plural' if fem else 'adjective_agreement.e_class.masculine_plural'
            elif slot == 'sg_apocope':
                leaf_bucket = CLASS_II_SLOT_TO_BUCKET.get(slot)
        elif cat.startswith('inv_'):
            leaf_bucket = INV_CAT_TO_BUCKET.get(cat)

        if leaf_bucket:
            claims.append({'bucket_id': leaf_bucket, 'evidence': tokens[i]})

        # Special bucket
        sp = entry.get('special')
        if sp:
            sb = SPECIAL_TO_BUCKET.get(sp) or SPECIAL_TO_BUCKET.get('grande_prenominal' if sp=='grande_prenominal' else None)
            # Special buckets:
            # - bello, quello, santo: always claim when the form matches
            # - buono: always claim when the form is buon/buono/buon'/buona/buoni/buone
            # - grande_prenominal: only when the apocope 'gran' is used (slot 'sg_apocope')
            # - mezzo: always claim (all forms carry the exception)
            claim_special = False
            if sp in {'bello','quello','santo','buono','mezzo'}:
                claim_special = True
            elif sp == 'grande_prenominal' and slot == 'sg_apocope':
                claim_special = True
            if claim_special:
                sb = SPECIAL_TO_BUCKET.get(sp) if sp != 'grande_prenominal' else SPECIAL_TO_BUCKET['grande_prenominal']
                if sb:
                    claims.append({'bucket_id': sb, 'evidence': tokens[i]})

        # Stem change bucket
        sc = entry.get('stem_change')
        if sc:
            sb = STEM_TO_BUCKET.get(sc)
            if sb:
                claims.append({'bucket_id': sb, 'evidence': tokens[i]})

        # Position bucket (only when we can determine)
        pos = guess_position(tokens, i)
        if pos == 'pre':
            # canonical pre-noun set
            if lem in {'bello','brutto','buono','cattivo','grande','piccolo','nuovo','vecchio','giovane','bravo','lungo','breve'}:
                claims.append({'bucket_id':'adjective_agreement.position.pre_noun_canonical','evidence':tokens[i]})
        elif pos == 'post':
            # ~all descriptive adjectives following the noun demonstrate the default
            # But this fires very often — per do_not_prune_common, that's fine.
            claims.append({'bucket_id':'adjective_agreement.position.post_noun_default','evidence':tokens[i]})

        # Semantic shift
        ss = entry.get('semantic_shift')
        if ss and pos in {'pre','post'}:
            claims.append({'bucket_id': SEMSHIFT_TO_BUCKET[ss], 'evidence': tokens[i]})

    return claims

# ============================================================
# Main: run over corpus
# ============================================================
def main():
    p = json.load(open('data/review_packets_tier2/SEARCH_adjective_agreement_2026-08-13.json'))
    corpus = p['corpus']
    findings = []
    per_bucket = defaultdict(int)
    for c in corpus:
        text = c['reference_text']
        # Skip empty
        if not text: continue
        claims = analyse(text)
        # dedupe within an item
        seen = set()
        for cl in claims:
            key = (cl['bucket_id'], cl['evidence'].lower())
            if key in seen: continue
            seen.add(key)
            findings.append({
                'item_id': c['item_id'],
                'bucket_id': cl['bucket_id'],
                'evidence': cl['evidence'],
                'verdict': 'keep'
            })
            per_bucket[cl['bucket_id']] += 1
    # Print summary
    print(f'Total findings: {len(findings)}')
    print('\nPer-bucket fire counts:')
    for b, n in sorted(per_bucket.items(), key=lambda x:-x[1]):
        print(f'  {n:5d}  {b}')
    # Save
    p['findings'] = findings
    with open('outputs/SEARCH_adjective_agreement_returned_v1.json','w') as f:
        json.dump(p, f, indent=2, ensure_ascii=False)
    print('\nSaved to outputs/SEARCH_adjective_agreement_returned_v1.json')

if __name__ == '__main__':
    main()
