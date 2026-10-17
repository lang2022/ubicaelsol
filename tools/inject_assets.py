"""Inject consent + ads scripts into every HTML page (idempotent).

Run:  python tools/inject_assets.py
"""

import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPTS = ('<script src="%sassets/js/ads.js"></script>\n'
           '<script src="%sassets/js/consent.js"></script>\n')


def pages():
    for base, _dirs, files in os.walk(ROOT):
        if "tools" in base.split(os.sep) or "node_modules" in base:
            continue
        for name in files:
            if name.endswith(".html"):
                yield os.path.join(base, name)


def run():
    for full in pages():
        rel = os.path.relpath(full, ROOT).replace(os.sep, "/")
        if rel == "404.html":
            continue
        depth = rel.count("/")
        prefix = "../" * depth
        with open(full, "r", encoding="utf-8") as fh:
            html = fh.read()
        if "assets/js/consent.js" in html:
            print("unchanged", rel)
            continue
        block = SCRIPTS % (prefix, prefix)
        if "</body>" in html:
            html = html.replace("</body>", block + "</body>", 1)
        else:
            html += block
        with open(full, "w", encoding="utf-8") as fh:
            fh.write(html)
        print("updated", rel)


if __name__ == "__main__":
    run()
