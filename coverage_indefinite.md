# Coverage: Indefinites (`indefinite`, topic_short `ind`)

**Author:** IndefiniteAuthor | **Delivered:** 2026-07-18 | **Brief:** Revision 25 as read from disk
**Files:** `grammar_questions_indefinite.json` (61) · `translation_items_indefinite.json` (25) ·
`bucket_suggestions_indefinite.json` (3) · `glossary_suggestions_indefinite.json` (4 terms)

> Per Rev 18 the coverage doc is the RECORD, not the channel. Everything here needing an Architecture
> ruling is also raised in a thread: `Architecture_IndefiniteAuthor_batch_delivery.md` (asks) and
> `Architecture_IndefiniteAuthor_free_choice_mood_seam.md` (the tree gap). Nothing lives only here.
>
> Every count below is derived from the shipped JSON by script, not from memory of the batch.

## Bucket-to-item table

| Leaf | Grammar | Translation | Suppressed | MCQ |
|---|---:|---:|---:|---:|
| Qualche + singular | 8 | 3 | 7 | 1 |
| Alcuni / alcune | 6 | 2 | 0 | 0 |
| Ogni + singular | 6 | 2 | 6 | 1 |
| Tutto + article | 7 | 3 | 7 | 1 |
| Qualcuno and qualcosa | 8 | 3 | 0 | 1 |
| Nessuno, niente, nulla | 9 | 7 | 0 | 1 |
| Ognuno and ciascuno | 6 | 2 | 0 | 1 |
| Qualunque / qualsiasi + noun | 6 | 2 | 6 | 1 |
| Chiunque | 5 | 2 | 5 | 1 |
| **Total (9 leaves)** | **61** | **26**¹ | **31** | **8** |

¹ 26 bucket-cites across **25** translation items: `trans_ind_it_en_tutto_01` carries two required_buckets.

**Zero-coverage leaves: none.** All 9 active leaves carry both grammar and translation items.
CEFR spread: A2 32, B1 15, B2 14. Direction split: 15 en→it / 10 it→en.

## The engine facts this topic turns on

Everything below was read off `housing/js/norm.js` and `housing/js/grammar_engine.js` as they ship,
then verified by a Python replica of both that marks every phrase in the batch. Reasoning from the
authored string is how three audits in a row under-anchored; I did not repeat it.

1. **`norm()` folds an apostrophe to a space and collapses whitespace** (norm.js:106). So
   `norm("nessun'idea")` and `norm("nessun idea")` are the *identical string* `nessun idea`. **The
   apostrophe is not deterministically gradable by any substring markpoint.** This is the article
   tree's ratified position (un'/un), and it lands on this topic through `nessun'idea`.
2. **`must_not_include` is else-if gated behind BOTH the strict positive and the accent-folded
   fallback** (grammar_engine.js:169). A guard nested inside a correct answer is therefore safe; a
   correct answer nested inside a *wrong* one is a live false credit that **no anchoring can reach**.
3. **`match_at` is per-PHRASE**, honoured on the folded fallback too, and `"word"` anchors both
   boundaries. Every phrase in this batch carries it. Uniform, no exceptions.

## Findings the replica caught that my prose reasoning did not

Recorded because the pattern matters more than the two items.

- **`ind_chi_01` was crediting the exact error it existed to catch.** I guarded `"Chiunque persona"`.
  The correct answer `Chiunque` sits inside that guard at clean word boundaries, so `any_phrases`
  fires first and the wrong answer scores **1.0**. The error *adds* a word rather than extending one,
  so both boundaries are clean and `match_at: "word"` is powerless.
  **What makes it worth recording:** I had diagnosed this exact hazard *correctly*, in prose, in
  `ind_chi_02`'s `examiner_note` — and routed that item to MCQ *for this reason* — and then authored
  the forbidden guard two items away regardless. §18 says it outright: never leave a guard that
  implies a catch it cannot make. **Knowing the rule did not stop me breaking it; executing the engine did.**
- **`ind_nn_08`** had the same shape (`"niente cosa"` containing the correct `niente`). Dropped.
- **`ind_qualche_05` shipped a frame its own answer breaks.** `"Ci sono ____ da risolvere"` forces a
  plural verb; the answer is `qualche problema`, singular. *Ci sono qualche problema* is not Italian.
  Criterion 10a. Reframed to `C'è ____ da risolvere`.
- **`ind_tutto_01` guarded correct Italian.** `tutta la giornata` was a `must_not_include` — but it
  is correct *and* it uses the very pattern under test. Criterion 18's third direction, reached from
  an unusual angle: I wrote the guard from the *noun* I had in mind rather than the *skill* I was
  testing. Promoted to a full-credit positive.
- **25 dead case variants.** `norm()` lowercases, so listing `Chiunque` *and* `chiunque` gives a
  second needle that can never fire where the first did not. Deduped on the normalised form.

Final state: **62 markpoints, 0 findings** — every positive credits, every guard reaches a miss, no
guard fires on a listed correct answer, no unanchored phrase, every MCQ distractor scores 0.

## The criterion-20 problem this topic has, and how it was resolved

**Nine of my thirteen lemmas are INVARIABLE** (qualche, ogni, qualcuno, qualcosa, niente, nulla,
qualunque, qualsiasi, chiunque). Criterion 20 exempts the citation-form trigger — *infinitive to
conjugate, base adjective to agree, lemma to inflect* — and **an invariable word has nothing to
inflect, so the exemption does not reach it.** This is exactly DemonstrativeAuthor's `(ciò)` finding
(their thread, v1, currently awaiting your ruling); their items predate Rev 22 and mine do not, so
criterion 20 binds mine immediately and I complied rather than asking.

The resolution, applied per item rather than per leaf:

| lemma | inflects? | cue | why |
|---|---|---|---|
| tutto, nessuno, ciascuno | yes | Italian lemma | Rev 22's citation-form exemption; Rev 25 level check passes |
| qualche, ogni | **no** | Italian lemma **+** English gloss | Rev 23's sharper test: the fragment-only answer (*"Ho comprato qualche."*) is visibly **BROKEN**, so the sentence rescues the learner and the cue is defensible. The cue pins *which* indefinite; the singular noun — the thing under test — stays wholly with the learner. |
| qualcuno, qualcosa, chiunque, qualunque, qualsiasi, niente | **no** | **English gloss only** | The cue would be the whole answer, or — worse — the fragment-only answer is plausibly **FLUENT**. *"C'è ____ da vedere? (qualcosa)"* typed as just the cue gives *"C'è qualcosa da vedere?"*, a perfect sentence. The learner is **trapped**, takes an unrecognised miss, and is diagnosed as failing the di-insertion when they merely misread the cue. That is `prep_sf_03` exactly. |
| **alcuni** | yes | **English gloss only** | **Rev 25, not Rev 22.** The dictionary lemma is *alcuno* — a form an A2 learner meets only in literary / negative-polarity Italian (*senza alcun dubbio*), not the alcuni/alcune they actually know. Cueing it would pitch the citation form above the item's level: **the `esserci` case, in a different tree.** |

`prompt_supplies_base_form` tracks this exactly: **true** on the 28 items whose prompt supplies the
Italian target (including the three that supply it inside an instruction rather than a trailing chip),
**false** on the 33 that gloss only, so the cue-misread second chance applies where a cue could be misread.

## Criterion-by-criterion

- **13** (chips name the surface): **CLEAN, 0 rewrites.** Eight distinct cues, all bare lemmas
  (`qualche`, `ogni`, `tutto`, `nessuno`, `ciascuno`, `essere`, `avere`, `potere`). None names a rule;
  no prompt contains *invariable*, *agrees*, *elides*, *apocope*, *singular after* or any tense/mood name.
  Cue economy (Rev 9) applied: person named only where the subject is not in the sentence.
- **15** (breadcrumb): **31 of 61 suppressed**, decided per item by the leak test, not per leaf.
  Suppressed where the label names the rule-output that IS the skill (*Qualche + singular*, *Ogni +
  singular*, *Tutto + article*) or literally *is* the answer (*Chiunque*, *Qualunque / qualsiasi*).
  Visible where the label only restates what the gloss already pinned (*Alcuni / alcune*, *Qualcuno
  and qualcosa*, *Nessuno, niente, nulla*, *Ognuno and ciascuno*) — those items test the agreement,
  the *di/da* joint or the verb's number, none of which the label names. Rev 19 recoverability holds
  throughout: every suppressed item's candidate set is pinned by its cue or its gloss.
- **16 / Rev 17(iii)**: **no `candidate_forms` used, deliberately.** No item cites a `.discrimination.*`
  bucket — this tree has none. The lexical choices that *are* discriminations in substance
  (ognuno vs ogni, chiunque vs qualunque) are MCQ, where the choices already render the candidate set
  as buttons; I have followed ArticleAuthor's recommendation (A) in their open thread, and the
  WordFormation precedent that verdict-style MCQs were ruled NOT to need the fields. **Flag if you
  want it the other way** and I will retrofit; it is one pass.
- **17** (explanations gloss the sentence): **61 of 61.** Every explanation opens with the English or
  quotes the Italian and follows it. Four-beat house style throughout; glossary terms used unexpanded.
- **18** (superstring safety): **CLEAN**, all four directions, verified by replica rather than by eye.
  Two live bugs found and fixed (above). 100% of phrases carry `match_at: "word"`.
- **19** (accent as morpheme): **N/A — no flags, and re-run AFTER the cue decisions per Rev 23.**
  Only 4 accented answers exist (`è`, `ogni lunedì`, `può`, and one MCQ choice). In each the
  accent-stripped twin is the same word misspelled, not a plausible alternative *answer* to that
  prompt — criterion 19's own test, and the DECISIONS 2026-07-14 precedent (*e* and *da* are not
  candidate answers at a verb blank). Fold-rescue plus an orthography miss is the correct verdict.
  Rev 23's hazard (a crit-20 reframe silently re-arming crit-19) cannot bite here: the glossing
  removed *indefinite* cues, and no indefinite in this topic carries an accent.
- **20 / Rev 25**: see the table above. Every cued lemma sits at or below every item that cues it
  (`ciascuno` B1-core is cued only on B2 items; `qualche`/`ogni`/`tutto`/`nessuno` A2 on A2-B1 items;
  `essere`/`avere`/`potere` A1 throughout). **No `esserci`-shaped case survives** — the one that
  existed (*alcuno*) was caught and glossed.
- **8** (one markpoint per skill): one 2-markpoint item, `ind_tutto_06`, splitting *tutto keeps the
  article* from *which article* (`article.definite.forms`, cross-tree). A learner who keeps the
  article but picks *i* scores 1/2 with the miss attributed to the article tree, not to mine.

## House techniques (Rev 14), and where I departed

- **Exception density** (2): `ind_qualche_05` plants *problema* (masculine, ends `-a`) inside an
  otherwise regular qualche set, so *singular = drop the -i* autopilot fails.
- **Same-surface, opposite-answer pairs** (3): `ind_oc_03` / `ind_oc_06` (*ciascun candidato* vs
  *ciascuno studente*) and `ind_chi_01` / `ind_chi_05`. The conditioning factor is the noun's opening
  sound, and the pair teaches it better than either item alone.
- **Word-bank as distractor set** (5): `ind_chi_04` is OIC's four-way closed bank verbatim
  (qualunque / chiunque / ciascuno / nessuno), where the option set IS the distractor set.
- **Departure, named:** *person recovery from indirect cues* (1) is barely used. Person is not a
  variable in most of this topic — the diagnostic is the *noun's* number or the *quantifier's* form.
  Where person does matter (`ind_oc_01`, `ind_oc_04`) the pull toward the wrong person comes from an
  adjacent `di noi` / `di voi`, which is the same idea by a different road.

## Items flagged uncertain

1. **`ind_nn_05` does not test the thing its leaf's description centres on.** The leaf names
   `nessun'idea` among the uno-endings, but the apostrophe is invisible to the engine (see above), so
   the item accepts **both** `nessun'idea` and `nessuna idea` at full credit, tests only that the
   learner reaches for nessuno and agrees it feminine, and teaches the elision in the explanation.
   The apostrophe is graded in `trans_ind_en_it_nn_04` instead. **This is a deliberate refusal to
   pretend**, on the ArticleAuthor precedent. Blessing wanted.
2. **`nessuna idea` accepted at 1.0 alongside `nessun'idea`.** Attested and widely used; the elided
   form is the one matching the article pattern. If you want it at 0.9 with a steering note, say so —
   I did not want to invent a prescriptivism the estate has not ruled.
3. **`ind_alcuni_06` stretches its leaf.** The leaf's description covers alcuni *adjectivally*
   ("alcuni ragazzi, alcune ragazze") and says nothing about standalone pronoun use (*Alcuni dicono
   che...*). Authored there because it is common at B1 and the leaf is its only plausible home.
   Redirect me if there should be a pronoun leaf instead.
4. **`ind_qq_03` / `trans_ind_it_en_qq_01` (post-nominal dismissive `un vino qualunque`)** carry a
   meaning shift the leaf's description mentions in one clause. If this deserves its own leaf, it is
   one; I did not propose it because two items is thin evidence.

## Notes for the next dispatch

- **The dispatch's criterion-18 warning is wrong on one of its three examples.** It says *"ogni inside
  ognuno"*. It is not: `ogni` = o,g,n,**i** and `ognuno` = o,g,n,**u**,n,o — the run breaks at the
  fourth character and `ogni` is not a substring of `ognuno` under any normalisation. The other two
  (*qualche* inside *qualcheduno*, *alcun* inside *alcuni/alcune*) are real and are anchored.
  Harmless here because everything is word-anchored anyway, but the next author to read that dispatch
  should not spend twenty minutes looking for a containment that does not exist.
- **The dispatch's worked example has a broken prompt**: `"Ho comprato ____ (some books, using
  qualche): 'Ho comprato ____.'"` carries two blanks, one inside the parenthetical. Brief wins over
  dispatch, so I authored the shape the brief wants; flagging so it is fixed before it is copied.
- **Misconception tagging is impossible for this topic and the batch ships untagged.**
  `data/misconception_tag_lists.json` has no `indefinite` entry and `data/misconceptions.json` has no
  indefinite coverage — it is one of the 132 unharvested `common_miss` buckets in MisconceptionAnalyst's
  census, which Smith ruled CARRY ON at v12. My guards carry rich `note` text and are ready to take
  `misconception` ids on the object form the moment a tag-list exists; ImperativoAuthor's retro-tag is
  the precedent. **Not a blocker, and not my seat's to fill.**
- **`indefinite` is absent from `data/manifest.json`**, as the 2026-07-14 scaffolding decision intended
  ("none enters the manifest until content lands"). Content has now landed. Architecture's to add.
- **`ogni` + numeral is a live exception to my own leaf's stated rule.** *Ogni due giorni* is correct
  and takes a plural. No item goes near a numeral, so nothing is wrong today; it is a hole, proposed as
  a note on the leaf rather than a new leaf, since it is one exception rather than a skill.
- **Forward proposals**, all uncited pending registration: the free-choice subjunctive trigger leaf
  (**the big one** — see the seam thread), `tutto/tutti` as pronouns, and `dovunque/ovunque`.
