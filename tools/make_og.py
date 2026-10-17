"""Generate Open Graph share images and icons for Ubicá el Sol.

Run:  python tools/make_og.py
Outputs files into assets/img/.
"""

import math
import os

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "img")

W, H = 1200, 630

FONT_BOLD = [
    r"C:\Windows\Fonts\segoeuib.ttf",
    r"C:\Windows\Fonts\arialbd.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/Library/Fonts/Arial Bold.ttf",
]
FONT_REGULAR = [
    r"C:\Windows\Fonts\segoeui.ttf",
    r"C:\Windows\Fonts\arial.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/Library/Fonts/Arial.ttf",
]

BLUE_TOP = (47, 111, 181)
BLUE_MID = (28, 76, 134)
BLUE_BOTTOM = (18, 47, 82)
SUN = (252, 191, 73)  # official golden yellow #fcbf49
SUN_LIGHT = (252, 191, 73)  # disc uses the same fill as the rays
SUN_LINE = (133, 52, 10)  # official brown #85340a
BROWN = (133, 52, 10)  # official brown #85340a
FLAG_BLUE = (116, 172, 223)  # official sky blue #74acdf

FLAG_ASPECT = 8 / 5
SUN_RATIO = 5 / 18  # sun diameter / flag height


def load_font(candidates, size):
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                continue
    return ImageFont.load_default()


def vertical_gradient(size, top, mid, bottom):
    img = Image.new("RGB", size, top)
    draw = ImageDraw.Draw(img)
    width, height = size
    for y in range(height):
        ratio = y / max(1, height - 1)
        if ratio < 0.6:
            local = ratio / 0.6
            color = tuple(int(top[i] + (mid[i] - top[i]) * local) for i in range(3))
        else:
            local = (ratio - 0.6) / 0.4
            color = tuple(int(mid[i] + (bottom[i] - mid[i]) * local) for i in range(3))
        draw.line([(0, y), (width, y)], fill=color)
    return img


def draw_soft_circle(img, cx, cy, radius, alpha):
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=(255, 255, 255, alpha))
    return Image.alpha_composite(img.convert("RGBA"), overlay)


def draw_sun(draw, cx, cy, radius, color=SUN):
    """Sun of May: 32 rays alternating thin straight spikes and wavy ribbons,
    face measuring 2/5 of the total figure."""
    face = radius * 0.4
    start = radius * (18.6 / 48.0)
    # Stroke weight follows the reference artwork (0.62 viewBox units), with a
    # floor so it never vanishes and a ceiling so it never becomes a dark blob.
    line_w = max(1, min(6, int(round(0.62 * radius / 48.0))))

    for i in range(32):
        angle = (math.pi * 2 * i) / 32 - math.pi / 2
        is_long = i % 2 == 0
        tip_half_u = 0.52 if is_long else 0.62
        tip_half = tip_half_u * radius / 48.0
        tip_r = (48.0 if is_long else 46.6) * radius / 48.0
        wobble = 0.0 if is_long else 0.022
        steps = 14
        left = []
        right = []
        for s in range(steps + 1):
            t = s / steps
            r = start + (tip_r - start) * t
            a = angle + wobble * math.sin(math.pi * 2 * 1.25 * t) + 0.01 * t * t
            half = (1.03 * ((1 - t) ** 0.85) + tip_half_u) * radius / 48.0
            mx = math.cos(a) * r
            my = math.sin(a) * r
            left.append((mx - math.sin(a) * half, my + math.cos(a) * half))
            right.append((mx + math.sin(a) * half, my - math.cos(a) * half))
        pts = [(cx + x, cy + y) for x, y in left + list(reversed(right))]
        draw.polygon(pts, fill=color)
        draw.line(pts + [pts[0]], fill=SUN_LINE, width=line_w, joint="curve")
        capr = tip_r - tip_half
        ccx = cx + math.cos(angle) * capr
        ccy = cy + math.sin(angle) * capr
        draw.ellipse(
            [ccx - tip_half, ccy - tip_half, ccx + tip_half, ccy + tip_half],
            fill=color,
            outline=SUN_LINE,
            width=line_w,
        )

    draw.ellipse(
        [cx - face, cy - face, cx + face, cy + face],
        fill=color,
        outline=SUN_LINE,
        width=max(1, line_w),
    )

    k = radius / 48.0
    fw = max(1, min(7, int(round(0.8 * k))))

    def q(p0, p1, p2, n=12):
        out = []
        for j in range(n + 1):
            t = j / n
            x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0]
            y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]
            out.append((cx + x * k, cy + y * k))
        return out

    draw.line(q((-11.2, -7.4), (-8.4, -8.6), (-5.4, -7.0)), fill=SUN_LINE, width=fw, joint="curve")
    draw.line(q((5.4, -7.0), (8.4, -8.6), (11.2, -7.4)), fill=SUN_LINE, width=fw, joint="curve")

    for sg in (-1, 1):
        draw.line(
            q((sg * 6.6 - 2.9, -3.3), (sg * 6.6, -6.5), (sg * 6.6 + 2.9, -3.3)),
            fill=SUN_LINE,
            width=fw,
            joint="curve",
        )
        draw.line(
            q((sg * 6.6 + 2.9, -3.3), (sg * 6.6, -1.2), (sg * 6.6 - 2.9, -3.3)),
            fill=SUN_LINE,
            width=fw,
            joint="curve",
        )
        pr = 1.3 * k
        pcx = cx + sg * 6.6 * k
        pcy = cy - 3.7 * k
        draw.ellipse([pcx - pr, pcy - pr, pcx + pr, pcy + pr], fill=SUN_LINE)

    draw.line([(cx, cy - 1.2 * k), (cx, cy + 1.6 * k)], fill=SUN_LINE, width=fw)
    draw.line(q((-0.5, 1.6), (-2.5, 2.9), (-3.7, 1.4)), fill=SUN_LINE, width=fw, joint="curve")
    draw.line(q((0.5, 1.6), (2.5, 2.9), (3.7, 1.4)), fill=SUN_LINE, width=fw, joint="curve")
    draw.line(q((-3.7, 4.6), (0.0, 6.4), (3.7, 4.6)), fill=SUN_LINE, width=fw, joint="curve")
    draw.line(q((-3.0, 6.7), (0.0, 8.0), (3.0, 6.7)), fill=SUN_LINE, width=fw, joint="curve")


def draw_flag(img, x, y, w, h):
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    radius = 28
    draw.rounded_rectangle([x, y, x + w, y + h], radius=radius, fill=(255, 255, 255, 255))
    band = h / 3
    draw.rectangle([x, y, x + w, y + band], fill=FLAG_BLUE)
    draw.rectangle([x, y + band * 2, x + w, y + h], fill=FLAG_BLUE)
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([x, y, x + w, y + h], radius=radius, fill=255)
    flag = Image.new("RGBA", img.size, (0, 0, 0, 0))
    flag.paste(layer, (0, 0), mask)
    draw_sun(ImageDraw.Draw(flag), x + w / 2, y + h / 2, (h * SUN_RATIO) / 2)
    return Image.alpha_composite(img.convert("RGBA"), flag)


def wrap(text, font, draw, max_width):
    words = text.split()
    lines = []
    current = ""
    for word in words:
        candidate = (current + " " + word).strip()
        if draw.textlength(candidate, font=font) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def make_og(filename, title, subtitle):
    img = vertical_gradient((W, H), BLUE_TOP, BLUE_MID, BLUE_BOTTOM)
    img = draw_soft_circle(img, 1080, 90, 220, 34)
    img = draw_soft_circle(img, 130, 560, 190, 26)

    img = draw_flag(img, 700, 190, 420, int(420 / FLAG_ASPECT))
    img = Image.alpha_composite(img, Image.new("RGBA", img.size, (0, 0, 0, 0)))

    draw = ImageDraw.Draw(img)

    brand_font = load_font(FONT_BOLD, 30)
    title_font = load_font(FONT_BOLD, 66)
    sub_font = load_font(FONT_REGULAR, 30)
    url_font = load_font(FONT_REGULAR, 26)

    draw_sun(draw, 84, 92, 30, SUN_LIGHT)
    draw.text((130, 74), "UBICÁ EL SOL", font=brand_font, fill=(255, 255, 255))

    max_text_width = 560
    lines = wrap(title, title_font, draw, max_text_width)
    y = 190
    for line in lines[:3]:
        draw.text((80, y), line, font=title_font, fill=(255, 255, 255))
        y += int(title_font.size * 1.18)

    sub_lines = wrap(subtitle, sub_font, draw, max_text_width)
    y += 10
    for line in sub_lines[:2]:
        draw.text((82, y), line, font=sub_font, fill=(207, 228, 247))
        y += int(sub_font.size * 1.35)

    draw.text((82, H - 72), "ubicaelsol.com", font=url_font, fill=(169, 205, 236))

    img.convert("RGB").save(os.path.join(OUT, filename), "PNG", optimize=True)
    print("wrote", filename)


def make_icon(filename, size, rounded=True):
    img = vertical_gradient((size, size), BLUE_TOP, BLUE_MID, BLUE_BOTTOM)
    draw = ImageDraw.Draw(img)
    draw_sun(draw, size / 2, size / 2, size * 0.34)
    if rounded:
        mask = Image.new("L", (size, size), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * 0.22), fill=255)
        out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        out.paste(img.convert("RGBA"), (0, 0), mask)
        out.save(os.path.join(OUT, filename), "PNG", optimize=True)
    else:
        img.save(os.path.join(OUT, filename), "PNG", optimize=True)
    print("wrote", filename)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    make_og("og-default.png", "¿Podés ubicar el sol en el centro exacto?", "Reto original de precisión con la bandera argentina")
    make_og("og-how-to.png", "Cómo jugar al reto de precisión", "Reglas, puntaje y trucos en pocos pasos")
    make_og("og-el-reto.png", "Centra el Sol y el reto viral argentino", "De qué se trata y cómo probar un desafío similar")
    make_og("og-faq.png", "Preguntas frecuentes", "Todo lo que necesitás saber antes de jugar")
    make_icon("apple-touch-icon.png", 180)
    make_icon("favicon-32.png", 32, rounded=False)
    make_icon("icon-512.png", 512)
