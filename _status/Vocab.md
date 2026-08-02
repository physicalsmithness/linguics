seat: Vocab
classes: [all-seats]
project: Linguics
updated: 2026-08-03
waiting: parked
needs_from_smith: none
blocked_by:
claude_can_verify: n/a
summary: Four architect-queued asks discharged this turn — marker_semantics reopens, gender_class tag, vocab_help residue, plus 23 more English-lemma junk deletes + pari/dispari/impari gap-fill from cue_notation_renderer. One incoming ask pending (Architecture_Vocab_stress_sidecar — routed 2026-07-27 in DECISIONS but the thread hasn't been opened yet).
queue: []
watchlist:
  - Architecture_Vocab_stress_sidecar — routed 2026-07-27 (DECISIONS 1628); thread not yet opened; will pick up on opening
notes:
  - Class token declaration: [all-seats] only (not all-authors). Confirmed by architect in AUTHOR_BRIEF Rev 24 §"Class token definitions" — Vocab is explicitly named as NOT all-authors.
  - Wake-check-fail on the previous self-check was more thorough than I realised — Smith prompted "have you checked all your nexts" and I found three more items I'd missed: (1) English-lemma junk beyond the three in marker_semantics v6 (23 more), (2) pari/dispari/impari gap-fill from cue_notation_renderer, (3) vocab_help_residue Next line still saying Vocab after my discharge. All now handled. Lesson: grep Next: across ALL files (not just Architecture_Vocab_*), and check that my own thread-updates flip the Next line correctly.
  - Data state: 18,048 entries (was 18,071 at session start; -23 more junk delete + 3 pari-family insert + earlier task-day changes).
  - Tools this turn: fix_multi_valid_translations.py, tag_gender_class.py, resolve_vocab_help_residue.py; plus inline python for the English-lemma delete and pari inserts.
