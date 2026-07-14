# Coverage: Relative pronouns (`relative_pronoun`)

Authored by RelativePronounAuthor against AUTHOR_BRIEF **Revision 13** (criterion 17 English glosses included throughout, terse-label rule respected) and DISPATCH_relative_pronoun.md. Counts below are grepped from the shipped files, not from memory of batches.

## Bucket-to-item counts

| Bucket (label) | Grammar | Translation (required) |
|---|---|---|
| che as subject | 4 | 1 |
| che as direct object | 4 | 2 |
| preposition + cui | 6 | 3 |
| il cui (whose) | 5 | 2 |
| il quale to disambiguate | 3 | 1 |
| preposition + il quale | 4 | 1 |
| chi (the one who, whoever) | 4 | 2 |
| quello che / ciò che (what) | 4 | 2 |
| dove (relative where) | 3 | 1 |
| che vs cui (discrimination) | 3 | 0 |
| che vs il quale (discrimination) | 2 | 0 |
| **Totals** | **42** | **15 items** |

Translation column counts required-bucket citations; several items also cite optional buckets in sibling trees (imperfect, passato prossimo essere-auxiliary).

Rule-internalisation check, per the content-authoring criterion: every relative is hit from at least three angles (fill-the-blank production, discrimination choice or trap in `must_not_include`, and translation in at least one direction). che gets the heaviest load as the workhorse; preposition + cui and il cui carry extra items as the high-value error-prone leaves; chi is drilled on both selection (no antecedent) and its singular-verb rule; the neuter is drilled subject-side, object-side, and after tutto.

## Marker-safety rulings (REVISED after Smith's review, same day)

Engine semantics: `any_phrases` is checked BEFORE `must_not_include` (positive match wins) and matching is substring-based after normalisation. The first version of this report treated that as immovable and worked around it. Wrongly: **word-boundary anchoring already exists** - `match_at: "start" | "end" | "word"` on object-form phrase entries shipped 2026-07-13 (see `inter_chat/Architecture_Housing_marker_match_at_and_apocope.md`, CLOSED, verified with a 20-case harness; anchoring is honoured in the positive path, the accent-folded fallback, and must_not_include). The batch now uses it:

1. **`match_at: "word"` on every contamination-prone phrase.** `a cui` (inside wrong `da cui` / `la cui`), `alla quale` (inside `dalla quale`), and the whole possessive family `il/la/le/i cui` (inside `di cui`, `alla cui`, `delle cui`) are anchored, so those wrong forms now fall through to `must_not_include` and record a correctly-attributed miss instead of false credit. The da/dalla forms were added to `must_not_include` for clean evidence strings.
2. **`i cui` is markable after all; coverage restored.** New item `rel_cui_poss_05` (la regista i cui film - feminine owner, masculine plural possessed, the sharpest agreement clash) re-instates the masculine-plural-possessed case the first pass had exiled to the translation strand. The translation item stays as cross-strand reinforcement.
3. **Singular-verb chi items keep non-prefix verbs** (vuole/vogliono, dice/dicono) - correct with or without anchoring; future items may use prefix verbs (arriva/arrivano) by anchoring instead.
4. **Literary bare `cui` (= a cui) still deliberately uncredited** at B1; by check order it falls to a silent miss, noted on `rel_cui_prep_03`.

Verified by a Python harness mirroring `norm()` + `occursAt()` + the marking order: 42 attack/regression cases (da cui, dalla quale, di cui, alla cui, delle cui, perché, full-clause attempts, plus spot-checks on untouched items), all passing.

## Authoring decisions worth review

- **dove / in cui / nella quale cross-credited at 1.0** on dove items (all standard for place); the leaf's diagnostic guard is che-for-place. Conversely the in-cui grammar item uses a manner antecedent (il modo) so dove is a catchable wrong answer, not a valid alternative.
- **preposition + il quale items cue the family** (e.g. `(per + quale)`) so that agreement is the tested skill; the equally-correct cui forms are cue-misses and deliberately NOT in `must_not_include`.
- **il quale on the disambiguation items** is forced by a bracketed meaning note in the prompt ("it is the sister who studies there") — meaning, not rule, per criterion 5/13.
- **Neuter items pick matrix verbs (piacere etc.) where `cosa` is ungrammatical**, so the indirect-question reading is a catchable miss, except the translation item, where `cosa hai detto` after capire is fully correct and is a positive reference.
- **`rel_disc_cheilq_02` marks a stylistic miss**: il quale where plain che is natural is caught as wrong per the dispatch ("do not push learners toward il quale"), with the explanation stating explicitly that it is stiffness, not ungrammaticality.
- **info_display: suppress on 40/42 items** (grepped, correcting an earlier from-memory count of 37/41): wherever the blank IS the relative, the breadcrumb names the answer, and all discrimination items per criterion 15. The two visible items are the chi singular-verb pair `rel_chi_03` / `rel_chi_04` (blank is the verb) — kept visible since the chi-label tempts nothing and restates what the sentence shows.
- **13 phrases across 12 items carry `match_at: "word"`** (grepped): a cui ×2, alla quale ×2, i cui, il cui ×2, il quale, la cui, la quale ×3, le cui — every phrase with a containing wrong form, including the clarity items where della/alla quale are conceivable attempts.

## Items flagged uncertain

- `trans_rel_en_it_ilq_clar_01`: the disambiguation instruction rides inside the source_text in brackets; if the housing renders source_text verbatim to learners this is fine, but if it feeds the AI marker as target content the bracket needs stripping. Worth one look from Housing.

## For the next dispatch / Architecture

- `bucket_suggestions_relative_pronoun.json` NOT produced: the supplied tree covered everything authored; no new buckets needed.
- `glossary_suggestions_relative_pronoun.json` proposes: relative pronoun, antecedent, relative clause, invariable.
- `data/manifest.json`: `relative_pronoun` added to topics (loader auto-discovers the two item files from there), per the manifest's own comment. Flagged in-chat for pushback since authors do not normally touch shared files.
- No engine ask remains: the match_at anchoring this batch needed already shipped (2026-07-13). One documentation errata instead: AUTHOR_BRIEF Rev 13 still describes `match_at` as "optional, future engine extension... support is partial" and as a markpoint-level field, but the shipped implementation reads it per-phrase (object-form entries in any_phrases / must_not_include) and supports start/end/word. Worth correcting at the brief's next revision so authors reach for it instead of padding answers.
- Misconception tagging (registry is Architecture-owned) not attempted; the wrong-tense/wrong-relative entries in `must_not_include` are ready for Phase-3 misconception attribution.
