# Coverage: Piacere (`piacere`)

Authored by PiacereAuthor against AUTHOR_BRIEF, and reconciled to **Revision 16** after the brief advanced mid-session (criterion 17 English glosses throughout; criterion 15 breadcrumb suppression applied; criterion 18 superstring safety, all markpoints word-anchored; criterion 19 accent-as-morpheme, N/A here; terse markpoint labels), plus DISPATCH_piacere.md and the 2026-07-14 commit ruling (piacere committed, boundary rulings, "a me mi piace" graded 0.5). Counts are grepped from the shipped files, not from memory of batches.

## Bucket-to-item counts

| Leaf (label) | Grammar | Translation (required) |
|---|---|---|
| Piace or piacciono? (agreement) | 5 | 2 |
| Piace + infinitive | 3 | 1 |
| Who likes it (experiencer clitic) | 4 | 1 |
| A Marco piace (a-phrase experiencer) | 4 | 1 |
| Past: mi è piaciuto | 5 | 2 |
| The 'I like' trap (subject flip) | 3 | 5 |
| Mi piaci (liking people) | 3 | 2 |
| Anche a me (agreeing responses) | 4 | 2 |
| Dispiacere is not 'to dislike' | 3 | 2 |
| Verbs that work like piacere (family) | 4 | 2 |
| **Totals** | **38** | **20 items** |

Direction: 14 EN→IT, 6 IT→EN. CEFR spread across grammar: 15 A1, 15 A2, 8 B1. `info_display: "suppress"` on all 38 grammar items (see below).

## Rule-internalisation check (per the content-authoring criterion)

Every leaf is hit from at least three angles: fill-the-blank production, the wrong form as a `must_not_include` trap, and translation in at least one direction. The diagnostic heart carries the deepest load. The subject flip is drilled as EN→IT production (three grammar plus four translations), as IT→EN recognition (one), and as the standing trap (`io piaccio` / `tu piace`) in the flip items. Agreement is drilled singular and plural, with clitic and a-phrase experiencers, with distance between verb and liked noun, and with the plural-experiencer / singular-liked bait (`ci piace la montagna`). The past is split into two markpoints (essere choice, then participle agreement) and covers all four gender-number participles (piaciuto, piaciuta, piaciuti, piaciute). The family verbs are kept modest and B1-weighted, with mancare's direction flip (`mi manchi` for "I miss you", catching `ti manco`) foregrounded as the sharpest test that the flip has really landed.

## Marker-safety rulings (substring engine)

The engine checks `any_phrases` before `must_not_include` (a positive match wins and cannot be overridden), and `norm()` collapses whitespace.

1. **Every phrase is word-anchored (`match_at: "word"`), per criterion 18, applied PER PHRASE.** The trigger case is `piace`, a prefix-substring of the cue word `piacere`: unanchored, a bare-infinitive answer would be credited for `piace`, and a negative guard cannot override a positive match. The same rightward risk runs through the batch (`mi piace` inside `mi piaceva`, `ti piace` inside `ti piaceva`) and the leftward risk through the short clitics and a-phrases (`le` inside `delle`, `a marco` inside `da marco`). Anchors sit on object-form entries in both `any_phrases` (49) and `must_not_include` (98), matching the relative_pronoun and existential reconciliations. This supersedes the `match_at: "end"` the first draft used.
   - **Near-miss worth recording.** This batch first applied `match_at` at *markpoint* level, following the brief's §2 markpoint-fields bullet. The engine reads it per phrase and **ignores a markpoint-level key**, so all 43 anchors were inert while looking compliant to both a reviewer and a JSON audit. Caught by reading `inter_chat/Architecture_RelativePronounAuthor_brief_match_at_errata.md`, whose v2 flags that the same §2 bullet now contradicts criterion 18 inside one document. Corroboration logged in `inter_chat/Architecture_PiacereAuthor_delivery_and_match_at_level.md`.
   - **Past auxiliary reworked to be word-anchorable.** The essere markpoint originally matched the stem `è piaciut`, which cannot be word-anchored. It now matches the auxiliary word itself, `è` / `sono` (word-anchored, so `è` is safe as a standalone token) against the avere forms `ha` / `hanno` / `hai` / `ho` in `must_not_include`. This gives the same essere-versus-avere decomposition as before and a cleaner split from the participle markpoint: a learner who writes `mi ha piaciuto` misses the auxiliary but still hits the participle-agreement markpoint if the ending is right.
   - **Criterion 19 (accent as morpheme) considered, not needed.** The only accents in play are `è` (the do-nothing `e`-for-`è` case, since `e piaciuto` is not a candidate answer) and `sì` in `a me sì` (`a me si` is not a candidate answer either), so no `accent_load_bearing` flag is set.
2. **The "a me mi piace" 0.5 is only reachable if plain `mi piace` is not accepted in the same markpoint.** Because `mi piace` is a substring of `a me mi piace` and positive-match-wins, accepting `mi piace` at 1.0 would credit the doubling at 1.0 and the 0.5 ruling would never fire. So `pia_aphr_03` requires the stressed form, accepts `a me piace` (1.0) and `a me mi piace` (0.5), and does not accept bare `mi piace`; the prompt explicitly asks for the stressed person form, and the explanation names plain `mi piace` as the other standard option. `a me piace` is not a substring of `a me mi piace`, so the graded entry is reachable.
3. **`neanche a me` contains `anche a me`.** The correct negative-agreement reply is credited first by positive-match-wins; `anche a me` in `must_not_include` fires only on a wrong-polarity reply.
4. **`mi piace` and `mi piaci` are not substrings of each other** (they differ at the final letter), so the liking-people items catch the thing-form miss (`mi piace` for a person) without endangering the correct answer.
5. **`dispiace` is not a substring of `non mi piace`,** so the false-friend production (`mi dispiace il pesce` for "I dislike fish") is caught cleanly on the dislike item.
6. **`must_not_include` carries no teaching note.** The dispatch worked example put explanatory notes inside `must_not_include` objects. Object-form entries there are real and now standard (that is where per-phrase `match_at` lives, per ruling 1), but a `note` is not a rendered field on the negative path, and `must_not_include` is checked after `any_phrases` in any case. So the "liked thing is the subject" teaching lives in the explanations (glossary-wrapped) and in examiner_notes, while the object form is used for anchoring only. Graded acceptance on `any_phrases` does carry a rendered note, which is where the "a me mi piace" register note sits.

## Authoring decisions worth review

- **Past split, and where the two markpoints attribute.** The essere-versus-avere choice attributes to `piacere.form.past`; the participle agreement cross-references the passato prossimo tree's with-essere gender-number leaves. This gives clean per-skill attribution and cross-links the trees, consistent with the 2026-07-14 deprecation that points the old pronoun leaf (`pronoun.indirect_object.verbs_taking_iop.with_essere_in_pp`) at `piacere.form.past`. If Architecture would rather keep both past skills inside the piacere tree, it would want new sub-leaves (a `piacere.form.past.auxiliary` and a `.participle_agreement`); flagged, not assumed.
- **`info_display: "suppress"` on all 38.** Every piacere leaf label names its own diagnostic (the flip, piace-vs-piacciono, the clitic set, the past pattern, the false friend), so the pre-answer breadcrumb would hand over the skill. Suppressed throughout, matching the imperativo batch's 37/37.
- **Direction.** Form leaves are production only (EN→IT plus grammar); usage leaves are bidirectional, with the IT→EN recognition weight on liking-people (`mi piaci`), dispiacere (`non mi dispiace` understatement), the family verbs, and one subject-flip reading.
- **"a me mi piace" graded 0.5** implemented per the 2026-07-14 ruling, as described in marker-safety point 2.

## Items flagged uncertain

- `pia_aphr_03` (a me mi piace): not accepting bare `mi piace` is deliberate (the prompt asks for the stressed form), but it is the one spot where a fully-correct standard answer sits outside the accepted set. Worth an Architecture eye on whether that is the right call, or whether the 0.5 ruling should instead ride on an AI-marked translation item.
- `pia_aphr_01` / `pia_aphr_04` (dropped-a catch via `must_not_include` on the bare name): fires only when the a is dropped; small residual risk that an unusual answer containing the name escapes. Examiner_notes record it.
- Word-anchoring (`match_at: "word"`) is applied per phrase to all 49 `any_phrases` and 98 `must_not_include` entries per criterion 18 (engine-supported, shipped 2026-07-13); no item-rework awkwardness remained after the past-auxiliary change.

## For the next dispatch / Architecture

- `bucket_suggestions_piacere.json`: **empty**. The supplied 13-node tree covered everything authored; no new buckets needed.
- `glossary_suggestions_piacere.json`: **empty**. The dispatch anticipated proposing `experiencer`, but it is already in glossary.json (version 3) and already scoped to the piacere family; every other term used in the explanations (indirect object pronoun, auxiliary, participle agreement, infinitive, stressed pronoun) is already present. `litotes` was kept out of learner-facing copy, so it is not proposed.
- `data/manifest.json`: **NOT edited.** piacere's first content batch has now landed (38 grammar + 20 translation), so the loader needs piacere added to discover the two item files. Left untouched to stay in role; the relative_pronoun landing added it and flagged for pushback. Awaiting a decision on who makes that edit.
- **Stale status line:** DISPATCH_piacere.md still opens "Status: DRAFT", but the 2026-07-14 commit ruling and its Rev 13 addendum show it validated and committed. Cosmetic.
- **Misconception axis:** the subject flip (`io piaccio`), mancare's direction flip (`ti manco`), and dispiacere-as-dislike are carried as `must_not_include` entries, ready for Phase-3 misconception attribution. The registry is Architecture-owned; tagging not attempted here.
