/**
 * Linguics translation marker — Cloudflare Worker.
 *
 * Receives a POST /mark with { item, raw, intent, bucket_context, model? } and
 * proxies to OpenRouter (https://openrouter.ai/api/v1/chat/completions).
 * Returns the structured marker output plus token usage and dollar cost.
 *
 * Defaults to DeepSeek V3 (cheap); model can be overridden per request via
 * the `model` field for A/B comparison.
 *
 * Per-call cost cap: $0.03. Calls projected over the cap are refused before
 * being sent upstream.
 *
 * Endpoint is open during prototype. Lightweight per-IP rate-limit is in
 * place (in-memory; Workers isolate per region, so it's per-edge, but enough
 * to deter casual abuse).
 */

interface Env {
  OPENROUTER_API_KEY: string;
}

interface MarkRequest {
  item: TranslationItem;
  raw: string;
  intent?: "literal" | "guess" | "sense";
  /** Subset of bucket id -> { label, description } that the marker should know about. */
  bucket_context?: Record<string, { label: string; description?: string }>;
  /** OpenRouter model identifier; defaults to DeepSeek V3. */
  model?: string;
}

interface TranslationItem {
  source_text: string;
  source_language?: "en" | "it";
  target_language?: "en" | "it";
  references?: Array<{ text: string; polarity?: "positive" | "negative"; note?: string } | string>;
  required_buckets?: string[];
  optional_buckets?: string[];
  vocab_help?: any[];
  cefr_level_target?: string;
  notes?: string;
  external_id?: string;
}

interface MarkpointOut {
  bucket: string;
  label?: string;
  attempted_credit: number;          // 0..1
  correctness_credit: number | null; // null when not_attempted
  outcome: "hit" | "miss" | "partial" | "not_attempted";
  evidence?: string;
  expected?: string;
  bucket_proposed?: boolean;
  proposed_parent_id?: string;
  proposed_label?: string;
  proposed_rationale?: string;
}

interface MarkerResult {
  overall: {
    marks_awarded: number;
    marks_possible: number;
    summary: string;
    attempted_overall?: number;
    correctness_overall?: number;
    explanation?: string;
  };
  raw_response?: string;
  markpoints: MarkpointOut[];
  notes?: Array<{ kind: string; text: string }>;
}

/* ------------------------------------------------------------------------- */
/* Model pricing                                                              */
/* OpenRouter passes through provider prices; these are the per-million-token */
/* rates for input and output (USD).                                          */
/* ------------------------------------------------------------------------- */
const MODEL_PRICING: Record<string, [number, number]> = {
  "deepseek/deepseek-chat":          [0.27, 1.10],
  "deepseek/deepseek-chat-v3":       [0.27, 1.10],
  "anthropic/claude-haiku-4.5":      [0.80, 4.00],
  "anthropic/claude-sonnet-4.5":     [3.00, 15.00],
  "anthropic/claude-3.5-haiku":      [0.80, 4.00],
  "anthropic/claude-3.5-sonnet":     [3.00, 15.00],
  "google/gemini-2.0-flash-001":     [0.10, 0.40],
  "google/gemini-flash-1.5":         [0.075, 0.30],
  "openai/gpt-4o-mini":              [0.15, 0.60],
  "qwen/qwen-2.5-72b-instruct":      [0.30, 0.40],
};

const DEFAULT_MODEL = "deepseek/deepseek-chat";
const COST_CAP_PER_CALL_USD = 0.03;
const MAX_OUTPUT_TOKENS = 2000;

/* ------------------------------------------------------------------------- */
/* Lightweight rate limit (per-IP, per-edge, in-memory).                      */
/* Not bulletproof; sufficient to deter casual abuse.                         */
/* ------------------------------------------------------------------------- */
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 60;
const ipBuckets = new Map<string, number[]>();

function rateLimitCheck(ip: string): { allowed: boolean; resetMs?: number } {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const history = (ipBuckets.get(ip) || []).filter(t => t >= windowStart);
  if (history.length >= RATE_LIMIT_MAX) {
    const oldest = history[0];
    return { allowed: false, resetMs: RATE_LIMIT_WINDOW_MS - (now - oldest) };
  }
  history.push(now);
  ipBuckets.set(ip, history);
  return { allowed: true };
}

/* ------------------------------------------------------------------------- */
/* Annotation parsing                                                         */
/* Inline annotations like <g>...</g>, <s>...</s>, <f>...</f> tag stylistic   */
/* segments of the learner's answer. Levels (<g1>, <g2>, <g3>) are optional. */
/* ------------------------------------------------------------------------- */
interface Annotation { kind: "g" | "s" | "f"; level: number; text: string; }

function parseAnnotations(raw: string): { annotations: Annotation[]; cleaned: string } {
  const annotations: Annotation[] = [];
  const re = /<([gsf])([123]?)>([\s\S]*?)<\/\1>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    annotations.push({
      kind: m[1] as Annotation["kind"],
      level: m[2] ? Number(m[2]) : 1,
      text: m[3],
    });
  }
  const cleaned = raw.replace(/<\/?[gsf][123]?>/g, "");
  return { annotations, cleaned };
}

/* ------------------------------------------------------------------------- */
/* Prompt construction                                                        */
/* The system prompt is large and stable (suitable for prompt caching).       */
/* The user message is small and varies per attempt.                          */
/* ------------------------------------------------------------------------- */

function buildSystemPrompt(): string {
  return `You are an Italian-language teacher marking a student's translation attempt. Your job: return a structured JSON response that attributes each part of the student's attempt to specific skill buckets in a granular taxonomy.

DIRECTION AWARENESS (critical)

Every item declares a direction in item.direction ("it_en" or "en_it"). This determines what the learner had to demonstrate and what each bucket means.

- direction "en_it" (source English, target Italian): the learner READS English and PRODUCES Italian. Each bucket asks "did the learner correctly produce this Italian form?". Production buckets (auxiliary choice, agreement, participle form, pronoun position) are fully applicable. A failure to produce the right form fires a miss on that bucket. The learner's answer must be in Italian; an English answer is "didn't attempt" overall.

- direction "it_en" (source Italian, target English): the learner READS Italian and PRODUCES English. Each bucket asks "did the learner correctly RECOGNISE this Italian feature and reflect its meaning in their English?". The Italian production skills (forming agreement, conjugating, positioning clitics) are NOT tested because the learner doesn't produce Italian. The bucket_context will have been filtered already to remove production-only buckets. What remains are recognition-relevant buckets: a pronoun.indirect_object.le bucket means "did the learner recognise 'le' as the recipient (to her / formal you)?"; a vocabulary.it.X.translation bucket means "did the learner translate X correctly?"; an adjective_agreement.position.semantic_shift bucket means "did the learner pick up the semantic shift driven by adjective position?".

If the direction is it_en and the learner's answer is English: that IS the expected behaviour. Don't flag the attempt as "didn't translate into Italian"; assess what was demonstrated in the English.

GENERAL RULES

1. Be precise. Each error should attribute to a single bucket (the most diagnostic one). Don't conflate different errors into one bucket. Don't fabricate misses.

2. Distinguish vocabulary misses (wrong word) from grammatical misses (right word, wrong form/agreement/order). A learner who writes "azzurra" for "blu marino" missed vocabulary, not agreement. A learner who writes "andato" for "andata" got the right verb but missed gender agreement.

3. For false friends (Italian "roba" calqued from French "robe" for "dress"), fire the vocabulary bucket plus a note in the notes array explaining the false friend.

4. Don't penalise stylistic choices that the intent or annotations license. If intent is "sense", don't penalise non-literal mappings that capture meaning. If a segment is wrapped in <f> flair, credit stylistic reach even if a safer choice was available.

5. Don't fire formation buckets when the item's diagnostic is tense choice. If the learner picked the wrong tense but spelled it correctly, that's a tense-choice miss, not a participle-form miss.

6. The marker output is the only data the project author and the learner see. Make evidence strings short and concrete; make explanation prose follow the Linguics house style (everyday lead, name the grammatical term, use it thereafter, finish with the concrete working).

7. Required buckets are mandatory. Every bucket id in item.required_buckets MUST appear as a markpoint in your output, exactly once, citing that exact id. The outcome reflects what the learner demonstrated:
   - hit (correctness=1) if the learner clearly got that skill right
   - miss (correctness=0) if they got it wrong
   - partial (correctness=0.5) if they were half-right
   - not_attempted (attempted=0, correctness=null) if their answer doesn't engage with the skill at all (silent on it)
   Do not silently drop a required bucket. If the item's diagnostic is tense choice and the required_bucket is tense_choice.progressive_vs_simple.present_progressive_vs_present, that bucket MUST appear in your markpoints — even when the learner got it right (fire as hit) — so the learner accumulates signal on it.

ACCENT POLICY (ruled; applies wherever the learner produces Italian, i.e. direction en_it)

8. Score the attempt AS IF all accents were correct. An accent-only error — a missing, added, or wrong-mark accent (perche for perché, e for è, ne for né) — does NOT fire a miss or partial on any bucket by itself. Apostrophe-for-elision slips ("la ho" for "l'ho", "un amica" for "un'amica") count as this same class. If the form is otherwise the right form, the bucket is a hit.

9. Then, if the attempt contains one or more accent-only errors, apply exactly ONE small deduction to the whole answer (never one per error): overall.marks_awarded = the accent-blind score multiplied by 0.9. So an otherwise-perfect answer with accent slips scores exactly 0.9 — it never ties the accent-perfect answer, and accent errors alone can never take an otherwise-correct answer below 0.9. Real errors deduct as normal first; the single accent multiplier applies on top of whatever the accent-blind score is.

10. NAME every accent error explicitly, one note per error, kind "accent": e.g. { "kind": "accent", "text": "perché carries an acute accent; you wrote perche." } The overall.explanation may mention accents in passing; the notes carry the specifics. Never stay silent about an accent error just because the deduction is small.

(House coherence, for your calibration only: the vocab strand's EN→IT grader deducts 50% for accent errors — strict by design; the grammar strand's substring marker gives full credit and classifies the slip; this marker deducts a little and names. Three graders, three written policies.)

CANDIDATE BUCKETS

The bucket_context object lists ALL buckets you may fire as regular hits/misses (with bucket_proposed: false or omitted). The list has already been filtered to the buckets relevant to this item's direction. You MUST NOT fire a bucket that isn't in bucket_context as a regular hit. Specifically: on it_en items, do NOT fire grammar production buckets like adverb_placement, auxiliary choice, participle agreement, pronoun position, or adjective agreement — these have been filtered out because the learner isn't producing Italian.

VOCABULARY RECOGNITION (it_en)

On it_en items, vocabulary buckets for the source-text words have been injected into bucket_context. Each is named vocabulary.it.<lemma>.translation. Fire these:
- as hits when the learner correctly conveyed the meaning of that word in their English (exact or paraphrase that captures the sense)
- as misses when the learner skipped, misread, or substituted the wrong word
- as not_attempted when the answer is empty or unrelated

This is how passive vocabulary recognition is recorded on it_en items.

BUCKET PROPOSALS

If you encounter an error that genuinely doesn't fit any of the provided bucket_context entries, you may propose a new bucket by setting bucket_proposed: true and providing proposed_parent_id (one of the existing buckets in bucket_context), proposed_label (the friendly human-readable name), and proposed_rationale (one sentence on why it's worth tracking). Use this sparingly. Prefer an existing bucket when the fit is good. Do NOT propose buckets that were excluded from bucket_context by the direction filter (e.g. don't propose production grammar buckets on it_en).

OUTPUT SCHEMA (strict JSON; no markdown, no commentary)

{
  "overall": {
    "marks_awarded": <number 0..1>,
    "marks_possible": 1,
    "summary": "<one short sentence>",
    "attempted_overall": <number 0..1>,
    "correctness_overall": <number 0..1>,
    "explanation": "<short prose explanation per Linguics house style, ~50-100 words>"
  },
  "raw_response": "<echo of the learner's attempt with annotations stripped>",
  "markpoints": [
    {
      "bucket": "<bucket id, must match one in bucket_context or be a proposal>",
      "label": "<the bucket's friendly label>",
      "attempted_credit": <number 0..1>,
      "correctness_credit": <number 0..1 or null when not_attempted>,
      "outcome": "hit" | "miss" | "partial" | "not_attempted",
      "evidence": "<the segment of the learner's attempt that supports this>",
      "expected": "<what would have been right>",
      "bucket_proposed": false
      // ... or true with proposed_parent_id, proposed_label, proposed_rationale
    }
  ],
  "notes": [
    { "kind": "false_friend" | "register_drift" | "alternative_correct" | "accent" | "other", "text": "<short observation>" }
  ]
}

ATTRIBUTION GRAIN

- attempted_credit is 1 when the learner produced a recognisable attempt at this skill, 0 when they didn't engage with it at all, fractional only in rare cases.
- correctness_credit is the proportion correct of what they attempted: 1 = right, 0 = wrong, 0.5 = partly right. Use null when attempted is 0.
- outcome is "hit" when attempted=1 and correctness=1; "miss" when attempted=1 and correctness<1; "partial" when both are between 0 and 1 in the partial range; "not_attempted" when attempted=0.

Return ONLY the JSON object, no surrounding text.`;
}

function inferDirection(item: any): "it_en" | "en_it" {
  const src = ((item.source_lang || item.source_language || "") + "").toLowerCase();
  const tgt = ((item.target_lang || item.target_language || "") + "").toLowerCase();
  if (src === "it" && tgt === "en") return "it_en";
  if (src === "en" && tgt === "it") return "en_it";
  // Character-detection fallback: Italian accented vowels in source_text
  if (/[àèéìòù]/i.test(item.source_text || "")) return "it_en";
  return "en_it";
}

function buildUserMessage(item: any, cleanedRaw: string, intent: string, annotations: Annotation[], bucketContext: Record<string, { label: string; description?: string }>): string {
  const direction = inferDirection(item);
  return JSON.stringify({
    item: {
      direction,                                          // "it_en" or "en_it"
      source_language: direction === "it_en" ? "it" : "en",
      target_language: direction === "it_en" ? "en" : "it",
      source_text: item.source_text,
      references: item.references || item.reference_translations || [],
      required_buckets: item.required_buckets || [],
      optional_buckets: item.optional_buckets || [],
      cefr_level_target: item.cefr_level_target,
      notes: item.notes,
    },
    bucket_context: bucketContext,
    learner: {
      attempt: cleanedRaw,
      intent,
      annotations,
    },
  }, null, 2);
}

/* ------------------------------------------------------------------------- */
/* Cost calculation                                                           */
/* ------------------------------------------------------------------------- */

function estimateCostUsd(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) return 10.0; // pessimistic default for unknown models
  const [inPrice, outPrice] = pricing;
  return (inputTokens * inPrice + outputTokens * outPrice) / 1_000_000;
}

function approxTokens(text: string): number {
  // Crude approximation: ~4 chars per token for Latin text.
  return Math.ceil(text.length / 4);
}

/* ------------------------------------------------------------------------- */
/* Schema validation                                                          */
/* ------------------------------------------------------------------------- */

function validateMarkerResult(r: any): { ok: boolean; error?: string } {
  if (!r || typeof r !== "object") return { ok: false, error: "not an object" };
  if (!r.overall || typeof r.overall !== "object") return { ok: false, error: "missing overall" };
  if (typeof r.overall.marks_awarded !== "number") return { ok: false, error: "overall.marks_awarded not a number" };
  if (typeof r.overall.marks_possible !== "number") return { ok: false, error: "overall.marks_possible not a number" };
  if (!Array.isArray(r.markpoints)) return { ok: false, error: "missing markpoints array" };
  for (let i = 0; i < r.markpoints.length; i++) {
    const mp = r.markpoints[i];
    if (typeof mp.bucket !== "string") return { ok: false, error: `markpoints[${i}].bucket not a string` };
    if (typeof mp.attempted_credit !== "number") return { ok: false, error: `markpoints[${i}].attempted_credit not a number` };
    if (mp.correctness_credit !== null && typeof mp.correctness_credit !== "number") {
      return { ok: false, error: `markpoints[${i}].correctness_credit must be number or null` };
    }
    if (!["hit", "miss", "partial", "not_attempted"].includes(mp.outcome)) {
      return { ok: false, error: `markpoints[${i}].outcome invalid: ${mp.outcome}` };
    }
  }
  return { ok: true };
}

/* ------------------------------------------------------------------------- */
/* Response helpers                                                           */
/* ------------------------------------------------------------------------- */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

function jsonResp(status: number, body: any): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

function errorResp(status: number, error: string, detail: string): Response {
  return jsonResp(status, { error, detail });
}

/* ------------------------------------------------------------------------- */
/* Main handler                                                               */
/* ------------------------------------------------------------------------- */

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }
    if (req.method === "GET") {
      // Simple health check
      return jsonResp(200, { ok: true, service: "linguics-marker", default_model: DEFAULT_MODEL });
    }
    if (req.method !== "POST") {
      return errorResp(405, "method_not_allowed", "Use POST /mark");
    }

    // Rate limit
    const ip = req.headers.get("CF-Connecting-IP") || req.headers.get("X-Forwarded-For") || "anonymous";
    const rl = rateLimitCheck(ip);
    if (!rl.allowed) {
      return errorResp(429, "rate_limit", `Slow down; try again in ${Math.ceil((rl.resetMs || 0) / 1000)}s`);
    }

    // Parse body
    let body: MarkRequest;
    try {
      body = await req.json() as MarkRequest;
    } catch (e) {
      return errorResp(400, "bad_request", "Invalid JSON body");
    }
    if (!body.item || typeof body.raw !== "string") {
      return errorResp(400, "bad_request", "Missing item or raw field");
    }

    const model = body.model || DEFAULT_MODEL;
    if (!MODEL_PRICING[model]) {
      return errorResp(400, "model_unsupported", `Unknown model: ${model}. Known models: ${Object.keys(MODEL_PRICING).join(", ")}`);
    }

    // Parse annotations out of the raw input
    const { annotations, cleaned } = parseAnnotations(body.raw);
    const intent = body.intent || "literal";
    const bucketContext = body.bucket_context || {};

    // Build prompts
    const systemPrompt = buildSystemPrompt();
    const userMessage = buildUserMessage(body.item, cleaned, intent, annotations, bucketContext);

    // Cost cap pre-check (estimate worst-case output)
    const estInput = approxTokens(systemPrompt + userMessage);
    const estCost = estimateCostUsd(model, estInput, MAX_OUTPUT_TOKENS);
    if (estCost > COST_CAP_PER_CALL_USD) {
      return errorResp(413, "cost_cap_exceeded", `Estimated cost $${estCost.toFixed(4)} exceeds per-call cap of $${COST_CAP_PER_CALL_USD}. Try a cheaper model or a shorter bucket_context.`);
    }

    // Diagnostic: confirm the secret is loaded. Prints to `wrangler tail` only.
    // Trim the key: trailing newlines from `wrangler secret put` paste cause
    // fetch() to silently strip the Authorization header (HTTP rejects header
    // values with control characters), producing "Missing Authentication
    // header" from OpenRouter.
    const apiKey = (env.OPENROUTER_API_KEY || "").trim();
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY is missing or empty after trim");
      return errorResp(500, "config_error", "OPENROUTER_API_KEY secret not loaded. Run `wrangler secret put OPENROUTER_API_KEY` from the worker/ directory and redeploy.");
    }
    console.log(`Key prefix: ${apiKey.slice(0, 8)}, length: ${apiKey.length}; model: ${model}`);

    // Call OpenRouter
    let apiRes: Response;
    try {
      apiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://linguics.dev",
          "X-Title": "Linguics translation marker",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: MAX_OUTPUT_TOKENS,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        }),
      });
    } catch (e: any) {
      return errorResp(502, "upstream_error", `Network error to OpenRouter: ${e.message}`);
    }

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      return errorResp(apiRes.status === 429 ? 429 : 502, "upstream_error",
        `OpenRouter ${apiRes.status}: ${errText.slice(0, 300)}`);
    }

    let apiBody: any;
    try {
      apiBody = await apiRes.json();
    } catch (e) {
      return errorResp(502, "malformed_response", "OpenRouter returned non-JSON");
    }

    const content = apiBody?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return errorResp(502, "malformed_response", "OpenRouter response missing content");
    }

    // Parse the model's JSON output
    let result: any;
    try {
      result = JSON.parse(content);
    } catch (e: any) {
      return errorResp(502, "malformed_json",
        `Model output not valid JSON: ${e.message}. First 200 chars: ${content.slice(0, 200)}`);
    }

    // Validate against our schema
    const validation = validateMarkerResult(result);
    if (!validation.ok) {
      return errorResp(502, "schema_invalid",
        `Model output failed schema check: ${validation.error}`);
    }

    // Ensure raw_response is set (model might not include it; we have authoritative source)
    if (!result.raw_response) result.raw_response = cleaned;

    // Compute actual cost
    const inputTokens = apiBody.usage?.prompt_tokens || apiBody.usage?.input_tokens || estInput;
    const outputTokens = apiBody.usage?.completion_tokens || apiBody.usage?.output_tokens || 0;
    const cost = estimateCostUsd(model, inputTokens, outputTokens);

    return jsonResp(200, {
      result,
      usage: {
        input_tokens: inputTokens,
        output_tokens: outputTokens,
      },
      cost_usd: cost,
      model_used: model,
    });
  },
};
