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

    // Strip square-bracketed disambiguation instructions from the MARKER feed
    // (e.g. "[it is the sister who studies there]"): they are meaning-forcing
    // notes for the learner, kept verbatim in the display, but not translatable
    // content the marker should judge against. See inter_chat/
    // Architecture_Housing_translation_source_brackets.md.
    let markerItem = item;
    if (item && typeof item.source_text === "string" && item.source_text.indexOf("[") !== -1) {
      markerItem = Object.assign({}, item);
      markerItem.source_text = item.source_text.replace(/\s*\[[^\]]*\]\s*/g, " ").replace(/\s+/g, " ").trim();
    }
    const body = {
      item: markerItem,
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
    if (direction !== "it_en") return true;
    // For IT→EN, first consult the bucket's declared direction attribute when
    // available. If absent, fall back to the prefix-based rule.
    const bucketsById = LL.bucketsById || {};
    const bucket = bucketsById[bucketId];
    const declared = bucket && bucket.attributes && bucket.attributes.direction;
    if (declared) {
      // "production": only fires when learner produces Italian forms. Drop on IT→EN.
      // "bidirectional" (default for explicit tags): fires in both directions. Keep.
      // "recognition": only fires when learner reads Italian forms. Keep on IT→EN.
      return declared !== "production";
    }
    // Fallback prefix rule for buckets without an explicit direction tag.
    if (bucketId.startsWith("vocabulary.")) return true;
    if (bucketId.includes(".translation_mapping.")) return true;
    if (bucketId.includes(".usage.")) return true;
    return false;
  };

  LL.inferDirection = function (item) {
    // Accept both naming conventions: the author chats use the short
    // `source_lang`/`target_lang` form, my earlier design assumed the long
    // form. Accept either.
    const src = (item.source_lang || item.source_language || "").toLowerCase();
    const tgt = (item.target_lang || item.target_language || "").toLowerCase();
    if (src === "it" && tgt === "en") return "it_en";
    if (src === "en" && tgt === "it") return "en_it";
    // Final fallback: glance at the source_text for Italian-only characters.
    // If the source contains accented Italian vowels (à è é ì ò ù) and the
    // answer doesn't, the item is probably IT→EN.
    const srcText = item.source_text || "";
    if (/[àèéìòù]/i.test(srcText)) return "it_en";
    return "en_it";
  };

  /**
   * Vocab bucket-id resolution (per-entry tracking).
   *
   * Bucket-id shape, as ruled by architecture chat 2026-05-28:
   *
   *   vocabulary.it.<lemma>.<pos>[.<gender>].<aspect>[.<direction>]
   *
   * - <pos> is always present so that any lemma later split by POS keeps
   *   its history pinned to the originally-asked entry.
   * - <gender> is only present when this entry's lemma has multiple entries
   *   with the same POS distinguished by gender (e.g. `fine` f vs m). For
   *   single-gender lemmas it is omitted.
   * - <aspect> ∈ { translation, gender, article_form } (extensible).
   * - <direction> is the active/passive suffix, applied to translation only.
   *   Direction "en_it" → .active (learner produced Italian);
   *   Direction "it_en" → .passive (learner recognised Italian).
   *   Gender and article_form aspects fire only on EN→IT noun marking, so
   *   they don't carry a direction suffix (always production).
   *
   * Lemma sanitisation: dots in lemmas (e.g. `ecc.`) are replaced with
   * underscores inside the bucket id so the dot-segmented parser doesn't
   * split a lemma into two segments. The original lemma stays untouched in
   * the entry's data.
   */

  // -------- Entry indexing --------

  /**
   * Index a list of vocab entries so the resolver can answer "what POS and
   * gender does this lemma have, and is its lemma part of a gender-split
   * group?". Call once on load (and again if vocab data refreshes).
   */
  LL.indexEntries = function (entries) {
    LL.entriesById = {};
    LL.entriesByLemma = {};
    LL.lemmaGenderSplit = {};  // lemma → Set of POS values that are gender-split
    LL.lemmaNumberSplit = {};  // lemma → Set of "<pos>|<gender>" keys that are number-split
    if (!Array.isArray(entries)) return;
    // Group by (lemma, pos) to detect gender-split sets.
    const byLP = new Map();
    for (const e of entries) {
      if (!e || !e.lemma) continue;
      const key = e.lemma + "|" + (e.pos || "");
      let list = byLP.get(key);
      if (!list) { list = []; byLP.set(key, list); }
      list.push(e);
      // Lemma index
      let lemmaList = LL.entriesByLemma[e.lemma];
      if (!lemmaList) { lemmaList = []; LL.entriesByLemma[e.lemma] = lemmaList; }
      lemmaList.push(e);
    }
    // For each (lemma, pos) group with >1 entries differing by gender,
    // mark this (lemma, pos) as gender-split.
    for (const [key, list] of byLP.entries()) {
      if (list.length < 2) continue;
      const genders = new Set(list.map(e => e.gender || ""));
      if (genders.size < 2) continue;
      const [lemma, pos] = key.split("|");
      if (!LL.lemmaGenderSplit[lemma]) LL.lemmaGenderSplit[lemma] = new Set();
      LL.lemmaGenderSplit[lemma].add(pos);
      // Also index each entry by (lemma, pos, gender) triple.
      for (const e of list) {
        const id = lemma + "|" + pos + "|" + (e.gender || "");
        LL.entriesById[id] = e;
      }
    }
    // For (lemma, pos, gender) groups with >1 entries differing by number,
    // mark as number-split. Canonical case: le.pronoun.f.sg vs le.pronoun.f.pl.
    const byLPG = new Map();
    for (const e of entries) {
      if (!e || !e.lemma) continue;
      const key = e.lemma + "|" + (e.pos || "") + "|" + (e.gender || "");
      let list = byLPG.get(key);
      if (!list) { list = []; byLPG.set(key, list); }
      list.push(e);
    }
    for (const [key, list] of byLPG.entries()) {
      if (list.length < 2) continue;
      const numbers = new Set(list.map(e => e.number || ""));
      if (numbers.size < 2) continue;
      const [lemma, pos, gender] = key.split("|");
      const splitKey = pos + "|" + gender;
      if (!LL.lemmaNumberSplit[lemma]) LL.lemmaNumberSplit[lemma] = new Set();
      LL.lemmaNumberSplit[lemma].add(splitKey);
    }
  };

  LL.isNumberSplit = function (lemma, pos, gender) {
    const set = LL.lemmaNumberSplit && LL.lemmaNumberSplit[lemma];
    return !!(set && set.has((pos || "") + "|" + (gender || "")));
  };

  /**
   * True if this (lemma, pos) pair is part of a gender-split group, i.e.
   * multiple entries share the lemma + POS but differ by gender. When true,
   * the bucket id must include the gender qualifier to keep entries
   * separately tracked.
   */
  LL.isGenderSplit = function (lemma, pos) {
    const set = LL.lemmaGenderSplit && LL.lemmaGenderSplit[lemma];
    return !!(set && set.has(pos || ""));
  };

  // -------- Bucket id construction --------

  function sanitiseLemma(lemma) {
    return String(lemma || "").replace(/\./g, "_");
  }

  /**
   * Canonical bucket-id builder. Takes an entry, an aspect, and options.
   * Returns the full resolved bucket id per the shape rule.
   *
   * @param {object} entry  Curated entry with .lemma, .pos, .gender
   * @param {string} aspect One of "translation", "gender", "article_form"
   * @param {object} opts   { direction: "en_it" | "it_en" }
   */
  LL.entryBucketId = function (entry, aspect, opts) {
    if (!entry || !entry.lemma) return "";
    const lemma = sanitiseLemma(entry.lemma);
    const pos = entry.pos || "unknown";
    const parts = ["vocabulary", "it", lemma, pos];
    if (LL.isGenderSplit(entry.lemma, pos) && entry.gender) {
      parts.push(entry.gender);
    }
    // Vocab marker semantics v4 (2026-05-29): when the (lemma, pos, gender)
    // triple doesn't disambiguate the entry but `number` does, include the
    // number segment. Canonical case: le.pronoun.f.sg (IOP) vs le.pronoun.f.pl
    // (DOP). Only inserted when this lemma is part of a number-split set.
    if (LL.isNumberSplit && LL.isNumberSplit(entry.lemma, pos, entry.gender) && entry.number) {
      parts.push(entry.number);
    }
    parts.push(aspect);
    if (aspect === "translation") {
      const direction = (opts && opts.direction) === "it_en" ? "passive" : "active";
      parts.push(direction);
    } else if (aspect === "gender" || aspect === "article_form") {
      // Gender and article_form are production-only; always .active.
      parts.push("active");
    }
    return parts.join(".");
  };

  /**
   * Resolve a base-form bucket id (e.g. `vocabulary.it.casa.translation`)
   * into the per-entry shape. Used for chat-authored references and
   * AI-marker proposals that come in without POS/gender/direction segments.
   *
   * If `opts.entry` is provided, use it directly. Otherwise look up by
   * lemma; if the lookup is ambiguous (multi-entry lemma), fall back to
   * the entry with the lowest merged_rank.
   *
   * If the bucket id is not a vocab id, or is already resolved (has more
   * than 4 segments after vocabulary.it.), pass through unchanged.
   */
  LL.resolveVocabVariant = function (bucketId, direction, opts) {
    if (typeof bucketId !== "string") return bucketId;
    if (!bucketId.startsWith("vocabulary.it.")) return bucketId;
    // Don't double-resolve. The base shape we accept is exactly
    // `vocabulary.it.<lemma>.<aspect>` (4 dot-segments). Anything longer is
    // either already resolved or doesn't fit our pattern; leave alone.
    const segs = bucketId.split(".");
    if (segs.length !== 4) return bucketId;
    const [, , lemmaSeg, aspectSeg] = segs;
    // Validate aspect
    if (aspectSeg !== "translation" && aspectSeg !== "gender" && aspectSeg !== "article_form") {
      return bucketId;
    }
    // Find the entry: opts.entry, else lookup by lemma, else give up.
    let entry = (opts && opts.entry) || null;
    if (!entry) {
      const list = LL.entriesByLemma && LL.entriesByLemma[lemmaSeg];
      if (list && list.length === 1) {
        entry = list[0];
      } else if (list && list.length > 1) {
        // Multi-entry lemma without specific entry context: pick the
        // lowest merged_rank as the best-guess canonical. Imperfect but
        // it's the only deterministic fallback. Authoring chats can
        // explicitly disambiguate via .pos[.gender] in their bucket
        // references if they want to bypass this.
        entry = list.slice().sort((a, b) => {
          return (a.merged_rank || a.rank || 9e9) - (b.merged_rank || b.rank || 9e9);
        })[0];
      }
    }
    if (!entry) {
      // No matching entry — return the base id with the direction suffix
      // for translation so old code that just wants .active/.passive still
      // gets something. Other aspects pass through unchanged.
      if (aspectSeg === "translation") {
        const variant = direction === "it_en" ? "passive" : "active";
        return bucketId + "." + variant;
      }
      return bucketId;
    }
    return LL.entryBucketId(entry, aspectSeg, { direction: direction });
  };

  /**
   * Resolve every vocab bucket id in an array to the per-entry shape.
   * Non-vocab ids pass through unchanged.
   */
  LL.resolveVocabBuckets = function (ids, direction, opts) {
    if (!Array.isArray(ids)) return ids;
    return ids.map(id => LL.resolveVocabVariant(id, direction, opts));
  };

  /**
   * Post-process an AI marker response: resolve any base-form vocab bucket
   * ids in markpoints to the per-entry shape. Used when the AI shortcuts
   * a base id even though bucket_context offered the resolved variant.
   */
  LL.resolveVocabInMarkpoints = function (markpoints, direction) {
    if (!Array.isArray(markpoints)) return markpoints;
    return markpoints.map(mp => {
      if (!mp || typeof mp !== "object") return mp;
      const resolved = LL.resolveVocabVariant(mp.bucket, direction);
      if (resolved === mp.bucket) return mp;
      return Object.assign({}, mp, { bucket: resolved });
    });
  };

  /**
   * Parse a vocab event's bucket id and extract its lemma. Tolerant of
   * both the old shape (vocabulary.it.<lemma>.<aspect>...) and the new
   * shape (vocabulary.it.<lemma>.<pos>[.<gender>].<aspect>...). Returns
   * `{ lemma, pos, gender, aspect, direction }` or null if not a vocab id.
   *
   * The lemma is desantised (underscores back to dots if the original lemma
   * was `ecc.`-style) by checking against the entry index. If the index
   * isn't loaded yet, returns the sanitised form.
   */
  LL.parseVocabBucketId = function (bucketId) {
    if (typeof bucketId !== "string") return null;
    if (!bucketId.startsWith("vocabulary.it.")) return null;
    const rest = bucketId.slice("vocabulary.it.".length);
    const segs = rest.split(".");
    if (segs.length < 2) return null;
    // The aspect is recognised by name; everything before it is
    // lemma/pos/gender; everything after is direction (or empty).
    const ASPECTS = ["translation", "gender", "article_form"];
    let aspectIdx = -1;
    for (let i = 0; i < segs.length; i++) {
      if (ASPECTS.indexOf(segs[i]) >= 0) { aspectIdx = i; break; }
    }
    if (aspectIdx < 0) return null;
    const prefix = segs.slice(0, aspectIdx);
    const aspect = segs[aspectIdx];
    const suffix = segs.slice(aspectIdx + 1);
    // Prefix segments (in order):
    //   [lemma]                          legacy, pre-2026-05-28
    //   [lemma, pos]                     ungendered entries
    //   [lemma, pos, gender]             gender-split lemmas
    //   [lemma, pos, gender, number]     number-split within a (lemma,pos,gender)
    // The gender slot is recognised by being in {m, f, mf, ambiguous}; anything
    // else in that slot is treated as a number qualifier (sg | pl).
    let lemma = prefix[0] || "";
    let pos = prefix[1] || null;
    let gender = null;
    let number = null;
    const GENDERS = new Set(["m", "f", "mf", "ambiguous"]);
    const NUMBERS = new Set(["sg", "pl"]);
    if (prefix.length >= 3) {
      const seg2 = prefix[2];
      if (GENDERS.has(seg2)) gender = seg2;
      else if (NUMBERS.has(seg2)) number = seg2;
    }
    if (prefix.length >= 4) {
      const seg3 = prefix[3];
      if (NUMBERS.has(seg3)) number = seg3;
    }
    // Desanitise lemma if possible
    if (LL.entriesByLemma && !LL.entriesByLemma[lemma]) {
      const dotted = lemma.replace(/_/g, ".");
      if (LL.entriesByLemma[dotted]) lemma = dotted;
    }
    const direction = suffix[0] || null;
    return { lemma, pos, gender, number, aspect, direction };
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
      const resolvedId = LL.resolveVocabVariant(id, direction);
      // Look up label/description from the base id (the bucket tree only
      // registers base vocab translation ids, not variants). The bucket_context
      // key is the resolved-variant id so the AI fires the variant.
      const b = bucketById[id] || bucketById[resolvedId];
      if (b) ctx[resolvedId] = { label: b.label || resolvedId, description: b.description || "" };
    }
    // Cross-topic menu (task 41, Architecture_Housing_translation_crosstopic_marking):
    // the marker may tag ANY grammar element it detects from the standing bucket
    // menu, not just this item's required_buckets (the mandatory FLOOR). Menu adds
    // breadth; direction-filtered like the rest.
    const menu = (LL.markerMenu && Array.isArray(LL.markerMenu.menu)) ? LL.markerMenu.menu : [];
    for (const node of menu) {
      const mid = node && node.id;
      if (!mid || ctx[mid]) continue;
      if (!LL.isCandidateForDirection(mid, direction)) continue;
      const mb = bucketById[mid];
      ctx[mid] = { label: (mb && mb.label) || node.label || mid, description: (mb && mb.description) || "" };
    }
    // For IT→EN items, inject vocabulary recognition buckets based on the
    // source text. The chats authored these items without listing vocab
    // buckets in required_buckets (they assumed vocab was production-only),
    // but on IT→EN the learner is recognising source vocabulary and we want
    // that signal. Match each significant word in the source_text against
    // the known vocab list.
    if (direction === "it_en" && Array.isArray(LL.vocabEntries) && LL.vocabEntries.length) {
      const src = String(item.source_text || "").toLowerCase();
      const tokens = src.split(/[\s,.!?;:"'()\[\]<>\/\\]+/).filter(t => t.length >= 3);
      const byLemma = LL._vocabByLemma || (LL._vocabByLemma = (function() {
        const m = new Map();
        for (const e of LL.vocabEntries) {
          if (e && e.lemma) m.set(String(e.lemma).toLowerCase(), e);
        }
        return m;
      })());
      for (const tok of tokens) {
        let entry = byLemma.get(tok);
        if (!entry && tok.length >= 4) {
          for (const lemma of byLemma.keys()) {
            if (lemma.length < 3) continue;
            if (lemma.slice(0, 4) === tok.slice(0, 4) && Math.abs(lemma.length - tok.length) <= 3) {
              entry = byLemma.get(lemma);
              break;
            }
          }
        }
        if (!entry) continue;
        const baseBid = `vocabulary.it.${entry.lemma}.translation`;
        const variantBid = LL.resolveVocabVariant(baseBid, direction);
        if (ctx[variantBid]) continue;
        ctx[variantBid] = {
          label: `${entry.lemma} (translation, passive)`,
          description: `Recognition of Italian ${entry.lemma}${entry.translation_en ? ` (means: ${entry.translation_en})` : ""}. Passive: learner is reading Italian here.`
        };
      }
    }
    return ctx;
  };

  /**
   * For the stub's use: filter an item's required_buckets to the ones that
   * are direction-applicable.
   */
  LL.candidateBucketIds = function (item) {
    const direction = LL.inferDirection(item);
    const ids = [].concat(item.required_buckets || [], item.optional_buckets || []);
    return ids
      .filter(id => LL.isCandidateForDirection(id, direction))
      .map(id => LL.resolveVocabVariant(id, direction));
  };

  LL.formatCost = function (usd) {
    if (typeof usd !== "number" || !isFinite(usd)) return "$0";
    if (usd < 0.01) return "$" + usd.toFixed(4);
    if (usd < 1) return "$" + usd.toFixed(3);
    return "$" + usd.toFixed(2);
  };
})();
