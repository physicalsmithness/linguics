seat: SpellingAuthor
classes: [all-authors, all-seats]
# Reasoning (Rev 24): originates markpoints, choice_tags, prompts, explanations -> all-authors.
# Standing criteria are n/a-by-construction (supplied-choice/index-scored: Rev 31 exempts 13/20;
# index-scored means crit-19 accent_load_bearing never arises; crit-21 is for formation drills) or
# already met (crit-17 English meaning in every explanation). No retrofit outstanding.
project: Linguics
updated: 2026-07-21
waiting: Housing (1-line error_id deck-filter add); Smith/Architecture (typed-doubling decision)
needs_from_smith: decision (typed-doubling: build a free-text drill mode or leave it — my lean: leave)
blocked_by: none for authoring
claude_can_verify: yes - ran invariant + minted-bucket + registry + error_id-render checks this turn (217 items, 0 errors)
summary: Wave-1 (141 MCQ) ACCEPTED + leaves/registry/glossary merged (Architecture v2). Wave-2
  delivered 2026-07-21 on Smith's "carry on" - +76 items (59 fresh-vocab MCQ + 17 error_id "find the
  misspelling") -> grammar_questions_orthography.json now 217 items, 0 validation errors. choice_tags
  reader is now BUILT (QoderWork), so all tags fire; corrected 75 stale proposed-flags post-merge.
  Thread Architecture_SpellingAuthor_batch_delivery.md at v3.
queue:
  - (authoring empty) two open items are on OTHER seats: Housing (error_id filter), Smith (typed call).
decision:
  question: Typed-doubling production bank. The spelling drill QoderWork built is index-scored
    (MCQ + error_id); it has no free-text input path. A typed bank needs a new drill mode + the
    substring-marker wiring. Recognition is already covered (MCQ); slip-spotting is covered (error_id).
  options:
    - (a) RECOMMENDED. Leave typed out. No production-typing instrument; error_id + MCQ suffice.
    - (b) Housing builds a free-text spelling-drill mode; then I author the typed bank (doubling,
          digraph, qu, silent_h, vowel survive norm(); apostrophe + capitalization do not).
  lean: (a) - real Housing cost for marginal instrument value; revisit only if Smith wants typing.
notes:
  - error_id renderer exists (isErrorId ~L1676); buildSpellingDeck (~L3300) filters type==="mcq", so
    the 17 error_id items are loaded-but-not-surfaced until Housing adds `|| q.type === "error_id"`.
    Inert-but-harmless (orthography items don't enter the general grammar deck).
  - Leaf id form CONFIRMED orthography.spelling.<class> (Architecture v2 ruled: keep, no .italian).
  - Per-class totals: doubling 82, c_g 35, apostrophe 32, digraph 26, qu_cu_cqu 24, capitalization 21,
    silent_h 20, vowel 12. 235 MCQ + 17 error_id = 252.
  - Wave-3 (2026-07-21, Smith): +30 doubling MCQ (minimal pairs, cognate under-doubling, reverse traps
    comune/comunicazione). Typed-doubling CONFIRMED dropped. Doubling now 33% of the bank - Smith's call
    that it's the hardest class for English speakers (capelo invisible vs squola obvious).
  - v5 ERRATUM (Smith caught it): rewrote 9 doubling explanations that falsely claimed English
    under-doubles (possibile/professore/successo/occasione/necessario/differenza/aggressivo - English
    keeps the double in all). Added 5 genuine cognate traps (gruppo, commedia, accademia, pubblico,
    cioccolato). Validator now guards against "English 'X' has one" where X doubles. Lesson: check the
    English spelling every time, don't assume Italian-doubles => English-drops.
