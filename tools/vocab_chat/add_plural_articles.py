"""Add the three missing plural definite-article entries (i, gli, le) to the
curated dictionary, per Architecture ↔ Vocab: other_open_questions v1.

Code's earlier gloss-disambiguation patch hit only the six articles that
existed (il, la, lo, un, una, uno). simplemma collapses the plural forms
upstream so they never made it into the lemma CSV — but they're among the
most common Italian function words and the marker needs them.

Schema follows the article-gloss-patch convention with phonological context
for `gli`. Ranks are provisional in the top 30; the re-rank pipeline will
sort precisely on the next pass.

Run from project root:
    python3 tools/vocab_chat/add_plural_articles.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from atomic_io import atomic_write_json  # noqa: E402

DATA = PROJECT_ROOT / "data" / "vocabulary_it_frequency.json"

NEW_ENTRIES = [
    {
        "rank": 22,  # provisional, top-30; re-rank will resolve
        "lemma": "i",
        "pos": "article",
        "translation_en": "the (m pl)",
        "themes": ["function_word"],
        "band": "vocabulary.it.freq_1_100",
        "gender": "m",
        "plural": None,  # i IS plural; no further plural
        "auxiliary": None,
        "conjugation_class": None,
        "adj_class": None,
        "noun_class": None,
        "equivalence_class": None,
        "gloss_en": None,
        "notes": "[plural-article-gap-fill] masculine plural definite article; allomorph gli (before s+cons, z, gn, ps, x, y, i+vowel, or any vowel); not in lemma CSV because simplemma collapses to a singular lemma upstream",
        "translation_source": "vocab_chat",
    },
    {
        "rank": 23,
        "lemma": "gli",
        "pos": "article",
        "translation_en": "the (m pl, before s+cons / z / gn / ps / x / y / i+vowel; and before any vowel)",
        "themes": ["function_word"],
        "band": "vocabulary.it.freq_1_100",
        "gender": "m",
        "plural": None,
        "auxiliary": None,
        "conjugation_class": None,
        "adj_class": None,
        "noun_class": None,
        "equivalence_class": None,
        "gloss_en": None,
        "notes": "[plural-article-gap-fill] masculine plural definite article used before s+cons, z, gn, ps, x, y, i+vowel, or any vowel; complements i which is used in all other contexts; gli is also the m-pl indirect-object clitic pronoun, but that sense gets its own entry if/when added",
        "translation_source": "vocab_chat",
    },
    {
        "rank": 24,
        "lemma": "le",
        "pos": "article",
        "translation_en": "the (f pl)",
        "themes": ["function_word"],
        "band": "vocabulary.it.freq_1_100",
        "gender": "f",
        "plural": None,
        "auxiliary": None,
        "conjugation_class": None,
        "adj_class": None,
        "noun_class": None,
        "equivalence_class": None,
        "gloss_en": None,
        "notes": "[plural-article-gap-fill] feminine plural definite article; le is also the f-pl direct-object clitic pronoun and the f-sg indirect-object clitic; those senses get separate entries if/when added",
        "translation_source": "vocab_chat",
    },
]


def main():
    print(f"Loading {DATA}")
    with DATA.open() as f:
        entries = json.load(f)
    print(f"  {len(entries)} entries loaded")

    # Belt-and-braces: confirm these lemmas as articles don't already exist.
    for new in NEW_ENTRIES:
        existing = [
            e for e in entries
            if e.get("lemma") == new["lemma"] and e.get("pos") == "article"
        ]
        if existing:
            print(f"  ABORT: lemma '{new['lemma']}' as article already present ({len(existing)} matches)")
            return

    # Insert each new entry at the position that keeps the file rank-sorted.
    # (Existing entries already share ranks in the function-word zone so we
    # don't need a unique slot; just place adjacent to the closest rank.)
    inserted = 0
    for new in NEW_ENTRIES:
        # Find the first existing entry with rank > new.rank; insert before it.
        idx = next(
            (i for i, e in enumerate(entries) if (e.get("rank") or 99999) > new["rank"]),
            len(entries),
        )
        entries.insert(idx, new)
        inserted += 1
        print(f"  inserted '{new['lemma']}' (article, {new['gender']}) at rank {new['rank']}, position {idx}")

    print(f"\nTotal inserted: {inserted}")
    print(f"New total: {len(entries)}")

    print(f"\nWriting back to {DATA}")
    atomic_write_json(DATA, entries)

    # Verify
    with DATA.open() as f:
        verify = json.load(f)
    article_entries = [e for e in verify if e.get("pos") == "article"]
    print(f"\nVerification: {len(verify)} entries, {len(article_entries)} articles")
    print("All article entries:")
    for e in sorted(article_entries, key=lambda x: x.get("rank") or 0):
        print(f"  rank {e['rank']:>3} {e['lemma']:>4} ({e.get('gender') or '-'}): '{e['translation_en']}'")


if __name__ == "__main__":
    main()
