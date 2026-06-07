# Operating model for multi-chat AI-collaborative projects

A portable description of how to run a project that uses several specialised AI chats coordinated by one human routing node. Distilled from running the Linguics Italian-learning project (~10 chats over several months). Generic and project-shape-agnostic; the role names and conventions should map to any project that fits the underlying pattern.

---

## When this model applies

You probably want this protocol if:

- One human (the project owner) coordinates several AI chat conversations.
- The work is large enough that no single chat can hold the whole project in context.
- Different parts of the work are different kinds: design decisions, implementation, content authoring, data pipelines, analytics.
- The chats can't talk to each other directly; the human is the routing node.
- The project lives in a shared folder that all chats can read and write to.

If your project is small enough that one chat can carry it, you don't need this. If your project is too large for one human to coordinate, this model still doesn't quite scale (you'd need more routing humans or richer protocols).

---

## Chat roles

A typical role distribution. Names below are suggestions; the structure matters more than the labels.

**Architect chat.** Owns design documents, ratifies decisions between other chats, mediates disputes, issues briefs and dispatches. Does NOT write production code or author substantive content. Writes contracts and rulings.

**Implementation chat.** Builds the user-facing deliverable (web app, document, model — whatever your project ships). Reads architect rulings and applies them. Reports back on what was built. Often the most code-heavy chat.

**Content / author chats.** One per content domain. Produces the substantive material the project is about (questions, articles, data entries, code modules). Each authors against a brief written by the architect. You can have many of these.

**Infrastructure / pipeline chat.** Builds data pipelines, scripts, automations. Often distinct from the user-facing implementation; lives at a lower level of the stack.

**Analytics / measurement chat.** Builds whatever measurements the project needs (coverage statistics, mastery metrics, quality scores). Usually emerges as the project matures and people want to know "how are we doing".

You don't need all of these from day one. Start with architect plus one content authoring plus one implementation chat. Add others as needs emerge. If a chat's job grows too big, split it; if two chats' jobs blur, merge them.

---

## Inter-chat protocol

The single most load-bearing convention in this model. Chats can't talk to each other directly. They talk via shared versioned files. The human routes who reads what when.

### Folder

- `inter_chat/` at the project root. Gitignored so chat-thread artefacts don't leak into the public repo.

### Filename

- Pattern: `<ChatA>_<ChatB>_<topic>.md` with the two chat names alphabetised.
- One file per chat-pair per topic. Don't conflate multiple topics in a single file; start a new thread per topic.
- Examples: `Architecture_Implementation_render_bug.md`, `Architecture_ContentAuthor_dispatch.md`.

### Versioning inside the file

- Filename stays stable across the entire conversation.
- Internal sections: `## v1, YYYY-MM-DD, <Author chat>`, `## v2, YYYY-MM-DD, <Other chat>`, etc.
- Header at top of file:

```markdown
# <ChatA> ↔ <ChatB>: <topic>

**Status:** OPEN | CLOSED (with brief reason)
**Current version:** vN
```

- Status moves to CLOSED when the thread's question is resolved. Reopen by appending a new version section and changing status back to OPEN.

### Routing

1. The author chat writes the file. Summarises in chat to the human, asks human to route to recipient.
2. Human opens the recipient chat, says "go look at `inter_chat/<file>.md`".
3. Recipient chat reads, responds by appending a new `## v(N+1)` section to the same file. Bumps the **Current version:** marker.
4. Author chat (or another chat as appropriate) reads the response next time the human routes them back. The "check for replies at start of each turn" habit handles this.

### Communication discipline

- **Write the file. Don't paste blurbs into chat for the human to copy.** The human routes by saying "look at the file"; that's enough.
- **Always summarise in chat what was added to a file**, with push-backable points flagged. The human needs to see what's been written on their behalf without opening the file every time.
- **When making rulings on the user's behalf, spell out each ruling's substance in plain language**, not just verbs like "ratified" or "closed". Use friendly category labels, not internal codes.

---

## Architect chat operating rules

The architect is delegated authority to make rulings between chats, but the human retains visibility and can override anything.

### Threshold for consulting the human

Roughly three tiers, in increasing autonomy:

- **Architectural decisions, schema changes, brief edits, new categories or buckets that affect future content** → preview the substance in chat, get a nod before committing.
- **Tactical decisions inside an existing rule (small clarifications, choosing between sensible defaults, applying a precedent)** → make the call, report the substance, allow override after the fact.
- **Closing threads with no new ruling (acknowledging good work, confirming a self-closed thread)** → just do it, summarise briefly.

When uncertain, lean towards consulting. The human should never feel surprised by something the architect committed to.

### Reporting substance, not status

After any architect-side write, the in-chat report to the human must:

- Name the file written.
- Describe each ruling in plain language with the practical consequence (what changes downstream, who has to do work, what gets retrofitted).
- List the rulings most likely to want pushback, ordered by size.
- NOT just say "I ratified the proposal" or "I closed the thread" or "I made six rulings". Those hide the substance and prevent the human from spotting anything off the rails.

The temptation to summarise grows with the number of rulings. Resist it. A 7-thread engagement round needs a 7-block substance report.

### Routing call after each pass

At the end of any architect-side pass (a coherent round of inter_chat writes, brief edits, or new threads):

- List which chats need to be opened up and pointed at their new content.
- List which threads are still pending from prior passes for FYI.
- Note which chats have nothing new.

The human uses this to decide who to route next. Without the routing call, the human has to guess from the filesystem.

---

## Project documents at the root

Beyond `inter_chat/`, the architect chat maintains canonical project docs at the project root. Other chats read these as the source of truth for cross-cutting facts.

| File | Purpose |
|---|---|
| `PROJECT.md` | What this project is and why. One page; high-level. |
| `DESIGN.md` | How the system fits together: architecture, data model, key algorithms. Living document; edit when the design changes. |
| `DECISIONS.md` | Append-only log of rationales. Each entry: date, decision, `**Why:**` line, optional `**How to apply:**` line. Never rewrite past entries; mark SUPERSEDED if amended. |
| `OPEN_QUESTIONS.md` | Things deliberately not decided yet. Each entry: question, options, why it isn't decided, what would trigger a decision. When resolved, move to DECISIONS.md. |
| `ROADMAP.md` | Current milestones and rough order. |
| `<ROLE>_BRIEF.md` | One per non-architect role that authors substantive content (e.g. `AUTHOR_BRIEF.md` for content chats, `IMPL_BRIEF.md` for the implementation chat). Versioned; revision marker at the top; full change log in DECISIONS.md. |
| `INTER_CHAT_PROTOCOL.md` | This protocol, instantiated for the project. Every chat reads it once before working. |

Sub-folders:

- `data/` for content files, schemas, outputs from pipelines.
- A folder per major implementation surface (e.g. `frontend/`, `backend/`, `housing/`, `worker/`).
- `tools/` for scripts, pipelines, helpers.
- `inter_chat/` for shared threads, gitignored.

---

## File-tool caveats

A few practical lessons from running multiple chats writing to a shared filesystem.

### Don't put the active project on a cloud-sync drive

OneDrive, Google Drive, Dropbox-style sync layers race with active writes. When multiple chats edit the same file in succession, sync conflicts and partial-write artefacts appear (files truncated mid-write, NUL padding appearing past the end-of-file marker). The fix: project lives on a truly local path; back up via `git push` to a remote, not via cloud sync. Cloud sync is for documents that change occasionally; not for actively-edited project trees.

### Atomic-write defensively

Curator chats writing data files should use the `tmp + fsync + os.replace()` atomic-write pattern. Add a defensive `rstrip('\x00')` (or equivalent) before write — trailing NUL padding has shown up multiple times from sources we never definitively identified.

The implementation chat's fetch/load layer should also defensively trim trailing whitespace and NULs before parsing JSON or similar. Two-sided defence: the author side prevents the problem if possible, the reader side recovers if it leaks through.

### File truncation can happen silently

Watch for data files getting truncated mid-write, especially after a series of rapid edits. Validate syntactically after writes (run a JSON parser, check line counts, run `node -c` on JavaScript). Recovery is via git history or by re-running the script. Don't trust "successfully written" reports without a syntactic check on important files.

---

## Memory and context conventions

Each chat has its own context. To survive across sessions and across resets:

- **Project-wide facts** go in `DESIGN.md` / `DECISIONS.md` / `OPEN_QUESTIONS.md` (every chat reads these).
- **Per-chat agent memory** (Cowork memory, Claude Code memory, or equivalent) for chat-specific facts: role description, recent context, preferences the human has expressed to this chat.
- **The architect's memory** should hold the operating-rule preferences of the human (consultation threshold, reporting style, routing convention, naming preferences, style rules like "no em-dash-space" or whatever).

When a chat is woken up after a long pause, the first thing it should do is re-read `INTER_CHAT_PROTOCOL.md` and any open threads in `inter_chat/` addressed to its role. This recovers the current state of the project's rules and any in-flight work.

---

## Common patterns

### Dispatch packets

When the architect wants a new content batch authored, they write a dispatch packet for a fresh chat:

- The role's brief (canonical rulebook)
- Topic-specific notes (scope, coverage target, hot spots, cross-references)
- Relevant data files (bucket trees, schemas, existing content for reference)

The author chat consumes these and returns the content per the brief's schema. Pattern repeats for every new content domain.

### Retrofit asks

When a rule changes mid-project, the architect opens a retrofit thread to each affected chat asking them to audit their batch and apply the new rule. Common pattern; expect it several times in a project's lifecycle.

The retrofit thread should include: the rule change with worked example, the scope (which items/files affected), what specifically to do, how to report back.

### Audit-with-substance reports

When a chat reports back on a batch of work, it should give counts AND substance. Not "30 items revised", but "30 items revised; the X family collapsed cleanly; one borderline case in the Y family kept multi-slot because Z; here are 3 specific cases flagged for spot-check". Same discipline as the architect's substance-reporting rule, applied by content chats to their own work.

### Status-of-the-world reports

Periodically, the architect (or a content chat) writes a current-state summary across their domain. Useful when starting a new sub-project ("where are we?") or before a long pause ("what should the next session pick up?"). Often saved as a `STATUS_2026-MM-DD.md` file at the root for the human's reference.

---

## Adapting to other project shapes

The protocol above is portable but the role distribution should match your project's shape:

- A research project might have architect + literature-review chat + analysis chat + writing chat.
- A software project might have architect + frontend chat + backend chat + ops chat + design chat.
- A book project might have architect + chapter author chats + editor chat + factcheck chat.
- A data product might have architect + ingestion chat + transformation chat + visualisation chat + analytics chat.

The architect role and the inter-chat protocol generalise unchanged; the other chats are domain-specific. Start small (architect + 1-2 others), grow as needed.

The single biggest predictor of success is the human staying disciplined as the routing node. Don't try to do the architect's job yourself (the architect is delegated for a reason), but don't delegate routing either (the human is the only one who can see the project across all chats). The protocol works when the human routes deliberately and the architect reports honestly.

---

## Things that go wrong, and how

A few failure modes observed and how to recognise them:

- **Architect drift.** The architect makes too many tactical calls without reporting substance. Symptom: the human starts feeling out of the loop. Fix: re-up the substance-reporting discipline, possibly tighten the consultation threshold.
- **Stale chats.** A chat hasn't been routed in days; the human doesn't know what state it's in. Fix: routing call should mention "no new content for X, Y, Z" so the human knows which chats are dormant.
- **Folder confusion.** A chat is connected to a stale folder (e.g. an old project copy) and writes invisibly. Fix: include "confirm your folder is `<path>`" at the top of important threads; periodically audit for files in unexpected places.
- **Convention drift across chats.** Different chats use slightly different conventions for the same thing (e.g. different bucket-id shapes, different file-naming patterns). Fix: catch in code review or audit; codify in the brief.
- **Memory contradicting current state.** A chat acts on stale memory and produces wrong work. Fix: chats should sanity-check memory against current files before acting on remembered facts.
- **Two chats trying to be the same role.** Easy to spawn duplicates accidentally. Fix: name chats explicitly by role; the human should be able to list which chat is which at any time.

---

## A starter file set for a new project

When starting a new project under this model, the architect chat should create these files in the first session:

1. `PROJECT.md` (what and why)
2. `DESIGN.md` (initial sketch; will grow)
3. `DECISIONS.md` (empty with header)
4. `OPEN_QUESTIONS.md` (empty with header)
5. `ROADMAP.md` (initial milestone list)
6. `INTER_CHAT_PROTOCOL.md` (this document, tailored to the project's role names)
7. `inter_chat/` (empty folder)
8. `.gitignore` with `inter_chat/` and any other working-thread file patterns excluded
9. Any role-specific briefs the project will need (one per non-architect role)

That's the seed. Everything else grows organically as the work proceeds.

---

This document is portable. Copy it to a new project, adapt the role names and the brief structure to fit, and the operating model carries over. The lessons that took a few months to learn the hard way are encoded here; reading it should save the next project at least one round of pain on each.
