# Linguics translation marker (Worker)

A Cloudflare Worker that proxies translation-marking requests to OpenRouter and returns structured JSON. The default model is GPT-4o-mini; callers can override it per request for controlled comparisons.

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
{"ok":true,"service":"linguics-marker","build":"2026-08-22-r180-compact-v3-vocab-evidence","default_model":"openai/gpt-4o-mini","default_response_contract":"legacy_v1","supported_response_contracts":["compact_v3","compact_v2","legacy_v1"],"max_output_tokens":6000}
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

- Learner-path per-call cost cap: $0.03 (refuses calls projected over this).
- An explicit benchmark request may raise that ceiling, but the Worker hard-clamps it at $0.25 per call.
- Rate limit: 60 requests per minute per IP (in-memory; per-edge).
- Default model is GPT-4o-mini; the Worker reports the deployed default and supported output contracts in its health response.
- Learner calls default to `legacy_v1`. `compact_v2` remains available only when a caller explicitly requests it; the first paid probe confirmed its cost win but not yet quality parity.
- Experimental `compact_v3` keeps aliases and tuples but replaces evidence-token indices with exact learner substrings that the Worker verifies locally. It is opt-in while paid comparison is underway.
- The housing's footer tracks cumulative session cost in localStorage.

Constants are at the top of `src/index.ts` if you want to tune them.

## Cost monitoring on OpenRouter

Visit https://openrouter.ai/activity to see usage. You can set hard spending limits on the API key from the dashboard. Recommended: set a $10 monthly cap to start.

## Endpoint authentication

Open during prototype (anyone can call). The cost cap and rate limit are the only protections. Acceptable for an invited-tester deployment because cost exposure is bounded.

For public release, add a shared-secret header check: edit `src/index.ts` to require an `X-Linguics-Key` header matching a Wrangler secret, and have the housing send it on every call.
