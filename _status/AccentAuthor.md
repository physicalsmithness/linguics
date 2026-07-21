seat: AccentAuthor
classes: [all-seats, all-authors]
project: Linguics
updated: 2026-07-21
waiting: parked
needs_from_smith: decision
blocked_by: Architecture — run variant pipeline over seed frames + rule Q1-Q4; Smith — Q5 (insertion credit) + Q6 (per-class omission severity)
claude_can_verify: n/a — rulings + Architecture-side pipeline run
summary: Taxonomy ratified (6 leaves live, event contract with Housing). Deliverable 2 DELIVERED: incoming drafts/accent_seed_v0.json (3 frame families, 6 class seeds, outcome model). Smith's v4 verdict ruling folded: DRILL DOCKS (correct 1.0 / wrong_kind 0.8 / omission 0.5; grammar marker unchanged). Central finding: bare frames (misspelling-twin classes = free volume) vs context frames (real-word-twin classes = hand-seeded carriers). 6 open Qs: Q1 person-pairs held out, Q2 judgement false-alarm, Q3 topic_short=acc, Q4 ciò/dì, Q5 insertion credit, Q6 per-class omission severity. Files: seed json + inter_chat/AccentAuthor_Architecture_seed_frames.md v2.
queue:
  - WAITING Architecture: pipeline expansion + Q1-Q4 [seed_frames thread]
  - WAITING Smith: Q5 insertion credit, Q6 per-class omission severity [chat decision]
  - THEN: sample-review first expansion (A(a)); fold rulings; add carrier volume to context classes
