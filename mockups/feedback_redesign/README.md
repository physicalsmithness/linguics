# Handoff: Linguics feedback colour system

## Overview

Rework of how Linguics marks correctness — in the translation feedback panel first, then across grammar, vocabulary and coverage. The existing panel states each error up to four times (pink fill, green chip beside it, coloured row border, and the word "Wrong") in a bright red that sits a shade from the maroon brand, so the whole panel reads as failure. It also never shows a good rendering of the prompt, and closes with a `Why:` block that restates what the top already said.

Four changes:

1. **Red is used once per error**, not four times, and is deepened so it reads as a marker's pen rather than an alarm.
2. **Green now marks what the learner got right** — including the correct spans of their own sentence, which were previously unmarked.
3. **A good translation is shown.** The panel never had one.
4. **The `Why:` block moves to the top** and becomes an attributed *Marker's note*, absorbing the old summary line.

## About the design files

`Feedback Panel.dc.html` is a **design reference created in HTML** — a prototype showing intended look and behaviour, not production code to copy. The task is to apply these decisions to the existing Linguics codebase (vanilla JS + `css/style.css`), editing that CSS and markup in place. Do not port the prototype's inline styles; they exist only so the prototype renders standalone.

The prototype is a design canvas holding seven turns of exploration, newest first. **Read `7a` ("Where we landed") and ignore everything below it** — turns 1–6 are the working-out, deliberately preserved, and several of them show rejected treatments.

`style.css` and `index.html` in this bundle are copies of the **current live source**, for reference when locating the classes named below.

## Fidelity

**High-fidelity.** Colours, type sizes, spacing and copy are final. Recreate faithfully.

## The scale

Four states, one meaning each. Three already existed in the app; only the red end is retuned.

| State | Token | Value | Status |
|---|---|---|---|
| Right | `--green` | `#235c3c` | deepened from `#2e7d4f` |
| Half right | `--amber` | `#b58a00` | **unchanged — reserved, do not reuse** |
| Needs changing | `--red` | `#7f2a24` | deepened from `#b03030` |
| Practised | `--touched` | `#4a89c7` | new use of an existing blue |

Supporting values:

```css
--green-wash: #e4eee7;   /* was #e9f6ee */
--red-wash:   #f8e7e4;   /* was #fdecec */
--touched:    #4a89c7;
```

`--accent` / wine `#8f2b45` is **wordmark and section labels only**. It must never carry a verdict — a verdict-coloured brand hue was half the original problem.

### Why these two values

Green dropped because `#2e7d4f` read bright against the `#fdfaf4` cream. That left red as the only shouting mark, so it drops in step. Oxblood `#7f2a24` is the one candidate darker than every tint in the nine-cell brand logo (`#8f3a44` / `#b06b76` / `#d6aab0`), which is what keeps it reading as a mark rather than a second brand colour. Rose `#b0616e` was tried and rejected: it is within a step or two of the logo's mid tint `#b06b76`.

Amber is untouched on purpose. It already means partial (`.markpoint.partial`, `.outcome-status.outcome-partial`, `.cmp-value.cmp-learner-partial`, `flash-warm`), and an accent slip genuinely *is* half right.

## Screens

### 1. Translation feedback panel

**Purpose** — mark a submitted translation and teach from it.

**Order, top to bottom** (this is a change; the old panel ran score → sentence → cards → Why):

1. `Marker's note` — label 10.5px uppercase, `letter-spacing: .08em`, `--muted`, weight 600. Body 13px italic, `line-height: 1.55`, colour `#4a4a4a`, on `#f6f2e8` with a `3px solid #d8d2c2` left rule and `border-radius: 0 3px 3px 0`, padding `10px 13px`. Score `1 / 3` sits top-right at 12.5px, `font-variant-numeric: tabular-nums`.
2. `Your sentence` — 20px, `line-height: 1.6`. Per-span marking (see below). Legend beneath at 11.5px: a 15×2px green bar "right", a 15×2px red bar "needs a change", a 2×12px red bar "something missing".
3. `A good translation` — label in wine, uppercase 10.5px. Body 20px, `line-height: 1.5`, **no verdict colours** — a correct sentence carries no marks.
4. Topic cards — one per grammar leaf.

**Per-span marking** — on the learner's own sentence only:

- correct span → `text-decoration: underline; text-decoration-color: var(--green); text-decoration-thickness: 2px; text-underline-offset: 4px`
- wrong span → same, with `var(--red)`
- missing word → a zero-width inline marker in the gap: `border-left: 2px solid var(--red)`, height matching the line, `margin: 0 5px`, `aria-hidden="true"`. The old diff missed omissions entirely.

**Topic cards** — the biggest structural change:

- Card is `background: #fff; border: 1px solid #e6e1d6; border-radius: 3px; padding: 10px 12px`. **No coloured left border** — it judged a word four inches away.
- Grid: `1fr 150px`, `gap: 12px`, `align-items: center`.
- Left cell: topic name 13.5px weight 600 in **ink `#1c1c1c`, not wine** (three stacked wine headings beside red marks read as a third verdict). Optional grammar note beneath, 11.5px italic `--muted`, `line-height: 1.45`.
- Right cell carries a `2px solid` rule on its left edge with `padding-left: 10px`, in `--red` or `--green`. Inside, `display: flex; align-items: baseline; gap: 7px`:
  - needs-changing → learner's word 15.5px in `--muted` with the same red underline used in the sentence · `→` 14px in `--red` · correction 15.5px weight 600 in ink
  - got-it → the value 15.5px weight 600 in `--green`, e.g. `non ho ✓`

**Deleted outright**: the word "Wrong"; the paired `.cmp-value.cmp-learner` / `.cmp-value.cmp-correct` chips; the words "you wrote" inside cards (the arrow implies them); the trailing `Why:` block.

### 2. Grammar

- `.mcq-choice.wrong-pick` — `background: var(--red-wash)`, `border-color: var(--red)`, plus a small 11px `your pick` label in `--red`. `.correct-pick` keeps green.
- `.errorid-word.wrong-pick` — same swap, **and remove `text-decoration: line-through`**. It repeats a verdict the colour already gave, and damages a word the learner still has to read.
- `.errorid-word.reveal-correct` — unchanged green.

### 3. Vocabulary

- `.gender-choice .gc-wrong`, `.spelling-choice .gc-wrong`, `.stress-choice .gc-wrong` — as above.
- `.accent-slip-banner` keeps amber. Its CSS comment says amber was chosen to sit "distinct from right/wrong colouring"; under this scale it is not outside the scale, it *is* half right. Same colour, better reason.

### 4. Coverage

`.freq-flank-cell.has-practice` and `.vocab-lemma-dot.has-practice` currently ring green (`rgba(27,138,74,.85)`) for having been *practised* — right or wrong. So a topic the learner keeps failing looks like one they have, and it sits on screen beside green-means-correct.

```css
.freq-flank-cell.has-practice,
.vocab-lemma-dot.has-practice { box-shadow: inset 0 0 0 1.5px var(--touched); }
```

Legend becomes: got it right (green fill) · tried, not yet right (blue ring) · yet to get (empty `#e9e3cf`) · not achievable (grey `#d9d6cc`).

- `.last-n .mark.miss` → `var(--red)`. **Add `.mark.partial`** rendering `≈` in amber, so half-right stops rounding down to a miss.
- `.strip-box9` `flash-bad` `#d04848` → `var(--red)`, so the strip and the drills agree. `flash-warm` / `flash-good` unchanged.

## Typography

Unchanged from the live app — Fraunces for the wordmark and headings (`.wordmark` at `font-weight: 550`, `letter-spacing: -0.01em`, lowercase, `.wm-ics` in `--accent`), Lora for body. The prototype loads both from Google Fonts.

## Order of work

1. Retune `--green` to `#235c3c`, `--red` to `#7f2a24`; add `--touched`.
2. Reduce each wrong state to **one** red signal — drop the doubled fill/outline where both fire.
3. Move the topic-card rule inside, beside the correction; make the pair an arrow diff.
4. Remove the line-through and the word "Wrong".
5. Move `Why:` to the top, relabel as `Marker's note`, delete the footer copy.
6. Add the good-translation line.
7. Per-span marking on the learner's sentence and in the cards.
8. Coverage to `--touched`; add `.mark.partial`.

Steps 1–4 are mechanical and land most of the change. 5–8 need data or a legend update.

## Data requirements

- **Per-span verdicts** — already returned by the marker. No backend work needed for the sentence or card marking.
- **A good translation** — *not currently in the payload.* The marker must return a model rendering of the prompt. This is the one blocker; everything else can ship without it.

## Interactions

The final design is static — no hover or click behaviour beyond the app's existing focus states. (Turn `1b` in the prototype explores a click-to-reveal treatment; it was **not** chosen.)

## Assets

None new. The nine-cell `.brand-logo` and the wordmark are existing markup in `index.html`; the prototype reproduces them inline purely so the colour comparison could be judged against real brand marks.

## Files

- `Feedback Panel.dc.html` — the prototype. **Read `7a` only.**
- `support.js` — runtime the prototype needs to open in a browser. Not part of the design.
- `handoff.md` — condensed version of this document.
- `style.css`, `index.html` — copies of current live source, for locating the classes above.

## A judgement call worth knowing about

The marker's note is third-person AI copy generated per submission, so its tone can't be controlled from CSS. Boxing and attributing it is the hedge: a clumsy generation then reads as one marker's remark rather than the app's own voice, and the deterministic topic cards beneath still teach when the note is poor. If the prompt is later constrained to address the learner directly, the box can go.
