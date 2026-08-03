# Labels: what to fix, and why it is not the 523-label rewrite we queued

**Status: PROPOSAL, 2026-08-02, Architecture. 2026-08-03: Class-3 PP ruling MADE — `PP` is retired estate-wide, written out per site as "passato prossimo" or "past participle" as meaning demands, never reintroduced (DECISIONS 2026-08-03). Classes 1-2 still gated on Housing's flat-panel answer + the person-field migration. Nothing yet applied.**

## The scope, re-derived

The queued task said "523 labels". Derived from disk today: there are **776 bucket labels and 2,753
distinct markpoint labels**, so 3,529 learner-visible label strings. 523 was not measuring this.

Of those, **926 contain an abbreviation the estate invented**: 39 bucket labels and 887 markpoint
labels, covering 937 markpoint instances. But they are not one problem, and two thirds of them should
be **deleted rather than rewritten**.

## Three classes, three different fixes

### Class 1 — person abbreviations (673 uses). DELETE, do not rewrite.

`1sg` 143, `3sg` 123, `1pl` 112, `3pl` 110, `2sg` 104, `2pl` 81.

As of today these are **redundant**. The paradigm-band migration means a verb-formation leaf declares
`{field: "person", slots: [1sg…3pl], labels: [io, tu, lui/lei, noi, voi, loro]}` and the item carries
its person as a slot. The band shows the person; the label repeating it in shorthand adds nothing and
costs legibility. Strip the person from the label wherever the item carries a `person` field, and let
the structure say it.

### Class 2 — gender/number abbreviations (159 uses). MOSTLY DELETE.

`f.pl` 44, `m.sg` 42, `m.pl` 39, `f.sg` 34.

Same argument, weaker. `adjective_agreement` already splits gender and number as separate LEAVES, so
a label reading "m.sg in attributive position" repeats its own leaf. Where the leaf or the paradigm
slot carries it, strip it. Where it genuinely disambiguates within one leaf, spell it out
("masculine singular") rather than abbreviate.

### Class 3 — genuine internal jargon (218 uses). EXPAND, and expand consistently.

`PP` 80, `DOP` 68, `IOP` 43, `isc` 27.

These a learner cannot decode, and unlike "subjunctive" or "participle" they are not taught anywhere
— they are our shorthand leaking onto the screen. Proposed expansions: DOP → "direct object pronoun",
IOP → "indirect object pronoun", isc → "-isc- infix".

**`PP` needs a ruling before it can be expanded, because it currently means two things.** "PP of
dovere for 'had to and did' (ho dovuto)" is *passato prossimo*. "reflexive takes essere in PP" is also
passato prossimo. But "participle form" contexts elsewhere read naturally as *past participle*, and
both expansions are idiomatic English for "PP". An abbreviation with two live expansions in one estate
will be misread — by a maintainer before a learner. Recommend: retire `PP` entirely, write
"passato prossimo" or "past participle" explicitly at every site, and never reintroduce it.

## The house rule this should leave behind

**A label may use a grammar term the learner has been taught; it may never use an abbreviation the
estate invented.** "Subjunctive", "participle", "articulated preposition" are fine and are the named
term the explanation house style asks for. "DOP", "IOP", "PP", "isc", "3sg" are not terms, they are
our notes to ourselves.

## Cost, honestly

Classes 1 and 2 are mechanical and safe: a derived predicate (does the item carry the field the label
repeats?) drives the strip, and it is reversible. Class 3 is 218 sites and four expansions, of which
`PP` needs a decision first. So the job is smaller than "rewrite 523 labels" and most of it is
deletion, which is the cheapest kind of improvement.

**Open to challenge on:** whether stripping the person from labels loses something when a learner sees
a markpoint OUTSIDE a paradigm band (a flat result panel, say) where the structure is not visible.
That is the one place the abbreviation might be earning its keep, and Housing would know better than I do.
