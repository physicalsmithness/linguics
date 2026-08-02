"""Resolve the vocab_help legacy 3-segment bucket residue per
Architecture_Vocab_vocab_help_residue.md (2026-07-27).

For each entry in incoming drafts/vocab_help_legacy_residue.json, decide the
POS from the item's context, then rewrite every item's vocab_help.aspects.*.bucket
reference from the legacy 3-segment id to the new 4-segment id
`vocabulary.it.<lemma>.<pos>.<aspect>`.

Also updates the residue file to remove resolved entries.

Resolutions are hand-picked per lemma-and-context; the architect's message
gave the lemmatisations for the not_in_freq forms, and I've read each item's
prompt to pick POS for the multi_POS_ambiguous cases.

Run from project root:
    python3 tools/vocab_chat/resolve_vocab_help_residue.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from atomic_io import atomic_write_json  # noqa: E402

RESIDUE = PROJECT_ROOT / "incoming drafts" / "vocab_help_legacy_residue.json"
DATA_DIR = PROJECT_ROOT / "data"

# Mapping: legacy_bucket -> (new_lemma, new_pos, aspect)
# aspect is the SAME as the last segment of the legacy bucket.
# new_lemma = the canonical lemma (lemmatised where the legacy id had an inflected form).
# new_pos = the POS resolved from item context (or from the architect's guidance).
RESOLUTIONS = {
    # not_in_freq inflected forms — lemmatise + POS from item context
    "vocabulary.it.amici.translation":       ("amico",       "noun",      "translation"),
    "vocabulary.it.arredato.translation":    ("arredato",    "adjective", "translation"),  # "appartamento arredato"
    "vocabulary.it.bei.translation":         ("bello",       "adjective", "translation"),  # "due bei film"
    "vocabulary.it.belle.translation":       ("bello",       "adjective", "translation"),  # "sono belle"
    "vocabulary.it.braccia.translation":     ("braccio",     "noun",      "translation"),
    "vocabulary.it.buona.translation":       ("buono",       "adjective", "translation"),  # "forma giusta di buono"
    "vocabulary.it.calcio.gender":           ("calcio",      "noun",      "gender"),
    "vocabulary.it.calcio.translation":      ("calcio",      "noun",      "translation"),
    "vocabulary.it.case.translation":        ("casa",        "noun",      "translation"),  # "Le case nuove"
    "vocabulary.it.conosci.translation":     ("conoscere",   "verb",      "translation"),  # "Conosci ____ ragazzo"
    "vocabulary.it.fermata.translation":     ("fermata",     "noun",      "translation"),  # "una fermata dell'autobus"
    "vocabulary.it.genitori.gender":         ("genitore",    "noun",      "gender"),
    "vocabulary.it.genitori.translation":    ("genitore",    "noun",      "translation"),
    "vocabulary.it.grissino.translation":    ("grissino",    "noun",      "translation"),  # "i grissini"
    "vocabulary.it.infornare.translation":   ("infornare",   "verb",      "translation"),
    "vocabulary.it.italiane.translation":    ("italiano",    "adjective", "translation"),  # "spiagge italiane"
    "vocabulary.it.lunga.translation":       ("lungo",       "adjective", "translation"),  # "La notte è lunga"
    "vocabulary.it.marco.translation":       ("marco",       "noun",      "translation"),  # proper noun (Marco)
    "vocabulary.it.migliore.translation":    ("migliore",    "adjective", "translation"),  # "il migliore"
    "vocabulary.it.musica_classica.translation": ("musica_classica", "noun", "translation"),
    "vocabulary.it.neolaureato.translation": ("neolaureato", "noun",      "translation"),
    "vocabulary.it.nonni.translation":       ("nonno",       "noun",      "translation"),
    "vocabulary.it.nuova.translation":       ("nuovo",       "adjective", "translation"),  # "una casa nuova"
    "vocabulary.it.nuove.translation":       ("nuovo",       "adjective", "translation"),  # "Le case nuove"
    "vocabulary.it.passeggiata.translation": ("passeggiata", "noun",      "translation"),  # "went for a walk"
    "vocabulary.it.passero.translation":     ("passero",     "noun",      "translation"),
    "vocabulary.it.rilassato.translation":   ("rilassato",   "adjective", "translation"),  # "si è più rilassato"
    "vocabulary.it.spaghetti.translation":   ("spaghetti",   "noun",      "translation"),
    "vocabulary.it.spiagge.translation":     ("spiaggia",    "noun",      "translation"),  # "Le spiagge"
    "vocabulary.it.sveglia.translation":     ("sveglia",     "noun",      "translation"),  # "senza la sveglia"
    "vocabulary.it.tardi.translation":       ("tardi",       "adverb",    "translation"),  # "arrives late"
    "vocabulary.it.tutti.translation":       ("tutti",       "pronoun",   "translation"),  # "everyone applauded"

    # multi_POS_ambiguous — item context resolved
    "vocabulary.it.Natale.gender":           ("natale",      "noun",      "gender"),       # Christmas — noun (holiday)
    "vocabulary.it.Natale.translation":      ("natale",      "noun",      "translation"),
    "vocabulary.it.alto.translation":        ("alto",        "adjective", "translation"),  # "molto alto" — tall
    "vocabulary.it.amico.translation":       ("amico",       "noun",      "translation"),  # "qualche amico" / "amici"
    "vocabulary.it.ancora.translation":      ("ancora",      "adverb",    "translation"),  # "non ancora" — still/yet
    "vocabulary.it.bambino.translation":     ("bambino",     "noun",      "translation"),  # "I bambini"
    "vocabulary.it.caldo.translation":       ("caldo",       "noun",      "translation"),  # "Fa troppo caldo" — heat as noun in idiom
    "vocabulary.it.cosa.translation":        ("cosa",        "noun",      "translation"),  # "la stessa cosa" — thing
    "vocabulary.it.dato.translation":        ("dato",        "noun",      "translation"),  # "the data" — noun
    "vocabulary.it.diritto.gender":          ("diritto",     "noun",      "gender"),       # "one's own rights" — noun
    "vocabulary.it.diritto.translation":     ("diritto",     "noun",      "translation"),
    "vocabulary.it.disponibile.translation": ("disponibile", "adjective", "translation"),  # available — default adj
    "vocabulary.it.dolce.translation":       ("dolce",       "noun",      "translation"),  # "excellent cakes" — noun
    "vocabulary.it.domani.translation":      ("domani",      "adverb",    "translation"),  # tomorrow
    "vocabulary.it.elegante.translation":    ("elegante",    "adjective", "translation"),  # "eleganti"
    "vocabulary.it.espresso.translation":    ("espresso",    "noun",      "translation"),  # "an espresso" — noun (coffee)
    "vocabulary.it.forte.translation":       ("forte",       "adjective", "translation"),  # "strong hands"
    "vocabulary.it.freddo.translation":      ("freddo",      "noun",      "translation"),  # "it was cold" — noun in idiom
    "vocabulary.it.guasto.translation":      ("guasto",      "adjective", "translation"),  # default adj (broken)
    "vocabulary.it.ieri.translation":        ("ieri",        "adverb",    "translation"),  # yesterday
    "vocabulary.it.indietro.translation":    ("indietro",    "adverb",    "translation"),  # backwards
    "vocabulary.it.lungo.translation":       ("lungo",       "adjective", "translation"),  # "was long"
    "vocabulary.it.mano.gender":             ("mano",        "noun",      "gender"),       # hand
    "vocabulary.it.mano.translation":        ("mano",        "noun",      "translation"),
    "vocabulary.it.ospite.translation":      ("ospite",      "noun",      "translation"),  # "gli ospiti" — guests
    "vocabulary.it.parecchio.translation":   ("parecchio",   "adjective", "translation"),  # default adj/determiner
    "vocabulary.it.patente.gender":          ("patente",     "noun",      "gender"),       # driving licence
    "vocabulary.it.patente.translation":     ("patente",     "noun",      "translation"),
    "vocabulary.it.raro.translation":        ("raro",        "adjective", "translation"),  # "avverbio da raro" — adj is the base
    "vocabulary.it.ricco.translation":       ("ricco",       "adjective", "translation"),  # "he was rich"
    "vocabulary.it.rotondo.translation":     ("rotondo",     "adjective", "translation"),  # "La Terra è rotonda"
    "vocabulary.it.sicuro.translation":      ("sicuro",      "adjective", "translation"),  # "sei sicuro"
    "vocabulary.it.troppo.translation":      ("troppo",      "adverb",    "translation"),  # "talks too much"
    "vocabulary.it.vicino.gender":           ("vicino",      "noun",      "gender"),       # neighbour
    "vocabulary.it.vicino.translation":      ("vicino",      "noun",      "translation"),
}


def new_bucket(lemma, pos, aspect):
    return f"vocabulary.it.{lemma}.{pos}.{aspect}"


def main():
    print(f"Resolving {len(RESOLUTIONS)} residue entries")

    # 1. Walk every item file, rewrite vocab_help.aspects.*.bucket references
    item_files = sorted(list(DATA_DIR.glob("grammar_questions_*.json"))) + \
                 sorted(list(DATA_DIR.glob("translation_items_*.json")))
    total_rewrites = 0
    files_touched = 0

    for fpath in item_files:
        with fpath.open() as f:
            items = json.load(f)
        rewrites_here = 0
        for item in items:
            vh = item.get("vocab_help") or []
            for lemma_entry in vh:
                aspects = lemma_entry.get("aspects") or {}
                for aspect_name, aspect_obj in aspects.items():
                    if not isinstance(aspect_obj, dict):
                        continue
                    old_bucket = aspect_obj.get("bucket", "")
                    if old_bucket in RESOLUTIONS:
                        lemma, pos, aspect = RESOLUTIONS[old_bucket]
                        new_b = new_bucket(lemma, pos, aspect)
                        aspect_obj["bucket"] = new_b
                        # Also update the lemma_entry's lemma if it was an inflected form
                        if lemma_entry.get("lemma") != lemma:
                            # keep the surface form on lemma_entry for matcher purposes;
                            # only the BUCKET points at the canonical lemma
                            pass
                        rewrites_here += 1
        if rewrites_here:
            atomic_write_json(fpath, items)
            files_touched += 1
            total_rewrites += rewrites_here
            print(f"  {fpath.name}: {rewrites_here} rewrites")

    print(f"\nTotal rewrites: {total_rewrites} across {files_touched} files")

    # 2. Update residue file — remove resolved entries
    with RESIDUE.open() as f:
        r = json.load(f)
    resolved_ids = set(RESOLUTIONS.keys())
    remaining = [e for e in r["residue"] if e["legacy_bucket"] not in resolved_ids]
    resolved_count = len(r["residue"]) - len(remaining)

    r["count"] = len(remaining)
    r["residue"] = remaining
    if "note" in r:
        r["note"] = r["note"] + f" | 2026-08-03 Vocab: {resolved_count} entries resolved and item references rewritten (see tools/vocab_chat/resolve_vocab_help_residue.py); {len(remaining)} remain."

    atomic_write_json(RESIDUE, r)
    print(f"\nResidue file updated: {resolved_count} entries resolved, {len(remaining)} remaining")


if __name__ == "__main__":
    main()
