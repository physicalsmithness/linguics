seat: Vocab
classes: [all-seats]
project: Linguics
updated: 2026-08-03
waiting: parked
needs_from_smith: none
blocked_by:
claude_can_verify: n/a
summary: Third sweep this turn caught two more Housing responses I'd missed — marker_semantics v8 (r111 shipped) and gender_plural_drill v6+NounAuthor reply (class 5/7 boundary). Both actioned. Everything I've been asked for is now applied or acknowledged.
queue: []
watchlist:
  - Architecture_Vocab_stress_sidecar — routed 2026-07-27 (DECISIONS 1628, StressAuthor thread); thread not yet opened; will pick up on opening
  - marker_semantics further-alternatives population — opportunistic, Housing shipped the display fix; more alternatives arrive on specific asks
notes:
  - Class token declaration: [all-seats] only (not all-authors). Ratified in AUTHOR_BRIEF Rev 24.
  - Wake-check lessons compounding this turn — Smith prompted "have you checked all your nexts" and I found three items I'd missed on the first self-check; his followup "carry on" implicitly pushed a third sweep and I found TWO MORE (Housing responses to my earlier discharges, marker_semantics v8 and gender_plural_drill v6+NounAuthor reply). The pattern: my sweeps look for "what's addressed to me OPEN" but miss OPEN threads where OTHER seats have replied since my last discharge. Fix for next sweep: grep Next: Vocab across ALL threads regardless of my prior belief about their status.
  - Data state: 18,048 entries. Gender_class explicit tags: 200 (Class 3=147, 4=32, 5=6, 6=2, 7=13); Housing derives 1, 2, and additional 5 automatically.
  - Tools this turn: fix_multi_valid_translations.py, tag_gender_class.py, resolve_vocab_help_residue.py, prune_science_polysemy.py; plus inline python for delete/insert/retag passes.
