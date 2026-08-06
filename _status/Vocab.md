seat: Vocab
classes: [all-seats]
project: Linguics
updated: 2026-08-03
waiting: parked
needs_from_smith: none
blocked_by:
claude_can_verify: n/a
summary: Fourth sweep this turn caught the two biggest asks yet — marker_semantics v10 UN-PARKED (tv/televisione bug overturns v9's opportunistic-population stance; 1126 tier-1 proposals from QoderWork to ratify) + brand-new noun_class_taxonomy thread (Smith flagged the panel live; 542 residue + 644 loanword proposals from QoderWork). Both ratified where safe: 732 equivalence_class proposals applied (1543 new tags, 1550 total), 123 loanword genders applied, 88 noun_class mechanical rules applied.
queue: []
watchlist:
  - Architecture_Vocab_stress_sidecar — routed 2026-07-27 (DECISIONS 1628); thread not yet opened; will pick up on opening
  - noun_class residue (454 remaining) — per-entry judgement; needs architect ruling on new classes (shortened_o_fem, invariable_i_fem, number-axis field)
  - equivalence_class deferred (394 proposals) — near-synonym/no-shared-token/bridge-word cases; correct to defer, opportunistic later
  - marker_semantics tier-2 (abbreviation/full-form pairs like tv/televisione) — architect owes a spec
notes:
  - Class token declaration: [all-seats] only. Ratified in AUTHOR_BRIEF Rev 24.
  - Wake-check has now failed FOUR times in one turn — each of Smith's "check again" prompts found more. Root pattern is the same across all four: I check "what's addressed to me OPEN" but miss (a) OPEN threads where other seats have replied since my last discharge, (b) fresh threads opened after my last check, (c) UN-PARKED threads I'd closed prematurely. Consistent fix: on every wake, grep Next:.*Vocab across ALL threads regardless of prior belief; treat "closed" and "parked" statuses on my side as guesses, not facts, until re-verified.
  - Data state: 18,048 entries. Equivalence_class: 1550 tagged across 738 classes. Gender_class: 200 explicit tags. Loanwords with real translations now have m gender (123 fixed). Ambiguous-gender count: 1019 → 896.
  - Tools this turn (session file count now 8): fix_multi_valid_translations.py, tag_gender_class.py, resolve_vocab_help_residue.py, prune_science_polysemy.py, apply_equivalence_class_proposals.py, apply_noun_class_and_loanwords.py, plus inline python for delete/insert/retag/re-tag passes.
