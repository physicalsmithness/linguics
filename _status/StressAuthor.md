seat: StressAuthor
classes: [all-seats, all-authors]
project: Linguics
updated: 2026-07-23  # CODEX recovery pass
waiting: none              # Corrected item deck generated and release audit passes.
needs_from_smith: none
blocked_by: none           # items generated; Housing needs to wire the qtype + load path
claude_can_verify: yes
summary: CODEX 2026-07-23 recovery complete. The former 20,005-item deck was unsafe (POS-blind dictionary overwrites, unverified syllable boundaries, and 2,396 unattested/invented model forms). Rebuilt from POS-aware Wiktionary hyphenation+IPA, Morph-it-attested present-3pl forms, and three hand-verified seed backstops. data/grammar_questions_stress.json now has 12,446 verified, deduplicated, non-ambiguous questions. pedofilia is pe-do-fi-li-a with stress on li. Release audit PASS; seed validation 58/58.
queue:
  - Architecture_StressAuthor_data_spec v5 -- Architecture accepted spec, commissioned Code; DONE
  - Deliverable 2 (items) -- CORRECTED 2026-07-23 (CODEX); 12,446 verified items in data/grammar_questions_stress.json
  - Post-answer "Why" -- CORRECTED 2026-07-23 (CODEX); all 12,446 items now explain the actual suffix/inflection/accent/context/lexical basis and show verified stress-marked syllabification
  - Housing wiring -- NOT MINE: load path (singleton like accent), tap-the-stressed-syllable renderer, confusion matrix report, pulse extra_json
  - Vocab coordination -- NOT MINE: Architecture routes field addition to Vocab's entries
  - Pipeline recovery -- DONE by CODEX; see outputs/stress_audit_CODEX.md and CODEX_HANDOFF_stress_recovery_2026-07-23.md
  - standing: criteria 13-21 as all-authors
awaiting_architecture:
  - Housing: wire grammar_questions_stress.json load path + stress qtype renderer + confusion matrix report
  - Vocab: coordinate stress_pos field onto canonical entries (sidecar exists, merge path needed)
  - Code/Architecture: decide whether to expand the 4,536 quarantined lemma records and bulk remoto/clitic coverage using equally strong surface-form + syllable verification

## CODEX 2026-07-23 correction

The earlier statement that "true bisdrucciole exist only at wordform level" was
false. Verified lemma examples include *farmaceutico* and *mitologico*. The 12
flagged lemmas were caused by POS-blind homograph overwrites, not proof of a
lemma-level impossibility.
