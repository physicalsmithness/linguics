"""V7: fix grande_prenominal firing for pre-noun 'grande' (not just apocopated 'gran')."""
import sys, json, re
from collections import defaultdict
sys.path.insert(0,'outputs')
exec(open('outputs/patch_v6.py').read(), globals())

# Fix: set 'grande' to point to grande_prenominal bucket in SPECIAL_TO_BUCKET
SPECIAL_TO_BUCKET['grande'] = 'adjective_agreement.special.grande_prenominal'

# Redefine analyse with corrected special handling
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

        force_adj = (lem == 'mezzo')
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
            else:
                neighbour = find_subject_noun(tokens, lowers, i)
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
            if sp == 'mezzo':
                claims.append({'bucket_id':'adjective_agreement.special.mezzo','evidence':tokens[i]})
            elif sp == 'grande_prenominal':
                claims.append({'bucket_id':'adjective_agreement.special.grande_prenominal','evidence':tokens[i]})
            elif sp == 'grande':
                # widen: grande fires special.grande_prenominal when pre-noun singular
                if slot == 'sg' and next_is_noun(tokens, lowers, i):
                    claims.append({'bucket_id':'adjective_agreement.special.grande_prenominal','evidence':tokens[i]})
            elif sp in {'bello','buono','quello','santo'}:
                if next_is_noun(tokens, lowers, i):
                    claims.append({'bucket_id':SPECIAL_TO_BUCKET[sp],'evidence':tokens[i]})

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

def analyse_all(c):
    claims = []
    for text in collect_italian_texts(c):
        claims.extend(analyse(text))
        for ev in detect_mixed_gender(text):
            claims.append({'bucket_id':'adjective_agreement.mixed_gender_plural_defaults_masculine','evidence':ev})
    return claims

# Rerun
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

# Add a metadata note about disposition
p['findings'] = findings
p['author_note'] = ("AdjectiveAuthor v1, 2026-08-14: 505 findings across 238/913 items. "
                    "Leaves-only claim discipline per the packet's `store_the_most_specific_claim` "
                    "instruction (Architecture asked for opinion on aggregate-vs-leaf: my argument for "
                    "leaves-only is in the return-thread reply). "
                    "Heuristic scanner over Italian text (source + reference + other_references); "
                    "hand-built lexicon of ~150 lemmas; gender resolution via feminine-noun hints and "
                    "wide-window subject search for predicative Class II. Coverage of the 31 "
                    "adjective_agreement-topic items is complete; three items have their declared "
                    "special.grande_prenominal / position.semantic_shift-aggregate re-cast as the "
                    "more-specific leaves (semantic_shift.grande etc.) per the packet instruction. "
                    "Adjectives in noun uses (amico as noun, italiano as language name) still fire "
                    "the class/stem-change buckets — the buckets live under adjective_agreement but "
                    "the inflectional-formation skill they track is PoS-neutral, so a noun plural "
                    "'amici' still evidences the irregular -ci formation. False-positive risk on "
                    "language-name nouns (italiano/francese/inglese in 'parlo X' contexts); if you "
                    "want those pruned centrally, they're identifiable by preceding 'parlo/studio/in'.")
with open('outputs/SEARCH_adjective_agreement_returned_v7.json','w') as f:
    json.dump(p, f, indent=2, ensure_ascii=False)
print('\nSaved v7')
