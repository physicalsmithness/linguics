import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  MarkerContractError,
  buildMarkerPromptContext,
  compactPromptSchemaText,
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
});

test("compact system prompt uses aliases consistently while legacy keeps its schema", () => {
  const source = fs.readFileSync(new URL("../src/index.ts", import.meta.url), "utf8");
  const start = source.indexOf("  const policy = legacyPrompt.slice");
  const end = source.indexOf("  return policy + compactPromptSchemaText", start);
  assert(start >= 0 && end > start);
  const compactBuilder = source.slice(start, end);
  assert.match(compactBuilder, /serialize it with that numeric alias/);
  assert.match(compactBuilder, /Only for a genuinely unlisted content word, serialize it as v:<Italian dictionary lemma>/);
  assert.match(compactBuilder, /optional fourth value is a suggested full bucket id/);
  assert.doesNotMatch(compactBuilder, /Fire `vocabulary\.it\.<lemma>\.translation`/);
  assert.doesNotMatch(compactBuilder, /use the id exactly as/);
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
  }), context("en_it")), /must cite a learner evidence span/);
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
  assert.throws(() => normalizeModelResult(compact({ m: [[0, 1, 0, null]] }), context()), /needs evidence or an expected/);
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
  }), context()), /needs evidence or an expected/);
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

test("a declared but invalid v2 payload never falls through to legacy", () => {
  const hybrid = legacy({ v: 2, o: "wrong", m: [] });
  assert.throws(() => normalizeModelResult(hybrid, context()), (error: unknown) => {
    return error instanceof MarkerContractError
      && error.code === "unknown_field"
      && /unexpected field overall/.test(error.message);
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
});
