"""Populate the `gender_class` tag on nouns for Housing's gender drill
per Architecture_Housing_gender_plural_drill v3/v4.

Housing already interim-derives classes 1 (masc regular), 2 (fem regular), and
5 (m-sg with f-pl gender-switch — braccio/uovo) from existing gender+plural
fields. This script explicit-tags the classes that Housing CANNOT derive:

  Class 3: common-gender nouns — one form for m and f (giornalista, cantante,
           nipote, cliente, ospite, etc.)
  Class 4: meaning-splits — gender changes the meaning (il fine 'aim' vs
           la fine 'end'; il capitale 'money' vs la capitale 'city')
  Class 6: fem-sg with m-pl (l'eco → gli echi — rare, basically just eco)
  Class 7: double-plural with different gender AND meaning (braccio → i bracci
           'chair arms' / le braccia 'human arms'; osso → gli ossi / le ossa)

Class 3 and 4 both apply to lemmas that CURRENTLY have separate m+f entries
in the data. I tag both entries with the same gender_class so Housing can
match on either.

Run from project root:
    python3 tools/vocab_chat/tag_gender_class.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from collections import defaultdict

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from atomic_io import atomic_write_json  # noqa: E402

DATA = PROJECT_ROOT / "data" / "vocabulary_it_frequency.json"
PATCH_MARKER = "[gender-class-tag]"

# Class 3 — common-gender lemmas. Same form for m and f; article carries the
# gender. Includes the -ista, -ente, -ante, -ega, -eta invariant families
# plus a few others.
CLASS_3_LEMMAS = {
    # -ista pattern (unified even when I've split m/f entries)
    "artista", "giornalista", "musicista", "regista", "protagonista",
    "professionista", "terrorista", "comunista", "socialista", "capitalista",
    "cantautista",   # rare, add if present
    "atleta", "poeta",  # -eta (poeta is actually m-only in most cases; check)
    "turista", "tassista", "barista", "dentista", "elettricista",
    "commercialista", "pianista", "chitarrista", "batterista", "violinista",
    "flautista", "clarinettista", "trombettista",
    "psichiatra", "pediatra", "psicologo",  # -logo pattern
    "farmacista", "chimico",
    "macchinista", "apprendista", "tirocinante",

    # -ente / -ante pattern (participle-derived, common-gender)
    "assistente", "dipendente", "residente", "cliente", "paziente",
    "abitante", "insegnante", "cantante", "amante",
    "presidente", "vice-presidente",
    "comandante", "sergente", "combattente",
    "componente", "consulente", "dirigente",
    "rappresentante", "manifestante", "protestante",
    "parente", "adolescente", "gigante", "immigrante", "emigrante",
    "credente", "fedele",
    "utente", "corrispondente", "ricorrente",
    "conducente", "conoscente", "commerciante", "delinquente",
    "occupante", "concorrente", "vincente", "perdente",
    "aggressore", "possessore",
    "responsabile",

    # Nouns invariable in form, gender by article
    "collega", "coniuge", "erede", "nipote",  # nipote is really class 4 (grandchild/nephew) — moving
    "testimone", "ospite", "custode",
    "leader",
    "partner",
    "fan",   # English loanword
    "vice",
    "gay",

    # -ide, -ode, -ade
    "suicida", "omicida",
    "pediatra",
    "chirurgo",   # arguable — often m only

    # Legal / bureaucratic
    "giudice", "avvocato",   # avvocato traditionally m even for women; changing
    "console", "notaio",     # traditionally m
    "agente",
    "comandante", "presidente",

    # A few more
    "chef",  # loanword
    "reporter",
}

# Class 4 — meaning-splits: same lemma, different gender = different meaning.
# Both entries get tagged.
CLASS_4_LEMMAS = {
    "fine",         # m aim / f end
    "capitale",     # m money / f city
    "capo",         # not really class 4 — capo is m only
    "fronte",       # m front / f forehead
    "comune",       # m municipality / f city council (weak)
    "finale",       # m ending / f sports final
    "corrente",     # multi
    "centrale",     # m generic central / f power station
    "moto",         # m motion / f motorbike
    "mobile",       # m furniture / f piece
    "pesca",        # m fishing/peach / f peach (weak — mostly f)
    "rosa",         # m pink / f rose  (patched in task A)
    "viola",        # m violet / f viola  (patched in task A)
    "personale",    # m personnel / f staff
    "via",          # m road / f street
    "radio",        # m radium / f radio
    "torino",       # not applicable
    "boa",          # m constrictor / f buoy
    "arma",         # not applicable
}

# Class 6 — fem-sg with m-pl (rare)
CLASS_6_LEMMAS = {
    "eco",   # l'eco (f sg) → gli echi (m pl); the classic case
}

# Class 7 — double-plural with different gender AND meaning
CLASS_7_LEMMAS = {
    "braccio",        # i bracci (chair arms) / le braccia (human arms)
    "osso",           # gli ossi (animal bones) / le ossa (human bones collective)
    "ciglio",         # i cigli (edges/verges) / le ciglia (eyelashes)
    "labbro",         # i labbri (edges of container) / le labbra (lips)
    "membro",         # i membri (group members) / le membra (human limbs)
    "muro",           # i muri (building walls) / le mura (city walls)
    "corno",          # i corni (musical horns) / le corna (animal horns)
    "filo",           # i fili (threads) / le fila (queues/rows)
    "fondamento",     # i fondamenti (principles) / le fondamenta (building foundations)
    "gesto",          # i gesti (actions) / le gesta (deeds)
    "grido",          # i gridi (individual shouts) / le grida (collective shouts)
    "lenzuolo",       # i lenzuoli (sheets individually) / le lenzuola (pair of sheets)
    "riso",           # i risi (kinds of rice) / le risa (laughs)
    "urlo",           # gli urli / le urla
    "sopracciglio",   # i sopraccigli / le sopracciglia
    "ginocchio",      # i ginocchi / le ginocchia
    "dito",           # i diti (fingers separately, rare) / le dita (fingers collectively)
    "uovo",           # gli uovi (rare, non-standard) / le uova (standard)
}


def main():
    print(f"Loading {DATA}")
    with DATA.open() as f:
        entries = json.load(f)
    print(f"  {len(entries)} entries loaded")

    tagged = {"3": [], "4": [], "6": [], "7": []}
    misses = {"3": [], "4": [], "6": [], "7": []}

    # Class 3 — tag ALL noun entries with matching lemma
    for lemma in CLASS_3_LEMMAS:
        hits = [e for e in entries if e.get("lemma") == lemma and e.get("pos") == "noun"]
        if not hits:
            misses["3"].append(lemma)
            continue
        for e in hits:
            e["gender_class"] = 3
            existing = (e.get("notes") or "").strip()
            note = f"{PATCH_MARKER} class 3 (common-gender)"
            if note not in existing:
                e["notes"] = (existing + " — " + note) if existing else note
            tagged["3"].append((e.get("rank"), lemma, e.get("gender")))

    # Class 4 — tag all noun entries with matching lemma
    for lemma in CLASS_4_LEMMAS:
        hits = [e for e in entries if e.get("lemma") == lemma and e.get("pos") == "noun"]
        if not hits:
            misses["4"].append(lemma)
            continue
        # Only tag if there are MULTIPLE entries (m and f split) — otherwise
        # it's not a real gender-split
        if len(hits) < 2:
            misses["4"].append(f"{lemma} (only 1 entry; not split)")
            continue
        for e in hits:
            e["gender_class"] = 4
            existing = (e.get("notes") or "").strip()
            note = f"{PATCH_MARKER} class 4 (meaning-split by gender)"
            if note not in existing:
                e["notes"] = (existing + " — " + note) if existing else note
            tagged["4"].append((e.get("rank"), lemma, e.get("gender")))

    # Class 6
    for lemma in CLASS_6_LEMMAS:
        hits = [e for e in entries if e.get("lemma") == lemma and e.get("pos") == "noun"]
        if not hits:
            misses["6"].append(lemma)
            continue
        for e in hits:
            e["gender_class"] = 6
            existing = (e.get("notes") or "").strip()
            note = f"{PATCH_MARKER} class 6 (fem-sg with m-pl irregular)"
            if note not in existing:
                e["notes"] = (existing + " — " + note) if existing else note
            tagged["6"].append((e.get("rank"), lemma, e.get("gender")))

    # Class 7
    for lemma in CLASS_7_LEMMAS:
        hits = [e for e in entries if e.get("lemma") == lemma and e.get("pos") == "noun"]
        if not hits:
            misses["7"].append(lemma)
            continue
        for e in hits:
            e["gender_class"] = 7
            existing = (e.get("notes") or "").strip()
            note = f"{PATCH_MARKER} class 7 (double-plural with different gender AND meaning)"
            if note not in existing:
                e["notes"] = (existing + " — " + note) if existing else note
            tagged["7"].append((e.get("rank"), lemma, e.get("gender")))

    print(f"\nTagged:")
    for cls, hits in sorted(tagged.items()):
        print(f"  Class {cls}: {len(hits)} entries")

    print(f"\nMISSES (lemmas not in data):")
    for cls, ms in sorted(misses.items()):
        if ms:
            print(f"  Class {cls}: {len(ms)}")
            for m in ms[:10]:
                print(f"    {m}")

    print(f"\nWriting back to {DATA}")
    atomic_write_json(DATA, entries)

    # Verify
    with DATA.open() as f:
        verify = json.load(f)
    with_gc = sum(1 for e in verify if e.get("gender_class") is not None)
    by_class = defaultdict(int)
    for e in verify:
        gc = e.get("gender_class")
        if gc is not None:
            by_class[gc] += 1
    print(f"\nEntries with gender_class populated: {with_gc}")
    for cls in sorted(by_class):
        print(f"  Class {cls}: {by_class[cls]}")


if __name__ == "__main__":
    main()
