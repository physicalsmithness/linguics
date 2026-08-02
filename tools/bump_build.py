#!/usr/bin/env python3
"""Bump LL_BUILD and keep every ?v= cache-buster in step with it.

Why this exists (Housing, 2026-08-02): housing/index.html loaded its scripts with
NO version query, so GitHub Pages + the browser happily served stale JS after a
push. That produced at least three separate "is it actually deployed?" arguments
on the inter_chat record - including v14 of the crosstopic thread, which declared
a pushed build unpushed. The build id and the asset URLs must move together.

    python3 tools/bump_build.py 2026-08-02-r92
    python3 tools/bump_build.py            # auto: today's date, next r-number
"""
import re, sys, datetime, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
APP = ROOT / "housing/js/app.js"
PAGES = [ROOT / "housing/index.html", ROOT / "housing/bench.html"]

def current():
    m = re.search(r'const LL_BUILD = "([^"]+)"', APP.read_text(encoding="utf-8"))
    if not m: sys.exit("LL_BUILD not found in housing/js/app.js")
    return m.group(1)

def nxt(cur):
    today = datetime.date.today().isoformat()
    m = re.match(r"(\d{4}-\d{2}-\d{2})-r(\d+)$", cur)
    n = int(m.group(2)) + 1 if m else 1
    return "%s-r%d" % (today, n)

def main():
    cur = current()
    new = sys.argv[1] if len(sys.argv) > 1 else nxt(cur)
    s = APP.read_text(encoding="utf-8")
    APP.write_text(s.replace('const LL_BUILD = "%s"' % cur,
                             'const LL_BUILD = "%s"' % new, 1), encoding="utf-8")
    print("LL_BUILD %s -> %s" % (cur, new))
    for page in PAGES:
        if not page.exists(): continue
        t = page.read_text(encoding="utf-8")
        # version any local js/ or css/ asset, whether or not it already has ?v=
        t2 = re.sub(r'(src|href)="((?:js|css)/[^"?]+)(\?v=[^"]*)?"',
                    lambda m: '%s="%s?v=%s"' % (m.group(1), m.group(2), new), t)
        if t2 != t:
            page.write_text(t2, encoding="utf-8")
            print("  versioned", page.relative_to(ROOT))
    print("\nRemember: a stale-asset symptom is now a BUG, not an explanation. "
          "If the footer shows the new build, the JS is genuinely new.")

if __name__ == "__main__":
    main()
