#!/usr/bin/env python3
"""Wordform stress layer — conjugation model for verb paradigm cells. [created by Antigravity]

Generates stress metadata for inflected verb forms using the tier-3 conjugation
model, NOT brute lookup. Also handles stress minimal pairs (àncora/ancóra,
sùbito/subìto, càpitano/capitàno).

The drill's 4th option and every stress shift pair live only at wordform level.
"""

import json
import os
import sys
import re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
LEXICON_DIR = os.path.join(SCRIPT_DIR, "lexicon_data")
DATA_DIR = os.path.join(PROJECT_ROOT, "data")

VOCAB_PATH = os.path.join(DATA_DIR, "vocabulary_it_frequency.json")
LEMMA_SIDECAR_PATH = os.path.join(DATA_DIR, "stress_sidecar_lemma.json")
MORPHIT_FORMS_PATH = os.path.join(LEXICON_DIR, "morphit_forms.json")
# CODEX 2026-07-23: POS/lemma-aware records with verified hyphenation.
WIKT_STRESS_PATH = os.path.join(LEXICON_DIR, "wiktionary_verified.json")
OUTPUT_PATH = os.path.join(DATA_DIR, "stress_sidecar_wordform.json")
SEED_PATH = os.path.join(
    PROJECT_ROOT, "incoming drafts", "stress_seed_v0.json"
)

# CODEX 2026-07-23: correct the inherited ù->o / á->u translation bug.
ACCENT_TO_PLAIN = str.maketrans("àèéìòùáíóúâêîôû", "aeeiouaiouaeiou")


def _strip_accents(word: str) -> str:
    return word.translate(ACCENT_TO_PLAIN)


def _verified_form_record(
    lexicon: dict, form: str, lemma: str
) -> dict | None:
    """Find a non-ambiguous verb form tied to the intended lemma.

    CODEX 2026-07-23: spelling alone cannot disambiguate càpitano from
    capitàno. The form-of relation is mandatory for generated paradigms.
    """
    record = (
        lexicon.get("forms", {})
        .get(form.lower(), {})
        .get("verb", {})
        .get(_strip_accents(lemma.lower()))
    )
    if not record or record.get("ambiguous"):
        return None
    if not record.get("syllables") or not isinstance(record.get("stress_pos"), int):
        return None
    return record


def _morphit_present_3pl_by_lemma(morphit_forms: dict) -> dict[str, list[str]]:
    """Reverse Morph-it! into attested indicative-present-3pl forms."""
    by_lemma: dict[str, set[str]] = {}
    for form, analyses in morphit_forms.items():
        for analysis in analyses:
            features = analysis.get("features", "")
            if not re.match(r"^(VER|AUX|ASP):ind\+pres\+3\+p$", features):
                continue
            lemma = _strip_accents(analysis.get("lemma", "").lower())
            if lemma:
                by_lemma.setdefault(lemma, set()).add(form)
    return {lemma: sorted(forms) for lemma, forms in by_lemma.items()}


def generate_attested_present_3pl(
    lemma: str, morphit_by_lemma: dict[str, list[str]], lexicon: dict
) -> list[dict]:
    """Emit only corpus-attested, pronunciation-verified present 3pl forms."""
    entries: list[dict] = []
    lemma_key = _strip_accents(lemma.lower())
    for form in morphit_by_lemma.get(lemma_key, []):
        record = _verified_form_record(lexicon, form, lemma_key)
        if record is None:
            continue
        entries.append(
            {
                "unit": "wordform",
                "form": form,
                "lemma": lemma_key,
                "gloss": f"present 3pl of {lemma_key}",
                "stress_pos": record["stress_pos"],
                "stress_source": "dictionary",
                "stress_confidence": "high",
                "stress_mechanism": "inflectional",
                "stress_mechanism_detail": "present_3pl",
                "etymological": False,
                "accent_cue": False,
                "stress_tags": [],
                "syllables": record["syllables"],
                "syllable_count": record["syllable_count"],
                "verification_status": "verified_attested_form",
                "syllable_source": "wiktionary_hyphenation",
                "verified_by": "CODEX 2026-07-23",
            }
        )
    return entries


# ---------------------------------------------------------------------------
# Conjugation model: generate paradigm cells with stress
# ---------------------------------------------------------------------------

def _stem_from_infinitive(infinitive: str) -> str:
    """Extract the verb stem from the infinitive."""
    plain = _strip_accents(infinitive.lower())
    for ending in ("arsi", "ersi", "irsi", "are", "ere", "ire"):
        if plain.endswith(ending):
            return plain[:-len(ending)]
    return plain


def _conjugation_class(infinitive: str) -> str | None:
    """Determine conjugation class from infinitive ending."""
    plain = _strip_accents(infinitive.lower())
    if plain.endswith("are") or plain.endswith("arsi"):
        return "are"
    elif plain.endswith("ere") or plain.endswith("ersi"):
        return "ere"
    elif plain.endswith("ire") or plain.endswith("irsi"):
        return "ire"
    return None


def generate_verb_paradigm(lemma: str, lemma_stress: dict,
                           morphit_forms: dict | None = None) -> list[dict]:
    """Generate wordform stress entries for key paradigm cells of a verb.

    Uses the conjugation MODEL: stress position is derived from the paradigm
    cell, not looked up per form.
    """
    entries = []
    stem = _stem_from_infinitive(lemma)
    conj = _conjugation_class(lemma)
    if not conj or not stem:
        return entries

    lemma_stress_pos = lemma_stress.get("stress_pos", 2)

    # ---------------------------------------------------------------
    # Present 3pl: stem-stressed -> sdrucciola or bisdrucciola
    # This is THE source of sdrucciole/bisdrucciole in Italian verbs.
    #
    # The 3pl present stress falls on the same stem vowel as the 1sg.
    # This is NOT derivable from the infinitive stress (which is always
    # piana for -are/-ire). We use: syllabify the 3pl form, then apply
    # a default of sdrucciola (pos 3) for most verbs. Verbs with 2+
    # syllable stems where stress retracts further get bisdrucciola.
    # ---------------------------------------------------------------

    # Known verbs whose 3pl present is bisdrucciola (stress_pos = 4).
    # These have stems with retracted stress in the present tense.
    BISDRUCCIOLA_VERBS = {
        # -are verbs with stem stress on first vowel
        "abitare", "capitare", "comunicare", "desiderare", "fabbricare",
        "indicare", "liberare", "limitare", "meritare", "modificare",
        "navigare", "numerare", "occupare", "operare", "ordinare",
        "organizzare", "partecipare", "praticare", "predicare",
        "pubblicare", "recitare", "separare", "significare",
        "telefonare", "terminare", "tollerare", "verificare",
        "visitare", "abitare",
        # -ere verbs with stem stress retracted
        "considerare", "determinare", "diminuire", "eliminare",
        "esaminare", "facilitare", "generare", "identificare",
        "immaginare", "interpretare",
    }

    if conj == "are":
        form_3pl = stem + "ano"
    elif conj == "ere":
        form_3pl = stem + "ono"
    elif conj == "ire":
        form_3pl = stem + "ono"  # or -iscono for incoativi, simplified
    else:
        form_3pl = None

    if form_3pl:
        plain_lemma = _strip_accents(lemma.lower())
        # Check known bisdrucciola list
        if plain_lemma in BISDRUCCIOLA_VERBS:
            wf_stress_pos = 4
        else:
            wf_stress_pos = 3  # Default: sdrucciola

        entries.append({
            "unit": "wordform",
            "form": form_3pl,
            "lemma": plain_lemma,
            "gloss": f"present 3pl of {plain_lemma}",
            "stress_pos": wf_stress_pos,
            "stress_source": "derived",
            "stress_confidence": "high",
            "stress_mechanism": "inflectional",
            "stress_mechanism_detail": "present_3pl",
            "etymological": False,
            "accent_cue": False,
            "stress_tags": [],
        })

    # ---------------------------------------------------------------
    # Passato remoto 3sg: always -ò → tronca
    # ---------------------------------------------------------------
    if conj == "are":
        form_rem3 = stem + "ò"
    elif conj == "ere":
        # Regular: -é (temé), but many are irregular (prese, scrisse)
        # Only generate for regular -ere
        form_rem3 = stem + "é"  # or stem + "ette" for some
    elif conj == "ire":
        form_rem3 = stem + "ì"  # dormì
    else:
        form_rem3 = None

    if form_rem3 and conj in ("are", "ire"):
        # These are reliably tronca
        entries.append({
            "unit": "wordform",
            "form": form_rem3,
            "lemma": _strip_accents(lemma.lower()),
            "gloss": f"passato remoto 3sg of {_strip_accents(lemma.lower())}",
            "stress_pos": 1,
            "stress_source": "orthographic_mark",
            "stress_confidence": "high",
            "stress_mechanism": "orthographic",
            "stress_mechanism_detail": "accent_final",
            "etymological": False,
            "accent_cue": True,
            "stress_tags": ["inflectional:remoto_3sg"],
        })

    return entries


# ---------------------------------------------------------------------------
# Stress minimal pairs
# ---------------------------------------------------------------------------

# Known minimal pairs where the same spelling has different stress positions.
# These are the drill's most teachable items.
MINIMAL_PAIRS = [
    {
        "form": "ancora",
        "readings": [
            {"gloss": "anchor (noun)", "stress_pos": 3, "mechanism": "lexical",
             "detail": "lexical_simple", "tags": []},
            {"gloss": "again/still (adverb)", "stress_pos": 2, "mechanism": "lexical",
             "detail": "function_word", "tags": []},
        ],
    },
    {
        "form": "subito",
        "readings": [
            {"gloss": "immediately (adverb)", "stress_pos": 3, "mechanism": "lexical",
             "detail": "lexical_simple", "tags": []},
            {"gloss": "suffered (past participle of subire)", "stress_pos": 2,
             "mechanism": "inflectional", "detail": "participle", "tags": []},
        ],
    },
    {
        "form": "capitano",
        "readings": [
            {"gloss": "they happen (verb 3pl of capitare)", "stress_pos": 4,
             "mechanism": "inflectional", "detail": "present_3pl", "tags": []},
            {"gloss": "captain (noun)", "stress_pos": 2, "mechanism": "lexical",
             "detail": "lexical_simple", "tags": []},
        ],
    },
    {
        "form": "principi",
        "readings": [
            {"gloss": "princes (noun pl.)", "stress_pos": 3, "mechanism": "lexical",
             "detail": "lexical_simple", "tags": []},
            {"gloss": "principles (noun pl.)", "stress_pos": 2, "mechanism": "lexical",
             "detail": "lexical_simple", "tags": []},
        ],
    },
    {
        "form": "perdono",
        "readings": [
            {"gloss": "forgiveness (noun)", "stress_pos": 2, "mechanism": "lexical",
             "detail": "lexical_simple", "tags": []},
            {"gloss": "they lose (verb 3pl of perdere)", "stress_pos": 3,
             "mechanism": "inflectional", "detail": "present_3pl", "tags": []},
        ],
    },
    {
        "form": "nocciolo",
        "readings": [
            {"gloss": "hazelnut tree (noun)", "stress_pos": 3, "mechanism": "lexical",
             "detail": "lexical_simple", "tags": []},
            {"gloss": "kernel/pit (noun)", "stress_pos": 2, "mechanism": "lexical",
             "detail": "lexical_simple", "tags": []},
        ],
    },
    {
        "form": "metro",
        "readings": [
            {"gloss": "metre (noun)", "stress_pos": 2, "mechanism": "lexical",
             "detail": "lexical_simple", "tags": []},
            {"gloss": "subway/underground (noun)", "stress_pos": 2, "mechanism": "lexical",
             "detail": "lexical_simple", "tags": []},
        ],
    },
    {
        "form": "desideri",
        "readings": [
            {"gloss": "you desire (verb 2sg of desiderare)", "stress_pos": 3,
             "mechanism": "inflectional", "detail": "present_2sg", "tags": []},
            {"gloss": "desires (noun pl.)", "stress_pos": 3, "mechanism": "lexical",
             "detail": "lexical_simple", "tags": []},
        ],
    },
]


def _reading_pos(gloss: str) -> str:
    """Map the hand-authored reading label to a Wiktionary POS."""
    lower = gloss.lower()
    if "adverb" in lower:
        return "adv"
    if "verb" in lower or "participle" in lower or "they " in lower:
        return "verb"
    return "noun"


def _verified_reading_record(
    lexicon: dict, form: str, pos: str, stress_pos: int
) -> dict | None:
    """Select the dictionary variant matching a contextualized reading."""
    record = (
        lexicon.get("entries", {})
        .get(form.lower(), {})
        .get(pos)
    )
    if not record:
        return None
    variants = record.get("variants", []) if record.get("ambiguous") else [record]
    matches = [
        variant
        for variant in variants
        if variant.get("stress_pos") == stress_pos
        and variant.get("syllables")
    ]
    # Multiple identical sources are harmless; differing boundaries are not.
    signatures = {
        tuple(part.lower() for part in variant["syllables"])
        for variant in matches
    }
    if len(signatures) != 1:
        return None
    return matches[0]


def generate_minimal_pairs(lexicon: dict) -> list[dict]:
    """Generate only real, contextualized, dictionary-verified stress pairs.

    CODEX 2026-07-23: bare homographs are impossible questions. ``metro`` and
    ``desideri`` also had no stress contrast at all, so groups whose readings
    share one stress position are discarded.
    """
    entries = []
    for pair in MINIMAL_PAIRS:
        readings = pair["readings"]
        if len({reading["stress_pos"] for reading in readings}) < 2:
            continue
        form = pair["form"]
        pair_entries = []
        for reading in readings:
            pos = _reading_pos(reading["gloss"])
            record = _verified_reading_record(
                lexicon, form, pos, reading["stress_pos"]
            )
            if record is None:
                pair_entries = []
                break
            pair_entries.append({
                "unit": "wordform",
                "form": form,
                "lemma": form,
                "gloss": reading["gloss"],
                "stress_pos": reading["stress_pos"],
                "stress_source": "author+dictionary",
                "stress_confidence": "high",
                "stress_mechanism": reading["mechanism"],
                "stress_mechanism_detail": reading["detail"],
                "etymological": False,
                "accent_cue": False,
                "stress_tags": reading.get("tags", []),
                "syllables": record["syllables"],
                "syllable_count": record["syllable_count"],
                "verification_status": "verified_contextual_reading",
                "syllable_source": "wiktionary_hyphenation",
                "verified_by": "CODEX 2026-07-23",
            })
        # CODEX 2026-07-23: a "minimal pair" with only one verified reading is
        # not a pair and should not enter the drill under that label.
        if len(pair_entries) == len(readings):
            entries.extend(pair_entries)
    return entries


def _bare_drill_form(marked_form: str) -> str:
    """Remove pedagogical internal stress marks, preserving a final accent."""
    plain = _strip_accents(marked_form)
    if marked_form and marked_form[-1] in "àèéìòù":
        return plain[:-1] + marked_form[-1]
    return plain


def generate_seed_backstops(existing_entries: list[dict]) -> list[dict]:
    """Add only seed-verified cells absent from the corpus-backed layers.

    CODEX 2026-07-23: ``author`` is an allowed evidence source in the ratified
    schema. This preserves the hand-checked imperative+clitic and remote seed
    examples without reopening unsafe bulk conjugation generation.
    """
    with open(SEED_PATH, "r", encoding="utf-8") as source:
        seed = json.load(source).get("wordform_extension", [])

    existing = {
        (entry["form"].lower(), entry["stress_pos"]) for entry in existing_entries
    }
    lemma_overrides = {
        "compratemelo": "comprare",
        "abitò": "abitare",
        "abitano": "abitare",
    }
    additions = []
    for seed_entry in seed:
        form = _bare_drill_form(seed_entry["form"].lower())
        key = (form, seed_entry["stress_pos"])
        if key in existing:
            continue
        additions.append(
            {
                "unit": "wordform",
                "form": form,
                "lemma": lemma_overrides.get(form, form),
                "gloss": seed_entry.get("gloss", ""),
                "stress_pos": seed_entry["stress_pos"],
                "stress_source": seed_entry.get("stress_source", "author"),
                "stress_confidence": "high",
                "stress_mechanism": seed_entry["stress_mechanism"],
                "stress_mechanism_detail": seed_entry[
                    "stress_mechanism_detail"
                ],
                "etymological": seed_entry.get("etymological", False),
                "accent_cue": seed_entry.get("accent_cue", False),
                "stress_tags": seed_entry.get("stress_tags", []),
                "syllables": seed_entry["syllables"],
                "syllable_count": seed_entry["syllable_count"],
                "verification_status": "verified_author_seed",
                "syllable_source": "author_seed",
                "verified_by": "StressAuthor seed + CODEX 2026-07-23",
            }
        )
        existing.add(key)
    return additions


# ---------------------------------------------------------------------------
# Syllabify wordform entries
# ---------------------------------------------------------------------------

def syllabify_wordform(entry: dict) -> dict:
    """Add syllable data to a wordform entry."""
    # CODEX 2026-07-23: never overwrite verified dictionary boundaries with
    # the fallback rule-based syllabifier.
    if entry.get("syllables") and entry.get("syllable_source") in {
        "wiktionary_hyphenation",
        "author_seed",
    }:
        entry["syllable_count"] = len(entry["syllables"])
        class_names = {1: "tronca", 2: "piana", 3: "sdrucciola", 4: "bisdrucciola"}
        entry["stress_class"] = class_names.get(entry["stress_pos"], "unknown")
        return entry

    try:
        from tools.stress_pipeline.syllabify_it import syllabify
    except ImportError:
        try:
            from syllabify_it import syllabify
        except ImportError:
            sys.path.insert(0, SCRIPT_DIR)
            from syllabify_it import syllabify

    form = _strip_accents(entry["form"].lower())
    stress_pos = entry.get("stress_pos")

    try:
        syllables = syllabify(form, stress_pos=stress_pos)
    except Exception:
        syllables = [form]

    entry["syllables"] = syllables
    entry["syllable_count"] = len(syllables)

    # Derive stress class
    class_names = {1: "tronca", 2: "piana", 3: "sdrucciola", 4: "bisdrucciola"}
    entry["stress_class"] = class_names.get(entry["stress_pos"], "unknown")

    return entry


# ---------------------------------------------------------------------------
# Main: build the wordform sidecar
# ---------------------------------------------------------------------------

def build_wordform_sidecar(output_path: str = OUTPUT_PATH) -> dict:
    """Build the wordform stress sidecar from:
    1. Conjugation model applied to verb lemmas (3pl present, remoto 3sg)
    2. Known minimal pairs
    """
    print("=" * 70)
    print("Wordform Stress Layer [created by Antigravity]")
    print("=" * 70)

    # Load lemma sidecar to get verb stress data
    print(f"\nLoading lemma sidecar from {LEMMA_SIDECAR_PATH}...")
    if not os.path.exists(LEMMA_SIDECAR_PATH):
        print("  ERROR: Lemma sidecar not found. Run stress_pipeline.py first.")
        return {}

    with open(LEMMA_SIDECAR_PATH, "r", encoding="utf-8") as f:
        lemma_sidecar = json.load(f)
    print(f"  Loaded {len(lemma_sidecar):,} lemma entries.")

    # Load Morph-it! forms for surface form generation
    morphit_forms = None
    if os.path.exists(MORPHIT_FORMS_PATH):
        print(f"  Loading Morph-it! forms...")
        with open(MORPHIT_FORMS_PATH, "r", encoding="utf-8") as f:
            morphit_forms = json.load(f)
        print(f"  Loaded {len(morphit_forms):,} form entries.")

    # CODEX 2026-07-23: load POS/lemma-aware pronunciation records before
    # generating anything. No record means no drill item.
    print("  Loading verified Wiktionary forms...")
    with open(WIKT_STRESS_PATH, "r", encoding="utf-8") as f:
        verified_lexicon = json.load(f)

    morphit_by_lemma = (
        _morphit_present_3pl_by_lemma(morphit_forms)
        if morphit_forms
        else {}
    )

    # Generate only attested and pronunciation-verified present 3pl cells.
    print("\nGenerating verified verb paradigm cells...")
    verb_entries = []
    verb_count = 0
    for entry in lemma_sidecar:
        if entry.get("pos") != "verb":
            continue
        if entry.get("stress_confidence") == "low":
            continue  # Don't generate wordforms from low-confidence lemmas

        verb_count += 1
        paradigm = generate_attested_present_3pl(
            entry["lemma"], morphit_by_lemma, verified_lexicon
        )
        verb_entries.extend(paradigm)

    print(
        f"  {verb_count:,} candidate verbs -> "
        f"{len(verb_entries):,} attested+verified present 3pl cells."
    )

    # Generate minimal pairs
    print("\nGenerating minimal pair entries...")
    pair_entries = generate_minimal_pairs(verified_lexicon)
    # CODEX 2026-07-23: when the attested paradigm layer already supplies the
    # verb reading (e.g. capitano/perdono), retain only the contrasting lexical
    # reading from the hand-authored pair set.
    generated_present_keys = {
        (entry["form"], entry["stress_pos"]) for entry in verb_entries
    }
    pair_entries = [
        entry
        for entry in pair_entries
        if not (
            entry.get("stress_mechanism_detail") == "present_3pl"
            and (entry["form"], entry["stress_pos"]) in generated_present_keys
        )
    ]
    print(f"  {len(pair_entries):,} minimal pair entries.")

    # CODEX 2026-07-23: add only the hand-verified seed cells still absent.
    seed_entries = generate_seed_backstops(verb_entries + pair_entries)
    print(f"  {len(seed_entries):,} author-seed backstop entries.")

    # Combine and syllabify
    all_entries = verb_entries + pair_entries + seed_entries
    print(f"\nSyllabifying {len(all_entries):,} wordform entries...")
    for entry in all_entries:
        syllabify_wordform(entry)

    # Stats
    stats = {
        "total": len(all_entries),
        "verb_paradigm": len(verb_entries),
        "minimal_pairs": len(pair_entries),
        "by_class": {},
        "by_mechanism": {},
    }
    for e in all_entries:
        cls = e.get("stress_class", "unknown")
        stats["by_class"][cls] = stats["by_class"].get(cls, 0) + 1
        mech = e.get("stress_mechanism_detail", "unknown")
        stats["by_mechanism"][mech] = stats["by_mechanism"].get(mech, 0) + 1

    # Write sidecar
    print(f"\nWriting wordform sidecar to {output_path}...")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    # CODEX 2026-07-23: stable LF output across Windows/Linux agents.
    with open(output_path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(all_entries, f, ensure_ascii=False, indent=2)
    print(f"  Written {len(all_entries):,} entries.")

    # Summary
    print(f"\n{'=' * 70}")
    print("WORDFORM SUMMARY")
    print(f"{'=' * 70}")
    print(f"Total wordform entries: {stats['total']:,}")
    print(f"  From verb paradigm:   {stats['verb_paradigm']:,}")
    print(f"  From minimal pairs:   {stats['minimal_pairs']:,}")
    print(f"\nBy stress class:")
    for cls in ("tronca", "piana", "sdrucciola", "bisdrucciola"):
        n = stats["by_class"].get(cls, 0)
        print(f"  {cls:>14}: {n:>6,}")
    print(f"\nBy mechanism detail:")
    for mech, n in sorted(stats["by_mechanism"].items(), key=lambda x: -x[1]):
        print(f"  {mech:>20}: {n:>6,}")

    return stats


if __name__ == "__main__":
    build_wordform_sidecar()
