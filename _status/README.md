# `_status/` — one file per seat, each seat writes ONLY its own

Part of the estate coordination pilot (MetaProject `COORDINATION_BOARD.md`; Linguics is the pilot).
No shared file, so no write collisions by construction. MetaProject aggregates these into a board;
**do not build a reader here** — we produce declarations, they read them.

## The three rules

1. **Your queue is a NAME-GREP, not a thread lookup.** See INTER_CHAT_PROTOCOL.md §"The self-check".
2. **Re-read whenever you assert.** If you are about to state what is on disk (what you owe, what is
   outstanding, who to fire next), re-read it in that same turn. Not on a schedule; there is no session
   boundary a chat can detect. A chat is not blind, it is *stale*.
3. **The file NEVER replaces speaking to Smith.** It is written IN ADDITION to your closing message and is
   a strict SUBSET of it. If it is in the file, it was said in the chat first. Smith must never have to
   open a file to learn what a chat wants.

## Schema (`_status/<Seat>.md`)

```
seat: PrepositionAuthor
classes: [all-seats, all-authors]   # what class tokens bind me (Rev 24). Grep these too, or universal rulings stay invisible.
project: Linguics
updated: 2026-07-17
waiting: parked            # blocked | parked | closed
                           #   blocked = I cannot proceed until it is resolved
                           #   parked  = I have concluded; it sits with Smith, I am not waiting
                           #   closed  = done "unless you want more"
needs_from_smith: none     # none | continue | decision | review | external-action | confirm
blocked_by:                # if blocked: which seat/ruling
claude_can_verify:         # for confirm items: can Claude check it, or only Smith knows?
summary: one line, distilled from what I told Smith in chat
queue:                     # MY outstanding work, DERIVED from the name-grep, not remembered
  - Criterion 20 (Rev 22): 55 candidate items to reframe   [DECISIONS.md]
  - Architecture_PrepositionAuthor_cue_meaning_framing v3   [inter_chat, my turn]
```

`decision` items must state the question as a **discrete choice with options**, never as inline prose —
that is the form Smith wants decisions in.
