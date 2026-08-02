#!/usr/bin/env python3
"""Does everything actually COMPILE? Run before any push or deploy.

Why this exists (Housing, 2026-08-02): worker/src/index.ts stopped compiling at
commit 40e0295 on 2026-07-29 - rule 13 wrote `common_errors` with raw backticks
INSIDE the system-prompt template literal, which terminates the string. Nothing
caught it: the checks in use were "braces balanced" and a piped esbuild whose
exit code was swallowed by `| tail`. So for four days the estate believed a
`wrangler deploy` would ship changes that could never build. Cheap guards, run
every time, beat clever ones run once.

    python3 tools/preflight.py
"""
import re, subprocess, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
fails = []

def ok(label, good, detail=""):
    print(("  PASS  " if good else "  FAIL  ") + label + (" — " + detail if detail else ""))
    if not good: fails.append(label)

print("client javascript")
for js in sorted((ROOT / "housing/js").glob("*.js")):
    r = subprocess.run(["node", "--check", str(js)], capture_output=True, text=True)
    ok(js.name, r.returncode == 0, (r.stderr or "").strip().split("\n")[0][:100])

print("inline <script> blocks")
for page in sorted((ROOT / "housing").glob("*.html")):
    blocks = re.findall(r"<script>(.*?)</script>", page.read_text(encoding="utf-8"), re.S)
    for i, b in enumerate(blocks):
        tmp = pathlib.Path("/tmp/_pf_%s_%d.js" % (page.stem, i))
        tmp.write_text(b, encoding="utf-8")
        r = subprocess.run(["node", "--check", str(tmp)], capture_output=True, text=True)
        ok("%s block %d" % (page.name, i), r.returncode == 0, (r.stderr or "").strip().split("\n")[0][:100])

print("worker")
w = ROOT / "worker/src/index.ts"
src = w.read_text(encoding="utf-8")
m = re.search(r"function buildSystemPrompt\(\)[^{]*\{\s*return\s+`", src)
if m:
    body = src[m.end():src.index("`;", m.end())]
    bad_bt = len(re.findall(r"(?<!\\)`", body))
    bad_in = len(re.findall(r"(?<!\\)\$\{", body))
    ok("prompt literal has no raw backticks", bad_bt == 0, "%d raw backticks - escape them as \\`" % bad_bt)
    ok("prompt literal has no stray ${", bad_in == 0, "%d unescaped ${" % bad_in)
r = subprocess.run(["npx", "--yes", "esbuild", str(w), "--bundle", "--format=esm", "--outfile=/dev/null"],
                   capture_output=True, text=True, cwd=str(ROOT))
ok("index.ts compiles (wrangler deploy will succeed)", r.returncode == 0,
   (r.stderr or "").strip().split("\n")[0][:140])

print()
if fails:
    print("PREFLIGHT FAILED: " + ", ".join(fails))
    sys.exit(1)
print("preflight clean - safe to push and deploy")
