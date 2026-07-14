# Coverage: Si constructions (`si_constructions`)

Authored by SiConstructionsAuthor against AUTHOR_BRIEF **Revision 17** (criterion 17 English glosses throughout; criterion 18 in all three directions, uniform per-phrase match_at word; criterion 19 checked, does not bite; criterion 16 generalised via candidate_forms; the 0.9-for-dodges rule applied; terse-label and suppress rules applied) and DISPATCH_si_constructions.md. Counts below are derived from the shipped files, not from memory of batches.

## Bucket-to-item counts

| Bucket (label) | Grammar | Translation (required) |
|---|---|---|
| Si mangia bene (basic impersonal) | 6 | 3 |
| Si è stanchi (strange agreements, incl. ci si) | 9 | 2 |
| Si vendono libri (agreeing with the noun) | 8 | 4 |
| Passivante or impersonal? (when si agrees) | 6 | 2 |
| Affittasi, cercasi, vendesi (signs) | 4 | 2 |
| Which si is this? | 4 | 2 |
| **Totals** | **37** | **15 items** |

Grammar is weighted to the hot spots named in the dispatch: passivante agreement and the passivante/impersonal discrimination carry the most, the advanced agreements are hit quirk-by-quirk. Every grammar item except the three visible recognition MCQs is `info_display: "suppress"` (see decisions below).

## Rule-internalisation check

Per the content-authoring criterion, each rule is hit from several angles rather than to a target count.

- **Passivante agreement** (the hot spot) is drilled as: a same-surface opposite-answer pair (si vendono libri / si vende una bicicletta), a plural subject held far from the blank, a mass-noun bait that must stay singular (si raccoglie l'uva), a preverbal subject that still agrees (i vini bianchi si servono), coordination that forces the plural (si parlano sia...sia), and an explicit hand-off from the existential (ci sono... e si producono...). Both directions in translation, with a negative anchor on the singular slip.
- **Passivante vs impersonal** is drilled only as production choices where the learner must decide agree-or-not each time, alternating objectless singulars (si mangia bene, si vive, si dorme) against plural-object agreements (si mangiano gli spaghetti, si usano prodotti, si ripetono i gesti). The flagship trap si mangiano bene is the paired opposite of si mangiano gli spaghetti.
- **Impersonal advanced** hits each quirk from multiple angles: predicate adjective plural three times (stanchi, rilassati, curiosi), essere-auxiliary in compounds three times (si è parlato, si è lavorato/guadagnato), plural participle for essere-verbs (si è arrivati), one item combining participle-plural and adjective-plural at once, and two ci si items.
- **Basic impersonal** covers si + 3sg, the si può / si deve / non si sa patterns, and a two-verb item that resists the plural twice.
- **Usage** covers sign recognition (Vendesi, Cercasi as MCQ), sign production (Affittasi), the frozen-singular-with-plural nuance, and reading which si is which (impersonal, reflexive, context-decides passive, and the sì/si accent).

## Marker-safety rulings

Engine semantics confirmed from grammar_engine.js and norm.js this session: any_phrases is checked before must_not_include (positive match wins), matching is substring after norm(), and match_at is read per-phrase off object-form entries (not at markpoint level). norm() preserves accents in the primary path; the accent fold is only the typo-tolerance fallback.

1. **match_at: "word" on every positive short phrase (criterion 18, superstring safety).** The singular answer si cena is a substring of the wrong plural si cenano, so without anchoring a learner writing si cenano would be wrongly credited. Every impersonal and passivante positive (si cena, si vende, si vendono, si è parlato, etc.) is word-anchored per-phrase so the wrong number falls through to must_not and records a correctly attributed miss. No unanchored positive sits inside a plausible wrong attempt.
2. **Uniform match_at "word" on every must_not entry too (criterion 18, third direction).** Rev 17 added the rule that no must_not entry may be a substring of a plausible CORRECT attempt, since a false diagnostic is worse than false credit. All 56 must_not entries are now word-anchored. This genuinely fixes five prefix hazards (si mangia inside si mangiano; si usa, si conserva, si affitta, si parla likewise): word-anchoring stops them firing on the correct plural, verified by direct probe. Worth knowing: the engine reads match_at "start" as left-boundary-only, so "start" would NOT have protected these. "word" is the only correct anchor here.
   **Residual, flagged for a view:** two must_not entries are word-aligned substrings of their own correct answer, and no anchoring can separate them (si riposa inside ci si riposa; si accorge inside ci si accorge). They are safe only because grammar_engine.js consults must_not in an else-if chain, reached only when the positive and accent-folded passes both fail, and the correct answer always matches the positive. Kept because "you dropped the ci" is worth diagnosing; say if you would rather they go.
3. **A Python harness mirroring norm() + occursAt(word) + the positive-before-must_not order** runs over the contamination-prone items (si cena/cenano, si vende/vendono, ci si riposa/si riposa, si è parlato/ha parlato, si è arrivati/arrivato): correct answers credited, canonical wrong answers caught by must_not, no false credit. 28 cases, all pass.
4. **Criterion 19 (accent as morpheme, Rev 16) checked, does not bite.** The only accented answers here are the è in si è parlato / stati / arrivati and può; their accent-stripped forms (e, puo) are not alternative valid answers to the same prompt, which is the do-nothing case the criterion names. No accent_load_bearing flags needed.

## Authoring decisions worth review (largest first)

1. **si vende libri (agreement slip) kept as a flat must_not miss, not graded.** The dispatch worked example treats it as flat wrong, and I followed that. But the tree itself calls it "extremely common even among natives in speech", and sibling trees granted 0.5-with-register-note for comparable ubiquitous colloquial slips (a me mi piace; ha detto che veniva). If you want parity, this is an architecture-level graded-credit ruling to make, not mine to set; flagging rather than deciding. If ruled 0.5, the change is a one-line edit on nine items (six agreement, three discrimination), listed in the thread; the reverse over-correction stays flat on thirteen. Open thread: inter_chat/Architecture_SiConstructionsAuthor_graded_credit_parity.md (v1, OPEN).
2. **"Vendono libri" now scores 0.9, not a flat miss (Rev 17's 0.9-for-dodges).** "In quel negozio vendono libri usati" is correct Italian that simply sidesteps the si passivante the item drills, and the ratified rule scores that 0.9 with a steering note rather than wrong. Moved from must_not_include to a graded any_phrases entry on si_pass_agr_01. Ordering matters and is tested: the full si vendono entry is checked first, so a correct answer still scores 1.0 and is not caught by the 0.9 dodge entry.
3. **Suppression extended beyond the two dispatch-named leaves.** The dispatch names passivante.vs_impersonal and which_si for info_display: suppress. Following the leak-vs-trap test and the existential precedent (36/43 suppressed the same day), I also suppressed impersonal.basic, impersonal.advanced and passivante.agreement, whose labels name the number/agreement/construction the item tests. Left visible: the two sign-meaning MCQs and the sì/si accent MCQ, whose breadcrumbs don't reveal the English answer.
4. **ci si bucketed to impersonal.advanced now, with a proposed impersonal.ci_si leaf.** Nothing strict-rejects; migration is mechanical via the si_imp_cisi_ prefix. See bucket_suggestions.
5. **affittansi accepted at 0.8** on the sign item (older agreeing form, still seen), a form-variant graded credit like visto/veduto, distinct from decision 1.
6. **candidate_forms / correct_form carried on the six Passivante-or-impersonal items** (Rev 17 generalises criterion 16 to non-tense discriminations). The candidate set is the two constructions, impersonal si (verb stays singular) and si passivante (verb agrees with the noun), with correct_form naming the one the context demands. Display-only, marking unaffected, and the items were already suppressed pre-answer as the criterion requires. NOT added to the four Which-si items: they are MCQ, so the choices already are the candidate set and are visible pre-answer, which would contradict the suppressed-until-answered semantics. Say if you want them there anyway.

## Items flagged uncertain

- **si_which_04 (sì vs si accent) as an MCQ.** I made it multiple-choice on purpose: norm() folds the accent, so a free-text sì/si distinction would not mark reliably. The MCQ sidesteps that (answer_index drives correctness). If Housing later wants a typed accent item, it needs the marker to stop folding the accent, which would ripple into elision handling; not worth it for one item.
- **si_imp_adv_07 uses two positional blanks** (è stati ... poveri) rather than one combined slot, because the two words sit in genuinely different positions with fixed intervening text (molto). Criterion 9 permits this; flagging since most items here use a single slot.

## For the next dispatch / Architecture

- **bucket_suggestions_si_constructions.json** proposes one leaf: impersonal.ci_si.
- **glossary_suggestions_si_constructions.json** proposes: impersonal si, si passivante (with alias hints from 'impersonal' and 'passivante').
- **data/manifest.json NOT touched.** si_constructions is not added; per the standing ruling and stay-in-role, the manifest entry that makes the loader discover these two item files is an architecture edit. The files are landed and inert until you add it. This is the top thing to action to make the topic go live.
- **Coverage gap flagged, not filled: passivante in compound tenses** (si è venduto / si sono venduti, with participle agreement). It is a real sub-skill the current tree has no leaf for; I did not author items needing it, so I have not proposed a bucket, only noted it for a future pass.
- **Misconception axis:** the must_not entries (si vende libri, si mangiano bene, singular adjective after impersonal essere, impersonal si read as reflexive) are ready for Phase-3 misconception attribution. Registry is architecture-owned; not attempted here.
- **The brief moved from Rev 14 to Rev 17 while this batch was being written**; it is reconciled to Rev 17. (i) The match_at errata is resolved and this batch uses the per-phrase form throughout. (ii) Criterion 18's third direction drove uniform word-anchoring on all 56 must_not entries, with two residuals flagged above. (iii) Criterion 16's generalisation is applied as candidate_forms on the six discrimination items. (iv) The 0.9-for-dodges rule is applied to vendono on si_pass_agr_01. No Rev 15-17 change required a content rewrite; the items were already anchored and glossed.
