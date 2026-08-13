# Job 9 result — CODEX 2026-08-13

Result: **PASS**

## Live-input note

The work order expected 914 items / 18,042 vocabulary entries / 1,550 equivalence members. The live inputs contained **913 items**, **18,035 vocabulary entries**, and **827 equivalence members across 387 classes**. The live corpus was processed as found; no missing item was invented.

## Before / after

Both map columns use the same tokenizer, best-ranked entry rule, and top-50 exclusion.

| measure | old 427-entry map | new 1,450-entry map |
|---|---:|---:|
| mean directly resolved vocabulary lemmas per item | 1.12 | 3.42 |
| median directly resolved vocabulary lemmas per item | 1.0 | 3.0 |
| items with no directly resolved verb | 409 (44.8%) | 234 (25.6%) |

Existing on-disk vocabulary bucket occurrences averaged **3.45 per item** before replacement. The final fire-list averages **4.01 vocabulary buckets per item** after equivalence expansion.
Items gaining at least one equivalence-class alternative: **198**.
All expected buckets: mean **6.27**, median **6.0** per item.

## Content-word counts

Resolved post-cutoff token counts: mean **3.44**, median **3.0**, min **0**, p10 **2**, p90 **5**, max **11**.

Histogram (`content words:item count`): `0:8, 1:58, 2:167, 3:281, 4:213, 5:120, 6:31, 7:21, 8:9, 9:4, 11:1`.

This supports Architecture's caution: these are short references; the directly resolvable content-word mean is close to the direct-lemma mean, not 10–20.

## Acceptance tests

1. `required_buckets` canonical-byte SHA-256 before/after: `72416b10c7817233b896d6c2198d0f01945301d731b7443cacb90dc2b9db179b` / `72416b10c7817233b896d6c2198d0f01945301d731b7443cacb90dc2b9db179b` — **PASS**.
2. Every item has `expected_buckets`; 32 files parse; item counts unchanged (913) — **PASS**.
3. Bucket checks: 5,728 emitted occurrences (3,663 vocabulary; 2,065 tree-backed), 1,299 unique ids, **0 failures**.
4. Before/after and alternatives counts are reported above — **PASS**.
5. Required spot checks:

- **visto → vedere: `trans_cmp_en_it_abs_02`**
  - Italian: `Il film che abbiamo visto ieri era bellissimo.`
  - Buckets: `vocabulary.it.vedere.verb.translation.active`
- **date/dati → dare: `trans_conn_en_it_reg_01`**
  - Italian: `Poiché i dati erano incompleti, l'analisi è stata rinviata.`
  - Buckets: `vocabulary.it.dare.verb.translation.active`
- **equivalence alternatives: `trans_impv_use_en_it_inf_02`**
  - Italian: `Conservare in luogo fresco e asciutto.`
  - Buckets: `vocabulary.it.asciutto.adjective.translation.active, vocabulary.it.secco.adjective.translation.active`

## Per-file item counts (re-read from disk)

```text
translation_items_adjective_agreement.json	31
translation_items_adverb.json	16
translation_items_article.json	19
translation_items_comparison.json	24
translation_items_connective.json	24
translation_items_demonstrative.json	20
translation_items_existential.json	21
translation_items_indefinite.json	29
translation_items_interrogatives.json	16
translation_items_negation.json	23
translation_items_noun.json	22
translation_items_passive.json	19
translation_items_piacere.json	20
translation_items_possessive.json	35
translation_items_preposition.json	24
translation_items_pronominal_verbs.json	23
translation_items_pronoun.json	68
translation_items_relative_pronoun.json	15
translation_items_reported_speech.json	20
translation_items_si_constructions.json	15
translation_items_tense_choice.json	66
translation_items_verb_form.condizionale.json	38
translation_items_verb_form.congiuntivo.json	35
translation_items_verb_form.future.json	42
translation_items_verb_form.gerundio.json	26
translation_items_verb_form.imperativo.json	32
translation_items_verb_form.imperfect.json	54
translation_items_verb_form.passato_prossimo.json	50
translation_items_verb_form.passato_remoto.json	13
translation_items_verb_form.present_indicative.json	48
translation_items_verb_form.trapassato_prossimo.json	14
translation_items_word_formation.json	11
```

Count command:

```powershell
$files = Get-ChildItem data -File -Filter 'translation_items_*.json' | Where-Object { $_.Name -notlike '*.bak*' -and $_.Name -notlike '*.merged*' }; foreach ($f in $files) { $items = Get-Content -Raw -LiteralPath $f.FullName | ConvertFrom-Json; "$($f.Name)`t$($items.Count)" }
```

Backup: `outputs\backup_job9_2026-08-13` (32 full file copies).
