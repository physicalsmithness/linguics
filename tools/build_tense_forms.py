#!/usr/bin/env python3
"""Generate data/it_verb_tense_forms.json for chosen-tense inference.

Scope decision, stated because it is a real trade: this covers ONLY the verbs
cued by items that declare candidate_tenses, plus essere/avere/esserci. Widening
it to every verb at frequency rank <= 4000 was measured at 651 KB compact
(1.2 MB uncompressed) against 29 KB here, and all it buys is a tense reading for
a learner who reached for a verb the item never cued - which is off-task, and
where recording null is the honest answer anyway. Compound tenses still work for
ANY verb, because the participle is detected by ending in the client.

Re-run when new topics land items with candidate_tenses.
"""
import json, glob, re, io, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
lemmas = {"essere", "avere", "esserci"}
n_items = 0
for f in glob.glob(str(ROOT / "data/grammar_questions_*.json")):
    try: qs = json.load(open(f, encoding="utf-8"))
    except Exception: continue
    for q in qs:
        if not (isinstance(q.get("candidate_tenses"), list) and q.get("correct_tense")): continue
        n_items += 1
        m = re.search(r"\(([^()]{1,40})\)\s*$", (q.get("prompt") or "").strip())
        if m:
            head = m.group(1).split(",")[0].strip().lower()
            if head and " " not in head: lemmas.add(head)

CODE = {"ind+pres": "p", "ind+impf": "i", "ind+past": "r", "ind+fut": "f", "cond+pres": "c",
        "sub+pres": "s", "sub+impf": "S", "ger+pres": "g", "impr+pres": "m"}
NAME = {"p": "present", "i": "imperfect", "r": "passato_remoto", "f": "future", "c": "condizionale",
        "s": "congiuntivo_presente", "S": "congiuntivo_imperfetto", "g": "gerundio", "m": "imperativo"}
REG = re.compile(r"(?:ato|ito|uto|sto|tto|sso|nto|rto|lto|so|to)$")

readings, parts, aux = {}, set(), {}
with io.open(ROOT / "morph-it/morph-it_048.txt", encoding="latin-1") as fh:
    for line in fh:
        p = line.rstrip("\n").split("\t")
        if len(p) < 3: continue
        form, lemma, tag = p[0].lower(), p[1].lower(), p[2]
        if not tag.startswith(("VER:", "AUX:")) or lemma not in lemmas: continue
        core = "+".join(tag.split(":")[1].split("+")[:2])
        if core == "part+past":
            parts.add(form); continue
        c = CODE.get(core)
        if not c: continue
        readings.setdefault(form, set()).add(c)
        if lemma in ("essere", "avere"): aux.setdefault(form, set()).add(c)

out = {
    "$note": ("form -> string of tense codes. Ambiguity is resolved at inference time against the "
              "item's own candidate_tenses; 0 or 2+ matches records null, never a guess. "
              "participles lists only those a regular-ending test would miss."),
    "codes": NAME,
    "simple": {k: "".join(sorted(v)) for k, v in readings.items()},
    "participles": sorted(w for w in parts if not REG.search(w)),
    "aux": {k: "".join(sorted(v)) for k, v in aux.items()},
}
blob = json.dumps(out, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
(ROOT / "data/it_verb_tense_forms.json").write_text(blob, encoding="utf-8")
print("items with candidate_tenses: %d | cued verb lemmas: %d" % (n_items, len(lemmas)))
print("forms: %d | irregular participles: %d | %.0f KB" % (len(readings), len(out["participles"]), len(blob) / 1024))
