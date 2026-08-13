seat: ArticleAuthor
classes: [all-seats, all-authors]
project: Linguics
updated: 2026-08-12
waiting: parked
needs_from_smith: none
blocked_by: none
claude_can_verify: yes — returned packet verified (594 rows/bucket, all have verdict, buckets identical, source untouched)
summary: Tier-2 article review packet REVIEWED and RETURNED (data/review_packets_tier2/returned/). Per bucket: KEEP 485, STRIKE 109 (78 indefinite/bare + 31 clitic-only), +23 en->it additions morph-it missed. Hand-read every strike and every ambiguous lo/la/le/gli/l' row. Two judgment calls flagged to Architecture (articulated-preposition keep; it->en inert keep). Apostrophe rework (art_iform_12/13/14 MCQ) done earlier; art_iform_03/04 A/B still with Architecture.
queue:
  - (awaiting Architecture) merge the returned tier-2 packet -> Architecture_ArticleAuthor_tier2_review_packet v2
  - (awaiting Architecture) ratify art_iform_12/13/14 MCQ + rule A/B on art_iform_03/04 -> apostrophe_fold_false_credit v2
done_this_pass:
  - tier-2 packet: 1142 rows judged; strikes = clitic-pronoun + indefinite false positives; 23 genuine additions; returned atomically, original left intact
not_owed:
  - crit-16 (ruled A, closed); pos-migration/crit-13/crit-20/crit-21; Rev 33 (nothing for article); answer_leak/item_shape ALLAUTHORS (article not named)
