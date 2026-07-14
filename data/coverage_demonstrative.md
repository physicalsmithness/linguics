# Coverage: demonstratives

**Author seat:** DemonstrativeAuthor · **Delivered:** 2026-07-14 · **Reconciled to AUTHOR_BRIEF Rev 19:** 2026-07-15
**Files:** `grammar_questions_demonstrative.json` (44), `translation_items_demonstrative.json` (20), `bucket_suggestions_demonstrative.json` (1, now consumed)
**Thread (the contract, per Rev 18):** `inter_chat/Architecture_DemonstrativeAuthor_dispatch_outputs.md` — one ask open at v4 (relabel the discrimination leaf); this doc is the record.

Topic short `dem`. questo (this, near) and quello (that, far): their agreement, the fact that quello inflects like the definite article, the standing-alone pronoun forms, and choosing by distance.

## Bucket-to-item counts

| Bucket (friendly label) | Grammar | Translation (required) |
|---|---:|---:|
| questo (this, near) | 11 | 3 |
| quello (that, far) | 20 | 11 |
| Demonstrative pronouns | 8 | 8 |
| this vs that (near / far) | 5 | 1 (+2 optional) |
| **Total** | **44** | **20** |

Translation split 10 EN→IT / 10 IT→EN. CEFR weighting: grammar A1 2 / A2 17 / B1 23 / B2 2; translation A1 1 / A2 6 / B1 10 / B2 3. Weighted at A2–B1 as the bucket CEFR importances ask, with a light B2 seam on ciò.

## Coverage rationale (rule-internalisation, not counts)

**quello carries the most weight** because it is the hard branch: it reuses the definite-article selection rule, so every miss mirrors an article miss. The 20 grammar items walk the whole paradigm and, crucially, each phonological environment is hit from both the singular and the plural side and set against its article twin in the explanation (il→quel, lo→quello, l'→quell', i→quei, gli→quegli, la→quella, le→quelle). Deliberate contrasts are planted: quell'amico (sg, elided) against quegli amici (pl, no elision); quegli amici (m pl before vowel) against quelle amiche (f pl before vowel, stays plain) to catch over-applying the masculine rule; quello zio against quegli zii as a same-surface pair.

**questo** is the easy branch (plain -o/-a/-i/-e agreement plus quest' elision), so it is lighter, with two planted gender traps (questo problema, -a but masculine; questa mano, -o but feminine) so the learner cannot read agreement off the visible ending.

**Demonstrative pronouns** test the one thing that actually diverges from the adjective: standing alone, quello keeps its FULL form (quello / quella / quelli / quelle), never the reduced quel / quei / quegli. The sharpest item is quelli-vs-quei/quegli as a bare pronoun. ciò (neuter "that which / what") sits here too; the cue names ciò, and `quello che` is accepted at **0.9 with a steering note** (Rev 17 iv, 0.9-for-dodges: correct Italian that sidesteps the drilled pattern).

**this vs that (near / far)** is a stub: 5 context-only items where an adverbial (adesso / qui vs in fondo / laggiù / all'orizzonte) forces the choice. Per Rev 19's recoverability condition these are `info_display: "show"`, not suppressed: the candidate set is lexical (questo vs quello) and nothing in "Prendi ____ penna" reveals it, so suppression would have made them guessing games. They carry `candidate_forms` + `correct_form` (Rev 17 iii) with the item-specific competing surfaces, so the post-answer tick names what could actually have filled the blank. No item in this batch is suppressed.

## Flagged / needs Architecture

1. ~~Register `demonstrative.discrimination.questo_vs_quello`~~ — **DONE** (thread v2, registered verbatim; aggregate stub cleared, all forward refs resolve against the live registry).
2. ~~Non-tense discrimination has no candidate-set field~~ — **RULED** (thread v2 / Rev 17 iii): general `candidate_forms` + `correct_form`; retrofitted to all 5 items. Housing tick extension still pending, so context-only behaviour is unchanged until it ships.
3. **OPEN — the registered leaf label names the rule, not the candidate forms.** The leaf carries my v1 label **"this vs that (near / far)"** (registered verbatim). That was harmless while the items were suppressed; now they are shown, the visible breadcrumb states the near/far rule, which is the diagnostic these items test (criterion 13 applied to labels). Rev 19 asks for the candidate-forms shape, so this should read **"questo / quello"**, with the near/far explanation living in `description` where it only surfaces post-answer. Parent aggregate `demonstrative.discrimination` has the same label. Registry is architecture-owned; raised at thread v4.
4. **Awaiting ratification — the 0.9-for-dodges reading on ciò.** The cue names ciò, so I treat `quello che` as a dodge (0.9 + steering note) rather than a co-equal standard variant. If Architecture considers ciò and quello che co-equal, restore both to 1.0.
5. **quello kept as ONE leaf** (blessed, thread v2), mirroring `article.definite.forms`. If the article tree is ever split by phonological environment, quello moves in step.
6. **ciò homed in `demonstrative.pronoun`** (blessed, thread v2) as the leaf description groups it.

## Engine note (marker safety)

Every demonstrative markpoint phrase (both `any_phrases` and `must_not_include`) is `match_at: "word"` anchored. This is load-bearing, not cosmetic: `norm()` folds the apostrophe to a space **and strips it**, so `quell'` normalises to `quell`, a prefix of quello / quella / quelle / quelli. Unanchored, a learner writing the miss "quello amico" would have satisfied a bare `quell'` answer; likewise `cioè` (→ cioe) embeds the `ciò` (→ cio) answer. Both are rejected.

Audited in all three criterion-18 directions across the batch, by simulating the live `norm()`:
- no `any_phrase` credits a declared miss or any sibling demonstrative form (directions 1 and 2);
- **no `must_not_include` entry fires on a plausible correct attempt** (direction 3, Rev 17 ii), tested against both the bare form and form-plus-following-noun, with elided forms joined;
- every correct form self-credits. 10 behavioural spot-checks incl. quello amico = miss, cioè = miss, full-form quello = miss.

## Notes for the next dispatch

- Nothing blocks these items; the only open ask is cosmetic-but-diagnostic (flag 3, the leaf label).
- Deferred by scope (core + light C1): the C2 register tail — costui / costoro, medesimo / sottoscritto, literary questi / quegli as subject, bureaucratic register. A short top-up batch can add these tagged C2 if wanted.
- Room to grow the discrimination stub now that the candidate-set shape is settled.
