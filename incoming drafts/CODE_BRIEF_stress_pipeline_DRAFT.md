> SUPERSEDED 2026-08-03 by REQUEST_to_code_stress_pipeline.md (Architecture issued the real Code commission 2026-07-21, and Code has delivered). Kept for reference only.

# DRAFT brief for the Code seat: the stress + syllabification pipeline

**Status: DRAFT by StressAuthor for Architecture to review and ISSUE.** Authors do not dispatch other seats;
this is ready-to-send content, not a live dispatch. Spec of record: DESIGN_accent_and_stress_drills.md §B +
inter_chat/Architecture_StressAuthor_data_spec.md (v1-v4). Golden set + field examples:
incoming drafts/stress_seed_v0.json. Syllabifier prototype: incoming drafts/syllabify_it_prototype.py.

## 1. Goal and non-goals
Establish STRESS TRUTH for the drilled vocabulary and emit it as metadata, the way the vocab lists were built
(rules + corpus lookup, confidence-marked), NOT hand-authored. Non-goals: no UI, no marking, no editing Vocab's
file in place (write a STAGING file; Architecture + Vocab merge). Default Italian stress is piana; the whole job
is to find and justify the exceptions and mark confidence honestly.

## 2. Output schema (per lemma; and per wordform in the wave-2 layer)
`stress_pos` (1..4 from end) · `syllables` (ordered array) · `syllable_count` · `accent_cue` (bool: final
written accent present) · `stress_source` (evidence: orthographic_mark|dictionary|rule|author) ·
`stress_confidence` (high|medium|low) · `stress_mechanism` (orthographic|derivational|inflectional|lexical) ·
`stress_mechanism_detail` · `etymological` (bool) · `stress_tags` (secondary memberships).
Rule for accent_cue words: `stress_mechanism=orthographic/accent_final` PRIMARY, deeper cause demoted into
`stress_tags` (e.g. `derivational:suffix_ta`).

## 3. The pipeline (apply in order; each later tier CONFIRMS the earlier; mark disagreements)
1. **Orthographic** — final written accent => stress_pos=1, accent_cue=true, mechanism=orthographic,
   source=orthographic_mark, confidence=high. (Monosyllables => pos 1 trivially.)
2. **Derivational** — match the suffix table (§4): sets stress_pos + mechanism=derivational/detail, source=rule,
   confidence=high.
3. **Inflectional** — for verbs, GENERATE forms from a conjugation model and assign stress by paradigm cell
   (§5). This is how the wordform layer is built without per-form lookup. source=rule/derived.
4. **Pronunciation-lexicon lookup** — for the lexical residue (underived words) AND to confirm tiers 1-3.
   Candidate corpora to weigh: Wiktionary IT (IPA with the ˈ stress mark, broad, scriptable), DOP, PhonItalia
   (~120k stress-marked forms), Morph-it!, espeak-ng's IT stress. source=dictionary; confidence high if a source
   confirms a rule or two sources agree, medium on a lone source, and RECORD disagreements rule-vs-lexicon.
5. **Etymological prior** — learned/Greek shape (many -ico/-ologo/-grafo, classical roots) => set
   `etymological=true` and, only where tiers 1-4 gave nothing, a LOW-confidence sdrucciola guess flagged for
   review. Never ship an etymological guess as fact.
**Syllabification** runs AFTER stress is known (the -ia hiatus split, farmacìa vs stòria, is stress-dependent).
Start from the prototype (57/58 on the seed; geminate rule already fixed). Emit `syllables` + `syllable_count`.

## 4. Derivational suffix table (stress effect; extend as the corpus demands)
- Final / tronca: `-tà -tù` (città, virtù); `-ìo/-ìa` learned hiatus (zìo, farmacìa) [flag: lexical vs learned].
- Antepenult / sdrucciola: `-issimo -ico -ibile -abile -evole -aggine -(i)tudine -edine -esimo -ologo -grafo
  -metro`.
- Penult / piana (reinforce the default, low diagnostic value but still tag): `-zione/-sione -mente -mento -tore
  /-trice -anza/-enza -oso -ale -are -ano -ese`; alteratives `-ino -etto -ello -otto -uccio -one -accio` (stress
  moves ONTO the suffix: ragazzìno, portóne).

## 5. Inflectional paradigm cells (stress effect)
- Infinitive: `-are -ire` penult (parlàre, partìre); **`-ere` is a LEXICAL split** — stem-stressed sdrucciola
  (prèndere, scrìvere, léggere) vs ending-stressed piana (temére, dovére, potére, sapére, vedére) — not
  predictable from spelling; supply/lookup a per-verb list.
- Present indicative: rhizotonic (1/2/3sg, **3pl**) = STEM stress; arhizotonic (1/2pl) = ending stress. The 3pl
  on a long stem is the sdrucciola/bisdrucciola maker (pàrlano, telèfonano, àbitano).
- Passato remoto: 3sg `-ò` tronca (parlò); 3pl `-àrono` sdrucciola.
- Future 1sg/3sg `-erò/-erà` tronca; conditional penult (-erèbbe); imperfetto/gerund/participle penult
  (parlàvo, parlàndo, parlàto).
- Imperative + enclitic clitics: stress stays on the stem syllable while clitics add tail syllables, pushing the
  stress window back (dìmmelo sdrucciola, compràtemelo bisdrucciola).

## 6. Confidence, provenance, honesty
Every value carries source + confidence. Un-looked-up words enter `rule_default/low` and are EXCLUDED from the
drill until confirmed. Record rule-vs-lexicon disagreements for author review rather than silently picking.

## 7. Deliverable format
A STAGING JSON keyed by lemma (+ a wordform file for the wave-2 layer), plus a COVERAGE REPORT: counts by
confidence, how many needed lexicon lookup, the disagreement list, and per-source provenance. Do not touch
`data/vocabulary_it_frequency.json` directly.

## 8. Validation
Invariants: `1 <= stress_pos <= syllable_count`; `syllable_count == len(syllables)`; `stress_class` consistent
with `stress_pos`; `accent_cue` true iff final char is an accented vowel. Regression-check a sample against the
golden set `incoming drafts/stress_seed_v0.json` (58 forms, hand-verified).

## 9. Phasing
Lemma layer first (the vocab entries, mostly tiers 1-2-4). Wordform layer second (tier 3 generation): the whole
bisdrucciola class, the stress-shift paradigms (àbitano/abitò) and the spelling-identical minimal pairs
(àncora/ancóra, sùbito/subìto, càpitano/capitàno) all live there.
