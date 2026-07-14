# Coverage: existential (c'è / ci sono)

Author: ExistentialAuthor. Batch date: 2026-07-14. Brief: AUTHOR_BRIEF Revision 15 (authored against Rev 13, reconciled to Rev 14/15 in the same session). Tree: data/buckets/existential.json (11 nodes, 8 active leaves).

Deliverables:
- data/grammar_questions_existential.json (43 items, prefix `ex_`)
- data/translation_items_existential.json (21 items, prefix `trans_ex_`)
- data/bucket_suggestions_existential.json (empty; rationale below)
- data/glossary_suggestions_existential.json (2 terms)

## Coverage per leaf

Grammar column = markpoints citing the leaf (the number-tracking `ex_form_pl_02` carries two, so markpoints total 44 across 43 items). Translation column = items requiring the leaf.

| Leaf | Grammar | Translation | Weight |
|------|:-------:|:-----------:|--------|
| C'è with a singular thing | 7 | 1 | deep (incl. mass-singular baits) |
| Ci sono with plural things | 10 | 3 | deepest (top hot spot) |
| Negative: non c'è, non ci sono | 5 | 2 | core |
| Questions and short answers | 4 | 1 | core |
| Past: c'era, c'erano, c'è stato | 7 | 3 | core (2 are discrimination) |
| C'è or è? new vs known | 4 | 6 | deepest (translation-carried) |
| C'è or ecco? existing vs pointing | 4 | 2 | core |
| Fixed expressions with esserci | 3 | 3 | light (as briefed) |

Direction split on translations: 14 EN->IT, 7 IT->EN. Form leaves are production, so EN->IT only; IT->EN recognition sits on the usage and idiom leaves.

## Marker safety (criterion 18, Rev 15)

Every grammar `any_phrase` and every `must_not_include` entry is word-anchored using the per-phrase object form `{"phrase": ..., "match_at": "word"}` (the shape the engine actually reads; a markpoint-level match_at is inert). The existential forms are short closed-class tokens that superstring-embed in plausible wrong attempts, mostly via the accent-folded fallback: c'è inside c'era / c'erano / c'è stato; ci sono inside ci sono stati / state; non c'è inside non c'era; ecco inside eccolo / eccola. Anchoring both boundaries blocks these without breaking any correct answer, since every accepted answer is an exact whole token. It also makes `ex_form_past_02` clean: the anchored catch `c'era` no longer sits inside the correct plural `c'erano`.

## House techniques / OIC idea-bank (Rev 14)

Folded in the dispatch's appended OIC traps, all hitting agreement from angles the base batch missed: mass-singular baiting plural (c'è tanta neve, c'è molto traffico); coordination of singulars taking the plural (ci sono latte e caffè, the standout OIC trap, plus a matching translation item); approximation invariance (ci sono circa venti studenti); A1-safe geography frames (In Egitto ci sono le piramidi, In Finlandia ci sono molti laghi); and mass-noun negation (non c'è latte). The neve/laghi pair is House technique 3 (same surface, opposite answer). Deliberate departures: technique 1 (person recovery) and 5 (word-bank distractors) do not apply to an impersonal free-text existential; technique 4 (out-of-paradigm trap) is already served by the vs_essere items, which sit in an esserci drill but require plain essere.

## Authoring decisions worth ratifying (largest first)

1. **Breadcrumb suppression extended beyond the two contrast leaves.** The dispatch mandated suppress only on *C'è or è?* and *C'è or ecco?*. I applied criterion 15's leak test and also suppressed every form-leaf item whose label names the target form (singular, plural, negative, past): the breadcrumb "Ci sono with plural things" hands over the answer. Left visible: *Questions and short answers* and *Fixed expressions with esserci* (labels name the item type, not the answer). Net 36 of 43 suppressed. Pull this flag if Architecture wants form-leaf breadcrumbs visible.

2. **The c'è-vs-è calque is caught in translation, not grammar.** vs_essere grammar items credit the correct existential but do not `must_not_include` a bare-essere calque ("è" / "sono"), because a bare accented-vowel catch is unsafe under soft accent guards and word-anchoring. The calque is caught in the six vs_essere translation items via `polarity: "negative"` anti-anchors. A bare-copula grammar answer still records a miss on the vs_essere bucket (correctness 0), just not flagged as attempted.

3. **`ex_form_pl_02` is the flagship two-slot item.** It is the only item with two blanks (a singular blank and a plural blank in different clauses), forcing number tracking rather than copying the neighbour. The earlier reliance on positive-match-first for `ex_form_past_02`'s c'era/c'erano catch is now removed: per-phrase word-anchoring means the singular catch no longer embeds in the correct plural.

4. **Past leaf: mostly form, two genuine discriminations.** Five past items are pure form with the tense pinned by context; two (`ex_form_past_06`, `_07`) test c'era vs c'è stato, carrying `candidate_tenses` / `correct_tense` + suppress and citing `verb_form.imperfect.discrimination.vs_passato_prossimo_general` as optional. This honours the boundary ruling that the imperfetto/PP choice proper belongs to the imperfect tree.

## Items flagged uncertain

- **vs_ecco stage-directions.** The four *C'è or ecco?* prompts force the choice with a bracketed situation ("(porgi il caffè al cliente)") rather than naming the rule. Context, not rule-naming, in my reading; worth a house-style nod.
- **"Sì, c'è" requires the full phrase.** `ex_form_q_03` accepts "Sì, c'è" but not a bare "c'è", to keep the short-answer form as the test (dispatch hot spot 5). Deliberate; flagging in case it is too strict.
- **`ex_use_idiom_01` has no `must_not_include`.** No distinctive, collision-safe catch for a dropped "non" in "Non c'è di che"; relies on correctness alone.

## Bucket suggestions: none

The tree covers the whole scope. The colloquial availability reading of "c'è il libro" is handled as an authoring caveat inside *C'è or è?* per the commit ruling, not as a new bucket. File is `[]`.

## Glossary suggestions: 2

`existential construction` and `definiteness` (the dispatch's named candidates), neither present in glossary.json (which already has elision, definite article, indefinite article). Explanations use the bare word "existential" heavily, so an alias to the new entry is requested in the suggestion.

## Notes for the next dispatch / for Architecture

- **manifest.json is now ready for "existential".** Content has landed, so the standing "no empty-count noise" gate is satisfied and the housing can load the topic. Adding it is a housing/architecture action; as the topic author I have not touched manifest.json (stay-in-role). Flagging it as ready.
- **Misconception axis** (for the architect, not implemented here): the "c'è + plural" agreement miss and the "è for existence" calque are the two named candidates, both live across this batch's `must_not_include` notes.
- Batch was authored against Rev 13 and reconciled to Rev 15 (criterion 18 anchoring) and Rev 14 (OIC techniques) mid-session after those landed; noting in case any other in-flight batch needs the same reconciliation.
