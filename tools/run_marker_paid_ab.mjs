#!/usr/bin/env node
/**
 * Reproducible paid A/B runner for the Linguics marker response contracts.
 *
 * The only experimental variable is response_contract: compact_v2 versus
 * legacy_v1. Both arms receive the same checked-in case, item, lean bucket
 * context, model, temperature, seed, and per-call cost ceiling.
 *
 * Normal execution performs paid network calls. `--validate` and `--dry-run`
 * never call fetch. There are deliberately no automatic retries: retrying a
 * response that was lost after the provider billed it can spend twice while
 * pretending it was one observation.
 */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { performance } from "node:perf_hooks";

const THIS_FILE = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(THIS_FILE), "..");
const require = createRequire(import.meta.url);
const markerSuite = require(path.join(ROOT, "housing", "js", "marker_suite.js"));

export const ARMS = Object.freeze(["compact_v2", "legacy_v1"]);
export const DEFAULTS = Object.freeze({
  model: "openai/gpt-4o-mini",
  expectedWorkerBuild: "2026-08-21-r175-compact-v2",
  temperature: 0,
  seed: 20260821,
  maxCostUsd: 0.01,
  repetitions: 1,
  concurrency: 3,
  timeoutMs: 180000,
  menuMode: "none",
});

const HELP = `Linguics paid marker contract A/B

Usage:
  node tools/run_marker_paid_ab.mjs --url URL --out FILE [options]
  node tools/run_marker_paid_ab.mjs --validate
  node tools/run_marker_paid_ab.mjs --dry-run [--url URL] [--out FILE]

Paid execution requires:
  --url URL                 Deployed marker /mark URL (http or https)
  --out FILE                JSON artifact path; existing files are refused

Options:
  --model ID                Model (default: ${DEFAULTS.model})
  --expected-worker-build ID Refuse spend unless health reports this build
                            (default: ${DEFAULTS.expectedWorkerBuild})
  --repetitions N, --reps N Runs of each case in each arm (default: ${DEFAULTS.repetitions})
  --concurrency N           Simultaneous calls (default: ${DEFAULTS.concurrency})
  --seed N                  Fixed provider seed (default: ${DEFAULTS.seed})
  --temperature N           Sampling temperature (default: ${DEFAULTS.temperature})
  --max-cost-usd N          Per-call worker ceiling (default: ${DEFAULTS.maxCostUsd})
  --timeout-ms N            Per-call client timeout (default: ${DEFAULTS.timeoutMs})
  --overwrite               Allow replacing an existing output artifact
  --dry-run                 Validate and materialise the plan; make no calls
  --validate                Validate suite/items/contexts only; make no calls or writes
  --help, -h                Show this help

Fixed experiment settings:
  arms                      compact_v2 and legacy_v1
  naming-list mode          none (the live lean/item fire-list context)
  intent                    literal
  diagnostics               true

Default paid size: 18 cases × 2 arms × 1 repetition = 36 calls.
At the default $0.01 per-call ceiling the theoretical aggregate ceiling is
$0.36, although actual recorded cost should be lower. Paid and unknown-cost
errors are retained; calls are never retried automatically.

Examples:
  node tools/run_marker_paid_ab.mjs --validate
  node tools/run_marker_paid_ab.mjs --dry-run --out tmp/marker_ab_plan.json
  node tools/run_marker_paid_ab.mjs --url https://example.workers.dev/mark --out results/marker_ab.json
`;

function fail(message) {
  const error = new Error(message);
  error.name = "CliError";
  throw error;
}

function readValue(argv, index, name) {
  const token = argv[index];
  const equals = token.indexOf("=");
  if (equals >= 0) return { value: token.slice(equals + 1), next: index };
  if (index + 1 >= argv.length || argv[index + 1].startsWith("--")) {
    fail(name + " requires a value");
  }
  return { value: argv[index + 1], next: index + 1 };
}

function finiteNumber(value, name, minimum, maximum) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < minimum || number > maximum) {
    fail(name + " must be a number from " + minimum + " to " + maximum);
  }
  return number;
}

function integer(value, name, minimum, maximum) {
  const number = finiteNumber(value, name, minimum, maximum);
  if (!Number.isSafeInteger(number)) fail(name + " must be an integer");
  return number;
}

export function parseArgs(argv) {
  const options = {
    url: "",
    out: "",
    model: DEFAULTS.model,
    expectedWorkerBuild: DEFAULTS.expectedWorkerBuild,
    temperature: DEFAULTS.temperature,
    seed: DEFAULTS.seed,
    maxCostUsd: DEFAULTS.maxCostUsd,
    repetitions: DEFAULTS.repetitions,
    concurrency: DEFAULTS.concurrency,
    timeoutMs: DEFAULTS.timeoutMs,
    menuMode: DEFAULTS.menuMode,
    overwrite: false,
    dryRun: false,
    validateOnly: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    const name = token.split("=", 1)[0];
    if (name === "--help" || name === "-h") options.help = true;
    else if (name === "--overwrite") options.overwrite = true;
    else if (name === "--dry-run") options.dryRun = true;
    else if (name === "--validate") options.validateOnly = true;
    else if (["--url", "--out", "--model", "--expected-worker-build", "--temperature", "--seed",
      "--max-cost-usd", "--repetitions", "--reps", "--concurrency", "--timeout-ms"].includes(name)) {
      const read = readValue(argv, i, name);
      i = read.next;
      if (name === "--url") options.url = read.value.trim();
      else if (name === "--out") options.out = read.value.trim();
      else if (name === "--model") options.model = read.value.trim();
      else if (name === "--expected-worker-build") options.expectedWorkerBuild = read.value.trim();
      else if (name === "--temperature") options.temperature = finiteNumber(read.value, name, 0, 2);
      else if (name === "--seed") options.seed = integer(read.value, name, 0, Number.MAX_SAFE_INTEGER);
      else if (name === "--max-cost-usd") options.maxCostUsd = finiteNumber(read.value, name, 0.000001, 0.25);
      else if (name === "--repetitions" || name === "--reps") {
        options.repetitions = integer(read.value, name, 1, 100);
      } else if (name === "--concurrency") options.concurrency = integer(read.value, name, 1, 20);
      else if (name === "--timeout-ms") options.timeoutMs = integer(read.value, name, 1000, 900000);
    } else {
      fail("unknown argument: " + token);
    }
  }

  if (!options.help && !options.validateOnly && !options.dryRun) {
    if (!options.url) fail("--url is required for paid execution");
    if (!options.out) fail("--out is required for paid execution");
  }
  if (!options.help && options.url) {
    let parsed;
    try { parsed = new URL(options.url); } catch (_) { fail("--url must be a valid URL"); }
    if (!/^https?:$/.test(parsed.protocol)) fail("--url must use http or https");
    if (parsed.username || parsed.password) fail("--url must not contain embedded credentials");
  }
  if (!options.help && !options.model) fail("--model must not be empty");
  if (!options.help && !options.expectedWorkerBuild) fail("--expected-worker-build must not be empty");
  if (options.validateOnly && options.dryRun) fail("choose either --validate or --dry-run, not both");
  return options;
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function validateWorkerHealth(health, expectedBuild = DEFAULTS.expectedWorkerBuild) {
  const errors = [];
  if (!health || typeof health !== "object" || Array.isArray(health)) {
    return { ok: false, errors: ["health response is not a JSON object"] };
  }
  if (health.ok !== true) errors.push("health did not report ok:true");
  if (health.service !== "linguics-marker") errors.push("unexpected service: " + String(health.service || "missing"));
  if (health.build !== expectedBuild) {
    errors.push("worker build is " + String(health.build || "missing") + ", expected " + expectedBuild);
  }
  const supported = Array.isArray(health.supported_response_contracts)
    ? health.supported_response_contracts : [];
  for (const arm of ARMS) {
    if (!supported.includes(arm)) errors.push("worker does not advertise response contract " + arm);
  }
  return { ok: errors.length === 0, errors };
}

async function fetchWorkerCapability(options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error("health check timed out")), options.timeoutMs);
  let response;
  let rawText = "";
  try {
    response = await fetch(options.url, {
      method: "GET",
      headers: { "Accept": "application/json" },
      signal: controller.signal,
    });
    rawText = await response.text();
  } catch (error) {
    fail("worker capability check failed before spend: " + (error && error.message || String(error)));
  } finally {
    clearTimeout(timer);
  }
  let health;
  try { health = JSON.parse(rawText); } catch (_) {
    fail("worker capability check returned non-JSON before spend (HTTP " + response.status + ")");
  }
  const checked = validateWorkerHealth(health, options.expectedWorkerBuild);
  if (!response.ok || !checked.ok) {
    const why = (!response.ok ? ["HTTP " + response.status] : []).concat(checked.errors);
    fail("worker capability gate refused paid calls: " + why.join("; "));
  }
  return {
    checked_at: new Date().toISOString(),
    http_status: response.status,
    health,
  };
}

function jsonSha(value) {
  return sha256(JSON.stringify(value));
}

function rel(file) {
  return path.relative(ROOT, file).split(path.sep).join("/");
}

function readTrackedJson(file, hashes) {
  const raw = fs.readFileSync(file);
  hashes[rel(file)] = sha256(raw);
  return JSON.parse(raw.toString("utf8").replace(/[\x00\r\n\s]+$/, ""));
}

function trackFile(file, hashes) {
  hashes[rel(file)] = sha256(fs.readFileSync(file));
}

function inMemoryStorage() {
  const values = new Map();
  return {
    getItem(key) { return values.has(String(key)) ? values.get(String(key)) : null; },
    setItem(key, value) { values.set(String(key), String(value)); },
    removeItem(key) { values.delete(String(key)); },
  };
}

/** Load the browser marker helpers without granting that VM any network. */
function loadBrowserMarkerApi(markerFile) {
  const source = fs.readFileSync(markerFile, "utf8");
  const sandbox = {
    window: { LL: {} },
    localStorage: inMemoryStorage(),
    console,
    Map,
    Set,
    TextEncoder,
    URL,
    fetch() { throw new Error("network is disabled in the browser-helper VM"); },
    setTimeout,
    clearTimeout,
  };
  vm.createContext(sandbox);
  new vm.Script(source, { filename: markerFile }).runInContext(sandbox);
  return sandbox.window.LL;
}

function itemId(item) {
  return item && (item.external_id || item.id) || "";
}

function makeIndex(rows, label) {
  const index = new Map();
  for (const row of rows) {
    const id = label === "item" ? itemId(row) : row && row.id;
    if (!id) fail(label + " without an id in checked-in data");
    if (index.has(id)) fail("duplicate " + label + " id: " + id);
    index.set(id, row);
  }
  return index;
}

function prepareMarkerItem(item, context, ll) {
  let markerItem = item;
  if (typeof item.source_text === "string" && item.source_text.indexOf("[") >= 0) {
    markerItem = Object.assign({}, item, {
      source_text: item.source_text.replace(/\s*\[[^\]]*\]\s*/g, " ").replace(/\s+/g, " ").trim(),
    });
  }
  const rawExpected = Array.isArray(markerItem.expected_buckets) ? markerItem.expected_buckets : null;
  if (rawExpected) {
    const sourceIsItalian = (item.source_lang === "it" || item.source_language === "it");
    const keep = rawExpected.filter(bucket =>
      Object.prototype.hasOwnProperty.call(context, bucket) ||
      (!sourceIsItalian && String(bucket).startsWith("vocabulary.")));
    if (keep.length !== rawExpected.length) {
      if (markerItem === item) markerItem = Object.assign({}, item);
      markerItem.expected_buckets = keep;
    }
  }
  return JSON.parse(JSON.stringify(markerItem));
}

function repositoryCommit() {
  const result = spawnSync("git", ["rev-parse", "HEAD"], {
    cwd: ROOT,
    encoding: "utf8",
    windowsHide: true,
  });
  return result.status === 0 ? result.stdout.trim() : "";
}

function makeSuiteOptions(foundation) {
  return {
    mode: DEFAULTS.menuMode,
    getItem(id) { return foundation.itemsById.get(id); },
    canonicalizeBucketId(bucketId, context) {
      const caseDef = context && context.case;
      const item = context && context.item ||
        (caseDef && foundation.itemsById.get(caseDef.item)) ||
        (context && context.case_id && foundation.caseInputs.get(context.case_id)?.item);
      const direction = item ? foundation.ll.inferDirection(item) : "en_it";
      return foundation.ll.resolveVocabVariant(bucketId, direction);
    },
    isFireableBucket(bucketId, context) {
      const item = context && context.item;
      if (!item) return { ok: false, reason: "loaded item unavailable" };
      const direction = foundation.ll.inferDirection(item);
      if (direction === "en_it" && String(bucketId).startsWith("vocabulary.it.")) return true;
      const input = foundation.caseInputs.get(context.case_id);
      const bucketContext = input && input.bucket_context ||
        foundation.ll.buildBucketContext(item, foundation.bucketsByIdObject, { menuMode: DEFAULTS.menuMode });
      return Object.prototype.hasOwnProperty.call(bucketContext, bucketId)
        ? true : { ok: false, reason: "bucket is absent from the actual none context" };
    },
  };
}

/** Load and cross-check the real suite, item corpus, bucket trees, and lean contexts. */
export function loadFoundation(root = ROOT) {
  if (path.resolve(root) !== ROOT) {
    // The exported parameter makes focused tests possible, but this runner is
    // intentionally repository-bound: hashes and helper code must agree.
    fail("loadFoundation currently requires the Linguics repository root");
  }
  const hashes = {};
  const dataDir = path.join(ROOT, "data");
  const suiteFile = path.join(dataDir, "marker_expectation_cases.json");
  const manifestFile = path.join(dataDir, "manifest.json");
  const markerFile = path.join(ROOT, "housing", "js", "translation_marker.js");
  const markerSuiteFile = path.join(ROOT, "housing", "js", "marker_suite.js");
  trackFile(markerFile, hashes);
  trackFile(markerSuiteFile, hashes);
  trackFile(THIS_FILE, hashes);

  const suite = readTrackedJson(suiteFile, hashes);
  const manifest = readTrackedJson(manifestFile, hashes);
  const buckets = [];
  const items = [];
  for (const topic of manifest.topics || []) {
    const bucketFile = path.join(dataDir, "buckets", topic + ".json");
    if (fs.existsSync(bucketFile)) buckets.push(...readTrackedJson(bucketFile, hashes));
    const itemFile = path.join(dataDir, "translation_items_" + topic + ".json");
    if (fs.existsSync(itemFile)) {
      const topicItems = readTrackedJson(itemFile, hashes);
      for (const item of topicItems) items.push(Object.assign(item, { _topic: topic }));
    }
  }

  const vocabFile = path.join(dataDir, "vocabulary_it_frequency.json");
  const menuFile = path.join(dataDir, "translation_marker_bucket_menu.json");
  const surfaceFile = path.join(dataDir, "it_surface_to_lemma.json");
  const vocabEntries = readTrackedJson(vocabFile, hashes);
  const markerMenu = readTrackedJson(menuFile, hashes);
  const surfaceToLemma = fs.existsSync(surfaceFile) ? readTrackedJson(surfaceFile, hashes) : {};

  const bucketsById = makeIndex(buckets, "bucket");
  const itemsById = makeIndex(items, "item");
  const bucketsByIdObject = Object.fromEntries(bucketsById);
  const ll = loadBrowserMarkerApi(markerFile);
  ll.bucketsById = bucketsByIdObject;
  ll.markerMenu = markerMenu;
  ll.vocabEntries = vocabEntries;
  ll.surfaceToLemma = surfaceToLemma;
  ll.indexEntries(vocabEntries);

  const caseInputs = new Map();
  for (const caseDef of suite.cases || []) {
    const item = itemsById.get(caseDef.item);
    if (!item) continue;
    const bucketContext = JSON.parse(JSON.stringify(
      ll.buildBucketContext(item, bucketsByIdObject, { menuMode: DEFAULTS.menuMode })));
    const markerItem = prepareMarkerItem(item, bucketContext, ll);
    caseInputs.set(caseDef.case_id, {
      case_id: caseDef.case_id,
      item_id: caseDef.item,
      answer: caseDef.answer,
      item: JSON.parse(JSON.stringify(item)),
      marker_item: markerItem,
      bucket_context: bucketContext,
      item_sha256: jsonSha(item),
      marker_item_sha256: jsonSha(markerItem),
      context_sha256: jsonSha(bucketContext),
      context_buckets: Object.keys(bucketContext).length,
      context_chars: JSON.stringify(bucketContext).length,
    });
  }

  const foundation = {
    suite,
    manifest,
    buckets,
    items,
    vocabEntries,
    bucketsById,
    bucketsByIdObject,
    itemsById,
    ll,
    caseInputs,
    fileHashes: Object.fromEntries(Object.entries(hashes).sort(([a], [b]) => a.localeCompare(b))),
  };
  foundation.suiteOptions = makeSuiteOptions(foundation);
  foundation.preflight = markerSuite.validateSuite(suite, foundation.suiteOptions);
  foundation.suiteSha256 = hashes["data/marker_expectation_cases.json"];
  foundation.caseItemSnapshotSha256 = jsonSha((suite.cases || []).map(row => itemsById.get(row.item)));
  foundation.contextSnapshotSha256 = jsonSha((suite.cases || []).map(row =>
    caseInputs.get(row.case_id)?.bucket_context || null));
  return foundation;
}

export function buildRunPlan(foundation, options) {
  const tasks = [];
  let index = 0;
  for (let repetition = 1; repetition <= options.repetitions; repetition++) {
    for (let caseIndex = 0; caseIndex < foundation.suite.cases.length; caseIndex++) {
      const caseDef = foundation.suite.cases[caseIndex];
      // Deterministic counterbalancing prevents one contract from always being
      // first while retaining adjacent pairs in the queue.
      const armOrder = ((caseIndex + repetition) % 2 === 0)
        ? ARMS.slice().reverse() : ARMS.slice();
      for (const arm of armOrder) {
        tasks.push({
          planned_index: ++index,
          repetition,
          case_index: caseIndex,
          case_id: caseDef.case_id,
          item: caseDef.item,
          arm,
        });
      }
    }
  }
  return tasks;
}

export function buildRequestBody(task, foundation, options) {
  const input = foundation.caseInputs.get(task.case_id);
  if (!input) fail("no prepared input for case " + task.case_id);
  return {
    item: input.marker_item,
    raw: input.answer,
    intent: "literal",
    bucket_context: input.bucket_context,
    model: options.model,
    temperature: options.temperature,
    seed: options.seed,
    max_cost_usd: options.maxCostUsd,
    response_contract: task.arm,
    include_diagnostics: true,
  };
}

function percentile(values, fraction) {
  if (!values.length) return null;
  const sorted = values.slice().sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * fraction) - 1))];
}

function summarizeArm(calls, arm) {
  const rows = calls.filter(row => row.arm === arm);
  const status = name => rows.filter(row => row.judgement && row.judgement.status === name).length;
  const costs = rows.map(row => row.cost_usd).filter(value => typeof value === "number");
  const inputTokens = rows.map(row => row.usage && row.usage.input_tokens)
    .filter(value => typeof value === "number");
  const outputTokens = rows.map(row => row.usage && row.usage.output_tokens)
    .filter(value => typeof value === "number");
  const latencies = rows.map(row => row.latency_ms).filter(value => typeof value === "number");
  return {
    arm,
    calls: rows.length,
    pass: status("pass"),
    fail: status("fail"),
    manual: status("manual"),
    broken: status("broken"),
    call_error: status("call_error"),
    scored: rows.filter(row => row.judgement && row.judgement.scored).length,
    input_tokens: inputTokens.reduce((sum, value) => sum + value, 0),
    output_tokens: outputTokens.reduce((sum, value) => sum + value, 0),
    unknown_usage_calls: rows.length - outputTokens.length,
    cost_usd: Number(costs.reduce((sum, value) => sum + value, 0).toFixed(8)),
    unknown_cost_calls: rows.filter(row => row.cost_known !== true).length,
    paid_errors: rows.filter(row => row.paid_error === true).length,
    potential_paid_errors: rows.filter(row => row.potential_paid_error === true).length,
    format_mismatches: rows.filter(row => row.marker_format_used !== arm).length,
    latency_ms_total: Math.round(latencies.reduce((sum, value) => sum + value, 0)),
    latency_ms_mean: latencies.length
      ? Math.round(latencies.reduce((sum, value) => sum + value, 0) / latencies.length) : null,
    latency_ms_median: percentile(latencies, 0.5),
    latency_ms_p95: percentile(latencies, 0.95),
  };
}

export function summarizeCalls(calls) {
  const arms = Object.fromEntries(ARMS.map(arm => [arm, summarizeArm(calls, arm)]));
  const compact = arms.compact_v2;
  const legacy = arms.legacy_v1;
  return {
    arms,
    comparison_compact_minus_legacy: {
      pass: compact.pass - legacy.pass,
      fail: compact.fail - legacy.fail,
      output_tokens: compact.output_tokens - legacy.output_tokens,
      cost_usd: Number((compact.cost_usd - legacy.cost_usd).toFixed(8)),
      latency_ms_mean: compact.latency_ms_mean === null || legacy.latency_ms_mean === null
        ? null : compact.latency_ms_mean - legacy.latency_ms_mean,
    },
  };
}

function safeUrlProvenance(value) {
  if (!value) return { marker_url: "", marker_url_sha256: "" };
  const parsed = new URL(value);
  return {
    marker_url: parsed.origin + parsed.pathname,
    marker_url_sha256: sha256(value),
  };
}

function buildArtifact(foundation, options, tasks) {
  const startedAt = new Date().toISOString();
  const url = safeUrlProvenance(options.url);
  return {
    artifact: "linguics_marker_paid_contract_ab",
    artifact_version: 1,
    status: options.dryRun ? "dry_run" : "running",
    started_at: startedAt,
    completed_at: null,
    repository_commit: repositoryCommit(),
    runtime: { node: process.version, platform: process.platform, arch: process.arch },
    provenance: {
      ...url,
      suite_version: foundation.suite.version,
      suite_sha256: foundation.suiteSha256,
      case_item_snapshot_sha256: foundation.caseItemSnapshotSha256,
      context_snapshot_sha256: foundation.contextSnapshotSha256,
      file_sha256: foundation.fileHashes,
    },
    config: {
      model: options.model,
      expected_worker_build: options.expectedWorkerBuild,
      temperature: options.temperature,
      seed: options.seed,
      max_cost_usd_per_call: options.maxCostUsd,
      repetitions: options.repetitions,
      concurrency: options.concurrency,
      timeout_ms: options.timeoutMs,
      response_contracts: ARMS.slice(),
      menu_mode: DEFAULTS.menuMode,
      intent: "literal",
      include_diagnostics: true,
      automatic_retries: 0,
      planned_calls: tasks.length,
      theoretical_cost_ceiling_usd: Number((tasks.length * options.maxCostUsd).toFixed(6)),
    },
    preflight: {
      ok: foundation.preflight.ok,
      errors: foundation.preflight.errors,
      warnings: foundation.preflight.warnings,
      stats: foundation.preflight.stats,
    },
    suite_snapshot: foundation.suite,
    case_inputs: Object.fromEntries(Array.from(foundation.caseInputs.entries())),
    plan: tasks,
    calls: [],
    summary: summarizeCalls([]),
  };
}

function selectedHeaders(headers) {
  const out = {};
  for (const name of ["content-type", "date", "cf-ray", "x-request-id", "server"]) {
    const value = headers.get(name);
    if (value !== null) out[name] = value;
  }
  return out;
}

function errorShape(error) {
  return {
    name: error && error.name || "Error",
    message: error && error.message || String(error),
    code: error && error.code || null,
  };
}

function callErrorJudgement(caseDef, error) {
  return markerSuite.judgeCase(caseDef, { status: "call_error", error });
}

async function runCall(task, foundation, options) {
  const caseDef = foundation.suite.cases[task.case_index];
  const requestBody = buildRequestBody(task, foundation, options);
  const requestText = JSON.stringify(requestBody);
  const startedAt = new Date().toISOString();
  const started = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error("request timed out")), options.timeoutMs);
  let response;
  let rawHttpText = null;
  let payload = null;
  let networkError = null;
  try {
    response = await fetch(options.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestText,
      signal: controller.signal,
    });
    rawHttpText = await response.text();
    try { payload = JSON.parse(rawHttpText); } catch (_) { payload = null; }
  } catch (error) {
    networkError = errorShape(error);
  } finally {
    clearTimeout(timer);
  }
  const latencyMs = Math.round(performance.now() - started);

  let canonicalResult = null;
  let judgement;
  let processingError = null;
  if (response && response.ok && payload && payload.result) {
    try {
      canonicalResult = markerSuite.canonicalizeMarkerResult(
        payload.result,
        foundation.suiteOptions.canonicalizeBucketId,
        { case_id: caseDef.case_id, case: caseDef, item: foundation.itemsById.get(caseDef.item) },
      );
      judgement = markerSuite.judgeCase(
        caseDef,
        { marker_result_canonical: canonicalResult },
        foundation.suiteOptions,
      );
    } catch (error) {
      // The provider may already have billed this response. Keep every byte and
      // its usage metadata even if local canonicalisation/judgement itself fails.
      processingError = errorShape(error);
      judgement = callErrorJudgement(caseDef, { code: "local_judgement_error", ...processingError });
    }
  } else {
    const error = networkError || {
      code: payload && payload.error || (response ? "http_" + response.status : "call_error"),
      message: payload && payload.detail || (response ? response.statusText : "marker call failed"),
      http_status: response && response.status || null,
    };
    judgement = callErrorJudgement(caseDef, error);
  }

  const usage = payload && payload.usage && typeof payload.usage === "object" ? payload.usage : null;
  const cost = payload && typeof payload.cost_usd === "number" ? payload.cost_usd : null;
  const costKnown = !!(payload && payload.cost_known === true);
  const paidError = judgement.status === "call_error" &&
    ((typeof cost === "number" && cost > 0) || (usage && usage.output_tokens > 0));
  return {
    planned_index: task.planned_index,
    arm: task.arm,
    repetition: task.repetition,
    case_id: task.case_id,
    item: task.item,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    latency_ms: latencyMs,
    request_body_sha256: sha256(requestText),
    request_body: requestBody,
    http: response ? {
      ok: response.ok,
      status: response.status,
      status_text: response.statusText,
      headers: selectedHeaders(response.headers),
    } : null,
    network_error: networkError,
    processing_error: processingError,
    raw_http_text: rawHttpText,
    response_payload: payload,
    raw_model_output: payload && payload.diagnostics &&
      Object.prototype.hasOwnProperty.call(payload.diagnostics, "raw_model_output")
      ? payload.diagnostics.raw_model_output : null,
    marker_result_worker: payload && payload.result || null,
    marker_result_canonical: canonicalResult,
    usage,
    cost_usd: cost,
    cost_known: costKnown,
    paid_error: paidError,
    potential_paid_error: judgement.status === "call_error" && !costKnown,
    worker_build: payload && payload.worker_build || "",
    prompt_sha256: payload && payload.prompt_sha256 || "",
    model_used: payload && payload.model_used || "",
    response_contract_requested: payload && payload.response_contract_requested || "",
    marker_format_used: payload && payload.marker_format_used || "",
    max_output_tokens: (payload && payload.max_output_tokens) ?? null,
    finish_reason: (payload && payload.finish_reason) ?? null,
    native_finish_reason: (payload && payload.native_finish_reason) ?? null,
    client_request_meta: payload && payload.client_request_meta || null,
    judgement,
  };
}

function progressValue(value, fallback = "?") {
  return value === null || value === undefined ? fallback : String(value);
}

function printCallProgress(call, completed, total) {
  const usage = call.usage || {};
  const cost = typeof call.cost_usd === "number" ? "$" + call.cost_usd.toFixed(5) : "$?";
  const format = call.marker_format_used ? " format=" + call.marker_format_used : "";
  console.log("[" + String(completed).padStart(String(total).length, "0") + "/" + total + "] " +
    call.arm + " rep=" + call.repetition + " " + call.case_id + " -> " + call.judgement.status +
    " out=" + progressValue(usage.output_tokens) + " " + cost + " " + call.latency_ms + "ms" + format);
}

export function printSummary(summary) {
  console.log("\narm\tcalls\tpass\tfail\tmanual\tcall_error\tpaid_error\tout_tokens\tcost_usd\tunknown_cost\tmean_ms\tp95_ms");
  for (const arm of ARMS) {
    const row = summary.arms[arm];
    console.log([
      arm, row.calls, row.pass, row.fail, row.manual, row.call_error, row.paid_errors,
      row.output_tokens, row.cost_usd.toFixed(5), row.unknown_cost_calls,
      progressValue(row.latency_ms_mean), progressValue(row.latency_ms_p95),
    ].join("\t"));
  }
  const delta = summary.comparison_compact_minus_legacy;
  console.log("compact-minus-legacy: pass=" + delta.pass +
    ", output_tokens=" + delta.output_tokens +
    ", cost_usd=" + delta.cost_usd.toFixed(5) +
    ", mean_latency_ms=" + progressValue(delta.latency_ms_mean));
}

function ensureOutput(outPath, overwrite) {
  const absolute = path.resolve(outPath);
  if (fs.existsSync(absolute) && !overwrite) {
    fail("output already exists; choose another path or pass --overwrite: " + absolute);
  }
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  return absolute;
}

function writeArtifact(outPath, artifact) {
  fs.writeFileSync(outPath, JSON.stringify(artifact, null, 2) + "\n", "utf8");
}

async function executePlan(artifact, tasks, foundation, options, outPath) {
  let cursor = 0;
  let completed = 0;
  let stopRequested = false;
  let checkpoint = Promise.resolve();
  const onInterrupt = () => {
    stopRequested = true;
    console.error("\nInterrupt requested; finishing in-flight calls and checkpointing retained results...");
  };
  process.once("SIGINT", onInterrupt);

  async function record(call) {
    artifact.calls.push(call);
    completed++;
    artifact.summary = summarizeCalls(artifact.calls);
    printCallProgress(call, completed, tasks.length);
    checkpoint = checkpoint.then(() => writeArtifact(outPath, artifact));
    await checkpoint;
  }

  async function worker() {
    while (!stopRequested) {
      const index = cursor++;
      if (index >= tasks.length) return;
      const task = tasks[index];
      try {
        await record(await runCall(task, foundation, options));
      } catch (error) {
        const caseDef = foundation.suite.cases[task.case_index];
        await record({
          ...task,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          latency_ms: null,
          request_body_sha256: "",
          request_body: null,
          http: null,
          network_error: errorShape(error),
          raw_http_text: null,
          response_payload: null,
          raw_model_output: null,
          marker_result_worker: null,
          marker_result_canonical: null,
          usage: null,
          cost_usd: null,
          cost_known: false,
          paid_error: false,
          potential_paid_error: true,
          judgement: callErrorJudgement(caseDef, { code: "runner_error", ...errorShape(error) }),
        });
      }
    }
  }

  try {
    await Promise.all(Array.from({ length: Math.min(options.concurrency, tasks.length) }, () => worker()));
    await checkpoint;
  } finally {
    process.removeListener("SIGINT", onInterrupt);
  }
  artifact.status = stopRequested ? "aborted" : "complete";
  artifact.completed_at = new Date().toISOString();
  artifact.summary = summarizeCalls(artifact.calls);
  writeArtifact(outPath, artifact);
}

function printValidation(foundation, tasks, options) {
  const counts = Array.from(foundation.caseInputs.values()).map(row => row.context_buckets);
  console.log("suite: v" + foundation.suite.version + ", " + foundation.suite.cases.length + " cases, " +
    foundation.preflight.stats.assertions + " automatic assertions, " +
    foundation.preflight.stats.manual_reviews + " manual reviews");
  console.log("corpus: " + foundation.items.length + " translation items, " + foundation.buckets.length + " buckets");
  console.log("lean contexts: " + Math.min(...counts) + ".." + Math.max(...counts) + " buckets per case");
  console.log("suite sha256: " + foundation.suiteSha256);
  console.log("item snapshot sha256: " + foundation.caseItemSnapshotSha256);
  console.log("context snapshot sha256: " + foundation.contextSnapshotSha256);
  if (tasks) console.log("plan: " + tasks.length + " calls; theoretical ceiling $" +
    (tasks.length * options.maxCostUsd).toFixed(2) + " at configured settings");
}

export async function main(argv = process.argv.slice(2)) {
  let options;
  try {
    options = parseArgs(argv);
  } catch (error) {
    console.error("error: " + error.message + "\n\n" + HELP);
    return 2;
  }
  if (options.help) {
    console.log(HELP);
    return 0;
  }

  let foundation;
  try {
    foundation = loadFoundation();
  } catch (error) {
    console.error("foundation load failed: " + error.message);
    return 1;
  }
  if (!foundation.preflight.ok) {
    console.error("expectation suite is BROKEN; no network calls were made:");
    for (const error of foundation.preflight.errors.slice(0, 20)) {
      console.error("  " + (error.case_id ? error.case_id + ": " : "") + error.message);
    }
    return 1;
  }
  const tasks = buildRunPlan(foundation, options);
  printValidation(foundation, tasks, options);
  if (options.validateOnly) {
    console.log("validation clean; no network calls and no files written");
    return 0;
  }

  const artifact = buildArtifact(foundation, options, tasks);
  if (options.dryRun) {
    artifact.completed_at = new Date().toISOString();
    if (options.out) {
      try {
        const outPath = ensureOutput(options.out, options.overwrite);
        writeArtifact(outPath, artifact);
        console.log("dry-run artifact written: " + outPath);
      } catch (error) {
        console.error("could not write dry-run artifact: " + error.message);
        return 1;
      }
    }
    console.log("dry run clean; no network calls were made");
    return 0;
  }

  if (typeof fetch !== "function") {
    console.error("paid execution requires Node 18+ with global fetch");
    return 1;
  }
  let outPath;
  let capability;
  try {
    console.log("checking deployed worker capability (GET only; no model spend)...");
    capability = await fetchWorkerCapability(options);
    artifact.worker_capability = capability;
    console.log("worker capability clean: " + capability.health.build + "; contracts " +
      capability.health.supported_response_contracts.join(", "));
  } catch (error) {
    console.error(error.message + "; no paid calls were made");
    return 1;
  }
  try {
    outPath = ensureOutput(options.out, options.overwrite);
    writeArtifact(outPath, artifact);
  } catch (error) {
    console.error("refusing to start paid calls: " + error.message);
    return 1;
  }

  console.log("PAID RUN: " + tasks.length + " calls, concurrency " + options.concurrency +
    ", per-call ceiling $" + options.maxCostUsd.toFixed(4) +
    ", theoretical aggregate ceiling $" + (tasks.length * options.maxCostUsd).toFixed(2));
  console.log("checkpoint artifact: " + outPath);
  await executePlan(artifact, tasks, foundation, options, outPath);
  printSummary(artifact.summary);
  console.log("artifact written: " + outPath);
  return artifact.status === "complete" ? 0 : 130;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  process.exitCode = await main();
}
