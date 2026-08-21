#!/usr/bin/env python3
"""Render honest marker-suite results from a bench export.

Accepted input: the object exported by housing/bench.html, a raw list of suite
sweeps, or the old already-summarised row list. Unlike the first report, this
version does not treat failed calls as free, hard-code an 18-case denominator,
or merge runs whose contract/provenance differs.
"""
from __future__ import annotations

import html
import json
import sys
from pathlib import Path
from typing import Any, Iterable

INK, RULE, CREAM = "#2b2b2b", "#e2dbcc", "#fdfaf4"
C_RIGHT, C_COST, C_TIME, C_TIDY = "#3a4f8a", "#8a5a2b", "#7a4a7a", "#7a7268"


def _hex_rgb(colour: str) -> tuple[int, int, int]:
    colour = colour.lstrip("#")
    return tuple(int(colour[i:i + 2], 16) for i in (0, 2, 4))  # type: ignore[return-value]


def _shade(value: float, ceiling: float, colour: str, reciprocal: bool = False) -> str:
    if value <= 0 or ceiling <= 0:
        return "#ffffff"
    amount = min(1.0, (ceiling / value) if reciprocal else (value / ceiling)) * 0.55
    mixed = tuple(round(255 + (channel - 255) * amount) for channel in _hex_rgb(colour))
    return "rgb(%d,%d,%d)" % mixed


def _number(value: Any) -> float | None:
    return float(value) if isinstance(value, (int, float)) and not isinstance(value, bool) else None


def _status(result: dict[str, Any]) -> str:
    declared = result.get("status")
    if declared in {"pass", "fail", "manual", "broken", "call_error"}:
        return declared
    if any("call failed" in str(message).lower() for message in (result.get("missing") or [])):
        return "call_error"
    if result.get("manual_review"):
        return "manual"
    if result.get("pass") is True:
        return "pass"
    if result.get("pass") is False:
        return "fail"
    return "broken"


def _fingerprint(sweep: dict[str, Any], results: list[dict[str, Any]]) -> str:
    worker = sweep.get("worker_build") or next(
        (r.get("workerBuild") or r.get("worker_build") for r in results
         if r.get("workerBuild") or r.get("worker_build")), "")
    prompt = sweep.get("prompt_sha256") or next(
        (r.get("promptSha256") or r.get("prompt_sha256") for r in results
         if r.get("promptSha256") or r.get("prompt_sha256")), "")
    suite = sweep.get("suite_sha256") or sweep.get("suite_version") or ""
    bits = []
    if worker:
        bits.append("worker " + str(worker))
    if suite:
        bits.append("suite " + str(suite)[:12])
    if prompt:
        bits.append("prompt " + str(prompt)[:12])
    return " · ".join(bits) or "provenance not recorded"


def summarise_sweep(sweep: dict[str, Any]) -> dict[str, Any]:
    results = [r for r in (sweep.get("results") or []) if isinstance(r, dict)]
    counts = {name: 0 for name in ("pass", "fail", "manual", "broken", "call_error")}
    known_cost = 0.0
    known_cost_calls = unknown_cost_calls = 0
    seconds = 0.0
    timed_calls = output_tokens = untidy = 0
    for result in results:
        status = _status(result)
        counts[status] += 1
        cost = _number(result.get("cost"))
        if cost is None:
            cost = _number(result.get("cost_usd"))
        if cost is not None and result.get("cost_known") is not False:
            known_cost += cost
            known_cost_calls += 1
        elif status != "broken" or any(key in result for key in ("usage", "ms", "http_status")):
            unknown_cost_calls += 1
        ms = _number(result.get("ms"))
        if ms is not None:
            seconds += ms / 1000.0
            timed_calls += 1
        out_tokens = _number(result.get("outTok"))
        if out_tokens is None and isinstance(result.get("usage"), dict):
            out_tokens = _number(result["usage"].get("output_tokens"))
        output_tokens += int(out_tokens or 0)
        if result.get("hygiene") is False:
            untidy += 1
    scored = counts["pass"] + counts["fail"]
    return {
        "model": str(sweep.get("model") or "unknown"),
        "mode": str(sweep.get("mode") or "unknown"),
        "contract": str(sweep.get("response_contract") or sweep.get("contract") or "legacy_v1"),
        "temperature": sweep.get("temperature", sweep.get("temp", "?")),
        "seed": sweep.get("seed", ""),
        "total": len(results), "scored": scored, "passed": counts["pass"], "failed": counts["fail"],
        "manual": counts["manual"], "broken": counts["broken"], "call_error": counts["call_error"],
        "known_cost": known_cost, "known_cost_calls": known_cost_calls,
        "unknown_cost_calls": unknown_cost_calls, "seconds_total": seconds,
        "seconds_per_timed_call": seconds / timed_calls if timed_calls else 0.0,
        "output_tokens": output_tokens, "untidy": untidy, "when": str(sweep.get("when") or ""),
        "fingerprint": _fingerprint(sweep, results),
    }


def _legacy_row(row: dict[str, Any]) -> dict[str, Any]:
    completed, passed = int(row.get("completed") or 0), int(row.get("passed") or 0)
    total = int(row.get("cases") or row.get("total") or completed)
    return {
        "model": str(row.get("model") or "unknown"), "mode": str(row.get("mode") or "historic"),
        "contract": str(row.get("contract") or "legacy_v1"), "temperature": row.get("temperature", "?"),
        "seed": row.get("seed", ""), "total": total, "scored": completed, "passed": passed,
        "failed": max(0, completed - passed), "manual": int(row.get("manual") or 0),
        "broken": int(row.get("broken") or 0), "call_error": max(0, total - completed),
        "known_cost": float(row.get("costUsd") or 0), "known_cost_calls": completed,
        "unknown_cost_calls": max(0, total - completed), "seconds_total": float(row.get("secTotal") or 0),
        "seconds_per_timed_call": float(row.get("secPerCall") or 0),
        "output_tokens": int(row.get("outputTokens") or 0), "untidy": int(row.get("untidy") or 0),
        "when": str(row.get("when") or ""), "fingerprint": "historic summary; raw provenance unavailable",
    }


def rows_from_document(document: Any) -> list[dict[str, Any]]:
    if isinstance(document, dict) and isinstance(document.get("suite_results"), list):
        sweeps = document["suite_results"]
    elif isinstance(document, dict) and isinstance(document.get("results"), list):
        sweeps = [document]
    elif isinstance(document, list):
        sweeps = document
    else:
        raise ValueError("Expected a bench export, suite sweep, or list of rows")
    if not sweeps:
        return []
    if all(isinstance(row, dict) and "results" in row for row in sweeps):
        return [summarise_sweep(row) for row in sweeps]
    if all(isinstance(row, dict) and "passed" in row for row in sweeps):
        return [_legacy_row(row) for row in sweeps]
    raise ValueError("Input mixes incompatible or unrecognised row shapes")


def _td(text: str, background: str = "#ffffff", css_class: str = "") -> str:
    cls = (' class="%s"' % css_class) if css_class else ""
    return '<td%s style="background:%s">%s</td>' % (cls, background, text)


def build(rows: Iterable[dict[str, Any]], out_path: str | Path, when: str = "") -> Path:
    rows = list(rows)
    rows.sort(key=lambda r: (-(r["passed"] / r["scored"] if r["scored"] else -1),
                             r["call_error"], r["known_cost"]))
    max_scored = max((r["scored"] for r in rows), default=1) or 1
    max_cost = max((r["known_cost"] for r in rows), default=1) or 1
    max_tidy = max((r["untidy"] for r in rows), default=1) or 1
    best_seconds = min((r["seconds_per_timed_call"] for r in rows
                        if r["seconds_per_timed_call"] > 0), default=1)
    body = []
    for row in rows:
        rate = (100 * row["passed"] / row["scored"]) if row["scored"] else None
        run_label = html.escape(row["mode"]) + " · T=" + html.escape(str(row["temperature"]))
        if row["seed"] != "":
            run_label += " · seed=" + html.escape(str(row["seed"]))
        body.append(
            "<tr>" + _td(html.escape(row["model"]), css_class="model")
            + _td(html.escape(row["contract"])) + _td(run_label)
            + _td("%d / %d" % (row["passed"], row["scored"]), _shade(row["passed"], max_scored, C_RIGHT))
            + _td(("%.0f%%" % rate) if rate is not None else "&mdash;")
            + _td(str(row["manual"])) + _td(str(row["broken"])) + _td(str(row["call_error"]))
            + _td("$%.4f" % row["known_cost"], _shade(row["known_cost"], max_cost, C_COST))
            + _td(str(row["unknown_cost_calls"])) + _td(str(row["output_tokens"]))
            + _td(("%.1f" % row["seconds_per_timed_call"]) if row["seconds_per_timed_call"] else "&mdash;",
                  _shade(row["seconds_per_timed_call"], best_seconds, C_TIME, reciprocal=True)
                  if row["seconds_per_timed_call"] else "#ffffff")
            + _td(str(row["untidy"]), _shade(row["untidy"], max_tidy, C_TIDY))
            + _td(html.escape(row["fingerprint"]), css_class="prov") + "</tr>")
    recorded_cost = sum(row["known_cost"] for row in rows)
    unknown_costs = sum(row["unknown_cost_calls"] for row in rows)
    title_when = html.escape(when or next((r["when"] for r in rows if r["when"]), "undated"))
    page = """<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Marker suite report — %(when)s</title><style>
body{margin:0;padding:28px;background:%(cream)s;color:%(ink)s;font-family:Georgia,serif;font-size:16px;line-height:1.45}h1{font-size:25px;margin:0 0 3px;color:#3a4f8a}.sub,.note{color:#716b60;font-size:14px;max-width:82em}table{border-collapse:collapse;margin:18px 0;background:#fff}th,td{border:1px solid %(rule)s;padding:7px 9px;text-align:center;vertical-align:middle;font-variant-numeric:tabular-nums}th{font-size:12px;color:#716b60;line-height:1.2}td.model{text-align:left;font-weight:600;white-space:nowrap}td.prov{text-align:left;font:12px Consolas,monospace;max-width:260px}</style></head><body>
<h1>Marker suite report</h1><div class="sub">Each row is one provenance-distinct sweep. “Right” is divided only by automatically scored cases. Manual reviews, broken case definitions and calls that returned no usable mark are shown separately.</div>
<table><thead><tr><th>Model</th><th>Contract</th><th>Run</th><th>Right / scored</th><th>Rate</th><th>Manual</th><th>Broken</th><th>Call errors</th><th>Recorded cost</th><th>Unknown-cost calls</th><th>Output tokens</th><th>Seconds / timed call</th><th>Untidy</th><th>Provenance</th></tr></thead><tbody>%(body)s</tbody></table>
<p><b>Recorded cost: $%(cost).4f.</b> %(unknown)d call(s) have unknown cost and are not silently counted as free.</p><div class="note">Generated %(when)s. Recorded cost is derived from retained usage; it is not labelled as the cost of every case unless every attempted call has known usage.</div></body></html>""" % {
        "when": title_when, "cream": CREAM, "ink": INK, "rule": RULE,
        "body": "".join(body), "cost": recorded_cost, "unknown": unknown_costs,
    }
    target = Path(out_path)
    target.write_text(page, encoding="utf-8")
    return target


def main(argv: list[str]) -> int:
    if len(argv) < 3:
        print("usage: suite_report.py INPUT.json OUTPUT.html [label]", file=sys.stderr)
        return 2
    document = json.loads(Path(argv[1]).read_text(encoding="utf-8"))
    print(build(rows_from_document(document), argv[2], argv[3] if len(argv) > 3 else ""))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
