# Coverage: verb_form.imperativo (formation branch)

**Author:** Imperativo chat (formation dispatch, against AUTHOR_BRIEF Rev 10)
**Date:** 2026-06-11
**Scope:** the four leaves under *Formation* only. Usage and the tu-vs-Lei register choice are stubs and were not authored.

## What shipped

- `grammar_questions_verb_form.imperativo.json` — 37 items
- `translation_items_verb_form.imperativo.json` — 16 items (all EN→IT, the production direction for the formation branch)
- No `bucket_suggestions` file (the tree already has a slot for everything I needed; see below).
- No `glossary_suggestions` file (the glossary already covers the relevant terms; see below).

## Bucket-to-item count

| Leaf (friendly label) | Grammar | Translation | Notes |
|---|---|---|---|
| Informal affirmative (parla! / prendi! / dormi!, parliamo!, parlate!) | 13 | 5 | The hot spot. tu -are = -a is the only genuinely new form, so it gets the heaviest contrast coverage against -ere/-ire = -i. noi/voi covered as "= present indicative". |
| Informal negative (non + infinitive for tu; non + positive for noi/voi) | 7 | 4 | tu = non + infinitive is the defining skill; one item (non fare) deliberately uses an irregular-tu verb to show the short form vanishes under negation. |
| Apocopated / irregular tu (va', da', fa', sta', di'; sii, abbi) | 7 | 4 | One item per member of the closed set: the five apocopated forms plus sii and abbi. |
| Formal Lei (= present subjunctive) | 10 | 3 | Regular (parli, prenda, dorma) plus the irregulars that follow the subjunctive (venga, faccia, vada, sia, abbia, dica) plus one archaic Loro item (entrino). |
| **Total** | **37** | **16** | |

## CEFR weighting

Grammar: A2 ×24, B1 ×12, B2 ×1. Translation: A2 ×11, B1 ×5. This matches the dispatch steer: the informal imperative (affirmative + negative + apocopated) is weighted A2 as the core band; the formal Lei sits at B1 (it depends on the subjunctive); the single archaic Loro item is the lone B2. No leaf was narrowed to one band.

## Chip / breadcrumb suppression (criterion 13 + 15)

**Every grammar item carries `info_display: "suppress"` (37/37).** Rationale, applied per the leak-vs-trap test:

- The bucket labels on all four leaves *enumerate answer forms* ("parla! / prendi! / dormi!", "va', da', fa', sta', di'", "parli! / prenda! / venga! / faccia!"). Showing the breadcrumb pre-answer would hand the learner the very form they are meant to produce, so for the affirmative and irregular leaves the breadcrumb is suppressed.
- The negative and formal labels additionally *name the rule under test* (non + infinitive; "= present subjunctive"). Per criterion 13/15 the rule must not be surfaced pre-answer, so those are suppressed too.
- I considered leaving the affirmative -ere/-ire breadcrumb visible as a productive trap (it tempts the -a over-extension that `must_not_include` catches), but the same label also spells out the literal answer (prendi!, dormi!), so the leak outweighs the trap. Suppressed.

**Cues name surface, not rule (criterion 13).** Cues give verb + person/register only — `(parlare, tu)`, `(prendere, Lei)`, `(parlare, tu, negativo)`. "forma di cortesia" names the *register* (load-bearing: tu vs Lei) and "forma negativa" names the *polarity*; neither names the rule (no "infinito", no "congiuntivo" appears in any prompt — verified). Person is named in the cue because for the imperative tu/noi/voi/Lei is load-bearing and the sentence frame does not always pin it; this is the cue-economy exception in Rev 9 (person kept when not otherwise supplied).

## Cross-references made

- **Root prerequisite** `verb_form.present_indicative`: the noi/voi imperatives are taught explicitly as "= the present indicative" (impv_aff_10–13).
- **`verb_form.congiuntivo`** on every formal item: the explanations state the Lei form *is* the present subjunctive, and each formal item's `examiner_note` flags the congiuntivo cross-reference. (I did not author congiuntivo content; I only cite it.)
- **Pronoun tree**: clitic attachment (dammi!, non dirlo!, mi dica!) and the consonant doubling on the apocopated forms were deliberately **not** tested. Where a clitic was natural in a translation reference I left it in the reference text but kept the `required_bucket` on the bare imperative form and added the pronoun bucket only as an `optional_bucket` (trans neg_04, form_02). This stays inside the dispatch scope boundary.

## Items flagged uncertain — decisions for the project author

1. **va'/vai, da'/dai, fa'/fai, sta'/stai accepted at equal full credit.** I put both the apocopated and the long form in `any_phrases` at 1.0 each. If you would rather steer learners toward the apocopated form (the more idiomatic command), say so and I will drop the long forms to graded acceptance (e.g. 0.8) or move them to a `note`. di' has no long form, so it is the only one with a single accepted spelling.

2. **The apostrophe-normalisation question (marker behaviour).** This materially affects the whole irregular-tu leaf and needs a ruling. The apocopated forms (va', fa', sta', di') are short, and their bare stems (va, fa, sta, di) are substrings of other words (vai, fai, stai, dici). My `any_phrases` always keep the apostrophe form *plus* the long form, never the bare truncation, so a correct answer matches. But two residual cases depend on how `norm()` treats the apostrophe:
   - A learner who *regularises* (types "va" without the apostrophe) is technically wrong, but the marker cannot cleanly separate that from "va'/vai" — it currently falls through as an unscored miss rather than an attempted-wrong. Acceptable, but flagging it.
   - **The one genuine false-positive risk is `impv_irr_07` (abbi).** "abbi" is a substring of the formal "abbia", and the marker checks `any_phrases` *before* `must_not_include` (positive match wins), so a learner who writes the Lei form "abbia" on this tu item would be wrongly credited. I set `match_at: "end"` on that markpoint to block it where end-anchoring is supported; the brief notes engine support for `match_at` is partial. **Please confirm whether `match_at: "end"` is honoured.** If not, either we accept the residual false-positive on that specific register-confusion, or I rephrase the item. The mirror item `impv_form_08` (abbia, with "abbi" in must_not) is *safe* because there the correct answer "abbia" wins the positive match before the substring is checked.

3. **The archaic Loro imperative** (impv_form_10, entrino) is included as a single low-frequency B2 item, per the dispatch's "cover them but archaic" steer. If you would rather the formation branch carry zero Loro items (leaving it entirely to a later usage/register pass), I will pull it.

## Bucket suggestions: none

The four-leaf tree fits the formation skill cleanly. I did *not* split the affirmative leaf into separate -are / -ere-ire sub-leaves even though the -a vs -i contrast is the headline skill, because the leaf's own description already frames that contrast and per-item attribution (any_phrases vs must_not_include) records the specific miss without needing a finer bucket. If diagnostics later show learners systematically failing one conjugation, that would be the moment to propose `formation.informal_affirmative.are_a` vs `.ere_ire_i` — noted for a future pass, not proposed now.

## Glossary suggestions: none

Checked `data/glossary.json` first. The relevant terms already exist and are adequate: **imperative**, **negative imperative** ("non + infinitive for tu, regular imperative for noi/voi/formal"), **monosyllabic imperative** (covers va'/da'/fa'/sta'/di'), **subjunctive**, **formal address**, **first/second/third conjugation**, **-isc- pattern**, **infinitive**, **clitic**. The explanations lean on these and the housing's tooltip wrapper will surface them. I propose no new terms. (If you want a dedicated **apocopation** entry as a more precise label than "monosyllabic imperative", I can draft one, but it would overlap heavily with the existing term, so I left it out.)

## Notes for the next dispatch (Imperativo usage / register)

- The usage leaf (`verb_form.imperativo.usage`) and the discrimination leaf (`...discrimination.register_informal_vs_formal`) are still stubs. The register *choice* (tu vs Lei for the social context) belongs there, and per the brief's Rev 10 it should be `info_display: "suppress"` by default as a discrimination bucket. I kept all my translation items register-*stated* (a name cues tu, a title like "signore/signora" cues Lei) precisely so they test formation, not the choice — the usage dispatch can reuse several of these source sentences trigger-stripped to test the choice instead.
- The recipe/sign infinitive-as-impersonal-imperative (Mescolare bene; Non fumare) is usage territory and was not touched.
- Clitic + imperative interaction (enclisis on the informal, proclisis on the formal, doubling on the apocopated forms) is the pronoun tree's; a coordination note may be worth a shared `inter_chat/` file between Imperativo and PronounAuthor if those items are authored.
