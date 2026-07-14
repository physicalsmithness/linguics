# Coverage: Relative pronouns (`relative_pronoun`)

Authored by RelativePronounAuthor against AUTHOR_BRIEF **Revision 13**, reconciled the same day to **Revision 16** (see 'Rev 15/16 reconciliation' below) (criterion 17 English glosses included throughout, terse-label rule respected) and DISPATCH_relative_pronoun.md. Counts below are grepped from the shipped files, not from memory of batches.

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

## Rev 15/16 reconciliation (same day; batch was authored against Rev 13)

The brief moved twice after this batch shipped. Self-audit against both, all changes re-verified by the harness (66 regression cases + mechanical superstring sweep):

- **Criterion 18 (superstring safety).** The plausible-attempt standard is wider than the first pass's must_not_include-based audit and surfaced two real exposures: `chi` embeds in a plausible near-right *chiunque* (now anchored; chiunque falls to a silent miss rather than credit or a harsh wrong-flag) and `dice` embeds rightward in *diceva/dicevano* (now anchored). Anchoring was then made uniform across the batch (bullet above).
- **Criterion 10a fallout on `rel_chi_04`.** Auditing dice/diceva exposed a tense ambiguity: without a time frame, "Chi diceva queste cose..." was a legitimate reading the item did not accept. The prompt now carries *oggi* to pin the present, and the imperfect forms sit in must_not_include per 10b.
- **Criterion 19 (accent as morpheme).** No answer in this batch has an accent-stripped twin that is a plausible alternative answer, so no `accent_load_bearing` flags. One alignment fix: the neuter items had been explicitly accepting `cio che` at full credit, which silently bypassed the engine's accent-fold rescue and lost the orthography-miss record. `cio che` is delisted; the folded path now credits it while recording the accent slip, per criterion 19's non-load-bearing verdict.
- **Residual sweep output, by design:** word-anchored `che` still matches inside attempts like *tutto che* / *cosa che*, where che is a standalone word. Word-level containment is the same engine philosophy that credits full-clause answers; not blockable by anchoring and not treated as an exposure. Implausible-attempt containments (anche, checché, dovevo) are closed by the uniform anchoring.
- **Rev 14 house techniques** were not retrofitted; noted for the next relative_pronoun dispatch.
- The seven-batch retro-audit that accompanied Rev 15 did not include relative_pronoun (file mtimes show no external edits); this section is the equivalent audit, done author-side.

## Authoring decisions worth review

- **dove / in cui / nella quale cross-credited at 1.0** on dove items (all standard for place); the leaf's diagnostic guard is che-for-place. Conversely the in-cui grammar item uses a manner antecedent (il modo) so dove is a catchable wrong answer, not a valid alternative.
- **preposition + il quale items cue the family** (e.g. `(per + quale)`) so that agreement is the tested skill; the equally-correct cui forms are cue-misses and deliberately NOT in `must_not_include`.
- **il quale on the disambiguation items** is forced by a bracketed meaning note in the prompt ("it is the sister who studies there") — meaning, not rule, per criterion 5/13.
- **Neuter items pick matrix verbs (piacere etc.) where `cosa` is ungrammatical**, so the indirect-question reading is a catchable miss, except the translation item, where `cosa hai detto` after capire is fully correct and is a positive reference.
- **`rel_disc_cheilq_02` marks a stylistic miss**: il quale where plain che is natural is caught as wrong per the dispatch ("do not push learners toward il quale"), with the explanation stating explicitly that it is stiffness, not ungrammaticality.
- **info_display: suppress on 40/42 items** (grepped, correcting an earlier from-memory count of 37/41): wherever the blank IS the relative, the breadcrumb names the answer, and all discrimination items per criterion 15. The two visible items are the chi singular-verb pair `rel_chi_03` / `rel_chi_04` (blank is the verb) — kept visible since the chi-label tempts nothing and restates what the sentence shows.
- **Uniform anchoring policy (supersedes the selective first pass): every any_phrase in the batch carries `match_at: "word"`** - 63 phrase entries across all 42 items (grepped) - plus the four short closed-class must_not_include forms che/cui/chi/cosa (44 entries), which could otherwise false-fire inside longer words. Word-anchoring a whole-word answer is zero-cost (it can never reject a legitimate word-bounded attempt) and keeps mechanical criterion-18 sweeps clean.

## Items flagged uncertain

- `trans_rel_en_it_ilq_clar_01`: the disambiguation instruction rides inside the source_text in brackets; if the housing renders source_text verbatim to learners this is fine, but if it feeds the AI marker as target content the bracket needs stripping. Worth one look from Housing.

## For the next dispatch / Architecture

- `bucket_suggestions_relative_pronoun.json` NOT produced: the supplied tree covered everything authored; no new buckets needed.
- `glossary_suggestions_relative_pronoun.json` proposes: relative pronoun, antecedent, relative clause, invariable.
- `data/manifest.json`: `relative_pronoun` added to topics (loader auto-discovers the two item files from there), per the manifest's own comment. Flagged in-chat for pushback since authors do not normally touch shared files.
- No engine ask remains: the match_at anchoring this batch needed already shipped (2026-07-13). One documentation errata instead: AUTHOR_BRIEF Rev 13 still describes `match_at` as "optional, future engine extension... support is partial" and as a markpoint-level field, but the shipped implementation reads it per-phrase (object-form entries in any_phrases / must_not_include) and supports start/end/word. Worth correcting at the brief's next revision so authors reach for it instead of padding answers.
- Misconception tagging (registry is Architecture-owned) not attempted; the wrong-tense/wrong-relative entries in `must_not_include` are ready for Phase-3 misconception attribution.
