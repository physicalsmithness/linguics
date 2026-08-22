#!/usr/bin/env node
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const suiteApi = require(path.join(ROOT, "housing", "js", "marker_suite.js"));
const realSuite = JSON.parse(fs.readFileSync(
  path.join(ROOT, "data", "marker_expectation_cases.json"), "utf8"));

let failures = 0;
let passes = 0;

function test(name, fn) {
  try {
    fn();
    passes++;
    console.log("  PASS  " + name);
  } catch (error) {
    failures++;
    console.error("  FAIL  " + name);
    console.error("        " + (error && error.stack ? error.stack : error));
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function marker(markpoints, overall, notes) {
  return {
    overall: Object.assign({
      marks_awarded: 1,
      marks_possible: 1,
      attempted_overall: 1,
      correctness_overall: 1,
      summary: "",
      explanation: "",
    }, overall || {}),
    markpoints: (markpoints || []).map(row => Object.assign({
      attempted_credit: 1,
      correctness_credit: row.outcome === "hit" ? 1 : 0,
      evidence: "x",
      expected: "",
    }, row)),
    notes: notes || [],
  };
}

function caseDef(overrides) {
  return Object.assign({
    case_id: "unit_01",
    item: "item_01",
    answer: "answer",
    expect_verdict: { "grammar.one": "hit" },
    expect_absent: [],
  }, overrides || {});
}

function assertError(result, code) {
  assert.strictEqual(result.ok, false, "validation unexpectedly passed");
  assert(result.errors.some(error => error.code === code),
    "expected error " + code + ", got " + JSON.stringify(result.errors));
}

console.log("marker suite data");

test("the checked-in suite is valid executable v2 data", () => {
  const checked = suiteApi.validateSuite(realSuite);
  assert.strictEqual(checked.ok, true, JSON.stringify(checked.errors, null, 2));
  assert.strictEqual(realSuite.version, 2);
  assert.strictEqual(realSuite.cases.length, 18);
  assert.strictEqual(checked.stats.manual_reviews, 11);
  assert(checked.stats.assertions > 18);
});

test("all cases have stable unique ids and no legacy expect_rules", () => {
  const ids = realSuite.cases.map(row => row.case_id);
  assert.strictEqual(new Set(ids).size, 18);
  for (const row of realSuite.cases) {
    assert(/^[a-z0-9][a-z0-9_-]*$/.test(row.case_id));
    assert.strictEqual(Object.prototype.hasOwnProperty.call(row, "expect_rules"), false);
  }
});

test("the suite exercises every executable predicate type", () => {
  const types = new Set(realSuite.cases.flatMap(row =>
    (row.expect_checks || []).map(check => check.type)));
  assert.deepStrictEqual(Array.from(types).sort(), suiteApi.CHECK_TYPES.slice().sort());
});

test("all unresolved semantic rules remain explicit manual reviews", () => {
  const manual = realSuite.cases.flatMap(row => row.manual_review || []);
  assert.deepStrictEqual(manual.map(row => row.text).sort(), [
    "decide whether could earns full or partial credit for the sustained imperfect modal",
    "decide whether giustamente for bene belongs under adverb usage, the produced lemma, or the expected lemma",
    "decide whether in a row fully conveys di fila",
    "decide whether lavorare su un progetto is acceptable here instead of lavorare a un progetto",
    "decide whether projetto is partial vocabulary credit or a vocabulary hit plus an orthography event",
    "decide whether the mistaken gender belief should fire a gender markpoint or remain silent",
    "decide whether the same potevo evidence may support both the grammar and vocabulary buckets",
    "if gender fires, decide whether tutto and il are one underlying error or two markpoints",
    "no gender markpoint on an entry the learner did not write",
    "no miss caused by passato instead of scorso",
    "no miss on any expected_buckets entry the answer does not engage",
  ].sort());
});

test("every case with needs_ruling is excluded from the automatic pass denominator", () => {
  for (const row of realSuite.cases.filter(row => Array.isArray(row.needs_ruling) && row.needs_ruling.length)) {
    assert(Array.isArray(row.manual_review) && row.manual_review.length,
      row.case_id + " has needs_ruling but no manual_review");
  }
});

test("unsettled progetto attribution is manual and the Anna reason key is aligned", () => {
  const spelling = realSuite.cases.find(row => row.case_id === "spelling_partial_01");
  assert.strictEqual(spelling.expect_verdict["vocabulary.it.progetto.noun.translation.active"], undefined);
  assert(spelling.manual_review.some(row => row.id === "projetto_spelling_attribution"));
  const anna = realSuite.cases.find(row => row.case_id === "rescued_bene_attribution_01");
  assert(anna.expect_absent.includes("vocabulary.it.anna.verb.translation.active"));
  assert.strictEqual(typeof anna.absent_reasons["vocabulary.it.anna.verb.translation.active"], "string");
  assert.strictEqual(anna.absent_reasons["vocabulary.it.anna.translation.active"], undefined);
});

test("learner answers contain real Unicode characters, not escaped text", () => {
  for (const row of realSuite.cases) {
    assert.strictEqual(row.answer.includes("\\u"), false, row.case_id + " contains a literal Unicode escape");
  }
});

console.log("scope matching");

test("exact scopes are exact", () => {
  assert.strictEqual(suiteApi.matchScope("grammar.one", "grammar.one"), true);
  assert.strictEqual(suiteApi.matchScope("grammar.one.more", "grammar.one"), false);
});

test("prefix scopes match only descendants on a dot boundary", () => {
  assert.strictEqual(suiteApi.matchScope("adjective_agreement.o_class", "adjective_agreement.*"), true);
  assert.strictEqual(suiteApi.matchScope("adjective_agreementish.o_class", "adjective_agreement.*"), false);
  assert.strictEqual(suiteApi.matchScope("adjective_agreement", "adjective_agreement.*"), false);
});

test("the all scope matches every bucket", () => {
  assert.strictEqual(suiteApi.matchScope("anything", "*"), true);
});

test("internal and malformed wildcards are rejected", () => {
  assert.strictEqual(suiteApi.validScope("vocabulary.*.translation"), false);
  assert.strictEqual(suiteApi.validScope("vocabulary*"), false);
  assert.strictEqual(suiteApi.validScope(".*"), false);
});

console.log("validation and preflight");

test("suite version 1 is rejected", () => {
  const stale = clone(realSuite);
  stale.version = 1;
  assertError(suiteApi.validateSuite(stale), "unsupported_version");
});

test("duplicate case ids are rejected", () => {
  const duplicate = clone(realSuite);
  duplicate.cases[1].case_id = duplicate.cases[0].case_id;
  assertError(suiteApi.validateSuite(duplicate), "duplicate_case_id");
});

test("missing or unstable case ids are rejected", () => {
  assertError(suiteApi.validateCase(caseDef({ case_id: "" })), "invalid_case_id");
  assertError(suiteApi.validateCase(caseDef({ case_id: "Not stable" })), "invalid_case_id");
});

test("legacy free-text expect_rules are always rejected", () => {
  assertError(suiteApi.validateCase(caseDef({ expect_rules: ["no misses"] })), "legacy_expect_rules");
});

test("zero-assertion cases are rejected instead of auto-passing", () => {
  assertError(suiteApi.validateCase(caseDef({
    expect_verdict: {}, expect_absent: [], expect_checks: [], manual_review: [],
  })), "zero_assertions");
});

test("a manual-only case is a valid explicit instrument", () => {
  const checked = suiteApi.validateCase(caseDef({
    expect_verdict: {}, expect_absent: [],
    manual_review: [{ id: "human_01", text: "requires human judgement" }],
  }));
  assert.strictEqual(checked.ok, true, JSON.stringify(checked.errors));
  assert.strictEqual(checked.assertion_count, 0);
  assert.strictEqual(checked.manual_count, 1);
});

test("unknown predicates and predicate fields are rejected", () => {
  assertError(suiteApi.validateCase(caseDef({
    expect_checks: [{ type: "wishful_thinking", scope: "*" }],
  })), "unknown_check_type");
  assertError(suiteApi.validateCase(caseDef({
    expect_checks: [{ type: "no_miss", scope: "*", prose: "ignored" }],
  })), "unknown_check_field");
});

test("invalid scopes, outcomes, note kinds, counts, fields and operators are rejected", () => {
  const badChecks = [
    [{ type: "no_miss", scope: "grammar.*.bad" }, "invalid_scope"],
    [{ type: "count_at_most", outcome: "green", n: 0 }, "invalid_outcome"],
    [{ type: "count_at_most", outcome: "hit", n: -1 }, "invalid_count"],
    [{ type: "no_note_of_kind", kind: "accentish" }, "invalid_note_kind"],
    [{ type: "overall", field: "status", op: "eq", value: "not_attempted" }, "invalid_overall_field"],
    [{ type: "overall", field: "marks_awarded", op: "approximately", value: 1 }, "invalid_operator"],
  ];
  for (const [check, code] of badChecks) {
    assertError(suiteApi.validateCase(caseDef({ expect_checks: [check] })), code);
  }
});

test("evidence checks require exact accepted learner strings on an expected bucket", () => {
  const valid = caseDef({
    answer: "Ieri ho incontrato Marco",
    expect_checks: [{
      type: "evidence_one_of", bucket: "grammar.one", values: ["incontrato", "ho incontrato"],
    }],
  });
  assert.strictEqual(suiteApi.validateCase(valid).ok, true);
  assertError(suiteApi.validateCase(caseDef({
    answer: "Ieri ho incontrato Marco",
    expect_checks: [{ type: "evidence_one_of", bucket: "grammar.*", values: ["incontrato"] }],
  })), "invalid_bucket_id");
  assertError(suiteApi.validateCase(caseDef({
    answer: "Ieri ho incontrato Marco",
    expect_checks: [{ type: "evidence_one_of", bucket: "grammar.one", values: [] }],
  })), "invalid_evidence_values");
  assertError(suiteApi.validateCase(caseDef({
    answer: "Ieri ho incontrato Marco",
    expect_checks: [{ type: "evidence_one_of", bucket: "grammar.one", values: ["   "] }],
  })), "invalid_evidence_value");
  assertError(suiteApi.validateCase(caseDef({
    answer: "Ieri ho incontrato Marco",
    expect_checks: [{ type: "evidence_one_of", bucket: "grammar.one", values: [" incontrato"] }],
  })), "invalid_evidence_value");
  assertError(suiteApi.validateCase(caseDef({
    answer: "Ieri ho incontrato Marco",
    expect_checks: [{ type: "evidence_one_of", bucket: "grammar.one", values: ["incontrato", "incontrato"] }],
  })), "duplicate_evidence_value");
  assertError(suiteApi.validateCase(caseDef({
    answer: "Ieri ho incontrato Marco",
    expect_checks: [{ type: "evidence_one_of", bucket: "grammar.two", values: ["incontrato"] }],
  })), "orphan_evidence_check");
  assertError(suiteApi.validateCase(caseDef({
    answer: "Ieri ho incontrato Marco",
    expect_checks: [{ type: "evidence_one_of", bucket: "grammar.one", values: ["Incontrato"] }],
  })), "evidence_value_not_in_answer");
});

test("absence reason keys must agree exactly with absence assertions", () => {
  assertError(suiteApi.validateCase(caseDef({
    expect_absent: ["phantom.one"],
    absent_reasons: { "phantom.two": "wrong key" },
  })), "orphan_absent_reason");
  assertError(suiteApi.validateCase(caseDef({
    expect_absent: ["phantom.one"], absent_reasons: {},
  })), "missing_absent_reason");
});

test("phantom negative targets do not need to exist", () => {
  const checked = suiteApi.validateCase(caseDef({
    expect_absent: ["vocabulary.it.phantom.*"],
    absent_reasons: { "vocabulary.it.phantom.*": "it must never be emitted" },
  }));
  assert.strictEqual(checked.ok, true, JSON.stringify(checked.errors));
});

test("positive and negative expectations may not contradict one another", () => {
  assertError(suiteApi.validateCase(caseDef({
    expect_absent: ["grammar.*"],
  })), "contradictory_expectation");
});

test("item, direction and source mismatches are caught when a corpus resolver is supplied", () => {
  const itemsById = {
    item_01: { source_lang: "it", target_lang: "en", source_text: "Italian source" },
  };
  const checked = suiteApi.validateCase(caseDef({
    direction: "en_it", source_text: "Different source",
  }), { itemsById });
  assertError(checked, "direction_mismatch");
  assert(checked.errors.some(error => error.code === "source_text_mismatch"));
  assertError(suiteApi.validateCase(caseDef({ item: "missing" }), { itemsById }), "item_not_found");
});

test("fireability is checked only through an explicit positive-bucket hook", () => {
  const checked = suiteApi.validateCase(caseDef({
    expect_absent: ["phantom.bucket"],
  }), {
    isFireableBucket: bucket => bucket === "grammar.one" ? { ok: false, reason: "not in context" } : false,
  });
  assertError(checked, "bucket_not_fireable");
  assert.strictEqual(checked.errors.filter(error =>
    error.path.indexOf("expect_absent") >= 0 && error.code === "bucket_not_fireable").length, 0);
});

test("canonical positive ids are enforced when a hook is supplied", () => {
  const hook = id => id === "vocabulary.it.progetto.translation.active"
    ? "vocabulary.it.progetto.noun.translation.active" : id;
  const legacy = caseDef({
    expect_verdict: { "vocabulary.it.progetto.translation.active": "partial" },
  });
  assertError(suiteApi.validateCase(legacy, { canonicalizeBucketId: hook }), "noncanonical_bucket_id");
  assert.strictEqual(suiteApi.validateCase(legacy, {
    canonicalizeBucketId: hook, requireCanonical: false,
  }).ok, true);
  const canonical = suiteApi.canonicalizeExpectedVerdicts(legacy, hook);
  assert.strictEqual(canonical.expect_verdict["vocabulary.it.progetto.noun.translation.active"], "partial");
  assert.strictEqual(legacy.expect_verdict["vocabulary.it.progetto.translation.active"], "partial");
});

test("exact negative ids are canonicalized before matching", () => {
  const hook = id => id === "vocabulary.it.giustamente.translation"
    ? "vocabulary.it.giustamente.adverb.translation.active" : id;
  const judged = suiteApi.judgeCase(caseDef({
    expect_absent: ["vocabulary.it.giustamente.translation"],
  }), marker([
    { bucket: "grammar.one", outcome: "hit" },
    { bucket: "vocabulary.it.giustamente.adverb.translation.active", outcome: "hit" },
  ]), { canonicalizeBucketId: hook, requireCanonical: false });
  assert.strictEqual(judged.status, "fail");
  assert(judged.invented.some(row => row.includes("giustamente.adverb")));
});

console.log("predicate evaluation");

const predicateResult = marker([
  { bucket: "adjective_agreement.o_class", outcome: "miss" },
  { bucket: "vocabulary.it.vendere.verb.translation.active", outcome: "hit" },
  { bucket: "grammar.partial", outcome: "partial" },
], { marks_awarded: 0.9, attempted_overall: 0.75 }, [
  { kind: "accent", text: "accent note" },
]);

test("no_miss honours exact and prefix scopes", () => {
  assert.strictEqual(suiteApi.evaluateCheck({
    type: "no_miss", scope: "adjective_agreement.*",
  }, predicateResult).pass, false);
  assert.strictEqual(suiteApi.evaluateCheck({
    type: "no_miss", scope: "vocabulary.it.vendere.*",
  }, predicateResult).pass, true);
});

test("no_bucket detects any outcome on its scope", () => {
  assert.strictEqual(suiteApi.evaluateCheck({
    type: "no_bucket", scope: "grammar.partial",
  }, predicateResult).pass, false);
  assert.strictEqual(suiteApi.evaluateCheck({
    type: "no_bucket", scope: "grammar.absent",
  }, predicateResult).pass, true);
});

test("no_note_of_kind reads the structured note kind", () => {
  assert.strictEqual(suiteApi.evaluateCheck({
    type: "no_note_of_kind", kind: "accent",
  }, predicateResult).pass, false);
  assert.strictEqual(suiteApi.evaluateCheck({
    type: "no_note_of_kind", kind: "false_friend",
  }, predicateResult).pass, true);
});

test("count_at_most is outcome- and scope-aware", () => {
  assert.strictEqual(suiteApi.evaluateCheck({
    type: "count_at_most", outcome: "hit", n: 1,
  }, predicateResult).pass, true);
  assert.strictEqual(suiteApi.evaluateCheck({
    type: "count_at_most", outcome: "hit", n: 0,
  }, predicateResult).pass, false);
  assert.strictEqual(suiteApi.evaluateCheck({
    type: "count_at_most", outcome: "miss", n: 0, scope: "vocabulary.*",
  }, predicateResult).pass, true);
});

test("overall implements eq, ne, gte and lte with numeric tolerance", () => {
  assert.strictEqual(suiteApi.evaluateCheck({
    type: "overall", field: "marks_awarded", op: "eq", value: 0.9000000001,
  }, predicateResult).pass, true);
  assert.strictEqual(suiteApi.evaluateCheck({
    type: "overall", field: "marks_awarded", op: "ne", value: 1,
  }, predicateResult).pass, true);
  assert.strictEqual(suiteApi.evaluateCheck({
    type: "overall", field: "attempted_overall", op: "gte", value: 0.7,
  }, predicateResult).pass, true);
  assert.strictEqual(suiteApi.evaluateCheck({
    type: "overall", field: "attempted_overall", op: "lte", value: 0.5,
  }, predicateResult).pass, false);
});

test("evidence_one_of is exact, case-sensitive, and rejects broad or duplicate evidence", () => {
  const result = marker([{
    bucket: "grammar.one", outcome: "hit", evidence: "incontrato",
  }]);
  assert.strictEqual(suiteApi.evaluateCheck({
    type: "evidence_one_of", bucket: "grammar.one", values: ["incontrato", "ho incontrato"],
  }, result).pass, true);
  assert.strictEqual(suiteApi.evaluateCheck({
    type: "evidence_one_of", bucket: "grammar.one", values: ["Incontrato"],
  }, result).pass, false);
  const broad = marker([{
    bucket: "grammar.one", outcome: "hit", evidence: "Ieri ho incontrato Marco",
  }]);
  assert.strictEqual(suiteApi.evaluateCheck({
    type: "evidence_one_of", bucket: "grammar.one", values: ["incontrato", "ho incontrato"],
  }, broad).pass, false);
  const duplicate = marker([
    { bucket: "grammar.one", outcome: "hit", evidence: "incontrato" },
    { bucket: "grammar.one", outcome: "hit", evidence: "incontrato" },
  ]);
  const evaluated = suiteApi.evaluateCheck({
    type: "evidence_one_of", bucket: "grammar.one", values: ["incontrato"],
  }, duplicate);
  assert.strictEqual(evaluated.pass, false);
  assert.strictEqual(evaluated.match_count, 2);
});

test("an invalid predicate is broken, never a normal failed assertion", () => {
  const evaluated = suiteApi.evaluateCheck({ type: "no_miss", scope: "bad*scope" }, predicateResult);
  assert.strictEqual(evaluated.broken, true);
  assert.strictEqual(evaluated.pass, false);
});

console.log("case and suite judgement");

test("a fully satisfied executable case passes", () => {
  const judged = suiteApi.judgeCase(caseDef({
    expect_checks: [{ type: "no_miss", scope: "*" }],
  }), marker([{ bucket: "grammar.one", outcome: "hit" }]));
  assert.strictEqual(judged.status, "pass");
  assert.strictEqual(judged.pass, true);
  assert.strictEqual(judged.automatic_pass, true);
});

test("missing, wrong, invented, duplicate and rule failures are fails", () => {
  assert.strictEqual(suiteApi.judgeCase(caseDef(), marker([])).status, "fail");
  assert.strictEqual(suiteApi.judgeCase(caseDef(), marker([
    { bucket: "grammar.one", outcome: "miss" },
  ])).status, "fail");
  assert.strictEqual(suiteApi.judgeCase(caseDef({ expect_absent: ["phantom.*"] }), marker([
    { bucket: "grammar.one", outcome: "hit" },
    { bucket: "phantom.child", outcome: "hit" },
  ])).status, "fail");
  assert.strictEqual(suiteApi.judgeCase(caseDef(), marker([
    { bucket: "grammar.one", outcome: "hit" },
    { bucket: "grammar.one", outcome: "hit" },
  ])).status, "fail");
  assert.strictEqual(suiteApi.judgeCase(caseDef({
    expect_checks: [{ type: "no_note_of_kind", kind: "accent" }],
  }), marker([{ bucket: "grammar.one", outcome: "hit" }], {}, [
    { kind: "accent", text: "invented" },
  ])).status, "fail");
});

test("manual review is neither pass nor fail after automatic checks pass", () => {
  const manualCase = caseDef({
    manual_review: [{ id: "human_01", text: "read this output" }],
  });
  const manual = suiteApi.judgeCase(manualCase,
    marker([{ bucket: "grammar.one", outcome: "hit" }]));
  assert.strictEqual(manual.status, "manual");
  assert.strictEqual(manual.pass, false);
  assert.strictEqual(manual.scored, false);
  assert.strictEqual(manual.automatic_pass, true);
  const definiteFail = suiteApi.judgeCase(manualCase,
    marker([{ bucket: "grammar.one", outcome: "miss" }]));
  assert.strictEqual(definiteFail.status, "fail");
  assert.strictEqual(definiteFail.scored, true);
});

test("invalid case data is broken before a model result is considered", () => {
  const judged = suiteApi.judgeCase(caseDef({ expect_rules: ["ignored"] }),
    marker([{ bucket: "grammar.one", outcome: "hit" }]));
  assert.strictEqual(judged.status, "broken");
  assert(judged.definition_errors.some(error => error.code === "legacy_expect_rules"));
});

test("failed and unusable model responses are call_error, not marking fails", () => {
  const explicit = suiteApi.judgeCase(caseDef(), {
    status: "call_error",
    error: { code: "output_truncated", usage: { input_tokens: 100, output_tokens: 6000 }, cost_usd: 0.02 },
  });
  assert.strictEqual(explicit.status, "call_error");
  assert.strictEqual(explicit.call_error.code, "output_truncated");
  assert.strictEqual(explicit.call_error.cost_usd, 0.02);
  assert.strictEqual(suiteApi.judgeCase(caseDef(), undefined).status, "call_error");
  assert.strictEqual(suiteApi.judgeCase(caseDef(), { overall: {}, notes: [] }).status, "call_error");
  assert.strictEqual(suiteApi.judgeCase(caseDef(), {
    markpoints: [{ bucket: "grammar.one", outcome: "hit" }], notes: [],
  }).status, "call_error");
});

test("a canonicalization hook lets raw provider ids match canonical expectations", () => {
  const canonical = "vocabulary.it.progetto.noun.translation.active";
  const hook = id => id === "vocabulary.it.progetto.translation" ? canonical : id;
  const judged = suiteApi.judgeCase(caseDef({
    expect_verdict: { [canonical]: "partial" },
  }), marker([{ bucket: "vocabulary.it.progetto.translation", outcome: "partial" }]), {
    canonicalizeBucketId: hook,
  });
  assert.strictEqual(judged.status, "pass");
});

test("judgeCase preserves case and item context while canonicalizing evidence checks", () => {
  const legacy = "vocabulary.it.progetto.translation";
  const canonical = "vocabulary.it.progetto.noun.translation.active";
  const item = { external_id: "item_01" };
  const hook = (id, context) => {
    if (id !== legacy) return id;
    assert.strictEqual(context.case.case_id, "unit_01");
    assert.strictEqual(context.item, item);
    return canonical;
  };
  const judged = suiteApi.judgeCase(caseDef({
    answer: "progetto",
    expect_verdict: { [legacy]: "hit" },
    expect_checks: [{ type: "evidence_one_of", bucket: legacy, values: ["progetto"] }],
  }), marker([{
    bucket: legacy, outcome: "hit", evidence: "progetto",
  }]), {
    canonicalizeBucketId: hook,
    requireCanonical: false,
    itemsById: { item_01: item },
  });
  assert.strictEqual(judged.status, "pass");
});

test("canonicalizeMarkerResult is non-mutating", () => {
  const raw = marker([{ bucket: "raw.bucket", outcome: "hit" }]);
  const canonical = suiteApi.canonicalizeMarkerResult(raw,
    id => id === "raw.bucket" ? "canonical.bucket" : id);
  assert.strictEqual(raw.markpoints[0].bucket, "raw.bucket");
  assert.strictEqual(canonical.markpoints[0].bucket, "canonical.bucket");
});

test("the wrong-language case rejects hits, misses and partials and accepts no attempt", () => {
  const direction = realSuite.cases.find(row => row.case_id === "direction_01");
  const clean = suiteApi.judgeCase(direction, marker([], {
    marks_awarded: 0, attempted_overall: 0, correctness_overall: 0,
  }));
  assert.strictEqual(clean.status, "pass", JSON.stringify(clean));
  for (const outcome of ["hit", "miss", "partial"]) {
    const bad = suiteApi.judgeCase(direction, marker([
      { bucket: "grammar.one", outcome },
    ], { marks_awarded: 0, attempted_overall: outcome === "hit" ? 1 : 0 }));
    assert.strictEqual(bad.status, "fail", outcome);
  }
});

test("judgeSuite keeps pass, manual and call_error in separate counts", () => {
  const suite = {
    version: 2,
    cases: [
      caseDef({ case_id: "pass_01" }),
      caseDef({ case_id: "manual_01", manual_review: [{ id: "human_01", text: "review" }] }),
      caseDef({ case_id: "error_01" }),
    ],
  };
  const rows = {
    pass_01: marker([{ bucket: "grammar.one", outcome: "hit" }]),
    manual_01: marker([{ bucket: "grammar.one", outcome: "hit" }]),
    error_01: { status: "call_error", error: { code: "output_truncated" } },
  };
  const judged = suiteApi.judgeSuite(suite, rows);
  assert.strictEqual(judged.status, "complete");
  assert.strictEqual(judged.counts.pass, 1);
  assert.strictEqual(judged.counts.manual, 1);
  assert.strictEqual(judged.counts.call_error, 1);
  assert.strictEqual(judged.counts.fail, 0);
});

console.log();
if (failures) {
  console.error("marker suite tests failed: " + failures + " failed, " + passes + " passed");
  process.exit(1);
}
console.log("marker suite tests passed: " + passes + " passed");
