"""Editorial bracket cleanup per Architecture_Vocab_editorial_bracket_cleanup v1.

Three things, single atomic pass:

1. Remove voi at rank 506 (corrupted duplicate with editorial leak inside its
   translation_en). The clean voi pronoun at rank 202 covers the lemma.

2. Migrate the 47 verb entries carrying [with X] / [with X 'meaning'] usage
   hints into a new structured `usage_notes` array field. Strip the bracket
   content from translation_en. Architect's preferred shape:
       {"applies_to_sense": "to escape, to break out",
        "preposition": "da",
        "preposition_meaning": "from somewhere"}

3. Handle the 3 [auxiliary avere] entries via the free-form `text` field
   the architect explicitly allowed for notes that don't fit the preposition
   shape:
       {"applies_to_sense": "to act", "text": "auxiliary: avere"}

4. Strip the [person] sense qualifier on imputato r6372. The qualifier was
   redundant (English "accused" already implies a person in legal context).

Run from project root:
    python3 tools/vocab_chat/migrate_bracket_usage_notes.py
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

PATCH_MARKER = "[bracket-migration-v2]"

# Curly-quote-tolerant: handle 'with X ‘sense’' and 'with X "sense"' both.
# Capture group 1: preposition (one or more space-separated tokens like "a", "con",
# "di or da"). Capture group 2 (optional): the meaning gloss inside ‘…’ or '…' or "…".
WITH_RE = re.compile(
    r"\[with\s+([^\]'‘\"‘]+?)(?:\s*[‘'\"‘]([^’'\"’]+)[’'\"’])?\]",
    re.IGNORECASE,
)

# For the [auxiliary X] cases
AUX_RE = re.compile(r"\[auxiliary\s+(\w+)\]", re.IGNORECASE)

# Catch-all: any [stuff] still in translation_en (used at end to confirm
# everything is stripped)
GENERIC_BRACKET_RE = re.compile(r"\[[^\]]*\]")


def split_senses(text: str):
    """Yield (sense_chunk, separator_used_after) for each comma/semicolon-separated
    chunk in `text`. The final chunk has separator "" (empty)."""
    parts = re.split(r"(\s*[,;]\s*)", text)
    chunks = []
    for i in range(0, len(parts), 2):
        sense = parts[i]
        sep = parts[i + 1] if i + 1 < len(parts) else ""
        if sense or sep:
            chunks.append((sense, sep))
    return chunks


def parse_with_brackets(text: str):
    """Return (cleaned_translation_en, usage_notes_list)."""
    # Strategy: walk through the comma/semicolon-separated chunks, accumulating
    # "since last bracket". When a chunk contains a [with ...] bracket, that
    # bracket fires a usage_note whose applies_to_sense is the accumulated
    # senses (including the current chunk's sense text minus the bracket).
    chunks = split_senses(text)
    cleaned_parts = []        # the cleaned chunks (no brackets) in order
    notes = []
    accumulator_sense = []    # accumulating senses since the last note
    accumulator_clean_parts = []  # accumulating cleaned chunks since the last note

    for sense, sep in chunks:
        m = WITH_RE.search(sense)
        if m:
            # Strip the [with ...] bracket from this chunk's text
            cleaned_sense = WITH_RE.sub("", sense).strip()
            # Add this cleaned sense to accumulators
            if cleaned_sense:
                accumulator_sense.append(cleaned_sense)
                accumulator_clean_parts.append(cleaned_sense + sep.rstrip().rstrip(",;").rstrip())
            # Fire a usage_note
            note = {
                "applies_to_sense": ", ".join(accumulator_sense),
                "preposition": m.group(1).strip(),
            }
            if m.group(2):
                note["preposition_meaning"] = m.group(2).strip()
            notes.append(note)
            # Add the cleaned sense to the final cleaned text
            if cleaned_sense:
                cleaned_parts.append(cleaned_sense)
                cleaned_parts.append(sep)
            else:
                # If the chunk was just the bracket, the separator may still be there but
                # we drop the redundant separator
                pass
            # Reset accumulator after the note fires
            accumulator_sense = []
            accumulator_clean_parts = []
        else:
            cleaned_sense = sense.strip()
            if cleaned_sense:
                accumulator_sense.append(cleaned_sense)
            cleaned_parts.append(sense)
            cleaned_parts.append(sep)

    cleaned = "".join(cleaned_parts).strip()
    # Collapse repeated commas/semicolons that may have been left by bracket-removal
    cleaned = re.sub(r"\s*,\s*,", ",", cleaned)
    cleaned = re.sub(r"\s*;\s*;", ";", cleaned)
    cleaned = re.sub(r"\s*,\s*$", "", cleaned)
    cleaned = re.sub(r"\s*;\s*$", "", cleaned)
    cleaned = re.sub(r"^\s*[,;]\s*", "", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned, notes


def parse_auxiliary_brackets(text: str):
    """Return (cleaned_translation_en, usage_notes_list) for [auxiliary X] cases."""
    chunks = split_senses(text)
    cleaned_parts = []
    notes = []
    accumulator_sense = []
    for sense, sep in chunks:
        m = AUX_RE.search(sense)
        if m:
            cleaned_sense = AUX_RE.sub("", sense).strip()
            if cleaned_sense:
                accumulator_sense.append(cleaned_sense)
            notes.append({
                "applies_to_sense": ", ".join(accumulator_sense),
                "text": f"auxiliary: {m.group(1).strip()}",
            })
            if cleaned_sense:
                cleaned_parts.append(cleaned_sense)
                cleaned_parts.append(sep)
            accumulator_sense = []
        else:
            cleaned_sense = sense.strip()
            if cleaned_sense:
                accumulator_sense.append(cleaned_sense)
            cleaned_parts.append(sense)
            cleaned_parts.append(sep)
    cleaned = "".join(cleaned_parts).strip()
    cleaned = re.sub(r"\s*,\s*,", ",", cleaned)
    cleaned = re.sub(r"\s*,\s*$", "", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned, notes


def main():
    print(f"Loading {DATA}")
    with DATA.open() as f:
        entries = json.load(f)
    print(f"  {len(entries)} entries loaded")

    # 1. Remove voi at rank 506
    before = len(entries)
    entries = [
        e for e in entries
        if not (e.get("lemma") == "voi" and e.get("rank") == 506)
    ]
    deleted_voi = before - len(entries)
    print(f"\n1. voi r506 removal: deleted {deleted_voi} entry/entries")

    # 2. Migrate [with X] entries
    print("\n2. [with X] migration")
    with_x_migrated = 0
    failed_parses = []
    for e in entries:
        t = e.get("translation_en")
        if not t or t == "[skip]":
            continue
        if not WITH_RE.search(t):
            continue
        old = t
        cleaned, notes = parse_with_brackets(t)
        # Sanity: if cleaned still has bracketed text matching [with X], parse failed
        if WITH_RE.search(cleaned):
            failed_parses.append((e.get("rank"), e.get("lemma"), old, cleaned))
            continue
        e["translation_en"] = cleaned
        e["usage_notes"] = notes
        existing_notes = (e.get("notes") or "").strip()
        patch_note = f"{PATCH_MARKER} stripped [with X] brackets from translation_en; {len(notes)} usage_notes added"
        e["notes"] = (existing_notes + " — " + patch_note) if existing_notes else patch_note
        with_x_migrated += 1
    print(f"  Migrated: {with_x_migrated}")
    if failed_parses:
        print(f"  Failed to parse: {len(failed_parses)}")
        for r, l, old, new in failed_parses[:5]:
            print(f"    r{r} {l}: still has [with X] after parse")

    # 3. Migrate [auxiliary X] entries
    print("\n3. [auxiliary X] migration")
    aux_migrated = 0
    for e in entries:
        t = e.get("translation_en")
        if not t or t == "[skip]":
            continue
        if not AUX_RE.search(t):
            continue
        old = t
        cleaned, notes = parse_auxiliary_brackets(t)
        e["translation_en"] = cleaned
        # Append to existing usage_notes if present, else set new
        existing_usage = e.get("usage_notes") or []
        e["usage_notes"] = existing_usage + notes
        existing_notes = (e.get("notes") or "").strip()
        patch_note = f"{PATCH_MARKER} stripped [auxiliary X] from translation_en; {len(notes)} free-form usage_notes added"
        e["notes"] = (existing_notes + " — " + patch_note) if existing_notes else patch_note
        aux_migrated += 1
    print(f"  Migrated: {aux_migrated}")

    # 4. Strip [person] from imputato r6372
    print("\n4. imputato r6372 [person] cleanup")
    imputato_patched = False
    for e in entries:
        if e.get("lemma") == "imputato" and e.get("rank") == 6372 and e.get("pos") == "noun":
            old = e["translation_en"]
            new = re.sub(r"\s*\[person\]\s*", "", old).strip()
            new = re.sub(r"\s*,\s*,", ",", new)
            e["translation_en"] = new
            existing_notes = (e.get("notes") or "").strip()
            patch_note = f"{PATCH_MARKER} stripped redundant [person] sense qualifier; English 'accused' already implies a person in legal context"
            e["notes"] = (existing_notes + " — " + patch_note) if existing_notes else patch_note
            print(f"  '{old}' → '{new}'")
            imputato_patched = True
            break

    # Final audit: any remaining brackets in non-skip translation_en?
    print("\n5. Residual bracket audit")
    residual = []
    for e in entries:
        t = e.get("translation_en")
        if not t or t == "[skip]":
            continue
        if GENERIC_BRACKET_RE.search(t):
            residual.append(e)
    print(f"  Entries with residual brackets in translation_en: {len(residual)}")
    for e in residual[:20]:
        print(f"    r{e.get('rank')} {e.get('lemma')} ({e.get('pos')}): '{e['translation_en'][:80]}'")

    print(f"\nWriting back to {DATA}")
    atomic_write_json(DATA, entries)

    # Verify
    with DATA.open() as f:
        verify = json.load(f)
    print(f"\nVerification:")
    print(f"  Final entry count: {len(verify)}")
    has_usage_notes = sum(1 for e in verify if e.get("usage_notes"))
    print(f"  Entries with usage_notes field set: {has_usage_notes}")
    voi_remaining = [e for e in verify if e.get("lemma") == "voi"]
    for e in voi_remaining:
        print(f"  voi remaining: r{e.get('rank')} ({e.get('pos')}): '{e.get('translation_en')}'")

    # Show 3 sample migrations
    print("\n  Sample migrated entries:")
    for rank in [4405, 6165, 6571]:
        for e in verify:
            if e.get("rank") == rank:
                print(f"    r{rank} {e.get('lemma')}: '{e['translation_en']}'")
                for note in (e.get("usage_notes") or []):
                    print(f"      usage_note: {note}")
                break


if __name__ == "__main__":
    main()
