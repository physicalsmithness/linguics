/* ============================================================================
   Translation marker: live AI backend.

   When a Worker URL is configured (LL.setMarkerUrl), translation attempts go
   to that URL and the structured response replaces what the stub would have
   produced. When no URL is configured, the stub still runs as a fallback.

   The marker URL and the optional model override are stored in localStorage
   so they persist across reloads.

   Cumulative session cost is tracked in localStorage too; the footer renders
   it via LL.onCostUpdate.
   ============================================================================ */

(function () {
  "use strict";
  const LL = window.LL || (window.LL = {});

  const URL_KEY    = "linguics_marker_url";
  const MODEL_KEY  = "linguics_marker_model";
  const COST_KEY   = "linguics_session_cost_usd";
  const WARN_THRESHOLD_USD = 1.0;

  LL.markerUrl = function () {
    try { return localStorage.getItem(URL_KEY) || ""; }
    catch (e) { return ""; }
  };
  LL.setMarkerUrl = function (url) {
    try {
      const trimmed = String(url || "").trim().replace(/\/$/, "");
      if (trimmed) localStorage.setItem(URL_KEY, trimmed);
      else localStorage.removeItem(URL_KEY);
    } catch (e) {}
  };
  LL.markerModel = function () {
    try { return localStorage.getItem(MODEL_KEY) || ""; }
    catch (e) { return ""; }
  };
  LL.setMarkerModel = function (m) {
    try {
      const trimmed = String(m || "").trim();
      if (trimmed) localStorage.setItem(MODEL_KEY, trimmed);
      else localStorage.removeItem(MODEL_KEY);
    } catch (e) {}
  };
  LL.sessionCostUsd = function () {
    try { return Number(localStorage.getItem(COST_KEY) || "0") || 0; }
    catch (e) { return 0; }
  };
  LL.resetSessionCost = function () {
    try { localStorage.removeItem(COST_KEY); }
    catch (e) {}
    if (typeof LL.onCostUpdate === "function") LL.onCostUpdate(0);
  };

  function trackCost(usd) {
    if (typeof usd !== "number" || !isFinite(usd) || usd <= 0) return;
    try {
      const cur = LL.sessionCostUsd();
      const next = cur + usd;
      localStorage.setItem(COST_KEY, next.toFixed(6));
      if (typeof LL.onCostUpdate === "function") LL.onCostUpdate(next);
    } catch (e) {}
  }

  /**
   * Available models for the live marker, in friendly-name → identifier map.
   * Used by the footer dropdown. Identifiers must match the Worker's
   * MODEL_PRICING keys.
   */
  LL.AVAILABLE_MODELS = [
    { id: "",                                 label: "Default (DeepSeek V3)" },
    { id: "deepseek/deepseek-chat",           label: "DeepSeek V3 (~$0.001/call)" },
    { id: "anthropic/claude-haiku-4.5",       label: "Claude Haiku 4.5 (~$0.004/call)" },
    { id: "anthropic/claude-sonnet-4.5",      label: "Claude Sonnet 4.5 (~$0.013/call)" },
    { id: "google/gemini-2.0-flash-001",      label: "Gemini 2.0 Flash (~$0.0005/call)" },
    { id: "openai/gpt-4o-mini",               label: "GPT-4o-mini (~$0.0006/call)" },
  ];

  /**
   * Call the live marker backend.
   *   item: the translation item (source_text, references, required_buckets, ...)
   *   raw: the learner's answer (may contain <g> <s> <f> annotations)
   *   intent: literal | guess | sense
   *   options: { url, model, bucketContext }
   * Returns: { result, usage, cost_usd, model_used }
   * Throws Error on failure with a user-friendly message.
   */
  LL.markTranslationLive = async function (item, raw, intent, options) {
    options = options || {};
    const url = options.url || LL.markerUrl();
    if (!url) throw new Error("No marker URL configured.");
    const model = options.model || LL.markerModel();

    const body = {
      item,
      raw,
      intent: intent || "literal",
      bucket_context: options.bucketContext || {},
    };
    if (model) body.model = model;

    let res;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (e) {
      throw new Error("Network error reaching marker: " + (e && e.message ? e.message : String(e)));
    }

    let payload;
    try {
      payload = await res.json();
    } catch (e) {
      throw new Error("Marker returned non-JSON response (HTTP " + res.status + ")");
    }

    if (!res.ok) {
      const code = payload.error || ("http_" + res.status);
      const detail = payload.detail || ("HTTP " + res.status);
      throw new Error("Marker error (" + code + "): " + detail);
    }
    if (!payload.result) throw new Error("Marker returned no result");

    trackCost(payload.cost_usd);

    if (LL.sessionCostUsd() > WARN_THRESHOLD_USD) {
      console.warn("Linguics session cost has exceeded $" + WARN_THRESHOLD_USD.toFixed(2));
    }

    return payload;
  };

  /**
   * Direction-aware candidate filter.
   *
   * Not every bucket on an item is a candidate for attribution given the
   * direction. For IT→EN translation, the learner doesn't produce Italian
   * forms; they recognise the source. So adjective_agreement and the
   * grammar-formation buckets aren't candidates. Only vocabulary buckets
   * (the learner needs to know what each word means) and translation_mapping
   * buckets (the learner has to map an Italian construct to an English
   * equivalent) are candidates.
   *
   * For EN→IT, all buckets are candidates since the learner is producing
   * Italian and the grammar-formation buckets are exactly what's being tested.
   *
   * The rule is intentionally simple. A bucket is keepable on IT→EN if:
   *   - its id starts with "vocabulary." (vocab recognition / translation), OR
   *   - it contains ".translation_mapping." (explicit cross-language mapping), OR
   *   - it contains ".usage." (usage/comprehension buckets are bidirectional)
   * Everything else is filtered out for IT→EN.
   */
  LL.isCandidateForDirection = function (bucketId, direction) {
    if (direction === "en_it" || !direction) return true; // EN→IT (or unknown): keep all
    if (direction === "it_en") {
      if (bucketId.startsWith("vocabulary.")) return true;
      if (bucketId.includes(".translation_mapping.")) return true;
      if (bucketId.includes(".usage.")) return true;
      return false;
    }
    return true;
  };

  LL.inferDirection = function (item) {
    const src = (item.source_language || "").toLowerCase();
    const tgt = (item.target_language || "").toLowerCase();
    if (src === "it" && tgt === "en") return "it_en";
    if (src === "en" && tgt === "it") return "en_it";
    return "en_it"; // default assumption for legacy items without explicit fields
  };

  /**
   * Build the bucket_context object that the Worker uses to know what each
   * bucket means. Takes the item and the bucket index (id → bucket), returns
   * a slim subset covering only the buckets the item references AND that are
   * direction-applicable.
   */
  LL.buildBucketContext = function (item, bucketById) {
    const ctx = {};
    if (!bucketById) return ctx;
    const direction = LL.inferDirection(item);
    const ids = [].concat(item.required_buckets || [], item.optional_buckets || []);
    for (const id of ids) {
      if (!LL.isCandidateForDirection(id, direction)) continue;
      const b = bucketById[id];
      if (b) ctx[id] = { label: b.label || id, description: b.description || "" };
    }
    return ctx;
  };

  /**
   * For the stub's use: filter an item's required_buckets to the ones that
   * are direction-applicable. The stub fires these as hits/misses depending
   * on whether word-overlap is above threshold; with this filter applied,
   * grammar buckets no longer fire on IT→EN items.
   */
  LL.candidateBucketIds = function (item) {
    const direction = LL.inferDirection(item);
    const ids = [].concat(item.required_buckets || [], item.optional_buckets || []);
    return ids.filter(id => LL.isCandidateForDirection(id, direction));
  };

  /**
   * Format a cost amount for display. Uses cents under $1, dollars above.
   */
  LL.formatCost = function (usd) {
    if (typeof usd !== "number" || !isFinite(usd)) return "$0";
    if (usd < 0.01) return "$" + usd.toFixed(4);
    if (usd < 1) return "$" + usd.toFixed(3);
    return "$" + usd.toFixed(2);
  };
})();
