#!/usr/bin/env python3
"""Entry point for the Italian stress + syllable pipeline. [created by Antigravity]

Usage:
    python tools/stress_pipeline/run_pipeline.py [--skip-download] [--validate-only]

Steps:
    1. Check for lexicon data (prompt to run prepare_lexicon_data.py if missing)
    2. Run tiered stress pipeline on all vocabulary entries
    3. Build wordform stress layer
    4. Validate against seed (58 entries)
    5. Generate coverage/confidence report
"""

import argparse
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
LEXICON_DIR = os.path.join(SCRIPT_DIR, "lexicon_data")
DATA_DIR = os.path.join(PROJECT_ROOT, "data")

# Ensure imports work
sys.path.insert(0, SCRIPT_DIR)


def check_lexicon_data() -> bool:
    """Check if lexicon data files exist."""
    wikt = os.path.join(LEXICON_DIR, "wiktionary_stress.json")
    morphit = os.path.join(LEXICON_DIR, "morphit_forms.json")

    has_wikt = os.path.exists(wikt)
    has_morphit = os.path.exists(morphit)

    if not has_wikt:
        print("  [!] Wiktionary stress data not found.")
        print("    Tier 4 (lexicon lookup) will be disabled.")
        print("    Run: python tools/stress_pipeline/prepare_lexicon_data.py")
    else:
        print("  [OK] Wiktionary stress data found.")

    if not has_morphit:
        print("  [!] Morph-it! data not found.")
        print("    Run: python tools/stress_pipeline/prepare_lexicon_data.py")
    else:
        print("  [OK] Morph-it! data found.")

    ere = os.path.join(LEXICON_DIR, "ere_verbs.json")
    if os.path.exists(ere):
        print("  [OK] -ere verb classification found.")

    return has_wikt  # Pipeline can run without, but with reduced coverage


def main():
    parser = argparse.ArgumentParser(
        description="Italian stress + syllable pipeline [created by Antigravity]"
    )
    parser.add_argument("--skip-download", action="store_true",
                        help="Skip lexicon data check")
    parser.add_argument("--validate-only", action="store_true",
                        help="Only run seed validation")
    parser.add_argument("--report-only", action="store_true",
                        help="Only generate coverage report")
    args = parser.parse_args()

    print("=" * 70)
    print("Italian Stress + Syllable Pipeline")
    print("[created by Antigravity]")
    print("=" * 70)

    # Step 0: Validate-only mode
    if args.validate_only:
        print("\n[Step] Seed validation only...")
        from validate_seed import validate_seed
        result = validate_seed()
        sys.exit(0 if result["failed"] == 0 and result["missing"] == 0 else 1)

    # Step 0b: Report-only mode
    if args.report_only:
        print("\n[Step] Report generation only...")
        from generate_report import generate_report
        generate_report()
        sys.exit(0)

    # Step 1: Check lexicon data
    if not args.skip_download:
        print("\n[Step 1] Checking lexicon data...")
        has_lexicon = check_lexicon_data()
        if not has_lexicon:
            print("\n  Pipeline will run with tiers 1-3 + 5 only.")
            print("  For full coverage, run prepare_lexicon_data.py first.")
            print("  Continuing...\n")

    # Step 2: Run tiered stress pipeline
    print("\n[Step 2] Running tiered stress pipeline on vocabulary...")
    from stress_pipeline import process_vocabulary
    stats = process_vocabulary()

    # Step 3: Build wordform layer
    print("\n[Step 3] Building wordform stress layer...")
    from wordform_stress import build_wordform_sidecar
    wf_stats = build_wordform_sidecar()

    # Step 4: Validate against seed
    print("\n[Step 4] Validating against seed...")
    from validate_seed import validate_seed
    val_result = validate_seed()

    # Step 5: Generate report
    print("\n[Step 5] Generating coverage report...")
    from generate_report import generate_report
    generate_report()

    # Final summary
    print(f"\n{'=' * 70}")
    print("PIPELINE COMPLETE")
    print(f"{'=' * 70}")
    print(f"  Lemma sidecar:    {DATA_DIR}/stress_sidecar_lemma.json")
    print(f"  Wordform sidecar: {DATA_DIR}/stress_sidecar_wordform.json")
    print(f"  Coverage report:  {PROJECT_ROOT}/outputs/stress_coverage_report.md")
    print(f"  Seed validation:  {val_result['passed']}/{val_result['total']}")

    if val_result["failed"] > 0 or val_result["missing"] > 0:
        print(f"\n  [!] Seed validation has failures. Review output above.")
        sys.exit(1)
    else:
        print(f"\n  [OK] All checks passed.")


if __name__ == "__main__":
    main()
