seat: PassatoRemotoAuthor
classes: [all-seats, all-authors]   # originates markpoints, cue chips, must_not_include, item explanations -> all-authors; every chat -> all-seats
project: Linguics
updated: 2026-07-20
waiting: parked            # two work orders executed today; both now Next:Architecture for verify+stamp; not blocked
needs_from_smith: none     # the four grading/level calls are routed to Architecture for first reading, not to Smith directly
blocked_by:
claude_can_verify: yes     # all retrofits verified from disk this turn (marker replica + containment audit)
summary: crit-21 formation-trigger retrofit DONE (35 cue-named + 4 frame-forced) and the 1 false-miss (partire) closed, same touch; rails green; both threads Next:Architecture. Batch 39 grammar + 13 translation, live.
queue:                     # DERIVED from name-grep + class-token grep, re-read 2026-07-20, MINUS discharged
  - formation_trigger_retrofit v2 (crit 21): 35 items reworked, reported -> awaiting Architecture verify + register stamp   [not blocked]
  - false_miss_packet v2: partire false-miss closed, reported -> awaiting Architecture verify + stamp   [not blocked]
  - grading_and_level_calls v1 (4 pedagogy calls): with Architecture for first reading, then Smith   [not blocked]
  - crit 13 / 17 / 20-Rev25 self-audits: run clean today -> awaiting Architecture stamps   [not blocked]
correction:                # my earlier wake declaration was WRONG and this records why
  - Prior _status said "parked, nothing owed". FALSE: two work orders (crit-21 35 items, 1 false-miss) had landed Next:PassatoRemotoAuthor AFTER my wake self-check grep ran, so the grep missed them. Caught them by listing inter_chat/ before writing. This is exactly the re-read-before-asserting failure mode the protocol warns of; the fix worked (a directory read, not memory).
discharged_evidence:
  - accent_flag_retrofit CLOSED v5; breadcrumb_label_leak CLOSED v2; crit 18 (my paradigm finding) executed estate-wide; crit 19 AccentAuditor 267/267
