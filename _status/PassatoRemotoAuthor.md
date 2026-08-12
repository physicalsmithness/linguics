seat: PassatoRemotoAuthor
classes: [all-seats, all-authors]
project: Linguics
updated: 2026-08-12
waiting: parked            # tier-2 packet returned; trapassato-gloss flag open; both with Architecture; nothing blocked
needs_from_smith: none
blocked_by:
claude_can_verify: yes
summary: Tier-2 review packet DONE and returned (46 rows: 42 keep, 4 strike, 0 additions; strikes are participle-vs-PR morph false-positives). Trapassato English-gloss fix done my side, label-map gap flagged. Batch 68 grammar + 13 translation, all closed/accepted.
queue:
  - tier2_review_packet v2: returned to data/review_packets_tier2/returned/ -> awaiting Architecture merge on next wake   [not blocked]
  - trapassato_english_gloss v1: 3 cues fixed; awaiting Architecture to add trapassato_remoto -> "Past anterior" to the candidate-tense label map   [not blocked]
closed_confirmed:
  - answer_leak_dispatch: not named; 0 leaks across 68 (verified from disk).
  - cue_notation_renders_use_english: passato_remoto centrally retrofitted (task 7).
  - grading/level calls, crit-21 retrofit, false-miss, volume wave: CLOSED/ACCEPTED/STAMPED.
review_note:
  - tier-2 strikes were all participle homographs read as finite PR (presi/prese/chiusi/rimasti under an auxiliary); kept passive-auxiliary fu/venne, reported-speech disse, and trapassato-remoto ebbe/fu as genuine PR demonstrations.
housekeeping:
  - stray _status/PassatoRemotoAuthor.md.tmp cannot be removed from this mount (FUSE perms); harmless, board keys on <Seat>.md not .md.tmp.
