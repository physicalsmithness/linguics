# Coverage: present indicative, usage branch

**Dispatch:** PresentUsage (usage branch only; formation was the earlier PresentFormation dispatch; discrimination stays with TenseChoice).
**Author:** PresentUsageAuthor
**Date:** 2026-07-14
**Brief revision applied:** AUTHOR_BRIEF Rev 13. (The dispatch was written against Rev 11; the Rev 12 terse-label rule and Rev 17 criterion 17, translation-in-every-explanation, are both applied.)

**Totals:** 12 grammar questions + 12 translation items (7 EN→IT, 5 IT→EN). Staging files per the dispatch: `grammar_questions_present_usage.json`, `translation_items_present_usage.json` (external_id short `pu`; no clashes with the formation batch's `pres_` / `trans_pres_` ids, verified programmatically). No items carry `candidate_tenses` or `info_display: "suppress"`: these are single-tense usage items, and the usage-leaf breadcrumbs ("Habitual and general truths", "Happening now") name the context, not a rule-output the learner can't derive, so they pass the leak-vs-trap test on the visible side. No new buckets were needed, so there is no `bucket_suggestions_present_usage.json`. Two glossary terms are proposed (`glossary_suggestions_present_usage.json`); a third term I lean on, the progressive, is already proposed by the GerundioAuthor batch and is deliberately not re-proposed.

The translation items lean EN→IT as the dispatch asked, but 5 of 12 are IT→EN by design: the usage buckets are `direction: "bidirectional"` (unlike the formation batch's production-only buckets), and the reverse direction carries a diagnostic EN→IT cannot reach, namely whether the learner knows the Italian plain present must *become* an English progressive ("preparo la cena" → "I'm making dinner", not "I make dinner").

---

## Coverage by leaf

"G" counts grammar markpoints on the leaf; "T" counts translation items naming it as a required bucket.

| G | T | Leaf | What it tests |
|--:|--:|---|---|
| 3 | 3 | Habitual and general truths | Habit markers (ogni mattina, di solito) and gnomic truths pin the plain present; future / past / progressive wrong-reaches caught |
| 3 | 4 | Happening now *(hot)* | Plain present suffices where English needs -ing; both directions of the trap; perception verbs (vedo, sento) as the resists-progressive case |
| 3 | 3 | States and facts | The avere idioms (fame, sete, freddo, age) against the essere calque; sapere as a stative that rejects the progressive and beats conoscere before dove-clauses |
| 3 | 2 | Instructions and directions | si-impersonal in the plain present: 3sg with singular (si serve, si sale), plural agreement (si tagliano), and IT→EN rendering as generic "you" |

CEFR spread, both files: 6 × A1, 4 × A2, 2 × B1 (the B1 items are the si-impersonal plural agreement and the instruction translations, matching the leaf's B1-core importance). Per the dispatch, this is deliberately a light branch: each use is hit from at least two angles (grammar + each translation direction), heaviest on happening-now and habitual where English interferes, and I stopped there rather than padding.

## How the progressive ruling was applied

Smith's ruling (2026-07-14, in-chat): grade stare + gerundio by how clearly the context makes the plain present the more natural rendering. Applied as three grades:

1. **Context doesn't clearly prefer plain present** (generic now-actions: making dinner, driving, talking on the phone): both renderings full credit; the "Italian never *needs* the progressive" teaching lives in the explanation. Items: pu_now_01, pu_now_03, trans_pu_en_it_now_01, trans_pu_en_it_now_02.
2. **Context clearly prefers plain present** (perception verbs; habitual/gnomic contexts): progressive gets ≈0.6, "not wrong, but..." explanation. Grammar side via graded `any_phrases` objects (pu_now_02); translation side via MARKER GUIDANCE notes on negative-polarity references (trans_pu_en_it_hab_01, trans_pu_en_it_hab_02).
3. **Progressive is actually ungrammatical** (statives: stiamo sapendo): plain `must_not_include` / negative reference, no credit (pu_state_03, trans_pu_it_en_state_01 explanation).

## Engine finding for other authors (flagged to Architecture)

The 3sg present of -are and -ere verbs is a substring of its own gerundio, imperfetto, participle, future AND infinitive (parla ⊂ parlando / parlava / parlato / parlare; prende ⊂ prenderà / prendere), and positive `any_phrases` matches win over `must_not_include`, so a 3sg item's wrong-tense attempts can self-credit. My programmatic collision audit caught three such items in draft; they were reworked (3pl for the phone item; -ire verbs for the si-impersonal singulars, whose 3sg in -e has no superstring among plausible attempts except the gerundio). Raised as `inter_chat/Architecture_PresentUsageAuthor_3sg_superstring_hazard.md` since it bites every future usage/discrimination author whose traps are wrong-tense forms.

## Items flagged uncertain (for the project author to rule on)

1. **iniziano as full synonym (pu_hab_02).** The cue gives cominciare, but iniziano is accepted at full credit since the usage skill is identical. Flag if you want cue-lemma answers only.
2. **"Sono affamato e assetato" at full credit (trans_pu_en_it_state_01).** Grammatical but marked (nearer "starving and parched"); I gave full credit with a steering explanation, reading your ruling's "merely-our-target" arm as covering it. Downgrade to ≈0.8 if you want the idiom nudged the way the progressive is.
3. **Instruction translation accepts three voices (trans_pu_en_it_instr_01).** "You add the salt at the end" is rendered acceptably as si-impersonal, tu, or voi, since real recipes use all three. If you'd rather the item force the si-impersonal, the source needs a register cue (criterion 11) and I'd rather not signpost; my preference is to leave all three credited.
4. **Residual substring risks accepted** (each documented in its item's examiner_note): leggo ⊂ leggono, ha ⊂ hanno, serve ⊂ servendo. All require an implausible attempt to bite.

## Notes for the architect on merge

- The four usage leaves and the usage aggregate carry `"stub": true` in `data/buckets/verb_form.present_indicative.json`; clearing those flags on merge is yours.
- Per the dispatch, these are staging files; the formation topic files are untouched.
- Nothing in this batch touches the choice-based present uses (present-for-near-future, da-durative, historical present); everything that smelled of "present vs another tense" was left for TenseChoice, per the dispatch's do-not-drift instruction.
- The dispatch's own note stands: the meatier usage dispatches to prep next are future-of-probability, conditional politeness/reportage, and the subjunctive triggers.
