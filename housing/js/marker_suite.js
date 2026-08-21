/*
 * Linguics marker expectation-suite foundation.
 *
 * This file deliberately has no DOM, storage, network, or model dependencies.
 * The browser receives the API as LL.markerSuite; Node receives it through
 * require(). Keeping validation and judgement here gives the bench and the
 * no-network tests one implementation of the case contract.
 *
 * Public API:
 *   validateSuite / preflightSuite, validateCase / preflightCase,
 *   validateCheck, matchScope, evaluateCheck, judgeCase, judgeSuite,
 *   canonicalizeBucketId, canonicalizeScope, canonicalizeExpectedVerdicts,
 *   canonicalizeMarkerResult, and constants.
 */
(function (root, factory) {
  "use strict";
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) {
    root.LL = root.LL || {};
    root.LL.markerSuite = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const VERSION = 2;
  const CHECK_TYPES = Object.freeze([
    "no_miss",
    "no_bucket",
    "no_note_of_kind",
    "count_at_most",
    "overall",
  ]);
  const OUTCOMES = Object.freeze(["hit", "miss", "partial", "not_attempted"]);
  const NOTE_KINDS = Object.freeze([
    "false_friend",
    "register_drift",
    "alternative_correct",
    "accent",
    "other",
  ]);
  const OVERALL_FIELDS = Object.freeze([
    "marks_awarded",
    "marks_possible",
    "attempted_overall",
    "correctness_overall",
    "summary",
    "explanation",
  ]);
  const OPS = Object.freeze(["eq", "ne", "gte", "lte"]);
  const STATUSES = Object.freeze(["pass", "fail", "manual", "broken", "call_error"]);

  const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
  const isObject = value => !!value && typeof value === "object" && !Array.isArray(value);
  const unique = values => Array.from(new Set(values));

  function issue(code, path, message, caseId) {
    const out = { code, path, message };
    if (caseId) out.case_id = caseId;
    return out;
  }

  function validStableId(value) {
    return typeof value === "string" && /^[a-z0-9][a-z0-9_-]*$/.test(value);
  }

  function validBucketId(value) {
    return typeof value === "string" && value.length > 0 && value.trim() === value &&
      !/\s/.test(value) && value.indexOf("*") < 0;
  }

  function validScope(scope) {
    if (scope === "*") return true;
    if (typeof scope !== "string" || !scope || scope.trim() !== scope || /\s/.test(scope)) return false;
    const stars = (scope.match(/\*/g) || []).length;
    if (!stars) return true;
    if (stars !== 1 || !scope.endsWith(".*")) return false;
    const prefix = scope.slice(0, -2);
    return !!prefix && !prefix.endsWith(".") && prefix.indexOf("*") < 0;
  }

  /** Exact IDs match exactly. `prefix.*` matches descendants on a dot boundary. */
  function matchScope(bucketId, scope) {
    if (typeof bucketId !== "string" || !validScope(scope)) return false;
    if (scope === "*") return true;
    if (scope.endsWith(".*")) return bucketId.startsWith(scope.slice(0, -1));
    return bucketId === scope;
  }

  /**
   * Apply a caller-owned bucket canonicalizer. Returning null/undefined means
   * "unchanged". Invalid hook output is an explicit error, never a silent ID.
   */
  function canonicalizeBucketId(bucketId, hook, context) {
    if (typeof hook !== "function") return bucketId;
    const value = hook(bucketId, context || {});
    if (value === null || value === undefined) return bucketId;
    if (!validBucketId(value)) {
      throw new TypeError("bucket canonicalizer returned an invalid id for " + bucketId);
    }
    return value;
  }

  // Exact negative assertions need the same vocabulary-ID resolution as model
  // output and positive assertions. Prefix globs are intentionally already
  // broad and phantom negatives must remain legal, so only exact IDs are sent
  // through the caller-owned canonicalizer.
  function canonicalizeScope(scope, hook, context) {
    if (scope === "*" || (typeof scope === "string" && scope.endsWith(".*"))) return scope;
    return canonicalizeBucketId(scope, hook, context);
  }

  function canonicalizeExpectedVerdicts(caseDef, hook) {
    if (!isObject(caseDef)) throw new TypeError("case must be an object");
    const source = isObject(caseDef.expect_verdict) ? caseDef.expect_verdict : {};
    const mapped = {};
    for (const bucketId of Object.keys(source)) {
      const canonical = canonicalizeBucketId(bucketId, hook, {
        source: "expect_verdict",
        case_id: caseDef.case_id || "",
        case: caseDef,
      });
      if (hasOwn(mapped, canonical) && mapped[canonical] !== source[bucketId]) {
        throw new Error("canonical bucket collision on " + canonical);
      }
      mapped[canonical] = source[bucketId];
    }
    return Object.assign({}, caseDef, { expect_verdict: mapped });
  }

  function canonicalizeMarkerResult(markerResult, hook, context) {
    if (!isObject(markerResult)) return markerResult;
    const markpoints = Array.isArray(markerResult.markpoints)
      ? markerResult.markpoints.map(function (markpoint, index) {
          if (!isObject(markpoint) || typeof markpoint.bucket !== "string") return markpoint;
          return Object.assign({}, markpoint, {
            bucket: canonicalizeBucketId(markpoint.bucket, hook, Object.assign({}, context || {}, {
              source: "marker_result",
              markpoint_index: index,
            })),
          });
        })
      : markerResult.markpoints;
    return Object.assign({}, markerResult, {
      overall: isObject(markerResult.overall) ? Object.assign({}, markerResult.overall) : markerResult.overall,
      markpoints,
      notes: Array.isArray(markerResult.notes) ? markerResult.notes.slice() : markerResult.notes,
    });
  }

  function allowedSet(options, optionName, defaults) {
    const supplied = options && options[optionName];
    if (supplied instanceof Set) return supplied;
    if (Array.isArray(supplied)) return new Set(supplied);
    return new Set(defaults);
  }

  function rejectUnknownKeys(obj, allowed, path, errors, caseId) {
    for (const key of Object.keys(obj)) {
      if (!allowed.includes(key)) {
        errors.push(issue("unknown_check_field", path + "." + key,
          "field is not valid for check type " + String(obj.type || ""), caseId));
      }
    }
  }

  function validateCheck(check, options) {
    options = options || {};
    const path = options.path || "check";
    const caseId = options.case_id || "";
    const errors = [];
    if (!isObject(check)) {
      errors.push(issue("check_not_object", path, "expect_checks entries must be objects", caseId));
      return { ok: false, errors };
    }
    if (!CHECK_TYPES.includes(check.type)) {
      errors.push(issue("unknown_check_type", path + ".type",
        "unknown check type: " + String(check.type), caseId));
      return { ok: false, errors };
    }

    if (check.type === "no_miss" || check.type === "no_bucket") {
      rejectUnknownKeys(check, ["type", "scope"], path, errors, caseId);
      if (!validScope(check.scope)) {
        errors.push(issue("invalid_scope", path + ".scope",
          "scope must be an exact id, '*', or a terminal 'prefix.*' glob", caseId));
      }
    } else if (check.type === "no_note_of_kind") {
      rejectUnknownKeys(check, ["type", "kind"], path, errors, caseId);
      if (!allowedSet(options, "noteKinds", NOTE_KINDS).has(check.kind)) {
        errors.push(issue("invalid_note_kind", path + ".kind",
          "unknown note kind: " + String(check.kind), caseId));
      }
    } else if (check.type === "count_at_most") {
      rejectUnknownKeys(check, ["type", "outcome", "n", "scope"], path, errors, caseId);
      if (!OUTCOMES.includes(check.outcome)) {
        errors.push(issue("invalid_outcome", path + ".outcome",
          "unknown markpoint outcome: " + String(check.outcome), caseId));
      }
      if (!Number.isInteger(check.n) || check.n < 0) {
        errors.push(issue("invalid_count", path + ".n", "n must be a non-negative integer", caseId));
      }
      if (hasOwn(check, "scope") && !validScope(check.scope)) {
        errors.push(issue("invalid_scope", path + ".scope",
          "scope must be an exact id, '*', or a terminal 'prefix.*' glob", caseId));
      }
    } else if (check.type === "overall") {
      rejectUnknownKeys(check, ["type", "field", "op", "value"], path, errors, caseId);
      if (!allowedSet(options, "overallFields", OVERALL_FIELDS).has(check.field)) {
        errors.push(issue("invalid_overall_field", path + ".field",
          "unknown overall field: " + String(check.field), caseId));
      }
      if (!OPS.includes(check.op)) {
        errors.push(issue("invalid_operator", path + ".op",
          "operator must be eq, ne, gte, or lte", caseId));
      }
      if (!hasOwn(check, "value")) {
        errors.push(issue("missing_check_value", path + ".value", "overall check requires value", caseId));
      } else if ((check.op === "gte" || check.op === "lte") && typeof check.value !== "number") {
        errors.push(issue("invalid_check_value", path + ".value",
          check.op + " requires a numeric value", caseId));
      }
    }
    return { ok: errors.length === 0, errors };
  }

  function hasItemResolver(options) {
    return !!options && (typeof options.getItem === "function" || !!options.itemsById);
  }

  function resolveItem(options, itemId) {
    if (!options) return undefined;
    if (typeof options.getItem === "function") return options.getItem(itemId);
    const index = options.itemsById;
    if (index instanceof Map) return index.get(itemId);
    if (index && typeof index === "object") return index[itemId];
    return undefined;
  }

  function inferDirection(item) {
    if (!item) return "";
    const source = String(item.source_lang || item.source_language || "").toLowerCase();
    const target = String(item.target_lang || item.target_language || "").toLowerCase();
    if (source === "it" && target === "en") return "it_en";
    if (source === "en" && target === "it") return "en_it";
    return "";
  }

  function fireabilityFailure(value) {
    if (value === false) return "bucket is not fireable in this context";
    if (typeof value === "string") return value;
    if (isObject(value) && value.ok === false) return value.reason || "bucket is not fireable in this context";
    return "";
  }

  function validateCase(caseDef, options) {
    options = options || {};
    const path = options.path || "case";
    const errors = [];
    const warnings = [];
    if (!isObject(caseDef)) {
      errors.push(issue("case_not_object", path, "case must be an object"));
      return { ok: false, errors, warnings, assertion_count: 0, manual_count: 0 };
    }

    const caseId = caseDef.case_id || "";
    if (!validStableId(caseId)) {
      errors.push(issue("invalid_case_id", path + ".case_id",
        "case_id is required and must contain lowercase letters, digits, '_' or '-'", caseId));
    }
    if (typeof caseDef.item !== "string" || !caseDef.item.trim()) {
      errors.push(issue("invalid_item", path + ".item", "item must be a non-empty string", caseId));
    }
    if (typeof caseDef.answer !== "string") {
      errors.push(issue("invalid_answer", path + ".answer", "answer must be a string", caseId));
    }
    if (hasOwn(caseDef, "direction") && !["en_it", "it_en"].includes(caseDef.direction)) {
      errors.push(issue("invalid_direction", path + ".direction", "direction must be en_it or it_en", caseId));
    }
    if (hasOwn(caseDef, "expect_rules")) {
      errors.push(issue("legacy_expect_rules", path + ".expect_rules",
        "free-text expect_rules are not executable; use expect_checks or manual_review", caseId));
    }

    let item;
    if (hasItemResolver(options) && typeof caseDef.item === "string") {
      try {
        item = resolveItem(options, caseDef.item);
      } catch (error) {
        errors.push(issue("item_resolver_failed", path + ".item",
          "item resolver failed: " + (error && error.message ? error.message : String(error)), caseId));
      }
      if (!item) {
        errors.push(issue("item_not_found", path + ".item", "item is not present in the loaded corpus", caseId));
      } else {
        const direction = inferDirection(item);
        if (caseDef.direction && direction && caseDef.direction !== direction) {
          errors.push(issue("direction_mismatch", path + ".direction",
            "case direction does not match the loaded item (" + direction + ")", caseId));
        }
        if (typeof caseDef.source_text === "string" && typeof item.source_text === "string" &&
            caseDef.source_text !== item.source_text) {
          errors.push(issue("source_text_mismatch", path + ".source_text",
            "case source_text does not match the loaded item", caseId));
        }
      }
    }

    const expected = caseDef.expect_verdict === undefined ? {} : caseDef.expect_verdict;
    let expectedIds = [];
    const canonicalExpectedIds = [];
    if (!isObject(expected)) {
      errors.push(issue("invalid_expect_verdict", path + ".expect_verdict",
        "expect_verdict must be an object", caseId));
    } else {
      expectedIds = Object.keys(expected);
      for (const bucketId of expectedIds) {
        const bucketPath = path + ".expect_verdict." + bucketId;
        if (!validBucketId(bucketId)) {
          errors.push(issue("invalid_bucket_id", bucketPath,
            "positive verdict keys must be exact bucket ids", caseId));
        }
        if (!OUTCOMES.includes(expected[bucketId])) {
          errors.push(issue("invalid_outcome", bucketPath,
            "unknown expected outcome: " + String(expected[bucketId]), caseId));
        }
        if (typeof options.canonicalizeBucketId === "function" && validBucketId(bucketId)) {
          try {
            const canonical = canonicalizeBucketId(bucketId, options.canonicalizeBucketId, {
              source: "expect_verdict",
              case_id: caseId,
              case: caseDef,
              item,
            });
            canonicalExpectedIds.push(canonical);
            if (options.requireCanonical !== false && canonical !== bucketId) {
              errors.push(issue("noncanonical_bucket_id", bucketPath,
                "use canonical bucket id " + canonical, caseId));
            }
          } catch (error) {
            errors.push(issue("canonicalizer_failed", bucketPath,
              error && error.message ? error.message : String(error), caseId));
          }
        } else if (validBucketId(bucketId)) {
          canonicalExpectedIds.push(bucketId);
        }
        if (typeof options.isFireableBucket === "function" && validBucketId(bucketId)) {
          try {
            const reason = fireabilityFailure(options.isFireableBucket(bucketId, {
              case_id: caseId,
              case: caseDef,
              item,
              mode: options.mode,
            }));
            if (reason) errors.push(issue("bucket_not_fireable", bucketPath, reason, caseId));
          } catch (error) {
            errors.push(issue("fireability_check_failed", bucketPath,
              error && error.message ? error.message : String(error), caseId));
          }
        }
      }
    }

    const absent = caseDef.expect_absent === undefined ? [] : caseDef.expect_absent;
    let absentScopes = [];
    if (!Array.isArray(absent)) {
      errors.push(issue("invalid_expect_absent", path + ".expect_absent",
        "expect_absent must be an array", caseId));
    } else {
      absentScopes = absent.slice();
      const seen = new Set();
      for (let i = 0; i < absent.length; i++) {
        const scope = absent[i];
        const absentPath = path + ".expect_absent[" + i + "]";
        if (!validScope(scope)) {
          errors.push(issue("invalid_scope", absentPath,
            "absence target must be an exact id, '*', or terminal 'prefix.*' glob", caseId));
          continue;
        }
        let canonicalScope = scope;
        try {
          canonicalScope = canonicalizeScope(scope, options.canonicalizeBucketId, {
            source: "expect_absent",
            case_id: caseId,
            case: caseDef,
            item,
          });
        } catch (error) {
          errors.push(issue("canonicalizer_failed", absentPath,
            error && error.message ? error.message : String(error), caseId));
          continue;
        }
        if (seen.has(canonicalScope)) errors.push(issue("duplicate_absence", absentPath,
          "duplicate absence target after canonicalisation: " + canonicalScope, caseId));
        seen.add(canonicalScope);
        for (const expectedId of canonicalExpectedIds) {
          if (matchScope(expectedId, canonicalScope)) {
            errors.push(issue("contradictory_expectation", absentPath,
              canonicalScope + " also matches positive expectation " + expectedId, caseId));
          }
        }
      }
    }

    if (hasOwn(caseDef, "absent_reasons")) {
      const reasons = caseDef.absent_reasons;
      if (!isObject(reasons)) {
        errors.push(issue("invalid_absent_reasons", path + ".absent_reasons",
          "absent_reasons must be an object", caseId));
      } else {
        for (const key of Object.keys(reasons)) {
          if (!absentScopes.includes(key)) {
            errors.push(issue("orphan_absent_reason", path + ".absent_reasons." + key,
              "reason key is not present in expect_absent", caseId));
          }
          if (typeof reasons[key] !== "string" || !reasons[key].trim()) {
            errors.push(issue("invalid_absent_reason", path + ".absent_reasons." + key,
              "absence reason must be non-empty text", caseId));
          }
        }
        for (const scope of absentScopes) {
          if (!hasOwn(reasons, scope)) {
            errors.push(issue("missing_absent_reason", path + ".absent_reasons",
              "missing reason for " + scope, caseId));
          }
        }
      }
    }

    const checks = caseDef.expect_checks === undefined ? [] : caseDef.expect_checks;
    if (!Array.isArray(checks)) {
      errors.push(issue("invalid_expect_checks", path + ".expect_checks",
        "expect_checks must be an array", caseId));
    } else {
      for (let i = 0; i < checks.length; i++) {
        const checked = validateCheck(checks[i], Object.assign({}, options, {
          path: path + ".expect_checks[" + i + "]",
          case_id: caseId,
        }));
        errors.push.apply(errors, checked.errors);
      }
    }

    const manual = caseDef.manual_review === undefined ? [] : caseDef.manual_review;
    if (!Array.isArray(manual)) {
      errors.push(issue("invalid_manual_review", path + ".manual_review",
        "manual_review must be an array", caseId));
    } else {
      const ids = new Set();
      for (let i = 0; i < manual.length; i++) {
        const entry = manual[i];
        const manualPath = path + ".manual_review[" + i + "]";
        if (!isObject(entry)) {
          errors.push(issue("invalid_manual_entry", manualPath,
            "manual review entry must be an object", caseId));
          continue;
        }
        for (const key of Object.keys(entry)) {
          if (!["id", "text"].includes(key)) errors.push(issue("unknown_manual_field",
            manualPath + "." + key, "manual review entries allow only id and text", caseId));
        }
        if (!validStableId(entry.id)) errors.push(issue("invalid_manual_id", manualPath + ".id",
          "manual review id must be stable lowercase text", caseId));
        else if (ids.has(entry.id)) errors.push(issue("duplicate_manual_id", manualPath + ".id",
          "duplicate manual review id: " + entry.id, caseId));
        ids.add(entry.id);
        if (typeof entry.text !== "string" || !entry.text.trim()) {
          errors.push(issue("invalid_manual_text", manualPath + ".text",
            "manual review text must be non-empty", caseId));
        }
      }
    }

    const automaticCount = expectedIds.length + (Array.isArray(absent) ? absent.length : 0) +
      (Array.isArray(checks) ? checks.length : 0);
    const manualCount = Array.isArray(manual) ? manual.length : 0;
    if (automaticCount + manualCount === 0) {
      errors.push(issue("zero_assertions", path,
        "case has no executable expectation and no explicit manual review", caseId));
    }

    return {
      ok: errors.length === 0,
      errors,
      warnings,
      assertion_count: automaticCount,
      manual_count: manualCount,
    };
  }

  function validateRunnerChecks(runnerChecks, errors) {
    if (runnerChecks === undefined) return;
    if (!Array.isArray(runnerChecks)) {
      errors.push(issue("invalid_runner_checks", "runner_checks", "runner_checks must be an array"));
      return;
    }
    const ids = new Set();
    for (let i = 0; i < runnerChecks.length; i++) {
      const entry = runnerChecks[i];
      const path = "runner_checks[" + i + "]";
      if (!isObject(entry)) {
        errors.push(issue("invalid_runner_check", path, "runner check must be an object"));
        continue;
      }
      if (!validStableId(entry.id)) errors.push(issue("invalid_runner_check_id", path + ".id",
        "runner check id must be stable lowercase text"));
      else if (ids.has(entry.id)) errors.push(issue("duplicate_runner_check_id", path + ".id",
        "duplicate runner check id: " + entry.id));
      ids.add(entry.id);
      if (typeof entry.rule !== "string" || !entry.rule.trim()) {
        errors.push(issue("invalid_runner_check_rule", path + ".rule", "runner check rule must be non-empty"));
      }
    }
  }

  function validateSuite(suite, options) {
    options = options || {};
    const errors = [];
    const warnings = [];
    const caseResults = [];
    if (!isObject(suite)) {
      errors.push(issue("suite_not_object", "suite", "suite must be an object"));
      return { ok: false, errors, warnings, cases: caseResults, stats: {} };
    }
    if (suite.version !== VERSION) {
      errors.push(issue("unsupported_version", "version",
        "suite version must be " + VERSION + "; got " + String(suite.version)));
    }
    if (!Array.isArray(suite.cases) || !suite.cases.length) {
      errors.push(issue("invalid_cases", "cases", "suite must contain at least one case"));
    } else {
      const ids = new Set();
      for (let i = 0; i < suite.cases.length; i++) {
        const checked = validateCase(suite.cases[i], Object.assign({}, options, {
          path: "cases[" + i + "]",
        }));
        caseResults.push(checked);
        errors.push.apply(errors, checked.errors);
        warnings.push.apply(warnings, checked.warnings);
        const caseId = suite.cases[i] && suite.cases[i].case_id;
        if (typeof caseId === "string") {
          if (ids.has(caseId)) errors.push(issue("duplicate_case_id", "cases[" + i + "].case_id",
            "duplicate case_id: " + caseId, caseId));
          ids.add(caseId);
        }
      }
    }
    validateRunnerChecks(suite.runner_checks, errors);
    return {
      ok: errors.length === 0,
      errors,
      warnings,
      cases: caseResults,
      stats: {
        cases: Array.isArray(suite.cases) ? suite.cases.length : 0,
        assertions: caseResults.reduce((n, result) => n + (result.assertion_count || 0), 0),
        manual_reviews: caseResults.reduce((n, result) => n + (result.manual_count || 0), 0),
      },
    };
  }

  function normalizeMarkerResult(run, options) {
    options = options || {};
    let result = run;
    if (isObject(run)) {
      if (isObject(run.marker_result_canonical)) result = run.marker_result_canonical;
      else if (isObject(run.result)) result = run.result;
      else if (isObject(run.raw) && (Array.isArray(run.raw.markpoints) || isObject(run.raw.overall))) result = run.raw;
    }
    if (!isObject(result)) return { ok: false, error: "marker result is not an object" };

    const sourceMarkpoints = Array.isArray(result.markpoints) ? result.markpoints : result.mps;
    if (!Array.isArray(sourceMarkpoints)) return { ok: false, error: "marker result has no markpoints array" };
    const markpoints = [];
    for (let i = 0; i < sourceMarkpoints.length; i++) {
      const source = sourceMarkpoints[i];
      if (!isObject(source)) return { ok: false, error: "markpoint " + i + " is not an object" };
      const rawBucket = source.bucket || source.bucket_id || source.b;
      const outcome = source.outcome || source.verdict || source.v;
      if (!validBucketId(rawBucket)) return { ok: false, error: "markpoint " + i + " has invalid bucket" };
      if (!OUTCOMES.includes(outcome)) return { ok: false, error: "markpoint " + i + " has invalid outcome" };
      let bucket;
      try {
        bucket = canonicalizeBucketId(rawBucket, options.canonicalizeBucketId, {
          source: "marker_result",
          markpoint_index: i,
          case_id: options.case_id || "",
        });
      } catch (error) {
        return { ok: false, error: error && error.message ? error.message : String(error) };
      }
      markpoints.push(Object.assign({}, source, { bucket, outcome }));
    }
    let overall;
    if (isObject(result.overall)) {
      overall = result.overall;
    } else if (hasOwn(result, "marks") || hasOwn(result, "marksPoss")) {
      overall = {
        marks_awarded: result.marks,
        marks_possible: result.marksPoss,
        attempted_overall: result.attempted_overall,
        correctness_overall: result.correctness_overall,
      };
    } else {
      return { ok: false, error: "marker result has no overall object" };
    }
    if (typeof overall.marks_awarded !== "number" || typeof overall.marks_possible !== "number") {
      return { ok: false, error: "marker result overall marks are not numeric" };
    }
    const notes = result.notes === undefined ? [] : result.notes;
    if (!Array.isArray(notes)) return { ok: false, error: "marker result notes is not an array" };
    return { ok: true, result: Object.assign({}, result, { markpoints, overall, notes }) };
  }

  function equalValues(actual, expected, epsilon) {
    if (typeof actual === "number" && typeof expected === "number") {
      return Number.isFinite(actual) && Number.isFinite(expected) && Math.abs(actual - expected) <= epsilon;
    }
    return actual === expected;
  }

  function evaluateValidatedCheck(check, result, options) {
    const markpoints = result.markpoints;
    const scope = check.scope || "*";
    if (check.type === "no_miss") {
      const matches = markpoints.filter(markpoint => matchScope(markpoint.bucket, scope) && markpoint.outcome === "miss");
      return {
        pass: matches.length === 0,
        type: check.type,
        message: matches.length ? "miss found on " + matches.map(m => m.bucket).join(", ") : "no matching miss",
        matches: matches.map(m => m.bucket),
      };
    }
    if (check.type === "no_bucket") {
      const matches = markpoints.filter(markpoint => matchScope(markpoint.bucket, scope));
      return {
        pass: matches.length === 0,
        type: check.type,
        message: matches.length ? "forbidden bucket found: " + matches.map(m => m.bucket).join(", ") : "forbidden bucket absent",
        matches: matches.map(m => m.bucket),
      };
    }
    if (check.type === "no_note_of_kind") {
      const count = result.notes.filter(note => isObject(note) && note.kind === check.kind).length;
      return {
        pass: count === 0,
        type: check.type,
        message: count ? count + " note(s) of kind " + check.kind + " found" : "note kind absent",
        count,
      };
    }
    if (check.type === "count_at_most") {
      const count = markpoints.filter(markpoint =>
        markpoint.outcome === check.outcome && matchScope(markpoint.bucket, scope)).length;
      return {
        pass: count <= check.n,
        type: check.type,
        message: count + " matching " + check.outcome + " markpoint(s); maximum " + check.n,
        count,
        maximum: check.n,
      };
    }
    const actual = result.overall[check.field];
    const epsilon = typeof options.numericEpsilon === "number" ? options.numericEpsilon : 1e-9;
    let pass = false;
    if (check.op === "eq") pass = equalValues(actual, check.value, epsilon);
    else if (check.op === "ne") pass = !equalValues(actual, check.value, epsilon);
    else if (check.op === "gte") pass = typeof actual === "number" && actual >= check.value;
    else if (check.op === "lte") pass = typeof actual === "number" && actual <= check.value;
    return {
      pass,
      type: check.type,
      message: "overall." + check.field + " is " + String(actual) + "; expected " + check.op + " " + String(check.value),
      actual,
      expected: check.value,
      op: check.op,
    };
  }

  function evaluateCheck(check, markerResult, options) {
    options = options || {};
    const checked = validateCheck(check, options);
    if (!checked.ok) {
      return { pass: false, broken: true, type: check && check.type, errors: checked.errors,
        message: checked.errors.map(error => error.message).join("; ") };
    }
    const normalized = normalizeMarkerResult(markerResult, options);
    if (!normalized.ok) {
      return { pass: false, broken: true, type: check.type, errors: [], message: normalized.error };
    }
    return evaluateValidatedCheck(check, normalized.result, options);
  }

  function callErrorFrom(run) {
    if (run === null || run === undefined) return { message: "no marker response" };
    if (!isObject(run)) return null;
    if (run.status === "call_error") return run.error || run.call || { message: "marker call failed" };
    if (run.call && run.call.ok === false) return run.call;
    if (run.ok === false) return run.error || run;
    const hasResult = isObject(run.result) || isObject(run.marker_result_canonical) ||
      Array.isArray(run.markpoints) || Array.isArray(run.mps) || isObject(run.overall);
    if (run.error && !hasResult) return run.error;
    return null;
  }

  function baseJudgement(caseDef, status) {
    return {
      case_id: caseDef && caseDef.case_id || "",
      item: caseDef && caseDef.item || "",
      status,
      pass: status === "pass",
      scored: status === "pass" || status === "fail",
      automatic_pass: false,
      missing: [],
      wrong: [],
      invented: [],
      check_results: [],
      rule_failures: [],
      manual_review: Array.isArray(caseDef && caseDef.manual_review) ? caseDef.manual_review.slice() : [],
    };
  }

  function judgeCase(caseDef, run, options) {
    options = options || {};
    const preflight = validateCase(caseDef, options);
    if (!preflight.ok) {
      const broken = baseJudgement(caseDef, "broken");
      broken.definition_errors = preflight.errors;
      broken.manual_review = [];
      return broken;
    }

    const callError = callErrorFrom(run);
    if (callError) {
      const failed = baseJudgement(caseDef, "call_error");
      failed.call_error = callError;
      return failed;
    }

    const normalizeOptions = Object.assign({}, options, { case_id: caseDef.case_id });
    const normalized = normalizeMarkerResult(run, normalizeOptions);
    if (!normalized.ok) {
      const failed = baseJudgement(caseDef, "call_error");
      failed.call_error = { message: normalized.error };
      return failed;
    }
    const result = normalized.result;
    const judgement = baseJudgement(caseDef, "fail");
    const found = new Map();
    for (const markpoint of result.markpoints) {
      const list = found.get(markpoint.bucket) || [];
      list.push(markpoint);
      found.set(markpoint.bucket, list);
    }

    for (const originalBucket of Object.keys(caseDef.expect_verdict || {})) {
      let bucket = originalBucket;
      try {
        bucket = canonicalizeBucketId(originalBucket, options.canonicalizeBucketId, {
          source: "expect_verdict",
          case_id: caseDef.case_id,
          case: caseDef,
        });
      } catch (error) {
        judgement.status = "broken";
        judgement.scored = false;
        judgement.definition_errors = [issue("canonicalizer_failed", "expect_verdict." + originalBucket,
          error && error.message ? error.message : String(error), caseDef.case_id)];
        return judgement;
      }
      const wanted = caseDef.expect_verdict[originalBucket];
      const got = found.get(bucket) || [];
      if (!got.length) {
        judgement.missing.push(bucket + " (wanted " + wanted + ")");
      } else if (got.length > 1) {
        judgement.wrong.push(bucket + ": returned " + got.length + " times");
      } else if (got[0].outcome !== wanted) {
        judgement.wrong.push(bucket + ": got " + got[0].outcome + ", wanted " + wanted);
      }
    }

    for (const originalScope of caseDef.expect_absent || []) {
      let scope = originalScope;
      try {
        scope = canonicalizeScope(originalScope, options.canonicalizeBucketId, {
          source: "expect_absent",
          case_id: caseDef.case_id,
          case: caseDef,
        });
      } catch (error) {
        judgement.status = "broken";
        judgement.scored = false;
        judgement.definition_errors = [issue("canonicalizer_failed", "expect_absent." + originalScope,
          error && error.message ? error.message : String(error), caseDef.case_id)];
        return judgement;
      }
      const matches = result.markpoints.filter(markpoint => matchScope(markpoint.bucket, scope));
      for (const markpoint of matches) {
        judgement.invented.push(markpoint.bucket + " (claimed " + markpoint.outcome + ")");
      }
    }

    for (const check of caseDef.expect_checks || []) {
      const evaluated = evaluateValidatedCheck(check, result, options);
      judgement.check_results.push(evaluated);
      if (!evaluated.pass) judgement.rule_failures.push(evaluated.message);
    }

    judgement.automatic_pass = !judgement.missing.length && !judgement.wrong.length &&
      !judgement.invented.length && !judgement.rule_failures.length;
    if (!judgement.automatic_pass) {
      judgement.status = "fail";
      judgement.pass = false;
      judgement.scored = true;
    } else if (judgement.manual_review.length) {
      judgement.status = "manual";
      judgement.pass = false;
      judgement.scored = false;
    } else {
      judgement.status = "pass";
      judgement.pass = true;
      judgement.scored = true;
    }
    return judgement;
  }

  function resultLookup(results, caseDef, index) {
    if (results instanceof Map) return results.get(caseDef.case_id);
    if (Array.isArray(results)) {
      const named = results.find(row => row && row.case_id === caseDef.case_id);
      return named === undefined ? results[index] : named;
    }
    if (isObject(results)) return results[caseDef.case_id];
    return undefined;
  }

  function judgeSuite(suite, results, options) {
    const preflight = validateSuite(suite, options);
    if (!preflight.ok) {
      return { status: "broken", results: [], counts: { broken: preflight.errors.length }, preflight };
    }
    const judged = suite.cases.map((caseDef, index) =>
      judgeCase(caseDef, resultLookup(results, caseDef, index), options));
    const counts = {};
    for (const status of STATUSES) counts[status] = judged.filter(row => row.status === status).length;
    return { status: counts.broken ? "broken" : "complete", results: judged, counts, preflight };
  }

  return Object.freeze({
    VERSION,
    CHECK_TYPES,
    OUTCOMES,
    NOTE_KINDS,
    OVERALL_FIELDS,
    OPS,
    STATUSES,
    validScope,
    matchScope,
    canonicalizeBucketId,
    canonicalizeScope,
    canonicalizeExpectedVerdicts,
    canonicalizeMarkerResult,
    validateCheck,
    validateCase,
    preflightCase: validateCase,
    validateSuite,
    preflightSuite: validateSuite,
    evaluateCheck,
    judgeCase,
    judgeSuite,
  });
});
