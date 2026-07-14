# Coverage: Relative pronouns (`relative_pronoun`)

Authored by RelativePronounAuthor against AUTHOR_BRIEF **Revision 13** (criterion 17 English glosses included throughout, terse-label rule respected) and DISPATCH_relative_pronoun.md. Counts below are grepped from the shipped files, not from memory of batches.

## Bucket-to-item counts

| Bucket (label) | Grammar | Translation (required) |
|---|---|---|
| che as subject | 4 | 1 |
| che as direct object | 4 | 2 |
| preposition + cui | 6 | 3 |
| il cui (whose) | 4 | 2 |
| il quale to disambiguate | 3 | 1 |
| preposition + il quale | 4 | 1 |
| chi (the one who, whoever) | 4 | 2 |
| quello che / ciò che (what) | 4 | 2 |
| dove (relative where) | 3 | 1 |
| che vs cui (discrimination) | 3 | 0 |
| che vs il quale (discrimination) | 2 | 0 |
| **Totals** | **41** | **15 items** |

Translation column counts required-bucket citations; several items also cite optional buckets in sibling trees (imperfect, passato prossimo essere-auxiliary).

Rule-internalisation check, per the content-authoring criterion: every relative is hit from at least three angles (fill-the-blank production, discrimination choice or trap in `must_not_include`, and translation in at least one direction). che gets the heaviest load as the workhorse; preposition + cui and il cui carry extra items as the high-value error-prone leaves; chi is drilled on both selection (no antecedent) and its singular-verb rule; the neuter is drilled subject-side, object-side, and after tutto.

## Marker-safety rulings made while authoring (substring engine)

These follow from the engine semantics: `any_phrases` is checked BEFORE `must_not_include` (positive match wins) and matching is substring-based after whitespace-collapsing normalisation.

1. **`i cui` is unmarkable as a graded answer.** `i cui` is a substring of `di cui`, so the commonest possessive miss (di cui for whose) would be silently CREDITED. No grammar item requires `i cui`; masculine-plural-possessed coverage lives in the translation strand instead (`trans_rel_it_en_poss_01`, AI-marked). The grammar leaf covers il cui / la cui / le cui, all substring-safe against di cui.
2. **Singular-verb chi items avoid prefix verbs.** `arriva` sits inside `arrivano`, so the plural miss would be credited; the shipped items use volere (vuole/vogliono) and dire (dice/dicono), where singular is not a substring of plural.
3. **`a cui` and `alla quale` are suffix-contaminated by `da cui` / `dalla quale`.** A wrong da-form contains the correct a-form as a substring and would be falsely credited. Judged low-likelihood on the shipped items (context or cue makes da implausible) and noted in each item's examiner_note, but a `match_at: "start"` anchor (mirror of the existing `match_at: "end"`) would close it properly. **Open question for Architecture/Housing.**
4. **Literary bare `cui` (= a cui) is not credited** on preposition + cui items; by check order it falls through to a silent miss rather than a wrong-flag. Deliberate at B1; examiner_note on `rel_cui_prep_03`.

## Authoring decisions worth review

- **dove / in cui / nella quale cross-credited at 1.0** on dove items (all standard for place); the leaf's diagnostic guard is che-for-place. Conversely the in-cui grammar item uses a manner antecedent (il modo) so dove is a catchable wrong answer, not a valid alternative.
- **preposition + il quale items cue the family** (e.g. `(per + quale)`) so that agreement is the tested skill; the equally-correct cui forms are cue-misses and deliberately NOT in `must_not_include`.
- **il quale on the disambiguation items** is forced by a bracketed meaning note in the prompt ("it is the sister who studies there") — meaning, not rule, per criterion 5/13.
- **Neuter items pick matrix verbs (piacere etc.) where `cosa` is ungrammatical**, so the indirect-question reading is a catchable miss, except the translation item, where `cosa hai detto` after capire is fully correct and is a positive reference.
- **`rel_disc_cheilq_02` marks a stylistic miss**: il quale where plain che is natural is caught as wrong per the dispatch ("do not push learners toward il quale"), with the explanation stating explicitly that it is stiffness, not ungrammaticality.
- **info_display: suppress on 37/41 items** — wherever the blank IS the relative, the breadcrumb names the answer, and all discrimination items per criterion 15. The four visible items are the chi singular-verb pair (blank is the verb) — kept visible since the chi-label tempts nothing and restates what the sentence shows.

## Items flagged uncertain

- `rel_cui_prep_03` (a cui): da-contamination, see ruling 3.
- `rel_ilq_prep_03` (alla quale): dalla-contamination, same class.
- `trans_rel_en_it_ilq_clar_01`: the disambiguation instruction rides inside the source_text in brackets; if the housing renders source_text verbatim to learners this is fine, but if it feeds the AI marker as target content the bracket needs stripping. Worth one look from Housing.

## For the next dispatch / Architecture

- `bucket_suggestions_relative_pronoun.json` NOT produced: the supplied tree covered everything authored; no new buckets needed.
- `glossary_suggestions_relative_pronoun.json` proposes: relative pronoun, antecedent, relative clause, invariable.
- `data/manifest.json`: `relative_pronoun` added to topics (loader auto-discovers the two item files from there), per the manifest's own comment. Flagged in-chat for pushback since authors do not normally touch shared files.
- `match_at: "start"` proposal above is the one engine ask.
- Misconception tagging (registry is Architecture-owned) not attempted; the wrong-tense/wrong-relative entries in `must_not_include` are ready for Phase-3 misconception attribution.
