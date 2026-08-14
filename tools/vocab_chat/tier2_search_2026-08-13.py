"""Search the tier-2 vocabulary packet per architect's inter_chat cut 2026-08-13.

Read data/review_packets_tier2/SEARCH_vocabulary_2026-08-13.json, walk each of
the 913 reference translations, tokenise the Italian, resolve to lemmas via
the morph-it surface map, look up frequency ranks, emit findings for every
freq band that fires PLUS the `vocabulary.it` aggregate.

LIVE RULE (inter_chat v1 §3, correcting the packet fine-print):
  - Coverage does NOT walk the ancestor chain (architect verified against
    getItemBuckets which reads only markpoints + required_buckets).
  - Therefore: claim both leaf (freq band) AND parent (vocabulary.it) when
    both are true. Cite parent alone when no leaf fires.

`already_expected` and `already_declared` are read but NOT re-emitted —
they are already there. New findings only.

Return: data/review_packets_tier2/returned/SEARCH_vocabulary_2026-08-13.json
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from collections import Counter

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from atomic_io import atomic_write_json  # noqa: E402

PACKET_IN = PROJECT_ROOT / "data" / "review_packets_tier2" / "SEARCH_vocabulary_2026-08-13.json"
PACKET_OUT = PROJECT_ROOT / "data" / "review_packets_tier2" / "returned" / "SEARCH_vocabulary_2026-08-13.json"
VOCAB = PROJECT_ROOT / "data" / "vocabulary_it_frequency.json"
SURFACE_MAP = PROJECT_ROOT / "data" / "it_surface_to_lemma_morphit.json"
SURFACE_MAP_FALLBACK = PROJECT_ROOT / "data" / "it_surface_to_lemma.json"


# Enclitic pronouns often suffixed to imperatives / infinitives / gerunds
ENCLITICS = ("mi","ti","ci","vi","si","gli","le","la","lo","li","ne","glielo","gliela","glieli","gliele","gliene","melo","mela","meli","mele","mene","telo","tela","teli","tele","tene","celo","cela","celi","cele","cene","velo","vela","veli","vele","vene","selo","sela","seli","sele","sene")

# Very common stopwords / articles / prepositions that ARE in the freq file — don't strip
# but do count. Articles are content-relevant (definite article bucket etc.).
ARTICLES = {"il","lo","la","i","gli","le","l","un","uno","una"}


def tokenise(text):
    """Split Italian text into lowercase word tokens. Handles apostrophes
    (l'amico → l amico), keeps accented vowels."""
    # Replace apostrophes with space so l' → l | letter | ... — token boundary
    text = text.lower()
    text = re.sub(r"[''']", " ", text)
    # Split on any non-letter (Unicode). Keep accented chars.
    tokens = re.findall(r"[a-zà-ÿ]+", text, re.UNICODE)
    return tokens


def build_form_to_lemma(surface_map, lemma_set, vocab_entries):
    """Return a form → set(lemma) map."""
    m = {}
    # Start with morph-it surface map
    for surface, lemma in surface_map.items():
        m.setdefault(surface.lower(), set()).add(lemma.lower())
    # Every lemma is its own form
    for e in vocab_entries:
        lem = (e.get("lemma") or "").lower()
        if lem:
            m.setdefault(lem, set()).add(lem)
        # Plural too
        pl = (e.get("plural") or "").lower()
        if pl:
            m.setdefault(pl, set()).add(lem)

    # Supplement with the most-frequent missing verb inflections that
    # morph-it doesn't cover but the corpus uses heavily.
    supplement = {
        # essere
        "è":"essere","era":"essere","erano":"essere","fu":"essere","fui":"essere","fossi":"essere","fosse":"essere","stato":"essere","stata":"essere","stati":"essere","state":"essere","sarà":"essere","sarò":"essere","saremo":"essere","sareste":"essere","sarebbe":"essere","sarebbero":"essere",
        # avere
        "hai":"avere","ha":"avere","hanno":"avere","aveva":"avere","avevo":"avere","avevamo":"avere","avevano":"avere","avrà":"avere","avrò":"avere","avrai":"avere","avrei":"avere","avrebbe":"avere","avuto":"avere","avuta":"avere","abbi":"avere","abbia":"avere",
        # potere
        "posso":"potere","puoi":"potere","può":"potere","possiamo":"potere","potete":"potere","possono":"potere","potuto":"potere","potrò":"potere","potrà":"potere","potrei":"potere","potrebbe":"potere","poteva":"potere","potevo":"potere",
        # volere
        "voglio":"volere","vuoi":"volere","vuole":"volere","vogliamo":"volere","volete":"volere","vogliono":"volere","voluto":"volere","voleva":"volere","volevo":"volere","vorrei":"volere","vorrebbe":"volere","vorrà":"volere","vorremo":"volere",
        # dovere
        "devo":"dovere","devi":"dovere","deve":"dovere","dobbiamo":"dovere","dovete":"dovere","devono":"dovere","dovuto":"dovere","dovrei":"dovere","dovrebbe":"dovere","dovrà":"dovere","doveva":"dovere",
        # sapere
        "so":"sapere","sai":"sapere","sa":"sapere","sappiamo":"sapere","sapete":"sapere","sanno":"sapere","saputo":"sapere","sapeva":"sapere","saprei":"sapere","saprà":"sapere",
        # fare
        "faccio":"fare","fai":"fare","fa":"fare","facciamo":"fare","fate":"fare","fanno":"fare","fatto":"fare","fatta":"fare","fatti":"fare","fatte":"fare","faceva":"fare","facevo":"fare","farà":"fare","farò":"fare","farei":"fare","farebbe":"fare",
        # andare
        "vado":"andare","vai":"andare","va":"andare","andiamo":"andare","vanno":"andare","andato":"andare","andata":"andare","andati":"andare","andate":"andare","andava":"andare","andrà":"andare","andrò":"andare","andrei":"andare",
        # venire
        "vengo":"venire","vieni":"venire","viene":"venire","veniamo":"venire","venite":"venire","vengono":"venire","venuto":"venire","venuta":"venire","veniva":"venire","verrà":"venire","verrei":"venire",
        # dire
        "dico":"dire","dici":"dire","dice":"dire","diciamo":"dire","dite":"dire","dicono":"dire","detto":"dire","detta":"dire","diceva":"dire","dicevo":"dire","dirà":"dire","dirò":"dire","direi":"dire","direbbe":"dire",
        # dare
        "do":"dare","dai":"dare","dà":"dare","diamo":"dare","date":"dare","danno":"dare","dato":"dare","data":"dare","dava":"dare","darà":"dare","darei":"dare","darebbe":"dare",
        # stare
        "sto":"stare","stai":"stare","sta":"stare","stiamo":"stare","state":"stare","stanno":"stare","stavo":"stare","stava":"stare","starà":"stare","starei":"stare",
        # prendere / mettere / vedere / trovare — common past participles
        "preso":"prendere","presa":"prendere","messo":"mettere","messa":"mettere","visto":"vedere","vista":"vedere","trovato":"trovare","trovata":"trovare",
        # Common contractions
        "del":"di","della":"di","dello":"di","dei":"di","degli":"di","delle":"di","dell":"di",
        "nel":"in","nella":"in","nello":"in","nei":"in","negli":"in","nelle":"in","nell":"in",
        "al":"a","alla":"a","allo":"a","ai":"a","agli":"a","alle":"a","all":"a",
        "sul":"su","sulla":"su","sullo":"su","sui":"su","sugli":"su","sulle":"su","sull":"su",
        "col":"con","coi":"con",
        "dal":"da","dalla":"da","dallo":"da","dai":"da","dagli":"da","dalle":"da","dall":"da",
        # Common adjective/noun inflections beyond plural
        "bella":"bello","belle":"bello","bei":"bello","begli":"bello",
        "buona":"buono","buone":"buono","buoni":"buono","buon":"buono","buoni":"buono",
        "grande":"grande","grandi":"grande","gran":"grande",
        "santo":"santo","santa":"santo","santi":"santo","sante":"santo","san":"santo",
        # More function words
        "chi":"chi","cui":"cui","quale":"quale","quali":"quale","quanto":"quanto","quanti":"quanto","quante":"quanto","quanta":"quanto",
        "questo":"questo","questa":"questo","questi":"questo","queste":"questo",
        "quello":"quello","quella":"quello","quelli":"quello","quelle":"quello","quel":"quello","quegli":"quello",
    }
    # Filter out any accidental None values from a stray dict-literal typo
    supplement = {k: v for k, v in supplement.items() if v is not None}
    for surface, lemma in supplement.items():
        m.setdefault(surface, set()).add(lemma)
    return m


def strip_enclitics(form):
    """Try stripping common enclitic pronoun suffixes and return alternative
    forms to look up. E.g. dammelo → damme, dam, da. Very heuristic."""
    outs = [form]
    for enc in sorted(ENCLITICS, key=len, reverse=True):
        if form.endswith(enc) and len(form) > len(enc) + 2:
            stripped = form[:-len(enc)]
            outs.append(stripped)
            # Some verbs double the final consonant with attached clitics:
            # dammi → da(re), dallo → dare, tellll → many; strip a doubled ll
            if stripped.endswith("l") and not stripped.endswith("ll"):
                pass  # already OK
            # dammi → damm → strip m to get da
            if stripped.endswith("mm"):
                outs.append(stripped[:-1])
    return outs


def rank_to_band(rank):
    """Return the freq-band bucket id for a given rank."""
    if rank is None or rank <= 0:
        return None
    if rank > 100000:
        return None
    lo = ((rank - 1) // 100) * 100 + 1
    hi = lo + 99
    return f"vocabulary.it.freq_{lo}_{hi}"


def load_json(p):
    with p.open() as f:
        return json.load(f)


def main():
    print("Loading packet…")
    packet = load_json(PACKET_IN)
    print(f"  {len(packet['corpus'])} corpus items, {len(packet['your_buckets'])} buckets")

    print("Loading vocab freq file…")
    vocab = load_json(VOCAB)
    print(f"  {len(vocab)} entries")
    # Filter out [skip], null-gloss, '?' gloss artefacts — they aren't real
    # vocab entries and should never fire a freq band.
    vocab_valid = []
    for e in vocab:
        t = e.get("translation_en")
        if not t or t == "[skip]" or "?" in t:
            continue
        vocab_valid.append(e)
    print(f"  {len(vocab_valid)} valid (post [skip]/null/? filter)")
    vocab = vocab_valid

    # lemma → best (lowest) rank
    lemma_rank = {}
    for e in vocab:
        lem = (e.get("lemma") or "").lower()
        r = e.get("rank")
        if not lem or not r:
            continue
        if lem not in lemma_rank or r < lemma_rank[lem]:
            lemma_rank[lem] = r

    print("Loading surface_to_lemma…")
    smap = load_json(SURFACE_MAP)
    smap_small = load_json(SURFACE_MAP_FALLBACK)
    # Merge — morphit takes priority for keys present in both
    merged = {**smap_small, **smap}
    print(f"  {len(merged)} surface forms")

    print("Building form→lemma map…")
    form_map = build_form_to_lemma(merged, lemma_rank, vocab)
    print(f"  {len(form_map)} distinct surface forms mapped")

    # Bucket ids allowed
    allowed_bucket_ids = {b["id"] for b in packet["your_buckets"]}

    findings = []
    unresolved_counter = Counter()
    resolved_counter = Counter()

    for item in packet["corpus"]:
        item_id = item["item_id"]
        src = item.get("source_text") or ""
        ref = item.get("reference_text") or ""
        others = item.get("other_references") or []
        already = set(item.get("already_expected") or []) | set(item.get("already_declared") or [])

        # Decide which text is Italian. Direction marker in id is reliable for
        # ~96% of items; for the rest, pick the text that resolves more Italian
        # forms. Then include other_references (also Italian).
        italian_text = ""
        if "_it_en_" in item_id:
            italian_text = src
        elif "_en_it_" in item_id:
            italian_text = ref
        else:
            # Pick the text that resolves more Italian forms
            src_hits = sum(1 for tok in tokenise(src) if tok in form_map)
            ref_hits = sum(1 for tok in tokenise(ref) if tok in form_map)
            italian_text = src if src_hits > ref_hits else ref

        texts = [italian_text] + [o for o in others if o]

        # Collect all lemmas seen across the Italian references
        lemmas_seen = set()
        for text in texts:
            for tok in tokenise(text):
                if tok in form_map:
                    lemmas_seen.update(form_map[tok])
                    resolved_counter[tok] += 1
                else:
                    for alt in strip_enclitics(tok):
                        if alt in form_map:
                            lemmas_seen.update(form_map[alt])
                            resolved_counter[tok] += 1
                            break
                    else:
                        unresolved_counter[tok] += 1

        # For each resolved lemma, find rank and freq band
        bands_fired = set()
        for lem in lemmas_seen:
            r = lemma_rank.get(lem)
            if not r:
                continue
            band = rank_to_band(r)
            if band and band in allowed_bucket_ids:
                bands_fired.add((band, lem, r))

        # Emit findings: parent + each leaf
        # Aggregate `vocabulary.it` — fires whenever ANY Italian vocab is used (all items)
        if lemmas_seen and "vocabulary.it" not in already:
            findings.append({
                "item_id": item_id,
                "bucket_id": "vocabulary.it",
                "evidence": italian_text[:80],
                "verdict": "keep",
            })

        # Each freq band
        for band, lem, r in sorted(bands_fired, key=lambda x: x[2]):
            if band not in already:
                findings.append({
                    "item_id": item_id,
                    "bucket_id": band,
                    "evidence": f"{lem} (rank {r})",
                    "verdict": "keep",
                })

    print(f"\nFindings emitted: {len(findings)}")
    # Bucket distribution of findings
    fd_by_bucket = Counter(f["bucket_id"] for f in findings)
    print(f"Distinct buckets fired: {len(fd_by_bucket)}")
    print(f"Top 20 buckets by fire count:")
    for b, n in fd_by_bucket.most_common(20):
        print(f"  {b}: {n}")

    # Sanity: unresolved surface forms
    print(f"\nResolved tokens (top 10): {resolved_counter.most_common(10)}")
    print(f"Unresolved tokens (top 20): {unresolved_counter.most_common(20)}")
    print(f"Distinct unresolved: {len(unresolved_counter)}")

    # Write findings back into packet
    packet["findings"] = findings
    packet["_search_notes"] = {
        "author": "Vocab",
        "date": "2026-08-13",
        "method": "morph-it surface_to_lemma + heuristic enclitic strip; freq banding at rank/100",
        "corpus_items_touched": len(set(f["item_id"] for f in findings)),
        "distinct_buckets_fired": len(fd_by_bucket),
        "unresolved_surface_forms": len(unresolved_counter),
        "unresolved_sample": [t for t, _ in unresolved_counter.most_common(50)],
        "live_rule_applied": "claim both leaf (freq band) and parent (vocabulary.it) per inter_chat v1 §3",
    }

    PACKET_OUT.parent.mkdir(parents=True, exist_ok=True)
    atomic_write_json(PACKET_OUT, packet)
    print(f"\nWrote: {PACKET_OUT}")


if __name__ == "__main__":
    main()
