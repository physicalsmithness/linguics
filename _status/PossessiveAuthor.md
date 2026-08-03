seat: PossessiveAuthor
classes: [all-seats, all-authors]
project: Linguics
updated: 2026-07-18
waiting: parked
needs_from_smith: none
blocked_by: none
claude_can_verify: yes
summary: Wave-2 delivered + content re-audit done. Clean baseline validated 0/0. Found the batch is behind the current item schema (stale-brief root cause); flagged, not hand-migrated (central job).
queue: []
delivered_this_pass:
  - 3 leaves (predicate/postposed/proprio) 15g+9t; cue conversion (36); candidate_forms on 5 suo   [edge_patterns v3, suo_leaf v3]
  - homograph vocab fix piacere/dovere/diritto -> .noun (all other lemmas plain, rule 8)
open_for_architecture:
  - class_retrofit_audits v1  - crit-20 conversion + clean 13/17/18/19, awaiting stamps
  - schema_currency v1        - batch behind wrong_answer_is_form_error_only / common_errors / universal anchoring; ROOT CAUSE stale brief §2; fold into central migration or give me a spec
  - edge_patterns v3          - accept + clear 3 stubs
  - suo_leaf v3               - candidate_forms done, ready to close
note: an audit subagent over-wrote item fields with unverified values this pass; reverted to clean authored baseline (0/0).
