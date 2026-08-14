seat: Vocab
classes: [all-seats]
project: Linguics
updated: 2026-08-14
waiting: parked
needs_from_smith: none
blocked_by:
  - Architecture: homograph-guard spec for eq-class subset-retry (marker_semantics v16 §1 — 4 options offered)
  - Architecture: schema call on shortened_o_fem, invariable_i_fem, number-axis field (noun_class_taxonomy v3)
  - Architecture: tier-2 spec for abbreviation/full-form + morphological pairs (marker_semantics v15 §5)
claude_can_verify: n/a
summary: 2026-08-14 wake found Architecture_Vocab_tier2_search_packet.md (cut 2026-08-13) — Vocab is IN wave 2 after Smith reversed the exclusion. Searched all 913 reference translations against my 180 freq-bands + 3 aggregates; emitted 8,677 findings across 118 distinct buckets (912/913 items touched — the one miss is `Digliene!` with a stacked clitic my stripper doesn't resolve). Applied the live rule per inter_chat v1 §3 (claim leaf + parent, coverage doesn't walk ancestors). Filtered [skip]/null-gloss/'?' entries before lookup to keep gap-fill artefacts from firing spurious bands. Returned to data/review_packets_tier2/returned/. Also this session (2026-08-12 sweep): deleted 7 gap-fill artefacts, applied orange_colour_noun eq-class, fixed stale v13 date; ran+reverted subset-retry reconcile (homograph-guard needed per v16 §1); delivered theme_axes v3 (21 MINT / 43 ENGINE-ONLY / 21 DROP verdict).
queue: []
watchlist:
  - Architecture reply on homograph guard — subset-retry re-run pending
  - Architecture ruling on new noun classes + number-axis field
  - Architecture tier-2 spec (abbreviation/full-form pairs)
  - Architecture_Vocab_stress_sidecar — routed 2026-07-27 (DECISIONS 1628); thread not yet opened
  - StressAuthor -ere lemma list — StressAuthor produces first; I merge if any lemma-level consequence
  - noun_class residue 454 remaining — needs architect ruling on new classes
  - Theme_axes ratification pass — architect rules on my 21 MINT / 43 ENGINE-ONLY / 21 DROP verdict + schema call on `hidden_from_picker` field
  - marker_semantics tier-2 (abbreviation/full-form pairs like tv/televisione) — architect owes a spec
  - [skip] entries — now 687 total after this sweep's 7 deletes (was 694). Not for opportunistic sweeps; needs a dedicated pass with per-entry judgement (delete-as-duplicate vs re-gloss vs merge).
  - 3,361 null-translation entries — data quality flag from v14; needs a dedicated pass
notes:
  - Class token declaration: [all-seats] only. Ratified in AUTHOR_BRIEF Rev 24. The ALLAUTHORS item-shape thread binds all-authors + specific paradigm sets — not my territory.
  - Data state: 18,035 entries (was 18,042; -7 from this sweep). Equivalence_class: 827 in 387 classes (added orange_colour_noun; no net change from subset-retry after revert). Noun_class: 11,367 tagged, 454 residue. Gender_class: 200 explicit tags. Top-2000 [skip]: 23 (was 29).
  - Subset-retry lesson: v15 §1's homograph rule needs to be IN the algorithm, not a post-hoc spot-check. The 322 full-class applies that would have shipped via lifting v1's score gate showed the same homograph pattern as the 28 subset-retry recoveries — so this isn't a subset-retry defect specifically, it's what happens when the FILTERED file's proposals are applied without a bridge-word check. See marker_semantics v16 for the four guard options offered.
  - Tools this turn (15 total): + wake_20260812_touchup, reconcile_v2_subset_retry_2026-08-12, revert_subset_retry_v2_2026-08-12, measure_85_subthemes_2026-08-12. Audit files: eqclass_subset_retry_audit_2026-08-12.json + subtheme_measurement_2026-08-12.json.
  - PENDING COMMIT (from previous turn): 6 files staged, `git commit` blocked by stale .git/index.lock the sandbox can't unlink (mount perms). This turn's 5 new files (wake_20260812_touchup.py, reconcile_v2_subset_retry_2026-08-12.py, revert_subset_retry_v2_2026-08-12.py, updated vocabulary_it_frequency.json, updated marker_semantics.md) also queued. Smith: please `del .git\\index.lock` then `git add -A && git commit -m "Vocab: wake sweep 2026-08-12"` from PowerShell.
