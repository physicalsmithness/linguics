"""
prepare_lexicon_data.py
[created by Antigravity]

Data acquisition script for the Linguics project's Italian stress pipeline.
Downloads and parses Wiktionary and Morph-it! data to build lexicon lookups.
"""

import os
import sys
import json
import urllib.request
import urllib.error
import tarfile

def download_file(url, dest_path, description):
    """Download with progress reporting. Skip if dest_path exists."""
    if os.path.exists(dest_path):
        print(f"[{description}] File already exists at {dest_path}, skipping download.")
        return True
    
    print(f"[{description}] Downloading from {url}...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            total_size = int(response.info().get('Content-Length', 0))
            downloaded = 0
            chunk_size = 8192
            
            with open(dest_path, 'wb') as out_file:
                while True:
                    chunk = response.read(chunk_size)
                    if not chunk:
                        break
                    out_file.write(chunk)
                    downloaded += len(chunk)
                    if total_size > 0:
                        done = int(50 * downloaded / total_size)
                        sys.stdout.write(f"\r[{'=' * done}{' ' * (50-done)}] {downloaded}/{total_size} bytes")
                        sys.stdout.flush()
            print()
        print(f"[{description}] Download complete.")
        return True
    except Exception as e:
        print(f"\n[{description}] Download failed: {e}")
        if os.path.exists(dest_path):
            os.remove(dest_path)
        return False

def parse_wiktionary(jsonl_path, output_path):
    """Parse Wiktionary JSONL, extract IPA stress data."""
    if os.path.exists(output_path):
        print(f"[Wiktionary] Output file {output_path} already exists, skipping parsing.")
        with open(output_path, 'r', encoding='utf-8') as f:
            return len(json.load(f))
            
    print(f"[Wiktionary] Parsing {jsonl_path}...")
    wikt_stress = {}
    count = 0
    
    with open(jsonl_path, 'r', encoding='utf-8') as f:
        for line in f:
            count += 1
            if count % 10000 == 0:
                print(f"[Wiktionary] Processed {count} lines...")
                
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                continue
                
            lang = entry.get('lang') or entry.get('lang_code')
            if lang not in ('Italian', 'it'):
                continue
                
            word = entry.get('word')
            if not word:
                continue
                
            sounds = entry.get('sounds', [])
            ipa = None
            for sound in sounds:
                if 'ipa' in sound and sound['ipa'].startswith('/'):
                    ipa = sound['ipa']
                    break
                    
            if not ipa:
                continue
                
            # Parse stress
            # Examples: /te.le.ˈfo.na.no/, /ˈka.za/, /t͡ʃit.ˈta/
            inner_ipa = ipa.strip('/[]')
            syllables = inner_ipa.split('.')
            syllable_count = len(syllables)
            
            stress_pos = None
            for i, syl in enumerate(reversed(syllables)):
                if 'ˈ' in syl:  # primary stress mark
                    stress_pos = i + 1
                    break
            
            if stress_pos is not None:
                wikt_stress[word.lower()] = {
                    "ipa": ipa,
                    "stress_pos": stress_pos,
                    "syllable_count": syllable_count
                }

    if not wikt_stress:
        print("WARNING: Found 0 entries with IPA stress data in Wiktionary!")
    else:
        print(f"[Wiktionary] Saving {len(wikt_stress)} entries to {output_path}...")
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(wikt_stress, f, ensure_ascii=False, indent=2)
            
    return len(wikt_stress)

def parse_morphit(txt_path, forms_output, lemmas_output):
    """Parse Morph-it! TSV into form and lemma lookup dicts."""
    if os.path.exists(forms_output) and os.path.exists(lemmas_output):
        print(f"[Morph-it!] Output files exist, skipping parsing.")
        with open(forms_output, 'r', encoding='utf-8') as f:
            return len(json.load(f))
            
    print(f"[Morph-it!] Parsing {txt_path}...")
    forms_dict = {}
    lemmas_dict = {}
    
    with open(txt_path, 'r', encoding='utf-8', errors='replace') as f:
        for line in f:
            parts = line.strip().split('\t')
            if len(parts) >= 3:
                form, lemma, features = parts[0], parts[1], parts[2]
                form_lower = form.lower()
                lemma_lower = lemma.lower()
                
                if form_lower not in forms_dict:
                    forms_dict[form_lower] = []
                forms_dict[form_lower].append({"lemma": lemma, "features": features})
                
                if lemma_lower not in lemmas_dict:
                    lemmas_dict[lemma_lower] = []
                lemmas_dict[lemma_lower].append({"form": form, "features": features})
                
    print(f"[Morph-it!] Saving forms to {forms_output} and lemmas to {lemmas_output}...")
    with open(forms_output, 'w', encoding='utf-8') as f:
        json.dump(forms_dict, f, ensure_ascii=False, indent=2)
    with open(lemmas_output, 'w', encoding='utf-8') as f:
        json.dump(lemmas_dict, f, ensure_ascii=False, indent=2)
        
    return len(forms_dict)

def build_ere_classification(wikt_stress_path, morphit_lemmas_path, output_path):
    """Cross-reference to classify -ere verbs."""
    if os.path.exists(output_path):
        print(f"[-ere Verbs] Output file {output_path} already exists.")
        with open(output_path, 'r', encoding='utf-8') as f:
            return len(json.load(f))
            
    print("[-ere Verbs] Building classification...")
    with open(wikt_stress_path, 'r', encoding='utf-8') as f:
        wikt_stress = json.load(f)
        
    with open(morphit_lemmas_path, 'r', encoding='utf-8') as f:
        morphit_lemmas = json.load(f)
        
    ere_verbs = {}
    for lemma, forms in morphit_lemmas.items():
        if lemma.endswith('ere'):
            # Only consider it a verb if it has verb features
            is_verb = any('VER' in item.get('features', '') for item in forms)
            if is_verb:
                if lemma in wikt_stress:
                    stress_pos = wikt_stress[lemma]['stress_pos']
                    if stress_pos >= 3: # antepenult or further -> stem-stressed
                        ere_verbs[lemma] = "stem"
                    elif stress_pos == 2: # penult -> end-stressed
                        ere_verbs[lemma] = "end"
                    else:
                        ere_verbs[lemma] = "unknown"
                else:
                    ere_verbs[lemma] = "unknown"
                    
    print(f"[-ere Verbs] Saving {len(ere_verbs)} classifications to {output_path}...")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(ere_verbs, f, ensure_ascii=False, indent=2)
        
    return len(ere_verbs)

def main():
    """Download, parse, and build all lexicon data."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    lexicon_dir = os.path.join(base_dir, 'lexicon_data')
    os.makedirs(lexicon_dir, exist_ok=True)
    
    wikt_url = 'https://kaikki.org/dictionary/Italian/kaikki.org-dictionary-Italian.jsonl'
    wikt_local = os.path.join(lexicon_dir, 'kaikki.org-dictionary-Italian.jsonl')
    
    morphit_url1 = 'https://raw.githubusercontent.com/Wikipedia-TL-Extraction/morph-it/master/morph-it_048.txt'
    morphit_local = os.path.join(lexicon_dir, 'morph-it_048.txt')
    
    if not download_file(wikt_url, wikt_local, 'Wiktionary'):
        print("Error: Could not acquire Wiktionary data.")
        sys.exit(1)
    
    if not os.path.exists(morphit_local):
        if not download_file(morphit_url1, morphit_local, 'Morph-it! TXT'):
            print("Trying fallback Morph-it! TGZ...")
            morphit_tgz_url = 'https://docs.sslmit.unibo.it/lib/exe/fetch.php/resources:morph-it_048.tgz'
            morphit_tgz_local = os.path.join(lexicon_dir, 'morph-it_048.tgz')
            if download_file(morphit_tgz_url, morphit_tgz_local, 'Morph-it! TGZ'):
                print("Extracting morph-it_048.txt...")
                try:
                    with tarfile.open(morphit_tgz_local, "r:gz") as tar:
                        for member in tar.getmembers():
                            if member.name.endswith('morph-it_048.txt'):
                                member.name = 'morph-it_048.txt'
                                tar.extract(member, path=lexicon_dir)
                                break
                except Exception as e:
                    print(f"Extraction failed: {e}")
            
    has_morphit = os.path.exists(morphit_local)
    if not has_morphit:
        print("WARNING: Could not acquire Morph-it! data. Continuing without it.")
        print("  (-ere verb classification will be unavailable)")

    wikt_out = os.path.join(lexicon_dir, 'wiktionary_stress.json')
    wikt_count = parse_wiktionary(wikt_local, wikt_out)
    
    morphit_count = 0
    ere_count = 0
    if has_morphit:
        morphit_forms_out = os.path.join(lexicon_dir, 'morphit_forms.json')
        morphit_lemmas_out = os.path.join(lexicon_dir, 'morphit_lemmas.json')
        morphit_count = parse_morphit(morphit_local, morphit_forms_out, morphit_lemmas_out)
        
        ere_out = os.path.join(lexicon_dir, 'ere_verbs.json')
        ere_count = build_ere_classification(wikt_out, morphit_lemmas_out, ere_out)
    
    print("\n=== Summary ===")
    print(f"Wiktionary entries with stress: {wikt_count}")
    print(f"Morph-it! forms parsed:         {morphit_count}")
    print(f"-ere verbs classified:          {ere_count}")

if __name__ == "__main__":
    main()
