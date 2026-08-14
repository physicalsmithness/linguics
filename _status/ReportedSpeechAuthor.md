seat: ReportedSpeechAuthor
classes: [all-seats, all-authors]
project: Linguics
updated: 2026-08-13
waiting: parked
needs_from_smith: external-action   # route Architecture to tier2_exclusion v3 (merge the SEARCH return + stamp; rule the aggregate policy if they disagree)
blocked_by:
claude_can_verify: yes - the return regenerates from the corpus scan
summary: tier-2 SEARCH packet completed and returned. 913 reference translations scanned; 10 cross-topic items demonstrate reported_speech buckets (all in condizionale/imperfect batches, none previously citing any reported_speech bucket, deduped 0); 31 findings rows with full ancestor set. Read-verified: 2 false positives dropped, 1 clitic recall save, 5 hypothetical/dire+object flags correctly excluded. Answered the open aggregate question (claim ancestors; the real fix is a chain-walk). Nothing else owed.
queue:
  - tier-2 SEARCH: DONE + RETURNED to returned/; stamp proposed          [tier2_exclusion v3, Next: Architecture]
  - (settled) answer_leak section 5 STAMPED; batch CLOSED v6; crit-13 + Rev-25 STAMPED
