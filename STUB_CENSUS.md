# Stub census — what is registered but not yet built

**Derived, not remembered.** Re-derive before quoting it; do not trust this snapshot's numbers:

```bash
# stub nodes + how many live items cite each
python3 - <<'EOF'
import json,glob,re
stubs=[]
for f in glob.glob('data/buckets/*.json'):
    d=json.load(open(f,encoding='utf-8'))
    def go(x):
        if isinstance(x,dict):
            if (x.get('attributes') or {}).get('stub'): stubs.append(x['id'])
            for v in x.values(): go(v)
        elif isinstance(x,list):
            for v in x: go(v)
    go(d)
blob="".join(open(f,encoding='utf-8').read() for f in glob.glob('data/grammar_questions_*.json')+glob.glob('data/translation_items_*.json'))
for s in sorted(stubs):
    print(len(re.findall(r'"'+re.escape(s)+r'(?:\.[a-z_]+)*"', blob)), s)
EOF
```

Snapshot 2026-07-17: **37 stub nodes found; 12 cleared as stale; 25 remain, of which only 9 are real work.**
A raw stub list is misleading, because "stub" is wearing three different meanings.

## 1. STALE FLAGS — authored, flag never cleared (12, CLEARED 2026-07-17)

Live items already cite these; the flag lied. Same defect found and fixed on tense_choice's 8 the week before.
`article.discrimination(+with_or_without)` 9 items · `demonstrative.discrimination.questo_vs_quello` 7 ·
`preposition.discrimination(+a_vs_in_place, di_vs_da)` 7 · `relative_pronoun.discrimination(+che_vs_cui, che_vs_il_quale)` 5 ·
`condizionale.usage.polite/hypothetical_apodosis/reported_future_in_past` 4.

**Standing rule:** clearing the stub flag is part of accepting a batch. A stub flag on authored work sends the next
author to build something that exists.

## 2. PHANTOM DUPLICATES — do NOT dispatch (16). RULING NEEDED.

Every per-tense `discrimination.*` stub duplicates a leaf `tense_choice` **already owns and has authored** (185 items):

| stub (0 items) | already live as |
|---|---|
| `present_indicative.discrimination.vs_imperfect` | `tense_choice.present_vs_imperfect.*` |
| `present_indicative.discrimination.vs_passato_prossimo` | `tense_choice.present_vs_passato_prossimo.*` |
| `present_indicative.discrimination.vs_future` | `tense_choice.future_vs_present.*` |
| `future.discrimination.vs_present` | `tense_choice.future_vs_present.*` — **also duplicates the row above** |
| `gerundio.discrimination.vs_simple_present` | `tense_choice.progressive_vs_simple.*` |
| `passato_remoto.discrimination.vs_passato_prossimo` | `tense_choice.passato_remoto_vs_passato_prossimo.*` |
| `trapassato_prossimo.discrimination.vs_imperfect_pp` | `tense_choice.trapassato_vs_imperfect.*` |
| `condizionale.discrimination.vs_imperfect_counterfactual` | `tense_choice.conditional_vs_imperfect_counterfactual.*` |
| `congiuntivo.discrimination.vs_indicative` | `tense_choice.indicative_vs_subjunctive.*` |

Plus their 7 `*.discrimination` aggregates. **"Present vs future" is registered three times** — twice inside
verb_form, once in tense_choice. Dispatching any of these authors a live skill a second time under a second bucket
id and splits the learner's stats across both. **Blocked pending Smith's ruling; nobody should dispatch them.**

## 3. THE REAL BACKLOG — genuinely to be made (9)

- **Usage leaves (6)**: `congiuntivo.usage`, `future.usage`, `gerundio.usage`, `imperativo.usage`,
  `passato_remoto.usage`, `trapassato_prossimo.usage`. Real work: usage is not formation (formation supplies the
  trigger; usage asks whether the learner realises the trigger applies).
- **`imperativo.discrimination` + `.register_informal_vs_formal` (2)** — tu vs Lei. NOT a tense-choice duplicate:
  tense_choice has no register leaf. This is the promised home for `register.tu_lei_mismatch`, and it is the one
  registered candidate for the reserved `register` misconception family.
- **`word_formation.relational_adjectives` (1)** — already parked in OPEN_QUESTIONS as a future-seat scoping ask.
