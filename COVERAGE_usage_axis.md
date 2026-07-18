# Coverage of the USAGE axis across the verb tenses (2026-07-17)

Triggered by Smith: *"we dispatched present usage, so does that not lead to an imbalance? I don't know if we've got the coverage we have with tense_choice."* Mapped from disk. He is right; here is the precise shape.

## The three-axis model (what a verb tense can be tested on)

1. **formation** — how to BUILD the form. Every tense has this.
2. **usage** — what the single tense DOES (its functions), no contrast.
3. **discrimination** — CHOOSING between competing tenses. Superseded wholesale into `tense_choice` (2026-07-17); no verb tree owns it any more.

## The map (grammar items whose primary markpoint is in each branch)

| tense | formation leaves | usage: leaves / items |
|---|---|---|
| present_indicative | 16 | **4 / 12** authored |
| imperfect | 9 | **6 / 31** authored |
| condizionale | 10 | 3 / **0** (leaves defined, empty; stub) |
| passato_prossimo | — | none |
| trapassato_prossimo | 2 | none |
| passato_remoto | 6 | none |
| future | 10 | none |
| congiuntivo | 10 | none |
| gerundio | 5 | none |
| imperativo | 4 | none |

**Two tenses have their functions taught; eight do not.** That is the imbalance.

## But the gap is NOT "8 missing usage branches". It is precise and short.

The key test: **`tense_choice` covers a function whenever that function has a CONTRAST partner.** So a usage branch only earns its existence for functions with NO contrast partner — the things `tense_choice` structurally cannot hold. Triaging the eight on that test:

**REAL GAPS — a function with no home in tense_choice (3, high value):**
- **`future.usage`** — future of probability (*saranno le tre* = "it must be three"): the future expressing PRESENT conjecture. Not "future vs X"; it has no contrast partner. Glossary already carries the term. B1.
- **`gerundio.usage`** — adverbial/modal gerund (*sbagliando s'impara*; *è uscito sbattendo la porta*): subordination. `tense_choice.progressive_vs_simple` owns the progressive; this is the other, unowned half.
- **`condizionale.usage`** — politeness (*vorrei*, *potresti* — **A2 core, high frequency**), reported future-in-past (*disse che sarebbe venuto*). Leaves already defined, 0 items. The politeness function has no contrast partner and is among the most useful things a learner produces.

**THIN — judgement (2):**
- `imperativo.usage` — pragmatics (softening, sequences). Some real content; formation already teaches the forms.
- `congiuntivo.usage` — the trigger-choice is `tense_choice.indicative_vs_subjunctive` (4 leaves). Only the independent/exhortative (*che venga!*, *magari fosse!*) is left. Thin but non-empty.

**EMPTY BY RIGHT — supersede like their discrimination siblings (3):**
- `passato_remoto.usage` — remoto's use is literary narration = `tense_choice.passato_remoto_vs_passato_prossimo.narrative_literary`.
- `trapassato_prossimo.usage` — prior-to-prior = `tense_choice.trapassato_vs_imperfect`.
- `passato_prossimo.usage` — completed-with-present-relevance lives in the present/remoto contrasts. No standalone function.

## The sharp finding

**The two usage branches we BUILT (present, imperfect) are the ones whose functions have the richest contrast partners in tense_choice** — i.e. the most also-covered-elsewhere. **The functions we did NOT build (future of probability, adverbial gerund, conditional politeness) are exactly the ones with no contrast partner — the only things a usage branch can teach that tense_choice cannot.** The estate built the most-redundant slice of the axis and skipped the gap-filling slice. That is the imbalance, stated exactly.

## Answer to Smith's question

**Does tense_choice give us the coverage?** For CONTRASTS, yes — completely, 17 leaves, 185 items. What it structurally cannot cover is the non-contrast functions, and there are only **three high-value ones** unbuilt (future of probability, adverbial gerund, conditional politeness). Not a systemic hole; a short, nameable list — and each belongs to an author who already owns that tense's formation tree, so none needs a new seat.

## EXECUTED 2026-07-17 (Smith: "a or b... why not do the thin ones now too?")

Smith ruled the full build, including the two I had called thin — correctly, because they are not empty, only smaller, and I had under-rated congiuntivo especially.

**Superseded (empty by right):** `passato_remoto.usage`, `trapassato_prossimo.usage`. `passato_prossimo` gets no usage branch.

**Defined and dispatched (DISPATCH_usage_wave2.md), to the existing formation owners:**
- future.usage: probability / command_promise / temporal_subordinate (3)
- gerundio.usage: modal_means / temporal_causal (2)
- condizionale.usage: polite / reported_future_in_past / hypothetical_apodosis (3, leaves pre-existed)
- congiuntivo.usage: independent_exhortative / optative_wish / fixed_concessive (3)
- imperativo.usage: pragmatic_softening (1, deliberately the only one) + the tu/Lei register leaf

**On "why not the thin ones now":** agreed, and the reason I hedged was overlap-risk, not emptiness — imperativo.usage could have duplicated present.usage.instructions, congiuntivo.usage could have been mistaken for the trigger-choice. The fix for overlap-risk is drawing the boundary at dispatch, which every leaf above now carries, not deferral. Congiuntivo's independent subjunctive turned out to be the cleanest of all five: no trigger reaches it, so tense_choice structurally cannot own it. Doing them together also stops them sitting in the ambiguous stub state that caused the phantom-stub confusion in the first place.
