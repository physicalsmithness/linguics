# Linguics — feedback colour handoff

Companion to `Feedback Panel.dc.html` (canvas: turn 3 top, then turn 2, then turn 1).
Every change below is CSS-only unless marked **markup** or **data**.

## 1. The scale

Four states, one meaning each. Three already exist in the app; only the wrong end is retuned.

| State | Token | Value | Status |
|---|---|---|---|
| Right | `--green` | `#235c3c` | **deepened** from #2e7d4f |
| Half right | `--amber` | `#b58a00` | keep as is — reserved, do not reuse |
| Needs changing | `--red` | `#7f2a24` | **deepened** from #b03030 — see note |
| Practised / touched | `--touched` | `#4a89c7` | **new use** — see §5 |

`--wine #8f2b45` is topic names and brand only. It must never carry a verdict, or it competes with the wrong end.

Add to `:root`, then replace usages:

```css
--touched: #4a89c7;      /* practised, right or wrong */
```

**Red stays the wrong-end hue — there is no new error token.** The problem was never which red, it was the pile-on: today a wrong answer gets a fill *and* an outline *and* a strikethrough *and* the word "Wrong". Used once per error — one underline, or one rule beside the words — red reads as a marker's note rather than an alarm. §2–§4 are about reducing how often it fires; the retune below is secondary to that.

**On the two deepened values.** Green dropped to `#235c3c` because the old #2e7d4f read as bright against cream. That left the red as the only shouting mark, so it drops in step to oxblood `#7f2a24` — the only candidate darker than every tint in the nine-cell logo (`#8f3a44` / `#b06b76` / `#d6aab0`), which is what keeps it reading as a mark rather than a second brand colour. Rose `#b0616e` was tried and rejected for exactly that reason: it is within a step or two of the logo's mid tint. The washes pair as `#e4eee7` green / `#f8e7e4` red.

## 2. Translation panel (2a)

Order top → bottom: marker's note → your sentence → a good translation → topic slugs.

- **Marker's note.** The AI verdict keeps the top slot but is labelled *Marker's note* and set in a bordered italic block (`#f6f2e8`, 3px `#d8d2c2` left rule). Attribution is the whole point: a clumsy generation then reads as one marker's remark, not the app's voice. **Markup** — move the `Why:` block from the foot of `.result` to the head, relabel, drop the old bordered `Why:` container.
- **The old `Why:` at the bottom is deleted**, not moved twice. It restated the summary line.
- **"A good translation"** — new line, was never shown. **Data**: needs the model rendering of the prompt in the marker payload.
- **Per-span marking** on the learner's own sentence only, and on the learner's word inside each topic card — the same mark in both places, which is the point. Correct spans green, wrong spans `--red`, a 2px vertical tick in the gap where a word is missing. Never on the good translation — a correct sentence carries no verdict hues.
- **Topic cards.** The coloured `border-left` comes OFF the card edge. A 2px rule sits inside, immediately left of the correction, so it touches the words it judges instead of flagging a whole row four inches away. The correction becomes an arrow diff on one line — `nadie → nessun`, learner's word in `--muted` carrying the same red underline the sentence uses, arrow in red, correction in ink at 600. Got-it cards use the same rule in green with the value beside it (`non ho ✓`). This drops a line per card and removes the words "you wrote" from the card entirely.
- **Delete the word "Wrong."** With two chips and a coloured rule already present it was the third statement of the same fact.
- **Delete the paired chips** (`.cmp-value.cmp-learner` beside `.cmp-value.cmp-correct`). One correction, stated once.

## 3. Grammar (3a)

- `.mcq-choice.wrong-pick` — keeps `#fdecec` + `--red` border, plus a small `your pick` label. `.correct-pick` unchanged.
- `.gender-choice .gc-wrong`, `.spelling-choice .gc-wrong`, `.stress-choice .gc-wrong` — same swap.
- `.errorid-word.wrong-pick` — same swap **and remove `text-decoration: line-through`**. It repeats the verdict and damages a word the learner still has to read.
- `.errorid-word.reveal-correct` — unchanged green.

## 4. Vocabulary (3b)

- Gender / spelling / stress drills: as §3.
- `.accent-slip-banner` keeps amber. Its CSS comment says amber was chosen to sit "distinct from right/wrong colouring" — under the settled scale it isn't outside the scale, it *is* half right, which is exactly what an accent slip is. Same colour, better reason.

## 5. Coverage (3c) — the one real decision

`.freq-flank-cell.has-practice` and `.vocab-lemma-dot.has-practice` ring green (`rgba(27,138,74,.85)`) for having been *practised*, right or wrong. So a topic you keep failing looks like a topic you have — and it sits on screen beside green-means-correct.

Move practice to `--touched`:

```css
.freq-flank-cell.has-practice,
.vocab-lemma-dot.has-practice { box-shadow: inset 0 0 0 1.5px var(--touched); }
```

Green then means *got it right* and nothing else. The coverage panel already speaks blue (`.live-cell-blue`, `.legend-cell.demo-blue-full`), so no new hue enters the app.

Legend becomes: got it right (green fill) · tried, not yet right (blue ring) · yet to get (empty) · not achievable (grey).

- `.last-n .mark.miss` — unchanged red. Add a `.mark.partial` (`≈`, amber) so half-right stops rounding down to a miss.
- `.strip-box9` `flash-bad` `#d04848` → `--red`, so the strip and the drills agree. `flash-warm` and `flash-good` unchanged.

## 6. Order of work

1. Retune `--green` to #235c3c and `--red` to #7f2a24; add `--touched`.
2. Reduce each wrong state to ONE red signal — drop the doubled fill/outline where both fire.
3. Move the topic-card rule inside, next to the correction, and make the pair an arrow diff.
4. Remove the line-through and the "Wrong" label.
5. Move `Why:` to the top, relabel, delete the footer copy.
6. Add the good-translation line (needs the marker field).
7. Per-span marking on the learner sentence and in the cards.
8. Coverage to `--touched`, add `.mark.partial`.

Steps 1–4 are mechanical and land the bulk of the change. 5–8 need data or a legend update.
