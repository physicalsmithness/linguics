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

---

## 2026-05-26: Housing-chat tactical calls (retro-ratified)

Between roughly 2026-05-13 and 2026-05-26, the housing chat made several architecture-flavoured calls in flight while implementing the heatmap, the vocab tab, the live AI marker, and various engine fixes. The architect chat was effectively dormant during this period and the housing chat carried the load. These calls are now retro-ratified as canonical.

### Vocab translation bucket: .active / .passive direction variants

Vocab translation buckets carry a direction suffix indicating which skill the event evidences. `vocabulary.it.<lemma>.translation.active` records active production (the learner produced the Italian word from their own knowledge); `vocabulary.it.<lemma>.translation.passive` records passive recognition (the learner translated the Italian into English). Gender, article-form, and other vocab aspect buckets stay single-axis (production-only) because recognition of gender or article-choice isn't a meaningful demonstration of those skills.

**Why:** Active and passive vocabulary are distinct skills. Conflating them in a single bucket hides the asymmetry that most learners read in one direction far more than they can produce in the other. The split lets the heatmap show both signals independently.

**Implication:** The housing's marker logic infers direction from the item and the answer source (translation prompt vs grammar item where the lemma was cued vs translation item where the lemma was retrieved) and fires the appropriate variant.

### Grammar bucket attribute: direction (production_only / bidirectional / recognition_only)

Each grammar bucket in the canonical bucket trees (adjective_agreement, verb_form.passato_prossimo, verb_form.imperfect, pronoun, tense_choice) carries an `attributes.direction` field with one of three values. The translation-marker filter uses this to decide which buckets are even candidates for firing on a given item: a `production_only` bucket like `pronoun.combined.glielo_family` is dropped from the candidate set on an IT→EN item because nothing about the learner producing English demonstrates that they can produce the combined clitic cluster in Italian.

**Why:** Without this, IT→EN translation attempts kept firing Italian grammar buckets that the learner had no opportunity to demonstrate, inflating mastery scores and obscuring the actual skill being practised.

**Implication:** Future grammar bucket additions must carry the `direction` attribute. Default is `bidirectional` (covers most cases like translation_mapping or usage); `production_only` for form / agreement / position rules; `recognition_only` is rare and case-by-case.

### Recency-weighted mastery: asymmetric 7/3 formula

A bucket's mastery is computed from its events with the most recent event weighted at 7 and each prior event weighted at 3. If the most recent event was wrong, all prior events contribute (a long history of rights can lift the mastery back above 0.3). If the most recent was right, only the previous three priors contribute (a weak history can't drag a recent right below ~0.44).

**Why:** The formula reflects two pedagogical intuitions: a recent miss matters more than past hits (so mastery dips when you forget), and a recent hit shouldn't be dragged down indefinitely by an old miss-streak (so mastery climbs as you re-learn). The asymmetry between the two cases captures the directionality.

**Implication:** Mastery is recomputed on demand from event history; no pre-aggregated value is stored. The colour gradient on the heatmap reads off this number.

### Article-form bucket on EN→IT noun marking

When a learner types a noun in EN→IT with a definite or indefinite article (e.g. `il padre` instead of `padre`), the article is parsed and assessed against the expected phonological form for the lemma's gender and number. A separate bucket `vocabulary.it.<lemma>.article_form.active` records whether the article-choice was correct. The translation hit fires independently if the noun itself is right.

**Why:** A learner who writes `il zaino` has the gender right (zaino is masculine) but the wrong phonological form (should be `lo zaino` because of the s-impura cluster). Conflating gender and article-form would lose this distinction.

**Implication:** The expected-article logic (lo before s-impura / z / gn / ps / x / y / i+vowel; l' before vowel; il elsewhere for masculine; la before consonant and l' before vowel for feminine) lives in the housing as `expectedArticlesFor(lemma, gender)`.

### Vocab-help slash-command UX

In any prompt, the learner can type `/` to surface a small popup menu offering help on each lemma in the prompt for which the vocab data has an aspect available (translation, gender, plural, conjugation, etc.). Selecting a help reveals the answer for that aspect and records a miss event against the corresponding bucket.

**Why:** Distinguishes "I knew the rule but didn't know the word" (vocab miss + grammar hit) from "I didn't know what the question was asking" (everything misses). The slash command is keyboard-friendly so the learner doesn't have to leave the input field.

**Implication:** Helps are only meaningful where the answer doesn't directly test that aspect (no `plural` help on a question whose answer is the plural; no `auxiliary` help on a question whose answer is the auxiliary). The brief codifies the rule.

### Weighted deck for vocab: weight = 1.1 - score

When the vocab deck refills, each entry's weight is computed as `1.1 - own_mastery`. Untouched entries get weight 1.1 (the maximum); fully-known entries get weight 0.1. Selection is weighted-random without replacement, so every entry surfaces before any repeat, but the unmastered ones surface sooner.

**Why:** Spaced-repetition lite. The 11:1 ratio favouring unknowns is enough to make the deck feel like it's targeting weak spots without being so aggressive that known words never recur (some recurrence keeps mastery honest).

### Cross-sense IT→EN full credit (SUPERSEDED 2026-05-27)

Original ruling: when the learner gives a different sense's translation in IT→EN (e.g. `lucky` when asked about the noun `fortunato`), the asked-for entry fires HIT at full credit with an info note about the other sense. Superseded today by the asymmetric tracking and hard-disambig rules below: the asked-for entry now fires MISS in the hard-disambig case (where POS-in-parens or article-on-gender-split has named the specific sense being asked about); the matched sister entry stays untouched. In soft-disambig and no-disambig cases the matched entry fires hit instead.

---

## 2026-05-27: Marker semantics, the four-part ruling

Triggered by FEEDBACK_for_architect_chat.md item 13 with two updates (ma/però case, fortunato case) and ARCHITECTURE_FEEDBACK_vocab_layer_2026-05-27.md §3. Full ruling in `inter_chat/Architecture_Vocab_marker_semantics.md` v1; the housing-side implementation note is in `inter_chat/Architecture_Housing_marker_semantics.md` v1.

### Union acceptance for the marker

When the marker asks about a lemma (IT→EN), it accepts any translation_en element from any entry whose lemma matches the prompt. When the marker asks for a translation (EN→IT), it accepts any lemma whose translation_en contains the prompt gloss as an element. The acceptance set is a union across matching entries, not a single canonical entry's value.

**Why:** Resolves the il/lo problem (typing `il` when asked for "the" should hit because il is a valid translation of "the") and the fortunato problem (typing `lucky` when asked about fortunato should hit because lucky is a valid sense of fortunato).

**Implication:** Subject to the hard/soft disambiguation discipline below. Hard disambig collapses the union to a single asked-for entry.

### Asymmetric per-entry mastery tracking

Hits fire forward to the matched entry. Misses fire backward to the asked-for entry.

If the learner's answer matches a different entry from the one the question was rendered from, the matched entry's mastery advances; the asked-for entry stays untouched. If the learner's answer matches no entry in the union, the asked-for entry fires miss; no sister entry is touched.

**Why:** Per-entry tracking is honest only if the entry whose mastery advances actually corresponds to what the learner demonstrated. Crediting the asked-for entry for an answer the learner didn't give to that entry inflates its mastery; firing miss on a sister that happened to match a wrong-sense answer penalises a skill the learner wasn't being tested on.

**Implication:** Requires the bucket-id shape to actually distinguish per-entry (see POS-included bucket-id ruling below). Also overturns the housing's previous cross-sense full-credit implementation.

### Hard / soft disambiguation regime

The marker has three regimes that determine whether union acceptance applies.

**Hard regime:** the prompt names a specific entry whose sister entries have different meaning. POS-in-parens for POS-distinguished lemmas ("What does fisico mean (as a noun)?"). Article-on-gender-split noun in IT→EN ("What does la fine mean?"). Under hard regime, no union acceptance and no cross-sense credit. The asked-for entry is the only one that fires. Hit if matched, miss if not.

**Soft regime:** the prompt hints at one form whose sister forms have same meaning. Gloss disambiguation for collisions ("What's the Italian for 'the (m sg, before s+cons)'?"). Under soft regime, union acceptance applies: the matched entry fires; asked-for stays untouched if different.

**No-disambig regime:** ambiguous prompt with no clarifier. Full union acceptance plus asymmetric tracking plus partial credit per the overlap formula.

**Why:** The discipline is "same meaning across sister entries → soft; different meaning → hard". Hard disambig is the marker's way of saying "I'm specifically asking about THIS sense, give me THIS sense"; rewarding a sibling-sense answer there miseducates.

### Partial credit on cross-lemma matches: overlap-over-target

When the supplied answer matches a different entry from the asked-for target in a no-disambig or soft-disambig regime, partial credit fires on the supplied entry per the formula:

```
credit = |overlap(supplied.translation_en, target.translation_en)| / |target.translation_en|
```

Target sets the denominator. No floor. If overlap is zero, the supplied entry doesn't fire at all; the target fires miss per the miss-asymmetry rule.

**Why:** Captures partial demonstration cleanly. Stateless (doesn't depend on the learner's existing mastery state, unlike earlier proposals). The target sets the denominator because the prompt is the thing being addressed; how well the answer covered what was asked is the meaningful metric.

**Implication:** Translation_en values are now load-bearing for partial credit. Accurate, comma-correct values matter.

### Equivalence-class field

Optional `equivalence_class` string id on entries. Members of the same class are fully interchangeable lemmas (`solo`/`soltanto`/`solamente` for "only"; `qui`/`qua`; `lì`/`là`; `eccetera`/`ecc.`). Marker behaviour for class members: matched entry fires at full credit, asked-for stays untouched, info note nudges the learner to practise the asked-for entry specifically.

**Why:** Under union acceptance plus the overlap formula, truly-interchangeable lemmas already get 100% credit on cross-class hits because their translation_en values are identical. So the field is not load-bearing for marker correctness. It exists to gate the wording of the info note (truly-interchangeable nudge vs near-equivalent nuance note) and to enable class-aware visualisation in the heatmap.

**How to apply:** Vocab chat populates where the lemmas are unambiguously interchangeable; null elsewhere. Don't populate for near-equivalents like `ma`/`però`; those are partial-credit cases.

### POS-included bucket-id shape for vocab buckets

Bucket-id shape for vocab is `vocabulary.it.<lemma>.<pos>[.<gender>].translation.<direction>`. Gender is included only when needed for disambiguation (when a lemma has multiple entries of the same POS distinguished by gender). POS is always included even for lemmas with one entry, so that any entry newly split later doesn't silently change its bucket id and lose history.

Same shape for `.gender`, `.article_form`, and any future vocab aspect buckets.

**Why:** Per-entry mastery tracking requires bucket ids that distinguish entries. The unique entry key is `(lemma, pos, gender)` per FEEDBACK item 1; the bucket id reflects that.

**Implication:** Housing migration required. Drop the old vocab event history (same pattern as the earlier .active/.passive split migration). Existing aggregate-bucket roll-ups (`vocabulary.it`, `vocabulary.it.freq_X_Y`, themes) keep working because they aggregate over per-entry buckets via prefix match.

### Article-prepending for gender-split nouns in IT→EN

When rendering an IT→EN prompt for an entry that is part of a gender-split lemma (same lemma + same POS + multiple entries differing by gender), the prompt prepends the appropriate article. "What does la fine mean?" or "What does il fine mean?". The article hard-disambiguates the sense.

**Why:** Gender-split nouns have different meanings (`fine` f "end" vs `fine` m "aim"). Without disambiguation, IT→EN against the bare lemma is ambiguous and the asymmetric tracking + union acceptance handle it gracefully (any sense accepted, matched entry advances). With disambiguation, the prompt commits to one specific sense, hard regime applies, wrong-sense answers are pure misses on the asked-for entry. The pedagogical signal is stronger.

---

## 2026-05-27: Other vocab-layer open questions

Triggered by ARCHITECTURE_FEEDBACK_vocab_layer_2026-05-27.md §6 questions 2 through 8. Full ruling in `inter_chat/Architecture_Vocab_other_open_questions.md` v1.

### Parent + child theme tagging

Entries tagged with a sub-theme (`food_fruit`) also carry the parent (`food_drink`). Storage cost is trivial; consumer queries don't need to walk the hierarchy.

### Sub-themes for body, city_places, transport, people_roles

All four ratified. Cleavages per the vocab chat's proposal (head_parts / limbs / organs for body; civic / religious / commercial for city_places; vehicles / infrastructure / actions for transport; profession / official / service / creative / religious / military_law / education / medical for people_roles), with the vocab chat's judgement on exact cuts.

### POS-default themes kept visible to learners

Categories like `verb_action_general` and `noun_abstract` stay visible in theme-filtered browsing. The vagueness concern (an 800-entry "Action verbs (general)" theme is not pedagogically meaningful) is outweighed by the navigation value (the learner can drill into the theme by frequency band).

**Why:** Explicit user override of the architect chat's initial lean (which had been to hide them). User's reasoning: "What they can do is to filter them by their frequency, and that is perfectly fine, so I wouldn't be hiding them."

### [skip] marker as marker contract

The marker considers only entries where `translation_en` is non-null AND `translation_en != "[skip]"`. `[skip]` entries (tokenisation noise, English leak-throughs, proper-noun-only entries, wrong-POS artefacts) plus null-translation entries (the 3,944 untranslated-tail entries) are excluded from question selection.

**Why:** Formalises the convention the vocab chat has been applying. Marker correctness depends on it.

### Polysemy over-tagging accepted as informational

Lemma-themes lookup is keyed on lemma only, so polysemes get all senses' themes (`lavoro` carries both `work_business` and `science_physics`). Accepted as-is. Revisit if learners complain about a theme being polluted by off-topic entries.

### noun_class enum

Nine classes ratified: `regular_o_masc`, `regular_a_fem`, `e_ambiguous`, `greek_ma_masc`, `ista_common_gender`, `irregular_gender`, `gender_shift_plural`, `invariable_accented_final`, `invariable_loanword`. Implicit tenth: `null` (or omit) for non-nouns. Extensions case-by-case if new recurring families emerge.

### Plural definite article gap-fill (i, gli, le)

Vocab chat asked to add three new entries (`i`, `gli`, `le` as articles) with the article gloss-disambiguation pattern from PATCH_REQUEST_for_code.md item 2. The three plural articles are absent from the curated JSON (simplemma collapses them upstream during the initial lemmatisation) but they're among the most common words in Italian and need to exist as askable entries.

---

## 2026-05-27: Inter-chat communication protocol

All inter-chat communication goes through shared versioned files in `inter_chat/`. Filename pattern `<ChatA>_<ChatB>_<topic>.md` with chat names alphabetical. Versioning lives inside the file as `## v1, date, Chat` section headers, with the filename stable across versions. Status header at top (OPEN / CLOSED). Every chat checks for new versions on relevant open threads at the start of each turn and summarises in chat alongside any write. No paste-blurbs.

Full convention documented in `INTER_CHAT_PROTOCOL.md` at the project root. The `inter_chat/` directory is gitignored.

**Why:** The previous convention (separate REPLY_TO_*, NOTE_TO_*, FEEDBACK_*, etc. files at the project root, with paste-blurb instructions to the user) proliferated files and made conversation history hard to follow. The shared-file-per-pair-per-topic model gives each topic a single thread with versioned turn-taking, the user routes between chats but stays in the loop via in-chat summaries, and the project root stays clean for substantive docs.

**How to apply:** Every chat reads `INTER_CHAT_PROTOCOL.md` once when first routed. The architect chat's session memory carries the rule; other chats pick it up when the user routes them. Legacy files (REPLY_TO_*, NOTE_TO_*, FEEDBACK_*, BRIEF_for_*, DISPATCH_*, ARCHITECTURE_FEEDBACK_*, DECISIONS_FROM_*, REQUEST_to_*, PATCH_REQUEST_for_code*) at the project root are grandfathered and stay as the historical record.

---

## 2026-05-29: Unique-key extension to include number

The vocab unique-key rule from the v1 ratification was `(lemma, pos, gender)`. Extended today to `(lemma, pos, gender, number)`, with `number` optional and added only when needed for disambiguation (same convention as gender).

Bucket-id shape extends in parallel: `vocabulary.it.<lemma>.<pos>[.<gender>][.<number>].<aspect>[.<direction>]`. Each optional segment is included only when needed for that lemma's set of entries.

**Why:** The Italian clitic pronoun `le` serves both the feminine-singular indirect-object sense ("le dico" = I say to her) and the feminine-plural direct-object sense ("le vedo" = I see them, feminine plural). Both share `(lemma=le, pos=pronoun, gender=f)` so the v1 unique key collapses them, but they're pedagogically distinct entries with different translations and different usage rules. Adding `number` as an optional fourth discriminator is the natural extension; the field is already implicitly meaningful for many entries (nouns carry it via the singular/plural pair pattern) and making it explicit when needed for splitting is cheap.

**How to apply:** Vocab chat adds the two `le` entries discriminated by number. Future similar cases (any clitic or noun where same lemma+pos+gender splits by number into distinct senses) use the same shape. Housing updates `resolveVocabVariant` to include number in the bucket id when present on the entry. Other curator chats follow the extended convention when authoring vocab entries.

**Captured in:** AUTHOR_BRIEF.md §2 lemma key conventions rule 8 (Revision 5). Ratified in inter_chat/Architecture_Vocab_marker_semantics.md v4 with worked examples.

---

## 2026-05-29: Clitic pronoun gap-fill

Four clitic pronoun entries added to complete the disambiguation convention from earlier this month:

- `la (pronoun, f, sg)` — direct object "her, it"
- `gli (pronoun, m)` — indirect object "to him, to them"
- `le (pronoun, f, sg)` — indirect object "to her"
- `le (pronoun, f, pl)` — direct object "them" (feminine plural)

The `(direct object)` / `(indirect object)` clarifier from marker_semantics §7 explicitly covers clitic pronouns and couldn't be applied to half the family without these entries. The two `le` entries are the canonical motivating case for the unique-key extension above.

**Why:** Previously the only clitic-pronoun entries in the data were `lo (pronoun)` and `il (pronoun)` (which was an obsolete sense flagged for deletion). The feminine direct, the masculine and feminine indirect were missing. The marker rendering can't ask EN→IT about "her" or "to him" without entries to render.

**How to apply:** Vocab chat adds the four entries with `[clitic-pronoun-gap-fill]` notes, translation_source `vocab_chat`, provisional ranks in the top 50. Re-rank pipeline resolves precisely later.

---

## 2026-05-29: Loro split into pronoun + determiner

`loro` previously existed only as `pronoun` ("they, them; their"). Split into two entries: `loro (pronoun)` keeps "they, them"; new `loro (determiner)` carries "their".

Same shape as the other possessives (`mio`, `tuo`, `suo`, `nostro`, `vostro`) which already have det+pronoun splits per the recent disambiguation patch. The "their" sense was a determiner; stuffing it into the pronoun entry violated the split-by-pos rule.

**Why:** Consistency with the rest of the possessive family. The `(determiner)` / `(pronoun)` clarifier convention from marker_semantics §7 only works if both entries exist as separate rows.

**How to apply:** Vocab chat splits in the same pass as the clitic pronoun gap-fill.

---

## 2026-05-29: Hard-disambig mechanism for true homographs — no new mechanism, v1 ruling stands

Confirmed during the marker_semantics v4 round. True homographs (same lemma + pos + gender + number, distinct meanings — `ala` wing-of-bird vs wing-of-building, `gusto` taste-as-sense vs taste-as-pleasure) stay collapsed at the unique key. The marker handles them via union acceptance + asymmetric tracking; the `gloss_en` field carries the dual-sense reveal text.

No `sense_id` or other arbitrary discriminator is added. If a future case arises where two distinct entries share all of (lemma, pos, gender, number) AND we want them tracked separately for some pedagogical reason, reopen at that point. Not anticipated.

**Why:** The number-extension above covers the cases (like `le`) where disambiguation is genuinely available. True homographs where no morphological discriminator exists are rare; over-engineering for them would add a sense_id field that's almost always null. YAGNI.

---

## 2026-05-29: `un'` elided indefinite article entry added

Completes the indefinite-article set (un / uno / una / un'), parallel to the recent plural-definite addition (i / gli / le).

`un'` is the elided feminine singular indefinite article before a vowel ("un'amica"). Translation_en: `"a, an (f sg, before vowel)"`. `[elided-article-gap-fill]` notes pattern.

**Why:** The marker rendering can't ask EN→IT about the elided article without an entry to render. Same reasoning as i/gli/le.

---

## 2026-06-07: Cue chip discipline — chips name the surface, not the rule

AUTHOR_BRIEF criterion 13 added (Revision 6). Cue chips on grammar items must name the surface morphology of the wanted answer (tense, mood, person, number, gender, cluster shape) and must NOT name the structural rule that produces the answer.

Surfacing case: the negative-imperative item "Don't give it to me!" had a chip reading "Use: informal, infinitive form for negative tu". The chip named "infinitive", which IS the rule the item is supposed to test for B2 negative imperatives (non + infinitive). Right shape: "Use: informal, negative form for tu (with cluster)" — same disambiguation work without naming the rule.

Self-audit task added to OPEN_QUESTIONS.md: each author chat, on next opening, audits its batch for chip texts containing rule names and rewrites to name the surface only.

**Why:** The chip is the load-bearing instruction; if it names the rule the item is testing, the item stops testing the rule and starts testing vocab + inflection. Surfaced by a real learner-affecting case (the user identified the leak immediately on live test).

**How to apply:** When authoring or auditing a chip, check whether the chip text contains the name of the rule under test (infinitive, subjunctive, conditional, gerund, past participle, periphrastic constructions). If yes, rewrite to name the surface instead. If the rule name is the only sensible cue, move the item to a different bucket where the rule is given and the application is the test.

---

## 2026-06-07: Bucket-name leak — hybrid Option A + C ruling

Sibling pattern to the chip-text leak from criterion 13. When the BUCKET an item points at IS the rule (e.g. `usage.polite`, `usage.habitual`, `usage.background_with_pp`, `discrimination.modals.sapere`, `stylistic.colloquial_counterfactual`), the bucket-name shown in pre-answer surfaces (chip, breadcrumb, focused-practice header, in-flight cell tooltip) leaks the rule even when the chip text is clean.

**Ruling**: hybrid Option A + Option C. Surfaced via ImperfectAuthor's chip_suppression v1.

**Option A**: per-item `info_display: "suppress"` field on the item. Housing substitutes a topic-root generic label ("Imperfect drill", "Pronoun drill", etc.) in pre-answer surfaces; bucket name reappears post-answer with the explanation. Default-visible / opt-out-to-suppress so most items work unchanged.

**Option C**: rewrite the item as a constrained translation with explicit alternative-exclusion ("translate using a tense other than the conditional"). Makes the bucket-name leak harmless because the prompt has already opened the question of choice. Narrower skill being tested, but pedagogically natural for cases like the polite items.

**When to prefer C over A**: when the item recasts naturally as a constrained translation without becoming baroque. The polite-imperfect items are the canonical case: "translate 'I would like a coffee' using a tense other than the conditional" works cleanly. Most habitual / age-time-weather / discrimination items don't recast naturally; A is the fallback for those.

**Option B (parallel display_label field) rejected**. Adds parallel maintenance and removes pre-answer educational scaffolding without compensating benefit.

**Implementation**:

- Authoring side: `info_display: "suppress"` is now a recognised optional field on grammar items. AUTHOR_BRIEF Rev 7 will document.
- Housing side: thread `Architecture_Housing_info_display_suppress.md` v1 asks housing to honour the field with topic-root generic labels.
- ImperfectAuthor will apply: 3 items recast (C), 15-17 items get the suppress flag (A) across `usage.*` `discrimination.modals.*` `stylistic.*` buckets.

**Why:** The chip-text-leak criterion (13) addresses chip authoring but doesn't catch the bucket-name leak. Per ImperfectAuthor's audit, the bucket-name leak affects most usage and stylistic buckets and some discrimination buckets. Hybrid handling preserves educational scaffolding (post-answer reveal) while suppressing the pre-answer leak.

**How to apply:** When authoring or auditing an item whose bucket name describes a rule (vs a surface property like tense or POS), choose: recast as constrained translation if natural (C), otherwise set `info_display: "suppress"` (A). Default-visible behaviour is unchanged for items where the bucket name names a surface category.

---

## 2026-06-07: pos_shift items — MCQ shape ruling

Six adjective_agreement position-shift items (`adj_pos_shift_02/03/05`, `adj_pos_shift_vecchio_03`, `adj_pos_shift_grande_03`, `adj_pos_shift_povero_03`) converted from two-slot scaffold ("X ____ Y or X Y ____") to MCQ.

Smith ruled (c) MCQ directly. AdjectiveAuthor applied the conversion: prompt rewritten to "Which phrase means '...?'" with two choices showing the two orderings; markpoints retained with `any_phrases` matching the right-ordering noun phrase and `must_not_include` carrying the wrong ordering. One simplification: `adj_pos_shift_grande_03` dropped the gran allomorph from its `any_phrases` because MCQ doesn't offer a typing path for it (the gran allomorph belongs in a dedicated `special.grande_prenominal` item, not in this position-discrimination item).

**Why:** The two-slot scaffolding pattern violated §2.9 strictly (slots not in genuinely different sentence positions — same noun phrase). MCQ is the natural shape for "which ordering" tests and matches the two pre-existing MCQ items in the bucket (`adj_pos_shift_01` and `_04`). Conversion produces consistency across the bucket plus simpler marking.

**How to apply:** Future position-discrimination items within a single noun phrase should use MCQ from the start. Two-slot scaffolding is reserved for items where the two slots are in genuinely different sentence positions (different verbs, different clauses) per §2.9.

---

## 2026-06-07: vocab bucket-id <pos>-extension migration — architect-side batch script

Rev 5 of AUTHOR_BRIEF extended the bucket-id shape to `vocabulary.it.<lemma>.<pos>[.<gender>][.<number>].<aspect>[.<direction>]`. Existing batches reference vocab buckets in the older `vocabulary.it.<lemma>.<aspect>` shape.

**Ruling**: architect writes a batch script (Option (b) from AdjectiveAuthor's audit). Uses `data/vocabulary_it_frequency.json` as the canonical lemma → POS lookup. Walks every batch JSON's bucket fields, rewrites references with a single-POS lemma, flags ambiguous lemmas (multi-POS like `italiano` adj/noun) for per-batch author resolution rather than guessing.

Dry-run delivered as a per-batch sibling thread before commit so authors can spot-check.

**Why:** Per-chat migration would duplicate work and risk inter-chat inconsistency. Lazy on-read transformation hides the convention from new author chats. Batch script with one source of truth is the durable shape.

**How to apply:** Architect schedules the dry-run sweep within the next 1-2 architect passes. Until then, the marker's existing defensive code path (verified in stats_panel work) tolerates both old and new bucket shapes; items work today, migration is hygiene.

