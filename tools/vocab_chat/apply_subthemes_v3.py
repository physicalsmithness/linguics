"""Apply the 33 ratified sub-themes (body_*, places_*, transport_*, roles_*)
to entries currently tagged with body / city_places / transport / people_roles,
plus reassignments to the 3 new top-level themes (personal_care,
geography_admin, direction) per Architecture_Vocab_subtheme_proposals v2.

Per the parent+child convention: entries tagged with a sub-theme also keep
the parent theme. Exception: REASSIGN_MAP entries get their old parent
REMOVED and a new top-level theme added (these lemmas don't belong under
the old parent at all).

Run from project root:
    python3 tools/vocab_chat/apply_subthemes_v3.py
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


# Lemma → sub-theme(s). Lemma can be tagged with multiple sub-themes (dual-tag);
# parent is automatically preserved.
# Coverage is comprehensive for the high-frequency end; long-tail entries
# without a mapping just keep the parent.

SUB_THEMES = {
    # ============ body_head ============
    "testa": ["body_head"],
    "faccia": ["body_head"],
    "viso": ["body_head"],
    "volto": ["body_head"],
    "fronte": ["body_head"],   # both gendered entries
    "mento": ["body_head"],
    "guancia": ["body_head"],
    "occhio": ["body_head"],
    "orecchio": ["body_head"],
    "naso": ["body_head"],
    "bocca": ["body_head"],
    "labbro": ["body_head"],
    "dente": ["body_head"],
    "lingua": ["body_head"],
    "sopracciglio": ["body_head"],
    "ciglio": ["body_head"],
    "palpebra": ["body_head"],
    "mascella": ["body_head", "body_internal"],
    "nuca": ["body_head"],
    "tempia": ["body_head"],
    "muso": ["body_head", "body_animal_part"],
    "incisivo": ["body_head"],
    "canino": ["body_head"],
    "gengiva": ["body_head"],
    "calcagno": ["body_limbs"],
    "lineamento": ["body_head"],
    "connotato": ["body_head"],
    "timpano": ["body_head"],
    "tuba": ["body_head"],
    "becco": ["body_animal_part"],
    "ano": ["body_torso"],

    # ============ body_limbs ============
    "braccio": ["body_limbs"],
    "mano": ["body_limbs"],
    "dito": ["body_limbs"],
    "gamba": ["body_limbs"],
    "piede": ["body_limbs"],
    "ginocchio": ["body_limbs"],
    "gomito": ["body_limbs"],
    "polso": ["body_limbs"],
    "caviglia": ["body_limbs"],
    "spalla": ["body_limbs"],
    "coscia": ["body_limbs"],
    "palmo": ["body_limbs"],
    "unghia": ["body_limbs"],
    "anca": ["body_limbs"],
    "mignolo": ["body_limbs"],
    "polpaccio": ["body_limbs"],
    "femore": ["body_limbs", "body_internal"],
    "tallone": ["body_limbs"],
    "pollice": ["body_limbs"],
    "arto": ["body_limbs"],
    "avambraccio": ["body_limbs"],
    "pugno": ["body_limbs"],

    # ============ body_torso ============
    "petto": ["body_torso"],
    "schiena": ["body_torso"],
    "vita": ["body_torso"],
    "fianco": ["body_torso"],
    "pancia": ["body_torso"],
    "collo": ["body_torso"],
    "gola": ["body_torso"],
    "torace": ["body_torso"],
    "ventre": ["body_torso"],
    "dorso": ["body_torso"],
    "costola": ["body_torso", "body_internal"],
    "seno": ["body_torso"],
    "busto": ["body_torso"],
    "torso": ["body_torso"],
    "posteriore": ["body_torso"],
    "sedere": ["body_torso"],
    "chiappa": ["body_torso"],
    "ombelico": ["body_torso"],
    "tetta": ["body_torso"],
    "mammella": ["body_torso", "body_animal_part"],

    # ============ body_internal ============
    "cuore": ["body_internal"],
    "polmone": ["body_internal"],
    "fegato": ["body_internal"],
    "stomaco": ["body_internal"],
    "cervello": ["body_internal"],
    "rene": ["body_internal"],
    "intestino": ["body_internal"],
    "osso": ["body_internal"],
    "muscolo": ["body_internal"],
    "nervo": ["body_internal"],
    "cranio": ["body_internal"],
    "arteria": ["body_internal"],
    "vena": ["body_internal"],
    "ghiandola": ["body_internal"],
    "neurone": ["body_internal"],
    "midollo": ["body_internal"],
    "scheletro": ["body_internal"],
    "vescica": ["body_internal"],
    "milza": ["body_internal"],
    "pancreas": ["body_internal"],
    "vertebra": ["body_internal"],
    "mandibola": ["body_head", "body_internal"],
    "tendine": ["body_internal"],
    "placenta": ["body_internal"],
    "prostata": ["body_internal"],
    "tiroide": ["body_internal"],
    "utero": ["body_internal"],
    "vagina": ["body_internal"],
    "ovaia": ["body_internal"],
    "ovulo": ["body_internal"],
    "testicolo": ["body_internal"],
    "spermatozoo": ["body_internal"],
    "sperma": ["body_surface", "body_internal"],
    "diaframma": ["body_internal"],
    "globulo": ["body_internal"],
    "retto": ["body_internal"],
    "colon": ["body_internal"],
    "atlante": ["body_internal"],
    "atrio": ["body_internal"],
    "viscere": ["body_internal"],
    "budello": ["body_internal"],
    "bulbo": ["body_internal"],
    "lobo": ["body_internal"],
    "membrana": ["body_internal"],
    "ascella": ["body_torso", "body_internal"],
    "apparato": ["body_internal"],
    "articolazione": ["body_internal"],
    "legamento": ["body_internal"],
    "emisfero": ["body_internal"],
    "retina": ["body_internal"],
    "recettore": ["body_internal"],
    "bile": ["body_internal"],
    "ano": ["body_torso", "body_internal"],
    "genitale": ["body_internal"],
    "adrenalina": ["body_internal"],
    "cavità": ["body_internal"],
    "intima": ["body_internal"],
    "setto": ["body_internal"],
    "arcata": ["body_internal"],
    "pettorale": ["body_internal"],

    # ============ body_surface ============
    "pelle": ["body_surface"],
    "capello": ["body_surface", "body_head"],
    "pelo": ["body_surface"],
    "barba": ["body_surface", "body_head"],
    "baffo": ["body_surface", "body_head"],
    "sangue": ["body_surface", "body_internal"],
    "lacrima": ["body_surface"],
    "saliva": ["body_surface"],
    "bava": ["body_surface"],
    "sputo": ["body_surface"],
    "muco": ["body_surface"],
    "siero": ["body_surface"],
    "linfa": ["body_surface"],
    "ciuffo": ["body_surface", "body_head"],
    "treccia": ["body_surface", "body_head"],
    "ciocca": ["body_surface", "body_head"],
    "chioma": ["body_surface", "body_head"],
    "cute": ["body_surface"],
    "acconciatura": ["body_surface", "body_head"],
    "buccia": ["body_surface"],
    "poro": ["body_surface"],

    # ============ body_animal_part ============
    "zampa": ["body_animal_part"],
    "ala": ["body_animal_part"],
    "coda": ["body_animal_part"],
    "corno": ["body_animal_part"],
    "becco": ["body_animal_part", "body_head"],
    "piuma": ["body_animal_part"],
    "pinna": ["body_animal_part"],
    "pelliccia": ["body_animal_part", "body_surface"],

    # ============ places_commerce ============
    "mercato": ["places_commerce"],
    "ristorante": ["places_commerce"],
    "bar": ["places_commerce"],
    "caffè": ["places_commerce"],
    "negozio": ["places_commerce"],
    "panetteria": ["places_commerce"],
    "macelleria": ["places_commerce"],
    "supermercato": ["places_commerce"],
    "banca": ["places_commerce"],
    "libreria": ["places_commerce"],
    "discoteca": ["places_commerce"],
    "pub": ["places_commerce"],
    "hotel": ["places_commerce"],
    "distributore": ["places_commerce"],
    "fiera": ["places_commerce"],
    "pizzeria": ["places_commerce"],
    "mercatino": ["places_commerce"],
    "pasticceria": ["places_commerce"],
    "gastronomia": ["places_commerce"],
    "osteria": ["places_commerce"],
    "trattoria": ["places_commerce"],
    "boutique": ["places_commerce"],
    "posta": ["places_commerce"],
    "edicola": ["places_commerce"],
    "bottega": ["places_commerce"],
    "benzinaio": ["places_commerce"],

    # ============ places_civic ============
    "comune": ["places_civic"],
    "municipio": ["places_civic", "geography_admin"],
    "tribunale": ["places_civic"],
    "ministero": ["places_civic"],
    "parlamento": ["places_civic"],
    "senato": ["places_civic"],
    "carcere": ["places_civic"],
    "prigione": ["places_civic"],
    "ambasciata": ["places_civic"],
    "caserma": ["places_civic"],
    "palazzo": ["places_civic"],
    "consolato": ["places_civic"],
    "consultorio": ["places_civic", "places_health"],
    "prefettura": ["places_civic"],
    "questura": ["places_civic"],
    "ufficio": ["places_civic"],

    # ============ places_education ============
    "scuola": ["places_education"],
    "università": ["places_education"],
    "liceo": ["places_education"],
    "biblioteca": ["places_education"],
    "istituto": ["places_education"],
    "collegio": ["places_education"],
    "asilo": ["places_education"],
    "archivio": ["places_education"],
    "campus": ["places_education"],

    # ============ places_health ============
    "ospedale": ["places_health"],
    "clinica": ["places_health"],
    "farmacia": ["places_health"],
    "ambulatorio": ["places_health"],

    # ============ places_culture ============
    "cinema": ["places_culture"],
    "teatro": ["places_culture"],
    "museo": ["places_culture"],
    "galleria": ["places_culture"],
    "statua": ["places_culture"],
    "monumento": ["places_culture"],
    "castello": ["places_culture"],
    "torre": ["places_culture"],
    "fortezza": ["places_culture"],
    "auditorium": ["places_culture"],
    "stadio": ["places_culture"],
    "rocca": ["places_culture"],

    # ============ places_religious ============
    "chiesa": ["places_religious"],
    "cattedrale": ["places_religious"],
    "tempio": ["places_religious"],
    "parrocchia": ["places_religious"],
    "cimitero": ["places_religious"],
    "moschea": ["places_religious"],
    "sinagoga": ["places_religious"],
    "cappella": ["places_religious"],
    "duomo": ["places_religious"],
    "santuario": ["places_religious"],
    "basilica": ["places_religious"],
    "mecca": ["places_religious"],
    "diocesi": ["places_religious"],

    # ============ places_transit ============
    "stazione": ["places_transit"],
    "aeroporto": ["places_transit", "transport_infrastructure"],
    "porto": ["places_transit"],
    "capolinea": ["places_transit"],
    "biglietteria": ["places_transit", "transport_document"],
    "banchina": ["places_transit", "transport_infrastructure"],

    # ============ places_outdoor ============
    "piazza": ["places_outdoor"],
    "via": ["places_outdoor", "transport_infrastructure"],
    "strada": ["places_outdoor", "transport_infrastructure"],
    "corso": ["places_outdoor", "transport_infrastructure"],
    "viale": ["places_outdoor", "transport_infrastructure"],
    "vicolo": ["places_outdoor", "transport_infrastructure"],
    "parco": ["places_outdoor"],
    "giardino": ["places_outdoor"],
    "spiaggia": ["places_outdoor"],
    "ponte": ["places_outdoor", "transport_infrastructure"],
    "sentiero": ["places_outdoor"],
    "piazzale": ["places_outdoor"],
    "marciapiede": ["places_outdoor", "transport_infrastructure"],
    "vetta": ["places_outdoor"],
    "picco": ["places_outdoor"],
    "prateria": ["places_outdoor"],
    "giungla": ["places_outdoor"],
    "deserto": ["places_outdoor"],
    "oasi": ["places_outdoor"],
    "lungomare": ["places_outdoor"],
    "contrada": ["places_outdoor"],
    "arena": ["places_outdoor"],
    "tana": ["places_outdoor"],
    "vivaio": ["places_outdoor"],
    "fontana": ["places_outdoor"],
    "epicentro": ["places_outdoor"],
    "litorale": ["places_outdoor"],
    "rada": ["places_outdoor"],
    "radura": ["places_outdoor"],
    "appezzamento": ["places_outdoor"],
    "pascolo": ["places_outdoor"],
    "ghetto": ["places_outdoor"],
    "ronda": ["places_outdoor"],

    # ============ transport_land ============
    "macchina": ["transport_land"],
    "auto": ["transport_land"],
    "automobile": ["transport_land"],
    "treno": ["transport_land"],
    "autobus": ["transport_land"],
    "bicicletta": ["transport_land"],
    "bici": ["transport_land"],
    "taxi": ["transport_land"],
    "camion": ["transport_land"],
    "furgone": ["transport_land"],
    "moto": ["transport_land"],   # both moto (f) and moto (m); m sense will dual-tag but stays in transport per existing tag
    "motorino": ["transport_land"],
    "motocicletta": ["transport_land"],
    "pullman": ["transport_land"],
    "metropolitana": ["transport_land"],
    "tram": ["transport_land"],
    "scooter": ["transport_land"],
    "berlina": ["transport_land"],
    "limousine": ["transport_land"],
    "autocarro": ["transport_land"],
    "camioncino": ["transport_land"],

    # ============ transport_water ============
    "nave": ["transport_water"],
    "barca": ["transport_water"],
    "traghetto": ["transport_water"],
    "yacht": ["transport_water"],
    "canoa": ["transport_water"],
    "gommone": ["transport_water"],
    "kayak": ["transport_water"],

    # ============ transport_air ============
    "aereo": ["transport_air"],
    "elicottero": ["transport_air"],
    "jet": ["transport_air"],
    "aeroplano": ["transport_air"],
    "navetta": ["transport_air"],

    # ============ transport_part ============
    "motore": ["transport_part"],
    "ruota": ["transport_part"],
    "volante": ["transport_part"],
    "freno": ["transport_part"],
    "gomma": ["transport_part"],
    "sedile": ["transport_part"],
    "finestrino": ["transport_part"],
    "cintura": ["transport_part"],
    "serbatoio": ["transport_part"],
    "pneumatico": ["transport_part"],
    "faro": ["transport_part"],
    "fanale": ["transport_part"],
    "paraurti": ["transport_part"],
    "cofano": ["transport_part"],
    "cruscotto": ["transport_part"],
    "frizione": ["transport_part"],
    "pedale": ["transport_part"],
    "portiera": ["transport_part"],
    "specchietto": ["transport_part"],
    "olio": ["transport_part"],
    "benzina": ["transport_part"],
    "gasolio": ["transport_part"],
    "rimorchio": ["transport_part"],

    # ============ transport_infrastructure ============
    "autostrada": ["transport_infrastructure"],
    "superstrada": ["transport_infrastructure"],
    "tangenziale": ["transport_infrastructure"],
    "binario": ["transport_infrastructure"],
    "parcheggio": ["transport_infrastructure"],
    "garage": ["transport_infrastructure"],
    "pista": ["transport_infrastructure"],
    "semaforo": ["transport_infrastructure"],
    "incrocio": ["transport_infrastructure"],
    "segnale": ["transport_infrastructure"],
    "traffico": ["transport_infrastructure"],

    # ============ transport_journey ============
    "viaggio": ["transport_journey"],
    "partenza": ["transport_journey"],
    "arrivo": ["transport_journey"],
    "destinazione": ["transport_journey"],
    "percorso": ["transport_journey"],
    "itinerario": ["transport_journey"],
    "tragitto": ["transport_journey"],
    "sosta": ["transport_journey"],
    "marcia": ["transport_journey"],
    "rotta": ["transport_journey"],
    "andatura": ["transport_journey"],
    "cambio": ["transport_journey"],

    # ============ transport_document ============
    "biglietto": ["transport_document"],
    "patente": ["transport_document"],
    "abbonamento": ["transport_document"],
    "assicurazione": ["transport_document"],
    "multa": ["transport_document"],
    "libretto": ["transport_document"],
    "contravvenzione": ["transport_document"],
    "targa": ["transport_document"],

    # ============ roles_political ============
    "presidente": ["roles_political"],
    "ministro": ["roles_political"],
    "senatore": ["roles_political"],
    "sindaco": ["roles_political"],
    "deputato": ["roles_political"],
    "politico": ["roles_political"],
    "leader": ["roles_political"],
    "consigliere": ["roles_political"],
    "principe": ["roles_political"],
    "ambasciatore": ["roles_political"],

    # ============ roles_legal ============
    "giudice": ["roles_legal"],
    "avvocato": ["roles_legal"],
    "procuratore": ["roles_legal"],
    "testimone": ["roles_legal"],
    "magistrato": ["roles_legal"],
    "notaio": ["roles_legal"],
    "console": ["roles_legal", "roles_political"],

    # ============ roles_security ============
    "militare": ["roles_security"],
    "soldato": ["roles_security"],
    "generale": ["roles_security"],
    "polizia": ["roles_security"],
    "poliziotto": ["roles_security"],
    "guardia": ["roles_security"],
    "carabiniere": ["roles_security"],
    "capitano": ["roles_security"],
    "colonnello": ["roles_security"],
    "sergente": ["roles_security"],
    "vigile": ["roles_security"],
    "pompiere": ["roles_security"],

    # ============ roles_education ============
    "professore": ["roles_education"],
    "insegnante": ["roles_education"],
    "maestro": ["roles_education"],
    "maestra": ["roles_education"],
    "studente": ["roles_education"],
    "alunno": ["roles_education"],
    "allievo": ["roles_education"],
    "preside": ["roles_education"],
    "studentessa": ["roles_education"],
    "professoressa": ["roles_education"],
    "apprendista": ["roles_education", "roles_trade_service"],
    "tirocinante": ["roles_education"],

    # ============ roles_medical ============
    "medico": ["roles_medical"],
    "dottore": ["roles_medical"],
    "infermiere": ["roles_medical"],
    "chirurgo": ["roles_medical"],
    "psicologo": ["roles_medical"],
    "psichiatra": ["roles_medical"],
    "veterinario": ["roles_medical"],
    "farmacista": ["roles_medical"],
    "dentista": ["roles_medical"],
    "pediatra": ["roles_medical"],

    # ============ roles_religious ============
    "papa": ["roles_religious", "roles_political"],
    "prete": ["roles_religious"],
    "don": ["roles_religious"],
    "sacerdote": ["roles_religious"],
    "vescovo": ["roles_religious"],
    "suora": ["roles_religious"],
    "cardinale": ["roles_religious"],
    "monaco": ["roles_religious"],
    "monaca": ["roles_religious"],
    "frate": ["roles_religious"],
    "pastore": ["roles_religious", "roles_trade_service"],
    "pastore_shepherd_only": ["roles_trade_service"],  # placeholder for future split if needed

    # ============ roles_arts_media ============
    "artista": ["roles_arts_media"],
    "attore": ["roles_arts_media"],
    "attrice": ["roles_arts_media"],
    "regista": ["roles_arts_media"],
    "scrittore": ["roles_arts_media"],
    "autore": ["roles_arts_media"],
    "musicista": ["roles_arts_media"],
    "cantante": ["roles_arts_media"],
    "pittore": ["roles_arts_media"],
    "poeta": ["roles_arts_media"],
    "giornalista": ["roles_arts_media"],
    "fotografo": ["roles_arts_media"],
    "produttore": ["roles_arts_media"],
    "critico": ["roles_arts_media"],
    "scultore": ["roles_arts_media"],
    "ballerino": ["roles_arts_media"],
    "reporter": ["roles_arts_media"],
    "chef": ["roles_arts_media", "roles_trade_service"],

    # ============ roles_business ============
    "direttore": ["roles_business"],
    "dirigente": ["roles_business"],
    "amministratore": ["roles_business"],
    "manager": ["roles_business"],
    "capo": ["roles_business"],
    "segretario": ["roles_business"],
    "segretaria": ["roles_business"],
    "dipendente": ["roles_business"],
    "impiegato": ["roles_business"],
    "assistente": ["roles_business"],
    "consulente": ["roles_business"],
    "controllore": ["roles_business"],
    "proprietario": ["roles_business"],

    # ============ roles_trade_service ============
    "fornaio": ["roles_trade_service"],
    "macellaio": ["roles_trade_service"],
    "cuoco": ["roles_trade_service"],
    "cameriere": ["roles_trade_service"],
    "cameriera": ["roles_trade_service"],
    "autista": ["roles_trade_service"],
    "meccanico": ["roles_trade_service"],
    "idraulico": ["roles_trade_service"],
    "commesso": ["roles_trade_service"],
    "commerciante": ["roles_trade_service"],
    "venditore": ["roles_trade_service"],
    "pescatore": ["roles_trade_service"],
    "agricoltore": ["roles_trade_service"],
    "contadino": ["roles_trade_service"],
    "marinaio": ["roles_trade_service"],
    "operaio": ["roles_trade_service"],
    "sarta": ["roles_trade_service"],
    "sarto": ["roles_trade_service"],
    "parrucchiere": ["roles_trade_service"],
    "parrucchiera": ["roles_trade_service"],
    "falegname": ["roles_trade_service"],
    "allevatore": ["roles_trade_service"],
    "barista": ["roles_trade_service"],
    "barbiere": ["roles_trade_service"],
    "tassista": ["roles_trade_service"],
    "muratore": ["roles_trade_service"],
    "cassiere": ["roles_trade_service"],
    "estetista": ["roles_trade_service"],
    "macchinista": ["roles_trade_service"],
    "lavoratore": ["roles_trade_service"],

    # ============ roles_technical_science ============
    "ingegnere": ["roles_technical_science"],
    "scienziato": ["roles_technical_science"],
    "tecnico": ["roles_technical_science"],
    "ricercatore": ["roles_technical_science"],
    "architetto": ["roles_technical_science"],
    "commercialista": ["roles_technical_science", "roles_business"],

    # ============ roles_sports ============
    "giocatore": ["roles_sports"],
    "atleta": ["roles_sports"],

    # ============ roles_status_general ============
    "cittadino": ["roles_status_general"],
    "residente": ["roles_status_general"],
    "abitante": ["roles_status_general", "geography_admin"],
    "signore": ["roles_status_general"],
    "ospite": ["roles_status_general"],
    "esperto": ["roles_status_general"],
    "professionista": ["roles_status_general"],
    "utente": ["roles_status_general"],
    "consumatore": ["roles_status_general"],
    "turista": ["roles_status_general"],
    "visitatore": ["roles_status_general"],
    "viaggiatore": ["roles_status_general"],
    "pedone": ["roles_status_general"],
    "ciclista": ["roles_status_general", "roles_sports"],
    "passeggero": ["roles_status_general"],
    "invitato": ["roles_status_general"],
    "automobilista": ["roles_status_general"],
    "motociclista": ["roles_status_general"],
    "rappresentante": ["roles_status_general", "roles_political"],
    "cliente": ["roles_status_general"],
}


# Lemmas to REASSIGN: remove old parent, add new top-level theme.
# Per architect v2 §3 of subtheme proposals thread.
REASSIGN_MAP = {
    # personal_care: move OFF body INTO personal_care
    "asciugamano": {"remove": ["body"], "add": ["personal_care"]},
    "spazzola": {"remove": ["body"], "add": ["personal_care"]},
    "pettine": {"remove": ["body"], "add": ["personal_care"]},
    "spazzolino": {"remove": ["body"], "add": ["personal_care"]},
    "dentifricio": {"remove": ["body"], "add": ["personal_care"]},
    "sapone": {"remove": ["body"], "add": ["personal_care"]},
    "shampoo": {"remove": ["body"], "add": ["personal_care"]},
    "rasoio": {"remove": ["body"], "add": ["personal_care"]},
    "profumo": {"remove": ["body"], "add": ["personal_care"]},
    "deodorante": {"remove": ["body"], "add": ["personal_care"]},
    # crema, forbici, specchio: may or may not be tagged with body; reassignment only fires if currently tagged.

    # geography_admin: move OFF city_places INTO geography_admin
    "paese": {"remove": ["city_places"], "add": ["geography_admin"]},
    "città": {"remove": ["city_places"], "add": ["geography_admin"]},
    "quartiere": {"remove": ["city_places"], "add": ["geography_admin"]},
    "distretto": {"remove": ["city_places"], "add": ["geography_admin"]},
    "territorio": {"remove": ["city_places"], "add": ["geography_admin"]},
    "capitale": {"remove": ["city_places"], "add": ["geography_admin"]},
    "periferia": {"remove": ["city_places"], "add": ["geography_admin"]},
    "regione": {"remove": ["city_places"], "add": ["geography_admin"]},
    "provincia": {"remove": ["city_places"], "add": ["geography_admin"]},
    "nazione": {"remove": ["city_places"], "add": ["geography_admin"]},
    "confine": {"remove": ["city_places"], "add": ["geography_admin"]},
    "frontiera": {"remove": ["city_places"], "add": ["geography_admin"]},
    "cittadina": {"remove": ["city_places"], "add": ["geography_admin"]},
    "contea": {"remove": ["city_places"], "add": ["geography_admin"]},
    "borgo": {"remove": ["city_places"], "add": ["geography_admin"]},
    "casale": {"remove": ["city_places"], "add": ["geography_admin"]},
    "capoluogo": {"remove": ["city_places"], "add": ["geography_admin"]},
    "sobborgo": {"remove": ["city_places"], "add": ["geography_admin"]},
    "frazione": {"remove": ["city_places"], "add": ["geography_admin"]},
    "località": {"remove": ["city_places"], "add": ["geography_admin"]},
    "rione": {"remove": ["city_places"], "add": ["geography_admin"]},
    "metropoli": {"remove": ["city_places"], "add": ["geography_admin"]},
    "cittadella": {"remove": ["city_places"], "add": ["geography_admin"]},
    "circondario": {"remove": ["city_places"], "add": ["geography_admin"]},
    "zona": {"remove": ["city_places"], "add": ["geography_admin"]},

    # Country names (currently city_places) — these are geography_admin
    "italia": {"remove": ["city_places"], "add": ["geography_admin"]},
    "germania": {"remove": ["city_places"], "add": ["geography_admin"]},
    "francia": {"remove": ["city_places"], "add": ["geography_admin"]},
    "grecia": {"remove": ["city_places"], "add": ["geography_admin"]},
    "austria": {"remove": ["city_places"], "add": ["geography_admin"]},
    "ucraina": {"remove": ["city_places"], "add": ["geography_admin"]},
    "vietnam": {"remove": ["city_places"], "add": ["geography_admin"]},
    "messico": {"remove": ["city_places"], "add": ["geography_admin"]},
    "giappone": {"remove": ["city_places"], "add": ["geography_admin"]},
    "argentina": {"remove": ["city_places"], "add": ["geography_admin"]},
    "svizzera": {"remove": ["city_places"], "add": ["geography_admin"]},
    "india": {"remove": ["city_places"], "add": ["geography_admin"]},
    "cina": {"remove": ["city_places"], "add": ["geography_admin"]},
    "macedonia": {"remove": ["city_places"], "add": ["geography_admin"]},
    "sicilia": {"remove": ["city_places"], "add": ["geography_admin"]},
    "sardegna": {"remove": ["city_places"], "add": ["geography_admin"]},
    "veneto": {"remove": ["city_places"], "add": ["geography_admin"]},
    "bretagna": {"remove": ["city_places"], "add": ["geography_admin"]},
    "irlanda": {"remove": ["city_places"], "add": ["geography_admin"]},
    "belgio": {"remove": ["city_places"], "add": ["geography_admin"]},
    "turchia": {"remove": ["city_places"], "add": ["geography_admin"]},
    "malta": {"remove": ["city_places"], "add": ["geography_admin"]},
    "siam": {"remove": ["city_places"], "add": ["geography_admin"]},
    "california": {"remove": ["city_places"], "add": ["geography_admin"]},
    "canada": {"remove": ["city_places"], "add": ["geography_admin"]},

    # City names — these are geography_admin too (proper-noun places)
    "roma": {"remove": ["city_places"], "add": ["geography_admin"]},
    "milano": {"remove": ["city_places"], "add": ["geography_admin"]},
    "venezia": {"remove": ["city_places"], "add": ["geography_admin"]},
    "torino": {"remove": ["city_places"], "add": ["geography_admin"]},
    "madrid": {"remove": ["city_places"], "add": ["geography_admin"]},
    "berlino": {"remove": ["city_places"], "add": ["geography_admin"]},
    "amsterdam": {"remove": ["city_places"], "add": ["geography_admin"]},
    "verona": {"remove": ["city_places"], "add": ["geography_admin"]},
    "dublino": {"remove": ["city_places"], "add": ["geography_admin"]},
    "mecca": {"remove": ["city_places"], "add": ["geography_admin"]},  # Mecca city; also has religious sub-theme
    "troia": {"remove": ["city_places"], "add": ["geography_admin"]},  # Troy

    # direction: move OFF city_places INTO direction
    "nord": {"remove": ["city_places"], "add": ["direction"]},
    "sud": {"remove": ["city_places"], "add": ["direction"]},
    "est": {"remove": ["city_places"], "add": ["direction"]},
    "ovest": {"remove": ["city_places"], "add": ["direction"]},
    "oriente": {"remove": ["city_places"], "add": ["direction"]},
    "occidente": {"remove": ["city_places"], "add": ["direction"]},
}


def main():
    print(f"Loading {DATA}")
    with DATA.open() as f:
        entries = json.load(f)
    print(f"  {len(entries)} entries loaded")

    # The four parent themes that gate sub-theme application
    SUB_THEME_PARENTS = {
        "body_head", "body_limbs", "body_torso", "body_internal", "body_surface", "body_animal_part",
        "places_commerce", "places_civic", "places_education", "places_health",
        "places_culture", "places_religious", "places_transit", "places_outdoor",
        "transport_land", "transport_water", "transport_air", "transport_part",
        "transport_infrastructure", "transport_journey", "transport_document",
        "roles_political", "roles_legal", "roles_security", "roles_education",
        "roles_medical", "roles_religious", "roles_arts_media", "roles_business",
        "roles_trade_service", "roles_technical_science", "roles_sports",
        "roles_status_general",
    }
    SUB_TO_PARENT = {
        **{s: "body" for s in ["body_head", "body_limbs", "body_torso", "body_internal", "body_surface", "body_animal_part"]},
        **{s: "city_places" for s in ["places_commerce", "places_civic", "places_education", "places_health", "places_culture", "places_religious", "places_transit", "places_outdoor"]},
        **{s: "transport" for s in ["transport_land", "transport_water", "transport_air", "transport_part", "transport_infrastructure", "transport_journey", "transport_document"]},
        **{s: "people_roles" for s in ["roles_political", "roles_legal", "roles_security", "roles_education", "roles_medical", "roles_religious", "roles_arts_media", "roles_business", "roles_trade_service", "roles_technical_science", "roles_sports", "roles_status_general"]},
    }

    subtheme_applies = 0
    reassign_applies = 0
    parent_added_from_subtheme = 0
    subtheme_by_parent = Counter()
    reassigned_by_target = Counter()

    for e in entries:
        lemma = e.get("lemma")
        if not lemma:
            continue
        themes = e.get("themes") or []
        themes_set = set(themes)

        # Apply sub-themes
        if lemma in SUB_THEMES:
            subthemes_to_add = SUB_THEMES[lemma]
            for st in subthemes_to_add:
                if st in SUB_THEME_PARENTS:
                    parent = SUB_TO_PARENT[st]
                    if parent in themes_set:
                        # Entry IS tagged with parent — apply sub-theme
                        if st not in themes_set:
                            themes_set.add(st)
                            subtheme_applies += 1
                            subtheme_by_parent[parent] += 1
                # Sub-themes that aren't in our SUB_THEME_PARENTS set (e.g. food_fruit
                # from old v2) shouldn't appear here but skip safely if so.

        # Apply reassignments (remove old parent, add new top-level)
        if lemma in REASSIGN_MAP:
            mapping = REASSIGN_MAP[lemma]
            for r in mapping["remove"]:
                if r in themes_set:
                    themes_set.discard(r)
                    # Also remove any sub-themes that belong to the removed parent
                    for st in list(themes_set):
                        if st in SUB_TO_PARENT and SUB_TO_PARENT[st] == r:
                            themes_set.discard(st)
            for a in mapping["add"]:
                if a not in themes_set:
                    themes_set.add(a)
                    reassign_applies += 1
                    reassigned_by_target[a] += 1

        # Ensure parent is present whenever a sub-theme is — defensive
        for st in list(themes_set):
            if st in SUB_TO_PARENT:
                parent = SUB_TO_PARENT[st]
                if parent not in themes_set:
                    themes_set.add(parent)
                    parent_added_from_subtheme += 1

        # Write back if changed
        new_themes = sorted(themes_set)
        if new_themes != sorted(themes):
            e["themes"] = new_themes

    print(f"\nSub-theme applies: {subtheme_applies}")
    print("  By parent:")
    for parent, n in subtheme_by_parent.most_common():
        print(f"    {parent}: {n}")

    print(f"\nReassignment applies: {reassign_applies}")
    print("  By new top-level theme:")
    for t, n in reassigned_by_target.most_common():
        print(f"    {t}: {n}")

    print(f"\nParent-added defensively: {parent_added_from_subtheme}")

    print(f"\nWriting back to {DATA}")
    atomic_write_json(DATA, entries)

    # Verify
    with DATA.open() as f:
        verify = json.load(f)
    for parent in ["body", "city_places", "transport", "people_roles", "personal_care", "geography_admin", "direction"]:
        n = sum(1 for e in verify if parent in (e.get("themes") or []))
        print(f"  Entries with theme '{parent}': {n}")

    # Count of entries with at least one sub-theme
    sub_tagged = 0
    for e in verify:
        themes = e.get("themes") or []
        if any(t in SUB_THEME_PARENTS for t in themes):
            sub_tagged += 1
    print(f"\n  Entries with at least one of the new 33 sub-themes: {sub_tagged}")


if __name__ == "__main__":
    main()
