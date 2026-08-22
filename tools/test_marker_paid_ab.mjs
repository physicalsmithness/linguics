#!/usr/bin/env node
"use strict";

import assert from "node:assert/strict";
import {
  ARMS,
  DEFAULTS,
  parseArgs,
  loadFoundation,
  buildRunPlan,
  buildRequestBody,
  summarizeCalls,
  validateWorkerHealth,
} from "./run_marker_paid_ab.mjs";

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log("  PASS  " + name);
  } catch (error) {
    failed++;
    console.error("  FAIL  " + name);
    console.error("        " + (error && error.stack || error));
  }
}

console.log("paid A/B runner (no network)");

test("paid CLI defaults are fixed and URL/output are mandatory", () => {
  const options = parseArgs(["--url", "https://example.test/mark", "--out", "result.json"]);
  assert.equal(options.model, "openai/gpt-4o-mini");
  assert.equal(options.expectedWorkerBuild, "2026-08-22-r178-compact-v3-exp");
  assert.equal(options.temperature, 0);
  assert.equal(options.seed, 20260821);
  assert.equal(options.maxCostUsd, 0.01);
  assert.equal(options.repetitions, 1);
  assert.equal(options.concurrency, 3);
  assert.deepEqual(options.caseIds, []);
  assert.throws(() => parseArgs(["--out", "result.json"]), /--url is required/);
  assert.throws(() => parseArgs(["--url", "https:\/\/example.test\/mark"]), /--out is required/);
});

test("worker capability gate requires the exact build and both contracts", () => {
  const healthy = {
    ok: true,
    service: "linguics-marker",
    build: DEFAULTS.expectedWorkerBuild,
    supported_response_contracts: ARMS.slice(),
  };
  assert.equal(validateWorkerHealth(healthy).ok, true);
  assert.equal(validateWorkerHealth({ ...healthy, build: "stale" }).ok, false);
  assert.equal(validateWorkerHealth({ ...healthy, supported_response_contracts: ["legacy_v1"] }).ok, false);
  assert.equal(validateWorkerHealth(null).ok, false);
});

test("validation and dry-run modes do not require paid coordinates", () => {
  assert.equal(parseArgs(["--validate"]).validateOnly, true);
  assert.equal(parseArgs(["--dry-run"]).dryRun, true);
  assert.throws(() => parseArgs(["--validate", "--dry-run"]), /choose either/);
});

let fetchCalls = 0;
const originalFetch = globalThis.fetch;
globalThis.fetch = async () => {
  fetchCalls++;
  throw new Error("test forbids network");
};
let foundation;
try {
  foundation = loadFoundation();
} finally {
  globalThis.fetch = originalFetch;
}

test("loading the real suite/items/contexts makes no network calls", () => {
  assert.equal(fetchCalls, 0);
  assert.equal(foundation.preflight.ok, true, JSON.stringify(foundation.preflight.errors));
  assert.equal(foundation.suite.version, 2);
  assert.equal(foundation.suite.cases.length, 18);
  assert.equal(foundation.caseInputs.size, 18);
  assert.equal(foundation.preflight.stats.manual_reviews, 11);
  assert(foundation.preflight.stats.assertions > 18);
});

test("every prepared case uses a nonempty checked-in lean context", () => {
  for (const input of foundation.caseInputs.values()) {
    assert(input.item.external_id || input.item.id);
    assert(Object.keys(input.bucket_context).length > 0, input.case_id);
    assert.match(input.context_sha256, /^[a-f0-9]{64}$/);
    assert.match(input.item_sha256, /^[a-f0-9]{64}$/);
  }
});

const options = parseArgs(["--url", "https://example.test/mark", "--out", "result.json"]);
const plan = buildRunPlan(foundation, options);

test("the default deterministic plan is 18 adjacent A/B pairs", () => {
  assert.equal(plan.length, 36);
  for (let i = 0; i < plan.length; i += 2) {
    assert.equal(plan[i].case_id, plan[i + 1].case_id);
    assert.deepEqual(new Set([plan[i].arm, plan[i + 1].arm]), new Set(ARMS));
  }
  assert.equal(plan.filter((task, index) => index % 2 === 0 && task.arm === "compact_v3").length, 9);
  assert.equal(plan.filter((task, index) => index % 2 === 0 && task.arm === "legacy_v1").length, 9);
});

test("paired request bodies differ only in response_contract", () => {
  const compactTask = plan.slice(0, 2).find(task => task.arm === "compact_v3");
  const legacyTask = plan.slice(0, 2).find(task => task.arm === "legacy_v1");
  const compact = buildRequestBody(compactTask, foundation, options);
  const legacy = buildRequestBody(legacyTask, foundation, options);
  assert.equal(compact.response_contract, "compact_v3");
  assert.equal(legacy.response_contract, "legacy_v1");
  delete compact.response_contract;
  delete legacy.response_contract;
  assert.deepEqual(compact, legacy);
  assert.equal(compact.model, DEFAULTS.model);
  assert.equal(compact.temperature, 0);
  assert.equal(compact.seed, DEFAULTS.seed);
  assert.equal(compact.max_cost_usd, 0.01);
  assert.equal(compact.include_diagnostics, true);
  assert.equal(compact.intent, "literal");
});

test("repetitions scale both arms without changing the fixed seed", () => {
  const repeatedOptions = Object.assign({}, options, { repetitions: 2 });
  const repeated = buildRunPlan(foundation, repeatedOptions);
  assert.equal(repeated.length, 72);
  for (const task of repeated) {
    assert.equal(buildRequestBody(task, foundation, repeatedOptions).seed, DEFAULTS.seed);
  }
});

test("case filtering keeps requested order, adjacent pairs, and rejects unknown IDs", () => {
  const filteredOptions = parseArgs([
    "--url", "https://example.test/mark",
    "--out", "result.json",
    "--cases", "direction_01,breadth_01",
  ]);
  const filtered = buildRunPlan(foundation, filteredOptions);
  assert.equal(filtered.length, 4);
  assert.deepEqual(filtered.map(task => task.case_id), [
    "direction_01", "direction_01", "breadth_01", "breadth_01",
  ]);
  for (let index = 0; index < filtered.length; index += 2) {
    assert.deepEqual(new Set([filtered[index].arm, filtered[index + 1].arm]), new Set(ARMS));
  }
  assert.throws(() => buildRunPlan(foundation, {
    ...filteredOptions,
    caseIds: ["not_a_real_case"],
  }), /unknown --cases ID/);
  assert.throws(() => parseArgs(["--dry-run", "--cases", "breadth_01,breadth_01"]), /duplicate/);
});

test("arm summaries keep scores, paid errors, tokens, cost and latency separate", () => {
  const calls = [
    { arm: "compact_v3", judgement: { status: "pass", scored: true }, usage: { input_tokens: 10, output_tokens: 20 }, cost_usd: 0.001, cost_known: true, latency_ms: 100, paid_error: false, potential_paid_error: false, marker_format_used: "compact_v3" },
    { arm: "compact_v3", judgement: { status: "call_error", scored: false }, usage: { input_tokens: 10, output_tokens: 30 }, cost_usd: 0.002, cost_known: true, latency_ms: 300, paid_error: true, potential_paid_error: false, marker_format_used: "compact_v3" },
    { arm: "legacy_v1", judgement: { status: "manual", scored: false }, usage: { input_tokens: 10, output_tokens: 50 }, cost_usd: 0.004, cost_known: true, latency_ms: 500, paid_error: false, potential_paid_error: false, marker_format_used: "legacy_v1" },
    { arm: "legacy_v1", judgement: { status: "fail", scored: true }, usage: null, cost_usd: null, cost_known: false, latency_ms: 700, paid_error: false, potential_paid_error: true, marker_format_used: "compact_v3" },
  ];
  const summary = summarizeCalls(calls);
  assert.equal(summary.arms.compact_v3.pass, 1);
  assert.equal(summary.arms.compact_v3.call_error, 1);
  assert.equal(summary.arms.compact_v3.paid_errors, 1);
  assert.equal(summary.arms.compact_v3.output_tokens, 50);
  assert.equal(summary.arms.compact_v3.cost_usd, 0.003);
  assert.equal(summary.arms.compact_v3.latency_ms_mean, 200);
  assert.equal(summary.arms.legacy_v1.manual, 1);
  assert.equal(summary.arms.legacy_v1.fail, 1);
  assert.equal(summary.arms.legacy_v1.unknown_cost_calls, 1);
  assert.equal(summary.arms.legacy_v1.format_mismatches, 1);
  assert.equal(summary.comparison_compact_minus_legacy.output_tokens, 0);
});

console.log();
if (failed) {
  console.error("paid A/B runner tests failed: " + failed + " failed, " + passed + " passed");
  process.exit(1);
}
console.log("paid A/B runner tests passed: " + passed + " passed; fetch calls: " + fetchCalls);
