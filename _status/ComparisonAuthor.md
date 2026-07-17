seat: ComparisonAuthor
classes: [all-seats, all-authors]   # all-authors declared deliberately: this seat originates grammar and
                                    # translation ITEMS carrying markpoints, cue chips, must_not_include and
                                    # item explanations (51 + 24 live). Criteria 13-20 all bind all-authors
                                    # and name nobody, so under-claiming would silently hide every one of them.
project: Linguics
updated: 2026-07-18
waiting: closed
needs_from_smith: none
blocked_by:            # none
claude_can_verify: yes — both audits below are re-runnable greps over data/grammar_questions_comparison.json.
summary: Comparison batch live and ACCEPTED (51 grammar + 24 translation, all 8 leaves), reconciled Rev 16->22 and re-checked against Rev 25 today. Self-check run across name + classes; queue is EMPTY. Two class-bound audits run today, both clean; three items await Architecture's stamp.
queue: none — nothing owed. (name-grep MINUS discharged = 0)

discharged_awaiting_architecture_stamp:   # reported, not self-stamped
  - criterion 13 (binds all-authors; register says RUNNING, unstamped for this seat) — chip self-audit RUN today: 0 rule-naming cues across all 51 prompts. Every cue names a lemma, a surface form, or an English meaning. Evidence: re-runnable grep; nearest judgement call is cmp_irr_03's "(usa la forma di 'grande' per l'età)", which names the selecting condition (age), not the rule.
  - AUTHOR_BRIEF Rev 25 (binds all-authors; retrofit: audit cues against item levels; compliance table shows 0/3 stamped) — audit RUN today: 33 of 51 items carry a trailing cue; every cued citation form (alto, buono, bello, cattivo, stanco, simpatico, lungo, bene, male, io, tu, venti, dieci, grande, caro) is A1-A2 core vocabulary sitting at or below its A2-B2 item. No esserci-shaped case exists here: my cues are concrete dictionary words, not chunk-learned lemmas a learner cannot decompose. Zero reframes needed.
  - inter_chat/Architecture_ComparisonAuthor_batch_disposition, "Next: ComparisonAuthor (residuals inline)" — DISCHARGED and stale. The "residuals" were the coverage-doc notes, which Architecture itself harvested into TRIAGE_coverage_asks_2026-07-15.md; every substantive ask ran through Architecture_ComparisonAuthor_batch_review, CLOSED at v5 with "nothing further owed from your seat". Requesting the Next: be cleared.

not_queue:   # triaged this sweep; recorded so the next one need not re-derive it
  - criterion 20 — register: "discharged both (2026-07-16)". 10 di_vs_che items glossed, 9 stood with reasons.
  - criteria 15, 16, 18, 19 — standing, or discharged estate-wide (central gate; AccentAuditor; TenseChoiceAuthor wave-1).
  - criterion 17 — Cr17Sweep owns the retrofit; comparison is post-Rev-13 and all 51 explanations already gloss.
  - match_at "exact" / additive errors ("molto bellissimo") — my finding, parked for Housing in OPEN_QUESTIONS as a future engine ask. Not this seat's.
  - MisconceptionAnalyst's pass-1 extension names comparison among 19 unharvested topics — their queue, not mine.
