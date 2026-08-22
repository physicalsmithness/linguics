import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  MarkerContractError,
  buildMarkerPromptContext,
  compactPromptSchemaText,
  compactPromptSchemaTextV3,
  compactPromptSchemaTextV4,
  compactPromptSchemaTextV5,
  normalizeModelResult,
  validateMarkerResult,
  type MarkerPromptContext,
} from "../src/marker_contract.ts";

function context(direction: "en_it" | "it_en" = "en_it", raw = "La sera, esco con gli amici."): MarkerPromptContext {
  return buildMarkerPromptContext({
    direction,
    cleanedRaw: raw,
    item: {
      source_text: direction === "en_it" ? "In the evening, I go out with friends." : "La sera, esco con gli amici.",
      source_language: direction === "en_it" ? "en" : "it",
      target_language: direction === "en_it" ? "it" : "en",
      required_buckets: ["grammar.required"],
      expected_buckets: ["grammar.expected"],
      optional_buckets: ["grammar.optional"],
    },
    bucketContext: {
      "grammar.required": { label: "Required skill", description: "Always returned." },
      "grammar.expected": { label: "Expected skill", description: "Only when engaged." },
      "grammar.optional": { label: "Optional skill" },
      "grammar.context": { label: "Context skill" },
    },
  });
}

function compact(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    v: 2,
    o: [1, 1, 1, "Right.", "The required form is correct."],
    m: [[0, 1, 1, [0, 1]]],
    n: [],
    ...overrides,
  };
}

function compactV3(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    v: 3,
    o: [1, 1, 1, "Right.", "The required form is correct."],
    m: [[0, 1, 1, "La sera"]],
    n: [],
    ...overrides,
  };
}

function compactV4(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    v: 4,
    o: [1, 1, 1, "Right.", "The required form is correct."],
    m: [{
      evidence: "La sera",
      bucket: "grammar.required",
      attempted: 1,
      correctness: 1,
    }],
    n: [],
    ...overrides,
  };
}

function legacyMinV5(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    v: 5,
    overall: {
      marks_awarded: 1,
      attempted_overall: 1,
      correctness_overall: 1,
      summary: "Right.",
      explanation: "The required form is correct.",
    },
    markpoints: [{
      bucket: "grammar.required",
      attempted_credit: 1,
      correctness_credit: 1,
      evidence: "La sera",
    }],
    unattributable: [],
    notes: [],
    ...overrides,
  };
}

function legacy(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    overall: {
      marks_awarded: 1,
      marks_possible: 1,
      attempted_overall: 1,
      correctness_overall: 1,
      summary: "Right.",
      explanation: "The required form is correct.",
    },
    raw_response: "model-controlled text",
    markpoints: [{
      bucket: "grammar.required",
      label: "Model label",
      attempted_credit: 1,
      correctness_credit: 1,
      outcome: "miss",
      evidence: "La sera",
    }],
    notes: [{ kind: "other", text: "A note." }],
    ...overrides,
  };
}

test("buildMarkerPromptContext gives stable role-precedence aliases and tokens", () => {
  const ctx = context();
  assert.deepEqual(ctx.prompt.buckets.map((row) => row.slice(0, 4)), [
    [0, "r", "grammar.required", "Required skill"],
    [1, "e", "grammar.expected", "Expected skill"],
    [2, "o", "grammar.optional", "Optional skill"],
    [3, "c", "grammar.context", "Context skill"],
  ]);
  assert.deepEqual(ctx.prompt.evidence_tokens, [
    [0, "La"], [1, "sera"], [2, ","], [3, "esco"], [4, "con"], [5, "gli"], [6, "amici"], [7, "."],
  ]);
  assert.match(compactPromptSchemaText, /Every r bucket must occur exactly once/);
  assert.match(compactPromptSchemaTextV3, /EXACT CONTIGUOUS SUBSTRING/);
  assert.doesNotMatch(compactPromptSchemaTextV3, /evidence_tokens/);
  assert.match(compactPromptSchemaTextV3, /contains "parlo"/);
  assert.doesNotMatch(compactPromptSchemaTextV3, /facevo/);
  assert.match(compactPromptSchemaTextV3, /Build m from learner evidence, never by enumerating the legend/);
  assert.match(compactPromptSchemaTextV3, /sole exception is an omitted-form miss/);
  assert.match(compactPromptSchemaTextV3, /surface text the learner actually wrote, never a dictionary lemma/);
  assert.match(compactPromptSchemaTextV3, /write \[8,1,1,"parlato"\]/);
  assert.match(compactPromptSchemaTextV3, /"parlare" is the bucket lemma, not learner evidence/);
  assert.match(compactPromptSchemaTextV3, /all three numeric o values are 0/);
  assert.match(compactPromptSchemaTextV3, /u, p and n are empty arrays/);
  assert.match(compactPromptSchemaTextV4, /evidence FIRST/);
  assert.match(compactPromptSchemaTextV4, /exact full_id/);
  assert.match(compactPromptSchemaTextV4, /"evidence":"parlato","bucket":"vocabulary\.it\.parlare/);
  assert.match(compactPromptSchemaTextV4, /Worker adds required not-attempted rows deterministically/);
  assert.match(compactPromptSchemaTextV4, /omit expected rather than writing null/);
  assert.match(compactPromptSchemaTextV4, /correctness is null only when attempted is 0/);
  assert.doesNotMatch(compactPromptSchemaTextV4, /evidence is the only structural field that may be null/);
  assert.match(compactPromptSchemaTextV5, /legacy-min v5/);
  assert.match(compactPromptSchemaTextV5, /exact full bucket id/);
  assert.match(compactPromptSchemaTextV5, /Do not emit marks_possible, raw_response, label, outcome, or bucket_proposed/);
  assert.match(compactPromptSchemaTextV5, /all three proposed_\* fields/);
  assert.match(compactPromptSchemaTextV5, /empty markpoints, unattributable, and notes arrays/);
});

test("compact system prompt uses aliases consistently while legacy keeps its schema", () => {
  const source = fs.readFileSync(new URL("../src/index.ts", import.meta.url), "utf8");
  const start = source.indexOf("  const policy = legacyPrompt.slice");
  const end = source.indexOf("  const compactSchema =", start);
  assert(start >= 0 && end > start);
  const compactBuilder = source.slice(start, end);
  assert.match(source, /serialize it with that numeric alias/);
  assert.match(source, /Only for a genuinely unlisted content word, serialize it as v:<Italian dictionary lemma>/);
  assert.match(compactBuilder, /optional fourth value is a suggested full bucket id/);
  assert.doesNotMatch(compactBuilder, /Fire `vocabulary\.it\.<lemma>\.translation`/);
  assert.doesNotMatch(compactBuilder, /use the id exactly as/);

  assert.match(source, /const fullIdRows = responseContract === "compact_v4"/);
  assert.match(source, /copy that exact full_id into the m object's bucket field/);
  assert.match(source, /A required but unengaged skill uses evidence null, attempted 0, and correctness null/);
  assert.match(source, /const vocabularyProductionBlock = fullIdRows/);
  assert.match(source, /const vocabularyRecognitionBlock = fullIdRows/);
});

test("compact v4 hydrates evidence-first named rows with exact full IDs", () => {
  const result = normalizeModelResult(compactV4({
    m: [{
      evidence: "La sera",
      bucket: "grammar.required",
      attempted: 1,
      correctness: 1,
      expected: "canonical form",
    }],
  }), context());
  assert.deepEqual(result.markpoints[0], {
    bucket: "grammar.required",
    label: "Required skill",
    attempted_credit: 1,
    correctness_credit: 1,
    outcome: "hit",
    evidence: "La sera",
    expected: "canonical form",
    bucket_proposed: false,
  });

  assert.throws(() => normalizeModelResult(compactV4({
    m: [{ evidence: "la sera", bucket: "grammar.required", attempted: 1, correctness: 1 }],
  }), context()), (error: unknown) => error instanceof MarkerContractError
    && error.code === "invalid_evidence");
  assert.throws(() => normalizeModelResult(compactV4({
    m: [{ evidence: "La sera", bucket: 0, attempted: 1, correctness: 1 }],
  }), context()), /exact full id/);
  assert.throws(() => normalizeModelResult(compactV4({
    m: [{ evidence: "La sera", bucket: "grammar.not_supplied", attempted: 1, correctness: 1 }],
  }), context()), /neither an exact supplied id nor sanctioned dynamic vocabulary/);
  assert.throws(() => normalizeModelResult(compactV4({
    m: [{ evidence: "La sera", bucket: "grammar.required", attempted: 1, correctness: 1, extra: true }],
  }), context()), /unexpected field extra/);
  assert.throws(() => normalizeModelResult(compactV4({
    m: [
      { evidence: "La sera", bucket: "grammar.required", attempted: 1, correctness: 1 },
      { evidence: "invented", bucket: "grammar.expected", attempted: 0, correctness: 1 },
    ],
  }), context()), /only when engaged/);
  assert.throws(() => normalizeModelResult(compactV4({
    m: [{ evidence: null, bucket: "grammar.required", attempted: 0, correctness: 0 }],
  }), context()), /correctness must be null/);
  assert.throws(() => normalizeModelResult(compactV4({
    m: [{ evidence: null, bucket: "grammar.required", attempted: 1, correctness: 1, expected: "canonical form" }],
  }), context()), /only an omitted-form miss/);
  assert.throws(() => normalizeModelResult(compactV4({
    m: [{ evidence: null, bucket: "grammar.required", attempted: 1, correctness: 0.5, expected: "canonical form" }],
  }), context()), /only an omitted-form miss/);
  const omitted = normalizeModelResult(compactV4({
    m: [{ evidence: null, bucket: "grammar.required", attempted: 1, correctness: 0, expected: "canonical form" }],
  }), context());
  assert.equal(omitted.markpoints[0].outcome, "miss");
  assert.equal(omitted.markpoints[0].evidence, undefined);
  assert.equal(omitted.markpoints[0].expected, "canonical form");
});

test("compact v4 supports sanctioned dynamic vocabulary and rejects tuples", () => {
  const result = normalizeModelResult(compactV4({
    m: [
      { evidence: "La sera", bucket: "grammar.required", attempted: 1, correctness: 1 },
      { evidence: "esco", bucket: "vocabulary.it.uscire.translation", attempted: 1, correctness: 1, expected: "uscire" },
    ],
  }), context("en_it"));
  assert.equal(result.markpoints[1].bucket, "vocabulary.it.uscire.translation");
  assert.equal(result.markpoints[1].evidence, "esco");
  assert.equal(result.markpoints[1].expected, "uscire");

  assert.throws(() => normalizeModelResult(compactV4({
    m: [["La sera", "grammar.required", 1, 1]],
  }), context()), /evidence-first object/);
  assert.throws(() => normalizeModelResult(compactV4({
    m: [
      { evidence: "La sera", bucket: "grammar.required", attempted: 1, correctness: 1 },
      { evidence: "esco", bucket: "vocabulary.it.uscire.translation", attempted: 1, correctness: 1 },
    ],
  }), context("it_en")), /neither an exact supplied id nor sanctioned dynamic vocabulary/);
});

test("compact v4 expands required blanks only for a wholly unattempted answer", () => {
  const result = normalizeModelResult(compactV4({
    o: [0, 0, 0, "Not attempted.", "The answer was wholly in the wrong language."],
    m: [],
  }), context());
  assert.equal(result.markpoints.length, 1);
  assert.equal(result.markpoints[0].bucket, "grammar.required");
  assert.equal(result.markpoints[0].outcome, "not_attempted");

  assert.throws(() => normalizeModelResult(compactV4({ m: [] }), context()), /must occur exactly once/);
  assert.throws(() => normalizeModelResult(compactV4({
    o: [0, 0, 0, "Not attempted.", "The answer was wholly in the wrong language."],
    m: [],
    n: [["other", "Wrong language."]],
  }), context()), /empty notes array/);
  assert.throws(() => normalizeModelResult(compactV4({
    o: [0, 1, 0, "Not attempted.", "Contradictory attempted score."],
    m: [{ evidence: null, bucket: "grammar.required", attempted: 0, correctness: null }],
    n: [["other", "Wrong language."]],
  }), context()), /empty notes array/);
});

test("legacy-min v5 derives the five omitted public fields and preserves visible output", () => {
  const result = normalizeModelResult(legacyMinV5({
    markpoints: [{
      bucket: "grammar.required",
      attempted_credit: 1,
      correctness_credit: 1,
      evidence: "La sera",
      expected: "canonical form",
    }],
    unattributable: [{ evidence: "amici", what: "A useful extra observation.", correct: true }],
    notes: [{ kind: "accent", text: "Keep the written accent." }],
  }), context());

  assert.equal(result.overall.marks_possible, 1);
  assert.equal(result.raw_response, "La sera, esco con gli amici.");
  assert.deepEqual(result.markpoints[0], {
    bucket: "grammar.required",
    label: "Required skill",
    attempted_credit: 1,
    correctness_credit: 1,
    outcome: "hit",
    evidence: "La sera",
    expected: "canonical form",
    bucket_proposed: false,
  });
  assert.deepEqual(result.unattributable, [{
    evidence: "amici",
    what: "A useful extra observation.",
    correct: true,
  }]);
  assert.deepEqual(result.notes, [{
    kind: "accent",
    text: "Keep the written accent.",
    note: "Keep the written accent.",
  }]);
});

test("legacy-min v5 rejects every model-supplied derived field", () => {
  const cases: Array<[string, (payload: Record<string, unknown>) => void]> = [
    ["marks_possible", (payload) => {
      (payload.overall as Record<string, unknown>).marks_possible = 1;
    }],
    ["raw_response", (payload) => {
      payload.raw_response = "model-controlled";
    }],
    ["label", (payload) => {
      ((payload.markpoints as Array<Record<string, unknown>>)[0]).label = "Model label";
    }],
    ["outcome", (payload) => {
      ((payload.markpoints as Array<Record<string, unknown>>)[0]).outcome = "hit";
    }],
    ["bucket_proposed", (payload) => {
      ((payload.markpoints as Array<Record<string, unknown>>)[0]).bucket_proposed = false;
    }],
  ];

  for (const [field, mutate] of cases) {
    const payload = legacyMinV5();
    mutate(payload);
    assert.throws(() => normalizeModelResult(payload, context()), (error: unknown) => {
      return error instanceof MarkerContractError
        && error.code === "unknown_field"
        && error.message.includes(`unexpected field ${field}`);
    }, field);
  }
});

test("legacy-min v5 enforces exact evidence, required counts, duplicates, and explicit blank rules", () => {
  assert.throws(() => normalizeModelResult(legacyMinV5({
    markpoints: [{
      bucket: "grammar.required",
      attempted_credit: 1,
      correctness_credit: 1,
      evidence: "la sera",
    }],
  }), context()), (error: unknown) => error instanceof MarkerContractError && error.code === "invalid_evidence");

  assert.throws(() => normalizeModelResult(legacyMinV5({
    markpoints: [{ bucket: "grammar.required", attempted_credit: 1, correctness_credit: 1 }],
  }), context()), /evidence is required/);

  assert.throws(() => normalizeModelResult(legacyMinV5({
    markpoints: [{
      bucket: "grammar.expected",
      attempted_credit: 1,
      correctness_credit: 1,
      evidence: "esco",
    }],
  }), context()), /must occur exactly once/);

  const required = (legacyMinV5().markpoints as Array<Record<string, unknown>>)[0];
  assert.throws(() => normalizeModelResult(legacyMinV5({
    markpoints: [required, { ...required, evidence: "esco" }],
  }), context()), (error: unknown) => error instanceof MarkerContractError && error.code === "duplicate_bucket");

  assert.throws(() => normalizeModelResult(legacyMinV5({
    markpoints: [required, {
      bucket: "grammar.expected",
      attempted_credit: 0,
      correctness_credit: null,
      evidence: null,
    }],
  }), context()), /only when engaged/);

  assert.throws(() => normalizeModelResult(legacyMinV5({
    markpoints: [{
      bucket: "grammar.required",
      attempted_credit: 0,
      correctness_credit: null,
      evidence: null,
      expected: "must be absent",
    }],
  }), context()), /must omit expected/);

  const omitted = normalizeModelResult(legacyMinV5({
    overall: {
      marks_awarded: 0,
      attempted_overall: 1,
      correctness_overall: 0,
      summary: "Missing form.",
      explanation: "The required form was omitted.",
    },
    markpoints: [{
      bucket: "grammar.required",
      attempted_credit: 1,
      correctness_credit: 0,
      evidence: null,
      expected: "the required form",
    }],
  }), context());
  assert.equal(omitted.markpoints[0].outcome, "miss");
  assert.equal(omitted.markpoints[0].evidence, undefined);
  assert.throws(() => normalizeModelResult(legacyMinV5({
    markpoints: [{
      bucket: "grammar.required",
      attempted_credit: 1,
      correctness_credit: 1,
      evidence: null,
      expected: "canonical form",
    }],
  }), context()), /only an omitted-form miss/);
});

test("legacy-min v5 permits only canonical engaged en_it dynamic vocabulary", () => {
  const baseRequired = (legacyMinV5().markpoints as Array<Record<string, unknown>>)[0];
  const result = normalizeModelResult(legacyMinV5({
    markpoints: [baseRequired, {
      bucket: "vocabulary.it.uscire.translation",
      attempted_credit: 1,
      correctness_credit: 1,
      evidence: "esco",
      expected: "uscire",
    }],
  }), context("en_it"));
  assert.deepEqual(result.markpoints[1], {
    bucket: "vocabulary.it.uscire.translation",
    label: "uscire (translation)",
    attempted_credit: 1,
    correctness_credit: 1,
    outcome: "hit",
    evidence: "esco",
    expected: "uscire",
    bucket_proposed: false,
  });

  for (const bucket of [
    "vocabulary.it.Uscire.translation",
    "vocabulary.it.perche\u0301.translation",
  ]) {
    assert.throws(() => normalizeModelResult(legacyMinV5({
      markpoints: [baseRequired, {
        bucket,
        attempted_credit: 1,
        correctness_credit: 1,
        evidence: "esco",
      }],
    }), context("en_it")), /neither supplied, proposed, nor legal dynamic vocabulary/);
  }

  assert.throws(() => normalizeModelResult(legacyMinV5({
    markpoints: [baseRequired, {
      bucket: "vocabulary.it.uscire.translation",
      attempted_credit: 1,
      correctness_credit: 1,
      evidence: "esco",
    }],
  }), context("it_en")), /neither supplied, proposed, nor legal dynamic vocabulary/);

  assert.throws(() => normalizeModelResult(legacyMinV5({
    markpoints: [baseRequired, {
      bucket: "vocabulary.it.uscire.translation",
      attempted_credit: 1,
      correctness_credit: 0,
      evidence: null,
      expected: "uscire",
    }],
  }), context("en_it")), /must be engaged and cite learner evidence/);
});

test("legacy-min v5 infers proposals only from complete safe metadata", () => {
  const baseRequired = (legacyMinV5().markpoints as Array<Record<string, unknown>>)[0];
  const proposed = {
    bucket: "grammar.context.new_leaf",
    attempted_credit: 1,
    correctness_credit: 0.5,
    evidence: "esco",
    expected: "a more precise form",
    proposed_parent_id: "grammar.context",
    proposed_label: "New leaf",
    proposed_rationale: "Worth tracking separately.",
  };
  const result = normalizeModelResult(legacyMinV5({
    markpoints: [baseRequired, proposed],
  }), context());
  assert.deepEqual(result.markpoints[1], {
    bucket: "grammar.context.new_leaf",
    label: "New leaf",
    attempted_credit: 1,
    correctness_credit: 0.5,
    outcome: "partial",
    evidence: "esco",
    expected: "a more precise form",
    bucket_proposed: true,
    proposed_parent_id: "grammar.context",
    proposed_label: "New leaf",
    proposed_rationale: "Worth tracking separately.",
  });

  const { proposed_rationale: _omitted, ...partialProposal } = proposed;
  assert.throws(() => normalizeModelResult(legacyMinV5({
    markpoints: [baseRequired, partialProposal],
  }), context()), /must be supplied together/);
  assert.throws(() => normalizeModelResult(legacyMinV5({
    markpoints: [baseRequired, { ...proposed, bucket: "grammar.context.BadLeaf" }],
  }), context()), /safe lower-case child path/);
  assert.throws(() => normalizeModelResult(legacyMinV5({
    markpoints: [baseRequired, { ...proposed, bucket: "grammar.context", proposed_parent_id: "grammar.required" }],
  }), context()), /existing supplied bucket must omit proposed/);
  assert.throws(() => normalizeModelResult(legacyMinV5({
    markpoints: [baseRequired, {
      bucket: "grammar.unknown",
      attempted_credit: 1,
      correctness_credit: 1,
      evidence: "esco",
    }],
  }), context()), /neither supplied, proposed, nor legal dynamic vocabulary/);
});

test("legacy-min v5 expands only the strict zero-attempt empty-array form", () => {
  const zeroOverall = {
    marks_awarded: 0,
    attempted_overall: 0,
    correctness_overall: 0,
    summary: "Not attempted.",
    explanation: "The answer was wholly in the wrong language.",
  };
  const result = normalizeModelResult(legacyMinV5({
    overall: zeroOverall,
    markpoints: [],
  }), context());
  assert.deepEqual(result.markpoints, [{
    bucket: "grammar.required",
    label: "Required skill",
    attempted_credit: 0,
    correctness_credit: null,
    outcome: "not_attempted",
    bucket_proposed: false,
  }]);
  assert.deepEqual(result.unattributable, []);

  assert.throws(() => normalizeModelResult(legacyMinV5({
    overall: zeroOverall,
    markpoints: [],
    notes: [{ kind: "other", text: "Wrong language." }],
  }), context()), /empty markpoints, unattributable, and notes arrays/);
  assert.throws(() => normalizeModelResult(legacyMinV5({
    overall: { ...zeroOverall, marks_awarded: 0.1 },
    markpoints: [],
  }), context()), /zero marks and zero correctness/);
  assert.throws(() => normalizeModelResult(legacyMinV5({
    overall: { ...zeroOverall, attempted_overall: 1 },
    markpoints: [{
      bucket: "grammar.required",
      attempted_credit: 0,
      correctness_credit: null,
      evidence: null,
    }],
  }), context()), /must contain an engaged markpoint or unattributable observation/);
});

test("legacy-min v5 normalizes an unknown legacy note kind without exposing an invalid public kind", () => {
  const result = normalizeModelResult(legacyMinV5({
    notes: [{ kind: "common_error", text: "A catalogued error." }],
  }), context());
  assert.deepEqual(result.notes[0], {
    kind: "other",
    source_kind: "common_error",
    text: "A catalogued error.",
    note: "A catalogued error.",
  });
});

test("compact v3 hydrates exact learner substrings without token indices", () => {
  const result = normalizeModelResult(compactV3(), context());
  assert.equal(result.markpoints[0].evidence, "La sera");
  assert.equal(result.markpoints[0].bucket, "grammar.required");

  assert.throws(() => normalizeModelResult(compactV3({
    m: [[0, 1, 1, "not in the learner answer"]],
  }), context()), (error: unknown) => error instanceof MarkerContractError
    && error.code === "invalid_evidence"
    && /exact contiguous substring/.test(error.message));
  assert.throws(() => normalizeModelResult(compactV3({
    m: [[0, 1, 1, [0, 1]]],
  }), context()), /must be a string/);
});

test("compact v3 supports omitted forms, dynamic vocabulary, observations, and proposals", () => {
  const result = normalizeModelResult(compactV3({
    m: [
      [0, 1, 0, null, "required form"],
      ["v:uscire", 1, 1, "esco"],
    ],
    u: [["gli amici", "Useful lexical evidence.", true, "vocabulary.it.amico.translation"]],
    p: [{
      r: 3,
      s: "new_leaf",
      l: "New leaf",
      y: "Worth tracking separately.",
      a: 1,
      c: 0,
      e: "esco",
      x: "vado",
    }],
  }), context("en_it"));
  assert.equal(result.markpoints[0].expected, "required form");
  assert.equal(result.markpoints[1].bucket, "vocabulary.it.uscire.translation");
  assert.equal(result.markpoints[1].evidence, "esco");
  assert.equal(result.markpoints[2].bucket, "grammar.context.new_leaf");
  assert.equal(result.unattributable?.[0].evidence, "gli amici");
});

test("compact v3 derives only consistent all-unattempted holistic scores", () => {
  const none = normalizeModelResult(compactV3({
    o: [0, 1, 0, "Not attempted.", "The learner answered in the wrong language."],
    m: [[0, 0, null, null]],
    n: [["other", "The response was in the source language."]],
  }), context());
  assert.equal(none.overall.attempted_overall, 0);

  assert.throws(() => normalizeModelResult(compactV3({
    o: [1, 1, 1, "Right.", "Contradictory positive holistic scores."],
    m: [[0, 0, null, null]],
  }), context()), (error: unknown) => error instanceof MarkerContractError
    && error.code === "holistic_inconsistent");

  assert.throws(() => normalizeModelResult(compactV3({
    o: [1, 0, 1, "Right.", "Contradictory zero attempted score."],
  }), context()), (error: unknown) => error instanceof MarkerContractError
    && error.code === "holistic_inconsistent");

  const engaged = normalizeModelResult(compactV3({
    o: [0.5, 0.5, 0.5, "Partial.", "Some of the response was attempted."],
  }), context());
  assert.equal(engaged.overall.attempted_overall, 0.5);
});

test("preflight rejects a listed non-vocabulary bucket absent from bucketContext", () => {
  assert.throws(() => buildMarkerPromptContext({
    cleanedRaw: "ciao",
    direction: "en_it",
    item: { required_buckets: ["missing.required"] },
    bucketContext: {},
  }), (error: unknown) => error instanceof MarkerContractError
    && error.code === "required_bucket_not_fireable"
    && /absent from bucketContext/.test(error.message));
});

test("preflight permits listed en_it vocabulary without a context definition", () => {
  const ctx = buildMarkerPromptContext({
    cleanedRaw: "esco",
    direction: "en_it",
    item: { required_buckets: ["vocabulary.it.uscire.translation"] },
    bucketContext: {},
  });
  assert.equal(ctx.legend[0].id, "vocabulary.it.uscire.translation");
  assert.equal(ctx.legend[0].role, "r");
});

test("the absent-context vocabulary exception accepts only the bare Italian production shape", () => {
  for (const id of [
    "vocabulary.foo",
    "vocabulary.en.foo.translation",
    "vocabulary.it.bad lemma.translation",
    "vocabulary.it.uscire.translation.passive",
    "vocabulary.it.Uscire.translation",
    "vocabulary.it.perche\u0301.translation",
  ]) {
    assert.throws(() => buildMarkerPromptContext({
      cleanedRaw: "esco",
      direction: "en_it",
      item: { required_buckets: [id] },
      bucketContext: {},
    }), /absent from bucketContext/);
  }
});

test("compact required alias hydrates the legacy public shape with exact evidence", () => {
  const result = normalizeModelResult(compact(), context());
  assert.deepEqual(result.markpoints[0], {
    bucket: "grammar.required",
    label: "Required skill",
    attempted_credit: 1,
    correctness_credit: 1,
    outcome: "hit",
    evidence: "La sera",
    bucket_proposed: false,
  });
  assert.equal(result.overall.marks_possible, 1);
  assert.equal(result.raw_response, "La sera, esco con gli amici.");
});

test("required alias must appear exactly once", () => {
  assert.throws(() => normalizeModelResult(compact({ m: [] }), context()), /must occur exactly once/);
  assert.throws(() => normalizeModelResult(compact({
    m: [[0, 1, 1, [0, 0]], [0, 1, 1, [1, 1]]],
  }), context()), /occurs more than once/);
});

test("required not-attempted is explicit, while omitted expected is accepted", () => {
  const result = normalizeModelResult(compact({ m: [[0, 0, null, null]] }), context());
  assert.equal(result.markpoints.length, 1);
  assert.equal(result.markpoints[0].outcome, "not_attempted");
  assert.equal(result.markpoints.some((mp) => mp.bucket === "grammar.expected"), false);
});

test("serialized blanks for non-required aliases are deterministically omitted", () => {
  const ctx = context();
  for (const alias of [1, 2, 3]) {
    const blank = normalizeModelResult(compact({
      m: [[0, 1, 1, [0, 0]], [alias, 0, null, null]],
    }), ctx);
    assert.deepEqual(blank.markpoints.map((mp) => mp.bucket), ["grammar.required"]);
  }
  const result = normalizeModelResult(compact({
    m: [[0, 1, 1, [0, 0]], [1, 1, 0.5, [3, 3], "esco"], [3, 1, 0, null, "a casa"]],
  }), ctx);
  assert.deepEqual(result.markpoints.map((mp) => mp.outcome), ["hit", "partial", "miss"]);
});

test("unknown numeric aliases fail", () => {
  assert.throws(() => normalizeModelResult(compact({
    m: [[0, 1, 1, [0, 0]], [99, 1, 1, [1, 1]]],
  }), context()), /unknown numeric bucket alias/);
});

test("dynamic v:<lemma> works only for engaged en_it vocabulary", () => {
  const result = normalizeModelResult(compact({
    m: [[0, 1, 1, [0, 0]], ["v:uscire", 1, 1, [3, 3]]],
  }), context("en_it"));
  assert.equal(result.markpoints[1].bucket, "vocabulary.it.uscire.translation");
  assert.equal(result.markpoints[1].label, "uscire (translation)");

  assert.throws(() => normalizeModelResult(compact({
    m: [[0, 1, 1, [0, 0]], ["v:uscire", 1, 1, [3, 3]]],
  }), context("it_en")), /legal only on en_it/);
  assert.throws(() => normalizeModelResult(compact({
    m: [[0, 1, 1, [0, 0]], ["v:bad lemma", 1, 1, [3, 3]]],
  }), context("en_it")), /unsupported characters/);
  assert.throws(() => normalizeModelResult(compact({
    m: [[0, 1, 1, [0, 0]], ["v:uscire", 1, 0, null, "uscire"]],
  }), context("en_it")), /must cite learner evidence/);
});

test("compact full IDs normalize only when supplied or sanctioned dynamic vocabulary", () => {
  const supplied = normalizeModelResult(compact({
    m: [["grammar.required", 1, 1, [0, 0]]],
  }), context());
  assert.equal(supplied.markpoints[0].bucket, "grammar.required");

  const dynamic = normalizeModelResult(compact({
    m: [["grammar.required", 1, 1, [0, 0]], ["vocabulary.it.uscire.translation", 1, 1, [3, 3]]],
  }), context("en_it"));
  assert.equal(dynamic.markpoints[1].bucket, "vocabulary.it.uscire.translation");

  const dynamicBlank = normalizeModelResult(compact({
    m: [["grammar.required", 1, 1, [0, 0]], ["vocabulary.it.uscire.translation", 0, 0, null]],
  }), context("en_it"));
  assert.deepEqual(dynamicBlank.markpoints.map((mp) => mp.bucket), ["grammar.required"]);

  assert.throws(() => normalizeModelResult(compact({
    m: [["grammar.required", 1, 1, [0, 0]], ["grammar.not_supplied", 1, 1, [3, 3]]],
  }), context()), /numeric alias or v:<lemma>/);
});

test("attempted_credit is binary and correctness is null iff unattempted", () => {
  assert.throws(() => normalizeModelResult(compact({ m: [[0, 0.5, 0.5, [0, 0]]] }), context()), /binary/);
  const normalizedBlank = normalizeModelResult(compact({ m: [[0, 0, 0, null]] }), context());
  assert.equal(normalizedBlank.markpoints[0].correctness_credit, null);
  assert.equal(normalizedBlank.markpoints[0].outcome, "not_attempted");
  assert.throws(() => normalizeModelResult(compact({ m: [[0, 1, null, [0, 0]]] }), context()), /finite number/);
});

test("compact optional nulls are treated as omitted, never learner-facing values", () => {
  const result = normalizeModelResult(compact({
    m: [[0, 1, 1, [0, 0], null]],
    u: [[[3, 3], "A useful observation.", true, null]],
  }), context());
  assert.equal(result.markpoints[0].expected, undefined);
  assert.equal(result.unattributable?.[0].suggest, undefined);
});

test("outcome derives from the two credit axes", () => {
  const cases: Array<[number, number | null, string]> = [
    [0, null, "not_attempted"],
    [1, 1, "hit"],
    [1, 0, "miss"],
    [1, 0.4, "partial"],
  ];
  for (const [a, c, expectedOutcome] of cases) {
    const row = a === 0 ? [0, a, c, null] : c === 0 ? [0, a, c, null, "correct form"] : [0, a, c, [0, 0]];
    const result = normalizeModelResult(compact({ m: [row] }), context());
    assert.equal(result.markpoints[0].outcome, expectedOutcome);
  }
});

test("Unicode tokens reconstruct accents, apostrophes, punctuation, and repeated words exactly", () => {
  const raw = "Perché l'ho detto—perché?";
  const ctx = buildMarkerPromptContext({
    direction: "en_it",
    cleanedRaw: raw,
    item: { required_buckets: ["grammar.required"] },
    bucketContext: { "grammar.required": { label: "Required" } },
  });
  assert.deepEqual(ctx.prompt.evidence_tokens, [
    [0, "Perché"], [1, "l'ho"], [2, "detto"], [3, "—"], [4, "perché"], [5, "?"],
  ]);
  const result = normalizeModelResult(compact({ m: [[0, 1, 1, [3, 5]]] }), ctx);
  assert.equal(result.markpoints[0].evidence, "—perché?");
});

test("invalid token spans fail, while an omitted-form miss may use null plus expected", () => {
  for (const span of [[-1, 0], [2, 1], [0, 99], [0.5, 1]]) {
    assert.throws(() => normalizeModelResult(compact({ m: [[0, 1, 1, span]] }), context()), /token indices/);
  }
  const omitted = normalizeModelResult(compact({ m: [[0, 1, 0, null, "progetto"]] }), context());
  assert.equal(omitted.markpoints[0].evidence, undefined);
  assert.equal(omitted.markpoints[0].expected, "progetto");
  assert.throws(() => normalizeModelResult(compact({ m: [[0, 1, 0, null]] }), context()), /only an omitted-form miss/);
});

test("hits must omit expected correction", () => {
  assert.throws(() => normalizeModelResult(compact({
    m: [[0, 1, 1, [0, 0], "La"]],
  }), context()), /hits must omit/);
});

test("unattributable observations hydrate exact evidence and suggestion", () => {
  const result = normalizeModelResult(compact({
    u: [[[3, 3], "An extra lexical choice.", true, "vocabulary.it.uscire.translation"]],
  }), context());
  assert.deepEqual(result.unattributable, [{
    evidence: "esco",
    what: "An extra lexical choice.",
    correct: true,
    suggest: "vocabulary.it.uscire.translation",
  }]);
});

test("proposal hydrates a draft markpoint under an existing aliased parent", () => {
  const result = normalizeModelResult(compact({
    p: [{
      r: 3,
      s: "new_leaf",
      l: "New leaf",
      y: "Worth tracking separately.",
      a: 1,
      c: 0,
      e: [3, 3],
      x: "vado",
    }],
  }), context());
  const proposal = result.markpoints[1];
  assert.equal(proposal.bucket, "grammar.context.new_leaf");
  assert.equal(proposal.bucket_proposed, true);
  assert.equal(proposal.proposed_parent_id, "grammar.context");
  assert.equal(proposal.proposed_label, "New leaf");
  assert.equal(proposal.proposed_rationale, "Worth tracking separately.");
  assert.equal(proposal.evidence, "esco");
});

test("proposal rejects unknown parent, unsafe slug, and existing-id collision", () => {
  const base = { l: "New", y: "Reason.", a: 1, c: 0, e: [0, 0], x: "right" };
  assert.throws(() => normalizeModelResult(compact({ p: [{ ...base, r: 99, s: "new" }] }), context()), /existing numeric alias/);
  assert.throws(() => normalizeModelResult(compact({ p: [{ ...base, r: 3, s: "Bad Slug" }] }), context()), /lower-case/);
  assert.throws(() => normalizeModelResult(compact({
    p: [{ ...base, r: 3, s: "new", a: 0, c: null, e: null, x: undefined }],
  }), context()), /must describe an engaged skill/);
  const collisionContext = buildMarkerPromptContext({
    direction: "en_it",
    cleanedRaw: "ciao",
    item: { required_buckets: ["grammar.context"], optional_buckets: ["grammar.context.ignored"] },
    bucketContext: {
      "grammar.context": { label: "Context" },
      "grammar.context.ignored": { label: "Existing" },
    },
  });
  assert.throws(() => normalizeModelResult(compact({
    m: [[0, 1, 1, [0, 0]]],
    p: [{ ...base, r: 0, s: "ignored", e: [0, 0] }],
  }), collisionContext), /already exists/);
});

test("notes expose both text and renderer-compatible note", () => {
  const result = normalizeModelResult(compact({ n: [["accent", "perché needs the acute accent."]] }), context());
  assert.deepEqual(result.notes[0], {
    kind: "accent",
    text: "perché needs the acute accent.",
    note: "perché needs the acute accent.",
  });
});

test("holistic values are strict but independent from markpoint arithmetic", () => {
  const result = normalizeModelResult(compact({
    o: [0.7, 0.8, 0.6, "Mixed.", "A holistic judgement that need not equal the markpoint mean."],
  }), context());
  assert.equal(result.overall.marks_awarded, 0.7);
  assert.equal(result.overall.attempted_overall, 0.8);
  assert.equal(result.overall.correctness_overall, 0.6);
  assert.throws(() => normalizeModelResult(compact({
    o: [1.1, 1, 1, "Bad.", "Out of range."],
  }), context()), /0 to 1/);
});

test("legacy fallback derives outcome, restores known label, authoritative raw, and note compatibility", () => {
  const result = normalizeModelResult(legacy(), context());
  assert.equal(result.raw_response, "La sera, esco con gli amici.");
  assert.equal(result.markpoints[0].label, "Required skill");
  assert.equal(result.markpoints[0].outcome, "hit");
  assert.equal(result.markpoints[0].bucket_proposed, false);
  assert.equal(result.notes[0].note, "A note.");
  assert.equal(validateMarkerResult(result, context()).ok, true);
});

test("legacy compatibility preserves unknown note kinds and derives required blanks on a zero attempt", () => {
  const base = legacy();
  const result = normalizeModelResult(legacy({
    overall: {
      ...(base.overall as Record<string, unknown>),
      marks_awarded: 0,
      attempted_overall: 0,
      correctness_overall: 0,
    },
    markpoints: [],
    notes: [{ kind: "common_error", text: "A catalogued error." }],
  }), context());
  assert.equal(result.markpoints.length, 1);
  assert.equal(result.markpoints[0].bucket, "grammar.required");
  assert.equal(result.markpoints[0].outcome, "not_attempted");
  assert.equal(result.notes[0].kind, "other");
  assert.equal(result.notes[0].source_kind, "common_error");
  assert.equal(result.notes[0].text, "A catalogued error.");
});

test("legacy fallback is strict about required buckets and exact evidence", () => {
  assert.throws(() => normalizeModelResult(legacy({ markpoints: [] }), context()), /must occur exactly once/);
  assert.throws(() => normalizeModelResult(legacy({
    markpoints: [{
      bucket: "grammar.required",
      attempted_credit: 1,
      correctness_credit: 0,
      evidence: "words the learner did not write",
    }],
  }), context()), /not an exact substring/);
  assert.throws(() => normalizeModelResult(legacy({
    markpoints: [{
      bucket: "grammar.required",
      attempted_credit: 1,
      correctness_credit: 0,
    }],
  }), context()), /only an omitted-form miss/);
  for (const bucket of [
    "vocabulary.it.Uscire.translation",
    "vocabulary.it.perche\u0301.translation",
  ]) {
    assert.throws(() => normalizeModelResult(legacy({
      markpoints: [legacy().markpoints[0], {
        bucket,
        attempted_credit: 1,
        correctness_credit: 1,
        evidence: "esco",
      }],
    }), context()), /neither supplied nor legal dynamic vocabulary/);
  }
});

test("legacy proposals must be safe children of a supplied parent", () => {
  const proposed = {
    bucket: "grammar.context.new_leaf",
    bucket_proposed: true,
    proposed_parent_id: "grammar.context",
    proposed_label: "New leaf",
    proposed_rationale: "Worth tracking.",
    attempted_credit: 1,
    correctness_credit: 0,
    evidence: "esco",
  };
  const result = normalizeModelResult(legacy({
    markpoints: [legacy().markpoints[0], proposed],
  }), context());
  assert.equal(result.markpoints[1].bucket, "grammar.context.new_leaf");
  assert.throws(() => normalizeModelResult(legacy({
    markpoints: [legacy().markpoints[0], { ...proposed, bucket: "another.branch" }],
  }), context()), /safe child path/);
});

const retainedR181Artifact = new URL("../../outputs/marker_paid_ab_2026-08-22_r181_v4_smoke.json", import.meta.url);

test("legacy-min v5 hydrates both retained r181 legacy outputs to their canonical Worker results", {
  skip: !fs.existsSync(retainedR181Artifact),
}, () => {
  const artifact = JSON.parse(fs.readFileSync(retainedR181Artifact, "utf8")) as { calls: any[] };
  const legacyCalls = artifact.calls.filter((call) => call.response_contract_requested === "legacy_v1");
  assert.equal(legacyCalls.length, 2);

  for (const call of legacyCalls) {
    const payload = structuredClone(JSON.parse(call.raw_model_output)) as Record<string, any>;
    payload.v = 5;
    delete payload.raw_response;
    delete payload.overall.marks_possible;
    for (const markpoint of payload.markpoints) {
      delete markpoint.label;
      delete markpoint.outcome;
      delete markpoint.bucket_proposed;
    }

    const request = call.request_body;
    const ctx = buildMarkerPromptContext({
      item: request.item,
      cleanedRaw: request.raw,
      bucketContext: request.bucket_context,
    });
    assert.deepEqual(normalizeModelResult(payload, ctx), call.marker_result_canonical, call.case_id);
  }
});

test("a declared but invalid v2 payload never falls through to legacy", () => {
  const hybrid = legacy({ v: 2, o: "wrong", m: [] });
  assert.throws(() => normalizeModelResult(hybrid, context()), (error: unknown) => {
    return error instanceof MarkerContractError
      && error.code === "unknown_field"
      && /unexpected field overall/.test(error.message);
  });
});

test("declared invalid v3/v4/v5 and unknown versioned payloads never fall through to legacy", () => {
  assert.throws(() => normalizeModelResult(legacy({ v: 3, o: "wrong", m: [] }), context()), (error: unknown) => {
    return error instanceof MarkerContractError
      && error.code === "unknown_field"
      && /unexpected field overall/.test(error.message);
  });
  assert.throws(() => normalizeModelResult(legacy({ v: 4, o: "wrong", m: [] }), context()), (error: unknown) => {
    return error instanceof MarkerContractError
      && error.code === "unknown_field"
      && /unexpected field overall/.test(error.message);
  });
  assert.throws(() => normalizeModelResult(legacy({ v: 5 }), context()), (error: unknown) => {
    return error instanceof MarkerContractError
      && error.code === "unknown_field"
      && /unexpected field raw_response/.test(error.message);
  });
  assert.throws(() => normalizeModelResult({ v: 6 }, context()), (error: unknown) => {
    return error instanceof MarkerContractError
      && error.code === "compact_schema_invalid"
      && /2, 3, 4, or 5/.test(error.message);
  });
});

test("strict public validator rejects inconsistent outcomes and non-authoritative raw", () => {
  const result = normalizeModelResult(compact(), context());
  const inconsistent = structuredClone(result);
  inconsistent.markpoints[0].outcome = "miss";
  assert.equal(validateMarkerResult(inconsistent, context()).ok, false);
  const spoofed = structuredClone(result);
  spoofed.raw_response = "different";
  assert.match(validateMarkerResult(spoofed, context()).error || "", /authoritative/);
  const inconsistentBlank = structuredClone(result);
  inconsistentBlank.markpoints[0].attempted_credit = 0;
  inconsistentBlank.markpoints[0].correctness_credit = 0;
  inconsistentBlank.markpoints[0].outcome = "not_attempted";
  delete inconsistentBlank.markpoints[0].evidence;
  assert.match(validateMarkerResult(inconsistentBlank, context()).error || "", /must be null/);
  const evidenceEscape = normalizeModelResult(compactV4(), context());
  delete evidenceEscape.markpoints[0].evidence;
  evidenceEscape.markpoints[0].expected = "canonical form";
  assert.match(validateMarkerResult(evidenceEscape, context()).error || "", /only an omitted-form miss/);
});
