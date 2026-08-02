# Item shape: testing a form that does not change

**Status: PROPOSAL, v2, 2026-08-02, Architecture. Not binding. Push back.**
v2 adds the marking spec, ruled by Smith the same day.
Found by the rebuilt estate-net gate; shaped by Smith's rulings the same day.
Affected: 69 items across adjective_agreement, adverb, noun, demonstrative, imperativo, indefinite.

---

## The problem

`Complete with the correct form: 'Il libro è ____.' (rosso)` — answer `rosso`.

The item exists to test that a Class-I adjective keeps `-o` in the masculine singular. But the cue has
to name the adjective, and the masculine singular IS the citation form, so the cue is the answer. A
learner who copies it scores 1/1 having demonstrated nothing, and the item then reports coverage on
`adjective_agreement` that was never earned. The mark is right; the measurement is fiction.

This is not an authoring slip. It is what happens whenever the skill under test is **"this word keeps
its shape"**: invariable adverbs (molto, troppo, poco, tanto), invariable plurals (città, film, re,
crisi, caffè), masculine-singular adjectives, invariable colour and compound adjectives, pari/dispari,
impersonal-infinitive imperatives, participle agreement in the no-change case. The cue must name the
word; the answer is the word.

## The constraint that rules out the obvious fix

The obvious fix is "strip the Italian cue where the answer equals it". **Smith's ruling: no.** If the
Italian cue is present only when the form changes, then its presence becomes a tell. Learners would
stop reading the grammar and start reading the item furniture: *cue in Italian, so it must change.*
That is a worse leak than the one we started with, because it is invisible and it teaches a strategy
rather than a rule.

**So the cue convention has to be uniform, not conditional.** Whatever we choose, it applies to items
where the form changes and items where it does not, identically.

## The two instruments

### A. English cue, clickable

`Complete with the correct form: 'Il libro è ____.'` with **red** rendered as an underlined,
clickable cue. Clicking reveals `rosso` and records a vocabulary lookup.

Use when **the meaning determines the word**. "red" can only be `rosso`. Nothing is ambiguous, so the
English cue names the target exactly as precisely as the Italian one did, without supplying the string.

The click is not a failure of the item. It is the item working: it turns "I didn't know the word" from
an invisible confound into a recorded vocabulary miss, on a learner who genuinely didn't know it.

### B. MCQ with the wrongly-inflected forms as distractors

`Le ragazze sono ____ stanche.` → **molto / molta / molte / molti**

Use when **the meaning does NOT determine the word**. Smith's test case: an English cue reading
"a bit more" or "very" does not pin `molto` rather than `tanto` or `parecchio`, so the learner is lured
into failing a vocabulary question we didn't mean to ask. Putting the four inflections in front of them
makes invariability a real choice, which a blank never can.

**The decision rule, in one line: English cue where the meaning fixes the word; MCQ where it doesn't.**

## How instrument A is MARKED — Smith's ruling, and it is the load-bearing half

An English cue re-introduces vocabulary as a confound: a miss might now mean "didn't know *rosso*"
rather than "didn't know that m.sg keeps -o". Smith ruled the mechanism directly, by worked example.

The learner's answer is classified ONCE, against the cued lemma's inflectional set:

| answer | classification | vocabulary | formation |
|---|---|---|---|
| `rosso` | the target form | HIT | HIT |
| `rossa` | a real form of the right word, wrong one for this slot | HIT | **MISS** |
| `blu`, `nero`, `gentile`, `simpatico` | a different word | **MISS** | **silent** |
| `roso` | not a form of anything | **MISS** | **silent** |

**The discriminator is membership of the lemma's inflectional set, nothing cleverer.** Smith's own
`roso` case rules out the tempting stem-prefix heuristic: `ros` is a prefix of `ross`, so a prefix
test would wrongly credit it as the right word. Set membership gets it right, and the field already
exists estate-wide: `candidate_forms`.

**Smith explicitly refused the more generous option, and the reasoning is worth keeping.** Two of the
wrong words (`nero`, `simpatico`) ARE correctly agreeing masculine singulars, so we *could* credit
formation on them. His ruling: don't. "It's going to be quite hard to think of every possible wrong
word that they give." The moment formation credit depends on judging an arbitrary wrong word, the
rule stops being decidable. So: any answer outside the set is a vocabulary miss and formation says
nothing, even when the wrong word happens to be well formed. Slightly ungenerous, entirely decidable.

**On the estate rule this appears to break.** Formation drills are supposed to supply the trigger so
that a miss is unambiguously "couldn't form it". Smith's ruling on that: it is a loose rule, and "we
shouldn't do this because we said we wouldn't" is not a reason. The classification above satisfies
its INTENT anyway, since a formation miss now fires only when the learner demonstrably had the right
word. The rule is honoured, not suspended.

**Engine state.** `grammar_engine.js:227` already supports `credit_only: true` on a markpoint plus a
`lemma_retrieval_pilot` provenance fallback, so the silence half exists. What is missing is the
membership test: today the silence is unconditional, so a real-form-wrong-slot answer like `rossa`
would be swallowed and the formation bucket could never record a failure. That is one condition to
add, and until it lands instrument A cannot ship.

**Authoring cost, stated honestly.** `candidate_forms` exists on 162 items, but NOT on the adjective,
noun, imperativo or demonstrative items in scope. `adv_inv_*` already carry exactly the right set
(`["molto","molta","molti","molte"]`), so the adverb class is half-built for instrument B already.
The other four classes need the set authored per item. That is real work and it is the main cost of
this proposal.

## Per-class disposition

| class | n | instrument | note |
|---|---|---|---|
| adjective m.sg / f.sg where the agreeing form is the citation form | 30 | **A** | Smith: "if you've got *rosso*, that should say *red*, and it should be underlined" |
| invariable adverbs `adv_inv_*` | 6 | **B** | Smith: the English cue doesn't pin the word; people "will be lured into messing it up" |
| invariable plurals `noun_plur_inv_*` | 7 | **A**, or leave | Smith: `Una città, due ____` is genuinely unclear (two lives? two personalities?). Give it as "one city, two cities" and let them produce the Italian. **In an explicitly plural drill the current form is acceptable** — context disambiguates |
| impersonal-infinitive imperative `impv_use_inf_*` | 6 | **A** | **Smith disagreed with me here and he is right.** The item shape is sound: the sign says *push*, you write `spingere`. Only the redundant `(spingere)` parenthetical goes. If they don't know it they ask, and they learn they didn't know it |
| demonstrative | 7 | probably A | not yet read individually |
| indefinite | 2 | per-item | `ind_nn_06` is a plain authoring fault, already returned |

## What this is NOT

It is not a claim that 69 items are badly written. Most are good items defeated by a cue convention
nobody had examined. It is also not a rewrite order: each seat owns the call on its own items, and if
a seat can show me a class where the cue genuinely has to be Italian, the law is wrong and I want to
know before it binds anything.

**Open to challenge on:** whether the "plural drill context is enough" carve-out generalises beyond
nouns; whether demonstratives are really class A; and whether the ungenerous formation rule (no credit
for a well-formed wrong word) will feel unfair to a learner who wrote `nero` correctly. Smith has
already ruled the last one and I think he is right, but a seat that hits it in practice should say so.
