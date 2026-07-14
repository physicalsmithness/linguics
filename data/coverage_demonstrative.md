# Coverage: demonstratives

**Author seat:** DemonstrativeAuthor · **Delivered:** 2026-07-14 · **Brief:** AUTHOR_BRIEF rev16
**Files:** `grammar_questions_demonstrative.json` (44), `translation_items_demonstrative.json` (20), `bucket_suggestions_demonstrative.json` (1)

Topic short `dem`. questo (this, near) and quello (that, far): their agreement, the fact that quello inflects like the definite article, the standing-alone pronoun forms, and choosing by distance.

## Bucket-to-item counts

| Bucket (friendly label) | Grammar | Translation (required) |
|---|---:|---:|
| questo (this, near) | 11 | 3 |
| quello (that, far) | 20 | 11 |
| Demonstrative pronouns | 8 | 8 |
| this vs that (near / far) *(proposed leaf)* | 5 | 1 (+2 optional) |
| **Total** | **44** | **20** |

Translation split 10 EN→IT / 10 IT→EN. CEFR weighting: grammar A1 2 / A2 17 / B1 23 / B2 2; translation A1 1 / A2 6 / B1 10 / B2 3. Weighted at A2–B1 as the bucket CEFR importances ask, with a light B2 seam on ciò.

## Coverage rationale (rule-internalisation, not counts)

**quello carries the most weight** because it is the hard branch: it reuses the definite-article selection rule, so every miss mirrors an article miss. The 20 grammar items walk the whole paradigm and, crucially, each phonological environment is hit from both the singular and the plural side and set against its article twin in the explanation (il→quel, lo→quello, l'→quell', i→quei, gli→quegli, la→quella, le→quelle). Deliberate contrasts are planted: quell'amico (sg, elided) against quegli amici (pl, no elision); quegli amici (m pl before vowel) against quelle amiche (f pl before vowel, stays plain) to catch over-applying the masculine rule; quello zio against quegli zii as a same-surface pair.

**questo** is the easy branch (plain -o/-a/-i/-e agreement plus quest' elision), so it is lighter, with two planted gender traps (questo problema, -a but masculine; questa mano, -o but feminine) so the learner cannot read agreement off the visible ending.

**Demonstrative pronouns** test the one thing that actually diverges from the adjective: standing alone, quello keeps its FULL form (quello / quella / quelli / quelle), never the reduced quel / quei / quegli. The sharpest item is quelli-vs-quei/quegli as a bare pronoun. ciò (neuter "that which / what") sits here too, accepting quello che as its everyday twin.

**this vs that (near / far)** is a stub: 5 context-only items where an adverbial (adesso / qui vs in fondo / laggiù / all'orizzonte) forces the choice. All are `info_display: "suppress"` (crit 15) and carry no base-form cue, so the item does not tip that a near/far choice is in play.

## Flagged / needs Architecture

1. **Proposed bucket `demonstrative.discrimination.questo_vs_quello`** (leaf under the existing aggregate stub `demonstrative.discrimination`). The dispatch names this exact id; the tree only had the aggregate. 5 grammar + 1 translation required + 2 optional forward-reference it. Registration needed so it resolves at production load. See `bucket_suggestions_demonstrative.json` and the inter_chat thread.
2. **Non-tense discrimination has no candidate-set field.** Crit 16's `candidate_tenses` is tense-only, so the near/far items cannot declare their candidate set the way tense_choice items do. Right now the choice is carried by context + `must_not_include` alone. Flagged to Architecture: is an analogous `candidate_forms` (or similar) wanted for non-tense discriminations, or is context-only correct here?
3. **quello kept as ONE leaf**, mirroring the `article.definite.forms` precedent (the project homes "choosing the form" in a single atom and captures the specific slip in `must_not_include`, not in per-environment sub-buckets). If finer per-environment diagnostics on quello are ever wanted, that is a bucket-split decision for Architecture and should move in step with any equivalent split on the article tree.
4. **ciò homed in `demonstrative.pronoun`** as the tree groups it ("questo and quello standing alone, and neuter ciò"). If ciò later deserves its own leaf for a cleaner diagnostic, flag; I did not split it unilaterally (staying in role).

## Engine note (marker safety)

Every demonstrative markpoint phrase (both `any_phrases` and `must_not_include`) is `match_at: "word"` anchored. This is load-bearing, not cosmetic: `norm()` folds the apostrophe to a space **and strips it**, so `quell'` normalises to `quell`, a prefix of quello / quella / quelle / quelli. Unanchored, a learner writing the miss "quello amico" would have satisfied a bare "quell'" answer; likewise "cioè" (→ cioe) embeds the ciò (→ cio) answer. Both are now rejected. Verified by an audit pass that asserts, per markpoint, that no declared miss and no sibling demonstrative form is ever positively credited, and that every correct form self-credits (10 behavioural spot-checks incl. quello amico=miss, cioè=miss, full-form quello=miss).

## Notes for the next dispatch

- Once the discrimination leaf is registered, nothing else blocks these items.
- Deferred by scope (core + light C1): the C2 register tail — costui / costoro, medesimo / sottoscritto, literary questi / quegli as subject, bureaucratic register. A short top-up batch can add these tagged C2 if wanted.
- Room to grow the discrimination stub once the candidate-set question (flag 2) is settled.
