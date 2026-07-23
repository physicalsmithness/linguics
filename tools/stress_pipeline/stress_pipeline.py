#!/usr/bin/env python3
"""Italian stress assignment pipeline — tiered by mechanism. [created by Antigravity]

Applies stress metadata to vocabulary entries using a five-tier sourcing model:
  Tier 1: Orthographic (final written accent)
  Tier 2: Derivational suffix rules
  Tier 3: Inflectional paradigm model
  Tier 4: Pronunciation-lexicon lookup (Wiktionary IPA / espeak-ng)
  Tier 5: Etymological prior (Greek/Latin learned-word heuristic)

Confidence discipline: un-looked-up words enter rule_default/low and are NOT
drillable until dictionary-confirmed.

Reads:  data/vocabulary_it_frequency.json
        tools/stress_pipeline/lexicon_data/*.json  (from prepare_lexicon_data.py)
Writes: data/stress_sidecar_lemma.json             (keyed by lemma+pos+gender)
"""

import json
import os
import re
import sys
import unicodedata

# ---------------------------------------------------------------------------
# Path helpers
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
LEXICON_DIR = os.path.join(SCRIPT_DIR, "lexicon_data")
DATA_DIR = os.path.join(PROJECT_ROOT, "data")

VOCAB_PATH = os.path.join(DATA_DIR, "vocabulary_it_frequency.json")
# CODEX 2026-07-23: use the POS-aware lexicon that verifies orthographic
# syllable boundaries as well as stress. The former spelling-only extractor is
# retained on disk for provenance, but it is no longer safe for drill gating.
WIKT_STRESS_PATH = os.path.join(LEXICON_DIR, "wiktionary_verified.json")
ERE_VERBS_PATH = os.path.join(LEXICON_DIR, "ere_verbs.json")
OUTPUT_PATH = os.path.join(DATA_DIR, "stress_sidecar_lemma.json")

# ---------------------------------------------------------------------------
# Character sets
# ---------------------------------------------------------------------------
ACCENTED_VOWELS = set("àèéìòùáíóúâêîôû")
PLAIN_VOWELS = set("aeiou")
ALL_VOWELS = ACCENTED_VOWELS | PLAIN_VOWELS

# CODEX 2026-07-23: the former target string mapped ù->o and á->u.
ACCENT_TO_PLAIN = str.maketrans("àèéìòùáíóúâêîôû", "aeeiouaiouaeiou")

# CODEX 2026-07-23: vocabulary and Kaikki/Wiktionary use different POS labels.
WIKTIONARY_POS = {
    "adjective": "adj",
    "adverb": "adv",
    "conjunction": "conj",
    "preposition": "prep",
    "pronoun": "pron",
    "numeral": "num",
    "determiner": "det",
    "interjection": "intj",
}

# ---------------------------------------------------------------------------
# Tier 1 — Orthographic: final written accent = tronca
# ---------------------------------------------------------------------------

def _has_final_accent(word: str) -> bool:
    """True if the word's last character is an accented vowel."""
    return bool(word) and word[-1] in ACCENTED_VOWELS


def _detect_accent_tags(lemma: str, pos: str) -> list[str]:
    """Detect secondary 'deeper cause' tags for accent-final words."""
    tags = []
    lower = lemma.lower()

    # -tà / -tù suffix
    if lower.endswith("tà"):
        tags.append("derivational:suffix_ta")
    elif lower.endswith("tù"):
        tags.append("derivational:suffix_tu")

    # Weekday -dì
    weekdays = {"lunedì", "martedì", "mercoledì", "giovedì", "venerdì"}
    if lower in weekdays:
        tags.append("derivational:suffix_di_weekday")

    # Loanwords (common finals: -è for French-origin, -ù exotic)
    loanword_forms = {
        "caffè", "canapè", "bidè", "bignè", "gilè", "purè", "lacchè",
        "bebè", "coupè", "soufflè", "cabaret", "menu", "menù", "tabù",
        "bambù", "ragù", "tutù", "vudù", "iglù", "guru", "gurù",
    }
    if lower in loanword_forms:
        tags.append("lexical:loanword")

    # Function words
    function_words = {
        "così", "già", "più", "però", "perciò", "cioè", "lì", "là",
        "quaggiù", "lassù", "quassù", "laggiù", "né", "sé", "sì",
    }
    if lower in function_words:
        tags.append("lexical:function_word")

    # -ché conjunctions
    if lower.endswith("ché") or lower.endswith("chè"):
        tags.append("lexical:conjunction_che")

    # Lexical finals (papà — words where final accent is simply lexical)
    lexical_finals = {"papà", "mamà"}
    if lower in lexical_finals and not tags:
        tags.append("lexical:lexical_final")

    # Inflectional: passato remoto 3sg -ò / future 3sg -à
    if pos == "verb":
        # These would be wordforms, not lemmas — but some truncated forms appear
        tags.append("inflectional:remoto_3sg")

    return tags


def tier1_orthographic(lemma: str, pos: str) -> dict | None:
    """Tier 1: if the word ends with an accented vowel, stress is on the last
    syllable (tronca). Free, high confidence."""
    if not _has_final_accent(lemma):
        return None

    tags = _detect_accent_tags(lemma, pos)

    return {
        "stress_pos": 1,
        "stress_source": "orthographic_mark",
        "stress_confidence": "high",
        "stress_mechanism": "orthographic",
        "stress_mechanism_detail": "accent_final",
        "etymological": False,
        "accent_cue": True,
        "stress_tags": tags,
        "_tier": 1,
    }


# ---------------------------------------------------------------------------
# Tier 2 — Derivational suffix rules
# ---------------------------------------------------------------------------

# Each rule: (suffix_pattern, min_word_len, stress_pos, mechanism_detail, is_etymological)
# Ordered longest-first to avoid prefix conflicts.
DERIVATIONAL_SUFFIX_RULES = [
    # Sdrucciola suffixes (stress_pos = 3)
    ("issimo", 7, 3, "suffix_issimo", False),
    ("issima", 7, 3, "suffix_issimo", False),
    ("issimi", 7, 3, "suffix_issimo", False),
    ("issime", 7, 3, "suffix_issimo", False),
    ("abile", 6, 3, "suffix_abile", False),
    ("abili", 6, 3, "suffix_abile", False),
    ("ibile", 6, 3, "suffix_ibile", False),
    ("ibili", 6, 3, "suffix_ibile", False),
    ("icile", 8, 3, "suffix_ibile", False),  # difficile special
    ("evole", 6, 3, "suffix_evole", False),
    ("evoli", 6, 3, "suffix_evole", False),
    # -ico/-ica (sdrucciola -- but need to be careful: amico is piana not sdrucciola)
    # Only apply to longer words where -ico is clearly a suffix
    ("ologo", 6, 3, "suffix_ologo", True),
    ("ologa", 6, 3, "suffix_ologo", True),
    ("ologhe", 7, 3, "suffix_ologo", True),
    ("ologi", 6, 3, "suffix_ologo", True),
    ("grafo", 6, 3, "suffix_grafo", True),
    ("grafa", 6, 3, "suffix_grafo", True),
    ("metro", 6, 3, "suffix_metro", True),
    ("metra", 6, 3, "suffix_metro", True),

    # Piana suffixes (stress_pos = 2)
    ("zione", 6, 2, "suffix_zione", False),
    ("zioni", 6, 2, "suffix_zione", False),
    ("sione", 6, 2, "suffix_sione", False),
    ("sioni", 6, 2, "suffix_sione", False),
    ("mente", 6, 2, "suffix_mente", False),
    ("mento", 7, 2, "suffix_mento", False),  # min_len 7 to avoid 'momento'
    ("menti", 7, 2, "suffix_mento", False),
    ("tura", 5, 2, "suffix_tura", False),
    ("ture", 5, 2, "suffix_tura", False),
    ("iere", 5, 2, "suffix_iere", False),
    ("iera", 5, 2, "suffix_iere", False),
    ("iero", 5, 2, "suffix_iere", False),
    ("ieri", 5, 2, "suffix_iere", False),
    ("anza", 5, 2, "suffix_anza", False),
    ("anze", 5, 2, "suffix_anza", False),
    ("enza", 5, 2, "suffix_enza", False),
    ("enze", 5, 2, "suffix_enza", False),
    ("tore", 5, 2, "suffix_ore", False),   # -tore only (avoid 'amore', 'signore')
    ("tori", 5, 2, "suffix_ore", False),
    ("trice", 6, 2, "suffix_ore", False),
    ("oso", 5, 2, "suffix_oso", False),    # min_len 5 to avoid 'cosa' (4 chars)
    ("osa", 5, 2, "suffix_oso", False),
    ("osi", 5, 2, "suffix_oso", False),
    ("ose", 5, 2, "suffix_oso", False),
    ("ino", 6, 2, "diminutive_ino_etto", False),   # min_len 6 to exclude base words
    ("ina", 6, 2, "diminutive_ino_etto", False),
    ("ini", 6, 2, "diminutive_ino_etto", False),
    ("ine", 6, 2, "diminutive_ino_etto", False),
    ("etto", 6, 2, "diminutive_ino_etto", False),  # min_len 6
    ("etta", 6, 2, "diminutive_ino_etto", False),
    ("etti", 6, 2, "diminutive_ino_etto", False),
    ("ette", 6, 2, "diminutive_ino_etto", False),
    ("one", 6, 2, "augmentative_one", False),   # min_len 6 to avoid 'azione' etc
    ("oni", 6, 2, "augmentative_one", False),
    ("ona", 6, 2, "augmentative_one", False),
    ("ale", 5, 2, "suffix_ale_are", False),
    ("ali", 5, 2, "suffix_ale_are", False),

    # Learned -ìa suffix (Greek -ία, hiatus: stress on the i, making it piana)
    # farmacia→far-ma-cì-a, economia→e-co-no-mì-a, democrazia is -zia not -ia
    ("macia", 8, 2, "suffix_ia_learned", True),
    ("logia", 7, 2, "suffix_ia_learned", True),
    ("sofia", 8, 2, "suffix_ia_learned", True),
    ("nomia", 8, 2, "suffix_ia_learned", True),
    ("grafia", 8, 2, "suffix_ia_learned", True),
    ("scopia", 8, 2, "suffix_ia_learned", True),
    ("latria", 8, 2, "suffix_ia_learned", True),
    ("mania", 7, 2, "suffix_ia_learned", True),
    ("genia", 7, 2, "suffix_ia_learned", True),
    ("filia", 7, 2, "suffix_ia_learned", True),
    ("patia", 7, 2, "suffix_ia_learned", True),
    ("topia", 7, 2, "suffix_ia_learned", True),
]

# Words where a suffix rule would give the wrong answer — override with lexicon
SUFFIX_EXCEPTIONS = {
    "amico", "amica", "amici", "amiche",     # piana, not sdrucciola despite -ico
    "nemico", "nemica", "nemici", "nemiche",  # piana
    "ombelico",                                # piana
    "manico",                                  # sdrucciola, but irregular
    "casino", "mattino", "destino", "cammino", "vicino",  # piana -ino, not diminutive
    "divino", "felino", "latino", "marino",
    "bambino", "bambina",                      # piana (though -ino looks diminutive, it IS the base)
    "macchina",                                # sdrucciola, not -ina diminutive
    "padrone", "ragione", "stagione", "regione", "lezione",  # -one is part of stem
    "canzone", "prigione", "religione", "opinione", "occasione",
    "azione", "stazione", "nazione", "posizione", "situazione",  # -zione handled above
    "bastone", "cartone", "bottone",  # -one as augmentative is correct here
    "animale", "capitale", "finale", "generale", "materiale",  # -ale IS the suffix, stress correct
    "normale", "naturale", "sociale", "speciale",
    # False suffix matches for short base words:
    "amore", "signore", "cuore", "fiore", "colore", "errore", "valore", "dolore",
    "onore", "sapore", "favore", "autore", "umore", "timore", "sudore", "stupore",
    "cosa", "sposa", "rosa",                   # not -oso/-osa suffix
    "momento",                                  # not -mento suffix
}


def _strip_accents(word: str) -> str:
    """Remove accent marks, returning plain ASCII-like form."""
    return word.translate(ACCENT_TO_PLAIN)


def _lookup_verified_lexicon(
    lemma: str, pos: str, wikt_stress: dict | None
) -> dict | None:
    """Return one non-ambiguous POS-matched pronunciation record.

    CODEX 2026-07-23: spelling-only lookup is unsafe for homographs such as
    noun ``telefonino`` vs the verb form ``telefonino``.
    """
    if not wikt_stress:
        return None
    entries = wikt_stress.get("entries", wikt_stress)
    # CODEX 2026-07-23: exact spelling is mandatory for the surface word;
    # written accents distinguish real lexical entries.
    lower = lemma.lower()
    wikt_pos = WIKTIONARY_POS.get(pos, pos)
    record = entries.get(lower, {}).get(wikt_pos)
    if not record or record.get("ambiguous"):
        return None
    syllables = record.get("syllables")
    stress_pos = record.get("stress_pos")
    if (
        not isinstance(syllables, list)
        or not syllables
        or not isinstance(stress_pos, int)
        or not 1 <= stress_pos <= len(syllables)
    ):
        return None
    return record


def tier2_derivational(lemma: str, pos: str) -> dict | None:
    """Tier 2: derivational suffix rules. Rule-based, high confidence."""
    # Skip accent-final words (Tier 1 handles)
    if _has_final_accent(lemma):
        return None

    lower = lemma.lower()
    lower_plain = _strip_accents(lower)

    # Check exception list
    if lower_plain in SUFFIX_EXCEPTIONS:
        return None  # Let Tier 4 handle

    for suffix, min_len, stress_pos, detail, etymological in DERIVATIONAL_SUFFIX_RULES:
        if len(lower_plain) >= min_len and lower_plain.endswith(suffix):
            return {
                "stress_pos": stress_pos,
                "stress_source": "rule",
                "stress_confidence": "high",
                "stress_mechanism": "derivational",
                "stress_mechanism_detail": detail,
                "etymological": etymological,
                "accent_cue": False,
                "stress_tags": ["etymological"] if etymological else [],
                "_tier": 2,
            }

    return None


# ---------------------------------------------------------------------------
# Tier 3 — Inflectional paradigm model (verb lemmas only)
# ---------------------------------------------------------------------------

# Known stem-stressed -ere verbs (sdrucciola infinitives).
# This is the SEED list; extended by ere_verbs.json from Wiktionary.
KNOWN_ERE_STEM = {
    "essere", "prendere", "scrivere", "vivere", "credere", "leggere",
    "mettere", "perdere", "rendere", "chiudere", "correre", "nascere",
    "conoscere", "crescere", "muovere", "ridere", "rompere", "scendere",
    "spendere", "succedere", "vincere", "piangere", "giungere",
    "dipingere", "dirigere", "distinguere", "dividere", "esprimere",
    "permettere", "promettere", "proteggere", "risolvere", "scegliere",
    "sciogliere", "scuotere", "sorgere", "spingere", "stendere",
    "stringere", "svolgere", "togliere", "volgere", "accogliere",
    "raccogliere", "accendere", "aggiungere", "ammettere", "assumere",
    "attendere", "battere", "chiedere", "cogliere", "comprendere",
    "concludere", "condividere", "connettere", "consistere",
    "contendere", "convincere", "correggere", "corrispondere",
    "cuocere", "descrivere", "difendere", "discutere", "distruggere",
    "eleggere", "emergere", "escludere", "esistere", "esplodere",
    "estendere", "fingere", "friggere", "immergere", "includere",
    "insistere", "intendere", "interrompere", "invadere", "mordere",
    "nascondere", "offendere", "percepire", "percuotere",
    "premere", "presumere", "produrre",
    "piovere", "piangere", "raccogliere", "raggiungere", "reggere",
    "resistere", "ricevere", "riconoscere", "riflettere",
    "riprendere", "rispondere", "sconfiggere",
    "scoprire", "sorprendere", "sostenere", "spargere",
    "spegnere", "spremere", "storcere", "stupire",
    "supporre", "tacere", "tendere", "tradurre", "trascorrere",
    "uccidere", "ungere",
}

# Known end-stressed -ere verbs (piana infinitives)
KNOWN_ERE_END = {
    "avere", "dovere", "potere", "sapere", "tenere", "volere",
    "cadere", "godere", "parere", "piacere", "rimanere", "sedere",
    "tacere", "temere", "valere", "vedere", "giacere", "dispiacere",
}


def tier3_inflectional(lemma: str, pos: str, conj_class: str | None,
                       ere_lookup: dict | None = None) -> dict | None:
    """Tier 3: inflectional paradigm model for verb LEMMAS (infinitives).

    For -are/-ire: always piana (high confidence).
    For -ere: depends on stem vs end stress (lexical exception within this tier).
    """
    if pos != "verb":
        return None

    lower = lemma.lower()
    lower_plain = _strip_accents(lower)

    # -are infinitives: always piana
    if lower_plain.endswith("are") or lower_plain.endswith("arsi"):
        return {
            "stress_pos": 2,
            "stress_source": "rule",
            "stress_confidence": "high",
            "stress_mechanism": "inflectional",
            "stress_mechanism_detail": "infinitive_are",
            "etymological": False,
            "accent_cue": False,
            "stress_tags": [],
            "_tier": 3,
        }

    # -ire infinitives: always piana
    if lower_plain.endswith("ire") or lower_plain.endswith("irsi"):
        return {
            "stress_pos": 2,
            "stress_source": "rule",
            "stress_confidence": "high",
            "stress_mechanism": "inflectional",
            "stress_mechanism_detail": "infinitive_ire",
            "etymological": False,
            "accent_cue": False,
            "stress_tags": [],
            "_tier": 3,
        }

    # -ere infinitives: the split
    if lower_plain.endswith("ere") or lower_plain.endswith("ersi"):
        # Strip reflexive -si for lookup
        lookup_form = lower_plain
        if lookup_form.endswith("ersi"):
            lookup_form = lookup_form[:-2]  # strip -si -> -ere

        # Check known lists first
        if lookup_form in KNOWN_ERE_STEM:
            return {
                "stress_pos": 3,
                "stress_source": "rule",
                "stress_confidence": "high",
                "stress_mechanism": "inflectional",
                "stress_mechanism_detail": "infinitive_ere_stem",
                "etymological": False,
                "accent_cue": False,
                "stress_tags": [],
                "_tier": 3,
            }

        if lookup_form in KNOWN_ERE_END:
            return {
                "stress_pos": 2,
                "stress_source": "rule",
                "stress_confidence": "high",
                "stress_mechanism": "inflectional",
                "stress_mechanism_detail": "infinitive_ere_end",
                "etymological": False,
                "accent_cue": False,
                "stress_tags": [],
                "_tier": 3,
            }

        # Check extended list from Wiktionary/Morph-it!
        if ere_lookup:
            classification = ere_lookup.get(lookup_form)
            if classification == "stem":
                return {
                    "stress_pos": 3,
                    "stress_source": "dictionary",
                    "stress_confidence": "high",
                    "stress_mechanism": "inflectional",
                    "stress_mechanism_detail": "infinitive_ere_stem",
                    "etymological": False,
                    "accent_cue": False,
                    "stress_tags": [],
                    "_tier": 3,
                }
            elif classification == "end":
                return {
                    "stress_pos": 2,
                    "stress_source": "dictionary",
                    "stress_confidence": "high",
                    "stress_mechanism": "inflectional",
                    "stress_mechanism_detail": "infinitive_ere_end",
                    "etymological": False,
                    "accent_cue": False,
                    "stress_tags": [],
                    "_tier": 3,
                }

        # Unknown -ere verb: DON'T guess — fall through to Tier 4 / default
        return None

    # Non-standard verb infinitive form (shouldn't happen for lemmas)
    return None


# ---------------------------------------------------------------------------
# Tier 4 — Pronunciation-lexicon lookup
# ---------------------------------------------------------------------------

def tier4_lexicon(lemma: str, pos: str,
                  wikt_stress: dict | None = None) -> dict | None:
    """Tier 4: look up stress and syllables in the verified Wiktionary lexicon.

    CODEX 2026-07-23: high confidence now requires a POS-matched,
    non-ambiguous record with explicit Wiktionary hyphenation and IPA.
    """
    entry = _lookup_verified_lexicon(lemma, pos, wikt_stress)
    if entry is None:
        return None

    return {
        "stress_pos": entry["stress_pos"],
        "stress_source": "dictionary",
        "stress_confidence": "high",
        "stress_mechanism": "lexical",
        "stress_mechanism_detail": "lexical_simple",
        "etymological": False,
        "accent_cue": False,
        "stress_tags": [],
        "_tier": 4,
        "_verified_record": entry,
        "_verification_status": "verified",
    }


# ---------------------------------------------------------------------------
# Tier 5 — Etymological prior (Greek/Latin learned-word heuristic)
# ---------------------------------------------------------------------------

# Greek/Latin prefixes/roots that predict antepenult stress
LEARNED_PREFIXES = [
    "tele", "micro", "macro", "psico", "filo", "bio", "geo", "foto",
    "auto", "proto", "pseudo", "mono", "poli", "anti", "meta", "para",
    "iper", "ipo", "neo", "paleo", "demo", "astro", "cosmo",
    "crono", "etno", "fisio", "gastro", "neuro", "orto", "patho",
    "retro", "termo", "tecno", "topo",
]

# Learned suffixes (the root is Greek/Latin) -- predict sdrucciola
LEARNED_SUFFIXES = [
    "fono", "fona", "foni", "fone",
    "logo", "loga", "logi", "loghe",
    "grafo", "grafa", "grafi", "grafe",
    "metro", "metra", "metri", "metre",
    "scopio", "scopia",
    "geno", "gena",
    "crate", "crazia",
    # Greek -ικός/-ική patterns (very productive in Italian)
    "atica", "atici", "atiche", "atico",
    "etica", "etici", "etiche", "etico",
    "itica", "itici", "itiche", "itico",
    "otica", "otici", "otiche", "otico",
    "usica", "usici", "usiche", "usico",
    "edica", "edici", "ediche", "edico",
    "umica", "umici", "umiche", "umico",
    "isica", "isici", "isiche", "isico",
    # -olo/-ola (Latin -ulus/-ula diminutive)
    "icolo", "icola", "icoli", "icole",
    "acolo", "acola", "acoli", "acole",
]

# Known etymological sdrucciole that don't match prefix/suffix patterns.
# These are Greek/Latin learned words where Italian inherited the
# antepenult stress from the source language.
KNOWN_ETYMOLOGICAL_SDRUCCIOLE = {
    # From Latin
    "numero", "sabato", "isola", "tavola", "tavolo", "camera", "pagina",
    "lettera", "opera", "regola", "formula", "favola", "fabrica",
    "maschera", "bottega", "predica", "debito", "merito", "limite",
    "credito", "spirito", "genero", "genere", "ordine", "termine",
    "principe", "margine", "macchina", "giovane", "ultimo", "subito",
    "popolo", "secolo", "albero", "zucchero", "polvere", "carcere",
    # From Greek via Latin
    "musica", "medico", "numero", "periodo", "metodo", "simbolo",
    "problema", "sistema", "programma", "tema", "schema",
    "fenomeno", "carattere", "capitolo", "articolo", "spettacolo",
    "miracolo", "ostacolo", "veicolo", "obbligo", "dialogo",
    "catalogo", "monologo", "prologo", "epilogo",
    "filosofo", "fotografo", "paragrafo", "telegrafo",
    "termometro", "chilometro", "centimetro", "diametro",
    "atmosfera",
    "matematica", "fisica", "chimica", "grammatica", "logica",
    "politica", "pratica", "tecnica", "classica", "critica",
    "ceramica", "dinamica", "organica", "botanica",
    "meccanica", "elettronica", "informatica", "statistica",
}


def tier5_etymological(lemma: str, pos: str) -> dict | None:
    """Tier 5: heuristic for learned/Greek words. LOW confidence, never asserted.
    Only applied to words with 3+ syllables that haven't been assigned yet."""
    lower = _strip_accents(lemma.lower())

    if len(lower) < 5:  # Too short for this heuristic
        return None

    is_learned = False

    # Check known sdrucciole list first
    if lower in KNOWN_ETYMOLOGICAL_SDRUCCIOLE:
        is_learned = True

    # Check prefixes
    if not is_learned:
        for prefix in LEARNED_PREFIXES:
            if lower.startswith(prefix) and len(lower) > len(prefix) + 2:
                is_learned = True
                break

    # Check suffixes
    if not is_learned:
        for suffix in LEARNED_SUFFIXES:
            if lower.endswith(suffix) and len(lower) > len(suffix) + 2:
                is_learned = True
                break

    if not is_learned:
        return None

    return {
        "stress_pos": 3,  # Guess antepenult
        "stress_source": "rule",
        "stress_confidence": "low",
        "stress_mechanism": "lexical",
        "stress_mechanism_detail": "etymological_learned",
        "etymological": True,
        "accent_cue": False,
        "stress_tags": ["etymological"],
        "_tier": 5,
    }


# ---------------------------------------------------------------------------
# Default fallthrough
# ---------------------------------------------------------------------------

def default_assignment(lemma: str, pos: str) -> dict:
    """Fallthrough: penult is the statistical default, but we mark it as
    rule_default/low and it is NOT drillable."""
    return {
        "stress_pos": 2,  # Penult default
        "stress_source": "rule_default",
        "stress_confidence": "low",
        "stress_mechanism": "lexical",
        "stress_mechanism_detail": "lexical_simple",
        "etymological": False,
        "accent_cue": False,
        "stress_tags": [],
        "_tier": 0,
    }


# ---------------------------------------------------------------------------
# Enrichment: fix mechanism for accent_cue words
# ---------------------------------------------------------------------------

def _enrich_accent_cue_mechanism(result: dict, lemma: str, pos: str) -> dict:
    """For accent_cue=True words, ensure primary mechanism is 'orthographic'.
    Any deeper cause (suffix, paradigm cell) is demoted to stress_tags.

    This implements the v4 ruling: the accent IS why the learner should know.
    """
    if not result.get("accent_cue"):
        return result

    # If already orthographic, nothing to do
    if result["stress_mechanism"] == "orthographic":
        return result

    # Demote current mechanism to a tag
    old_tag = f"{result['stress_mechanism']}:{result['stress_mechanism_detail']}"
    if old_tag not in result["stress_tags"]:
        result["stress_tags"].append(old_tag)

    result["stress_mechanism"] = "orthographic"
    result["stress_mechanism_detail"] = "accent_final"
    return result


# ---------------------------------------------------------------------------
# Enrichment: detect etymological flag post-hoc
# ---------------------------------------------------------------------------

ETYMOLOGICAL_WORDS = {
    "telefono", "musica", "medico", "numero", "sabato", "isola",
    "farmacia", "problema", "sistema", "programma", "tema", "schema",
    "simbolo", "metodo", "periodo", "spirito", "carattere", "capitolo",
    "articolo", "spettacolo", "miracolo", "ostacolo", "veicolo",
    "dialogo", "catalogo", "monologo", "prologo", "epilogo",
    "filosofo", "fotografo", "paragrafo", "telegrafo",
    "termometro", "chilometro", "centimetro", "diametro",
    "microscopio", "telescopio", "stereoscopio",
    "democrazia", "burocrazia", "aristocrazia",
    "fenomeno", "genero", "genere", "atmosfera",
    "matematica", "fisica", "chimica", "grammatica", "logica",
    "politica", "pratica", "tecnica", "classica", "critica",
    "ceramica", "dinamica", "organica", "botanica",
    "meccanica", "elettronica", "informatica", "statistica",
    "economia", "filosofia", "psicologia", "sociologia",
    "biologia", "tecnologia", "geologia", "archeologia",
    "ideologia", "metodologia", "teologia",
}


def _enrich_etymological(result: dict, lemma: str) -> dict:
    """Flag known etymological (Greek/Latin learned) words."""
    lower = _strip_accents(lemma.lower())
    if lower in ETYMOLOGICAL_WORDS:
        result["etymological"] = True
        if "etymological" not in result["stress_tags"]:
            result["stress_tags"].append("etymological")
    return result


# ---------------------------------------------------------------------------
# Main pipeline: assign stress to one entry
# ---------------------------------------------------------------------------

def assign_stress(entry: dict,
                  wikt_stress: dict | None = None,
                  ere_lookup: dict | None = None) -> dict:
    """Run the five-tier pipeline on a single vocabulary entry.

    Returns a stress metadata dict with all spec fields.
    """
    lemma = entry.get("lemma", "")
    pos = entry.get("pos", "")
    conj_class = entry.get("conjugation_class")

    # Try tiers in order
    result = tier1_orthographic(lemma, pos)

    if result is None:
        result = tier2_derivational(lemma, pos)

    if result is None:
        result = tier3_inflectional(lemma, pos, conj_class, ere_lookup)

    if result is None:
        result = tier4_lexicon(lemma, pos, wikt_stress)

    if result is None:
        result = tier5_etymological(lemma, pos)

    if result is None:
        result = default_assignment(lemma, pos)

    # Post-enrichment
    result = _enrich_accent_cue_mechanism(result, lemma, pos)
    result = _enrich_etymological(result, lemma)

    return result


# ---------------------------------------------------------------------------
# Tier 4 confirmation: cross-check earlier tiers against lexicon
# ---------------------------------------------------------------------------

def confirm_with_lexicon(
    result: dict,
    lemma: str,
    pos: str,
    wikt_stress: dict | None = None,
) -> dict:
    """Gate drill confidence on verified stress AND syllable boundaries.

    CODEX 2026-07-23: the old function only compared an ordinal stress number.
    That allowed the number ``2`` from Wiktionary to "confirm" a bad local
    split such as pe-do-fi-lia and produce the wrong target syllable. A record
    without POS-matched Wiktionary hyphenation is now non-drillable.
    """
    wikt_entry = _lookup_verified_lexicon(lemma, pos, wikt_stress)
    if wikt_entry is None:
        result["stress_confidence"] = "low"
        result["_verification_status"] = "missing_or_ambiguous_syllables"
        return result

    result["_verified_record"] = wikt_entry
    result["_verification_status"] = "verified"
    wikt_pos = wikt_entry["stress_pos"]
    assigned_pos = result.get("stress_pos")

    if assigned_pos == wikt_pos:
        result["stress_confidence"] = "high"
        if result["stress_source"] == "rule_default":
            result["stress_source"] = "dictionary"
        result["_confirmed"] = True
        return result

    # A written final accent is authoritative. A disagreement means the
    # dictionary record is unsuitable, so quarantine rather than override.
    if result.get("_tier") == 1:
        result["stress_confidence"] = "low"
        result["_verification_status"] = "orthographic_dictionary_conflict"
        return result

    # Dictionary evidence rejects the earlier rule. Keep the rejected rule as
    # provenance, but do not report the item as if that rule explained it.
    rejected = (
        f"rejected:{result.get('stress_mechanism', 'unknown')}:"
        f"{result.get('stress_mechanism_detail', 'unknown')}"
    )
    if rejected not in result["stress_tags"]:
        result["stress_tags"].append(rejected)
    result["stress_pos"] = wikt_pos
    result["stress_source"] = "dictionary"
    result["stress_confidence"] = "high"
    result["stress_mechanism"] = "lexical"
    result["stress_mechanism_detail"] = "lexical_simple"
    result["_overridden"] = True
    result["_original_pos"] = assigned_pos
    return result


# ---------------------------------------------------------------------------
# Syllabification integration
# ---------------------------------------------------------------------------

def syllabify_entry(lemma: str, stress_result: dict) -> tuple[list[str], int]:
    """Syllabify the lemma using the resolved stress position.

    Returns (syllables, syllable_count).
    """
    # CODEX 2026-07-23: the verified dictionary split is the production path.
    # The local rule-based syllabifier remains only for non-drillable audit
    # records so the sidecar retains total coverage.
    verified = stress_result.get("_verified_record")
    if verified and verified.get("syllables"):
        syllables = list(verified["syllables"])
        return syllables, len(syllables)

    try:
        from tools.stress_pipeline.syllabify_it import syllabify
    except ImportError:
        # Try relative import
        try:
            from syllabify_it import syllabify
        except ImportError:
            sys.path.insert(0, SCRIPT_DIR)
            from syllabify_it import syllabify

    stress_pos = stress_result.get("stress_pos")
    syllables = syllabify(lemma.lower(), stress_pos=stress_pos)
    return syllables, len(syllables)


# ---------------------------------------------------------------------------
# Full pipeline: process all vocabulary entries
# ---------------------------------------------------------------------------

def load_lexicon_data() -> tuple[dict | None, dict | None]:
    """Load lexicon data files if available. Returns (wikt_stress, ere_lookup)."""
    wikt_stress = None
    ere_lookup = None

    if os.path.exists(WIKT_STRESS_PATH):
        print(f"  Loading Wiktionary stress data from {WIKT_STRESS_PATH}...")
        with open(WIKT_STRESS_PATH, "r", encoding="utf-8") as f:
            wikt_stress = json.load(f)
        # CODEX 2026-07-23: verified lexicon wraps records in metadata.
        verified_count = wikt_stress.get("_meta", {}).get(
            "verified_records", len(wikt_stress.get("entries", wikt_stress))
        )
        print(f"  Loaded {verified_count:,} verified word/POS records.")

    if os.path.exists(ERE_VERBS_PATH):
        print(f"  Loading -ere verb classification from {ERE_VERBS_PATH}...")
        with open(ERE_VERBS_PATH, "r", encoding="utf-8") as f:
            ere_lookup = json.load(f)
        print(f"  Loaded {len(ere_lookup):,} -ere verbs.")

    return wikt_stress, ere_lookup


def process_vocabulary(vocab_path: str = VOCAB_PATH,
                       output_path: str = OUTPUT_PATH) -> dict:
    """Process the full vocabulary file and emit the stress sidecar.

    Returns summary statistics.
    """
    print("=" * 70)
    print("Italian Stress Pipeline [created by Antigravity]")
    print("=" * 70)

    # Load vocabulary
    print(f"\nLoading vocabulary from {vocab_path}...")
    with open(vocab_path, "r", encoding="utf-8") as f:
        vocab = json.load(f)
    print(f"  Loaded {len(vocab):,} entries.")

    # Load lexicon data
    print("\nLoading lexicon data...")
    wikt_stress, ere_lookup = load_lexicon_data()
    if wikt_stress is None:
        print("  WARNING: No Wiktionary data. Tier 4 disabled.")
        print("  Run prepare_lexicon_data.py first for full coverage.")

    # Process each entry
    print(f"\nProcessing {len(vocab):,} entries through tiered pipeline...")
    sidecar = []
    stats = {
        "total": 0,
        "by_tier": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 0: 0},
        "by_confidence": {"high": 0, "medium": 0, "low": 0},
        "by_class": {"tronca": 0, "piana": 0, "sdrucciola": 0, "bisdrucciola": 0},
        "by_mechanism": {},
        "confirmed": 0,
        "overridden": 0,
        "accent_cue": 0,
        "etymological": 0,
    }

    class_names = {1: "tronca", 2: "piana", 3: "sdrucciola", 4: "bisdrucciola"}

    for i, entry in enumerate(vocab):
        if (i + 1) % 2000 == 0:
            print(f"  ... {i + 1:,}/{len(vocab):,}")

        lemma = entry.get("lemma", "")
        pos = entry.get("pos", "")
        rank = entry.get("rank")
        gender = entry.get("gender")

        if not lemma:
            continue

        # Assign stress
        result = assign_stress(entry, wikt_stress, ere_lookup)

        # Cross-check with lexicon
        # CODEX 2026-07-23: POS is load-bearing for homographs.
        result = confirm_with_lexicon(result, lemma, pos, wikt_stress)

        # Syllabify
        try:
            syllables, syllable_count = syllabify_entry(lemma, result)
        except Exception as e:
            # Fallback: rough syllabification
            syllables = [lemma]
            syllable_count = 1

        # Ensure stress_pos <= syllable_count
        if result["stress_pos"] > syllable_count:
            result["stress_pos"] = syllable_count

        # Build sidecar entry
        stress_class = class_names.get(result["stress_pos"], "unknown")
        sidecar_entry = {
            "rank": rank,
            "lemma": lemma,
            "pos": pos,
            "gender": gender,
            "stress_pos": result["stress_pos"],
            "syllables": syllables,
            "syllable_count": syllable_count,
            "stress_class": stress_class,
            "stress_source": result["stress_source"],
            "stress_confidence": result["stress_confidence"],
            "stress_mechanism": result["stress_mechanism"],
            "stress_mechanism_detail": result["stress_mechanism_detail"],
            "etymological": result["etymological"],
            "accent_cue": result["accent_cue"],
            "stress_tags": result["stress_tags"],
            # CODEX 2026-07-23: generated JSON cannot carry comments, so these
            # fields preserve the new verification gate and its provenance.
            "verification_status": result.get(
                "_verification_status", "unverified"
            ),
            "syllable_source": (
                "wiktionary_hyphenation"
                if result.get("_verified_record")
                else "rule_based_unverified"
            ),
            "verified_by": (
                "CODEX 2026-07-23"
                if result.get("_verified_record")
                else None
            ),
        }
        sidecar.append(sidecar_entry)

        # Stats
        stats["total"] += 1
        tier = result.get("_tier", 0)
        stats["by_tier"][tier] = stats["by_tier"].get(tier, 0) + 1
        stats["by_confidence"][result["stress_confidence"]] += 1
        stats["by_class"][stress_class] = stats["by_class"].get(stress_class, 0) + 1

        mech = result["stress_mechanism"]
        stats["by_mechanism"][mech] = stats["by_mechanism"].get(mech, 0) + 1

        if result.get("_confirmed"):
            stats["confirmed"] += 1
        if result.get("_overridden"):
            stats["overridden"] += 1
        if result["accent_cue"]:
            stats["accent_cue"] += 1
        if result["etymological"]:
            stats["etymological"] += 1

    # Write sidecar
    print(f"\nWriting sidecar to {output_path}...")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    # CODEX 2026-07-23: force LF so Windows regeneration does not turn every
    # JSON line into a whitespace-only diff.
    with open(output_path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(sidecar, f, ensure_ascii=False, indent=2)
    print(f"  Written {len(sidecar):,} entries.")

    # Print summary
    drillable = stats["by_confidence"]["high"] + stats["by_confidence"]["medium"]
    print(f"\n{'=' * 70}")
    print("SUMMARY")
    print(f"{'=' * 70}")
    print(f"Total entries:      {stats['total']:,}")
    print(f"Drillable (H+M):    {drillable:,} ({100*drillable/max(stats['total'],1):.1f}%)")
    print(f"\nBy confidence:")
    for conf in ("high", "medium", "low"):
        n = stats["by_confidence"][conf]
        print(f"  {conf:>8}: {n:>6,} ({100*n/max(stats['total'],1):.1f}%)")
    print(f"\nBy stress class:")
    for cls in ("tronca", "piana", "sdrucciola", "bisdrucciola"):
        n = stats["by_class"].get(cls, 0)
        print(f"  {cls:>14}: {n:>6,} ({100*n/max(stats['total'],1):.1f}%)")
    print(f"\nBy assigning tier:")
    tier_names = {1: "Orthographic", 2: "Derivational", 3: "Inflectional",
                  4: "Lexicon", 5: "Etymological", 0: "Default/unassigned"}
    for tier in (1, 2, 3, 4, 5, 0):
        n = stats["by_tier"].get(tier, 0)
        print(f"  Tier {tier} ({tier_names[tier]:>14}): {n:>6,}")
    print(f"\nBy mechanism:")
    for mech, n in sorted(stats["by_mechanism"].items(), key=lambda x: -x[1]):
        print(f"  {mech:>20}: {n:>6,}")
    print(f"\nLexicon confirmations: {stats['confirmed']:,}")
    print(f"Lexicon overrides:     {stats['overridden']:,}")
    print(f"Accent-cue words:      {stats['accent_cue']:,}")
    print(f"Etymological flags:    {stats['etymological']:,}")

    return stats


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    stats = process_vocabulary()
