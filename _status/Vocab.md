seat: Vocab
classes: [all-seats]
project: Linguics
updated: 2026-08-06
waiting: parked
needs_from_smith: none
blocked_by:
claude_can_verify: n/a
summary: Sixth touch-up: applied 2 hand-classes the FILTERED-reconcile dropped (sebbene/benché as albeit_conj — architect-ratified 2026-08-06; secco/asciutto as curt_adje — my judgement call: both correct at prompt level, collocation split noted in entries). Total eq-classes now 826 in 386 classes, still zero singletons. Fixed the 29 remaining truncated glosses (audit's 8 groups × ~4 each): 25 widened, 3 deleted as gap-fill artefacts (English-lemma 'dark', casco-f duplicate-with-wrong-gender, talpa-m duplicate-with-wrong-gender). Fixed 7 '?' glosses (ricordo/intenzione/muro/dolce/materiale/risorsa/sito) and killed 3 more junk: senza-as-interjection (duplicate of preposition 150), importante-as-noun and ampio-as-noun (grammatical substantivisations, not lexemes).
queue: []
watchlist:
  - Architecture_Vocab_stress_sidecar — routed 2026-07-27 (DECISIONS 1628); thread not yet opened
  - StressAuthor -ere lemma list — StressAuthor produces first; I merge if any lemma-level consequence
  - noun_class residue 454 remaining — needs architect ruling on new classes (shortened_o_fem, invariable_i_fem, number-axis field)
  - equivalence_class deferred proposals (in FILTERED file) — 524 with member score <1.0 skipped per S2 safety; opportunistic later
  - marker_semantics tier-2 (abbreviation/full-form pairs like tv/televisione) — architect owes a spec
  - [skip] entries — 694 total (29 in top 2000). Architecture flagged for hand-review; maestra is one. Not in scope for opportunistic sweeps — needs a dedicated pass with per-entry judgement (delete vs re-gloss vs merge).
notes:
  - Class token declaration: [all-seats] only. Ratified in AUTHOR_BRIEF Rev 24.
  - Reconcile filter caveat: my `score == 1.0` gate in reconcile_equivalence_class_filtered.py False's on the FILTERED file (which strips scores because the filter IS the ratification). Any future filtered-file proposal that isn't already applied via the unfiltered wave needs a hand-apply. Two live cases handled 2026-08-06.
  - Data state: 18,042 entries (was 18,048; -6 from this touch-up: dark-adj, casco-f, talpa-m, senza-interj, importante-noun, ampio-noun). Equivalence_class: 826 in 386 classes. Noun_class: 11,367 tagged, 454 residue. Gender_class: 200 explicit tags. 0 '?'-glosses remaining.
  - Tools this turn (12 total across the seat's life): + apply_two_hand_classes_2026-08-06, fix_truncated_glosses_2026-08-06, fix_question_glosses_2026-08-06.
  - Backup files noted: /data/*.merged.bak files are OTHER seats' work (future/present/gerundio/imperativo/pronoun) — not Vocab territory. Left untouched.
  - PENDING COMMIT: 6 files STAGED (git add succeeded) but `git commit` blocked by stale .git/index.lock the sandbox can't unlink (Windows-vs-Linux perms quirk on this mount). Files staged: _status/Vocab.md, data/vocabulary_it_frequency.json, tools/vocab_chat/{apply_two_hand_classes_2026-08-06,fix_question_glosses_2026-08-06,fix_truncated_glosses_2026-08-06,reconcile_equivalence_class_filtered}.py. Smith: please `del .git\\index.lock` then `git commit` from PowerShell — commit message queued below.
  - COMMIT MSG (queued): "Vocab: architect audit hand-work — 2 eq-classes, 32 gloss fixes, 6 junk deletes. sebbene/benché + secco/asciutto as equivalence classes; 25 truncated + 7 '?' glosses widened; 6 gap-fill artefacts deleted (dark-adj-english, casco-f-dup, talpa-m-dup, senza-interj-dup, importante-noun-substantiv, ampio-noun-substantiv). Reconcile-filter caveat documented. Data now 18,042 entries; eq-class 826/386/0-singletons; 0 '?'-glosses."
