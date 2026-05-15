# Linguics &middot; housing prototype

Static-site prototype for Linguics (Italian). No build step, no backend, no API key needed. Opens directly in a browser via `file://`.

## What's here

- `index.html` &mdash; the entry page. Four strands (Grammar, Translation, Stats, Buckets) selectable via nav.
- `css/style.css` &mdash; minimal editorial styling.
- `js/norm.js` &mdash; normalisation pre-pass, ported from the PreIB physics engine. Includes Italian accent-input handling.
- `js/grammar_engine.js` &mdash; deterministic substring marker, emits the two-dimensional `attempted_credit` and `correctness_credit` per markpoint. Binary in v1.
- `js/translation_stub.js` &mdash; **stub** for the AI marker. Uses per-item `markpoint_tells` substring rules to fake a sensible response. In production this is replaced by an Anthropic API call returning the schema in DESIGN.md &sect;5.2.
- `js/store.js` &mdash; bucket / question / item registry, attempt persistence to localStorage.
- `js/app.js` &mdash; UI controller. Renders the four strands, wires events.
- `data/sample_buckets.js` &mdash; a small subset of the bucket trees, exposed as `window.LL_BUCKETS`.
- `data/sample_grammar_questions.js` &mdash; three sample questions.
- `data/sample_translation_items.js` &mdash; two sample translation items.

## How to use

Two options:

**A. Quick look (inline samples).** Open `index.html` directly in a modern browser. You'll see three sample grammar questions and two sample translation items working end-to-end. The footer says "Inline samples".

**B. Real content (full authored batches).** Serve the project over http and the housing will pull the canonical JSON files from `../data/`:

```
cd "C:\Users\patri\OneDrive\Documents\Claude\Projects\Language Learning"
python -m http.server 8000
# then open http://localhost:8000/housing/
```

Once it loads, the footer should say "Real content: 134 grammar, 30 translation, ~100 buckets" (or whatever the current counts are). The live stats panel will show the entire bucket tree, with cells filling as you attempt questions.

**Layout.** Two columns. Left = the active strand (grammar / translation / buckets-browse). Right = live stats: the full bucket tree with two-dimensional cells (hue = correctness, fill-width = attempted-rate). The right panel is always visible, scrolls independently, and updates after every Mark. Cells flash amber for the buckets that just changed.

**Keyboard.** Enter to mark. After marking, focus moves to Next, so Enter advances. In translation, Shift+Enter for an explicit newline; plain Enter marks.

Try:

1. **Grammar strand**: submit `rossa` to the first question (correct). Submit `rossi` to see `must_not_include` fire as attempted=1 / correctness=0. Type `e'` for the accent shortcut and watch the apostrophe rewrite live to `è`.
2. **Translation strand**: translate "My sister went to the market yesterday." Try with the intent toggle and with inline annotations (select a word, click Guess / Sense / Flair). One item also demos the bucket-proposal flow.
3. **Bucket tree (browse)**: drillable taxonomy with descriptions and CEFR-importance pips. Change your level in the footer; pips recolour.
4. **Live stats panel (right)**: watch the cells fill as you submit attempts. Tick "only touched" to filter to buckets that have events; leave it unticked to see the whole tree from the start.

## Swapping in real content

When the author chats return real bucket trees, grammar questions, and translation items:

- Replace the contents of `data/sample_buckets.js` with the union of `data/buckets/*.json` exposed as `window.LL_BUCKETS = [...]`.
- Replace `data/sample_grammar_questions.js` similarly with the authored question array.
- Replace `data/sample_translation_items.js` similarly. Drop the `markpoint_tells` field (it's a prototype-only crutch); the real AI marker doesn't need it.

The structure of each file is just `window.LL_X = [...];` so the page picks it up on next reload.

## What's stubbed and what's real

| Component | Real | Stubbed |
|---|---|---|
| Bucket loading | yes (inline JS globals) | &mdash; |
| Bucket tree rendering | yes | &mdash; |
| Grammar marker | yes (substring engine) | &mdash; |
| Accent input UX | yes (buttons + apostrophe shortcuts) | &mdash; |
| Accent-folded fallback marking | yes | &mdash; |
| Translation marker | &mdash; | stub via `markpoint_tells` |
| Bucket-proposal flow (drafts) | yes (collected in localStorage) | &mdash; |
| Per-bucket stats | yes (recency-aware) | decay halos not yet rendered |
| Inline annotations on translation | UI buttons + bracket syntax | semantics only respected by a real AI marker |

## Next moves

1. Wire `translation_stub.js` to a real Anthropic API call. Likely path: a small serverless function (Cloudflare Worker / Fly.io machine) that holds the API key, accepts `{item, raw, intent}` and returns the schema. The browser calls the function.
2. Replace the inline JS data files with a small import pipeline from Google Sheets (per DESIGN.md &sect;6).
3. Add the decay halos and the level-weighted rollup to the stats view.
4. Wire up the OAuth login (shared client with memtool).
