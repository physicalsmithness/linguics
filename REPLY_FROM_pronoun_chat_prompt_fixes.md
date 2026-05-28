# Reply from the pronoun authoring chat — prompt-fix sweep

Date: 2026-05-28
In reply to: FEEDBACK_TO_pronoun_chat.md (2026-05-15)

The feedback packet landed and is fully applied. Summary of what was fixed, what was found in the sweeps, and three things that look like they want the architect or code chat rather than another pronoun-chat pass.

---

## The specific cluster pre-aux item

Item op_comb_order_04 (the "Marco _____ _____ ha dato" item Smith hit live) has been refactored to the option-(a) two-sentence shape:

> "Marco mi aveva promesso un libro. Ieri ____ ha dato finalmente."

The first sentence establishes the recipient (mi) and the antecedent (un libro). The second sentence has a single combined slot for the cluster. Both me l' and me lo credit; the joined form melo stays in must_not_include as the joined-when-separate diagnostic. The explanation flags the vowel change (mi → me) and the elision (lo → l' before ha), then gives the working as "me + l' + ha + dato". vocab_help now carries promesso, libro, and finalmente.

The change to a single slot is the structural fix; the two-sentence prompt is the antecedent-introduction fix. Both at once.

---

## Jargon sweep (problem 1)

I grepped all 216 grammar prompts for `clitic`, `enclitic`, `proclitic`, `DOP`, `IOP`. Found roughly fifty hits. Translation items were clean. All converted to plain "pronoun" wording in the prompts:

- "Replace 'X' with a clitic" → "Replace 'X' with a pronoun"
- "Place the clitic" → "Place the pronoun"
- "Order the clitics" → "Order the pronouns"
- "Attach the clitic(s)" → "Attach the pronoun(s)"
- "Combine the clitics" → "Combine the pronouns"
- "Complete with the partitive clitic" → "Complete with the partitive pronoun"
- "Complete with the DOP for 'me'" → "Complete with the direct-object pronoun for 'me'"
- "(DOP or IOP?)" → "(direct object or indirect object?)"
- "(combined clitics + dare)" → "(combined pronouns + dare)"
- "with servire-IOP" → "(servire works like piacere, taking the person as an indirect object)"

Explanations and markpoint labels still use the technical terms — those are glossary-wrapped or author-facing. Only prompts got the rewrite, which matches the feedback's "ARE wrapped in explanations, NOT in prompts" line.

I went with bare "pronoun" rather than "pronoun (clitic)" because clitic doesn't actually add anything pedagogically in a prompt: the question is about Italian's small pronouns, the term "clitic" is post-hoc linguistic vocabulary that a B1 learner doesn't need at the moment of attempting. Happy to add the parenthetical back if you'd rather lead the learner toward the term.

---

## Slot-elision mismatch sweep (problem 2)

Found three items besides op_comb_order_04 where the slot count implied a more spaced-out form than the answer actually has. All three collapsed to a single combined slot accepting both the elided and unelided forms:

- op_spec_dislo_03 ("Quel libro, ____ ____ ha prestato Marco") → "Quel libro, ____ ha prestato Marco", accepts "me l'" and "me lo".
- op_refl_with_obj_06 ("Marco ____ ____ ____ lavate ieri") → "Marco ____ lavate ieri", accepts "se le è" and "se l'è". Same item got the two-sentence-prompt treatment too: "Marco aveva le mani sporche." precedes the fill-in to establish the antecedent.
- op_spec_lo_neut_04 ("'Sì, ____ ____ ho detto'") → "'Sì, ____ ho detto'", accepts "gliel'" and "glielo" (the glielo-family is always one written word in any position).

The glielo-family items elsewhere (op_comb_glielo_01..07, 08..11) all had single slots already, so no change there. The joined-cluster items (op_comb_joined_01..05) genuinely have two-word answers ("me lo dai", "me le ho lavate"), so their double slots are correct.

---

## Metalinguistic gloss sweep (problem 3)

Five prompts had `m.sg`/`f.sg`/`m.pl`/`f.pl` notation in the learner-facing gloss area. Rewritten as natural English:

- op_ne_pp_02: "(m.pl antecedent)" → "('i libri' is masculine plural; choose the ending that agrees)"
- op_refl_with_obj_05: "(informal you, fem.pl DO)" → "(informal 'you'; 'le scarpe' is feminine plural)"
- op_refl_with_obj_06: the gloss "(= washed them for himself, fem.pl DO — i denti? No: le mani)" was an in-author-head dialogue, not learner prose; replaced with the two-sentence rewrite above.
- op_comb_order_05: "(the letter, f.sg) to you (formal, sg)" → "(formal address; 'la lettera' is feminine)"
- op_comb_glielo_10: "(antecedent f.sg)" → "('la verità' is feminine)"

examiner_note fields still use the shorthand freely — those are author-facing, which the feedback explicitly allows.

---

## What I did NOT touch

The principles in the feedback say "glossary terms ARE wrapped in explanations." I left all 216 grammar explanations and all 56 translation explanations alone on the assumption that the renderer is doing its job. If the renderer turns out not to be live yet, the explanations will read jargon-heavy on a few items; flag that and I'll do another pass with parenthetical glosses where appropriate.

The markpoint `label` field is shown in the result panel but I left technical terms there too (e.g. "DOP 1sg mi"). Labels are short identifiers, not learner-facing pedagogy. If the panel is showing labels to learners in a way that needs the same treatment as prompts, please flag.

---

## Three things that look like they want the architect / code chat

1. **The screenshot Smith showed me** (separate, post-feedback): the prompt rendering jams an English instruction, an Italian question, and an Italian answer-fragment-with-blank onto a single line, and the English/Italian code-switch reads as visual noise. Smith's suggestion was to space them onto separate lines and to distinguish English from Italian typographically (italics for English, or a different font). This is a renderer/CSS change. Authors can structure prompts more clearly, but we can't pick fonts from the JSON. I propose flagging this to the code chat. The fix has cross-cutting value: every prompt in every topic gets clearer.

2. **The slot-elision principle should live in the brief.** I caught four items in the pronoun batch but the same pattern will appear in any topic with elision (verb auxiliaries with elision: "l'ho fatto", combined preposition + pronoun, etc.). Worth a rule under AUTHOR_BRIEF §2 quality criteria: "Slot count in the prompt must match the surface-word count of the most contracted accepted form. If multiple forms are accepted with different word counts, use a single combined slot and accept all forms." This is the cross-cutting principle #2 in the feedback packet.

3. **The prompt-vs-explanation glossary asymmetry should live in the brief.** Currently nothing in AUTHOR_BRIEF tells authors that prompts aren't glossary-wrapped. The first principle in the feedback ("Glossary terms ARE wrapped in explanations, NOT in prompts; authors must introduce technical terms inline in prompts") is cross-cutting; it should land in the brief under §2 quality criteria, not stay in this single packet.

I have not added these to FEEDBACK_for_architect_chat.md because per the note in the original feedback packet that file is currently owned by the vocab chat. Please surface at next ratification or tell me to write directly.

---

## In-chat summary I'd give the project author

Pronoun batch jargon-and-rendering sweep done. Cluster-pre-aux item refactored to a two-sentence prompt with a single slot. ~50 prompt-level jargon rewrites ("clitic" → "pronoun" etc.). Three more slot-elision mismatches fixed beyond the one Smith hit. Five glosses rewritten from metalinguistic shorthand to natural English. Three cross-cutting principles surfaced that look like brief-level work for the next architecture session (slot-elision rule, prompt-vs-explanation glossary rule, prompt typography). File: REPLY_FROM_pronoun_chat_prompt_fixes.md.
