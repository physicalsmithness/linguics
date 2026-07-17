seat: AccentAuditor
classes: [all-seats]
# Reasoning (Rev 24 requires it stated, not guessed): NOT all-authors. This seat originates no
# markpoints, chips, guards, prompts or item explanations - it judges existing ones and proposes;
# Architecture applies. Criteria 13-20 all bind item-authoring surfaces and none can reach it.
# Already ratified: AUTHOR_BRIEF Rev 24 binding register names AccentAuditor among the non-authors.
project: Linguics
updated: 2026-07-18
waiting: closed
needs_from_smith: decision
blocked_by:
claude_can_verify: yes - the drift re-check is a script; ran it this turn (1 new markpoint in 3 days, compliant)
summary: Dispatch fully discharged 2026-07-15 (267 markpoints, 265 no_flag, 2 flag); re-derived today rather than trusting the stamp - corpus drifted by exactly one markpoint (pas_use_reg_04, verbless-e class, no_flag, already correct on disk unaided). Queue empty. One decision open: how to detect criterion-19 drift now that the retrofit is stamped discharged.
queue:
  - (empty) name-grep across the six surfaces + all-seats returns no live work.
    All DECISIONS hits are standing rules, not tasks. Criterion 19 register row:
    "discharged (AccentAuditor, 267 markpoints)". No thread names this seat as Next.
decision:
  question: Criterion 19's retrofit is stamped discharged, but nothing detects DRIFT as the corpus
    grows. Criterion 17 has Cr17Sweep for stragglers; 19 has no equivalent. Evidence today: 1 new
    accent markpoint in 3 days, author compliant with the standing rule unaided.
  options:
    - (a) Nothing. Standing rule is working 1-for-1; re-check on demand when this seat is next woken.
    - (b) RECOMMENDED. Fold a criterion-19 grep into Architecture's per-batch acceptance audit:
          new accented positives per batch, judged against the twin test. One grep, lives where the
          estate already looks, costs no seat.
    - (c) Keep this seat on a periodic re-sweep. Cheapest to run (one script) but a standing seat
          for a rule that fires almost never.
  lean: (b) - the sweep's headline was that criterion 19 almost never fires, which makes a dedicated
    watcher disproportionate and makes the check nearly free to bolt onto an audit that already runs.
notes:
  - Rev 21(i)'s supplied-choice carve-out (landed after the sweep) ALIGNS with it: it codifies the
    reasoning this seat's A1_prompt_pinned class already used (tc_rem_pp_lit_*, cmp_dvc_06,
    prep_disc_dida_03). It does not reach the two surviving flags - credé and dì cue a lemma, not a
    menu of forms - so both stand. Rev 21(i) says five seats re-derived that carve-out independently
    and calls it a brief defect: it was six. This seat derived it the same day and recorded it as a
    class name in a JSON file instead of as a question. Finding-in-an-artefact, not on a door.
  - Estate carries exactly two accent_load_bearing flags: credé, dì. Verified on disk this turn.
