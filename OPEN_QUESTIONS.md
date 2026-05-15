# OPEN_QUESTIONS.md

Things deliberately not decided. Each entry has the question, the options, why it isn't decided yet, and what would trigger a decision.

When a question is resolved, lift it out of here and put the resolution in DECISIONS.md.

---

## How does the Memoriser actually plug in?

The intent is "share login, link out for vocab, surface vocab data inside translation feedback." The mechanics aren't decided.

**Options**:

- **Two apps, two databases, OAuth client shared**. Each app has its own `users` table keyed on `google_sub`. Cross-app data fetched via HTTP.
- **Two apps, one database**. Both apps point at the same DB.
- **One app, two areas**. Move the Memoriser into this codebase.

**Likely resolution**: option 1 for v1; option 2 if cross-app calls become cumbersome.

**Trigger**: when the first cross-app feature is built.

---

## Single sign-on between Linguics and Memoriser

Once deployed, do they share a session cookie?

**Options**:

- **Independent cookies**: sign in to each separately.
- **Shared session cookie at a parent domain**: both apps under `*.smithics.com`.
- **A shared auth service**: a third app that owns identity.

**Trigger**: when both apps are deployment-ready and a hosting plan is in place.

---

## Intent: per-attempt vs per-session

The attempt-level intent is `literal | guess | sense`. Where does it actually live in the UI?

**Options**:

- **Per attempt**: the toggle is part of the translation submission form.
- **Per session**: set once at session start.
- **Sticky last-used**: defaults to whatever the learner picked last, overridable per attempt.

**Likely resolution**: sticky last-used.

**Trigger**: when the translation UI is being built.

---

## The "guess" intent (attempt-level): scoring or not?

With inline annotations now in place, the attempt-level `guess` becomes less critical because the learner can flag specific segments. But it still has a role for "the whole thing is a stab."

**Options**:

- **No marks at all**: diagnostic only when attempt-level intent is `guess`.
- **Marks recorded but not shown**: data captured, learner doesn't see a score front-and-centre.
- **Marks shown with a `guess` badge**: full score visible.

**Likely resolution**: option 2.

**Trigger**: when the translation UI is being built.

---

## Inline annotation syntax: HTML tags or alternatives?

The current proposal is HTML-style: `<g>...</g>`, `<s>...</s>`, `<f>...</f>` with optional `level="1|2|3"`. Easy for the AI to parse; less easy to type by hand.

**Options**:

- **HTML tags** (current proposal): unambiguous, AI-friendly, harder to type.
- **Markdown-ish brackets**: `[g]word[/g]`, `[s]word[/s]`, `[f]word[/f]`. Similar but slightly shorter.
- **Symbol-based**: `?word?` for guess, `~word~` for sense, `^word^` for flair. Shortest, but ambiguous with prose punctuation.
- **UI-only**: no typeable syntax; annotations exist only via the click-to-tag toolbar. Simplest UX but slower.

**Likely resolution**: keep HTML for v1 because the UI toolbar will produce them; learners who type tags directly are the minority but they're served.

**Trigger**: first feedback from real learners.

---

## What if `flair` is on the wrong segment?

A learner flags a segment as `<f>` (deliberate stylistic reach) but their chosen idiom is plain wrong or off-register. The marker still grades the markpoints in the normal way. What does the feedback look like?

**Options**:

- **Plain miss + a note**: "you flagged this as a stylistic choice, but the idiom doesn't quite land here; here's what would have worked."
- **Soft miss**: half-credit on the markpoint because the learner is reaching, with a note.
- **No special treatment**: same as an unflagged wrong attempt.

**Likely resolution**: option 1. The flag doesn't change scoring; it changes the feedback voice.

**Trigger**: when the first wrong-flair attempt is marked.

---

## Should the AI recognise unflagged stylistic reach as `flair`?

A learner writes `in bocca al lupo` for "good luck" without flagging it. The AI sees an idiomatic choice. Should it credit it as `flair` anyway? Or only credit `flair` when the learner has flagged?

**Options**:

- **Only credit flagged flair**: the learner has to declare. Forces self-awareness.
- **Recognise idiomatic equivalence regardless of flag**: more forgiving; rewards good intuition.
- **Both, but with a "you could have flagged this as flair" hint**: encourages flagging next time.

**Likely resolution**: option 3.

**Trigger**: when inline annotations are wired up.

---

## Can the AI propose new top-level groups?

The current rule is: AI can propose new buckets under registered parents, never new top-level groups. Conservative; might be too tight.

**Trigger**: if AI proposals are repeatedly being shoehorned into parents that don't fit; otherwise leave.

---

## Taxonomy depth governance

A tree can grow arbitrarily deep. At some point depth itself becomes noise.

**Options**:

- **No hard limit**: trust the authors.
- **Soft limit of 4 levels beyond top-level**, with explicit justification on deeper rows.
- **Visualisation collapses depth > N by default**.

**Likely resolution**: option 3 (data unconstrained, UI hides) plus a soft-limit warning in authoring.

**Trigger**: when the first sub-tree grows past 4 levels.

---

## What's the K-window for mastery aggregation?

The "current mastery" on a bucket is the recency-weighted mean of the last K events. K is small.

**Likely starting value**: K=5.

**Trigger**: when the stats view is built and the author looks at their own data; revisit if it feels jumpy or stale.

---

## Decay band boundaries

Time-decay bands sketched as `<14d / 14-60d / 60-180d / >180d`. Session-decay as `0 / 1-5 / 5-20 / >20`. Both are guesses.

**Trigger**: after a few months of real data; tune to where the bands are doing useful diagnostic work.

---

## How is the learner's CEFR level captured?

The CEFR-importance map needs a level to interpret against.

**Options**:

- **Self-declared at signup**, editable later.
- **Inferred from performance**.
- **Both**: self-declared with an inferred suggestion.

**Likely resolution**: self-declared at signup; inference as a stretch goal.

**Trigger**: when the signup flow is built.

---

## Where the bucket registry lives

**Options**:

- **Google Sheet** (consistent with authoring elsewhere).
- **Admin UI inside the app**.
- **A JS file in the repo**, PreIB-style.

**Likely resolution**: Google Sheet; JS fallback if Sheets is painful.

**Trigger**: when the bucket registry is first populated.

---

## Where do batch-authoring chats fit?

**Options**:

- **Through a Google Sheet**.
- **Direct paste into the editor**.
- **Both, configurable**.

**Likely resolution**: both.

**Trigger**: when the first batch is authored.

---

## How to test mark-point quality before going live

**Options**:

- **Author writes test attempts**.
- **AI generates test attempts**.
- **Both**.

**Likely resolution**: both, with author-written first.

**Trigger**: when authoring sees real volume.

---

## Graded near-match credit on the deterministic engine

The current grammar engine treats markpoints as binary: substring-of-`any_phrases` is a hit, substring-of-`must_not_include` is a miss with credit 0, nothing is "not attempted". This collapses two distinct kinds of wrong:

- **Wrong idea**: the learner has misunderstood the skill (e.g. used the wrong tense entirely).
- **Right idea, wrong form**: the learner has produced something structurally close to the right answer but malformed (e.g. wrote `melo` for an expected `me l'`; got "me" + "lo" but missed the elision and the space).

A graded model would give partial credit on near-matches. Options:

- **`near_phrases` field on markpoints**: an authored list of forms that earn partial credit (e.g. 0.5) with a note ("right idea, missing elision"). Engine awards highest matching credit.
- **Edit-distance match**: engine computes Levenshtein distance between learner answer and any_phrases; below a threshold awards proportional credit.
- **Defer to AI**: the deterministic engine stays binary; cases needing graded near-match move to AI-marked translation items.

**Likely resolution**: `near_phrases` per markpoint, authored. Trigger when the next engine-extension session happens. Editor distance is tempting but harder to calibrate per question.

---

## Vocabulary credit on correct answers (not just on help)

Currently `vocabulary.*` buckets fire as misses only when the learner asks for vocab help on that lemma. When a learner produces the right Italian word in their answer without asking for help, no vocab event is recorded; the bucket stays empty (or stuck at "wrong" if help was asked at some point).

The user wants the opposite default: producing the correct word in an answer should fire a `vocabulary.it.<lemma>.translation` hit (and similar for other aspects).

Options:

- **Inferred-hit-by-non-use**: after a correct grammar/translation answer, fire hits on each `vocab_help` entry whose aspect was NOT used. The premise: by not asking for help, the learner has demonstrated they knew that aspect.
- **Surface-form scan**: scan the learner's answer for any vocab_help lemma's surface form (with inflection awareness). Hits fire when matched.
- **Marker-attributed hits**: extend the marker so per-bucket events can include lemma-level hits.

Combine: inferred-hit-by-non-use is simplest and gives the most lift. Surface-form scan is a refinement for cases where the lemma maps clearly to specific answer tokens.

**Trigger**: when vocab-as-content matures (frequency-tier dispatch, or first dedicated vocab strand).

---

## Frequency-tier vocabulary content

The vocabulary strand needs structure beyond "buckets fire as events come in." Bands at 100-word resolution up to 1000, then 500-word resolution beyond:

- **1-100** (A1 core, the most common words)
- **101-200**
- **201-300**
- **301-400**
- **401-500**
- **501-600**
- **601-700**
- **701-800**
- **801-900**
- **901-1000** (around A2 transitions to B1)
- **1001-1500** (B1)
- **1501-2000**
- **2001-2500**
- **2501-3000** (B2)
- **3001-5000** (C1)
- **5001+** (C1-C2)

Each band gets its own sub-tree under `vocabulary.it`. Direct vocabulary-test questions (a third strand) draw from these. The overview's vocabulary cell would then show frequency bands as its mini-cells; ten 100-bands fit naturally in a row.

Sources for frequency: subtle lists exist (Italian frequency dictionary projects, BNC-style corpora). A dispatching chat could be asked to produce a tiered list with translation, gender (where relevant), and aspect data.

**Trigger**: when the vocab strand gets dedicated time. Probably after the cross-cutting taxonomy session.

---

## Glossary of grammatical terms (clickable definitions)

Explanations in author-produced content use a lot of grammar jargon: DOP, IOP, clitic cluster, elision, fronting, left-dislocation, partitive, agreement, etc. Two extremes are both wrong:

- **Define everything inline**: prose balloons, fluent readers are slowed down, the explanation reads as patronising.
- **Define nothing**: novice learners get baffled by jargon and the explanation fails to communicate.

The middle path is a small **glossary** that explanations link into. Each grammatical term has a short definition (one sentence) and a long one (a paragraph with examples). The renderer scans explanation text for known terms and wraps them in interactive spans: hover for short, click for long. The chat-authored prose stays compact and assumes basic grammatical literacy.

Design:

- A `data/glossary.json` file, separately loaded via the manifest.
- Terms keyed by canonical name ("direct object pronoun", "fronting", etc.) with `short` and `long` fields.
- Abbreviation aliases (`DOP` → "direct object pronoun") via a separate map.
- The renderer's explanation pass: tokenise, match longest-first against the term list, wrap with `<span class="gloss-term" data-term="...">`. The wrapper is hoverable / clickable.
- Click optionally records a `glossary.<term>` event so we know what learners are looking up. This complements the bucket events.

Authoring instruction (for the brief): "use jargon naturally; the platform will make terms clickable. Don't inline-define DOP, IOP, fronting, elision, etc. unless the explanation specifically introduces the concept as new."

**Trigger**: when the next round of housing work is ready. Starter glossary of ~30 terms covering the explanations in the three existing batches.

---

## Overview-cell colour calibration

The current red/white/green gradient with white pinned at 30% correct is provisional. The 30% midpoint, the red endpoint colour, and the cream-for-untouched choice all want calibration once we have real attempt data across multiple learners and topics.

Open variables:

- The midpoint percentage (30%? 50%? per-bucket-CEFR-dependent?).
- Whether to use `correct/total` or `correct/attempted` for the shade source.
- Whether the redshade should be allowed at all in the overview (the original feedback was no red anywhere in stats; the current scheme adds it back at the bottom of the gradient).
- Whether decay-halo should affect the gradient or sit alongside it.

**Trigger**: after several months of real-attempt data.

---

## Cross-bucket co-occurrence visual

Useful only with hundreds of attempts. Build now or defer?

**Likely resolution**: defer to v1.5.

**Trigger**: when a learner reaches a threshold of (say) 500 attempts.

---

## Privacy and data retention

For real students this might want privacy controls.

**Options**:

- **Default keep, per-user hard-delete** on request.
- **Per-attempt redaction**.

**Likely resolution**: default keep, per-user delete from the moment a non-author learner signs up.

**Trigger**: first non-author learner.

---

## Annotation-aware question picker

The question picker biases toward weak buckets. If a learner's misses on a bucket are mostly under `<g>` guesses (they're shaky there) versus mostly unflagged (they're confidently wrong), should the picker treat these differently?

**Options**:

- **Treat all misses equally**: simpler.
- **Confidently-wrong outweighs guesses**: misses without `<g>` annotations bias the picker more, because the learner doesn't realise they're wrong (more urgent intervention).
- **Guesses outweigh confidently-wrong**: misses with `<g>` annotations bias the picker more, because the learner has explicitly flagged needing help.

**Likely resolution**: option 2. Unflagged misses are the silent gaps.

**Trigger**: when the question picker is built (v1.5 or later).

---

## Apostrophe shortcuts: disambiguation for e' vs e''

For Italian accents, the default `e'` shortcut maps to `è`. But `é` exists too (less common; specific words like `perché`). The proposal is `e''` (double apostrophe) for `é`, with a hover hint.

**Options**:

- **Double-apostrophe for é**: simple to type, slightly clunky.
- **Different key entirely**: e.g. backtick before letter for grave, forward for acute. Cleaner symbol design, more to learn.
- **Word-based disambiguation**: the system knows `perch'` → `perché` not `perchè` because it has a word list. Most natural for learners but most complex.

**Likely resolution**: option 1 for v1; option 3 as polish later.

**Trigger**: when the input UX is implemented.

---

## How are inline annotations rendered in the per-attempt history view?

When a learner reviews a past attempt in their history, do they see the annotated text as-typed, the parsed-and-rendered version with coloured highlights, or both?

**Options**:

- **Rendered with highlights**: visually consistent with how they typed it.
- **Raw text only**: simpler.
- **Toggle**: default to rendered, with a "show raw" view.

**Likely resolution**: option 1 (rendered with highlights, no toggle needed).

**Trigger**: when the per-attempt history view is built.

---

## Whether attempt-level intent persists into annotation interpretation

If the attempt-level intent is `sense` and a segment is unflagged, does the AI treat that segment as if it had an implicit `<s>` annotation?

**Options**:

- **Yes**: attempt-level intent is a default that propagates into unflagged segments.
- **No**: attempt-level intent only affects framing of overall feedback; unflagged segments are treated as neutral.

**Likely resolution**: no, to keep the two layers independent.

**Trigger**: when the marker prompt is being written.
