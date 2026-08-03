seat: StressAuthor
classes: [all-seats, all-authors]
project: Linguics
updated: 2026-08-03
waiting: parked            # spec accepted + EXECUTED by Code; data + items on disk; acceptance sampled. One reconciliation routed to Architecture.
needs_from_smith: review   # optional: fire the -ere sidecar reconciliation, or ask me to produce the corrected list
blocked_by:
claude_can_verify: yes
summary: Estate had moved past my session view. Spec accepted (Arch v5, 07-21) + executed: Code delivered stress_sidecar_lemma.json (18,071), stress_sidecar_wordform.json (536), grammar_questions_stress.json (12,446 MCQ). Acceptance-sampled: invariants clean, golden set 46/47, confidence discipline intact. One divergence: sidecar mis-defaults fell-through stem -ere verbs (credere/nascere/ridere) to piana/low, but the ITEMS are correct (curated ere_stem list) — data/item divergence, no learner-facing bug. Monosyllable 'tronca' label cosmetic (excluded from items). My v5 Code brief was redundant (superseded by REQUEST_to_code) and my v5 append collided with Arch's reply — both owned + fixed. Thread now at v7.
queue:
  - Architecture_StressAuthor_data_spec v7 -- Next: Architecture (route -ere sidecar reconciliation to Code/Vocab)
  - Deliverable 2 (items): EXISTS (Codex-generated, 12,446); author sign-off given w/ the -ere reconciliation caveat
  - standing: criteria 13-21 as all-authors
delivered:
  - Deliverable 1 (data spec) ACCEPTED + executed; Deliverable 2 items generated + acceptance-sampled
open_findings:
  - -ere sidecar reconciliation (data<->item divergence on fell-through stem verbs); monosyllable label cosmetic
