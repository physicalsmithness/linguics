# Coverage: Pronominal verbs (topic short `pv`)

Authored by the PronominalVerbsAuthor chat, 2026-07-14, against AUTHOR_BRIEF Revision 14 and DISPATCH_pronominal_verbs.md (with its Rev-13 addendum and OIC idea bank).

**Delivered:** 46 grammar questions, 20 translation items, 3 glossary suggestions, 1 bucket suggestion. All pass the local validator (JSON well-formed; external_id unique and non-colliding with disk; marks = sum of credit; every cited bucket resolves in the live tree or the proposal file; no rule-name leaks in prompts; no `any_phrase` sitting inside its own `must_not` guard).

## Overlap audit (the gate the dispatch required)

Ran before authoring, against the pronoun tree and passato-prossimo tree on disk. Findings:

- Every clitic-mechanic bucket the dispatch told me to cite exists and is cited, not duplicated: *ne in motion expressions* (`pronoun.ne.motion_andarsene`), *Idiomatic pronominal verbs with ne* (`pronoun.ne.pronominal_idiomatic_verbs`), *Idiomatic verbs with built-in ci* and its *farcela* leaf, *Combined pronouns* and its *vowel-change* child, and *Reflexive plus an object pronoun*. The validator confirms all eight cross-tree ids resolve.
- **The one real gap: there is no dedicated "ce l'ho / possession" bucket anywhere in the pronoun tree.** The DRAFT notes asked me to check whether one exists to cite or yield to. It does not — `avercela` is listed only under *Idiomatic verbs with built-in ci* (the "have it in for" sense), and the *Combined pronouns* children cover glielo and me-ne, not ce-l'ho possession. So my **Ce l'ho: the have-it answer** leaf stands as the learner-facing home, and its clitic mechanics cite the general *Combined pronouns* bucket. See the flags section: this may warrant a mechanics leaf on the pronoun side, which is an architecture call I did not make.
- No `pv_` / `trans_pv_` external_id collisions on disk.

## Bucket-to-item-count table

| Leaf (friendly label) | CEFR at target | Grammar | Translation |
|---|---|---|---|
| -sela verbs: me la cavo, ce l'ho fatta | B1/B2 core | 9 | 4 |
| -sene verbs: me ne vado | B1/B2 core | 8 | 4 |
| Ci verbs: ci vuole, ci metto, ce l'ho | B1/B2 core | 9 | 3 |
| The core set, recognised | B1/B2 core | 8 | 4 |
| Volerci or metterci? | B1/B2 core | 6 | 4 |
| Ce l'ho: the have-it answer | A2/B1 core | 6 | 2 |
| **Total** | | **46** | **20** |

(Translation counts tally each item under every own-tree leaf in its `required_buckets`, so the cross-leaf items — e.g. the farcela+andarsene pairing — count under both and the column sums exceed 20.)

CEFR spread: grammar B1 29 / B2 11 / A2 3 / C1 3; translation B1 12 / B2 7 / A2 1. Weighted to B1 as the topic's core band, with A2 only on the high-frequency *ce l'ho* answers and C1 reserved for the participle-asymmetry, shell-discrimination and frozen-tail items.

## Design decisions I made (flag anything you'd have called differently)

1. **Breadcrumb suppression on 38 of 46 items.** All three mechanics leaves, *Volerci or metterci?*, and *Ce l'ho* are suppressed (`info_display: "suppress"`). Reason: those leaf labels embed worked examples (e.g. "me la cavo, ce l'ho fatta" is literally in the label), so the pre-answer breadcrumb would hand over the surface answer — the Rev-12 concern. *Volerci or metterci?* is additionally a discrimination contrast (Rev-10). Only *The core set, recognised* stays visible, because its label names no form. Note: an alternative to per-item suppress is shortening the leaf labels (Rev 12), but the labels are architecture-owned, so I suppressed rather than edit them.
2. **Cross-tree citation by markpoint decomposition (9 items, marks = 2).** Where a clitic mechanic is the diagnostic, I split the answer into two markpoints: the cluster on the pronoun tree (vowel shift, reflexive+object, or the frozen cluster) and the verb body or agreement on my leaf. A learner who writes "mi ne vado" then loses the cluster mark but keeps the verb mark, so the miss lands on the right bucket. This is the intended cite-alongside contract and criterion 8 in one move.
3. **Recognition via MCQ (8 core-set items).** The core set is recognition-first and the grammar engine is a substring marker, so free-text English answers would mark badly. I used `type: "mcq"` with the distractors built from the literal-reading traps (`ce l'ha con me` → "he has it for me", etc.), and mirrored the correct option into a markpoint so the bucket still attributes. One item runs en→it to exercise the leaf's bidirectionality both ways.
4. **`prompt_supplies_base_form`.** True on the mechanics items (they give the verb in citation form, e.g. "(cavarsela)"), false on the discrimination and shell items, which deliberately withhold the verb so that picking volerci-vs-metterci or the right -sene/-sela shell stays the test.
5. **farcela split across two leaves.** Its past "ce l'ho fatta" sits under *-sela verbs* (the frozen-feminine participle is the point); its present "ce la faccio" I bucketed under *Ci verbs*. Reasonable but a judgement call — flag if you'd rather both live in one place.

## Items I'd flag as uncertain

- **`pv_celho_03`** ("Ce l'hai il passaporto?") uses the colloquial left-dislocation ("ce l'hai + noun"). It's ubiquitous in speech and I state the register in the explanation, but confirm you want spoken-register dislocation in an A2/B1 item.
- **The discrimination items disambiguate by English gloss**, not by naming the verb (naming both verbs would leak the choice, by analogy with tense_choice hiding its candidate tenses). If you'd rather these carry a candidate-set field like criterion 16's `candidate_tenses`, that field is tense-specific today and doesn't fit a verb-choice; say the word and I'll propose an analogue.
- **`register: "casual"`** on the two fregarsene items — flagged in-item; not vulgar, but confirm it's within scope for B2.
- **MCQ marking**: I assumed the housing marks MCQ by `answer_index` and treats the mirrored `any_phrases` as harmless bucket-attribution backup. If the engine instead marks MCQ through the markpoint, these still work; confirm.

## Misconception-axis candidates (for the Misconception Analyst, not authored here)

Per stay-in-role I flag rather than author `misconception_suggestions`. The rich seam in this topic: `ce l'ho fatto` (frozen-feminine miss); `mi ne vado` / `ci ne andiamo` (unshifted reflexive vowel); `ci l'ho` for `ce l'ho`; `ci vuole due ore` (volerci left singular on a plural requirement); the volerci↔metterci frame swap; `ce l'ho` used for a plural thing (should be `ce li/le ho`); and literal readings of `ce l'ha con me`. The `must_not_include` guards already localise most of these; they'd bind cleanly to discrimination-style misconception tags.

## Flags for architecture (largest first)

1. **No pronoun-tree home for the *ce l'ho possession* mechanics.** My leaf owns the meaning and cites *Combined pronouns* for the clitics. If you want the possession-ce mechanics to have their own pronoun-side leaf (parallel to how andarsene's mechanics live under *ne in motion expressions*), that's a bucket you'd place. I did not create it.
2. **Bucket suggestion: "Idioms with an obligatory frozen tail"** (`pronominal_verbs.meaning.frozen_tail_idioms`) — mettercela tutta, darsela a gambe, legarsela al dito, tirarla per le lunghe. One item (`pv_adv_frozentail_01`) is currently parked on *-sela verbs*. Proposed under my own tree in `bucket_suggestions_pronominal_verbs.json`; a proper pass would fill it. Not created.
3. **Leaf labels embed worked examples**, which is why suppression is so heavy here. If the Rev-12 "terse label" cleanup reaches these six leaves, several items could drop the suppress flag.

## Notes for the next dispatch

Coverage feels honest for the six active leaves: every rule is hit from multiple angles — the -sela frozen-feminine participle across avere (`ce l'ho fatta`), reflexive-essere (`se l'è cavata`), and a plural-subject clash (`se la sono goduta`); the -sene vowel shift across mi/ci and the essere+subject-agreement contrast; volerci agreement in present and past against metterci's personal frame. The unbuilt seams are the frozen-tail idioms (flag 2) and a wider avercela/volerne-a near-synonym set (C1), both C1-and-up and safely deferrable.

## Post-write note: manifest registration

First content for this topic has now landed (`grammar_questions_pronominal_verbs.json`, `translation_items_pronominal_verbs.json`), so by the standing ruling the topic name `pronominal_verbs` now qualifies to enter `data/manifest.json`. I have not edited the manifest — it is architecture-owned loader config, and several sibling topics whose content also landed today (piacere, present_usage, ...) are likewise not yet registered, so this reads as a batched commit-time action. Flagging for whoever runs the commit.

---

## Addendum: frozen-tail idioms pass (2026-07-18, commissioned by Smith)

Smith commissioned the flag-2 seam. Delivered: **10 new grammar (`pv_ft_*`) + 3 translation**, plus `pv_adv_frozentail_01` **re-homed** off *-sela verbs* onto the new leaf (external_id kept per §2, version bumped to 2). Topic totals now **56 grammar / 23 translation**.

| Leaf (friendly label) | CEFR at target | Grammar | Translation |
|---|---|---|---|
| Frozen-tail idioms | C1 core | 11 | 3 |

Idioms covered, each as tail-supply and (where it earns it) stem/auxiliary: mettercela tutta; darsela a gambe (tail + essere-auxiliary + frozen feminine *data*); legarsela al dito; tirarla per le lunghe (tail + stem); dirne di tutti i colori (tail + ne-participle agreement); buttarla sul tragico; farla finita.

**Design decisions on this pass:**

1. **Terse leaf label ("Frozen-tail idioms"), so these 11 items carry NO `info_display: suppress`** — unlike the 38 suppressed elsewhere in this topic. My own original proposal embedded the worked example in the label, the exact Rev-12 anti-pattern I flagged on the other six leaves; fixed before authoring. Naming the class leaks nothing; the specific tail is what's tested.
2. **Bracketed English glosses throughout (criterion 20)**, including converting the re-homed item's Italian gloss "(impegnarsi al massimo)" to "[to give it your all]" on the touch.
3. **Word-anchoring on 12 phrases (criterion 18)** where the target embeds in a plausible wrong attempt: `la tira` inside `la tirava`, `ce la mette` inside `ce la metteva`, `tutta` inside `tuttavia`. `a gambe` is anchored yet still accepts the standard variant `a gambe levate`.
4. **`pv_ft_dirne_02` cites `pronoun.ne.with_pp_agreement`, not this tree**, per the cite-not-duplicate contract: the tested skill is the pronoun tree's. Tail coverage for dirne sits on `pv_ft_dirne_01`.
5. **Cues name stems only, never tails** — `pv_ft_farla_01` cues `(farla)`, never `(farla finita)`, or the cue would hand over the answer.

**Status: the leaf is FORWARD-REFERENCED and awaits Architecture ratification** (brief §2 permits this at authoring; production load strict-rejects until the bucket exists). Contract thread: `inter_chat/Architecture_PronominalVerbsAuthor_frozen_tail_idioms.md`. Re-validated fold-aware: 0 errors, 0 dead guards.
