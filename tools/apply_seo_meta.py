"""Idempotently apply SEO meta tags, icons, language links and hreflang.

Run:  python tools/apply_seo_meta.py
"""

import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://ubicaelsol.com"

PAGES = {
    "index.html": ("og-default.png", "es"),
    "como-jugar.html": ("og-how-to.png", "es"),
    "centra-el-sol-juego.html": ("og-el-reto.png", "es"),
    "preguntas-frecuentes.html": ("og-faq.png", "es"),
    "privacidad.html": ("og-default.png", "es"),
    "cookies.html": ("og-default.png", "es"),
    "contacto.html": ("og-default.png", "es"),
    "404.html": ("og-default.png", "es"),
    "en/index.html": ("og-default.png", "en"),
    "en/how-to-play.html": ("og-how-to.png", "en"),
    "en/faq.html": ("og-faq.png", "en"),
    "en/the-challenge.html": ("og-el-reto.png", "en"),
    "en/privacy.html": ("og-default.png", "en"),
    "en/cookies.html": ("og-default.png", "en"),
    "en/contact.html": ("og-default.png", "en"),
}

HREFLANG = {
    "index.html": (SITE + "/", SITE + "/en/"),
    "como-jugar.html": (SITE + "/como-jugar.html", SITE + "/en/how-to-play.html"),
    "preguntas-frecuentes.html": (SITE + "/preguntas-frecuentes.html", SITE + "/en/faq.html"),
    "centra-el-sol-juego.html": (SITE + "/centra-el-sol-juego.html", SITE + "/en/the-challenge.html"),
    "privacidad.html": (SITE + "/privacidad.html", SITE + "/en/privacy.html"),
    "cookies.html": (SITE + "/cookies.html", SITE + "/en/cookies.html"),
    "contacto.html": (SITE + "/contacto.html", SITE + "/en/contact.html"),
    "en/index.html": (SITE + "/", SITE + "/en/"),
    "en/how-to-play.html": (SITE + "/como-jugar.html", SITE + "/en/how-to-play.html"),
    "en/faq.html": (SITE + "/preguntas-frecuentes.html", SITE + "/en/faq.html"),
    "en/the-challenge.html": (SITE + "/centra-el-sol-juego.html", SITE + "/en/the-challenge.html"),
    "en/privacy.html": (SITE + "/privacidad.html", SITE + "/en/privacy.html"),
    "en/cookies.html": (SITE + "/cookies.html", SITE + "/en/cookies.html"),
    "en/contact.html": (SITE + "/contacto.html", SITE + "/en/contact.html"),
}

ICON_BLOCK = (
    '<link rel="icon" type="image/png" sizes="32x32" href="{base}assets/img/favicon-32.png" />\n'
    '<link rel="apple-touch-icon" href="{base}assets/img/apple-touch-icon.png" />'
)

LANG_SWITCH_RE = re.compile(
    r'<span class="lang-switch"[^>]*>\s*'
    r'<button[^>]*data-lang="es"[^>]*>ES</button>\s*'
    r'<button[^>]*data-lang="en"[^>]*>EN</button>\s*'
    r"</span>"
)

LANG_LINKS_RE = re.compile(r'<span class="lang-switch"[^>]*>.*?</span>', re.S)


def relative(url, base):
    rel = url.replace(SITE + "/", base)
    if rel == "":
        return (base or "") + "index.html"
    if rel == SITE:
        return base or "./"
    return rel


def lang_switch(lang, base, es_href, en_href):
    es_cur = ' aria-current="true"' if lang == "es" else ""
    en_cur = ' aria-current="true"' if lang == "en" else ""
    label = "Idioma" if lang == "es" else "Language"
    return (
        '<span class="lang-switch" role="group" aria-label="%s">\n'
        '        <a class="lang-link" data-lang="es" href="%s%s"%s>ES</a>\n'
        '        <a class="lang-link" data-lang="en" href="%s%s"%s>EN</a>\n'
        "      </span>"
    ) % (label, base, es_href, es_cur, base, en_href, en_cur)


def get(pattern, text, default=""):
    m = re.search(pattern, text, re.S)
    return m.group(1).strip() if m else default


def process(rel_path, img, lang):
    full = os.path.join(ROOT, rel_path.replace("/", os.sep))
    if not os.path.exists(full):
        print("skip (missing):", rel_path)
        return
    with open(full, "r", encoding="utf-8") as fh:
        html = fh.read()

    depth = rel_path.count("/")
    base = "../" * depth
    changed = False

    # 1. mark page language
    marker = 'data-page-lang="%s"' % lang
    if marker not in html:
        m = re.search(r"<html([^>]*)>", html)
        if m:
            attrs = re.sub(r'\s*lang="[^"]*"', "", m.group(1)).strip()
            extra = (" " + attrs) if attrs else ""
            new_tag = '<html lang="%s" %s%s>' % (lang, marker, extra)
            html = html[: m.start()] + new_tag + html[m.end():]
            changed = True

    # 2. language switch links
    if LANG_SWITCH_RE.search(html):
        es_href, en_href = HREFLANG.get(rel_path, (base + "index.html", base + "en/index.html"))
        es_href = es_href.replace(SITE + "/", base) or (base or "./")
        en_href = en_href.replace(SITE + "/", base) or (base + "en/")
        html = LANG_SWITCH_RE.sub(lambda m: lang_switch(lang, "", es_href, en_href), html, count=1)
        changed = True
    elif "lang-link" in html and rel_path in HREFLANG:
        es_url, en_url = HREFLANG[rel_path]
        es_href = relative(es_url, base)
        en_href = relative(en_url, base)
        html = LANG_LINKS_RE.sub(lambda m: lang_switch(lang, "", es_href, en_href), html, count=1)
        changed = True

    # 3. icons
    if "apple-touch-icon" not in html:
        html = re.sub(
            r'(<link rel="icon" href="data:image/svg\+xml,[^"]*" />)',
            lambda m: m.group(1) + "\n" + ICON_BLOCK.format(base=base),
            html,
            count=1,
        )
        changed = True

    # 4. og image + social meta
    if "og:image" not in html:
        title = get(r"<title>(.*?)</title>", html)
        desc = get(r'<meta name="description" content="(.*?)" />', html)
        canonical = get(r'<link rel="canonical" href="(.*?)" />', html, SITE + "/")
        image = "%s/assets/img/%s" % (SITE, img)
        alt = title.replace('"', "'")
        block = ""
        if "og:title" not in html:
            block += '<meta property="og:type" content="website" />\n'
            block += '<meta property="og:title" content="%s" />\n' % title.replace('"', "'")
            if desc:
                block += '<meta property="og:description" content="%s" />\n' % desc.replace('"', "'")
            block += '<meta property="og:url" content="%s" />\n' % canonical
            block += '<meta property="og:locale" content="%s" />\n' % ("en_US" if lang == "en" else "es_AR")
            block += '<meta property="og:site_name" content="Ubicá el Sol" />\n'
        block += '<meta property="og:image" content="%s" />\n' % image
        block += '<meta property="og:image:width" content="1200" />\n'
        block += '<meta property="og:image:height" content="630" />\n'
        block += '<meta property="og:image:alt" content="%s" />\n' % alt
        block += '<meta name="twitter:card" content="summary_large_image" />\n'
        block += '<meta name="twitter:image" content="%s" />\n' % image

        if '<link rel="canonical"' in html:
            html = re.sub(r'(<link rel="canonical"[^>]*/>)', lambda m: m.group(1) + "\n" + block.rstrip(), html, count=1)
        else:
            html = html.replace("</head>", block + "</head>", 1)
        changed = True

    # 5. hreflang
    if "hreflang" not in html and rel_path in HREFLANG and rel_path != "404.html":
        es_url, en_url = HREFLANG[rel_path]
        block = (
            '<link rel="alternate" hreflang="es-AR" href="%s" />\n'
            '<link rel="alternate" hreflang="en" href="%s" />\n'
            '<link rel="alternate" hreflang="x-default" href="%s" />' % (es_url, en_url, es_url)
        )
        if '<link rel="canonical"' in html:
            html = re.sub(r'(<link rel="canonical"[^>]*/>)', lambda m: m.group(1) + "\n" + block, html, count=1)
        changed = True

    if changed:
        with open(full, "w", encoding="utf-8") as fh:
            fh.write(html)
        print("updated", rel_path)
    else:
        print("unchanged", rel_path)


if __name__ == "__main__":
    for rel_path, (img, lang) in PAGES.items():
        process(rel_path, img, lang)
