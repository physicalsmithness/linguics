# DECISIONS.md

The rationale log. Read before reversing a decision; the trade-off you're about to re-make is probably already in here. Append new decisions; mark old ones superseded rather than rewriting them.

---

## 2026-05-12: Italian only at launch; data model multi-language

The first language is Italian. Other languages are deferred. But the data model treats language as a parameter from day one (every content row has a `language_code`), so adding a second language is data, not refactor.

**Reason**: get a working tool quickly without baking Italian-specific assumptions into the schema.

---

## 2026-05-12: Two audiences from the start; backend + database, not static-site

Built for "me + a small invited group" *and* for "real students/clients eventually." That rules out a localStorage-only build (which would have been the PreIB pattern). FastAPI backend, SQLite for dev, Postgres for any real deployment.

**Reason**: a static-site v1 would have required a migration to add accounts and per-user history later, and the AI marking step needs a server anyway to hold the Anthropic API key.

---

## 2026-05-12: Share OAuth client with Memoriser; piggyback its identity

Use the existing GCP project (`PupilLoginforQuestionSets`) and add a redirect URI for Linguics, rather than creating a fresh client. Two databases for now, each with its own `users` table keyed on `google_sub`. Single sign-on across both is deferred until they share a parent domain.

**Reason**: Smith asked for this directly. Memoriser has the auth code already written; cribbing it shortens the v1 path. Two-database independence keeps deployment simple.

---

## 2026-05-12: Bucket taxonomy is a tree, not a flat list

The earlier draft had 15 top-level groups with `group.specific` two-level ids. That was a sketch, not a design. The actual taxonomy is a tree of arbitrary depth, with parent_id links between nodes. A bucket can be a category (`adjective_agreement.o_class.feminine`) or a word-specific gotcha (`adjective_agreement.special.grande_prenominal`). Both are first-class.

**Reason**: Smith's adjective-agreement worked example showed that the right granularity goes down to "the i ending of an -e-class adjective in the feminine plural" and to "the position-shift on grande." Two levels is nowhere near enough.

**Implication**: the `buckets` table gains a `parent_id` column. Bucket ids are dot-separated paths that mirror the parent chain (for human readability), but the parent_id link is the authoritative one. Authors can specify either; the import resolves the other.

---

## 2026-05-12: CEFR-conditional importance per bucket

Importance is not one number per bucket; it's a function of (bucket, learner level). A bucket is `core` at the level it's typically taught, `review` at later levels, `preview` at earlier levels. Used by the UI to decide visual prominence and by the question picker to decide weighting.

**Reason**: Smith's distinction between "what someone at B1 should be getting right" and "what's interesting but optional at B1" maps to a CEFR-level dimension. A B2 learner still sees A1 buckets, just muted.

**Implication**: the `buckets` table gains a `cefr_importance` JSON column with shape like `{"A1": "core", "A2": "core", "B1": "review", "B2": "fluency", "C1": "fluency", "C2": "fluency"}`. The values `core`, `preview`, `review`, `fluency`, `arcane` are the importance bands (defined in DESIGN.md).

---

## 2026-05-12: Bucket prerequisites

A bucket can declare other buckets as prerequisites. The system uses this to soften prompting for the dependent bucket when the prerequisites aren't reasonably mastered. "Don't show me articulated prepositions until I have a handle on basic prepositions."

**Reason**: some things are usually prior to others. Surfacing the dependent thing before the prior makes the feedback noise; surfacing it after, with prerequisites understood, makes the feedback useful.

**Implication**: the `buckets` table gains a `prerequisites` JSON column (array of bucket ids). The "don't prompt" logic is soft: prerequisites not met means muted prompting, not zero prompting.

---

## 2026-05-12: No partial credit; two-dimensional score (attempted × correctness)

Replace the `outcome ∈ {full, partial, none}` with `credit` model. Per markpoint, store two numbers:

- `attempted_credit` (0 to 1): how much of what was expected in this bucket's slot did the learner produce content for?
- `correctness_credit` (0 to 1, null if not attempted): given what the learner produced, how accurate was it?

A learner who skips the verb entirely has `attempted=0`, `correctness=null`. A learner who attempts the verb but gets the wrong auxiliary has `attempted=1`, `correctness ~ 0.5`. A learner who nails it has both = 1.

The product is the "credit" number when one is needed; the dimensions remain separately visible.

**Reason**: Smith's direct feedback. Partial credit collapses two distinguishable failure modes. The two-dimensional model preserves the diagnostic distinction.

**Implication**: the `markpoint_events` table replaces `outcome` and `credit` with `attempted_credit` and `correctness_credit`. A derived `outcome` view (categorical: `not_attempted | hit | partial | miss`) is generated for UI convenience but isn't the source of truth.

---

## 2026-05-12: Decay is computed, not stored

Mastery on a bucket is determined by the most recent markpoint events. Decay (time or session) is a halo/annotation computed at view time, not baked into the stored mastery number. Two flavours, both visualised separately:

- **Time decay**: months / weeks since last event for this bucket.
- **Session decay**: count of sessions for this user since the last event for this bucket, where "session" is one in which the bucket could have been tested (a strand was active that touches it).

Neither rewrites the stored mastery. Both decay halos can be turned on or off in the UI.

**Reason**: Smith's direct feedback. Baking decay into mastery would create the Anki-style "you have 247 reviews due today" problem. Decay as annotation lets the learner see "I have a 6 here, but I haven't seen it in 6 months" without the system silently dropping the score to a 4.

---

## 2026-05-12: AI can propose new buckets

The AI marker prefers existing registered buckets. But when its observation doesn't fit any of them, it proposes a new bucket id (path-style, with a registered parent) and the proposal lands in `draft_buckets` for author review. Promoting a draft adds it to the registry; merging folds it into an existing bucket; rejecting discards it.

The earlier draft was more restrictive ("the AI cannot invent buckets"). That was wrong. Closing that path closes the route to taxonomy improvement.

**Reason**: Smith's direct feedback. The AI is the system's main source of information about real-world miss patterns the author hasn't yet thought to bucket. It should be allowed to suggest, with the safety of author review.

**Implication**: `draft_buckets` table; `/authoring/buckets/drafts` review endpoint; AI prompt updated to encourage proposal under the existing parent namespace when no exact bucket fits.

---

## 2026-05-12: Unclassified observations are for taxonomy growth, not learner feedback

The translation AI sometimes observes something that doesn't fit any existing bucket. These observations are primarily for the author's review queue, where they drive bucket-registry improvement. They are not a learner-facing feedback channel.

Originally I had imagined them as a learner sidebar ("here are some other things I noticed about your answer"). That was a misread.

**Reason**: Smith was clear: the point of unclassified observations is "I spotted something, there was nowhere really to put it, so I'm writing it down here, and we can review and go, oh right, yeah, we should really have space for that. That's how this thing gets better." They feed the taxonomy, not the learner.

**Implication**: route unclassified observations to the same review surface as bucket proposals (probably the same queue with a different kind). The learner sees them only if a reviewer chooses to surface them as a new bucket and the bucket subsequently fires for that learner.

---

## 2026-05-12: AI bucket proposals always go through the review queue

There is no shortcut. Any bucket id the AI emits that isn't in the registry is a proposal, and proposals must be reviewed and promoted (or merged or rejected) by an author before they become first-class. The attempt's markpoint event uses the proposed id pending review, but the bucket isn't part of stats aggregations until promoted.

**Reason**: Smith's restatement of the rule from the previous round. Worth pinning explicitly so it doesn't drift back to "the AI can use new ids inline if confident."

---

## 2026-05-12: `attempted_credit` is binary in v1

A markpoint either fires (attempted=1, with `correctness` 0 or 1) or it doesn't (attempted=0). No fractional `attempted=0.5` cases at v1.

Where finer detail matters, e.g. the learner produced the right stem but missed the ending, the answer is *not* to make `attempted` fractional. The answer is to split the skill into sub-buckets, so the stem and the ending are their own markpoints. Granularity is captured in the taxonomy, not in fractional credit.

**Reason**: Smith's direct call. "There's more capturable there, but you would want that captured in sub-buckets." Plus: a binary attempted-credit is what the AI can actually judge reliably; fractional asks too much of the AI's calibration.

**Implication**: the data model still allows fractional values for future flexibility, but v1 marker output is 0 or 1. Update the marker prompt accordingly.

---

## 2026-05-12: Level-weighted rollup uses ordinal weights (option 1)

For mastery rollup on an aggregate bucket, the importance bands carry ordinal weights, defaulting to: `core=4, preview=3, review=2, fluency=1, arcane=0.5`. Whole numbers (with one half-step at the bottom) rather than fractional weights. Individual rollups can override with per-(bucket, level) weights when the default isn't right.

**Reason**: Smith's pick (option 1 from the three on the table). Plus a note that not every dimension needs in-between fractional values, integers are clearer.

---

## 2026-05-12: Aggregate-node markpoints are permitted

A markpoint can fire on an internal-tree node (an aggregate bucket), not just on leaves. Authoring guidance discourages it where a leaf would do, but the data model allows it.

**Reason**: Smith's call ("aggregate and permissive"). Some real observations live at the aggregate level (e.g. "the learner produced something gender-marked but it's hard to tell which leaf"), and the schema shouldn't fight that.

---

## 2026-05-12: Inline annotations on translation attempts (first-class)

Translation attempts support inline annotations: per-segment metadata tags inside the learner's text that flag confidence, sense-pursuit, or deliberate stylistic stretch. Multiple confidence degrees (mild / medium / strong). Three primary kinds:

- `guess`: the learner is uncertain about this segment. Mark me, but be more diagnostic than penal.
- `sense`: the learner is going for meaning rather than literal mapping in this segment.
- `flair` (or `stretch`): the learner is deliberately reaching for an idiomatic / stylistic equivalent. They know the safe choice and chose this one.

The attempt-level `intent` (literal / guess / sense) remains as a default stance, but inline annotations are the more granular and more useful primitive.

**Reason**: Smith's direct feedback. The example: a learner who writes "in bocca al lupo" instead of "buona fortuna" doesn't want the system to think they don't know "buona fortuna." They want the system to know they chose the idiom on purpose. Symmetric example on the EN→IT side and for guessing.

**Implication**: a new sub-section in DESIGN.md §5.2 covers syntax, parsing, AI behaviour, storage, UI. Initial syntax proposal: HTML-style tags (`<g>...</g>` / `<s>...</s>` / `<f>...</f>` with optional `level="1|2|3"`). Authoring tool surfaces UI buttons; learners can also type the tags directly. The AI is given the parsed segments alongside the raw attempt.

---

## 2026-05-12: Intent (and inline annotations) do not gate which buckets fire

A learner writing "È andato al mercato" without "lui" is not marked wrong for the missing subject pronoun, regardless of intent. Italian commonly drops subject pronouns; this is correct Italian. Intent and annotations affect the AI's feedback tone, its willingness to praise stylistic reach, and whether a miss is recorded "softly" (for `guess` tags); they do not turn correct output into miss-buckets.

**Reason**: Smith was explicit. "That's really not what this is about. You don't want someone being marked wrong or anything for è andato al mercato."

**Implication**: drop the `literal_match.*` bucket group from the taxonomy entirely. Update the AI marker prompt: do not penalise non-literal-but-correct renderings. The `sense` group stays, but its purpose is to mark *meaning-fidelity misses* (the learner produced something that means something other than the source), not to be the "you weren't literal enough" bucket.

---

## 2026-05-12: Grammar markpoints stay rule-light

The deterministic substring-engine works well for short answers with one or two right forms and one or two diagnostically interesting wrong forms. It does not work well for grammar markpoints that need many rules to capture the answer space. When a markpoint starts needing more than a handful of `any_phrases` or `must_not_include` entries, the right answer is to either split the markpoint into sub-markpoints or move it to AI-marked.

The optional `attempted_hints` mechanism stays in the schema for the rare diagnostic case, but is not the default authoring practice.

**Reason**: Smith. "Trying to capture long-form stuff with a load of rules just ends in tears. It's got to be one or two things if you're going to have rules about it."

---

## 2026-05-12: Accent input UX, with canonical rendering

Italian accents are part of the right answer. Learners need to be able to produce them even on keyboards that don't have them natively. The plan:

1. **On-screen keyboard buttons** for the Italian accent set (à, è, é, ì, ò, ù plus uppercase variants). Visible below the answer input, clickable to insert at the cursor.
2. **Apostrophe shortcut**: typing `e'` is interpreted as `è` (or `é` depending on disambiguation; default `è` for "is", with a small hint when ambiguous). The learner sees the canonical accent rendered live in their input as they type the shortcut.
3. **Keyboard-shortcuts** for those who prefer them (e.g. Alt-E for `è`).
4. The display of the canonical accent is mandatory: whatever the input method, what the learner sees in their input field is the proper accent, not the apostrophe-style shortcut.

For marking: strict-with-typo-tolerance. The marker tries the accented form first; on miss, retries with accent-folded comparison; if that succeeds, gives partial credit on the markpoint and additionally fires an `orthography.accent_*` markpoint as a miss for the specific accent.

**Reason**: Smith directly. "We're going to need a way to let people put the accents in, whether that's just putting an apostrophe on, but they should be able to see the accent."

---

## 2026-05-12: Near-synonym translation references are hybrid

The author lists their accepted reference translations (1 to 3). The AI judges near-equivalence beyond that list. If the AI under-credits a learner's equally-good rendering, the learner can flag the attempt "I think this was right" and an author reviews. Approved learner-flagged variants are added to the references.

**Reason**: Smith confirmed the hybrid recommendation directly.

---

## 2026-05-12: Extended writing (paragraph-plus) deferred to v2+

V1 stays at one-sentence translations. Multi-sentence paragraphs and essay-style attempts are out of scope until the one-sentence shape is solid and we have real data on how the marker behaves.

**Reason**: Smith. "Extended writing much later."

---

## 2026-05-12 (follow-up): Author-chat feedback resolutions

After dispatching both author chats and receiving their feedback (ARCHITECTURE_FEEDBACK_adjective_agreement and AUTHORING_FEEDBACK_passato_prossimo), the following calls have been made.

### Default content counts: guide, not contract

The brief's 30 grammar / 15 translation defaults were too low. The chats produced 134 + 30 (passato) and similar for adjective. The new guidance: aim for several questions per active leaf bucket, with extras on hot-spots; the dispatching chat may override per topic. Avoid prescriptive ceilings. Authoring chats should produce until coverage feels honest, not until a count is hit.

### CEFR is a steer, not a gate

Authoring covers the whole topic comprehensively. Each item is tagged with its `cefr_level_target` for runtime filtering. The dispatcher may suggest a weighting but should not narrow content to one band. Both chats independently surfaced this; the user confirmed.

### Vocab vs grammar disambiguation: accept the schema; slash-shortcut UI

A grammar item may add a `vocab_words` array (one or more Italian/English words the prompt references). The UI provides a slash-style keyboard shortcut (working name `/T`, exact syntax to be decided) that lets the learner declare "I don't know this word" from inside the answer field, before or after the answer. When flagged, the marker attributes the miss to a vocabulary bucket instead of (or in addition to) the grammar bucket.

**Implication**: items optionally carry `vocab_words: [{ word, language }]`. The UI listens for the shortcut in the answer field, and presents a checkbox per word once detected. Schema-level decision accepted; UI decision deferred until first translation strand build.

### Cross-cutting translation taxonomy: scheduled

A separate session will produce the cross-cutting buckets that translation items naturally reach for: `article.*`, `preposition.*`, `pronoun.*`, `word_order.*`, `register.*`, `idiom.*`, `discourse.*`. Until then, translation items may reference these as forward-declarations; the marker warns but does not reject.

### Auxiliary-choice family question: resolved via new bucket

The PP chat's preferred fix for "right family, wrong person" misses was a new `verb_form.passato_prossimo.auxiliary.person_agreement` bucket. Accepted and added.

### Substring matching for single-character endings: engine extension, not authoring workaround

Don't bend the question shape to fit the engine. The engine should gain a `match_at: "end"` qualifier (or similar) so a markpoint can target a single-character ending without false matches. To be implemented when the grammar engine is touched next.

### Partial credit on alternatives: accept

A markpoint's `any_phrases` can be expressed as objects with credit instead of bare strings, e.g. `[ { phrase: "visto", credit: 1.0 }, { phrase: "veduto", credit: 0.8, note: "archaic but grammatical" } ]`. The engine awards the highest matching credit. Strings stay supported as the equivalent of `{ phrase, credit: 1.0 }`. This is also the mechanism for `accept_with_note` style cases.

### Negative reference translations: still open

The PP chat raised this; the user is undecided. Left in OPEN_QUESTIONS.md.

### Severity field: dropped for v1

Both chats defaulted to `minor` everywhere because there was no rubric. The field is dropped from the v1 ingestion. Re-add later with an explicit rubric when versioning UX is built.

### examiner_note convention

Required when an item has more than one markpoint or where the miss interpretation is ambiguous. Otherwise optional. Captured in the brief; authoring chats followed this convention without being told.

### Off-tree bucket references

Warn during authoring, strict at production load. Allows translation items to forward-reference cross-cutting buckets that haven't been authored yet.

### topic_short canonical metadata

Each topic's bucket-tree root carries `attributes.topic_short` (e.g. `aa` for adjective_agreement, `pp` for passato_prossimo). external_ids use this to avoid collisions across chats.

### Ratified bucket additions (adjective tree)

- `stem_changes.predictable`: `cio_ci`, `gio_gi`, `cia_ce`, `gia_ge` (four new leaves)
- `stem_changes.irregular`: `amico_amici`, `greco_greci`, `antico_antichi` (three new leaves)
- `mixed_gender_plural_defaults_masculine` (sibling of o_class / e_class)
- `invariable` aggregate, with `colour_from_noun`, `compound_colour`, `pari_family` (three children)
- Typo in `e_class.feminine_plural.attributes.common_miss` fixed.

Position semantic-shift word-leaves (vecchio, grande, povero) deferred; the aggregate works.

### Ratified bucket additions (passato_prossimo tree)

- `auxiliary.person_agreement`
- `auxiliary.modal_inheritance`
- `adverb_placement`
- `translation_mapping.en_simple_past`
- `translation_mapping.en_present_perfect`
- `participle_agreement.with_avere.preceding_partitive_ne`
- `participle_agreement.with_essere.mixed_gender_default`

`conoscere_conosciuto` and `stem_expansion_class` deferred; both are optional clean-ups.

---

## 2026-05-15: Lemma key conventions (vocab_help and bucket-id slot)

Triggered by the adjective chat's vocab-reference audit, which surfaced inconsistencies (diacritic stripping on `città` and `opportunità`, an outlier capitalisation on `Rinascimento`, asymmetric aspect coverage on a few mixed-gender pairs). Codifying the conventions explicitly so subsequent dispatches don't drift.

Seven rules now in AUTHOR_BRIEF.md §2 (under "Lemma key conventions"):

1. Carry the citation form's full diacritics (`città`, not `citta`).
2. Lowercase the key, capitalise the reveal (`rinascimento` as key, `Rinascimento - Renaissance` as reveal).
3. Multi-word invariable items use underscores (`blu_marino`, `verde_acqua`).
4. Inflected and elided surface forms point at the canonical lemma (`sant'` to `santo`, `mele` to `mela`, `mezza` to `mezzo`, `begli` to `bello`); each surface form gets its own `vocab_help` entry as a matcher hook but with the canonical lemma's bucket.
5. Past participles point at the infinitive (`apprezzata` to `apprezzare`).
6. Adjective lemmas don't carry a `gender` aspect; the agreement test makes it a giveaway and the adjective stem's gender wouldn't reveal anything useful anyway.
7. Mixed-gender pairs are separate lemmas (`cugino` and `cugina` each get their own `translation` and `gender`).

The brief is now at Revision 3. The adjective chat is being asked to revise its content against these rules (REPLY packet) so the adjective batch becomes the canonical reference. Subsequent dispatches (the in-flight vocab-frequency chat especially) should follow rev 3 directly.

**Why:** Without an explicit rule on diacritics, the chat defaulted to ASCII-friendly keys, which broke the clickable-word matcher's substring match against unicode prompt text. Without a rule on participles, two participles in different items could end up under separate buckets (one under the participle form, one under the infinitive) and the diagnostic data would be split. Codifying the conventions in the brief, not just the reply packet, makes the next chat consistent without round-tripping.

---

## 2026-05-15: Communicate via friendly bucket labels, not bucket ids

In prose addressed to the project author (coverage reports, replies, feedback, decision questionnaires, any human-facing summaries), all references to buckets must lead with the bucket's `label`, not its dot-separated `id`. The id can appear parenthetically when precision is required, in code blocks (because that's data), or in lists for action ("please rename X to Y"). In running sentences for human consumption, the id is wrong.

Codified in AUTHOR_BRIEF.md §7 (new in Revision 3), with worked examples.

**Why:** The project author flagged that bucket id strings like `verb_form.imperfect.discrimination.modals.sapere` and `pronoun.combined.glielo_family` are dense and jargon-heavy. Reading reports full of them is friction. The bucket `label` field exists for human readability; the id is the engine's identifier. Using the id when speaking to a human elides the affordance the label provides.

**How to apply:** Across all chats, all documents, all prose. Memory should reflect this so the project agent applies it too. Chats with revisions in flight should be told, but the rule applies to all subsequent communication regardless.
