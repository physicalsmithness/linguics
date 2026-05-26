# Italian vocabulary data files

Three files sit side-by-side in `data/`. They share a subject (Italian word frequency) but answer different questions and are authoritative for different things. Don't merge them — they're useful precisely because they're separate.

## At a glance

| File | Rows | Unit | Authoritative for | Source |
|---|---|---|---|---|
| `vocabulary_it_frequency_forms.csv` | 10,000 | **wordform** (surface string) | Frequency of the actual strings learners encounter | Auto-merged from 3 corpora |
| `vocabulary_it_frequency_lemmas.csv` | 8,000 | **lemma** (+ POS, + gender for homographs) | Frequency-ranked vocabulary universe; coverage gaps; sanity checks on the curated file | Auto-merged from 3 corpora + 1 sanity-check source |
| `vocabulary_it_frequency.json` | ~1,100 | **lemma** (curated entries) | Pedagogical content: glosses, themes, plural irregularities, notes, false-friend warnings | Hand-authored |

---

## 1. `vocabulary_it_frequency_forms.csv` — surface forms

Top 10,000 Italian **wordforms** by frequency. A wordform is the literal string that appears in text: `casa` and `case` are two rows; `parla`, `parlato`, `parlando`, `parlerà` are four separate rows.

Columns: `rank, word, avg_rank, sources_count, rank_hermitdave, rank_orgtre, rank_wordfreq`.

Sources (all surface-form, no lemmatisation):
- **hermitdave/FrequencyWords** — raw OpenSubtitles 2018 50k list
- **orgtre/top-open-subtitles-sentences** — cleaned OpenSubtitles 2018 top words
- **wordfreq** Python library — mixed corpora (Wikipedia, news, books, subtitles, web, Twitter)

Each source is capped at top 30k; words missing from a source's top 30k are penalised with rank 30,001 for that source. Average is across all three. 9,952 of 10,000 words appear in all three sources.

**Use this file when** you want to know how often a learner will literally see a particular string. It does *not* tell you which lemma they're encountering — `porta` aggregates both *door* (noun) and *brings* (verb form of *portare*).

**Don't use this file for** vocabulary lists, gender lookup, or anything pedagogical. The lemma file is what you want.

---

## 2. `vocabulary_it_frequency_lemmas.csv` — lemmas

Top 8,000 Italian **lemmas** (dictionary headwords), with POS, gender, auxiliary and adjective-class. A lemma is the citation form: infinitive for verbs (`parlare`), masculine singular for adjectives (`bello`), singular for nouns (`casa`). All of `parla`/`parlato`/`parlando` collapse into one row under the lemma `parlare`.

Columns: `rank, lemma, pos, avg_rank, sources_count, rank_itwac, rank_opensubs, rank_wordfreq, gender, auxiliary, adj_class, nvdb_tier, notes`.

POS is one of: `noun, verb, adjective, adverb, preposition, pronoun, article, conjunction, interjection, numeral, determiner`.

### Ranking sources (3, all lemma-aware)

1. **ItWaC** (franfranz/Word_Frequency_Lists_ITA) — POS-tagged web corpus, lemma-native. **Covers nouns, verbs and adjectives only.** For other POS we report no rank and don't penalise — ItWaC genuinely has no opinion on function words, so penalising would bias function-word lemmas down the list.
2. **OpenSubtitles 2018** (hermitdave) lemmatised via `simplemma`. Covers all POS.
3. **wordfreq** (multi-corpus) lemmatised via `simplemma`. Covers all POS.

Each source is capped at top 25k. `avg_rank` is the mean of the source ranks that apply (with penalty 25,001 substituted for "lemma is in scope for this source but absent from its top 25k").

### Sanity-check source (1, not a ranker)

- **NVdB** (Nuovo Vocabolario di Base, De Mauro & Chiari 2016) — hand-curated ~7,500 lemmas tagged with POS abbreviations and a usage tier:
  - `FO` — Fondamentale, ~2,000 lemmas covering 86% of typical discourse
  - `AU` — Alto uso, ~3,000 frequent lemmas
  - `AD` — Alta disponibilità, ~2,000 lemmas everyone understands but uses only in specific contexts

  NVdB is the POS authority (it wins over ItWaC and Morph-it!) and the gender authority for nouns. Its tier is surfaced as `nvdb_tier` but does not enter the average rank. Use the tier when deciding whether something belongs in your top-N target.

### Metadata sources

- **Gender** (nouns): NVdB if present, then Morph-it! 0.4.8, otherwise `ambiguous`. Where NVdB tags a noun `s.m. e f.` (e.g. `fine`), we split into two rows — one `m`, one `f` — with the same rank, per the homograph rule.
- **Auxiliary** (verbs): a hand-curated essere-list + reflexive detection (lemma ends in `-rsi` etc.) overlaid on a default of `avere`. Marked `either` for a curated set of motion/state verbs where transitivity decides. **This is heuristic — verify before trusting.** The curated JSON's `auxiliary` field is more reliable.
- **adj_class** (adjectives): heuristic on lemma ending — `-o` → `o`-class (4 forms), `-e` → `e`-class (2 forms), anything else → `invariable`. **Verify before trusting**; some -ista, -a, -i adjectives don't fit.

### Homograph handling

Four cases, three handled, one deferred:

- **Different POS** (`fine` adj vs `fine` noun, `lo` article vs `lo` pronoun): two rows, distinct `pos`. NVdB drives the POS split.
- **Different gender, same POS** (`fine` f "end" vs `fine` m "aim"): two rows, distinct `gender`. NVdB drives the gender split via the `s.m. e f.` annotation.
- **Surface-form clash, different lemmas** (`porta` noun "door" vs `porta` verb form of `portare`; `stato` noun "state" vs `stato` past participle of `essere`/`stare`): these look like homographs at the wordform level but resolve to *different lemmas*. In this file they already sit in separate rows (`porta` and `portare`; `stato` and `essere`/`stare`). No special handling needed — but see the contamination caveat below.
- **Same lemma, same POS, same gender, different sense** (`pianta` plant/floor-plan/sole; `campo` field/camp/pitch; `carta` paper/card/map): **NOT split.** None of the ranking or sanity sources carry sense IDs, so faking a split would invent rank data. These collapse into one row. The curated JSON is the right place to add sense distinctions as they come up.

### Lemmatisation contamination caveat

simplemma (used to lemmatise the OpenSubtitles and wordfreq sources) is context-free. When it sees the surface form `stato`, it always picks the noun lemma — but in context many of those occurrences are the past participle of `essere`/`stare`. That inflates `stato`-noun's frequency in the simplemma-based sources and deflates the verbs'. ItWaC's TreeTagger pipeline IS context-aware so its ranks for these forms are more trustworthy, and the three-way average partly washes the bias out. Worth knowing when something looks higher-ranked than expected.

### If you ever want true sense splitting

For same-lemma/same-POS/same-gender sense homographs, options that aren't done here but could be wired in as a separate enrichment pass:

1. **MultiWordNet (Italian WordNet)** — sense-tagged synsets keyed to English WordNet. Gives canonical sense IDs and English glosses. Doesn't carry per-sense frequency.
2. **Wiktionary scrape** — every Italian Wiktionary entry numbers its definitions; easy to scrape, no per-sense frequency.
3. **LLM sense-tagging pass** — feed each top-N lemma to a model, ask it to enumerate senses with glosses. Most flexible.
4. **The curated JSON** — already the human-authored place where senses get split as the vocab-authoring chat sees fit.

### Sources_count interpretation

`sources_count` is 0–3, counting how many ranking sources placed this lemma in their top 25k. For non-{noun,verb,adjective} POS the max is 2 (ItWaC doesn't apply).

### Use this file to

- Re-rank the curated JSON entries.
- Identify gap-fill candidates the curated JSON is missing (look at high-rank lemmas not present in the JSON).
- Cross-check `gender` and `auxiliary` assignments in the curated JSON — flag mismatches for human review.

### Don't use this file for

- English translations (it has none — the curated JSON is authoritative).
- Plural forms or conjugation classes (curated JSON only).
- Theme tagging (curated JSON only).
- Pedagogical notes (curated JSON only).

---

## 3. `vocabulary_it_frequency.json` — curated entries

Hand-authored vocabulary entries with the full pedagogical apparatus. ~1,100 entries, each with: `rank, lemma, pos, translation_en, themes, band, gender, plural, auxiliary, conjugation_class, adj_class, notes`. Homographs allowed (same `lemma`, distinct `pos` or `gender`).

This is **the authoritative file for everything pedagogical**: glosses, themes, irregular plurals, conjugation classes, false-friend warnings, notes on register and usage. The `rank` field here was originally set from a different procedure; the lemma CSV exists in part so it can be re-ranked against a corpus-grounded source.

### Relationship to the lemma CSV

- The lemma CSV's universe (~8,000) is a strict superset of the curated JSON (~1,100). Every JSON lemma should appear in the lemma CSV; mismatches are worth investigating (different lemmatisation choice, missing low-frequency lemma, etc.).
- The curated JSON's `gender` and `auxiliary` are authoritative when they disagree with the lemma CSV — the CSV's gender/auxiliary are derived from automated lookups and heuristics.
- The curated JSON's `rank` is the band/teaching order; the lemma CSV's `rank` is corpus-derived frequency. They will not match — they're answering different questions.

---

## Provenance notes

- ItWaC files: latin-1 encoded; lemmatised and POS-tagged via TreeTagger; auxiliaries are excluded by the franfranz preprocessing; minimum frequency threshold 3 (the "notail" variant).
- NVdB HTML files parsed with a simple regex; lemmas listed alphabetically within tier (no per-lemma frequency rank available — hence "sanity check, not ranker").
- `simplemma` is a fast pure-Python lemmatiser; accurate on common forms, weaker on rare morphology. Its lemmatisation of `la`/`lo`/`le` collapses to `il` (treating them all as articles), which matches the lemma convention used in the curated JSON.
- Morph-it! 0.4.8 is latin-1 encoded; ~505k inflected forms covering ~35k lemmas.

## Regeneration

Both auto-generated CSVs are produced by Python scripts living in the generator's working tree (not in this repo). Re-running them will overwrite the CSVs in place; the curated JSON is hand-edited and is never overwritten automatically.
