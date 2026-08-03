# AUTHOR_BRIEF Rev 33 — staged bundle (Architecture, 2026-08-03; lands as ONE rev)

Four additions, none yet in the live brief. Staged so the rev lands once, with a class-token notice,
rather than dribbling.

1. **Lexical-recall anchoring exception (ratified 2026-08-03).** `pres_lr_*`-class items DELIBERATELY
carry unanchored vocabulary stems ('parl', 'compr') on their vocabulary.it.<lemma>.verb.translation
markpoint — the two-test model's vocabulary half by design. Authors: word-anchor only the dangerous
short forms (fa, va, sa, so). Auditors and the anchoring gate: the lr class is EXEMPT from
anchor-everything; do not "fix" these.

2. **`common_errors` — now SPECIFIED (was unspecified; do not invent shapes).** OPTIONAL item-level
field: `"common_errors": [ { "surface": "<the wrong form as typed>", "misconception_id":
"<canonical registry id, optional>", "gloss": "<one line on why learners produce it>" } ]`.
No marking effect (it is not a guard); Housing may render it as a watch-out; analytics may join via
misconception_id, which MUST be registry-canonical (field-purity ruling, 2026-08-03) or absent.

3. **`person` field on verb-formation items (PENDING Smith's ratify of the name).** Values
`1sg|2sg|3sg|1pl|2pl|3pl`; null/absent on non-finite forms. Derivation plan revised 2026-08-03: id
tokens alone yield only 58% (620/1068; imperfect and trapassato ids carry no person token), so the
executor is a morph-it-assisted deriver over the answer forms, with author backfill ONLY where
morphology is genuinely ambiguous in context. Do not hand-add ahead of the central pass.

4. **Item-shape law cross-reference.** ITEM_SHAPE_no_change_forms.md is binding; the ratified boundary
(2026-08-03, InterrogativesAuthor's worked example): it bars blanks where copying an invariant cited
form wins; construction/agreement blanks whose answer differs from anything cued stay free-text.
