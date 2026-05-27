# Brief for Code: bulk-translate the curated dictionary

The curated dictionary now spans the full 18,000 lemmas (`vocabulary_it_frequency.json` has 18,064 entries after splits). Roughly 16,000 of them have `translation_en: null` — placeholders the vocab chat was going to hand-author entry by entry. That was the wrong shape for the job. Bulk lookup from existing open Italian-English dictionaries is more appropriate; the vocab chat's role is the editorial / pedagogical layer on top.

This brief asks you to do the bulk lookup and merge.

---

## Goal

Populate `translation_en` for every entry in `data/vocabulary_it_frequency.json` that currently has `translation_en: null`, using open bilingual sources. Add a new field `translation_source` recording where each translation came from.

Don't touch entries that already have a non-null `translation_en` (these are vocab-chat curated). Don't touch entries marked `translation_en: "[skip]"` (these are corpus artefacts the vocab chat has flagged).

---

## Sources (in priority order)

Use whichever combination is reliably reachable. The vocab chat suggests this order based on quality and POS-handling:

1. **Apertium IT-EN bilingual dictionary** (apertium-eng-ita). Curated by linguists, structured XML, POS-tagged. Highest quality for the lemmas it covers. Probably the cleanest source. GitHub: `apertium/apertium-ita-eng` or similar; look for the `.dix` or `.bidix` files.

2. **Italian Wiktionary** dump. Larger coverage (50K+ Italian lemmas with English translations) but messier extraction (wikitext parsing). Tools: `wikt2dict`, `mwparserfromhell`, or `dbnary` RDF dumps.

3. **Open Multilingual Wordnet's ItalWordNet**. Italian lemmas mapped to Princeton WordNet synsets, giving English glosses. About 15K coverage, POS-aware. NLTK has `wordnet` with Italian support.

Pick whichever you can get reliably; combining all three is ideal but a single good source is fine for a first pass.

---

## Per-entry behaviour

For each entry in the curated JSON with `translation_en: null`:

- Match on `(lemma, pos, gender)` against the source's entries. For nouns, gender matters. For non-nouns, just `(lemma, pos)`.
- If matched: populate `translation_en` with the source's English gloss (or comma-joined glosses if multiple are given). Populate `translation_source` with the source name (e.g. `"apertium"`, `"wiktionary"`, `"omw"`).
- If not matched in any source: leave `translation_en: null` and set `translation_source: null`. These are the residual entries the vocab chat can attend to later.

For multi-meaning lemmas (e.g. `tema` = theme / school essay), comma-join the meanings in `translation_en`. The marker handles comma-split alternatives. Order by which meaning the source presents first.

Don't overwrite anything. If a lemma is in your source AND already has translation_en in the curated JSON, leave the curated value alone. The hand-curated entries (rank ≤ 2000) are higher quality than a bulk pull.

---

## New field: `translation_source`

Add this string field to every entry. Values:

- `"vocab_chat"` for the ~2,000 entries already hand-authored.
- `"apertium"`, `"wiktionary"`, `"omw"`, or whichever source provided the translation.
- `null` for entries where no source matched (translation_en stays null).
- `"corpus_artefact"` for the 20-ish entries currently marked `translation_en: "[skip]"` (those keep their `"[skip]"` value too; this just marks the provenance).

This lets the vocab chat sort by `translation_source` later to spot-check the bulk-pulled entries and refine where needed.

Mark all existing non-null hand-authored entries as `translation_source: "vocab_chat"` before starting the bulk merge, so we can tell vocab-chat work from bulk-pulled.

---

## POS handling notes

- `(lemma, pos, gender)` splits in the curated JSON are real and the bulk source's translations should match POS. Don't apply a noun translation to a verb entry of the same spelling.
- For homograph splits like `il/article` vs `il/pronoun`, Apertium and Wiktionary should both distinguish; OMW maps to wordnet synsets which are POS-keyed.
- For -ista common-gender nouns (`artista`, `giornalista` etc.), the m and f rows can get the same translation (with `(m)` and `(f)` markers if you want).

---

## What the vocab chat has done so far

- Ranks 1-1900: 98% have hand-authored translations + themes + glosses + notes for edge cases. Leave alone.
- Ranks 1901-2000: about 6% covered.
- Ranks 2001-9337: about 5% covered (Code's original gap-fill from Brief A — those have basic glosses).
- Ranks 9338-18000: 0% (just thin-filled today).

So the bulk-pull will mostly fill the gap from rank 1901 onwards. The top 1,900 has small residual gaps the vocab chat will tidy after.

The 20 `[skip]` entries are tokenisation artefacts (English words leaked into the corpus, single letters, apocopated forms). Don't try to translate them.

---

## Atomic write

The curated JSON is now ~4.8 MB and growing as translations populate. Please use the same atomic_io tmp+fsync+replace pattern Code's other scripts use. The vocab chat hit a stale-bytes-after-rename issue earlier in this session (15 KB of debris tail on the curated JSON) which Code's earlier work then cleaned up; let's not regenerate that.

---

## Verification

After your run, the vocab chat will check:

```python
import json
data = json.load(open('data/vocabulary_it_frequency.json'))
print(f'Total: {len(data)}')

# Translation coverage by source
from collections import Counter
sources = Counter(e.get('translation_source') for e in data)
print(sources)

# Untranslated remainder
no_trans = sum(1 for e in data if not e.get('translation_en'))
print(f'Still untranslated: {no_trans}')
```

Expected after a thorough Apertium + Wiktionary + OMW combination: vocab_chat ~2000, apertium 5-10K, wiktionary 5-15K, omw cross-checks, residual untranslated maybe 1-3K (rare tail lemmas).

---

## Side note: a stale-snapshot quirk in the bash sandbox

While verifying the previous brief's E/F work, the vocab chat noticed that its bash sandbox sees stale snapshots of files that have been rewritten via `os.replace()` from the host side. The lemma CSV at 18K rows on the host showed as 9.6K rows in the bash sandbox view. Reading the freshly-named `.bak.preF` worked because new file names get fresh cache entries; in-place modifications hit cached reads.

This means the vocab chat's scripts may need to read from any newly-named backup file you produce, rather than the canonical file, to see your latest output. If you can produce a one-line README or a tag of the format used (e.g. `vocabulary_it_frequency.json.afterBulkTranslations`), the vocab chat will use that to compare and merge.

Doesn't affect Code's own work since you can see the host filesystem freshly. Just a workflow note for the handoff back.

---

## Extension: theme assignment via WordNet semantic domains (added in this brief)

While you're already touching every untranslated entry, please also assign a `themes` array using the same OMW / WordNet pass that gives you the translation. The vocab chat has hand-authored themes for ~3,500 of the 18,064 entries; the rest are mostly on POS-default placeholders (`noun_abstract`, `verb_action_general`, etc.) that don't partition meaningfully.

### How the theme system is structured

The taxonomy lives in `data/vocab_themes.json` (version 2). 112 themes total, organised as:

- **Top-level themes**: the original 81 from v1 (body, food_drink, animals, science_technology, arts_entertainment, work_business, ...). Use these wherever a wordnet lexicographer file maps cleanly.
- **Sub-themes (31, new in v2)**: children of food_drink, animals, science_technology, arts_entertainment, declared via `parent_id`. Examples:
  - food_drink → food_fruit, food_vegetable, food_meat_fish, food_dairy, food_grain_pasta, food_sweet, food_herb_spice, food_meal_type, drink_alcoholic, drink_nonalcoholic, food_utensil
  - animals → animals_pet, animals_farm, animals_wild_mammal, animals_bird, animals_sea_creature, animals_reptile_amphibian, animals_insect
  - science_technology → tech_computing, science_physics, science_chemistry, science_biology, science_math, science_astronomy, science_general
  - arts_entertainment → arts_music, arts_visual, arts_literature, arts_performing, arts_film_tv, arts_general

**Convention**: entries tagged with a child theme are ALSO tagged with the parent. So `mela` (apple) gets `['food_drink', 'food_fruit']`, not just `['food_fruit']`. Consumers asking "show me food vocabulary" then check for `food_drink` membership without walking the hierarchy.

### WordNet → top-level theme mapping (vocab chat will supply)

The vocab chat will produce a `data/wordnet_to_linguics_themes.json` mapping like:

```json
{
  "noun.animal":       ["animals"],
  "noun.body":         ["body"],
  "noun.food":         ["food_drink"],
  "noun.plant":        ["plants"],
  "noun.artifact":     [],
  "noun.act":          [],
  "noun.attribute":    ["noun_abstract"],
  "noun.communication":["communication"],
  "noun.event":        ["noun_abstract"],
  "noun.feeling":      ["emotions"],
  "noun.cognition":    ["mental_state"],
  "noun.location":     ["city_places"],
  "noun.motive":       ["mental_state"],
  "noun.object":       [],
  "noun.person":       ["people_general"],
  "noun.phenomenon":   ["nature"],
  "noun.possession":   ["shopping_money"],
  "noun.process":      ["science_general"],
  "noun.quantity":     ["noun_abstract"],
  "noun.relation":     ["noun_abstract"],
  "noun.shape":        ["noun_abstract"],
  "noun.state":        ["noun_abstract"],
  "noun.substance":    ["science_chemistry"],
  "noun.time":         ["time_general"],
  "verb.body":         ["verb_routine"],
  "verb.change":       ["verb_change"],
  "verb.cognition":    ["verb_cognition"],
  "verb.communication":["verb_communication"],
  "verb.competition":  ["verb_action_general"],
  "verb.consumption":  ["verb_routine"],
  "verb.contact":      ["verb_action_general"],
  "verb.creation":     ["verb_creation"],
  "verb.emotion":      ["verb_emotion"],
  "verb.motion":       ["verb_movement"],
  "verb.perception":   ["verb_perception"],
  "verb.possession":   ["verb_possession"],
  "verb.social":       ["verb_action_general"],
  "verb.stative":      ["verb_state"],
  "verb.weather":      ["verb_weather"]
}
```

If the wordnet lookup returns multiple lexicographer files for a lemma, union the theme arrays.

### Sub-themes from WordNet hypernyms (best-effort)

WordNet's lexicographer files give top-level themes cleanly. Sub-themes are harder because they need a sub-domain hierarchy. The vocab chat has already hand-authored the lemma-to-sub-theme mappings for ~700 common content lemmas in the four sub-themed categories. Those go in `data/lemma_subthemes.json` (vocab chat will supply this alongside the wordnet mapping).

For lemmas Code's WordNet lookup tags with `animals` and which appear in `data/lemma_subthemes.json` under `animals_*`, Code should also add the matching sub-theme. For lemmas not in `lemma_subthemes.json`, just tag with the parent theme (no sub-theme assignment) — the vocab chat will fill these in over time.

### Theme preservation rules

- **Hand-authored themes**: entries where `themes` is non-empty AND non-POS-default-only — leave alone (vocab chat work). You can recognise these by `set(themes) != {pos_default}`.
- **POS-default-only themes**: entries where `themes == ['noun_abstract']` or `['verb_action_general']` etc. — replace with the WordNet-derived themes (with the parent+child convention).
- **Empty `themes`**: same as POS-default — replace.

Don't add a `theme_source` field; we'll just use the presence of specific themes as the signal of "themed". A separate `translation_source` field handles translations.

### Two files vocab chat needs to provide before you start

1. `data/wordnet_to_linguics_themes.json` — the lexicographer-file → theme-array mapping above.
2. `data/lemma_subthemes.json` — for the ~700 lemmas where vocab chat has already classified the sub-theme, a flat dict `{lemma: [sub_theme]}`. Code merges these in when the parent theme matches.

The vocab chat will write these files. Ping when ready, or generate them yourself from the existing `LEMMA_THEMES` table in `outputs/extend_lemma_themes_v2.py` (the vocab chat can produce a JSON export of that on request).

---

## Out of scope here

- Theme refinement BEYOND wordnet-derived top-level + the hand-authored sub-theme table — vocab chat will do this entry-by-entry over time on the high-value bands.
- The `[skip]` entries — leave alone, just mark `translation_source: "corpus_artefact"`.
- The bands file extension (it currently goes to 8000; vocab chat will extend the bucket registry to 18000 in a separate step).
- The marker-side equivalence-class / partial-credit work — still pending architect's decision on FEEDBACK item 13.
