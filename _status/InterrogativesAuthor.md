seat: InterrogativesAuthor
classes: [all-seats, all-authors]
# Reasoning (Rev 24): I ORIGINATE grammar + translation items (markpoints, guards, cue chips,
# prompts, explanations) = the definitional test for all-authors. Architecture to ratify.
project: Linguics
updated: 2026-08-03
waiting: parked
needs_from_smith: continue (exclamatives + translations + coverage + delivery)
blocked_by:
claude_can_verify: yes - all claims re-derived from disk this turn (14 items parse, buckets in tree,
  real-engine harness green, 170-item estate probe run against housing/js/grammar_engine.js)
summary: A/B ruled. ALL SIX native-leaf grammar authored + verified on the REAL engine: 33 items
  (chi 6, che_cosa 4, quale 4, quanto 6, adverbs 8, discrimination 5); 39/39 positives hit, 25/25 guards
  miss, 18/18 MCQ choices correct. Accent/residue false-miss FILED as a standalone flag (ruling C).
  Remaining: exclamatives, all translations, coverage + delivery.
queue:
  - Author exclamatives (propose interrogatives.exclamatives via bucket_suggestions, author items) [ruling B]
  - Author ALL translation items across leaves
  - coverage_interrogatives.md + bucket_suggestions (topic_short interr, exclamatives) + glossary + deliver thread
decisions_for_smith:
  - "RESOLVED A: adverbs stay ONE leaf, all four covered as parts (Smith: 'four parts of one leaf')."
  - "RESOLVED B: exclamatives IN (Smith: 'should be in somewhere'); I propose interrogatives.exclamatives,
     Architecture mints, I author into it."
  - "OPEN (routing): the accent/residue false-miss is estate-wide (Housing engine). (a) I write it up as a
     standalone flag to Architecture/Housing now [REC], or (b) fold it into my delivery note."
delivered:
  - data/grammar_questions_interrogatives.json (33 items; all 6 native leaves; engine-verified)
  - inter_chat/Architecture_InterrogativesAuthor_residue_zeroes_accent_fold.md (v1, Next: Architecture)
notes:
  - FINDING detail: residue block (grammar_engine.js) drops matched any_phrase tokens by STRICT norm, so a
    fold-matched (accent-off) answer keeps its tokens as residue => forced miss, overriding the 0.5/0.8 dock.
    Probe: 170 single-markpoint accented items estate-wide, accent-off outcome {hit 3, partial 1, miss 166}.
    Mirror of the false-CREDIT bugs the estate chases; here it silently zeroes accent partial-credit.
  - Secondary residue edge: a full-sentence answer misses because prompt words glued to '?'' aren't subtracted
    (norm strips ?. only before whitespace). Low impact (learners fill the blank); flag with the above.
  - no interrogatives entries in the misconception registry yet; guards ship with notes, ids retro-addable
    (ImperativoAuthor precedent).
  - topic_short 'interr' still needs adding to the bucket-tree root attributes (root attributes: {} empty).
