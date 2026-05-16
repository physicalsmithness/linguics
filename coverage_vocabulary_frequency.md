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

End of coverage summary.
