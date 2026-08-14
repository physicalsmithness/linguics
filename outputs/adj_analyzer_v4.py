"""V4: extends v3 by:
- Reading ALL Italian text (source, reference, other_references) rather than only reference
- Re-adding amico (bucket exists under adj_agr so the plural formation is in-scope)
- Detecting mixed_gender_plural_defaults_masculine heuristically
Runs independently, no exec of v3.
"""
import json, re
from collections import defaultdict

# ============================================================
# Copy in v3's constants (to keep this self-contained)
# ============================================================
DETERMINERS = {'il','lo','la','i','gli','le',"l'","un","una","uno","un'",
               'del','della','dello','dei','degli','delle','al','alla','allo',
               'ai','agli','alle','dal','dalla','dallo','dai','dagli','dalle',
               'nel','nella','nello','nei','negli','nelle','sul','sulla',
               'sullo','sui','sugli','sulle','col','colla','cogli','coi',
               'questo','questa','questi','queste','quel','quello','quella',
               "quell'",'quei','quegli','quelle','mio','mia','miei','mie','tuo','tua',
               'tuoi','tue','suo','sua','suoi','sue','nostro','nostra','nostri',
               'nostre','vostro','vostra','vostri','vostre','loro',
               'ogni','qualche','qualsiasi','qualunque','tutti','tutte','tutto','tutta'}

LINK_VERB = {
    'sono','sei','è','siamo','siete',
    'ero','eri','era','eravamo','eravate','erano',
    'fui','fosti','fu','fummo','foste','furono',
    'sarò','sarai','sarà','saremo','sarete','saranno',
    'sarei','saresti','sarebbe','saremmo','sareste','sarebbero',
    'sia','siate','siano','fossi','fosse','fossimo','fossero',
    'stato','stata','stati','state','essendo',
    'sto','stai','sta','stiamo','state','stanno',
    'stavo','stavi','stava','stavamo','stavate','stavano',
    'sembra','sembrano','sembrava','sembravano','sembrò','sembrarono',
    'diventa','diventano','diventò','diventarono','diventerà','diventeranno',
    'pare','paiono','pareva','parevano','parve','parvero',
    'appare','appaiono','apparve','apparvero',
    'rimane','rimangono','rimase','rimasero',
    'resta','restano','restò','restarono',
    'risulta','risultano','risultava',
}

COMMON_NONNOUNS = set('e o ma però anche non più meno molto poco tanto troppo così qui là sempre mai ancora già ora adesso oggi ieri domani sopra sotto dentro fuori vicino lontano in a di da per con su tra fra che chi cui se quando mentre dopo prima durante senza contro verso ci vi ne mi ti si lo la li le gli come quanto quale quali dove perché poi ancora sia ho hai ha abbiamo avete hanno avevo avevi aveva avevamo avevate avevano faccio fai fa facciamo fate fanno vado vai va andiamo andate vanno anziché oltre presso entro circa malgrado nonostante benché sebbene affinché purché qualora poiché giacché talora talvolta forse magari proprio io tu lui lei noi voi essi esse loro me te questa questo questi queste quella quello quelli quelle pure poi pur ecco volevo vorrei volli vollero devo deve dovrei dovrò dovranno posso può possa potrò potrei so sappi sappia saprei saprò grazie prego scusa scusi'.split())
COMMON_NONNOUNS |= LINK_VERB
COMMON_NONNOUNS |= DETERMINERS

FEM_ENDINGS = ('a','à','ione','trice','tà','tù','ie','esi')
FEM_NOUN_HINTS = {'mano','moto','foto','radio','ala','arma','crisi','oasi','tesi',
                  'analisi','ipotesi','sintesi','città','università','virtù',
                  'carne','pelle','sete','pace','luce','notte','morte','arte',
                  'nave','chiave','madre','sorella','moglie','regina','signora',
                  'donna','ragazza','bambina','cugina','nonna','zia','amica',
                  'canzone','stagione','regione','stazione','condizione','soluzione',
                  'attenzione','educazione','conversazione','tradizione','decisione',
                  'discussione','impressione','emozione','depressione','professione',
                  'lezione','pensione','religione','ragione','opinione',
                  'lettrice','attrice','pittrice','dottoressa','professoressa',
                  'società','realtà','possibilità','opportunità','felicità','verità',
                  'gioventù','servitù',
                  'serie','specie','superficie',
                  'giornata','settimana','ora','sera','mattina','notte',
                  'idea','vacanza','strada','porta','finestra','tavola',
                  'famiglia','montagna','vita','via','festa','borsa','scuola',
                  'lettera','biblioteca','stanza','pizza','pasta','musica',
                  'macchina','maglietta','camicia','fetta','domanda','risposta',
                  'lingua','parola','frase','pagina','riga','goccia',
                  'medaglia','chiave','forza','pioggia','neve','luna','stella',
                  'terra','acqua','aria','fiamma','isola','spiaggia',
                  'domenica','settimana','giornata',
                  'cena','colazione','pasto',
                  'squadra','partita',
                  }

def is_fem_noun(word):
    if not word: return False
    w = word.lower().rstrip(".,;:!?'")
    if w in FEM_NOUN_HINTS: return True
    if any(w.endswith(e) for e in FEM_ENDINGS): return True
    return False

# ============================================================
# Lexicon (with amico re-added)
# ============================================================
def build_lexicon():
    lex = defaultdict(list)

    CLASS_I = [
        ('rosso', {}), ('nero', {}), ('giallo', {}),
        ('grigio', {'stem_gio_gi':True}),
        ('bianco', {'stem_co_chi':True}),
        ('alto', {}), ('basso', {}),
        ('nuovo', {}), ('vecchio', {'stem_cio_ci':True, 'semantic_shift':'vecchio'}),
        ('cattivo', {}),
        ('italiano', {}), ('americano', {}), ('tedesco', {'stem_co_chi':True}),
        ('spagnolo', {}), ('russo', {}),
        ('lungo', {'stem_go_ghi':True}),
        ('largo', {'stem_go_ghi':True}),
        ('corto', {}),
        ('simpatico', {'stem_co_ci_stress':True}),
        ('antipatico', {'stem_co_ci_stress':True}),
        ('noioso', {}), ('carino', {}),
        ('stanco', {'stem_co_chi':True}),
        ('affamato', {}), ('contento', {}),
        ('piccolo', {}),
        ('bravo', {}),
        ('saggio', {'stem_gio_gi':True}),
        ('amico', {'stem_irregular_amico':True}),  # RESTORED
        ('greco', {'stem_irregular_greco':True}),
        ('pratico', {'stem_co_ci_stress':True}),
        ('politico', {'stem_co_ci_stress':True}),
        ('storico', {'stem_co_ci_stress':True}),
        ('pubblico', {'stem_co_ci_stress':True}),
        ('fantastico', {'stem_co_ci_stress':True}),
        ('magnifico', {'stem_co_ci_stress':True}),
        ('unico', {'stem_co_ci_stress':True}),
        ('artistico', {'stem_co_ci_stress':True}),
        ('povero', {'semantic_shift':'povero'}),
        ('ricco', {'stem_co_chi':True}),
        ('pieno', {}), ('vuoto', {}),
        ('chiuso', {}), ('aperto', {}),
        ('caro', {}),
        ('freddo', {}), ('caldo', {}),
        ('tranquillo', {}), ('silenzioso', {}), ('rumoroso', {}),
        ('sporco', {'stem_co_chi':True}),
        ('pulito', {}),
        ('lento', {}),
        ('curioso', {}), ('geloso', {}),
        ('generoso', {}), ('numeroso', {}),
        ('famoso', {}),
        ('pericoloso', {}),
        ('meraviglioso', {}),
        ('luminoso', {}), ('doloroso', {}),
        ('serio', {}), ('malato', {}),
        ('sano', {}), ('salato', {}),
        ('pigro', {}), ('coraggioso', {}),
        ('sicuro', {}),
        ('preciso', {}),
        ('libero', {}),
        ('occupato', {}),
        ('completo', {}),
        ('vasto', {}),
        ('stretto', {}),
        ('leggero', {}),
        ('cotto', {}),
        ('crudo', {}),
        ('dorato', {}),
        ('acido', {}),
        ('amaro', {}),
        ('splendido', {}),
        ('brutto', {}),
        ('gigantesco', {'stem_co_chi':True}),
        ('scemo', {}),
        ('sveglio', {'stem_gio_gi':True}),
        ('addormentato', {}),
        ('anziano', {}),
        ('vero', {}),
        ('falso', {}),
        ('perfetto', {}),
        ('lieto', {}),
        ('duro', {}), ('morbido', {}),
        ('grosso', {}),
        ('robusto', {}),
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
        ('barbaro', {}),
        ('scarso', {}),
        ('antico', {'stem_irregular_antico':True}),
        ('poco', {'stem_co_chi':True}),
        ('ottimo', {}),
        ('sinistro', {}), ('destro', {}),
        ('rotondo', {}), ('quadrato', {}),
        ('vivo', {}), ('morto', {}), ('nato', {}),
        ('pronto', {}),
        ('liscio', {'stem_cio_ci':True}),
        ('caro', {}),
        ('buono', {'special':'buono'}),
        ('bello', {'special':'bello'}),
        ('quello', {'special':'quello'}),
        ('santo', {'special':'santo'}),
        ('mezzo', {'special':'mezzo'}),
    ]

    CLASS_II = [
        'intelligente','felice','verde','gentile','difficile','facile',
        'importante','interessante','triste','forte','debole','giovane',
        'francese','inglese','olandese','portoghese','cinese','giapponese',
        'dolce','pesante','gigante','elegante','presente','assente',
        'semplice','sagace','veloce','indipendente','dipendente',
        'seguente','precedente','corrente','sufficiente','urgente',
        'comune','breve','celeste','agile','utile','notevole',
        'possibile','impossibile','probabile','terribile','orribile',
        'sensibile','visibile','invisibile','incredibile','divertente',
        'affascinante','preoccupante','stancante','sorprendente',
        'commovente','brillante','attraente','convincente',
        'accettabile','ragionevole','stabile',
        'mobile','nobile','abile','inutile',
        'salutare','sottile','agrodolce','evidente',
        'normale','speciale','principale','generale','centrale',
        'naturale','nazionale','internazionale','locale','globale',
        'sociale','personale','professionale',
        'grande',
    ]

    for lem_key, extras in CLASS_I:
        lem = lem_key
        if lem.endswith('_NO'):
            continue
        special = extras.get('special')
        if special == 'buono':
            for f, s in [('buono','msg'),('buona','fsg'),('buoni','mpl'),('buone','fpl')]:
                lex[f].append({'lemma':'buono','cat':'class_I','slot':s,'special':'buono'})
            lex['buon'].append({'lemma':'buono','cat':'class_I','slot':'msg_apocope','special':'buono'})
            lex["buon'"].append({'lemma':'buono','cat':'class_I','slot':'fsg_elision','special':'buono'})
            continue
        if special == 'bello':
            for f, s in [('bello','msg'),('bella','fsg'),('belle','fpl')]:
                lex[f].append({'lemma':'bello','cat':'class_I','slot':s,'special':'bello'})
            lex['bel'].append({'lemma':'bello','cat':'class_I','slot':'msg_apocope','special':'bello'})
            lex["bell'"].append({'lemma':'bello','cat':'class_I','slot':'msg_elision','special':'bello'})
            lex['bei'].append({'lemma':'bello','cat':'class_I','slot':'mpl','special':'bello'})
            lex['begli'].append({'lemma':'bello','cat':'class_I','slot':'mpl_gli','special':'bello'})
            continue
        if special == 'quello':
            for f, s in [('quello','msg'),('quella','fsg'),('quelle','fpl')]:
                lex[f].append({'lemma':'quello','cat':'class_I','slot':s,'special':'quello'})
            lex['quel'].append({'lemma':'quello','cat':'class_I','slot':'msg_apocope','special':'quello'})
            lex["quell'"].append({'lemma':'quello','cat':'class_I','slot':'msg_elision','special':'quello'})
            lex['quei'].append({'lemma':'quello','cat':'class_I','slot':'mpl','special':'quello'})
            lex['quegli'].append({'lemma':'quello','cat':'class_I','slot':'mpl_gli','special':'quello'})
            continue
        if special == 'santo':
            lex['santo'].append({'lemma':'santo','cat':'class_I','slot':'msg','special':'santo'})
            lex['santa'].append({'lemma':'santo','cat':'class_I','slot':'fsg','special':'santo'})
            lex['san'].append({'lemma':'santo','cat':'class_I','slot':'msg_apocope','special':'santo'})
            lex["sant'"].append({'lemma':'santo','cat':'class_I','slot':'sg_elision','special':'santo'})
            continue
        if special == 'mezzo':
            for f, s in [('mezzo','msg'),('mezza','fsg'),('mezzi','mpl'),('mezze','fpl')]:
                lex[f].append({'lemma':'mezzo','cat':'class_I','slot':s,'special':'mezzo'})
            continue

        stem = lem[:-1]
        lex[stem + 'o'].append({'lemma':lem,'cat':'class_I','slot':'msg', **({'semantic_shift':extras['semantic_shift']} if 'semantic_shift' in extras else {})})
        lex[stem + 'a'].append({'lemma':lem,'cat':'class_I','slot':'fsg', **({'semantic_shift':extras['semantic_shift']} if 'semantic_shift' in extras else {})})
        if extras.get('stem_co_chi'):
            lex[stem[:-1] + 'chi'].append({'lemma':lem,'cat':'class_I','slot':'mpl','stem_change':'predictable.co_chi'})
            lex[stem[:-1] + 'che'].append({'lemma':lem,'cat':'class_I','slot':'fpl','stem_change':'predictable.ca_che'})
        elif extras.get('stem_go_ghi'):
            lex[stem[:-1] + 'ghi'].append({'lemma':lem,'cat':'class_I','slot':'mpl','stem_change':'predictable.go_ghi'})
            lex[stem[:-1] + 'ghe'].append({'lemma':lem,'cat':'class_I','slot':'fpl','stem_change':'predictable.ga_ghe'})
        elif extras.get('stem_co_ci_stress'):
            lex[stem[:-1] + 'ci'].append({'lemma':lem,'cat':'class_I','slot':'mpl','stem_change':'harder.co_ci_vs_chi_stress'})
            lex[stem[:-1] + 'che'].append({'lemma':lem,'cat':'class_I','slot':'fpl','stem_change':'predictable.ca_che'})
        elif extras.get('stem_cio_ci'):
            lex[stem[:-2] + 'ci'].append({'lemma':lem,'cat':'class_I','slot':'mpl','stem_change':'predictable.cio_ci', **({'semantic_shift':extras['semantic_shift']} if 'semantic_shift' in extras else {})})
            lex[stem[:-2] + 'ce'].append({'lemma':lem,'cat':'class_I','slot':'fpl','stem_change':'predictable.cia_ce'})
        elif extras.get('stem_gio_gi'):
            lex[stem[:-2] + 'gi'].append({'lemma':lem,'cat':'class_I','slot':'mpl','stem_change':'predictable.gio_gi'})
            lex[stem[:-2] + 'ge'].append({'lemma':lem,'cat':'class_I','slot':'fpl','stem_change':'predictable.gia_ge'})
        elif extras.get('stem_irregular_amico'):
            lex['amici'].append({'lemma':'amico','cat':'class_I','slot':'mpl','stem_change':'irregular.amico_amici'})
            lex['amiche'].append({'lemma':'amico','cat':'class_I','slot':'fpl','stem_change':'predictable.ca_che'})
        elif extras.get('stem_irregular_greco'):
            lex['greci'].append({'lemma':'greco','cat':'class_I','slot':'mpl','stem_change':'irregular.greco_greci'})
            lex['greche'].append({'lemma':'greco','cat':'class_I','slot':'fpl','stem_change':'predictable.ca_che'})
        elif extras.get('stem_irregular_antico'):
            lex['antichi'].append({'lemma':'antico','cat':'class_I','slot':'mpl','stem_change':'irregular.antico_antichi'})
            lex['antiche'].append({'lemma':'antico','cat':'class_I','slot':'fpl','stem_change':'predictable.ca_che'})
        else:
            lex[stem + 'i'].append({'lemma':lem,'cat':'class_I','slot':'mpl'})
            lex[stem + 'e'].append({'lemma':lem,'cat':'class_I','slot':'fpl'})

    for lem in CLASS_II:
        if lem == 'grande':
            lex['grande'].append({'lemma':'grande','cat':'class_II','slot':'sg','special':'grande','semantic_shift':'grande'})
            lex['grandi'].append({'lemma':'grande','cat':'class_II','slot':'pl','special':'grande'})
            lex['gran'].append({'lemma':'grande','cat':'class_II','slot':'sg_apocope','special':'grande_prenominal','semantic_shift':'grande'})
            continue
        lex[lem].append({'lemma':lem,'cat':'class_II','slot':'sg'})
        lex[lem[:-1] + 'i'].append({'lemma':lem,'cat':'class_II','slot':'pl'})

    for lem in ['blu','rosa','viola','marrone','beige','lilla','indaco','ocra','kaki']:
        lex[lem].append({'lemma':lem,'cat':'inv_colour_noun','slot':'any'})
    for lem in ['pari','dispari','impari']:
        lex[lem].append({'lemma':lem,'cat':'inv_pari','slot':'any'})

    return dict(lex)

LEXICON = build_lexicon()

CLASS_I_SLOT_TO_BUCKET = {
    'msg': 'adjective_agreement.o_class.masculine_singular',
    'msg_apocope': 'adjective_agreement.o_class.masculine_singular',
    'msg_elision': 'adjective_agreement.o_class.masculine_singular',
    'sg_elision': None,
    'fsg': 'adjective_agreement.o_class.feminine_singular',
    'fsg_elision': 'adjective_agreement.o_class.feminine_singular',
    'mpl': 'adjective_agreement.o_class.masculine_plural',
    'mpl_gli': 'adjective_agreement.o_class.masculine_plural',
    'fpl': 'adjective_agreement.o_class.feminine_plural',
}
SPECIAL_TO_BUCKET = {
    'bello': 'adjective_agreement.special.bello',
    'buono': 'adjective_agreement.special.buono',
    'grande': None,
    'grande_prenominal': 'adjective_agreement.special.grande_prenominal',
    'mezzo': 'adjective_agreement.special.mezzo',
    'quello': 'adjective_agreement.special.quello',
    'santo': 'adjective_agreement.special.santo_san',
}
INV_CAT_TO_BUCKET = {
    'inv_colour_noun': 'adjective_agreement.invariable.colour_from_noun',
    'inv_pari': 'adjective_agreement.invariable.pari_family',
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

def tokenize(text):
    text = text.replace('’', "'")
    words = re.findall(r"[A-Za-zÀ-ÿ]+(?:'[A-Za-zÀ-ÿ]+)?", text)
    out = []
    for w in words:
        if "'" in w:
            head, tail = w.split("'", 1)
            out.append(head + "'"); out.append(tail)
        else:
            out.append(w)
    return out

def is_noun_like(tok):
    if not tok: return False
    w = tok.lower().rstrip(".,;:!?'")
    if not w or not w.isalpha(): return False
    if w in COMMON_NONNOUNS: return False
    if w in LINK_VERB: return False
    if w in DETERMINERS: return False
    return True

def next_is_noun(tokens, lowers, i):
    if i+1 >= len(tokens): return False
    return is_noun_like(lowers[i+1])
def prev_is_noun(tokens, lowers, i):
    if i <= 0: return False
    return is_noun_like(lowers[i-1])
def prev_is_link_verb(tokens, lowers, i):
    for j in [i-1, i-2]:
        if j < 0: continue
        if lowers[j] in LINK_VERB: return True
        if lowers[j] in {'stato','stata','stati','state'}: return True
    return False
def prev_is_intensifier(tokens, lowers, i):
    if i <= 0: return False
    return lowers[i-1] in {'molto','poco','più','meno','tanto','troppo','davvero','proprio','abbastanza','assai','così','tale','veramente'}

def is_adjective_context(tokens, lowers, i):
    if next_is_noun(tokens, lowers, i): return True
    if prev_is_noun(tokens, lowers, i): return True
    if prev_is_link_verb(tokens, lowers, i): return True
    if prev_is_intensifier(tokens, lowers, i): return True
    return False

CANONICAL_PRE_NOUN = {'bello','brutto','buono','cattivo','grande','piccolo','nuovo','vecchio','giovane','bravo','lungo','breve'}

INV_COMPOUNDS_BIGRAM = {
    'verde scuro','verde chiaro','verde acqua',
    'blu marino','blu notte','blu scuro','blu chiaro',
    'giallo limone','giallo oro',
    'rosso fuoco','rosso vino',
    'grigio topo','grigio chiaro','grigio scuro',
    'marrone chiaro','marrone scuro',
}

def analyse(text):
    tokens = tokenize(text)
    lowers = [t.lower() for t in tokens]
    claims = []
    consumed = set()

    for i in range(len(tokens)-1):
        bg = f'{lowers[i]} {lowers[i+1]}'
        if bg in INV_COMPOUNDS_BIGRAM:
            claims.append({'bucket_id':'adjective_agreement.invariable.compound_colour','evidence':f'{tokens[i]} {tokens[i+1]}'})
            consumed.add(i); consumed.add(i+1)

    for i, tok in enumerate(lowers):
        if i in consumed: continue
        entries = LEXICON.get(tok)
        if not entries: continue
        entry = entries[0]
        cat = entry['cat']; slot = entry.get('slot'); lem = entry['lemma']

        if not is_adjective_context(tokens, lowers, i):
            continue

        leaf = None
        if cat == 'class_I':
            leaf = CLASS_I_SLOT_TO_BUCKET.get(slot)
            if slot == 'sg_elision':
                if i+1 < len(tokens):
                    nxt = tokens[i+1]
                    if nxt[:1].isupper() and (nxt.lower().rstrip(".,;:!?").endswith('a') or nxt.lower().rstrip(".,;:!?") in {'anna','elena','maria','sara','francesca'}):
                        leaf = 'adjective_agreement.o_class.feminine_singular'
                    else:
                        leaf = 'adjective_agreement.o_class.masculine_singular'
        elif cat == 'class_II':
            neighbour = None
            if next_is_noun(tokens, lowers, i):
                neighbour = lowers[i+1]
            elif prev_is_noun(tokens, lowers, i):
                neighbour = lowers[i-1]
            fem = is_fem_noun(neighbour) if neighbour else False
            if slot == 'sg':
                leaf = 'adjective_agreement.e_class.feminine_singular' if fem else 'adjective_agreement.e_class.masculine_singular'
            elif slot == 'pl':
                leaf = 'adjective_agreement.e_class.feminine_plural' if fem else 'adjective_agreement.e_class.masculine_plural'
            elif slot == 'sg_apocope':
                leaf = 'adjective_agreement.e_class.masculine_singular'
        elif cat.startswith('inv_'):
            leaf = INV_CAT_TO_BUCKET.get(cat)

        if leaf:
            claims.append({'bucket_id':leaf, 'evidence':tokens[i]})

        sp = entry.get('special')
        if sp:
            sb = SPECIAL_TO_BUCKET.get(sp)
            if sb:
                if sp == 'mezzo':
                    if next_is_noun(tokens, lowers, i) or prev_is_noun(tokens, lowers, i):
                        claims.append({'bucket_id':sb,'evidence':tokens[i]})
                elif sp == 'grande_prenominal':
                    claims.append({'bucket_id':sb,'evidence':tokens[i]})
                else:
                    if next_is_noun(tokens, lowers, i):
                        claims.append({'bucket_id':sb,'evidence':tokens[i]})

        sc = entry.get('stem_change')
        if sc:
            sb = STEM_TO_BUCKET.get(sc)
            if sb:
                claims.append({'bucket_id':sb,'evidence':tokens[i]})

        if lem in CANONICAL_PRE_NOUN and next_is_noun(tokens, lowers, i):
            claims.append({'bucket_id':'adjective_agreement.position.pre_noun_canonical','evidence':tokens[i]})
        elif prev_is_noun(tokens, lowers, i) and not next_is_noun(tokens, lowers, i):
            claims.append({'bucket_id':'adjective_agreement.position.post_noun_default','evidence':tokens[i]})

        ss = entry.get('semantic_shift')
        if ss:
            pre = next_is_noun(tokens, lowers, i) and (not prev_is_noun(tokens, lowers, i))
            post = prev_is_noun(tokens, lowers, i) and (not next_is_noun(tokens, lowers, i))
            if pre or post:
                claims.append({'bucket_id':SEMSHIFT_TO_BUCKET[ss],'evidence':tokens[i]})

    return claims

# Mixed-gender detection
def detect_mixed_gender(text):
    tokens = tokenize(text)
    lowers = [t.lower() for t in tokens]
    hits = []
    for i, tok in enumerate(lowers):
        entries = LEXICON.get(tok)
        if not entries: continue
        entry = entries[0]
        # only m.pl adjectives (Class I or Class II resolved to m.pl)
        cat = entry.get('cat')
        slot = entry.get('slot')
        if cat=='class_I' and slot in {'mpl','mpl_gli'}:
            pass
        elif cat=='class_II' and slot=='pl':
            pass
        else:
            continue
        # look left window
        window = ' '.join(lowers[max(0,i-15):i])
        has_m = any(m in window for m in [' i ',' gli ','i miei','i tuoi','i suoi','i nostri','i vostri']) or window.startswith('i ') or window.startswith('gli ')
        has_f = any(f in window for f in [' le ',' le mie','le mie','le tue','le sue','le nostre','le vostre']) or window.startswith('le ')
        has_e = ' e ' in window
        if has_m and has_f and has_e:
            hits.append(tokens[i])
    return hits

# Italian detection
def is_italian(text):
    if not text: return False
    if any(ch in text for ch in 'àèéìíîòóùú'): return True
    lower = text.lower()
    words = lower.split()
    italian_hints = {'è','sono','ho','ha','del','della','delle','sei','sarà','ero','erano','era','abbiamo','avete','hanno','di','da','nel','nella','che','molto','sempre','oggi','ieri','domani','anche','però','ma','sono','ci','vi','mi','ti','si','lo','la','li','le','gli','al','alla','ai','allo','alle','nei','negli','nelle','sul','sulla','sui','sugli','sulle','un','una','uno','poi','così','più','meno','quando','mentre','dopo','prima','durante'}
    hits = sum(1 for w in words if w in italian_hints)
    return hits >= 1

def collect_italian_texts(c):
    texts = []
    for key in ['source_text','reference_text']:
        t = c.get(key,'')
        if t and is_italian(t):
            texts.append(t)
    others = c.get('other_references') or []
    if isinstance(others, list):
        for t in others:
            if t and is_italian(t):
                texts.append(t)
    return texts

def analyse_all(c):
    claims = []
    for text in collect_italian_texts(c):
        claims.extend(analyse(text))
        for ev in detect_mixed_gender(text):
            claims.append({'bucket_id':'adjective_agreement.mixed_gender_plural_defaults_masculine','evidence':ev})
    return claims

def main():
    p = json.load(open('data/review_packets_tier2/SEARCH_adjective_agreement_2026-08-13.json'))
    corpus = p['corpus']
    findings = []
    per_bucket = defaultdict(int)
    per_item = defaultdict(int)
    for c in corpus:
        claims = analyse_all(c)
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
            per_item[c['item_id']] += 1
    print(f'Total findings: {len(findings)}')
    print(f'Items with 1+ finding: {len(per_item)}/{len(corpus)}')
    for b, n in sorted(per_bucket.items(), key=lambda x:-x[1]):
        print(f'  {n:5d}  {b}')
    p['findings'] = findings
    with open('outputs/SEARCH_adjective_agreement_returned_v4.json','w') as f:
        json.dump(p, f, indent=2, ensure_ascii=False)
    print('\nSaved v4')

if __name__ == '__main__':
    main()
