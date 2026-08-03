# HOUSING — read this first

Written 2026-08-03 at the end of the r90→r116 session, because the handover I
received was a chat transcript whose task list was wrong in both directions and
whose thread `Next:` lines were stale. This is the thing I wish I had had.

`_status/Housing.md` below is the long record: one enormous `summary:` line
carrying prior seats' history, then a reverse-chronological `queue:`. It is a
log, not a briefing. This is the briefing.

---

## 1. Before you touch anything

**Derive state from disk, in the same turn you speak about it.** Do not quote a
build number, a thread status, or an item count from a transcript or from
memory. Three separate things went wrong tonight because someone did:

- the handover transcript listed 5 open threads; all 5 were closed;
- it also said "the r64–r90 stack is unpushed" five minutes *after* the push;
- and `_status` said the residue engine awaited Architecture's go; it was live.

**Sweep threads on the `Next:` line, never on the filename.** I triaged
`inter_chat/*Housing*.md` and missed five threads addressed to Housing living
under another chat's name — including a one-line ask standing since 21 July,
which turned out to be 17 items that had never once been served to a learner.

**A thread whose header says `Next: Housing` may be finished.** Read the last
version section and see who wrote it. Four threads tonight were done and
unstamped; a fresh seat would have rebuilt working code from three of them.

---

## 2. Run these three before you push, and after you build

| command | what it protects |
|---|---|
| `python3 tools/preflight.py` | every JS file and inline `<script>` parses; the worker **compiles with its real exit code**; the prompt literal has no raw backticks |
| `python3 tools/content_check.py` | content the engine cannot act on: unregistered buckets, it_en floors, duplicate ids, out-of-range answers, unanchored nesting phrases |
| `/housing/selftest.html` (served) | engine behaviour: every case names the silent fault it guards |

`tools/bump_build.py [id]` bumps `LL_BUILD` **and** every `?v=` cache-buster in
index/bench/selftest together, and refuses to stamp a build that fails preflight.
Use it rather than editing the build id by hand.

**Why preflight exists.** `worker/src/index.ts` did not compile from 2026-07-29
to 2026-08-02 — rule 13 put raw backticks inside the system-prompt template
literal. For four days every "just run `wrangler deploy`" was undeployable, and
nobody knew, because the checks in use were "braces balanced" (true of broken
code) and an `esbuild` piped into `tail`, so the shell read *tail's* exit status.
**Never pipe a compiler into anything.**

---

## 3. Engine facts that cost real bugs to learn

- **A positive `any_phrases` match beats `must_not_include`.** The guard is
  else-if gated, so a correct string nested inside a wrong one is credited and
  the guard never runs. An additive error therefore cannot be caught by a guard —
  it needs a widened phrase or an index-scored item.
- **`match_at` is per-phrase.** A markpoint-level one is now honoured as a
  *default* (r116); before that it was silently discarded, and 64 markpoints
  across 32 items were scoring `"hoparlato"` as full marks.
- **`norm()` folds apostrophe and hyphen to a space** and collapses whitespace.
  Short fragments nest: `sta` sits inside `stava`.
- **The residue engine is live** and fires on single-markpoint, non-MCQ items
  only, subtracting words the prompt supplied. It is what stops `sta` being
  credited inside `stava`.
- **Pure logic belongs in `js/engine_axes.js`**, not `app.js`. Anything that
  decides what gets *recorded* should be reachable without booting the UI.

## 4. Marking facts

- The marker runs at **temperature 0** (it ran at 1.0 until r96; spread exceeded
  the mean, and every event written before that carries the noise).
- `bucket_context` is built **client-side**, so menu changes ship on a **push
  alone** — no deploy. Six menu modes, `LL.setMarkerMenuMode()`.
- The per-call cost cap is $0.03 by default, raisable per call via
  `max_cost_usd`, clamped to a hard $0.25. At $0.03 most current models are
  refused on the larger menus before the model is ever called.
- **Latency tracks output tokens, not input.** More breadth = more writing =
  slower. A smaller menu will not make it faster; a faster model will.

---

## 5. What is on Housing right now

**Nothing.** Every open item names someone else:

- **Architecture** — mint `phonology` (12,446 stress items fire into a tree that
  does not exist) or rule stress out of coverage; mint `verb_form` or null its
  11 orphan `parent_id`s; rule the 23 never-targeted leaves; rule the it_en floor
  question (190 of 257 items have their whole floor deleted by the direction
  filter); rule `inserted` accent docking; the `verb_identity` descriptor for A7;
  the menu size, once a clean sweep exists.
- **Vocab** — the class 5 / class 7 boundary (uovo, dito); populate
  `alternatives`; 3,384 entries have no `translation_en`.
- **MisconceptionAnalyst** — mark the `mirror_of` pairs so B6 can be built.
- **Smith** — push r90→r116, `wrangler deploy`, and the live-verifies.

## 6. Standing habits

Report what a ruling *says*, not that it happened. End a working round with a
per-chat routing report. Stamp a thread the moment its ask is met — an unstamped
finished thread reads as work. And when a check disagrees with what you expect,
the check is usually right: three of tonight's findings were bugs in my own work
from earlier in the same session, each caught by measuring instead of asserting.
