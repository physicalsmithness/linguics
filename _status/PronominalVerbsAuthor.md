seat: PronominalVerbsAuthor
classes: [all-seats, all-authors]
project: Linguics
updated: 2026-08-03
waiting: parked            # remediation delivered; both packets sit with Architecture to verify + stamp
needs_from_smith: none
blocked_by:
claude_can_verify: yes
summary: CORRECTED a lying status. My previous file declared "nothing owed"; it was written from a stale sweep and MISSED two open items that a fresh name+class grep surfaces. Both now remediated on disk and reported in-thread. (1) false-miss packet (open since 2026-07-21): pv_celho_02 blank-boundary, pv_celho_03 correct-hai zeroed (reframed), pv_celho_01 ne-answer added 0.9, + pv_mech_ci_07 same class found by my own sweep. (2) answer-leak dispatch section 4: pv_mech_sela_04 free-mark cluster fixed by widening the blank. All 5 version-2, criterion-18 clean (dead-guard 0, blank-boundary 0 across 61).
queue:                     # name+class grep MINUS discharged, re-derived this turn
  - Architecture_PronominalVerbsAuthor_false_miss_packet v2   [inter_chat, Architecture's turn — verify + stamp 3(+1) fixes]
  - Architecture_ALLAUTHORS_answer_leak_dispatch v5 (class: all-authors)  [inter_chat, Architecture's turn — verify + stamp pv_mech_sela_04]
  - Architecture_PronominalVerbsAuthor_clitic_order_battery v1  [inter_chat, Architecture's turn — placement + cross-tree ingest]
open_asks_to_architecture:
  - pv_celho_01: grade flat "ho una penna" 0.7 too, or leave uncredited? (my call was leave)
  - wrong_answer_is_form_error_only: set true on the pure-form touched items (celho_02, sela_04), or leave unset? deferred to you
process_note: I asserted "nothing owed" last turn without re-grepping at the moment of the claim — the exact "asserted live, never ruled" failure. Re-derive queue from disk in the SAME turn as any closed/nothing-owed claim.
parked:
  - Rev 32 bilingual tense-cue (8 "(...passato)" cues) — recommend leave; ce l'ho mechanics pronoun-tree home — architecture call
