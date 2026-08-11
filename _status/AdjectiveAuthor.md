seat: AdjectiveAuthor
classes: [all-seats, all-authors]
project: Linguics
updated: 2026-08-11
waiting: parked
needs_from_smith: none
blocked_by:
claude_can_verify:
summary: Smith's `check the chats` sweep this session — one silent thread found (Architecture_Housing_selection_policy §12.2, named me at v3 2026-08-06 asking "is the references file meant to load?", QoderWork confirmed non-loading at v4). Answered at v5: `data/vocab_bucket_references_adjective_agreement.json` is an audit artefact, never meant to load; the 99 gender-refs it lists ALREADY live inline in the runtime data (grammar_questions_*.json markpoints + vocab_help), so no denominator gap; recommended rename-out (move to `_status/` or `audits/` with `_audit_` infix) over wire-in (loader schema + sync cost). Session earlier discharged Smith's `ab&c` directive (Rev 25 audit filed, 22 candidate_forms authored, 5 pari items tagged); see previous entry for detail.
queue:
  - (empty; eight open threads all Next: Architecture)
class_token_notes:
  - Criterion 13 (all-authors, rule-naming chip self-audit): DISCHARGED CENTRALLY 2026-07-17 per Rev 26.
  - Criterion 15 (all-authors, standing per Rev 19 recoverability): standing rule. Applied on the pari_family redesign.
  - Criterion 16 (all-authors, wave-1 retrofit): discharged (TenseChoiceAuthor).
  - Criterion 17 (all-authors, gloss pre-Rev-13 items): Cr17Sweep discharged for adjective_agreement (182 items).
  - Criterion 18 (all-authors, anchoring audit): discharged estate-wide.
  - Criterion 19 (all-authors, accent sweep): discharged (AccentAuditor).
  - Criterion 20 (specific seats, not me).
  - Criterion 21 (all-authors, formation forces its target): N/A (not a formation topic).
  - Rev 25 (cues audited against item levels): DISCHARGED 2026-08-11 — 0 clear hits across 158 Italian cues checked; audit thread AdjectiveAuthor_Architecture_rev25_cue_audit v1 filed for Architecture verify + close.
  - Rev 27 (cross-credit vocab): applied on the 13 pari_family items (2026-07-21) and the 22 strict-paradigm items via their existing markpoint structure.
  - Rev 31 (supplied-choice crit-13/20 exemption): APPLIED on adj_inv_pari_01-05 via answer_shown_by_design tag 2026-08-11; awaiting value-choice ratification before extending to pari_family_06-13.
  - Rev 33 (four additions 2026-08-03): standing rules noted; no retrofit obligation on my batch.
  - answer_leak_dispatch section 1 (6 items): reacted v5, confirmed no-change class, folded into item_shape react.
  - cue_notation_renders_use_english (1 item): reacted v6, converted adj_pos_post_05.
  - item_shape_no_change_forms (36 items in the no-change class): reacted v9 2026-08-11 — 22 strict-paradigm items now carry candidate_forms (engine :227 LIVE at r117); 9 invariables deferred pending Architecture ruling on extended-vs-strict set; adj_agg_04 deferred pending Architecture ruling on multi-slot shape; 5 pari_family items exempt via answer_shown_by_design.
  - selection_policy §12.2 (silent thread found this session): reacted v5 2026-08-11 — file is audit artefact, recommended rename-out.
open_threads_i_authored_or_own:
  - Architecture_AdjectiveAuthor_pari_family_redesign v5 (Next: Architecture; mint vocab buckets + declare paradigm on leaf + ratify answer_shown_by_design value + stamp)
  - AdjectiveAuthor_Cr17Sweep_hygiene_work_order v2 (Next: Architecture; awaiting stamp on rev6_audit worklist)
  - Architecture_ALLAUTHORS_cue_notation_renders_use_english v6 (Next: Architecture verify + PossessiveAuthor / PiacereAuthor / AdverbAuthor still owe)
  - Architecture_ALLAUTHORS_answer_leak_dispatch v5 (Next: Architecture verify + DemonstrativeAuthor / NounAuthor / PronominalVerbsAuthor / ReportedSpeechAuthor / CongiuntivoFormationAuthor / PluperfectAuthor / ImperfectAuthor still owe)
  - Architecture_ALLAUTHORS_item_shape_no_change_forms v9 (Next: Architecture rule invariable candidate_forms + rule adj_agg_04 multi-slot + verify stamp; Housing clickable-cue UI still open)
  - AdjectiveAuthor_Architecture_rev25_cue_audit v1 (Next: Architecture verify + close; 0 clear hits, 6 rank-based false positives documented)
  - Architecture_Housing_selection_policy v5 (Next: Architecture rule (a)/(b) for §12.2 file disposition; my react is at v5)
closed_threads:
  - AdjectiveAuthor_Architecture_pre_noun_canonical_marker_policy v3
  - AdjectiveAuthor_Architecture_mcq_prompt_format v3
  - AdjectiveAuthor_Architecture_vocab_audit_v3_request v3
  - AdjectiveAuthor_Architecture_brief_rev6_audit v6
  - Architecture_AdjectiveAuthor_buono_02_prompt_bug v3 (accepted/stamped 2026-07-21)
smith_spot_checks_optional:
  - Older queue: adj_pos_pre_01 for 0.7 on 'una casa piccola'; adj_gia_ge_01 for 0.8 on 'saggie'; adj_buono_02 for 0.7 on 'un buon studente'; one of the six MCQ conversions; pari_family invariability tests (_07 f.pl temptation, _10 m.sg temptation, _04 for both markpoints landing).
  - 2026-08-11: adj_inv_pari_01 renders with the supplied-choice tag (once Housing surfaces it); typing 'rossa' on adj_o_m_sg_01 should now record a formation miss + vocab hit via the r117 membership test.
