# Coverage cross-reference: OnlineItalianClub grammar index vs Linguics

Source: the OnlineItalianClub alphabetical grammar index (read 2026-07-13). Their list is a broad, level-tagged A1 to C2 taxonomy of Italian grammar. Mapped against our trees to show what we cover, what we already plan to cover, and what is a genuine gap worth stealing.

Headline: our verb coverage is deep and largely complete; our gaps are almost entirely in the NOUN PHRASE (articles, noun plurals and gender, possessives, demonstratives, indefinites) and in a handful of sentence-level structures (passive, the si-constructions, reported speech, comparatives). We have world-class tense machinery bolted onto a missing set of A1 noun-phrase basics.

## A. Already covered (map site topic to our tree)

- Presente to `verb_form.present_indicative` (regular, irregular, reflexive presents)
- Passato prossimo to `verb_form.passato_prossimo` (incl. essere/avere auxiliary, modals, with pronouns)
- Imperfetto to `verb_form.imperfect`; imperfetto vs passato prossimo to `tense_choice`
- Futuro to `verb_form.future`
- Condizionale (semplice and composto) to `verb_form.condizionale`
- Congiuntivo (presente, imperfetto, passato, trapassato) to `verb_form.congiuntivo`
- Trapassato prossimo to `verb_form.trapassato_prossimo`
- Passato remoto to `verb_form.passato_remoto`
- Gerundio (semplice and composto) to `verb_form.gerundio`; stare + gerundio to `tense_choice.progressive_vs_simple`
- Imperativo (diretto, formale, informale, apocopated) to `verb_form.imperativo`
- Participio passato (regular and irregular) covered inside `verb_form.passato_prossimo`
- Verbi regolari e irregolari: the formation trees are exactly this
- Essere o avere (auxiliary choice) to the `auxiliary_choice` misconception plus the passato prossimo tree
- Pronomi diretti e indiretti, combinati to `pronoun`
- Particelle pronominali ci e ne to `pronoun.ne` / `pronoun.ci_locative` / `pronoun.ci_vs_ne`
- Verbi riflessivi to `pronoun.reflexive` plus the reflexive present (partial: reflexive across all tenses is thinner)
- Pronomi relativi (che, cui, il quale, chi, neuter) to `relative_pronoun`; che o cui to its discrimination branch
- Preposizioni (semplici, articolate, a/in, verb-governed) to `preposition`
- Aggettivi (agreement) to `adjective_agreement`; adjective position partial (grande prenominal only)
- Tense choice / uso dei tempi / concordanze verbali: partially to `tense_choice` (seven contrast areas)

## B. Already planned (the usage / tense-choice phase, roadmap)

- Per-tense usage: condizionale uso (polite, reported), futuro of probability, congiuntivo triggers and "quando si usa". Present usage is scaffolded; the richer usage dispatches are flagged next.
- Infinito and its constructions (fare + infinito causative, perception verbs, preposition + infinitive): roadmap has the infinitive as a usage-phase topic, not a formation gap.
- Sequence of tenses / concordanze verbali beyond the current contrasts: extends `tense_choice`.
- Periodo ipotetico: partly here already (`tense_choice.conditional_vs_imperfect_counterfactual`), to be deepened to the full three types (reale, possibilita, impossibilita).

## C. Gaps worth covering (inspiration), ordered fundamentals-first

### A1 to A2 noun-phrase basics we are missing (the biggest surprise)

- **Articoli / Articles** (definite and indefinite, uso e omissione, with proper nouns). No tree. This is A1 bedrock and we have nothing. Highest-priority gap.
- **Plurale dei nomi / Noun plurals** (regular, irregular, compound nouns). No tree. A1 bedrock.
- **Nomi irregolari / Noun gender and irregular gender** (maschile/femminile, il problema, la mano). No tree. Feeds adjective agreement, which we cover, but the noun side is missing.
- **C'e o ci sono / There is, there are**. No tree. A1 staple.
- **Piace / piacciono / the piacere construction** (mi piace / mi piacciono, indirect-object experiencer). No tree. A1 staple and a classic error source; not covered by our modal discrimination.
- **Aggettivi possessivi / Possessive adjectives** (mio/tuo/suo plus article, the family-noun exception). Our adjective tree is agreement only. Gap.
- **Pronomi e aggettivi dimostrativi / Demonstratives** (questo, quello). No tree. A1 to A2 gap.

### A2 to B1 structures

- **Comparativo e superlativo / Comparatives and superlatives** (piu/meno di vs che, superlativo relativo and assoluto, irregular buono/migliore, bene/meglio). No tree. Common and error-prone.
- **Avverbi / Adverbs** (-mente formation, adverb position, avverbi vs aggettivi). No tree. We have a means/manner preposition leaf but no adverb coverage.
- **Verbi modali / Modal verbs as a topic** (dovere/potere/volere + infinitive, modal + clitic placement, modals in the passato prossimo). Currently only glancing coverage via discrimination and passato prossimo; a dedicated area is worth it.
- **Pronomi e aggettivi indefiniti / Indefinites** (qualche, alcuni, ogni, ognuno, nessuno, qualcuno). No tree.
- **Passiva / Passive voice** (essere + participio, venire + participio). No tree. B1 to B2.
- **Si impersonale and si passivante / spersonalizzante** (si mangia bene, si vendono case, plus the impersonal-with-essere form). No tree; only a light mention in present usage. Distinctive and high-value.
- **Verbi pronominali / Idiomatic pronominal verbs** (farcela, andarsene, metterci, cavarsela, smetterla). No tree. A whole idiomatic-verb area the site treats as its own thing.
- **tu / Lei formal address as a topic** (beyond the imperative): the register system across greetings, requests, pronouns. Partial via imperativo; a dedicated area is inspiration.

### B2 to C2 advanced

- **Discorso indiretto / Reported speech** (tense backshift, deixis shifts). No tree. C1 flagship.
- **Congiunzioni, connettivi, connettori / Conjunctions and connectives** (subordinating conjunctions, linkers, sebbene/benche/affinche and the subjunctive triggers). We touch subjunctive-triggering conjunctions in `tense_choice.indicative_vs_subjunctive.hypothetical_triggers`, but the broader connective system is a gap.
- **Forma diminutiva e accrescitiva / Diminutives and augmentatives** (-ino, -etto, -one, -accio). No tree. Word-formation.
- **Costruzione scissa / Cleft construction** (e stato Marco a farlo). No tree. Advanced syntax.
- **Transitive vs intransitive verb uses** (feeds auxiliary and passive). No tree.
- **Ordine delle parole / Word order** as taught content (we have a word_order misconception family for marking, but no teaching content).
- Small specific points the site isolates: mica, non pleonastico, piuttosto che, prima di, finche/affinche, parole composte, consonanti doppie (we have a gemination misconception but no content), prefisso neo. These are nice-to-have micro-topics, good for filling out C1 to C2.

## Suggested reading of this

The verb system is our strength and it is essentially done through the tense-choice phase. The single most glaring hole is the A1 noun phrase: articles, noun plurals and gender, possessives, demonstratives, the piacere and c'e/ci-sono patterns. A learner starting at A1 on Linguics today would find rich verb drills but could not practise "the/a", making nouns plural, or "I like". If the goal is a coherent A1 to C2 offering, those noun-phrase basics are the priority new trees, ahead of the advanced C1 to C2 items which are better as later inspiration.
