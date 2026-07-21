# Authoring feedback: passato prossimo (first batch)

Written by the passato-prossimo authoring chat, 2026-05-12, after producing the first real batch (82 grammar, 30 translation, 9 bucket suggestions). For the architecture chat to read before the next topic dispatch.

The brief works. Most of what follows is "tightenings the brief would benefit from" plus a few questions for OPEN_QUESTIONS.md.

---

## What worked well

The bucket-tree structure is genuinely useful for authoring. Knowing the leaf taxonomy in advance forces the questions to align around named skills rather than vibes. The `common_miss` strings in `attributes` are gold for `must_not_include` lists. I lifted most of mine straight from the tree.

The two-markpoint pattern for "auxiliary + participle" fill-ins (e.g. `pp_irr_fare_02`) is the right shape: it gives the marker two independent verdicts in one question, and the diagnostic is clean. A learner who writes "è fatto" hits the participle bucket and misses the auxiliary bucket. That's exactly the per-skill story we want in the history.

The bucket tree itself has good coverage of the high-frequency irregulars and the agreement permutations. The one weak area is the auxiliary tree's leaves, which describe choice but not conjugation — see below.

---

## Where the brief is unclear or under-specified

### 0. Every fill-in must anchor the prompt to past tense (added after user testing)

This one I got wrong on first pass. Smith tested the live grammar widget on `pp_reg_ire_04` ("Complete: 'Lei ____ tutto subito.' (capire)") and quite reasonably typed `capisce`, the present-tense form. The marker correctly identified the two PP markpoints as `not_attempted` and the learner scored zero, but the prompt itself was at fault: nothing in "Lei ____ tutto subito" forces a past-tense reading. Present-tense `capisce` is a perfectly grammatical completion. The breadcrumb at the top of the widget ("Passato prossimo › Past participle form › -ire → -ito") provides the section context, but the prompt should not rely on it: a learner working through Italian-first should be able to read the prompt and have only one possible tense fit.

I patched 15 questions in the passato prossimo batch that had this flaw. The fix is a past-time anchor in the prompt itself: `Ieri`, `Ieri sera`, `Stamattina`, `Il mese scorso`, `La settimana scorsa`, `L'estate scorsa`, `Sabato scorso`, `Nell'esame di ieri`, `Quando sono entrato`, `All'inizio... ma poi ho capito`. The list of acceptable anchor patterns is short and reusable.

**Proposed rule for the brief** (new §2.7 quality criterion for grammar questions):

> Every fill-in prompt must contain at least one cue that forces a past-tense reading. The cue can be a time adverbial (ieri, stamattina, l'altro giorno, il mese scorso), a temporal subordinate clause in the imperfetto (`...perché faceva caldo`, `quando sono entrato`), a date or year (`nel 1990`), or a visible participle / auxiliary already in the unblanked text. A prompt that is grammatically valid in present tense fails this rule. Form-only prompts ("Form the past participle: parlare → ____") satisfy it trivially because they explicitly name the form.

**Diagnostic mechanism** to catch this in authoring: run each prompt past a quick "could this be a grammatical present-tense sentence?" check. If yes, fix the prompt. The dispatcher's validation pass (already proposed under §7 of OPEN_QUESTIONS additions) is a natural home for this check, perhaps run by a cheap LLM call.

### 1. The 1-3 any_phrases limit is too tight for auxiliary-choice buckets

The bucket `auxiliary.avere_default` describes a CHOICE (essere vs avere). On a "choose the auxiliary" question with prompt "Io ____ mangiato la pasta," any of `ho / hai / ha / abbiamo / avete / hanno` would demonstrate the choice skill. That's six forms — twice the brief's stated ceiling.

I resolved this by using just the literally correct form (e.g. `["ho"]`) and listing wrong-family forms (`["sono"]`) in must_not_include. Consequence: a learner who writes "Io hanno mangiato" (right choice, wrong person) gets zero credit and zero diagnostic on this bucket. The error is silent.

This isn't catastrophic but it loses signal. Three options for the brief:

- **A. Loosen the cap** for auxiliary-choice buckets specifically: allow 6+ phrases when the bucket is intrinsically family-shaped.
- **B. Keep the cap, accept silent person errors** as prerequisite issues (which is what the tree implies via `prerequisites: [verb_form.present_indicative.avere]`).
- **C. Add a new bucket** for person-agreement-of-the-auxiliary (proposed in `bucket_suggestions_verb_form.passato_prossimo.json`). This is my preference: it surfaces the error in the PP context where it occurred.

The brief should pick one and say which.

### 2. The substring matching is hostile to single-character agreement questions

For "Maria è andat__" the agreement is the last letter. Substring `"a"` is not a useful any_phrase: it matches everything. I worked around by reformulating the prompt as "Complete with the correct form: 'Maria è ____.'" with any_phrases `["andata"]`. This works but means every agreement question implicitly tests the participle form as well as the agreement, even when I only wanted to test agreement.

Suggestion for the brief: add a one-liner saying "any_phrases must contain at least one alphanumeric morpheme; single-character endings are not viable; reformulate the prompt to expect the full word."

Or, if the engine supports it later, allow a `match_at: "end"` qualifier on any_phrases so we can scope substring matching to end-of-word.

### 3. Reference_translations as positive anchors vs negative examples

The brief implies reference_translations span the "legitimate translation space." I sometimes included a reference labelled awkward/wrong in `notes` to give the AI marker an explicit "don't credit this" anchor (e.g. `trans_pp_it_en_01` has a third reference flagging present-perfect-with-yesterday as ungrammatical English).

This is useful for the marker but may confuse a naive consumer of the JSON that treats every reference as a positive anchor. Options for the brief:

- **A. Split the field**: `reference_translations` (positive only) and `negative_anchors` (instructive wrongs).
- **B. Add a `polarity` field**: `"positive" | "negative"`, defaulting to positive.
- **C. Ban negative anchors** in this field and put them somewhere else (or rely on the marker's own judgment).

I went with the current shape and used the `notes` field to flag wrong ones. It would be cleaner with explicit polarity.

### 4. Per-question CEFR vs target-level steer

The user explicitly said "don't be bound by CEFR — cover the whole topic comprehensively, attach a level to each question for filtering." This is the right call but it sits uneasily next to the brief's §1.D, which asks the dispatcher to specify a CEFR target.

Recommendation: change §1.D from a directive ("target level") to a steer ("weight toward CEFR levels X-Y if you like, but cover the whole topic"). Every item still gets a `cefr_level_target`, which lets later UI filter or sequence.

### 5. The 30/15 default for batch size is too small

The user wanted 70+ grammar to make the topic feel complete to a learner. I produced 82. The brief's default of 30 would have given a thin sample — not enough to traverse the bucket tree even once per leaf for passato prossimo.

Suggestion: lift the grammar default in the brief to 60-80 per topic, with the note "scale to match the bucket-tree leaf count for the topic; PP has ~30 leaves so 60-80 questions gives roughly 2-3 per leaf."

### 6. external_id format

I used `pp_<subtopic_short>_NN`. The brief says `<topic_short>_<subtopic_short>_<NN>`. So `pp` is my topic_short. Worth fixing the topic_short to a canonical value in the brief (or in the bucket tree's metadata) so different authoring chats don't collide.

For verb_form.passato_prossimo my proposed canonical is `pp`. Other shorts that might come up: `ag` for adjective_agreement; could be specified in the bucket tree root entry's `attributes`.

### 7. The "topic" field in grammar questions

The brief example shows `"topic": "adjective_agreement"`. The bucket ids use `adjective_agreement.o_class.feminine_plural`. So `topic` is the top-level group, `subtopic` is the leaf or near-leaf. I followed this. Worth saying explicitly in the brief that `topic` should equal the bucket-id's first component.

---

## Markpoint mechanics: things to consider before scaling

### Wrong-form catching has diminishing returns

For each markpoint I listed 2-4 must_not_include entries covering the diagnostic wrong forms (over-regularised participles, wrong-family auxiliaries, etc.). But the long tail of possible wrong forms is endless. The bucket tree's `common_miss` strings are a great starting point and I leaned on them.

Architecturally, this means must_not_include is a curated diagnostic, not an exhaustive enumeration. The brief should state this explicitly: "must_not_include catches the 1-3 most diagnostic wrong forms, not every possible wrong form. The marker awards no credit for absent any_phrases; must_not_include is for routing the miss to this bucket."

### Same-form ambiguities across question types

Question `pp_irr_vedere_01` accepts `visto` (modern) but the tree notes `veduto` as archaic-but-grammatical. I marked the question with `examiner_note` to say "accept visto; treat veduto as unusual but not wrong." The brief doesn't define a mechanism for "right but flagged for review." Could be:

- A new `accept_with_note` field on markpoints.
- A `severity: trivial` rating elsewhere.
- The marker handles it from the explanation.

Right now it's prose in `examiner_note` and will rely on the marker's judgement.

### Word-order in fill-ins

Substring matching is order-insensitive. If a learner writes "parlato ho" for a "ho parlato" target, both markpoints fire on substring match. For tightly-constrained fill-ins this almost never happens. For longer answers it would. Worth a note in the brief that fill-ins should be tight: 1-3 words max.

---

## Off-tree optional_buckets

The translation items reference buckets that don't exist yet:

- `article.definite`
- `adjective_agreement.o_class` (which exists as a separate bucket tree)
- `preposition.articulated.{al, alla, alle, sul, nel, delle}`
- `pronoun.indirect_object`

These are deliberate forward-references to sibling trees that haven't been authored yet. The architecture chat needs to decide how validation handles them:

- **A. Strict**: a translation item with unknown buckets fails validation.
- **B. Warn**: log unknown buckets but accept the item.
- **C. Silent**: accept anything; the marker just fires what it can find.

I'd argue B is the right default during authoring (warnings drive new tree work) and A for production loading.

---

## Bucket-tree gaps (full proposal list)

See `data/bucket_suggestions_verb_form.passato_prossimo.json`. Quick summary of the nine, in order of how often they came up during authoring:

1. **person-agreement of the auxiliary** — high frequency, came up on every auxiliary-choice question.
2. **adverb placement between aux and participle** (mai, già, ancora, sempre, appena) — high frequency, came up on negation questions and across many translation items.
3. **modal-auxiliary inheritance** (sono dovuto andare vs ho dovuto andare) — medium frequency, would unlock dovere/potere/volere as a question family.
4. **translation-mapping → simple past** (PP + definite past-time adverb).
5. **translation-mapping → present perfect** (PP without past-time adverb, or with mai/ancora/già). Pairs with #4.
6. **conoscere → conosciuto orthographic sub-bucket** under regular -uto.
7. **stem-expansion class aggregate** (bere/dire/fare/porre/tradurre).
8. **preceding partitive 'ne' agreement** (ne ho mangiate tre).
9. **mixed-gender plural default** (currently filed under masc plural).

Of these, #1, #2, and #4-5 are the ones I think the next dispatch should resolve before authoring the next topic. The others can wait.

---

## Proposed new entries for OPEN_QUESTIONS.md

If the architecture chat wants to track these:

### How should authored content be organised on disk?

I wrote three files into `data/`:
- `grammar_questions_<topic>.json`
- `translation_items_<topic>.json`
- `bucket_suggestions_<topic>.json`

Alternatives:

- **Per-topic subfolders**: `data/content/passato_prossimo/{grammar,translation,suggestions}.json`. Cleaner when there are 20+ topics.
- **A single per-topic JSON** with three arrays.
- **One global grammar.json and one global translation.json** with a topic field per row.

**Likely resolution**: per-topic subfolders once there are more than three topics. Single files for now.

### Should authoring chats validate bucket-tree references themselves?

Currently the authoring chat trusts the supplied bucket tree. There's no mechanism for the dispatching pipeline to catch a typo'd `bucket: "verb_form.passato_prossimo.partikiple_form"` until the question gets loaded into the live system.

**Likely resolution**: dispatcher runs a validation pass on the produced JSON before saving, including bucket-id existence checks against the supplied tree.

### Negative reference translations: keep, split, or ban?

(Discussed in §3 above.)

---

## Operational notes for the next dispatch

When you dispatch the next topic (adjective_agreement is the obvious next one) please send:

1. The bucket tree as a file path or paste.
2. The canonical `topic_short` for external_ids (e.g. `aa` for adjective_agreement).
3. Whether the §1-§7 items above have been resolved, and if so how, so the next authoring chat doesn't re-tread the same ambiguities.
4. Whether to retain my user-validated default (70-80 grammar, 25-30 translation) or revert to the brief's 30/15.
5. Any explicit steer on CEFR weighting (e.g. "this batch should feel weighted toward A1-A2 because we want a beginner UX feel") — the user's preference seems to be "cover the whole tree, label per item, don't gate."

The user also said Italian Club is a touchstone for "what a topic feels like at a given level." If the architecture chat wants the next authoring chat to consult specific Italian Club references, naming them in the dispatch would help.

---

## A note on this chat's process

The user's first response to the clarifying questions overrode the brief's defaults in three places: don't gate on CEFR, go for 70+ on grammar, do 15 translation each way. All three were the right call for what they wanted, and the brief's defaults would have produced a thin sample. Recommend the brief say "the dispatching chat may override any default here based on the user's specific goals; the AUTHOR_BRIEF defaults are a starting point, not a contract."
