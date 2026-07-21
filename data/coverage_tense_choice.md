# Coverage summary: tense choice

Authored against the diagnostic-only `tense_choice` topic. Dispatch `DISPATCH_tense_choice.md`.
**Wave 1** (2026-05-28, brief Rev 3) and **wave 2** (2026-07-15, brief **Rev 19**) combined.

**Totals: 142 grammar items (124 short + 18 periodo-ipotetico MCQ) + 66 translation items = 208 items.**
Every non-aggregate leaf in the tree now has coverage; **zero-coverage leaves: none**.

The topic is unusual in two ways. First, every grammar item presents two fully-formed verbs and
asks the learner to pick; no formation buckets are cited and none fire. That is the
diagnostic-purity rule: a miss means "chose the wrong tense", never "couldn't build the form".
Second, the imperfetto-vs-PP cluster cites buckets on the existing imperfect tree rather than
duplicating them under tense_choice; every other area cites `tense_choice.*`.

**Asks needing an Architecture ruling are in the thread**
`inter_chat/Architecture_TenseChoiceAuthor_wave2_delivery.md`, per Rev 18: this file is the
record, the thread is the contract. Nothing here waits to be discovered.

---

## Wave 2 (2026-07-15): what changed

Wave 2 turned out to be two jobs rather than one, because the dispatch's status line was stale.

### 1. The dispatch's status line was wrong, and the real gap was smaller

`DISPATCH_tense_choice.md` (revised 2026-06-09) says wave 1 covered only imperfetto-vs-PP and
that wave 2 must author "the remaining seven contrast areas". In fact the 2026-05-28 batch had
already authored **five of those seven**: progressive-vs-simple, future-vs-present,
counterfactuals, indicative-vs-subjunctive, and trapassato-vs-imperfetto. Only three areas were
genuinely unauthored (five leaves, all `stub: true`), and those are what wave 2 adds:

| Friendly label | New grammar | New translation |
|---|---|---|
| Present with da for ongoing-since | 8 | 4 |
| Passato prossimo for a completed event | 7 | 3 |
| Passato remoto for literary / historical narration | 7 | 3 |
| Passato prossimo for spoken / present-relevant past | 6 | 2 |
| Present vs imperfect habitual | 4 | 1 |
| **New in wave 2** | **32** | **13** |

The dispatch is Architecture's file to correct; flagged in the thread, not edited here.

### 2. The compliance debt was the larger half

The 92 wave-1 items were authored under brief **Rev 3**. The brief is now **Rev 18**, and three
criteria that bind this topic hardest post-date them. All 92 have been retrofitted:

| Criterion | Before | After | Note |
|---|---|---|---|
| 15 discrimination-suppress | 0 / 92 | 124 / 124 | Rev 10 made this project-wide and named TenseChoice explicitly. Until now the breadcrumb tipped the learner that a tense choice was in play on **every** item in this topic, which is precisely the detection the tree exists to measure. This was a live diagnostic leak, not tidying. |
| 16 `candidate_tenses` / `correct_tense` | 0 / 92 | 124 / 124 | The convention was created **by** this dispatch (Rev 11: "carried by the TenseChoice wave-2 dispatch"). Housing built the post-answer tick UI against the schema and closed its thread with "awaits wave-2 items to exercise it". That UI has been dark since 2026-06-09; it now lights up. |
| 17 English gloss in the explanation | 0 / 92 | 124 / 124 | Due "on next touch"; the 15/16 retrofit was that touch. |
| 18 superstring safety (Rev 19 full text, four directions, accent-folded) | 2 anchored / 188 unanchored | 0 unanchored | Rev 19's §2 text landed mid-batch and added direction 4 plus the accent-folded instruction. Re-audited: 7 containments, all now anchored and blocked. Two were real direction-3 exposures (`taglia` inside *sta tagliando*; `va` inside *vada*) surviving only on positive-first gating — see below. All 188 legacy phrases now carry per-phrase `match_at: "word"`, matching adverb / existential / si / passive / noun. |
| 15 recoverability (**new in Rev 19**) | n/a | 124 / 124 clean | Rev 19 restricts suppress-by-default to items whose candidate set is recoverable pre-answer. Every item here supplies both forms verbatim in the prompt ("Choose: studio / ho studiato"), which is the revision's own example of recoverable. Verified per item; zero failures. The lexeme problem Rev 19 addresses cannot arise here: a tense-choice item that didn't supply its forms would be a formation item. |

Every touched item had `version` bumped.

**Marker replica: green.** Ported verbatim from `housing/js/norm.js` + `housing/js/grammar_engine.js`
and run over all 124 items — 124/124 accepted answers score full credit, 124/124 guards reachable,
0 dead guards, 0 unblocked false-credit exposures. This topic is the one place the replica is
**exhaustive rather than sampled**: every prompt supplies its two candidate forms, so the
plausible-answer space is closed at two per item.

The two direction-3 exposures are worth recording because the replica does *not* catch them.
`tc_prog_pres_05` and `tc_subj_em_03` carried bare guards (`taglia`, `va`) sitting inside their own
correct answers (*sta tagliando*, *vada*). Feeding the two supplied forms, both pass: the positive
is checked first and wins. The defect only appears on a **near-miss** attempt — a learner typing a
misformed subjunctive (*vadi*) misses the positive, and then the bare `va` guard fires inside their
answer, recording "chose the indicative *va*" when they had actually reached for the subjunctive
and misbuilt it. A false diagnostic, not a false credit, and invisible to any audit that only marks
the supplied forms. Both now word-anchored.

### 3. Two content bugs found, and how

Writing 92 criterion-17 glosses means parsing 92 sentences properly, which surfaced two items
that had been live and wrong since May:

- **`tc_subj_op_05`**: *"Il rapporto suggerisce che il governo debba misure più severe..."* —
  dovere needs an infinitive. As written it reads "the government **owes** stricter measures".
  Repaired to *"...debba **adottare** misure più severe..."*. Markpoints, forms and buckets
  untouched; only the prompt changed.
- **`tc_trap_compl_05`**: *"...senza dirglielo a nessuno"* — `glielo` already encodes the
  indirect object, so `a nessuno` doubles it. Repaired to *"senza dirlo a nessuno"*.

This is an argument for criterion 17 beyond its stated purpose: it is a proofreading pass
disguised as a learner affordance.

### 4. pos-migration hygiene worklist: tense_choice is clear

The rev6 census (thread v6) assigned this seat 7 refs. All 7 fixed, 0 remaining:

`preavviso` → noun (×2, incl. gender), `sessantina` → noun (×2, incl. gender),
`incinta` → adjective, `pronto_soccorso` → noun, `per_via_di` → **adverb** (per that thread's v4
hand-curation of multiword adverbials: all'improvviso, per via di, di fila, più tardi).

Architecture can decrement the estate worklist from 182 to 175.

---

## Bucket-to-item-count table

Counts are dedicated items per leaf. There are no co-fires anywhere in this topic: each grammar
item attributes to exactly one bucket, by the diagnostic-purity rule. Translation items count
once per `required_bucket`.

### Present vs passato prossimo — NEW in wave 2

| Friendly label | Grammar | Translation | CEFR target |
|---|---|---|---|
| Present with da for ongoing-since | 8 | 4 | A2-B1 |
| Passato prossimo for a completed event | 7 | 3 | A2-B1 |

The da-durative is the dispatch's designated high-value trap and got the heaviest coverage of
any new leaf. English's perfect ("I have studied for two years") pulls hard for `ho studiato`,
and the leaf drills the trap from four angles: affirmative (`studio da due anni`), negative
(`non vedo Giulia da tre mesi`, where the calque bites hardest), the `da quanto tempo` question,
and a semantic-shift case (`conosco da` vs `ho conosciuto` = met).

The completed-event leaf is authored as the **counterweight**, not as a separate topic. Three of
its seven items are same-surface opposite-answer pairs with da-leaf items (house technique 3):

| Verb | da-durative item | completed-event item | Conditioning factor |
|---|---|---|---|
| vivere | `tc_pres_pp_da_08` → *vive* | `tc_pres_pp_comp_02` → *ha vissuto* | da (open) vs per (closed) |
| studiare | `tc_pres_pp_da_01` → *studio* | `tc_pres_pp_comp_03` → *ho studiato* | da vs per |
| aspettare | `tc_pres_pp_da_03` → *aspettiamo* | `tc_pres_pp_comp_04` → *abbiamo aspettato* | da vs per |

Identical verb, identical supplied forms, opposite answers. The pair teaches the preposition as
the conditioning factor better than either item alone, and it stops the learner autopiloting
"da-leaf means answer present".

### Passato remoto vs passato prossimo — NEW in wave 2

| Friendly label | Grammar | Translation | CEFR target |
|---|---|---|---|
| Passato remoto for literary / historical narration | 7 | 3 | B2-C1 |
| Passato prossimo for spoken / present-relevant past | 6 | 2 | B2-C1 |

**Register is stated explicitly in every prompt** ("In un testo di storia", "In stile narrativo",
"In conversazione", "In un messaggio a un amico"), per criterion 11 and Smith's ruling of
2026-07-15. The trade-off was put to Smith and taken deliberately: stating the register tests the
tense skill cleanly and costs the register-detection skill. Since this area is *largely a
register and regional choice rather than a strict aspectual rule* (the bucket's own words), an
item without a register cue would mostly be testing mind-reading.

Translation items use the settled `[square bracket]` convention
(`Architecture_Housing_translation_source_brackets`, CLOSED v3): the cue displays to the learner
and is stripped from the marker payload.

Two design points worth recording:

- **Same-surface pair across the register split.** `nascere` appears in both leaves:
  *Dante nacque nel 1265* (history text) and *Io sono nato nel 1990* (conversation). Both dates
  are "old". That is the point — it kills the naive rule "remoto = long ago" and leaves register
  as the only conditioning factor.
- **Two items deliberately break the pattern.** `tc_rem_pp_lit_06` is dateless (a novel's scene
  a second after the last one, still remoto) and `tc_rem_pp_spok_04` is *written* but informal (a
  text message, still PP). Together they block both false rules: remoto = old, and remoto =
  written.

### Present vs imperfect — NEW in wave 2

| Friendly label | Grammar | Translation | CEFR target |
|---|---|---|---|
| Present vs imperfect habitual | 4 | 1 | B1-B2 |

**Deliberate departure from the dispatch, flagged:** it says "author it lightly, a couple of
items at most". This is 4 grammar + 1 translation. The reason is that the diagnostic is weak
precisely *because* the time frame is usually obvious, so the only way it teaches anything is as
minimal pairs where the frame adverb is the sole variable. Four items is two pairs (`andare`:
*Da bambino* vs *Adesso*; `passare`: *è così da anni* vs *Quando abitavamo in centro*). Three
would have been an odd pair. If Architecture wants it back to two, cut the `passare` pair —
though it is the pair carrying the criterion-18 demonstration below.

The `passare` pair is also the batch's only genuine **false-credit** exposure: *passa* is a
substring of *passava* (the brief's own worked example of a rightward extension). Unanchored,
`tc_pres_imp_hab_03` would have credited a learner who typed the wrong form. Word-anchored, per
criterion 18.

### Imperfetto vs passato prossimo — wave 1, cited from the imperfect tree

| Friendly label | Grammar | Translation | CEFR target |
|---|---|---|---|
| Choosing imperfect or PP (general aspect rule) | 8 | 6 | A2-B2 |
| Sapere contrast (knew vs found out) | 5 | 3 | A2-B2 |
| Dovere contrast (was supposed to vs had to and did) | 5 | 3 | B1-B2 |
| Potere contrast (could vs managed to) | 5 | 3 | B1-B2 |
| Volere contrast (wanted to vs insisted on) | 5 | 3 | B1-B2 |
| Conoscere contrast (knew vs met) | 5 | 3 | A2-B2 |

ImperfectAuthor authored a parallel set in the same leaves (`imp_disc_*`, 37 grammar + 21
translation). Project author ruled **Pattern B** on 2026-05-28: both coexist, no retroactive
deletion. Combined coverage sits at 16-17 per modal leaf, 31 on the general leaf. **Those 37
items are 0/37 on criterion 16 and 5/37 on criterion 15** — see the thread; not this seat's file
to touch.

### The other wave-1 areas

| Friendly label | Grammar | Translation | CEFR target |
|---|---|---|---|
| Present progressive (sto parlando) vs present (parlo) | 5 | 3 | A2-B2 |
| Past progressive (stavo parlando) vs imperfetto (parlavo) | 4 | 2 | B2-C1 |
| Future for unambiguous future (parlerò) | 5 | 3 | B1-B2 |
| Present for near-future (parto domani) | 5 | 2 | B1-B2 |
| Prescriptive: subjunctive + conditional | 5 | 4 | B2-C1 |
| Colloquial: imperfetto + imperfetto | 5 | 2 | B2-C1 |
| Opinion verbs (penso che, credo che, mi sembra che) | 6 | 3 | B2-C1 |
| Emotion verbs (sono contento che, mi dispiace che) | 5 | 2 | B2-C1 |
| Hypothetical conjunctions (sebbene, benché, prima che, affinché) | 5 | 2 | B2-C1 |
| Negation triggering subjunctive (non penso che, non è vero che) | 4 | 1 | B2-C1 |
| Trapassato for completed-prior-to-prior | 5 | 2 | B2-C1 |
| Imperfetto for ongoing background | 5 | 2 | B2-C1 |

CEFR spread across all 124 grammar items: A2 17, B1 37, B2 50, C1 20.

---

## Criterion 16: how the candidate pairs were assigned

`candidate_tenses` is derived per item from the **two supplied forms**, not from the leaf name.
Three groups do not take their siblings' pair, which is worth knowing before anyone scripts over
this file:

- **Progressive leaves** tag the `stare + gerundio` periphrasis as `gerundio`, per the dispatch:
  `[present, gerundio]` and `[imperfect, gerundio]`.
- **Counterfactuals** split by compound-ness. `tc_cf_presc_01/03/04` are
  `[imperfect, condizionale]`, but `tc_cf_presc_02/05` supply *sarei venuto* / *avrebbe preso*
  and so take `[imperfect, condizionale_passato]`. All five colloquial items pair
  `[imperfect, condizionale_passato]` with `correct_tense: imperfect`.
- **Subjunctives** split the same way. Most are `[present, congiuntivo_presente]`, but
  `tc_subj_em_05` (*abbia trattato*) and `tc_subj_neg_01` (*sia arrivata*) are
  `[passato_prossimo, congiuntivo_passato]`, and `tc_subj_hyp_01/02` and `tc_subj_neg_04`
  (*facesse*, *fosse*, *parlasse*) are `[imperfect, congiuntivo_imperfetto]`.

All tags are inside the controlled vocabulary; verified programmatically.

---

## Criterion 19 (accent as morpheme): no-op on this batch, by its own carve-out

The remoto leaf looked like criterion 19's home ground — the criterion's own example is "3sg
remoto parlò against present parlo". It does not apply here, and the reason is structural rather
than incidental.

Criterion 19's test is whether the accent-stripped form is a **plausible alternative answer to
the same prompt**. In a tense-choice item the candidate set is supplied to the learner in the
prompt, and it is `{remoto, passato prossimo}`. The stripped twins of the remoto forms in this
batch — *morì* → *mori*, *sbarcò* → *sbarco*, *entrò* → *entro* — are present-tense forms, and
the present is not on the menu. So the standard fold-rescue plus orthography miss is the right
verdict, and `accent_load_bearing` stays unset. A learner who types *sbarco* for *sbarcò* has
made a spelling slip while choosing the right tense, and this topic exists to measure the choice.

This matches the verdicts NounAuthor reached (città/caffè stripped twins are not candidate
answers) and PassiveAuthor reached ("crit 19 a no-op by its own carve-out") on 2026-07-14. Worth
noting that criterion 19 may be a systematic no-op for *any* discrimination topic, for this
reason; raised in the thread.

---

## Phase 3: misconception tagging (complete 2026-07-17)

**128 guards tagged across 124/124 items; zero bare.** Marker replica re-run after tagging:
unchanged (tags are display-only).

| Misconception | Items |
|---|---|
| `discrimination.modal_stative_aspect` | 25 |
| `discrimination.indicative_for_subjunctive_choice` | 20 |
| `discrimination.remoto_register_mismatch` | 13 |
| `discrimination.future_present_mismatch` | 10 |
| `discrimination.counterfactual_construction` | 10 |
| `discrimination.trapassato_imperfect_choice` | 10 |
| `discrimination.perfect_for_durative_da` | 8 |
| `discrimination.durative_present_over_extension` | 7 |
| `discrimination.pp_for_imperfect` | 5 |
| `discrimination.progressive_overuse` | 5 |
| `discrimination.progressive_underuse` | 4 |
| `discrimination.habitual_frame_mismatch` | 4 |
| `discrimination.imperfect_for_pp` | 3 |

Six of these ids did not exist when the batch was authored. They were minted by Architecture
(thread v3) on this batch's findings:

**The registry was one-directional where this topic is two-directional.** Specifics were harvested
from `common_miss` prose, which names only each error's dominant direction; but every tense_choice
leaf pair is authored in *both* directions by design (the counterweight leaves and same-surface
opposite-answer pairs). Tagging by bucket->id would have logged the opposite of the learner's
actual error on 7 items. `imperfect_for_pp` and `progressive_underuse` were minted as **mirrors
rather than widenings** — direction is diagnostic, and a learner reaching for the imperfect at a
bounded event has a different problem from one reaching for the PP at a habitual. The rule
"**tag on the item's DIRECTION, not the bucket's id**" is now in the estate's tagging schema
thread (v5).

**The five wave-2 leaves had no specifics** because they were stubs when the registry was
harvested (2026-06-09) and so contributed no `common_miss` prose. Four ids cover them
(`perfect_for_durative_da`, `durative_present_over_extension`, `remoto_register_mismatch`,
`habitual_frame_mismatch`). `pp_for_imperfect` had been carrying the durative-da calque in its
examples under a label whose target tense was wrong; that example has moved to
`perfect_for_durative_da`.

**Remoto vs PP was a family-boundary call**, resolved to `discrimination` rather than the reserved
`register` family: the family axis classifies *what the learner got wrong* (a tense choice), not
*which cue they missed*. The `register` family's description now records that boundary with a
pointer, so an analyst finds the id from either direction.

**`habitual_frame_mismatch` carries a watch clause.** This seat argued the diagnostic was too weak
to earn an id; Architecture agreed and declined it, and Smith overruled and minted it. It is
registered with a note that its stats are watched for separability from `pp_for_imperfect` /
`imperfect_for_pp` — if they blur, it gets retired or sharpened.

---

## Periodo ipotetico — NEW integrated leaf (2026-07-21)

Dispatched `DISPATCH_periodo_ipotetico.md` after Smith's CEFR-harvest ruling that the hypothetical
period is an **integrated leaf**, not its own topic. **18 grammar MCQ + 5 translation.** The leaf
was zero-coverage; it is now the tree's second MCQ leaf.

| Type | Grammar | CEFR | Cross-credit (Rev 27) |
|---|---|---|---|
| Type 1 (real): se + present indic. → present/future/imperative | 3 | B1 | none — indicative throughout |
| Type 2 (possible): se + cong. imperfetto → condiz. presente | 5 | B1-B2 | + condizionale apodosis |
| Type 3 (impossible): se + cong. trapassato → condiz. passato | 5 | B2-C1 | + condizionale apodosis |
| Mixed (past↔present cross-pairings) | 3 | C1 | + condizionale apodosis |
| Across-type selection (given a clear meaning, pick the type) | 2 | B1-B2 | type 1 none; mixed + apodosis |

**Instrument: supplied-choice MCQ, the whole pairing is the choice** ("which pairing is correct",
per the dispatch). This tests the integrated system — both clauses at once — which a single-slot
item cannot. MCQ is index-scored, so the substring layer is inert and criterion 18 does not apply;
`candidate_forms` + `correct_form` carry the post-answer tick (criterion 16), `info_display:
suppress` per criterion 15, and supplied-choice exempts criteria 13/20 (Rev 31).

**Rev 27 cross-credit, verified in the engine.** `buildMcqResult` fires *every* markpoint as a
bucket event, so on a correct pick two markpoints at `credit: 0.5` yield item marks 1/1 and a full
correctness event on BOTH `tense_choice.periodo_ipotetico` and
`verb_form.condizionale.usage.hypothetical_apodosis` — the integrated leaf and the conditional
apodosis it evidences, no duplication. Type-1 items are single-markpoint (indicative throughout,
no conditional component). Translation items express the same cross-credit through
`required_buckets` listing both. Marker replica: 18/18 correct picks score full on every bucket,
every wrong pick a clean miss.

**Distractor discipline — the acceptability trap.** The signature distractor is *se avrei* (the
condizionale-in-the-se-clause error), the single most common learner mistake. The colloquial
imperfetto+imperfetto (*se avevo tempo, venivo*) is **never** used as a wrong distractor: it is
*acceptable* casual Italian and is owned by the wave-1 `colloquial_imperfect` leaf, so marking it
wrong would fail correct Italian. Verified programmatically that no wrong choice matches that
pattern. The existing 10 counterfactual items (`tc_cf_*`) are untouched — the integrated leaf is a
different instrument, not a re-authoring of them.

---

## Items flagged uncertain

The dispatch asks for these explicitly. Four, none blocking.

1. **`tc_rem_pp_spok_04` (text message, `siamo andati`).** Register cue says informal writing, so
   PP. A southern speaker writing to a friend might still produce *andammo* and would not be
   wrong. The item is defensible because the cue names the register, but the remoto-vs-PP split
   is regional as much as registral and this leaf's items are all standard/northern-normed. If
   the project wants a regional-variation position, this leaf is where it bites.
2. **`tc_pres_pp_da_06` (`conosco Marco da quando eravamo bambini`).** Deliberately cross-links
   the conoscere semantic shift (knew vs met) into the da-durative leaf. Unambiguous per
   criterion 10a (with `da` on the sentence, only *conosco* works), but a learner meeting it
   after the conoscere modal-discrimination items may read it as a conoscere item. I think the
   overlap teaches rather than confuses — it shows the two rules composing — but flagging.
3. **`tc_prog_pres_02` (wave 1, `Carlo lavora in banca da quindici anni`).** This is a
   **da-durative sentence sitting in the progressive leaf**. Its answer is right and its bucket
   is arguably right (the contrast on offer is *lavora* vs *sta lavorando*), but it now overlaps
   the leaf wave 2 authored. Left alone. Raised in the thread as an attribution question rather
   than fixed unilaterally.
4. **`tc_rem_pp_lit_06` (dateless novel scene).** The one item in the batch where register alone
   carries the diagnostic with no date to lean on. Kept because it is the item that stops "remoto
   = old" becoming the learner's rule, but it is the hardest item in the leaf and is tagged C1.

## Notes for the next dispatch

- **Zero-coverage leaves: none.** The tense_choice tree is complete. There is no wave 3 in the
  current tree; a wave 3 would need new buckets first.
- **`bucket_suggestions_tense_choice.json` stays empty**, now for a stronger reason than in wave
  1: all five wave-2 leaves already existed in the tree. Wave 1's three parked watch-list areas
  are resolved — passato remoto vs PP is now authored (it was parked as "out of scope for this
  dispatch's neutral/formal register"); future-perfect vs trapassato and sequence-of-tenses
  remain unbuilt and unproposed.
- **All five leaves still carry `attributes.stub: true`** in `data/buckets/tense_choice.json`.
  They are no longer stubs. Bucket edits are architecture-owned; flagged in the thread.
- **The reporting-verbs carve-out** (`sostenere che` / `suggerire che` under opinion_triggers)
  remains deferred-pending-data per Architecture's 2026-05-28 ruling. Note that `tc_subj_op_05`,
  one of the two items in question, was one of the content bugs repaired above — so any future
  miss-data analysis on that pair should treat data from before 2026-07-15 with suspicion.
- **Glossary.** `glossary_suggestions_tense_choice.json` now holds 7 entries: the 5 from wave 1
  (accepted 2026-05-28, **still not merged into `data/glossary.json` seven weeks later**) plus
  `passato remoto` and `durative` from wave 2. The glossary has no entry for `passato remoto` at
  all despite `verb_form.passato_remoto` being a live manifest topic. Chased in the thread.
