seat: SpellingAuthor
classes: [all-authors, all-seats]
# Reasoning (Rev 24 requires it stated): this seat ORIGINATES markpoints, choice_tags, item
# prompts and explanations, so it is an authoring surface -> all-authors binds it. Compliance with
# the standing criteria is n/a (by construction) for this seat's shape: items are supplied-choice
# (Rev 31 exempts crit 13 and 20) and index-scored (crit 19's accent_load_bearing never arises;
# crit 21 formation-trigger is for formation drills, not discrimination). crit-17 (English meaning
# in explanation) IS met on every item. No retrofit obligation outstanding.
project: Linguics
updated: 2026-07-21
waiting: Architecture (mint leaves, merge registry + glossary, rule on 2 flags + 1 build ask)
needs_from_smith: nothing blocking (wave-2 is on-request)
blocked_by: none for authoring; the per-choice DIAGNOSTIC layer is blocked on a Housing build (see decision)
claude_can_verify: yes - ran the invariant + JSON-load checks on grammar_questions_orthography.json this turn (141 items, all green)
summary: Wave-1 delivered 2026-07-21 - 141 index-scored MCQ spelling-discrimination items across
  8 error classes (doubling 30, apostrophe_elision 24, c_g_softening 24, digraph 16, qu_cu_cqu 15,
  silent_h 12, capitalization 12, vowel_confusion 8). Proposed: 1 root + 8 leaves, 9 misconception
  specifics, 4 glossary terms. Thread Architecture_SpellingAuthor_batch_delivery.md v1, Next: Architecture.
queue:
  - (empty for authoring) name-grep across the author surfaces + all-authors/all-seats returns no
    live retrofit task; standing criteria are n/a-by-construction or already met (crit-17).
decision:
  question: The dispatch mandates per-choice distractor tagging so a wrong pick records WHICH slip.
    The MCQ scorer (app.js buildMcqResult ~L1703) does not consume choice_tags today - a miss logs a
    plain miss on the correct bucket, no misconception_hit from the picked distractor. Tags are shipped
    on all 141 items (forward-authored) but inert until the scorer reads them.
  options:
    - (a) RECOMMENDED. Housing adds ~10 lines to buildMcqResult - on a miss, if q.choice_tags[picked]
          exists, push a misconception_hit (id = tag.misconception) the way guard hits flow. Turns the
          whole spelling bank into diagnostic data with zero item retrofit.
    - (b) Strip choice_tags from the items until the build lands, re-add later. More churn; loses the
          "ready the day it ships" property. Not recommended.
    - (c) Leave as-is indefinitely: items still WORK (index-scored, correct miss recorded); only the
          fine-grained which-slip diagnostic is missing. Acceptable but under-delivers the dispatch.
  lean: (a) - one small, localised Housing change unlocks the dispatch's stated purpose.
notes:
  - Leaf id form followed the dispatch (orthography.spelling.<class>), NOT the accent tree's
    orthography.accent.italian.* parallel. Flagged for Architecture; trivial find-replace if they
    want the .italian. segment.
  - Registry families gemination / orthography / accent_silent_letter already exist and are cross_kind;
    my 9 proposed specifics slot under them. Also proposed widening orthography.failed_elision's scope
    from "clitic not elided" to include un-elided articles rather than minting a near-duplicate.
  - Apostrophe boundary (po'/va') overlaps AccentAuthor's proposed apostrophe_not_accent; Smith ruled
    "author away ... doesn't matter who makes the qs" (2026-07-21). Architecture to de-dupe placement.
  - Wave-1 is all-MCQ by design. Typed doubling (survives norm()) + error-ID items are the wave-2 stub.
