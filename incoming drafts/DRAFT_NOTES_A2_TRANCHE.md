# DRAFT NOTES: A2+ tranche (2026-07-13)

Six topic packages drafted off-bridge, same caveat as the A1 pair: schema reconstructed from the handoff record, nothing canonical until the checklist passes in a bridged session. Read alongside DRAFT_NOTES.md (the A1 pair), whose generic checklist items 1 to 3, 5, 7 and 8 apply verbatim to all six of these.

## Files in this tranche

- DRAFT_buckets_comparison.json (11 nodes, topic_short cmp) → data/buckets/comparison.json
- DRAFT_buckets_adverb.json (9 nodes, adv) → data/buckets/adverb.json
- DRAFT_buckets_passive.json (9 nodes, pas) → data/buckets/passive.json
- DRAFT_buckets_si_constructions.json (10 nodes, si) → data/buckets/si_constructions.json
- DRAFT_buckets_reported_speech.json (9 nodes, rep) → data/buckets/reported_speech.json
- DRAFT_buckets_pronominal_verbs.json (9 nodes, pv) → data/buckets/pronominal_verbs.json
- Six DRAFT_DISPATCH_*.md files, one per topic

External_id prefixes claimed: cmp_, adv_, pas_, si_, rep_, pv_ and their trans_ variants. Check none collide on disk (si_ in particular: verify no existing batch uses it).

## Tranche-specific validation, on top of the generic checklist

1. Overlap audit, pronominal_verbs vs pronoun tree (the big one). The pronoun tree already owns motion_andarsene, pronominal_idiomatic_verbs (starsene, fregarsene, intendersene, uscirsene), the locative-ci idiom cluster with its farcela leaf, and volerci/tenerci material. Ruling drafted here: the new tree is the learner-facing topic home for meaning and whole-verb conjugation; the pronoun tree keeps the clitic mechanics; items cite both. On disk, verify the exact pronoun bucket ids cited in the tree and dispatch, and decide leaf by leaf whether anything in the new tree duplicates rather than complements. Also check where ce l'ho currently lives (possibly pronoun.combined); if a bucket exists, the new ce_lho_possession leaf should cite it or yield to it.
2. Overlap audit, reported_speech vs imperfect tree. verb_form.imperfect.indirect_speech.reported_present and .reported_intention exist and are cited as prerequisites of the corresponding new leaves. Confirm ids; confirm the conditional tree's shape (its reported-intention/past-conditional buckets) and add the right citation to future_to_past_conditional; confirm tense_choice.trapassato_vs_imperfect id spelling.
3. Overlap audit, adverb.position vs verb_form.passato_prossimo.adverb_placement. The boundary is drawn (compound-tense placement stays with PP); verify the id and that the PP bucket's own description doesn't claim simple-tense territory.
4. Overlap audit, passive vs si tree. passive.usage.vs_si_passivante owns the discrimination; si tree cites it and does not duplicate. Both dispatches state this; keep it true on commit.
5. Cross-tree prerequisite ids to verify beyond the above: adjective_agreement (and .stem_changes), article.definite, preposition.articulated, pronoun.reflexive, pronoun.ne (and named leaves), pronoun.ci_locative.idiomatic_verbs, pronoun.combined, verb_form.present_indicative.formation, verb_form.passato_prossimo.auxiliary and .participle_agreement.with_essere, existential.form.plural (from the A1 pair, so commit order matters: A1 pair first, then this tranche), demonstrative.
6. The comparison tree cites existential? No. But si_constructions.passivante.agreement cites existential.form.plural, and reported_speech.deixis cites demonstrative: both land only if the A1 pair and the noun-phrase trees are already committed. Commit order: noun-phrase trees (already on disk), then A1 pair, then this tranche.
7. Manifest: none of the six enter data/manifest.json until first content lands (standing ruling).
8. DECISIONS.md entries to add on commit: the six trees; the boundary rulings (pronominal_verbs vs pronoun tree; reported_speech cites imperfect indirect_speech; adverb compound placement stays with PP; passive owns the vs-si discrimination); the graded-credit rulings ("questo libro è meglio" at 0.5 with register note; "ha detto che veniva" at 0.5 with register note); prefix claims.

## Architect rulings made in this tranche (for Smith's eye, largest first)

1. Pronominal verbs get their own learner-facing tree despite existing pronoun-tree leaves, with a cite-not-duplicate contract. Alternative rejected: leaving them as pronoun sub-leaves only, which hides a whole learnable topic from the welcome screen's topic list.
2. Reported speech is an umbrella topic whose tense-shift leaves double-cite the imperfect (and conditional) trees, so the skill accumulates in one place whichever topic authored the item. Same pattern as tense_choice citing the imperfect discrimination buckets.
3. Two graded-credit rulings: colloquial imperfetto for future-in-the-past ("ha detto che veniva") at 0.5 with register note; colloquial meglio-as-adjective ("questo libro è meglio") at 0.5 with register note. Both are ubiquitous in speech and flat misses would misdiagnose.
4. Passive accepts both "è pagato" and "viene pagato" at full credit in simple-tense rewrites unless context forces one.
5. Boundary rulings: compound-tense adverb placement stays with the PP tree; the passive-vs-si discrimination lives in the passive tree with the si tree citing it; reflexive si stays in the pronoun tree with which_si only testing recognition of the difference.
6. Si-passivante agreement is explicitly cross-linked to existential plural agreement (same instinct, same miss), including a suggested item pattern juxtaposing them.
7. CEFR bands riffed as informed defaults again, pending the Profilo grounding pass already in OPEN_QUESTIONS.
