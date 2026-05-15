# Linguics

Italian, atomised. A three-strand language-learning website built around a granular bucket taxonomy: every mistake the system records goes into a named bucket, and per-bucket history shows what a learner is getting right or wrong over time.

This is the working repo for the project. The live prototype is in [`housing/`](./housing/) and the design documents live alongside.

## What's where

- [`PROJECT.md`](./PROJECT.md): what the project is and why.
- [`DESIGN.md`](./DESIGN.md): architecture, data model, marking algorithms, AI prompting structure.
- [`DECISIONS.md`](./DECISIONS.md): the rationale log. Read before reversing a decision.
- [`OPEN_QUESTIONS.md`](./OPEN_QUESTIONS.md): things deliberately not yet decided.
- [`ROADMAP.md`](./ROADMAP.md): what gets built, in what order.
- [`AUTHOR_BRIEF.md`](./AUTHOR_BRIEF.md): the brief that goes to author chats for content production.
- [`data/buckets/`](./data/buckets/): the canonical bucket trees (adjective agreement, passato prossimo).
- [`data/`](./data/): authored question / item batches and bucket-suggestion proposals.
- [`housing/`](./housing/): the working prototype. Open `housing/index.html` directly for a quick look, or serve over http for the full content.

## Trying the prototype

### Quick look (local file)

Open [`housing/index.html`](./housing/index.html) directly in a browser. You'll get the inline samples (a few grammar questions and translation items) running end-to-end against the deterministic grammar engine and the stubbed translation marker.

### Full content (local server)

```
python -m http.server 8000
```

Then open `http://localhost:8000/housing/`. The housing fetches the canonical content files (~130 grammar questions, 30 translation items, ~95 buckets) and the cells in the live stats panel start filling up.

### Hosted demo (GitHub Pages)

If this repo is on GitHub, enable Pages (Settings → Pages → Source: deploy from `main`, root). The site will appear at `https://<your-username>.github.io/<repo-name>/`. The root redirects to `housing/`, fetch loads the full canonical content from `data/`, and everything works the same as the local-server flow but over https.

## Interacting

- Type your answer; Enter to mark, Enter again to advance.
- Italian accents: on-screen buttons, or apostrophe shortcuts (`e'` → `è`).
- Stuck on vocab? Click the help button (or press `/`) for a per-word reveal. Each help is recorded as a miss against the appropriate vocab bucket, so the learner's gaps are tracked separately from the grammar skill being tested.
- Translation has inline annotations: highlight a word and tag it `<g>` (guess), `<s>` (sense), or `<f>` (flair).
- The right-hand panel shows the live bucket tree. Green intensity is correct/attempted; blue intensity is correct/total events. Last-N strip shows the most recent events as `✓` (green) and `✗` (red). White means untouched.
- localStorage holds your attempt history. Clear it from devtools to start over.

## Status

This is a research prototype. The translation marker is currently stubbed (returns canned per-markpoint responses driven by substring tells in each item). When the Anthropic API backend lands, the stub will be replaced with a real call.

Login isn't wired up yet; everything is per-browser localStorage. Authoring is also offline (questions and items are produced by separate chats and committed to `data/`).
