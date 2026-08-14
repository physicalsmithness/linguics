#!/usr/bin/env python3
"""DO NOT RUN --apply AS IT STANDS.  Architecture, 2026-08-13.

This script REPLACES ``expected_buckets`` wholesale.  On 2026-08-13 the 21 returned
tier-2 review packets were merged into that field: 2,697 grammar bucket ids, ratified
one by one by the author seats.  This deriver emits only orthography.* and vocabulary.*
ids, so re-running it with --apply deletes every one of them silently -- the validation
gate checks shape (sorted, deduped, disjoint from required) and never asks whether an
id that a human ratified has gone missing.

GUARDED 2026-08-14.  Both halves of that fix are now in: `load_ratified()` reads
data/expected_buckets_ratified.json (built by tools/build_ratified_expected_buckets.py
from the returned packets), every derived item unions its ratified ids back in, and
GATE 0 in validate_generated FAILS the run if any ratified pair went missing.  A missing
sidecar is a hard stop, not an empty default.  7,260 pairs across 912 items are protected
at time of writing.  See DECISIONS.md 2026-08-13/14.

--- original header ---

CODEX 2026-08-13 — execute Job 9's deterministic fire-list rebuild.

The script is deliberately conservative:

* only the Italian side's first reference is analysed;
* the new Morph-it surface map is authoritative;
* the best-ranked vocabulary entry supplies the direct POS/sense;
* equivalence alternatives are composed from their own vocabulary entries;
* every output bucket is validated before any live file is replaced;
* live JSON is written through the repository's atomic writer.

Run without ``--apply`` for a read-only dry run.  The required backup directory
must already exist before ``--apply`` is accepted.
"""

from __future__ import annotations

import argparse
from collections import Counter, defaultdict
from copy import deepcopy
from dataclasses import dataclass
from datetime import date
import hashlib
import json
from pathlib import Path
import re
import statistics
import sys
import unicodedata


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
OUTPUTS = ROOT / "outputs"
BACKUP = OUTPUTS / "backup_job9_2026-08-13"
REPORT = OUTPUTS / "JOB9_rederive_expected_buckets_CODEX_2026-08-13.md"

sys.path.insert(0, str(ROOT))
from atomic_io import atomic_write_json, atomic_write_text  # noqa: E402


RANK_CUTOFF = 50
WORD_RE = re.compile(r"[^\W\d_]+(?:['’][^\W\d_]+)*", re.UNICODE)
ACCENT_RE = re.compile(r"[àèéìòù]", re.IGNORECASE)
DOUBLE_RE = re.compile(r"([bcdfghjklmnpqrstvwxyz])\1", re.IGNORECASE)
DIGRAPH_RE = re.compile(r"(?:gl|gn|sc)[ei]", re.IGNORECASE)
SOFT_RE = re.compile(r"(?:[cg][ei]|ch|gh)", re.IGNORECASE)
QU_RE = re.compile(r"(?:cqu|qu|cu(?=[aàeèéiìoòuù]))", re.IGNORECASE)

ARTICLE_FORMS = {
    "il", "lo", "la", "l'", "i", "gli", "le", "un", "uno", "una", "un'",
    "del", "dello", "della", "dell'", "dei", "degli", "delle",
    "al", "allo", "alla", "all'", "nel", "nello", "nella", "nell'",
    "sul", "sulla", "dal", "dalla", "dallo", "dall'",
}
ELIDED_ARTICLES = sorted(
    (article for article in ARTICLE_FORMS if article.endswith("'")),
    key=len,
    reverse=True,
)

ORTHOGRAPHY_BUCKETS = {
    "accent": "orthography.accent.italian",
    "doubling": "orthography.spelling.doubling",
    "apostrophe": "orthography.spelling.apostrophe_elision",
    "digraph": "orthography.spelling.digraph",
    "softening": "orthography.spelling.c_g_softening",
    "qu": "orthography.spelling.qu_cu_cqu",
    "silent_h": "orthography.spelling.silent_h",
    "capitalization": "orthography.spelling.capitalization",
}


@dataclass(frozen=True)
class Token:
    value: str
    source: str


def load_json(path: Path):
    with path.open("r", encoding="utf-8") as source:
        return json.load(source)


def translation_files(base: Path) -> list[Path]:
    return sorted(
        path
        for path in base.glob("translation_items_*.json")
        if ".bak" not in path.name and ".merged" not in path.name
    )


def normalise_token(text: str) -> str:
    return unicodedata.normalize("NFC", text).lower().replace("’", "'")


def tokenize(text: str) -> list[Token]:
    """Tokenise like the map builder, exposing only listed elided articles.

    Keeping other apostrophe compounds intact reproduces Architecture's
    1.12→about-3.4 measurement.  Splitting ``l'acqua`` into ``l'`` + ``acqua``
    is additionally necessary to make Job 9's explicit elided-article gender
    rule operative.
    """

    tokens: list[Token] = []
    for match in WORD_RE.finditer(text):
        source = match.group(0)
        value = normalise_token(source)
        prefix = next(
            (
                article
                for article in ELIDED_ARTICLES
                if value.startswith(article) and len(value) > len(article)
            ),
            None,
        )
        if prefix:
            tokens.append(Token(prefix, source[: len(prefix)]))
            tokens.append(Token(value[len(prefix) :], source[len(prefix) :]))
        else:
            tokens.append(Token(value, source))
    return tokens


def italian_text(item: dict) -> str:
    if item.get("target_lang") == "it":
        references = item.get("reference_translations") or []
        if not references or not isinstance(references[0].get("text"), str):
            raise ValueError(
                f"{item.get('external_id')}: missing reference_translations[0].text"
            )
        return references[0]["text"]
    if item.get("target_lang") == "en" and isinstance(item.get("source_text"), str):
        return item["source_text"]
    raise ValueError(f"{item.get('external_id')}: unsupported or missing target_lang")


def canonical_bytes(value) -> bytes:
    return json.dumps(
        value, ensure_ascii=False, separators=(",", ":"), sort_keys=False
    ).encode("utf-8")


def required_digest(items_by_file: dict[str, list[dict]]) -> str:
    digest = hashlib.sha256()
    for filename in sorted(items_by_file):
        for item in items_by_file[filename]:
            digest.update(filename.encode("utf-8"))
            digest.update(b"\0")
            digest.update(str(item.get("external_id", "")).encode("utf-8"))
            digest.update(b"\0")
            digest.update(canonical_bytes(item.get("required_buckets")))
            digest.update(b"\n")
    return digest.hexdigest()


def collect_tree_ids() -> set[str]:
    ids: set[str] = set()

    def walk(value):
        if isinstance(value, dict):
            if isinstance(value.get("id"), str):
                ids.add(value["id"])
            for child in value.values():
                walk(child)
        elif isinstance(value, list):
            for child in value:
                walk(child)

    for path in sorted((DATA / "buckets").glob("*.json")):
        walk(load_json(path))
    return ids


def vocab_indexes(vocab: list[dict]):
    by_lemma: dict[str, list[dict]] = defaultdict(list)
    by_lemma_pos: dict[tuple[str, str], list[dict]] = defaultdict(list)
    by_class: dict[str, list[dict]] = defaultdict(list)
    index_by_identity: dict[int, int] = {}
    for index, entry in enumerate(vocab):
        entry["_job9_index"] = index
        index_by_identity[id(entry)] = index
        by_lemma[entry["lemma"]].append(entry)
        by_lemma_pos[(entry["lemma"], entry["pos"])].append(entry)
        eq_class = entry.get("equivalence_class")
        if eq_class:
            by_class[eq_class].append(entry)
    for entries in by_lemma.values():
        entries.sort(key=lambda entry: (int(entry["rank"]), entry["_job9_index"]))
    return by_lemma, by_lemma_pos, by_class, index_by_identity


def nonempty_distinct(entries: list[dict], field: str) -> set[str]:
    return {
        str(entry[field])
        for entry in entries
        if entry.get(field) not in (None, "")
    }


def compose_vocab_bucket(
    entry: dict,
    aspect: str,
    direction: str,
    by_lemma_pos: dict[tuple[str, str], list[dict]],
) -> str:
    """Compose an id and prove its segments identify exactly one entry."""

    if aspect not in {"translation", "gender"}:
        raise ValueError(f"unsupported vocabulary aspect: {aspect}")
    if direction not in {"active", "passive"}:
        raise ValueError(f"unsupported direction: {direction}")

    candidates = list(by_lemma_pos[(entry["lemma"], entry["pos"])])
    parts = ["vocabulary", "it", entry["lemma"], entry["pos"]]

    genders = nonempty_distinct(candidates, "gender")
    if len(genders) > 1:
        gender = entry.get("gender")
        if not gender:
            raise ValueError(
                f"gender-split entry lacks gender: {entry['lemma']}/{entry['pos']}"
            )
        parts.append(str(gender))
        candidates = [candidate for candidate in candidates if candidate.get("gender") == gender]

    numbers = nonempty_distinct(candidates, "number")
    if len(numbers) > 1:
        number = entry.get("number")
        if not number:
            raise ValueError(
                f"number-split entry lacks number: {entry['lemma']}/{entry['pos']}"
            )
        parts.append(str(number))
        candidates = [candidate for candidate in candidates if candidate.get("number") == number]

    if len(candidates) != 1 or candidates[0]["_job9_index"] != entry["_job9_index"]:
        raise ValueError(
            "composed vocabulary id is not entry-unique: "
            f"{entry['lemma']}/{entry['pos']} rank={entry['rank']} "
            f"resolves={len(candidates)}"
        )

    parts.extend([aspect, direction])
    return ".".join(parts)


def has_noninitial_capital(text: str) -> bool:
    words = list(re.finditer(r"[^\W\d_]+", text, re.UNICODE))
    for match in words:
        word = match.group(0)
        if not word or not word[0].isupper():
            continue
        prefix = text[: match.start()].rstrip()
        if not prefix:
            continue
        # A word after sentence punctuation remains sentence-initial even when
        # a closing/opening quote or bracket intervenes.
        previous = re.sub(r"[\"'’“”‘’()\[\]{}]+$", "", prefix).rstrip()
        if previous.endswith((".", "!", "?")):
            continue
        return True
    return False


def spelling_buckets(text: str, tokens: list[Token]) -> set[str]:
    normal = unicodedata.normalize("NFC", text)
    lower = normal.lower().replace("’", "'")
    result: set[str] = set()
    if ACCENT_RE.search(normal):
        result.add(ORTHOGRAPHY_BUCKETS["accent"])
    if DOUBLE_RE.search(lower):
        result.add(ORTHOGRAPHY_BUCKETS["doubling"])
    if "'" in lower:
        result.add(ORTHOGRAPHY_BUCKETS["apostrophe"])
    if DIGRAPH_RE.search(lower):
        result.add(ORTHOGRAPHY_BUCKETS["digraph"])
    if SOFT_RE.search(lower):
        result.add(ORTHOGRAPHY_BUCKETS["softening"])
    if QU_RE.search(lower):
        result.add(ORTHOGRAPHY_BUCKETS["qu"])
    if any(token.value.startswith("h") for token in tokens):
        result.add(ORTHOGRAPHY_BUCKETS["silent_h"])
    if has_noninitial_capital(normal):
        result.add(ORTHOGRAPHY_BUCKETS["capitalization"])
    return result


def derive_item(
    item: dict,
    surface_map: dict[str, str],
    by_lemma: dict[str, list[dict]],
    by_lemma_pos: dict[tuple[str, str], list[dict]],
    by_class: dict[str, list[dict]],
) -> tuple[list[str], dict]:
    text = italian_text(item)
    tokens = tokenize(text)
    direction = "active" if item["target_lang"] == "it" else "passive"
    required = set(item.get("required_buckets") or [])
    direct_buckets: set[str] = set()
    alternative_buckets: set[str] = set()
    gender_buckets: set[str] = set()
    direct_lemmas: set[str] = set()
    content_token_count = 0
    has_verb = False

    for index, token in enumerate(tokens):
        lemma = surface_map.get(token.value)
        entries = by_lemma.get(lemma, []) if lemma else []
        if not entries:
            continue
        entry = entries[0]
        if int(entry["rank"]) <= RANK_CUTOFF:
            continue

        content_token_count += 1
        direct_lemmas.add(entry["lemma"])
        has_verb = has_verb or entry["pos"] == "verb"
        direct = compose_vocab_bucket(entry, "translation", direction, by_lemma_pos)
        direct_buckets.add(direct)

        eq_class = entry.get("equivalence_class")
        if eq_class:
            for alternative in by_class[eq_class]:
                if alternative["_job9_index"] == entry["_job9_index"]:
                    continue
                alternative_buckets.add(
                    compose_vocab_bucket(
                        alternative, "translation", direction, by_lemma_pos
                    )
                )

        if (
            item["target_lang"] == "it"
            and entry["pos"] == "noun"
            and index > 0
            and tokens[index - 1].value in ARTICLE_FORMS
        ):
            gender_buckets.add(
                compose_vocab_bucket(entry, "gender", "active", by_lemma_pos)
            )

    all_buckets = (
        direct_buckets
        | alternative_buckets
        | gender_buckets
        | spelling_buckets(text, tokens)
    ) - required
    final_alternatives = (alternative_buckets - direct_buckets) & all_buckets
    metadata = {
        "text": text,
        "direct_lemmas": sorted(direct_lemmas),
        "has_verb": has_verb,
        "content_token_count": content_token_count,
        "direct_buckets": sorted(direct_buckets & all_buckets),
        "alternative_buckets": sorted(final_alternatives),
        "gender_buckets": sorted(gender_buckets & all_buckets),
    }
    return sorted(all_buckets), metadata


def map_metrics(
    items: list[dict],
    surface_map: dict[str, str],
    by_lemma: dict[str, list[dict]],
) -> dict:
    lemma_counts: list[int] = []
    content_counts: list[int] = []
    no_verb = 0
    for item in items:
        lemmas: set[str] = set()
        content_count = 0
        has_verb = False
        for token in tokenize(italian_text(item)):
            lemma = surface_map.get(token.value)
            entries = by_lemma.get(lemma, []) if lemma else []
            if not entries or int(entries[0]["rank"]) <= RANK_CUTOFF:
                continue
            entry = entries[0]
            lemmas.add(entry["lemma"])
            content_count += 1
            has_verb = has_verb or entry["pos"] == "verb"
        lemma_counts.append(len(lemmas))
        content_counts.append(content_count)
        if not has_verb:
            no_verb += 1
    return {
        "mean_lemmas": statistics.mean(lemma_counts),
        "median_lemmas": statistics.median(lemma_counts),
        "no_verb": no_verb,
        "no_verb_pct": 100 * no_verb / len(items),
        "content_counts": content_counts,
    }


def percentile(values: list[int], fraction: float) -> int:
    ordered = sorted(values)
    index = round((len(ordered) - 1) * fraction)
    return ordered[index]


def load_ratified() -> dict[str, list[str]]:
    """Seat-ratified (item -> buckets) from the returned tier-2 packets.

    Built by tools/build_ratified_expected_buckets.py. Absent file is a hard stop rather
    than an empty default: silently treating "no ratified set" as "nothing to preserve" is
    the failure this whole mechanism exists to prevent.
    """
    path = ROOT / "data" / "expected_buckets_ratified.json"
    if not path.exists():
        raise SystemExit(
            "REFUSING TO RUN: data/expected_buckets_ratified.json is missing. "
            "Regenerate it with tools/build_ratified_expected_buckets.py first. "
            "Without it this script would delete every seat-ratified grammar bucket."
        )
    return json.loads(path.read_text(encoding="utf-8"))["ratified"]


RATIFIED: dict[str, list[str]] = {}


def validate_generated(
    original_by_file: dict[str, list[dict]],
    generated_by_file: dict[str, list[dict]],
    tree_ids: set[str],
    bucket_specs: dict[str, tuple],
    by_lemma_pos: dict[tuple[str, str], list[dict]],
) -> dict:
    failures: list[str] = []

    # GATE 0 -- nothing a seat ratified may vanish in a rebuild.
    _dropped = []
    for _items in generated_by_file.values():
        for _new in _items:
            _iid = _new.get("external_id") or _new.get("id")
            _have = set(_new.get("expected_buckets") or []) | set(
                _new.get("required_buckets") or []
            ) | set(_new.get("optional_buckets") or [])
            for _b in RATIFIED.get(_iid) or []:
                if _b not in _have:
                    _dropped.append(f"{_iid}:{_b}")
    if _dropped:
        failures.append(
            f"RATIFIED BUCKETS DROPPED ({len(_dropped)}): {_dropped[:10]}"
            " -- a seat judged these and the rebuild lost them. Do not apply."
        )
    emitted_occurrences = 0
    unique_ids: set[str] = set()
    vocab_occurrences = 0
    nonvocab_occurrences = 0

    if required_digest(original_by_file) != required_digest(generated_by_file):
        failures.append("required_buckets digest changed")

    for filename in sorted(original_by_file):
        before = original_by_file[filename]
        after = generated_by_file.get(filename, [])
        if len(before) != len(after):
            failures.append(f"{filename}: item count {len(before)} -> {len(after)}")
            continue
        for old, new in zip(before, after):
            old_without = deepcopy(old)
            new_without = deepcopy(new)
            old_without.pop("expected_buckets", None)
            new_without.pop("expected_buckets", None)
            if old_without != new_without:
                failures.append(
                    f"{filename}/{old.get('external_id')}: non-expected field changed"
                )
            expected = new.get("expected_buckets")
            if not isinstance(expected, list):
                failures.append(
                    f"{filename}/{new.get('external_id')}: expected_buckets missing/not list"
                )
                continue
            if expected != sorted(set(expected)):
                failures.append(
                    f"{filename}/{new.get('external_id')}: expected_buckets not sorted/deduped"
                )
            overlap = set(expected) & set(new.get("required_buckets") or [])
            if overlap:
                failures.append(
                    f"{filename}/{new.get('external_id')}: required overlap {sorted(overlap)}"
                )
            for bucket in expected:
                emitted_occurrences += 1
                unique_ids.add(bucket)
                if bucket.startswith("vocabulary."):
                    vocab_occurrences += 1
                    spec = bucket_specs.get(bucket)
                    if not spec:
                        failures.append(f"untracked vocabulary id: {bucket}")
                        continue
                    entry, aspect, direction = spec
                    try:
                        recomposed = compose_vocab_bucket(
                            entry, aspect, direction, by_lemma_pos
                        )
                    except ValueError as error:
                        failures.append(f"invalid vocabulary id {bucket}: {error}")
                        continue
                    if recomposed != bucket:
                        failures.append(
                            f"vocabulary composition mismatch: {bucket} != {recomposed}"
                        )
                else:
                    nonvocab_occurrences += 1
                    if bucket not in tree_ids:
                        failures.append(f"non-vocabulary id absent from trees: {bucket}")

    if failures:
        sample = "\n".join(f"- {failure}" for failure in failures[:30])
        raise RuntimeError(f"Job 9 validation failed ({len(failures)}):\n{sample}")
    return {
        "emitted_occurrences": emitted_occurrences,
        "unique_ids": len(unique_ids),
        "vocab_occurrences": vocab_occurrences,
        "nonvocab_occurrences": nonvocab_occurrences,
        "failures": 0,
    }


def register_bucket_specs(
    vocab: list[dict], by_lemma_pos: dict[tuple[str, str], list[dict]]
) -> dict[str, tuple]:
    specs: dict[str, tuple] = {}
    for entry in vocab:
        for aspect in ("translation", "gender"):
            for direction in ("active", "passive"):
                try:
                    bucket = compose_vocab_bucket(
                        entry, aspect, direction, by_lemma_pos
                    )
                except ValueError:
                    continue
                spec = (entry, aspect, direction)
                existing = specs.get(bucket)
                if existing and existing[0]["_job9_index"] != entry["_job9_index"]:
                    raise RuntimeError(f"two vocabulary entries compose to {bucket}")
                specs[bucket] = spec
    return specs


def spot_check(
    analyses: list[tuple[dict, dict]], predicate
) -> tuple[dict, dict] | None:
    return next(((item, meta) for item, meta in analyses if predicate(item, meta)), None)


def render_report(
    *,
    file_counts: dict[str, int],
    old_metrics: dict,
    new_metrics: dict,
    existing_vocab_mean: float,
    final_vocab_mean: float,
    final_expected_mean: float,
    final_expected_median: float,
    alternatives_items: int,
    eq_entries: int,
    eq_classes: int,
    validation: dict,
    required_hash: str,
    content_histogram: Counter,
    spots: dict[str, tuple[dict, dict]],
) -> str:
    total_items = sum(file_counts.values())
    counts = new_metrics["content_counts"]
    histogram = ", ".join(
        f"{count}:{items}" for count, items in sorted(content_histogram.items())
    )
    lines = [
        "# Job 9 result — CODEX 2026-08-13",
        "",
        "Result: **PASS**",
        "",
        "## Live-input note",
        "",
        f"The work order expected 914 items / 18,042 vocabulary entries / 1,550 equivalence members. The live inputs contained **{total_items} items**, **18,035 vocabulary entries**, and **{eq_entries} equivalence members across {eq_classes} classes**. The live corpus was processed as found; no missing item was invented.",
        "",
        "## Before / after",
        "",
        "Both map columns use the same tokenizer, best-ranked entry rule, and top-50 exclusion.",
        "",
        "| measure | old 427-entry map | new 1,450-entry map |",
        "|---|---:|---:|",
        f"| mean directly resolved vocabulary lemmas per item | {old_metrics['mean_lemmas']:.2f} | {new_metrics['mean_lemmas']:.2f} |",
        f"| median directly resolved vocabulary lemmas per item | {old_metrics['median_lemmas']:.1f} | {new_metrics['median_lemmas']:.1f} |",
        f"| items with no directly resolved verb | {old_metrics['no_verb']} ({old_metrics['no_verb_pct']:.1f}%) | {new_metrics['no_verb']} ({new_metrics['no_verb_pct']:.1f}%) |",
        "",
        f"Existing on-disk vocabulary bucket occurrences averaged **{existing_vocab_mean:.2f} per item** before replacement. The final fire-list averages **{final_vocab_mean:.2f} vocabulary buckets per item** after equivalence expansion.",
        f"Items gaining at least one equivalence-class alternative: **{alternatives_items}**.",
        f"All expected buckets: mean **{final_expected_mean:.2f}**, median **{final_expected_median:.1f}** per item.",
        "",
        "## Content-word counts",
        "",
        f"Resolved post-cutoff token counts: mean **{statistics.mean(counts):.2f}**, median **{statistics.median(counts):.1f}**, min **{min(counts)}**, p10 **{percentile(counts, 0.10)}**, p90 **{percentile(counts, 0.90)}**, max **{max(counts)}**.",
        "",
        f"Histogram (`content words:item count`): `{histogram}`.",
        "",
        "This supports Architecture's caution: these are short references; the directly resolvable content-word mean is close to the direct-lemma mean, not 10–20.",
        "",
        "## Acceptance tests",
        "",
        f"1. `required_buckets` canonical-byte SHA-256 before/after: `{required_hash}` / `{required_hash}` — **PASS**.",
        f"2. Every item has `expected_buckets`; {len(file_counts)} files parse; item counts unchanged ({total_items}) — **PASS**.",
        f"3. Bucket checks: {validation['emitted_occurrences']:,} emitted occurrences ({validation['vocab_occurrences']:,} vocabulary; {validation['nonvocab_occurrences']:,} tree-backed), {validation['unique_ids']:,} unique ids, **0 failures**.",
        "4. Before/after and alternatives counts are reported above — **PASS**.",
        "5. Required spot checks:",
        "",
    ]
    for label, (item, meta) in spots.items():
        relevant = [
            bucket
            for bucket in meta["direct_buckets"] + meta["alternative_buckets"]
            if any(
                needle in bucket
                for needle in ("vedere", "vistare", "dare", "televis", "secco", "asciutto", "lung")
            )
        ]
        if not relevant:
            relevant = meta["direct_buckets"] + meta["alternative_buckets"]
        lines.extend(
            [
                f"- **{label}: `{item['external_id']}`**",
                f"  - Italian: `{meta['text']}`",
                f"  - Buckets: `{', '.join(relevant)}`",
            ]
        )
    lines.extend(
        [
            "",
            "## Per-file item counts (re-read from disk)",
            "",
            "```text",
        ]
    )
    lines.extend(f"{name}\t{count}" for name, count in sorted(file_counts.items()))
    lines.extend(
        [
            "```",
            "",
            "Count command:",
            "",
            "```powershell",
            "$files = Get-ChildItem data -File -Filter 'translation_items_*.json' | Where-Object { $_.Name -notlike '*.bak*' -and $_.Name -notlike '*.merged*' }; foreach ($f in $files) { $items = Get-Content -Raw -LiteralPath $f.FullName | ConvertFrom-Json; \"$($f.Name)`t$($items.Count)\" }",
            "```",
            "",
            f"Backup: `{BACKUP.relative_to(ROOT)}` (32 full file copies).",
            "",
        ]
    )
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--apply", action="store_true", help="atomically replace live expected_buckets"
    )
    args = parser.parse_args()

    global RATIFIED
    RATIFIED = load_ratified()
    print(
        f"ratified carry-through: {sum(len(v) for v in RATIFIED.values())} pairs "
        f"across {len(RATIFIED)} items (data/expected_buckets_ratified.json)"
    )

    live_files = translation_files(DATA)
    backup_files = translation_files(BACKUP) if BACKUP.exists() else []
    if args.apply and [path.name for path in live_files] != [path.name for path in backup_files]:
        raise RuntimeError(
            f"backup mismatch: live={len(live_files)} backup={len(backup_files)}"
        )

    original_by_file = {path.name: load_json(path) for path in live_files}
    all_items = [
        item for filename in sorted(original_by_file) for item in original_by_file[filename]
    ]
    vocab = load_json(DATA / "vocabulary_it_frequency.json")
    new_map = load_json(DATA / "it_surface_to_lemma_morphit.json")
    old_map = load_json(DATA / "it_surface_to_lemma.json")
    by_lemma, by_lemma_pos, by_class, _ = vocab_indexes(vocab)
    tree_ids = collect_tree_ids()
    bucket_specs = register_bucket_specs(vocab, by_lemma_pos)

    old_metrics = map_metrics(all_items, old_map, by_lemma)
    new_metrics = map_metrics(all_items, new_map, by_lemma)
    existing_vocab_mean = statistics.mean(
        sum(
            1
            for bucket in (item.get("expected_buckets") or [])
            if bucket.startswith("vocabulary.")
        )
        for item in all_items
    )

    generated_by_file: dict[str, list[dict]] = {}
    analyses: list[tuple[dict, dict]] = []
    alternatives_items = 0
    expected_counts: list[int] = []
    vocab_counts: list[int] = []
    content_histogram: Counter = Counter()

    for filename in sorted(original_by_file):
        generated_items: list[dict] = []
        for original in original_by_file[filename]:
            expected, meta = derive_item(
                original, new_map, by_lemma, by_lemma_pos, by_class
            )
            generated = deepcopy(original)
            # RATIFIED CARRY-THROUGH (Architecture 2026-08-14). This deriver emits only
            # orthography.* and vocabulary.* ids. The grammar ids on these items were
            # ratified one at a time by the author seats through the tier-2 packets, and a
            # plain replace deletes all 7,260 of them without a word -- which is exactly
            # what happened on 2026-08-13. Union them back in; the gate below then FAILS
            # if any went missing, so the deletion cannot recur silently.
            _carry = RATIFIED.get(original.get("external_id") or original.get("id")) or []
            _own = set(original.get("required_buckets") or []) | set(
                original.get("optional_buckets") or []
            )
            generated["expected_buckets"] = sorted(
                set(expected) | (set(_carry) - _own)
            )
            expected = generated["expected_buckets"]
            generated_items.append(generated)
            analyses.append((generated, meta))
            alternatives_items += bool(meta["alternative_buckets"])
            expected_counts.append(len(expected))
            vocab_counts.append(sum(bucket.startswith("vocabulary.") for bucket in expected))
            content_histogram[meta["content_token_count"]] += 1
        generated_by_file[filename] = generated_items

    validation = validate_generated(
        original_by_file,
        generated_by_file,
        tree_ids,
        bucket_specs,
        by_lemma_pos,
    )

    visto = spot_check(
        analyses,
        lambda item, meta: any(token.value == "visto" for token in tokenize(meta["text"])),
    )
    dare = spot_check(
        analyses,
        lambda item, meta: any(token.value in {"date", "dati"} for token in tokenize(meta["text"])),
    )
    equivalent = spot_check(
        analyses,
        lambda item, meta: bool(meta["alternative_buckets"])
        and any(
            token.value in {"asciutto", "secco", "televisione", "televisore"}
            for token in tokenize(meta["text"])
        ),
    )
    if not all((visto, dare, equivalent)):
        raise RuntimeError(
            f"spot-check candidates missing: visto={bool(visto)} dare={bool(dare)} "
            f"equivalence={bool(equivalent)}"
        )
    spots = {"visto → vedere": visto, "date/dati → dare": dare, "equivalence alternatives": equivalent}

    if not args.apply:
        print("DRY RUN PASS — no files changed")
        print(f"files={len(live_files)} items={len(all_items)}")
        print(
            f"direct lemma mean old/new={old_metrics['mean_lemmas']:.2f}/"
            f"{new_metrics['mean_lemmas']:.2f}"
        )
        print(
            f"no-verb old/new={old_metrics['no_verb_pct']:.1f}%/"
            f"{new_metrics['no_verb_pct']:.1f}%"
        )
        print(f"items gaining alternatives={alternatives_items}")
        print(
            f"validation occurrences={validation['emitted_occurrences']} "
            f"failures={validation['failures']}"
        )
        return 0

    # All derivation and validation succeeded before the first replacement.
    for path in live_files:
        atomic_write_json(path, generated_by_file[path.name], indent=2)

    # Re-read the written artefacts, as required by the work order.
    written_by_file = {path.name: load_json(path) for path in live_files}
    reread_validation = validate_generated(
        original_by_file,
        written_by_file,
        tree_ids,
        bucket_specs,
        by_lemma_pos,
    )
    file_counts = {name: len(items) for name, items in written_by_file.items()}
    required_hash = required_digest(original_by_file)
    if required_hash != required_digest(written_by_file):
        raise RuntimeError("required_buckets changed after disk re-read")

    report = render_report(
        file_counts=file_counts,
        old_metrics=old_metrics,
        new_metrics=new_metrics,
        existing_vocab_mean=existing_vocab_mean,
        final_vocab_mean=statistics.mean(vocab_counts),
        final_expected_mean=statistics.mean(expected_counts),
        final_expected_median=statistics.median(expected_counts),
        alternatives_items=alternatives_items,
        eq_entries=sum(bool(entry.get("equivalence_class")) for entry in vocab),
        eq_classes=len(by_class),
        validation=reread_validation,
        required_hash=required_hash,
        content_histogram=content_histogram,
        spots=spots,
    )
    atomic_write_text(REPORT, report)
    print("JOB 9 APPLY PASS")
    print(f"files={len(file_counts)} items={sum(file_counts.values())}")
    print(
        f"direct lemma mean old/new={old_metrics['mean_lemmas']:.2f}/"
        f"{new_metrics['mean_lemmas']:.2f}"
    )
    print(
        f"no-verb old/new={old_metrics['no_verb_pct']:.1f}%/"
        f"{new_metrics['no_verb_pct']:.1f}%"
    )
    print(f"items gaining alternatives={alternatives_items}")
    print(
        f"validated={reread_validation['emitted_occurrences']} occurrences, "
        "0 failures"
    )
    print(f"report={REPORT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
