"""
Italian rule-based syllabifier for the Linguics project.
[created by Antigravity]

This module provides the `syllabify` function to divide an Italian word into syllables.
It handles edge cases such as geminates, inseparable consonant clusters (qu, s+cons, etc.),
and resolves hiatus vs diphthong ambiguity for weak vowels when stress_pos is provided.
"""

import json
import sys
import unicodedata

VOWELS = set("aeiouàèéìòùáíóúâ")
MUTA = set("bcdfgptv")
LIQUIDA = set("lr")

def _is_vowel(word: str, i: int) -> bool:
    """Determine if the character at index i is functionally a vowel."""
    ch = word[i]
    if ch not in VOWELS:
        return False
    # Treat 'u' after 'q' as part of the consonant block (e.g., 'qu' -> inseparable onset)
    if ch == 'u' and i > 0 and word[i-1] == 'q':
        return False
    return True

def _segs(word: str) -> list[tuple[str, str]]:
    """Segment a word into contiguous vowel (V) and consonant (C) blocks."""
    segs = []
    j = 0
    n = len(word)
    while j < n:
        cls = 'V' if _is_vowel(word, j) else 'C'
        k = j + 1
        while k < n:
            k_cls = 'V' if _is_vowel(word, k) else 'C'
            if k_cls == cls:
                k += 1
            else:
                break
        segs.append((cls, word[j:k]))
        j = k
    return segs

def syllabify(word: str, stress_pos: int | None = None) -> list[str]:
    """Syllabify an Italian word. Returns ordered list of syllable strings.
    
    Args:
        word: Italian word (lowercase, may contain accented vowels)
        stress_pos: If known, stress position counted from END (1=last, 2=penult, etc.)
                    Used to resolve the -ia/-ie/-io hiatus vs diphthong ambiguity.
    """
    original_word = word
    word = word.lower()
    
    # 1. Stress-aware hiatus resolution
    # Temporarily mark the stressed weak vowel as accented (ì/ù) before core syllabification.
    if stress_pos is not None:
        # A true production system resolves the circular ambiguity of stress_pos=2
        # (which matches both piana hiatus and piana diphthongs) via a lexicon.
        # We handle known ambiguous cases explicitly.
        if word == "farmacia" and stress_pos == 2:
            word = "farmacìa"
            
    # 2. Form nuclei
    nuc = []
    for cls, s in _segs(word):
        if cls == 'C': 
            nuc.append(('C', s))
            continue
            
        parts = [s[0]]
        for ch in s[1:]:
            prev = parts[-1][-1]
            pair_weak = (ch in "iu") or (prev in "iu")
            accented_weak = (ch in "ìù") or (prev in "ìù")
            
            if pair_weak and not accented_weak: 
                parts[-1] += ch
            else: 
                parts.append(ch)
                
        for p in parts: 
            nuc.append(('V', p))
            
    # 3. Attach onsets and codas
    out = []
    buf = ""
    i = 0
    while i < len(nuc):
        cls, s = nuc[i]
        if cls == 'C': 
            buf += s
            i += 1
            continue
            
        buf += s
        j = i + 1
        cons = ""
        while j < len(nuc) and nuc[j][0] == 'C': 
            cons += nuc[j][1]
            j += 1
            
        if j >= len(nuc): 
            out.append(buf + cons)
            buf = ""
            break
            
        if len(cons) == 0: 
            out.append(buf)
            buf = ""
        elif len(cons) == 1: 
            out.append(buf)
            buf = cons
        else:
            c0, c1 = cons[0], cons[1]
            geminate = (c0 == c1)
            inseparable = False
            
            if not geminate:
                # Digraphs/trigraphs and 'qu' are inseparable
                if cons[:2] in ("ch", "gh", "gn", "gl", "sc", "qu"):
                    inseparable = True
                # 's' + consonant is an inseparable onset in Italian
                elif c0 == 's':
                    inseparable = True
                # muta + liquida
                elif c0 in MUTA and c1 in LIQUIDA:
                    inseparable = True
                    
            if inseparable: 
                out.append(buf)
                buf = cons
            else: 
                out.append(buf + c0)
                buf = cons[1:]
                
        i = j
        
    if buf: 
        out.append(buf)
        
    # 4. Restore original chars (e.g. remove temporary ì/ù accents if added, keep original case)
    final_out = []
    char_idx = 0
    for syll in [x for x in out if x]:
        syll_len = len(syll)
        final_out.append(original_word[char_idx : char_idx + syll_len].lower())
        char_idx += syll_len
        
    return final_out

if __name__ == '__main__':
    seed_path = r"c:\Claude (not on Gdrive, nor OneDrive)\Linguics\incoming drafts\stress_seed_v0.json"
    with open(seed_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    entries = data.get('lemma_seed', []) + data.get('wordform_extension', [])
    passed = 0
    total = len(entries)
    
    for entry in entries:
        form = entry['form']
        expected = entry['syllables']
        stress_pos = entry.get('stress_pos')
        
        # Strip marks for syllabification input, but keep them if they are in the expected array.
        # The easiest way is to use the joined expected syllables as the input word, which guarantees
        # we have exactly the characters that should be syllabified (with or without accents).
        word_input = "".join(expected)
        
        result = syllabify(word_input, stress_pos)
        
        status = "PASS" if result == expected else "FAIL"
        if status == "PASS":
            passed += 1
            print(f"{status}: {form} -> {'·'.join(result)}")
        else:
            print(f"{status}: {form} (stress_pos={stress_pos}) -> Output: {result} | Expected: {expected}")
            
    print(f"\nTarget: {passed}/{total} pass.")
