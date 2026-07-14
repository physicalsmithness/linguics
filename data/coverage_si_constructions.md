# Coverage: Si constructions (`si_constructions`)

Authored by SiConstructionsAuthor against AUTHOR_BRIEF **Revision 16** (criterion 17 English glosses throughout; criterion 18 per-phrase match_at word on all positives; criterion 19 checked, does not bite; terse-label and suppress rules applied) and DISPATCH_si_constructions.md. Counts below are derived from the shipped files, not from memory of batches.

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
2. **must_not "start"-anchored where a wrong form is a prefix of, or contains, the right one.** vendono (inside si vendono) and si riposa (inside the correct ci si riposa) are start-anchored, so they only fire on the genuinely wrong answer and never on the correct one. The positive-wins order already protects the ci si items; the start anchor is belt-and-braces.
3. **A Python harness mirroring norm() + occursAt(word) + the positive-before-must_not order** runs over the contamination-prone items (si cena/cenano, si vende/vendono, ci si riposa/si riposa, si è parlato/ha parlato, si è arrivati/arrivato): correct answers credited, canonical wrong answers caught by must_not, no false credit. 28 cases, all pass.
4. **Criterion 19 (accent as morpheme, Rev 16) checked, does not bite.** The only accented answers here are the è in si è parlato / stati / arrivati and può; their accent-stripped forms (e, puo) are not alternative valid answers to the same prompt, which is the do-nothing case the criterion names. No accent_load_bearing flags needed.

## Authoring decisions worth review (largest first)

1. **si vende libri (agreement slip) kept as a flat must_not miss, not graded.** The dispatch worked example treats it as flat wrong, and I followed that. But the tree itself calls it "extremely common even among natives in speech", and sibling trees granted 0.5-with-register-note for comparable ubiquitous colloquial slips (a me mi piace; ha detto che veniva). If you want parity, this is an architecture-level graded-credit ruling to make, not mine to set; flagging rather than deciding. If ruled 0.5, the change is a one-line edit to the must_not entries on the eight agreement items and the two vs-items.
2. **Suppression extended beyond the two dispatch-named leaves.** The dispatch names passivante.vs_impersonal and which_si for info_display: suppress. Following the leak-vs-trap test and the existential precedent (36/43 suppressed the same day), I also suppressed impersonal.basic, impersonal.advanced and passivante.agreement, whose labels name the number/agreement/construction the item tests. Left visible: the two sign-meaning MCQs and the sì/si accent MCQ, whose breadcrumbs don't reveal the English answer.
3. **ci si bucketed to impersonal.advanced now, with a proposed impersonal.ci_si leaf.** Nothing strict-rejects; migration is mechanical via the si_imp_cisi_ prefix. See bucket_suggestions.
4. **affittansi accepted at 0.8** on the sign item (older agreeing form, still seen), a form-variant graded credit like visto/veduto, distinct from decision 1.
5. **candidate_tenses / correct_tense not used.** Criterion 16 binds tense_choice and .discrimination.* buckets; my discrimination leaves (vs_impersonal, which_si) discriminate construction and number, not tense, so the fields don't apply.

## Items flagged uncertain

- **si_which_04 (sì vs si accent) as an MCQ.** I made it multiple-choice on purpose: norm() folds the accent, so a free-text sì/si distinction would not mark reliably. The MCQ sidesteps that (answer_index drives correctness). If Housing later wants a typed accent item, it needs the marker to stop folding the accent, which would ripple into elision handling; not worth it for one item.
- **si_imp_adv_07 uses two positional blanks** (è stati ... poveri) rather than one combined slot, because the two words sit in genuinely different positions with fixed intervening text (molto). Criterion 9 permits this; flagging since most items here use a single slot.

## For the next dispatch / Architecture

- **bucket_suggestions_si_constructions.json** proposes one leaf: impersonal.ci_si.
- **glossary_suggestions_si_constructions.json** proposes: impersonal si, si passivante (with alias hints from 'impersonal' and 'passivante').
- **data/manifest.json NOT touched.** si_constructions is not added; per the standing ruling and stay-in-role, the manifest entry that makes the loader discover these two item files is an architecture edit. The files are landed and inert until you add it. This is the top thing to action to make the topic go live.
- **Coverage gap flagged, not filled: passivante in compound tenses** (si è venduto / si sono venduti, with participle agreement). It is a real sub-skill the current tree has no leaf for; I did not author items needing it, so I have not proposed a bucket, only noted it for a future pass.
- **Misconception axis:** the must_not entries (si vende libri, si mangiano bene, singular adjective after impersonal essere, impersonal si read as reflexive) are ready for Phase-3 misconception attribution. Registry is architecture-owned; not attempted here.
- **Brief moved to Revision 16 mid-authoring** (from Rev 14). This batch is reconciled to it: criterion 18 (per-phrase match_at word) was already applied to every positive, and criterion 19 (accent-as-morpheme) was checked and does not bite. The old match_at errata is resolved by Rev 15's criterion 18.
