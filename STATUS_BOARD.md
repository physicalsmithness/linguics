# STATUS BOARD - Linguics

Generated 2026-07-20 by `MetaProject\status_board.py` (read-only aggregator; the only
writer of this file). Derived from disk at run time, never remembered. Regenerate
at will; editing this file by hand is pointless, the next run overwrites it.
Seat queues are SEAT-ASSERTED (each seat judged its own grep hits); standing
rules never appear here as tasks, only their retrofit/compliance state does.

## Waiting on Smith

- **AccentAuditor** needs **decision**
  - Dispatch fully discharged 2026-07-15 (267 markpoints, 265 no_flag, 2 flag); re-derived today rather than trusting the stamp - corpus drifted by exactly one markpoint (pas_use_reg_04, verbless-e class, no_flag, already correct on disk unaided). Queue empty. One decision open: how to detect criterion-19 drift now that the retrofit is stamped discharged.
- **NegationAuthor** needs **decision**
  - Negation live and accepted (41 grammar + 22 translation, 9 leaves, validation 0/0, replica clean). Nothing to author. Raw name-grep showed 6; after triage the queue is two all-authors retrofits, both RUN clean this turn and awaiting Architecture's stamp, plus one thread on Architecture's side. Nothing owed by me.
- **NounAuthor** needs **decision**
  - batch ACCEPTED 2026-07-15 with both asks answered; wake self-check finds one explicit ruling still undelivered after 3 days (candidate_forms on 4 meaning-pair items) plus two unstamped class retrofits that my name alone could never have found (crit 13, Rev 25); the italia.verb defect routed to me is already fixed on disk, reported not self-stamped
- **ReportedSpeechAuthor** needs **decision** (blocked by: Smith - suppression-scope decision (options A/B/C given in chat))
  - thread v4 ruled all four asks in my favour and ordered two authoring tasks; both class retrofits (crit 13, Rev 25) audited clean this turn with zero exposure, evidence ready to file for stamping; one decision owed before I author
- **WordFormationAuthor** needs **decision**
  - Batch complete and ACCEPTED (thread CLOSED v6, 39 grammar + 11 translation). Nothing owed on any thread. Two class-token retrofits bind me via all-authors and are unstamped for this seat; both are expected near-no-ops but neither has been run. One discharged clause (DECISIONS 996) needs an architect stamp.
- **DemonstrativeAuthor** needs **external-action** (blocked by: Architecture (3 stamps to apply + the cio/criterion-20 ruling))
  - Demonstrative batch (44 grammar + 20 translation) is live and Rev-25 compliant; three class/next-touch clauses discharged and awaiting Architecture stamps; one criterion-20 exposure on the two cio cues routed to Architecture for a ruling.
- **Housing** needs **external-action**
  - r24 - live-round UI thread closed same-day: vocab parenthetical inline (flex-column bug family), choose-or-type chips (prompt-stated sets only, 129 items; candidate_forms excluded to honour crit-16 suppression - flagged to Architecture) + Input preference, MCQ number badges. r23 - architect specs landed + acted on: denominator floor SHIPPED (9.5, opt-in per call site - kernel is shared with 4 vocab sites, scope correction on record) + residue survey DELIVERED (1,839 answers, ZERO flips both rules, instrument validated; awaiting go + 2 rulings). Person-split queued behind Architecture's migration. r22 - coverage views TOGGLEABLE per Smith's ruling: equal-boxes (his model, default) vs sized-boxes (r21), cream=unobtained / grey=unobtainable glossary, hatch retired; scoring-formula discussion Smith->Architecture pending. r21 - matrix legibility round: uniform gapless 4px liquid layers (contiguous colour at bottom), scope-scaled row heights, grey unpractised vs hatched NA, family subgroups; A2/B2 counts verified REAL from data. r20 - 'reduced coverage' = matrix rendered off SAMPLE tree during load window (transpose = re-render); coverage now load-gated + refreshed by the loader. r19 - coverage stripes horizontal + sediment-bottom fill + rwg colours (coverageColour had NO red - wrong answers were invisible in the matrix). r18 - coverage matrix cells de-aggregated per Smith (one strip per area, own colours, coverage = colour spread; dense topics band). r17 - Smith's live round: scroll CONFIRMED, pulse moved to the small cell/dot, in-session multi-level toggles (a1b1a2) + composed-scope preservation, accent policy CONFIRMED live (0.9, caffe named). r16 - cue_placement v3 ruling acted on same-day: field renamed wrong_answer_is_form_error_only (claim-named), engine read live with legacy tripwire, migration ball with Architecture. r15 - Smith-direct scroll regression fixed same turn (v7 scrolled the wrong scrollbox + flashed pre-scroll; now ancestor-walk box choice + scroll-then-flash, geometry-mocked harness). Previously: queue cleared at r14 - 8 threads closed/advanced today (scroll fix, entry load race, level picker set, AI-marker accent policy, vocab builder two-lens + ratified 94-chip category picker, cue placement CSS, feedback widget mounted); cue-placement FLAG ruling awaits Architecture
- **PronominalVerbsAuthor** needs **external-action** (blocked by: Architecture — ratify/place pronominal_verbs.meaning.frozen_tail_idioms (11 grammar + 3 translation forward-reference it; production load strict-rejects until it exists))
  - Original batch ACCEPTED 2026-07-15. Smith commissioned the frozen-tail idioms C1 pass 2026-07-18; authored and on disk (10 new grammar + 3 translation, pv_adv_frozentail_01 re-homed, topic now 56/23), validates clean, forward-referencing a leaf Architecture must place. Two all-authors class retrofits (crit 13, Rev 25) re-run clean and reported for stamping.
- **RelativePronounAuthor** needs **external-action**
  - batch live and settled; wake self-check found two unstamped class retrofits (crit 13, Rev 25), both audited clean same turn, evidence filed for stamping; pos-worklist census decrement still pending
- **ConditionalFormationAuthor** needs **review**
  - Wave-2 usage batch delivered (3 leaves, 23 grammar + 19 bidirectional translation, verifier green, Rev 27 cross-credits held to the tense_choice boundary). Two soft formation triggers hardened. Two asks parked in the usage thread; formation batch remains ACCEPTED.
- **CongiuntivoFormationAuthor** needs **review**
  - FORMATION (3 waves) + USAGE branch both delivered and verified: 90 grammar + 33 translation, engine-green (90/90 full marks; Rev-27 usage co-credit confirmed 15/15). Owed: nothing to author; awaiting Architecture to mint 3 usage leaves + rule on 2 flags.
- **ConnectiveAuthor** needs **review**
  - Connective topic DELIVERED 2026-07-18: 54 grammar (45 short + 9 MCQ) + 22 translation (12 negative anchors) + 1 bucket proposal (mentre_appena) + 4 glossary terms + coverage doc; local gates 0 errors; crit-13 sweep and Rev 25 cue-level audit run at delivery, zero hits; delivery thread OPEN, Next: Architecture, 7 asks (manifest add, clause stamp, classes ratification, compliance recording, glossary merge, mentre_appena ratification, purpose-gap ruling).

## Open these next

No seat is a pure "reopen and say go" right now.

## Seat declarations (`_status/`)

### AccentAuditor - closed / decision (updated 2026-07-18)
- Classes: all-seats
- Dispatch fully discharged 2026-07-15 (267 markpoints, 265 no_flag, 2 flag); re-derived today rather than trusting the stamp - corpus drifted by exactly one markpoint (pas_use_reg_04, verbless-e class, no_flag, already correct on disk unaided). Queue empty. One decision open: how to detect criterion-19 drift now that the retrofit is stamped discharged.
  - (empty) name-grep across the six surfaces + all-seats returns no live work.

### AdjectiveAuthor - parked / none (updated 2026-07-18)
- Classes: all-seats, all-authors
- Both threads with `Next: AdjectiveAuthor` discharged this wake. adj_buono_02 prompt fixed (uno -> un) + buon guard relaxed to graded credit at 0.7. 47-ref pos-migration applied per Cr17Sweep worklist + orecchia -> orecchio citation-form fix on adj_ga_ghe_05. Awaiting Architecture stamps on both.
  - (empty; both owed threads discharged this wake)

### AdverbAuthor - parked / none (updated 2026-07-18)
- Classes: all-seats, all-authors
- Batch accepted; my finding is criterion 15's recoverability condition (Rev 19). Rev 25 retrofit run and discharged (26 cued items, 26 exempt, 3 vocab_help'd); adv_bb_07 repaired per Smith; one collision ruling asked of Architecture.

### Architecture - active / none (updated 2026-07-19)
- Classes: all-seats
- Wave 2 FULLY LANDED. Gerundio (16+12) + imperativo (32+16) accepted and merged (topics now 51+26 / 69+32); all usage leaves flat+destubbed; register.tu_lei_mismatch extended to imperativo; glossary v9 (adverbial gerund); 4 acceptance-rulings recorded (no-partner confirmed, dual-cite ratified, anti-anchor design, absolute gerund parked). Stubs 15 -> 4. Earlier today: flat-canonical ratified by Smith; live-round routing (Housing/Demonstrative/Negation); 17 stamps total applied.
  - Remaining rulings: Connective + Indefinite acceptance, Existential rework + partitive mint, Possessive x2, vedere_ci repair, residue go, free-choice seam, candidate_forms A/B/C, congiuntivo label hygiene, Negation crit-20 extension, GerundioAuthor porre/tradurre (selfcheck thread), Cr17Sweep replica re-run
  - Migrations: wrong_answer_is_form_error_only x1,665; person x~350 central + ~96 work-order
  - Mint vocabulary.it.mano.noun.gender when DemonstrativeAuthor's markpoint lands
  - Phantom translation bucket ids central mapping (27 ids / ~35 items)
  - cue-notation retrofit routing (138 items, eight authors)

### ArticleAuthor - parked / none (updated 2026-07-18)
- Blocked by: none
- Classes: all-seats, all-authors
- POS-migration + citation-key repair DONE (33 refs, 0 old-shape remaining, marking unaffected 143/143). Three Architecture threads opened: census decrement, crit-13/20 stamps, crit-16 ruling. Nothing else owed.
  - [DONE 2026-07-18] POS-migration + citation-form key repair, 33 refs -> Architecture_ArticleAuthor_pos_worklist_cleared v1 (awaiting census decrement)
  - crit-13 + crit-20 audits CLEAN, evidence in Architecture_ArticleAuthor_class_retrofit_audits v1 (awaiting Architecture stamp; seats do not self-stamp)
  - OPEN Q crit-16 candidate_forms on the 5 discrimination items -> Architecture_ArticleAuthor_discrimination_candidate_forms v1 (awaiting ruling; my rec = option A)

### ComparisonAuthor - closed / none (updated 2026-07-18)
- Classes: all-seats, all-authors
- Comparison batch live and ACCEPTED (51 grammar + 24 translation, all 8 leaves), reconciled Rev 16->22 and re-checked against Rev 25 today. Self-check run across name + classes; queue is EMPTY. Two class-bound audits run today, both clean; three items await Architecture's stamp.
  - none — nothing owed. (name-grep MINUS discharged = 0)

### ConditionalFormationAuthor - parked / review (updated 2026-07-20)
- Classes: all-seats, all-authors
- Wave-2 usage batch delivered (3 leaves, 23 grammar + 19 bidirectional translation, verifier green, Rev 27 cross-credits held to the tense_choice boundary). Two soft formation triggers hardened. Two asks parked in the usage thread; formation batch remains ACCEPTED.
  - Architecture_ConditionalFormationAuthor_usage_wave2 v1: 2 asks open (reported-future dual-credit y/n; stub-flag clearance)   [inter_chat, Next: Architecture — their turn]
  - Criterion 13 audit: 0 hits, clean, awaiting Architecture stamp for this seat   [AUTHOR_BRIEF binding register]
  - Criterion 25 audit: 0 exposed, clean, awaiting Architecture stamp for this seat   [AUTHOR_BRIEF binding register]

### CongiuntivoFormationAuthor - parked / review (updated 2026-07-18)
- Classes: all-seats, all-authors
- FORMATION (3 waves) + USAGE branch both delivered and verified: 90 grammar + 33 translation, engine-green (90/90 full marks; Rev-27 usage co-credit confirmed 15/15). Owed: nothing to author; awaiting Architecture to mint 3 usage leaves + rule on 2 flags.
  - Architecture to MINT 3 usage leaves (independent_exhortative, optative_wish, fixed_concessive) + clear usage stub [Architecture_CongiuntivoFormationAuthor_usage_leaf_minting v1, Next: Architecture] — items forward-reference them, strict-reject at production until minted

### ConnectiveAuthor - parked / review (updated 2026-07-18)
- Classes: all-seats, all-authors
- Connective topic DELIVERED 2026-07-18: 54 grammar (45 short + 9 MCQ) + 22 translation (12 negative anchors) + 1 bucket proposal (mentre_appena) + 4 glossary terms + coverage doc; local gates 0 errors; crit-13 sweep and Rev 25 cue-level audit run at delivery, zero hits; delivery thread OPEN, Next: Architecture, 7 asks (manifest add, clause stamp, classes ratification, compliance recording, glossary merge, mentre_appena ratification, purpose-gap ruling).
  - none owed by me; delivery sits with Architecture (inter_chat/Architecture_ConnectiveAuthor_batch_delivery.md v1, Next: Architecture)

### Cr17Sweep - closed / none (updated 2026-07-17)
- Classes: all-seats
- SWEEP COMPLETE 418/418 (present_indicative 91, future 50, congiuntivo 43, adjective_agreement 182, imperfect 52); replica zero deltas everywhere; 3 bugs (fut vedrò, adj buono_02, imp vol_01) + 9 observations routed via five topic reports; 47-ref hygiene work-order with AdjectiveAuthor; estate-net evidence at sequencing v4/v5 + imperfect report. Standing seat, queue empty pending Architecture stamps.
  - awaiting Architecture: five topic stamps; estate-net ruling; class ratification; route 3 bugs to owning authors   [their turn]
  - awaiting AdjectiveAuthor: hygiene work-order v1 apply-on-next-touch   [their touch]

### DemonstrativeAuthor - blocked / external-action (updated 2026-07-18)
- Blocked by: Architecture (3 stamps to apply + the cio/criterion-20 ruling)
- Classes: all-seats, all-authors
- Demonstrative batch (44 grammar + 20 translation) is live and Rev-25 compliant; three class/next-touch clauses discharged and awaiting Architecture stamps; one criterion-20 exposure on the two cio cues routed to Architecture for a ruling.
  - cio cue vs criterion 20: ruling requested, 2 items (a/b/c options tabled)   [class_retrofit_audits v1, Next: Architecture]
  - Criterion 13 class retrofit: RUN clean, 44 items, 3 bare-lemma cues, 0 rule-naming   [AUTHOR_BRIEF register row 13]
  - Rev 25 class retrofit: RUN clean, 44 items, all citation forms at/below item level   [DECISIONS.md Rev 25]
  - Rev 19 five-flag flip: discharged 2026-07-15, 5 show / 0 suppressed on disk   [DECISIONS.md:987]

### ExistentialAuthor - parked / none (updated 2026-07-18)
- Blocked by: none (my 27 remaining legacy-key esserci items await Architecture's central field migration, but that is Architecture's action, not a block on me)
- Classes: all-seats, all-authors
- Rev-25/27 cue-level + additive-credit rework delivered (16 items). Thread v2 posted, Next: Architecture. Ball is with Architecture to mint the misconception + accept; nothing owed to Smith.
  - DELIVERED, awaiting Architecture: Rev-25 English glosses on 14 A1 cues + additive full-phrase fix on 5 traps + Rev-27 cross-credit + transfer.partitive_for_bare_noun proposal   [inter_chat Architecture_ExistentialAuthor_cue_level_and_additive_credit v2, Next: Architecture]
  - DISCHARGED (stamp pending): ex_form_neg_01 unset done ahead of the migration; new field set   [inter_chat Architecture_Housing_cue_placement, my discharge note 2026-07-18]
  - NOT QUEUE (superseded): criterion 13 retrofit was discharged CENTRALLY for 26/29 topics by Architecture's Rev-26 audit (real exposure 5 chips, all in pronoun); existential is covered, my own chip audit was clean

### FutureFormationAuthor - blocked / none (updated 2026-07-18)
- Blocked by: Architecture (register the 3 future.usage leaves — load-blocking; + ratify the temporal_subordinate co-credit)
- Classes: all-seats, all-authors
- Future usage branch (wave 2) delivered — 15 grammar + 8 translation on probability / command_promise / temporal_subordinate, merged into the topic files, Rev 27 co-crediting applied. Blocked on Architecture registering the 3 proposed leaves (else strict-reject at load) and ratifying the tense_choice co-credit.
  - REGISTER 3 usage leaves (probability, command_promise, temporal_subordinate): proposed in bucket_suggestions; load-blocking until minted   [inter_chat/Architecture_FutureFormationAuthor_usage_wave2.md, Next: Architecture]
  - RATIFY temporal_subordinate co-credit into tense_choice.future_vs_present (Rev 27 vs dispatch boundary)   [same thread]
  - (carried) vedro content bug fut_irr_sync_vedere_1sg_01: repair pick with Architecture (recommend Ti vedro)   [inter_chat/Architecture_FutureFormationAuthor_vedere_ci_bug.md, Next: Architecture]
  - (carried) criterion-13 chip audit: reported clean, awaiting Architecture stamp   [inter_chat/Architecture_FutureFormationAuthor_class_retrofit_audits.md, Next: Architecture]

### GerundioAuthor - parked / none (updated 2026-07-18)
- Classes: all-seats, all-authors
- Usage branch (adverbial gerund) delivered today per DISPATCH_usage_wave2 - 16 grammar + 12 translation across 2 leaves, verified via engine port. Awaiting Architecture on TWO threads (see below). Formation batch remains accepted/closed.
  - nothing owed (both deliveries complete; the open items are Architecture's, not mine)

### Housing - parked / external-action (updated 2026-07-20)
- r24 - live-round UI thread closed same-day: vocab parenthetical inline (flex-column bug family), choose-or-type chips (prompt-stated sets only, 129 items; candidate_forms excluded to honour crit-16 suppression - flagged to Architecture) + Input preference, MCQ number badges. r23 - architect specs landed + acted on: denominator floor SHIPPED (9.5, opt-in per call site - kernel is shared with 4 vocab sites, scope correction on record) + residue survey DELIVERED (1,839 answers, ZERO flips both rules, instrument validated; awaiting go + 2 rulings). Person-split queued behind Architecture's migration. r22 - coverage views TOGGLEABLE per Smith's ruling: equal-boxes (his model, default) vs sized-boxes (r21), cream=unobtained / grey=unobtainable glossary, hatch retired; scoring-formula discussion Smith->Architecture pending. r21 - matrix legibility round: uniform gapless 4px liquid layers (contiguous colour at bottom), scope-scaled row heights, grey unpractised vs hatched NA, family subgroups; A2/B2 counts verified REAL from data. r20 - 'reduced coverage' = matrix rendered off SAMPLE tree during load window (transpose = re-render); coverage now load-gated + refreshed by the loader. r19 - coverage stripes horizontal + sediment-bottom fill + rwg colours (coverageColour had NO red - wrong answers were invisible in the matrix). r18 - coverage matrix cells de-aggregated per Smith (one strip per area, own colours, coverage = colour spread; dense topics band). r17 - Smith's live round: scroll CONFIRMED, pulse moved to the small cell/dot, in-session multi-level toggles (a1b1a2) + composed-scope preservation, accent policy CONFIRMED live (0.9, caffe named). r16 - cue_placement v3 ruling acted on same-day: field renamed wrong_answer_is_form_error_only (claim-named), engine read live with legacy tripwire, migration ball with Architecture. r15 - Smith-direct scroll regression fixed same turn (v7 scrolled the wrong scrollbox + flashed pre-scroll; now ancestor-walk box choice + scroll-then-flash, geometry-mocked harness). Previously: queue cleared at r14 - 8 threads closed/advanced today (scroll fix, entry load race, level picker set, AI-marker accent policy, vocab builder two-lens + ratified 94-chip category picker, cue placement CSS, feedback widget mounted); cue-placement FLAG ruling awaits Architecture
  - DISCHARGED 2026-07-18: worker deployed by Smith (wrangler output on record); accent policy live-verified on a real attempt
  - push r20-r24 (sample-matrix cure, two coverage views, denominator floor, live-round UI trio)   [external-action, Smith]
  - cue_placement: rename DONE r16; awaiting Architecture's 1,665-item key migration, then ExistentialAuthor's ex_form_neg_01 unset   [inter_chat, Next: Architecture]
  - also_credits markpoint field - future Housing pass   [OPEN_QUESTIONS, parked]
  - whole-answer anchoring match_at "exact" - future Housing pass   [OPEN_QUESTIONS, parked]
  - live-verify r17: small-cell pulse + in-session level toggles; vocab builder deeper reactions still welcome   [acceptance, Smith]
  - RESOLVED 2026-07-18: row-height question settled by keeping BOTH as toggleable views (r22)
  - RESOLVED 2026-07-18: scoring ruling arrived (denominator floor) and shipped r23
  - residue engine build: awaiting Architecture's go + 2 rulings (all-matches subtraction; whole-prompt licensing)   [inter_chat, Next: Architecture]
  - person-split 6-band render + event person-tagging: queued behind Architecture's schema migration   [inter_chat, not yet my turn]
  - DISCHARGED 2026-07-18: site pushed through r16 (repo 0/0 vs origin), Apps Script re-deployed, feedback.js carries the real endpoint - feedback delivery live

### ImperativoAuthor - parked / none (updated 2026-07-18)
- Classes: all-seats, all-authors
- Wave-2 usage+register delivered (32 grammar + 16 translation, 0 errors, 19 Rev-27 cross-credit items). Formation branch complete. Awaiting Architecture acceptance of the new batch.
  - none (wave-2 delivered; awaiting Architecture acceptance)

### ImperfectAuthor - parked / none (updated 2026-07-17)
- Classes: all-seats, all-authors
- One-sitting bundle complete. All 3 OPEN threads closed on my end; awaiting Architecture CLOSED stamps.

### IndefiniteAuthor - parked / none (updated 2026-07-18)
- Classes: all-seats, all-authors
- Batch DELIVERED on Smith's ruling (a) — 61 grammar + 25 translation, all 9 leaves, zero zero-coverage; marker replica 62 markpoints / 0 findings after fixing 2 live false-credit bugs it caught. Five asks open to Architecture, none blocking.
  - Architecture_IndefiniteAuthor_free_choice_mood_seam.md v1   [inter_chat, Next: Architecture]
  - Architecture_IndefiniteAuthor_batch_delivery.md v1          [inter_chat, Next: Architecture]

### MisconceptionAnalyst - parked / none (updated 2026-07-17)
- Classes: all-seats
- Pass-1 EXTENSION delivered (v15): all 132 common_miss buckets across the 19 never-harvested topics read; 18 new specifics + 4 broadenings + 1 new family (derivation) proposed in data/misconception_suggestions_pass1_extension.json. Registry would go 75 -> ~93. Nothing owed by me; five items owed by Architecture.
  - (none active) — tag-lists for the 19 new topics are mechanical once Architecture ratifies the extension ids. Will produce on ratification.

### NegationAuthor - parked / decision (updated 2026-07-18)
- Classes: all-seats, all-authors
- Negation live and accepted (41 grammar + 22 translation, 9 leaves, validation 0/0, replica clean). Nothing to author. Raw name-grep showed 6; after triage the queue is two all-authors retrofits, both RUN clean this turn and awaiting Architecture's stamp, plus one thread on Architecture's side. Nothing owed by me.
  - Criterion 13 chip self-audit — RUN this turn, ZERO hits, zero rewrites. Register says RUNNING, compliance 1 of ~25 author seats; my name never appears, only the class token found it. Awaiting Architecture stamp.   [AUTHOR_BRIEF binding register]
  - Rev 25 citation-form-level audit — RUN this turn. Two citation cues (neg_ameno_01 "(piovere)", neg_ameno_02 "(essere)"), both on C1 items with A1 lemmas, so the exemption holds and no gloss is needed. Zero changes. Awaiting Architecture stamp.   [AUTHOR_BRIEF Rev 25, binds all-authors]
  - Architecture_NegationAuthor_criterion20_retrofit.md — OPEN, Next: Architecture, not my turn. Two live asks: Rev 22's next-touch clause missed negation (11 items); proposed criterion-20 extension for one-to-one glosses.   [inter_chat]

### NounAuthor - parked / decision (updated 2026-07-18)
- Classes: all-seats, all-authors
- batch ACCEPTED 2026-07-15 with both asks answered; wake self-check finds one explicit ruling still undelivered after 3 days (candidate_forms on 4 meaning-pair items) plus two unstamped class retrofits that my name alone could never have found (crit 13, Rev 25); the italia.verb defect routed to me is already fixed on disk, reported not self-stamped
  - candidate_forms + correct_form + suppress on 4 meaning-pair items (noun_plur_irr_03/04, noun_gen_e_08/09); check Rev 19 recoverability   [Architecture_NounAuthor_batch_disposition v1, my turn, ruled 2026-07-15]
  - crit-13 chip self-audit, 52 items: NOT RUN   [AUTHOR_BRIEF binding register: all-authors, RUNNING, compliance 1 of ~25 seats]
  - Rev 25 cue-level audit, 52 items: NOT RUN   [AUTHOR_BRIEF Rev 25: binds all-authors, retrofit = audit cues against item levels]
  - italia.verb (noun_gen_e_08): already fixed centrally to vocabulary.it.italia.noun.translation; PassiveAuthor's routing is stale, awaiting Architecture stamp/withdrawal   [evidence: item on disk]

### PiacereAuthor - closed / none (updated 2026-07-18)
- Classes: all-seats, all-authors
- batch live and accepted (delivery thread CLOSED v3, manifest verified); wake self-check found two unstamped class retrofits, both audited clean this turn and filed for stamping; Smith ruled the Rev 25 cue call (exemption holds, zero changes)
  - Criterion 13 chip self-audit: DONE. 29 cues / 38 items, 0 rule-naming hits, 0 rewrites. Evidence filed; awaiting Architecture stamp (not mine to apply).   [class_retrofit_audits v1; AUTHOR_BRIEF Rev 24 register, binds all-authors]
  - Rev 25 cue-level audit: DONE. 13 citation cues (8 A1); Smith ruled 2026-07-18 exemption holds, 0 changes. Evidence filed; awaiting Architecture stamp.   [class_retrofit_audits v1; AUTHOR_BRIEF Rev 25, binds all-authors]

### PossessiveAuthor - parked / none (updated 2026-07-18)
- Blocked by: none
- Classes: all-seats, all-authors
- Wave-2 pass done - 3 new leaves authored (predicate/postposed/proprio), cue-notation converted (36), candidate_forms retrofitted (5 suo). All validated 0/0. Awaiting Architecture acceptance + stamps.

### PrepositionAuthor - closed / none (updated 2026-07-17)
- Classes: all-seats, all-authors
- batch live (82+24, seven touches); Rev 23 re-check + crit-13 audit run today, both clean; two stamps awaited from Architecture
  - awaiting Architecture stamps only: Rev 23 (evidence cue_meaning_framing v5) + crit-13 (evidence coverage seventh touch)  [not blocked; nothing to do]
  - wave-2 dispatch when Architecture cuts it (dipendere da / contare su / fidarsi di; negative-drops-partitive)  [parked]

### PresentFormationAuthor - closed / none (updated 2026-07-17)
- Classes: all-seats, all-authors
- batch live and ACCEPTED (91 grammar + 32 translation, + PresentUsage's 12/12 sharing the topic file); Smith's two rulings applied today (Rev 25 gloss on 6 clitic-lemma cues; sedere_1pl reworded); crit-13 audit clean; nothing owed to Smith
  - awaiting Architecture only, not blocked: TWO STAMPS + one ratification
  - crit 17 [all-authors]: DISCHARGED for this topic by Cr17Sweep, not by me — 91 glossed, marker
  - PresentUsage / TenseChoice own the usage + discrimination stubs. Not mine, no action.

### PronominalVerbsAuthor - blocked / external-action (updated 2026-07-18)
- Blocked by: Architecture — ratify/place pronominal_verbs.meaning.frozen_tail_idioms (11 grammar + 3 translation forward-reference it; production load strict-rejects until it exists)
- Classes: all-seats, all-authors
- Original batch ACCEPTED 2026-07-15. Smith commissioned the frozen-tail idioms C1 pass 2026-07-18; authored and on disk (10 new grammar + 3 translation, pv_adv_frozentail_01 re-homed, topic now 56/23), validates clean, forward-referencing a leaf Architecture must place. Two all-authors class retrofits (crit 13, Rev 25) re-run clean and reported for stamping.
  - Architecture_PronominalVerbsAuthor_frozen_tail_idioms v1  [inter_chat, Architecture's turn — ratify/place leaf; my work is delivered and waiting on it]
  - Architecture_PronominalVerbsAuthor_class_retrofit_audits v1  [inter_chat, Architecture's turn — stamp crit 13 + Rev 25 for this seat]

### PronounAuthor - closed / none (updated 2026-07-17)
- Classes: all-seats, all-authors
- 12 dark-leaf translation items authored (216 grammar + 68 translation, 0 dark leaves). All five rev19_audit asks discharged. Three architect stamps outstanding (evidence on disk, no action from me).

### RelativePronounAuthor - parked / external-action (updated 2026-07-18)
- Classes: all-seats, all-authors
- batch live and settled; wake self-check found two unstamped class retrofits (crit 13, Rev 25), both audited clean same turn, evidence filed for stamping; pos-worklist census decrement still pending
  - crit-13 chip self-audit: DONE, evidence filed, awaiting Architecture stamp   [class_retrofit_audits v1]
  - Rev 25 cue-level audit: DONE, evidence filed, awaiting Architecture stamp    [class_retrofit_audits v1]
  - pos-migration worklist: cleared 2026-07-17, awaiting census decrement 175->169   [pos_worklist_cleared v1]

### ReportedSpeechAuthor - blocked / decision (updated 2026-07-18)
- Blocked by: Smith - suppression-scope decision (options A/B/C given in chat)
- Classes: all-seats, all-authors
- thread v4 ruled all four asks in my favour and ordered two authoring tasks; both class retrofits (crit 13, Rev 25) audited clean this turn with zero exposure, evidence ready to file for stamping; one decision owed before I author
  - Author 4-6 items on the persisting-fact leaf "Still true: shift optional" - registered, active, ZERO items today   [thread v4 ruling 4]
  - Author the condizionale non-shift item (hypothetical stays put; futurity shifts, cited to future_to_past)          [thread v4 closing ruling]
  - crit-13 chip self-audit: RUN, 0 cue chips in 39 items, 0 rule-naming, 0 rewrites - awaiting Architecture stamp     [class clause, all-authors, no stamp for this seat]
  - Rev 25 cue-level audit: RUN, prompt_supplies_base_form false on all 39, zero citation-form cues - awaiting stamp    [class clause, all-authors, no stamp for this seat]
  - decision: unsuppress the 16 commands/questions/deixis items now the labels are shortened at source                  [chat, options A/B/C]

### SiConstructionsAuthor - parked / none (updated 2026-07-18)
- Classes: all-seats, all-authors
- Ruled 0.5 parity flip APPLIED to all nine items and marker-verified; batch live and clean; nothing owed to Smith. Two audit stamps + a register-wording check sit with Architecture.
  - (DONE this turn) 0.5 parity flip, nine items — applied, harness 22/22, recorded at thread v3.
  - Awaiting Architecture (not my action): discharge stamps for the crit-13 and Rev-25 audits (both run clean, evidence on disk); confirm/replace my interim register note; ratify impersonal.ci_si leaf; ratify classes.

### TenseChoiceAuthor - parked / none (updated 2026-07-18)
- Classes: all-seats, all-authors
- nothing owed on the queue side; wave-2 fully accepted (128 tags / 124 items / zero bare, marker replica green); wake self-check found two unstamped class retrofits (crit 13, Rev 25), both audited clean this turn with zero exposure; crit 17 discharged in substance but the estate-table row carries no per-seat stamp for this seat; evidence filed for all three in class_retrofit_audits v1
  - Crit 13 rule-naming chip audit: DONE, 124 prompts scanned, zero exposure, evidence filed, awaiting Architecture stamp   [inter_chat/Architecture_TenseChoiceAuthor_class_retrofit_audits.md v1]
  - Rev 25 citation-form cue level audit: DONE, 124 prompts scanned, zero cues to level-check, evidence filed, awaiting Architecture stamp   [class_retrofit_audits v1]
  - Crit 17 stamp gap: discharged by wave2_delivery v1 + confirmed by Cr17Sweep exposure survey, table row still unstamped for this seat, flagged for bookkeeping   [class_retrofit_audits v1]

### Vocab - closed / none (updated 2026-07-17)
- Classes: all-seats
- Chemistry prune + extension to five other science sub-themes applied (49 entries + 49 science_technology parent strips). Thread at v6 awaiting Architecture stamp on the DECISIONS clause. Nothing else owed.

### WordFormationAuthor - parked / decision (updated 2026-07-18)
- Classes: all-seats, all-authors
- Batch complete and ACCEPTED (thread CLOSED v6, 39 grammar + 11 translation). Nothing owed on any thread. Two class-token retrofits bind me via all-authors and are unstamped for this seat; both are expected near-no-ops but neither has been run. One discharged clause (DECISIONS 996) needs an architect stamp.
  - Criterion 13 retrofit: self-audit my 39 items' cue texts for rule-naming. Unrun for this seat; compliance is 1 of ~25 author seats. Expect the PrepositionAuthor verdict (output-form naming, triage clean) since my cues name diminutivo/accrescitivo/peggiorativo, but it has not been run.   [AUTHOR_BRIEF binding register, binds: all-authors]
  - Rev 25 criterion-20 level audit: check each cue's citation form sits at or below its item's CEFR level. Expect a no-op (cue lemmas are A1-A2; items are B2/C1).   [AUTHOR_BRIEF Rev 25, binds: all-authors, retrofit]
  - Self-identified gap (not commissioned): my batch was authored 2026-07-15, BEFORE criterion 20 landed (Rev 22, 2026-07-16). Crit 20's named candidate class was PrepositionAuthor + ComparisonAuthor only, and Cr17Sweep's net opens only the 5 bare topics, which exclude word_formation. So nothing has ever checked my cues against criterion 20. This is the pas_and_02 shape Cr17Sweep flagged at its v-thread line 59.

## Thread ledger (open threads, whose turn, sitting how long)

164 threads on disk, 51 open. Sorted oldest-last-write first.

### Turn: Architecture (38)
- `Architecture_NegationAuthor_criterion20_retrofit.md` - last wrote NegationAuthor on 2026-07-15 (5d sitting) [Next:]
  - Next: Architecture (accept the retrofit; rule the proposed criterion-20 extension; route adv_bb_07)
- `Architecture_NegationAuthor_scope_ratified.md` - last wrote NegationAuthor on 2026-07-15 (5d sitting) [inferred from last author]
- `Architecture_Cr17Sweep_adjective_agreement.md` - last wrote Cr17Sweep on 2026-07-17 (3d sitting) [Next:]
  - Next: Architecture (route the buono_02 bug to AdjectiveAuthor; stamp when satisfied)
- `Architecture_Cr17Sweep_congiuntivo.md` - last wrote Cr17Sweep on 2026-07-17 (3d sitting) [Next:]
  - Next: Architecture (route the pagare observation to CongiuntivoFormationAuthor if you agree; stamp when satisfied)
- `Architecture_Cr17Sweep_future.md` - last wrote Cr17Sweep on 2026-07-17 (3d sitting) [Next:]
  - Next: Architecture (route the vedrò bug + two observations to FutureFormationAuthor; stamp when satisfied)
- `Architecture_Cr17Sweep_imperfect.md` - last wrote Cr17Sweep on 2026-07-17 (3d sitting) [Next:]
  - Next: Architecture (route the volere flag + two answer-leak observations to ImperfectAuthor; stamp when satisfied)
- `Architecture_Cr17Sweep_present_indicative.md` - last wrote Cr17Sweep on 2026-07-17 (3d sitting) [Next:]
  - Next: Architecture (stamp or query; two observations routed to PresentFormationAuthor)
- `Architecture_Housing_verb_formation_person_split.md` - last wrote Architecture on 2026-07-17 (3d sitting) [Next:]
  - Next: Architecture (ratify schema + run the derivable migration), then Housing (6-band render), then authors (backfill residue)
- `Architecture_PassiveAuthor_criterion20_cue_leak.md` - last wrote PassiveAuthor on 2026-07-17 (3d sitting) [inferred from last author]
- `Architecture_PassiveAuthor_usage_branch_delivery.md` - last wrote PassiveAuthor on 2026-07-17 (3d sitting) [inferred from last author]
- `Architecture_PresentFormationAuthor_rev25_and_stamps.md` - last wrote PresentFormationAuthor on 2026-07-17 (3d sitting) [Next:]
  - Next: Architecture (two stamps + one ratification)
- `Architecture_PronounAuthor_brief_rev19_audit.md` - last wrote PronounAuthor on 2026-07-17 (3d sitting) [Next:]
  - Next: Architecture (close thread + stamp 3 discharged clauses)
- `AdjectiveAuthor_Cr17Sweep_hygiene_work_order.md` - last wrote AdjectiveAuthor on 2026-07-18 (2d sitting) [Next:]
  - Next: Architecture
- `AdverbAuthor_Architecture_rev25_cue_level_retrofit.md` - last wrote AdverbAuthor on 2026-07-18 (2d sitting) [Next:]
  - Next: Architecture (stamp the Rev 25 discharge for this seat; rule the remedy collision; adv_bb_07 needs no routing, it is fixed)
- `Architecture_AdjectiveAuthor_buono_02_prompt_bug.md` - last wrote AdjectiveAuthor on 2026-07-18 (2d sitting) [Next:]
  - Next: Architecture
- `Architecture_ArticleAuthor_class_retrofit_audits.md` - last wrote ArticleAuthor on 2026-07-18 (2d sitting) [Next:]
  - Next: Architecture
- `Architecture_ArticleAuthor_discrimination_candidate_forms.md` - last wrote ArticleAuthor on 2026-07-18 (2d sitting) [Next:]
  - Next: Architecture
- `Architecture_CongiuntivoFormationAuthor_compound_leaf_label_hygiene.md` - last wrote CongiuntivoFormationAuthor on 2026-07-18 (2d sitting) [Next:]
  - Next: Architecture (rule on the relabel; stamp when satisfied)
- `Architecture_ConnectiveAuthor_batch_delivery.md` - last wrote ConnectiveAuthor on 2026-07-18 (2d sitting) [Next:]
  - Next: Architecture
- `Architecture_DemonstrativeAuthor_class_retrofit_audits.md` - last wrote DemonstrativeAuthor on 2026-07-18 (2d sitting) [Next:]
  - Next: Architecture (three stamps to apply + one ruling to make)
- `Architecture_ExistentialAuthor_cue_level_and_additive_credit.md` - last wrote ExistentialAuthor on 2026-07-18 (2d sitting) [Next:]
  - Next: Architecture
- `Architecture_FutureFormationAuthor_class_retrofit_audits.md` - last wrote FutureFormationAuthor on 2026-07-18 (2d sitting) [Next:]
  - Next: Architecture
- `Architecture_FutureFormationAuthor_vedere_ci_bug.md` - last wrote FutureFormationAuthor on 2026-07-18 (2d sitting) [Next:]
  - Next: Architecture
- `Architecture_GerundioAuthor_selfcheck_discharge.md` - last wrote GerundioAuthor on 2026-07-18 (2d sitting) [Next:]
  - Next: Architecture
- `Architecture_Housing_cue_placement.md` - last wrote Housing on 2026-07-18 (2d sitting) [Next:]
  - Next: Architecture (migrate the 1,665 items to the new key; same push as r16); then ExistentialAuthor (unset ex_form_neg_01) + Cr17Sweep (straggler net)
- `Architecture_Housing_extraneous_word_residue.md` - last wrote Housing on 2026-07-18 (2d sitting) [Next:]
  - Next: Architecture (rule on the go + the two design choices in v2: all-matches subtraction, whole-prompt token licensing)
- `Architecture_ImperativoAuthor_discharges.md` - last wrote ImperativoAuthor on 2026-07-18 (2d sitting) [Next:]
  - Next: Architecture (stamp 4 clauses)
- `Architecture_IndefiniteAuthor_batch_delivery.md` - last wrote IndefiniteAuthor on 2026-07-18 (2d sitting) [Next:]
  - Next: Architecture
- `Architecture_IndefiniteAuthor_free_choice_mood_seam.md` - last wrote IndefiniteAuthor on 2026-07-18 (2d sitting) [Next:]
  - Next: Architecture
- `Architecture_PiacereAuthor_class_retrofit_audits.md` - last wrote PiacereAuthor on 2026-07-18 (2d sitting) [Next:]
  - Next: Architecture (two stamps + one class ratification requested)
- `Architecture_PossessiveAuthor_class_retrofit_audits.md` - last wrote PossessiveAuthor on 2026-07-18 (2d sitting) [Next:]
  - Next: Architecture (stamp the compliance table)
- `Architecture_PossessiveAuthor_edge_patterns.md` - last wrote PossessiveAuthor on 2026-07-18 (2d sitting) [Next:]
  - Next: Architecture (accept + clear the three stubs)
- `Architecture_PossessiveAuthor_suo_leaf_and_discrimination_fields.md` - last wrote PossessiveAuthor on 2026-07-18 (2d sitting) [Next:]
  - Next: Architecture (accept + close)
- `Architecture_PronominalVerbsAuthor_class_retrofit_audits.md` - last wrote PronominalVerbsAuthor on 2026-07-18 (2d sitting) [Next:]
  - Next: Architecture (stamps)
- `Architecture_RelativePronounAuthor_class_retrofit_audits.md` - last wrote RelativePronounAuthor on 2026-07-18 (2d sitting) [Next:]
  - Next: Architecture
- `Architecture_TenseChoiceAuthor_class_retrofit_audits.md` - last wrote TenseChoiceAuthor on 2026-07-18 (2d sitting) [Next:]
  - Next: Architecture
- `Architecture_TenseChoiceAuthor_criterion_compliance.md` - last wrote TenseChoiceAuthor on 2026-07-18 (2d sitting) [Next:]
  - Next: Architecture
- `Architecture_ConditionalFormationAuthor_usage_wave2.md` - last wrote ConditionalFormationAuthor on 2026-07-20 (0d sitting) [Next:]
  - Next: Architecture

### Turn: (unknown) (2)
- `Architecture_AdverbAuthor_batch_disposition.md` - last wrote ? on ? (? sitting) [inferred from last author]
- `EdTechOverview_Architecture_shared_login_and_pulse_adoption.md` - last wrote ? on ? (? sitting) [inferred from last author]

### Turn: none (1)
- `Architecture_Coverage_denominators_and_policy.md` - last wrote Architecture on 2026-05-28 (53d sitting) [Next:]
  - Next: none (reference doc)

### Turn: ConditionalFormationAuthor (1)
- `Architecture_ConditionalFormationAuthor_batch_delivery.md` - last wrote Architecture on 2026-07-15 (5d sitting) [inferred from last author]

### Turn: ImperativoAuthor (1)
- `Architecture_ImperativoAuthor_short_form_marker_apostrophe.md` - last wrote Architecture on 2026-07-15 (5d sitting) [inferred from last author]

### Turn: ReportedSpeechAuthor (1)
- `Architecture_ReportedSpeechAuthor_batch_disposition.md` - last wrote Architecture on 2026-07-15 (5d sitting) [Next:]
  - Next: ReportedSpeechAuthor (four ruled asks to absorb)

### Turn: the (1)
- `Architecture_ALLAUTHORS_cue_notation_renders_use_english.md` - last wrote Architecture on 2026-07-17 (3d sitting) [Next:]
  - Next: the eight named authors below (pronoun 80, possessive 29, piacere 12, adverb 7, relative_pronoun 4, imperfect 2, adjective_agreement 1, preposition 1)

### Turn: ImperfectAuthor (1)
- `Architecture_ImperfectAuthor_vol_01_prompt_bug.md` - last wrote Architecture on 2026-07-17 (3d sitting) [Next:]
  - Next: ImperfectAuthor

### Turn: MisconceptionAnalyst (1)
- `Architecture_MisconceptionAnalyst_registry_harvest.md` - last wrote Architecture on 2026-07-17 (3d sitting) [Next:]
  - Next: MisconceptionAnalyst (fill the ~152 tag-lists thoroughly; then bring v13's proposals as a discrete list)

### Turn: PronounAuthor (1)
- `Architecture_PronounAuthor_criterion13_chip_audit.md` - last wrote Architecture on 2026-07-17 (3d sitting) [Next:]
  - Next: PronounAuthor (judge 5 chips; the other 5 hits are triaged as false positives, no action)

### Turn: DemonstrativeAuthor (1)
- `Architecture_DemonstrativeAuthor_live_round_mano_and_meaning.md` - last wrote Architecture on 2026-07-19 (1d sitting) [Next:]
  - Next: DemonstrativeAuthor

### Turn: MetaProject (1)
- `Architecture_MetaProject_status_board_pilot.md` - last wrote MetaProject on 2026-07-19 (1d sitting) [Next:]
  - Next: MetaProject (regenerate the board; before/after is the pilot evidence) + Smith (the two Waiting-on-Smith decisions stand)

### Turn: NegationAuthor (1)
- `Architecture_NegationAuthor_finche_non_explanation.md` - last wrote Architecture on 2026-07-19 (1d sitting) [Next:]
  - Next: NegationAuthor

## Staleness audit (open, no write for 14+ days)

- `Architecture_Coverage_denominators_and_policy.md` - 53 days silent, turn: none

## Class clauses (`binds:`) and discharge stamps

- **binds: all-authors** (DECISIONS.md) - stamps: AdverbAuthor, ArticleAuthor, FutureFormationAuthor, PiacereAuthor, PossessiveAuthor, PresentFormationAuthor, PronominalVerbsAuthor, RelativePronounAuthor, TenseChoiceAuthor
  - ecomes a gate rather than a scaffold. **Where the citation form is above the item's level, gloss in English instead.** `binds: all-authors`; ExistentialAuthor first (32 esserci cues, 14 at A1). [discharged: PresentFormationAuthor, 2026-07-17, rev25_and_stamps v1 — 6 clitic-lemma cues reglossed to
  - Compliance (of seats declaring `all-authors`): 9/27 stamped; missing: AdjectiveAuthor, ComparisonAuthor, ConditionalFormationAuthor, CongiuntivoFormationAuthor, ConnectiveAuthor, DemonstrativeAuthor, ExistentialAuthor, GerundioAuthor, ImperativoAuthor, ImperfectAuthor, IndefiniteAuthor, NegationAuthor, NounAuthor, PrepositionAuthor, PronounAuthor, ReportedSpeechAuthor, SiConstructionsAuthor, WordFormationAuthor
- **binds: all-authors** (DECISIONS.md) - stamps: all-authors except PronounAuthor
  - `[discharged: all-authors except PronounAuthor, 2026-07-17, central chip audit]`. **This is the general shape for any `binds: all-authors` retrofit that is mechanically detectable: Architecture runs it once, stamps the class, routes the residue.** A per-seat self-audit is for judgement work only.
  - Compliance (of seats declaring `all-authors`): 0/27 stamped; missing: AdjectiveAuthor, AdverbAuthor, ArticleAuthor, ComparisonAuthor, ConditionalFormationAuthor, CongiuntivoFormationAuthor, ConnectiveAuthor, DemonstrativeAuthor, ExistentialAuthor, FutureFormationAuthor, GerundioAuthor, ImperativoAuthor, ImperfectAuthor, IndefiniteAuthor, NegationAuthor, NounAuthor, PiacereAuthor, PossessiveAuthor, PrepositionAuthor, PresentFormationAuthor, PronominalVerbsAuthor, PronounAuthor, RelativePronounAuthor, ReportedSpeechAuthor, SiConstructionsAuthor, TenseChoiceAuthor, WordFormationAuthor
- **binds: all-authors** (AUTHOR_BRIEF.md) - stamps: none yet
  - greement item names the diagnostic; "'i libri' is masculine plural" gives the context the learner needs to perform it. `binds: all-authors`; `retrofit:` **DISCHARGED CENTRALLY** for 26 of 29 topics by the audit — real exposure is 5 chips, all in `pronoun`, routed to PronounAuthor. **Revision 25**
  - Compliance (of seats declaring `all-authors`): 0/27 stamped; missing: AdjectiveAuthor, AdverbAuthor, ArticleAuthor, ComparisonAuthor, ConditionalFormationAuthor, CongiuntivoFormationAuthor, ConnectiveAuthor, DemonstrativeAuthor, ExistentialAuthor, FutureFormationAuthor, GerundioAuthor, ImperativoAuthor, ImperfectAuthor, IndefiniteAuthor, NegationAuthor, NounAuthor, PiacereAuthor, PossessiveAuthor, PrepositionAuthor, PresentFormationAuthor, PronominalVerbsAuthor, PronounAuthor, RelativePronounAuthor, ReportedSpeechAuthor, SiConstructionsAuthor, TenseChoiceAuthor, WordFormationAuthor
- **binds: all-authors** (AUTHOR_BRIEF.md) - stamps: none yet
  - level, gloss the target in English instead** ("[Are there any questions?]"), per criterion 20's main rule. Next-touch: `binds: all-authors`; `retrofit:` audit your cues against your items' levels — ExistentialAuthor first (32 esserci-cued items, 14 of them A1). **Revision 24** (2026-07-17). From S
  - Compliance (of seats declaring `all-authors`): 0/27 stamped; missing: AdjectiveAuthor, AdverbAuthor, ArticleAuthor, ComparisonAuthor, ConditionalFormationAuthor, CongiuntivoFormationAuthor, ConnectiveAuthor, DemonstrativeAuthor, ExistentialAuthor, FutureFormationAuthor, GerundioAuthor, ImperativoAuthor, ImperfectAuthor, IndefiniteAuthor, NegationAuthor, NounAuthor, PiacereAuthor, PossessiveAuthor, PrepositionAuthor, PresentFormationAuthor, PronominalVerbsAuthor, PronounAuthor, RelativePronounAuthor, ReportedSpeechAuthor, SiConstructionsAuthor, TenseChoiceAuthor, WordFormationAuthor

Declared classes so far: all-authors, all-seats. Seats without a `_status/` file are invisible
to compliance; the walk-the-seats step is what fixes that.

