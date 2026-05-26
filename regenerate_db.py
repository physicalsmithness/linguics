"""Brief D — build data/linguics_italian.db from the editable source files.

Source files (all canonical in `data/`):
  vocabulary_it_frequency_lemmas.csv   -> lemmas table
  vocabulary_it_frequency_forms.csv    -> forms table
  vocabulary_it_frequency.json         -> curated_entries table
  vocab_themes.json                    -> themes table
  buckets/vocabulary_frequency.json    -> bands table
  text_coverage_curve.json             -> text_coverage_curve table (if present)

The CSVs/JSONs stay authoritative; the SQLite is derived. Run this whenever
any of the source files change.

Uses atomic write semantics: builds the DB at `<path>.tmp` then renames into
place, so an interrupted build leaves the previous DB intact.
"""
from __future__ import annotations

import csv
import json
import os
import sqlite3
import sys
from pathlib import Path

def _find_data_dir() -> Path:
    """Look for a `data/` directory next to this script first, then fall back
    to the known project path. Lets the script run from either the user's
    project root or the developer's worktree."""
    here = Path(__file__).resolve().parent
    candidates = [
        here / "data",
        here.parent / "data",
        Path(r"C:\Claude (not on Gdrive, nor OneDrive)\Linguics\data"),
    ]
    for c in candidates:
        if (c / "vocabulary_it_frequency_lemmas.csv").exists():
            return c
    raise FileNotFoundError("can't find data/ — looked in " + ", ".join(str(c) for c in candidates))


DATA_DIR = _find_data_dir()
DB_PATH = DATA_DIR / "linguics_italian.db"


def _intnull(v: str | None) -> int | None:
    if v is None or v == "":
        return None
    try:
        return int(v)
    except ValueError:
        try:
            return int(float(v))
        except ValueError:
            return None


def _floatnull(v: str | None) -> float | None:
    if v is None or v == "":
        return None
    try:
        return float(v)
    except ValueError:
        return None


def _strnull(v: str | None) -> str | None:
    if v is None or v == "":
        return None
    return v


# ---------------------------------------------------------------------------
# Schema
# ---------------------------------------------------------------------------

SCHEMA_SQL = """
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS lemmas (
    id              INTEGER PRIMARY KEY,
    lemma           TEXT    NOT NULL,
    pos             TEXT    NOT NULL,
    gender          TEXT,                -- m/f/mf/ambiguous/na
    plural          TEXT,
    auxiliary       TEXT,
    conjugation_class TEXT,
    adj_class       TEXT,
    noun_class      TEXT,
    nvdb_tier       TEXT,
    merged_rank     INTEGER NOT NULL,
    avg_rank        REAL,
    sources_count   INTEGER,
    rank_itwac      INTEGER,
    rank_opensubs   INTEGER,
    rank_wordfreq   INTEGER,
    rank_lip        INTEGER,
    rank_news       INTEGER,
    rank_literature INTEGER,
    rank_wikipedia  INTEGER,
    notes           TEXT,
    UNIQUE (lemma, pos, gender)
);
CREATE INDEX IF NOT EXISTS idx_lemmas_lemma     ON lemmas (lemma);
CREATE INDEX IF NOT EXISTS idx_lemmas_pos       ON lemmas (pos);
CREATE INDEX IF NOT EXISTS idx_lemmas_rank      ON lemmas (merged_rank);
CREATE INDEX IF NOT EXISTS idx_lemmas_tier      ON lemmas (nvdb_tier);

CREATE TABLE IF NOT EXISTS forms (
    id              INTEGER PRIMARY KEY,
    form            TEXT    NOT NULL,
    lemma_id        INTEGER,                  -- nullable; resolved by string match
    merged_rank     INTEGER NOT NULL,
    avg_rank        REAL,
    sources_count   INTEGER,
    rank_hermitdave INTEGER,
    rank_orgtre     INTEGER,
    rank_wordfreq   INTEGER,
    rank_lip        INTEGER,
    rank_news       INTEGER,
    rank_literature INTEGER,
    rank_wikipedia  INTEGER,
    FOREIGN KEY (lemma_id) REFERENCES lemmas(id)
);
CREATE INDEX IF NOT EXISTS idx_forms_form  ON forms (form);
CREATE INDEX IF NOT EXISTS idx_forms_rank  ON forms (merged_rank);
CREATE INDEX IF NOT EXISTS idx_forms_lemma ON forms (lemma_id);

CREATE TABLE IF NOT EXISTS themes (
    id    TEXT PRIMARY KEY,
    kind  TEXT NOT NULL,
    label TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bands (
    id              TEXT PRIMARY KEY,
    parent_id       TEXT,
    language_code   TEXT,
    label           TEXT,
    description     TEXT,
    band_lo         INTEGER,
    band_hi         INTEGER,
    cefr_importance TEXT,    -- JSON
    attributes      TEXT,    -- JSON
    active          INTEGER,
    version         INTEGER
);

CREATE TABLE IF NOT EXISTS curated_entries (
    id                  INTEGER PRIMARY KEY,
    rank                INTEGER,
    lemma               TEXT NOT NULL,
    pos                 TEXT NOT NULL,
    translation_en      TEXT,
    band                TEXT,
    gender              TEXT,
    plural              TEXT,
    auxiliary           TEXT,
    conjugation_class   TEXT,
    adj_class           TEXT,
    noun_class          TEXT,
    themes              TEXT,    -- JSON array
    gloss_en            TEXT,
    notes               TEXT,
    lemma_id            INTEGER,
    FOREIGN KEY (band) REFERENCES bands(id),
    FOREIGN KEY (lemma_id) REFERENCES lemmas(id)
);
CREATE INDEX IF NOT EXISTS idx_curated_lemma ON curated_entries (lemma, pos);
CREATE INDEX IF NOT EXISTS idx_curated_band  ON curated_entries (band);

CREATE TABLE IF NOT EXISTS text_coverage_curve (
    register             TEXT NOT NULL,
    rank                 INTEGER NOT NULL,
    cumulative_coverage  REAL NOT NULL,
    PRIMARY KEY (register, rank)
);

-- View: lemmas + curated for the vocab chat's common query.
-- Join policy:
--   * NOUN: match on (lemma, pos, gender) — gender homographs are distinct.
--   * Everything else: match on (lemma, pos) — gender is metadata on the
--     curated row, not a key. l.gender is often NULL/'na' for non-nouns
--     while c.gender may legitimately carry 'm'/'f' for the article that
--     a learner sees the lemma as.
CREATE VIEW IF NOT EXISTS vocab_view AS
SELECT
    l.id              AS lemma_id,
    l.lemma,
    l.pos,
    l.gender,
    l.merged_rank,
    l.nvdb_tier,
    c.translation_en,
    c.band,
    c.themes,
    c.notes           AS curated_notes,
    l.notes           AS lemma_notes
FROM lemmas l
LEFT JOIN curated_entries c
       ON c.lemma = l.lemma
      AND c.pos   = l.pos
      AND (
              l.pos <> 'noun'
           OR c.gender IS l.gender
           OR (c.gender IS NULL AND l.gender IN ('na', 'ambiguous'))
          );
"""


def load_lemmas(con: sqlite3.Connection) -> dict[tuple[str, str, str | None], int]:
    path = DATA_DIR / "vocabulary_it_frequency_lemmas.csv"
    with path.open(encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    cur = con.cursor()
    lemma_id: dict[tuple[str, str, str | None], int] = {}
    for r in rows:
        gender = r.get("gender") or None
        # Treat "na" as effectively NULL for the UNIQUE constraint
        gender_key = gender if gender and gender != "na" else None
        key = (r["lemma"], r["pos"], gender_key)
        cur.execute(
            """
            INSERT INTO lemmas (
                lemma, pos, gender, plural, auxiliary, conjugation_class,
                adj_class, noun_class, nvdb_tier, merged_rank, avg_rank,
                sources_count, rank_itwac, rank_opensubs, rank_wordfreq,
                rank_lip, rank_news, rank_literature, rank_wikipedia, notes
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            (
                r["lemma"],
                r["pos"],
                gender_key,
                None,  # plural — not on the lemma CSV; lives in curated only
                _strnull(r.get("auxiliary")),
                None,  # conjugation_class — curated-only
                _strnull(r.get("adj_class")),
                None,  # noun_class — curated-only
                _strnull(r.get("nvdb_tier")),
                int(r["rank"]),
                _floatnull(r.get("avg_rank")),
                _intnull(r.get("sources_count")),
                _intnull(r.get("rank_itwac")),
                _intnull(r.get("rank_opensubs")),
                _intnull(r.get("rank_wordfreq")),
                _intnull(r.get("rank_lip")),
                _intnull(r.get("rank_news")),
                _intnull(r.get("rank_literature")),
                _intnull(r.get("rank_wikipedia")),
                _strnull(r.get("notes")),
            ),
        )
        lemma_id[key] = cur.lastrowid
    print(f"  lemmas: {len(rows)} rows")
    return lemma_id


def load_forms(con: sqlite3.Connection, lemma_lookup: dict[tuple[str, str, str | None], int]) -> None:
    path = DATA_DIR / "vocabulary_it_frequency_forms.csv"
    if not path.exists():
        print("  forms CSV missing; skipping")
        return
    # Best-effort form->lemma resolution. Use simplemma to lemmatise the form,
    # then look up any (lemma, *) row in lemma_lookup; prefer noun > verb > adj.
    try:
        import simplemma
    except ImportError:
        simplemma = None

    by_lemma: dict[str, list[tuple[tuple[str, str, str | None], int]]] = {}
    for k, v in lemma_lookup.items():
        by_lemma.setdefault(k[0], []).append((k, v))

    cur = con.cursor()
    n = 0
    with path.open(encoding="utf-8") as f:
        for r in csv.DictReader(f):
            lemma_id = None
            if simplemma is not None:
                lemma_str = simplemma.lemmatize(r["word"], lang="it")
                cands = by_lemma.get(lemma_str)
                if cands:
                    # Priority: noun > verb > adjective > anything else
                    prio = {"noun": 0, "verb": 1, "adjective": 2}
                    cands_sorted = sorted(cands, key=lambda kv: prio.get(kv[0][1], 9))
                    lemma_id = cands_sorted[0][1]
            cur.execute(
                """
                INSERT INTO forms (
                    form, lemma_id, merged_rank, avg_rank, sources_count,
                    rank_hermitdave, rank_orgtre, rank_wordfreq,
                    rank_lip, rank_news, rank_literature, rank_wikipedia
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
                """,
                (
                    r["word"],
                    lemma_id,
                    int(r["rank"]),
                    _floatnull(r.get("avg_rank")),
                    _intnull(r.get("sources_count")),
                    _intnull(r.get("rank_hermitdave")),
                    _intnull(r.get("rank_orgtre")),
                    _intnull(r.get("rank_wordfreq")),
                    _intnull(r.get("rank_lip")),
                    _intnull(r.get("rank_news")),
                    _intnull(r.get("rank_literature")),
                    _intnull(r.get("rank_wikipedia")),
                ),
            )
            n += 1
    print(f"  forms: {n} rows")


def load_themes(con: sqlite3.Connection) -> None:
    path = DATA_DIR / "vocab_themes.json"
    if not path.exists():
        return
    with path.open(encoding="utf-8") as f:
        data = json.load(f)
    cur = con.cursor()
    themes = data.get("themes", []) if isinstance(data, dict) else data
    for t in themes:
        cur.execute(
            "INSERT OR REPLACE INTO themes (id, kind, label) VALUES (?,?,?)",
            (t["id"], t.get("kind", ""), t.get("label", "")),
        )
    print(f"  themes: {len(themes)} rows")


def load_bands(con: sqlite3.Connection) -> None:
    path = DATA_DIR / "buckets" / "vocabulary_frequency.json"
    if not path.exists():
        return
    with path.open(encoding="utf-8") as f:
        bands = json.load(f)
    cur = con.cursor()
    for b in bands:
        attrs = b.get("attributes", {}) or {}
        cur.execute(
            """
            INSERT OR REPLACE INTO bands (
                id, parent_id, language_code, label, description,
                band_lo, band_hi, cefr_importance, attributes, active, version
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?)
            """,
            (
                b["id"],
                b.get("parent_id"),
                b.get("language_code"),
                b.get("label"),
                b.get("description"),
                attrs.get("band_lo"),
                attrs.get("band_hi"),
                json.dumps(b.get("cefr_importance"), ensure_ascii=False),
                json.dumps(attrs, ensure_ascii=False),
                1 if b.get("active") else 0,
                b.get("version", 1),
            ),
        )
    print(f"  bands: {len(bands)} rows")


def load_curated(con: sqlite3.Connection, lemma_lookup: dict[tuple[str, str, str | None], int]) -> None:
    path = DATA_DIR / "vocabulary_it_frequency.json"
    if not path.exists():
        return
    with path.open(encoding="utf-8") as f:
        entries = json.load(f)
    cur = con.cursor()
    for e in entries:
        gender = e.get("gender")
        # Try several gender keys to find a matching lemma row
        candidates = [(e["lemma"], e["pos"], gender), (e["lemma"], e["pos"], None)]
        lemma_id = None
        for k in candidates:
            if k in lemma_lookup:
                lemma_id = lemma_lookup[k]
                break
        cur.execute(
            """
            INSERT INTO curated_entries (
                rank, lemma, pos, translation_en, band, gender, plural,
                auxiliary, conjugation_class, adj_class, noun_class,
                themes, gloss_en, notes, lemma_id
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            (
                e.get("rank"),
                e["lemma"],
                e["pos"],
                e.get("translation_en"),
                e.get("band"),
                gender,
                e.get("plural"),
                e.get("auxiliary"),
                e.get("conjugation_class"),
                e.get("adj_class"),
                e.get("noun_class"),
                json.dumps(e.get("themes") or [], ensure_ascii=False),
                e.get("gloss_en"),
                e.get("notes"),
                lemma_id,
            ),
        )
    print(f"  curated_entries: {len(entries)} rows")


def load_coverage_curve(con: sqlite3.Connection) -> None:
    path = DATA_DIR / "text_coverage_curve.json"
    if not path.exists():
        print("  text_coverage_curve.json missing; skipping (run compute_coverage_curves.py)")
        return
    with path.open(encoding="utf-8") as f:
        data = json.load(f)
    cur = con.cursor()
    n = 0
    for register, curve in data.items():
        for rank, cov in curve.items():
            cur.execute(
                "INSERT OR REPLACE INTO text_coverage_curve (register, rank, cumulative_coverage) VALUES (?,?,?)",
                (register, int(rank), float(cov)),
            )
            n += 1
    print(f"  text_coverage_curve: {n} rows")


def main() -> int:
    if not DATA_DIR.exists():
        print(f"data dir not found: {DATA_DIR}", file=sys.stderr)
        return 1

    tmp_db = DB_PATH.with_suffix(".db.tmp")
    if tmp_db.exists():
        tmp_db.unlink()

    print(f"Building {tmp_db}...")
    con = sqlite3.connect(tmp_db)
    con.executescript(SCHEMA_SQL)

    print("Loading lemmas...")
    lemma_lookup = load_lemmas(con)
    print("Loading forms...")
    load_forms(con, lemma_lookup)
    print("Loading themes...")
    load_themes(con)
    print("Loading bands...")
    load_bands(con)
    print("Loading curated entries...")
    load_curated(con, lemma_lookup)
    print("Loading coverage curve...")
    load_coverage_curve(con)

    con.commit()
    # Compact + checkpoint
    con.execute("PRAGMA wal_checkpoint(FULL);")
    con.execute("VACUUM;")
    con.close()

    # Atomic move into place
    if DB_PATH.exists():
        DB_PATH.unlink()
    # Also remove WAL/SHM siblings of the old DB if any
    for sib in (DB_PATH.with_suffix(".db-wal"), DB_PATH.with_suffix(".db-shm")):
        if sib.exists():
            sib.unlink()
    os.replace(tmp_db, DB_PATH)

    print(f"\nWrote {DB_PATH} ({DB_PATH.stat().st_size:,} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
