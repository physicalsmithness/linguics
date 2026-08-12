seat: AdverbAuthor
classes: [all-seats, all-authors]
project: Linguics
updated: 2026-08-12
waiting: active
needs_from_smith: confirm
claude_can_verify: no (your preference call on the 6-vs-10 tradeoff)
summary: Both live ALLAUTHORS obligations discharged this wake (no-change-forms MCQ + cue-notation brackets). One confirm owed on the 6-vs-10 leaf call; one Architecture ruling still open on my side; psbf bug found and fixed (twice, mount reverted it once).
queue: []
done_this_sitting:
  - cue_notation thread (binds all-authors, itemised 7 for adverb): DISCHARGED. 6 English meaning-glosses (early/gladly/often/badly/well/behave) moved from (parens) to [brackets]; the 7th, (in inglese), was Italian meta and was folded inline. Zero English-in-parens residue across 46 prompts. Display-only. Stamp proposed at v11.
  - no-change-forms thread: all 10 invariable_vs_adjective items converted to MCQ (instrument B); reacted v5. 6-vs-10 uniformity expansion flagged, ruling open on Architecture's side.
  - BUG: prompt_supplies_base_form had been dropped from all 46 items by my Rev-19 key-reorder. Restored on the 36 short items (16 true / 20 false). NOTE: the mount reverted this fix once between writes (cached view); re-applied with sync + independent delayed re-read to confirm persistence.
confirm_owed:
  - DISCRETE CHOICE for Smith on the no-change-forms leaf: (a) KEEP all 10 invariable items as MCQ (my default; uniform instrument, no cue-tell); or (b) REVERT the 4 agreeing items (adv_inv_02/04/06/08) to cued free-text, keeping production difficulty and accepting the within-leaf tell. I recommend (a).
awaiting_architecture:
  - no-change-forms: rule the 6-vs-10 uniformity expansion (open on their side per that thread's latest Next)
  - cue_notation: verify + apply my v11 stamp
  - MisconceptionAnalyst: confirm the adverb_vs_adjective distractor mapping on the 6 invariable MCQs; consider minting the inverse "invariable quantifier failed to agree" id for the 4 agreeing items
notes:
  - MOUNT INSTABILITY observed: a bash write to grammar_questions_adverb.json did not persist between two sessions (psbf reverted). Mitigation used: os.replace + sync + independent re-read after a delay. Flagging for Housing/Code if others hit lost writes.
  - adverb.locuzioni_avverbiali registered but unauthored; no clause binds me; available if Smith commissions a B1 pass.

queue:
  - TIER-2 REVIEW PACKET WAITING (2026-08-12): data/review_packets_tier2/REVIEW_adverb_2026-08-11.json — 36 pairs. Thread: inter_chat/Architecture_AdverbAuthor_tier2_review_packet.md  [not blocked]