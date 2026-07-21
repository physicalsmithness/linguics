# Feedback from the Vocab Authoring Chat → Architecture / Dispatch Chat

Compiled at the rank-700 mark (May 2026). Authoring is 70% complete. The items below came up against the dispatch as written and need ratification or revision before the entry schema can be considered stable. Each item ends with a concrete **Architecture ask**.

---

## 1. Splitting rule for same-spelling lemmas

The dispatch said to split distinct lemmas (`colpo` noun vs `colpire` verb). It did not say what to do with **same-spelling** lemmas that have multiple POS, or that have one POS but two distinct meanings.

Initial authoring collapsed these into single entries with `notes: "also a pronoun"`. Smith said no: split every such case.

The rule we converged on:
- Same spelling, different POS → separate entries
- Same spelling, same POS, distinct meanings that are different things to learn → separate entries (e.g. `fine` f "end" vs `fine` m "aim")
- The rank field is **shared** between split entries (rank is no longer a unique key)
- The de-facto unique key is (lemma, pos) plus gender for gender-split nouns

This affects, at minimum: all demonstratives (`questo`, `quello`), all possessives (`mio`, `tuo`, `suo`, `nostro`), articles vs clitic pronouns (`lo`), prep/adv pairs (`dopo`, `prima`, `dietro`), adj/adv pairs (`solo`, `forte`, `duro`, `chiaro`, `vicino`, `lontano`, `giusto`, `piano`), adj/noun pairs (`caldo`, `freddo`, `italiano`, `inglese`, `francese`, `giovane`, every colour), gender-meaning splits (`fine`).

**Architecture ask:** ratify the rule, update the dispatch spec, and decide whether to keep "shared rank for split entries" or introduce a sub-id (e.g. `rank: 30, variant: "det"` vs `variant: "pron"`) for unique-key cleanliness.

---

## 2. `themes` field is missing from the schema

The dispatch had no provision for thematic categorisation. Smith asked mid-authoring for every entry to carry a `themes` array so the frontend can offer a second viewing axis ("spinning the cube" — same data, viewed by frequency or by theme).

Entries from rank 501 onwards have `themes: [...]`. Ranks 1-500 still need retroactive tagging.

The working taxonomy mixes semantic and grammatical-functional tags. Semantic: `colours`, `days_of_week`, `months`, `seasons`, `time_general`, `parts_of_day`, `body`, `food_drink`, `home`, `city_places`, `transport`, `nature`, `weather`, `plants`, `animals`, `people_family`, `people_general`, `people_roles`, `emotions`, `mental_state`, `sensations_physical`, `school_education`, `work_business`, `shopping_money`, `politics_society`, `law_justice`, `arts_entertainment`, `sports_leisure`, `health_medicine`, `science_technology`, `noun_abstract`, `communication`, `plants`. Functional: `function_word`, `pronoun_*` (personal / demonstrative / possessive / indefinite / interrogative / relative), `determiner_*` (demonstrative / possessive / indefinite), `quantifier`, `conjunction`, `preposition`, `interjection`, `numbers_cardinal`, `numbers_ordinal`, `modal_verb`, `auxiliary_verb`, `verb_*` (movement / communication / perception / cognition / emotion / state / action_general / routine / change / creation / destruction / existence / speech_act / inverted_subject), `adjective_*` (size / quality / evaluation / nationality / temperature / distance), `adverb_*` (time / place / manner / quantity).

**Architecture ask:** (a) add `themes` as a required field in the entry schema, (b) ratify or refine the taxonomy, (c) decide whether functional themes (`verb_movement`, `adjective_quality`) belong in the same field as semantic themes (`colours`, `food_drink`), or whether to split them into two fields.

---

## 3. Rank is provisional during authoring

Smith confirmed that strict frequency ordering within ranks is not load-bearing during production. Thematic batching is preferred for authoring efficiency. The architecture should expect:

- Words within a band may be clustered there because they form a coherent thematic group (all days of the week together, all colours together), not because each one's true frequency is in that band
- A re-rank pass at the end (mechanical, scriptable) should redistribute clusters into their genuine frequency positions
- The `themes` array is the stable cross-cutting axis; `rank` is intentionally re-rankable

**Architecture ask:** sanction the re-rank pass as a pipeline step, and decide whether `rank` should be stored as `provisional_rank` until that pass runs.

---

## 4. CEFR importance label extensions

The dispatch's example used `core / preview / review / fluency`. Authoring needed two more: `stretch` (a band the level can touch but isn't expected to master) and `out_of_scope` (genuinely beyond the level — e.g. A1's relationship to band 901-1000). Smith approved the extension.

**Architecture ask:** add `stretch` and `out_of_scope` to the canonical label vocabulary, or push back.

---

## 5. `auxiliary: "either"` semantics

The dispatch listed `essere / avere / either`. Used `either` for two genuinely different things:

- **Modals** (`potere`, `dovere`, `volere`): take the auxiliary of the following infinitive in compounds
- **Transitivity-dependent verbs** (`continuare`, `cambiare`, `migliorare`, `peggiorare`, `aumentare`, `diminuire`, `vivere`, `crescere`, `correre`, `saltare`, `bollire`, `cuocere`, `girare`, `servire`): aux varies by transitive vs intransitive use

**Architecture ask:** confirm `either` covers both, or split into finer-grained values (e.g. `modal_aux_follows_infinitive`, `aux_varies_by_transitivity`).

---

## 6. `adj_class: "invariable"` introduced

The dispatch listed `o` and `e`. Some adjectives don't inflect (`blu`, `rosa`, `marrone`, `viola`, `beige`). Added `invariable` as a third value.

**Architecture ask:** ratify.

---

## 7. Greek-origin -ma masculine nouns

Nouns ending in -a but masculine, with plural in -i: `problema`, `sistema`, `programma`, `dramma`, `tema`, `clima`. Currently noted in `notes` only.

**Architecture ask:** decide whether to add a `noun_class` field that captures this and other recurring irregular noun families: -ista common-gender (`artista`, `dentista`), gender-shift plurals (`braccio` m → `braccia` f, `uovo` m → `uova` f, `dito` m → `dita` f), invariable plurals from accented final vowels (`città`, `caffè`, `tè`, `università`), invariable plurals from loanwords (`film`, `bar`, `menu`, `chef`).

---

## 8. Cross-band split entries (rank-mismatched homographs)

When the primary entry was authored early and a related secondary entry surfaces in a later thematic batch, they currently sit at different ranks. Example: `dolce` adj at rank 390 (authored during the adj-cluster) and `dolce` noun "dessert" at rank 650 (authored during the food cluster). Per rule 1, same lemma + different POS → same rank. The re-rank pass should consolidate.

**Architecture ask:** specify the consolidation logic. Suggested: same lemma + same POS family → collapse to one rank; same lemma + truly distinct meaning that happens to share spelling (homograph) → keep separate ranks.

---

## 9. Outstanding retroactive work

Known debt that hasn't been done:

- **Themes tagging for ranks 1-500** (post-501 entries are tagged; pre-501 are not)
- **Additional splits in ranks 1-200** that weren't caught in the first retroactive pass. Specifically: `vecchio` rank 200 (adj + noun "the old man"), `buono` rank 196 (adj + noun), `primo` rank 193 / `ultimo` 194 / `unico` 195 (each adj + noun for "the first one / the last one / the only one"), `bianco` and `nero` adjectives (already split in 501-600 as colours, but should the original adjective entries be at lower ranks too?)

**Architecture ask:** decide priority — should this retroactive work happen before, after, or in parallel with ranks 701-1000?

---

## 10. `null` vs sparse for non-applicable fields

The dispatch's example showed `auxiliary: null` and `conjugation_class: null` for nouns. Authoring followed this — every entry has all standard fields present, `null` where not applicable. Uniform but verbose. Same applies to `gender` / `plural` on verbs, `adj_class` on non-adjectives, `auxiliary` on adjectives, etc.

**Architecture ask:** confirm uniform-with-nulls is desired (it does make downstream code simpler), or switch to a sparse representation.

---

## 11. `translation_en` schema: separate answer-key from gloss

**Originally written:** Smith reported (with screenshots) that the marker was rejecting correct answers like "soup" for `minestra` and "cousin" for `cugino`, because the canonical `translation_en` values were `"soup (light, broth-based)"` and `"cousin (male)"`. The marker did exact-string match against the whole thing, parentheticals and all.

**Diagnosis:** the `translation_en` field was doing two jobs at once — (a) the canonical accepted-answer key for the marker, and (b) a human-readable disambiguating gloss for the reader. The mixed shape silently broke marking on ~189 entries (about 1 in 6).

**Fix applied to the data (rank-1 to rank-1060 inclusive):** all parenthetical content has been stripped from `translation_en`. A new optional `gloss_en` string field has been added that holds the disambiguation. After this pass:
- `translation_en` is a clean comma-separated list of accepted answer strings (still a string, not yet an array).
- `gloss_en` is the human-readable disambiguator, never matched.

Example before / after:
```json
// Before
"translation_en": "soup (light, broth-based)",

// After
"translation_en": "soup",
"gloss_en": "light, broth-based; thinner than zuppa; minestrone is a thicker vegetable variant",
```

**Marker still needs to accept comma-split alternatives.** Many `translation_en` values are still comma-separated strings like `"house, home"`, `"to take, to catch, to get"`, `"his, her, its, your"`. For the marker to accept any one of `house` or `home` (etc.), it MUST split `translation_en` on commas (and semicolons where they remain), trim, lowercase, and accept any element as a match.

**Architecture ask:** (a) Add `gloss_en` to the canonical schema as an optional top-level string field. (b) Decide whether `translation_en` should be promoted to a proper array of strings (cleaner shape, but every entry needs touching) or remain a string that the marker splits on commas / semicolons (smaller change, but the data shape is implicit). (c) Confirm the marker behaviour: case-insensitive, whitespace-trimmed, comma-and-semicolon-split exact-match-on-any-element.

## 12. There are now three vocabulary data files, not one

The vocabulary data layer has expanded since this feedback file was first written. There are now (or about to be) three artefacts living side by side in `data/`, and the architect needs to decide how they relate, how they're presented to the learner, and which one is authoritative for what.

**File 1: `data/vocabulary_it_frequency.json`** — the curated lemma file.

About 1160 entries. Lemma-based, hand-authored, with full metadata: POS, gender, plural, auxiliary, conjugation_class, adj_class, themes (rank 501+ only so far), gloss_en, notes. This is the "deep" file. It's what the marker uses for AI-graded translation with named buckets (`vocabulary.it.essere.translation`, `vocabulary.it.casa.gender` etc.). Provisional ranks include gap-fill entries at 1001-1060 awaiting the re-rank pass.

**File 2: `data/vocabulary_it_frequency_forms.csv`** — a merged form-level frequency list.

10,000 rows. Produced by Claude Code by averaging three external sources (hermitdave, orgtre, wordfreq). Form-based (so `sono`, `è`, `ho`, `hai`, `abbiamo` all appear as separate rows; `casa` and `case` are separate rows). No POS, no gender, no themes. Useful for: "which surface strings does a learner most often encounter in actual Italian text?" Genuinely the best representation of that question available.

**File 3: `data/vocabulary_it_frequency_lemmas.csv`** — a merged lemma-level frequency list. Coming.

Target 8,000 rows. Will be produced by Code from lemma-native sources (ItWaC, LIF, De Mauro). Lemma-based, so `casa` covers casa+case in one row, `parlare` covers parla+parlato+parlando in one row. Schema includes POS, gender (for nouns), auxiliary (for verbs), adj_class (for adjectives), and preserves homograph splits where the sources allow.

### How they're meant to relate

- The **curated JSON** is the rich edit layer. It's where authoring happens, where themes and glosses live, where the marker reads bucket definitions from.
- The **lemma CSV** is the frequency spine. It's authoritative for the rank ordering of the curated JSON (the re-rank pass will join curated lemmas to the lemma CSV and reassign ranks).
- The **form CSV** is the surface-text view. It's authoritative for "what learners actually meet in subtitles / corpora," and informs which inflected forms are worth practising explicitly.

### Architecture asks

A non-trivial cluster of design choices the architect should think through with the user:

1. **Which file does the marker / housing actually load at runtime?** Probably the curated JSON for the bucketed marking, plus the lemma CSV for frequency thresholds. The form CSV is more of a reference / authoring tool. Confirm.

2. **How are the three layers exposed to the learner in the UI?** The user has talked about "spinning the cube" — viewing the same data by frequency, by theme, by POS. Now there's a fourth axis: by lemma vs by form. A learner might want to see all surface forms of `essere` ranked by frequency, or all lemmas in the top 500 grouped by theme. Decide which slices are first-class views and which are derived.

3. **Cross-reference: materialised or computed at runtime?** A join from curated entry → lemma-CSV row → form-CSV rows of that lemma can either be precomputed and stored as a fourth file (`crosswalk.json`), or computed by the renderer on the fly. Materialised is simpler for the marker; computed is more flexible.

4. **What's the source of truth for re-ranking the curated file?** Proposal: the lemma CSV. When it lands, run a mechanical pass that joins each curated lemma to its lemma-CSV row and rewrites the `rank` field. The provisional ranks (1001-1060) get absorbed naturally. Bands (the `band` field) get reassigned too. This is a one-time pipeline step.

5. **Themes work was started in the curated file.** Ranks 501-1000 already have `themes` arrays; 1-500 are still untagged. After the re-rank pass, the bands shift, but the themes attach to the lemma, not the rank, so themes don't need to be redone — just the bands they're shown under change. Confirm this matches the architect's view.

6. **The form CSV without POS / gender.** Adding gender to form-level rows is a 30%-coverage with noisy-flag job (`porta` is door OR 3sg-portare, `stato` is state OR past-participle). Decision was made NOT to do this on the form file. If the architect wants form-level gender for any reason (e.g. for noun-form practice), reopen.

7. **What lives in the curated JSON that *should* be denormalised to the form/lemma CSVs?** For example, learners practising `sono` (form-level) might want to see "this is a form of `essere`, which is rank 5 in the lemma list and themed as auxiliary_verb." The architect should decide what level of denormalisation makes sense vs. what is computed at render time.

8. **The vocab-authoring chat (the source of this feedback) is paused on inline themes-tagging** until the re-rank pass runs. Doing themes by hand on positions that will move is wasted work. After the re-rank pass, themes-tagging for ranks 1-500 (post-rerank) becomes worth resuming.

## 13. Marker rejects valid synonyms (the `il`/`lo` problem)

**Originally written** in response to a real learner failure: the vocab practice flow asked *"What's the Italian for 'the'?"*, the learner typed `il`, and the marker said *"No, it's lo."*

This is wrong on multiple counts: `il` is the most common form of "the" in Italian (m sg, default before consonants); `lo` is the narrow special form before s+cons / z / gn / ps / x / y / i+vowel. Telling a learner `il` isn't "the" actively miseducates.

The data shape exposes this because the curated JSON has multiple entries that all have `translation_en: "the"` — `il`, `la`, `lo` (article), `un`, `una`, `gli`, `i`, `le`, etc. The marker as currently behaved picks one entry per question and rejects all the others' lemmas.

**Two complementary fixes:**

**Data-side (Code can do now, partly already in the patch request):** add disambiguating context inside `translation_en` for function-word entries: `il` → `"the (m sg)"`; `lo` (article) → `"the (m sg, before s+cons / z / gn / ps / x / y / i+vowel)"`; `un` → `"a, an (m sg)"`; etc. This lets the marker render a more specific question, so only `il` matches `the (m sg)`.

**Marker-side (the deeper fix, architect's call):** when picking a curated entry to ask about EN→IT, the marker should consider all entries with `translation_en` overlapping the chosen one, and treat any of their lemmas as correct answers. Conceptually: the marker generates a candidate-answer set from all curated entries with matching translation, not just the canonical entry.

**Architecture asks:**

1. Confirm the marker's intended behaviour for EN→IT direction: should it accept any curated lemma whose `translation_en` matches the gloss in the question?
2. If yes: what's the matching rule — exact match on the bare translation_en, or substring match (so `il` matching against `"the (m sg)"` would work)?
3. Decide whether to standardise the data-side gloss-disambiguation (the architect spec could require it for any entry whose translation_en collides with another entry's).

This affects every function-word zone: articles, basic prepositions, basic pronouns. Outside function words the problem is much rarer (most content words have unambiguous-enough translations).

### Update 2026-05-26: a second related failure (`ma` / `però`), and the user's proposal

**The scenario.** The marker rendered the prompt *"but, however"* (from `però`'s `translation_en: "but, however"` joined on commas) and asked for the Italian. The learner typed `ma`. The marker said wrong, expected `però`. The learner's reaction was that this felt unjust because the prompt visibly contains "but" and `ma` is literally "but"; but on reflection they recognised that `però` carries adversative weight beyond plain `ma`, and "but, however" together does point at `però` specifically. So the call wasn't baseless, but the all-or-nothing rejection felt off.

This crystallised two distinct sub-cases the marker should handle:

**Sub-case A: fully-equivalent lemmas (a tracking asymmetry the vocab chat initially missed).**

For pools like `solo` / `soltanto` / `solamente` (the adverb "only"), `qui` / `qua`, `lì` / `là`, `eccetera` / `ecc.`, all members of the pool are interchangeable on the meaning axis. But the marker tracks mastery per item, and so the rule isn't *"either lemma counts as right"*, it's:

- If the marker prompts for `soltanto` (EN to IT, "only") and the learner produces `solo`, the `solo` item fires full credit, and the `soltanto` item is left alone (neither fire nor miss).
- For `soltanto` to advance, the learner must specifically produce `soltanto`.
- Implication: a learner who habitually defaults to `solo` will see `soltanto` and `solamente` stagnate. The user pointed out they sometimes deliberately produce the alternative form to advance its item, which is the learner self-regulating around this asymmetry.
- UI affordance worth considering: when an equivalent-but-non-prompted lemma fires, the learner should be able to see *"`soltanto` still hasn't been practised; try producing it specifically"*.

The data-side support for this is an `equivalence_class` field (or similar) on each entry in the pool. Vocab chat will propose an initial list of class candidates after the architect rules on whether the field should exist.

**Sub-case B: partial-equivalents like `ma` / `però`, where translations overlap but the lemmas aren't interchangeable.**

This is the harder case. `ma` and `però` are NOT equivalence-class material — `però` is contrastively stronger and has syntactic positions `ma` doesn't share. So the all-or-nothing-on-the-prompted-item rule is wrong, but so is treating them as interchangeable.

The vocab chat does not understand the marker's running-average / mastery-state mechanics well enough to design the partial-credit weighting itself. Passing the user's words intact rather than interpreting. The user said (paraphrasing very lightly for grammar; words in quotes are theirs):

> "I tell you what: what about it fires on `ma` and gives the unattempted percentage. Whatever the unattempted percentage is, say the unattempted percentage is 20%. Fires that percentage. Not the same as not attempting, because average of last three will change which means the average will climb more slowly, given that it's the last three, so if you get the next one right, it's slightly reduced, and it needs an explanation."

Context: the marker prompted for `però`, the learner gave `ma`. The proposal is that the `ma` item (not the `però` item) is the one that updates, and the fire credit is set to `ma`'s current "unattempted percentage" rather than to a flat full or flat 50%. The `però` item, like in sub-case A, is left alone. The learner needs an explanation surface so the partial doesn't read as arbitrary.

The architect will know what "unattempted percentage" maps to in the running-state model (item-level slack? bucket-level? the complement of the last-three-average? something else?). Vocab chat is deliberately not guessing.

**What the architect is being asked to decide**

1. Should the marker have an explicit `equivalence_class` concept, with the asymmetric tracking rule above (fire on what the learner produced, leave the prompted item alone)?
2. For partial-equivalents (overlapping `translation_en` but not in an equivalence class), should the marker fire on the learner-produced lemma at its current unattempted percentage, per the user's proposal? And what exactly is that percentage in the engine's state representation?
3. Does the marker need an explanation surface for the partial-credit case (and probably the asymmetric-equivalent case too), and where does the explanation text come from — data, marker rule, or generated?
4. Does the data shape need to migrate `translation_en` from comma-string to proper array so the marker can do set operations cleanly? (Architect previously sanctioned arrays "going forward only"; the back-migration becomes necessary if any of the above lands.)

### Update 2026-05-27 (second update): the IT→EN direction has the same problem

A second real learner failure surfaced this. The marker rendered *"What does fortunato mean?"* (IT→EN, asking about the noun entry at rank 2964). The learner typed `lucky`. Marker said wrong because that entry's translation_en (from Wiktionary's bulk pull) was `'a male given name, a surname originating as a patronymic'`.

The user pointed out that the framing of this fix is wrong if it lives only at the data layer. The deeper issue is the marker's behaviour: when it asks "what does X mean", it picks ONE entry and only accepts that entry's translation_en. The learner has no way to know which entry was picked, and naturally gives the most familiar sense.

**The rule the marker should follow (symmetric to the il/lo case)**

For IT→EN direction:

> When the marker asks "what does <lemma> mean", it should accept any translation_en value drawn from ANY entry whose `lemma` matches, regardless of which entry was selected to drive the question rendering. The question rendering can show the lemma, optionally a POS hint or gloss disambiguator, but the acceptance set is the UNION of all matching entries' translation_en values.

This is symmetric to the EN→IT rule the architect was asked to consider in the original item 13 (accept any lemma whose translation_en matches the prompt's gloss). Together they make the marker robust to lemmas with multi-entry / multi-POS splits.

**Per-entry mastery tracking**

The asymmetric-equivalence-class rule the user proposed earlier (fire on the lemma the learner produced, leave the prompted item untouched) applies here too. If the marker is asking about the `fortunato (noun)` entry and the learner answers `lucky`, that answer matches `fortunato (adjective)`'s translation. The fire credit should go to the adjective entry's mastery state, not the noun's. The noun entry doesn't advance; the learner can practise the noun specifically if they want.

**Implication for data shape**

A defensive cleanup of proper-noun pollution helps (we just did one), but the marker rule above is the proper fix. With the rule in place, even a noisy multi-entry lemma works correctly because all valid senses across all entries are accepted. The data side becomes a quality issue rather than a correctness issue.

**Combined architecture-ask now reads:**

1. The marker should treat translation acceptance as a UNION across all entries whose lemma matches (IT→EN) OR whose translation_en matches the prompt's gloss (EN→IT).
2. Per-entry mastery tracking is asymmetric: the entry that fires is the one the learner's answer actually matches, not necessarily the one the question was rendered from.
3. Partial credit (the `ma`/`però` case) applies when the learner's answer matches some but not all of a multi-gloss entry's translation_en; weighted at the entry's current "unattempted percentage" per the user's verbatim proposal above.
4. Equivalence-class concept (the `solo`/`soltanto`/`solamente` case) is the explicit-data version of the union acceptance rule, for lemmas the architect wants to mark as truly interchangeable.

All four belong together; they're aspects of the same underlying "marker should be tolerant of polysemy and synonymy" decision.

## Status snapshot (when this file was written)

- Bands 1-100, 101-200, 201-300, 301-400, 401-500, 501-600, 601-700 are complete.
- 765 entries on disk for 700 nominal ranks (65 split entries above the rank count).
- Bands 701-800, 801-900, 901-1000 still to come.
- Coverage summary (`coverage_vocabulary_frequency.md`) will be written when authoring completes.

This file lives at the project root: `Language Learning/FEEDBACK_for_architect_chat.md`. It will not be updated automatically; ping the vocab chat for revisions or additions.
