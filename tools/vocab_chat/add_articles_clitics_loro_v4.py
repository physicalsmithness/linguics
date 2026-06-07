"""Apply the marker_semantics v4 + other_open_questions v3 architect rulings.

1. Add un' (elided f-sg indefinite article before vowel).
2. Add the 4 missing clitic-pronoun entries (la, gli, le-sg-indirect, le-pl-direct).
3. Split loro into pronoun + determiner per the (determiner)/(pronoun) convention.
4. Extend the unique key to (lemma, pos, gender, number) — number added only where
   needed for disambiguation. Currently that's just the two le pronoun entries.

Run from project root:
    python3 tools/vocab_chat/add_articles_clitics_loro_v4.py
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
    # un' — elided feminine indefinite article before vowel
    {
        "rank": 25,
        "lemma": "un'",
        "pos": "article",
        "translation_en": "a, an (f sg, before vowel)",
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
        "notes": "[elided-article-gap-fill] feminine singular indefinite article before vowels; allomorph of una; complements un (m sg), uno (m sg before s-impura), una (f sg before consonant); not in lemma CSV because tokenisers strip the apostrophe upstream",
        "translation_source": "vocab_chat",
    },

    # la (pronoun, f, sg) — direct-object clitic
    {
        "rank": 26,
        "lemma": "la",
        "pos": "pronoun",
        "translation_en": "her, it (direct object, f)",
        "themes": ["function_word", "pronoun_personal"],
        "band": "vocabulary.it.freq_1_100",
        "gender": "f",
        "plural": None,
        "auxiliary": None,
        "conjugation_class": None,
        "adj_class": None,
        "noun_class": None,
        "equivalence_class": None,
        "gloss_en": None,
        "notes": "[clitic-pronoun-gap-fill] feminine singular direct-object clitic; collides with la (article); architect's marker_semantics v4 ruling 1",
        "translation_source": "vocab_chat",
    },

    # gli (pronoun, m) — indirect-object clitic
    {
        "rank": 27,
        "lemma": "gli",
        "pos": "pronoun",
        "translation_en": "to him, to them (indirect object, m; or m+f mixed group)",
        "themes": ["function_word", "pronoun_personal"],
        "band": "vocabulary.it.freq_1_100",
        "gender": "m",
        "plural": None,
        "auxiliary": None,
        "conjugation_class": None,
        "adj_class": None,
        "noun_class": None,
        "equivalence_class": None,
        "gloss_en": None,
        "notes": "[clitic-pronoun-gap-fill] masculine indirect-object clitic, also used for mixed-gender groups; collides with gli (article); architect's marker_semantics v4 ruling 1",
        "translation_source": "vocab_chat",
    },

    # le (pronoun, f, sg) — indirect-object clitic "to her"
    {
        "rank": 28,
        "lemma": "le",
        "pos": "pronoun",
        "translation_en": "to her (indirect object, f sg)",
        "themes": ["function_word", "pronoun_personal"],
        "band": "vocabulary.it.freq_1_100",
        "gender": "f",
        "number": "sg",                     # NEW: number is part of the unique key per v4 ruling 2
        "plural": None,
        "auxiliary": None,
        "conjugation_class": None,
        "adj_class": None,
        "noun_class": None,
        "equivalence_class": None,
        "gloss_en": None,
        "notes": "[clitic-pronoun-gap-fill] feminine singular indirect-object clitic ('le dico' = I say to her); distinct from le (pronoun, f, pl) which is the feminine-plural direct-object clitic; architect's marker_semantics v4 ruling 1 and 2",
        "translation_source": "vocab_chat",
    },

    # le (pronoun, f, pl) — direct-object clitic "them"
    {
        "rank": 29,
        "lemma": "le",
        "pos": "pronoun",
        "translation_en": "them (direct object, f pl)",
        "themes": ["function_word", "pronoun_personal"],
        "band": "vocabulary.it.freq_1_100",
        "gender": "f",
        "number": "pl",
        "plural": None,
        "auxiliary": None,
        "conjugation_class": None,
        "adj_class": None,
        "noun_class": None,
        "equivalence_class": None,
        "gloss_en": None,
        "notes": "[clitic-pronoun-gap-fill] feminine plural direct-object clitic ('le vedo' = I see them); distinct from le (pronoun, f, sg) which is the feminine-singular indirect-object clitic; architect's marker_semantics v4 ruling 1 and 2",
        "translation_source": "vocab_chat",
    },

    # loro (determiner) — possessive determiner "their"
    {
        "rank": 111,                        # same rank as the existing loro pronoun, per mio/tuo/suo pattern
        "lemma": "loro",
        "pos": "determiner",
        "translation_en": "their (determiner)",
        "themes": ["function_word", "determiner_possessive"],
        "band": "vocabulary.it.freq_101_200",
        "gender": None,
        "plural": None,
        "auxiliary": None,
        "conjugation_class": None,
        "adj_class": None,
        "noun_class": None,
        "equivalence_class": None,
        "gloss_en": None,
        "notes": "[loro-split] possessive determiner split off from the loro pronoun entry per architect's marker_semantics v4 ruling 3; matches the existing mio/tuo/suo/nostro/vostro (determiner)/(pronoun) split pattern",
        "translation_source": "vocab_chat",
    },
]

PATCH_MARKER = "[loro-split]"


def main():
    print(f"Loading {DATA}")
    with DATA.open() as f:
        entries = json.load(f)
    print(f"  {len(entries)} entries loaded")

    # 1. Modify the existing loro (pronoun) entry: trim translation_en, add (pronoun) clarifier.
    loro_pron_patched = False
    for e in entries:
        if e.get("lemma") == "loro" and e.get("pos") == "pronoun" and e.get("rank") == 111:
            old = e.get("translation_en")
            e["translation_en"] = "they, them (pronoun)"
            existing_notes = (e.get("notes") or "").strip()
            patch_note = f"{PATCH_MARKER} translation_en trimmed from '{old}' to 'they, them (pronoun)'; the 'their' (determiner) sense moved to the new loro (determiner) entry per architect's marker_semantics v4 ruling 3"
            e["notes"] = (existing_notes + " — " + patch_note) if existing_notes else patch_note
            loro_pron_patched = True
            print(f"  Patched loro (pronoun) r111: '{old}' → 'they, them (pronoun)'")
            break
    if not loro_pron_patched:
        print("  WARNING: loro (pronoun) r111 not found for patching")

    # 2. Belt-and-braces: confirm none of the NEW_ENTRIES already exist.
    for new in NEW_ENTRIES:
        existing = [
            e for e in entries
            if e.get("lemma") == new["lemma"]
            and e.get("pos") == new["pos"]
            and e.get("gender") == new.get("gender")
            and e.get("number") == new.get("number")
        ]
        if existing:
            print(f"  ABORT: {new['lemma']} ({new['pos']}, g={new.get('gender')}, num={new.get('number')}) already present")
            return

    # 3. Insert each new entry in rank order.
    inserted = 0
    for new in NEW_ENTRIES:
        idx = next(
            (i for i, e in enumerate(entries) if (e.get("rank") or 99999) > new["rank"]),
            len(entries),
        )
        entries.insert(idx, new)
        inserted += 1
        num_str = f", num={new.get('number')}" if new.get('number') else ""
        print(f"  inserted '{new['lemma']}' ({new['pos']}, g={new.get('gender') or '-'}{num_str}) at rank {new['rank']}")

    print(f"\nTotal inserted: {inserted}")
    print(f"Loro pronoun patched: {loro_pron_patched}")
    print(f"New total: {len(entries)}")

    print(f"\nWriting back to {DATA}")
    atomic_write_json(DATA, entries)

    # Verify
    with DATA.open() as f:
        verify = json.load(f)
    print(f"\nVerification: {len(verify)} entries")
    print("\nAll lo/la/gli/le/un'/loro entries now:")
    for lemma in ["un'", "la", "lo", "gli", "le", "i", "il", "loro"]:
        matches = [e for e in verify if e.get("lemma") == lemma]
        for m in sorted(matches, key=lambda x: (x.get("rank") or 99999, x.get("pos") or "")):
            pos = m.get("pos") or ""
            gen = m.get("gender") or "-"
            num = m.get("number") or "-"
            rank = m.get("rank") or 0
            trans = (m.get("translation_en") or "")[:60]
            print(f"  '{lemma}' {pos:11} g={gen:3} num={num:3} r{rank:>4}  '{trans}'")


if __name__ == "__main__":
    main()
