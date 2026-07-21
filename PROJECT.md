# PROJECT.md

The "what is this and why does it exist" document for Linguics. Read first.

## What it is

A web application for learning a foreign language with the same fine-grained, atomised understanding-of-mistakes that the PreIB Physics question engine brings to physics. Italian first. Multi-language-ready data model, but no second language at launch.

Three strands of practice, kept conceptually separate, with shared identity (one login) and shared analytics (one history per learner).

1. **Grammar** (no AI needed to mark). Author-written bank of short-form questions whose answers are a closed set of one- or two-word forms. Verbatim correctness, with a curated list of accepted variants per mark point, deterministically markable in the browser. Bulk-authored by purpose-built chats.
2. **Vocabulary** (handled by a sister project). The Memoriser (memtool / Smithics) is being built independently and will own this strand. Linguics links to it, shares login with it, and surfaces its data when relevant, but does not duplicate it.
3. **One-sentence translation** (AI-marked). A single Italian or English sentence in, a learner's attempt at translating it out. The AI's job is *not* "is this right." The AI's job is to decompose the attempt into a fixed list of atomised mark points (vocabulary, agreement, tense, mood, word order, preposition, register, idiom, sense), say which fired and which didn't, and explain partials briefly. Marks happen in both directions: EN→IT and IT→EN.

## Why it exists

Existing language tools score in a binary way (right or wrong) or in a coarse way ("close, but..."). Neither helps a learner build a model of *what specifically* they don't know. The physics engine fixes that for physics by making every mark point its own named bucket; over hundreds of attempts you can see "I keep losing the 'force per collision' point" rather than "I keep getting kinetic theory wrong."

This project applies the same idea to language. A learner who writes *Lui è andato al mercato e ha comprato il pane* gets credited for: subject-verb agreement (è), choice of essere with andare, past participle agreement (andato → masculine singular), correct preposition (al), correct gender on pane (il, masculine). If they write *Lui ha andato al mercato e ha comprato la pane*, they get credit for the parts they got right (correct verb forms, correct preposition), and the AI flags two specific misses: auxiliary choice (essere not avere with andare) and gender (pane is masculine). Both misses are stored as discrete events against named mark points, so the system can show the learner over time which patterns are stable, which are improving, which are stuck.

## What's different about translation specifically

A translation is harder to atomise than a physics short-answer because:

- There is no single correct surface form. *Il libro è sul tavolo* and *Il libro sta sul tavolo* and *Il libro si trova sul tavolo* can all be right depending on register and intent.
- A learner may be aiming at different things: a literal word-by-word render, a guess from context, a search for the sense or rhythm of the original. The same surface form is "right" or "wrong" depending on which they're trying to do.

So the translation strand carries a small bit of learner metadata per attempt:

- **Intent**: `literal` | `guess` | `sense`. Literal is "I'm trying to map every word." Guess is "I have no idea, I'm taking a stab." Sense is "I'm reaching for what it would actually sound like."
- The AI weighs strictness against intent: in `literal` mode, missed vocabulary items count harder, near-synonyms count softer. In `sense` mode, idiom and register count harder, exact word-for-word doesn't. In `guess` mode, the report is more diagnostic and less penalising.

For v1, only `literal` is mandatory; the other two intents are advanced and may be deferred. The data model supports all three from day one.

## Audience

Two horizons.

- **Now**: the author, plus a small invited group (testers, family, a few pupils).
- **Later**: real students or clients of a language teacher, with persistent per-user history and progress views. The product is designed so that adding the second horizon doesn't require a data migration; it requires the same building blocks, just more of them.

This rules out a "static site + localStorage" architecture from the start.

## Sister projects and the wider picture

- **memtool / Smithics**: spaced-repetition app, separate codebase at `G:\My Drive\physicalsmithness files\memtool`, FastAPI + SQLite + Google Sheets. Owns the vocabulary strand and the login. Linguics uses the same Google Cloud OAuth client and is added as a second redirect URI on it. Sign in once, work in either.
- **PreIB Qs Project**: static physics question bank. Provides the structural pattern: schema v0.4 markPoints, normalisation pre-pass, coverage map by subtag. The Linguics grammar strand is in the same family; the translation strand is the same family with AI in the mark-point firing decision.
- **Calculation Automation**: physics calculation-checker prototypes. Same family of "decompose, locate the mistake, attribute it specifically."
- **Chemistry / Maths Papers Categorisation**: structured taxonomies of past-paper questions. Same kind of granularity, applied to question content rather than to learner answers.

## What this project is not

- Not a course. There is no syllabus walkthrough, no lesson plans, no "today's vocab list."
- Not a chat tutor. It does not have free-form conversation; it has atomised, gradable tasks.
- Not a vocabulary tool. The Memoriser owns that.
- Not a textbook replacement. The learner brings the input (a sentence to translate, a grammar question to attempt); the system marks and remembers.

## Distinguishing features

What this project has that the obvious comparators (Duolingo, Babbel, Lingoda, Italki) do not:

1. **Atomised mark points** with a named bucket for every kind of miss. Not "wrong"; "lost the auxiliary-essere mark point on andare."
2. **Per-mark-point history**: a learner can see, per bucket, the timeline of hits and misses. Per-mistake mastery, not per-question mastery.
3. **Translation intent** as first-class metadata. The system knows whether you were translating literally or for sense, and grades accordingly.
4. **Translation in both directions** treated symmetrically, with comparable buckets on each side. EN→IT and IT→EN share the same mark-point taxonomy where applicable (vocabulary item, gender, tense), with direction-specific buckets where needed (idiom-in-target, register-in-target).
5. **Cross-strand identity**: a learner's vocab progress (in the Memoriser) and grammar progress (here) inform each other. Specifically, the translation strand can read the Memoriser's "this learner has rated `pane` as 5 understanding" and surface that when the learner misses `pane` in a translation. ("You marked yourself as 5 on this word.")

## Document map

- **PROJECT.md** (this file). What it is and why.
- **DESIGN.md**. The "how it works" doc. Data model, marking algorithms, AI prompting structure, API surface, login flow.
- **OPEN_QUESTIONS.md**. Things deliberately not decided yet.
- **ROADMAP.md**. What comes next, in what order, why.
- **DECISIONS.md** (to be created when the first decision is reversed).

Conventions follow the Memoriser's: absolute dates, design intent in the docs, code as implementation. If the docs and the code disagree, fix one of them.
