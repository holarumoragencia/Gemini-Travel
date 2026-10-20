# Genera el video vertical "DEPARTURES" (pantalla azul de aeropuerto con vuelos a Brasil).
# Uso: python3 departures.py [--out ../videos/departures-brasil-1080x1920.mp4] [--preview 3.5]
# Necesita Pillow y ffmpeg.
import math
import os
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, "assets", "fonts")
W, H, FPS = 1080, 1920, 30
DURATION = 16.0

# Vuelos directos a Brasil desde Argentina. Córdoba y Rosario van primero y resaltados.
FLIGHTS = [
    ("12:40", "CÓRDOBA", "RÍO DE JANEIRO", True),
    ("12:50", "ROSARIO", "RÍO DE JANEIRO", True),
    ("13:05", "BUENOS AIRES", "SAN PABLO", False),
    ("13:20", "MENDOZA", "SAN PABLO", False),
    ("13:35", "SALTA", "RÍO DE JANEIRO", False),
    ("13:50", "TUCUMÁN", "FLORIANÓPOLIS", False),
    ("14:10", "BARILOCHE", "SAN PABLO", False),
    ("14:25", "BUENOS AIRES", "FLORIANÓPOLIS", False),
]
TITLES = ["DEPARTURES", "PARTIDAS", "SALIDAS"]
HEADERS = ["HORA", "DESDE", "DESTINO", "VIAJAS CON"]

BLUE = (0, 0, 255)
NAVY_TOP, NAVY_BOTTOM = (2, 26, 74), (0, 16, 168)
YELLOW = (255, 255, 0)
HEADER_INK = (16, 16, 176)
WHITE = (255, 255, 255)
TEAL, GOLD = (31, 135, 160), (201, 164, 106)

TITLE_H = 420
BAR_Y, BAR_H = TITLE_H, 72
ROWS_Y, ROW_H = BAR_Y + BAR_H + 20, 128
# (izquierda, derecha) de cada columna
COLS = [(0, 180), (180, 500), (500, 820), (820, 1080)]
CELL_PAD = 14

ENTER_START, ENTER_STAGGER = 0.6, 0.22
EXIT_START = DURATION - 1.4
FLIP = 0.16           # duración del giro de cada letra
CHAR_STAGGER = 0.035  # retraso entre letras
MARQUEE_SPEED = 110   # px/s
MARQUEE_GAP = 90


def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, f"Montserrat-{name}.ttf"), size)


class Glyphs:
    """Cache de letras sueltas para poder animarlas una por una."""

    def __init__(self, fnt, color):
        self.fnt, self.color, self.cache = fnt, color, {}
        asc, desc = fnt.getmetrics()
        self.h = asc + desc

    def get(self, ch):
        if ch not in self.cache:
            adv = self.fnt.getlength(ch)
            img = Image.new("RGBA", (max(1, math.ceil(adv) + 8), self.h), (0, 0, 0, 0))
            ImageDraw.Draw(img).text((4, 0), ch, font=self.fnt, fill=self.color)
            self.cache[ch] = (img, adv)
        return self.cache[ch]

    def width(self, text):
        return sum(self.get(c)[1] for c in text)


class FlapText:
    """Texto que cambia letra por letra con un giro vertical, como los carteles de aeropuerto.
    events: lista de (tiempo, texto); el texto vacío hace desaparecer las letras."""

    def __init__(self, glyphs, box, events, marquee=True):
        self.g, self.box, self.events, self.marquee = glyphs, box, sorted(events), marquee

    def _state(self, t):
        prev, cur = ("", -1e9), None
        for ev in self.events:
            if ev[0] <= t:
                if cur:
                    prev = (cur[1], cur[0])
                cur = ev
        return prev, cur

    def _layout(self, text, t_since):
        left, right = self.box
        w = self.g.width(text)
        inner = right - left - 2 * CELL_PAD
        if w <= inner or not self.marquee:
            return left + (right - left - w) / 2, w, False
        # el texto largo arranca quieto y después se desplaza en loop dentro de la celda
        hold = len(text) * CHAR_STAGGER + FLIP + 0.6
        off = max(0.0, t_since - hold) * MARQUEE_SPEED
        return left + CELL_PAD - off % (w + MARQUEE_GAP), w, True

    def draw(self, canvas, cy, t):
        (old, t_old), cur = self._state(t)
        if cur is None:
            return
        t0, new = cur
        left, right = self.box
        if not self.marquee:  # los títulos pueden pasarse un poco del ancho de la columna
            left, right = left - 40, right + 40
        cell = Image.new("RGBA", (right - left, self.g.h + 20), (0, 0, 0, 0))
        top = 10

        def put(ch, x, scale):
            if scale <= 0.02 or ch == " ":
                return
            img, _ = self.g.get(ch)
            hh = max(1, int(img.height * scale))
            im = img.resize((img.width, hh), Image.BILINEAR) if hh != img.height else img
            if -img.width < x - left < cell.width:
                cell.alpha_composite(im, (int(x) - 4 - left, top + (img.height - hh) // 2))

        def run(text, since, which):
            x0, w, loops = self._layout(text, since)
            copies = [x0, x0 + w + MARQUEE_GAP] if loops else [x0]
            for base in copies:
                x = base
                for i, ch in enumerate(text):
                    adv = self.g.get(ch)[1]
                    ts = t0 + i * CHAR_STAGGER
                    p = (t - ts) / FLIP
                    if which == "old":
                        if p < 0:
                            put(ch, x, 1)
                        elif p < 0.5:
                            put(ch, x, math.cos(p * math.pi))
                    else:
                        if 0.5 <= p < 1:
                            put(ch, x, -math.cos(p * math.pi))
                        elif p >= 1:
                            put(ch, x, 1)
                    x += adv

        run(old, t - t_old, "old")
        run(new, t - t0, "new")
        # se recorta el margen para que el texto que se desplaza no toque la columna vecina
        pad = CELL_PAD if self.marquee else 0
        inner = cell.crop((pad, 0, cell.width - pad, cell.height))
        canvas.alpha_composite(inner, (left + pad, int(cy - self.g.h / 2) - top))


def gemini_logo(width):
    """Logo de Gemini Travel en caja blanca, dibujado en alta resolución."""
    k = 4
    w, h = width * k, int(width * 0.4) * k
    img = Image.new("RGB", (w, h), WHITE)
    d = ImageDraw.Draw(img)
    f1 = font("Medium", int(h * 0.42))
    f2 = font("Medium", int(h * 0.15))
    tw = d.textlength("GEMINI", font=f1)
    d.text(((w - tw) / 2, h * 0.08), "GEMINI", font=f1, fill=TEAL)
    ty = h * 0.66
    t2 = d.textlength("TRAVEL", font=f2)
    cx = w / 2
    d.text((cx - t2 / 2, ty - h * 0.09), "TRAVEL", font=f2, fill=GOLD)
    lw = max(2, k)
    d.line([(cx - w * 0.33, ty), (cx - t2 / 2 - w * 0.03, ty)], fill=GOLD, width=lw)
    d.line([(cx + t2 / 2 + w * 0.03, ty), (cx + w * 0.26, ty)], fill=GOLD, width=lw)
    # avioncito
    px, s = cx + w * 0.30, h * 0.07
    d.polygon([(px - s * 1.6, ty - s * 0.25), (px + s * 1.6, ty - s * 0.25), (px + s * 2, ty),
               (px + s * 1.6, ty + s * 0.25), (px - s * 1.6, ty + s * 0.25)], fill=GOLD)
    d.polygon([(px - s * 0.2, ty), (px + s * 0.5, ty), (px - s * 0.4, ty - s * 1.5), (px - s * 0.9, ty - s * 1.5)], fill=GOLD)
    d.polygon([(px - s * 0.2, ty), (px + s * 0.5, ty), (px - s * 0.4, ty + s * 1.5), (px - s * 0.9, ty + s * 1.5)], fill=GOLD)
    d.polygon([(px - s * 1.6, ty), (px - s * 1.1, ty), (px - s * 1.5, ty - s * 0.9), (px - s * 1.8, ty - s * 0.9)], fill=GOLD)
    return img.resize((width, h // k), Image.LANCZOS)


def ease(x):
    x = min(1, max(0, x))
    return x * x * (3 - 2 * x)


def build():
    title_g = Glyphs(font("Bold", 118), WHITE)
    head_g = Glyphs(font("Bold", 36), HEADER_INK)
    row_g = Glyphs(font("Bold", 48), WHITE)

    # el título cambia de idioma cada 3,5 s
    title_events = [(0.2, TITLES[0])]
    t, i = 3.6, 1
    while t < EXIT_START - 1:
        title_events.append((t, TITLES[i % len(TITLES)]))
        t, i = t + 3.5, i + 1
    title_events.append((EXIT_START + 0.6, TITLES[0]))
    title = FlapText(title_g, (0, W), title_events, marquee=False)

    headers = [FlapText(head_g, COLS[c], [(0.3 + c * 0.08, h)], marquee=False)
               for c, h in enumerate(HEADERS)]

    rows = []
    for r, (hora, desde, destino, star) in enumerate(FLIGHTS):
        te = ENTER_START + r * ENTER_STAGGER
        tx = EXIT_START + r * 0.06
        # el destino alterna entre "BRASIL" y la ciudad brasileña
        dest_ev = [(te + 0.1, "BRASIL")]
        t = 5.0 + r * 0.12
        flip = True
        while t < EXIT_START - 1.5:
            dest_ev.append((t, destino if flip else "BRASIL"))
            t, flip = t + 4.2, not flip
        dest_ev.append((tx, ""))
        rows.append(dict(
            star=star, enter=te,
            cells=[
                FlapText(row_g, COLS[0], [(te, hora), (tx, "")]),
                FlapText(row_g, COLS[1], [(te + 0.05, desde), (tx, "")]),
                FlapText(row_g, COLS[2], dest_ev),
            ],
            exit=tx,
        ))
    return title, headers, rows


def background():
    img = Image.new("RGBA", (W, H), BLUE + (255,))
    d = ImageDraw.Draw(img)
    for y in range(TITLE_H):
        k = y / (TITLE_H - 1)
        d.line([(0, y), (W, y)], fill=tuple(int(a + (b - a) * k) for a, b in zip(NAVY_TOP, NAVY_BOTTOM)))
    d.rectangle([0, BAR_Y, W, BAR_Y + BAR_H - 1], fill=YELLOW)
    return img


def frame(t, bg, logo, title, headers, rows):
    img = bg.copy()
    d = ImageDraw.Draw(img)
    title.draw(img, TITLE_H * 0.62, t)
    for h in headers:
        h.draw(img, BAR_Y + BAR_H / 2, t)
    for r, row in enumerate(rows):
        cy = ROWS_Y + r * ROW_H + ROW_H / 2
        if row["star"] and row["enter"] + 0.6 < t < row["exit"]:
            # Córdoba y Rosario: franja que late para que se destaquen
            a = int(28 + 26 * (0.5 + 0.5 * math.sin((t - row["enter"]) * 2 * math.pi / 1.6)))
            band = Image.new("RGBA", (W, ROW_H - 12), (255, 255, 255, a))
            img.alpha_composite(band, (0, int(cy - (ROW_H - 12) / 2)))
        for c in row["cells"]:
            c.draw(img, cy, t)
        # el logo aparece girando, igual que las letras
        p_in = (t - row["enter"] - 0.25) / (FLIP * 2)
        p_out = (t - row["exit"] - 0.2) / (FLIP * 2)
        s = ease(p_in) * (1 - ease(p_out))
        if s > 0.02:
            lh = max(1, int(logo.height * s))
            lg = logo.resize((logo.width, lh), Image.BILINEAR)
            l, rgt = COLS[3]
            img.paste(lg, (int((l + rgt - logo.width) / 2), int(cy - lh / 2)))
    return img.convert("RGB")


def main():
    args = sys.argv[1:]
    out = args[args.index("--out") + 1] if "--out" in args else os.path.join(
        HERE, "..", "videos", "departures-brasil-1080x1920.mp4")
    bg = background()
    logo = gemini_logo(176)
    parts = build()
    if "--preview" in args:
        t = float(args[args.index("--preview") + 1])
        frame(t, bg, logo, *parts).save(out)
        return
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
                           "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "slow",
                           "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out],
                          stdin=subprocess.PIPE)
    total = int(DURATION * FPS)
    for i in range(total):
        ff.stdin.write(frame(i / FPS, bg, logo, *parts).tobytes())
        if i % 60 == 0:
            print(f"cuadro {i}/{total}")
    ff.stdin.close()
    ff.wait()
    print("Listo:", os.path.abspath(out))


if __name__ == "__main__":
    main()
