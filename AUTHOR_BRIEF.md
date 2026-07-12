# Author Brief: producing grammar questions and translation items

**Revision 12** (2026-07-12). Criterion 15 gains a terse-label rule: a leaf `label` renders as the pre-answer breadcrumb, so name the class only and keep worked examples in `description`; shorten an over-long label before reaching for suppress. Surfaced by the trapassato and imperativo formation leaves. **Revision 11** (2026-06-09). Criterion 16 added: `tense_choice` and `.discrimination.*` items carry `candidate_tenses` (the legitimate options) and `correct_tense` (the right one), tense-level labels for the post-answer tick and per-context stats, marking unaffected, candidates shown post-answer only and the item suppressed pre-answer. Resolves the candidate_tenses open question; carried by the TenseChoice wave-2 dispatch. **Revision 10** (2026-06-09). Criterion 15 gains a clarification: discrimination items (anything in a `.discrimination` bucket or the tense_choice tree) are `info_display: "suppress"` by default, because the breadcrumb names the contrast being tested and tips the learner that a tense choice is in play, which they should detect from context. Project-wide; binds TenseChoice and every tree's discrimination buckets. **Revision 9** (2026-06-08). Criterion 13 gains a cue-economy note: name the person in the cue only when the prompt does not already supply the subject. Drop `(fare, voi)` to `(fare)` when the sentence shows "Voi"; keep `(capire, io)` when the subject is pro-dropped. Surfaced by Smith on the live present-indicative items, where the cued person was redundant in the 67 items whose sentence carries an explicit subject pronoun. **Revision 8** (2026-06-08). §2 adds criterion 15 on the bucket-name breadcrumb leak (the sibling of criterion 13, promised as a Rev 7 addendum and previously missing): set `info_display: "suppress"` on an item when its bucket-name breadcrumb would hand the learner the verb-class membership or rule-output under test, decided by a leak-vs-trap test (suppress when the breadcrumb names a non-derivable class the item tests; leave visible when it only restates the cue, or when naming the class tempts a wrong answer the `must_not_include` catches). The housing honours the flag in the bucket-filter banner and live-panel tooltips. Surfaced by PresentFormationAuthor on the -isc-/-go/dittongo formation leaves. **Revision 7** (2026-06-08). §2 adds criterion 14 on multi-position clitic items: when a structure allows the clitic in two valid positions (modal + infinitive, stare + gerundio progressive, negative tu imperative, causative fare + infinitive, and their cluster / reflexive variants), the prompt asks for a full sentence rewrite and must NOT announce that placement is the variable or that multiple answers are valid (no "place the pronoun", "either valid position", "before or after the verb"). Accept all valid placements in `any_phrases`; the both-positions teaching belongs in the explanation. Triggered by the progressive item `op_pos_ger_02` whose prompt said "Either valid position", planting the placement idea instead of testing whether the learner reaches for it. **Revision 6** (2026-06-07). §2 adds criterion 13 on cue chip discipline: chips name the surface morphology of the wanted answer, not the structural rule. Triggered by the negative-imperative item "Don't give it to me!" whose chip leaked "infinitive form for negative tu", naming the very rule the item is supposed to test. Self-audit on next opening: look in your batch for chip texts containing rule names (infinitive, subjunctive, conditional, gerund, etc.) and rewrite to name the surface only. **Revision 5** (2026-05-29). §2 lemma key conventions extended: a new rule 8 adds `number` (sg | pl) as an optional fourth discriminator on the unique key, in the same shape as `gender`. Triggered by the `le` clitic pronoun case (f-sg-indirect vs f-pl-direct sharing the rest of the key). Bucket-id shape extends in parallel: `vocabulary.it.<lemma>.<pos>[.<gender>][.<number>].<aspect>[.<direction>]`. **Revision 4** (2026-05-28) added §2 criteria 8-12 (one-markpoint-per-skill, slot-count-matches-surface, implicit-cue must_not_include, register-conditional items state register, prompts not glossary-wrapped) plus §1 external_id decoder. **Revision 3** (2026-05-15) added "Lemma key conventions" to §2 and §7 on friendly-bucket-label communication style. Revision 2 (2026-05-13) and earlier guidance still applies. See [DECISIONS.md](./DECISIONS.md) for the full change log.

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
- `match_at` (optional, future engine extension): `"end"` if the markpoint must match at end-of-word (useful for single-character endings like `-a` that would otherwise match too eagerly). Engine support is partial; check with dispatcher.
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

    So the flag is set per item, not per bucket: within one leaf, the rule-applies forms are suppressed while the reverting / over-extension forms stay visible. Same shape as criterion 13: name the surface the learner is producing, never the diagnostic the item is testing, except where naming it sets a productive trap.

        **Keep leaf labels terse; put worked examples in `description`.** The label renders as the pre-answer breadcrumb, so a label that embeds the canonical worked example (e.g. "avere auxiliary: avevo + participle (avevo parlato)") hands over the answer on every item. Name the class only in the label ("avere auxiliary"); the worked example belongs in `description` or `canonical_example`. This is prior to the suppress test: shorten an over-long label first, and only then apply criterion 15's suppress to any residual label that still names a non-derivable class the item tests.

    **Discrimination items are suppress-by-default.** Any item in a `.discrimination` bucket (or in the tense_choice tree) tests *choosing* the right tense / aspect / mood from valid alternatives. The breadcrumb on such an item ("Imperfect vs passato prossimo", "Indicative vs subjunctive") names the contrast being tested, and showing it pre-answer tips the learner that a tense choice is in play, when they should be detecting that from the sentence's context, exactly as a real reader would. So set `info_display: "suppress"` on every discrimination item: the generic topic-root label shows pre-answer, the contrast name reveals post-answer. This is the leak-vs-trap test on the selection axis (the breadcrumb names the diagnostic, the learner can't derive it without being primed). Project-wide rule, 2026-06-09, extends from the ImperfectAuthor discrimination items.

16. **Tense-choice and discrimination items declare their candidate set.** An item where the learner picks the contextually-correct tense among formally-possible options (every `tense_choice` item, and any item citing a `.discrimination.*` bucket) carries two fields alongside the markpoints: `candidate_tenses` (an array of two or more controlled tense-tags, the legitimate options in that context) and `correct_tense` (the single member of `candidate_tenses` the context demands). The correct surface form still lives in the markpoint `any_phrases`; these two fields are tense-level labels that drive the post-answer tick and the per-context stats, and do not affect marking. Controlled tense-tags: present, passato_prossimo, imperfect, trapassato_prossimo, passato_remoto, future, futuro_anteriore, condizionale, condizionale_passato, congiuntivo_presente, congiuntivo_imperfetto, congiuntivo_passato, congiuntivo_trapassato, imperativo, gerundio, infinito. The candidate set is surfaced to the learner ONLY post-answer (showing it earlier would tip that a choice is in play, which criterion 15's discrimination-suppress forbids), so these items also carry `info_display: "suppress"`. Wrong-tense forms go in `must_not_include` as usual; where the stats should attribute which wrong tense was chosen, tag the discrimination misconception on that entry in Phase 3.

---

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
  - **`polarity: "negative"`** (optional): use to flag a reference as instructive-wrong (something the AI marker should NOT credit). The marker treats it as an anti-anchor.
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

> I added 5 items to `verb_form.imperfect.discrimination.modals.sapere` and 3 to `verb_form.imperfect.discrimination.modals.dovere`.

Write:

> I added 5 items to the sapere modal contrast ("knew" vs "found out") and 3 to the dovere contrast ("was supposed to" vs "had to").

Don't write:

> Item `op_pos_modal_03` covers `pronoun.position.modal_plus_infinitive_either`. I propose moving it to `pronoun.special.stressed_forms`.

Write:

> Item op_pos_modal_03 tests the rule that a clitic with a modal+infinitive can sit either before the modal or attached to the infinitive ("Devo parlargli" / "Gli devo parlare"). I propose moving it from the modal-position bucket to the stressed-forms section.

Don't write:

> Adjective lemmas only carry `vocabulary.it.<lemma>.translation`, never `vocabu