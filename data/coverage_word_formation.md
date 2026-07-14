# Coverage: Word formation (`word_formation`, topic_short `wf`)

Author: WordFormationAuthor. Dispatch: `DISPATCH_word_formation.md`. Brief: AUTHOR_BRIEF Revision 16.
First pass, 2026-07-15; reconciled Brief Rev 16 -> Rev 19 the same day. Batch ACCEPTED by Architecture.

**Thread (the channel, per Rev 18): `inter_chat/Architecture_WordFormationAuthor_batch_disposition.md` (v2, OPEN, 6 asks pending).** The sections below are the record; the asks live in the thread.

Outputs: `grammar_questions_word_formation.json` (30), `translation_items_word_formation.json` (11), `glossary_suggestions_word_formation.json` (6 terms), `bucket_suggestions_word_formation.json` (1).

## Bucket-to-item counts

| Bucket (friendly label) | CEFR at target | Grammar | Translation |
|---|---|---:|---:|
| Diminutives (-ino/-etto/-ello/-uccio) | B2 core | 6 | 2 |
| Augmentative & pejorative (-one/-accio) | B2 core | 6 | 3 |
| Falsi alterati | C1 core | 8 | 2 |
| Prefix intensifiers (stra-/arci-/super-/ultra-) | B2 core | 5 | 2 |
| Neo- / ex- | C1 core | 5 | 2 |
| Relational adjectives | (stub) | — | — |
| **Total** | | **30** | **11** |

Every active leaf cleared the brief's 2-5-per-leaf floor. Falsi and augmentative/pejorative are weighted up as the two hottest spots. The `relational_adjectives` leaf was left untouched per the dispatch (stub, authored later, possibly with the adjective topic).

## Hot spots (dispatch order) and how they are hit

1. **Falsi classification** - 8 items, `info_display: suppress` on all (the leaf label "Falsi alterati" would hand over the answer). Six independent words (cavalletto, focaccia, mattino, burrone, tacchino, montone) against two real alterati (gattino, tavolino) so the classification is genuine, not always "independent". Two translation items (cavalletto, focaccia) test the same discrimination in comprehension.
2. **Gender shift under -one** - wf_aug_02 (la porta > il portone) and wf_aug_03 (la macchina > il macchinone), plus translation trans_wf_en_it_aug_01 with a `polarity: negative` anti-anchor on "la portona". The article is required in the answer so the gender is the diagnostic. See the bucket proposal below.
3. **Affective value** - wf_dim_03 (sorellina = affection not size) as a forced-choice judgement; reinforced in wf_dim_06 (fratellino) and translation trans_wf_en_it_dim_01.
4. **-accio as quality not size** - wf_pej_01 (tempaccio), wf_pej_02 (parolaccia), wf_pej_03 (ragazzaccio, suppressed forced-choice). Both translation pejorative items reinforce.
5. **neo-/ex-** - five items in the OIC true/false definition-judgement format (neolaureato, neonato, neoclassico=false-trap), ex production (ex marito), and a neo-vs-ex opposition item.
6. **Lexicalisation limits** - wf_dim_05 (cucchiaino as a fixed object) and wf_pref_int_05 (strasedia is not Italian: intensifiers attach to adjectives, not free nouns). Reinforced by keeping production to attested forms and pushing the rest to recognition.

## House techniques used (Rev 14)

- **Same-surface, opposite-answer** - gattino (vero alterato) vs cavalletto (falso) inside one leaf; neo-presidente vs ex presidente.
- **Exception density** - the two real alterati seeded among the falsi so the learner cannot autopilot "everything is independent".
- **One-out-of-paradigm trap** - neoclassico=false inside a run of true neo- definitions.

## Marker safety (criterion 18)

- All 32 grammar any_phrases are `match_at: "word"` anchored (uniform anchoring applied on the Rev 17 reconciliation; must_not_include likewise).
- **Rev 17 (ii) audit CLEAN**: no must_not_include entry is a substring of its item's correct answer, checked against a port of the shipped `norm()`. must_not_include is else-if gated behind the positive match in grammar_engine.js, so a present correct phrase always wins first.
- **Rev 19 recoverability audit CLEAN**: all 13 suppressed items are forced choices whose two options appear verbatim in the prompt, so the candidate set is recoverable pre-answer and suppression remains legitimate. None is a bene/buono-style unrecoverable lexeme choice.
- Bases are never used as bare any_phrases, so the "base inside its own alterato" hazard (tavolo inside tavolino) does not arise: produce-the-alterato answers are the long form.
- Gender-shift items list the wrong-gender form (`la portona`, `la macchinona`) in must_not_include, anchored, so a gender miss is attributed, not silently dropped.

## Flagged / uncertain items (for review)

- **wf_pref_ex_01 hyphen question: RESOLVED, ask withdrawn.** `norm.js` folds hyphen to space (`t.replace(/-/g, " ")`), so `ex-marito` normalises to `ex marito`: the spaced any_phrase already catches the hyphen spelling and the separate `ex-marito` entry was a norm-duplicate. Dropped; `ex marito` word-anchored.
- **Rev 17 (iii) candidate_forms: held, ruling requested in the thread.** The binary items (falsi vero/indipendente, affetto/statura, quality/size, vero/falso) are two-option discriminations, but the options are classification labels rather than candidate forms of a lexeme, which is what the Rev 17 (iii) precedents (suo referent, questo/quello) address. Not added unilaterally across the 16 affected items.
- **Three forced-choice items** (wf_dim_03, wf_pej_03, wf_pref_int_05) and the falsi set are authored as `type: short` with the two options named in the prompt, following the dispatch worked example. If the housing would render these better as `mcq`, they convert cleanly. Flagging the format choice, not the content.
- **tavolino as "vero alterato"** (wf_falsi_07): defensible because the base "small table" survives even in the lexicalised side-table sense, but it sits near the falso/lexicalised line. If you would rather teach it as lexicalised-independent, move it to the falsi-"ind" side.
- **montone as falso** (wf_falsi_08): etymologically not from monte; kept as a shape-only lookalike. Confirm you are happy teaching it in the falsi set rather than dropping it.

## Bucket proposal (see `bucket_suggestions_word_formation.json`)

- `word_formation.alterati.augmentative_pejorative.gender_shift` under the existing augmentative/pejorative leaf. Not strictly required (the three gender-shift items cite the parent leaf and are valid against the tree as shipped), but the gender-shift miss is diagnostically distinct and is hot spot #2. If ratified, retarget wf_aug_02, wf_aug_03 and trans_wf_en_it_aug_01.

## Notes for the next dispatch

- **relational_adjectives** stub still open (the -ale/-are/-istico/-oso derivation family and Latinate pairs like fegato > epatico). Larger and overlaps the adjective topic; worth its own scoping.
- **Deliberately omitted borderline falsi**: postino, rossetto, mulino, matterello. Available if a second pass wants more falsi volume.
- **Suffix inventory**: the diminutives leaf label lists -ino/-etto/-ello/-uccio; the dispatch scope also names -otto. No -otto item yet (few clean, non-lexicalised bases). Flag if you want it covered explicitly.
- **glossary_suggestions NOT YET MERGED** (checked 2026-07-15: glossary.json is at v5/111 terms, none of the six present). Every explanation in this topic names these as its four-beat term and relies on the tooltip, so the terms are currently unexpandable. Raised as ask #1 in the thread. "lexicalised" already exists and was reused.
- **Cross-topic**: intensifiers cite `comparison` (the absolute-superlative frame) as prerequisite/optional-bucket per the dispatch. No comparison items authored here; comparison owns arcistufo-as-superlative classification.
