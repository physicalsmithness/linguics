#!/usr/bin/env python3
"""Validate stress pipeline output against the 58-entry seed. [created by Antigravity]

Reads:  incoming drafts/stress_seed_v0.json   (47 lemma + 11 wordform ground truth)
        data/stress_sidecar_lemma.json         (pipeline output)
        data/stress_sidecar_wordform.json      (pipeline output)
Checks: stress_pos, syllables, syllable_count, stress_mechanism,
        stress_mechanism_detail, accent_cue, etymological
"""

import json
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")

SEED_PATH = os.path.join(PROJECT_ROOT, "incoming drafts", "stress_seed_v0.json")
LEMMA_SIDECAR = os.path.join(DATA_DIR, "stress_sidecar_lemma.json")
WORDFORM_SIDECAR = os.path.join(DATA_DIR, "stress_sidecar_wordform.json")

ACCENT_TO_PLAIN = str.maketrans("àèéìòùáíóúâêîôû", "aeeioouiouaeiou")


def _strip_accents(word: str) -> str:
    return word.translate(ACCENT_TO_PLAIN)


def _build_lemma_index(sidecar: list) -> dict:
    """Index lemma sidecar by (lemma_lower, pos) for lookup."""
    idx = {}
    for entry in sidecar:
        key = (_strip_accents(entry["lemma"].lower()), entry.get("pos", ""))
        if key not in idx:
            idx[key] = entry
    return idx


def _build_wordform_index(sidecar: list) -> dict:
    """Index wordform sidecar by (form_stripped, gloss_or_detail)."""
    idx = {}
    for entry in sidecar:
        form = _strip_accents(entry["form"].lower())
        # Use multiple keys for flexible matching
        gloss = entry.get("gloss", "")
        detail = entry.get("stress_mechanism_detail", "")
        idx[(form, gloss)] = entry
        idx[(form, detail)] = entry
        # Also index by (form, stress_pos) for minimal pair matching
        idx[(form, entry.get("stress_pos"))] = entry
    return idx


def check_field(name: str, expected, actual, mismatches: list, form: str):
    """Compare a single field, recording mismatches."""
    if expected != actual:
        mismatches.append(f"  {name}: expected {expected!r}, got {actual!r}")


def validate_seed():
    """Run validation against the full seed set."""
    print("=" * 70)
    print("Seed Validation [created by Antigravity]")
    print("=" * 70)

    # Load seed
    print(f"\nLoading seed from {SEED_PATH}...")
    with open(SEED_PATH, "r", encoding="utf-8") as f:
        seed = json.load(f)

    lemma_seeds = seed.get("lemma_seed", [])
    wordform_seeds = seed.get("wordform_extension", [])
    print(f"  {len(lemma_seeds)} lemma + {len(wordform_seeds)} wordform = "
          f"{len(lemma_seeds) + len(wordform_seeds)} total seed entries.")

    # Load sidecars
    lemma_sidecar = []
    wordform_sidecar = []

    if os.path.exists(LEMMA_SIDECAR):
        print(f"  Loading lemma sidecar...")
        with open(LEMMA_SIDECAR, "r", encoding="utf-8") as f:
            lemma_sidecar = json.load(f)
        print(f"  {len(lemma_sidecar):,} lemma entries.")
    else:
        print(f"  WARNING: Lemma sidecar not found at {LEMMA_SIDECAR}")

    if os.path.exists(WORDFORM_SIDECAR):
        print(f"  Loading wordform sidecar...")
        with open(WORDFORM_SIDECAR, "r", encoding="utf-8") as f:
            wordform_sidecar = json.load(f)
        print(f"  {len(wordform_sidecar):,} wordform entries.")
    else:
        print(f"  WARNING: Wordform sidecar not found at {WORDFORM_SIDECAR}")

    # Build indices
    lemma_idx = _build_lemma_index(lemma_sidecar)
    wordform_idx = _build_wordform_index(wordform_sidecar)

    # Validate
    passed = 0
    failed = 0
    missing = 0
    total = len(lemma_seeds) + len(wordform_seeds)

    # -- Lemma seeds --
    print(f"\n{'-' * 70}")
    print("LEMMA ENTRIES")
    print(f"{'-' * 70}")

    for seed_entry in lemma_seeds:
        form = seed_entry["form"]
        pos = seed_entry.get("pos", "")
        key = (_strip_accents(form.lower()), pos)

        actual = lemma_idx.get(key)
        if actual is None:
            # Try without pos
            for k, v in lemma_idx.items():
                if k[0] == _strip_accents(form.lower()):
                    actual = v
                    break

        if actual is None:
            print(f"  MISSING  {form} ({pos})")
            missing += 1
            continue

        mismatches = []
        check_field("stress_pos", seed_entry["stress_pos"],
                    actual.get("stress_pos"), mismatches, form)
        check_field("syllables", seed_entry["syllables"],
                    actual.get("syllables"), mismatches, form)
        check_field("syllable_count", seed_entry["syllable_count"],
                    actual.get("syllable_count"), mismatches, form)
        check_field("accent_cue", seed_entry["accent_cue"],
                    actual.get("accent_cue"), mismatches, form)
        check_field("etymological", seed_entry["etymological"],
                    actual.get("etymological"), mismatches, form)
        check_field("stress_mechanism", seed_entry["stress_mechanism"],
                    actual.get("stress_mechanism"), mismatches, form)
        check_field("stress_mechanism_detail",
                    seed_entry["stress_mechanism_detail"],
                    actual.get("stress_mechanism_detail"), mismatches, form)

        if mismatches:
            print(f"  FAIL     {form} ({pos})")
            for m in mismatches:
                print(m)
            failed += 1
        else:
            print(f"  PASS     {form} ({pos})")
            passed += 1

    # -- Wordform seeds --
    print(f"\n{'-' * 70}")
    print("WORDFORM ENTRIES")
    print(f"{'-' * 70}")

    for seed_entry in wordform_seeds:
        form = seed_entry["form"]
        gloss = seed_entry.get("gloss", "")
        form_plain = _strip_accents(form.lower())

        # Try multiple matching strategies
        actual = (
            wordform_idx.get((form_plain, gloss)) or
            wordform_idx.get((form_plain, seed_entry.get("stress_mechanism_detail", ""))) or
            wordform_idx.get((form_plain, seed_entry.get("stress_pos")))
        )

        if actual is None:
            print(f"  MISSING  {form} ({gloss})")
            missing += 1
            continue

        mismatches = []
        check_field("stress_pos", seed_entry["stress_pos"],
                    actual.get("stress_pos"), mismatches, form)
        check_field("accent_cue", seed_entry.get("accent_cue", False),
                    actual.get("accent_cue", False), mismatches, form)

        # Syllable check — seed wordforms use accent marks in form, but
        # pipeline syllabifies the plain form. Compare counts at minimum.
        if seed_entry.get("syllable_count") and actual.get("syllable_count"):
            check_field("syllable_count", seed_entry["syllable_count"],
                        actual.get("syllable_count"), mismatches, form)

        if mismatches:
            print(f"  FAIL     {form} ({gloss})")
            for m in mismatches:
                print(m)
            failed += 1
        else:
            print(f"  PASS     {form} ({gloss})")
            passed += 1

    # Summary
    print(f"\n{'=' * 70}")
    print("VALIDATION SUMMARY")
    print(f"{'=' * 70}")
    print(f"  Total seed entries: {total}")
    print(f"  PASS:    {passed}")
    print(f"  FAIL:    {failed}")
    print(f"  MISSING: {missing}")
    print(f"  Result:  {passed}/{total} "
          f"({'OK - ALL PASS' if passed == total else 'FAILURES DETECTED'})")

    return {"total": total, "passed": passed, "failed": failed, "missing": missing}


if __name__ == "__main__":
    result = validate_seed()
    sys.exit(0 if result["failed"] == 0 and result["missing"] == 0 else 1)
