# Theme Taxonomy: Subdivision Proposals

**Date:** 2026-08-06  
**For:** Smith's review  
**Source data:** 18,048 entries, 93 existing themes, vocab_themes.json v3

---

## The Problem

The current taxonomy has 93 themes across 6 kinds. Several of them are far too big to be useful for a learner browsing categories. The worst offenders:

| Theme | Entries | % with ONLY this tag | Problem |
|---|---|---|---|
| `noun_abstract` | 4,920 | 89% | "Abstract nouns (concepts, ideas)" — contains hotels, spaghetti, underwear |
| `adjective_quality` | 3,922 | 97% | "Quality adjectives" — mixes buono, difficile, nazionale, pieno |
| `verb_action_general` | 1,744 | 72% | "General action verbs" — from fare to stuprare |
| `people_general` | 988 | 84% | "People (general)" — mixes amico, mente, atleta |
| `communication` | 755 | 57% | "Communication and language" — ciao sits next to parola |
| `mental_state` | 479 | 42% | "Mental states" — overlaps heavily with noun_abstract |
| `verb_communication` | 419 | 42% | "Communication verbs" — includes portare, lasciare |
| `adverb_manner` | 3,91 | 94% | "Manner adverbs" — 347 entries with no further split |
| `verb_change` | 390 | 37% | "Change-of-state verbs" — broad but defensible |
| `shopping_money` | 241 | 54% | "Shopping and money" — mixes banks with bakeries |

Entries with only one theme tag: **14,077** (78% of the vocabulary). The subdivision work mainly means adding a second, more specific tag to these single-tagged entries.

## Design Principles

**One layer only.** Each problem group gets sub-themes (children), not sub-sub-themes. The current parent→child pattern stays; no deeper nesting.

**Multi-tagging is the norm.** A word can sit in multiple sub-themes and multiple parents. *Comprare* belongs to both `shopping_money` and `verb_exchange`. *Purtroppo* is both a manner adverb and a stance/evaluation word. This is already how the system works — entries carry arrays of theme IDs.

**Roll-up stays.** An entry tagged with a child also carries the parent. Selecting the parent chip still catches everything.

**Learner-facing labels.** Sub-theme names should be things a learner would say: "verbs of buying and selling" not "verb_commerce_exchange". The internal IDs are for the engine; the labels are for the chip list.

**Based on established taxonomies.** The subdivisions draw from WordNet's lexicographer files (the most rigorous published noun/verb classification), Dixon's adjective semantic types, the Quirk/Biber adverbial framework, and the Oxford Learner's Dictionary topic hierarchy.

---

## 1. `noun_abstract` (4,920 entries) → 10 sub-themes

This is the biggest cleanup. WordNet splits abstract nouns across 12 files; I'm proposing 10 that map cleanly to learner-intuitive categories.

### Proposed sub-themes

| ID | Label | Example lemmas | Est. size |
|---|---|---|---|
| `abstract_cognition` | Thought, knowledge, ideas | pensiero, idea, ragione, sapere, conoscenza, dubbio, memoria, opinione | ~600 |
| `abstract_emotion` | Feelings and emotional states | gioia, paura, amore, rabbia, speranza, tristezza, ansia, nostalgia | ~350 |
| `abstract_quality` | Qualities and properties | qualita, caratteristica, difetto, vantaggio, forza, debolezza, bellezza | ~500 |
| `abstract_state` | States and conditions | stato, condizione, salute, liberta, ordine, caos, pace, guerra | ~450 |
| `abstract_relation` | Relations and connections | rapporto, somiglianza, differenza, parentela, legame, confronto | ~300 |
| `abstract_event` | Events and processes | sviluppo, cambiamento, crescita, evoluzione, inizio, fine, risultato | ~400 |
| `abstract_quantity` | Quantities and measures | quantita, numero, grado, proporzione, misura, totale, meta | ~250 |
| `abstract_time` | Time periods and temporal concepts | periodo, momento, durata, epoca, secolo, eta, generazione | ~350 |
| `abstract_social` | Social and institutional concepts | societa, governo, legge, diritto, dovere, giustizia, democrazia | ~500 |
| `abstract_possession` | Ownership, value, economics | proprieta, ricchezza, debito, valore, prezzo, costo, guadagno | ~250 |

**What stays in `noun_abstract` without a sub-tag:** truly generic abstract nouns that resist classification (cosa, caso, fatto, tipo, modo, parte). These are the "function words" of the abstract domain — probably 500-800 entries that are too polysemous to pin down.

**Words that should leave `noun_abstract` entirely:** concrete nouns wrongly tagged as abstract (albergo → `city_places`, spaghetto → `food_grain_pasta`, mutande → `clothing`). These are tagging errors, not subdivision targets.

---

## 2. `adjective_quality` (3,922 entries) → 10 sub-themes

Based on Dixon's semantic types and the EFL adjective-order convention.

| ID | Label | Example lemmas | Est. size |
|---|---|---|---|
| `adj_evaluation` | Evaluation and opinion | buono, cattivo, bello, brutto, eccellente, terribile, perfetto | ~400 |
| `adj_physical` | Physical properties | duro, morbido, pesante, leggero, liscio, ruvido, bagnato, asciutto | ~350 |
| `adj_personality` | Character and personality | gentile, crudele, generoso, geloso, coraggioso, timido, onesto | ~350 |
| `adj_emotional_state` | Emotional states | felice, triste, arrabbiato, spaventato, preoccupato, contento | ~250 |
| `adj_shape` | Shape and form | rotondo, quadrato, piatto, diritto, curvo, stretto, largo | ~150 |
| `adj_speed` | Speed and rate | veloce, lento, rapido, improvviso, graduale, subito | ~100 |
| `adj_difficulty` | Difficulty and complexity | facile, difficile, semplice, complicato, complesso, ovvio | ~150 |
| `adj_material` | Material and composition | metallico, di legno, di cotone, di vetro, di plastica | ~100 |
| `adj_relational` | Relational (social, national, institutional) | nazionale, sociale, professionale, culturale, politico, economico | ~600 |
| `adj_state` | State and condition | pieno, vuoto, libero, aperto, chiuso, disponibile, pronto | ~400 |

**What stays:** the existing `adjective_size` (34), `adjective_temperature` (10), `adjective_distance` (8), `adjective_age` (15), and `adjective_nationality` (62) already cover specific sub-domains. The new sub-themes pick up what those leave — the remaining ~3,700 entries currently in `adjective_quality` alone.

**`adj_relational` is the biggest new group.** These are adjectives derived from nouns (nazione→nazionale, societa→sociale) that describe a relation rather than a quality. They're pedagogically distinct from evaluative adjectives — "politico" doesn't mean something is good or bad, it means "relating to politics".

---

## 3. `verb_action_general` (1,744 entries) → 12 sub-themes

Based on WordNet's 15 verb files, adapted for Italian learner vocabulary.

| ID | Label | Example lemmas | Est. size |
|---|---|---|---|
| `verb_manipulation` | Handling and physical contact | prendere, mettere, toccare, spingere, tirare, tagliare, lanciare, aprire | ~300 |
| `verb_body` | Bodily actions and self-care | mangiare, bere, dormire, lavare, vestire, respirare, sedere | ~150 |
| `verb_exchange` | Giving, taking, buying, selling | dare, ricevere, comprare, vendere, pagare, prestare, scambiare | ~200 |
| `verb_social` | Social and institutional acts | votare, sposare, insegnare, aiutare, governare, punire, invitare | ~200 |
| `verb_competition` | Competition and conflict | giocare, combattere, vincere, perdere, gareggiare, difendere, attaccare | ~100 |
| `verb_sound` | Making sounds | gridare, cantare, suonare, ridere, piangere, fischiare, sussurrare | ~80 |
| `verb_tool_use` | Using tools and technology | usare, accendere, spegnere, guidare, collegare, stampare, scaricare | ~100 |
| `verb_cooking` | Food preparation | cucinare, friggere, bollire, cuocere, mescolare, impastare, condire | ~60 |
| `verb_cleaning` | Cleaning and maintenance | pulire, lavare, spazzare, riparare, ordinare, sistemare | ~50 |
| `verb_nature` | Natural processes | fiorire, germogliare, appassire, maturare, marcire, sbocciare | ~60 |
| `verb_position` | Placing and spatial arrangement | appendere, appoggiare, infilare, avvolgere, spargere, allineare | ~80 |
| `verb_measure` | Measuring and comparing | misurare, contare, pesare, calcolare, valutare, confrontare | ~60 |

**What stays in `verb_action_general`:** truly generic verbs that cross multiple domains (fare, fare, fare — also portare, tenere, lasciare, iniziare which appear in 3-4 verb groups simultaneously). Probably 200-300 entries.

**Overlap with existing verb themes:** the new sub-themes are children of `verb_action_general`, so they roll up. But some entries currently tagged `verb_action_general` should also gain existing peer-level tags: *mangiare* should also be `verb_body`-adjacent (currently no such peer exists, so `verb_body` becomes both a sub-theme of `verb_action_general` and a standalone peer). The overlap is manageable.

---

## 4. `people_general` (988 entries) → 8 sub-themes

Based on Oxford Learner's Dictionary "People" topic structure.

| ID | Label | Example lemmas | Est. size |
|---|---|---|---|
| `people_life_stage` | Life stages | neonato, bambino, ragazzo, adulto, anziano, adolescente, giovane | ~80 |
| `people_relationship` | Friends, neighbours, acquaintances | amico, vicino, collega, fidanzato, conoscente, compagno | ~100 |
| `people_group` | Groups and communities | famiglia, popolo, comunita, squadra, folla, pubblico, classe | ~100 |
| `people_gender_identity` | Gender and identity terms | uomo, donna, maschio, femmina, signore, signora, ragazzo/a | ~60 |
| `people_context_role` | Contextual roles (customer, passenger, candidate) | cliente, passeggero, candidato, utente, partecipante, spettatore | ~100 |
| `people_moral_legal` | Moral and legal categories | criminale, vittima, eroe, testimone, colpevole, innocente, reo | ~60 |
| `people_status` | Social status and belonging | cittadino, straniero, ospite, residente, immigrato, rifugiato | ~80 |
| `people_abstract` | Abstract person-concepts | mente, anima, spirito, personalita, carattere, natura (umana) | ~100 |

**What stays:** the truly generic people-nouns (persona, gente, tipo, individuo, essere umano) — maybe 200 entries.

---

## 5. `communication` (755 entries) → 6 sub-themes

| ID | Label | Example lemmas | Est. size |
|---|---|---|---|
| `comm_greeting` | Greetings and courtesies | ciao, salve, buongiorno, arrivederci, grazie, prego, scusa | ~30 |
| `comm_language` | Language and speech | parola, lingua, frase, discorso, voce, accento, dialetto | ~150 |
| `comm_writing` | Writing and texts | lettera, libro, articolo, messaggio, testo, pagina, racconto | ~120 |
| `comm_media` | Media and broadcasting | giornale, radio, televisione, internet, rete, canale, notizia | ~100 |
| `comm_signalling` | Signals, signs, symbols | segno, segnale, simbolo, avviso, annuncio, avviso, cartello | ~80 |
| `comm_conversation` | Conversation and discussion | conversazione, dialogo, discussione, dibattito, riunione, conferenza | ~80 |

**What stays:** genuinely broad communication terms (cosa, comunicazione, informazione, risposta, domanda) — about 100 entries.

---

## 6. `mental_state` (479 entries) → 5 sub-themes

This group heavily overlaps with `noun_abstract` — many entries carry both tags. The sub-themes should be specific enough to distinguish mental-state words from general abstractions.

| ID | Label | Example lemmas | Est. size |
|---|---|---|---|
| `mental_belief` | Belief and opinion | convinzione, fede, parere, opinione, certezza, dubbio | ~80 |
| `mental_knowledge` | Knowledge and awareness | conoscenza, sapere, coscienza, consapevolezza, ignoranza | ~70 |
| `mental_intention` | Intention and purpose | intenzione, scopo, obiettivo, progetto, volonta, decisione | ~70 |
| `mental_memory` | Memory and imagination | memoria, ricordo, fantasia, immaginazione, sogno, illusione | ~60 |
| `mental_ability` | Ability and skill | abilita, capacita, talento, intelligenza, competenza, abilita | ~60 |

**What stays:** broad mental terms that cross sub-categories (mente, pensiero, idea, ragione) — about 80 entries.

**Overlap with `noun_abstract`:** many of these entries will carry BOTH `mental_state.X` and `noun_abstract.X` tags (e.g. *convinzione* is both a mental belief and an abstract cognition). That's fine — multi-tagging is the design.

---

## 7. `verb_communication` (419 entries) → 5 sub-themes

| ID | Label | Example lemmas | Est. size |
|---|---|---|---|
| `vcomm_speaking` | Speaking and saying | dire, parlare, raccontare, spiegare, affermare, dichiarare | ~120 |
| `vcomm_asking` | Asking and requesting | chiedere, domandare, pregare, richiedere, supplicare | ~60 |
| `vcomm_answering` | Answering and responding | rispondere, ribattere, replicare, obiettare, negare | ~50 |
| `vcomm_writing` | Writing and recording | scrivere, pubblicare, stampare, annotare, firmare, redigere | ~60 |
| `vcomm_signalling` | Calling, warning, informing | chiamare, avvisare, avvertire, informare, annunciare, segnalare | ~60 |

**What stays:** broad communication verbs (comunicare, esprimere, significare) — about 50 entries.

---

## 8. `adverb_manner` (391 entries) → 8 sub-themes

Based on Quirk's process-adverbial classification and Cambridge EFL vocabulary units.

| ID | Label | Example lemmas | Est. size |
|---|---|---|---|
| `adv_speed` | Speed and tempo | velocemente, lentamente, rapidamente, gradualmente, subito | ~40 |
| `adv_care` | Care and precision | attentamente, accuratamente, con cura, distrattamente | ~30 |
| `adv_skill` | Skill and competence | bene, male, abilmente, perfettamente, goffamente | ~30 |
| `adv_force` | Force and intensity | fortemente, debolmente, violentemente, delicatamente | ~30 |
| `adv_emotion` | Emotional attitude | felicemente, tristemente, rabbiosamente, volentieri, purtroppo | ~40 |
| `adv_style` | Appearance and style | elegantemente, semplicemente, ordinatamente | ~20 |
| `adv_degree` | Degree and extent | completamente, parzialmente, abbastanza, molto, poco, quasi | ~60 |
| `adv_stance` | Stance and evaluation | purtroppo, fortunatamente, francamente, ovviamente, sinceramente | ~50 |

**What stays:** genuinely general manner adverbs (cosi, come, insieme, ancora) — about 60 entries.

**`adv_stance` is the interesting new group.** These are adverbs where the speaker comments on the proposition (purtroppo = "unfortunately", fortunatamente = "fortunately"). They're not manner at all — they modify the whole sentence. Pedagogically useful to group together because Italian learners need to recognise the "speaker's comment" pattern.

---

## 9. `shopping_money` (241 entries) → 4 sub-themes

| ID | Label | Example lemmas | Est. size |
|---|---|---|---|
| `shop_finance` | Banking, finance, economics | banca, conto, debito, credito, investimento, assicurazione | ~70 |
| `shop_venue` | Shops and markets | panetteria, macelleria, farmacia, mercato, supermercato | ~50 |
| `shop_transaction` | Buying, selling, pricing | prezzo, sconto, offerta, ricevuta, cambio, resto | ~50 |
| `shop_goods` | Products and merchandise | prodotto, merce, articolo, marca, modello, qualita | ~40 |

---

## 10. `verb_change` (390 entries) → 4 sub-themes

This group already exists as a peer of `verb_action_general`. It's broad but defensible. The sub-themes help a learner who wants to focus on a specific type of change.

| ID | Label | Example lemmas | Est. size |
|---|---|---|---|
| `vchange_growth` | Growth and increase | crescere, aumentare, espandere, allargare, gonfiare | ~80 |
| `vchange_reduction` | Reduction and decrease | diminuire, ridurre, restringere, abbassare, accorciare | ~70 |
| `vchange_transformation` | Transformation and conversion | cambiare, trasformare, diventare, convertire, modificare | ~100 |
| `vchange_begin_end` | Beginning and ending | iniziare, cominciare, finire, terminare, smettere, interrompere | ~60 |

---

## 11. Smaller groups worth subdividing

These are below the 400-entry threshold but still worth splitting for navigation.

### `emotions` (198 entries) → 4 sub-themes

| ID | Label | Example lemmas |
|---|---|---|
| `emotion_positive` | Positive emotions | gioia, felicita, amore, entusiasmo, gratitudine |
| `emotion_negative` | Negative emotions | paura, rabbia, tristezza, ansia, vergogna |
| `emotion_surprise` | Surprise and uncertainty | sorpresa, stupore, meraviglia, dubbio, incertezza |
| `emotion_desire` | Desire and motivation | desiderio, volonta, passione, ambizione, nostalgia |

### `time_general` (184 entries) → 3 sub-themes

| ID | Label | Example lemmas |
|---|---|---|
| `time_clock` | Clock and calendar time | ora, minuto, secondo, mezzogiorno, mezzanotte |
| `time_period` | Periods and durations | periodo, epoca, secolo, anno, mese, settimana |
| `time_relation` | Temporal relations | prima, dopo, durante, mentre, subito, finalmente |

### `verb_creation` (173 entries) → 3 sub-themes

| ID | Label | Example lemmas |
|---|---|---|
| `vcreate_making` | Making and building | fare, creare, costruire, produrre, fabbricare |
| `vcreate_artistic` | Artistic creation | dipingere, disegnare, comporre, scrivere, scolpire |
| `vcreate_planning` | Planning and designing | progettare, pianificare, organizzare, preparare, programmare |

### `verb_possession` (200 entries) → 3 sub-themes

| ID | Label | Example lemmas |
|---|---|---|
| `vposs_owning` | Owning and having | avere, possedere, appartenere, detenere |
| `vposs_giving` | Giving and transferring | dare, regalare, donare, consegnare, offrire |
| `vposs_taking` | Taking and acquiring | prendere, ottenere, guadagnare, raccogliere, ricevere |

---

## Naming Conventions

Sub-theme IDs follow the existing pattern: `parent_id` + descriptive suffix.

For the three POS-based groups, a different approach: instead of the current labels "Semantic sub-category for verb lemmas" / "Semantic sub-category for adjective lemmas" / "Semantic sub-category for adverb lemmas", propose:

| Current kind label | Proposed kind label |
|---|---|
| `verb_subtype` | `verb_semantic` |
| `adjective_subtype` | `adjective_semantic` |
| `adverb_subtype` | `adverb_semantic` |

The "sub-category for X lemmas" phrasing is a taxonomy description, not a learner-facing label. "Verb semantics" / "Adjective semantics" / "Adverb semantics" is shorter and says the same thing.

---

## Impact on the Learner-Facing Chip List

The current picker has 94 chips (30 parents + 64 sub-chips) in 4 sections. The new sub-themes would add approximately 55-60 new sub-chips, bringing the total to ~150 chips.

That's too many to show flat. Two options:

**Option A: expand on demand.** The current "..." expander already reveals sub-chips beneath parents. Adding sub-sub-chips beneath existing sub-chips would be one more level of expansion. The chip list stays manageable because most sub-sub-chips are hidden until their parent sub-chip is expanded.

**Option B: hidden from the picker, used for engine-side filtering.** The new sub-themes don't appear in the chip list at all — they're engine-side only, used for smarter question selection and the weakness panel. The learner still sees the existing 94 chips.

**Recommendation:** Option B for the verb/adjective/adverb sub-sub-themes (these are pedagogically useful for the engine but not learner-browsable). Option A for the concrete-domain sub-themes (noun_abstract, people_general, communication, shopping_money — these help a learner find "feelings words" or "money words" when they want to focus).

---

## What Other Corpora Offer That We Don't Have

**ItalWordNet** (the Italian WordNet, ILC-CNR Pisa) classifies Italian nouns into ~45 lexicographer files. Its noun classification is more granular than what I've proposed here — it separates "noun.food" from "noun.plant" from "noun.animal" and has dedicated files for "noun.artifact", "noun.cognition", "noun.communication", etc. A future pass could use the ItalWordNet-to-Linguics theme mapping (`data/wordnet_to_linguics_themes.json`) to auto-tag entries that are currently only in `noun_abstract`.

**EuroVoc** (EU multilingual thesaurus) organises vocabulary into 21 top-level domains with ~6,000 descriptors. It's too fine-grained for a learner vocabulary but useful for cross-referencing the politics_society and law_justice groups, which currently have no sub-themes.

**CEFR topic lists** (Online Italian Club) introduce vocabulary by level — A1 is body parts and family, B2 is crime and psychology. A CEFR-level tag on each sub-theme would let the entry-builder say "this is an A2 topic" vs "this is B1", which the current system can't do.

---

## Summary

| Group | Current size | Proposed sub-themes | Estimated coverage |
|---|---|---|---|
| `noun_abstract` | 4,920 | 10 | ~85% get a sub-tag |
| `adjective_quality` | 3,922 | 10 | ~90% get a sub-tag |
| `verb_action_general` | 1,744 | 12 | ~85% get a sub-tag |
| `people_general` | 988 | 8 | ~80% get a sub-tag |
| `communication` | 755 | 6 | ~85% get a sub-tag |
| `mental_state` | 479 | 5 | ~80% get a sub-tag |
| `verb_communication` | 419 | 5 | ~85% get a sub-tag |
| `adverb_manner` | 391 | 8 | ~85% get a sub-tag |
| `verb_change` | 390 | 4 | ~80% get a sub-tag |
| `shopping_money` | 241 | 4 | ~85% get a sub-tag |
| `verb_creation` | 173 | 3 | ~75% get a sub-tag |
| `verb_possession` | 200 | 3 | ~80% get a sub-tag |
| `emotions` | 198 | 4 | ~85% get a sub-tag |
| `time_general` | 184 | 3 | ~70% get a sub-tag |
| **TOTAL** | **~15,000** | **85 new sub-themes** | |

**Total new sub-themes: ~85.** Combined with existing 93 themes, the taxonomy grows to ~178. Most are invisible to the learner (engine-side only for the POS-based groups); the learner-facing chip list grows from 94 to ~120-130 chips.

---

## Next Steps (for Smith to decide)

1. **Approve the split list** (or push back on any groupings). Each sub-theme needs your OK before it becomes a chip.
2. **Decide learner-facing vs engine-only** for each group's sub-themes.
3. **Tagging pass.** Once approved, a script can auto-tag ~60-70% of entries using lemma-matching against ItalWordNet and the existing WordNet theme mapping. The remaining 30-40% need human review (the polysemous entries, the long tail, the garbage).
4. **Label review.** The learner-facing labels need to be short enough for a chip and clear enough for a beginner. "Evaluation and opinion" might become just "Opinion" on screen.
