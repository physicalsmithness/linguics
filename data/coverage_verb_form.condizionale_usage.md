# Coverage: conditional, USAGE branch (wave-2 usage dispatch)

**Dispatch:** DISPATCH_usage_wave2.md (the usage axis, wave 2). Seat: ConditionalFormationAuthor (the formation author owns the usage branch too, per the dispatch).
**Date:** 2026-07-20.
**Brief:** authored against AUTHOR_BRIEF as it stands on disk (Rev 27).
**Channel (Rev 18):** this doc is the record; the ask/delivery thread is `inter_chat/Architecture_ConditionalFormationAuthor_usage_wave2.md`.

**Totals:** 23 grammar + 19 translation items across the three usage leaves. Translation is **bidirectional** (10 EN→IT, 9 IT→EN), because the usage leaves are `direction: bidirectional` (unlike the formation branch, which was production-only). Three grammar items carry a second markpoint (two are essere participle-agreement, one is a Rev 27 cross-credit to tense_choice); one translation item cross-credits tense_choice.

## The diagnostic distinction from formation

The formation branch tested *building* the conditional. This branch tests *choosing* it and knowing what it conveys, so the load-bearing `must_not_include` on most items is a **rival construction**, not a misspelling: the blunt present against the polite conditional (voglio vs vorrei), the simple future/conditional against the compound conditional in reported speech (verrà/verrebbe vs sarebbe venuto), the present/future against the conditional in an unreal apodosis. Formation slips (single-r, single-b, theme vowel) are kept as secondary guards where cheap, but the primary diagnostic is the functional choice.

## Coverage by leaf

| Leaf | CEFR | G | T | What it teaches |
|---|---|--:|--:|---|
| `usage.polite` | A2 core (heaviest) | 10 | 7 | The softening conditional: vorrei/potresti/potrebbe/mi piacerebbe/dovresti (advice)/ti dispiacerebbe/gradirebbe. Diagnostic: choose the conditional over the blunt present. |
| `usage.reported_future_in_past` | B1-B2 | 6 | 6 | The compound conditional where English keeps "would": sarebbe venuto, avrebbe telefonato. Diagnostic: compound conditional, not simple future/conditional, after a past reporting verb. |
| `usage.hypothetical_apodosis` | B2 | 7 | 6 | The conditional as the result-clause form of a se+congiuntivo period (present-unreal → simple conditional; past-unreal → compound). |

CEFR spread: grammar 3×A2, 7×B1, 13×B2; translation weighted B1-B2 with the polite leaf carrying the A2/B1 items. The polite leaf is heaviest, as the dispatch directed ("high frequency; the most useful thing here").

## The boundary with tense_choice (held, and where it is crossed on purpose)

The dispatch's important boundary: `tense_choice.conditional_vs_imperfect_counterfactual` owns the colloquial-vs-prescriptive **choice** (se avevo/se avessi); my `hypothetical_apodosis` owns "the conditional is the form the result clause takes" — the function, not the choice. So the apodosis items **supply** the protasis and test producing the conditional in the main clause; they do not pivot on picking one construction over another.

Where an item legitimately evidences **both** the apodosis function and the standard-over-colloquial choice (rejecting the colloquial imperfect superavamo/potevamo/compravo as well as producing the conditional), I applied the Rev 27 cross-credit: a second markpoint on `tense_choice...prescriptive_conditional`, weighted so the two credits sum to 1 (item mark stays 1/1, both bucket events record full correctness). Three items do this: grammar `cond_use_apo_comprare_1sg_01` (0.6/0.4) and `cond_use_apo_potere_1pl_01` (0.6/0.4), and translation `trans_cond_use_apo_en_it_02`. The choice bucket never appears alone; it is always a co-credit alongside the usage leaf (verified). A purely "choose tense X over Y" item with no standalone function would be a tense_choice item and is not authored here.

## Cross-references into other trees

- **Reported future-in-the-past** reuses the passato-prossimo participle-agreement machinery for essere verbs: `cond_use_rfp_partire_3sg_fem_01` (grammar) and `trans_cond_use_rfp_en_it_02` (translation) carry a second markpoint / required bucket on `...participle_agreement.with_essere.feminine_singular`, with the essere-motion auxiliary as an optional bucket. This mirrors how the formation compound items cited the PP tree.
- The reported-future items deliberately overlap the compound-conditional *formation* leaf conceptually (building sarebbe venuto), but I kept the markpoint on the usage leaf, because the formation is already tested in the formation batch; here the diagnostic is the construction choice. Flagged as a judgement call below.

## The four pre-existing citations now have live homes

The imperfect batch's four citations into these leaves (`trans_imp_en_it_use_pol_01/02`, `_isp_int_01`, `_st_cc_01`), and the reported-speech batch's citation, were forward-references into stubs. With this batch the leaves carry real items, so Architecture can clear the `stub: true` flag on acceptance. No re-pointing needed; those citations already target the correct leaf ids.

## Items flagged uncertain (for the project author to rule on)

> Carried in the delivery thread per Rev 18.

1. **Reported-future items credit the usage leaf, not the formation leaf.** Each reported-future item both builds the compound conditional and chooses it as the reported-future construction. I put the single markpoint on `usage.reported_future_in_past` (the choice), since formation is covered in the formation batch. Under Rev 27 I could instead dual-credit the formation `condizionale_passato` leaf on every one. I judged that redundant (it would re-credit a skill already saturated), but flag it: if you want the formation mastery signal reinforced from usage contexts, I will add the second markpoint.
2. **The apodosis leaf spans present- and past-unreal.** I authored both the present-unreal apodosis (simple conditional, verrei) and the past-unreal apodosis (compound conditional, sarei venuto / avrebbe superato) under the one leaf, since both are "the form the apodosis takes". Confirm you want them together rather than split.
3. **Grammar-item register cues.** The two cross-credit apodosis items state "in stile scritto standard" in the prompt (criterion 11), because the standard-vs-colloquial contrast is register-conditional. Confirm that framing is right, or I soften it.
4. **`espresso`, `idea` vocab buckets** are forward-referenced (as with all vocab buckets); they will resolve when the vocab taxonomy pass runs.

## Notes for later dispatches / seats

- **TenseChoice** still owns `conditional_vs_imperfect_counterfactual` as its own contrast items (the choice as the primary skill). This batch only co-credits that bucket where a usage item also evidences the choice; it does not author standalone choice items.
- **MisconceptionAnalyst**: the rival-construction misses here (blunt present for polite; simple future/conditional for reported-future; present/future for apodosis) are a clean discrimination-error population on the usage axis, distinct from the formation misspellings.
