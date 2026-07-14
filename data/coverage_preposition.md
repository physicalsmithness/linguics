# Coverage: Prepositions

Batch delivered by PrepositionAuthor, 2026-07-14, against AUTHOR_BRIEF Revision 13 (dispatch was written against Rev 11; the newer criteria applied: terse-label awareness, criterion 17 English glosses throughout).

**Files**: `grammar_questions_preposition.json` (82 items, counted from file), `translation_items_preposition.json` (24 items: 18 en→it, 6 it→en), `bucket_suggestions_preposition.json` (3), `glossary_suggestions_preposition.json` (2).

## Bucket-to-item counts (markpoint citations, from file)

| Bucket | Grammar markpoints | Translation required |
|---|---|---|
| The eight forms | 6 | 0 |
| Combining preposition + article | 13 | 1 |
| Partitive 'some' | 4 | 2 |
| Prepositions of place | 8 | 3 |
| Prepositions of time | 9 | 6 |
| Motion: destination and origin | 5 | 4 |
| Means and manner | 5 | 2 |
| Verbs taking a + infinitive | 6 | 0 |
| Verbs taking di + infinitive | 5 | 0 |
| Verb + preposition + object | 5 | 0 |
| Uses of di | 6 | 3 |
| Special uses of da | 6 | 5 |
| a vs in for places | 3 | 0 |
| di vs da | 3 | 1 |


Weighting follows the dispatch: Verb + preposition heaviest (16 items across the a-family, di-family and object-governed patterns), Prepositions of place and of time next, The eight forms kept light. Combining preposition + article covers the full contracting paradigm (di/a/da/in/su against il/lo/l'/la/i/gli/le) formation-cued, plus one in-context item and one con-does-not-contract item.

## Marker-safety note (engine-specific, matters most for this topic)

Every markpoint is full-phrase (preposition + following word): bare `a`, `di`, `in`, `del` are unsafe under the substring engine (`del` sits inside `dello`; `a` inside almost anything). The audit script verified no any_phrase is a substring of a must_not_include entry on the same markpoint. Six benign containments run the other way (e.g. must_not `a Marco` inside any `da Marco`); these are safe because positive matches are checked first.

## Items flagged uncertain

- **prep_mm_03** (con la chiave): `a chiave` in must_not_include is right here, but `chiudere a chiave` (to lock) is a fixed idiom; if a reviewer thinks the proximity confuses, swap the sentence away from doors and keys.
- **prep_t_02** (all'una): accepts both `all'una` and `all' una` to be safe around apostrophe-adjacent whitespace; depends on norm() behaviour with apostrophes, worth one engine spot-check.
- **prep_pl_06 vs prep_vg_obj_05**: the two multi-markpoint items treat the contraction markpoint differently (obj_05 credits either preposition's contraction; pl_06 deliberately does not credit `agli`). Each choice is argued in its examiner_note; a reviewer may prefer one policy uniformly.
- **prep_mm_01 / trans mm ref**: `con il treno` / `col treno` graded 0.9 as colloquial-but-current under the standard-variant policy; bare `con treno` stays the punished miss. If the 0.9 feels generous, these are the items to tighten.
- **prep_di_02 / prep_di_04**: register variants (`in legno` 0.9 catalogue-style; `sulla storia` 1.0) are judgement calls recorded in the phrase notes.
- **prep_af_01..09** (fragment prompts): explanations use criterion 17's fragment form (gloss the target: "del pane = of/some of the bread") rather than a sentence quote; an automated opens-with-quote check will flag them, correctly-but-harmlessly.

## Flags for Architecture (not fixed here; not my artefacts to edit)

1. **Tree seam, place vs da-special**: `usage.place`'s description claims "da with a person's place" and `usage.da_special` claims "at someone's (da Marco)". Both-ways coverage exists (prep_pl_05 homes motion-to/basic location in place; prep_da_05 homes the stative at-someone's in da_special), but the seam should be ruled on before the Misconception pass tags across it.
2. **Partitive label leaks**: the leaf label "del / della as 'some'" hands the answer to any partitive item pre-answer. Per the Rev 12 terse-label rule this wants a label fix at tree level (e.g. "Partitive 'some'"); until then all four partitive items carry `info_display: "suppress"` as the per-item stopgap.
3. **Small islands**: prep_disc_ai_03 (a Capri / in Sicilia) extends the a-vs-in leaf slightly beyond its town-vs-country description; the size-class line through the islands is standard teaching and I judged it in-scope for B2, but the leaf description could absorb it explicitly.
4. **Bucket suggestions**: three children proposed under Verb + preposition (a-family, di-family, object-governed); see rationale in the suggestions file. Items cite the existing parent, so ratification is not load-bearing for this batch.

## Notes for the next dispatch

- The negative-drops-partitive rule (non ho pane, not *non ho del pane) has no home and no items; consider a bucket when the partitive leaf next gets attention.
- Verb-governed verbs deliberately left for a second wave: andare a trovare, mettersi a, credere in, dipendere da, contare su, fidarsi di. The da-family after verbs (dipendere da) has zero coverage in this batch.
- it→en is deliberately the minority direction (6 of 24): preposition choice is a production skill; the it→en items are reserved for meaning-bearing reads (da-durative to perfect progressive, da-purpose vs di-contents, di vs da identity).

## Second touch, 2026-07-14 (same day; after Architecture batch review v1)

24 items bumped to version 2. What changed:

- **Verb-governed migration done**: all 16 items now cite the ratified children (Verbs taking a + infinitive: 6, Verbs taking di + infinitive: 5, Verb + preposition + object: 5, plus prep_vg_obj_05's second markpoint staying on Combining preposition + article). The counts table above reflects the split.
- **Partitive suppressions lifted** (4 items): the leaf label is now terse at source ("Partitive 'some'"), so the breadcrumb no longer leaks and visible is better.
- **all'una simplified** to a single any_phrase; norm() folds apostrophes to spaces, so the whitespace variant was redundant (Architecture, batch review v1).

**Leftward superstring audit** (prompted by the PresentUsageAuthor 3sg finding): this topic's variant is that a-phrases sit inside da-/fra-/tra-phrases and alle inside dalle, so a plausible wrong attempt can contain the correct phrase and false-credit under positive-first matching. 22 candidates audited; 3 were genuinely exposed and are reframed at v2:

- prep_t_01: cominciare → finire ('comincia dalle nove' is producible Italian; 'finisce dalle nove' is not).
- prep_t_04: school-closing frame → birthday frame ('chiudono da giugno' = since-June was producible).
- prep_pl_01: the stem's own 'da tre anni' primed a da-answer; family frame de-primes it.
- prep_t_02: 'in punto' added as a frame guard against a from-one reading.

Residual candidates judged implausible in-frame and left as authored (documented so the next touch doesn't re-litigate): prep_vg_a_* (no English pull to da before an infinitive), prep_vg_obj_01 ('penso da te' has no source-language driver), prep_pl_05 (the blend 'da casa di Marco' would credit, but the blend demonstrates the at-someone's da rather than missing it), prep_sf_06 ('da Maria' cross-contamination from the personal-da items is conceivable but the give-to frame doesn't invite it), fragments and choice items (the preposition is supplied or the choice is binary).

Flags 1-4 from the first-touch section above are all actioned by Architecture (seam ruled for da_special, partitive label fixed, islands absorbed, children ratified); kept for the record.

## Third touch, 2026-07-14 (independent review pass)

An independent reviewer went through all 106 items (Italian correctness, explanation claims, alternative-answer handling, anti-anchor validity). 17 grammar items and 2 translation items edited; versions bumped per item. Substance:

- **Two blockers fixed, both motion items with unanchored frames.** prep_mo_03: 'arriva a Madrid alle sei' was fully correct Italian falling through unmatched; now English-anchored to the origin reading. prep_mo_05: 'partiamo da Parigi' was correct Italian that substring-matched must_not 'a Parigi' and got the false a-for-destination diagnostic; now anchored, with the must_not word-anchored. This is the third hazard direction: a must_not entry contained in a plausible CORRECT alternative (the first two being any-inside-listed-wrong and any-inside-plausible-wrong).
- **Word-anchoring adopted for exposed 'a + noun' must_nots** (prep_sf_05, prep_mm_03, prep_pl_04, prep_t_03, plus the two motion items): any preceding word ending in -a can wrongly trigger a bare 'a X' must_not ('dentro la macchina' contains 'a macchina'). Per-phrase match_at "word" (in the engine since 2026-07-13) is the cheap guard.
- **Partitive dodge policy aligned across pt_01..04**: fully correct alternatives (un po' di X, alcuni/alcune X) now uniformly accepted at 0.9 with an explaining note, instead of 1.0 in pt_01 and silent zero in the siblings. This stretches the 0.9 standard-variant policy from register-marked variants to correct-but-dodges-the-drilled-pattern; raised with Architecture in the batch-review thread (v3) for ratification or reversion to 1.0.
- **Elided d' parity**: d'aiuto and d'una added as accepted phrases (apostrophes fold to spaces in norm(), so the elided forms did not contain the plain positives and were scoring worse than uncontracted forms).
- **prep_vg_obj_05 aligned with prep_pl_06**: uncontracted 'di il nuovo' now credits the di-choice markpoint.
- **Two translation fixes**: 'tavolo di cucina' → 'tavolo da cucina' (type-label is purpose-da; the old note contradicted the module's own da_special teaching); the 'treno di Napoli' anti-anchor replaced ('il treno di Napoli' is attested colloquially, so the item now uses venire, after which the di form is unambiguously wrong).
- **Stale vocab_help from the v2 reframes fixed** (prep_t_01 glossed cominciare while the frame used finisce; prep_t_04 glossed a verb no longer present).
- **Two explanation absolutes softened** (a cavallo also takes a; coi survives alongside col).
- **Documented, deliberately unfixed**: unanchored frames whose alternative correct completions fall through silently with no false diagnostic (prep_pl_07 'dall'Italia', prep_t_08 'entro dieci minuti', prep_da_04 'Quando ero bambino'); silent fall-through on a dodge is house-accepted, false diagnostics are not. Three translation items carry no negative reference by design (not every item needs an anti-anchor).

## Fourth touch, 2026-07-14 (conformance to AUTHOR_BRIEF Rev 16/17)

Both points this seat had open are ruled in Rev 17: ruling (ii) ratifies the criterion 18 amendment (must_not entries must not be substrings of plausible correct attempts) and ruling (iv) ratifies 0.9-for-dodges, so the partitive grading stands as authored. Conformance applied same-day:

- **Ruling (iii), candidate_forms on non-tense discriminations**: all six discrimination items now carry `candidate_forms` (["a","in"] / ["di","da"]) + `correct_form`, semantics identical to candidate_tenses (post-answer tick, per-context stats, suppress already set). Versions bumped.
- **Partitive dodge notes** re-cited from "policy question raised" to the ratified rule.
- **Criterion 19 (Rev 16, accent as morpheme) exposure check**: one accented accepted phrase in the batch (da tè, prep_disc_dida_03). The stripped twin da te (at your place) is not a plausible alternative answer to a teacup frame, so per criterion 19's second branch no accent_load_bearing flag is set; the fold-rescue + orthography flag is the right verdict for a learner omitting the accent.
- **Not revisited**: the v2 leftward reframes (t_01, t_04, pl_01) predate the per-phrase match_at knowledge and remain as reframes; reframing removed the ambiguity at source and Rev 15's anchoring default is the alternative, not a correction. The documented implausible-in-frame set stays as documented.

## Fifth touch, 2026-07-14 (dodge-boundary regrades)

Architecture's thread v5 stated the ruling-iv boundary: 0.9 is for answers that AVOID the drilled pattern; answers that demonstrate the skill by other means stay 1.0. Two graded acceptances were on the wrong side and are regraded to 0.9: a casa di Marco (prep_pl_05; avoids personal-da) and sulla storia (prep_di_04; avoids di-for-topic). All other 1.0 alternatives verified to show their markpoint's skill (della politica, di il nuovo, in gli Stati, a/in giugno, tra/fra); register-variant 0.9s unaffected. Thread closed at v6.
