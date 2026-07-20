# DECISIONS.md

## 2026-07-15 (late night): Smith's two accent rulings - the estate's accent policy is complete
**What:** (1) parlò/dormì: no_flag per criterion 19 (twins are wrong-person, not competing answers); executed, twins pruned; the estate carries exactly TWO accent flags: credé (same-person collision) and dì (attested variant). (2) AI translation marker: accent-only errors ALWAYS deduct a little (one small deduction per answer, house 0.9 texture, each error named in feedback; never a full fail on accents alone). Three graders, three written philosophies: vocab 50% strict / grammar credit-and-classify / AI deduct-a-little-and-name.
**Why:** Smith: accent-imperfect must never tie accent-perfect, anywhere; and the remoto teaching lives in credé, the explanations, and the orthography stats.
**How to apply:** Worker prompt change with Housing (Architecture_Housing_ai_marker_accent_policy.md); AI_MARKER_PLAN.md carries the policy section.

## 2026-07-15 (late night): acceptance tests are the user's flow - scroll and level-strip threads reopened with root causes
**What:** Scroll-to-fresh never fired in the overview (freshness is exact-leaf-id only; no ancestor propagation; the fixed landing had no trigger). Entry level strip counted a stale persisted 3-question scope with an unlabelled number and a full-green mastery bar - read by Smith as "we've only done 3 grammar exercises". Both threads reopened with line-precise root causes and a named acceptance test that IS Smith's flow, to be verified verbatim in the reply.
**Why:** Three shipped fixes validated against synthetic repros; the trigger was never tested. The architect now reads the code path before routing recurring UX defects.
**How to apply:** Housing verifies against the stated flow and says so; no substitute repros on reopened threads.

## 2026-07-15 (night): accent endgame - the split supersedes the flag; two flags stand estate-wide
**What:** AccentAuditor's estate sweep (267 markpoints judged): 265 no_flag. The r8 orthography split classifies accent slips at runtime (.missing/.added/.wrong_mark), so accent_load_bearing on NON-WORD twins misroutes a spelling slip onto a formation bucket the learner just demonstrated and corrupts misconception stats. Nine flags removed with fold-equal guards pruned (hò/hài/hà/stò/sò, fùi/fù/fù, me ne stò). Two stand: credé (the only same-person collision - conjugation-class arithmetic: only -ere strips onto the prompt's person) and dì (real word, attested variant). parlò/dormì held for Smith. The same-day prune ruling and the flag repair had silently competed for one 26-member class; the gate's output is rephrased: dead guard admits two repairs (flag OR prune), criterion 19 chooses, the gate cannot.
**Why:** The auditor corrected the architect twice with evidence (unlanded dispatch edit; the r8 supersession) and both held.
**How to apply:** AccentAuditor's suggestions file is the record; new accent guards default to prune-and-let-fold-rescue unless the twin is a plausible answer to the prompt.

## 2026-07-15 (night): registry gains transfer.negative_imperative_infinitive_over_extension; dì stays bare
**What:** Ratified ImperativoAuthor's proposal (non+infinitive over-extended to noi/voi, plus the bare-infinitive-for-affirmative reflex). dì-for-di' gets no registry id: runtime .added classification is the diagnosis; note-on-record convention applies.
**Why:** The over-extension is the mirror of negative_imperative_finite and marks a MORE advanced learner - worth separate stats. One-word cases do not mint ids.
**How to apply:** ImperativoAuthor retags impv_neg_06/07 + the dire guard. [discharged: ImperativoAuthor, 2026-07-16, discharges v1 — transfer.negative_imperative_infinitive_over_extension on impv_neg_06/07 + impv_irr_05, verified on disk]

## 2026-07-15 (night): label-vs-guard estate check clean; crede label already fixed author-side
**What:** AccentAuditor found a markpoint label naming the guarded form as if accepted ("crede / credette"). Author fixed it in their Rev 20 pass before central action. Estate grep: 67 raw hits refine to 12, all legitimate cue-lemma naming. Rule for authors: a label must never present a guarded form as accepted; naming the cue lemma is fine; candidate-forms labels listing both are fine.
**Why:** The breadcrumb renders the label; a wrong-form label is the site showing the learner a wrong answer.
**How to apply:** Eyeball at authoring; the refined grep joins the acceptance checks.

## 2026-07-15 (evening): universal word-anchoring - every any_phrase in the estate is anchored
**What:** PassatoRemotoAuthor proved the paradigm-containment class (fu ⊂ furono: every 3sg nests in its 3pl; 16 live false-credit markpoints in a batch that had passed every audit). The guard-list-based checks were structurally blind to it because nobody guards wrong persons. Fix executed estate-wide: match_at "word" on every unanchored any_phrase (871 phrases today across two passes), every anchor validated for self-credit, zero unanchored remaining across 1,876 markpoints, full gate clean.
**Why:** Selective anchoring (Rev 15) mitigated known exposures; the comparison set "plausible attempts" can never be enumerated, so the default had to flip. Anchored-by-default makes the whole class unrepresentable.
**How to apply:** Authors write new any_phrases with match_at "word" unless they have a reason (start/end anchors stay available). The gate enforces at acceptance.

## 2026-07-15 (evening): misconception item-tag schema ruled; unreachable pairings annotated
**What:** must_not_include entries may be objects {"phrase","match_at","misconception","note"} carrying ONE registry id; mixed string/object lists legal; marking untouched; dodges never tagged. Housing owes the recorder (misconceptionHits alongside the bucket miss). Registry gains unreachable_notes (first: regularisation.irregular_verb x imperativo - apostrophe fold makes regularised va score correct, empty stats meaningless).
**Why:** ImperativoAuthor stopped rather than improvise a project-wide shape into their batch: correct instinct, schema is architecture's. Their engine evidence (polymorphic reader) made the object form free.
**How to apply:** Tag on the guard entry that catches the miss; bucket-level lists in misconception_tag_lists.json say which id.

## 2026-07-15 (evening): criterion 19's own text controls the flag; contradicting guards are removed, not honoured
**What:** Three present-indicative flags (è/dà/può) applied by the morning gate run were REVERSED on PresentFormationAuthor's testimony: the stripped twins do not parse as answers to those prompts, and criterion 19 names e-for-è and da-for-dà as no-flag cases. The twin guards (e, é, da, dá, puo) were removed: with fold-rescue restored they can never fire and their intent contradicts the ruled philosophy. e-for-è now earns full credit + a classified .missing breadcrumb (r8 split).
**Why:** The gate proves a guard is dead; it cannot prove the guard SHOULD live. Where guard intent and criterion 19 disagree, the criterion wins and the guard goes.
**How to apply:** AccentAuditor inherits this as precedent; author testimony on prompt plausibility is decisive evidence.

## 2026-07-15 (evening): answer-class balance on verdict leaves; the 0.5/0.7/0.9 ladder
**What:** (a) WordFormationAuthor's four balancing alterati RATIFIED (10:6 not 10:2): a verdict leaf must keep answer classes balanced enough that a constant strategy scores poorly. (b) ComparisonAuthor's ladder ratified as Rev 20(i)'s worked example: 0.5 register-wrong / 0.7 standard Italian missing the leaf's named idiom / 0.9 genuine dodge - with buonissima-for-ottima at 0.7 because flat WRONG would teach that correct Italian is broken.
**Why:** Both are Smith's flex doctrine applied: grades carry the teaching point.
**How to apply:** Cite the ladder, don't reinvent it; check verdict-leaf class ratios at authoring.

## 2026-07-15 (evening): pronoun file is bash-write-only; second Edit-tool truncation
**What:** grammar_questions_pronoun.json truncated at 298,196 bytes mid-item (PronounAuthor's op_comb_joined_05 re-edit lost). Repaired from HEAD, all central edits intact. Hard rule: files near 300KB are written sandbox-side via atomic bash only, never the Edit tool.
**Why:** Second occurrence, same file, same size territory, same tool.
**How to apply:** In the pronoun thread and AUTHOR_BRIEF operational notes on next touch.

## 2026-07-15: canonical marker-replica gate is the acceptance standard; estate run dispositioned 31 dead guards
**What:** An architect-owned replica of grammar_engine.js marking semantics (strict per-phrase match_at -> accent-folded rescue unless accent_load_bearing -> must_not_include strict-only, else-if gated; case_sensitive honoured) now runs over every guard-as-attempt at batch acceptance and on demand estate-wide. First full run found 31 live dead guards (pronoun 11, present 10, remoto 6, adjective 2, pronominal_verbs 1, imperativo 1). Settles the duelling per-seat counts (PluperfectAuthor's 30 was correct at its snapshot).
**Why:** Three seats independently built replicas with different modelling choices; counts diverged on timing and flag-modelling, and static review provably misses the folded/case paths.
**How to apply:** Anchoring cures NONE of this class. Disposition: accent_load_bearing on 16 gate-proven markpoints (parlò/parlo, fù/fu, hò/ho, dì, me ne stò classes); case_sensitive on 3 fcap markpoints; 6 norm-identical guards REMOVED as ungradeable (apostrophe/hyphen fold makes guard ≡ positive: l ho, te'ne, Me-ne, Me-le, buon', pari'); 1 routed (op_comb_order_01, additive/reorder). Re-run clean.

## 2026-07-15: isolated clitic before vowel frame grades elision (la -> 0.9)
**What:** Where a blank isolates a clitic and the frame's next word forces elision (l'ho), bare `la` earns 0.9 with a steering note and l' full credit (op_dop_la_02/03, op_spec_dislo_01). Smith caught it live.
**Why:** Unlike un'/un, the isolated blank makes la vs l' distinguishable post-norm ("la" ≠ "l"), so the apostrophe-fold limitation does not apply; and the items' own explanations teach the elision.
**How to apply:** Only where the blank isolates the clitic AND elision is obligatory-ish (before ho/hai/ha...). le NEVER elides - le items stay full credit. Formal La informiamo stays full credit (standard unelided).

## 2026-07-15: candidate_forms boundary - answer-content alternatives only; verdict labels never
**What:** candidate_forms/correct_form carry alternatives that ARE the answer (forms, senses, referents). Verdict/classification labels (vero alterato / parola indipendente, sì/no) do not get the fields; where an author wants the tick and stats on verdict items, convert to MCQ.
**Why:** Joint ask from WordFormationAuthor + NegationAuthor (13+ items). A tick listing "sì / no" is noise; MCQ gives index-scoring and stats natively and avoids stretching criterion-16 suppression semantics.
**How to apply:** Meaning-pair items keep the fields (noun precedent). Verdict items: MCQ or plain short.

## 2026-07-15: Brief Rev 20 - dodge precedence, frame-forced sixth class, instruction-pinned guards, bracket convention
**What:** (i) 0.9-for-dodges applies only where the sidestep is not the bucket's named common_miss; a named common_miss defaults to WRONG but the author may assign an explicit 0.5-0.8 with a steering note where that makes the point better (Smith's flex amendment, same day). What it can never do is silently inherit the 0.9. (ii) Recoverability gains the frame-forced class (di_vs_che: the frame admits exactly the candidate set). (iii) Criterion 18 gains instruction-pinned mitigation ("Complete with one word:" + guard is acceptable). (iv) §3 documents square-bracket meta-instructions.
**Why:** RelativePronounAuthor's collision and chi residual; ComparisonAuthor's taxonomy gap; a ratified-but-undocumented convention.
**How to apply:** In the brief body; authors reconcile on next touch.

## 2026-07-15: orthography accent split registered; parts map ships; proper nouns take .noun
**What:** (a) orthography.accent.italian was engine-emitted but never in the production tree - registered now with three children (.missing, .added, .wrong_mark); Housing owes the ~15-line rescue-branch classification. (b) data/parts.json maps all 30 topics into six entry-picker families; picker must render from it with no silent drops (27 topics are currently invisible on entry). (c) Proper nouns take .noun, no new POS tag; themes can carry proper_noun. (d) word_formation gender_shift leaf ratified; bene/buono <-> migliore/meglio cross-cited.
**Why:** Smith's live session surfaced the picker gap and the accent-bucket question in one sitting; the registry gap fell out of answering him.
**How to apply:** Housing: entry_parts_map + orthography_split + english_answer_grammar_items threads, plus the reopened scroll regression (v4).

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

## 2026-06-08: Bucket-name breadcrumb leak and the leak-vs-trap test (criterion 15)

A bucket-name breadcrumb shown pre-answer leaks the diagnostic when it names a verb-class membership or rule-output that the item tests and the learner cannot derive from the prompt cue. Authors set `info_display: "suppress"` on such items; the housing substitutes a generic topic-root label pre-answer and reveals the real bucket name post-answer. The decision is **per item, not per bucket**, governed by the leak-vs-trap test: suppress when the breadcrumb hands over a non-derivable class the item tests; leave visible when it only restates the cue, or when naming the class tempts a wrong answer the item's `must_not_include` is built to catch (the over-extension / reverting case). Codified as AUTHOR_BRIEF criterion 15 (Revision 8).

**Why:** Surfaced by PresentFormationAuthor on the -isc- / -go / dittongo formation leaves, where class membership is learned verb-by-verb so the breadcrumb genuinely leaks on the rule-applies forms (capisco), but the same breadcrumb is productive tension rather than a leak on the noi/voi reverting forms (capiamo, which it tempts toward the catchable capisciamo). The chip-suppression ruling (ImperfectAuthor thread) had promised this as a Rev 7 addendum to criterion 13; it was never written down, so PresentFormationAuthor re-derived it. This closes that gap. The leak-vs-trap refinement (per-item, not per-leaf) is the new substance beyond the original Option-A suppress mechanism.

**How to apply:** Authors apply the test per item when a leaf's breadcrumb names a non-derivable class. The housing honours `info_display: "suppress"` in the bucket-filter banner and live-panel tooltips (thread `Architecture_Housing_info_display_suppress.md`, CLOSED v2). Marking is unaffected.

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

**How to apply:** Architect schedules the dry-run sweep within the next 1-2 architect passes. Until then, the marker's existing defensive code path (verified in stats_panel work) tolerates both old and new bucket shapes; items work today, migration is hygiene. [discharged: AdjectiveAuthor, 2026-07-18, Cr17Sweep hygiene_work_order v2 — 47 old-shape vocab refs migrated to <pos> shape, grep residual 0]

## 2026-06-09: Discrimination items suppress their breadcrumb by default

Any item in a `.discrimination` bucket (or in the tense_choice tree) carries `info_display: "suppress"`. The breadcrumb on a discrimination item names the contrast being tested ("imperfect vs passato prossimo", "indicative vs subjunctive"); showing it pre-answer tips the learner that a tense choice is in play, when they should detect that from the sentence's context. The generic topic-root label shows pre-answer; the contrast name reveals post-answer. Codified as a clarification to AUTHOR_BRIEF criterion 15 (Revision 10).

**Why:** A discrimination item's validity depends on the learner recognising, unprompted, that a tense choice is required (a real reader gets no label). Naming the contrast pre-answer is the same leak criterion 15 forbids, applied to the selection axis rather than the form axis. Generalises a per-category ruling (the ImperfectAuthor chip_suppression v4 close-out) into a project-wide default so TenseChoice and every tree's discrimination buckets inherit it without re-deciding.

**How to apply:** Authors set `info_display: "suppress"` on every discrimination / tense-choice item. Housing already honours the flag (Architecture_Housing_info_display_suppress, CLOSED). ImperfectAuthor extends it to its ~32 remaining discrimination items (chip_suppression v4); TenseChoice applies it from the start.

---
## 2026-06-09: Misconception registry ratified to 17 families / 67 specifics

The MisconceptionAnalyst harvest of all 179 `common_miss` buckets (12 suggestion files) is ratified into `data/misconceptions.json`. 51 distinct new specifics added (deduped from cross-tense proposals), joining the 16 seeds for 67 total. Six seed entries gained cross-tense / cross-kind topic coverage; three descriptions broadened (orthography.omitted_h_hard_cg and double_i_retained to kind-neutral so they tag noun/adjective plurals as well as verb endings; stem_change.isc_over_extension to the plain-stem tenses; the auxiliary_choice family widened to "wrong auxiliary OR wrong tense of the auxiliary"). Every family referenced across the 12 files resolves to the ratified 17; no 18th surfaced, so the harvest family structure is treated as final, additive only if a later recognition / tense-choice pass surfaces a new one.

**Why:** The registry is the canonical error-pattern axis (DESIGN §15), orthogonal to the skill buckets. Ratifying now gives authors stable canonical ids to tag `must_not_include` against. Deduping cross-tense proposals keeps one entry per error pattern with a `topics` span, which is what makes the cross-kind drill-down meaningful: regularisation.irregular_verb across eight tenses is one pattern, not eight rows.

**How to apply:** Phase-3 tagging. MisconceptionAnalyst supplies per-topic tag-lists (`harvested_from` to canonical id); architect coordinates each author tagging its `must_not_include` entries (multiple ids per entry allowed), bundled with that author's next touch. The misconception drill-down view is a later housing build.

---
## 2026-06-09: candidate_tenses on tense-choice / discrimination items

Resolves the open question raised 2026-06-08. An item where the learner picks the contextually-correct tense among formally-possible options (every `tense_choice` item, and any item citing a `.discrimination.*` bucket) carries two new item-level fields:

- `candidate_tenses`: an array of two or more controlled tense-tags, the legitimate options in play for that context.
- `correct_tense`: exactly one member of `candidate_tenses`, the option the context demands. The correct surface form still lives in the markpoint `any_phrases`; `correct_tense` is the tense-level label that drives the post-answer tick and the per-context stats.

Controlled tense-tag vocabulary: present, passato_prossimo, imperfect, trapassato_prossimo, passato_remoto, future, futuro_anteriore, condizionale, condizionale_passato, congiuntivo_presente, congiuntivo_imperfetto, congiuntivo_passato, congiuntivo_trapassato, imperativo, gerundio, infinito. Each maps to its `verb_form` topic for stats linkage.

Display (Housing): the candidate set is shown ONLY post-answer. Showing it pre-answer would tip the learner that a choice is in play, which criterion 15's discrimination-suppress forbids, so these items also carry `info_display: "suppress"`. Post-answer, the candidates render as a small chip row with `correct_tense` ticked; if the learner's answer matched a tense-identifiable `must_not_include` entry, that chip is marked as the chosen-wrong tense. Recorded per attempt (`correct_tense`, and chosen tense where derivable) to feed the per-context discrimination stats and the misconception drill-down.

Marking is unchanged: the engine scores the surface form via `any_phrases` / `must_not_include`. The two new fields are display + stats metadata only.

**Why:** makes the choice space explicit, gives every discrimination bucket a uniform item shape, and feeds the discrimination misconception axis (choosing passato prossimo where imperfect was right is a recordable cross-context pattern). Surfacing candidates only post-answer keeps it consistent with discrimination-suppress.

**How to apply:** required on `tense_choice` items and on any item citing a `.discrimination.*` bucket; optional on usage items that have a genuine candidate set. The TenseChoice wave-2 dispatch carries the convention; Housing renders the post-answer tick row and records correct / chosen for stats (a Housing thread covers the UI).

---
## 2026-06-09: tense_choice tree is the canonical home for cross-tense contrasts

When the usage / tense-choice phase opened, two parallel homes existed for the same contrasts: the built `tense_choice` tree (progressive/simple, future/present, counterfactual, indicative/subjunctive, trapassato/imperfetto) and a set of per-tree `verb_form.<tense>.discrimination.*` stubs whose descriptions claimed to be "the structural home." Ruled: the `tense_choice` tree is canonical. Extended it with three gap areas (`present_vs_imperfect`, `present_vs_passato_prossimo`, `passato_remoto_vs_passato_prossimo`). Deprecated the nine duplicate per-tree discrimination stubs to cross-reference pointers (`attributes.deprecated_authoring_target` + `cross_reference`). The imperfetto/PP area stays in `verb_form.imperfect.discrimination` (built deep with five modal contrasts, wave-1 authored), cross-referenced. The imperative's informal-vs-formal stays on the imperativo tree, since it is a register choice, not a tense choice.

**Why:** A two-tense contrast has no natural owner between its two tenses; the per-tree approach actually duplicated a contrast under both tenses (present-vs-future appeared under both the present and the future stub). The tense_choice tree gives one coherent diagnostic page, matches the dispatch's cross-cutting framing, and is less churn since it is already built deep. Keeping imp/PP where it is avoids discarding the five-modal structure already authored there.

**How to apply:** The TenseChoice wave-2 dispatch authors all contrasts into `tense_choice.*` (imp/PP excepted, already done). The deprecated per-tree stubs are not authoring targets and must not be cited. `candidate_tenses` (criterion 16) applies to all tense_choice items.

---
## 2026-06-10: Relative pronouns and prepositions as new grammar trees; present usage scaffolded

Two new grammar topics scaffolded as their own trees, plus the present's usage branch deepened, to open parallel authoring.

- `relative_pronoun` (16 nodes): che (subject/object), cui (preposition + cui, il cui possessive), il quale (clarity, after preposition), chi, the neuter quello che / cio che, relative dove, and a discrimination branch (che vs cui, che vs il quale). Given its OWN tree, not folded under `pronoun`, because relatives are not clitics and warrant their own stats page and dispatch.
- `preposition` (17 nodes): simple forms, articulated (formation + di-partitive), a usage branch weighted with place, time, motion, means/manner, verb-governed, di-uses and da-special, plus a discrimination branch. Usage is where the difficulty sits, so the tree is usage-heavy.
- `verb_form.present_indicative.usage`: four single-tense-use leaves (general/habitual, ongoing-now, states/facts, instructions). Deliberately light: the present's choice-based uses (near-future, da-durative, historical present) live in the tense_choice tree, cross-referenced on the usage aggregate.

Dispatches written for all three. Relative-pronoun and preposition discrimination items are choice items that suppress their breadcrumb (criterion 15) but do NOT carry `candidate_tenses` (that field is tenses only).

**Why:** parallelises grammar authoring beyond verbs; relative pronouns and prepositions are high-value gaps with no prior tree. Present usage is the first usage dispatch, kept honest about its thinness.

**How to apply:** launch the three author chats from their dispatch packets; batches return, architect reviews and wires to the manifest (present usage merges into the present-indicative topic files). New topics appear in the welcome screen's parts list automatically once wired (data-driven).

---
## 2026-07-12: Standard-variant credit policy (secondary form = 0.9)

For a lemma with more than one standard form, a secondary standard variant (less common, register-marked, or dated but still current) is accepted at credit 0.9 with a register or frequency note. Dual 1.0 is reserved for forms in genuinely equal current use. Archaic or obsolete variants are rejected or scored low.

**Why:** two near-identical dovere decisions (subjunctive deva vs debba; present debbo vs devo) were being made per-tree and risked diverging. One criterion (is the variant secondary?) settles them consistently: deva 0.9 and debbo 0.9 both fall out of the rule, so the trees agree without special-casing.

**How to apply:** authors grade a secondary standard variant at 0.9 with a note; the architect ratifies borderline cases. Existing deva (congiuntivo) and debbo (present) already conform, no change.

---
## 2026-07-12: Leaf labels stay terse; worked examples go in description (breadcrumb hygiene)

A bucket leaf's `label` renders as the pre-answer breadcrumb, so a label that packs the canonical worked example hands the learner the answer. Labels name the class only (e.g. "avere auxiliary", "Apocopated / irregular tu"); the worked example lives in `description` / `canonical_example`. Applied to the trapassato formation leaves (2) and imperativo formation leaves (4), whose labels had embedded avevo/ero and parla/va' examples.

This is distinct from the criterion-15 suppress case: suppress is for a terse label that legitimately names a non-derivable class the item tests (keep the label, hide it pre-answer); this rule is for labels that are merely over-long and embed the answer (shorten the label, no suppression needed). After shortening, most leaves need no suppression at all; only the genuinely non-derivable class (apocopated tu) keeps suppress.

**Why:** heads off the breadcrumb leak at authoring time rather than papering over it with tree-wide suppression. Codified as AUTHOR_BRIEF criterion 15 addendum (Rev 12).

**How to apply:** authors keep labels terse; the leak-vs-trap suppress test (criterion 15) then applies only to the residual cases where a terse label still names a non-derivable class.

---
## 2026-07-13: Grammar item explanations include an English translation of the sentence

Every grammar item's explanation carries a plain English translation of the completed correct sentence, placed early (opening gloss, or the sentence quoted then translated in parentheses), before the grammar working. Fragment prompts gloss the target instead ("me lo = it to me"). Codified as AUTHOR_BRIEF criterion 17 (Rev 13).

**Why:** a learner who cannot fully parse the Italian sentence cannot use the grammar explanation. The translation gives the meaning first, so the "why" that follows lands. It sits alongside the existing four-beat explanation style, not instead of it.

**How to apply:** new grammar items carry it from authoring; existing items gain it on their next touch, bundled with each author's other next-touch work (misconception tagging, the trigger audit, and so on). A dedicated retrofit sweep is available if the coverage needs to move faster than next-touch.

---
## 2026-07-13: A1 noun-phrase topics scaffolded (article, noun, possessive, demonstrative)

Following the OnlineItalianClub coverage cross-reference (`REFERENCE_coverage_vs_onlineitalianclub.md`), which showed our coverage is verb-deep but missing the A1 noun phrase, four new grammar trees plus dispatches: `article` (9 nodes), `noun` (gender + plural, 11), `possessive` (6), `demonstrative` (5). Discrimination stubs included where a real choice exists (with/without article, suo ambiguity, questo vs quello). The noun plural-spelling and gender misses tag to the existing orthography and agreement misconceptions in the Phase-3 pass.

**Why:** a coherent A1-to-C2 offering needs the noun-phrase basics. A beginner on Linguics today can conjugate the trapassato but cannot practise "the/a", noun plurals, possessives, or "this/that." These are the highest-value gaps, ahead of more verb depth or the advanced C1-C2 items.

**How to apply:** launch the four author chats from their dispatch packets when the author-chat bridge is stable; batches return, architect reviews and wires to the manifest; they then appear in the welcome screen's parts list automatically (data-driven).

---

## 2026-07-14: A1 construction topics committed (existential, piacere), with pronoun-tree deprecations

Two learner-facing trees are live: `existential` (c'è / ci sono, 11 nodes, topic_short ex) and `piacere` (13 nodes, topic_short pia), drafted off-bridge on 2026-07-13 and schema-validated against disk before commit. Boundary rulings: existential owns esserci only, every other life of ci (locative, farcela, volerci) stays with the pronoun tree; piacere owns choosing-the-clitic-in-a-piacere-frame, clitic grammar at large stays with the pronoun tree; the dispiacere false friend lives at piacere.usage.dispiacere (the trap is constructional, not lexical); liking people (mi piaci) is its own leaf at B1-core; the family verbs (mancare, servire, bastare, interessare, sembrare, restare) are one leaf inside piacere, with mancare's direction flip the sharpest diagnostic. Marker ruling: "A me mi piace" earns graded credit 0.5 with a register note, not a flat miss. Three pronoun-tree leaves are deprecated as authoring targets toward the new homes, using the same convention as the nine tense_choice deprecations: pronoun.ci_locative.existential -> existential; pronoun.indirect_object.verbs_taking_iop -> piacere.form.experiencer_clitic; pronoun.indirect_object.verbs_taking_iop.with_essere_in_pp -> piacere.form.past. External_id prefixes claimed: ex_, pia_ (and trans_ variants), verified free.

**Why:** the OIC coverage cross-reference showed these as the last missing A1 staples, and the topic-home-vs-mechanics split follows the established tense_choice precedent: events already logged against the old buckets stay; new items author against the topic home.

**How to apply:** dispatch the two author chats from DISPATCH_existential.md and DISPATCH_piacere.md (each carries a Brief Revision 13 addendum). Neither topic enters data/manifest.json until its first content batch lands (standing no-empty-counts ruling).

---
## 2026-07-14: A2+ tranche committed (comparison, adverb, passive, si_constructions, reported_speech, pronominal_verbs)

Six trees live (57 nodes total; topic_shorts cmp, adv, pas, si, rep, pv; prefixes verified free). The load-bearing rulings: (1) pronominal verbs get their own learner-facing tree despite existing pronoun-tree leaves, on a cite-not-duplicate contract (the new tree owns meaning and whole-verb conjugation; the pronoun tree keeps clitic mechanics; items cite both; verified leaf-by-leaf at commit, no duplication found). (2) Reported speech is an umbrella topic whose tense-shift leaves double-cite the imperfect tree's reported_present / reported_intention buckets, the tense_choice pattern. (3) Compound-tense adverb placement stays with the PP tree's existing bucket. (4) The passive-vs-si-passivante discrimination lives in the passive tree; the si tree cites it. (5) Reflexive si stays in the pronoun tree; si_constructions.usage.which_si tests recognition only. (6) Si-passivante agreement cross-links existential.form.plural (same number instinct, same miss). Graded-credit rulings: "ha detto che veniva" (colloquial imperfetto for future-in-the-past) at 0.5 with a register note; "questo libro è meglio" (meglio as adjective) at 0.5 with a register note; "è pagato" and "viene pagato" both full credit in simple-tense passive rewrites unless context forces one. All eight new dispatches carry a Rev-13 addendum: named suppress-list per topic (criterion 15), candidate_tenses for reported_speech shifts and existential c'era/c'è stato items (criterion 16), the English-translation requirement (criterion 17), and a note that the worked examples predate Rev 13.

**Why:** these are the sentence-level structures the OIC cross-reference flagged as our second-tier gap; the boundary rulings keep one bucket per skill while giving learners findable topic homes.

**How to apply:** commit order mattered (noun-phrase trees, then the A1 pair, then this tranche) and is satisfied. Dispatch author chats as capacity allows; manifest wiring waits for content per topic. CEFR bands remain informed defaults pending the Profilo grounding pass in OPEN_QUESTIONS.

---
## 2026-07-14: Accent-as-morpheme carve-out in the grammar marker (proposed to Housing)

Where the accent is the only person distinction (parlerò/parlerà in the futuro, parlò vs present parlo in the remoto), the marker's soft accent guard currently credits the wrong person at full marks. Proposed mechanism, in inter_chat/Architecture_Housing_accent_as_morpheme.md v1: a markpoint-level `accent_load_bearing: true` flag disables the accent-folded fallback for that markpoint, letting the unaccented twin fall through to a noted must_not_include. Everywhere else the soft guard stays.

**Why:** the OIC drill (REFERENCE_oic_exercise_drill.md, futuro batch) surfaced accent-as-morpheme as a deliberate grading rule; our blanket softness inverts it exactly where it matters most.

**How to apply:** Housing implements the flag; then retrofit asks go to FutureAuthor and PassatoRemotoAuthor for person-distinguishing items, plus a brief amendment so new items in those families carry the flag from authoring.

---
## 2026-07-14: Estate hygiene adopted (UPDATES.md ticker; WEB_KIT compliance thread)

Two adoptions from the MetaProject constitution read. UPDATES.md now exists as the one-line ticker (estate convention, ECM d040): every seat appends a line when it writes shared state. And the housing's live page is missing the entire WEB_KIT layer (GA4 G-WKYGJYERSR, Clarity xdr2tsc688, feedback widget): thread opened at inter_chat/Architecture_Housing_webkit_ga4_feedback_clarity.md, GA4 + Clarity immediately actionable, the feedback widget pending the estate's shared drop-in.

**Why:** GA4-on-everything is a no-exceptions estate policy (Smith, 2026-06-21), and the ticker is the cheapest defence against seats posting over unread state.

**How to apply:** all Linguics seats append to UPDATES.md on every shared-state write, starting now.

---
## 2026-07-14: Relative-pronoun and preposition batches accepted, with rulings

Both 2026-07-14 batches accepted (relative_pronoun: 41 grammar + 15 translation; preposition: 82 + 24). Rulings of substance: (1) the relative author's match_at ask was already satisfied, Housing shipped start/word/end anchoring on 2026-07-13; the two suffix-contaminated items (a cui inside da cui, alla quale inside dalla quale) get match_at "word" retrofits, and i cui becomes markable the same way if wanted. (2) The relative author's manifest touch is blessed retroactively with the norm restated: authors flag, architect wires (architect wired preposition). (3) Preposition tree edited at source: the da-plus-person seam ruled into da_special, the partitive leaf relabelled "Partitive 'some'" per the terse-label rule, small islands absorbed into the a_vs_in description, and all three proposed verb_governed children ratified and live (a_infinitive, di_infinitive, object_governed; existing items keep citing the parent, rollup handles it). (4) Glossary to v3: relative pronoun, relative clause, invariable, euphonic ad, passive agent merged; antecedent already existed. (5) Blessed as authored: col treno at 0.9 under the standard-variant policy, context-dependent contraction-credit choices, the stylistic il-quale miss, dove / in cui cross-credit, suppress on 37/41 relative items. Full substance in the two batch-review threads.

**Why:** both coverage docs met the task-closure standard (grepped counts, engine-semantics reasoning); the asks were either already-shipped engine features or tree-side fixes squarely in architect territory.

**How to apply:** authors do the two match_at retrofits and optional cleanups on next touch; both topics are manifest-wired and live once Smith pushes via GitHub Desktop.

---
## 2026-07-14: OIC drill follow-through (idea-bank appendices, Rev 14 house techniques, new-topic candidates)

The deep-drill follow-ups queued from the off-bridge session are done. Twelve un-dispatched dispatches (article, noun, possessive, demonstrative, plus the eight new topics) carry hand-curated "OIC idea bank" appendices: steals, trap stems, and exception lists specific to each topic, drawn from oic_drill_raw_findings.json. AUTHOR_BRIEF bumped to Revision 14 with a House-techniques section (person recovery from indirect cues; exception density one-to-three per ten; same-surface-opposite-answer pairs; one out-of-paradigm trap per drill; word-bank-as-distractor-set), encouraged patterns rather than gates. Genuinely new topics the drill surfaced (indefinites, connettivi, alterati, negation/particles) are in OPEN_QUESTIONS awaiting Smith's pick; none scaffolded unprompted.

**Why:** the drill's value was always meant to land in the dispatches authors actually read, and the already-dispatched topics get their steals through next-wave dispatches instead. Techniques were codified once in the brief rather than repeated per dispatch.

**How to apply:** author chats read their dispatch's appendix at dispatch time; the piacere appendix records that OIC has no deep piacere coverage, so that topic is ours alone.

---
## 2026-07-14: Learner-coverage surfaces briefed (2D topic-by-CEFR matrix; entry-screen per-band standing)

Two Smith asks briefed to Housing. A 2D coverage matrix (topics down one axis, A1-C2 across the other, transposable, cells carrying the established fill-equals-attempted, hue-equals-correctness signals, DATA_PRESENTATION rules quoted in the thread, mobile defaults to topics-as-rows). And the entry screen gains the learner's own standing per CEFR band under the active filter: one blended percentage per band (the mastery blend with untouched-baseline dilution), attempted-vs-total at leaf level in drill-in, gated on history, visually subordinate to availability. Naming ruled: avoid the word "competence" on-screen; plain "how you're doing" language, since the honest quantity is a blend of coverage and correctness. Slotted into welcome phase-1b as third in priority (after translation direction and vocab Mix/gender, before the Custom-mix label guardrail).

**Why:** with sixteen-plus grammar topics live, per-topic-per-level coverage is now a real question learners ask, and the two surfaces must share formula and colour or they will contradict each other.

**How to apply:** Housing answers the denominator question (buckets-at-level vs items-at-level) in the matrix thread before building; both surfaces reuse the existing mastery formula, no new statistics.

---
## 2026-07-14: Superstring safety becomes criterion 18; 53 live anchors applied; two marker defects routed

PresentUsageAuthor found the rightward superstring hazard (a 3sg present is a substring of its own wrong-tense forms, and positive matches win, so the wrong-tense attempt self-credits); PrepositionAuthor independently found the leftward variant (a X inside da X). Ruled: criterion 18 (Brief Revision 15), comparison set is plausible attempts, default mitigation match_at "word" (both-boundary anchoring, confirmed in norm.js). An architect-side retro-audit of all 1264 live grammar items found 99 exposure-pairs; 53 any_phrases were word-anchored centrally the same night (adjective orthographic and apocope classes, pronoun short forms, person guards, progressive traps, h-guards, -iare stress items). Residue routed: the three formal-capitalisation pronoun items sit on a deeper defect (norm lowercases everything, so La/la was never distinguishable), proposed to Housing as a case_sensitive markpoint flag; op_comb_glielo_11 needs an author reframe (the wrong word-order attempt contains the anchored right answer). The audit now runs as a standing check on every batch acceptance.

**Why:** these were live false credits on exactly the items whose point is the distinction (vecchii crediting as vecchi, hanno as ha, bello as bel); two authors surfaced the class independently within hours, which is principle 5 (both sides think) working.

**How to apply:** authors carry criterion 18 forward; the anchored items need no re-touch; PronounAuthor gets the two-item retrofit ask once Housing answers on case sensitivity.

---
## 2026-07-14: Present-usage batch accepted and merged; negation scaffolded on NegationAuthor's carve-out

PresentUsageAuthor's branch batch (12 + 12) accepted: the three-grade progressive application stands, all four flagged uncertains blessed (iniziano at full credit, affamato/assetato at full credit with steering explanation, three voices on the instruction item, documented residual substrings), staging files merged into the present_indicative topic files and the five usage stubs cleared. Separately, Smith fired a NegationAuthor before a negation topic existed; the author correctly halted and proposed a carve-out, ratified with two adjustments (concord items may use nessuno/niente now, only the indefinites' lexical coverage waits; the bipartite non...X frames are wholly negation's, since the adverb tree carries only a generic position leaf). Tree live (negation, 11 nodes, topic_short neg), DISPATCH_negation.md written with the OIC micro_topics idea bank inline, boundary note added to the adverb dispatch.

**Why:** the usage batch is the template for the coming usage dispatches; and an author seat that halts at a missing tree instead of inventing one is the operating model working, so the reward is same-night scaffolding.

**How to apply:** NegationAuthor reads its scope thread and DISPATCH_negation.md and starts on the concord hot spot; present-usage content goes live on Smith's next push.

---
## 2026-07-14: accent_load_bearing shipped and scoped; retrofit routed to PassatoRemotoAuthor only

Housing shipped the flag same-night (markpoint-scoped, fold-gating verified). Scope refined twice en route: v2 narrowed from "futuro and remoto person distinctions" to collision cases, and v5 narrowed again to the honest test, "is the stripped form a plausible alternative ANSWER to this prompt". Net: the futuro needs nothing (its unaccented twins are non-words; FutureAuthor's same-night cleanup of six dead guards was already aligned), essere/dare presente items need nothing (e and da are not candidate answers at a verb blank, so fold-rescue plus orthography miss is right), and the whole retrofit lands on the remoto 3sg collision classes (parlò/parlo, credè/crede, partì/parti). Codified as criterion 19 (Brief Revision 16); retrofit ask routed. Open question put to Smith: vocab marks accent omission at 50 percent partial while grammar gives full credit plus a tracked orthography miss; two philosophies, his call whether to harmonise.

**Why:** the two-step narrowing avoided flagging dozens of items where a missed accent is a typo, not a wrong answer; the flag now touches only items where leniency means crediting a different tense.

**How to apply:** PassatoRemotoAuthor works the retrofit thread on next touch; everyone else authors new collision items with the flag from the start per criterion 19.

---
## 2026-07-14: Existential batch accepted; Opus 4.8 calibration verdict is a pass

ExistentialAuthor's batch (43 grammar + 21 translation), the deliberate first-batch calibration for Opus 4.8 authoring, is accepted with every uncertain blessed and zero corrections required. Marks of quality worth recording: uniform criterion-18 word-anchoring across all items; a mid-session self-reconciliation from Rev 13 to Rev 15 when the brief moved under them; the OIC traps folded with deliberate departures NAMED per the techniques section; the suppression mandate correctly EXTENDED by the leak test (36/43); the calque caught translation-side with negative anchors after correctly reasoning that a bare-è catch is unsafe; and a stay-in-role manifest flag instead of a touch. Architect actions: existential wired into the manifest (17 topics), the two glossary terms merged with the requested alias (glossary v4). Verdict: Opus 4.8 is cleared for the author seats without extra review overhead; the remaining dispatches go out at normal cadence.

**Why:** the calibration question was whether the model holds the brief's discipline unprompted; extending a mandate correctly by its own reasoning is stronger evidence than compliance.

**How to apply:** dispatch the rest at will; the existential batch's coverage doc is the reference exemplar alongside the relative-pronoun one.

---
## 2026-07-14: Indefinites, connectives and word formation scaffolded (the OIC candidates complete)

On Smith's go-ahead the remaining three candidates are live: indefinite (13 nodes, ind), connective (14 nodes, conn), word_formation (9 nodes incl. a relational-adjectives stub, wf), each with a dispatch carrying its OIC idea bank. Boundary rulings of substance: (1) indefinites own the negative indefinites AS WORDS, negation keeps the word order (both sides now exist; cross-cited). (2) The two-sided mood contract with tense_choice: connective owns connector-choice items where the verb form is GIVEN; tense_choice owns mood-choice items where the connector is given; mirrors formation-supplies-the-trigger. (3) Finché stays wholly with negation; the connective time leaf cites it. (4) tutto + article lives in indefinites, citing article.definite (no article-tree leaf existed). (5) word_formation owns PRODUCING intensifier-prefixed forms; comparison keeps CLASSIFYING them as absolute superlatives. (6) Relational adjectives stubbed for later. The deferred trio (cleft, tu/Lei register, consonanti doppie) stays deferred.

**Why:** the drill supplied the material and the fired-up author seats supply the demand; the boundary rulings keep one bucket per skill across five tree seams.

**How to apply:** fire IndefiniteAuthor, ConnectiveAuthor, WordFormationAuthor on their dispatches; none enters the manifest until content lands.

---
## 2026-07-14: The evening reply sweep (nine seats), with four new standing rules

Smith's "have you replied to pronouns author inter alia" caught a real hole: PronounAuthor's Rev-13 self-audit sat unread, my glielo/fcap routing had gone into other seats' threads, and ten new versions had landed while the architect scaffolded. All processed the same evening. The four rules that came out of it (all in Brief Revision 17): (i) the stale §2 match_at bullet rewritten to match the shipped engine (RelativePronounAuthor's errata); (ii) criterion 18 gains the third superstring direction, no must_not entry inside a plausible CORRECT attempt, the false-diagnostic case (PrepositionAuthor's prep_mo_05); (iii) criterion 16 generalised to candidate_forms / correct_form for non-tense discriminations, raised independently by PossessiveAuthor (suo referents) and DemonstrativeAuthor (questo/quello) the same evening; (iv) the 0.9-for-dodges grading rule, correct Italian that sidesteps the drilled pattern scores 0.9 with a steering note, with the boundary stated: skill-shown-by-other-means (iniziano for cominciare) stays 1.0, skill-avoided (un po' di for the partitive) is the 0.9 case. Also ruled: bucket-level default_info_display: "suppress" as the answer to PronounAuthor's 90-110-item breadcrumb leak (live on the pronoun tree's four form subtrees; Housing resolver support requested); version fields bump only on post-consumption material edits; né...né ratified under negation (leaf live); the three possessive edge leaves ratified and live (predicate è mio, postposed casa mia, proprio); possessive.discrimination.suo and demonstrative.discrimination.questo_vs_quello registered from their suggestion files.

**Why:** the operating model's failure mode is exactly this, seats posting into unread threads; the catch was Smith's, the repair is same-evening, and the ticker discipline (UPDATES.md) plus the per-turn re-read now have a concrete cautionary example, my own duplicate-v3 on the accent thread included.

**How to apply:** the batch dispositions are in each thread; Housing's two display extensions (inherited suppress, candidate_forms tick) are the only blockers on anything.

---
## 2026-07-14: Batch dispositions of the evening wave; Housing phase-1b and coverage surfaces accepted

Negation batch 1 (36+18) ACCEPTED, audit clean, concord-suppression flip applied by ruling. Possessive (48+26) and demonstrative (44+20) audits clean (the six possessive family containments are MCQ, unreachable by typing, by that author's own design); full coverage-doc reads follow, rulings unblocked them tonight. Future formation (50+19) containment-clean, full review queued; its author's sixteen dead-guard removals and no-flags-in-futuro call confirmed against criterion 19. Relative-pronoun same-day self-reconciliation to Rev 15/16 noted for the audit's books. Housing: phase-1b complete and accepted (which-way, Mix + gender drill with the rankRange fix, Custom-mix guardrail, competence display); the 2D coverage matrix built and its denominator (a) RATIFIED (bucket-native, one shared masteryForScope helper, so strip and matrix agree by construction); the drill-filter root cause (wrap reshuffled the unfiltered pool) fixed and accepted; marker-payload bracket-stripping accepted; WEB_KIT compliance shipped (GA4, Clarity, click-tracker, semantic events, head guard), the feedback widget alone pending the estate drop-in.

**Why:** the wave validates the scaled model: five author seats and Housing all moving in parallel against one brief, with the architect's job reduced to boundaries, rulings and audits.

**How to apply:** Smith pushes via GitHub Desktop (r5 build plus tonight's data); two Smith-side items are open, the exact orbitalwells head block for Housing, and the parked resume-exact-question call.

---
## 2026-07-15 (small hours): The full unreplied sweep, the midnight wave, and three Smith rulings

Smith asked "any other interchats unreplied to" and the honest answer produced: the PiacereAuthor delivery (now ACCEPTED with its three rulings: the stressed-frame aphr_03 kept, past decomposition as shipped, manifest wired), the present-formation batch review owed since 2026-06-08 inside a CLOSED status (now done, ACCEPTED, fault owned), the PronounAuthor fcap retrofit unblocked by Housing's same-night case_sensitive flag (r6) and inherited-suppress (r7), and the pos-migration workstream whose v4 trigger (formation batches landed) has been met for weeks (now scheduled as next session's opener). Smith's three mid-sweep rulings: the orbitalwells verbatim alignment is stood down (templates stand); the accent-grading philosophies BOTH stand (vocab 50 percent partial, grammar full-credit-plus-orthography-miss, no harmonisation); the rest delegated, under which resume stays settings-only. New convention at Brief Revision 18, from Smith's observation that authors leave questions in coverage docs believing that is the channel: the coverage doc is the record, the inter_chat thread is the contract; every ask must open one. A one-off back-sweep extracted every buried ask into TRIAGE_coverage_asks_2026-07-15.md (gitignored) as the next session's inbox.

**Why:** two structural leak-shapes surfaced in one evening (asks inside CLOSED statuses, asks inside coverage docs); the convention plus the ticker plus the per-turn re-read now cover all three channels.

**How to apply:** authors open threads for asks from now on; the architect works the triage file next session, migration first.

---
## 2026-07-15 (small hours): Midnight wave audited; registry debt cleared; pronoun truncation reconstructed

The remaining dispatch wave landed within two hours of dispatch (noun 52, comparison 51, adverb 46, pronominal_verbs 46, article 51, si_constructions 37, reported_speech 39, passive 23, word_formation 30, piacere 38+20): the estate now runs 1,872 grammar items across 30 manifest topics. Standing audit across everything: three reported_speech exposures word-anchored centrally; one inert markpoint-level match_at key in imperativo converted to per-phrase; and the off-tree citation debt cleared to ZERO by registering what had been ratified-or-deferred but never created: the three adjective semantic-shift word leaves (grande/povero/vecchio), pronoun.combined.joined_when_should_be_separate (proposed May), the PP per-verb participles conosciuto and saputo, the PP preceding_dop_mi_ti_ci_vi optional-agreement leaf (a distinct atom, deliberately NOT remapped to the lo/la/li/le leaves), the verb_form.present_or_future.dare union bucket (ratified May, homed as a cross-cutting root in the tense_choice file), plus one misnamed imperfect citation fixed to auxiliary.modal_inheritance. Separately, grammar_questions_pronoun.json truncated mid-write during PronounAuthor's evening edits (the Edit-tool 300KB hazard, on local disk); reconstructed from the committed copy plus surviving edits, 216 items, one in-flight item edit lost and re-asked. The eight wave dispatches' stale DRAFT headers fixed. Full per-batch acceptance reviews for the midnight arrivals ride the triage file.

**Why:** registry debt was the silent kind (warn-at-authoring never escalated); tonight's stricter audit surfaced all of it at once, and the fixes were registrations, not judgement calls, except mi_ti_ci_vi, which is real pedagogy (optional agreement).

**How to apply:** Smith pushes; the housing picks up 13 new manifest topics; next session opens with the pos-migration then works TRIAGE_coverage_asks in order.

---
## 2026-07-15: The vocab pos-migration has run (Brief Rev 5 shape, June dry-run plan executed)

All 58 grammar and translation item files now carry POS-segmented vocab bucket ids (vocabulary.it.<lemma>.<pos>.<aspect>...): 3,840 references migrated (2,769 single-pos from the registry, 591 by dominant-sense rank where the registry holds multiple POS entries, 480 by the pronominal/infinitive verb rule), 112 already new-shape, and 182 deliberately left old-shape on a per-topic worklist because their lemma KEYS are the problem (genuine homographs for author judgement, plus Rev-3 violations: plural or inflected keys, squashed multiword keys, one missing accent). The dominant-sense rank rule is the one methodological addition to the June plan: where a lemma has several registry entries, the lowest-rank (most frequent) sense's POS wins, except the ~25 named homographs. Marker tolerance for both shapes (verified June) makes the mixed interim state safe; the worklist burns down on author next-touches, with ImperfectAuthor's cluster routed as its own thread.

**Why:** the June trigger (formation batches landed and wired) had been met for weeks; every day of delay grew the corpus (tonight alone added ten batches), and the events layer only starts accumulating per-POS history once the ids carry POS.

**How to apply:** authors write the new shape from now on (the brief has said so since Rev 5); the worklist entries get fixed keys before their POS segment; nothing else re-touches.

---
## 2026-07-15: Midnight wave fully dispositioned; si-parity and the two-grades distinction settled

All nine midnight batches are ACCEPTED with compact disposition threads (Rev 18 shape). Rulings of substance: "si vende libri" granted 0.5-with-register-note PARITY with a-me-mi-piace and ha-detto-che-veniva (SiConstructionsAuthor's own thread, nine items flip); the grading taxonomy is now explicitly two-tier, 0.5-own-grade for NON-STANDARD ubiquitous forms versus 0.9-for-dodges for CORRECT Italian that sidesteps the drilled pattern (ComparisonAuthor's meglio call recorded as the exemplar); the noun batch's meaning-pair homographs become candidate_forms discriminations per Rev 17 (iii); and the misconception registry gains orthography.cia_gia_plural_i for the noun-plural i-retention split (the dispatch had pointed at verb tags; NounAuthor's stay-in-role flag was right). [discharged: SiConstructionsAuthor, 2026-07-18, graded_credit_parity v3 — 9 singular-slip items flipped to graded any_phrases credit 0.5, must_not emptied; 9/9 re-verified]

**Why:** the wave's asks were small precisely because the brief now carries the rules; the parity ruling closes the last graded-credit inconsistency between sibling batches.

**How to apply:** si and noun authors apply their one-line flips on next touch; everything is live on Smith's next push.

---
## 2026-07-15: The recoverability condition (criterion 15 corrected by AdverbAuthor and Smith)

Smith caught, live on the adverb batch, that suppressing the breadcrumb on a LEXICAL discrimination makes the item unanswerable: "Lucia cucina ____" admits a dozen good adverbs, and nothing reveals that bene-versus-buono is the question, so a learner producing velocemente takes a miss on a bucket they were never invited to engage. AdverbAuthor codified the distinction: criterion 15's suppress-by-default was derived from tense choice, where the candidate set is RECOVERABLE pre-answer (context pins the tense, the cue gives the verb); where the candidates are different lexemes the prompt cannot reveal, the breadcrumb stays visible and the leaf is labelled by its CANDIDATE FORMS, never the rule ("molto / molta / molti / molte", not "molto that agrees"). Ratified as Brief Revision 19; the adverb leaf renamed at source; the estate retro-audit flipped exactly one other case, DemonstrativeAuthor's five questo/quello items (possessive suo and existential vs_essere stay suppressed: their English sources pin the candidate set). Also from the same seat: the locuzioni avverbiali leaf ratified and registered, three glossary terms merged (v5), and bare POS terms confirmed excluded from the glossary by design.

**Why:** answerability outranks leak-prevention; a leak costs diagnostic value, unanswerability costs the data's honesty. Two principles (13's name-the-surface and 15's suppression) compose into the fix: label by forms, show the label.

**How to apply:** authors apply the recoverability test before suppressing; DemonstrativeAuthor flips five flags on next touch; the criterion text now carries the test. [discharged: DemonstrativeAuthor, 2026-07-15, class_retrofit_audits v1 — 5 flags flipped to show with candidate_forms, 0 suppressed remain]

---
## 2026-07-15: Estate audit v2 after three author corrections of the architect's own passes

Three authors independently corrected tonight's central passes, and the corrections are all accepted and executed. ReportedSpeechAuthor: the superstring sweep did not fold accents (bare è sits inside era once folded); re-run folded, two more anchors applied, and 14 fold-equal accent guards identified as dead-but-policy-consistent (the fold-rescue already delivers the right verdict; authors may prune). ComparisonAuthor and NegationAuthor, independently: the fourth containment direction, the guard that CONTAINS the anchored answer as whole words is dead on arrival and anchoring cannot help; three live items routed for reframe (op_comb_order_01, wf_aug_02/03); and ComparisonAuthor's record correction stands, the lexical-discrimination kill was a THREE-instance class (migliore_vs_meglio self-flipped minutes before the 802-item sweep ran, so its clean bill was true of the state it saw, not of the evening). ComparisonAuthor also caught the pos-migration's dominant-sense rule mis-guessing live (buono.adverb, bravo.interjection): 14 references corrected to adjective estate-wide. PassiveAuthor: criteria 18 and 19 existed only in the brief's revision header while the §2 body still said the opposite at criterion 15; the body is now integrated (recoverability condition incl. the frame-forced sixth class inside criterion 15, candidate_forms generalisation inside 16, full-text 18 and 19 appended). All four containment directions, accent-folded, are now the standing acceptance audit.

**Why:** principle 5 at full stretch: the authors audited the auditor. Every central sweep now carries the lesson that its blind spots are found by the seats closest to the material.

**How to apply:** authors prune dead accent guards at leisure; PronounAuthor and WordFormationAuthor reframe the three routed items; the brief's §2 body is now the single reading authors need.

---
## 2026-07-15: Conditional formation accepted; the future-seat-asks convention; the estate glossary bulk-merged

ConditionalFormationAuthor's batch (49+19, delivered under Rev 9, self-reconciled to Rev 19 including a simulation-verified fix of ten 3sg-inside-3pl false credits) is ACCEPTED, and its three threads produced structural fixes: the ten condizionale leaf labels shortened at source (the stored labels spelled parleremmo and parlerebbe, the exact doubled letters the topic tests, a leak the shorter future-tense labels never had); three usage stub-leaves registered (polite, hypothetical_apodosis, reported_future_in_past) so the imperfect batch's five-week-broken citations resolve, with the four citations re-pointed centrally; and a new convention for asks addressed to seats that do not exist yet: they live in OPEN_QUESTIONS.md tagged "for the future X dispatch", because a note to an unappointed dispatcher waits for an accident. Rulings on the batch: the reported frame belongs to formation (formation-supplies-the-trigger), the two soft ma-clause triggers get hardened, the compound-choice line stays with tense_choice, potrebbe/potresti both 1.0 (addressee-ambiguous English, two standard renderings). The ask about glossary dependencies exposed that suggestion files were never bulk-merged; all outstanding files are now in (glossary v6).

**Why:** a batch stranded pre-Rev-18 carried five asks nobody saw; the same evening that codified the channel also cleared its backlog.

**How to apply:** ConditionalUsage's future dispatch inherits the three stub-leaves and the citation wire-up in its topic notes; authors' pending glossary terms now resolve.

---
## 2026-07-15: The queue's top half ruled (reported speech, gerundio, tense_choice wave 2)

Three batch threads closed or accepted with the rulings of substance: the DUAL-CITATION mechanism is ratified house-wide for umbrella topics (two markpoints at 0.5 with identical phrase lists, one per bucket home; criterion 8 forbids bundling two skills, not mirroring one skill to its two homes; an also_credits engine field is parked in OPEN_QUESTIONS); ORDERING-PROTECTED guards are exempt from criterion 18's guard-inside-correct direction and are the standard attributor for dropped-word misses, while token-boundary ADDITIVE errors are formally unreachable by the substring engine and route to MCQ or the AI strand (both now in the criterion body); the persisting-fact leaf is registered (accept-both items are not discriminations, so criterion 16 does not bind); reported_speech and gerundio leaf labels shortened at source, with GerundioAuthor's per-leaf suppress table (21 to 12, the -ire/-isc- and stem-expansion subsets keep their flags) ratified as the model application of Rev 12 plus Rev 19 together; translation references carry an explicit credit field for 0.9 dodges (documented in the brief); the condizionale non-shift ruled (hypothetical reading stays put, futurity reading shifts to the compound); tense_choice wave 2 accepted (185 items, tree complete, exhaustive marker replica) with the dispatch's wrong status line fixed at source and the seven-week dark tick owned as an architect sequencing failure; ImperfectAuthor's 37 shared-leaf items routed for the same retrofit, completing that seat's one-sitting queue. [discharged: GerundioAuthor, 2026-07-18, selfcheck_discharge v1 — suppress 21→12 per ratified table, count re-verified]

**Why:** the wave's authors are now running engine replicas and citing each other's case law; the architect's job tonight was almost entirely ratification and tree-side execution, which is the operating model at its intended steady state.

**How to apply:** RS authors the persisting-fact and condizionale items next touch; Gerundio retrofits flags per its own v2 table; TenseChoice re-flags anything below tonight's read fold; the tail of the queue (pronoun rev19, relative, word_formation, negation, comparison, passive, pluperfect) rides the next pass.

---

## Brief Revision 21 (2026-07-16): the carve-out, the progressive tags, and the next-touch clause

All three come from TenseChoiceAuthor's wave-2 asks; all three are things seats had derived independently and the brief had not written down.

**(i) Criterion 19 gains a supplied-choice carve-out.** It does not apply where the prompt supplies or pins the candidate forms: the answer space is the menu, the accent-stripped twin is not on it, so the accent cannot be the discriminator. `accent_load_bearing` stays unset there. **Why:** five seats (NounAuthor, PassiveAuthor, NegationAuthor, ComparisonAuthor, TenseChoiceAuthor) each spent the same twenty minutes deriving this from first principles. Five independent derivations of one unwritten rule is a brief defect. **How to apply:** supplied-choice and discrimination authors check the carve-out and move on; no retrofit needed, since every seat that hit it already reached the right answer.

**(ii) Criterion 16's tense-tag vocabulary gains presente_progressivo and imperfetto_progressivo; gerundio narrows to the bare nonfinite.** **Why:** `gerundio` was doing double duty, so tense_choice's progressive items tagged "sto mangiando" as a gerund and the post-answer chip would have read "Gerund" - mislabelling the choice the learner made. **How to apply:** progressive choices take the two new tags; `gerundio` tags only verb_form.gerundio formation items. Nine tense_choice items retagged centrally the same day; Housing's label map asked at Architecture_Housing_candidate_tenses_tick v3, its de-underscoring fallback covering the interim.

**(iii) Every new criterion and revision carries a next-touch clause** naming the seats it BINDS and the route the retrofit takes (dispatch / thread append / new items only). The architect fires it the day the revision lands. **Why:** criteria 15 and 16 named tense_choice by name and sat at 0/92 for seven weeks; Rev 19 had the same gap. Ratification was doing no work because nothing turned it into a knock on a door. A criterion with no next-touch clause binds nobody. **How to apply:** no revision ships without the clause; the architect owns firing it, not the authors owning discovering it.

## Misconception registry: five mints, one refusal, and the direction rule (2026-07-16)

**Minted** (registry 69 -> 74; discrimination 10 -> 15): `discrimination.imperfect_for_pp`, `discrimination.progressive_underuse` (mirrors of the existing one-directional ids), `discrimination.perfect_for_durative_da`, `discrimination.durative_present_over_extension` (the da/per pair; pp_for_imperfect's da example moved across), and `discrimination.remoto_register_mismatch` (direction-neutral, one id both leaves).

**`discrimination.remoto_register_mismatch` is filed under discrimination, not register.** **Why:** the family axis classifies what the learner got WRONG (a tense choice), not which cue they MISSED - the same logic that puts modal_stative_aspect under discrimination though its cue is lexical aspect. The reserved `register` family keeps its description updated to say so and points at the id, so the analytics question "does this learner read register?" resolves from either direction. **How to apply:** file by the error's shape; register hosts only errors whose CONTENT is the register choice (tu/Lei).

**`discrimination.habitual_frame_mismatch`: initially DECLINED, then MINTED on Smith's override (2026-07-16).** The authoring seat called the diagnostic weak, so I declined; Smith ruled to mint it and watch the live stats instead. Registered direction-neutral; if its data blurs into the general aspect errors it gets retired or sharpened. **Lesson recorded:** a weak-diagnostic doubt is a reason to flag for the owner's call, not to refuse unilaterally.

**The direction rule (binds every seat tagging a contrast topic): tag on the item's DIRECTION, not the bucket's id.** **Why:** the registry is one-directional (the harvest read each bucket's common_miss) where contrast topics are two-directional - one leaf hosts both pp_for_imperfect and imperfect_for_pp items. Tagging by bucket produces confident wrong stats, worse than the bare guard it replaces. **How to apply:** read the must_not_include entry, ask which way the error runs, tag that direction; ask for the mirror rather than forcing the fit. Written into the schema thread at v5, ahead of ImperfectAuthor arriving at it.

## Entry-screen load race and the level strip (2026-07-16, from Smith's live QA)

Four symptoms Smith reported - "we've only done 3 grammar exercises??", a ~10s blank on a fresh browser, no level options on a fresh browser, and translation not being level-filterable - resolve to **one root cause plus one over-eager gate**, both root-caused from r10 source. Full spec + acceptance tests in inter_chat/Architecture_Housing_entry_load_and_level_strip.

- **The load is sequential.** tryLoadRealContent awaits each topic's bucket/grammar/translation file in turn, ~90 serial round-trips = the ten seconds. **Ruling: parallelise** (Promise.all / small pool), preserving per-file resilience and manifest ordering. **Why:** the wall-clock is the whole of the "3" - during the load the screen renders the 3 inline samples (one A1/A2/B1, confirmed in sample_grammar_questions.js) and a learner reads "3 exercises". **How to apply:** Housing thread; Smith's timed flow is the acceptance test.
- **Provisional data is shown as final.** The only loading signal is a footer line. **Ruling: an explicit entry-screen loading state; never render level strip or counts off the inline samples.** Same silent-partial-state family as the cache-busting bug.
- **The level strip is hidden on a true first run** (`attempts.length === 0`), a prior architect ruling of mine that **I am reversing**: it conflated the mastery overlay (needs history) with level selection (needs only the pool). **Ruling: show the strip whenever the pool has >1 level; gate only the mastery bars on history.** **Why:** a fresh learner we greet with "Your level: B1" had no way to pick a level. **Bonus:** this delivers translation-by-level for free - renderLevelStrip(panel,"translation") is already wired and all 711 translation items carry cefr_level_target; the strip was only hidden by this gate. Do not rebuild it.
- **The level picker is a contiguous range, not a set** - first tap single, second tap spans, third tap resets, which is Smith's "select a third and the first two drop". **Ruling: independent multi-select (set), OR-ed.** Contiguous picks survive as tapping the run. The range gesture is the one call worth a second opinion; default is the set.

## Vocab session builder: frequency AND category, two axes (2026-07-16)

Smith's steer: choose by frequency and by category, category being the most important and currently absent; gender drill set aside as a mode; direction labels that state the direction. Spec in inter_chat/Architecture_Housing_vocab_session_builder (+ Architecture_Vocab_display_theme_grouping for the one data-side dependency).

- **Two independent AND-ed narrowers.** **Frequency:** the existing bands (relabelled as ranks) + a **freestyle rank range** (two inputs, feeding vocabFilter.rankRange, which the engine already honours) + a CEFR-guidance caption (guidance only; vocab entries carry `band`, not a CEFR level, so there is no honest per-entry CEFR filter). **Category:** theme chips off vocab_themes.json, parent themes rolling up their subtree, feeding vocabFilter.theme (also already honoured). **Why:** the data (rank + themes on all 18,071 entries) and the engine fields already exist; only the picker UI is missing. **How to apply:** Housing builds the picker; Vocab supplies the display-theme grouping list; Housing must not invent categories from raw ids.
- **Gender drill is a MODE, not a category** - lift it into a set-aside "Special drills" group, the extension point for future article/plural drills.
- **Direction labels standardise on arrows across both strands** ("Italian -> English" / "English -> Italian" / "Mix"|"Both"), replacing vocab's ambiguous "See Italian / See English / Mix".

## Refinements after Smith's review (2026-07-16)

- **Level picker: both individual toggles AND a range gesture** (not set-only). Selection becomes a set of levels OR'd in the filter; a tap toggles one, a drag/shift grabs a run. Smith: "we want both." Kills the third-tap-resets bug either way.
- **Vocab frequency is one control with two input lenses**, correcting the v1 "CEFR is caption-only": numeric (flexible ranges - single bands, arbitrary spans, open-ended "under N") and CEFR (named presets mapping to rank ranges). Both drive `vocabFilter.rankRange`. The CEFR lens reads the **existing `cefr_subbands` tags** already on all 180 bands in data/buckets/vocabulary_frequency.json (core/secure/stretch granularity, deliberately overlapping at level boundaries) - NOT an invented proxy. My v1 'no grounded map exists' was wrong; Smith caught it. Real coarse spans: A1 1-1000, A2 701-2000, B1 1601-4000, B2 3101-7500, C1 6401-10000, out_of_scope 9901+. The lens can offer the fine subbands too (A1-secure = 401-800), which is the 'A1 secure to this range' Smith asked for. Inactive lens greys but stays clickable (switches lens), never a dead control. **Why:** Smith wants learners to narrow frequency by whichever description they think in. **How to apply:** Housing builds a first cut for the feedback widget; this is a prototype to react to, not frozen.
- **Approved outright:** first-run level-strip reversal, arrowed direction labels, category axis, gender-drill-as-mode.

## Criterion 20 + the criterion-17 sweep commissioned (2026-07-16, from Smith)

- **Criterion 20 (Rev 22): cue by meaning, not by fragment.** A production cue that is a bare Italian answer-fragment reading as the whole answer, or presupposing the tested form, is reframed as a bracketed English target with register, and `prompt_supplies_base_form` set false so the cue-misread rescue fires. Citation-form triggers (inflect this adjective / conjugate this infinitive) are exempt. **Why:** Smith hit prep_sf_03 ("Questo regalo è ___ (te)" wanting per te), read (te) as the answer, produced tuo, and — because prompt_supplies_base_form was wrongly true — got no second chance. **How to apply:** PrepositionAuthor (55 candidates) and ComparisonAuthor (19) hold the class and apply judgement per item; new items follow immediately; the Cr17Sweep seat flags stragglers. `[discharged: PrepositionAuthor, 2026-07-16, cue_meaning_framing v2 — 6 reframed, 48 exempt under the operand test; the 55 was a census, not a queue]` `[discharged: ComparisonAuthor, 2026-07-16, cue_meaning_framing v2 — 10 glossed, 9 stand]` prep_sf_03 is the worked example with a concrete rewrite in the PrepositionAuthor thread.
- **The criterion-17 retro-sweep is commissioned as its own seat (Cr17Sweep)**, on Smith's go-ahead, structured as a dedicated PROOFREAD chat rather than routed per-author. **Why a dedicated seat:** fresh eyes catch what the original author re-reads blind (the two tense_choice bugs were invisible to their own author until the gloss forced a re-parse); it doesn't stall on dormant seats; and it keeps one consistent standard. **In-role guard:** it adds glosses (display-only, marking untouched) and FLAGS content bugs + criterion-20 cues to owning authors as errata; it does not rewrite grammar, cues, or buckets. Sequenced over settled topics to avoid edit collisions. Dispatch: DISPATCH_criterion_17_sweep.md.

## Cue placement, and not instrumenting our own defects (2026-07-16, from Smith)

- **The "Use X" cue moves to the END of the prompt, above the input.** **Why:** Smith showed that on ex_form_neg_01 ("Hai tempo per un caffe?" -> "No, mi dispiace, ____ tempo." cue: esserci) the natural answer *non ho tempo* is CORRECT ITALIAN and only wrong because a chip above the sentence said esserci. Root cause is CSS: `.prompt-cue { order: -1 }` hoists a cue the author wrote LAST in the prompt. That hoist plus the size bump was **my own chip_prominence ruling (2026-06-07)**, on the theory that the chip was easy to miss - and Smith's evidence kills it on its own terms: he noticed it is "bigger now" and it is *still* skippable. Size was never the problem; a constraint read before the sentence is gone by the time the sentence creates an expectation. **How to apply:** order the cue after the italian segment, directly above the answer box; keep the prominence, drop the hoist. Housing thread: Architecture_Housing_cue_placement.
- **PRINCIPLE: do not instrument a presentation defect as a learner misconception.** Smith refused the obvious "produced correct Italian but didn't read the question" category: it would be legitimate only if we were training people for exams that test careful instruction-reading, and we are not. A stat counting how often our own layout misleads people is a metric about US wearing a metric about THEM, and once it exists it gets optimised instead of fixed. **How to apply:** binds the misconception registry - no id is minted for an error whose proximate cause is our own UI. Fix the layout; the error disappears.

## Routing reports are DERIVED, not remembered (2026-07-16, from Smith's catch)

I told Smith "nothing else is waiting on you" while 26 threads across 17 seats sat open. **Two failures:** I reported only the current pass's output as if it were the standing queue, and I conflated "nothing is waiting on Architecture" (true - my desk was clear) with "nothing is waiting on Smith" (false). **Root cause:** thread status lines carried no machine-readable owner, so 16 of 30 returned UNCLEAR to an ownership scan - which meant every routing report was reconstructed from memory of the pass rather than read off disk. That is exactly the pain Smith keeps naming ("I don't know which chat to fire").

**Fix, applied:** every thread now carries a **`**Next:** <seat>`** line under its Status. The standing queue is one grep. **Standing rule: the end-of-pass routing report is grep-derived from `**Next:**` across all non-CLOSED threads, never reconstructed from what I happened to touch this pass.** Every new thread ships with a Next line. This is also the seam MetaProject's incoming coordination mechanism will want, and it should land on a queue that is already machine-readable.

## Rev 23: criterion 20 disarms criterion 19, and the broken-vs-fluent test (2026-07-17)

- **Cross-criterion hazard, found by ComparisonAuthor:** criterion 19's Rev 21(i) carve-out is conditioned on the prompt SUPPLYING or PINNING the candidate forms; criterion 20 DELETES the supplying fragment. A crit-20 retrofit can therefore silently re-open a settled crit-19 accent case. **Ruling:** a bracketed English gloss PINS as well as a fragment SUPPLIES, so the carve-out survives glossing wherever the gloss names the thing; it lapses only where the gloss leaves the lexeme open. **Binding next-touch:** re-run the criterion-19 check AFTER glossing, not before. PrepositionAuthor's exposure is the **6 items it actually reframed**, not the 55 census (corrected 2026-07-17: the 48 exempt items keep their Italian cue, so nothing was un-supplied and criterion 19 cannot have re-opened on them). `[discharged: ComparisonAuthor, 2026-07-16, verified cmp_dvc_06 rather than assuming]` `[discharged: PrepositionAuthor, 2026-07-17, cue_meaning_framing v5 — no-op on two independent grounds: programmatic scan shows zero accented answers across the 6, and every gloss pins its lexeme]` **Why it matters beyond itself:** this is the second criterion to quietly disarm another (Rev 21(iii) was the first class of this). Criteria interact, and the interactions are invisible to every gate we run. [discharged: TenseChoiceAuthor, 2026-07-18, criterion_compliance v1 — Rev-23 no-op by construction, 124/124 supplied-choice]
- **Criterion 20's test sharpened:** not "is the cue a fragment" but **"is the fragment-only answer visibly broken or plausibly fluent?"** `alto` -> "Marco è alto Luca" is self-evidently wrong and the sentence rescues the learner; `agire` -> a fluent sentence missing its connector traps them into an unrecognised miss diagnosed as a grammar failure. Gloss the trapping ones. From ComparisonAuthor, better than the rule I wrote.
- **My mechanically-derived candidate table cited the DODGE, not the answer.** The script walked any_phrases and matched the 0.9 graded variant (`è più buono`) over the canonical `è migliore`, telling the author to supply "è più" when `più buono` is the error the leaf exists to catch. Contained to 2 rows (ComparisonAuthor caught both); all other rows audited clean. **Lesson:** a derived table must exclude graded variants — a table that cites the dodge teaches the dodge.
- **Counts shown to a learner are computed live at render, never baked** (from the Vocab chip-list ratification). Same rule the entry screen learned from the load race: a provisional number must never be displayed as final.

## "Asserted live, never ruled" — a third state (2026-07-17, from TenseChoiceAuthor)

I wrote in their v3(b) that "both waves' four-beat terms now expand." False. I ruled the MERGE of the five terms accepted in May and never ruled on the two newly PROPOSED at their ask 7(b) — then reported the outcome as though I had. They caught it by checking the glossary rather than trusting my report.

**The taxonomy now has three failure states, not two.** *Proposed but never accepted* is visible. *Accepted but never delivered* is the seven-week gap that produced Rev 21(iii)'s next-touch clause — and it at least knows it is waiting. **Asserted live but never ruled is worse than both, because it claims to be finished and so nothing goes looking for it.** **How to apply:** an architect's report of a state is not evidence of that state. Verify from disk before asserting — including, and especially, against my own prior claims. Both terms are now genuinely merged (glossary v8, 150 terms).

**Companion instance the same day:** PronounAuthor's "glielo follow-ups" ask was a phantom — closed months ago, but carried on a residual list I reconstructed from memory of a pass rather than from disk. They burned a turn hunting something that did not exist. Same root as the routing-report defect; withdrawn with the apology on their thread.

## Criteria interact, and nothing we run detects it (2026-07-17)

Two instances in two days: Rev 21(ii) (gerundio narrowed) silently made TenseChoiceAuthor's tagging rule `guard == "gerundio"` match NOTHING — no error, a green run, and it would have tagged the whole progressive leaf `progressive_underuse`, eating the five overuse items and the direction finding that produced the mirror ids. And Rev 23: criterion 20 deletes the fragment criterion 19's carve-out depends on. **A rule that matches nothing throws no error.** The marker replica, the crit-18 gate and the schema check are all blind to it. **How to apply:** when a revision changes a token, an enum or a field's meaning, the next-touch clause must name not just the seats but the RULES and SCRIPTS keyed to the old value; and a seat whose retag/audit rule keys off a controlled value should assert a non-zero match count, not just a clean run.

## The stub census: one label, three meanings (2026-07-17, from Smith's question)

Smith asked whether we have a list of what is still to be made. We did not; now we do (`STUB_CENSUS.md`, derived, with the re-derivation command). **37 stub nodes, and the raw list is actively misleading because "stub" wears three meanings.**

- **12 were STALE FLAGS — authored work advertising itself as unbuilt** (article/demonstrative/preposition/relative_pronoun discriminations, condizionale's three usage leaves). CLEARED 2026-07-17. Same defect as tense_choice's 8 the week before. **Standing rule: clearing the stub flag is part of accepting a batch** — a stub flag on authored work sends the next author to build something that already exists.
- **16 are PHANTOM DUPLICATES. Do not dispatch; RULING NEEDED from Smith.** Every per-tense `discrimination.*` stub duplicates a leaf `tense_choice` already owns and has authored (185 items): present_indicative.vs_imperfect/vs_passato_prossimo/vs_future, future.vs_present, gerundio.vs_simple_present, passato_remoto.vs_passato_prossimo, trapassato.vs_imperfect_pp, condizionale.vs_imperfect_counterfactual, congiuntivo.vs_indicative, plus 7 aggregates. **"Present vs future" is registered three times** — twice in verb_form, once in tense_choice. Dispatching any authors a live skill a second time under a second bucket id and splits the learner's stats across both ids for one skill. **Why it happened:** the per-tense trees were scaffolded with a `discrimination` branch each, before tense_choice was established as the cross-tense owner; nothing reconciled them afterwards.
- **9 are the real backlog**: six `*.usage` aggregates (usage is not formation), `imperativo.discrimination.register_informal_vs_formal` + its aggregate (tu vs Lei — NOT a tense-choice duplicate, and the promised home of `register.tu_lei_mismatch`, the reserved family's only registered candidate), and `word_formation.relational_adjectives` (already parked).

## MetaProject status board: built, and the pull caught the push within the hour (2026-07-17)

Built (a) `_status/` + schema, (b) the protocol rewrite, (d) `WAKE_INSTRUCTION.md`; (c) was already done. **(e): `Next:` alone sees 20 items / 15 seats; the name-grep finds 20 FURTHER seats with no `Next:` at all but standing obligations in DECISIONS or the brief** (Vocab 18, PronounAuthor 10, NegationAuthor 6, PrepositionAuthor 5+5).

**The decisive proof is my own:** PrepositionAuthor scanned as `Next:` zero because I appended a v3 ask — Rev 23 binding them to re-run the crit-19 check on all 55 items — to a thread whose Status still read CLOSED. **The ask I wrote today was invisible to my own scan within the hour of my writing the fix for exactly that.** The push discipline (next-touch clause) failed on its own author immediately; only the pull (name-grep) caught it. **How to apply:** both, always. Prevention is a push at authoring time; detection is a pull by the seat. Neither is sufficient, and the one that depends on the architect remembering forever is the one that already failed twice.

**Design note registered:** a name hit is a CANDIDATE, not a work item (Vocab's 18 are mostly historical record). The grep says what to look at; the seat judges what is live. Replacing invisible work with unfiltered noise would kill the ritual the same way the last one died.

## Rev 24: rulings that bind everybody named nobody (2026-07-17, from Smith's question)

Smith asked: *"if you write something that affects everybody, do you have to name every single thread?"* The audit says the question exposes a hole the whole mechanism sits on. **Six of criteria 13-20 name NO seat**, so greps 1-6 of the self-check find them **never**. The push (next-touch clause) only started naming seats at Rev 21; the pull (name-grep) can only match a name that is written down. A universal ruling was invisible to both.

**Criterion 17 is the proof and the price.** It binds every author, names nobody, and says "existing items gain it on their next touch." No next touch came. **418 items across five topics sat bare, and we commissioned an entire seat (Cr17Sweep) to do by hand what delivery should have done.** Criteria 15/16's seven weeks at 0/92 is the same failure with a name attached; 17 is the version with no name at all, and it cost a seat.

**Ruling, two parts.**
1. **STANDING rules are not tasks.** Most universal rulings are standing ("new items do X") and are complied with by reading the brief when authoring. **They never enter a queue.** Otherwise every board shows all twenty criteria forever and the ritual dies of noise — which is exactly how the last convention died. Only the RETROFIT half is queueable.
2. **Class tokens, not name lists.** Every clause declares `binds:` (explicit seats or `all-authors` / `all-seats`) and `retrofit:` (`none`, or the task). Seats grep their name PLUS their declared classes (`classes:` in `_status/<Seat>.md`). **Naming every seat is the wrong fix**: a 31-name list is unmaintainable, rots silently the moment a seat is created, and still cannot tell a standing rule from a task. A class token costs one grep and a new seat inherits every standing obligation the day it declares its class.

**Discharge scales identically:** a class clause accumulates one stamp per seat; each seat subtracts only its own. This finally yields a **compliance table** — bound class MINUS stamped seats — which is precisely what Rev 21(iii) promised ("did they get knocked, did they answer?") and could not compute. **Honest cost:** a retrofit binding 31 authors shows on 31 boards until 31 stamps land. That is not noise, it is the truth, and 17's 418 bare items are what the silence cost. It also makes universality expensive by design, which is the right pressure — a rule should bind everyone only when it really does.

**New finding, from the same audit: criterion 13's retrofit was never run.** It binds all-authors, names nobody, and orders a self-audit for chip texts that leak rule names ("infinitive", "subjunctive"...). There is no evidence any seat ever ran it. Same shape as 17, undetected for the same reason, and its exposure is unmeasured. A survey is queued to Architecture. The binding register (AUTHOR_BRIEF Rev 24) now records binds/retrofit/state for every criterion, so this class of gap is visible rather than inferred.

## Rev 25 + a verified false-credit class (2026-07-17, from Smith on ex_form_q_02)

- **Criterion 20's citation-form exemption is conditioned on LEVEL.** It was written for *parlare -> conjugate* and silently assumed the citation form is known. `esserci` at A1 breaks it: the learner knows *c'è / ci sono* as chunks, not the lemma, and cannot see it as an infinitive to decompose. The cue becomes a gate rather than a scaffold. **Where the citation form is above the item's level, gloss in English instead.** `binds: all-authors`; ExistentialAuthor first (32 esserci cues, 14 at A1). [discharged: PresentFormationAuthor, 2026-07-17, rev25_and_stamps v1 — 6 clitic-lemma cues reglossed to bracketed English, 6/6 re-verified] [discharged: AdverbAuthor, 2026-07-18, rev25_cue_level_retrofit v1 — 26 cues audited exempt, 3 given vocab_help] [discharged: PossessiveAuthor, 2026-07-18, class_retrofit_audits v1 — English cues converted to bracket gloss, 0 round-paren residual] [discharged: RelativePronounAuthor, 2026-07-18, class_retrofit_audits v1 — 7 cued items at/below level, 0 reframes] [discharged: ArticleAuthor, 2026-07-18, class_retrofit_audits v1 — noun-operand cues at/below level, 0 reframes] [discharged: FutureFormationAuthor, 2026-07-18, class_retrofit_audits v1 — clean on all 65 incl. merged usage items] [discharged: PronominalVerbsAuthor, 2026-07-18, class_retrofit_audits v1 — clean on all 56, fold-aware dead-guard scan 0] [discharged: PiacereAuthor, 2026-07-18, class_retrofit_audits v1 — 13 citation-form cues exempt per Smith 2026-07-18 ruling, 0 changes] [discharged: TenseChoiceAuthor, 2026-07-18, class_retrofit_audits v1 — supplied-choice topic, no citation-form cues, 0 exposure]
- **VERIFIED: additive over-translation scores full credit and no guard can stop it.** Engine-checked (grammar_engine ~L106-169): a positive `any_phrases` match sets `hit`, and `must_not_include` is an `else if` **behind** it. So `Ci sono delle` matches `ci sono` at clean word boundaries and scores 1/1 for *"Ci sono delle domande?"*; a `delle` guard is dead on arrival. `match_at: "word"` cannot help — the correct string sits at clean boundaries INSIDE the wrong one. This is criterion 18's fourth direction, live across all 32 esserci items structurally, with 5 plausible traps (bare-noun supplied text: domande, tempo, problemi, latte).
- **The fix is one move**: widen the blank to swallow the supplied noun + gloss in English + full-phrase positive. It fixes the cue level, puts the meaning in front of the learner, and makes the test markable. **Why it matters beyond this topic: Smith's "will they put a random word in for *any*?" is a high-value English-transfer test that no item in the estate currently runs, and the engine shape is why.**

## The flag stays, and it gets renamed: the name was the bug (2026-07-17)

**I was wrong and Housing checked the code.** I argued `prompt_supplies_base_form` was redundant with `chipStemMismatch`. It is not: that check is a **first-3-characters prefix test**, and Italian's most-drilled verbs are suppletive — *essere -> sono*, *avere -> ho*, *andare -> vado* all fail a prefix comparison against their own lemma. Without the flag, an irregular-heavy formation item fires a false rescue on exactly the form error it exists to record (the `avono` bug). **Ruling (a): engine unchanged, flag stays.** (b) declined — no conjugation tables housing-side and cheap heuristics die on multi-word answers; trading a documented author-controllable flag for an undocumented heuristic is backwards. (c) declined — no speculative parking; if mis-application is still systemic after the rename, that is evidence with a number.

**The finding is the number: 1,083 items (58% of the corpus, 25 topics) carry the flag TRUE.** That is not 1,083 careless authors. **The field is named for a fact about the prompt** — *does the prompt supply a base form?* — to which the honest answer on all 1,083 is **yes**. But its **behaviour** is a claim about the **error space**: *a wrong answer here can only be a form error of the cued word*. The name never asks that. prep_sf_03 and ex_form_neg_01 were both set by authors reading the name and answering it correctly.

**Ruling: rename to the behaviour (`wrong_answer_is_form_error_only`), then audit.** Housing changes the read, Architecture migrates all 1,665 items in the same push. **Why the order matters:** auditing 1,083 items against a name that asks the wrong question just re-runs the misreading next year. **How to apply:** a field whose NAME describes the data and whose BEHAVIOUR asserts a rule will be set from the name every time. Name fields for the claim the author is making, not for the observation that prompted it.

**Third instance today of the same shape:** `stub` meant three different things (built / phantom / real); `all-authors` needed a definition before Vocab could self-classify; now this. **Labels in this estate get read literally, and they should — the fix is always to make the label say what the thing does.**

## Two standing rulings from Smith (2026-07-17)

**1. "Err on the side of thorough and good."** Smith's general ruling, given when MisconceptionAnalyst asked how far to take the tag-list fill. **When a seat's choice is between the thorough job and the cheap one, the answer is thorough, and it does not need asking.** **Why:** every cheap-option failure this estate has had — auto-filled tag-lists, sampled audits, `habitual_frame_mismatch` minted on symmetry rather than evidence — cost more to unpick than the thorough version would have cost to do. **How to apply:** seats do not raise thorough-vs-cheap as a decision for Smith; they do the thorough job. Raise it only if thorough is genuinely infeasible, and then say why.

**2. Verify before you ASK, not just before you assert.** Architecture told Smith to push for several turns running. He had already pushed: `git rev-list --count @{u}..HEAD` = **0**, committed `LL_BUILD` = **r16** — the ask was stale by three builds and one command would have shown it. **The `claude_can_verify:` field exists to prevent this and was being filled from assumption** (Housing: "push + deploys only Smith can do" — but the push IS verifiable from git; only the wrangler and Apps Script deploys are not). **How to apply:** before adding to `needs_from_smith`, try to verify it and drop the ask if you can; `claude_can_verify` must be reasoned like `classes:`, not guessed; never re-ask a standing external action without re-checking it that turn. **Why it matters:** a nag Claude could have checked itself trains Smith to ignore the board, which is exactly how the last convention died.

## Decisions go to Smith in prose, never through popups (2026-07-17, from Smith via MetaProject)

Smith reported seats putting decisions to him through interactive multiple-choice popups and "getting themselves stuck (and avoiding this system)". MetaProject checked before assigning blame: nothing in the protocol, wake instruction, `_status/README.md` or the constitution mentioned the popups at all — **no seat was defying anything.**

**The wording that caused it was Architecture's.** Wake step 3 read *"state any decision as a discrete choice with options, never as prose."* It meant "make the options explicit rather than burying them in a paragraph." It read as "don't use the chat, use a form" — because a popup IS a discrete choice with options. **We specified the CONTENT of a decision and left the CHANNEL unspecified; the app layer's defaults filled the vacuum.** Architecture used one itself the same day (the habitual_frame_mismatch ruling), which is the proof the wording misled its own author.

**Ruling: decisions go at the END of the chat message, in prose, as a lettered choice with options + a recommendation, mirrored in `_status` as `needs_from_smith: decision`. No popups for project seats, no carve-out.** **Why:** a popup writes nothing to disk — un-greppable by the self-check, un-stampable by the discharge mechanism, invisible to the board, lost if Smith steps away, and it halts the seat mid-turn. A decision that only ever existed in a popup is a ruling with no record, which is the disease the entire pilot treats. **How to apply:** fixed at source in WAKE_INSTRUCTION.md step 3 and INTER_CHAT_PROTOCOL.md, before the remaining seat walk — the wake instruction is the very text about to be pasted into every seat, so the fix had to land ahead of it.

**Fourth instance of one pattern in a single day:** `stub` meant three things; `all-authors` was undefined until Vocab reasoned it out; `prompt_supplies_base_form` was named for the prompt but behaved on the error space; and now this. **Wording here is followed literally, and it should be. When behaviour goes wrong, suspect the words before the reader.**

## The worklist was 74, not 175 (2026-07-17)

I re-derived the pos hygiene worklist from disk instead of quoting it. **74 old-shape refs remain. The census was 182; I have been asserting 175 for days.** Seats burned down 108 while I kept repeating a remembered number — on the very thread whose purpose is tracking it, and in direct breach of the rule I wrote and have enforced on everyone else all day. **This is the third number I have got wrong by remembering it** (the "55 items" I repeated twice after PrepositionAuthor refuted it; "push r11-r15" when the committed build was r16; now this).

**How to apply:** the worklist is now published as a per-topic table with the derivation command beside it, so any seat greps its own exact count. It is a **standing obligation** (fix on next touch), NOT queue — it must never appear on a board as a task. Article, relative_pronoun and verb_form.imperfect verified clear and stamped. **The pattern is not that I misremember; it is that a number in prose rots the moment it is written, and the only safe form is the command that regenerates it.**

## Criterion 13 discharged centrally: the exposure was 5 chips, not a second 418 (2026-07-17)

I flagged this morning that criterion 13's retrofit had never run and its exposure was unmeasured — "the second 418 waiting to be found". **I ran it centrally: 1,144 cue chips, 29 topics, 17 raw hits, and after triage the estate's real exposure is 5 chips, all in one topic.** There was no second 418. Recording that plainly because I raised the alarm.

**Ruling: run it centrally, discharge 26 of 29 topics at a stroke.** Waiting for 25 seats to each self-audit would have cost 25 wake cycles to find 5 items — and is exactly how 13 stayed unrun for months. `[discharged: all-authors except PronounAuthor, 2026-07-17, central chip audit]`. **This is the general shape for any `binds: all-authors` retrofit that is mechanically detectable: Architecture runs it once, stamps the class, routes the residue.** A per-seat self-audit is for judgement work only.

**Rev 26 — the refinement, and it came from the false positives.** 12 of 17 hits were legitimate: naming the TENSE in a formation drill is the **trigger** (formation items must supply it); naming agreement CONTEXT is **recoverability** (criterion 15 Rev 19 requires it, or the item is unanswerable). Criterion 13's own wording — "name the surface, not the rule" — reads as a ban on all metalanguage and would have had authors stripping the very things two other criteria mandate. **Sharpened test: a chip may name the TRIGGER and the CONTEXT; it may not name the DIAGNOSTIC.** Fifth instance today of the wording being the bug.

## 138 items say "Use <an English word>"; my gate found it by being wrong (2026-07-17)

I ran the Rev 25 cue-level audit centrally. **It flagged 33 items above-level and nearly all were false positives** — `(early)`, `(their)`, `(his)`, `(our)` are ENGLISH glosses and I was looking English words up in an Italian frequency list. Routing that would have sent eight seats to "fix" their most criterion-20-compliant items. Second time in a day a naive gate produced a false-positive storm; Cr17Sweep called it the first time and I did not generalise the lesson.

**The false positives were the finding.** The gate could not tell an English gloss from an Italian citation form because **the notation does not distinguish them — and neither does the renderer.** Verified in `segmentPrompt`: any trailing `(...)` becomes `kind: "cue"` and renders with the literal prefix **"Use "**. No language check, no `=` handling. So `(their)` renders as **"Use their"** and `(= I, masculine, got up)` as **"Use = I, masculine, got up"**. **138 items instruct the learner to use an English word.**

**The convention already existed and was 14% observed:** English-in-brackets 22, English-in-parens 138, Italian-in-parens 1,022. **Ruling: notation is binding and retrofitted.** `(parens)` = an Italian form to USE (renders as the chip, correct); `[brackets]` = English meaning (no segmenter rule, so it renders as prompt prose — correct, because **a gloss is context, not an instruction**). Itemised per topic and routed; not done centrally because `(= I, masculine, got up)` needs a human to decide its bracket form. Display-only: no marking impact.

**Two lessons.** (1) **A gate that cannot distinguish compliance from violation is worse than no gate** — mine flagged the best items in the estate. Run it, read the hits, and disbelieve it before routing. (2) The Rev 25 audit has **no number yet** and I am not inventing one: it cannot run until notation carries the language, and only 3 Italian-cue hits (`cenare` x2, `bicicletta`, `simpatico`) are defensible today.

## The "9 real stubs" was wrong: 6 of them are empty shells, not backlog (2026-07-17)

I reported the residual stub census as "9 genuinely to be made". Checked properly: **1 dispatchable, 1 parked, and 6 that are EMPTY AGGREGATES with no child leaves at all.** Nothing defines what `verb_form.<tense>.usage` owns; there is no leaf to author against. That is not backlog, it is **undefined scope**, and calling it backlog is how it would have got dispatched.

**The live question:** every verb tree was scaffolded formation / discrimination / usage. Discrimination has just been superseded wholesale into tense_choice (Smith's ruling, executed today). **So what does `.usage` own now?** Read: `future.usage` (future of probability — present conjecture, not a tense choice) and `gerundio.usage` (adverbial gerund — subordination, not the progressive) are **real and distinct**; `imperativo.usage` (pragmatics) probably is; `congiuntivo.usage`, `passato_remoto.usage` and `trapassato.usage` look **thin or empty by right**, their content having gone to tense_choice.

**Ruling required before any of the six is dispatched.** Dispatching an empty aggregate is exactly how the phantom stubs happened — scaffolded early, authored later by someone who never asked what the neighbour already owned. Three probably deserve supersession like their discrimination siblings; three want dispatches scoped explicitly against tense_choice.

**Standing rule from this:** an aggregate with no child leaves is a QUESTION, not a task. It must never appear on a board or a census as work. `stub: true` on a childless aggregate means "nobody has said what this is" — and that is the third distinct meaning `stub` has carried (built-and-unflagged; phantom duplicate; undefined scope). **Seventh instance of the label being the bug.**

**Standing up new seats — the honest list:** ConnectiveAuthor and IndefiniteAuthor only (dispatches written, 9 leaves each, trees live, zero items). The imperativo register leaf is a **wave-2 dispatch to ImperativoAuthor**, not a new seat: one leaf is not a seat's worth, and that seat is active and owns the tree.

## The usage axis is half-built, and we built the wrong half (2026-07-17, from Smith)

Smith, on the six empty `.usage` shells: *"we dispatched present usage, so does that not lead to an imbalance? I don't know if we've got the coverage we have with tense_choice."* He is right, and mapping it from disk (COVERAGE_usage_axis.md) sharpens it into a short, precise finding rather than a vague hole.

**The map:** present_indicative.usage (12 items) and imperfect.usage (31) are authored; the other eight tenses have no usage content. **But the gap is not "8 missing branches".** The test is: `tense_choice` covers a function whenever that function has a CONTRAST partner, so a usage branch only earns existence for functions with NO partner. On that test, only **three** unbuilt branches hold real, unowned, high-value content: `future.usage` (future of probability), `gerundio.usage` (adverbial gerund), `condizionale.usage` (politeness — A2 core — and reported future-in-past). Three are **empty by right** (passato_remoto, trapassato, passato_prossimo usage — their functions are contrasts tense_choice owns) and should be superseded like their discrimination siblings. Two are thin judgement calls (imperativo, congiuntivo usage).

**The sharp finding: we built the most-redundant slice and skipped the gap-fillers.** present and imperfect usage overlap tense_choice's contrasts most; future-of-probability and the adverbial gerund have NO contrast partner, so a usage leaf is the ONLY place they can be taught — and those are the ones left unbuilt. **Answer to Smith's coverage question: tense_choice's CONTRAST coverage is complete (17 leaves, 185 items); the non-contrast functions are the gap, and it is three high-value items, not a systemic hole.**

**My error, corrected:** during the phantom-stub census I cleared condizionale.usage.polite/hypothetical_apodosis/reported_future_in_past as "authored — flag never cleared". Wrong: they have ZERO primary items; the only citations are imperfect TRANSLATION items using them as secondary buckets. I turned unbuilt into built on the record — the "asserted live, never ruled" failure, committed by me, on the exact axis Smith was asking about. **Stub flags reinstated (estate-wide stub count 9 -> 12).** The lesson compounds: a bucket cited as a secondary/optional bucket is not an authored bucket, and my census counted string occurrences rather than primary markpoints.

**Not executed — this is Smith's resourcing call, put to him in chat.** No supersessions and no dispatches made; the structure is proposed, the decision is his.

## Usage axis wave 2 EXECUTED (2026-07-17): build the real gaps + the thin ones, supersede the empty

Smith ruled a/b and then "why not do the thin ones now too?" — correct, and I under-rated them. Executed: `passato_remoto.usage` and `trapassato_prossimo.usage` **superseded** (empty by right); **9 usage leaves defined** across future (3), gerundio (2), congiuntivo (3), imperativo (1), plus condizionale's 3 pre-existing, dispatched to the five EXISTING formation owners as wave 2 (DISPATCH_usage_wave2.md). No new seats. [discharged: FutureFormationAuthor, 2026-07-18, usage_wave2 v1 — 15 grammar + 8 translation delivered, accepted 2026-07-19] [discharged: CongiuntivoFormationAuthor, 2026-07-18, usage_leaf_minting v1 — 15 grammar + 7 translation delivered, accepted 2026-07-19] [discharged: GerundioAuthor, 2026-07-18, usage_delivery v1 — 16 grammar + 12 translation delivered, accepted 2026-07-19] [discharged: ImperativoAuthor, 2026-07-18, usage_wave2_delivery v1 — 32 grammar + 16 translation delivered, accepted 2026-07-19]

**Why the thin ones now: overlap-risk is a scoping problem, not a reason to defer.** imperativo.usage risked duplicating present.usage.instructions; congiuntivo.usage risked being mistaken for the subordinate trigger-choice. Both are answered by an explicit boundary line on each leaf, which is cheaper to write once now than to untangle after two authors build overlapping items. Congiuntivo's independent subjunctive is the cleanest leaf of the five — no trigger reaches it, so tense_choice cannot structurally own it. **Standing lesson: a branch left in the ambiguous empty-aggregate state is what produced the phantom stubs; defining the leaf with a boundary is the cure, and it is the same cost whether the branch is fat or thin.**

**Registry health:** 15 stubs remain, and all 15 are now DEFINED leaves with a dispatch or a park (9 new usage + 3 condizionale usage + imperativo register leaf + its aggregate + relational_adjectives), not one empty aggregate among them. The census's three-way split (built-unflagged / phantom / undefined) now has an empty third column — every remaining stub is honest 'defined but unauthored' work.

## An answer credits every bucket it evidences (Rev 27, 2026-07-17, from Smith)

Smith, on my overlap-risk hedge over the usage leaves: don't be scared of a function firing in two places; let it credit the usage bucket AND the tense_choice bucket. **The worry about credit being 'split' between two buckets assumes evidence is exclusive to one skill. It is not, and the engine already agrees.**

**Verified, not asserted** (node harness against grammar_engine.js, 2026-07-17): one correct answer, two markpoints at `credit: 0.5` each on different buckets -> item marks **1/1**, and **both** bucket events carry correctness **1.0, outcome hit**. Marks and mastery are decoupled: the markpoint `credit` weight normalises the item's mark; the bucket event records raw correctness. 56 items already do this across topics (pas_ess_* credit passive+verb_form; ind_tutto_06 credits article+indefinite).

**Ruling: an item carries a markpoint for every bucket its answer genuinely evidences; a leaf boundary governs what the leaf TEACHES, not who may credit an answer.** **Why it matters here:** my usage-dispatch boundaries were framed as walls to stop a usage item touching a tense_choice bucket — solving a non-problem. **How to apply:** where an item legitimately evidences two skills, author two markpoints and weight them to keep the item's mark at 1; never split coverage or shrink a leaf to avoid overlap; overlap between usage and tense_choice is expected and good. **This is the seventh time today a constraint dissolved once the underlying assumption was named** — here, 'one answer, one bucket', which nothing in the engine ever required.

**No rework needed:** the 56 cross-crediting items are correct as-is; this ratifies the pattern rather than changing data. The usage dispatch boundaries are reframed (below) from walls to teaching-scope.

## I told Smith to stand up seats that had delivered 15 hours earlier (2026-07-17)

**The failure, plainly:** I told Smith across several turns to "stand up ConnectiveAuthor and IndefiniteAuthor". Both had delivered ~15 hours earlier — 96KB grammar files, coverage docs, batch-delivery threads, `_status` declarations, all on disk. I ran a one-off "does this topic have items" check EARLY, when they genuinely had none, concluded "not started", and carried that stale conclusion forward without re-reading. Smith: *"why do you keep asking... suggests this just isn't working."*

**It is the exact failure I spent the day enforcing against every other seat — assert from memory, not disk — committed by me, on the flagship question the status board was built to answer.** The board and `_status/` were correct and populated the whole time; I did not read them, and hand-rolled a heuristic that could not tell "never started" from "delivered, items not yet checked this turn". The system was working; my USE of it was not.

**Root cause:** "how many items / what is unstarted / who to fire" is a live disk fact, and I answered it from a cached derivation. Same class as "55 items" (repeated after refutation), "push r11-r15" (already r16), "worklist 175" (was 74). Four instances in one day of the architect remembering a number instead of deriving it.

**Fix: ESTATE_STATE.md** carries the one canonical derivation command, with the rule: before claiming anything about estate progress or which chats to fire, RUN IT. Delivered != fireable; a closed seat awaiting my stamp is my action, not a wake. **Live truth as of this ruling: 0 unstarted topics (every authoring topic has items; 2,029 grammar + 793 translation across 31 topics); the ONLY unstarted work is the 5 usage-wave-2 branches (0 items each).** No new seats exist to stand up.

## Mastery colour + verb-formation person split (2026-07-17, from Smith, live colouring; ruling corrected)

**1. One correct answer greens a cell fully; Smith wants two.** Verified: `recencyWeightedCorrectness` returns `7/7 = 1.000` on a single correct. **Ruling = Smith's design: floor the denominator, `correctness = wC / max(wA, FLOOR)`, FLOOR = 9.5.** One correct -> 0.737 (strong green, not full); two -> 1.000 (full green). It is surgical: a 2+-attempt cell already has wA >= 10, so any FLOOR in (7,10] damps ONLY the lone first correct and changes nothing else; 9.5 is inside that window, not arbitrary. Exposed as one constant for Smith to tune. **Correction on the record:** I first drafted a 5-6-attempt confidence ramp and attributed a "start from red, prove it" intent to Smith — both were mine, not his, and are withdrawn; his floor is lighter and correct. His own question "is there ever a place where one correct is enough?" -> answered "prob not": one still shows strong green, the only pinch is single-item bands where a repeat is better evidence anyway, and MCQ (guessable) argues for a HIGHER bar not a lower one. Spec: Architecture_Housing_mastery_confidence_damping.

**2. Split verb-formation cells into the six conjugation persons.** Person IS recorded, but only in the external_id (78% derivable; 100% for present/condizionale/remoto, 12% imperfect, and gerundio is non-finite so has NONE by right). **Ruling: add a structured `person` field (1sg..3pl or null for non-finite); Architecture migrates the derivable ~350 centrally and work-orders the ~96 residue to authors; Housing tags events with person and renders finite cells as N paradigm bands.** This is also the structural half of fix 1 — a six-band cell means one correct fills one band, not the box. Spec: Architecture_Housing_verb_formation_person_split. **Not executed this turn:** the migration needs care (non-finite = null, imperfect needs backfill) and I am not mass-mutating 450 items on a first pass; schema + coverage reported, migration is a ratified follow-up.

**Both are Housing-display + (for 2) a data field; neither touches marking.** The colour is a lens on the same events.

## Verify-and-stamp agent adopted as Architecture's standing first act (2026-07-19, ruling on MetaProject v9 / Smith's design)

**Ruling: ADOPT Smith's design.** On every Architecture wake, the first act — before any design thread — is to spawn a fresh verify-and-stamp agent over all non-CLOSED `Next: Architecture` threads. **Why it dominates the alternatives (Registrar seat, stamps-only session):** a spawned agent has an empty context every run, so deriving from disk is not a rule it might break but the only thing it can do; the trigger rides wakes that already happen, so nothing new depends on Smith remembering; the architect's context stays on design. **Guards, sharpened one notch from v9:** the agent runs in a READ-ONLY agent class (no Write/Edit), so verify-never-rule is enforced by tooling, not briefing; every draft stamp must carry its evidence pointer AND the command run; anything ambiguous returns unstamped as cannot-verify. **Calibration path per v9:** first run = agent drafts, architect reviews all + spot-audits a sample before applying; thereafter agent output is applied with a per-run spot-audit sample. **First run (2026-07-19): 45 threads walked; 18 draft stamps, architect spot-audited 3/3 clean (si 9-item parity flip, present-formation 6 cues, tense_choice 124-item scan), 15 applied above, 3 held on the agent's own caveats (buono_02 is thread-level acceptance with no DECISIONS clause; Vocab theme-prune clause unpinned; Pronoun rev19 clause mapping loose); 19 genuine rulings isolated for the architect; 5 honest cannot-verifys (the Cr17Sweep gloss reports — zero-marking-delta needs a marker-replica re-run, and the topic files have grown past the reported counts, so stamping on counts would be the stale-number failure again); 3 stale threads.** Also surfaced: per-seat criterion-13 stamps are redundant — the central discharge at the 2026-07-17 chip-audit clause already covers all-authors except PronounAuthor. **How to apply:** standing order written into ARCHITECTURE_HANDOFF.md; MetaProject's board regeneration shows the before/after.

## Wave-2 usage leaves were nested where the loader never looks; flattened, minted, two batches accepted (2026-07-19)

**The finding: the previous mint pass wrote the wave-2 usage leaves as nested `children` arrays inside the four `.usage` parent nodes, but the production loader indexes only the top-level array** (`for (const b of r.tree) buckets.push(b)`), so every one of those leaves was invisible to the bucket index and every item citing them strict-rejected, while the tree file made them look 'defined'. The label-is-the-bug family again, in data shape rather than wording: minted-but-nested is not minted. **Standing rule: minting a leaf means a FLAT top-level entry in the tree file; `children` arrays are never authored in bucket JSON.** All four trees (future, congiuntivo, gerundio, imperativo) flattened; estate-wide strict-resolve now ZERO unresolved across all grammar markpoints and all translation required/optional buckets.

**Executed on the back of it:** future's three usage leaves destubbed and enriched from the author's `bucket_suggestions` (labels kept terse); congiuntivo's three destubbed as-is; **future usage batch (15+8) and congiuntivo usage batch (15+7) ACCEPTED**, gates clean (marks==sum(credit), no dup ids, full resolution), stamps on the wave-2 clause above. **`verb_form.imperativo.usage.impersonal_infinitive` MINTED** from the author's proposal (the second-leaf test in the dispatch is genuinely passed: present-usage owns the si-impersonal, this owns the bare infinitive, and it is not a register choice) — stub RETAINED, as are gerundio's two and pragmatic_softening's, because those batches live in sibling `*.usage.json` files the manifest cannot load and acceptance (merge + manifest wiring) has not happened yet; clearing a stub is part of accepting a batch, not of registering a leaf. **`pronominal_verbs.meaning.frozen_tail_idioms` ratified and placed under `meaning`** (tails are vocabulary-shaped; the frozen-clitic agreement rule stays with mechanics.sela_type); terse label, no suppress; 10+3 items live on registration; Smith's direct commission 2026-07-18.

**New finding from the gate, queued to Architecture: 27 phantom bucket ids in the oldest translation items** (~35 items: trans_aa_*, trans_pp_*, trans_op_*, trans_impv_*, trans_noun_*, dem_trans_*) cite free-form pre-tree ids (`preposition.articulated.della`, `verb_form.imperfetto`, `possessive.miei`, `verb_form.subjunctive.present`...) that resolve to nothing, so their mastery credit silently drops. Mechanically detectable, judgement-mapped: a central Architecture pass per the crit-13 precedent, each id re-pointed to its canonical leaf. Not executed this turn — the mapping deserves an unhurried pass, not a tail-end one.

## Person field RATIFIED by Smith (2026-07-19)

Smith ratified option (a) on the six-person split schema: **field `person`, values `1sg` `2sg` `3sg` `1pl` `2pl` `3pl`, `null` for non-finite forms.** Unblocks the migration per the 2026-07-17 ruling: Architecture migrates the ~350 derivable-from-external_id items centrally, work-orders the ~96 residue (imperfect-heavy) to authors, gerundio et al. non-finite get null by right. Housing then tags events with person and renders finite formation cells as six paradigm bands. Queued behind the batch-acceptance phase per Smith's same-turn triage ruling (blocking mints -> acceptances -> design rulings -> migrations).

## Smith's live round on the deployed site: four rulings routed; the minting rule re-grounded (2026-07-19)

**The minting rule, re-grounded after Smith's pushback.** He challenged "minting = flat top-level entry" as arbitrary: "because you couldn't find something, you're saying it can't hide". The challenge is fair against the wording, and the wording is hereby improved; the rule survives on its real ground, which the original entry under-stated. **The hierarchy is already fully encoded by `parent_id` on every node; a `children` array is a SECOND encoding of the same fact, and two encodings of one fact drift** — the wave-2 bug WAS that drift (nested nodes whose parent_id-encoded siblings the loader indexed while the nesting hid them). The estate's 30+ other trees, the loader, and the engine all read the flat form; display nesting is BUILT from parent_id at render time, so nothing is lost to authors. **Rule as restated: one encoding, and parent_id is it.** The alternative (nested-canonical + a loader change) was offered to Smith in chat; flat recommended as the incumbent read by everything. Guard either way: the verify pass now includes the nested-children scan.

**Rulings from the screenshots, all Smith's, all routed:**
1. **Deceptive-gender items co-credit vocab gender** (dem_questo_trap_f_01: "questa mano" is more a test of mano's gender than of the demonstrative). Rev 27 application; second markpoint to `vocabulary.it.mano.noun.gender` (Architecture mints the bucket on landing); DemonstrativeAuthor audits its other deceptive-gender nouns on the same touch; beyond that topic it is next-touch practice, not a retrofit queue. Thread: Architecture_DemonstrativeAuthor_live_round_mano_and_meaning.
2. **Meaning up front on referent-distinction items**: the prompt states the English target ("to mean 'THAT friend lives near me'"), not the Use-chip alone. Demonstratives first; same thread.
3. **finché-non Why expanded** to teach the alternative reading with the reversal minimal pair; C1 placement confirmed fine. Thread: Architecture_NegationAuthor_finche_non_explanation.
4. **Housing UI batch**: inline the vocab POS-disambiguator parenthetical (currently breaks onto three lines); choose-or-type chips for small candidate sets + a type/select preference filter (mobile-driven, typing preserved as "good practice"); tiny visible 1-4 badges on MCQ choices (keys already work). Thread: Architecture_Housing_live_round_input_modes_and_card_layout.

**Answer to Smith's registry question**: the quell'-before-vowel grouping he half-remembered IS in the misconception registry — `agreement.prenominal_allomorph` (wrong allomorph of bello/buono/quello) plus the separate `orthography.failed_elision`. Registry data/misconceptions.json, 75 entries, architecture-owned; MisconceptionAnalyst proposes via suggestion files.

**2026-07-19, later: Smith ratified (a) — flat stays canonical.** One encoding, `parent_id` is it; nested-canonical declined. No migration needed (disk already complies); the verify pass keeps the nested-children scan as the guard.



## Gerundio + imperativo wave-2 batches ACCEPTED; wave 2 is now fully landed (2026-07-19)

Gerundio usage (16+12) and imperativo usage+register (32+16) merged into the base topic files (sibling *.usage/*.discrimination files renamed .merged.bak; a manifest topic requires its own bucket tree, so MERGE is the wiring, matching the future/congiuntivo precedent). Leaves enriched from the authors' bucket_suggestions and destubbed, including the register discrimination pair; parent descriptions rewritten to the narrowed scopes. register.tu_lei_mismatch topics extended to verb_form.imperativo (19 tagged guards get their home). Glossary v9: 'adverbial gerund' merged. Rulings inside the acceptances: (i) GerundioAuthor's no-tense_choice-markpoint call CONFIRMED (the adverbial gerund has no contrast partner; no gerund-vs-full-clause bucket minted, it reads as register/style and is parked, not scaffolded: an aggregate with no defined owner is a question, not a task); (ii) the usage-formation dual-cite (avendo finito at 0.5+0.5) RATIFIED as the intended Rev-27 reading across one topic's axes, same ground as future's past-probability co-credit; (iii) anti-anchor items where the gerund is WRONG are the design, not miscoding: the same-subject constraint is tested by wrongness; (iv) the literary absolute gerund stays excluded at B2 (a single C2 item parked as optional). Gates: marks==sum(credit) clean both topics, no duplicate ids, no new unresolved buckets (legacy 27 unchanged), dual-cite and register double-markpoints verified on disk. Estate stub count: 15 -> 4 (condizionale's three defined leaves + relational_adjectives park).

## A quarter of the formation corpus scores tense-choice errors as formation failures (2026-07-19, from Smith's live catch)

**The finding, from Smith on pp_reg_ere_04:** he typed *credevo* — a correctly formed imperfetto, arguably the more natural tense for a belief verb under "All'inizio... ma poi" — and was scored 0/2 with misses on auxiliary.avere_default AND participle_form.regular.ere_uto, two skills his answer never engaged. His diagnosis was exact: "it just says I used the imperfect where I should have used the perfect", which is tense_choice evidence, not formation evidence. **Audited estate-wide the same hour by a fresh-context read-only agent (the standing verify design, its first judgement dispatch): 571 formation items, 142 AMBIGUOUS (25%) where a well-formed competing tense fits the frame; 120 of those carry prompt_supplies_base_form=true (mis-attribution live and second-chance rescue disabled); 22 (all passato_prossimo, the type case included) have no flag key at all.** Fires: passato_remoto 35/39 (competitor is the modern-register passato prossimo), future 45/52 (competitor present-for-future), passato_prossimo 22/70 (competitor imperfetto). Clean by construction: congiuntivo 0/90 (governing trigger), gerundio (cue names the form), imperativo (command frame). Architect spot-audited 6 agent verdicts on disk: all exact. Record: AUDIT_formation_trigger_2026-07-19.md.

**Ruled now (standing): AUTHOR_BRIEF Rev 28 / criterion 21** — a formation item must force its target by trigger-name, partial form, excluding frame, menu, or command frame; **a bare temporal adverb is not a trigger**; an ambiguous frame forbids the form-error-only flag. binds: all-authors; new items comply immediately.

**Pending Smith (the retrofit remedy, options in chat):** (A) Architecture appends the tense name to the cue chip on all 142 centrally (mechanical, uniform, Rev-26-licensed; authors verify on next touch; competitor lists in the audit enable optional attribution guards later); (B) per-author work orders, six seats; (C) central fix for the ~High-severity subset only, work orders for the rest. Interaction noted: the 1,665-item flag rename migration should land AFTER the remedy so the renamed flag is set against honest frames.

**Why this matters beyond the 142:** the mastery matrix Smith watches is built from these events; 120 items were silently writing red into formation cells whenever a learner made a defensible tense choice. The atomic-error principle (constitution: classify the wrong answer by the skill it shows) was being violated by item design, not by the engine.

**2026-07-19, later: Smith ruled B on the formation-trigger retrofit — per-author rework, not a central append.** Each of the
seven owning seats chooses per item among cue-naming, partial-form, and frame-strengthening; work orders dispatched
(Architecture_<Seat>_formation_trigger_retrofit.md x7: FutureFormation 45, PassatoRemoto 35, Passato 22 incl. the type case
and the missing flag keys, ConditionalFormation 19, Imperfect 11 incl. possible tense_choice re-homes, PresentFormation 7,
Pluperfect 3). Craftsmanship over speed accepted knowingly: the false reds stay live until each seat delivers. The
1,665-item flag-rename migration stays sequenced AFTER this retrofit. Criterion 21's register row tracks per-seat stamps.

## Person migration EXECUTED; the six-band state question answered from disk (2026-07-19)

Smith asked why the six-person bands have not appeared and what the true state is. **Derived answer: nothing was miswired — the chain was specced as three links and only link one had an owner-action outstanding, which was Architecture's own migration, now run.** (1) ARCHITECTURE: `person` field migrated centrally — 372 formation items set from id/pronoun/cue tokens across two mechanical passes, 36 gerundio items explicit null, 163 residue routed to authors riding the criterion-21 touches (PP 70, imperfect 52, imperativo 15, congiuntivo 11, trapassato 8, future 7); spot-verified against prompts. (2) HOUSING: event person-tagging + N-band render now unblocked (thread advanced, Next: Housing). (3) SMITH: push after Housing builds. **Separately: the 9.5 mastery floor is IN the pushed HEAD (verified via git show, rev-list 0), so two-for-green is already live** — a stale browser cache is the likely reason it may not look different. **Click-to-drill: handlers exist in shipped code; Smith reports dead clicks; routed to Housing for live diagnosis (stale cache vs regression vs narrow hit target), plus his feature ruling: drill-into belongs everywhere the colours render (vocab and translation have none). Nothing that looks clickable may do nothing.** index.html's dirty state is a whole-file EOL rewrite, content identical — housekeeping only.

## "Drill" disambiguated; paradigm bands generalised on Smith's ruling (2026-07-19, late)

**Drill:** Smith resolved tonight's cross-purposes himself — drill-as-FILTER works and is the intended meaning; his "nothing happens" was an expectation of click-to-reveal that never existed. The live defects are narrower and real: the highlight misbehaves when filtered to a single box, and drill-OUT does not undo back up the levels. Both to Housing for a live session with him (thread v2). His reach ruling stands: drill = filter, everywhere the colours render; vocab and translation currently have none.

**Paradigm bands:** Smith ruled the person-split treatment generalises to "all the things composed of several sub things", double-height cells authorised if needed. Design written (Architecture_Housing_paradigm_bands v1), grounded in the trees: two patterns exist — forms-as-LEAVES (adjective_agreement; already its own boxes, no work) and paradigm-INSIDE-a-leaf (the gap: preposition.articulated.formation, article definite/indefinite forms, demonstrative questo/quello, possessive.adjective.forms). **Schema: the leaf DECLARES its paradigm ({field, slots, labels}); the item carries the slot; the renderer bands in declared order and never invents a band** — one mechanism, one encoding, declared not inferred. Slot migration is mostly mechanical (the correct answer is the slot), so Architecture runs it centrally per family after Housing generalises the render. Sequencing: person render ships first (builds the machinery), then the generalisation, then prepositions (Smith named them twice), articles, demonstratives, possessives.

## Lemma retrieval in formation items — Smith's proposal via the feedback widget (2026-07-20, design pending his pilot ruling)

**The proposal (Smith, via the feedback sheet — which worked end-to-end, r24 metadata intact):** instead of handing the learner the Italian lemma, write the English ("I eat (generally)") and have them RETRIEVE the verb as well as conjugate it; where two Italian verbs are plausible, hint ("the verb 'to eat', beginning with m"); cross-credit the vocabulary bucket so knowing the word gets ticked off too. His rationale: fires the vocab in context, "slightly extends the whole project and makes it slightly more exciting."

**Architecture's read: adopt with guardrails — it is Rev 27's principle extended to lemma retrieval, and it gives the vocab strand PRODUCTION evidence the vocab tab alone cannot. But it reopens, deliberately, the exact ambiguity criterion 21 just closed:** an item demanding retrieval + formation has two failure modes again, and a learner who picks the wrong verb but conjugates it perfectly must NOT be recorded as failing formation. The guardrails that square it:
1. **Retrieval only where the lemma is unambiguous from the English, or hinted** (Smith's own condition). The hint is part of the design, not a concession.
2. **Lemma level at/below item level** (Rev 25's logic pointed the other way round: only demand retrieval of vocabulary the learner at this level owns).
3. **The retrieval is CREDITED, not just demanded**: add a vocabulary markpoint (vocabulary.it.<lemma>.verb.translation, minted on cite like mano's gender bucket), weights normalised per Rev 27.
4. **Attribution guards for plausible competitor lemmas** (graded ~0.5 + steering note: right idea, the verb wanted was X) so the atomic-error principle survives.
5. **The English frame carries the tense trigger** ("I eat (generally)" / "I ate (yesterday, completed)") — aspect glosses in English are strong criterion-21 triggers, so this SERVES the trigger rule rather than fighting it.

**Rollout options put to Smith in chat (recommendation: a): (a)** pilot on present_indicative (~15 items, PresentFormationAuthor holds the lightest criterion-21 load), judge live, then standing pattern for new items + gradual retrofit; **(b)** standing pattern for new items only, no retrofit; **(c)** ride the criterion-21 touches estate-wide now — advised against: it doubles the size of an in-flight retrofit and mixes two redesigns in one diff. Not executed pending his letter.

## Live round 2: seven findings, one new defect class, three agent sweeps ruled (2026-07-20)

Smith ran real learners through the site. Findings and dispositions:
1. **No shuffle** — items served in authoring order. Housing (live_round2 thread).
2. **False-miss class, agent-swept the same hour** (his ask: "stop pinging people wrong when they're correct"): a write-capable fresh-context agent judged all 1,966 short items against a replica of the marker; **39 items + one 5-item class zero fully-correct natural Italian** (20 TOP-severity), machine-verified, itemised in AUDIT_false_miss_2026-07-20.md. **New structural class named: BLANK-BOUNDARY ZEROS (12 items)** — accepted phrases span words the prompt already prints, so the exact correct blank content scores 0; pv_celho_02 and imp_isp_int_03 even credit answers that read back ungrammatically (non non / per per). Type cases: pv_celho_03 (bare "hai il passaporto?" is fully standard — the chip's claim that bare hai "sounds unfinished" is linguistically false), pia_fam_04 (mi pare ≡ mi sembra, zeroed). **Routing: per-author packets next architect pass** (piacere 8, preposition 6, pronoun 5, negation 4, connective 4, pronominal_verbs 3, comparison 3, si_constructions 2+5, existential 1, indefinite 1, imperfect 1, remoto 1). Remedies per audit: graded 0.9 additions, blank-only phrase widening, prompt reframes, or the new multi-select qtype (feasibility with Housing).
3. **Prompt-layout break** on operand cues (the stranded "me") — Housing, same segmentPrompt family as r24's vocab fix.
4. **Duplicate-supplied-word bugs** (pv_celho_02's non) — the blank-boundary class above; owning authors fix with the false-miss packets.
5. **Accent slips invisible**: ruled — never dock marks, but the verdict must make the slip unmissable, and the slip event must record word + accent class so per-class slip analytics are reconstitutable. Housing.
6. **Jargon labels: 523 markpoint labels across 13 topics** say IOP/DOP/3sg/masc (grep-derived). Violates the friendly-labels rule. **Ruled: central rewrite staged as an Architecture pass** (labels are display-only; no marking impact), per-topic tables issued for author confirmation on next touch — the crit-13 central-discharge shape.
7. **Explanations too paragraphy** (Smith: re-paragraph/light bullets to make good long explanations digestible). **Staged as a pilot**: check renderer support for structure, reformat ~10 samples for Smith's approval, THEN sweep — a mass editorial rewrite without an approved sample is how house style drifts.

## Shared login + pulse ADOPTED; four rulings from Smith (2026-07-20)

EdTechOverview's commissioned packet (estate sign-in, one-workbook attempt pulse, scoped class dropdown) is adopted; Housing builds (Architecture_Housing_shared_login_and_pulse v1). **Smith's rulings: (1) same login as physics** — shared identity key, anonymous_id + display_name common; **(2) classes differ per project** — cohort scoped per the addendum, dropdown interim-hardcoded until TeacherViewer M2's doGet; **(3) maximal payload from day one** ("absolutely as much information as possible so you don't have to retro-add anything") — per-markpoint bucket results, misconception + direction, classed accent slips, graded credit as status half + exact score, person, build, input mode, duration, all in extra_json; **(4) teacher view dealt with elsewhere** — TeacherViewer reads the workbook; Linguics builds no teacher surface. No parallel sheet.

## The wake-fire lapse, owned and repaired (2026-07-20, from Smith)

Smith caught it: the verify-and-stamp sweep ran ONCE at seat takeover and never again, so EdTech's login packet (and MetaProject's sincerity retrofit) sat unread while the architect worked a queue it remembered. That is the stale-cache failure, committed by the seat that polices it, again. **Repair, added to the standing order: the sweep fires on every wake AND the architect re-derives the inbound delta (inter_chat mtimes + Next-grep) at every pass where other seats may have written — Smith runs seats in parallel; a mid-session estate is a moving estate.** Constitution principle 3 already said this ("re-read your threads before EVERY post"); the standing order now points at it. Also adopted at Smith's instruction: the session task list, used from this pass on, so multi-item turns stop relying on the architect's memory of its own plan.

## Banned sincerity-words retrofit: accepted, central fix queued (2026-07-20)

MetaProject's new estate law (genuinely/honestly/truly/frankly etc. banned in user-facing copy) reached Linguics with ~12 itemised learner-facing hits. **Ruled: fix centrally** (display prose, no marking impact; crit-13 central shape), next architect pass, then stamp. **Canonical-copy answer for MetaProject: `C:\Claude (not on Gdrive, nor OneDrive)\Linguics` is canonical; the OneDrive Language Learning folder is a decommissioning mirror — do not keep it in sync, migrate anything unique.** Exemptions honoured (glosses where the word IS the content).

## Pronoun order battery commissioned (2026-07-20, from Smith's live learner)

A real learner was stuck on clitic ORDER; Smith commissioned imaginative which-of-these-are-correct order items (permutation distractors, both-correct enclitic/climbing pairs). Dispatched to PronounAuthor as a creative brief (Architecture_PronounAuthor_order_imagination_battery v1); PronominalVerbsAuthor to be pointed at it for the ci-heavy topic; multi-select qtype feasibility already with Housing.

## Smith's third live pass: lemma pilot GO, pari redesign, aspettare referent rule (2026-07-20)

1. **Lemma retrieval: option (a) RATIFIED.** Pilot dispatched to PresentFormationAuthor (~15 items). Notation ruled: untranslated qualifiers in SQUARE BRACKETS or distinct typeface (*I eat [generally]*) so they are visibly not-for-translation — consistent with the estate bracket-gloss convention; contextual steering ("beginning with m", "i.e. ...") encouraged where two verbs are plausible.
2. **pari/dispari/impari redesigned** (AdjectiveAuthor): candidate-set framing (Rev 19 visible-candidates) replaces the Use-pari chip Smith called "giving it on a plate"; English meaning up front with the target word EMPHASISED; leaf declares paradigm slots [pari,dispari,impari] (first non-verb use of the paradigm-band design; taller cells authorised); more items per lemma; vocab cross-credit per lemma ("linked to knowing the word").
3. **Aspettare-class rule** (PronounAuthor): the wait-FOR transfer trap is only testable with 3rd-person referents (mi/ti collapse the DO/IO contrast); items use lo/la/li vs gli/le; volume of variants ruled legitimate. 
4. Confirmed for the record: the learner misreading "Right answer: non ce l'ho" as requiring a second non is real harm from the blank-boundary class; the 12 itemised blank-boundary items ship with the false-miss author packets (the sweep Smith asked for is AUDIT_false_miss_2026-07-20.md — no additional sweep needed, the class is already itemised).

## Accent + stress programme opened; generation ruling proposed; the imagination question (2026-07-20, Smith's 20-minute design pass)

1. **Two new drill strands ruled by Smith: accents and stress**, each with a dedicated author seat (dispatches next architect pass). Full design captured same-hour in DESIGN_accent_and_stress_drills.md — the per-type outcome-stacked double-height bars with the separated insertion slice, the placement-class taxonomy (agent to propose; seed classes -ché / final-tà / meaning-bearing pairs / tense-bearing remoto / pronunciation-neutral), the 1-4 quick-fire drill shape, the stress confusion matrix with Architecture's row-normalisation proposal answering his penultimate-dominance worry. Open content question flagged: are wrong-kind accents penalised in Italian exams.
2. **Piacere public label** changed at Smith's instruction: "Piacere: saying what you like, and the like" (covers the mancare/servire/bastare family the topic already teaches; exact wording from dictation, Smith to adjust if misheard).
3. **Volume + generation, Smith's ask answered** (he noted no prior response — correct, it had slipped past in an earlier garble): proposal on the record — (a) MECHANICAL VARIANT EXPANSION first: permute person/referent/lemma inside already-accepted frames (the aspettare and pari cases are exactly this shape), engine-validated + criterion-gated programmatically, provenance-tagged, author spot-review by sample; (b) CHEAP-AI GENERATION second: Haiku-class drafts against the brief + automated gates (validator, criterion-18 anchoring audit, marker replica) + author acceptance sampling; nothing ungated ships. Duplication-with-variation explicitly OK per Smith; fresh better. Provenance field (generated_by: variant|ai|author) so quality is trackable per source. Pilot topic: pronoun referent-variants (the aspettare battery) since the demand is live. AWAITING Smith's letter: (a) both pipelines piloted, (b) mechanical only, (c) hold.
4. **The imagination deficit, named by Smith** ("not enough thought about whether it's best to give this in English... one of many, many examples"): Architecture's answer is a standing ITEM-SHAPE REVIEW — the corpus defaulted to cloze+Use-chip because that is what the substring marker made easy (the tool shaped the questions); the palette is now wider (English-target retrieval, which-are-correct multi-select, order permutations, candidate-set discrimination, quick-fire). Proposed: per-topic shape reviews producing one-page "ideal probe shape per leaf" proposals for Smith's fast per-topic judgement, starting where he has already reacted (adjectives, pronouns, pronominal verbs). AWAITING his go.

**2026-07-20, later — Smith's letters on the design pass:** **A(a)** generation pipeline piloted, mechanical tier first, riding the PronounAuthor aspettare battery (seed frames + declared axes author-side; expansion + gates + provenance Architecture-side; sample review; AI tier gated behind the pilot). **B(a)** item-shape reviews GO — adjective_agreement, pronoun, pronominal_verbs first; Architecture produces the first one-pager as the template. **Accent stack order ruled**: green (correct) bottom, orange (wrong-kind) middle, red (omitted) top; insertion slice below the gap unchanged. **Piacere label**: "Piacere: saying what you like (and the like)". Stress-matrix diagonal spec confirmed as captured (design doc B2).

