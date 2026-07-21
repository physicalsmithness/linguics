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

---

## Word stress as a vocabulary dimension

Italian word stress is a per-word property that is only partly predictable (`pArlano` versus the learner's mis-stressed `parlAno`; antepenult vs penult vs final stress; truncated-final written accents like `città`, `caffè`, `perché`). It behaves like gender: a fact attached to a lemma, not derivable from a single rule, and individually testable. Smith's steer (2026-06-08) is that this belongs in the **vocab layer as its own section, parallel to gender**, with its own heatmap axis, rather than as a grammar-formation bucket.

Consequence already applied: the present-formation tree gets **no** `stress_3pl` leaf; the 3pl antepenult-stress warning is folded into each regular formation leaf's `common_miss` attribute instead. The fuller stress tracking lives in vocab when it is built.

**Options for the vocab dimension** (to scope later with the vocab chat):

- A per-lemma `stress` field (stressed-syllable index, or a category: antepenult / penult / final / truncated-accent) plus a heatmap axis like the gender axis.
- Tested via a dedicated prompt shape (mark the stressed syllable, or type the word with the correct written accent where one exists).
- Restrictable by the same obviousness ladder gender uses (regular penult default = predictable; antepenult and final = irregular).

**Likely resolution**: add it as a vocab axis once the vocab chat has bandwidth; endorsed in principle, not yet scoped.

**Trigger**: when tense-formation testing surfaces stress errors that have nowhere to be recorded, or when the vocab axis work has spare capacity.

---

## Architect-side: vocab bucket-id <pos>-extension batch script (added 2026-06-07)

Per DECISIONS.md 2026-06-07 ruling on the AdjectiveAuthor brief Rev 6 audit Q2, architect chat owns writing a batch script that walks every grammar batch JSON, looks up each `vocabulary.it.<lemma>.<aspect>` bucket reference in `data/vocabulary_it_frequency.json`, and rewrites with the new shape `vocabulary.it.<lemma>.<pos>[.<gender>][.<number>].<aspect>[.<direction>]`. Auto-rewrites single-POS lemmas; flags multi-POS lemmas for per-batch author resolution.

**Schedule**: dry-run delivered as a per-batch sibling thread before commit. Target 1-2 architect passes from now.

**Trigger**: architect chat opens a dedicated pass for this task. Or surfaces naturally when a new dispatch needs the new shape from the start.

---

## Misconception aggregation: open parts (added 2026-06-08)

The model is settled and seeded (DESIGN §15, `data/misconceptions.json`, v1 with 7 populated + 4 reserved cross-kind families). Open parts, to resolve as Phase 2/3 approach:

- **Storage**: misconception events as a projection of the existing miss-event log (the miss event records the `misconception` id), not a separate store. *Lean: projection*, so the misconception axis is a query over the activity log, no new event store.
- **Multiple misconceptions per miss**: can one wrong form embody two (over-extended AND accent-omitted)? *Lean: allow `misconception` to be a string or an array; most are single.*
- **Mastery / decay direction**: misconceptions are inverted skills (you want them to fade). Reuse the §5.3 recency-weighted logic but on frequency-of-occurrence rather than correctness; a misconception not made recently fades. Exact formula TBD.
- **Drill-down view shape (Phase 2)**: a heatmap parallel to the skill heatmap, a "top recurring errors" summary, and cross-links, as a separate stats view never shown inline. Exact layout TBD with housing.
- **"Observed cross-kind" detection**: flag a specific when its events span more than one topic-kind (e.g. an `agreement.*` specific firing from both adjective and participle items). How to derive a topic's "kind" (leading namespace) and surface the flag, TBD.
- **AI-marker emission (Phase 3)**: the AI emits a `misconception` id from the registry on translation-item misses, with a propose-new path routed to review (same as the bucket-suggestion path). Deferred to Phase 3.
- **Vocab misconceptions**: the `false_friend` family and gender-pattern errors join from the vocab side. Deferred; grammar-first.

**Trigger**: Phase 1 (author `must_not_include` tagging + housing event recording) begins once present-indicative formation stabilises (PresentFormationAuthor v3 + batch review + manifest wiring). Phase 2 (the view) follows once events accrue.

---

## Cue chip self-audit across all author batches (added 2026-06-07)

AUTHOR_BRIEF criterion 13 (Revision 6) introduces the discipline: cue chips name the surface morphology of the wanted answer, not the structural rule that produces the answer. Existing batches were authored before this discipline existed and may have leaks like the negative-imperative item ("Use: informal, infinitive form for negative tu" — "infinitive" names the rule under test).

Each author chat on next opening should audit its own batch:

- **PronounAuthor**: pronoun cluster items, imperatives with clusters. Likely candidates for rule-leak chips.
- **ImperfectAuthor**: imperfect-tense items. Check chips don't say "imperfect" when imperfect is what's being chosen.
- **PassatoAuthor**: PP items. Check chips don't say "passato prossimo" or "past participle" when those are the test.
- **TenseChoiceAuthor**: tense-choice items inherently name tense in the chip; the audit here is whether the chip names tense as a label vs as a rule (the former is fine for discrimination items, the latter is leak).
- **AdjectiveAuthor**: adjective agreement items. Generally less affected because agreement isn't a "rule named" pattern, but check anyway.

Self-audit task. Each chat reports back on its inter_chat status note when done.

---

## Tense-choice items should declare their candidate tenses (added 2026-06-08; RESOLVED 2026-06-09)

> **RESOLVED 2026-06-09.** Field shape and display ruled in DECISIONS.md (`candidate_tenses` array + `correct_tense`, controlled tense-tag vocabulary, candidates shown post-answer only, marking unchanged). Carried by the TenseChoice wave-2 dispatch and AUTHOR_BRIEF criterion 16. Housing tick-UI requested via inter_chat. Original note kept below for context.

Smith's note, raised while sequencing the formation trees: when we reach the tense-USE phase, a tense-choice item will need to record which tenses are the legitimate options in that choice, "a tick alongside saying which tenses can be used in the choice."

The design implication: a tense-choice item (the kind TenseChoice authors, where the learner picks the contextually-right tense) carries a `candidate_tenses` set, the legitimate options for that context, alongside the single right answer. Surfaced to the learner as a small set of ticks (these tenses were in play; this one was right), and recorded so the stats can show, per choice-context, which tense was chosen against which options.

Why it matters:

- It makes the choice space explicit (the learner sees they were choosing among, say, present / passato prossimo / imperfect, not guessing in a vacuum).
- It feeds the misconception axis cleanly: choosing the wrong tense from a known candidate set is a recordable pattern (e.g. "consistently picks passato prossimo where imperfect was right"), which is exactly a cross-kind discrimination misconception.
- It gives the discrimination stub buckets (present.discrimination.vs_imperfect, future.discrimination.vs_present, condizionale.discrimination.vs_imperfect_counterfactual, and the tense_choice tree) a consistent item shape.

**Scope**: usage / tense-choice phase only. Does NOT affect the formation dispatches now in progress (formation items test a single form, no candidate set). Resolve the `candidate_tenses` field shape and the tick UI when the first TenseChoice / usage dispatch is scoped.

**Trigger**: when the usage / tense-choice phase begins (after the formation trees are done).

**Options**: not applicable — this is an audit task, not a decision.

**Trigger**: each author chat, on next opening (whichever order Smith brings them up).

## New grammar topics surfaced by the OIC deep drill (RESOLVED 2026-07-14: all four scaffolded same-day; negation via NegationAuthor's ratified carve-out, then indefinite, connective, word_formation on Smith's "and the others" go-ahead. The deferred trio, cleft / tu-Lei register / consonanti doppie, stays deferred. Trees + dispatches live; see DECISIONS.)

The deep exercise drill (REFERENCE_oic_exercise_drill.md) surfaced topics with no Linguics tree that the index-level pass had underweighted. Candidates, in the architect's priority order:

1. **Indefinites** (qualche + obligatory singular, alcuni, ogni, ciascuno, qualunque/qualsiasi, chiunque, nessuno, ognuno). No tree at all; A2-B1 core; rich drill material recovered (the four-way qualunque/chiunque/ciascuno/nessuno gap-fill, the chiunque-takes-subjunctive rule, qualcuno-for-people). Strongest candidate.
2. **Connectives / discourse linkers** (siccome vs perché vs quindi by clause position; però/invece/comunque/allora/infine discrimination; the mood-government map: benché + subjunctive vs anche se + indicative, prima che vs dopo che, affinché vs perché). We only touch subjunctive triggers inside tense_choice; the broader system has no home.
3. **Alterati / word formation** (diminutives -ino/-etto/-ello/-uccio/-otto, augmentative -one, falsi alterati like cavalletto, gender-shift alterati campanello/portone, prefixes stra-/arci-/neo-). B2-C1, self-contained, good trap inventory.
4. **Negation and particles** (mica's three position-meaning pairings, pleonastic vs grammatical non, negative concord word order, finché vs finché non meaning-flip). C1; overlaps the connettivi candidate at finché, so scope the two together if both go ahead.
5. **Deferred**: costruzione scissa (cleft) at C2; the tu/Lei register system as a topic (partially covered via imperativo); consonanti doppie as listening/orthography (belongs to the vocab/orthography axis and the housing's audio ambitions rather than a grammar tree).

## For the future Housing pass: an also_credits markpoint field (2026-07-15)

The ratified dual-citation mechanism (two 0.5 markpoints with identical phrase lists, reported_speech thread v4) works but duplicates data. A markpoint-level also_credits: [bucket] would let one markpoint feed two buckets. Not urgent; adopt if a third umbrella topic appears.

## Criterion-17 retro-sweep: COMMISSIONED 2026-07-16 as the Cr17Sweep seat (was: parked 2026-07-15)

GerundioAuthor's reconciliation found five real content bugs (one ungrammatical prompt) purely by writing out the completed sentence in English per criterion 17. The older batches (adjective_agreement, pronoun, PP, imperfect wave-1) predate the criterion and have never had that pass. Mechanical audits cannot catch wrong Italian; this one does. Schedule as a per-author next-touch or a dedicated sweep.

## Engine (Housing, future): whole-answer anchoring (match_at "exact")
Two item-classes are unauthorable because the correct string nests inside the wrong attempt at clean word boundaries AND the item wants a whole-answer equivalence: NegationAuthor's elliptical dodge ("Niente." vs "ho visto niente" crediting the dropped-non error) and ComparisonAuthor's molto+issimo. Ruled 2026-07-15: not built for one class; translation strand covers the ellipsis. If a third class appears, build match_at "exact" (needle must equal the whole normalised attempt). Tag: FUTURE-HOUSING.

## Adjective/WordFormation boundary (future seat): relational_adjectives scoping
word_formation.relational_adjectives is a deliberate stub. Scoping it needs a boundary ruling against the adjective topic (which owns -oso/-ale/-ivo derivation vs agreement?). Do not author from either current seat; wants its own scoping note when an adjective-side second pass opens. Tag: FUTURE-SEAT.

## AI translation marker accent policy (Smith to rule; then Code/Housing)
Three graders, three philosophies, one unwritten: vocab EN→IT = 50% partial on accent omission (ruled, stands); grammar marker = full credit + classified orthography breadcrumb (ruled, stands); AI translation marker = NOTHING (AI_MARKER_PLAN.md and worker/ contain no accent policy - AccentAuditor, 2026-07-15). Proposal on the table: instruct the model to never deduct for accent-only errors and to name them in feedback, mirroring the grammar philosophy. RESOLVED 2026-07-15: deduct-a-little-and-name, ruled by Smith; see Architecture_Housing_ai_marker_accent_policy.md.

## Criterion-17 retro-sweep: now a resourcing question for Smith, with a base rate (2026-07-16)

Previously parked as a vague "would be nice". TenseChoiceAuthor's wave 2 gives it a number: writing criterion 17's English glosses across 124 items surfaced **two live content bugs** that had been shipped since May (`tc_subj_op_05`: dovere with no infinitive, reading "the government owes stricter measures"; `tc_trap_compl_05`: glielo doubled by a nesuno phrase). Neither was findable by any gate the estate runs - the marker replica, the crit-18 containment scan and the schema check all pass on both. Grammatical-but-wrong prose is invisible to every automated instrument we have.

**The mechanism:** you cannot write a gloss without parsing the sentence, so a 17 retrofit is a proofread with a learner-facing by-product. **The base rate:** ~2 bugs per 124 items on a Rev-3-era batch. Pre-Rev-13 batches are the exposure.

**The question is resourcing, not principle**: this is a seat's worth of work across the corpus, and that is Smith's call. Flagged rather than spawned.

## CEFR placement-test harvest — coverage gaps (2026-07-21, green-lit by Smith to fill)

From REFERENCE_cefr_placement_harvest.md. Smith: "everything that can be, these are all things that we should fill."
- **Interrogatives** (chi?/che?/quale?/quanto?/come?/dove?): no bucket — mint a home + commission an author.
- **Periodo ipotetico**: 7 nodes scattered (tense_choice/condizionale/imperfect), no owner — resolve ownership + integrated coverage.
- **Orthography beyond accents** (double consonants, -cia/-cie, univerbation): broaden the orthography axis.
- **Lexical/register discrimination** (paronyms; mi scusi/scusami): a vocab axis beyond frequency ranking.
- **Connector+subjunctive / free-choice-indefinite+subjunctive** (qualora/malgrado/per quanto/...; chiunque/qualunque cosa): harvest the italianlanguagetest bank into the connective + indefinite seats; couples to the purpose-connective ruling.
- **Small morphology** (verify then place): participio assoluto; stare per + inf; futuro anteriore placement; bello/quello prenominal allomorphs.
- **PENDING Smith (decision, not auto-fill):** reading-comprehension item type; functional/pragmatic item type; the error-identification recognition shape (Transparent).

## Micro-gaps surfaced by the phantom-bucket cleanup (2026-07-21)
- **Exclamative che/come/quanto** (Che bel libro! / Come sei gentile! / Quanto sei alto!) — no home; same words as the interrogatives topic in an exclamative function, so a candidate leaf under `interrogatives` (or its own small topic). Was an orphan optional tag on trans_aa_en_it_12.
- **Telling the time** (Sono le sei e mezza) — a functional/vocab skill with no grammar bucket; likely a vocab-theme item, not a grammar leaf. Was an orphan optional tag on trans_aa_it_en_09.
