seat: StressAuthor
classes: [all-seats, all-authors]
project: Linguics
updated: 2026-07-23
waiting: none              # Deliverable 2 DONE; items generated. Housing wiring + Vocab coordination remain (not mine).
needs_from_smith: none
blocked_by: none           # items generated; Housing needs to wire the qtype + load path
claude_can_verify: yes
summary: Deliverable 2 complete. 20,005 stress drill items generated from Code's sidecar data (15,981 lemma + 4,561 wordform drillable entries) into data/grammar_questions_stress.json. Items are index-scored MCQs: choices show the word with each candidate syllable position emboldened (**syl**), option count = min(syllable_count, 4), answer_index = stress_pos-1. All diagnostic metadata rides in stress_meta (mechanism, detail, etymological, accent_cue, syllable_count, tags). Distribution: 13,028 piana / 4,424 sdrucciola / 2,513 tronca / 40 bisdrucciola (wordform-only). Pipeline bug flagged: 12 lemma-layer bisdrucciole all misclassified (excluded from items); true bisdrucciole exist only at wordform level (3pl present of -are verbs).
queue:
  - Architecture_StressAuthor_data_spec v5 -- Architecture accepted spec, commissioned Code; DONE
  - Deliverable 2 (items) -- DONE 2026-07-23 (QoderWork); 20,005 items in data/grammar_questions_stress.json
  - Housing wiring -- NOT MINE: load path (singleton like accent), tap-the-stressed-syllable renderer, confusion matrix report, pulse extra_json
  - Vocab coordination -- NOT MINE: Architecture routes field addition to Vocab's entries
  - Pipeline bug -- 12 lemma bisdrucciola misclassified by Code's pipeline; excluded from items; flag to Code/Architecture
  - standing: criteria 13-21 as all-authors
awaiting_architecture:
  - Housing: wire grammar_questions_stress.json load path + stress qtype renderer + confusion matrix report
  - Vocab: coordinate stress_pos field onto canonical entries (sidecar exists, merge path needed)
  - Code: fix 12 lemma bisdrucciola misclassifications in stress_sidecar_lemma.json
