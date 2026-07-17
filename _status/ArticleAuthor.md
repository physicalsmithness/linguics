seat: ArticleAuthor
classes: [all-seats, all-authors]
project: Linguics
updated: 2026-07-18
waiting: parked
needs_from_smith: decision
blocked_by: none
claude_can_verify: yes — worklist refs and criterion compliance are all on disk
summary: Batch ACCEPTED (2026-07-15). One live retrofit owed = POS-migration + citation-form key repair on the article vocab_help (~33 refs). Criteria 13 and 20 audited clean against my batch, evidence ready, Architecture's stamp to apply. One open question for Architecture on criterion 16 (candidate_forms on the discrimination items).
queue:
  - POS-migration + citation-form key repair, article batch (~33 refs): zii->zio, amiche->amica, libri->libro, cani->cane, amici->amico, studenti->studente, gnocchi->gnocco, case->casa, Italia->italia (casing), resta->restare, + ora/calcio/giorno/ieri; then add the .<pos>. segment to every vocab_help bucket id in both files   [AdjectiveAuthor_Architecture_brief_rev6_audit v6 census (line: article 33 refs); Architecture_ArticleAuthor_batch_disposition v1]
  - crit-13 (all-authors, retrofit): self-audit CLEAN — no rule-naming cue chips; prompts use output-form language ("Complete with the definite article"). Evidence ready; Architecture stamps (seats do not self-stamp).
  - crit-20 (all-authors, Rev22/Rev25 retrofit): CLEAN — forms items exempt (citation-form/lemma-to-inflect trigger; the cue noun sits at/below each item's level per Rev25); usage/discrimination use bracketed-English MCQ or in-context fills, no bare-fragment cues. Evidence ready; Architecture stamps.
  - OPEN Q crit-16 / Rev17(iii): the 5 article.discrimination.with_or_without items carry no candidate_forms/correct_form. MCQ choices may already serve as the visible candidate set; the one short suppressed item (art_disc_05) is the real candidate for the fields. Ruling needed — to raise on an Architecture thread.
not_owed:
  - crit-17: my items authored at brief Rev14 (post Rev-13); all 51 explanations already gloss the sentence (verified). NOT among Cr17Sweep's 418.
  - crit-18: central anchoring gate covered it; my match_at "word" verified collision-free (143-assertion sim).
  - crit-19: article tokens carry no accents; N/A. AccentAuditor swept estate-wide.
  - crit-15: standing (Rev19 recoverability); my suppression reviewed compliant (article choice is recoverable from context).
