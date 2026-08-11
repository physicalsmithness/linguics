# Work order: mechanical passes, 2026-08-05

**Written by:** the Architecture chat, for **a fresh AI with no prior context** (possibly several,
possibly not Claude). Smith is out of credits and is handing these out to be finished over the next
few days.

**Every job below is self-contained.** Copy ONE job into a fresh session, with this preamble. Do not
assume the AI has read the rest of the file. Jobs 1, 2, 3 and 6 are independent and can run in parallel. Job 4 is code and belongs to whoever runs
Housing. Job 5 is the big one and needs the most capable model.

**Jobs 1, 2 and 3 were audited on 2026-08-05 after a dry run and three defects were corrected** — a
runaway output in 1, a validation test in 2 that would have rejected every id it generated, and a
rewrite target in 3 that would have silently killed 129 references. Use this version, not any earlier copy.

---

## STATUS as of 2026-08-06 01:xx (Architecture) — READ THIS FIRST

QoderWork ran jobs 1, 2 and 3 between 00:27 and 00:49, i.e. **before** the corrections lower down
this file were written (01:07). Current state:

| job | state | what remains |
|---|---|---|
| **1** equivalence classes | ran the UNCORRECTED spec | **Do not re-run.** Filtered output already produced by Architecture at `data/equivalence_class_proposals_2026-08_FILTERED.json`. See the note below — the sweep surfaced a data problem that matters more than the classes. |
| **2** expected_buckets | **DONE and healthy** | nothing. 899/899 items, mean 5.8 expected buckets vs 1.4 required, required_buckets byte-identical |
| **3** gender bare-ids | ran, 18 rewrites in 3 files, manifest untouched | one loose end: `vocabulary.it.medico.gender.active` was written in a different shape from the other 17 |
| **4** code fixes | not started | Housing |
| **5** morph-it grammar tagging | **DONE** 897/899 items, 95 buckets | REVIEW NEEDED: `article.definite` proposed on 571 of 899 items (max 779). A bucket that fires on two-thirds of the corpus is noise in a fire-list. Needs a frequency floor before merge. |
| **6** noun classes | **DONE and clean** | unclassified 1,809 -> 542; accented_a_fem 268 (all -à), accented_other 28. Residue file for the 542. |
| **7** gloss audit | **DONE** (audit only, no writes, as specified) | hand-fixing of 694 [skip] + 34 truncated + 6 '?' glosses remains, by design |
| **8** bucket descriptions | **DONE by Architecture** | my "62" was wrong (loose pattern): real count 15 candidates. 9 moved, 6 flagged for judgement, 1 numeral bug fixed. `scope_note` already existed. |

**What job 2 actually emitted, since it is worth knowing before running job 5:**

| kind | count |
|---|---|
| `vocabulary.*.translation` | 2,896 |
| `vocabulary.*.gender` | 228 |
| `orthography.spelling.*` (7 classes) | 1,785 |
| `orthography.accent.italian` | 264 |
| **grammar families** | **0** |

Zero grammar buckets is **correct and by design** — tier 1 is string-derivable surface only. It also
means the thing the marker is actually bad at is still undeclared, and **job 5 is the one that fixes
that.** Items went from 1.4 declared skills to about 7.2, but every one added so far is vocabulary or
spelling.

**Finding from the job 1 filtering, which outranks the classes themselves.** The rule kept proposing
`prendere` / `badare` / `cavare` / `mediare` as one class. The rule is right; the data is wrong.
`badare`, `cavare` and `mediare` are each glossed with the bare string `'take'` — truncations of "take
care of", "take out", and so on. Those glosses are wrong in the live vocabulary file, which means a
learner can be asked "what's the Italian for take?" and shown `mediare`. **A truncated-gloss audit is
now worth more than the equivalence sweep it came out of**, and it should be a job of its own before
job 1's proposals are ratified.

---

## ASSIGNMENT (Smith, 2026-08-05)

**Jobs 1, 2, 3 and 5 → QoderWork**, which has direct access to the live folder.
**Job 4 stays with Housing.** Do not hand 4 to QoderWork without asking Smith; it is code in
`housing/js/` and Housing owns that surface.
**Job 6 → Vocab, or another agent.** Independent of everything else; 6a alone is the single biggest
visible improvement on this list.

Since one agent is taking four jobs rather than four agents taking one each, three things change:

1. **The preamble need only be read once**, not pasted per job. Its rules still bind every job.
2. **Run them in this order: 3, then 1, then 2, then 5.** Job 3 is small and touches three files, so
   it proves the backup-and-atomic-write discipline on a contained blast radius before Job 2 writes
   to all 899 translation items. Job 1 is proposal-only and cannot break anything, so it can slot in
   anywhere before 2.
3. **Job 5 must not start until Job 2 has landed and passed its acceptance tests.** Both write into
   the `expected_buckets` space; running them concurrently produces overlapping proposals nobody can
   reconcile. This was advisory when the jobs were going to different hands. With one agent doing
   both it is a hard sequence.

**Report per job, separately.** Four short thread notes, not one combined write-up at the end: if job
2 goes wrong, we need to know that job 3 was clean without unpicking a single report.

## PREAMBLE — paste this with every job

You are working on **Linguics**, a static-site Italian learning tool. The live folder is:

```
C:\Claude (not on Gdrive, nor OneDrive)\Linguics
```

**That path is the live copy. There is a OneDrive mirror; do not edit it.** Cloud sync corrupts rapid
writes, which is why the project moved off it.

Rules that apply to every job, without exception:

1. **Back up before any in-place edit.** `outputs/backup_<jobname>_2026-08-XX/`, full file copies.
2. **Write JSON atomically.** `atomic_io.py` in the repo root exists for this. A truncated JSON file
   takes the whole site down, because the loader is sequential.
3. **Never write to these**, they are architecture-owned and a proposal is the most you may produce:
   `DECISIONS.md`, `AUTHOR_BRIEF.md`, `data/buckets/*.json` (the bucket trees),
   `data/misconceptions.json`, `data/manifest.json`, `INTER_CHAT_PROTOCOL.md`.
4. **Count from the file, never from your own memory of what you did.** Finish every job by
   re-reading the written artefact and reporting counts derived from it with a command shown.
5. **If a job's acceptance test fails, stop and report.** Do not "fix" it by loosening the test.
6. **Propose, do not decide.** Where a job says "proposal file", the file is the deliverable. A human
   or a topic-owner chat ratifies it later. Do not merge proposals into live data unless the job
   explicitly says to.
7. Leave a short note of what you did in `inter_chat/` following the house format:
   `## v<N>, <date>, <your name>` appended to the named thread.

---

## JOB 1 — Equivalence-class sweep, tier 1 (vocabulary)

**For:** any competent AI. Pure data work, no judgement, proposal only.
**Size:** one session. 18,048 entries, but the logic is small.
**Thread to append to:** `inter_chat/Architecture_Vocab_marker_semantics.md` (currently at v10).

### Why

When the site asks *"What's the Italian for dry?"* and the learner writes `secco`, it marks them
**wrong** because the stored answer is `asciutto`. Both are correct. Same for *"the Italian for TV"*
answered `televisione` (stored: `tv`), and for `sebbene` vs `benché`. An English gloss that maps onto
several Italian lexemes cannot demand a specific one.

The mechanism to fix this already exists: a field called `equivalence_class` on each vocabulary entry.
Entries sharing a class id are treated as interchangeable. **It currently covers 21 entries out of
18,048.** Your job is to propose the rest.

### Input

`data/vocabulary_it_frequency.json` — a JSON array of ~18,048 entry objects. Relevant fields:
`lemma`, `pos`, `rank`, `translation_en` (comma-separated English glosses), `gloss_en`,
`equivalence_class` (usually absent).

### The rule (ratified 2026-05-28, tightened 2026-08-05 after a dry run — do not invent your own)

Normalise each `translation_en` into a token set: lowercase, trim, split on comma, drop leading
"to " on verbs and "a/an/the" on nouns.

**Build PAIRS, not token groups.** Two entries pair when:

1. same `pos`, AND
2. **overlap over target = 1.0**, i.e. `|A ∩ B| / min(|A|,|B|) == 1.0` — one gloss set is contained in
   the other, AND
3. `min(|A|,|B|) >= 1` and **`max(|A|,|B|) <= 3`**.

Then transitively close pairs into classes.

**Why the extra gates.** A dry run of the loose "shares any token" rule produced **4,186 groups
touching 7,638 entries** — not a reviewable artefact. Worse, it produced groups that are not classes
at all: fifteen verbs share the token "take" (`prendere`, `cogliere`, `reggere`, `levare`, `staccare`,
`badare`), which share *one English sense among many* and are in no way interchangeable. Containment
plus a small-set cap is what separates *sebbene/benché* from *that*.

### Exclusions — apply BEFORE anything else

- **Drop entries whose `translation_en` contains `[skip]`.** It is a literal placeholder in the data,
  not a gloss: 336 nouns, 195 adjectives and 160 verbs carry it, and they would form three enormous
  bogus classes.
- **Drop single-character lemmas** (`l`, `c`, `s`, `d`, `n`, `m`, `x`). Junk rows.
- **Cap class size at 4 members.** Anything larger goes to a separate `oversized` array in the output
  for human review, never into `proposals` — a five-way "equivalence" is almost always a gloss that is
  too generic.

### Output

`data/equivalence_class_proposals_2026-08.json`, this shape:

```json
{
  "generated": "2026-08-XX",
  "rule": "same pos + shared normalised gloss token; score = overlap/min",
  "proposals": [
    {
      "suggested_id": "although_conj",
      "score": 1.0,
      "members": [
        {"lemma": "sebbene", "pos": "conjunction", "rank": 2228, "translation_en": "although, though, albeit"},
        {"lemma": "benché",  "pos": "conjunction", "rank": 6679, "translation_en": "although, though, albeit"}
      ],
      "near_members": [
        {"lemma": "nonostante", "pos": "conjunction", "rank": 912, "translation_en": "although, despite", "score": 0.5}
      ]
    }
  ]
}
```

Sort proposals by score descending, then by the best member's rank ascending, so the highest-confidence
and most-used come first for review. Put anything scoring **1.0** in `members`; anything below in
`near_members` on the same proposal.

### DO NOT

- Do not write `equivalence_class` into `vocabulary_it_frequency.json`. Proposal file only.
- Do not merge classes across `pos`. `nonostante` is a conjunction at rank 912 and a preposition at
  911; those are different entries and only the conjunction belongs in an "although" class.
- Do not use an LLM to judge synonymy in this job. This tier is deterministic string work. Cases the
  string rule cannot see are Job 5's, deliberately.

### Acceptance tests (run them, report the output)

1. `sebbene` + `benché` appear together in one proposal with score `1.0`.
2. `secco` and `asciutto` appear in one proposal (they share the token "dry").
3. `tv` and `televisione` do **NOT** appear together. Their glosses are "TV" and "television", which
   share no token. This is expected and correct: that pair is Job 5's. If your output pairs them, your
   normaliser is doing fuzzy matching and must be made stricter.
4. **`prendere` and `badare` do NOT appear together.** Both carry "take" but neither gloss set is
   contained in the other. If they pair, your containment test is wrong.
5. **No proposal contains `[skip]`.** Grep the output for it; expect zero.
6. Report: total proposals, total entries covered, and the size of the `oversized` array. **If
   `proposals` exceeds ~400, stop and report rather than delivering** — it means a gate is not
   biting, and a file nobody can review is worse than no file.

### One extra, small

Three entries carry a redundant `alternatives` field: `arancio` (noun), `arancione` (noun),
`arancione` (adjective), each listing the others. Add a proposal `orange_colour` covering them, and
note in your thread entry that the `alternatives` field is retired in favour of `equivalence_class`
(ruled 2026-08-05). Do not delete the field yourself.

---

## JOB 2 — `expected_buckets` deriver, tier 1 (translation items)

**For:** any competent AI comfortable with Python and JSON. Mechanical, but it writes to live data, so
read the safety rules twice.
**Size:** one to two sessions. 899 items.
**Thread to append to:** `inter_chat/Architecture_Housing_translation_crosstopic_marking.md` (at v25).

### Why

Translation answers are marked by an AI worker. It is given the item's `required_buckets` and a menu
of ~440 possible skills, and asked to work out which ones the learner's answer demonstrates. **All 899
items carry `required_buckets`, but the median is 1 and the mean is 1.4** — each topic's author tagged
only their own slice. A sentence demonstrates eight or ten markable things; the item names one. The
marker is being asked to find the rest with no clue which are present, which is why marking is
unreliable regardless of how expensive the model is.

Your job: derive, per item, the things a correct answer would demonstrate that **code can know for
certain**, and write them to a new field.

### Input

`data/translation_items_*.json` (skip anything ending `.bak` or containing `.merged`). Each file is a
JSON array of items. Relevant fields:

- `external_id` — the item id
- `source_lang` / `target_lang` — `en`/`it` or `it`/`en`
- `source_text` — the prompt
- `reference_translations` — array of `{text, register, notes}`. **`text` is the Italian you derive
  from** (when `target_lang` is `it`; when it is `en`, derive from `source_text` instead — the Italian
  side is always the one carrying the grammar).
- `required_buckets` — **DO NOT MODIFY THIS FIELD.**

Supporting data:

- `data/vocabulary_it_frequency.json` — lemma, pos, gender, rank
- `data/it_surface_to_lemma.json` — surface form → lemma map (8 KB, generated from morph-it)
- `data/buckets/*.json` — the bucket trees, for validating that every id you emit exists

### What to derive (all four, per item)

**(a) Vocabulary.** For each significant word in the Italian text, resolve to a lemma via
`it_surface_to_lemma.json`, look up the entry, emit:
`vocabulary.it.<lemma>.<pos>[.<gender>][.<number>].translation.<direction>`
where direction is `active` when the learner is producing Italian (`target_lang: it`) and `passive`
when they are reading it. Skip function words below a rank cutoff of your choosing — say the top 50 —
and **report the cutoff you used**.

**(b) Noun gender.** For each noun found in (a) whose token in the text is **immediately preceded by
an article** (`il lo la l' i gli le un uno una un'`, or an articulated preposition `del dello della
dei degli delle al allo alla nel nella sul sulla dal dalla`), emit
`vocabulary.it.<lemma>.<pos>[.<gender>].gender.active`. **Only for `target_lang: it` items** — gender
is production-only. No article, no emission: without one the answer does not demonstrate gender.

**(c) Accents.** If the Italian text contains any accented character (àèéìòù), emit
`orthography.accent.italian`. Do not attempt to guess the sub-class.

**(d) Spelling classes.** Emit from this list only, on a match in the Italian text:

| bucket | trigger |
|---|---|
| `orthography.spelling.doubling` | any doubled consonant |
| `orthography.spelling.apostrophe_elision` | any apostrophe |
| `orthography.spelling.digraph` | `gl`, `gn`, `sc` before `e`/`i` |
| `orthography.spelling.c_g_softening` | `c`/`g` before `e`/`i`, or `ch`/`gh` |
| `orthography.spelling.qu_cu_cqu` | `qu`, `cu` before a vowel, or `cqu` |
| `orthography.spelling.silent_h` | word-initial `h` |
| `orthography.spelling.capitalization` | a capital that is not sentence-initial |

### Output

Add **one new key** to each item:

```json
"expected_buckets": ["vocabulary.it.casa.noun.f.translation.active", "orthography.spelling.doubling"]
```

Deduplicate. Sort alphabetically. **Do not touch any other key.** Do not remove anything from
`required_buckets`; if a bucket is already in `required_buckets`, leave it out of `expected_buckets`.

### The semantics, so you understand what you are writing

`required_buckets` = what the item exists to test; absence from the learner's answer is a **miss**.
`expected_buckets` = what a good answer happens to show; it is judged **only if the learner's answer
engages it**. Engaged and right is a hit, engaged and wrong is a real miss, not engaged at all is a
blank with no penalty. This is why over-generating in `expected_buckets` is safe and over-generating
in `required_buckets` would be a disaster: a learner who phrases it differently must never be marked
down for a construction they simply did not use.

### DO NOT

- Do not modify `required_buckets`, `source_text`, `reference_translations`, or any other existing key.
- **Validate ids, but by the right test for each kind — this is the one that will trip you up.**
  The bucket trees hold 780 ids, and the only `vocabulary.*` ones are **frequency bands**
  (`vocabulary.it.freq_12601_12700`). Per-lemma ids like
  `vocabulary.it.casa.noun.f.translation.active` are **composed at runtime and are NOT in the trees**.
  So:
  - **non-vocabulary ids** (`orthography.*`, grammar families) → must exist in `data/buckets/*.json`.
  - **vocabulary ids** → validate by composition instead: the lemma resolves to exactly one entry of
    that pos; the gender segment appears only if that lemma+pos is gender-split; the number segment
    only if number-split; the direction suffix is present and correct.
  A blanket tree check will reject every vocabulary id you generate. If you find yourself dropping all
  of them, this is why.
- Do not attempt grammar buckets (tense, mood, prepositions, clitics, agreement). That is Job 5 and it
  needs morphological tagging. Guessing them from string patterns will produce confident nonsense.

### Acceptance tests (run them, report the output)

1. **`required_buckets` is byte-identical before and after**, every file. Prove it with a diff of just
   that field across all 899 items.
2. Every item has an `expected_buckets` key (may be an empty array).
3. **Every emitted bucket id exists in the tree.** Report the count checked and zero unknowns.
4. Every file still parses, and the count of items per file is unchanged.
5. Report: mean and median `expected_buckets` per item, before/after comparison against the 1.4 mean of
   `required_buckets`. Expect something in the range 4-10; if you get under 3, your word-significance
   cutoff is too aggressive.

---

## JOB 3 — Gender bare-id sweep

**For:** any competent AI. Small, contained, mostly a report.
**Size:** under a session.
**Thread to append to:** `inter_chat/Architecture_Housing_selection_policy.md` (at v3, see its §12).

### Why

Authored items reference vocabulary gender buckets in a short form,
`vocabulary.it.gemello.gender`. The code resolves that to a specific entry by looking up the lemma,
and where a lemma has several entries **it guesses, taking the lowest frequency rank**. For two lemmas
the guess picks the adjective instead of the noun, so gender credit is recorded against the wrong
entry. An authoring rule was issued on 2026-08-05: **a gender or article_form reference to a
multi-entry lemma must name the part of speech.**

### Task

1. Find every occurrence of `vocabulary.it.<lemma>.gender` and `vocabulary.it.<lemma>.article_form`
   under `data/`. There are about 129 distinct lemmas across these files:
   `data/grammar_questions_possessive.json`, `data/translation_items_possessive.json`,
   `data/vocab_bucket_references_adjective_agreement.json`. Ignore `.bak` files.
2. For each, check `data/vocabulary_it_frequency.json`: does the lemma have more than one entry?
3. **Where it has more than one, rewrite the reference to the FULLY COMPOSED id — not merely a
   POS-qualified one.** This is the part it is easy to get wrong and it would silently kill every
   reference you touch.

   `resolveVocabVariant` (housing/js/translation_marker.js ~449) reads
   `if (segs.length !== 4) return bucketId;` — **anything that is not exactly four dot-segments is
   passed through untouched.** So `vocabulary.it.gemello.noun.gender` would never be resolved, never
   gain its `.active` suffix, and never match what the marker actually writes. The reference would go
   dead without any error.

   Write the full form that `LL.entryBucketId` composes:
   `vocabulary.it.<lemma>.<pos>[.<gender>][.<number>].<aspect>.active`
   — the gender segment only when that lemma+pos is gender-split, the number segment only when
   number-split, and **`.active` always**, because gender and article_form are production-only.

   `vocabulary.it.gemello.gender` → `vocabulary.it.gemello.noun.gender.active`

   Gender and article_form are noun properties, so the noun entry is always the right target.
4. Where the lemma has exactly one entry, **leave it alone**. The short form is unambiguous there.
5. Produce a report of every rewrite, and separately list any lemma where **no noun entry exists** —
   stop and flag those rather than guessing.

### Also report, do not fix

`data/vocab_bucket_references_adjective_agreement.json` holds 99 gender/article_form references and
does not appear anywhere in `data/manifest.json`. Confirm that, and state it plainly in your thread
note. It is a question for the AdjectiveAuthor chat: proposal awaiting wiring, or authored work that
never loads? **Do not add it to the manifest.**

### Acceptance tests

1. Every rewritten id is **byte-identical to what `LL.entryBucketId(entry, aspect, {})` would
   produce** for that entry. Re-implement that composition in your script and compare; do not
   eyeball it.
2. Every rewritten id resolves to exactly one noun entry.
2. No file's item count changes; every file parses.
3. Report the before/after count of ambiguous references. Known cases that must be caught:
   `gemello` and `mobile` (both currently resolve to the adjective). `collega` is masculine at rank
   914 and feminine at 915 — flag it, do not silently pick one.

---

## JOB 4 — Four small code fixes

**For:** whoever runs the **Housing** chat, or a capable AI if Housing is stalled. These are code
changes to `housing/js/`, which is Housing's territory. **Ask Smith before handing this to a
general AI.**
**Thread:** `inter_chat/Architecture_Housing_selection_policy.md`.

Each is small and independently shippable. In priority order:

**4a. The silent fallback (two lines, do this one first).** `startMistakesSession` in
`housing/js/app.js` (~9469) reads `grammarFilter.clauses = test.length ? clause : null`. When no
grammar item matches the learner's weak buckets, this hands them the **entire unfiltered corpus** with
no indication. Learners think the feature is broken, and they are right. Say what happened instead.

**4b. Weakness ranking.** Same function plus `allBucketStats` in `housing/js/store.js` (~250). Two
faults: it uses all-time statistics while the button says "recent" (a recency-weighted function
already exists in the same file, `bucketStats`, and is not used here); and a bucket with events but
**zero attempted credit** scores `correctness = 0` and therefore sorts as *weakest*, so the deck is
fronted by material the learner never attempted rather than material they got wrong. Require
`attempted > 0`.

**4c. `item_ref` on every attempt.** `recordAttempt` in `housing/js/store.js` (~130) keys
`question_id`/`item_id` off `strand === "grammar" | "translation"` only. The five vocab and drill call
sites each build a card id and pass it as `.id`; all five are discarded. Add one field `item_ref`,
shaped `<strand>:<id>`, populated for every strand. Keep the existing two fields writing as they are.
No back-fill.

**4d. Delete the deck-position fallback ids.** In `housing/js/app.js`: `"spelling_" + spellingIndex`
(~3559), `"accent_" + accentIndex` (~3725), `"stress_" + stressIndex` (~4001). These are indexes into a
**shuffled** deck, so after one reshuffle the same id names a different card. That manufactures wrong
history, which is worse than none. Where an item has no stable `external_id`, write `null`.

**4e (related, from Job 3's finding).** `resolveVocabVariant` in `housing/js/translation_marker.js`
(~442) picks the lowest-rank entry when a lemma is ambiguous. For aspects `gender` and `article_form`,
**prefer a noun entry** when one exists. Those are noun properties, so a non-noun resolution is
provably wrong and needs no judgement call.

---

## JOB 5 — Tier 2: morph-it grammar tagging (the big one)

**For:** the most capable model available. This is the job that actually fixes translation marking, and
it is the one most likely to go wrong in an unskilled hand.
**Size:** several sessions.
**Thread:** `inter_chat/Architecture_Housing_translation_crosstopic_marking.md` (at v25; read v24 §2-3).

### Why

Job 2 derives the *surface* properties of a reference answer: vocabulary, gender, accents, spelling.
Those are the things the marker is already least bad at. The marking that actually fails is the
grammar — did the learner reach for the subjunctive, is the preposition right, is the clitic in the
right place — and none of that is readable off a string.

But most constructions have a **morphological signature**. `morph-it` is already in the repo
(`morph-it/morph-it_048.txt`, 21 MB, the full Italian lexicon; the 8 KB surface-to-lemma map used
elsewhere was cut from it). A subjunctive is a verb tagged subjunctive. `preposition.da` is the token.
Clitic placement is a clitic adjacent to a verb.

### Task

1. Tag every reference translation with morph-it.
2. From the tags, **propose** grammar bucket ids from `data/buckets/*.json` for each item.
3. Group the output **by bucket, not by item**: for each bucket, the list of items you believe
   demonstrate it. A topic-owning chat then reviews *"here are the 40 items I think show your
   construction; strike the wrong ones, add what I missed"*. That is 440 short expert reviews rather
   than 899 long generalist ones, and it puts each judgement in front of the person who owns it.
4. Output to `data/expected_bucket_proposals_tier2_<date>.json`. **Propose only. Do not write to
   items.**

### Hard constraints

- Anything with **no surface signature** is out of scope and must not be guessed: word order, tense
  *choice* as opposed to tense *form*, register, ellipsis. Those are authored by hand, by exception.
- A false positive here is expensive: it puts a bucket in front of the marker that the sentence does
  not contain, and the marker will try to mark it. **Under-propose rather than over-propose**, and
  give every proposal a confidence you can explain.

---

## JOB 6 — Noun-class classifier: finish it, and split one misnamed class

**For:** the Vocab chat, or any competent AI. Mostly mechanical; the last part needs judgement and can
be left.
**Size:** one session for the mechanical part.
**Thread to append to:** `inter_chat/Architecture_Vocab_noun_class_taxonomy.md` (at v1 — read it, it
has all the counts).

### Why

Nouns carry a `noun_class` field saying how you can tell their gender from their form
(`regular_o_masc`, `regular_a_fem`, `e_ambiguous`, `greek_ma_masc`, `ista_common_gender`,
`invariable_loanword`, `invariable_accented_final`, `gender_shift_plural`, `irregular_gender`). The
coverage panel renders one tile per class. Smith looked at it on 2026-08-05 and found it incoherent.
He was right on every point.

### 6a — Fill the 1,809 unclassified nouns (mechanical, do this)

**1,809 noun entries have no `noun_class` at all**, and they are not the hard residue you would expect.
A sample: *via, battaglia, edificio, desiderio, teoria, tecnologia, domenica, vittoria, fiducia,
traccia, pomeriggio, laboratorio* — all textbook regular.

- **1,267 (70%) are trivially classifiable**: lemma ends `-o` and gender is `m` → `regular_o_masc`;
  ends `-a` and gender is `f` → `regular_a_fem`. Write those.
- **0 end in `-e`**, so none are `e_ambiguous`. If your count says otherwise, check your filter.
- **542 remain.** Do NOT guess these. Emit them to
  `data/noun_class_residue_<date>.json` with lemma, gender, plural and ending, for review.

This is a classifier that stopped, not a taxonomy problem. Highest value and lowest risk on the whole
work order.

### 6b — Split `invariable_accented_final` (mechanical, do this)

The class is named after the plural behaviour and hides a strong gender cue. 296 entries, by final
vowel:

| ending | count | genders |
|---|---|---|
| **-à** | **268** | **259 f**, 1 m, 8 ambiguous |
| -è | 10 | 4 m, 6 ambiguous |
| -ì | 8 | 7 m, 1 f |
| -ù | 5 | 3 f, 2 m |
| -é | 4 | 3 m, 1 ambiguous |
| -ò | 1 | 1 ambiguous |

**-à is 97% feminine** (*città, libertà, università, qualità, verità*) — a rule a learner can use
immediately. Split into `accented_a_fem` (the -à words) and `accented_other` (the rest, ~28, mixed).

The invariable-plural fact is not lost; it belongs on the **number** axis, not the gender one. Do not
delete it — if there is nowhere to put it yet, note that in your thread entry and leave a marker.

### 6c — The 644 loanwords with no recorded gender (judgement — propose only)

`invariable_loanword` is 1,131 entries: 399 m, 72 f, 16 mf, **644 `ambiguous`**. So for 57% of the
class the data does not say what gender the word is, which makes the tile useless as a cue.

**Propose, do not write.** Most consonant-final loans are masculine (*il film, il computer, lo sport*)
but "most" is not a licence to bulk-write, and where usage genuinely varies (*email*, *app*) the honest
value is `mf`, not a guess. Output to `data/loanword_gender_proposals_<date>.json`.

**Check first and report:** can the gender drill currently serve one of those 644? If it can, there is
no correct button for the learner to press, and that is a live bug rather than untidy data.

### Not in this job

The panel merges two different taxonomies — `noun_class` (a form-cue axis: how can you tell) and
`GENDER_CLASSES` in app.js (an answer axis: Masculine, Feminine, M-or-F-by-person). "Masculine" is a
fine answer for the drill and a useless group to study. **That is a render fix and belongs to
Housing**, not here. Do not change `GENDER_CLASSES`.

### Acceptance tests

1. No entry's `gender` value changes. Only `noun_class` is written. Prove it with a diff.
2. After 6a, unclassified nouns = 542, and every one of them is in the residue file.
3. After 6b, `accented_a_fem` count is ~268 and every member's lemma ends in `-à`.
4. Every file parses; entry count unchanged at 18,048.

---

## JOB 7 — The gloss audit. Three faults, all live on screen.

**For:** Vocab, or a capable AI. 7a and 7b are mechanical. 7c needs judgement and can be proposed.
**Do this before ratifying Job 1's class proposals** — classes built on broken glosses encode the
breakage.
**Thread:** `inter_chat/Architecture_Vocab_marker_semantics.md` (at v10).

### Why

`translation_en` is doing two different jobs at once and failing at both. It is **what we show the
learner as the prompt** and **what we accept as a correct answer**. Three screenshots in one evening:

- *"What's the Italian for dry?"* → learner wrote `secco`, marked wrong against `asciutto`.
- *"What's the Italian for TV?"* → learner wrote `la televisione`, marked wrong against `tv`.
- *"What's the Italian for **mistress, lady, owner, hostess, landlady, employer, boss, flagship of a
  naval squadron**?"* → an unanswerable question, and when the learner wrote `maestra` the feedback
  read **"that means [skip]"**.

### 7a — RULING first: display and acceptance are different lists

**Cap the prompt at 3 senses. Keep the whole list for acceptance.** A learner shown three senses can
answer; a learner shown eight is being handed a dictionary entry. Nothing is lost, because the
remaining senses still count as correct — they were never needed to *ask* the question, only to
*mark* it.

This is the same split ruled twice already this week: `required_buckets` vs `expected_buckets`, and
"one way to say it" vs the marked reference. Same principle each time — **what we present and what we
accept are not the same set.**

Scale: **857 entries carry 5+ glosses, 293 carry 7+, 103 carry 9+.** The worst is `tosto` with 18.
The cap is a render change (Housing) and needs no data migration.

### 7b — The `[skip]` leak (mechanical, small, do this)

`[skip]` is an existing convention meaning *corpus artefact, never serve this*: 694 entries, every one
with `translation_source: corpus_artefact`, mostly tokenisation junk (`the`, `l`, `c`, `s`, `d`).

The filter is applied in three places in `housing/js/app.js` (~2862, ~9419, ~9447) and **not on the
"you wrote X — that means Y" feedback path**, which is why a learner saw `[skip]` on screen. One
guard, same test as the other three.

### 7c — Two data faults behind it (propose, do not bulk-write)

**Real words wrongly flagged as artefacts.** `maestra` is a genuine Italian noun at rank 4606, flagged
`[skip]` with `translation_source: corpus_artefact`. It is not junk. 29 of the 694 sit in the top 2000
by rank, which is where contamination is most likely and most damaging. Review those 29 first, then
the rest; every one that is a real word needs a real gloss, and **none of the 694 has a usable
`gloss_en` to fall back on** (checked: zero).

**Truncated glosses on phrasal verbs.** `badare`, `cavare`, `mediare`, `decollare` and `tardare` are
each glossed with the bare string `'take'` — "take care of", "take out", "take off", "take long" with
the particle stripped somewhere in the import. There is a matching cluster on `'back'`
(`schiena`, `appoggiare`, `posteriore`, `laterale`) and six entries whose entire gloss is `'?'`.

This one is live and wrong, not merely untidy: a learner can be asked *"what's the Italian for take?"*
and shown `mediare`. Unlike the *dry* and *TV* cases, where the stored answer was one valid option
among several, here the stored answer is simply incorrect.

**Find them mechanically, fix them by hand.** The signature is a single-token gloss shared by four or
more entries of the same pos. Emit the candidates to `data/gloss_audit_<date>.json` with lemma, rank,
pos and current gloss. Do not bulk-write replacements.


### 7d — Derived-form noun entries: a marking bug, not a data bug (CORRECTED)

Fifth screenshot, and a different fault from 7a-c. *"What's the Italian for **length** (as a noun)?"*
— the learner wrote `lunghezza`, which is the Italian for length, and was marked **wrong** against
`lungo`, which is an adjective meaning "long".

`lungo` has three entries: adjective r286 "long", preposition r301 "along", and **noun r10950
"length"**. That third one is not a word; it is the corpus tagger having seen nominalised uses and the
import having minted an entry and glossed it by rule. `lunghezza` (noun, r3306, "length") is the real
answer and it is right there in the file.

**Signature: a lemma that exists as an adjective at a good rank AND as a much rarer noun.** 557
entries have a rank gap of 3,000 or more. The tell is in the glosses:

| lemma | adjective | noun |
|---|---|---|
| possibile | r239 "possible" | r10947 **"possible"** |
| umano | r345 "human" | r11029 **"human"** |
| importante | r241 "important" | r10936 **gloss is null** |
| ampio | r1591 "wide, ample" | r12469 **gloss is null** |
| lungo | r286 "long" | r10950 "length" |

Noun entries glossed identically to their adjective, or not glossed at all. **Some are genuine** —
`stretto` really is "strait", `sportivo` really is "sportsman" — so this is review, not deletion.

**CORRECTED 2026-08-06 by Smith. My first answer here was wrong and is withdrawn.**

I proposed a selection filter: stop serving production questions on derived-form entries when a
commoner entry of the same lemma exists. Smith rejected it, and he is right.

> *"Part of the joy of this thing is that you can learn all the words in the language… it's supposed
> to click that you've got lunghezza. And if you never say lungo, then you never get a little green
> dot — so what? You don't just say that it didn't exist. It exists."*

Two things follow, and both are better than what I proposed.

**The entry stays servable.** Completeness is the product. `lungo` as a noun is attested, it is in the
corpus, and a learner deliberately grinding the 10,000-11,000 band should meet it. Suppressing entries
to avoid a marking bug is fixing the wrong layer.

**An entry nobody ever produces simply never lights up, and that is fine — it is information.** A
permanently untouched dot tells you which entries are never reached, which is a more honest signal
than hiding them.

**The actual bug is that a correct answer was marked wrong**, and it is already ruled: the production
rule of `Architecture_Vocab_marker_semantics` v10 — *credit the lemma they produced; the asked-for
lemma is blank, not wrong*. `lunghezza` is glossed "length", "length" is what was asked, so it takes
the credit and `lungo` takes no event. I failed to connect my own ruling from that morning to this
screenshot and reached for a filter instead.

**Acceptance test, added to v10's list:** prompt "length (as a noun)", answer `lunghezza` → **1/1**,
credit on `vocabulary.it.lunghezza.noun.f.translation.active`, `lungo` untouched.

**What survives of this section.** Only one thing, and it is small: **entries with a null gloss cannot
be rendered as a question at all** — `importante` (noun, r10936) and `ampio` (noun, r12469) have no
`translation_en`, so "What's the Italian for ___?" has nothing to put in the blank. Find those and
gloss them. The identically-glossed ones (`possibile` noun "possible", `umano` noun "human") are NOT
broken: a learner asked for the noun "possible" types `possibile` and is right.

The 557-entry audit is **not** wanted as a retirement list. If it runs at all it runs as a gloss-quality
pass under 7c, where `lungo` noun glossed "length" is a bad gloss for a nominalised adjective, not an
entry to delete.

### Root cause behind all of 7a-7d, worth stating once

The vocabulary file was built from a corpus frequency list. The entry-splitting step created a POS
entry wherever the tagger saw a POS, then glossed it by rule. That single decision produces every
fault in this job: glosses truncated to a particle-stripped stem (7c), real words flagged as artefacts
(7c), dictionary dumps of every sense (7a), and derived forms minted as headwords (7d). Fixing them
one screenshot at a time will work but will take a long time; a single reconciliation pass over the
entry-splitting output would find most of them at once.

### Acceptance tests

1. Zero entries render `[skip]` anywhere a learner can see it.
2. The 29 top-2000 `[skip]` entries are individually reviewed and listed with a verdict.
3. Every single-token gloss shared by 4+ same-pos entries appears in the audit file.
4. No entry's `lemma`, `pos`, `gender` or `rank` changes. Only `translation_en`, `gloss_en` and
   `translation_source` may move, and only where the job says so.

---

## JOB 8 — Bucket descriptions: the authoring notes are leaking to learners

**For:** Architecture normally owns the bucket trees, so **check with Smith before handing this out.**
The mechanical half (schema + renderer + the audit list) is safe for anyone; the rewriting is
editorial.
**Size:** the audit is minutes; the 62 rewrites are an hour or two of careful editing.
**Thread:** new — `inter_chat/Architecture_Housing_bucket_description_split.md`.

### Why

Smith read this on screen, in a learner-facing description:

> *"This branch is what the GerundioFormation dispatch authors; usage (the adverbial gerund) and
> discrimination (progressive vs simple) are separate stubs."*

"Branch", "dispatch", "GerundioFormation", "stubs" — that is estate-internal language about who
authors what, shown to someone trying to learn Italian.

**CORRECTED 2026-08-06: my first count of 62 was wrong.** It came from a loose pattern counted
per-marker over whole descriptions, which caught ordinary words used ordinarily. A sentence-level pass
finds **15 candidate sentences in 15 buckets**, and even those need judgement — one is a plain false
positive ("analogy is the engine" is a metaphor, not our software).

**And `scope_note` already exists.** 49 buckets carry it, it is already used for exactly this purpose,
and Housing never renders it. So this was never a schema change or a Housing job: the convention was
already there and 15 descriptions simply did not follow it.

### 8a — RULING: split the field, do not delete the text

`description` is doing two jobs — explaining the bucket to a **learner**, and briefing an **author**
on what is in scope. Same field, two audiences, so the author's half ends up on screen.

**Add `scope_note`. `description` becomes learner-facing only; the internal sentences move across,
they are not deleted.** They are genuinely useful — they record who owns a branch and what is
deliberately excluded — and deleting them would lose real information while fixing a display bug.

This is the **fourth** time this week the same shape has come up: `translation_en` doing display and
acceptance; `required_buckets` doing "must test" and "happens to show"; the reference translation
doing "example" and "answer"; now `description` doing learner and author. **When one field serves two
audiences, the wrong one eventually reaches the screen.** Worth watching for elsewhere.

### 8b — Bullets are sanctioned here, and descriptions were never swept

Smith: *"this could be bullet-pointed."* Correct, and it is the case the blessed rule already allows —
the paragraph carries a genuine list of four formation routes buried in prose, so bullets structure
existing sentences **without dropping a word**, which is the test.

Note that the 2026-08-03 re-paragraph sweep covered **explanations only**. Bucket descriptions are
learner-facing prose too and have had no house-style treatment at all. They should get the same rule:
paragraph the long ones, bullet where a list is genuinely present, never lose wording.

### Worked exemplar, already done — copy this pattern

`verb_form.gerundio.formation` in `data/buckets/verb_form.gerundio.json` has been rewritten by
Architecture as the pattern:

```
description: "Building the gerund and its constructions.
              • Regular forms: -are gives -ando; -ere and -ire give -endo.
              • The small stem-expansion irregular set: facendo, dicendo, bevendo, ponendo, traducendo.
              • The compound gerundio passato: avendo or essendo plus the participle.
              • The progressive assembly: stare conjugated in any tense, plus the gerund."

scope_note:  "This branch is what the GerundioFormation dispatch authors; usage (the adverbial
              gerund) and discrimination (progressive vs simple) are separate stubs."
```

Every word of the original survives. Nothing was invented.

### Task

1. Emit the 62 to `data/bucket_description_audit_<date>.json` with id, file, current description, and
   which marker matched.
2. For each, move the internal sentences to `scope_note` and leave the learner-facing text in
   `description`. **Wording is preserved on both sides** — this is a move, not a rewrite.
3. Bullet where a genuine list is present. Never convert prose into a list by trimming it.
4. **Housing:** render `description` only. `scope_note` never reaches a learner. Also apply the
   `white-space: pre-line` treatment that explanations got, or the bullets render as one run-on line.

### Acceptance tests

1. Zero descriptions match the marker patterns after the pass.
2. For every edited bucket, `description + scope_note` contains every word the original description
   had. Diff it mechanically; a dropped clause is a failure.
3. All 780 buckets still present, every file parses, no ids changed.
4. Spot-render three edited buckets in the UI and confirm no internal wording is visible.

---

## What is NOT in this work order, and why

These need judgement and Smith is placing them himself: ratifying the equivalence classes Job 1
proposes; the marker prompt rewrite; the selection-policy presets and the weakness panel (the row
taxonomy is Architecture's and is owed); anything touching the bucket trees or the misconception
registry.

**Ordering note:** Jobs 1, 2 and 3 are independent. Job 4a is worth doing immediately whatever else
happens, because it is actively misleading learners today. Job 5 should not start until Job 2 has
landed, so the two passes are not writing overlapping proposals into the same field.
