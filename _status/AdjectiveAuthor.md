seat: AdjectiveAuthor
classes: [all-seats, all-authors]
project: Linguics
updated: 2026-08-14
waiting: parked
needs_from_smith: none
blocked_by:
claude_can_verify:
summary: `check the chats` (2nd pass 2026-08-14) — one new thread found and delivered. tier2_search_packet v1 arrived while I was working: read the packet, wrote a hand-built lexicon of ~150 Italian adjective lemmas (Class I / II / invariable / special / stem-change families), heuristic scanner over each item's Italian text (source / reference / other_references), 511 findings across 238/913 corpus items covering 25 of the 46 buckets. Delivery is LEAVES-ONLY per the packet's `store_the_most_specific_claim` field AND per the aggregate-vs-leaf ruling that landed 2026-08-14 after I started (aggregate stands only when leaves don't exhaust the construction; for me all major aggregates are exhausted by their authored leaves). File at `data/review_packets_tier2/returned/SEARCH_adjective_agreement_2026-08-13.json`. Reacted at tier2_search_packet v2.
queue:
  - (empty; nine open threads all Next: Architecture)
class_token_notes:
  - Criterion 13 (all-authors): DISCHARGED CENTRALLY 2026-07-17.
  - Criterion 15 (all-authors): standing rule.
  - Criterion 16 (all-authors): discharged (TenseChoiceAuthor).
  - Criterion 17 (all-authors): Cr17Sweep discharged for adjective_agreement.
  - Criterion 18 (all-authors): discharged estate-wide.
  - Criterion 19 (all-authors): discharged (AccentAuditor).
  - Criterion 20 (specific seats): not me.
  - Criterion 21 (all-authors): N/A (not a formation topic).
  - Rev 25 (cues audited against item levels): DISCHARGED 2026-08-11 — audit thread filed.
  - Rev 27 (cross-credit vocab): applied on 13 pari + 22 strict-paradigm items.
  - Rev 31 (supplied-choice crit-13/20 exemption): APPLIED on all 13 pari_family items.
  - Rev 33 (four additions 2026-08-03): no retrofit obligation.
  - answer_leak_dispatch section 1: reacted v5, folded into item_shape.
  - cue_notation_renders_use_english: reacted v6.
  - item_shape_no_change_forms: reacted v10 — 22 strict-paradigm candidate_forms authored, Class II r117 must_not question flagged; 9 invariables + adj_agg_04 deferred.
  - selection_policy §12.2: reacted v5 — file is audit artefact, rename-out recommended.
  - tier2_search_packet: reacted v2 2026-08-14 — 511 findings delivered, leaves-only justified against the settled aggregate-vs-leaf rule; PoS-blur (amici-as-noun etc.) flagged for architect to keep or prune.
open_threads_i_authored_or_own:
  - Architecture_AdjectiveAuthor_pari_family_redesign v5 (Next: Architecture)
  - AdjectiveAuthor_Cr17Sweep_hygiene_work_order v2 (Next: Architecture)
  - Architecture_ALLAUTHORS_cue_notation_renders_use_english v6 (Next: Architecture + 3 other seats)
  - Architecture_ALLAUTHORS_answer_leak_dispatch v5 (Next: Architecture + 7 other seats)
  - Architecture_ALLAUTHORS_item_shape_no_change_forms v10 (Next: Architecture 3 rulings + Housing UI)
  - AdjectiveAuthor_Architecture_rev25_cue_audit v1 (Next: Architecture verify + close)
  - Architecture_Housing_selection_policy v5 (Next: Architecture rule §12.2)
  - Architecture_AdjectiveAuthor_tier2_search_packet v2 (Next: Architecture verify + close; 511 findings delivered)
closed_threads:
  - AdjectiveAuthor_Architecture_pre_noun_canonical_marker_policy v3
  - AdjectiveAuthor_Architecture_mcq_prompt_format v3
  - AdjectiveAuthor_Architecture_vocab_audit_v3_request v3
  - AdjectiveAuthor_Architecture_brief_rev6_audit v6
  - Architecture_AdjectiveAuthor_buono_02_prompt_bug v3
smith_spot_checks_optional:
  - 2026-08-14: check the tier-2 returned file, spot-sample 5-10 findings to sanity-check false-positive rate; the interesting classes are noun-of-Class-I-lemma (amici in noun sentences) and language-name-as-noun (italiano in "parlo italiano") — both are false positives from a strict adj/noun-boundary reading but the buckets' inflectional-formation skill is PoS-neutral so I kept them.
