# Author Brief: producing grammar questions and translation items

**Revision 25** (2026-07-17). From Smith, on the A1 item `ex_form_q_02` ("____ domande?", cue `esserci`). **Criterion 20's citation-form exemption is conditioned on LEVEL: the citation form must itself sit at or below the item's CEFR level.** The exemption was written for *parlare -> conjugate it*, and silently assumed the citation form is known. `esserci` at A1 breaks that: an A1 learner knows *c'è / ci sono* as chunks and does not know the dictionary lemma, will not recognise it as an infinitive, and cannot decompose it into *essere + ci*. So the cue stops being a scaffold and becomes a gate — Smith: it "almost penalises someone who doesn't know the language too strongly." **Where the citation form is above the item's level, gloss the target in English instead** ("[Are there any questions?]"), per criterion 20's main rule. Next-touch: `binds: all-authors`; `retrofit:` audit your cues against your items' levels — ExistentialAuthor first (32 esserci-cued items, 14 of them A1). **Revision 24** (2026-07-17). From Smith: *"if you write something that affects everybody, do you have to name every single thread?"* **No — and the current design is broken, which the audit proves: six of criteria 13-20 name NO seat at all, so no seat's name-grep can ever find them.** Two of those six carry retrofit obligations. **Criterion 17 is the worked example**: it binds every author, names nobody, says "existing items gain it on their next touch" — and no next touch ever came, so 418 items sat bare across five topics and an entire seat (Cr17Sweep) had to be commissioned to do by hand what delivery should have done. **The fix is two-part.** (i) **Separate STANDING rules from RETROFIT tasks.** Most estate-wide rulings are standing ("new items do X"): you comply by reading the brief when you author, and they must NEVER enter a queue, or every board shows all twenty criteria forever and the ritual dies of noise. Only the retrofit half is a task, and only it needs delivering. (ii) **For the retrofit half, use a CLASS TOKEN, not a name list.** Every clause declares `binds:` — explicit seats, or `all-authors` / `all-seats`. A seat's self-check greps its own name PLUS the class tokens it declares in `_status/<Seat>.md`. One extra grep; no 31-name list to rot; a new seat inherits every standing obligation the day it declares its class. **Naming every seat would be the wrong fix**: the list is unmaintainable, it rots silently the moment a seat is created, and it still would not distinguish a standing rule from a task. **Discharge scales the same way**: a class clause accumulates one stamp per seat and each seat subtracts only its own — which finally gives the architect a live COMPLIANCE TABLE (bound class MINUS stamped seats), the thing Rev 21(iii) promised but could not compute. Cost, stated honestly: a retrofit binding 31 authors shows on 31 boards until 31 stamps land. That is not noise, it is the truth — criterion 17's 418 bare items are what the silence cost. It also makes universality expensive by design, which is the right pressure. **Revision 23** (2026-07-17). From ComparisonAuthor's criterion-20 pass, and it is a cross-criterion hazard nobody had seen. **Criterion 20 can silently disarm criterion 19's Rev 21(i) carve-out.** That carve-out is conditioned on the prompt SUPPLYING or PINNING the candidate forms - and criterion 20's whole job is to DELETE the Italian fragment that was doing the supplying. So a crit-20 reframe can turn a settled crit-19 no-op back into a live accent case, invisibly, because an author who ran their accent check before the retrofit sees nothing. **The saving rule: a bracketed English meaning PINS as well as an Italian fragment SUPPLIES, so the carve-out survives glossing whenever the gloss names the thing** ("...more coffee than tea" still pins te's lexeme, so the stripped twin is still not a candidate answer). Where a gloss leaves the lexeme genuinely open, the carve-out lapses and accent_load_bearing may become live. **Next-touch (binding): any seat doing a criterion-20 retrofit re-runs its criterion-19 check AFTER glossing, not before.** Binds PrepositionAuthor (55 items, the live exposure); ComparisonAuthor already verified theirs (cmp_dvc_06) rather than assuming. **Revision 22** (2026-07-16). Two items. (i) **Criterion 20 added (cue by meaning, not by fragment)**, from Smith's live hit on prep_sf_03: where a production item would cue its target with a bare Italian answer-fragment that reads as the whole answer or presupposes the form under test, cue by bracketed English meaning + register instead and set prompt_supplies_base_form:false so the cue-misread second-chance applies; the citation-form trigger (infinitive to conjugate, base adjective to agree, lemma to inflect) is exempt. Next-touch: PrepositionAuthor (55 candidate items) and ComparisonAuthor (19); new items follow immediately; the criterion-17 sweep flags stragglers. (ii) **The criterion-17 retro-sweep is commissioned** as its own proofread seat (Cr17Sweep), on Smith's go-ahead - see DISPATCH_criterion_17_sweep. It adds pre-Rev-13 glosses and flags content bugs + criterion-20 cues to owning authors, base rate ~2 hidden content bugs per 124 old items. **Revision 21** (2026-07-16). Three rulings from TenseChoiceAuthor's wave-2 asks, all of them things several seats had derived independently. (i) **Criterion 19 gains a supplied-choice carve-out**: it does not apply where the prompt SUPPLIES or PINS the candidate forms, because the accent-stripped twin cannot be a candidate answer there. Five seats (NounAuthor, PassiveAuthor, NegationAuthor, ComparisonAuthor, TenseChoiceAuthor) each spent the same twenty minutes reaching this verdict from first principles; that is a brief defect, not a coincidence. In a supplied-choice item the answer space is the menu, so a learner typing sbarco for sbarco' chose the right tense and misspelled it: leave accent_load_bearing unset and let the fold-rescue plus orthography miss do the work. (ii) **Criterion 16's controlled tense-tags gain presente_progressivo and imperfetto_progressivo**, and gerundio is narrowed to mean the BARE nonfinite (verb_form.gerundio formation items) and never the stare + gerundio periphrasis. A progressive item's candidate is 'sto mangiando', so a chip reading 'Gerund' mislabels the choice the learner made. Housing's label map needs the two additions; its de-underscoring fallback makes the interim safe. (iii) **Every new criterion and revision must carry a next-touch clause**: it names the seats it BINDS and how the retrofit reaches them (a dispatch, a thread append, or 'new items only'). Criteria 15 and 16 bound tense_choice by name and sat at 0/92 for seven weeks because nothing in the estate turned a ratified criterion into a knock on anybody's door; Rev 19 had the same gap until this ruling. A criterion with no next-touch clause binds nobody. The architect owns firing the clause on the day the revision lands. **Revision 20** (2026-07-15). Three grading/authoring clarifications from the tail of the batch wave. (i) Dodge-vs-named-miss precedence (RelativePronounAuthor): the 0.9-for-dodges rule applies only where the sidestep is NOT itself a targeted misconception of the item's bucket; where the correct-but-off-pattern form is the bucket's named common_miss (il quale where plain che suffices), it does not collect the default 0.9 kindness - the specific diagnosis outranks the general rule. WRONG is the default; the author MAY instead assign an explicit graded credit (0.5-0.8) with a steering note where partial recognition serves the teaching point better than a flat miss (Smith, 2026-07-15: "a bit of flex is ok here depending on the point one wishes to make"). What is ruled out is the named common_miss silently inheriting 0.9 as if it were a mere dodge. (ii) The recoverability condition gains a sixth class, frame-forced candidate sets (ComparisonAuthor's di_vs_che): where the frame admits exactly the candidate set (più X ___ Y admits only di/che), the candidates are recoverable from the sentence itself and suppression stands. (iii) Criterion 18 gains an instruction-pinned mitigation class (RelativePronounAuthor's chi items): a guard that could false-flag only an answer defying an explicit prompt instruction ("Complete with one word:") is acceptable - the asymmetry matters, a false WRONG on a non-compliant answer beats losing the common_miss catch. Also §3 documents the square-bracket meta-instruction convention (ratified in Architecture_Housing_translation_source_brackets, previously undocumented here). **Revision 19** (2026-07-15). Criterion 15 gains the RECOVERABILITY condition, from AdverbAuthor's finding (Smith's live catch on the bene/buono items): suppress-by-default applies only where the candidate set is recoverable pre-answer (tense choices pinned by context and a supplied verb; formation items whose base form the cue gives). Where the candidates are different LEXEMES nothing in the prompt reveals (bene/buono, questo/quello), suppression makes the item unanswerable and records misses on buckets the learner was never invited to engage: there, the breadcrumb stays VISIBLE and the leaf is labelled by its CANDIDATE FORMS, never by the rule (criterion 13 applied to labels: "molto / molta / molti / molte", not "molto that agrees"). Criterion 16's candidate_forms still ride along for the post-answer tick. **Revision 18** (2026-07-14). Communication rule, from Smith's catch: the coverage doc is the RECORD, not the channel. Anything that needs an Architecture ruling, registration, or action MUST also open (or append to) an inter_chat thread naming the ask; a question that lives only in a coverage doc waits to be discovered, and tonight several did. Sections like "items flagged uncertain" and "notes for the architect" stay in the coverage doc as the record, with a one-line thread pointing at them. The architect's acceptance audit greps coverage docs for stranded asks as a safety net, but the thread is the contract. **Revision 17** (2026-07-14). Four rulings from the evening's batch wave. (i) The stale §2 match_at field bullet is rewritten to match criterion 18 and the shipped engine (per-phrase, word/start/end, fully supported); flagged by RelativePronounAuthor. (ii) Criterion 18 gains the third direction, from PrepositionAuthor: no must_not_include entry may be a substring of a plausible CORRECT attempt (a bare "a Parigi" catch fires on the correct "partiamo da Parigi": false diagnostic, worse than false credit); word-anchor bare a-phrases. (iii) Criterion 16 generalises to non-tense discriminations: use `candidate_forms` (display labels) + `correct_form` with identical semantics to candidate_tenses (suppressed pre-answer, tick + per-context stats post-answer); tense items keep candidate_tenses. Raised independently by PossessiveAuthor (suo referent discrimination) and DemonstrativeAuthor (questo/quello). (iv) Grading: correct Italian that SIDESTEPS the drilled pattern scores 0.9 with a steering note (the 0.9-for-dodges rule, extending the 2026-07-12 standard-variant policy; from the preposition partitive items). Also: bucket aggregates may carry `default_info_display: "suppress"`, giving whole form-leaf subtrees the discrimination-style default (pronoun tree is the first user; Housing resolver support pending). **Revision 16** (2026-07-14). Criterion 19 added (accent as morpheme): where the accent-stripped form of an answer is a plausible alternative ANSWER to the same prompt (3sg remoto parlò against present parlo; credè against crede; partì against parti), set accent_load_bearing: true on the markpoint (disables the accent-fold rescue, engine-supported since 2026-07-14-r4) and list the stripped twin in must_not_include with a teaching note. Where the stripped form is not a candidate answer (e for è, da for dà, ando for andò), do nothing: the standard fold-rescue plus orthography miss is the right verdict. **Revision 15** (2026-07-14). Criterion 18 added (superstring safety): no unanchored any_phrase may be a substring of a PLAUSIBLE wrong attempt; the comparison set is plausible attempts, not the item's own must_not_include list. Audit rightward extensions (stems inside their own inflections: parla inside parlava / parlando / parlare) and leftward extensions (a X inside da X / fra X; alle inside dalle; abbiamo inside habbiamo). Default mitigation: match_at "word" on any single-form phrase whose plausible wrong attempts embed it (the engine anchors both word boundaries, including on the accent-folded fallback); item rework (a different person, an -ire verb) where anchoring reads awkwardly. Surfaced by PresentUsageAuthor (rightward) and PrepositionAuthor (leftward); a retro-audit anchored 53 exposed phrases across seven live batches the same day. **Revision 14** (2026-07-14). New section "House techniques" (end of this document): five recurring item-design patterns distilled from the OnlineItalianClub deep exercise audit (REFERENCE_oic_exercise_drill.md). Encouraged patterns, not compliance gates. **Revision 13** (2026-07-13). Criterion 17 added: every grammar item's explanation includes a plain English translation of the completed correct sentence, so a learner who did not fully parse the Italian still gets the meaning. New items carry it; existing items gain it on next touch. Surfaced by Smith on live grammar items whose explanations gave the grammar but not the sentence meaning. **Revision 12** (2026-07-12). Criterion 15 gains a terse-label rule: a leaf `label` renders as the pre-answer breadcrumb, so name the class only and keep worked examples in `description`; shorten an over-long label before reaching for suppress. Surfaced by the trapassato and imperativo formation leaves. **Revision 11** (2026-06-09). Criterion 16 added: `tense_choice` and `.discrimination.*` items carry `candidate_tenses` (the legitimate options) and `correct_tense` (the right one), tense-level labels for the post-answer tick and per-context stats, marking unaffected, candidates shown post-answer only and the item suppressed pre-answer. Resolves the candidate_tenses open question; carried by the TenseChoice wave-2 dispatch. **Revision 10** (2026-06-09). Criterion 15 gains a clarification: discrimination items (anything in a `.discrimination` bucket or the tense_choice tree) are `info_display: "suppress"` by default, because the breadcrumb names the contrast being tested and tips the learner that a tense choice is in play, which they should detect from context. Project-wide; binds TenseChoice and every tree's discrimination buckets. **Revision 9** (2026-06-08). Criterion 13 gains a cue-economy note: name the person in the cue only when the prompt does not already supply the subject. Drop `(fare, voi)` to `(fare)` when the sentence shows "Voi"; keep `(capire, io)` when the subject is pro-dropped. Surfaced by Smith on the live present-indicative items, where the cued person was redundant in the 67 items whose sentence carries an explicit subject pronoun. **Revision 8** (2026-06-08). §2 adds criterion 15 on the bucket-name breadcrumb leak (the sibling of criterion 13, promised as a Rev 7 addendum and previously missing): set `info_display: "suppress"` on an item when its bucket-name breadcrumb would hand the learner the verb-class membership or rule-output under test, decided by a leak-vs-trap test (suppress when the breadcrumb names a non-derivable class the item tests; leave visible when it only restates the cue, or when naming the class tempts a wrong answer the `must_not_include` catches). The housing honours the flag in the bucket-filter banner and live-panel tooltips. Surfaced by PresentFormationAuthor on the -isc-/-go/dittongo formation leaves. **Revision 7** (2026-06-08). §2 adds criterion 14 on multi-position clitic items: when a structure allows the clitic in two valid positions (modal + infinitive, stare + gerundio progressive, negative tu imperative, causative fare + infinitive, and their cluster / reflexive variants), the prompt asks for a full sentence rewrite and must NOT announce that placement is the variable or that multiple answers are valid (no "place the pronoun", "either valid position", "before or after the verb"). Accept all valid placements in `any_phrases`; the both-positions teaching belongs in the explanation. Triggered by the progressive item `op_pos_ger_02` whose prompt said "Either valid position", planting the placement idea instead of testing whether the learner reaches for it. **Revision 6** (2026-06-07). §2 adds criterion 13 on cue chip discipline: chips name the surface morphology of the wanted answer, not the structural rule. Triggered by the negative-imperative item "Don't give it to me!" whose chip leaked "infinitive form for negative tu", naming the very rule the item is supposed to test. Self-audit on next opening: look in your batch for chip texts containing rule names (infinitive, subjunctive, conditional, gerund, etc.) and rewrite to name the surface only. **Revision 5** (2026-05-29). §2 lemma key conventions extended: a new rule 8 adds `number` (sg | pl) as an optional fourth discriminator on the unique key, in the same shape as `gender`. Triggered by the `le` clitic pronoun case (f-sg-indirect vs f-pl-direct sharing the rest of the key). Bucket-id shape extends in parallel: `vocabulary.it.<lemma>.<pos>[.<gender>][.<number>].<aspect>[.<direction>]`. **Revision 4** (2026-05-28) added §2 criteria 8-12 (one-markpoint-per-skill, slot-count-matches-surface, implicit-cue must_not_include, register-conditional items state register, prompts not glossary-wrapped) plus §1 external_id decoder. **Revision 3** (2026-05-15) added "Lemma key conventions" to §2 and §7 on friendly-bucket-label communication style. Revision 2 (2026-05-13) and earlier guidance still applies. See [DECISIONS.md](./DECISIONS.md) for the full change log.

This document briefs a fresh chat to produce content for Linguics (Italian language-learning project). The chat receives this brief, the relevant bucket tree, the topic name, and any topic-specific notes.

---

## §0. Context

You are authoring practice content for a language-learning website that marks learner answers against an **atomised bucket taxonomy**. Each miss the system records goes into a named bucket, and per-bucket history shows what a learner is getting right or wrong over time. Your job is to produce two kinds of content:

1. **Grammar questions**: short-answer questions whose answer is one or two words (sometimes up to a 4-word noun phrase) whose correctness is decided by a deterministic substring engine.
2. **Translation items**: one-sentence translations (English to Italian and Italian to English) marked by an AI against a list of pre-authored mark points.

You will be given a **bucket tree** (a JSON file). You do not invent new top-level groups. You may propose new buckets *under registered parents* by listing them at the end of your output (see §4).

---

## §1. Inputs you will be given

A. **The bucket tree** as a JSON file. Each entry has:

```json
{
  "id": "adjective_agreement.o_class.feminine_plural",
  "parent_id": "adjective_agreement.o_class",
  "language_code": "it",
  "label": "Class I, feminine plural (-e)",
  "description": "...",
  "cefr_importance": {"A1": "core", "A2": "core", "B1": "review", ...},
  "prerequisites": ["adjective_agreement.o_class.feminine_singular"],
  "attributes": {"ending": "-e", "canonical_example": "rosse", "common_miss": "case rossi"}
}
```

The `attributes` block gives you concrete examples and known common misses. Lean on `common_miss` for `must_not_include` lists.

B. **The topic**: the name of the top-level group you're authoring against (`adjective_agreement`, `verb_form.passato_prossimo`, `pronoun`, etc.). The bucket tree's root entry's `attributes.topic_short` carries the canonical short code for your `external_id` prefix (e.g. `aa`, `pp`, `op`).

C. **A coverage target.** Aim for several questions per active leaf bucket, with extras on hot spots, until coverage feels honest. Don't hit a fixed number; produce until the topic feels covered. As a rough floor: 2-5 grammar questions per active leaf, plus extras on diagnostically rich buckets; translation items proportional, with at least one per `core`-at-target aggregate node. Earlier dispatches: passato_prossimo landed at 82 grammar + 30 translation across ~30 leaves. The dispatcher may override.

D. **CEFR is a steer, not a gate.** The dispatcher may say "this batch should feel weighted toward A2-B1" but you should not narrow content to one band. Cover the whole tree. Tag each item with `cefr_level_target` so the runtime can filter. If a leaf bucket is `arcane` at every level, it gets one or two items at most; if `core` at the target level, it gets the heaviest coverage.

E. **Any topic-specific notes** the dispatcher attaches (canonical resources, references to consult, special instructions).

F. **External ID convention.** Use the pattern `<type>_<topic>_<direction?>_<subtopic>_<ordinal>` where `type` is `trans` for translation items and the topic_short otherwise (`aa`, `pp`, `op`, `imp`, `tc`, `op_comb_glielo_10` etc.). `direction` (`en_it` / `it_en`) appears only on translation items. `subtopic` is the structural label with dots replaced by underscores (`discrimination.modals.sapere` → `disc_sap`). Ordinal is two-digit zero-padded (`01`, `02`, ...). Examples: `pp_aux_modal_01`, `trans_imp_en_it_disc_sap_03`, `op_comb_glielo_10`.

---

## §2. Grammar question schema

```json
{
  "external_id": "aa_o_fem_sg_01",
  "language_code": "it",
  "topic": "adjective_agreement",
  "subtopic": "o_class.feminine_singular",
  "difficulty": 1,
  "cefr_level_target": "A1",
  "prompt": "Complete the form of 'rosso': 'La casa è ____.'",
  "type": "short",
  "marks": 1,
  "prompt_supplies_base_form": true,
  "markpoints": [
    {
      "order_index": 0,
      "credit": 1.0,
      "bucket": "adjective_agreement.o_class.feminine_singular",
      "label": "feminine singular -a",
      "any_phrases": ["rossa"],
      "must_not_include": ["rosso", "rosse", "rossi"]
    }
  ],
  "vocab_help": [
    {
      "lemma": "rosso",
      "language": "it",
      "aspects": {
        "translation": { "reveal": "rosso - red", "bucket": "vocabulary.it.rosso.translation" },
        "adj_class": { "reveal": "Class I (-o)", "bucket": "vocabulary.it.rosso.adj_class" }
      }
    },
    {
      "lemma": "casa",
      "language": "it",
      "aspects": {
        "translation": { "reveal": "casa - house", "bucket": "vocabulary.it.casa.translation" },
        "gender": { "reveal": "feminine (f)", "bucket": "vocabulary.it.casa.gender" }
      }
    }
  ],
  "explanation": "Casa is feminine singular; Class I adjectives take -a.",
  "examiner_note": "Optional: clarifying marker intent when ambiguous.",
  "version": 1
}
```

### Fields

- `external_id`: stable id with format `<topic_short>_<subtopic_short>_<NN>`. Once assigned, do not change. Topic shorts are in the bucket-tree root's `attributes.topic_short`.
- `language_code`: usually `it` for Italian-target answers.
- `topic`: the top-level group from the bucket tree (matches the bucket id's first component).
- `subtopic`: free-text; usually the bucket id minus the topic prefix.
- `cefr_level_target`: A1-C2. The level this item lands at, used by the runtime for filtering.
- `prompt`: the question text. See "Prompt-writing guidance" below.
- `type`: `short` for free-text (most common), `mcq` (with `choices` + `answer_index`), `numeric` (rare).
- `marks`: total marks. Sum of `markpoint.credit` should equal this.
- `prompt_supplies_base_form` (boolean, optional): true if the prompt gives the learner the citation form (e.g. shows "(rosso)" to be conjugated/agreed). Helps the marker attribute misses correctly to grammar vs vocabulary buckets.
- `markpoints`: array, see below.
- `vocab_help`: array of help entries the learner can reveal during the attempt (see below).
- `explanation`: REQUIRED. The "why" shown to the learner after they've marked. Even on hits this matters: an irregular form is worth flagging as such.
- `examiner_note`: required when there's more than one markpoint or when the miss interpretation is ambiguous. Optional otherwise. Author-facing, not learner-facing.
- `version`: 1 on first authoring; bump on material edit.

The previous brief had a `severity` field. It has been **dropped from the v1 schema**. Do not include it.

### Markpoint fields

- `order_index`: integer.
- `credit`: usually 1.0. Sum should equal `marks`.
- `bucket`: must exist in the supplied tree, OR be proposed via the `bucket_suggestions` output at the end. Forward-references to other trees are permitted (the runtime warns at authoring time, strict-rejects at production load).
- `label`: short human-readable name. Shown in the result panel.
- `any_phrases`: list of phrases that count as the right answer. Substring match after normalisation.
  - **Each entry can be a plain string** (full credit) or an **object** `{"phrase": "veduto", "credit": 0.8, "note": "archaic but grammatical"}` for graded acceptance. Use the object form when there's a more-and-less-preferred form (modern visto = 1.0, archaic veduto = 0.8).
  - Keep this list short: usually 1-3 phrases. If you need more, split the markpoint or move to translation. Long rule-lists are a smell.
- `must_not_include`: list of specific wrong forms that, if present, count as attempted-but-wrong (attempted=1, correctness=0). Lift these from the bucket's `attributes.common_miss`.
- `match_at` (per-PHRASE, on object-form entries in any_phrases AND must_not_include): "word" (both boundaries, the criterion-18 default), "start", "end". Fully engine-supported, including on the accent-folded fallback.
- `attempted_hints` (optional, rarely used): phrases that indicate the learner attempted the skill without producing a recognised right-or-wrong form. Reserved for diagnostically important cases.

### `vocab_help` entries

Each question or translation item declares one entry per relevant lemma in the prompt, listing the aspects available for reveal. The UI surfaces a button per lemma plus makes the matching word in the prompt clickable. Each aspect reveal records a miss against its own bucket, so a learner who asks "what's the gender of casa?" gets `vocabulary.it.casa.gender` recorded, distinctly from `vocabulary.it.casa.translation`.

The shape:

```json
"vocab_help": [
  {
    "lemma": "casa",
    "language": "it",
    "aspects": {
      "translation": {
        "reveal": "casa - house",
        "bucket": "vocabulary.it.casa.translation"
      },
      "gender": {
        "reveal": "feminine (f)",
        "bucket": "vocabulary.it.casa.gender"
      }
    }
  },
  {
    "lemma": "rosso",
    "language": "it",
    "aspects": {
      "translation": {
        "reveal": "rosso - red",
        "bucket": "vocabulary.it.rosso.translation"
      },
      "adj_class": {
        "reveal": "Class I (-o/-a/-i/-e)",
        "bucket": "vocabulary.it.rosso.adj_class"
      }
    }
  }
]
```

**Two principles, applied per aspect:**

1. **Include an aspect only if the answer doesn't directly test that knowledge.** Help reveals prior knowledge the learner needs to attempt the question; the answer tests the skill being practised. When those overlap, the help becomes a giveaway: it teaches the answer rather than separating the diagnostic. So `plural` is never an aspect (the answer is the plural form), `position` is not an aspect on pronoun-position questions, `conjugation` is not an aspect on "conjugate this verb" questions. Same idea anywhere else where the aspect IS the answer.

2. **Reveal the lemma (citation) form, not an inflected surface form.** So "went" reveals `andare`, not `andato/a`. "Houses" reveals `casa`, not `case`. The learner has to produce the inflected form themselves; that's what the answer tests. The help only puts the dictionary word on the table.

3. **Each aspect reveal contains only that aspect's information.** No leaking. The translation reveal is just `<source citation> - <target citation>`, nothing else. No gender, no class, no auxiliary inside the parens. If the learner wants those, they ask for them as separate aspects.

   So "went" reveals `to go - andare` (no auxiliary hint). "Houses" reveals `house - casa` (no gender). "Casa" reveals `casa - house`. "Sister" reveals `sister - sorella`. "Rosso" reveals `rosso - red` (no class hint).

   Non-translation aspects give just their fact: `gender` reveals "feminine (f)" or "masculine (m)". `adj_class` reveals "Class I (-o/-a/-i/-e)" or "Class II (-e/-e/-i/-i)". `auxiliary` reveals "essere (motion intransitive)" or "avere (default)". The parenthetical on auxiliary or class is part of the same aspect (it characterises the value, doesn't introduce a separate aspect).

   Why this matters: if the translation reveal also discloses the gender, a learner who asked only "what's casa in English?" has effectively learnt the gender for free, AND we can't record a gender miss for them. The buckets get blurred. Keeping each reveal pure preserves the diagnostic.

**Lemma key conventions** (the `lemma` field and the bucket-id slot):

1. **Carry the citation form's full diacritics.** The lemma is `città`, not `citta`. `opportunità`, not `opportunita`. `caffè`, not `caffe`. Bucket IDs are stored as unicode strings; there's no ASCII restriction. The clickable-word matcher uses unicode-aware substring matching, so the lemma must spell the word the way Italian spells it. Stripping diacritics breaks the match against the prompt and forces the runtime to do a lossy normalisation pass it shouldn't have to.

2. **Lowercase the key, capitalise the reveal.** Proper nouns like Rinascimento get the key `rinascimento` and the reveal `Rinascimento - Renaissance`. The matcher is case-insensitive, but lowercase keys keep the bucket namespace tidy and avoid collisions ("Rinascimento" vs "rinascimento" as two different lemmas).

3. **Multi-word invariable items use underscores in the lemma key.** The bucket separator is `.`, so the key can't contain dots. Compound colours like `blu_marino`, `giallo_limone`, `rosso_fuoco`, `verde_acqua`, `verde_scuro` use underscores. The display in the reveal can be either the spaced form (`"blu marino - navy blue"`) or the joined form, your choice; the matcher operates on the lemma key.

4. **Inflected and elided surface forms point their bucket at the canonical lemma.** A prompt containing "sant'Antonio" or "mele" or "mezza" or "begli" needs separate `vocab_help` entries so the matcher can find each surface word, but each entry's `bucket` field should reference the canonical lemma: `vocabulary.it.santo.translation`, `vocabulary.it.mela.gender`, etc. The surface form is a matcher hook, not a separate piece of vocabulary.

5. **Past participles point at the infinitive.** If "apprezzata" appears in a prompt, the entry's bucket is `vocabulary.it.apprezzare.translation`, not `vocabulary.it.apprezzata.*`. The participle is the inflected form; the infinitive is the citation form.

6. **Adjective lemmas don't carry a `gender` aspect.** Adjective items test agreement, and the adjective's own stem-gender doesn't reveal the answer (the answer depends on the noun). Adjective lemmas carry `translation` only. Compare with noun lemmas which carry both `translation` and `gender` when both are diagnostically meaningful.

7. **Nouns of mixed-gender pairs go in separately.** `cugino` (m) and `cugina` (f) are separate lemmas, each with their own `translation` and `gender` aspects. Don't collapse them; the diagnostic at stake is different ("did the learner know the m form?" vs "the f form?"). Same for `ragazzo / ragazza`, `signore / signora`, etc.

8. **The unique-key triple-or-quadruple is `(lemma, pos, gender, number)`.** Originally ratified as `(lemma, pos, gender)`. Extended on 2026-05-29 to optionally include `number` (sg | pl) when needed for disambiguation, in the same shape as `gender` (added only when needed). Most entries don't need `number` and it stays unset / omitted from the bucket id. The canonical case for needing it: the Italian clitic pronoun `le` serves both the feminine-singular indirect-object sense ("le dico") and the feminine-plural direct-object sense ("le vedo"); these are two distinct entries that share `(lemma=le, pos=pronoun, gender=f)` and must be discriminated by `number`. Bucket-id shape correspondingly extends to `vocabulary.it.<lemma>.<pos>[.<gender>][.<number>].<aspect>[.<direction>]`, each optional segment included only when needed for that lemma's set of entries.

**Canonical aspect names**: use these. The UI maps them to readable button labels.

| Aspect | Asks | Typical bucket | When to skip |
|--------|------|----------------|--------------|
| `translation` | "What does X mean?" (it→en) or "What's the Italian for X?" (en→it) | `vocabulary.<lang>.<lemma>.translation` | Almost never. |
| `gender` | "What gender is X?" | `vocabulary.<lang>.<lemma>.gender` | When the question is about pluralisation of the noun itself, not anything that needs gender. |
| `adj_class` | "What class of adjective is X?" | `vocabulary.<lang>.<lemma>.adj_class` | When the question literally asks "is this -o-class or -e-class?". |
| `auxiliary` | "What auxiliary does X take?" | `vocabulary.<lang>.<lemma>.auxiliary` | When the question explicitly tests auxiliary choice (then it's a giveaway). |
| `infinitive` | "What's the infinitive of X?" (for an inflected form in the prompt) | `vocabulary.<lang>.<lemma>.translation` (lemma-keyed) | When the question is "what's the infinitive of this verb?". |

`position` and `conjugation` and `participle` aspects should generally not exist. If the question tests them, they're giveaways. If the question doesn't, they're not needed. (The rare exceptions are advanced items where the position rule or conjugation paradigm is itself the prior knowledge needed for a higher-order question; flag those in `examiner_note`.)

You can add other aspects as needed; the UI prettifies the known ones and falls back to a generic label for unknown.

**`language`** is the language of the lemma. For en→it translation items, English lemmas have `language: "en"` and the reveal gives the Italian; Italian lemmas have `language: "it"` and the reveal gives the English. The UI uses this to phrase the question correctly ("What's the Italian for X?" vs "What does X mean?").

**Matching words in the prompt.** When the lemma in `vocab_help` appears in the prompt as a whole word (case-insensitive, ignoring leading/trailing punctuation), the UI makes that word clickable. So if your prompt contains "Italian for 'rosso'" and you have a `lemma: "rosso"` entry, the word `rosso` in the prompt is underlined and clickable. Learners can either click the word in the prompt or use the help-bar button. Both open the same aspect menu.

Tips for authors:

- Add an entry for **every content word** in the prompt that a learner might reasonably want help with. Function words (articles, prepositions, conjunctions) are usually not worth helping; content words (nouns, adjectives, verbs in citation form) are.
- For Italian-side surface forms that are inflected (e.g. "case" plural of "casa"), include them as separate `lemma` entries pointing at the same underlying bucket. The clickable-word match is exact, so "case" needs its own entry to be clickable; the aspects can reveal the inflected info.
- For each lemma, include only the aspects that are diagnostically meaningful AND that a learner at the target level might not know. A B2 question on adjective agreement doesn't need `translation` aspects on basic adjectives.
- Forward-reference vocabulary buckets that don't yet exist. They'll be created when the cross-cutting taxonomy session is done.

**Legacy flat shape** (still supported for back-compat):

```json
"vocab_help": [
  { "label": "Italian for 'house'", "reveal": "casa (f)", "bucket": "vocabulary.it.casa.translation" }
]
```

Don't use this for new content. The rich shape gives the learner more agency (one button covers all aspects of a word) and clusters the data better.

### Quality criteria

1. **Skill-coherent.** Each question targets one or two adjacent buckets, not five disparate ones. A learner missing this question should know what they missed.
2. **Rule-light.** `any_phrases` should be 1-3 entries. `must_not_include` should be 1-3 diagnostic wrong forms. If your rule list balloons, split the markpoint or move to translation.
3. **Buckets are real.** Every `bucket` must exist in the tree (or be proposed at the end with a registered parent).
4. **CEFR appropriate.** A question marked target A1 should not require buckets that are `arcane` at A1. Use `cefr_importance` to check.
5. **Prompt-writing**: the prompt must make the wanted form **unambiguous without revealing the diagnostic rule**. Use time markers ("ieri" for past), subject + context, or "(infinitive)" parenthetical, rather than "(write in passato prossimo)" which gives the topic away. There's a sharp distinction here that has tripped up earlier dispatches:

   **Naming the OUTPUT FORM is fine.** "Replace X with a clitic", "Form the past participle: parlare → ___", "Fill the auxiliary slot" all name the kind-of-thing the learner has to produce. The learner needs that scaffolding to know what's being asked for. These are not giveaways.

   **Naming the DIAGNOSTIC RULE is wrong.** "Using prescriptive inheritance", "Apply the agreement rule with preceding DOP", "Use the imperfect for the background state" all name the rule the question is meant to test. A learner who knows the rule's name already knows the answer; a learner who doesn't know the rule's name can't answer at all. The question's diagnostic value collapses either way.

   The bucket's `label` is for the engine and for review. It should not appear in the prompt under any circumstances.

   - Good: "Complete: 'Ieri Marco ____ con il direttore.' (parlare)"
   - Good: "Loro ____ potuti partire in orario ieri. (potere)"  — the participle form already forces the diagnostic answer
   - Bad: "Conjugate parlare in the third-person passato prossimo: 'Ieri Marco ____ con il direttore.'"
   - Bad: "Fill in the auxiliary using prescriptive inheritance: 'Loro ____ potuti partire ieri.' (potere + partire)"  — names the rule
   - Bad: a bare blank with no time marker or context: ambiguous about which tense.
6. **No multi-clause sentences.** Grammar questions are short. One blank, one or two words (up to a 4-word noun phrase) to fill.
7. **`explanation` always present**, even on items where the right answer feels obvious. The explanation appears in a "Why:" block after marking.

8. **One markpoint per skill being tested.** If the right answer combines two distinct skills (e.g. a clitic-cluster choice AND a verb conjugation, an auxiliary choice AND a participle agreement, a preposition choice AND an article-elision), author them as separate markpoints, each pointing at the bucket that captures that one skill. Do NOT bundle them under a single markpoint whose `any_phrases` is the whole composite string. The reason is diagnostic decomposition: a learner who gets the cluster right but the verb form wrong should see a hit on the cluster bucket and a miss on the verb-form bucket, not a single "Wrong" with the full right answer shown.

   The substring grammar engine handles this cleanly because each markpoint matches a substring independently. For the gliene-question item ("how do you say 'Will you give some to him?'"), the right authoring is:
   - markpoint A: `any_phrases: ["Gliene", "gliene"]` (case-handled by the engine; either capitalisation acceptable), `bucket: pronoun.combined.glielo_family`, `must_not_include: ["Gli ne", "Glie ne", "Ne gli"]`, label "gliene cluster"
   - markpoint B: `any_phrases: ["dai", "darai"]`, `bucket: verb_form.present_or_future.dare`, label "dare in present or future"

   Total marks become 2; a learner producing "Gliene darei?" hits A (1.0) and misses B (0.0) for a score of 1/2 with clean per-skill attribution.

   Rule of thumb: if the markpoint's `label` joins two concepts with "with" or "+" ("gliene in question with dare", "auxiliary with participle agreement"), it's almost certainly too coarse and should split into two markpoints.

9. **Prefer a single combined slot.** Multiple slots leak structural information about the answer (a 2-slot blank tells the learner the answer is a compound form; a 1-slot blank tells them it's a single word). Use a single combined slot whenever the answer's form-family is what the item is testing OR whenever accepted forms span different surface-word counts (e.g. "me lo" = 2 words vs "me l'" = 1 word with elision). Only use multiple slots when the slots are in genuinely different positions of the sentence (different verbs / different phrases) AND each slot's word count is structurally fixed by something other than the answer being tested. The substring marker doesn't need fixed-width slots; it matches on content regardless of how the prompt visualises the blank.

10. **Items must not be tense-ambiguous; once unambiguous, catch wrong-tense attempts.** Two-part rule.

   **10a (item-authoring discipline).** Every grammar item must be unambiguous about which tense is wanted. A sentence like "Mia nonna ____ molto generosa" without surrounding context is NOT a valid item: both `è` (present, "is generous") and `era` (imperfect, "was generous") are legitimate readings. Such an item must either:

   - **Be rewritten** to pin the tense via discourse context. Add a prior sentence that establishes past time ("Mia nonna è morta quando ero piccolo. ____ molto generosa."), or add explicit framing ("In quel periodo, mia nonna ____ molto generosa."), or use a context that excludes present ("Quando andavamo in vacanza da lei, mia nonna ____ molto generosa con noi.").
   - **OR accept all legitimate tenses** as valid answers. If you genuinely mean "the item is about whether the learner can produce ANY valid form of essere here", then `è` and `era` both go in `any_phrases` and the item is no longer a discrimination item.

   Don't ship items where the sentence could legitimately take a tense the item doesn't accept; that's a content bug.

   **10b (marker discipline, once 10a is satisfied).** When discourse context unambiguously pins past tense and the item is testing a discrimination between two past tenses (typically imperfect vs PP), include the plausible wrong-tense forms in `must_not_include`. So a learner who reaches for the wrong past tense (or present, or future, all wrong by context) records a miss correctly attributed to the discrimination bucket rather than falling through to a silent miss with no bucket attribution.

11. **Register-conditional items state their register.** If the answer depends on register (literary vs colloquial, formal vs casual, narrative vs reportage), state the register in the prompt ("in stile narrativo", "in casual speech", "formal address"). Without the cue, the item tests the learner's ability to read context for register signals rather than the underlying skill, which is a different diagnostic.

12. **Prompts are not glossary-wrapped; explanations are.** The housing's renderer wraps technical grammatical terms (DOP, IOP, gerund, clitic, periodo ipotetico, etc.) in glossary tooltips inside explanations, but NOT inside prompts. If you use a technical term in a prompt, the learner sees it as opaque text; introduce it inline ("a small pronoun" rather than "a clitic") or save it for the explanation. The reverse asymmetry: explanations CAN use technical terms freely because the glossary surfacing makes them learnable.

13. **Cue chips name the surface, not the rule.** The `Use: ...` cue chip on a grammar item should name the surface morphology of the wanted answer (tense, mood, person, number, gender, cluster shape) but should NOT name the structural rule that produces the answer. Naming the rule leaks the answer-shape and reduces the item to a vocab-or-conjugation drill instead of a rule-application drill.

   **Wrong (leaks the rule):** `Use: informal, infinitive form for negative tu` on a "Don't give it to me!" item. This tells the learner that negative tu imperative is non + infinitive — which IS the rule under test for B2 negative-imperative items. With the rule named, the learner just has to know dare = give and attach the cluster.

   **Right (names the surface only):** `Use: informal, negative form for tu (with cluster)`. Same disambiguation work (tu vs Lei, negative, attach a cluster) without naming that the answer involves the infinitive. The learner still has to know that "negative tu" → "non + infinitive" to produce the right answer; that's the load-bearing rule and the chip preserves it as the test.

   **Other right shapes:**
   - `Use: studiare, 1sg` (names lemma + person; the inflection rule is for the learner to apply)
   - `Use: grande` (names just the lemma; the position and apocope rules are for the learner to apply)
   - `Use: to him + it` (names the meaning of the cluster; the formation rule glielo is for the learner to apply)

   Rule of thumb: if the chip text uses the name of the rule the item is supposed to be testing (infinitive, subjunctive, past participle agreement, periphrastic future), it's leaking. Rewrite to name what shape the learner is producing (verb form, person, number, gender, cluster) without naming the rule. If the rule name is the only natural way to describe the cue, the item probably belongs in a different bucket (one where the rule is given and the application is the test).

   When auditing existing items in your batch, look for chip texts containing the words: infinitive, subjunctive, conditional, gerund, past participle, conditional perfect, future perfect, present perfect, imperfect indicative, passato remoto, congiuntivo, condizionale, gerundio. Any of these named in a chip should make you stop and ask whether the chip is naming what's being tested or just describing what the answer looks like.

    **Cue economy (person redundancy).** Name the person in the cue only when the prompt sentence does not already supply the subject. When the subject is explicit (a subject pronoun, or a clear nominal subject whose number is unambiguous), drop the person and name just the verb: for "Voi cosa ____ stasera?" the cue is `(fare)`, not `(fare, voi)`, because Voi is right there in the sentence. Keep the person only when the subject is pro-dropped or implicit ("Non ____ questa parola." needs `(capire, io)`; "Ogni mattina ____ il giornale." needs `(comprare, io)`). Dropping the redundant person is not just tidier: it makes the item test more, because the learner has to map the visible subject to the right form rather than being handed the person.

14. **Multi-position clitic items ask for a rewrite, not a placement.** When an item tests a structure where the clitic has two valid positions (modal + infinitive, stare + gerundio progressive, negative tu imperative, causative fare + infinitive, and their cluster / reflexive variants), the prompt MUST NOT announce that placement is the variable or that there are multiple valid answers. Phrases like "place the pronoun", "in either valid position", "either valid position", "before or after the verb" signpost the test: they plant the placement idea in the learner's head instead of testing whether they reach for it on their own. Ask for a full sentence rewrite and accept every valid placement in `any_phrases`.

    **Wrong (signposts the variable):** `Place the pronoun in EITHER valid position: 'Voglio vedere il film.' (replace il film) → ____`. This announces that placement is what's being tested and that two answers are valid, doing the learner's thinking for them.

    **Right (asks for a rewrite, no signpost):** `Rewrite the sentence, replacing il film with a pronoun: 'Voglio vedere il film.' → ____`. The learner produces natural Italian and lands on whichever valid placement they reach for; both are accepted. No positional language, no count of valid answers.

    Mechanics: `any_phrases` carries both standard placements (`lo voglio vedere`, `voglio vederlo`) plus accent variants; `must_not_include` still catches the forbidden middle position (`voglio lo vedere`) and structure-specific errors (e.g. the positive-imperative form `dammelo` on a negative-imperative item). The "both positions are standard, the middle is forbidden" teaching belongs in the `explanation` (post-answer), which is exactly where these items already put it. The instruction "replacing X with a pronoun" carries the operation, so a separate position-naming chip becomes redundant; fold it into the prompt and drop it.

    This is a close sibling of criterion 13. 13 forbids naming the rule; 14 forbids naming that placement is the variable and that multiple answers are valid. Both stop the item from telling the learner what it is about to test. The test shifts from "do you know both positions are valid" (meta-knowledge the prompt was handing over) to "can you correctly form and place a clitic in this structure at all" (the real skill).

    When auditing, grep your batch for "valid position", "place the pronoun", "either position", "before or after", "in the progressive". These appear legitimately in explanations (post-answer teaching is fine and encouraged); they must not appear in prompts.

15. **The bucket breadcrumb must not leak the diagnostic; use `info_display: "suppress"` where it would.** This is the sibling of criterion 13. Criterion 13 governs the `Use:` cue chip; this one governs the bucket-name breadcrumb (the item's dotted-path label) that the housing surfaces in pre-answer places: the bucket-filter banner and the live-stats-panel tooltip. When that label names a verb-class membership or rule-output the item is testing AND the learner cannot derive it from the prompt, the breadcrumb hands over the answer. Set `info_display: "suppress"` on the item; the housing then shows a generic topic-root label (e.g. "Present indicative drill") pre-answer and reveals the real bucket name post-answer. The flag is per-item and display-only: no engine change, no effect on marking.

    **The leak-vs-trap test (when to suppress vs leave visible):**

    - **Suppress** when the breadcrumb names a class membership or rule-output that the item tests and the learner can't get from the cue. A `-ire with -isc-` breadcrumb on a `capisco` item tells the learner that capire is an -isc- verb, which the -ire ending does not reveal; that hands over the skill. A `-care / -gare add h` breadcrumb on a `cerchi` item names the rule-output ("add h"), which is the skill, even though the -care ending is visible in the cue.

    - **Leave visible** when either (a) the breadcrumb only restates what the cue already gives (a `Regular -are` breadcrumb on a `(parlare, ...)` item leaks nothing, the -are ending is in view), or (b) naming the class creates productive tension toward a wrong answer the item's `must_not_include` is built to catch. The same `-ire with -isc-` breadcrumb on a `capiamo` (noi) item *tempts* `capisciamo`, which is exactly the catchable over-extension; leaving it visible is useful, not a leak.

    **The recoverability condition (Rev 19, binding).** Suppress-by-default holds ONLY where the candidate set is recoverable pre-answer: tense choices whose context pins the tense and whose cue supplies the verb, formation items whose base form is given, items whose prompt names the operation or pins the referent (an English gloss, "= to her", "Fill in the auxiliary"). Where the candidates are different LEXEMES that nothing in the prompt reveals (bene/buono, questo/quello, migliore/meglio), suppression makes the item UNANSWERABLE and records misses on buckets the learner was never invited to engage. There the breadcrumb stays VISIBLE and the leaf is labelled by its CANDIDATE FORMS, never by the rule: "molto / molta / molti / molte", not "molto that agrees". This outranks the leak-vs-trap test: answerability first, then leak-vs-trap on what remains. A sixth recoverable class (Rev 20): FRAME-FORCED candidate sets - where the syntactic frame admits exactly the candidates (più X ___ Y admits only di/che; a connector slot admits only the connectors), the learner recovers the set from the sentence itself and suppression stands, even though the answer is not forced.

    So the flag is set per item, not per bucket: within one leaf, the rule-applies forms are suppressed while the reverting / over-extension forms stay visible. Same shape as criterion 13: name the surface the learner is producing, never the diagnostic the item is testing, except where naming it sets a productive trap.

        **Keep leaf labels terse; put worked examples in `description`.** The label renders as the pre-answer breadcrumb, so a label that embeds the canonical worked example (e.g. "avere auxiliary: avevo + participle (avevo parlato)") hands over the answer on every item. Name the class only in the label ("avere auxiliary"); the worked example belongs in `description` or `canonical_example`. This is prior to the suppress test: shorten an over-long label first, and only then apply criterion 15's suppress to any residual label that still names a non-derivable class the item tests.

    **Discrimination items are suppress-by-default.** Any item in a `.discrimination` bucket (or in the tense_choice tree) tests *choosing* the right tense / aspect / mood from valid alternatives. The breadcrumb on such an item ("Imperfect vs passato prossimo", "Indicative vs subjunctive") names the contrast being tested, and showing it pre-answer tips the learner that a tense choice is in play, when they should be detecting that from the sentence's context, exactly as a real reader would. So set `info_display: "suppress"` on every discrimination item: the generic topic-root label shows pre-answer, the contrast name reveals post-answer. This is the leak-vs-trap test on the selection axis (the breadcrumb names the diagnostic, the learner can't derive it without being primed). Project-wide rule, 2026-06-09, extends from the ImperfectAuthor discrimination items.

16. **Tense-choice and discrimination items declare their candidate set.** An item where the learner picks the contextually-correct tense among formally-possible options (every `tense_choice` item, and any item citing a `.discrimination.*` bucket) carries two fields alongside the markpoints: `candidate_tenses` (an array of two or more controlled tense-tags, the legitimate options in that context) and `correct_tense` (the single member of `candidate_tenses` the context demands). The correct surface form still lives in the markpoint `any_phrases`; these two fields are tense-level labels that drive the post-answer tick and the per-context stats, and do not affect marking. Controlled tense-tags: present, passato_prossimo, imperfect, trapassato_prossimo, passato_remoto, future, futuro_anteriore, condizionale, condizionale_passato, congiuntivo_presente, congiuntivo_imperfetto, congiuntivo_passato, congiuntivo_trapassato, imperativo, gerundio, infinito, presente_progressivo, imperfetto_progressivo. The last two are Rev 21 additions for stare + gerundio choices; `gerundio` denotes the BARE nonfinite only (a verb_form.gerundio formation item), never the periphrasis - a progressive item's candidate is 'sto mangiando', and a chip reading 'Gerund' would mislabel it. For NON-TENSE discriminations (referents like suo's his/her/your-formal, spatial pairs like questo/quello, lexical pairs like bene/buono) use the general fields `candidate_forms` (display labels, exact wording yours) and `correct_form`, identical semantics, one shared rendering path in the housing. The candidate set is surfaced to the learner ONLY post-answer where criterion 15's suppress applies; but where the recoverability condition (criterion 15, Rev 19) keeps the breadcrumb visible because the candidate set is lexical and non-recoverable, the visible forms-named LABEL is what carries the candidates pre-answer, and the post-answer tick still uses these fields. Wrong-tense forms go in `must_not_include` as usual; where the stats should attribute which wrong tense was chosen, tag the discrimination misconception on that entry in Phase 3.

17. **Explanations translate the sentence.** Every grammar item's explanation includes a plain English translation of the completed correct sentence, so a learner who did not fully parse the Italian still gets the meaning before the grammar working lands. Keep it natural, not word-for-word, and put it early: either open with the gloss, or quote the sentence and follow it with the translation in parentheses, then give the grammar. For fragment prompts (for example "Combine: mi + lo"), gloss the target instead ("me lo = it to me"). This sits alongside the four-beat working (everyday lead, named term, term reused, concrete working); it does not replace it. New items carry it; existing items gain it on their next touch.

---

18. **Superstring safety (full text; summarised in the Rev 15/17 headers).** No unanchored `any_phrases` entry may be a substring of a PLAUSIBLE wrong attempt, and no `must_not_include` entry may be a substring of a plausible CORRECT attempt. The comparison set is plausible attempts, not the item's own guard list. Audit four directions: rightward (stems inside their own inflections: parla inside parlava / parlando / parlare), leftward (a X inside da X / fra X; alle inside dalle; abbiamo inside habbiamo), guard-inside-correct (a bare "a Parigi" guard fires on the correct "partiamo da Parigi": a false diagnostic, worse than a false credit), and correct-inside-guard (the guard contains the anchored answer as whole words, "darglielo voglio" containing "darglielo": the positive wins, the guard is dead on arrival, and anchoring cannot help; reframe with a fuller any_phrase, and where no fuller phrase exists the additive error is UNREACHABLE by the substring engine and must be routed to MCQ or the AI-marked strand, never left as a guard that implies a catch). The mirror case is EXEMPT and legitimate: a guard nested inside the correct phrase (venire inside di venire, catching the dropped di) can never misfire, because every correct attempt contains the longer anchored positive which wins first; such ordering-protected guards are the standard attributor for dropped-word misses. Run containment checks on the NORMALISED form, exactly as the engine matches: lowercase, accents folded (bare è sits inside era), apostrophes and hyphens folded to spaces (va' becomes va and sits inside vado; bell' becomes bell and sits inside bello), whitespace collapsed. Reasoning from the raw authored string is how three audits in a row under-anchored. Default mitigation: per-phrase `match_at: "word"` (the engine anchors both boundaries, including on the accent-folded fallback); item rework where anchoring cannot help. An INSTRUCTION-PINNED guard (Rev 20) is likewise acceptable: where the only path to a false wrong-flag is an answer that defies an explicit prompt instruction ("Complete with one word:"), keep the guard - the common_miss catch is worth a wrong-flag on non-compliance.

19. **Accent as morpheme (full text; summarised in the Rev 16 header).** Where the accent-stripped form of an answer is a plausible alternative ANSWER to the same prompt (3sg remoto parlò against present parlo; credè against crede; partì against parti), set `accent_load_bearing: true` on the markpoint (disables the accent-fold rescue) and list the stripped twin in `must_not_include` with a teaching note. Where the stripped form is not a candidate answer at that prompt (e for è at a verb blank, da for dà, ando for andò), do nothing: the standard fold-rescue plus orthography miss is the right verdict. The test is "plausible alternative answer", not "real word". **Supplied-choice carve-out (Rev 21):** criterion 19 does not apply where the prompt supplies or pins the candidate forms (a two-way tense choice with the verb given, an MCQ, a frame-forced set). There the answer space is the menu, the stripped twin is not on it, and the accent cannot be the discriminator: leave `accent_load_bearing` unset. A learner typing sbarco for sbarco' at a {remoto, PP} choice picked the right tense and misspelled it, and that is what the fold-rescue plus an orthography miss already records. Five seats derived this independently before it was written down.

20. **Cue by meaning, not by fragment (Rev 22).** Where a production item would cue its target with a bare Italian answer-fragment that (a) reads as the whole answer or (b) presupposes the very form the item tests, cue it instead with a bracketed English target pinning meaning and register ("Questo regalo è ___ [for you, informal]" → per te), and set `prompt_supplies_base_form: false` so the cue-misread second-chance rescue applies. This does NOT touch the legitimate citation-form trigger: an infinitive to conjugate (studiare), a base adjective to agree (rosso → rossa), a supplied lemma to inflect — those name the honest operand and stay. The test has two parts. (1) Is the cue the operand the learner TRANSFORMS, or a slice of the answer that HIDES the operation? (2) **The sharper predictor (Rev 23, from ComparisonAuthor): is the fragment-only answer visibly BROKEN or plausibly FLUENT?** Typing just the cue `alto` yields "Marco è alto Luca" - self-evidently wrong, so the learner is rescued by the sentence itself and a bare cue is defensible. Typing just the cue `agire` yields "È più facile criticare agire" - fluent-looking and merely missing its connector, so the learner is TRAPPED, takes an unrecognised miss, and is diagnosed as failing the grammar when they misread the cue. Gloss the trapping ones. It is not fragment-ness that harms; it is whether the wrong answer looks wrong. Triggered by prep_sf_03 (bare (te) both under-specified the per and presupposed the stressed pronoun; Smith produced tuo and, because prompt_supplies_base_form was wrongly true, got no second chance). Next-touch: PrepositionAuthor (55 items) and ComparisonAuthor (19) hold the candidate class; new items follow immediately; the criterion-17 sweep flags stragglers estate-wide.

### Binding register (Rev 24, binding on every criterion)

Every criterion carries two fields. A retrofit-bearing criterion with no `binds:` token is a **defect** — it can knock on no door.

- **`binds:`** — explicit seat names, or a class token (`all-authors`, `all-seats`, `Housing`). The seat's self-check greps its name + its declared classes.

**Class token definitions (Rev 24, ratified 2026-07-17 on Vocab's reading):**
- **`all-seats`** — every chat in the estate, including Housing, Vocab, MetaProject and the analysis seats.
- **`all-authors`** — seats that author **grammar or translation ITEMS**: things carrying markpoints, cue chips, `must_not_include`, item explanations. Criteria 13-20 all bind this class and none of them reach a seat that does not write items. **Vocab is NOT `all-authors`** — it authors vocabulary ENTRIES (lemma, translation, themes), which have no chips or markpoints; it self-classified `[all-seats]` with that reasoning and is correct. Housing (code), MetaProject, MisconceptionAnalyst, AccentAuditor, Coverage and **Cr17Sweep** are likewise not `all-authors`. Cr17Sweep's own reasoning, ratified 2026-07-17, is the model: it originates no markpoints, chips, guards or prompts, so 13-20 cannot bind it; it EDITS explanations and complies with 17 as a standing rule when it does. **The test is what a seat ORIGINATES, not what it touches.**
- **Self-classification is a silent failure surface.** A seat that under-claims a class misses every criterion bound to it, and nothing detects that. So: **state your reasoning when you declare `classes:`, as Vocab did, and the architect ratifies it.** Do not guess quietly.
- **`retrofit:`** — `none` (standing rule: new items only; NEVER a queue item) or a described task (dischargeable; stamped per seat).

| # | binds | retrofit | state |
|---|---|---|---|
| 13 | all-authors | self-audit for rule-naming chip texts | **RUNNING — was UNRUN for months (named nobody).** `[discharged: PrepositionAuthor, 2026-07-17, coverage seventh touch — 9 hits, all "contracted form" output-form naming, triaged clean, zero rewrites]`. Compliance: 1 of ~25 author seats. |
| 14 | PronounAuthor | none | standing |
| 15 | all-authors | none (Rev 19 recoverability applies to new items) | standing |
| 16 | all-authors | wave-1 retrofit | discharged (TenseChoiceAuthor, 92 items, 2026-07-15) |
| 17 | all-authors | gloss pre-Rev-13 items | **in progress — Cr17Sweep, 418 items across 5 topics** |
| 18 | all-authors | anchoring audit | discharged (central gate, estate-wide) |
| 19 | all-authors | accent sweep | discharged (AccentAuditor, 267 markpoints) |
| 20 | PrepositionAuthor, ComparisonAuthor | reframe the candidate class | discharged both (2026-07-16) |
| 21-24 | see each revision's next-touch clause | | |


## §3. Translation item schema

```json
{
  "external_id": "trans_pp_en_it_01",
  "source_lang": "en",
  "target_lang": "it",
  "source_text": "She arrived late and we had already eaten.",
  "reference_translations": [
    {
      "text": "Lei è arrivata tardi e avevamo già mangiato.",
      "register": "neutral",
      "notes": "Standard rendering. Subject pronoun lei is optional."
    },
    {
      "text": "È arrivata tardi e avevamo già mangiato.",
      "register": "neutral",
      "notes": "Subject pronoun dropped, more natural Italian."
    },
    {
      "text": "Lei ha arrivato tardi...",
      "register": "neutral",
      "polarity": "negative",
      "notes": "WRONG: arrivare takes essere. Included as a guard against the avere-default miss."
    }
  ],
  "topic": "verb_form.passato_prossimo",
  "register": "neutral",
  "difficulty": 3,
  "cefr_level_target": "B1",
  "required_buckets": [
    "verb_form.passato_prossimo.auxiliary.essere_motion_intransitive",
    "verb_form.passato_prossimo.participle_agreement.with_essere.feminine_singular",
    "verb_form.passato_prossimo.participle_form.regular.are_ato"
  ],
  "optional_buckets": [
    "verb_form.trapassato_prossimo",
    "discourse.temporal_sequence"
  ],
  "vocab_help": [
    {
      "lemma": "arrived",
      "language": "en",
      "aspects": {
        "translation": { "reveal": "to arrive - arrivare", "bucket": "vocabulary.it.arrivare.translation" },
        "auxiliary": { "reveal": "essere (motion intransitive)", "bucket": "vocabulary.it.arrivare.auxiliary" }
      }
    },
    {
      "lemma": "late",
      "language": "en",
      "aspects": {
        "translation": { "reveal": "late - tardi", "bucket": "vocabulary.it.tardi.translation" }
      }
    }
  ],
  "explanation": "Arrivare takes essere; the participle agrees with the feminine singular subject. The second clause uses trapassato prossimo for the prior action.",
  "version": 1
}
```

### Fields specific to translation

- `source_lang`, `target_lang`: ISO codes. Produce roughly equal numbers of en→it and it→en. Maybe more en→it for novices, more it→en for intermediate+.
- `source_text`: one sentence, 6-15 words. Avoid proper-noun tripwires unless they're the point of the item.
- `reference_translations`: at least 1, ideally 2-3. Each has `text`, `register`, `notes`.
  - **`polarity: "negative"`** (optional): use to flag a reference as instructive-wrong (something the AI marker should NOT credit). The marker treats it as an anti-anchor. A reference may also carry an explicit `credit` field (e.g. `credit: 0.9` with a steering note for a Rev 17(iv) pattern-dodge): the AI marker honours the number; prose-only notes under-specify it.
  - **Square-bracket meta-instructions** (Rev 20): square brackets in `source_text` carry instructions to the learner, not text to translate ("[use the passive]", "[one word]"); the AI marker strips them before comparison and must never expect them rendered in Italian. Ratified in Architecture_Housing_translation_source_brackets (CLOSED).
- `required_buckets`: bucket ids whose mark points are expected on a correct attempt.
- `optional_buckets`: bucket ids that may fire on a more advanced attempt. The marker tracks them but doesn't penalise their absence.
- `vocab_help`: same shape as for grammar items.
- `explanation`: REQUIRED. Shows after marking.

### Quality criteria for translation items

1. **One sentence**, 6-15 words.
2. **At least one `required_bucket` from the target sub-tree.**
3. **References cover real variation.** Subject pronoun usage, idiom choice, articulated preposition vs not, register shift.
4. **No proper-noun tripwires** unless the proper noun is the point.
5. **Cover the buckets systematically.** Aim for at least one item per `core`-at-target leaf bucket, plus a few across `core` aggregates.
6. **Prompt-writing**: same rule. The source sentence makes the grammar unambiguous without naming it. Past-time markers cue past tense; subject gender cues participle agreement; etc.
7. **`explanation` always present.**

---

## §4. Output format

Produce two JSON arrays plus an optional third:

```
grammar_questions_<topic>.json: [ {...}, {...}, ... ]
translation_items_<topic>.json: [ {...}, {...}, ... ]
bucket_suggestions_<topic>.json: [ {...}, ... ]
```

The `bucket_suggestions` file is for any new buckets you needed during authoring that don't yet exist in the tree. Each entry:

```json
{
  "proposed_id": "adjective_agreement.special.grande_prenominal",
  "proposed_parent_id": "adjective_agreement.special",
  "proposed_label": "grande → gran before some pre-noun positions",
  "proposed_description": "...",
  "proposed_cefr_importance": {"A1": "arcane", "A2": "preview", ...},
  "proposed_prerequisites": ["adjective_agreement.position.pre_noun_canonical"],
  "proposed_attributes": {"canonical_example": "un gran libro"},
  "rationale": "I needed this while authoring trans_xx_07; the existing tree doesn't have a slot for the gran/grande variation."
}
```

The proposed_parent_id must be an existing bucket. New top-level groups go through a separate process; do not propose them here.

Additionally, please write a short **coverage summary** as a fourth file:

```
coverage_<topic>.md
```

Containing: a bucket-to-item-count table, a list of items flagged uncertain, and any notes for the next dispatch. The reviewer wants this; producing it after the fact is wasted effort.

---

## §5. Worked example

A complete grammar question, including vocab_help and explanation:

```json
{
  "external_id": "aa_o_pl_mixed_01",
  "language_code": "it",
  "topic": "adjective_agreement",
  "subtopic": "o_class.feminine_plural",
  "difficulty": 2,
  "cefr_level_target": "A2",
  "prompt": "Complete with the right form of 'rosso': 'Le case sono ____.'",
  "type": "short",
  "marks": 1,
  "prompt_supplies_base_form": true,
  "markpoints": [
    {
      "order_index": 0,
      "credit": 1.0,
      "bucket": "adjective_agreement.o_class.feminine_plural",
      "label": "feminine plural -e",
      "any_phrases": ["rosse"],
      "must_not_include": ["rossi", "rosso", "rossa"]
    }
  ],
  "vocab_help": [
    {
      "lemma": "rosso",
      "language": "it",
      "aspects": {
        "translation": { "reveal": "rosso - red", "bucket": "vocabulary.it.rosso.translation" },
        "adj_class": { "reveal": "Class I (-o/-a/-i/-e)", "bucket": "vocabulary.it.rosso.adj_class" }
      }
    },
    {
      "lemma": "case",
      "language": "it",
      "aspects": {
        "translation": { "reveal": "casa - house", "bucket": "vocabulary.it.casa.translation" },
        "gender": { "reveal": "feminine (f)", "bucket": "vocabulary.it.casa.gender" }
      }
    }
  ],
  "explanation": "Le case is feminine plural. Class I adjectives take -e in the feminine plural. (Don't confuse with Class II, which uses -i for both genders in the plural.)",
  "examiner_note": "Common miss: 'rossi' (applying masculine plural). The must_not_include catches it.",
  "version": 1
}
```

A complete translation item:

```json
{
  "external_id": "trans_pp_en_it_essere_01",
  "source_lang": "en",
  "target_lang": "it",
  "source_text": "My sister went to the market yesterday.",
  "reference_translations": [
    {
      "text": "Mia sorella è andata al mercato ieri.",
      "register": "neutral",
      "notes": "Standard."
    },
    {
      "text": "Ieri mia sorella è andata al mercato.",
      "register": "neutral",
      "notes": "Adverb fronted; natural rhythm."
    }
  ],
  "topic": "verb_form.passato_prossimo",
  "register": "neutral",
  "difficulty": 2,
  "cefr_level_target": "A2",
  "required_buckets": [
    "verb_form.passato_prossimo.auxiliary.essere_motion_intransitive",
    "verb_form.passato_prossimo.participle_agreement.with_essere.feminine_singular",
    "preposition.articulated.al"
  ],
  "optional_buckets": [],
  "vocab_help": [
    {
      "lemma": "sister",
      "language": "en",
      "aspects": {
        "translation": { "reveal": "sister - sorella", "bucket": "vocabulary.it.sorella.translation" },
        "gender": { "reveal": "feminine (f)", "bucket": "vocabulary.it.sorella.gender" }
      }
    },
    {
      "lemma": "went",
      "language": "en",
      "aspects": {
        "translation": { "reveal": "to go - andare", "bucket": "vocabulary.it.andare.translation" },
        "auxiliary": { "reveal": "essere (motion intransitive)", "bucket": "vocabulary.it.andare.auxiliary" }
      }
    },
    {
      "lemma": "market",
      "language": "en",
      "aspects": {
        "translation": { "reveal": "market - mercato", "bucket": "vocabulary.it.mercato.translation" },
        "gender": { "reveal": "masculine (m)", "bucket": "vocabulary.it.mercato.gender" }
      }
    },
    {
      "lemma": "yesterday",
      "language": "en",
      "aspects": {
        "translation": { "reveal": "yesterday - ieri", "bucket": "vocabulary.it.ieri.translation" }
      }
    }
  ],
  "explanation": "Andare is a motion-intransitive verb: auxiliary is essere. The participle agrees with the feminine singular subject (andata). Articulated preposition: a + il = al.",
  "version": 1
}
```

---

## §6. Operational notes for the dispatching chat

When sending this brief to a chat, append:

```
Topic: <e.g. pronoun>
Topic short: <e.g. op>  (also in the bucket-tree root, but worth restating)
Target CEFR weighting: <e.g. "weight toward A2-B1 but cover the whole tree">
Coverage target: <e.g. "produce until the topic feels covered; rough floor 3-5 per active leaf, more on hot spots">

Bucket tree:

<paste contents of data/buckets/<topic>.json here>
```

Plus any topic-specific notes: known cross-references to existing buckets in sibling trees, canonical resources to consult (e.g. for Italian: "Italian Club", "WordReference forums for register"), and known hot-spot buckets that should get extra coverage.

---

## §7. How to talk to the project author about buckets

When you write coverage reports, replies, feedback summaries, decision questionnaires, or any other prose addressed to the project author, **always refer to buckets by their friendly `label`, not by their dot-separated `id`**. The id is the engine's identifier; the label is for humans.

The id is fine inside JSON output (because that's data, not prose) and fine in parenthetical asides when precision matters (because it disambiguates), but as the primary way of naming a bucket in any sentence written for a human reader, the id is wrong. Strings like `verb_form.imperfect.discrimination.modals.sapere` and `pronoun.combined.glielo_family` are dense, jargon-heavy, and parse-only-with-effort. The labels exist precisely so that humans don't have to read them.

### Worked examples

Don't write:

> I added 5 items to `verb_form.imperfect.discrimination.modals.sa

## House techniques (Rev 14, from the OIC exercise audit)

Five patterns that showed up across the best exercises in the OnlineItalianClub deep drill. They are encouraged defaults, not gates: use judgement, and flag in your coverage doc where you deliberately depart.

1. **Person recovery from indirect cues.** Instead of naming the person in a cue, let the sentence carry it obliquely and make recovering it part of the skill: a possessive (i miei -> io, i tuoi -> tu), a verb in an adjacent clause ("quando vai al lavoro" -> tu; "mi sento stanco" -> io), a vocative that looks like a subject ("Gianna, ___ a fare la spesa?" -> tu, not 3sg), a compound subject ("io e i miei amici" -> noi; "tu e Sergio" -> voi), or chi with a plural-object bait ("Chi ___ i piatti?" -> 3sg).
2. **Exception density one-to-three per ten.** Plant a small number of exception items inside an otherwise regular set (amico inside a regular-plurals drill), so learners cannot autopilot, while the regular rule still gets most of the rehearsal.
3. **Same-surface, opposite-answer pairs.** Put the same lexical item in two items with opposite answers inside one set (Bologna the city takes zero article, il Bologna the team takes il; cominciare with avere when transitive, essere when the subject starts). The pair teaches the conditioning factor better than either item alone.
4. **One out-of-paradigm trap per single-verb drill.** In a drill nominally about verb X, include one sentence that actually requires verb Y ("Voi di dove ___?" needing siete inside an avere drill). Kills pattern-matching.
5. **Word-bank as distractor set.** In bank-based cloze, make the bank itself do the discriminating: include inflected variants that must land on agreeing nouns, near-synonyms from the same family, and the rubric "you may use entries more than once; not all are used" (optionally duplicate one entry to signal two slots). This disables both elimination and one-to-one matching strategies.


