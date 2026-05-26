"""Atomic file writes that survive OneDrive sync truncating mid-write.

We write to a `.tmp` sibling first, flush + fsync, then os.replace() into the
final path. Replace is atomic at the filesystem level, so consumers either see
the old file or the fully-written new one — never a half-written file.
"""
from __future__ import annotations

import csv as _csv
import json as _json
import os
from pathlib import Path


def _write_then_replace(path: Path, write_body) -> None:
    tmp = path.with_suffix(path.suffix + ".tmp")
    with tmp.open("w", encoding="utf-8", newline="") as f:
        write_body(f)
        f.flush()
        try:
            os.fsync(f.fileno())
        except OSError:
            # fsync not supported on some Windows file types; tolerate
            pass
    os.replace(tmp, path)


def atomic_write_json(path: Path | str, data, indent: int = 2) -> None:
    path = Path(path)

    def body(f):
        _json.dump(data, f, ensure_ascii=False, indent=indent)

    _write_then_replace(path, body)


def atomic_write_csv(path: Path | str, rows: list[dict], fieldnames: list[str]) -> None:
    path = Path(path)

    def body(f):
        w = _csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        for row in rows:
            w.writerow(row)

    _write_then_replace(path, body)


def atomic_write_text(path: Path | str, text: str) -> None:
    path = Path(path)

    def body(f):
        f.write(text)

    _write_then_replace(path, body)
