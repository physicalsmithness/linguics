# Author Brief: producing grammar questions and translation items

**Revision 3** (2026-05-15). Updated after the adjective chat's vocab-reference audit. Two additions: §2 now has explicit "Lemma key conventions" (diacritics, capitalisation, multi-word forms, inflected/elided surface forms, participle handling, the adjective-lemma carve-out), and §7 is new on communication style with the project author (use friendly bucket labels, not the dot-separated ids, in any prose written for a human reader). See [DECISIONS.md](./DECISIONS.md) for the change log; the Revision 2 (2026-05-13) and earlier guidance still applies.

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

> Adjective lemmas only carry `vocabulary.it.<lemma>.translation`, never `vocabulary.it.<lemma>.gender`.

Write:

> Adjective lemmas only carry the translation aspect, never the gender aspect.

Tooling-precise statements (citing the actual aspect name, the actual bucket id, the actual field name) belong in code-blocks or parenthetical asides, not in the running prose.

### When to include the id

Three situations warrant the id appearing in human-facing prose:

1. **Lists for action.** "Please rename `vocabulary.it.citta.*` to `vocabulary.it.città.*`." The id is what the chat acts on, so showing it is acting precision.
2. **Bug reports.** "The marker fired against bucket `pronoun.indirect_object.le` but the item references `pronoun.direct_object.le`." Two ids visibly contrasted are the substance of the report.
3. **First mention in a long document.** A coverage report's first mention of each top-level area can include the id parenthetically: "the Sapere contrast bucket (`verb_form.imperfect.discrimination.modals.sapere`) got 5 items". Subsequent mentions use the label alone.

In every other case, lead with the label.

### Quick reference

When in doubt: imagine reading the document aloud to a friend who knows Italian grammar but doesn't know this project. If a sentence would make them stop and frown, rewrite it with the label.
