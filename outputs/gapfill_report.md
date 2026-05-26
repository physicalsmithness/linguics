# Gap-fill report — top-1000 thin entries

Added **20** thin entries to `data/vocabulary_it_frequency.json`. Curated entry count is now **1496** (was 1476).

Skipped **8** junk lemmas (lemmatisation/tokenisation artefacts, not real Italian).

## Added entries by POS

- noun: 13
- verb: 3
- adverb: 2
- preposition: 1
- adjective: 1

## Skipped (not real Italian lemmas — recommend pruning from lemma CSV)

- rank 407: `the` (noun)
- rank 489: `l` (verb)
- rank 656: `c` (verb)
- rank 874: `s` (verb)
- rank 876: `d` (verb)
- rank 910: `l` (adjective)
- rank 965: `of` (noun)
- rank 976: `n` (verb)

## Flagged entries (needs vocab-chat review)

- rank 506: `voi` (noun) — POS likely wrong (voi is pronoun, not noun) — flagged
- rank 506: `voi` (noun) — translation marked uncertain
- rank 986: `ricordo` (noun) — no translation in script — needs review
- rank 987: `intenzione` (noun) — no translation in script — needs review
- rank 988: `muro` (noun) — no translation in script — needs review
- rank 992: `dolce` (adjective) — no translation in script — needs review
- rank 993: `materiale` (noun) — no translation in script — needs review
- rank 996: `risorsa` (noun) — no translation in script — needs review

## Full added list (rank, lemma, pos, gloss)

- 147 `buono` adverb — well, cheaply
- 506 `voi` noun — you (pl.) [tagged as noun in source; treat as pronoun]?
- 983 `dichiarazione` noun — declaration
- 984 `anzi` adverb — on the contrary, rather
- 985 `anzi` preposition — before, ahead of
- 986 `ricordo` noun — ?
- 987 `intenzione` noun — ?
- 988 `muro` noun — ?
- 989 `appartenere` verb — to belong
- 990 `distanza` noun — distance
- 991 `contrario` noun — opposite, contrary
- 992 `dolce` adjective — ?
- 993 `materiale` noun — ?
- 994 `sud` noun — south
- 995 `ripetere` verb — to repeat
- 996 `risorsa` noun — ?
- 997 `commissione` noun — commission
- 998 `incidente` noun — incident, accident
- 999 `avvocato` noun — lawyer
- 1000 `progettare` verb — to plan, design

## Notes on derivation

- **Translations**: written directly from the model's knowledge of top-1000 Italian. `?` markers flag uncertain or unusual senses for vocab-chat review.
- **Auxiliary**: `modal_aux_inheritance` for potere/dovere/volere; `aux_varies_by_transitivity` for verbs where the lemma CSV said `either`; otherwise inherited from the CSV's heuristic (which defaults to `avere`). A handful of essere-taking verbs missed by the heuristic (avvenire, apparire, capitare, ritornare, bastare, parere) are corrected here.
- **noun_class**: derived per the rules in the brief — invariable_loanword > accented_final > gender_shift_plural > greek_ma_masc > ista_common_gender > irregular_gender > regular_o_masc / regular_a_fem > e_ambiguous > irregular_gender.
- **themes**: POS-default placeholders (e.g. `noun_abstract`, `verb_action_general`). The vocab chat re-themes during enrichment.
- **plural, conjugation_class, gloss_en**: left null. Vocab chat fills.
