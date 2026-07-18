# Coverage: Connectives (`connective`, topic_short `conn`)

Seat: ConnectiveAuthor. Delivered 2026-07-18 against AUTHOR_BRIEF Rev 25 and DISPATCH_connective.md.
Files: `grammar_questions_connective.json` (54), `translation_items_connective.json` (22),
`bucket_suggestions_connective.json` (1), `glossary_suggestions_connective.json` (4), this doc.

## Bucket-to-item table

| Bucket (label) | id | Grammar | of which MCQ | Translation required | CEFR centre |
|---|---|---|---|---|---|
| Siccome or perché: position | connective.cause.siccome_perche | 7 | 2 | 3 | A2 |
| Poiché, dato che, visto che | connective.cause.register_set | 4 | 1 | 2 | B1 |
| Quindi, perciò, allora | connective.result.quindi_percio | 6 | 1 | 2 | A2-B2 |
| Result: che + verb or da + infinitive | connective.result.che_vs_da | 6 | 0 | 2 | B2 |
| Però, invece, ma | connective.contrast.pero_invece | 7 | 2 | 2 | A2-B1 |
| Comunque, tuttavia, eppure, anzi | connective.contrast.comunque_anzi | 6 | 2 | 3 | B1-B2 |
| Concessive connector choice | connective.contrast.mood_pairs | 6 | 1 | 3 | B2 |
| Prima di, prima che, dopo (che) | connective.time.prima_dopo | 4 | 0 | 3 | B1-B2 |
| Mentre, (non) appena (PROPOSED) | connective.time.mentre_appena | 2 | 0 | 0 | B1 |
| Sequencers | connective.discourse | 6 | 0 | 2 | B1 |
| **Totals** | | **54** (45 short + 9 MCQ) | **9** | **22** (11 en>it + 11 it>en) | A2 13 / B1 20 / B2 21 |

12 polarity-negative anchors across the translation set, each keyed to a named miss (cause-first perché,
post-slot siccome, benché + indicative, nonostante + conjugated indicative, prima che + same subject,
dopo + bare infinitive, mixed che/da machinery, anzi polarity misreads, siccome decoded as "so").

## Policy decisions applied (with reasoning)

1. **Suppression on every item** (`info_display: "suppress"`). All items are discriminations over a
   closed connector set; a connector slot is Rev 20's sixth recoverable class (frame-forced), so
   suppression stands and the dispatch's worked-example instruction is followed uniformly. Labels are
   terse and post-answer only; `candidate_forms` + `correct_form` declared on all 45 shorts. MCQs carry
   their candidate set as the visible choices, per the word_formation Architecture-v5 precedent (no
   candidate_forms on verdict/choice items).
2. **Criterion 18: everything word-anchored**, including multiword phrases; the connective inventory is
   maximally substring-hazardous (poi in poiché, ma in mai, anzi in innanzitutto/anziché, che in
   everything). Five guards are deliberately NESTED inside their positives as ordering-protected
   dropped-word attributors (bare `prima` under `prima di`/`prima che`; bare `dopo` under `dopo
   aver(e)`/`dopo che`), per criterion 18's exempt mirror case; each carries an examiner_note.
3. **The ma-però additive error is routed to MCQ** (conn_pi_05) and deliberately NOT guarded in
   must_not_include: 'ma però' contains the correct 'ma' at clean word boundaries, so a guard would be
   dead on arrival (criterion 18 fourth direction). Index scoring carries the diagnosis.
4. **MCQ markpoints use the full verbatim choice text** as any_phrases/must_not entries, so matching is
   punctuation-safe whatever norm() does to colons (conn_ca_04/05 initially used a leading fragment; the
   local gate caught the mismatch and they were rewritten pre-delivery).
5. **Rev 20(i) applied to poiché-in-casual-speech** (reg_02, reg_03): it is the bucket's NAMED
   common_miss and the bucket's own note says style-not-error, so it takes an explicit graded 0.6 with a
   steering note, neither a silent 0.9 kindness nor a wrong-flag.
6. **Criterion 19 reasoned N/A batch-wide**: no accent-stripped twin (perche, pero, percio, benche,
   cosicche, anziche, bensi) is a plausible alternative ANSWER in any connector slot; pero the pear tree
   is not a candidate. accent_load_bearing unset everywhere; fold-rescue + orthography miss is the right
   verdict. (Also: most items are frame-forced sets, so the Rev 21(i) carve-out doubles the exemption.)
7. **Criterion 20 / Rev 25**: no citation-form cues exist in the batch; every cue is a bracketed English
   meaning gloss (plus register statements per criterion 11). prompt_supplies_base_form false
   throughout. The Rev 25 cue-level audit is therefore vacuously clean, run and recorded at delivery.
8. **Criterion 13 sweep run at delivery: zero rule-name words in prompts.** The dispatch worked
   example's own rubric ("per la posizione") named the diagnostic and was rewritten to a meaning gloss.
   Criterion 14 grep clean (no clitic items).
9. **Criterion 17**: all 54 explanations open with (or immediately contain) the English rendering of the
   completed sentence, then the four-beat working.
10. **The two-sided mood contract is honoured**: every mood_pairs item GIVES the verb form (fosse/era/
    essendo/avesse/costi) and asks for the connector; no mood-choice items authored. conn_mood_02's
    examiner_note cross-cites tense_choice.indicative_vs_subjunctive. Finché untouched (negation owns
    the flip); the time items stay off it.

## Items flagged uncertain

- **conn_pi_03**: two full-credit answers (però/invece) by design; the diagnostic is ma's exclusion from
  the parenthetical slot. Flagging because two-full-credit discriminations are unusual.
- **conn_cons_05** (Penso, dunque sono): a fixed-dictum item; quindi/perciò graded 0.9. If fixed
  phrases are out of scope for grammar drills, demote to translation.
- **conn_time_04**: appena / non appena graded 0.9 against an "After the guests left" gloss; the
  nuance-shift grading (after vs as-soon-as) is a judgement call.
- **conn_seq_02**: the poi/poiché confusion guard; plausible at A2? Kept because the miss is diagnostic
  gold if it fires, and harmless if it never does.
- **conn_ca_02 / conn_ca_03**: register-ladder grading (tuttavia 1.0 / eppure 0.9 / però 0.8) is finer
  than most leaves; spot-check wanted.
- **trans_conn_en_it_cause_01**: examiner_note steers the AI marker to credit the clause-REVERSED perché
  rendering; only cause-FIRST perché is the negative anchor. Worth a marker-replica eye.

## Proposals and flagged gaps (asks live in the delivery thread)

- **Proposed bucket**: `connective.time.mentre_appena` (2 items delivered against it; manifest-gated on
  ratification). See bucket_suggestions_connective.json.
- **Glossary**: connective, concessive, register, sequencer proposed (all absent from glossary.json).
  Noted estate-wide: subjunctive, gerund, indicative are also absent, and this batch's explanations lean
  on them; that is the glossary owner's call, not this seat's.
- **Purpose connectives have no home**: affinché / perché + subjunctive (so-that clauses) were named in
  OPEN_QUESTIONS §"New grammar topics" as connective scope, but the tree has no purpose leaf and the
  mood contract boundary with tense_choice needs drawing before anyone authors it. Flagged, not filled.
- **Next dispatch ideas**: OIC C2 contrast pool (piuttosto, al contrario, in realtà) only partly mined;
  register_set is at 4 items (lighter than siblings; a poiché/giacché literary split could deepen it);
  sentence-half matching (OIC recognition format) has no engine shape yet, could be an MCQ bank.
