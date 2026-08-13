seat: SpellingAuthor
classes: [all-authors, all-seats]
# Reasoning (Rev 24): originates markpoints, choice_tags, prompts, explanations -> all-authors.
# Standing criteria are n/a-by-construction (supplied-choice/index-scored: Rev 31 exempts 13/20;
# index-scored means crit-19 accent_load_bearing never arises; crit-21 is for formation drills) or
# already met (crit-17 English meaning in every explanation). No retrofit outstanding.
project: Linguics
updated: 2026-08-13
waiting: Architecture (tier-2 exclusion confirm); Housing (1-line error_id deck-filter add); Smith/Architecture (typed-doubling decision)
needs_from_smith: decision (typed-doubling: build a free-text drill mode or leave it — my lean: leave)
blocked_by: none for authoring
claude_can_verify: yes - re-derived the bank this turn (252 items, 235 MCQ + 17 error_id, 0 errors); confirmed NO tier-2 packet exists for orthography (find empty; on the excluded-8 list)
summary: Bank = 252 items (235 MCQ + 17 error_id), 0 errors. Wave-1 (141) ACCEPTED + leaves/registry/
  glossary merged; wave-2 (+76: fresh MCQ + error_id); wave-3 (+30 doubling, hardest cases) + v5 erratum
  (fixed 9 false English-cognate explanations Smith caught, +5 genuine cognates). choice_tags reader BUILT.
  2026-08-13: Smith routed me to a tier-2 review packet — NONE EXISTS for orthography (systematic:
  on the excluded-8 list; tier-2 targets under-bucketed TRANSLATION items, and spelling has none by design).
  Did NOT fabricate a review. Opened Architecture_SpellingAuthor_tier2_exclusion.md (confirm deliberate).
queue:
  - tier-2 exclusion: confirm thread opened, Next: Architecture. Recommend (a) deliberate/stand down.
    Genuine alternative if they want spelling in translation marking = the crosstopic-marking hook
    (dispatch job #1: supply the AI marker's spelling error-class taxonomy), NOT a review packet.
  - (authoring empty) other open items on OTHER seats: Housing (error_id filter), Smith (typed call).
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
