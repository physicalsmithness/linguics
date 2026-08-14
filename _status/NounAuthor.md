seat: NounAuthor
classes: [all-seats, all-authors]
project: Linguics
updated: 2026-08-14
waiting: parked
needs_from_smith: external-action   # route Architecture to merge the tier-2 return + stamp the leak fix + the 3 replies
blocked_by:
claude_can_verify: yes - return file, patched item, and detector all on disk and reproducible
summary: full-queue wake. Tier-2 SEARCH returned (648 findings, vocab-validated, blind audit 0 FPs). Answer-leak item noun_gen_e_09 fixed. Noun-class taxonomy weigh-in filed (caught mano mis-grouped, brindisi tail, two missing classes). Rev 33 no-op for noun. Nothing owed once Architecture merges + stamps.
queue:
  - tier-2 search: DONE, data/review_packets_tier2/returned/SEARCH_noun_2026-08-13_returned.json (648 findings); Next Architecture (merge). Claim policy = leaf + skill-aggregate, NOT root noun (my call, documented, one-line override either way)
  - noun_gen_e_09 answer-leak: FIXED (downstream "il denaro" stripped, marking intact); Next Architecture stamp   [answer_leak_dispatch v6]
  - noun-class taxonomy weigh-in: DONE   [Architecture_Vocab_noun_class_taxonomy reply]
  - capitale pair re-point e_ending -> meaning_split: still PENDING (noun.gender.meaning_split not yet minted); one-line edit on mint
not_queue:
  - gender_plural_drill: my 7-class confirm done; Vocab actioned my uovo catch (class 5); waiting on Architecture to mint the 2 buckets
  - no-change-forms: my 7 items stay under the plural-drill carve-out (thread v3)
  - Rev 33 (lr exemption / common_errors optional / person / 4th): no-op or optional for noun - no _lr_ items, no person field, common_errors optional
