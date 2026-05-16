# Linguics translation marker (Worker)

A Cloudflare Worker that proxies translation-marking requests to OpenRouter and returns structured JSON. Default model is DeepSeek V3 (cheap, ~$0.001 per attempt); model can be overridden per request for A/B comparison.

## One-time setup

Prerequisites:

- Node.js installed (https://nodejs.org, LTS)
- A Cloudflare account
- An OpenRouter account with credit and an API key

Steps:

```
# Install the Wrangler CLI globally
npm install -g wrangler

# Log in to Cloudflare (opens a browser tab)
wrangler login

# From this directory, install dependencies
cd worker
npm install

# Set the OpenRouter API key as a secret (you'll be prompted to paste it)
wrangler secret put OPENROUTER_API_KEY
```

The secret is encrypted at rest in Cloudflare and never appears in source or logs.

## Deploy

```
wrangler deploy
```

Wrangler prints the deployed URL, something like `https://linguics-marker.<your-subdomain>.workers.dev`. Copy that URL; the housing needs it.

## Verify

A simple GET to the URL returns a JSON health check:

```
curl https://linguics-marker.<your-subdomain>.workers.dev
{"ok":true,"service":"linguics-marker","default_model":"deepseek/deepseek-chat"}
```

To test a mark call (replace the URL):

```
curl -X POST https://linguics-marker.<your-subdomain>.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "item": {
      "source_text": "She was wearing a navy blue dress.",
      "source_language": "en",
      "target_language": "it",
      "references": ["Indossava un vestito blu marino."],
      "required_buckets": ["vocabulary.it.vestito.translation", "vocabulary.it.blu_marino.translation"]
    },
    "raw": "lei portava la sua roba azzurra",
    "intent": "literal",
    "bucket_context": {
      "vocabulary.it.vestito.translation": { "label": "vestito (translation)", "description": "Italian for dress" },
      "vocabulary.it.blu_marino.translation": { "label": "blu marino (translation)", "description": "Italian for navy blue" }
    }
  }'
```

You should see a JSON response with `result`, `usage`, `cost_usd`, and `model_used`.

## Local dev

```
wrangler dev
```

Runs the Worker on http://localhost:8787 against the live OpenRouter API (uses your secret). Useful for iterating on the system prompt without deploying.

## Logs

```
wrangler tail
```

Live-tails the Worker's console output. Useful for debugging in production.

## Cost protection

- Per-call cost cap: $0.03 (refuses calls projected over this).
- Rate limit: 60 requests per minute per IP (in-memory; per-edge).
- Default model is the cheapest reliable one (DeepSeek V3 ~$0.001/call).
- The housing's footer tracks cumulative session cost in localStorage.

Constants are at the top of `src/index.ts` if you want to tune them.

## Cost monitoring on OpenRouter

Visit https://openrouter.ai/activity to see usage. You can set hard spending limits on the API key from the dashboard. Recommended: set a $10 monthly cap to start.

## Endpoint authentication

Open during prototype (anyone can call). The cost cap and rate limit are the only protections. Acceptable for an invited-tester deployment because cost exposure is bounded.

For public release, add a shared-secret header check: edit `src/index.ts` to require an `X-Linguics-Key` header matching a Wrangler secret, and have the housing send it on every call.
