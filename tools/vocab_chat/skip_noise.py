"""Mark obvious tokenisation noise in the untranslated tail as [skip], so the
marker's entry-selection contract (translation_en non-null AND non-[skip]) cleanly
filters them out.

Only entries that are CURRENTLY untranslated (translation_en is null AND
translation_source is null) are candidates. We don't touch entries that have
real translations.

Tiered heuristics, from most to least confident:

  T1. Lemma is exactly 1 character — no real Italian word is single-letter.
  T2. Lemma is exactly 2 characters — real Italian function words at these
      lengths (da, di, in, su, tu, lo, la, le, gli, mi, ti, si, ci, vi, ne,
      ma, se, sì, no, e, è) all sit at low ranks and HAVE translations. If a
      2-char form is in the untranslated tail, it's noise (English leak,
      POS-tagger artefact, unit abbreviation, dialectal/apocopated form).
  T3. Lemma contains any digit — Italian lemmas don't carry digits.
  T4. Lemma starts with an uppercase ASCII letter (proper noun) — should
      have been caught earlier but if it lingers untranslated, it's noise.
  T5. Lemma matches a common English function-word or pronoun (manual list).
  T6. Lemma is a common unit abbreviation (km, kw, ml, cm, mq, etc.).

Each skipped entry gets translation_en = "[skip]", translation_source =
"corpus_artefact", and a notes patch `[skip-noise]` with the reason.

Run from project root:
    python3 tools/vocab_chat/skip_noise.py
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from collections import Counter

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from atomic_io import atomic_write_json  # noqa: E402

DATA = PROJECT_ROOT / "data" / "vocabulary_it_frequency.json"

# T5: English-only words that leak into Italian corpora
ENGLISH_LEAKS = {
    "the", "of", "and", "or", "to", "in", "is", "it", "be", "by",
    "at", "an", "as", "we", "he", "us", "my", "if", "on", "up",
    "am", "do", "go", "no", "so", "you", "your", "are", "was",
    "had", "has", "have", "what", "when", "where", "why", "how",
    "who", "can", "will", "would", "could", "should", "all",
    "that", "this", "these", "those", "with", "from", "for",
    "but", "not", "now", "then", "than", "i", "me",
    # interjections / fillers that the corpus picked up in Italian text
    "uh", "eh", "ah", "oh", "hi", "hey", "hello", "yes", "ok", "okay",
    # noun forms common in English source
    "ms", "mr", "mrs", "dr", "jr", "sr",
    # contractions / common forms
    "i'm", "it's", "we're", "you're", "they're", "i've", "we've",
    # other
    "new", "old", "good", "bad", "ya", "yo",
}

# T6: Unit abbreviations and common scientific/technical codes
UNIT_ABBREVS = {
    "km", "kw", "kg", "kb", "mb", "gb", "tb", "mhz", "ghz",
    "mm", "cm", "dm", "lm", "qm", "mq", "kmq", "cmq", "mmq",
    "ml", "dl", "cl", "kl", "hl",
    "mg", "mc", "mc3", "ng",
    "hr", "hp", "rpm", "fps", "bpm",
    "mp", "kp", "mp3", "mp4", "kbps", "mbps",
    "co2", "h2o", "h2so4",
    "tv", "dvd", "cd", "usb", "pdf", "html", "css", "url",
    # date/time abbrevs
    "am", "pm",
    # car/road codes
    "suv", "rpm",
    # POS-tag-residue patterns (random letter pairs)
    "ll", "ii", "vv", "ss", "mm", "nn", "xx", "yy", "zz", "ww",
    "aa", "bb", "cc", "dd", "ee", "ff", "gg", "hh", "jj", "kk",
    "pp", "qq", "rr", "tt", "uu",
}

DIGIT_RE = re.compile(r"\d")
NON_ALPHA_RE = re.compile(r"[^a-zA-ZÀ-ſ'’]")


def classify(lemma: str | None) -> tuple[bool, str | None]:
    """Return (skip?, reason)."""
    if not lemma:
        return False, None
    L = lemma.strip()
    if not L:
        return False, None

    # T1
    if len(L) == 1:
        return True, "single-character lemma"

    # T3
    if DIGIT_RE.search(L):
        return True, "lemma contains digit"

    # Pure punctuation-only would have caught here but unlikely

    # T2
    if len(L) == 2 and "'" not in L and "’" not in L:
        # Two ASCII characters, no apostrophe -> noise (real Italian two-char
        # words are all at low ranks with translations)
        return True, "two-character lemma in untranslated tail"

    # T5
    if L.lower() in ENGLISH_LEAKS:
        return True, f"English function-word leak: '{L}'"

    # T6
    if L.lower() in UNIT_ABBREVS:
        return True, f"unit / technical abbreviation: '{L}'"

    # T4: lemma starts with uppercase ASCII letter (proper noun residue)
    if L[0].isupper() and L[0].isascii():
        return True, "starts with uppercase ASCII (proper-noun residue)"

    return False, None


def main():
    print(f"Loading {DATA}")
    with DATA.open() as f:
        entries = json.load(f)
    print(f"  {len(entries)} entries loaded")

    # Candidate set: entries with no translation
    untranslated = [e for e in entries if not e.get("translation_en")]
    print(f"Untranslated entries: {len(untranslated)}")

    skipped = []
    reason_counts = Counter()
    for e in untranslated:
        skip, reason = classify(e.get("lemma"))
        if skip:
            e["translation_en"] = "[skip]"
            e["translation_source"] = "corpus_artefact"
            existing_notes = (e.get("notes") or "").strip()
            patch_note = f"[skip-noise] {reason}"
            e["notes"] = (existing_notes + " — " + patch_note) if existing_notes else patch_note
            skipped.append(e)
            # bucket the reason coarsely for reporting
            if reason.startswith("single-"):
                reason_counts["T1: single-character"] += 1
            elif reason.startswith("lemma contains digit"):
                reason_counts["T3: contains digit"] += 1
            elif reason.startswith("two-character"):
                reason_counts["T2: two-character"] += 1
            elif reason.startswith("English"):
                reason_counts["T5: English leak"] += 1
            elif reason.startswith("unit"):
                reason_counts["T6: unit abbreviation"] += 1
            elif reason.startswith("starts with uppercase"):
                reason_counts["T4: uppercase start"] += 1
            else:
                reason_counts["other"] += 1

    print(f"\nSkipped: {len(skipped)} entries")
    print("By heuristic:")
    for k, v in sorted(reason_counts.items()):
        print(f"  {k}: {v}")

    # Show a few samples
    print("\nFirst 15 by rank (highest-traffic noise eliminated):")
    for e in sorted(skipped, key=lambda x: x.get("rank") or 99999)[:15]:
        print(f"  r{e['rank']:>5} '{e['lemma']}' ({e['pos']}): {e['notes'][-80:]}")

    print(f"\nWriting back to {DATA}")
    atomic_write_json(DATA, entries)

    # Verify
    with DATA.open() as f:
        verify = json.load(f)
    after_untranslated = sum(1 for e in verify if not e.get("translation_en"))
    after_skipped = sum(1 for e in verify if e.get("translation_en") == "[skip]")
    print(f"\nVerification: untranslated now {after_untranslated} (was {len(untranslated)}); [skip] total {after_skipped}")


if __name__ == "__main__":
    main()
