# AI marker backend: scope and implementation plan

The translation strand currently uses a substring-tells stub. The plan here is to replace it with a real AI marker that returns per-bucket structured attribution. This document scopes the work end-to-end so it's ready to execute when you say go.

## Architecture summary

A small serverless function holds the Anthropic API key as a secret and exposes a single `POST /mark` endpoint. The housing's `translation_stub.js` is replaced by `translation_marker.js`, which posts the item and the learner's attempt to that endpoint and renders the structured response. The function calls the Anthropic Messages API with a carefully-built prompt, validates the JSON response against the schema in DESIGN.md §5.2, returns `{ result, usage, cost_usd }` to the browser. The browser shows the cost inline under the result.

The function holds the API key; the browser never sees it. The function also enforces per-call cost caps so a single attempt can't blow the budget by accident.

## Hosting choice

**Cloudflare Workers.** Free tier covers 100,000 requests per day. Cold start under 5ms. Deployed at edge nodes globally, so latency is good for European users (probably most of your testers). Secrets management is built in via Wrangler CLI. JavaScript or TypeScript, fits the existing codebase. Free custom domain via Cloudflare DNS, or use the default `*.workers.dev` subdomain for testing.

Alternatives considered: Fly.io (free tier, full VM, more complex for this use case), Vercel (good for Next.js, heavier for a single endpoint), AWS Lambda (free tier, more setup overhead). Cloudflare Workers is the simplest fit.

You'll need a Cloudflare account (free, takes two minutes) and the `wrangler` CLI installed locally (`npm install -g wrangler`).

## API setup: OpenRouter, model-agnostic

You'll need an OpenRouter API key from openrouter.ai. OpenRouter is a multi-model gateway with one API key that lets you call DeepSeek V3, Claude (Haiku/Sonnet/Opus), Gemini Flash, GPT-4o-mini, Qwen, and 300+ others through a single OpenAI-compatible endpoint. Markup is ~5% over direct provider pricing.

The Worker will be **model-agnostic**: it accepts a `model` query parameter (or body field) and passes that through to OpenRouter, defaulting to DeepSeek V3 if none is specified. This means switching models is a no-deploy change. The housing's footer gets a small model picker so you can A/B different models per attempt.

Cost per call at current rates, for the marker prompt shape we'll be sending:

| Model | per call | 100 calls | 1000 calls |
|---|---|---|---|
| Gemini 2.0 Flash | ~$0.0005 | $0.05 | $0.50 |
| DeepSeek V3 | ~$0.001 | $0.10 | $1.00 |
| GPT-4o-mini | ~$0.0006 | $0.06 | $0.60 |
| Claude Haiku 4.5 | ~$0.004 | $0.40 | $4.00 |
| Claude Sonnet 4.5 | ~$0.013 | $1.30 | $13.00 |

**Default model: DeepSeek V3** (OpenRouter identifier: `deepseek/deepseek-chat`). Cost-quality sweet spot, reliable structured-output adherence, decent Italian competence. Fallback to Haiku 4.5 (`anthropic/claude-haiku-4.5`) if quality on tricky items isn't enough.

Important: **enable prompt caching** where the provider supports it. OpenRouter passes through Anthropic's and DeepSeek's caching mechanisms. The system prompt (containing the schema, bucket vocabulary, and marking rules) is large and stable; cached, it costs about 10% of normal input rate after the first call. With caching, repeated marker calls effectively only pay for the learner-specific portion.

## Endpoint spec

```
POST https://<your-worker>.workers.dev/mark
Content-Type: application/json

Request body:
{
  "item": { /* the translation item, see schema below */ },
  "raw": "the learner's attempt",
  "intent": "literal" | "guess" | "sense",
  "model": "deepseek/deepseek-chat"   // optional, defaults to DeepSeek V3
}

Response (200):
{
  "result": { /* the marker output, conforms to DESIGN.md §5.2 */ },
  "usage": { "input_tokens": 1532, "output_tokens": 587, "cache_hit": true },
  "cost_usd": 0.0011,
  "model_used": "deepseek/deepseek-chat"
}

Response (4xx/5xx):
{
  "error": "rate_limit" | "malformed_json" | "schema_invalid" | "model_unsupported" | "internal",
  "detail": "human-readable explanation"
}
```

The item passed in contains `source_text`, `references[]`, `required_buckets[]`, and optionally `optional_buckets[]`, `cefr_level_target`, `vocab_help[]`, `notes`. The marker uses all of these as context for the attribution.

## System prompt structure

The system prompt contains four sections, in this order:

**1. Role and task.** "You are an Italian-language teacher marking a student's translation attempt. Return a structured JSON response that attributes each part of the attempt to a specific skill bucket. Be precise; don't fabricate misses; don't conflate different errors into one bucket."

**2. The bucket vocabulary.** A list of all currently-registered buckets across the trees, in dot-id form, with their friendly labels and short descriptions. Plus the rule that the AI may propose new buckets (with `bucket_proposed: true` and the proposed parent), to be reviewed by the project author. Subset by topic if the item targets a specific area; full vocabulary for cross-cutting items.

**3. The response schema.** A precise JSON schema description matching DESIGN.md §5.2, with each field's meaning and required-vs-optional. Includes the markpoint structure (bucket, attempted_credit, correctness_credit, outcome, evidence, expected), the overall summary, and the cost-side fields.

**4. Marking rules.** Several explicit rules:
- Attempt to attribute each error to a single bucket, the most diagnostic one.
- Don't fire formation buckets when the item's diagnostic is tense choice or similar (clean separation maintained).
- Distinguish vocabulary misses (wrong word) from grammatical misses (right word, wrong form/agreement/order).
- For false friends, fire the relevant vocabulary bucket plus a note about the false friend.
- For register issues, fire the register bucket.
- Don't penalise stylistic choices when the item allows them (especially under `<f>` flair annotation or `intent: "sense"`).

This system prompt is large (~3000-4000 tokens) but stable across calls. Anthropic's prompt caching makes it effectively free after the first call.

## User message structure

```
ITEM:
  source_language: en
  target_language: it
  source_text: "She was wearing a navy blue dress."
  references: ["Indossava un vestito blu marino.", "Portava un vestito blu marino."]
  required_buckets: ["vocabulary.it.vestito.translation", "vocabulary.it.blu_marino.translation", ...]
  optional_buckets: ["vocabulary.it.indossare.translation", ...]
  vocab_help: [{ lemma: "blue", aspects: { ... } }, ...]
  cefr_level_target: A2
  notes: "Testing knowledge of compound colour invariability"

LEARNER ATTEMPT:
  raw: "lei portava la sua roba azzurra"
  intent: literal
  annotations: []  // any <g> <s> <f> tags parsed out

Mark this attempt against the schema. Return JSON only.
```

User messages are small (200-500 tokens), making each call quick.

## Worker implementation outline

A single TypeScript file (~200-300 lines). Pseudocode:

```typescript
export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    // 1. Parse and validate request body
    const { item, raw, intent } = await req.json();
    if (!item || !raw) return badRequest("missing item or raw");

    // 2. Per-call cost cap: estimate token usage, refuse if over $0.10
    const estimatedCost = estimateCost(item, raw);
    if (estimatedCost > 0.10) return tooLarge("cost cap exceeded");

    // 3. Build the messages
    const system = buildSystemPrompt(item);  // uses prompt caching
    const userMessage = buildUserMessage(item, raw, intent);

    // 4. Call OpenRouter (OpenAI-compatible API)
    const model = req.body.model || "deepseek/deepseek-chat";
    const apiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://linguics.example.org",  // for OpenRouter analytics
        "X-Title": "Linguics translation marker",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 2000,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMessage }
        ]
      })
    });

    // 5. Parse and validate the JSON response
    const apiBody = await apiRes.json();
    const result = extractAndValidateJSON(apiBody.content[0].text);
    if (!result.valid) return internalError("schema_invalid", result.error);

    // 6. Compute cost
    const cost = computeCost(apiBody.usage);

    // 7. Return
    return json({ result: result.data, usage: apiBody.usage, cost_usd: cost });
  }
};
```

Plus utility functions for the prompt building, schema validation, and cost calculation.

## Browser integration

`housing/js/translation_stub.js` is replaced by `housing/js/translation_marker.js`. The new file exposes `LL.markTranslationLive(item, raw, intent)` as an async function returning the same shape `markTranslationStub` did. The `renderTranslation` doMark handler becomes async, awaiting the marker call.

```javascript
const doMark = async () => {
  const raw = textarea.value;
  const intent = intentSel.value;
  // Show a loading spinner while the AI is thinking
  resultHost.innerHTML = '<div class="loading">Marking...</div>';
  try {
    const { result, usage, cost_usd } = await LL.markTranslationLive(it, raw, intent);
    appendVocabHelpEvents(result, vocabHelpsUsed);
    appendActiveProductionHits(result, vocabHelpsUsed, it, raw);
    const attempt = LL.store.recordAttempt("translation", it, raw, result, intent);
    recentlyChangedBuckets = new Set(attempt.events.map(e => e.bucket));
    resultHost.innerHTML = "";
    resultHost.appendChild(renderResult(result));
    resultHost.appendChild(renderCostLine(usage, cost_usd));
    renderLiveStats();
    next.focus();
  } catch (e) {
    resultHost.innerHTML = '<div class="error">Marking failed: ' + e.message + '</div>';
  }
};
```

A small cost line gets rendered under each result: `DeepSeek V3 · 1532 in, 587 out · $0.0011`. Cumulative session cost is shown in the footer. A small model picker dropdown also lives in the footer (defaults to DeepSeek V3, with Haiku 4.5 / Sonnet 4.5 / Gemini 2.0 Flash / GPT-4o-mini as alternatives) so you can switch per attempt.

## Cost display and tracking

Each marker response includes the call's cost. The browser:
- Renders the cost inline under the result panel for that attempt.
- Accumulates per-session total in localStorage.
- Shows the cumulative total in the footer next to the existing prototype indicator.
- Optionally: warn the user if a single session goes over $1 (configurable).

This gives the tester awareness of what they're spending without it being intrusive.

## Schema validation

The marker output is JSON, and we need to validate it before persisting. JSONSchema or a hand-rolled validator. The validator checks:
- Every `bucket` field references a known bucket id (or is marked `bucket_proposed`).
- `attempted_credit` and `correctness_credit` are in [0, 1].
- `outcome` is one of `hit`, `miss`, `partial`, `not_attempted`.
- The overall summary contains marks_awarded and marks_possible.

If validation fails: log the malformed response, return an error to the browser. The error path shows a user-friendly message and ideally still records the raw_response so we don't lose the attempt entirely.

## Implementation steps and time estimates

1. **Sign up for Cloudflare account, install Wrangler.** 30 minutes including DNS setup if you want a custom domain.

2. **Get an Anthropic API key.** 15 minutes via console.anthropic.com.

3. **Write the Worker.** 4-6 hours, including the system prompt construction, schema validation, prompt-caching setup, error handling. This is the substantive coding portion.

4. **Deploy and test the endpoint.** 30 minutes including initial smoke tests with curl.

5. **Update the housing.** Replace `translation_stub.js` with `translation_marker.js`. Modify `renderTranslation` to await the async call. Add cost-line rendering. About 1-2 hours.

6. **End-to-end test on real items.** Pick five or ten translation items from the existing batches, run the marker, inspect the attribution quality. 1-2 hours.

7. **Tune the prompt.** Based on attribution quality in step 6. May involve adjusting the marking rules or the bucket-vocabulary subset. 1-3 hours, depending on how good the first pass is.

**Total: half a day to a day.** Most of that is steps 3 and 7, with the rest being fairly mechanical.

## Open decisions before implementation

These are the things I'll need from you before starting:

1. **Cloudflare account ready?** Or do you want me to use a different host?
2. **OpenRouter API key.** You sign up at openrouter.ai, get a key, top up the wallet with a small amount (say $5 to start; at DeepSeek V3 prices that covers ~5000 attempts), give me the key for the Wrangler secret. Decided: OpenRouter, model-agnostic Worker, DeepSeek V3 as default with model picker in the footer.
3. **Cost cap.** Per-call refuse at $0.10? Per-session warning at $1? Different numbers?
4. **Auth on the endpoint.** Open during prototype, or shared-secret header from the housing? (Open is fine for testing with a small invited group; tighten before public release.)

## Things this plan does NOT include

The plan is for the AI marker only. Things explicitly out of scope, for clarity:

- The translation marker, not the grammar marker. Grammar still uses the deterministic substring engine and doesn't need AI.
- The vocab strand marker. Vocab translation marking is local and stays local; it doesn't need the AI backend.
- Persistent attempt storage in a database. Attempts still live in browser localStorage. A real backend with user accounts and shared attempt history is a much bigger move and deferred.
- Login / auth integration with Memoriser. Same as above; deferred.

When you nod on the five decisions above, I'll start the work. Probably I write the Worker and the housing integration; you provide the Cloudflare account and the Anthropic key; deploy is a single `wrangler deploy` command on your machine once the secrets are loaded.

## Accent policy (ruled by Smith, 2026-07-15)

An otherwise-correct translation containing accent-only errors (missing, added, or wrong-mark accents; apostrophe-for-accent slips) is DEDUCTED A LITTLE, always - it must never score as a full-credit equal of the accent-perfect answer, and never fail outright on accents alone. Implementation: score the translation as if accents were correct, then apply a small fixed deduction (house texture: the 0.9 multiplier used for pattern-dodges) once per answer (not per accent error), and NAME each accent error in the feedback ("perché carries an acute accent"). This aligns the third grader with the estate: vocab EN→IT deducts 50% (strictest, ruled and stands), the substring grammar marker credits-and-classifies via the orthography split, the AI marker deducts-a-little-and-names. Registered in inter_chat/Architecture_Housing_ai_marker_accent_policy.md.
