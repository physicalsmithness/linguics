# Accents and stress: two new drill strands (Smith's design, 2026-07-20, captured same-hour)

Two dedicated author seats to be dispatched (Smith's call: "two dedicated chats... two special drills which sit
alongside the gender drill"). This doc is the captured design; the dispatches derive from it. Decoded from
dictation; anything marked (?) needs Smith's confirmation before it hardens.

## A. The ACCENT strand

### A1. The report (design first, per Smith: "before we get to what the drill might look like, what should the report be")

- **One row per accent TYPE**: è (grave e), é (acute e), à, ì, ò, ù. Per row: how correct, and WHICH error mode:
  - **omitted** (typed bare vowel where accent required)
  - **wrong kind** (grave for acute / acute for grave — mostly the e-pair; Smith: acute-where-grave "may be more
    common than we anticipate because people can put the wrong one in")
  - **inserted where not required**
- **The visual, specced precisely**: per type, a **double-height box** = a stacked bar filled by PERCENTAGE of
  that type's attempt outcomes: dark green = correct, red = omitted, orange/yellow = wrong-kind. (His worked
  sequence confirms it is the running outcome distribution: 1 correct → all green; +1 omitted → half/half;
  +1 wrong-kind → thirds green/orange/red; +1 correct → half green, quarter orange, quarter red.)
- **Below each stack: a small gap, then a quarter-height red slice for INSERTIONS** — accents typed where none
  belongs, attributed to the accent type the learner typed (including the rare wrong-vowel case: an ì typed
  where no i-accent exists still files under i, "for the benefit of catching that very rare case").
- **Grouping toggle — placement CLASSES**, a second lens over the same events. Smith: "give this to an agent to
  propose the classes." Seed classes from his dictation: -ché words (perché/poiché — the acute-é conjunction/suffix class; distinct from c'è, whose accent belongs to the meaning-bearing è); final-stressed -tà nouns
  (città, opportunità, modalità); MEANING-BEARING pairs (an unaccented twin word exists: e/è, da/dà, la/là,
  si/sì); TENSE-BEARING (passato remoto 3sg parlò — "a change of tense, quite major"); pronunciation-changing
  vs not. Agent proposes the full taxonomy; Architecture ratifies; events tag both type AND class.
- Data note: the pulse/slip events already ruled (2026-07-20 login spec + live_round2) record word + accent
  class per slip — this report reads those. One event schema feeds marking display, pulse, and this report.

### A2. The drill

- **Big volume of very fast micro-items**: all options shown, answer by typing 1/2/3/4 (or tapping); "is this
  correct?" judgements and pick-the-right-form; some with sentence context, some bare; speed is the point.
- Sits alongside the vocab/gender drill as a special drill, not inside the grammar strands.

### A3. Open questions
- Are wrong-kind accents penalised in Italian exams? (Smith doesn't know; worth a content ruling before the
  marker's wrong-kind verdict wording is written.)
- ~~stack order~~ RULED by Smith 2026-07-20: **green (correct) at the bottom, orange (wrong-kind) in the middle, red (omitted) at the top.**

## B. The STRESS strand (pronunciation; "completely undone so far")

### B1. The drill
- Item: a word (sometimes alone, sometimes in a sentence with the target word in a distinct colour). Options
  1-4 = the word with a different syllable EMBOLDENED (stress on last / penultimate / antepenultimate /
  fourth-last). Learner types/taps 1-4.
- Needs DATA: stress position per word — new vocab metadata field (stress_syllable, counted from the end),
  authored/derived for the drilled corpus. The seat's first job is the data spec + seed set.

### B2. The report: a stress CONFUSION MATRIX
- Grid: actual stress position (rows) × answered position (columns), 4×4. Leading diagonal green (intensity
  0-100%), off-diagonal dark red (intensity) — "so you can see where the misconceptions lie".
- **Normalisation (Architecture's proposal to Smith's open question):** row-normalise — each cell = share of
  answers GIVEN that row's true class. This directly solves his worry ("there will be so many penultimate
  stresses"): the dominant class no longer swamps the picture, and each row reads as "when the stress is
  actually here, where do they put it?". Show a per-row attempt-count badge so thin rows are not over-read.
  Toggle raw-counts view for the honest volumes. Corpus-frequency weighting: parked (Smith: "forget about
  that" — revisit only if the row view misleads).

## C. Sequencing
1. Architecture writes the two dispatches (next pass) + fires the placement-class taxonomy agent.
2. Seats author data + items; Housing builds the two reports (specs above) when data shapes exist.
3. Both drills adopt the pulse from day one (maximal payload; the accent events are already specced).
