# Reply: prompt-leak fix on modal_inheritance items (passato_prossimo)

Quick targeted feedback. Five items in your latest output have the same rule-naming pattern in the prompt that turns out to be a serious diagnostic giveaway. Please rewrite them and send the fix back. Affects `pp_aux_modal_01` through `pp_aux_modal_05`.

## The problem

Each of the five items has a prompt starting with "Fill in the auxiliary using prescriptive inheritance:". For example:

> Fill in the auxiliary using prescriptive inheritance: 'Loro _____ potuti partire in orario ieri.' (potere + partire, masc pl subject)

The phrase "using prescriptive inheritance" names the very rule the question is meant to diagnose. A learner who knows what "prescriptive inheritance" means in this context already knows the rule (modals inherit the auxiliary of the infinitive they govern); a learner who doesn't know what the phrase means can't answer. The diagnostic value collapses in both directions.

The same pattern, less subtly: "Use the imperfect" on an imperfect question, "Apply preceding-DOP agreement" on a participle-agreement question, "Use the subjunctive" on a subjunctive question. Any prompt that names the diagnostic rule gives the answer away.

## The distinction worth holding

This isn't a blanket ban on grammatical jargon in prompts. Naming the **output form** is fine and often necessary scaffolding:

- "Replace X with a clitic" (names what to produce, not which clitic or where)
- "Form the past participle: parlare → ___" (names the form, not which class or auxiliary)
- "Fill in the auxiliary slot" (names the slot, not which auxiliary)

What's wrong is naming the **diagnostic rule**:

- "using prescriptive inheritance" (names the inheritance rule)
- "apply the agreement rule" (names the agreement rule)
- "in the prescriptive form" (names the register-rule's prescriptive side)

The bucket label is for the engine and for review; it shouldn't appear in the prompt under any circumstances. AUTHOR_BRIEF.md §2 quality criterion 5 has been sharpened in Revision 3 to make this distinction explicit, with this exact item as the worked example.

## The fix for these five items

The form constraint in each sentence already forces the diagnostic answer. The participle "potuti" / "voluta" / "dovuto" / "dovuta" is masculine-or-feminine and singular-or-plural agreed with the subject, which means the only auxiliary that fits is essere (since avere keeps the participle invariable unless preceded by a DOP, and none of these prompts have a preceding DOP). So you can drop "using prescriptive inheritance" entirely. The diagnostic survives via the form structure alone.

The "(potere + partire, masc pl subject)" cue is also doing more work than it should. The participle form already says masc-pl. The "(potere + partire)" half cues the modal-infinitive pairing, which is useful; the "masc pl subject" half is redundant and partly leaking the agreement diagnostic.

Suggested rewrites:

- `pp_aux_modal_01`: `Complete: 'Ieri Maria _____ voluta partire presto.' (volere + partire)`
- `pp_aux_modal_02`: `Complete: 'Ieri Marco _____ dovuto fare i compiti.' (dovere + fare)`
- `pp_aux_modal_03`: `Complete: 'Loro _____ potuti partire in orario ieri.' (potere + partire)`
- `pp_aux_modal_04`: `Complete: 'Stamattina io _____ voluto mangiare la pasta.' (volere + mangiare)`
- `pp_aux_modal_05`: `Complete: 'Ieri sera lei _____ dovuta uscire prima.' (dovere + uscire)`

Each preserves the diagnostic ("which auxiliary fits" given that the participle's gender/number agreement forces essere) without naming the rule. The cue tells the learner the modal+infinitive pair; the participle commits the answer to essere.

The `explanation` field on each item is where the term "modal auxiliary inheritance" rightfully belongs (and the glossary will wrap it interactively). That's the right place: post-attempt, in the why-block, the learner sees the rule named and can connect it to what they just produced. Not in the prompt itself.

## Audit while you're there

Please grep your prompt strings for the following phrases and rewrite any matches: `prescriptive`, `inheritance`, `agreement rule`, `agreement with preceding`, `preceding DOP`, `apply the`. If any item turns up with a prompt that names a diagnostic rule, apply the same fix pattern.

The items that name OUTPUT forms (`clitic`, `past participle`, `auxiliary`, `infinitive`, `gerund`, `participle`) are fine and shouldn't be touched. Those name what to produce, not what rule to apply.

## What to send back

A revised `grammar_questions_verb_form.passato_prossimo.json` with the five items fixed plus any other items the audit surfaced. A two-line note in `coverage_verb_form.passato_prossimo.md` saying which items were touched is enough; no full re-coverage needed.
