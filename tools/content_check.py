#!/usr/bin/env python3
"""Content invariants that no test covers and no reviewer sees.

Built 2026-08-02 after a hand verification found two faults in one pass that had
been sitting in the content for weeks. Both were invisible for the same reason:
they break silently. A required_bucket naming a leaf that does not exist is
skipped by the context builder and fired anyway by the marker, so the event
lands on an id nothing aggregates and no error is ever raised. An it_en item
whose whole floor is production grammar has that floor deleted by the direction
filter, and the marker simply proceeds with no mandatory bucket.

The estate's recurring failure mode is not bad code, it is faults that nobody
looks at. This looks at them.

    python3 tools/content_check.py            # summary
    python3 tools/content_check.py --verbose  # list every offender
"""
import json, glob, re, sys, pathlib, collections

ROOT = pathlib.Path(__file__).resolve().parent.parent
VERBOSE = "--verbose" in sys.argv
findings = []

def load(p):
    try:
        return json.loads(pathlib.Path(p).read_text(encoding="utf-8").rstrip("\x00\r\n \t"))
    except Exception:
        return None

man = load(ROOT / "data/manifest.json") or {"topics": []}
topics = man.get("topics", [])

buckets = {}
for t in topics:
    tree = load(ROOT / ("data/buckets/%s.json" % t)) or []
    for b in tree:
        if isinstance(b, dict) and b.get("id"):
            buckets[b["id"]] = b

grammar, translation = [], []
for t in topics:
    for q in (load(ROOT / ("data/grammar_questions_%s.json" % t)) or []):
        q["_topic"] = t; grammar.append(q)
    for it in (load(ROOT / ("data/translation_items_%s.json" % t)) or []):
        it["_topic"] = t; translation.append(it)
for extra in ("accent", "stress"):
    for q in (load(ROOT / ("data/grammar_questions_%s.json" % extra)) or []):
        q["_topic"] = extra; grammar.append(q)

vocab = load(ROOT / "data/vocabulary_it_frequency.json") or []
lemmas = set(str(e.get("lemma", "")).lower() for e in vocab if e.get("lemma"))

def report(name, offenders, why, owner):
    findings.append((name, len(offenders), why, owner, offenders))

# 1. every bucket an item names must exist in a tree
# Report DISTINCT ids grouped by root, not raw item counts. A single missing
# TREE otherwise shows up as twelve thousand broken items and buries everything
# else in the report - which is how the phonology.stress gap stayed invisible.
missing = collections.Counter()
roots = collections.Counter()
for it in translation + grammar:
    ids = list(it.get("required_buckets") or [])
    for mp in (it.get("markpoints") or []):
        if mp.get("bucket"): ids.append(mp["bucket"])
    for b in ids:
        if b not in buckets and not str(b).startswith("vocabulary."):
            missing[b] += 1
            roots[str(b).split(".")[0]] += 1
lines = []
for root, n in roots.most_common():
    ids_here = [b for b in missing if str(b).split(".")[0] == root]
    have_tree = any(str(k).split(".")[0] == root for k in buckets)
    lines.append("%s.* : %d distinct ids across %d items%s"
                 % (root, len(ids_here), n, "" if have_tree else "  <- NO TREE FOR THIS ROOT AT ALL"))
    if VERBOSE:
        for b in sorted(ids_here)[:10]: lines.append("      " + b)
report("bucket ids that exist in no tree", lines,
       "skipped by the context builder, fired anyway by the marker; the event lands nowhere",
       "Architecture (mint or re-point)")

# 2. it_en items whose entire floor is production-only
PRODUCTION = re.compile(r"^(adjective_agreement|noun|article|possessive|demonstrative|preposition|"
                        r"pronoun|negation|adverb|verb_form|si_constructions|word_formation|comparison)\b")
bad = []
for it in translation:
    if str(it.get("target_lang", "")).lower() != "en":
        continue
    req = it.get("required_buckets") or []
    if req and all(PRODUCTION.match(str(b)) for b in req):
        bad.append(it.get("external_id") or "?")
report("it_en items whose whole floor is production grammar", bad,
       "the direction filter deletes it, so the marker gets no mandatory bucket at all",
       "Architecture (rule), then authors")

# 3. duplicate external_ids
seen = collections.Counter(str(x.get("external_id")) for x in (grammar + translation) if x.get("external_id"))
report("duplicate external_ids", sorted(k for k, v in seen.items() if v > 1),
       "two items sharing an id cannot be told apart in the pulse sheet", "authors")

# 4. translation items missing a direction
bad = [it.get("external_id") or "?" for it in translation
       if not it.get("target_lang") or not it.get("source_lang")]
report("translation items with no source_lang/target_lang", bad,
       "direction is then guessed from accented characters in the source", "authors")

# 5. MCQ items whose answer_index is out of range
bad = []
for q in grammar:
    if q.get("type") in ("mcq", "error_id"):
        ch = q.get("choices")
        idx = q.get("answer_index", q.get("error_index"))
        n = len(ch) if isinstance(ch, list) else (len(str(q.get("prompt", "")).split()) if q.get("type") == "error_id" else 0)
        if not isinstance(idx, int) or idx < 0 or (n and idx >= n):
            bad.append("%s (index %s of %s)" % (q.get("external_id") or "?", idx, n))
report("index-scored items with an out-of-range answer", bad,
       "unmarkable: no choice can ever be correct", "authors")

# 6. vocabulary entries with no English gloss (the stress-drill meaning gap)
n_null = sum(1 for e in vocab if not e.get("translation_en"))
report("vocabulary entries with no translation_en", ["%d of %d entries" % (n_null, len(vocab))] if n_null else [],
       "any drill that shows a meaning has nothing to show for these", "Vocab")

# 7. unanchored short phrases that nest inside a real Italian word
#
# This is the shape of every false-credit bug the estate has had: the correct
# string sits inside a wrong one, nothing enforces a boundary, and the wrong
# answer scores. r116 fixed 32 items where the author HAD written an anchor and
# the engine ignored it; this catches the cases where no anchor was written.
#
# The lemma-retrieval pilot is exempt by design: its vocabulary markpoint uses a
# bare stem ("parl") precisely so any form of the verb counts as "they reached
# for parlare". Its FORMATION markpoint is separately anchored. Flagging those
# would be flagging the intent.
forms = set()
for e in vocab:
    for k in ("lemma", "plural"):
        if e.get(k): forms.add(str(e[k]).lower())
bad = []
for q in grammar:
    if q.get("type") in ("mcq", "error_id"): continue
    if q.get("provenance") == "lemma_retrieval_pilot": continue
    for mp in (q.get("markpoints") or []):
        if str(mp.get("bucket", "")).startswith("vocabulary."): continue
        for ph in (mp.get("any_phrases") or []):
            isobj = isinstance(ph, dict)
            text = (ph.get("phrase") if isobj else ph)
            at = (ph.get("match_at") if isobj else None) or mp.get("match_at")
            if not text or at: continue
            t = str(text).lower().strip()
            if " " in t or len(t) < 2: continue
            nest = [w for w in forms if len(w) > len(t) and t in w]
            if nest:
                bad.append("%s: %r nests inside %s" % (q.get("external_id") or "?", t, ", ".join(nest[:3])))
report("unanchored phrases that nest inside a real word", sorted(set(bad)),
       "the correct string sits inside a wrong one with no boundary enforced - the false-credit shape",
       "authors (add match_at)")

# ------------------------------------------------------------------ output
print("CONTENT CHECK  —  %d topics, %d buckets, %d grammar items, %d translation items\n"
      % (len(topics), len(buckets), len(grammar), len(translation)))
worst = 0
for name, n, why, owner, offenders in findings:
    flag = "  ok  " if n == 0 else "  !!  "
    if n: worst = 1
    print("%s%-52s %5d   %s" % (flag, name, n, ("[" + owner + "]") if n else ""))
    if n: print("        %s" % why)
    if n and VERBOSE:
        for o in offenders[:40]:
            print("          " + str(o))
        if len(offenders) > 40:
            print("          ... and %d more" % (len(offenders) - 40))
print()
print("Nothing here is a code failure; every line is content the engine cannot act on.")
sys.exit(0)
