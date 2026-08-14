"""V5: build on v4 with targeted fixes for the remaining gaps."""
import sys, json, re
from collections import defaultdict
sys.path.insert(0,'outputs')
exec(open('outputs/adj_analyzer_v4.py').read().replace("if __name__ == '__main__':\n    main()", ""), globals())

# ---- Fix 1: broader is_italian ----
def is_italian(text):
    if not text: return False
    if any(ch in text for ch in 'àèéìíîòóùú'): return True
    lower = text.lower()
    words = re.findall(r"[a-zA-Zà-ÿ']+", lower)
    italian_words = {'è','sono','ho','ha','del','della','delle','sei','sarà','ero','erano','era','abbiamo','avete','hanno','di','da','nel','nella','che','molto','sempre','oggi','ieri','domani','anche','però','ma','ci','vi','mi','ti','si','lo','la','li','le','gli','al','alla','ai','allo','alle','nei','negli','nelle','sul','sulla','sui','sugli','sulle','un','una','uno','poi','così','più','meno','quando','mentre','dopo','prima','durante',
                     # add common Italian-only content words
                     'giornata','giorno','sera','notte','mattina','buona','buono','buon','bene','male','grazie','prego','scusa','ciao','arrivederci',
                     'cane','gatto','casa','libro','tavolo','macchina','strada','mangiare','bere','fare','andare',
                     'ragazza','ragazzo','ragazze','ragazzi','bambino','bambina','padre','madre','sorella','fratello',
                     'con','senza','contro','verso','tra','fra','sopra','sotto','dentro','fuori','vicino','lontano'}
    hits = sum(1 for w in words if w in italian_words)
    return hits >= 1

# ---- Fix 2: broader feminine-noun detection ----
FEM_NOUN_HINTS_EXT = set(FEM_NOUN_HINTS)
# Add feminine plurals of common feminine nouns
for base in list(FEM_NOUN_HINTS):
    # -a → -e plural
    if base.endswith('a'):
        FEM_NOUN_HINTS_EXT.add(base[:-1] + 'e')
    # Explicit adds
FEM_NOUN_HINTS_EXT |= {'donne','ragazze','bambine','sorelle','madri','mogli','amiche','cugine',
                       'zie','nonne','signore','moglie','madri','case','strade','pizze','famiglie',
                       'macchine','pagine','fette','porte','finestre','forme','fiamme','isole','stelle',
                       'lune','maglie','magliette','vacanze','feste','borse','scuole','biblioteche',
                       'notti','mani','ali','armi','stagioni','regioni','stazioni','condizioni',
                       'canzoni','lezioni','pensioni','opinioni','religioni','decisioni','soluzioni',
                       'attenzioni','educazioni','discussioni','professioni','tradizioni',
                       'società','realtà','università','possibilità','opportunità','felicità','verità',
                       'lettere','biblioteche','stanze','musiche','lingue','parole','frasi','pagine',
                       'righe','gocce','medaglie','chiavi','forze','luci','notti','morti','arti',
                       'navi','giornate','settimane','ore','sere','mattine','idee','vacanze','strade','porte','finestre','tavole','famiglie','montagne','vite','vie','feste','borse','scuole'}

def is_fem_noun(word):
    if not word: return False
    w = word.lower().rstrip(".,;:!?'")
    if w in FEM_NOUN_HINTS_EXT: return True
    if any(w.endswith(e) for e in FEM_ENDINGS): return True
    # -e plural of -a singular: infer
    if w.endswith('e') and len(w) > 2:
        singular_a = w[:-1] + 'a'
        if singular_a in FEM_NOUN_HINTS_EXT: return True
    return False

# ---- Fix 3: mezzo as always-fires when clearly inflecting ----
# Update analyse to loosen mezzo context
original_analyse = analyse
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

        # Special exception: mezzo family always fires (small closed set, reliably adj)
        force_adj = False
        if lem == 'mezzo':
            force_adj = True

        if not force_adj and not is_adjective_context(tokens, lowers, i):
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
                    claims.append({'bucket_id':sb,'evidence':tokens[i]})
                elif sp == 'grande_prenominal':
                    claims.append({'bucket_id':sb,'evidence':tokens[i]})
                elif sp == 'grande':
                    # widen: grande fires special.grande_prenominal when pre-noun singular (author intent)
                    if slot in {'sg'} and next_is_noun(tokens, lowers, i):
                        claims.append({'bucket_id':'adjective_agreement.special.grande_prenominal','evidence':tokens[i]})
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

# ---- Fix 4: add troppo / tanto to lexicon (Class I, no stem change) ----
for lem in ['troppo','tanto']:
    stem = lem[:-1]
    for form, slot in [(stem+'o','msg'),(stem+'a','fsg'),(stem+'i','mpl'),(stem+'e','fpl')]:
        LEXICON.setdefault(form, []).append({'lemma':lem,'cat':'class_I','slot':slot})

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
    with open('outputs/SEARCH_adjective_agreement_returned_v5.json','w') as f:
        json.dump(p, f, indent=2, ensure_ascii=False)
    print('\nSaved v5')

main()
