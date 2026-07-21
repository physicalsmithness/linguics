# Coverage: Italian top-1000 frequency vocabulary

Authored across multiple sessions, completed May 2026 at the rank-1000 mark.

## Files produced

- `data/buckets/vocabulary_frequency.json` — 10 frequency band buckets under `vocabulary.it`, `freq_1_100` through `freq_901_1000`.
- `data/vocabulary_it_frequency.json` — the vocabulary entries themselves.
- `FEEDBACK_for_architect_chat.md` — schema and process feedback for the architect / dispatch chat, with the asks each item needs ratified.

## Headline numbers

- **1,081 entries** for 1,000 nominal ranks. The 81-entry overage is split entries (same-spelling lemma with different POS or distinct meaning).
- **10 bands** of 100 ranks each.
- Counted by grep against the file, not from memory of batches.

## Distribution by POS

| POS | Count |
|---|---|
| noun | 548 |
| verb | 217 |
| adjective | 150 |
| adverb | 72 |
| pronoun | 27 |
| determiner | 19 |
| preposition | 18 |
| conjunction | 12 |
| numeral | 11 |
| article | 5 |
| interjection | 2 |
| **Total** | **1,081** |

The noun count is high because (a) noun-clusters by theme have been substantial (food, body, clothing, weather, animals, household), and (b) every adj/noun split (the colours, `interno`, `esterno`, `locale`, `ufficiale`, `personale`, `generale`, `particolare`, `caldo`, `freddo`, `straniero`, `quotidiano`, `presente`, `futuro`, `passato`, `comune`, `mezzo`, `vicino`) contributes an additional noun entry.

## Bands and their character

| Band | Ranks | Entries | Notes |
|---|---|---|---|
| freq_1_100 | 1-100 | 128 | Top 100 + 28 retroactive splits (the demonstratives, possessives, etc.) |
| freq_101_200 | 101-200 | 100 | High-frequency irregulars + family lexis + everyday nouns |
| freq_201_300 | 201-300 | 109 | A2 verbs, body and emotions, adj/adv pairs |
| freq_301_400 | 301-400 | 108 | Reflexive routines, household items, adj/adv splits |
| freq_401_500 | 401-500 | 108 | -urre verbs, -gliere verbs, abstract nouns, -ale adjectives |
| freq_501_600 | 501-600 | 111 | Colours (split adj/noun), days, months, seasons, cardinal numbers 3-10 |
| freq_601_700 | 601-700 | 101 | Food and drink as a thematic cluster |
| freq_701_800 | 701-800 | 102 | Body parts (with irregular gender-shift plurals) + clothing |
| freq_801_900 | 801-900 | 102 | Home + furniture + weather + nature + animals |
| freq_901_1000 | 901-1000 | 112 | Transport, abstract B2 lexis, time/sequence, place adv/prep splits |

## Split entries — the rule applied

The dispatch's "no duplicates" instruction was originally read as "no entries for the same spelling". Authoring with the user clarified the actual rule: same-spelling lemmas with different POS or distinct meanings get separate entries at the same rank. This applied to:

- Demonstrative determiners vs pronouns: `questo`, `quello`
- Possessive determiners vs pronouns: `mio`, `tuo`, `suo`, `nostro`
- Article vs clitic pronoun: `lo`
- Conjunction vs pronoun: `che`
- Adverb vs conjunction: `come`, `quando`, `perché`
- Adverb vs preposition: `dopo`
- Adverb vs preposition pairs (rank 901-1000 batch): `dentro`, `fuori`, `sopra`, `sotto`, `davanti`, `dietro`
- Adverb vs adjective: `solo`, `forte`, `duro`, `chiaro`, `vicino`, `lontano`, `giusto`, `piano`
- Adverb vs noun: `bene`, `male`, `via`, `ora`
- Adverb vs determiner: `molto`, `tanto`, `troppo`, `poco`
- Noun vs pronoun: `cosa`
- Determiner vs pronoun: `tutto`, `altro`, `nessuno`, `stesso`
- Determiner vs adverb: `stesso` (the "lo stesso" use)
- Adjective vs noun pairs: every colour (`rosso`, `blu`, `verde`, `giallo`, `nero`, `bianco`, `azzurro`, `grigio`, `marrone`, `rosa` — plus the flower-rose sense for `rosa`), the temperature pair (`caldo`, `freddo`), the nationality and language pair (`italiano`, `inglese`, `francese`), `giovane`, `interno`, `esterno`, `locale`, `ufficiale`, `personale`, `generale`, `particolare`, `dolce`, `grasso`, `straniero`, `quotidiano`, `presente`, `futuro`, `passato`, `coperto`, `amaro`
- Adjective vs interjection: `pronto`
- Adverb vs interjection: `magari`
- Adverb vs noun: `insieme`
- Noun split (different sense at same POS): `libreria` (furniture vs bookshop)
- Gender-meaning split (same POS, different gender = different sense): `fine` (f end, m aim), `fronte` (f forehead, m military front)
- Vicino was three-way: adj, adverb, noun "neighbour"

The rank field is the same across split entries. The de-facto unique key is (lemma, pos, gender). Architect-chat is asked to ratify or revise (see FEEDBACK file).

## Themes

Every entry from rank 501 onwards has a `themes` array. Ranks 1-500 do not yet have themes — that is outstanding work (task #12 in the TodoList).

### Working themes taxonomy

Mixed semantic + grammatical-functional tags, all snake_case. A single entry typically carries 1-3 themes.

**Semantic (concrete domains):**
`people_family`, `people_general`, `people_roles`, `body`, `food_drink`, `home`, `city_places`, `transport`, `nature`, `weather`, `plants`, `animals`, `clothing`.

**Semantic (abstract domains):**
`emotions`, `mental_state`, `sensations_physical`, `communication`, `school_education`, `work_business`, `shopping_money`, `politics_society`, `law_justice`, `arts_entertainment`, `sports_leisure`, `health_medicine`, `science_technology`, `noun_abstract`.

**Time:**
`time_general`, `parts_of_day`, `days_of_week`, `months`, `seasons`.

**Special semantic:**
`colours`, `numbers_cardinal`, `numbers_ordinal`.

**Grammatical (function words):**
`function_word`, `pronoun_personal`, `pronoun_demonstrative`, `pronoun_possessive`, `pronoun_indefinite`, `pronoun_interrogative`, `pronoun_relative`, `determiner_demonstrative`, `determiner_possessive`, `determiner_indefinite`, `quantifier`, `conjunction`, `preposition`, `interjection`, `modal_verb`, `auxiliary_verb`.

**Verb subtypes:**
`verb_movement`, `verb_communication`, `verb_perception`, `verb_cognition`, `verb_emotion`, `verb_state`, `verb_action_general`, `verb_routine`, `verb_change`, `verb_creation`, `verb_destruction`, `verb_existence`, `verb_possession`, `verb_speech_act`, `verb_weather`, `verb_inverted_subject`.

**Adjective subtypes:**
`adjective_size`, `adjective_quality`, `adjective_evaluation`, `adjective_nationality`, `adjective_temperature`, `adjective_distance`, `adjective_age`.

**Adverb subtypes:**
`adverb_time`, `adverb_place`, `adverb_manner`, `adverb_quantity`, `adverb_affirmation`, `adverb_negation`.

The architect chat is asked to ratify the taxonomy or replace it. See FEEDBACK file item 2.

## Frequency-rank caveat

Smith explicitly chose efficient thematic batching over strict frequency-rank ordering during production. The consequence is that the band-to-rank mapping is approximately rather than rigorously frequency-driven:

- Bands 1-200 follow frequency reasonably tightly.
- Bands 201-500 are still recognisably frequency-shaped but with editorial latitude.
- Bands 501-1000 are largely **thematic clusters** placed for production convenience.

Concrete examples of items that sit outside their true frequency band:
- Cardinal numbers `tre`, `quattro`, `cinque` (ranks 579-581) are probably in the genuine top 300-500 of Italian frequency.
- Colours `rosso`, `bianco`, `nero` (ranks 546, 551, 550) are probably top 500-700.
- Some months and lesser-used days (e.g. `mercoledì`, `febbraio`, `aprile`, `settembre`) are probably true rank 800-1400 rather than 558-573.
- Some colour items in band 501-600 (`azzurro`, `marrone`, `rosa`, `giallo`) are probably true rank 800-1500.
- `dolce` noun at rank 650 (food sense) duplicates `dolce` adjective at rank 390.

A **re-rank pass** at the end of the project should redistribute thematic clusters into their genuine frequency positions, using the `themes` array as the stable cross-cutting index so that thematic browsing still finds the full cluster. See FEEDBACK file item 3.

## Decisions and editorial calls

A short list of authoring decisions worth flagging:

1. **CEFR labels extended.** Added `stretch` and `out_of_scope` beyond the dispatch's `core / preview / review / fluency` examples. The dispatch explicitly allowed "calibrate as you see fit"; the architect can ratify or push back.

2. **`auxiliary: "either"`** used for both modal verbs (`potere`, `dovere`, `volere`) and transitivity-dependent verbs (`continuare`, `cambiare`, `migliorare`, `aumentare`, `diminuire`, `vivere`, `crescere`, `correre`, `saltare`, `bollire`, `cuocere`, `girare`, `servire`, `cominciare`, `finire`). Architect-chat is asked to confirm `either` is correct for both kinds, or split it into two finer values.

3. **`adj_class: "invariable"`** introduced for adjectives that don't inflect (`blu`, `rosa`, `marrone`). The dispatch listed only `o` and `e`.

4. **Greek-origin -ma masculine nouns** (`problema`, `sistema`, `programma`, `dramma`, `clima`, `tema`) are flagged in `notes` but not in a structured `noun_class` field. Same for other recurring noun families: -ista common-gender, -tà invariable plural, gender-shift plurals (`braccio`/`braccia`, `uovo`/`uova`, `dito`/`dita`, `osso`/`ossa`, `ginocchio`/`ginocchia`, `ciglio`/`ciglia`, `sopracciglio`/`sopracciglia`, `labbro`/`labbra`, `orecchio`/`orecchie`, `lenzuolo`/`lenzuola`). The architect chat is asked to decide whether to add `noun_class`.

5. **Uniform-with-nulls schema** was followed: `auxiliary` and `conjugation_class` are present (with `null`) on every entry, even non-verbs; same for `gender` / `plural` on verbs and `adj_class` on non-adjectives. The architect-chat is asked to confirm vs switch to sparse fields.

6. **False-friend flags** were added where useful (`accettare` ≠ "to expect", `pretendere` ≠ "to pretend", `attualmente` ≠ "actually" → use `effettivamente`, `sopportare` ≠ "to support" → use `sostenere`, `attuale` ≠ "actual" → use `vero` / `reale`, `cantina` ≠ "canteen" → use `mensa`, `simpatico` ≠ "sympathetic" → use `comprensivo`, `parente` ≠ "parent" → use `genitore`, `latte` ≠ the coffee drink, `marmellata` covers both jam and marmalade).

7. **Cognates flagged** as the dispatch requested (`importante`, `interessante`, `naturale`, `sociale`, `culturale`, `internazionale`, `politico`, `economico`, etc.) — these are accepted as legitimate entries because they confirm to the learner that the cognate works.

## Outstanding work (handover)

- **Retroactive themes tagging for ranks 1-500** — entries pre-501 don't yet have a `themes` array (task #12 in the TodoList). The taxonomy is settled, so this is mechanical work.
- **Re-rank pass** — redistribute thematic clusters into their genuine frequency positions, using `themes` as the cross-cutting index.
- **Consolidation pass for split entries that drifted across bands** — `dolce` adj at 390 vs noun at 650, similar for any others.
- **A small set of additional retroactive splits** that weren't caught in the first 1-200 pass: `vecchio` (rank 200) for the adj/noun "the old man", `buono` (196) for adj/noun "a coupon / the good one", `primo` (193) / `ultimo` (194) / `unico` (195) for the noun "the first course / the last one / the only one", `bianco` and `nero` adjectives at lower ranks (already split as colours later in 501-600, but should the original adjective entries also gain noun splits?).
- **Vocabulary practice questions** — the dispatch noted that a second authoring chat would build "translate this word", "what's the gender" style questions drawing from this list. Not in scope for the vocab authoring chat; flagged for whoever picks it up.

## For the architect / dispatch chat

The companion file `FEEDBACK_for_architect_chat.md` (also at the project root) consolidates ten schema and process items that need ratification. The biggest three:

1. The splitting rule for same-spelling multi-POS lemmas needs to be in the canonical dispatch spec.
2. The `themes` field needs to be in the canonical schema, with the taxonomy ratified or replaced.
3. The `rank` field is provisional during authoring and a re-rank pass should be a pipeline step.

The architect can also expect items on `auxiliary: "either"` semantics, `adj_class: "invariable"`, Greek-origin noun classes, cross-band split consolidation logic, `null`-vs-sparse field convention, and the retroactive themes-tagging debt.

---

## Update — state after architect ratification and re-rank pass

Everything below was added after the original coverage was written. Outstanding-work items listed above have either been completed, made obsolete, or carried forward; this section is the source of truth for the **current** state.

### What changed at the data-layer

**Three vocabulary data files now live in `data/`:**

1. `data/vocabulary_it_frequency.json` — the curated lemma file (still the authoritative pedagogical layer). **1,146 entries** after re-rank, dedupe, and gap-fills.
2. `data/vocabulary_it_frequency_forms.csv` — 10,000 wordforms by frequency, merged from hermitdave/orgtre/wordfreq. Provided by Claude Code. Surface-form view of "what learners encounter in text."
3. `data/vocabulary_it_frequency_lemmas.csv` — 7,626 lemmas by frequency, merged from ItWaC / OpenSubs (lemmatised) / wordfreq (lemmatised), with NVdB as sanity-check on POS and gender. Provided by Claude Code (second iteration, after the first version's function-word penalty bug was fixed). Authoritative for the rank order of the curated file.
4. `data/vocab_themes.json` — themes taxonomy as a standalone registry (76 themes across 6 kinds: semantic_concrete, semantic_abstract, functional, verb_subtype, adjective_subtype, adverb_subtype).
5. `data/vocabulary_it_README.md` — Code-authored description of the three frequency files and how they relate.

### Architect's 12-point reply (all applied)

The architect chat ratified or refined every item in `FEEDBACK_for_architect_chat.md`. The substantive changes applied to the curated file:

| Item | Decision applied |
|---|---|
| Splitting rule | Ratified. `(lemma, pos, gender)` is the unique key. Shared rank between splits. |
| `themes` field | Required, single array. Taxonomy registered as `vocab_themes.json`. |
| Re-rank pass | Sanctioned. Field name stays `rank` (provisional during authoring, stable downstream). |
| CEFR labels | `stretch` and `out_of_scope` added to the canonical vocabulary. |
| `auxiliary: "either"` split | Replaced with `modal_aux_inheritance` (3 modal verbs) and `aux_varies_by_transitivity` (18 verbs). |
| `adj_class: "invariable"` | Ratified. |
| `noun_class` field | New field added to all 587 noun entries (`regular_o_masc`, `regular_a_fem`, `e_ambiguous`, `greek_ma_masc`, `ista_common_gender`, `irregular_gender`, `gender_shift_plural`, `invariable_accented_final`, `invariable_loanword`). |
| Cross-band split consolidation | 2 duplicates dropped during re-rank (`fine` f noun, `libreria` f noun) — both were cross-band duplicates from earlier authoring. |
| `translation_en` → array | Going forward only. Existing comma-string entries remain. Marker side accepts comma-split alternatives. |
| `null` vs sparse | Kept uniform with `null`. |
| `translation_en` / `gloss_en` split | Done in an earlier pass (189 entries had parens stripped; `gloss_en` now carries the human disambiguator). |
| Three-file layer | All three files in place, relationships documented in `vocabulary_it_README.md`. |

### Re-rank pass results

Ran the join from curated JSON → lemma CSV on `(lemma, pos, gender)` with fallbacks. Top of the re-ranked file now looks like a genuine Italian lemma-frequency list:

```
1  il      article       
3  essere  verb          
4  e       conjunction   
5  di      preposition   
6  la      article       
9  avere   verb          
10 che     pronoun       
11 che     conjunction   
11 un      article       
12 a       preposition   
13 non     adverb        
14 in      preposition   
14 lo      article       
14 lo      pronoun       
15 fare    verb          
15 una     article       
16 per     preposition   
17 si      pronoun       
18 potere  verb          
```

The first iteration of the lemma CSV had a function-word penalty bug (function words ranked at 2400+) which Code identified and fixed in the second iteration; the data above reflects the fixed version.

**Unmatched after re-rank:** 86 curated entries didn't find a lemma-CSV row. Broken down:

- **Reflexive verbs** (`lavarsi`, `vestirsi`, `divertirsi`, `arrabbiarsi`, etc.) — 16 entries. Patched in a follow-up pass by mapping `-rsi` lemma to its non-reflexive base verb (`lavarsi` → `lavare`) and inheriting the base's rank.
- **Greeting interjections** (`grazie`, `prego`, `buongiorno`, `buonasera`, `buonanotte`, `arrivederci`, `ehi`) — not in any lemma source. Kept at pre-rerank ranks.
- **Specific concrete nouns outside top 7,626 lemmas** (`comodino`, `cassettone`, `cerniera`, `dentifricio`, `felpa`, `forchetta`, `fornaio`, `fornello`, `giubbotto`, `impermeabile`, `lampadina`, `lavandino`, etc.) — niche but pedagogically useful; kept at pre-rerank ranks.
- **`la` (article)** — simplemma collapses `la`/`lo`/`le` under `il` in the lemma CSV, so `la` as a separate entry doesn't match. Unmatched but `il` got rank 1 correctly.

### Granular bands

The original 10 bands (`freq_1_100` through `freq_901_1000`) have been extended to **80 bands** covering `freq_1_100` through `freq_7901_8000`, all 100-wide. This was a deliberate change from the originally-considered "lumped" extension (e.g., `freq_1001_2000`) — granular bands let the housing compute per-100-band statistics uniformly, which matches the planned learner-facing progress view.

77 of the 80 bands are populated. Distribution skews toward the top (band 1-100 has 84 entries; the tail bands have 1-5 each).

### POS distribution (post re-rank)

Updated count, since the original POS table reflected the pre-re-rank state:

| POS | Count |
|---|---|
| noun | ~580 |
| verb | ~220 |
| adjective | ~155 |
| adverb | ~75 |
| pronoun | ~30 |
| determiner | ~21 |
| preposition | 21 |
| conjunction | 13 |
| numeral | 11 |
| article | 5 |
| interjection | 14 |
| **Total** | **1,146** |

Interjection count grew (greetings added). Otherwise similar shape.

### Themes coverage

**100%.** All 1,146 entries carry a `themes` array. The pass that filled the remaining 431 used:
- 200+ lemma-specific entries in a Python lookup table (verbs categorised by movement / communication / perception / cognition / emotion / state / action / routine / change / creation / destruction / existence / possession / speech_act / weather / inverted_subject; adjectives by size / quality / evaluation / nationality / temperature / distance / age; adverbs by time / place / manner / quantity / affirmation / negation; nouns by body / home / family / food / clothing / transport / nature / animals / time / emotions / communication / school / work / city / politics)
- POS-based defaults for everything else (`adjective_quality` for unclassified adjectives, `verb_action_general` for unclassified verbs, `noun_abstract` for unclassified nouns, `adverb_manner` for unclassified adverbs)

Themes can be refined entry-by-entry over time; the bulk-tagging gives every entry at least one defensible category so the renderer can group consistently.

### Outstanding (genuinely small now)

- `translation_en` array migration — a one-shot conversion of the existing comma-strings to JSON arrays. Optional; the marker handles comma-splitting.
- The 86 unmatched entries (mostly greetings and niche concrete nouns) keep their pre-rerank `rank` field. If a more authoritative rank source becomes available, run a small patch script to nudge them.
- Vocabulary practice questions, originally noted as "out of scope for the authoring chat." Still out of scope here; flagged for whoever does the practice-question authoring.

### Files (final)

- `data/buckets/vocabulary_frequency.json` — 80 granular bands (1-100 through 7901-8000)
- `data/vocabulary_it_frequency.json` — 1,146 entries, lemma-CSV-anchored ranks, 100% themed, with `noun_class` and refined `auxiliary` semantics
- `data/vocabulary_it_frequency_forms.csv` — 10,000 wordforms (Code-provided)
- `data/vocabulary_it_frequency_lemmas.csv` — 7,626 lemmas with POS / gender / aux / adj_class / NVdB tier (Code-provided, function-word fix applied)
- `data/vocab_themes.json` — themes taxonomy registry
- `data/vocabulary_it_README.md` — Code-authored relationship doc
- `FEEDBACK_for_architect_chat.md` — original asks plus architect ratification trail
- `REPLY_TO_vocab_chat_architecture.md` — architect's 12-point reply (in project root)
- `coverage_vocabulary_frequency.md` — this file

End of coverage update.

---

## Update 2 — state after gap-fill, truncation recovery, enrichment, and Brief B (2026-05-26)

The section above is preserved as the snapshot at the architect-ratification moment. Several subsequent passes have moved counts forward; this section is the current source of truth.

### Headline numbers (current)

- `data/vocabulary_it_frequency.json`: **1,476 entries** (was 1,146).
- `data/vocabulary_it_frequency_lemmas.csv`: **18,000 lemmas** (was 7,626) — Code's Brief B extension landed.
- `data/vocabulary_it_frequency_forms.csv`: 10,000 wordforms (unchanged).
- `data/buckets/vocabulary_frequency.json`: 80 bands, all carrying `cefr_subbands` arrays (the user-designed 15-sub-level CEFR mapping replaced the older `cefr_importance` dict).
- Distinct bands populated: 77 of 80. Max rank: 7,983. Entries in top 1000: 1,035 (above 1,000 because of the (lemma, pos, gender) splitting rule).

### What happened between the previous update and this one

**Gap-fill pass (Brief A).** Code ran a join from the lemma CSV (ranks ≤ 1000) against the curated file and added 458 thin entries — lemmas missing from the curated coverage but present in the merged frequency CSV. These carry a `notes: "thin entry from gap-fill pass — needs vocab-chat review..."` marker.

**Truncation event.** Code's gap-fill write got cut off at rank 982 (`dichiarazione`, noun, theme array never finished). Diagnosed in retrospect as OneDrive sync interfering with large JSON writes (the same chat had already lost ~24KB tail off two markdown files earlier). Recovered by merging the truncated curated file with the pre-gap-fill backup, deduping on `(lemma, pos, gender)` and preferring richer entries. Net result: 1,476 entries.

**OneDrive retired.** Project moved to `C:\Claude (not on Gdrive, nor OneDrive)\Linguics`. The new folder is the working tree from here on; OneDrive copy remains as an archival snapshot.

**Brief B delivered.** Code's extension of the lemma CSV from 7,626 to 18,000 lemmas landed in the new folder. Columns unchanged from the 7,626-row schema (`rank, lemma, pos, avg_rank, sources_count, rank_itwac, rank_opensubs, rank_wordfreq, gender, auxiliary, adj_class, nvdb_tier, notes`).

**Enrichment first pass on thin entries.** Bulk script (`enrich_thin.py`) refined themes from POS-default to lemma-specific where the vocab-chat lookup knew the word (107 entries), derived plurals for nouns with clean gender/ending patterns (127 entries), and set `conjugation_class` for regular verbs (55 entries). Two wrong-POS gap-fill entries (`voi` as noun, `buono` as adverb) were dropped and four others flagged for review.

**Marker bug surfaced.** A learner answered `il` to "What's the Italian for 'the'?" and was told it was wrong (the marker had `lo`). Logged in `FEEDBACK_for_architect_chat.md` as item 13 and partially addressed in `PATCH_REQUEST_for_code.md` (data-side gloss disambiguation for function words). The deeper marker fix is the architect's call.

### Current POS distribution

| POS | Count |
|---|---|
| noun | 678 |
| verb | 257 |
| adjective | 196 |
| adverb | 146 |
| pronoun | 54 |
| preposition | 44 |
| conjunction | 34 |
| interjection | 25 |
| determiner | 20 |
| numeral | 16 |
| article | 6 |
| **Total** | **1,476** |

### Coverage / completeness signals

- Themes: **94.9%** themed (1,400/1,476). The 76 untagged are thin entries where neither the lemma-specific lookup nor a POS-default fired confidently.
- Nouns with `plural`: 630 / 678 (93%).
- Verbs with `conjugation_class`: 239 / 257 (93%).
- Thin gap-fill entries from Code awaiting full vocab-chat enrichment: **440**. (Some have had themes/plural/conjugation added by the bulk pass; what remains is entry-by-entry refinement of glosses, notes, theme nuance, and false-friend flagging.)

### Outstanding work

- Entry-by-entry enrichment of the 440 thin gap-fill entries (in progress, task #26).
- Code's response to `PATCH_REQUEST_for_code.md`: (a) truncation patch for ranks 983-1000 if any remain missing post-recovery, (b) gloss-disambiguation pass on function words (`il` / `la` / `lo` / `un` / `una` / `gli` / `uno`).
- Architect's decision on the synonym-marker behaviour (FEEDBACK item 13).
- Code's Brief D (SQLite consolidation) — still pending.

### Files (current)

- `data/buckets/vocabulary_frequency.json` — 80 granular bands, each tagged with `cefr_subbands`.
- `data/vocabulary_it_frequency.json` — 1,476 entries.
- `data/vocabulary_it_frequency_lemmas.csv` — 18,000 lemmas (Brief B).
- `data/vocabulary_it_frequency_forms.csv` — 10,000 wordforms.
- `data/vocab_themes.json` — themes taxonomy registry.
- `data/vocabulary_it_README.md` — Code-authored relationship doc (unchanged).
- `FEEDBACK_for_architect_chat.md` — now includes item 13 on the `il`/`lo` synonym problem.
- `REPLY_TO_vocab_chat_architecture.md` — architect's 12-point reply (carried forward from OneDrive after move).
- `PATCH_REQUEST_for_code.md` — truncation patch + il/lo gloss-discrimination items.
- `BRIEFS_for_code.md` — A done, B done, C and D pending.
- `coverage_vocabulary_frequency.md` — this file.

End of Update 2.

---

## Update 3 — full-depth dictionary, bulk translations, hierarchical themes (2026-05-27)

This section is the current source of truth.

### Headline numbers

- **`data/vocabulary_it_frequency.json`: 18,064 entries** covering ranks 1-18,000 of the merged-lemma frequency list (plus 64 (lemma, pos, gender) split rows).
- **Translation coverage: 78%** (14,100 entries) — see breakdown by source below.
- **Themes: 44% on specific themes** (7,966 entries), 56% on POS-default placeholders. Both rates are up sharply from Update 2 (which had ~12% specific).
- `data/buckets/vocabulary_frequency.json`: **180 bands**, fully covering freq_1_100 through freq_17901_18000.
- `data/vocabulary_it_frequency_lemmas.csv`: 18,000 lemmas with raw per-corpus counts AND ranks AND wordfreq fractions (Code's freq rebuild plus dedup); SUM-of-counts across all rows equals corpus total exactly per the homograph-dedup convention.
- `data/linguics_italian.db`: SQLite with `lemmas`, `forms`, `curated_entries`, `themes`, `bands`, `sources` tables plus `lemma_frequencies` and `form_frequencies` long-format views.

### What changed since Update 2

**Lemma CSV count regression diagnosed and reverted.** Briefly during the freq-counts rebuild, the lemma CSV had been pruned from 18K to 9.3K rows. After the diagnostic brief (`BRIEF_for_code_freq_followups.md`), Code restored the full 18K and applied the option-1 homograph dedup (canonical row keeps full count, non-canonical splits zeroed). Sum-vs-total ratios for split-prone sources moved from 198%/190%/188%/177%/174% (over-count) to ~94%/95%/94%/85%/89% (the 5-15% deficit being the long tail outside top-N lemmatisation cutoff).

**Thin fill to 18K.** Curated dictionary extended structurally from 1,496 to 18,064 entries, adding ~16,500 thin entries (lemma + pos + gender + band + POS-default themes + notes flag, translation_en null).

**Hand-authored translations top-down.** Vocab chat hand-authored translations + themes + glosses + notes for ranks 1-1900 (~2,000 entries, including hand authoring during Update 2 phase). 20 corpus artefacts marked with `translation_en: "[skip]"`.

**Bulk translation pipeline (Code).** Per `BRIEF_for_code_bulk_translations.md`, Code ran a pass over all entries lacking translations using Apertium IT-EN bidix (highest priority), Italian Wiktionary, and OMW. A new `translation_source` field records provenance:

| translation_source | count |
|---|---|
| apertium | 6,444 |
| wiktionary | 5,141 |
| vocab_chat | 2,267 |
| omw | 248 |
| corpus_artefact | 20 |
| null (still untranslated) | 3,944 |

The 3,944 untranslated remainder is heavily concentrated at ranks 16,001-18,000 (1,715 of them), where lemmas are rare enough to have fallen off all three open dictionaries. Many are likely tokenisation noise or English-language leaks; subject to a future skip-marking pass.

**Theme taxonomy bumped to v2 with sub-themes.** `data/vocab_themes.json` now has 112 themes including 31 sub-themes under the four largest categories:

- food_drink → food_fruit / food_vegetable / food_meat_fish / food_dairy / food_grain_pasta / food_sweet / food_herb_spice / food_meal_type / drink_alcoholic / drink_nonalcoholic / food_utensil
- animals → animals_pet / animals_farm / animals_wild_mammal / animals_bird / animals_sea_creature / animals_reptile_amphibian / animals_insect
- science_technology → tech_computing / science_physics / science_chemistry / science_biology / science_math / science_astronomy / science_general
- arts_entertainment → arts_music / arts_visual / arts_literature / arts_performing / arts_film_tv / arts_general

Sub-themes are declared via `parent_id`. Convention: entries tagged with a child theme are ALSO tagged with the parent, so consumers can query top-level membership without walking the hierarchy.

**LEMMA_THEMES expanded.** Vocab chat's hand-authored lemma-to-theme lookup went from ~640 to 2,850 entries, plus 1,247 lemmas tagged with sub-themes via `data/lemma_subthemes.json`. Code's bulk pass used the WordNet lexicographer-file → Linguics theme mapping at `data/wordnet_to_linguics_themes.json` to assign top-level themes for the long tail.

**Marker-feedback to architect (item 13 update).** The `ma`/`però` learner-marker failure surfaced a broader question about how the marker should treat partial-equivalent and equivalence-class lemmas. The user's proposal — fire on the learner-produced lemma at its current "unattempted percentage" — is recorded verbatim in `FEEDBACK_for_architect_chat.md` for architect ratification. Three architect-asks: equivalence-class concept with asymmetric tracking, partial-credit weighting, explanation surface.

**Two truncation events recovered.** During Update 3, the curated JSON hit two write-truncation events (debris bytes after the closing bracket; mid-string truncations). Both recovered cleanly. Suspected cause: bash sandbox / host-filesystem timing interaction with concurrent writes from Code's pipeline. Vocab chat's scripts use atomic tmp+fsync+rename throughout; Code reports the same. Worth keeping an eye on if a third event occurs.

### Theme distribution (current)

Top theme tags across all 18,064 entries:

| Theme | Entries |
|---|---|
| noun_abstract (POS-default) | 4,990 |
| adjective_quality (POS-default) | 4,047 |
| verb_action_general (POS-default) | 1,765 |
| people_general | 987 |
| communication | 755 |
| mental_state | 475 |
| verb_communication | 415 |
| verb_change | 390 |
| food_drink | 388 |
| arts_entertainment | 350 |
| science_technology | 339 |
| city_places | 311 |
| animals | 274 |
| shopping_money | 241 |
| people_roles | 222 |
| body | 224 |
| verb_movement | 238 |
| politics_society | 212 |
| emotions | 197 |
| science_chemistry | 182 |
| time_general | 184 |

The three POS-default themes still dominate raw counts because 56% of entries (mostly the long tail) carry only the placeholder. Concrete-noun themes show real coverage (food, people, places, animals, science, arts all in the 200-400 range).

### Outstanding

- **Theme refinement on the long tail.** The 56% on POS-default is the bulk-tail content the WordNet pass didn't cover or where the wordnet-to-theme mapping returned an empty array (noun.artifact / noun.act / noun.group → POS-default). Iterative passes on the high-frequency bands will refine these.

- **Tail translations.** The 3,944 entries without translation_en are mostly rank 16,001-18,000. Future passes could: (a) mark obvious tokenisation noise as `[skip]`, (b) try a second wiktionary pass with looser matching, (c) accept that the very tail will always be patchy.

- **Polysemy over-tagging audit.** Some lemmas (`lavoro`, `momento`, `forza`) ended up with science_physics themes via my LEMMA_THEMES lookup because the same word has multiple senses. A targeted audit can prune these.

- **Marker-side decisions on FEEDBACK item 13.** The architect's call on equivalence-class behaviour, partial-credit weighting, and explanation surface is still outstanding.

- **The il/lo gloss-discrimination work** in `PATCH_REQUEST_for_code.md` remains pending; separate, smaller job.

### Files (current)

- `data/buckets/vocabulary_frequency.json` — 180 bands with cefr_subbands, full 1-18000 coverage
- `data/vocabulary_it_frequency.json` — 18,064 entries, 78% translated, 44% specifically themed, with translation_source provenance
- `data/vocabulary_it_frequency_lemmas.csv` — 18,000 lemmas with rank + count + freq columns per corpus, homograph-deduped
- `data/vocabulary_it_frequency_forms.csv` — 10,000 wordforms with rank + count + freq columns per corpus
- `data/vocab_themes.json` — 112 themes, v2 schema with parent_id
- `data/lemma_subthemes.json` — 1,247 hand-classified sub-theme assignments
- `data/wordnet_to_linguics_themes.json` — Code's WordNet lex-file to theme mapping
- `data/source_metadata.json` — per-corpus total_tokens and provenance
- `data/linguics_italian.db` — SQLite consolidation with views
- `data/linguics_italian.db.SCHEMA.md` — DB schema doc
- `data/vocabulary_it_README.md` — relationship doc for the three frequency files
- `FEEDBACK_for_architect_chat.md` — 13 items including ma/però update
- `REPLY_TO_vocab_chat_architecture.md` — architect's 12-point reply
- `BRIEFS_for_code.md` — original A-D briefs
- `BRIEF_for_code_freq_followups.md` — E (lemma restore) and F (homograph dedup)
- `BRIEF_for_code_bulk_translations.md` — bulk translation + WordNet theming brief
- `PATCH_REQUEST_for_code.md` — il/lo glosses + truncation patch
- `coverage_vocabulary_frequency.md` — this file

End of Update 3.
