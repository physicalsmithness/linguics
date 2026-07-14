# Coverage: Articles (`article`)

**Author:** ArticleAuthor · **Brief:** Revision 14 · **Date:** 2026-07-14
**Files produced:** `grammar_questions_article.json` (51), `translation_items_article.json` (19), this coverage note, `glossary_suggestions_article.json` (1 term).
No `bucket_suggestions` file: everything homed in existing buckets (see the one open question on splitting the discrimination stub, below).

## What the topic tests

Two skills, as the dispatch framed them. First, picking the article's **form** for the sound that follows (the phonological selection) — the A1 bedrock, weighted heaviest. Second, knowing when Italian **uses or omits** the article where English differs — lighter, A2/B1.

## Item counts by bucket

| Bucket (label) | id | Grammar | Translation (required) |
|---|---|--:|--:|
| Choosing the definite form | `article.definite.forms` | 23 | 3 |
| Choosing the indefinite form | `article.indefinite.forms` | 14 | 5 |
| Using and omitting the definite article | `article.definite.usage_omission` | 6 | 6 |
| Using and omitting the indefinite article | `article.indefinite.usage` | 3 | 3 |
| With or without the article | `article.discrimination.with_or_without` | 5 | 4 |
| **Total** | | **51** | **19** (21 required-bucket tags) |

Translation split: 14 en→it, 5 it→en (novice-leaning, per the brief). 16 of the 19 carry a `polarity:"negative"` anti-anchor for the classic article slip.

The forms buckets are hit from every phonological trigger crossed with gender: s+consonant, z, gn, ps, y-loanword, plain consonant, and vowel (elision), in singular and plural, masculine and feminine — including the two gender traps where the sound rule is a red herring (`la zia`/`una zia`, `la studentessa`/`una studentessa`: z and impure s pull for lo/uno but the feminine forces la/una) and the plural-vowel trap (`le amiche`, not `gli amiche` or `l'amiche`).

## Marking policy (the load-bearing decision — please read)

The article forms are extremely short and collide badly under substring matching (`i` sits inside `gli` and `zii`; `un` inside `una`/`uno`/`un'`). Two engine facts shaped every form markpoint:

1. **`norm()` folds the apostrophe to a space** (`housing/js/norm.js`), so `l'amico` → `l amico` and `un'amica` → `un amica` at the marking layer. The elided article therefore surfaces as the bare token `l` or `un`.
2. **`match_at:"word"` is honoured** (shipped 2026-07-13) and a positive match wins before `must_not_include`.

So every form markpoint marks the **article token alone, word-anchored** on both `any_phrases` and `must_not_include`. That makes `uno` match in "uno studente" but stops `un` matching inside `uno`, and stops `i` matching inside `gli`/`zii`. I ran a faithful port of `norm()`+`occursAt()` over all 37 form items (143 assertions: every correct form and its "article+noun" variant hit; every named wrong form is caught). Result: all pass.

**Consequence you should know about:** because the apostrophe folds to a space, the deterministic engine **cannot distinguish `un'amica` from the missing-apostrophe miss `un amica`** (they normalise identically), nor `l'` from a bare `l`. So on the grammar forms items the apostrophe *precision* (un' vs un) is not gradable. What IS gradable — and is graded — is the real error class `una amica` / `uno amica`. The apostrophe rule ("feminine elides to un', masculine stays un amico") is taught in the explanations and graded properly in the **translation** items, where the AI sentence marker sees the apostrophe. This is a deliberate division of labour, not a gap. Flagging in case Architecture would rather make `norm()` stop folding the apostrophe (that would ripple through all elision handling project-wide — an architecture call; I have not touched it).

Zero-article-correct items (bare profession, city vs club, `ho fame`, `tutti i giorni`) are authored as **MCQ** so "no article" is a first-class choice; a wrong pick records a miss against the item's bucket (per `buildMcqResult`).

## Suppression (criterion 15)

Forms items are `info_display` visible (the breadcrumb "Choosing the … form" restates the task, doesn't hand over which form). All usage/omission and discrimination items are `info_display:"suppress"` (naming "using and omitting" or "with or without" tips that an omission choice is in play, which the learner should detect from context). 14 items suppressed; 37 forms visible.

## Flagged uncertain / decisions for Architecture

1. **Apostrophe ungradability (un' vs un, l').** Handled as above (explanations + translation). Confirm you're happy leaving `norm()`'s apostrophe-fold as is, or open a thread if you want it markable at the grammar layer.
2. **Discrimination stub.** `with_or_without` is a stub and now holds 5 grammar + 4 translation items spanning three distinct devices: proper-noun article (city vs football club), `tutto` + article, and fixed `avere` expressions (bare `ho fame` vs article-taking `ha l'influenza`). If you want per-device analytics, this could split into e.g. `discrimination.proper_noun`, `discrimination.tutto`, `discrimination.fixed_avere`. I did NOT create these (staying in role — flagging, not filling). Say the word and I'll re-home.
3. **Possessive overlap.** The family-member article rule (`mia sorella` drops the article, `la mia macchina` keeps it) genuinely sits between this topic and possessives. I authored only two article-side items (one grammar, one translation) and forward-referenced `possessive.adjective.family_exception` so PossessiveAuthor owns the core. Confirm that boundary so we don't double-author.
4. **`parlo italiano` vs `parlo l'italiano`.** I set the bare form as the correct MCQ answer (the taught norm: language drops the article after parlare, keeps it after studiare) and noted in the explanation that the article returns when qualified (`parlo bene l'italiano`). If you consider `parlo l'italiano` acceptable enough that the MCQ is too prescriptive, tell me and I'll reframe.

## Notes for the next dispatch

- All explanations carry the criterion-17 sentence gloss from the start; no retroactive touch needed.
- Vocabulary buckets are forward-referenced (`vocabulary.it.studente.*`, etc.) per standard; nouns carry `translation` and, where it conditions the article, `gender`.
- One glossary term suggested: **impure s** (`s impura`), leaned on across the lo/uno/gli explanations; registry is Architecture-owned, so it's a suggestion only.
