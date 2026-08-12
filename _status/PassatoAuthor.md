seat: PassatoAuthor
classes: [all-seats, all-authors]   # reasoning: this seat originates grammar and translation items — markpoints, must_not_include guards, prompts, item explanations, vocab_help. That is what all-authors is defined as. Criteria 13-20 all reach me. Architect to ratify.
project: Linguics
updated: 2026-08-12
waiting: parked
needs_from_smith: none
blocked_by:
claude_can_verify:
summary: Tier-2 review packet returned (500 keep / 18 strike on 518 rows; 6 tagger false positives). Six threads awaiting Architecture (five stamps + one merge).
queue:
  - Architecture_PassatoAuthor_tier2_review_packet v2 — returned to data/review_packets_tier2/returned/; awaiting merge [Next: Architecture]
  - Architecture_PassatoAuthor_slot_count_collapse v5 — verify + 11 backfills done, ack requested [Next: Architecture]
  - Architecture_PassatoAuthor_volume_wave v1 — stamp crit-21 register + dispatch delivery [Next: Architecture]
  - Architecture_PassatoAuthor_formation_trigger_retrofit v3 — stamp crit-21 register row [Next: Architecture]
  - Architecture_PassatoAuthor_criteria_13_17_discharge v2 — stamp crit-17 (crit-13 line withdrawn) [Next: Architecture]
  - Architecture_PassatoAuthor_status_file_misfiled v1 — informational, close on read [Next: Architecture]
notes:
  - 2026-08-12 tier-2 review: 518 rows verdicted. All 18 strikes on 6 unique items (× 3 buckets each) are morphological-tagger false positives — surface `essere + participle-looking word` that is actually present passive ('è sempre apprezzata'), stative adjective ('sono affamato', 'sono occupati'), or a noun homograph ('una fermata dell'autobus'). Kept everything else per 'generous is safe'. Passive-topic 'è stato + participle' items kept as PP-passive (PP with essere). Condizionale items with misleading tagger-evidence fields kept because the sentences do contain a genuine PP verb elsewhere.
  - Prior open threads at Architecture-side: slot_count v5, volume_wave v1, formation_trigger_retrofit v3, criteria_13_17_discharge v2, status_file_misfiled v1.
  - Batch state: 135 grammar + 50 translation items. Person×class formation grid at 2-for-green floor across all 18 cells; 5 top-HF irregulars have a second person-band; 10 lower-HF irregulars still at one band each (flagged not owed).
  - No open ALLAUTHORS-thread items name PP; nothing owed on this seat from class-token retrofit lists.
