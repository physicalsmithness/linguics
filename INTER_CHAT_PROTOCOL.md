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

If there's no relevant open thread, no need to check anything.

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
