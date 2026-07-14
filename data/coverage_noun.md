# Coverage: Nouns (`noun`)

Authored by NounAuthor against AUTHOR_BRIEF **Revision 14** (criterion 17 English glosses throughout; terse-label rule respected; house-technique patterns used where noted) and DISPATCH_noun.md. Counts below are grepped from the shipped files, not from memory of batches.

## Bucket-to-item counts

| Bucket (label) | Grammar | Translation (required) |
|---|---|---|
| -o masculine, -a feminine | 4 | 1 |
| -e nouns (gender to learn) | 9 | 3 |
| Irregular gender | 7 | 3 |
| Regular plurals | 6 | 3 |
| Spelling shifts in the plural | 11 | 5 |
| Invariable nouns | 6 | 2 |
| Irregular plurals | 6 | 4 |
| Plural of compound nouns | 3 | 1 |
| **Totals** | **52** | **22 items** |

Translation direction split: 14 en→it, 8 it→en (novice topic, so weighted toward production into Italian, per the brief's "maybe more en→it for novices"). Several translation items also cite optional buckets in sibling trees (articulated prepositions alla/sui; noun gender on the mani item).

## Rule-internalisation check (per the content-authoring criterion)

Judged by whether each rule is hit from several angles, not by item counts. The two hot bedrock leaves carry the load:

- **Gender** is drilled three ways: article completion (il/un vs la/una, both definiteness values of the correct gender accepted so only gender is tested), predicate-adjective agreement (feminine-tested only, so the masculine citation revealed by help is never the answer), and translation in both directions. The -e leaf gets a wide lexical spread (fiore, notte, pane, chiave, fiume, nave, nome) because it is pure per-word learning, plus the meaning-conditioned homograph pair il capitale / la capitale (house technique 3). Irregular gender covers all four sub-patterns: Greek -ma (problema, programma, tema), feminine -o (mano, foto, radio), and masculine -a person (poeta).
- **Plural** hits -o/-e→-i and -a→-e from six regular angles, then the spelling leaf (the heaviest at 11) covers every branch: soft -co/-ci (amico, medico), hard -co/-go +h (fuoco, ago), feminine -ca/-ga +h (amica, barca), -cia keep-vs-drop i split (camicie vs arance), -gia drop (piogge), and the stressed/unstressed -io contrast (zii vs figli). amico is planted inside the regular-looking set as the exception (house technique 2). Invariable covers accented finals, foreign words, monosyllables, -i endings and clipped words. Irregular plural covers suppletive (uomo), gender-switchers (uovo, paio) and the meaning-split braccia/bracci pair. Compound covers the three behaviours (final-element capolavori, noun-part asciugamani, invariable portachiavi).

## info_display: suppress rationale (26 of 52 grammar items)

Applied per criterion 15's leak-vs-trap test, decided per item, not per leaf:

- **Suppressed** where the breadcrumb names a non-derivable class the item tests: all **Irregular gender** items (the "-a is a trap" fact is exactly what's tested), all **Invariable** items (the breadcrumb *is* the answer, "doesn't change"), all **Irregular-plural** items except the braccia/bracci pair, all **Compound** items, and the **Spelling** items where the naive ending-swap yields a wrong form (ago→aghi, fuoco→fuochi, amica→amiche, barca→barche, arancia→arance, pioggia→piogge): naming "spelling shift" there hands that an extra change is needed.
- **Left visible** where the breadcrumb only restates the cue or sets a productive trap the `must_not_include` catches: all **Regular gender** and **Regular plural** items; the **-e nouns** items (the class is visible from spelling and the breadcrumb never says which gender); and the **Spelling** items where the naive swap is already correct so the breadcrumb only tempts a catchable over-correction (amico→amici tempts amichi; figlio→figli tempts figlii; camicia→camicie tempts camice; zio→zii). The braccia/bracci pair stays visible because *meaning*, stated in the prompt, conditions the answer, not the breadcrumb.

## Marker-safety (verified by harness, not asserted)

A Python port of `housing/js/norm.js` + `grammar_engine.js` (any_phrases-before-must_not_include, `match_at` word/start/end anchoring, accent-folded fallback) was run over every item: each correct form → hit; each `must_not_include` form → attempted-miss with no false credit; blank → not-attempted. 0 failures, 0 warnings.

Three engine facts drove the authoring and are worth recording:

1. **`norm()` turns apostrophes into spaces**, so `un'amica` normalises to `un amica` and the elision gender-tell collapses (`un'` and `un` both become `un`). Every gender item therefore cues via a consonant-initial article or a predicate adjective, never via `un'`/`un` before a vowel.
2. **Positive match wins before `must_not_include`**, so any answer that is a prefix of a plausible wrong form is anchored with `match_at`. The load-bearing case is `bracci` (mechanical arms), a prefix of `braccia` (body): anchored `match_at: "end"`, so a learner who wrongly types `braccia` on the mechanical item falls through to a correctly-attributed miss instead of false credit. Same discipline on `un` (inside `una`), `figli` (inside `figlii`), `zi` (inside `zii`), `re` (inside `tre`).
3. **The accent-folded fallback makes accents soft by default.** `città`/`caffè` items credit a missing accent (`citta`) as a recorded orthography slip, not a wrong answer. No noun here has a load-bearing accent (no minimal pair), so `accent_load_bearing` is not set anywhere.

## Phase-3 misconception tagging (registry is Architecture-owned; not tagged here)

The wrong forms in `must_not_include` are ready for Phase-3 attribution. One correction for whoever runs that pass: **DISPATCH_noun.md names `omitted_h_hard_cg` and `double_i_retained` as the targets, but those two registry entries are the verb-formation tags** (-care/-gare and -ciare/-giare). The noun-plural analogue that already exists is **`orthography.cg_plural_stress_misapplied`** (its label literally says "plural"), which is the right home for the -co/-go/-ca/-ga misses (amichi, agi, fuoci, amice, barce). The **-cia/-gia noun i-retention split** (arance vs arancie, camicie vs camice, piogge) has **no exact registry tag** — closest are the verb tags `double_i_retained` / `i_retention_error`. Flagged for Architecture: either widen one of those tags to cover nouns or add an `orthography.cia_gia_plural_i` entry. I did not invent a tag (stay-in-role).

## Items flagged uncertain

- **`noun_plur_irr_05` (dito → dita).** The standard collective plural is `dita`; the technical `diti` (fingers counted individually) is deliberately kept out of `must_not_include` so it falls to a generic miss rather than being branded a clear error. If Architecture wants `diti` credited at reduced weight, add it to `any_phrases` as `{"phrase":"diti","credit":0.6}`.
- **Predicate-adjective gender items** (`noun_gen_reg_03`, and the design generally) bucket the miss at `noun.gender.*` while the surface skill is adjective agreement. Intentional (the diagnostic is the noun's gender, stated in `examiner_note`), but if the cross-tree double-counting bothers the stats panel, these three could be re-pointed or dropped without hurting coverage.
- **Both-articles acceptance on gender items.** Masculine items credit both `il` and `un` (feminine, both `la`/`una`), because definiteness is not what's tested. If Housing renders a single-slot blank the learner may not realise both are fine; the explanation says which is natural. No marker risk.

## For the next dispatch / Architecture

- `bucket_suggestions_noun.json` **NOT produced**: the supplied tree covered everything authored; no new noun buckets were needed.
- `glossary_suggestions_noun.json` proposes three new terms — **gender**, **suppletive plural**, **clipped word**. `agreement`, `invariable` and `articulated preposition` already exist and are reused, not re-proposed.
- **`data/manifest.json` needs `noun` added** to the topics list so the loader discovers the two item files. I have **not** touched the manifest (shared/architecture-owned per stay-in-role); flagging it here for Housing/Architecture to wire, the same way the relative_pronoun batch flagged it.
- No new engine ask. The `match_at` per-phrase anchoring this batch relies on shipped 2026-07-13; the brief's Rev-14 text still describes `match_at` as a "future engine extension… support is partial" and as markpoint-level — the same errata the relative_pronoun coverage already flagged. Restating so it isn't lost.
