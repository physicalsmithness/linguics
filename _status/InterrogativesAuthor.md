seat: InterrogativesAuthor
classes: [all-seats, all-authors]
# Reasoning (Rev 24 requires it stated, not guessed): I ORIGINATE grammar and translation
# items - markpoints, must_not_include guards, cue chips, prompts, item explanations. That is
# the definitional test for all-authors (what a seat originates, not what it touches), so
# criteria 13-21 all reach me. Architecture to ratify.
project: Linguics
updated: 2026-07-21
waiting: parked
needs_from_smith: decision
blocked_by:
claude_can_verify: n/a - no external action asked yet.
summary: Fresh seat onboarded (manifest-wired, 6 leaves minted, 0 items on disk). Queue empty of
  retrofits - criteria 13-21 reach a seat with no items as STANDING rules per Rev 24, not queue.
  Plan + 2 structural decisions put to Smith; unblocked leaves ready to author on his go.
queue:
  - (nothing owed - dispatch is the work; no thread carries Next: InterrogativesAuthor yet)
decisions_for_smith:
  - "A (adverb leaf): keep single interrogatives.adverbs [REC] vs split into come/dove/quando/perche
     sub-leaves for per-word coverage-grid granularity. A split needs Architecture to mint."
  - "C (exclamatives): exclude Che bello!/Come sei gentile!/Quanto costa! this batch [REC - dispatch
     scope is question-forming only] vs fold a small exclamative sub-leaf in here (OPEN_QUESTIONS:539
     flags interrogatives as the candidate host)."
taken_by_default (override if wrong):
  - "topic_short = interr (root attributes empty, same gap pp flagged); flagged for Architecture to add"
  - "quanto kept as ONE leaf: invariable-adverb use (Quanto costa?) + agreeing quantifier (Quanti anni?)
     are the teachable contrast, best paired same-surface not split"
  - "qual e / cos e / dov e orthography taught in explanations + graded in translation, NOT faked as a
     grammar guard: norm() folds apostrophe->space so qual'e == qual e is ungradable in the substring strand
     (same class as ArticleAuthor un'/un)"
notes:
  - "Short-token superstring hazard is ACUTE here: che/chi/come/dove nest inside common words
     (che inside perche/anche/poiche/benche; chi inside chissa). Every any_phrase + guard carries
     match_at word; guard-verdict assert mark(item,guard)==miss planned in the replica."
  - "perche accent is NOT load-bearing (crit 19): stripped twin perche is a misspelling not a rival
     ANSWER, so standard fold-rescue + orthography miss is the correct verdict."
  - "di chi (whose) + preposition-fronting (con chi / a che ora / di dove) are high-value English-
     interference errors; covered inside chi/adverbs via items + misconception tags, no new leaf."
