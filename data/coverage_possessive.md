# Coverage: possessive

**Author chat:** PossessiveAuthor. **Brief:** AUTHOR_BRIEF.md Revision 14 (the dispatch cited Rev 13; the live brief is Rev 14, which only adds the encouraged "House techniques" section, used below). **Topic short:** `poss`. **Delivered:** 48 grammar questions, 26 translation items, 1 proposed bucket, 3 proposed glossary terms.

## Coverage table

| Bucket (label) | id | Grammar | Translation | Notes |
|---|---|---:|---:|---|
| Possessive + article, agreeing | `possessive.adjective.forms` | 20 | 7 | Heaviest leaf. All six persons; all four agreement forms (m.sg/f.sg/m.pl/f.pl); owner-agreement trap both directions; loro invariable; indefinite article + possessive. |
| Family nouns drop the article | `possessive.adjective.family_exception` | 15 | 7 | Full ladder: drop (sg unmodified) → return on plural / modification / affectionate / loro; plus a non-family contrast. 9 of the 15 are MCQ (see marker note). |
| Possessive pronouns | `possessive.pronoun` | 8 | 4 | Standalone, article-required contexts only (subject / object / contrastive). Deliberately avoids the bare-predicate `è mio`, which is a separate construction (deferred to Architecture). |
| suo: his, her, your (formal) | `possessive.discrimination.suo` | 5 | 8 | **Proposed leaf** (see below). Comprehension-heavy, so weighted to translation. Includes same-answer his/her pairs and formal Suo. |

CEFR spread: grammar A1×3 / A2×21 / B1×24; translation A1×1 / A2×10 / B1×15. Direction: 16 en→it, 10 it→en (leaning en→it, appropriate for an A2-B1 topic).

## The marker constraint that shaped this batch (please read)

The core diagnostic of the family exception is **dropping** the article (`mia madre`, not `la mia madre`). The substring grammar engine cannot mark this in free text: the correct core (`mia madre`) is always a substring of the wrong form (`la mia madre`), and a positive `any_phrases` match wins before `must_not_include` is consulted (confirmed in `housing/js/norm.js` / `grammar_engine.js`). I checked `match_at`: `"start"` anchors to a **word** boundary (`idx===0 || haystack[idx-1]===" "`), so it still matches `mia` inside `la mia` and cannot reject a leading article.

So every "should the article be there or not" item is authored as **MCQ**, which `app.js` scores by exact `answer_index` (not by the substring markpoint), giving a clean verdict and clean bucket attribution. The article-**returns** cases (plural / modified / loro), where the article is *required*, are safe as free-text (`any_phrases: ["i miei"]`; a dropped-article answer simply fails to match and records a miss), and I anchor a `must_not_include` like `{"phrase":"miei","match_at":"start"}` on sentence-initial items to turn that miss into evidence. The his/her resolution likewise leans on translation items, where the AI marker distinguishes `la sua` from `sua` and "his" from "her".

If Architecture would rather the article-presence discriminations be free-text (e.g. via a new string-start anchor or a "no leading determiner" guard), that is an engine question worth a thread; for now MCQ is the only correct tool.

## info_display

`info_display: "suppress"` is set on all forms, family and discrimination items (34 items): the breadcrumbs "Possessive + article, agreeing" and "Family nouns drop the article" name the exact diagnostic (include/drop the article), and discrimination items are suppress-by-default per criterion 15. Pronoun items are left visible: the label "Possessive pronouns" restates the context without naming the keep-the-article diagnostic.

## Flagged / uncertain items

- `poss_disc_suo_05` (MCQ "her brother" → `suo fratello` vs `sua fratello`): sits in the suo leaf but also exercises the family drop. I bucketed it to the discrimination leaf because the tested contrast is suo-vs-sua agreement, not the article; flagging in case you'd rather it point at the family leaf or carry two markpoints.
- `trans_poss_it_en_disc_suo_03` (`il direttore ha perso le sue chiavi`): I gave two positive references, "his keys" and "her keys", because `direttore` doesn't fix the owner's gender. If the marker penalises the unstated alternative, this needs an examiner note or a gender-fixing tweak.
- `poss_forms_16` (`una mia collega`): `collega` is common-gender; I treated it as feminine here (`una mia collega`). The vocab bucket `vocabulary.it.collega.gender` will need the number/gender disambiguation the lemma-key convention (rule 8) anticipates.
- Gender aspects on owned nouns in forms items: revealing e.g. `casa` = feminine is close to handing over the agreement, but I followed the adjective_agreement precedent (§5 worked example reveals the noun's gender) since gender is separately bucketed vocabulary. Flagging the judgement call.

## Proposed additions

- **Bucket** (`bucket_suggestions_possessive.json`): `possessive.discrimination.suo` under the existing `possessive.discrimination` stub aggregate. 13 delivered items cite it, so it must be registered before this batch loads cleanly. It is a **referent** discrimination (his/her/formal), not a tense/mood choice, so criterion 16's `candidate_tenses` / `correct_tense` do not map - see the inter_chat thread below.
- **Glossary** (`glossary_suggestions_possessive.json`): "possessive adjective", "possessive pronoun", "family-noun exception". (definite article, indefinite article, invariable, agreement, formal address already exist and are used as-is.)

## For the Misconception Analyst (not authored here - registry is Architecture-owned)

Three patterns worth a misconception entry when that seat next runs: (1) **owner-agreement** - choosing suo/sua by the owner's gender rather than the noun's (the `must_not_include` on `poss_forms_07/08/17/19` and the negative reference on `trans_..._forms_02` isolate it); (2) **spurious article on a family noun** (`la mia madre`) - carried by the family MCQ wrong choices and the negative references on `trans_..._fam_01/04`; (3) **dropped article on a plural/standalone** (`miei fratelli`, `tua è nuova`) - carried by the anchored `must_not_include` and the negative reference on `trans_..._pron_01`.

## Edge patterns deferred to Architecture

Per Smith's steer, I did **not** author the high-frequency edges and instead put them to Architecture in `inter_chat/Architecture_PossessiveAuthor_edge_patterns.md`: the predicate `è mio` (no article), postposed forms (`casa mia`, `colpa mia`, `a casa sua`), and the reflexive `proprio`. These are common enough that leaving them uncovered is a real gap, but they need new buckets and a placement ruling that is Architecture's call, not an author's.

## Decisions you may want to push back on (largest first)

1. **Article-presence discriminations are MCQ, not free-text** (14 MCQ items). Forced by the marker; the alternative is an engine change. If you dislike MCQ density in the family leaf, the fix lives in the engine, not the items.
2. **A whole common construction is uncovered**: the predicate `è mio` and postposed `casa mia` get zero items this pass, pending the Architecture ruling. The pronoun items route around `è mio` deliberately.
3. **The suo leaf is proposed, not pre-existing**: 13 items forward-reference `possessive.discrimination.suo`. Until Architecture registers it, a strict production load would reject them.
4. **suppress on 34 items**: if you want the real breadcrumb visible on, say, the loro-invariable forms items (where naming "article" arguably sets a productive trap rather than leaking), tell me and I'll relax those.
