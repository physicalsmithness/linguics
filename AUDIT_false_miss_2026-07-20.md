# AUDIT: false misses on correct natural Italian — grammar items
**Date:** 2026-07-20 · **Seat:** fresh-context audit agent (commissioned off the pv_celho_03 live catch)
**Scope:** all 32 grammar_questions_*.json files (2,145 items: 1,966 short, 179 mcq). Wrong-TENSE alternatives on formation items excluded (already covered by AUDIT_formation_trigger_2026-07-19.md). MCQ items included only where a second option is defensible (none rose to reportable).

## Method
Bulk-extracted every short item's prompt + cue + full any_phrases (with per-phrase match_at and credit) + must_not_include, then judged each topic by hand for same-tense correct alternatives: optional elements, idiom vs plain phrasing, synonyms, word order, clitic position, elision variants, article alternatives, connector/preposition synonymy, and blank-boundary mismatches (accepted phrase spans a word the prompt already supplies). Every reported zero was **verified against a marker replica** implementing the ratified semantics: norm() lowercases, collapses whitespace, folds apostrophe→space and hyphen→space; accent-fold rescue unless accent_load_bearing; positive any_phrases win over must_not_include; match_at word anchors both boundaries, start/end one, unanchored = substring; no positive match on a markpoint = 0 on that markpoint.

Two automated sweeps also ran clean: tra/fra asymmetry (0 hits — every fra item also accepts tra), and clitic-placement pairs on modal/gerund/negative-imperative frames (all accept both placements except the one frame-forced case reported below). Rev 17 (0.9-for-dodges), Rev 20(i) (named common_miss outranks the 0.9), and the criterion-14/15/18 apparatus were used to filter: an alternative that is the item's named teaching contrast is NOT reported unless the zeroing is linguistically wrong.

**A structural class worth naming: blank-boundary zeros.** In ~12 items the only accepted phrases span a word the prompt already prints next to the blank. The input placeholder says only "Type your answer", so a learner who types exactly the blank's content — the fully correct answer — scores 0, and in two cases the accepted string, read back into the sentence, is itself ungrammatical ("non non ce l'ho", "stavano per per chiudere"). These are the highest-priority repairs because they zero the *expected* answer, not an alternative.

---

## pronominal_verbs (3)

| id | expected | zeroed correct answer | sev | why | remedy |
|---|---|---|---|---|---|
| pv_celho_02 | "non ce l'ho" | **"ce l'ho"** (the blank fill: prompt already supplies the *non* — 'No, non ____.') | TOP | Accepted phrase duplicates prompt-supplied *non*; the credited answer renders "non non ce l'ho". The natural fill scores 0. | Re-anchor positives to "ce l'ho" / "ce l' ho" (word); rebuild guards blank-relative (bare "l'ho" as the miss). |
| pv_celho_03 | "ce l'hai" | **"hai"** ("Hai il passaporto?") | TOP | The ce-l' pattern is obligatory only when the object is *elided*; here the noun follows the blank, so plain "Hai il passaporto?" is fully standard. The item currently claims otherwise by fiat. | Graded "hai" 0.9 (word) + steering note toward the dislocated idiom, or reframe so the noun is not in the frame ("Il passaporto? '____?'" ) forcing ce l'hai. |
| pv_celho_01 | "ce l'ho" | **"ne ho una"** (also "ho una penna") | MID | For an indefinite antecedent ("Hai *una* penna?") the ne-answer is textbook-correct and idiomatic. Not the named miss (that is bare "l'ho"). | Add "ne ho una" 0.9 with steering note. |

## preposition (6)

| id | expected | zeroed correct answer | sev | why | remedy |
|---|---|---|---|---|---|
| prep_t_06 | "da venti" | **"da"** (the blank: '____ venti minuti') | TOP | Blank-boundary: phrase spans prompt-supplied *venti*. Every other item in the topic accepts the bare blank content. | Phrase → "da" match_at word (anchoring already kills da/dalle superstring risk). |
| prep_t_07 | "per tre" | **"per"** | TOP | Same class. | "per" (word). |
| prep_t_08 | "fra dieci"/"tra dieci" | **"tra"** or **"fra"** | TOP | Same class. | "fra"/"tra" (word). |
| prep_t_09 | "nel 1998" | **"nel"** | TOP | Same class. | "nel" (word). |
| prep_vg_obj_05 | "del nuovo" | **"del"** (both markpoints zero) | TOP | Same class; the item's two markpoints (pensare-di + contraction) both fail on the correct blank fill. | "del" (word) on both; keep "al nuovo" guard as "al" (word). |
| prep_da_04 | "da bambino/a" | **"da piccolo/a"** | TOP | Cue is English-only "[as a child]"; da piccolo is the same da-construction with a synonym, at least as natural. | Add "da piccolo"/"da piccola" 1.0. |

## piacere family (8)

| id | expected | zeroed correct answer | sev | why | remedy |
|---|---|---|---|---|---|
| pia_fam_04 | "mi sembra" | **"mi pare"** | TOP | Exact synonym, same experiencer flip, register-neutral. Pure synonym gap. | Accept "mi pare" 1.0. |
| pia_disp_01 | "mi dispiace" | **"mi spiace"** | TOP | Same lexeme family (spiacere), fully standard, arguably more colloquial-natural. ("Sono spiacente" also zeroes; the must_not only guards "sono spiacente di non".) | Accept "mi spiace" 1.0; consider "sono spiacente" 0.9. |
| pia_disp_03 | "ti dispiace" | **"Le dispiace"**, **"ti/Le dispiacerebbe"** | TOP | Prompt says "Ask politely" — the Lei form and the conditional are the canonical polite versions; both zero. | Accept le/ti dispiace + dispiacerebbe variants, or pin informal-tu in the prompt. |
| pia_agree_03 | "a me sì" | **"a me invece sì"**, **"a me piace"** | TOP | The invece-version is the most natural riposte and contains the expected words non-contiguously, so the contiguous phrase misses it; "a me piace" is plainly correct. | Add "invece sì" (word) and "a me piace" (word, ≥0.9). |
| pia_fam_02 | "mi servono" | **"mi occorrono"** | MID | Correct, same flip construction, slightly formal. Also note: must_not "ho bisogno" flags the fully correct "ho bisogno di due uova" as WRONG-with-diagnostic — the named contrast is fair game (Rev 20(i)), but the diagnostic text must not claim correct Italian is incorrect (the pv_celho_03 principle); an explicit graded 0.5–0.8 + steering would serve the teaching point better. | Accept "mi occorrono" 1.0; convert ho-bisogno guard to explicit graded credit with steering note. |
| pia_flip_01 (class: also flip_02, flip_03) | "mi piace" | **"a me piace"** (a noi/a te forms) | MID | Stressed-form statement is correct, just emphatic/marked in a neutral context. | Graded 0.9 with steering to the clitic form. |
| pia_agree_01 | "anche a me" | **"pure a me"** | MID | pure = anche, standard (not merely regional). | Accept "pure a me" 1.0. |
| pia_fam_03 | "ti interessa" | **"t'interessa"** | MID | Standard elision; norm folds it to "t interessa", which matches nothing. Class hazard: any 1-phrase item whose clitic can elide (mi/ti/lo/la + vowel-initial verb). | Add elided variants ("t interessa" post-fold) where the verb starts with a vowel. |

## negation (4)

| id | expected | zeroed correct answer | sev | why | remedy |
|---|---|---|---|---|---|
| neg_concord_02 | "non ho visto niente/nulla" | **"Niente."** (bare; also "nulla", and emphatic "non ho visto proprio niente") | TOP | Bare "Niente" is the most natural real-dialogue answer to "Che cosa hai visto?" and is not the named miss (that is "ho visto niente"). Graded credit is unauthorable here — "niente" 0.9 would also credit the named miss (additive-error class, per the seat's own record). | Reframe prompt: "Rispondi con una frase completa" (instruction-pinned per Rev 20(iii)), or convert to index-scored MCQ. Insertion-tolerance ("proprio") would need phrase-pair anchoring: accept "non ho visto" + "niente" as two word-anchored phrases on separate markpoints, or leave and note. |
| neg_concord_06 | "non voglio niente/nulla" | **"Niente."** / "nulla" bare | TOP | Same as above. | Same. |
| neg_corr_01 | "non bevo né caffè né tè" | **"non bevo né il caffè né il tè"** | MID | Articles inside né...né lists are fully standard. | Add article variants, or split into two word-anchored phrases ("non bevo né" + "né tè" won't cover both; simplest is 4 explicit variants). |
| neg_corr_04 | "non mangio né carne né" | **"né la carne né il pesce"** | MID | Same. | Same. |

## connective (4)

| id | expected | zeroed correct answer | sev | why | remedy |
|---|---|---|---|---|---|
| conn_cause_02 | perché (dato che/visto che 0.9) | **"poiché"** (also "in quanto") | MID | Post-posed poiché is standard formal Italian ("Sono rimasto a casa poiché pioveva"); the item grades the other cause-connectors but omits it, and it is not the named miss (that is siccome). | Add poiché 0.8 (register note), in quanto 0.9. |
| conn_cause_07 | perché (+0.9s) | **"poiché"**, "in quanto" | MID | Same. | Same. |
| conn_ca_01 | comunque (tuttavia 0.9) | **"però"** (and "ma") | MID | "Non ho studiato molto; però proverò..." is fully natural; sibling items conn_ca_02/03 grade però 0.8–0.9 — parity gap. | Add però 0.8, ma 0.8. |
| conn_cvd_05 | in modo da (così da 0.9) | **"per"** ("per farti capire") | MID | per + infinitive is the everyday purpose construction; correct, less bookish than the target. | Graded "per" 0.7–0.9 with steering to in modo da. |

## comparison (3)

| id | expected | zeroed correct answer | sev | why | remedy |
|---|---|---|---|---|---|
| cmp_eq_01 | "come me" | **"quanto me"** | TOP | come and quanto are interchangeable for equality with a pronoun second term; quanto me is not the named miss (that is "come io"). | Accept "quanto me" 1.0. |
| cmp_eq_03 | "tanto bello quanto" | **"bello quanto"** (tanto omitted) | MID | tanto is grammatically optional in the tanto...quanto correlative; "bello quanto utile" is standard. | Add "bello quanto" (word). |
| cmp_pmd_04 | "più di venti" | **"oltre venti"** | MID | Correct, natural dodge of the drilled più-di pattern; not a named miss. | Graded 0.9 + steering. |

## si_constructions (2 + class)

| id | expected | zeroed correct answer | sev | why | remedy |
|---|---|---|---|---|---|
| si_imp_basic_02 | "si può" | **"posso"** ("Scusi, posso fumare qui dentro?") | TOP | For asking about oneself, the 1sg is at least as natural as the impersonal; correct, not the named miss (si possono). | Graded 0.9 + steering, or reframe cue to force the impersonal ("(potere, impersonale)" or an is-it-generally-allowed context). |
| si_pass_agr_02 | "si vende" | **"vendono"** ("In questo negozio vendono una bicicletta...") | MID | Impersonal-3pl is correct; sibling si_pass_agr_01 grades "vendono" 0.9 — the known parity gap (open thread si-vende graded-credit parity, SiConstructionsAuthor↔Architecture). | Add "vendono"/"vende" graded per the agr_01 precedent. |
| class | si_pass_agr_03/04/05/07/08 | bare 3pl ("conservano", "affittano", "producono", "servono", "parlano") | MID | Same parity class: agr_01 grades the si-less 3pl 0.9, the rest zero it. Verified "affittano" → 0 on agr_04. | Extend agr_01's graded pattern across the leaf. |

## existential (1)

| id | expected | zeroed correct answer | sev | why | remedy |
|---|---|---|---|---|---|
| ex_form_neg_02 | "non ci sono problemi" | **"nessun problema"** ("No, tranquillo, nessun problema.") | TOP | The single most idiomatic real-world reply to "Qualche problema?"; correct, and not among the named misses (those are partitive slips). | Graded 0.9 + steering to the esserci form, or pin the frame ("(esserci)" cue is absent here — adding it would also pin). |

## indefinite (1)

| id | expected | zeroed correct answer | sev | why | remedy |
|---|---|---|---|---|---|
| ind_nn_06 | "Nessuno studente" | **"Nessuno"** (the blank: '____ studente ha superato...') | TOP | Blank-boundary: the noun is printed after the blank. The wrong forms stay caught (bare "nessun"/"nessuna" match no positive). | Add "nessuno" (word); keep the two-word guards for full-answer typers. |

## pronoun (5)

| id | expected | zeroed correct answer | sev | why | remedy |
|---|---|---|---|---|---|
| op_comb_order_01 | "Me lo dai" | **"lo"** (the blank: 'Me ____ dai?') | TOP | Blank-boundary: both Me and dai are printed in the frame; the correct fill scores 0. | Add "lo" (word) — safe: "la"/"li" would not match; the ordering guards live in must_not and stay reachable for full-answer typers. |
| op_comb_glielo_11 | "voglio darglielo" | **"darglielo"** (the blank: 'voglio ____.') | TOP | Blank-boundary: voglio is printed. (Placement is frame-forced here, so climbing variants are correctly out; only the echo is the bug.) | Add "darglielo" (word); keep the ordering guards. |
| op_spec_fcap_03 | "La informiamo"/"che la"/"Sua richiesta" | **"La, la, Sua"** (the three blank values, in order) | MID | Multi-blank item whose every markpoint requires prompt-context words; a learner answering the question exactly as asked ("Fill each blank with...") scores 0/3. Sibling op_spec_fcap_01 partially survives (2/3), fcap_04 fully survives. | Either instruct "rewrite the whole sentence", or add case-sensitive single-token phrases per blank where uniquely attributable (here they are not all unique — so the rewrite instruction is the honest fix). |
| op_cil_exist_04 | "Non c'è più un/nessun problema" | **"Non c'è più alcun problema"** | MID | alcun-negation is standard (slightly formal). | Add the alcun variant. |
| op_ne_motion_01 | se n' + era + andato | **"se n'era"** caps at 2/3 | MID | Partial-unearnable markpoint: *andato* is printed after the blank, so the participle markpoint can never be credited by a blank-only answer. | Drop the participle markpoint or move *andato* into the blank. |

## verb_form.imperfect (1)

| id | expected | zeroed correct answer | sev | why | remedy |
|---|---|---|---|---|---|
| imp_isp_int_03 | "stavano per" | **"stavano"** (the blank: '____ per chiudere') | TOP | Blank-boundary duplication of prompt-supplied *per*; the credited answer reads "stavano per per chiudere" — the item's own explanation prints the double per. | Phrase → "stavano" (word); guards ("stanno", "staranno") stay effective. Fix the explanation typo too. |

## verb_form.passato_remoto (1)

| id | expected | zeroed correct answer | sev | why | remedy |
|---|---|---|---|---|---|
| prem_trap_partire_3sg_02 | fu + partito | **"fu"** caps at 1/2 | MID | Partial-unearnable: *partito* is printed in the prompt after the blank; the participle markpoint requires the learner to retype it. | Drop markpoint 2 or restructure the blank to cover both words. |

## Tally

- Items scanned: **2,145** (1,966 short judged in full; 179 mcq skimmed for defensible second options — none reported).
- Findings: **39 items** (itemised above) + 1 class extension (si_pass_agr parity, 5 further items).
- Severity: **TOP 20** (pv_celho_02, pv_celho_03, prep_t_06, prep_t_07, prep_t_08, prep_t_09, prep_vg_obj_05, prep_da_04, pia_fam_04, pia_disp_01, pia_disp_03, pia_agree_03, neg_concord_02, neg_concord_06, cmp_eq_01, si_imp_basic_02, ex_form_neg_02, op_comb_order_01, op_comb_glielo_11, imp_isp_int_03), **MID 19** (+5 class).
- By topic: piacere 8 · preposition 6 · pronoun 5 · negation 4 · connective 4 · pronominal_verbs 3 · comparison 3 · si_constructions 2(+5) · existential 1 · indefinite 1 · imperfect 1 · passato_remoto 1.
- Defect sub-classes: blank-boundary zeros 12 (incl. both partial-unearnable and the two prompt-word duplications), synonym/variant gaps 15, idiom-vs-plain dodges 8, parity gaps with an already-graded sibling 6(+5).

## UNSURE (correct-looking alternatives I did NOT report as findings, with reasons)

- **op_cil_exist_03** — "c'era" (imperfetto) zeroes where "c'è stata" is expected; both are correct Italian for "there were many people yesterday". Excluded as tense-adjacent (borderline with the formation-trigger audit's remit), but worth a look: the cue does not pin aspect.
- **ex_use_vsess_01–04** — "vi è / vi sono" zero. Correct but distinctly formal-written; the everyday prompts arguably justify the zero. A 0.8-with-register-note would be kinder.
- **prep_mo_01** — "al teatro" zeroes vs "a teatro". Normative preference is a teatro; al teatro is common speech but the article-less idiom is the teaching point. Left out per Rev 20(i), flagged because the must_not does not name it (so it is a silent 0, not a diagnostic).
- **conn_time_04** — "quando" zeroes for "[After the guests left]"; sibling conn_time_05 grades quando 0.9. The English gloss pins "After", so the zero is defensible; the sibling asymmetry is what makes it worth a glance.
- **cmp_eq_02** — "come te" zeroes for "(as much as you)": come = manner, quanto = quantity; the gloss pins quantity. Defensible zero.
- **adv_mreg_06** — the item forces "Piove fortemente", which is grammatical but unnatural; the natural adverb here is "forte" (zeroed, though the -mente instruction pins it). Not a marking bug; an item-naturalness bug. Suggest a different carrier sentence for fortemente (e.g. 'Lo sconsiglio ____').
- **adj_pos_pre_04** — "un problema piccolo" is flat-wrong via must_not while siblings grade post-position 0.7. Grammatical but marked; parity question for AdjectiveAuthor.
- **pia_clit_01/02** — typing the cue back ("a lui piace") zeroes; correct Italian but a non-transformation of the cue. Left to the author's judgement.
- **poss_pred_01–05 (mcq)** — "È la mia" is defensible in contrastive readings; this is the è-mio open thread already with Architecture, so not re-reported.
- **Elision-variant class** — beyond pia_fam_03, any single-phrase item whose expected clitic/article can standardly elide (or whose elided form can be written out) may zero the twin spelling; the apostrophe→space fold makes some pairs (un'/una + vowel) undecidable by design (Article seat's known position). A systematic sweep would need a phonology-aware generator; not attempted here.
