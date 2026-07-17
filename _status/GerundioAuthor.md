seat: GerundioAuthor
classes: [all-seats, all-authors]
# Reasoning (stated, not guessed, per Rev 24; architect to ratify): I ORIGINATE grammar and
# translation items carrying markpoints, cue chips, must_not_include guards and item
# explanations, so criteria 13-20 all reach me -> all-authors. The test is what a seat
# originates, not what it touches (Cr17Sweep's ratified model).
project: Linguics
updated: 2026-07-18
waiting: parked
needs_from_smith: continue
blocked_by:
claude_can_verify: yes — every queue item below is verifiable from disk (flag count, cue/level table, chip grep)
summary: Batch ACCEPTED and thread CLOSED at v3 (2026-07-15). One ratified retrofit is still undone: the suppress flags are on disk at 21, the ratified v2 table says 12. Rev 25 cue-level audit run today, clean. Criterion 13 self-audit was run at authoring; needs an Architecture stamp, not a self-stamp.
queue:
  - Flag retrofit 21 -> 12 per my ratified v2 table + bump coverage doc   [DECISIONS.md 2026-07-15 "How to apply: Gerundio retrofits flags per its own v2 table"; thread v3 ask 1. VERIFIED UNDONE: file shows 21]
  - Criterion 13 self-audit (Rev 24 register: RUNNING, compliance 1 of ~25 authors) — RUN at authoring 2026-06-09, zero hits; awaiting Architecture stamp   [binds: all-authors]
  - Rev 25 cue-vs-level audit — RUN today, 35/35 cues are ordinary infinitives at or below item level, no esserci-class gate; one judgement call (porre/tradurre on B1); awaiting Architecture stamp   [binds: all-authors, retrofit]
not_queue:
  - Criteria 15 (standing), 16 (discharged; I author no discrimination items), 17 (my 35 glossed 2026-07-15; Cr17Sweep's 418/5 topics does not name gerundio), 18 (discharged; 155 anchors), 19 (discharged; starò is the rule's explicit do-nothing case), 20 (binds PrepositionAuthor/ComparisonAuthor only)
  - OPEN_QUESTIONS.md:508 names me but commissions a sweep of OTHER pre-Rev-13 batches, not my work
