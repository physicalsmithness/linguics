# Estate state — RUN THIS, never remember it

Before claiming ANY of: what is started, what is unstarted, which seats to fire, how many items
exist, who has delivered — run this and read the output. It is the item-level ground truth,
derived from disk. It exists because the architect twice told Smith to "stand up" seats
(Connective, Indefinite) that had delivered 15 hours earlier, having cached an early "0 items"
read across turns. A number about estate progress rots the instant it is written; only the
command survives.

```bash
cd "$(git rev-parse --show-toplevel)" && python3 - <<'EOF'
import json,glob,os
def items(topic):
    g=t=0
    for kind,var in [('grammar_questions','g'),('translation_items','t')]:
        f=f'data/{kind}_{topic}.json'
        if os.path.exists(f):
            d=json.load(open(f,encoding='utf-8'))
            n=len(d if isinstance(d,list) else d.get('questions',d.get('items',[])))
            if var=='g': g=n
            else: t=n
    return g,t
topics=[os.path.basename(f)[:-5] for f in glob.glob('data/buckets/*.json')
        if os.path.basename(f)[:-5] not in ('vocabulary','vocabulary_frequency','orthography')]
empty=[t for t in sorted(topics) if items(t)==(0,0)]
print("UNSTARTED topics:", empty or "none")
# usage wave-2 leaves (fresh dispatch, tracked separately since the tense topic already has items)
for t in ['future','gerundio','condizionale','congiuntivo','imperativo']:
    f=f'data/grammar_questions_verb_form.{t}.json'
    n=0
    if os.path.exists(f):
        d=json.load(open(f,encoding='utf-8')); its=d if isinstance(d,list) else d.get('questions',[])
        n=sum(1 for it in its if any('.usage.' in mp.get('bucket','') for mp in it.get('markpoints',[])))
    print(f"  verb_form.{t}.usage:", n, "items")
EOF
```

**To answer "which chats to fire", a seat is fireable only if this shows real unstarted work for
it AND its `_status/<Seat>.md` does not say `waiting: closed/parked awaiting Architecture`.**
Delivered ≠ fireable. A closed seat waiting on my stamp is MY action, not a wake.
