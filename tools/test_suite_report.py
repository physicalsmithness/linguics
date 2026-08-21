#!/usr/bin/env python3
import tempfile
import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
import suite_report


class SuiteReportTests(unittest.TestCase):
    def test_paid_error_and_non_score_statuses_are_honest(self):
        sweep = {"model": "example/model", "mode": "none", "response_contract": "compact_v2", "suite_version": 2,
                 "results": [
                     {"status": "pass", "pass": True, "cost": .01, "cost_known": True, "ms": 1000, "outTok": 100},
                     {"status": "fail", "pass": False, "cost": .02, "cost_known": True, "ms": 2000, "outTok": 200},
                     {"status": "call_error", "cost": .03, "cost_known": True, "ms": 3000, "outTok": 300},
                     {"status": "call_error", "cost": None, "cost_known": False, "http_status": 502},
                     {"status": "manual", "cost": .04, "cost_known": True},
                     {"status": "broken", "cost": None, "cost_known": False}]}
        row = suite_report.summarise_sweep(sweep)
        self.assertEqual((row["passed"], row["scored"]), (1, 2))
        self.assertEqual((row["manual"], row["broken"], row["call_error"]), (1, 1, 2))
        self.assertAlmostEqual(row["known_cost"], .10)
        self.assertEqual(row["unknown_cost_calls"], 1)
        self.assertEqual(row["output_tokens"], 600)
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / "report.html"
            suite_report.build([row], target, "fixture")
            page = target.read_text(encoding="utf-8")
            self.assertIn("$0.1000", page)
            self.assertIn("1 call(s) have unknown cost", page)
            self.assertIn("1 / 2", page)

    def test_provenance_distinct_sweeps_remain_distinct(self):
        rows = suite_report.rows_from_document([
            {"model": "m", "mode": "none", "response_contract": "legacy_v1", "suite_version": "a", "results": []},
            {"model": "m", "mode": "none", "response_contract": "compact_v2", "suite_version": "b", "results": []}])
        self.assertEqual(len(rows), 2)
        self.assertNotEqual(rows[0]["contract"], rows[1]["contract"])


if __name__ == "__main__":
    unittest.main()
