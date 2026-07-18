seat: IndefiniteAuthor
classes: [all-seats, all-authors]
# Reasoning (Rev 24 requires it stated, not guessed): I ORIGINATE grammar and translation
# items — markpoints, must_not_include guards, cue chips, prompts, item explanations. That is
# exactly what all-authors is defined as (the test is what a seat originates, not what it
# touches). So criteria 13-20 all reach me. Architecture to ratify.
project: Linguics
updated: 2026-07-18
waiting: parked
needs_from_smith: none
blocked_by:
claude_can_verify: n/a — no external action asked. (Push is Smith's but is verifiable by
  `git rev-list --count @{u}..HEAD`; I have not asked for one, so there is nothing to nag about.)
summary: Batch DELIVERED on Smith's ruling (a) — 61 grammar + 25 translation, all 9 leaves, zero zero-coverage; marker replica 62 markpoints / 0 findings after fixing 2 live false-credit bugs it caught. Five asks open to Architecture, none blocking.
queue:
  - Architecture_IndefiniteAuthor_free_choice_mood_seam.md v1   [inter_chat, Next: Architecture]
  - Architecture_IndefiniteAuthor_batch_delivery.md v1          [inter_chat, Next: Architecture]
delivered:
  - data/grammar_questions_indefinite.json (61 items, 62 markpoints, 9/9 leaves)
  - data/translation_items_indefinite.json (25 items, 15 en→it / 10 it→en, 28 negative anchors)
  - data/bucket_suggestions_indefinite.json (3, all uncited pending registration)
  - data/glossary_suggestions_indefinite.json (4 terms: indefinite, distributive, free choice, apocope)
  - coverage_indefinite.md
notes:
  - BIGGEST FINDING, in the seam thread: the free-choice subjunctive trigger (chiunque/qualunque
    + subjunctive) is owned by NO seat. tense_choice's four trigger leaves are opinion / emotion /
    hypothetical-conjunctions / negation; grep confirms ZERO tense_choice items use these words;
    and BOTH my free-choice leaves declare that parent as a prerequisite, so the shipped tree has a
    dangling prereq. TenseChoiceAuthor's "zero zero-coverage leaves" was honest — the leaf it would
    need does not exist. Architecture to rule who authors it (my rec: TenseChoiceAuthor, small re-open).
  - SECOND FINDING, in the delivery thread: knowing criterion 18 did not stop me breaking it. I
    diagnosed the additive-error hazard correctly in one item's examiner_note and shipped the
    forbidden guard two items away. Only executing the engine against each guard found it. Proposing
    the guard-verdict assertion for the central anchoring gate: a containment check cannot see this
    class, and it is the same shape as Pluperfect's five-week bug and WordFormation's deleted test.
  - Criterion 20 has a general hole: 9 of my 13 lemmas are INVARIABLE, so the citation-form exemption
    cannot reach them (DemonstrativeAuthor's (ciò) finding, nine times over). Complied without waiting
    — their ruling is about retrofit, mine are new — but offered a general rule for the criterion.
  - Rev 25 fired on `alcuno`: the dictionary lemma is literary and above A2, so all six alcuni items
    are glossed. The esserci case in a different tree, one day after the rule landed.
  - Misconception tagging IMPOSSIBLE for this topic: no indefinite entry in misconception_tag_lists.json,
    no indefinite coverage in misconceptions.json (1 of MisconceptionAnalyst's 132 unharvested buckets).
    Batch ships untagged with guards ready to take ids; ImperativoAuthor's retro-tag is the precedent.
  - `indefinite` still absent from data/manifest.json, as the scaffolding decision intended. Content
    has now landed; Architecture's to add. Flagged, not touched.
