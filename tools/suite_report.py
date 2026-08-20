#!/usr/bin/env python3
"""Turn a suite sweep into a page Smith can read without asking anyone.

Input: the JSON from bench.html's Export log (or the raw ll_suite_results_v1).
Output: one self-contained HTML file. Data-tables house style is baked in here
rather than applied by hand, so a regenerated file keeps the style.
"""
import json, sys, os, datetime
sys.path.insert(0, "/sessions/charming-optimistic-curie/mnt/.claude/skills/data-tables/scripts")
from shade import two_tone, reciprocal

INK, RULE, CREAM = "#2b2b2b", "#e2dbcc", "#fdfaf4"
# one class of quantity, one colour. never borrow a gradient.
C_RIGHT, C_DONE, C_COST, C_TIME, C_TIDY = "#3a4f8a", "#5b7a52", "#8a5a2b", "#7a4a7a", "#7a7268"

def build(rows, out_path, when, cases):
    rows = sorted(rows, key=lambda r: (-r["passed"], r["costUsd"]))
    max_pass  = cases
    max_done  = cases
    max_cost  = max(r["costUsd"] for r in rows) or 1
    max_tidy  = max(r["untidy"] for r in rows) or 1
    best_sec  = min([r["secPerCall"] for r in rows if r["secPerCall"] > 0] or [1])
    tot_cost  = sum(r["costUsd"] for r in rows)
    tot_min   = sum(r["secTotal"] for r in rows) / 60

    def td(val, bg, txt=None):
        return ('<td style="background:%s">%s</td>' % (bg, val if txt is None else txt))

    body = []
    for r in rows:
        done, passed = r["completed"], r["passed"]
        of_done = ("%d%%" % round(100*passed/done)) if done else "&mdash;"
        body.append(
            "<tr>"
            + '<td class="m">%s</td>' % r["model"]
            + td(passed, two_tone(passed, max_pass, C_RIGHT))
            + td(of_done, two_tone(passed/done*max_pass if done else 0, max_pass, C_RIGHT))
            + td(done, two_tone(done, max_done, C_DONE))
            + td("$%.3f" % r["costUsd"], two_tone(r["costUsd"], max_cost, C_COST))
            + td("%.1f&cent;" % (100*r["costUsd"]/done) if done else "&mdash;",
                 two_tone(r["costUsd"]/done if done else 0, max_cost/cases, C_COST))
            + td("%.0f" % r["secPerCall"] if r["secPerCall"] else "&mdash;",
                 reciprocal(r["secPerCall"], best_sec, C_TIME) if r["secPerCall"] else "#fff")
            + td("%.0f" % (r["secTotal"]/60) if r["secTotal"] else "&mdash;",
                 reciprocal(r["secTotal"]/60, min(x["secTotal"] for x in rows if x["secTotal"])/60, C_TIME)
                 if r["secTotal"] else "#fff")
            + td(r["untidy"], two_tone(r["untidy"], max_tidy, C_TIDY))
            + "</tr>")

    html = """<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<title>Marker model comparison &mdash; %(when)s</title><style>
body{margin:0;padding:28px;background:%(cream)s;color:%(ink)s;
 font-family:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;font-size:16px;line-height:1.5}
h1{font-size:25px;margin:0 0 2px;color:#3a4f8a;font-weight:600}
.sub{color:#7a7268;font-size:14px;margin-bottom:18px}
table{border-collapse:collapse;margin:14px 0 8px;background:#fff}
th,td{border:1px solid %(rule)s;padding:7px 9px;text-align:center;vertical-align:middle;
 font-variant-numeric:tabular-nums;color:%(ink)s}
th{font-size:12px;font-weight:600;color:#7a7268;vertical-align:bottom;max-width:76px;
 word-wrap:break-word;line-height:1.2}
td.m{text-align:left;font-weight:600;white-space:nowrap;background:#fff}
.k{font-size:13.5px;color:#4a4437;max-width:60em;margin:14px 0}
.k b{color:%(ink)s}
.tot{font-size:15px;margin:10px 0 0}
</style></head><body>
<h1>Which model should mark Linguics?</h1>
<div class="sub">%(cases)d test sentences put to every model in turn, %(when)s.
Each test says in advance which skills the marker ought to notice and which it must not invent.</div>
<table>
<thead><tr>
<th>Model</th>
<th>Marked<br>right</th>
<th>Of the<br>ones it<br>answered</th>
<th>Answers it<br>managed<br>(of %(cases)d)</th>
<th>Cost for<br>all %(cases)d</th>
<th>Cost per<br>answer</th>
<th>Seconds<br>per<br>answer</th>
<th>Minutes<br>in total</th>
<th>Quoted<br>oddly</th>
</tr></thead>
<tbody>%(body)s</tbody></table>
<div class="tot"><b>The whole run cost $%(tot_cost).2f</b> and the models spent %(tot_min).0f minutes
answering, spread over about an hour and a half of wall clock.</div>
<div class="k">
<p><b>Marked right</b> is how many of the %(cases)d sentences it judged exactly as the test said it should:
every skill it was told to notice, noticed, and nothing invented that should not be there.</p>
<p><b>Of the ones it answered</b> matters more than the raw score, because some models never got an
answer back at all. A model that answers ten and gets nine right is a better marker than one that
answers eighteen and gets ten right; it is just less reliable.</p>
<p><b>Quoted oddly</b> is not a marking mistake. It means the marker judged correctly but, when asked to
quote the learner's own words back as evidence, quoted something that is not literally in what the
learner typed. It affects what the feedback panel can underline, not whether the mark is right.</p>
<p><b>Shading:</b> each kind of number has its own colour and its own scale, white at zero. The two time
columns are shaded on the reciprocal, because there low is good and there is no natural ceiling.</p>
</div>
</body></html>""" % dict(when=when, cases=cases, cream=CREAM, ink=INK, rule=RULE,
                          body="".join(body), tot_cost=tot_cost, tot_min=tot_min)
    open(out_path, "w", encoding="utf8").write(html)
    return out_path

if __name__ == "__main__":
    rows = json.load(open(sys.argv[1], encoding="utf8"))
    print(build(rows, sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else "", 18))
