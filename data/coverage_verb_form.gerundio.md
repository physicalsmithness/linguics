# Coverage: gerund, formation branch

**Dispatch:** GerundioFormation (formation branch only; the adverbial-usage and progressive-vs-simple branches are left as stubs for the GerundioUsage and TenseChoice dispatches).
**Author:** GerundioFormationAuthor
**Date:** 2026-06-09
**Brief revision applied:** authored against AUTHOR_BRIEF Rev 9 (the revision the dispatch supplied); **reconciled to Rev 19 on 2026-07-15**. See the reconciliation section below and `inter_chat/Architecture_GerundioAuthor_batch_delivery.md` (OPEN) for the asks arising, per Rev 18.

**Totals:** 35 grammar questions + 14 translation items (EN→IT only), of which **21 grammar items carry `info_display: "suppress"`** (see chip-suppression section). Every active formation leaf is covered; no zero-coverage leaves. The usage and discrimination branches were left untouched (they are stubs owned by GerundioUsage and TenseChoice). No new buckets were needed, so `bucket_suggestions_verb_form.gerundio.json` is empty. Two glossary terms are proposed (the progressive, and the compound gerund).

All translation items are EN→IT, because the formation buckets are `direction: "production"`: a formation bucket only fires when the learner *produces* the Italian form. English's progressive ("I am reading") maps straight onto the present progressive, which makes EN→IT the natural fit for this tree, and the bulk of the translation items exercise the progressive build.

---

## Coverage by leaf

The "G items" column counts grammar questions whose primary subtopic is the leaf; "G markpoints" counts grammar markpoints landing on the leaf; "T required" counts translation items naming it as a required bucket. Friendly labels below; the engine id is `verb_form.gerundio.formation.<short>`.

| G items | G markpoints | T required | Leaf | What it tests |
|--:|--:|--:|---|---|
| 6 | 10 | 4 | -are gerund (-ando) | The -are → -ando rule; the cross-class -endo slip (mangendo); the -iare verbs keeping their i (studiando). Markpoints exceed items because the progressive items' gerund markpoint lands here |
| 8 | 13 | 5 | -ere/-ire gerund (-endo) *(hot)* | One ending for two classes; the -ire = -endo economy (dormendo); the -isc- verbs dropping the -isc- (capendo, not capiscendo); the no -iendo guard |
| 7 | 8 | 4 | Stem-expansion irregulars *(hot)* | facendo, dicendo, bevendo, ponendo, traducendo (built on the Latin stem, cross-referenced to the imperfect); essendo / avendo as regular; the short-infinitive miss (farendo) |
| 10 | 10 | 12 | Progressive: stare + gerund *(hot)* | The stare form for the person and tense (markpoint A of each progressive item); the essere-for-stare slip; the wrong person; the wrong tense |
| 4 | 4 | 2 | Compound gerund (gerundio passato) | The avendo / essendo auxiliary choice (markpoint A of each compound item); participle form and agreement are markpoint B, cross-referenced to the passato prossimo |

**Totals: 35 grammar items carrying 49 markpoints, and 14 translation items.** The progressive and compound items are two-markpoint (stare / gerund, and auxiliary / participle respectively), which is why the markpoint column exceeds the item column on the three gerund-formation leaves.

**Cross-tree markpoints (compound-gerund participle):** four grammar markpoints and two translation required-buckets fire passato-prossimo buckets as the second skill in the compound gerund: the feminine-singular essere agreement (essendo andata / essendo partita), the masculine-plural essere agreement (essendo partiti), and the regular participle forms (finito on the ire→ito leaf, mangiato on the are→ato leaf, kept invariable under avere). All cross-referenced PP buckets were confirmed to exist in `data/buckets/verb_form.passato_prossimo.json` before use.

**CEFR spread (item target level):** grammar 21 × A2, 11 × B1, 3 × B2; translation 6 × A2, 7 × B1, 1 × B2. This follows the dispatch steer and the tree's `cefr_importance`: the regular gerund and the present progressive are A2-core and carry the weight; the stem-expansion irregulars and the past progressive sit at A2-B1; the future/conditional progressive and the compound gerund are B1-B2 and lighter.

### How the hot spots were weighted

- **The -ando / -endo split is the core regular skill**, so the two regular leaves together carry 14 grammar items. The -are items reject the cross-class ending (mangendo, lavorendo); the -ere/-ire items reject the reverse (prendando) and, on the -isc- verbs, the carried-over -isc- (capiscendo, finiscendo, preferiscendo) and the spurious -iendo. The teaching is the contrast: -are gives -ando, everything else gives -endo, and the explanations on both sides point at it.
- **The -ire = -endo economy** is made explicit: dormire and partire (plain -ire) and capire, finire, preferire (-isc- verbs) all land on -endo, so the learner sees that one ending covers the whole second-and-third conjugation and that the present's -isc- never travels into the gerund.
- **The stem-expansion irregulars are tied to the imperfect throughout.** Every irregular explanation names the shared stem (facendo / facevo, dicendo / dicevo, bevendo / bevevo, traducendo / traducevo, ponendo / ponevo). The signature miss, building from the contracted infinitive (farendo, berendo), sits in `must_not_include`. essere and avere are included here because of their company, but the explanations flag that they are actually regular (essendo, avendo) and high-value, since they open both the compound gerund and the essere half of the progressive.
- **The progressive carries the most translation weight** (12 of 14 items name it) because it is the dispatch's headline construction and the natural EN→IT vehicle. Present progressive dominates (A2), with two past-progressive items (B1) and the future progressive held to one grammar item (B2).

---

## Marker mechanics: how the progressive items are scored (the biggest call in this batch)

Before authoring, I read `housing/js/grammar_engine.js` and `housing/js/norm.js` to pin down two engine behaviours that shaped the progressive items:

1. **`any_phrases` is checked before `must_not_include`.** A positive substring match wins; `must_not_include` is only consulted when nothing positive (and nothing accent-folded) matches. So a forbidden form listed in `must_not_include` never fires if any accepted phrase is also a substring of the answer.

2. **Normalisation collapses and trims whitespace.** `norm()` runs `\s+ → " "` and `.trim()`, so a trailing-space trick like `"sto "` reduces to `"sto"`. That matters because the 3sg stare form `sta` is a substring of `stai`, `stava`, `stavo` and `stanno`: a bare-`sta` sub-match would wrongly credit the wrong person.

**Superseded on 2026-07-15 by per-phrase `match_at`.** The original Rev 9 delivery drew the conclusion that a stare-only sub-match was unreliable (point 2 above: `sta` is a substring of `stai` / `stava` / `stanno`), and therefore collapsed each progressive item to ONE markpoint on the progressive-assembly leaf matching the full phrase. Word-boundary anchoring shipped on 2026-07-13 (`{"phrase": "sta", "match_at": "word"}`, honoured on positives, the accent-folded fallback and `must_not_include`), which removes the constraint entirely.

Each progressive item is therefore now **two markpoints**, the split the dispatch originally asked for and criterion 8 prefers:

- **Markpoint A — the stare form**, on the progressive-assembly leaf, anchored (`{"phrase":"sto","match_at":"word"}`). Catches the wrong person, the wrong tense, and the essere-for-stare slip (`sono` / `è` / `ero` + gerund), each anchored in `must_not_include`.
- **Markpoint B — the gerund**, on its own formation leaf (-ando / -endo / irregular), anchored. Catches the infinitive pairing (`sto leggere`) and the cross-class ending.

This yields the decomposition the tree wants. Verified against a port of the shipped engine across 22 scenarios: `sto leggendo` → 2/2; `stai mangiando` → A miss, B hit (gerund right, stare person wrong); `sta mangiare` → A hit, B miss (stare right, no gerund); `è mangiando` → A miss, B hit; `sta farendo` → A hit, B miss. Marks on these 10 items are 2.

Note the one attribution consequence: the tree files the infinitive-pairing under the progressive leaf's `common_miss`, but under the split it surfaces as a **gerund-formation** miss (markpoint B), because the learner's stare form is in fact correct. I think that is the better reading and have kept it; flagged in the delivery thread in case Architecture disagrees.

The **compound-gerund items are split** (two markpoints), because there the two skills *are* cleanly separable by substring: `avendo` and `essendo` are distinctive whole words, so markpoint A (auxiliary choice, on the gerundio-passato leaf) and markpoint B (participle form / agreement, cross-referenced to the passato prossimo) fire independently. A learner who writes `essendo andato` for a feminine subject hits A (auxiliary right) and misses B (agreement wrong), which is the diagnostic split we want.

**Accent forms are tolerated, not hard-rejected.** The engine has an accent-folded fallback that credits a right-but-unaccented answer and records a separate orthography slip. So `staro` for `starò`, or `sta` typed for an accented form, is treated as a spelling slip rather than a hard miss. I leaned on this rather than fighting it (the same assumption the future and present trees already ship on); the explanations still teach the accent.

---

## Chip suppression (`info_display: "suppress"`)

Applying criterion 15 (Rev 8) with the leak-vs-trap test:

**21 grammar items suppressed**, by leaf:

- **-are gerund (6), -ere/-ire gerund (8), stem-expansion irregulars (7)** — all suppressed. For the regular leaves, the breadcrumb label spells out the output ending (-ando / -endo), which *is* the skill (choosing the right ending), and its canonical examples model the stem-plus-ending operation, including for the -isc- verbs (the dormendo example hands over by analogy that -ire just adds -endo). For the irregulars, the breadcrumb names a stem class the contracted infinitive does not reveal (facendo from fare). Both are leaks, so suppressed.

**The 14 visible items:** all 10 progressive-assembly items and all 4 compound-gerund items. These breadcrumbs describe a *construction* (stare + gerund; avendo/essendo + participle) that the prompt's own framing already establishes (the prompt says "al presente progressivo", "il gerundio passato"), so the breadcrumb restates the cue rather than handing over a hidden class. I also avoided using `parlare` as the tested verb on any progressive item, so the breadcrumb's canonical example (`sto parlando`) never coincides with an item's answer.

---

## Cue economy (Rev 9) and output-form naming

Per criterion 13's cue-economy note, the cue parenthetical names the person only when the prompt does not already supply the subject. Items with an explicit subject (i bambini, la nonna, Maria, i ragazzi, lei, Tu) drop the person and cue the verb alone, e.g. `(giocare)`, `(fare)`, `(andare)`. Items with a pro-dropped subject keep the person, e.g. `(leggere, io)`, `(dormire, tu)`, `(mangiare, lui)`.

The progressive prompts name the **output form** ("Completa al presente progressivo", "al passato progressivo", "al progressivo futuro"). This is deliberate and, I think, required: choosing *whether* to use the progressive is discrimination, which is out of scope for this dispatch, so the item must hand the learner the construction-to-produce and test only whether they can assemble it. Naming the output form is sanctioned by criterion 5; the load-bearing rule (stare + gerund, and which stare form) is left for the learner to apply, so the diagnostic is intact. Flagging it here because "progressivo" is a near-technical term sitting in a prompt rather than an explanation (criterion 12); if you'd rather it were softened, the alternative is a context cue ("In questo preciso istante…") that risks tipping the item toward discrimination.

---

## Items flagged uncertain (for the project author to rule on)

1. **RESOLVED 2026-07-15 — the progressive items are now split into two markpoints.** The engine limitation that forced the single-markpoint design no longer exists (`match_at` shipped 2026-07-13). The stare/gerund split the dispatch asked for is in place and verified. Nothing outstanding.

2. **The infinitive-pairing miss (sto leggere) now files under the gerund leaf, not the progressive leaf.** Under the split, `sto leggere` credits markpoint A (the stare form IS correct) and misses markpoint B (no gerund produced). That contradicts the tree's `common_miss` text for the progressive leaf, which lists the infinitive pairing there. I judge the split's attribution to be the truer one (the learner's error is that they did not form a gerund, not that they mis-assembled stare), but it is a live disagreement with the tree's own annotation — ruling welcome. Raised as an ask in the delivery thread.

3. **Five content bugs found and fixed when criterion 17 was applied.** Writing the completed sentence out in English exposed errors no substring audit could reach, the worst being `ger_ando_mangiare_01`, whose prompt required `mentre` + gerund ("Sto pensando a te mentre mangiando la cena"), which is ungrammatical — `mentre` takes a finite verb. Also fixed: a forced bad word order (avendo mangiato già → avendo già mangiato), a bad collocation (ponendo un esempio → ponendo una domanda), a tautology (Parla nel sonno dormendo), and two awkward gerund clauses. Recorded here because it argues for criterion 17 being retro-applied to older batches rather than only "on next touch".

3. **essere / avere gerund placement.** essendo and avendo are authored under the stem-expansion irregular leaf (the tree lists them there), even though they are morphologically regular on their own stems. The explanations say as much. No change proposed, but flagging since a reviewer might expect them under "regular".

4. **Accent guards are soft.** Because the engine tolerates accent slips (folded fallback), the bare forms (staro, sta-for-stà) are credited-with-an-orthography-flag, not rejected. Same shared assumption the future tree flagged. No action needed unless the accent-normalisation policy is under review.

5. **Plain-present references in progressive translation items.** Several progressive items accept the plain present (giocano, dorme, dice) as a valid alternative reference, because Italian genuinely prefers it in many of these contexts. The AI marker should credit it, but it will not fire the progressive bucket. I marked these as neutral references, not negative; tell me if you'd rather such answers be nudged toward the progressive for this formation-focused tree.

---

## Notes for later dispatches and the architect

- **GerundioUsage** (the `verb_form.gerundio.usage` stub) will own the adverbial gerund: manner / means / time / cause / condition (camminando, by/while walking; sbagliando si impara), and the same-subject constraint (the gerund's implicit subject must match the main clause). None authored here. The compound gerund's *meaning* (anteriority) is touched only as far as needed to build the form; its discourse use is usage territory.
- **TenseChoice** owns the discrimination stub (`verb_form.gerundio.discrimination.vs_simple_present`), the progressive-vs-plain-present choice, mirroring the tense_choice tree's progressive_vs_simple. The stub exists so cross-tree citations resolve; not authored here. My progressive items deliberately hand the learner the progressive rather than asking them to choose it, to stay clear of this boundary.
- **Cross-tree stems.** The stem-expansion irregulars share their stem with the imperfect (facendo / facevo). Worth sequencing the gerund's irregular leaf after the imperfect's stem-expansion leaf so the parallel can be taught as recognition rather than new learning. Same five verbs on both sides (fare, dire, bere, porre, tradurre).
- **Architect / housing — DONE.** The dispatch's flag that `verb_form.gerundio` was missing from `VERBS_CURRICULUM_ORDER` has been resolved: `inter_chat/Architecture_Housing_curriculum_order_new_trees.md` is CLOSED (2026-07-09), and housing shipped the full 11-id order with gerundio at position 10 (after passato_remoto, before tense_choice, grouped with the non-finite forms). One open **user** decision remains on that thread: the architect placed the gerund late despite it being A2 and pairing with the present progressive, and offered Smith a one-line reorder to slot it earlier. Not an author call; noted here so it stays visible.
- **Breadcrumb-label over-specification (parallels the open PluperfectAuthor thread).** The 21 suppressions in this batch exist because the regular / irregular leaf labels embed worked examples (`-are gerund: -ando (parlando, mangiando, lavorando)`, `Stem-expansion irregulars: facendo, dicendo, bevendo, ponendo, traducendo`). This is the same over-specification PluperfectAuthor raised for the trapassato labels in `inter_chat/Architecture_PluperfectAuthor_breadcrumb_label_leak.md` (OPEN), where the recommended fix is to shorten the labels at source and let `description` carry the worked detail, rather than per-item suppression. If the architect adopts shorten-at-source project-wide, the gerundio labels qualify identically and these 21 `info_display: "suppress"` flags should be dropped. The labels are the architect's artefact, so no edit is made here; flagged for the same ruling to cover gerundio.
- **Pending glossary dependency.** The explanations use "stem expansion" and "gerund", both of which already exist in `data/glossary.json`, and "passato prossimo", "auxiliary", "past participle", "participle agreement" for the compound gerund, also all present. The two terms I propose ("progressive", "compound gerund") are the only new ones.
