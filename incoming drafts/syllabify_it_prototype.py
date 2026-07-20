#!/usr/bin/env python3
"""Rule-based Italian syllabifier — PROTOTYPE for the Code seat (StressAuthor, 2026-07-20).
Feasibility proof for DISPATCH_stress.md Deliverable-1 proposal 2. NOT canonical; Code owns the real tools/ version.
Known residue by design: the i/u HIATUS-vs-DIPHTHONG split (farmacia far-ma-ci-a vs storia sto-ria) is
stress-dependent, hence not purely rule-derivable — those are flagged for dictionary/hand resolution."""
import unicodedata
VOW=set("aeiouàèéìòùáíóúâ")
MUTA=set("bcdfgptv"); LIQ=set("lr")
def _segs(w):
    segs=[]; j=0; n=len(w)
    while j<n:
        cls='V' if w[j] in VOW else 'C'; k=j
        while k<n and (('V' if w[k] in VOW else 'C')==cls): k+=1
        segs.append((cls,w[j:k])); j=k
    return segs
def syllabify(w):
    w=w.lower()
    nuc=[]
    for cls,s in _segs(w):
        if cls=='C': nuc.append(('C',s)); continue
        parts=[s[0]]
        for ch in s[1:]:
            prev=parts[-1][-1]
            pair_weak=(ch in "iu") or (prev in "iu")
            accented_weak=(ch in "ìù") or (prev in "ìù")
            if pair_weak and not accented_weak: parts[-1]+=ch
            else: parts.append(ch)
        for p in parts: nuc.append(('V',p))
    out=[]; buf=""; i=0
    while i<len(nuc):
        cls,s=nuc[i]
        if cls=='C': buf+=s; i+=1; continue
        buf+=s; j=i+1; cons=""
        while j<len(nuc) and nuc[j][0]=='C': cons+=nuc[j][1]; j+=1
        if j>=len(nuc): out.append(buf+cons); buf=""; break
        if len(cons)==0: out.append(buf); buf=""
        elif len(cons)==1: out.append(buf); buf=cons
        else:
            c0,c1=cons[0],cons[1]
            geminate=(c0==c1)
            inseparable=(not geminate) and ((cons[:2] in ("ch","gh","gn","gl","sc")) or (c0 in MUTA and c1 in LIQ) or c0=='s')
            if inseparable: out.append(buf); buf=cons
            else: out.append(buf+c0); buf=cons[1:]
        i=j
    if buf: out.append(buf)
    return [x for x in out if x]
if __name__=="__main__":
    import sys
    for w in sys.argv[1:]: print(w, "->", "·".join(syllabify(w)))
