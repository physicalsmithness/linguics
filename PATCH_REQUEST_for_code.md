# Patch request — for Code, after B/C land

Two follow-ups on the gap-fill (brief A) and one new architectural item. Not urgent; pick them up after you finish brief B (lemma CSV extension) and brief C (per-register source columns).

---

## 1. The write got truncated at rank 982

Your gap-fill pass on `data/vocabulary_it_frequency.json` was reported as 458 added (final count 1604), but the file write got cut off mid-string at rank 982 (`dichiarazione`, noun, theme array never finished). After recovery from a pre-gap-fill backup, the file currently has 1478 entries — short of 1604 by about 126.

This is the **second time** a large JSON write in this environment has been truncated mid-file. The vocab chat hit it too, around 14,000 lines in. Whatever the underlying buffer / flush issue is, it bites on outputs above ~17,000 lines / ~430 KB.

### What to do

(a) **Patch the missing entries** at ranks 983-1000 that didn't make it into the file. Easiest path: re-run your gap-fill detection (lemma CSV rank ≤ 1000, not in curated keys) and add just the missing ones. Anything from 1-982 is probably already there; check before duplicating.

(b) **Going forward, write the JSON in a way that's robust to the truncation.** Options:

- `json.dump()` then `f.flush()` then `os.fsync(f.fileno())` before closing — forces the buffer to disk.
- Or: write to a `.tmp` file first, then `os.rename()` to the final path. Atomic, no half-written file ever exists.
- Or: emit the JSON array entry-by-entry rather than via `json.dump()` of the whole list. Cap each write at ~5,000 lines.
- Or: write to a `.jsonl` companion (one entry per line) and only regenerate the consolidated JSON when needed — small, line-oriented writes are reliable.

The vocab chat hit the same problem during the earlier rerank work; it now does many small `Edit` calls instead of one big `Write`. That's reliable but slow. Your scripts have the choice; pick whichever works.

### Verification

After your patch, the file should have ~1604 entries. Confirm by:
```python
import json
with open('data/vocabulary_it_frequency.json') as f:
    d = json.load(f)
print(len(d))
top_1000 = [e for e in d if e['rank'] <= 1000]
print(f'In top 1000: {len(top_1000)}')
```

The top 1000 should have full coverage (every lemma at lemma-CSV ranks 1-1000 represented by at least one curated entry).

---

## 2. The `il`/`lo` problem — same-translation entries are ambiguous to the marker

A learner using the vocab practice flow got asked *"What's the Italian for 'the'?"*, typed `il`, and was told *"No, it's lo."*

This is wrong on multiple counts: `il` is the most common form of "the" in Italian (masculine singular, default before consonants); `lo` is only used in the narrow case of s+cons, z, gn, ps, x, y, i+vowel. Telling a learner `il` isn't "the" undermines trust in the marker.

The data shape exposes this because the curated JSON has several distinct entries that all have `translation_en: "the"`: `il` (article), `la` (article), `lo` (article), `un` (article), `una` (article), plus the new `il` pronoun entry you added, plus `gli`, `i`, `le`, `degli`, etc. From the marker's point of view, picking one to ask about and rejecting the others is too strict.

### Why this is partly your problem

You can help by **adding more discriminating glosses on the `translation_en` field** so the marker has something to work with — e.g.:

| Lemma | Current `translation_en` | Suggested |
|---|---|---|
| `il` | `"the"` | `"the (m sg)"` |
| `la` | `"the"` | `"the (f sg)"` |
| `lo` (article) | `"the"` | `"the (m sg, before s+cons / z / gn / ps / x / y / i+vowel)"` |
| `gli` | (currently absent) | `"the (m pl, before s+cons / z / gn / ps / x / y / i+vowel)"` |
| `i` | (currently absent if missing) | `"the (m pl)"` |
| `le` | already `"the"` for article + `"her, to her"` for pronoun | `"the (f pl)"` for article |
| `un` | `"a, an"` | `"a, an (m sg)"` |
| `una` | `"a, an"` | `"a, an (f sg)"` |
| `uno` | `"a, an"` (article) | `"a, an (m sg, before s+cons / z / gn / ps / x / y / i+vowel)"` |

That way the marker, when asking EN→IT, can render the question with the specific gloss (*"What's the Italian for `the (m sg)`?"*) and only `il` is correct. Conversely IT→EN, the learner sees `lo` and can answer `the` — exactly what's on the bare-translation side; the disambiguating gloss is parenthetical.

### Why this is also a marker / housing problem

The deeper fix is housing-side: when the marker picks an entry to ask about, it should consider all curated entries with `translation_en` overlapping the chosen one, and treat any of those lemmas as correct answers to the EN→IT direction. That's a marker rule, not data.

This file is going to the architect via `FEEDBACK_for_architect_chat.md` so they can decide the marker change. The data-side gloss refinements you can apply now will help regardless of what the marker eventually does.

### Scope of the gloss-refinement pass

Just the function-word zone — articles and indefinite articles. Maybe 15-20 entries. Other lemmas with `"the"` or `"a, an"` in their translation_en (there shouldn't be many beyond articles) get the same treatment. Don't touch content words.

---

## When you're done

Tell the user. The vocab chat will then start the enrichment pass on Code's thin gap-fills (refine glosses, add notes, slot themes properly, flag false friends) — independent of whether the patches above are in or not.
