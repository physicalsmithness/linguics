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

**REWRITTEN 2026-08-05 at the end of the r124-r139 session.** The seat is NOT empty
and the section below (from 08-03) is now history, kept for its routing.

### THE GOLDEN RULE, corrected by Smith 2026-08-06

**No-scrolling was never the rule.** It was a symptom, and chasing it as a rule is
what starved the card. His words: *"I don't mind if it scrolls. Scrolling is better
than clipping off things so you can't see them — way better."* The real rules:

1. **The card and its feedback must be usable.** *"That is the absolute number one
   thing... it's unusable as it is. It's broken."*
2. **Don't make the page taller than a normal screen.**

Where they fight, the card wins and the page scrolls.

### YOU CAN MEASURE THE LIVE PAGE — do it before you theorise

No headless browser installs in the sandbox (no root, chromium download off-
allowlist), **but the Claude-in-Chrome MCP drives Smith's own browser.** Navigate to
the live site, inject candidate CSS with a `<style>` tag, and read
`getBoundingClientRect()` / `scrollHeight`. One pass found four faults that three
sessions of reading had missed — including a 335px constant in `app.js` that had
been quietly defeating every "shrink the frequency square" request.

### r140 (2026-08-06) changed the rules on two of these

**The top-bar arithmetic is over.** `#vocab-body` no longer carries a hard-coded
subtrahend. `measureChrome()` writes `--chrome-h` from the real header + footer +
main padding on load, resize, `fonts.ready` and every strand change. If you move a
band, change nothing else. The old `min-height: 460px` is gone with it.

**Never guess a pixel height in prose.** There is no headless browser in the
sandbox — no chromium, no playwright, no puppeteer — so any height you state is an
estimate from font sizes and padding. Say so, or make the browser measure it.

**Smith's prose rules (2026-08-06), all three:**

1. **Name the build number at the top of every report.** This reverses the older
   "never cite a build number at him" note — he needs both: the id stated plainly
   so he knows which one he is looking at, and the check-list in plain words.
2. Label every paragraph as *problem*, *current behaviour* or *proposal*. He could
   not tell which was which and said so.
3. End each round with a list of **the things you are not sure appear**, and with
   anything he was asked to check and has not yet.

### Read these three first

1. **The vocab page still scrolls.** It must not. Everything else in the layout is
   decoration until this is true. Two of my own fixes caused it in turn: an `auto`
   question row made the layout jump when you answered, and the `min-height` I used
   to stop the jump forced the body taller than the viewport. The lesson, paid for
   twice: when a region must both never move and always fit, use a FIXED track and
   put the variable content in a scrollbox inside it. Never re-tune the track.
2. **The top bar still wants a band removed**, and the feedback area still has no
   room - worst on the translation card, where the result falls off the bottom.
   Smith's own instruction: kill Intent/Guess/Sense/Flair if unused, push it all up.
3. **The gender panel flashes on recognition cards** (found in Smith's last message,
   NOT fixed). See the queue entry - and check whether the STATISTICS are
   contaminated too, not just the flash.

### The design, as Smith has ruled it

Quadrant layout, REAL components, nothing redesigned: question top-left, the real
frequency square bottom-left, the real themes column down the right (scrolling,
sticky heading), and gender/spelling/accent/stress in a reserved bottom-right strip
as COMPRESSED panels with hover names, any one expandable UPWARDS into the themes.
A drill entering makes its own breakdown dominate. The scrub rail slides and moves a
different thousand into principal focus. All filters - including anything chosen on
the entry screen - are ONE state object that both screens write and every panel
reads, shown as removable chips with provenance, with boxes round the in-scope theme
and frequency block. Mockups: `mockups/vocab_redesign/vocab_redesign_v2.html`.

### Unbuilt

The scrub rail; the unified filter object + scope chips; the spelling/accent/stress
mini-panels (gender is the ONLY axis section that exists - those three are new
builds, not moves); the stale "N touched" caption (the dots update live, the caption
only on a full rebuild).

### How Smith wants to be talked to

Ship plenty per round, not one change at a time. But NEVER cite a build number at
him - "don't refer to r135 and expect me to know what r135 is". Give a NUMBERED
check-list in plain words describing what to look at and what should happen.

---

## 5b. The 08-03 picture, kept for its routing

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
