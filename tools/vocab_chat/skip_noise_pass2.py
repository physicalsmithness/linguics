"""Second skip-marking pass. Catches obvious English 3-4 character noise in the
high-traffic zone that the first pass left behind. Uses a hand-curated list
of clear English words that aren't Italian lemmas.

Conservative: anything that could plausibly be an Italian word OR an
Italian-as-abbreviation stays. Only certain English leaks get marked.

Run after `skip_noise.py`.

    python3 tools/vocab_chat/skip_noise_pass2.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from collections import Counter

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from atomic_io import atomic_write_json  # noqa: E402

DATA = PROJECT_ROOT / "data" / "vocabulary_it_frequency.json"

# Curated list. Each word here:
#   - is NOT an Italian lemma in any sense
#   - is a common English / loan / abbreviation that leaked into the corpus
# Italian-looking candidates are excluded even if they look like noise (e.g.
# "puo", "gia", "giu", "cio" — these are Italian forms missing diacritics and
# might be recoverable. We leave them for a future POS-correction pass.)

ENGLISH_NOISE = {
    # 3-letter clear English
    "top", "art", "doc", "big", "end", "mix", "off", "out", "day", "way",
    "fix", "tax", "sum", "own", "fun", "fan", "joy", "ego", "era", "log",
    "sat", "ate", "one", "two", "ten", "six", "may", "men", "yet", "lot",
    "got", "ago", "had", "let", "set", "use", "hot", "cup", "cut", "guy",
    "pop", "pub", "boy", "kid", "car", "bag", "bus", "bar", "bed", "bad",
    "old", "raw", "red", "sad", "saw", "seen", "see", "ten", "her", "him",
    "his", "she", "they", "them", "win", "won", "yes", "yep", "yup",
    "bla", "wow", "sms", "com", "max", "min",
    "los", "las", "les", "von", "der", "des",
    "sky", "eye", "ear", "leg", "arm", "feet", "lab",
    # Months / days abbreviations in English (Italian uses different)
    "jan", "feb", "apr", "jul", "aug", "sep", "oct", "nov", "dec",
    "mon", "tue", "wed", "thu", "fri", "sat", "sun",
    # 4-letter clear English
    "band", "news", "sexy", "hard", "game", "look", "open", "park", "blue",
    "over", "miss", "back", "road", "card", "nick", "core", "song", "week",
    "love", "home", "lake", "town", "girl", "boys", "kids", "lady", "wife",
    "rock", "cool", "hope", "talk", "walk", "wait", "free", "wild",
    "next", "last", "best", "good", "fast", "long", "real", "high", "deep",
    "true", "full", "main", "hour", "edge", "fact", "list", "name", "race",
    "wave", "snow", "wind", "fire", "tree", "shop", "cake",
    "drug", "milk", "wine", "tea",
    "rich", "poor", "tall", "thin", "fine", "kind", "nice", "soft",
    "live", "play", "read", "stop", "send", "show", "make", "take", "kept",
    "team", "club", "shop", "test", "work", "data", "file", "info", "user",
    "cool", "neat", "huge", "tiny", "rare", "vast",
    "into", "onto", "than", "when", "what", "with", "from", "this",
    "that", "your", "ours", "their", "mine",
    "alex", "anna", "luca", "anne", "john", "mark", "paul", "sara",  # proper-noun residue
    # Loanwords/codes that aren't really Italian lemmas
    "tag", "tax", "url", "pdf", "xml", "css", "iso", "csv", "fps", "ftp",
    "gif", "jpg", "png", "ogg", "mp3", "wav", "rtf",
    "xxx", "yyy", "zzz", "asd",
    "etc",  # already as ecc. in Italian
}

ITALIAN_PRESERVE = {
    # Things that LOOK like they could be noise but might be real Italian
    # (we deliberately do NOT skip these):
    "gia", "giu", "puo", "cio", "che", "perche",  # diacritic-missing forms — recoverable
    "ehm", "ehi", "uhm",  # Italian interjections
    "essi", "esse", "ella", "egli", "lui", "lei",  # pronouns
    "sino", "fino", "verso",  # prepositions
    "mare", "sole", "luna", "fuoco",  # real nouns possibly mis-POSed
    "sara", "fece", "ebbi",  # conjugated verbs — should be lemmatised
    "nono", "ottavo", "settimo",  # ordinals
    "iva", "isa", "ace",  # could be acronyms or real
    "max", "min", "med",  # could be Italian abbreviations
}


def main():
    print(f"Loading {DATA}")
    with DATA.open() as f:
        entries = json.load(f)
    print(f"  {len(entries)} entries loaded")

    untranslated = [e for e in entries if not e.get("translation_en")]
    print(f"Untranslated entries entering pass 2: {len(untranslated)}")

    skipped = []
    for e in untranslated:
        lemma = (e.get("lemma") or "").strip().lower()
        if not lemma:
            continue
        if lemma in ITALIAN_PRESERVE:
            continue
        if lemma in ENGLISH_NOISE:
            e["translation_en"] = "[skip]"
            e["translation_source"] = "corpus_artefact"
            existing_notes = (e.get("notes") or "").strip()
            patch_note = f"[skip-noise] English/loanword leak: '{lemma}'"
            e["notes"] = (existing_notes + " — " + patch_note) if existing_notes else patch_note
            skipped.append(e)

    print(f"\nPass 2 skipped: {len(skipped)}")
    by_rank_band = Counter()
    for e in skipped:
        r = e.get("rank") or 99999
        if r <= 2000:
            by_rank_band["1-2000"] += 1
        elif r <= 5000:
            by_rank_band["2001-5000"] += 1
        elif r <= 8000:
            by_rank_band["5001-8000"] += 1
        else:
            by_rank_band["8001+"] += 1
    for b in ["1-2000", "2001-5000", "5001-8000", "8001+"]:
        print(f"  {b}: {by_rank_band.get(b, 0)}")

    print("\nFirst 20 by rank:")
    for e in sorted(skipped, key=lambda x: x.get("rank") or 99999)[:20]:
        print(f"  r{e['rank']:>5} '{e['lemma']}' ({e['pos']})")

    print(f"\nWriting back to {DATA}")
    atomic_write_json(DATA, entries)

    with DATA.open() as f:
        verify = json.load(f)
    after_untranslated = sum(1 for e in verify if not e.get("translation_en"))
    after_skipped = sum(1 for e in verify if e.get("translation_en") == "[skip]")
    print(f"\nVerification: untranslated now {after_untranslated}; [skip] total {after_skipped}")


if __name__ == "__main__":
    main()
