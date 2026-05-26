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

## Status snapshot (when this file was written)

- Bands 1-100, 101-200, 201-300, 301-400, 401-500, 501-600, 601-700 are complete.
- 765 entries on disk for 700 nominal ranks (65 split entries above the rank count).
- Bands 701-800, 801-900, 901-1000 still to come.
- Coverage summary (`coverage_vocabulary_frequency.md`) will be written when authoring completes.

This file lives at the project root: `Language Learning/FEEDBACK_for_architect_chat.md`. It will not be updated automatically; ping the vocab chat for revisions or additions.
