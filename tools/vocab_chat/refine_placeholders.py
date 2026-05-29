"""Theme refinement pass on the placeholder-only entries.

Many entries currently carry only one of the four catch-all placeholder
themes (noun_abstract, verb_action_general, adjective_quality, adverb_manner).
Where the lemma clearly belongs to a more specific theme — adverb_negation,
adjective_nationality, sports_leisure, etc. — we refine.

Per architect Q3 of other_open_questions: placeholder themes are NOT errors;
they're a deliberate part of the design ("Action verbs (general) with 800
entries inside" is a usable filter). We refine only where the specific theme
is clearly more pedagogically informative.

Strategy: hand-coded LEMMA_TO_SPECIFIC map. For each placeholder-only entry
whose lemma is in the map, REPLACE the placeholder with the specific theme(s).
Or, in some cases, ADD the specific theme alongside the placeholder when both
are pedagogically meaningful.

Run from project root:
    python3 tools/vocab_chat/refine_placeholders.py
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

PLACEHOLDERS = {"noun_abstract", "verb_action_general", "adjective_quality", "adverb_manner"}

# Per-POS lemma → list of refined themes.
# Each refinement REPLACES the POS-appropriate placeholder.
# (The script will keep any non-placeholder themes already on the entry.)

ADVERB_REFINEMENTS = {
    # adverb_negation
    "no": ["adverb_negation"],
    "non": ["adverb_negation"],
    "manco": ["adverb_negation"],
    "neanche": ["adverb_negation"],
    "nemmeno": ["adverb_negation"],
    "neppure": ["adverb_negation"],

    # adverb_affirmation
    "sì": ["adverb_affirmation"],
    "ok": ["adverb_affirmation"],
    "sicuro": ["adverb_affirmation"],
    "certo": ["adverb_affirmation"],
    "certamente": ["adverb_affirmation"],
    "esatto": ["adverb_affirmation"],
    "ecco": ["adverb_affirmation"],
    "infatti": ["adverb_affirmation"],

    # adverb_time
    "appena": ["adverb_time"],
    "stasera": ["adverb_time"],
    "stamattina": ["adverb_time"],
    "stanotte": ["adverb_time"],
    "ultimamente": ["adverb_time"],
    "stavolta": ["adverb_time"],
    "spesso": ["adverb_time"],
    "raramente": ["adverb_time"],
    "subito": ["adverb_time"],
    "immediatamente": ["adverb_time"],
    "presto": ["adverb_time"],
    "tardi": ["adverb_time"],
    "ieri": ["adverb_time"],
    "domani": ["adverb_time"],
    "oggi": ["adverb_time"],
    "dopo": ["adverb_time"],
    "prima": ["adverb_time"],
    "intanto": ["adverb_time"],
    "frattanto": ["adverb_time"],
    "mai": ["adverb_time", "adverb_negation"],
    "sempre": ["adverb_time"],
    "ancora": ["adverb_time"],
    "già": ["adverb_time"],
    "ormai": ["adverb_time"],
    "ora": ["adverb_time"],
    "tardo": ["adverb_time"],

    # adverb_place
    "su": ["adverb_place"],
    "giù": ["adverb_place"],
    "qui": ["adverb_place"],
    "qua": ["adverb_place"],
    "lì": ["adverb_place"],
    "là": ["adverb_place"],
    "sopra": ["adverb_place"],
    "sotto": ["adverb_place"],
    "dentro": ["adverb_place"],
    "fuori": ["adverb_place"],
    "davanti": ["adverb_place"],
    "dietro": ["adverb_place"],
    "vicino": ["adverb_place"],
    "lontano": ["adverb_place"],
    "intorno": ["adverb_place"],
    "indietro": ["adverb_place"],
    "avanti": ["adverb_place"],
    "altrove": ["adverb_place"],
    "ovunque": ["adverb_place"],
    "dappertutto": ["adverb_place"],
    "ce": ["adverb_place"],
    "oltre": ["adverb_place"],
    "contro": ["adverb_place"],
    "insieme": ["adverb_place"],
    "assieme": ["adverb_place"],
    "incontro": ["adverb_place"],
    "addosso": ["adverb_place"],
    "altrettanto": ["adverb_quantity"],

    # adverb_quantity
    "piuttosto": ["adverb_quantity"],
    "abbastanza": ["adverb_quantity"],
    "quasi": ["adverb_quantity"],
    "troppo": ["adverb_quantity"],
    "molto": ["adverb_quantity"],
    "poco": ["adverb_quantity"],
    "tanto": ["adverb_quantity"],
    "doppio": ["adverb_quantity"],
    "perfettamente": ["adverb_quantity"],
    "completamente": ["adverb_quantity"],
    "totalmente": ["adverb_quantity"],
    "interamente": ["adverb_quantity"],
    "assolutamente": ["adverb_quantity"],
    "appieno": ["adverb_quantity"],
    "circa": ["adverb_quantity"],
    "approssimativamente": ["adverb_quantity"],
    "estremamente": ["adverb_quantity"],
    "particolarmente": ["adverb_quantity"],
    "incredibilmente": ["adverb_quantity"],
    "leggermente": ["adverb_quantity"],

    # adverbs of comparison / modality / discourse — keep on adverb_manner
    # (forse, magari, davvero, veramente, ovviamente, soprattutto are manner-ish)
}

ADJECTIVE_REFINEMENTS = {
    # adjective_size
    "piccolo": ["adjective_size"],
    "grande": ["adjective_size"],
    "grosso": ["adjective_size"],
    "enorme": ["adjective_size"],
    "ampio": ["adjective_size"],
    "stretto": ["adjective_size"],
    "vasto": ["adjective_size"],
    "minuscolo": ["adjective_size"],
    "gigantesco": ["adjective_size"],
    "lungo": ["adjective_size"],
    "corto": ["adjective_size"],
    "alto": ["adjective_size"],
    "basso": ["adjective_size"],
    "spesso": ["adjective_size"],
    "sottile": ["adjective_size"],
    "fino": ["adjective_size"],
    "largo": ["adjective_size"],
    "minimo": ["adjective_size"],
    "massimo": ["adjective_size"],

    # adjective_age
    "vecchio": ["adjective_age"],
    "giovane": ["adjective_age"],
    "nuovo": ["adjective_age"],
    "antico": ["adjective_age"],
    "recente": ["adjective_age"],
    "moderno": ["adjective_age"],
    "anziano": ["adjective_age"],
    "neonato": ["adjective_age"],
    "scorso": ["adjective_age"],

    # adjective_distance
    "vicino": ["adjective_distance"],
    "lontano": ["adjective_distance"],
    "prossimo": ["adjective_distance"],
    "distante": ["adjective_distance"],
    "remoto": ["adjective_distance"],

    # adjective_temperature
    "caldo": ["adjective_temperature"],
    "freddo": ["adjective_temperature"],
    "fresco": ["adjective_temperature"],
    "tiepido": ["adjective_temperature"],
    "gelido": ["adjective_temperature"],
    "bollente": ["adjective_temperature"],
    "rovente": ["adjective_temperature"],

    # adjective_evaluation (judgement / value)
    "buono": ["adjective_evaluation"],
    "cattivo": ["adjective_evaluation"],
    "bello": ["adjective_evaluation"],
    "brutto": ["adjective_evaluation"],
    "importante": ["adjective_evaluation"],
    "interessante": ["adjective_evaluation"],
    "famoso": ["adjective_evaluation"],
    "popolare": ["adjective_evaluation"],
    "ottimo": ["adjective_evaluation"],
    "perfetto": ["adjective_evaluation"],
    "terribile": ["adjective_evaluation"],
    "orribile": ["adjective_evaluation"],
    "stupendo": ["adjective_evaluation"],
    "meraviglioso": ["adjective_evaluation"],
    "magnifico": ["adjective_evaluation"],
    "fantastico": ["adjective_evaluation"],
    "splendido": ["adjective_evaluation"],
    "bravo": ["adjective_evaluation"],
    "ideale": ["adjective_evaluation"],
    "eccellente": ["adjective_evaluation"],
    "pessimo": ["adjective_evaluation"],
    "scarso": ["adjective_evaluation"],
    "mediocre": ["adjective_evaluation"],
    "discreto": ["adjective_evaluation"],
    "decente": ["adjective_evaluation"],
    "sbagliato": ["adjective_evaluation"],
    "corretto": ["adjective_evaluation"],
    "giusto": ["adjective_evaluation"],
    "ingiusto": ["adjective_evaluation"],
    "esatto": ["adjective_evaluation"],
    "preciso": ["adjective_evaluation"],
    "vero": ["adjective_evaluation"],
    "falso": ["adjective_evaluation"],
    "reale": ["adjective_evaluation"],
    "fittizio": ["adjective_evaluation"],
    "autentico": ["adjective_evaluation"],
    "originale": ["adjective_evaluation"],
    "previsto": ["adjective_evaluation"],
    "ottimale": ["adjective_evaluation"],

    # adjective_nationality
    "italiano": ["adjective_nationality"],
    "francese": ["adjective_nationality"],
    "tedesco": ["adjective_nationality"],
    "inglese": ["adjective_nationality"],
    "spagnolo": ["adjective_nationality"],
    "russo": ["adjective_nationality"],
    "americano": ["adjective_nationality"],
    "cinese": ["adjective_nationality"],
    "giapponese": ["adjective_nationality"],
    "indiano": ["adjective_nationality"],
    "greco": ["adjective_nationality"],
    "turco": ["adjective_nationality"],
    "arabo": ["adjective_nationality"],
    "ebraico": ["adjective_nationality"],
    "romano": ["adjective_nationality"],
    "veneto": ["adjective_nationality"],
    "siciliano": ["adjective_nationality"],
    "sardo": ["adjective_nationality"],
    "europeo": ["adjective_nationality"],
    "africano": ["adjective_nationality"],
    "asiatico": ["adjective_nationality"],
    "australiano": ["adjective_nationality"],
    "canadese": ["adjective_nationality"],
    "messicano": ["adjective_nationality"],
    "brasiliano": ["adjective_nationality"],
    "argentino": ["adjective_nationality"],
    "portoghese": ["adjective_nationality"],
    "polacco": ["adjective_nationality"],
    "olandese": ["adjective_nationality"],
    "belga": ["adjective_nationality"],
    "svizzero": ["adjective_nationality"],
    "irlandese": ["adjective_nationality"],
    "scozzese": ["adjective_nationality"],
    "norvegese": ["adjective_nationality"],
    "svedese": ["adjective_nationality"],
    "danese": ["adjective_nationality"],
    "finlandese": ["adjective_nationality"],
    "austriaco": ["adjective_nationality"],
    "ungherese": ["adjective_nationality"],
    "ceco": ["adjective_nationality"],
    "slovacco": ["adjective_nationality"],
    "ucraino": ["adjective_nationality"],
    "rumeno": ["adjective_nationality"],
    "bulgaro": ["adjective_nationality"],
    "croato": ["adjective_nationality"],

    # Religion adjectives — semantic theme rather than adjective_subtype
    "cristiano": ["politics_society"],
    "cattolico": ["politics_society"],
    "ebreo": ["politics_society"],
    "musulmano": ["politics_society"],
    "buddhista": ["politics_society"],
    "induista": ["politics_society"],
    "ortodosso": ["politics_society"],
    "protestante": ["politics_society"],
    "religioso": ["politics_society"],
    "ateo": ["politics_society"],

    # Sector / domain adjectives — semantic
    "sociale": ["politics_society"],
    "politico": ["politics_society"],
    "economico": ["work_business"],
    "finanziario": ["work_business"],
    "commerciale": ["work_business"],
    "industriale": ["work_business"],
    "agricolo": ["work_business"],
    "scientifico": ["science_technology"],
    "tecnico": ["science_technology"],
    "tecnologico": ["science_technology"],
    "digitale": ["science_technology"],
    "matematico": ["science_technology"],
    "fisico": ["science_technology"],
    "chimico": ["science_technology"],
    "biologico": ["science_technology"],
    "ecologico": ["science_technology"],
    "medico": ["health_medicine"],
    "sanitario": ["health_medicine"],
    "ospedaliero": ["health_medicine"],
    "legale": ["law_justice"],
    "giuridico": ["law_justice"],
    "penale": ["law_justice"],
    "civile": ["law_justice"],
    "militare": ["politics_society"],
    "federale": ["politics_society"],
    "nazionale": ["politics_society"],
    "internazionale": ["politics_society"],
    "mondiale": ["politics_society"],
    "regionale": ["geography_admin"],
    "locale": ["geography_admin"],
    "comunale": ["geography_admin"],
    "provinciale": ["geography_admin"],
    "rurale": ["geography_admin"],
    "urbano": ["geography_admin"],
    "musicale": ["arts_music"],
    "artistico": ["arts_entertainment"],
    "letterario": ["arts_literature"],
    "teatrale": ["arts_performing"],
    "cinematografico": ["arts_film_tv"],
    "culturale": ["arts_entertainment"],
    "educativo": ["school_education"],
    "scolastico": ["school_education"],
    "universitario": ["school_education"],
    "didattico": ["school_education"],
    "familiare": ["people_family"],
    "personale": ["noun_abstract"],
    "mentale": ["mental_state"],
    "psicologico": ["mental_state"],
    "emotivo": ["emotions"],
    "fisiologico": ["body"],
    "anatomico": ["body"],
    "sessuale": ["body"],
    "alimentare": ["food_drink"],
    "culinario": ["food_drink"],
    "sportivo": ["sports_leisure"],
    "atletico": ["sports_leisure"],
    "olimpico": ["sports_leisure"],
    "naturale": ["nature"],
    "ambientale": ["nature"],
    "climatico": ["weather"],
    "atmosferico": ["weather"],
    "meteorologico": ["weather"],
    "sacro": ["politics_society"],   # religious
    "santo": ["politics_society"],
    "magico": ["arts_entertainment"],
    "mitologico": ["arts_literature"],
    "storico": ["politics_society"],
    "moderno": ["adjective_age"],
}

VERB_REFINEMENTS = {
    # verb_movement — already largely covered, add gaps
    "circondare": ["verb_movement"],
    # verb_state
    "bastare": ["verb_state"],
    "esistere": ["verb_existence"],
    "appartenere": ["verb_possession"],
    "possedere": ["verb_possession"],
    # verb_creation
    "festeggiare": ["verb_routine"],
    # verb_action_general (violence/conflict)
    "combattere": ["verb_destruction"],
    "lottare": ["verb_destruction"],
    "sparare": ["verb_destruction"],
    "uccidere": ["verb_destruction"],
    # verb_communication
    "rapportare": ["verb_communication"],
    "supportare": ["verb_communication"],
    "collaborare": ["verb_communication"],
    "incaricare": ["verb_communication"],
    "votare": ["verb_routine"],
    "obbligare": ["verb_speech_act"],
    "rinunciare": ["verb_state"],
    "consegnare": ["verb_movement"],
    "restituire": ["verb_movement"],
    "ultimare": ["verb_state"],
    "centrare": ["verb_action_general"],   # genuinely general
    "destinare": ["verb_state"],
    "rischiare": ["verb_state"],
    "capitare": ["verb_existence"],
    "succedere": ["verb_existence"],
    "popolare": ["verb_action_general"],
    "gestire": ["verb_action_general"],
    "puntare": ["verb_action_general"],
    "addossare": ["verb_action_general"],
    "fregare": ["verb_action_general"],
}

NOUN_REFINEMENTS = {
    # Sports
    "gara": ["sports_leisure"],
    "team": ["sports_leisure", "work_business"],
    "squadra": ["sports_leisure"],
    "partita": ["sports_leisure"],
    "campionato": ["sports_leisure"],
    "torneo": ["sports_leisure"],
    "vittoria": ["sports_leisure"],
    "sconfitta": ["sports_leisure"],
    "battaglia": ["politics_society"],
    "missione": ["work_business"],
    "incidente": ["health_medicine"],
    "infortunio": ["health_medicine"],
    "ferito": ["health_medicine"],
    "mappa": ["geography_admin"],
    "foto": ["arts_visual"],
    "album": ["arts_music"],
    "successo": ["arts_entertainment"],  # of a song, film, etc.
    "rischio": ["noun_abstract"],
    "sesso": ["body"],
    "pelle": ["body"],   # already body but no harm
    "colpo": ["noun_abstract"],
    "mossa": ["noun_abstract"],
    "filo": ["noun_abstract"],
    "presa": ["noun_abstract"],
    "vicenda": ["noun_abstract"],
    "fretta": ["mental_state"],
    "paura": ["emotions"],
    "speranza": ["emotions"],
    "bisogno": ["noun_abstract"],
    "emergenza": ["health_medicine"],
    "iniziativa": ["work_business"],
    "comportamento": ["mental_state"],
    "vantaggio": ["noun_abstract"],
    "tentativo": ["noun_abstract"],
    "danno": ["noun_abstract"],
    "confronto": ["noun_abstract"],
    "responsabilità": ["noun_abstract"],
    "procedura": ["noun_abstract"],
    "esistenza": ["noun_abstract"],
    "assenza": ["noun_abstract"],
    "mancanza": ["noun_abstract"],
    "apertura": ["noun_abstract"],
    "catena": ["noun_abstract"],
    "avventura": ["arts_literature"],
    "protezione": ["noun_abstract"],
    "assistenza": ["noun_abstract"],
    "possesso": ["noun_abstract"],
    "uso": ["noun_abstract"],
    "livello": ["noun_abstract"],
    "quantità": ["noun_abstract"],
    "qualità": ["noun_abstract"],
    "accesso": ["noun_abstract"],
    "situazione": ["noun_abstract"],
    "importanza": ["noun_abstract"],
    "personale": ["work_business"],
}


def refine(entry, refinement_map, placeholder, pos):
    """Return list of themes to add for this entry, or None if no refinement applies."""
    lemma = entry.get("lemma")
    if not lemma:
        return None
    if entry.get("pos") != pos:
        return None
    if lemma not in refinement_map:
        return None
    themes = entry.get("themes") or []
    # Only refine if the placeholder is one of the current themes
    if placeholder not in themes:
        return None
    return refinement_map[lemma]


def apply_to_entry(entry, new_themes, placeholder_to_replace=None):
    """Apply the new themes, optionally removing the placeholder.
    For semantic themes (like sports_leisure) we keep the placeholder as a
    fallback POS category; for subtype themes (like adverb_negation) we
    replace the placeholder since the subtype is more specific."""
    themes = set(entry.get("themes") or [])
    SUBTYPES = {
        "adverb_negation", "adverb_affirmation", "adverb_time", "adverb_place",
        "adverb_quantity",
        "adjective_size", "adjective_evaluation", "adjective_nationality",
        "adjective_temperature", "adjective_distance", "adjective_age",
        "verb_movement", "verb_communication", "verb_perception",
        "verb_cognition", "verb_emotion", "verb_state", "verb_routine",
        "verb_change", "verb_creation", "verb_destruction", "verb_existence",
        "verb_possession", "verb_speech_act", "verb_weather",
        "verb_inverted_subject",
    }
    refines_to_subtype = any(t in SUBTYPES for t in new_themes)
    if placeholder_to_replace and refines_to_subtype:
        themes.discard(placeholder_to_replace)
    for t in new_themes:
        themes.add(t)
    return sorted(themes)


def main():
    print(f"Loading {DATA}")
    with DATA.open() as f:
        entries = json.load(f)
    print(f"  {len(entries)} entries loaded")

    counts = Counter()
    for e in entries:
        # adverbs
        refinement = refine(e, ADVERB_REFINEMENTS, "adverb_manner", "adverb")
        if refinement:
            new_themes = apply_to_entry(e, refinement, "adverb_manner")
            if set(new_themes) != set(e.get("themes") or []):
                e["themes"] = new_themes
                counts["adverb refined"] += 1
        # adjectives
        refinement = refine(e, ADJECTIVE_REFINEMENTS, "adjective_quality", "adjective")
        if refinement:
            new_themes = apply_to_entry(e, refinement, "adjective_quality")
            if set(new_themes) != set(e.get("themes") or []):
                e["themes"] = new_themes
                counts["adjective refined"] += 1
        # verbs
        refinement = refine(e, VERB_REFINEMENTS, "verb_action_general", "verb")
        if refinement:
            new_themes = apply_to_entry(e, refinement, "verb_action_general")
            if set(new_themes) != set(e.get("themes") or []):
                e["themes"] = new_themes
                counts["verb refined"] += 1
        # nouns
        refinement = refine(e, NOUN_REFINEMENTS, "noun_abstract", "noun")
        if refinement:
            new_themes = apply_to_entry(e, refinement, "noun_abstract")
            if set(new_themes) != set(e.get("themes") or []):
                e["themes"] = new_themes
                counts["noun refined"] += 1

    print(f"\nRefinement counts:")
    for k, v in counts.most_common():
        print(f"  {k}: {v}")
    print(f"\nTotal refinements: {sum(counts.values())}")

    print(f"\nWriting back to {DATA}")
    atomic_write_json(DATA, entries)

    # Verify
    with DATA.open() as f:
        verify = json.load(f)
    placeholder_only = 0
    for e in verify:
        themes = e.get("themes") or []
        if themes and all(t in PLACEHOLDERS for t in themes):
            placeholder_only += 1
    specific = len(verify) - placeholder_only - sum(1 for e in verify if not e.get("themes"))
    print(f"\nAfter pass: {specific} entries with specific themes ({100*specific//len(verify)}%)")
    print(f"          : {placeholder_only} entries placeholder-only ({100*placeholder_only//len(verify)}%)")


if __name__ == "__main__":
    main()
