# The analysis canvases: a catalogue of views to scroll

**Author:** MisconceptionAnalyst · 2026-07-20 · proposal for the full-screen analysis. Nothing built.
**Context:** Smith wants each full canvas to be "many, many different ways of showing stuff... scroll down lots and lots of interesting views." So each canvas is an ordered SCROLL of views, not one screen. Two canvases: coverage (page 1, "a bit coveragier") and misconceptions (its own stage). This is the running order I'd propose for each; take, drop or reorder freely.

House style throughout: serif / cream (#fdfaf4) / navy (#3a4f8a) / CEFR tints / green-blue coverage cells (`housing/css/style.css`) + the data-tables skill. The ratified cell convention (5.3.5): hue = correctness, fill-fraction = attempted-rate.

Keys every view can group by (Smith: "everything should be retrievable"): **skill-region, person, tense, conjugation-class, strand, misconception family/specific, verb-identity, preposition-identity, and the raw wrong form.** Person is just one of these, not special.

Legend: **[ready]** computable now · **[partial]** needs a field spread or tagging · **[bespoke]** hand-shaped, one topic · **[mine]** analyst-owned · **[Housing]** build · **[Arch]** needs a ruling first.

---

## Canvas A — Coverage (the big version of the cramped live-aside)

The cramped right-hand aside stays for pinging along while answering. This is its full-canvas sibling: same data, room to breathe, many cuts.

1. **Strand KPI strip** — attempts, mean credit, mean attempted-rate, weakest buckets at CEFR level. [ready] [Housing]
2. **Full taxonomy heatmap** — the whole bucket tree, drillable, hue+fill cells. The expansive version of the aside. [ready] [Housing]
3. **Person × tense grid** — 1sg..3pl down, present / imperfect / future / condizionale / passato remoto / ... across. The intuitive verb-coverage matrix. [partial: person is 21%, verb-forms only — needs the backfill Smith approved] [Housing]
4. **Person × conjugation-class grid** — the three regular classes -are / -ere / -ire broken out (they ARE separate buckets; congiuntivo bundles ere+ire), plus the orthographic-change and irregular families. [partial] [Housing]
5. **Single irregular verb × tense** — "how is fare across every tense." [partial + flagged: likely too few questions per (verb × tense) cell yet — a volume message to the verb authors, and a reason to hold this view until the item bank is deeper]
6. **Tense-choice confusion matrix** — chosen tense (rows) × correct tense (columns); the diagonal is right, off-diagonal shows which tense they reach for wrongly. Particular to tense_choice; the natural way to see it. [bespoke] [ready once the candidate_tenses fields feed it] [mine to spec, Housing to build]
7. **Piacere per-verb grid** — one row per tested verb (piacere, mancare, servire, interessare...), columns for direction (mi piaci vs ti piaccio), pluralisation (piace vs piacciono), figurative use. [bespoke] [mine to spec]
8. **Coverage gaps / not-yet-attempted** — empty cells foregrounded: what the learner hasn't tried at all, distinct from tried-and-wrong. Uses attempted-rate = 0. [ready] [Housing]

Bespoke grids (6, 7) are the point Smith kept returning to: the generic group-by covers everything, but the insight jumps out of a hand-shaped grid.

---

## Canvas B — Misconceptions (its own stage)

The DESIGN §15 drill-down, as a scroll. A cramped misconception aside (twin of the coverage aside) is also wanted, later; this is the full canvas.

1. **Family heatmap** — the 17 families × recency-weighted mastery. The §15 baseline (P1). Smith asked to see this one; it leads the misconception canvas. [ready] [Housing]
2. **Surface-lens strip** — the 8 lenses (`data/misconception_lenses.json`): accents, spelling, word order, agreement, building irregular forms, choosing the right form, L1 interference, pronoun machinery. Each expands to a within-lens drill by skill region. Smith's favourite (P3). [ready where tagged] [mine, delivered]
3. **Top recurring errors** — flat leaderboard, recency-weighted, ignores every tree. "Your top 5 right now." (P6) [ready] [Housing]
4. **Cross-kind spotlight** — one family spread across skill-kinds: "you drop accents on verbs, nouns AND monosyllables." The USP sentence (P5). [ready] [Housing]
5. **Region × family cross-tab** — pick a region (verb formation, pronouns), see its family mix. Answers "verb formation" and "pronouns" as error-type breakdowns (P4). [ready] [Housing]
6. **Over- vs under-application** — "haven't learnt the rule" vs "learnt it, over-applying." Uses the mirror pairs; a maturity read. Smith loved this (P7). [partial: needs mirror_of marked on the paired specifics — a registry pass, mine to propose] [Arch then mine]
7. **Strand / production-vs-comprehension** — same error in free translation but not targeted grammar, and (pending the v15 decision) the reading-side arm. (P8) [partial: comprehension arm blocked on the open v15 question]

**Dropped from my first cut:** person × family (P2). Smith cooled on it ("a bit funny; missing accents in the 1st person - depends"). Person's real home is the coverage grids (A3, A4), crossed with tense/class, not with family. Recording the drop so it isn't silently revived.

---

## What's analyst-owned here, and its state

- **Surface lenses (B2)** — delivered: `data/misconception_lenses.json`.
- **Tense-choice confusion matrix (A6)** and **piacere per-verb grid (A7)** — specs to write next; both bespoke, both mine to spec / Housing to build.
- **Over/under mirror-marking (B6)** — a registry proposal (`mirror_of` field) I owe Architecture.
- Everything else is Housing to build / Architecture to schema. The coverage canvas (A) is mostly Housing; the misconception canvas (B) is where my axis lives.
