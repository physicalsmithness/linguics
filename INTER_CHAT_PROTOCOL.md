# Inter-chat communication protocol

Read this once before working on Linguics, then apply. Every chat (architecture, housing, vocab, code, coverage, per-topic author chats) follows it.

## The rule

The user routes between chats. Chats don't talk to each other directly. When chat A has something to say to chat B (a ruling, a brief, a piece of feedback, a question, a reply), chat A writes it to a **shared versioned file** in `inter_chat/`. The user then directs chat B to read that file. When chat B responds, it writes its response into the SAME file as a new version section.

## File location and naming

All inter-chat conversation files live in `inter_chat/`. The directory is gitignored so chat-thread artefacts don't leak into the public repo.

Filename pattern: `<ChatA>_<ChatB>_<topic>.md`, with chat names **alphabetically sorted** so the from/to direction doesn't matter. Examples:

- `Architecture_Vocab_marker_semantics.md` (architect ↔ vocab on marker semantics)
- `Architecture_Housing_bucket_id_shape.md` (architect ↔ housing on bucket-id shape)
- `Code_Vocab_translation_pipeline.md` (code ↔ vocab on the translation pipeline)
- `Architecture_PronounAuthor_dispatch.md` (architect ↔ pronoun author chat on dispatch)

One file per chat-pair per topic. Don't conflate multiple topics in one file; start a new thread for each topic.

## Versioning inside the file

Filename stays stable across the conversation. The version number lives inside the file as section headers. Pattern:

```markdown
# <ChatA> ↔ <ChatB>: <topic>

**Status:** OPEN | CLOSED
**Next:** <Seat whose turn it is>   # REQUIRED. The filename is alphabetical and so erases direction; this line restores it.
**Current version:** vN

---

## v1, YYYY-MM-DD, <Author chat>

(content)

## v2, YYYY-MM-DD, <Other chat>

(content)

## v3, YYYY-MM-DD, <First chat again>

(content)
```

Whoever writes next reads the file, scrolls to the latest section to see what's open, and appends a new section with the incremented version number, the date, and their chat name. The **Current version:** at the top should also be bumped.

When a thread is fully resolved, change **Status:** to CLOSED at the top so others can see at a glance which threads are live.

## Check for replies at the start of each turn

Before responding to the user on a topic that has an open inter-chat thread, check the relevant file. If the latest version is from another chat (i.e. a response since you last looked), read it and incorporate. Mention in your in-chat summary what you found.

~~If there's no relevant open thread, no need to check anything.~~ **SUPERSEDED 2026-07-17.** That rule only ever found what a seat already knew to look for. It is replaced by the unconditional **self-check** below: work that binds you lives in DECISIONS.md and AUTHOR_BRIEF.md as often as in a thread, and a seat that checks only `inter_chat/` will miss it. Proof: PrepositionAuthor had ONE thread naming it while 55 items commissioned by criterion 20 sat in DECISIONS, in no thread at all — and criteria 15/16 sat unread for seven weeks for exactly this reason.

## In-chat summary alongside the file write

The user must always know what's been written to a file on their behalf. Every time you write or update an inter-chat file:

- Identify the file (path + topic).
- Summarise what you added (one paragraph or a short list).
- Flag the points the user might want to push back on before the file goes out.
- Note any open threads with other chats that this update touches.

Don't quote the file's content back as a copy-pasteable blurb. Don't tell the user to "paste this into" anywhere. The user routes by saying "go look at `inter_chat/Architecture_Vocab_X.md`" or similar.

## What goes in chat vs what goes in a file

Chat is for talking to the user. File is for talking to other chats.

- "What do you think of this approach?" → chat.
- "Here's a ruling on the marker semantics for vocab to apply" → file.
- "I'm not sure whether to do A or B, which do you prefer?" → chat (clarification).
- "Here's a brief for code to execute on the next pass" → file.
- A summary of what you wrote in the file, after you wrote it → chat.

If you're unsure whether something is for the user or for another chat, ask the user.

## Race conditions

If two chats both happen to be writing to the same file at the same time, the later write can clobber the earlier one. In practice this is rare because the user routes one chat at a time. The mitigation if it ever bites: each chat reads the file fresh before writing, includes only their addition, and saves. If a clobber is noticed, recover from git history.

## Legacy chat files

Historical conversations from before this protocol (files at the project root with prefixes like `REPLY_TO_*`, `NOTE_TO_*`, `FEEDBACK_*`, `BRIEF_for_*`, `DISPATCH_*`, `ARCHITECTURE_FEEDBACK_*`, `DECISIONS_FROM_*`, `REQUEST_to_*`, `PATCH_REQUEST_for_code*`) are grandfathered. They stay in place as the historical record. Don't migrate them. New threads use the `inter_chat/` convention.

## Summary for the new chat

When you're routed to read this for the first time:

1. Apply the convention from your next turn onwards.
2. Look in `inter_chat/` to see if there are any open threads addressed to you.
3. If yes, read the latest version sections and respond by adding a new version to the same file.
4. Always summarise to the user in chat alongside the file write.

---

## The self-check (unconditional): your queue is a NAME-GREP across six surfaces

Estate standard from 2026-07-17 (MetaProject `COORDINATION_BOARD.md`; Linguics is the pilot).

**"What do I owe" is not a thread lookup. It is a grep for your own seat name across every coordination surface:**

1. `Next: <me>` in `inter_chat/*.md` — threads where it is my turn.
2. `<me>` anywhere else in `inter_chat/*.md` — work parked inside other seats' threads.
3. `<me>` in `DECISIONS.md` — next-touch clauses and "How to apply" lines that BIND me.
4. `<me>` in `AUTHOR_BRIEF.md` — standing brief obligations.
5. My own `DISPATCH_*.md` at root — my standing brief and queued asks.
6. `<me>` in `OPEN_QUESTIONS.md` — asks parked for me.
7. **My CLASS TOKENS** (`all-authors`, `all-seats`, ...) across the same surfaces — a ruling that binds everybody names NOBODY, so greps 1-6 cannot see it. Declare your classes in `_status/<Seat>.md` (`classes:`). See AUTHOR_BRIEF Rev 24 and its binding register.

One string, six greps, nothing tallied, nothing remembered. **The grep tells you what to LOOK at; you judge
which hits are live work and which are historical.** It surfaces candidates, not a worklist — replacing invisible
work with unfiltered noise would be no better.

## Re-read whenever you assert (provenance, not schedule)

Not "on wake": there is no session boundary a chat can detect, and a chat is not blind, it is **stale** — it
remembers what the files said when it last read them and cannot tell they have changed.

> **If you are about to state what is on disk — what you owe, what is outstanding, who to fire next — re-read it
> in that same turn.** If you are not making a disk claim, do not.

Most turns make no disk claim. Cheapness is what makes it enforceable. This rule exists because the architect told
Smith "nothing is waiting on you" with 27 threads open, having reconstructed the answer from memory of the pass.

## Three states of a ruling, and the third is the worst

- **Proposed, never accepted** — visible.
- **Accepted, never delivered** — the seven-week gap; Rev 21(iii)'s next-touch clause is the fix. It at least knows it is waiting.
- **Asserted live, never ruled** — *claims to be finished, so nothing goes looking for it.* An architect's report of a
  state is not evidence of that state. Verify from disk before asserting, including against your own prior claims.

## The status file never replaces speaking to Smith

Each seat writes `_status/<Seat>.md` (schema: `_status/README.md`) **in addition to** its closing chat message, as a
strict SUBSET of it. If it is in the file, it was said in the chat first. The file exists so a machine can read across
all seats at once, never so a seat can go quiet.

## Discharge stamps: queue = name-grep MINUS discharged

The self-check above fails symmetrically to the rule it replaced, and PrepositionAuthor proved it on itself:

- **`Next:` alone -> false negatives.** Work commissioned in DECISIONS or the brief, named in no thread, stays invisible. Criteria 15/16 sat at 0/92 for seven weeks. Architecture's own record.
- **Name-grep alone -> false positives.** A next-touch clause names its bound seat **forever**, because nothing edits the clause when it is answered; the evidence of discharge lives in the bound seat's thread, which the grep reads as *more hits*, not as retirement. A board seeded from the grep alone would have fired a wake instruction at PrepositionAuthor for a queue of **zero** — its three named obligations were all discharged before the packet proposing them was written.

**The stamp (from PrepositionAuthor, adopted verbatim).** When a knock is answered, **the architect stamps the source clause**, appended to the DECISIONS "How to apply" line:

```
[discharged: PrepositionAuthor, 2026-07-16, cue_meaning_framing v2 — 6 reframed, 48 exempt]
```

**Queue = name-grep MINUS discharged stamps.** One string, derived from disk, nothing remembered by anyone. The stamp is the **pull-side twin of the next-touch clause**: the clause delivers the knock, the stamp records that the door was answered.

- **Architecture owns the stamp**, because per Rev 21(iii) it owns the clause. **Seats do not stamp themselves** — self-reported discharge is precisely the class of thing that already failed.
- **Nothing is ever deleted.** The record is append-only; discharge is an ADDITION. Queues are computed by subtraction at read time, never by erasing the past.
- **The first sweep will be the noisiest thing the board ever shows.** Historical clauses carry no stamps, so discharged work surfaces as apparent queue. Triaging and stamping those is the pilot's real, one-off cost. **Do not read a fat first board as a fat backlog.**

## Version numbers are labels, not ordering (ruling, 2026-07-17)

`v1, v2, v3...` assumed Smith routes strictly one chat at a time and that each writer had read the latest state. **Both assumptions are dead** — he runs seats in parallel now — and this thread collided twice in one day: PrepositionAuthor and Architecture both wrote `v2`, then MetaProject and Architecture both wrote `v3`.

**Ruling:**
- **The real key is `date + author`** (add a time if you have one). `vN` is a human label. **Collisions are legal and expected.**
- **Ordering is FILE ORDER.** The file is append-only and read top to bottom; physical order already carries what the integer only pretended to.
- **Never renumber**, including to tidy a collision. A collision is evidence of parallel routing and stays on the record.
- **The number was never the safeguard, and renumbering would not have saved anyone.** Both collisions here happened because the writer appended without reading the section above. **The fix is Rule 2 (re-read whenever you assert), not arithmetic.** `**Next:**` already carries the only thing the version number was load-bearing for: whose turn it is.

## Rulings that affect everybody (Rev 24)

Smith's question — *"if you write something that affects everybody, do you have to name every single thread?"* — exposed that greps 1-6 find a universal ruling **never**, because it names no seat. Six of criteria 13-20 name nobody; criterion 17 is what that costs (418 bare items, and a seat commissioned to fix by hand what delivery should have done).

- **Standing rule vs retrofit task.** Most universal rulings are STANDING ("new items do X"): comply by reading the brief when you author. **Standing rules never enter a queue** — otherwise every board shows all twenty criteria forever and the ritual dies of noise, which is how the last one died. Only a RETROFIT is a task.
- **Class tokens, not name lists.** A clause declares `binds: all-authors` (or explicit seats). Seats grep their name + their declared classes. No list to maintain; a new seat inherits by declaring its class, which a 31-name list could never do.
- **Discharge scales**: a class clause accumulates one stamp per seat; each seat subtracts its own. The architect then gets a **compliance table** — bound class MINUS stamped seats — which is what Rev 21(iii) promised and could not compute.

## Verify before you ASK, not just before you assert (2026-07-17, from Smith)

Rule 2 says re-read before you state what is on disk. **It applies equally to what you ASK Smith for.** Architecture told Smith to "push r11-r15" for several turns running. He had already pushed. `git rev-list --count @{u}..HEAD` returns **0**, and `LL_BUILD` in the committed HEAD reads **r16** — the ask was stale by three builds, and one command would have shown it. Smith: *"stop moaning at me to do a push. I've usually done it, and you just can't see it."* He was right about the nagging; he was too generous about the cause. It was not that we cannot see it. It is that nobody looked.

**The `claude_can_verify:` field in `_status/` exists to stop exactly this, and it was being filled in from assumption.** Housing declared *"push + deploys only Smith can do"*. Half true:

| ask | verifiable by Claude? | how |
|---|---|---|
| **git push** | **YES** | `git rev-list --count @{u}..HEAD` (0 = pushed); `git show HEAD:<file>` for the shipped build id |
| worker redeploy (wrangler) | no | outside the repo |
| Apps Script deploy | no | outside the repo |
| "does it feel right in my browser" | no | genuinely only Smith |

**Rules:**
1. **Before putting an item in `needs_from_smith`, try to verify it.** If it is verifiable, verify it and drop the ask. An external-action ask that Claude could have checked is a nag, and nags train Smith to ignore the board — which is how the last convention died.
2. **`claude_can_verify:` must be REASONED, not guessed** — same rule as `classes:`. State how you would check, or say plainly that you tried and could not. "Only Smith can" is a claim requiring evidence like any other.
3. **Never re-ask a standing external action without re-checking it that turn.** A repeated stale ask is worse than no board at all.

## Asking Smith for a decision: prose in chat, never a popup (2026-07-17)

**Rule: put decisions at the END of your chat message, in prose, as a lettered choice with options and your recommendation, and mirror them in `_status` as `needs_from_smith: decision`. Never use the interactive question popups.**

A popup **writes nothing to disk**. So the decision is un-greppable by the self-check, un-stampable by the discharge mechanism, invisible to the status board, and gone if Smith steps away mid-turn — it also halts the seat. A ruling that only ever existed in a popup is a ruling with no record, which is the exact disease this whole protocol treats. No carve-out for project seats.

**The wording that caused this was ours, and it is worth keeping as the lesson.** Wake step 3 used to read *"state any decision as a discrete choice with options, never as prose"*. It meant *make the options explicit rather than burying them in a paragraph*. It READ as *don't use the chat, use a form* — because a popup is, literally, a discrete choice with options. **We specified the CONTENT of a decision and left the CHANNEL unspecified, and the app layer's defaults filled the vacuum.** Seats following the line to the letter were complying, not defying.

This is the fourth instance of one pattern in a single day: `stub` meaning three different things; `all-authors` undefined until Vocab reasoned it out; `prompt_supplies_base_form` named for the prompt but behaving on the error space; and now this. **Wording in this estate is followed literally, and it should be. When behaviour goes wrong, suspect the words before the reader.**
