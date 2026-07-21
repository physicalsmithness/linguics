# Misconception reporting: a menu of prisms

**Author:** MisconceptionAnalyst · 2026-07-20 · proposal, nothing built
**For:** Smith and Architecture. Routed via `Architecture_MisconceptionAnalyst_reporting_prisms.md`.
**Status of the data underneath:** registry 17 families / 75 specifics (→~93 once the pass-1 extension ratifies); Housing already records `misconceptionHits {id, bucket, evidence}` per attempt; the `person` field exists on items but is only 21% populated so far.

---

## 1. The one idea

The **skill tree** (Stats Pane 2) answers *"which topics am I weak in?"* — it is one tree, keyed by bucket. The **misconception axis** (DESIGN §15) answers *"what KIND of mistake do I make, across topics?"* — also one tree, keyed by family→specific. You are asking for **more than those two trees**: orthogonal roll-ups that neither tree gives on its own ("missing accents", "2pl/3pl", "pronouns", "spelling", "word order", "verb formation").

The good news is that they are not eight bespoke screens. **Every misconception event already carries four orthogonal keys**, and a "prism" is just a *group-by* on one, or a *cross-tab* of two:

| key | what it is | example values | ready? |
|---|---|---|---|
| **A. family / specific** | the error TYPE | agreement, accent, word_order, regularisation … (17) / 75 leaves | ready (primary) |
| **B. skill-region** | WHERE it fired (bucket tree) | `verb_form.*.formation`, `pronoun.direct_object.*` | ready |
| **C. person** | 1sg…3pl / null | 3pl, 2pl (noi/voi), … | **partial — 21%, verb-forms only** |
| **D. strand** | grammar vs translation | grammar / translation | ready (translation AI-emit is Phase-3 tail) |
| **E. surface form** | the actual wrong string | `parlarò`, `sò`, `melo` | ready (evidence field) |

So the cheap, general recommendation is: **one flexible group-by widget over the event log, not N hand-built views.** Pick the key(s), get the prism. Everything below is an instance of that.

**The vocab precedent is exact.** Vocab `themes` sit over lemmas as a *second viewing axis* beside frequency, and Vocab owns the editorial cut (the 94-chip list). Misconception **"surfaces"** should sit over families the same way — a coarse, learner-facing layer — and I own that editorial cut, exactly as Vocab owns theirs. That is Prism 3, and it is the one that most directly answers your list.

**View = diagnosis; drill = treatment.** Every prism that groups by a *stable* key is also a session filter — i.e. a **Special Drill**. The accent drill and stress drill you're adding are the *action* side of the accent and stress *views*; they should be defined by the **same** axis, not separately. And because the misconception axis spans strands, a misconception-fed drill (say, an accent drill) pulls from grammar **and** translation at once — something a strand-local drill like today's gender drill cannot do. That is the deeper prize: the view and the drill are the same object seen twice.

---

## 2. The prisms

Each: what it answers · which keys · readiness · does it double as a drill · the sentence it produces.

### Prism 1 — Family heatmap (the §15 baseline)
Group by **family → specific**. The spine already specced in §15. Rendered in the ratified cell convention (hue = how wrong, fill = how much attempted, per 5.3.5).
*Sentence:* "You over-regularise irregular verbs; you drop written accents."
Readiness: **ready.** Drill: yes (per family). This is the default; the rest are alternative or complementary cuts.

### Prism 2 — Person prism (the 2pl/3pl one you flagged)
Group by **C. person**, optionally × family. This is the "could easily be a big mess" you named — made legible.
*Sentence:* "Your verb errors cluster in **noi/voi**" (stem stress shift, -isc- over-extension, the -mmo geminate) "and in **3pl**" (-ano/-ono, antepenult stress). A learner who is fine in the singular and falls apart in 1pl/2pl is a *specific, coachable* profile the family axis alone hides.
Readiness: **partial and honest** — the `person` field is live but only on 21% of items (present, condizionale, gerundio, congiuntivo, imperativo, trapassato). It is **not yet** on imperfect (2/118), passato prossimo (0/103), or the non-verb topics. So this prism is real **for verb formation today** and needs the backfill to spread. Also: person is only meaningful for **finite-verb** events — for pronouns the analogous axis is the clitic's person/case, for adjectives it is the noun's gender/number, so the prism must **filter to verb events**, not show "person" on an adjective miss.
Drill: yes, and a good one ("drill my voi forms").

### Prism 3 — Surface lens (super-families) — *the one that answers your list directly*
A small **editorial grouping over the 17 families**, learner-facing, the misconception twin of vocab themes. My proposed first cut (yours to prune, mine to author in full):

| lens chip | rolls up | answers your item |
|---|---|---|
| **Accents & silent letters** | accent_silent_letter + the added-accent orthography specific | "missing accents" (and the hypercorrect *sò/hò*) |
| **Spelling that tracks sound** | orthography + gemination | "small spelling mistakes" |
| **Word order** | word_order | "word order" |
| **Agreement** | all agreement.* (gender/number/person; adjectives, participles, articles, clitics) | the gender-drill surface, generalised |
| **Building irregular forms** | regularisation + stem_change + conjugation_class | "verb formation" (morphology half) |
| **Choosing the right form** | paradigm_confusion + discrimination + auxiliary_choice + mood | tense/mood/preposition/pronoun *choice* |
| **English (or L1) interference** | transfer | the calque surface |
| **Pronoun machinery** | clitic_cluster + word_order.clitic_* + paradigm_confusion.dop_iop/clitic_vs_stressed + agreement.clitic_* | "pronouns and direct object pronouns" |

Note two of your items ("verb formation", "pronouns") are **not** single families — they are a *skill-region* crossed with several families, so they live half here (the lens) and half in Prism 4. That split is real, not a fudge.
Readiness: **needs one editorial file from me** (≈ a day, same shape as Vocab's chip list). Once it exists, **each chip is simultaneously a view and a drill** — this is literally where the accent drill and stress drill get fed from. Highest leverage item in this document.

### Prism 4 — Skill-region × family cross-tab ("verb formation", "pronouns")
Pick a **skill-region** (B), show the **family** (A) breakdown inside it.
*Sentence:* "In **verb formation**, your misses are 60% regularisation, 25% stem-change, 15% accents" — or "In **pronouns**, 40% position, 30% cluster-form, 20% dop/iop confusion."
This is exactly "verb formation" and "pronouns / direct-object pronouns" as you asked, because those are regions of the skill tree, not error-types.
Readiness: **ready** (events carry both keys). Drill: yes (drill a region, weighted to its worst family).

### Prism 5 — Cross-kind spotlight (the marquee §15 payoff)
Invert Prism 4: pick **one family**, show it **spread across skill-kinds**.
*Sentence:* the USP line — "You don't have a *verbs* problem: you **drop accents everywhere** — on verbs, on nouns, on monosyllables." Or "your **agreement** slips show up on adjectives, participles, articles AND clitics alike." §15 already wants an "observed cross-kind" flag; this makes it a first-class screen because it produces the single most motivating sentence the whole registry can say.
Readiness: **ready** the moment tags accrue. Drill: "hit my agreement everywhere" — a genuinely novel, cross-topic drill.

### Prism 6 — Top recurring errors (flat leaderboard)
Ignore every tree; rank **specifics** by recency-weighted frequency.
*Sentence:* "Your top 5 mistakes this fortnight, in order." The most *actionable* cut; §15's "top-errors summary".
Readiness: **ready.** Drill: "practise my top 5" — probably the default drill of the whole feature.

### Prism 7 — Over- vs under-application (a maturity prism)
Use the **mirror structure** I've been building (over-extension vs under-application; pp_for_imperfect ↔ imperfect_for_pp; the v5 direction rule). Group errors into *"haven't learnt the rule yet"* vs *"learnt it and over-apply it."*
*Sentence:* "Your -isc- errors have flipped from *forgetting* it to *over-using* it — you're mid-rule." An over-application error is a **more advanced** learner state, and showing that is encouraging in a way a flat "wrong" is not.
Readiness: **needs the mirror pairs marked as pairs** in the registry (a `mirror_of` field; some entries already have it, most don't). A registry pass, mine to propose.

### Prism 8 — Strand & production-vs-comprehension split
Group by **strand** (D). Does an error appear only in free translation, never in targeted grammar? That is "can do it when prompted, not in the wild" — a real signal. The second half (production vs **comprehension**) depends on the open v15 question: does the registry want a reading-side arm at all? (14 buckets are comprehension misses today, deferred.)
Readiness: strand split **ready**; comprehension half **blocked on the v15 decision.**

---

## 3. Taming the "big mess" you predicted

You said 2pl/3pl "could easily be a big mess." It can: 93 specifics × 7 persons is an unreadable 651-cell grid. Three rules keep it honest, and they generalise to every cross-tab prism:

1. **Roll up the second axis.** Within a person, show ~8 **families**, not 93 specifics. Expand a cell to specifics only on click. 7 × 8 is a glanceable grid; 7 × 93 is noise.
2. **Filter to where the axis means something.** Person only on finite-verb events. Never render a "person" column on an adjective or preposition miss.
3. **Attempted-rate gates colour.** The 5.3.5 convention already does this: an empty cell (not attempted) reads differently from a pale one (attempted, fine). A cross-tab of mostly-empty cells shouldn't shout.

---

## 4. What I'd build first (cheap × high value)

- **Prism 3 (surface lens).** I author the grouping file — same effort as Vocab's chip list. It alone delivers *missing accents, spelling, word order, agreement, verb-formation-morphology, interference,* and **directly feeds the accent and stress drills.** One file, seven of your asks.
- **Prism 2 (person)** for verb formation — the field exists; it needs the group-by plus the backfill spread. This is your 2pl/3pl cut.

Those two, plus the leaderboard (Prism 6, nearly free), cover your whole list except "pronouns" (Prism 4, also ready). Prisms 5/7/8 are the richer, later payoffs.

---

## 5. Decisions this needs (for Architecture)

1. **Adopt the four-key event schema** — ensure `person` and `strand` ride on every misconception event alongside `misconception` + `bucket` (Housing stores the first two today). Without person on the event, Prism 2 can't be computed even where the item carries it.
2. **Adopt the surface-lens layer and let me author it** — the analyst owns the editorial cut, as Vocab owns themes. This is the biggest single unlock.
3. **Spread the person backfill** beyond the six verb-formation topics (imperfect and passato especially), or accept that Prism 2 is verb-forms-only for now. Your call on priority.
4. **Ratify that a view and its drill share one axis definition** — so "accent drill" is defined as "the accent lens as a session filter," not a separately-authored mode. This is the architectural knot that stops the drills and the views drifting apart.
5. **The comprehension arm (v15)** gates Prism 8's second half — still open.

Nothing here is built. It is a menu; take all of it, one of it, or reorder it.
