# Italian vocabulary data files

Four files sit side-by-side in `data/`. The CSVs and the JSON are editable sources; the `.db` is derived and gets rebuilt by `regenerate_db.py`.

## At a glance

| File | Rows | Unit | Authoritative for | Built from |
|---|---|---|---|---|
| `vocabulary_it_frequency_forms.csv` | 10,000 | **wordform** | Strings learners actually encounter | 3 corpora merged + 4 per-register columns |
| `vocabulary_it_frequency_lemmas.csv` | 18,000 | **lemma** (+ POS + gender for homographs) | Frequency-ranked vocabulary universe; coverage gaps; metadata sanity checks | 3 corpora merged + 1 sanity source + 4 per-register columns |
| `vocabulary_it_frequency.json` | ~1,500 | **lemma** (curated) | Pedagogical content (glosses, themes, plurals, notes, false-friend warnings) | Hand-authored + thin gap-fill |
| `linguics_italian.db` | — | SQLite | Queryable join of everything above plus bands, themes, coverage curve | Built from the other three by `regenerate_db.py` |

---

## 1. `vocabulary_it_frequency_forms.csv` — surface forms

Top 10,000 Italian **wordforms** by frequency. A wordform is the literal string that appears in text: `casa` and `case` are two rows; `parla`, `parlato`, `parlando`, `parlerà` are four separate rows.

Columns: `rank, word, avg_rank, sources_count, rank_hermitdave, rank_orgtre, rank_wordfreq, rank_lip, rank_news, rank_literature, rank_wikipedia`.

Sources (all surface-form, no lemmatisation):
- **hermitdave/FrequencyWords** — raw OpenSubtitles 2018 50k list
- **orgtre/top-open-subtitles-sentences** — cleaned OpenSubtitles 2018 top words
- **wordfreq** Python library — mixed corpora (Wikipedia, news, books, subtitles, web, Twitter)

Each source is capped at top 30k; words missing from a source's top 30k are penalised with rank 30,001 for that source. Average is across all three. 9,952 of 10,000 words appear in all three sources.

**Use this file when** you want to know how often a learner will literally see a particular string. It does *not* tell you which lemma they're encountering — `porta` aggregates both *door* (noun) and *brings* (verb form of *portare*).

**Don't use this file for** vocabulary lists, gender lookup, or anything pedagogical. The lemma file is what you want.

---

## 2. `vocabulary_it_frequency_lemmas.csv` — lemmas

Top 18,000 Italian **lemmas** (dictionary headwords), with POS, gender, auxiliary and adjective-class. A lemma is the citation form: infinitive for verbs (`parlare`), masculine singular for adjectives (`bello`), singular for nouns (`casa`). All of `parla`/`parlato`/`parlando` collapse into one row under the lemma `parlare`.

Columns: `rank, lemma, pos, avg_rank, sources_count, rank_itwac, rank_opensubs, rank_wordfreq, gender, auxiliary, adj_class, nvdb_tier, notes, rank_lip, rank_news, rank_literature, rank_wikipedia`.

### Per-register columns (added in brief C)

Four extra rank columns drawn from register-specific corpora:

| Column | Corpus | Notes |
|---|---|---|
| `rank_wikipedia` | Italian Wikipedia, October 2022 dump (via `adno/wikipedia-word-frequency-clean`) | Encyclopedic register |
| `rank_news` | OPUS News-Commentary v16, Italian monolingual | News writing |
| `rank_literature` | ~80 Italian Project Gutenberg books | Literary writing |
| `rank_lip` | OPUS Europarl v8, Italian monolingual | **PROXY**: formal transcribed parliamentary speech, not strictly LIP. The actual LIP / BADIP corpus wasn't reachable at build time; this is the closest available stand-in. Swap when LIP becomes accessible. |

All four were lemmatised via simplemma (same tool used for OpenSubtitles+wordfreq), then aggregated and ranked. They sit alongside the existing rank columns — the headline `rank` and `avg_rank` are unchanged.

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

Hand-authored vocabulary entries with the full pedagogical apparatus. ~1,500 entries, each with: `rank, lemma, pos, translation_en, themes, band, gender, plural, auxiliary, conjugation_class, adj_class, noun_class, gloss_en, notes`. Homographs allowed (same `lemma`, distinct `pos` or `gender`).

This is **the authoritative file for everything pedagogical**: glosses, themes, irregular plurals, conjugation classes, false-friend warnings, notes on register and usage. The `rank` field here was originally set from a different procedure; the lemma CSV exists in part so it can be re-ranked against a corpus-grounded source.

### Relationship to the lemma CSV

- The lemma CSV's universe (~18,000) is a strict superset of the curated JSON (~1,500). Every JSON lemma should appear in the lemma CSV; mismatches are worth investigating (different lemmatisation choice, missing low-frequency lemma, etc.).
- The curated JSON's `gender` and `auxiliary` are authoritative when they disagree with the lemma CSV — the CSV's gender/auxiliary are derived from automated lookups and heuristics.
- The curated JSON's `rank` is the band/teaching order; the lemma CSV's `rank` is corpus-derived frequency. They will not match — they're answering different questions.

---

## 4. `linguics_italian.db` — SQLite

Derived single-file database. Tables: `lemmas`, `forms`, `curated_entries`, `themes`, `bands`, `text_coverage_curve`. View: `vocab_view`. See `linguics_italian.db.SCHEMA.md` for column-by-column docs and example queries (coverage-at-rank, missing-translations, noun-class distribution).

**Rebuilt by `regenerate_db.py`** (at project root). The CSVs and the JSON are authoritative; the DB is a derived view. After any edit to the source files, rerun the script:

```
python regenerate_db.py
```

The script writes atomically (`.db.tmp` then `os.replace`), so an interrupted build leaves the previous DB intact.

---

## Provenance notes

- ItWaC files: latin-1 encoded; lemmatised and POS-tagged via TreeTagger; auxiliaries are excluded by the franfranz preprocessing; minimum frequency threshold 3 (the "notail" variant).
- NVdB HTML files parsed with a simple regex; lemmas listed alphabetically within tier (no per-lemma frequency rank available — hence "sanity check, not ranker").
- `simplemma` is a fast pure-Python lemmatiser; accurate on common forms, weaker on rare morphology. Its lemmatisation of `la`/`lo`/`le` collapses to `il` (treating them all as articles), which matches the lemma convention used in the curated JSON.
- Morph-it! 0.4.8 is latin-1 encoded; ~505k inflected forms covering ~35k lemmas.
- Italian Wikipedia frequencies: `adno/wikipedia-word-frequency-clean`, October 2022 dump (~850k wordforms, ~1B tokens).
- News-Commentary: OPUS v16, ~2.5M tokens.
- Europarl: OPUS v8, ~52M tokens — used as a `rank_lip` proxy until the real LIP/BADIP corpus is reachable.
- Project Gutenberg Italian: 79 books, ~5.8M tokens — sample of canonical Italian literature.

## Regeneration

CSVs and the DB are produced by scripts living in the generator's working tree. Re-running them overwrites the CSVs and DB in place; the curated JSON is hand-edited and never overwritten automatically. All writes use atomic `.tmp` + `os.replace()` so OneDrive sync (or any other interruption) cannot leave a half-written file. **For this reason the canonical project location is now off-OneDrive at `C:\Claude (not on Gdrive, nor OneDrive)\Linguics\` — keep it there.**
