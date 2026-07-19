# Architecture seat — handoff (2026-07-18)

For the next Architecture chat. Read CLAUDE.md's normal onboarding (PROJECT / DECISIONS / DESIGN /
AUTHOR_BRIEF / inter_chat / your `_status`) first. Then this.

## THE ONE RULE, learned the hard way today

**Derive from disk; never quote a number from memory or from a previous turn.** The single
recurring failure of the last session was the architect asserting stale numbers — "55 items"
(after it was refuted), "push r11-r15" (build was already r16), "worklist 175" (was 74), "stand up
Connective/Indefinite" (delivered 15h earlier). Every one would have been caught by re-running a
command. So, before you claim ANYTHING about state, run the command:

- **What exists / what's unstarted / who to fire** -> `ESTATE_STATE.md` (has the command inline)
- **Stub backlog** -> `STUB_CENSUS.md` (command inline; every remaining stub is a DEFINED leaf, not a phantom)
- **pos hygiene worklist** -> command in `AdjectiveAuthor_Architecture_brief_rev6_audit.md` v7
- **Your queue / the estate queue** -> grep `^\*\*Next:` across `inter_chat/*.md` on non-CLOSED threads; the aggregated view is `STATUS_BOARD.md` (MetaProject regenerates it)
- **Seat self-declarations** -> `_status/<Seat>.md`

Also now protocol (INTER_CHAT_PROTOCOL.md): re-read before you ASSERT, and verify before you ASK
Smith for anything (the push is checkable with `git rev-list --count @{u}..HEAD` = 0 -> pushed).

## SNAPSHOT (2026-07-18, re-derive before trusting any figure)
- Corpus ~2074 grammar + ~817 translation, 31 authoring topics, 0 unstarted.
- AUTHOR_BRIEF at **Rev 27**; glossary v8; misconception registry 75; **15 stub flags, all defined leaves**.
- ~43 threads carry `Next: Architecture` — MOSTLY discharge stamps from the wake-walk, not rulings. Triage: stamp the verified discharges, rule the few real questions.

## THE COORDINATION SYSTEM (built this session — use it, don't hand-roll)
- **`Next:` line** on every thread = whose turn. **Discharge stamps** in DECISIONS = `[discharged: Seat, date, evidence]`; queue = name-grep MINUS stamps. **`_status/<Seat>.md`** = each seat's self-declaration. **`WAKE_INSTRUCTION.md`** = paste-target to wake a seat. **Class tokens** (`all-authors`/`all-seats`) in `_status` catch rulings that name nobody. All in INTER_CHAT_PROTOCOL.md.
- **Decisions to Smith go in PROSE at the end of the chat message, lettered options + recommendation** — NEVER the interactive popups (they leave no disk trace). Mirror in `_status` as `needs_from_smith: decision`.
- **Run `binds: all-authors` retrofits CENTRALLY** (criterion 13 was: 1,144 chips, 5 real hits) — don't make 25 seats self-audit.

## PENDING — Housing (specs written, awaiting build + Smith's push)
- Mastery colour: denominator floor `wC / max(wA, 9.5)` — two-for-green. `Architecture_Housing_mastery_confidence_damping`.
- Verb-formation six-person split (needs the `person` field migration, below). `Architecture_Housing_verb_formation_person_split`.
- **Additive-error engine fix (RESIDUE)** — the biggest one: `Ci sono delle` scores full credit today; residue = answer minus positive minus supplied tokens. `Architecture_Housing_extraneous_word_residue`. Housing to survey corpus-flip before shipping.
- `prompt_supplies_base_form` -> rename to its behaviour, then Housing changes the read + Architecture migrates 1,665 items. `Architecture_Housing_cue_placement` v3.
- Load race, pickers, feedback widget — largely shipped r14-r16; verify against Smith's browser.

## PENDING — Architecture (your desk, real work not just stamps)
- **`person` field migration** for the six-person split: ~78% derivable from external_id, ~96 need author backfill, non-finite = null. Specced, NOT executed (deliberately — don't mass-mutate 450 items blind). Ratify field name with Smith first.
- **Cue-notation retrofit (138 items render "Use <english>")** — `Architecture_ALLAUTHORS_cue_notation_renders_use_english`; itemised per author.
- **Usage wave-2**: future + congiuntivo STARTED; gerundio, condizionale, imperativo still to fire.
- The stamp backfill continues as seats declare.

## PENDING — Smith
- **The push** (verify with git first; do NOT nag). Vocab chemistry-prune A/B/C. Firing the 3 remaining usage authors + any reactivations.

## Rulings NOT to re-litigate (all in DECISIONS, dated 2026-07-16/17)
Rev 21 next-touch clause; Rev 22 cue-by-meaning; Rev 23 crit-20-disarms-crit-19; Rev 24 class tokens + standing-vs-retrofit; Rev 25 cue-level; Rev 26 crit-13 trigger/context/diagnostic; **Rev 27 one-answer-credits-many-buckets** (marks and mastery are separate currencies — verified in the engine). Phantom stubs superseded. "Label is the bug" recurred ~7x — when behaviour is wrong, suspect the wording before the reader.
