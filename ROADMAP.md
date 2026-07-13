# ROADMAP.md

What gets built, in what order, and why this order. Each milestone has an output the author can use; nothing here is "build infra and then build features."

## Milestone 0: Decisions and scaffolding (no code in `app/` yet)

Before any backend work, the items that are cheap to settle and load-bearing later:

- Confirm the bucket taxonomy's top-level groups (see DESIGN.md §4). The list of 15 groups should be reviewed and adjusted before any markpoints reference them.
- Decide whether the v1 deployment is Fly.io alongside memtool or something else.
- Decide whether to set up a fresh GCP OAuth client or reuse the memtool one with an additional redirect URI.

Output: a list of confirmed bucket groups, a deployment target, an OAuth approach. Tracked in DECISIONS.md.

## Milestone 1: Grammar-only, single learner, local

The first usable build. No translation, no AI, no Memoriser bridge.

- Backend scaffolding (FastAPI app, SQLite, migrations, schema_migrations).
- `users` and `oauth_tokens` tables; Google OAuth working with the same scope set memtool uses (or a subset: no Sheets read at this stage).
- `languages` table seeded with `it` and `en`.
- `grammar_questions`, `grammar_markpoints`, `grammar_question_tags`, `buckets` tables.
- A small seed set: 20-30 grammar questions in Italian on a single topic (e.g. present indicative of avere and essere). Authored by hand or by one batch-authoring chat. Bucket ids drawn from a starter taxonomy.
- Grammar marker: port PreIB's `norm()` + `markShortLong()` into `static/js/grammar_engine.js` and into `services/marker_grammar.py` (Python copy for server-authoritative scoring).
- `POST /grammar/attempts` endpoint; persists attempts and markpoint_events.
- `static/grammar.html`: prompt, input, mark-and-show flow. Chips for mark points coloured by outcome. No stats yet.

Output: the author can do 20 minutes of Italian grammar practice and have the events stored. No AI cost yet.

## Milestone 2: Stats v1

The data is being recorded; now make it visible.

- `GET /stats/buckets` aggregating from `markpoint_events`.
- `GET /attempts/{id}` returning one attempt with its events (already partly there from Milestone 1).
- A simple stats page: per-bucket hit/miss counts, sorted by recent misses. Click to see the timeline of recent attempts.

Output: the author can see "I keep missing `verb_form.passato_prossimo_essere`."

## Milestone 3: Translation strand, `literal` intent only

Now the AI joins.

- `translation_items` table; seed with 30-50 EN→IT and IT→EN sentences on the same topic as the grammar seed (so the per-bucket history aggregates meaningfully across strands).
- `services/marker_translation.py`: Anthropic API call, structured-output schema, schema validation, retry-once-on-malformed.
- `POST /translation/attempts` endpoint; persists.
- `static/translation.html`: prompt, intent toggle (only `literal` enabled for now), textarea, mark-and-show flow with evidence-rich mark-point chips.
- Bucket-draft workflow: AI-introduced novel bucket ids land in `draft_buckets`, with a simple `/authoring/buckets/drafts` review page.

Output: the author can do 20 minutes of translation, see structured marking, and review what new buckets the AI is trying to introduce.

## Milestone 4: Authoring tools

The seed sets are exhausted; authoring at scale needs proper tools.

- Google Sheets integration: pull grammar / translation / bucket sheets via the Sheets API, alias-tolerant header mapping, version+severity handling. Re-uses memtool's sheet_import where sensible.
- `authoring/editor.html` for paste-and-edit batch authoring (mirrors PreIB's editor).
- Bulk import endpoints (`POST /authoring/*/import`).
- Authoring-side tests: "this item should grade this attempt as 'full'; let's run the marker and confirm."

Output: a third party can write a batch authoring chat, paste output into a sheet, hit import, and see the questions appear.

## Milestone 5: Memoriser bridge

The vocab strand becomes useful.

- `services/memtool_bridge.py`: HTTP client of memtool's API. Read-only.
- `GET /vocab/word` enrichment in the translation marker: when a `vocabulary.*` bucket fires, look up the learner's score in memtool and include it as `evidence`.
- `static/vocab.html`: link out to memtool, plus the recent-activity summary.

This requires that memtool exposes the right read endpoints. Coordinate with the memtool roadmap.

Output: a learner who misses `pane` in translation sees "you marked yourself 5 on this word two weeks ago."

## Milestone 6: `guess` and `sense` intents

Once the `literal` intent is solid.

- Marker prompt updated to handle all three intents.
- UI surfaces the score-or-no-score distinction for `guess`.
- Stats can filter by intent.

Output: the learner can practise in all three modes; the system grades and reports accordingly.

## Milestone 7: Multi-learner, deployment

The shape is right; widen access.

- Deployment to a public host (Fly.io most likely).
- Production database (Postgres, probably; SQLite on a Fly volume if scale stays small).
- First non-author learner invited.
- Per-user delete endpoint (privacy).
- Single sign-on with memtool if both apps share a parent domain.

Output: an invited group can use the site in earnest.

## Beyond v1

- Multi-language: add French / German / Spanish / etc. Each gets its own normalisation extension and bucket registry.
- Extended writing: paragraph-level attempts, sentence-by-sentence marking, paragraph-level aggregation.
- Speech: audio input and synthesised output.
- Per-bucket spaced repetition: bias the next-question picker toward weak buckets, with rate/floor parameters like memtool's.
- Adaptive difficulty: pick items whose required_buckets match the learner's current weaknesses.

## Sequencing notes

The order above is the sequence that maximises author usefulness. After Milestone 3, the system is independently valuable to the author. Each later milestone is additive; none is a refactor of an earlier one.

The risky milestone is 3 (the AI marker). Two specific risks:

1. The structured-output validation rate isn't high enough. The marker would need a heavier validation+retry loop, or a fall-back to letting the user re-submit.
2. The AI's bucket-attribution is noisy, with the same conceptual miss being put in different buckets across attempts. The mitigation is the hybrid bucket rule (DESIGN.md §4): only the parent group's namespace is open for invention.

Both can be measured during Milestone 3 and fed back into the marker's prompt.

---

## Verb-form content build (added 2026-06-08)

The milestones above are the infrastructure roadmap (housing, marker, stats, AI), largely built. This section is the CONTENT roadmap for the verb system: which tenses and moods, in what order.

**Strategy.** Formation first (the forms), then usage (when to use them), tense-choice last. Each tense is one tree with a formation branch (deepened and authored now) plus usage and discrimination stubs (deepened later). Compound tenses ride inside their parent-tense tree (futuro anteriore in future, condizionale passato in conditional, the subjunctive compounds in congiuntivo); the standalone pluperfect (trapassato prossimo), the subjunctive, and the past historic are their own trees. CEFR levels per `CEFR_GROUNDING.md`. Cue and breadcrumb discipline per AUTHOR_BRIEF criteria 13-15 and the Rev 9 cue-economy note.

### Formation phase: all trees built; launch + authoring ongoing

- present_indicative: live (authored, in manifest)
- passato_prossimo: live (pre-existing)
- imperfect: live (pre-existing)
- future: live (authored, in manifest)
- condizionale: live (authored, in manifest)
- gerundio: live (authored, in manifest)
- congiuntivo (subjunctive, three waves: presente, imperfetto, compounds): LAUNCHED 2026-06-09, batch authoring in progress (not yet returned / wired to manifest)
- passato_remoto (past historic): LAUNCHED 2026-06-09, batch authoring in progress (not yet returned / wired to manifest)
- trapassato_prossimo (pluperfect): tree + dispatch ready, NOT yet launched
- imperativo (imperative mood): tree + dispatch ready, NOT yet launched

So two formation dispatches remain to launch (trapassato, imperativo); congiuntivo and passato_remoto are launched and authoring; the six earlier trees are live in the manifest. When the congiuntivo / passato_remoto batches return they get reviewed and wired (as future / condizionale / gerundio were).

Non-finite / edge forms accounted for, not separate formation trees: the past participle lives in the passato_prossimo tree; the present participle (parlante) is rare and adjectival; the infinitive's present is the citation form (no formation to test) and its past (avere parlato) is a minor compound, so the infinitive is a usage-phase topic (its constructions: prepositions, modals, causative fare, perception verbs) rather than a formation gap.

### Usage + tense-choice phase: NEXT

After the remaining formation batches land and are reviewed:

- Usage dispatches per tense (the `.usage` stubs): habitual / progressive / future-of-probability / polite conditional / subjunctive triggers and sequence-of-tenses / etc.
- TenseChoice work: deepen the `.discrimination` stubs across all trees (present vs imperfect, future vs present, indicative vs subjunctive, pluperfect vs simple past, passato remoto vs passato prossimo), carrying the `candidate_tenses` tick (see OPEN_QUESTIONS).
- The gerund's adverbial usage and the stare + gerundio progressive across tenses.

### New non-verb grammar topics (added 2026-06-10)

- `relative_pronoun`: tree (16 nodes) + dispatch ready to launch. che / cui / il quale / chi / neuter / dove + discrimination.
- `preposition`: tree (17 nodes) + dispatch ready to launch. Simple, articulated, a usage-weighted branch (place, time, motion, means, verb-governed, di, da) + discrimination.
- Present usage: `verb_form.present_indicative.usage` deepened (4 leaves) + dispatch ready. Light branch; the present's choice-based uses live in tense_choice. The meatier usage dispatches (future-of-probability, polite/reported conditional, subjunctive triggers) are the next usage prep.

### Noun-phrase topics (added 2026-07-13, from the OnlineItalianClub coverage cross-reference)

Coverage is verb-deep but the A1 noun phrase was missing. Scaffolded as trees + dispatches, ready to launch:

- `article` (definite / indefinite forms + usage/omission)
- `noun` (gender + plural, with the spelling shifts and irregulars)
- `possessive` (possessive + article, family exception, pronouns)
- `demonstrative` (questo / quello, quello inflecting like the article)

Next tranche from the same cross-reference, not yet scaffolded: c'e / ci sono (esserci), the piacere construction, comparatives and superlatives, adverbs, the passive, the si-constructions, reported speech, and idiomatic pronominal verbs. Full analysis in `REFERENCE_coverage_vs_onlineitalianclub.md`.

### Cross-cutting: misconception aggregation

Independent of the tense build. Registry seeded (`data/misconceptions.json`, DESIGN §15). A dedicated cross-cutting MisconceptionAnalyst chat (proposes suggestions, architect ratifies) bootstraps from the `common_miss` attributes and the `must_not_include` forms, and later mines learner miss-events for cross-kind patterns. Registry RATIFIED 2026-06-09 (17 families / 67 specifics, from the full common_miss harvest). Phase-3 per-topic tagging of `must_not_include` is next (analyst supplies tag-lists, architect coordinates authors). The aggregation drill-down view is a later housing build.
