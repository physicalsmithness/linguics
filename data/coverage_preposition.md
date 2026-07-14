# Coverage: Prepositions

Batch delivered by PrepositionAuthor, 2026-07-14, against AUTHOR_BRIEF Revision 13 (dispatch was written against Rev 11; the newer criteria applied: terse-label awareness, criterion 17 English glosses throughout).

**Files**: `grammar_questions_preposition.json` (82 items, counted from file), `translation_items_preposition.json` (24 items: 18 en→it, 6 it→en), `bucket_suggestions_preposition.json` (3), `glossary_suggestions_preposition.json` (2).

## Bucket-to-item counts (markpoint citations, from file)

| Bucket | Grammar markpoints | Translation required |
|---|---|---|
| The eight forms | 6 | 0 |
| Combining preposition + article | 13 | 1 |
| del / della as 'some' | 4 | 2 |
| Prepositions of place | 8 | 3 |
| Prepositions of time | 9 | 6 |
| Motion: destination and origin | 5 | 4 |
| Means and manner | 5 | 2 |
| Verb + preposition | 16 | 4 |
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
