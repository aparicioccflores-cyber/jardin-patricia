"""
Genera los sprites pixel-art del juego (personaje de Patricia, flores,
lazo del ramo y textura de pasto) usando PIL. Todo se dibuja a mano con
formas simples sobre un lienzo pequeño y luego se escala con NEAREST
para lograr el look retro / pixel art.
"""
from PIL import Image, ImageDraw
import os

OUT = os.path.join(os.path.dirname(__file__), "..", "src", "main", "resources", "static", "assets")
os.makedirs(OUT, exist_ok=True)

SCALE = 8          # factor de escalado final
CANVAS = 24         # lienzo de trabajo (24x24 "pixeles" grandes)

# ---------------- paleta ----------------
HAIR = (196, 42, 42, 255)
HAIR_DARK = (150, 25, 25, 255)
SKIN = (247, 197, 159, 255)
SKIN_SHADOW = (227, 170, 130, 255)
TOP = (139, 30, 63, 255)        # corset rojo vino, como en la foto
TOP_DARK = (105, 20, 48, 255)
SKIRT = (40, 36, 46, 255)       # falda/cárdigan oscuro
SKIRT_DARK = (25, 22, 30, 255)
CROWN = (255, 217, 61, 255)
CROWN_DARK = (230, 180, 30, 255)
SHOE = (58, 42, 42, 255)
EYE = (35, 25, 30, 255)
OUTLINE = (30, 20, 25, 255)


def new_canvas():
    return Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))


def px(draw, x, y, color, w=1, h=1):
    draw.rectangle([x, y, x + w - 1, y + h - 1], fill=color)


def draw_crown(draw, cx, base_y):
    # coronita de 3 picos apoyada sobre el pelo
    draw.polygon([(cx - 5, base_y + 2), (cx - 5, base_y - 2), (cx - 3, base_y)], fill=CROWN)
    draw.polygon([(cx - 2, base_y - 3), (cx, base_y - 6), (cx + 2, base_y - 3)], fill=CROWN)
    draw.polygon([(cx + 3, base_y - 2), (cx + 5, base_y), (cx + 3, base_y + 2)], fill=CROWN)
    px(draw, cx - 5, base_y, CROWN_DARK, 11, 2)


def draw_character(direction, frame):
    img = new_canvas()
    d = ImageDraw.Draw(img)
    cx = CANVAS // 2
    leg_off = 1 if frame == 1 else 0

    # --- piernas / pies (animación de caminar) ---
    px(d, cx - 4, 19 - leg_off, SHOE, 3, 3)
    px(d, cx + 1, 19 + leg_off - 1, SHOE, 3, 3)
    # --- falda ---
    px(d, cx - 5, 14, SKIRT, 10, 6)
    px(d, cx - 5, 19, SKIRT_DARK, 10, 1)
    # --- torso ---
    px(d, cx - 4, 9, TOP, 8, 6)
    px(d, cx - 4, 14, TOP_DARK, 8, 1)
    # --- brazos ---
    px(d, cx - 6, 10, SKIN_SHADOW, 2, 5)
    px(d, cx + 5, 10, SKIN_SHADOW, 2, 5)

    if direction == "down":
        # pelo: óvalo completo detrás de la cara
        d.ellipse([cx - 6, 0, cx + 6, 11], fill=HAIR)
        d.ellipse([cx - 6, 5, cx - 3, 10], fill=HAIR)   # mechones laterales
        d.ellipse([cx + 3, 5, cx + 6, 10], fill=HAIR)
        # cara
        d.ellipse([cx - 4, 3, cx + 4, 11], fill=SKIN)
        # flequillo
        d.pieslice([cx - 4, 1, cx + 4, 7], 180, 360, fill=HAIR_DARK)
        # ojos
        px(d, cx - 3, 6, EYE, 2, 2)
        px(d, cx + 1, 6, EYE, 2, 2)
        draw_crown(d, cx, -1)
    elif direction == "up":
        d.ellipse([cx - 6, 0, cx + 6, 12], fill=HAIR)
        d.ellipse([cx - 5, 6, cx + 5, 13], fill=HAIR_DARK)
        draw_crown(d, cx, -1)
    else:  # left (perfil) -- "right" se espeja con CSS
        d.ellipse([cx - 6, 0, cx + 5, 11], fill=HAIR)
        d.ellipse([cx - 3, 3, cx + 5, 11], fill=SKIN)
        d.pieslice([cx - 5, 1, cx + 4, 7], 200, 360, fill=HAIR_DARK)
        px(d, cx + 1, 6, EYE, 2, 2)
        draw_crown(d, cx - 1, -1)

    return img


def upscale(img):
    return img.resize((CANVAS * SCALE, CANVAS * SCALE), Image.NEAREST)


def save(img, name):
    upscale(img).save(os.path.join(OUT, name))


# ---------------- personaje ----------------
for direction in ("down", "up", "left"):
    for frame in (0, 1):
        save(draw_character(direction, frame), f"char_{direction}_{frame}.png")

# ---------------- flores ----------------
FLOWER_COLORS = {
    "yellow": ((255, 217, 61, 255), (247, 181, 0, 255)),
    "pink": ((255, 143, 199, 255), (230, 100, 160, 255)),
    "purple": ((185, 143, 224, 255), (150, 100, 200, 255)),
    "white": ((255, 255, 255, 255), (230, 230, 235, 255)),
    "orange": ((255, 156, 90, 255), (230, 120, 60, 255)),
}
STEM = (74, 145, 64, 255)
CENTER = (122, 74, 30, 255)

FLOWER_CANVAS = 16


def draw_flower(petal_color, petal_dark):
    img = Image.new("RGBA", (FLOWER_CANVAS, FLOWER_CANVAS), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx, cy = 8, 6
    offsets = [(-4, 0), (4, 0), (0, -4), (0, 4), (-3, -3), (3, -3), (-3, 3), (3, 3)]
    for i, (ox, oy) in enumerate(offsets[:6]):
        color = petal_color if i % 2 == 0 else petal_dark
        d.ellipse([cx + ox - 2, cy + oy - 2, cx + ox + 2, cy + oy + 2], fill=color)
    d.ellipse([cx - 2, cy - 2, cx + 2, cy + 2], fill=CENTER)
    d.rectangle([cx - 1, cy + 3, cx, 14], fill=STEM)
    return img


for name, (light, dark) in FLOWER_COLORS.items():
    im = draw_flower(light, dark)
    im.resize((FLOWER_CANVAS * 6, FLOWER_CANVAS * 6), Image.NEAREST).save(
        os.path.join(OUT, f"flower_{name}.png")
    )

# ---------------- lazo para el ramo ----------------
bow = Image.new("RGBA", (16, 12), (0, 0, 0, 0))
d = ImageDraw.Draw(bow)
d.polygon([(1, 1), (7, 5), (1, 10)], fill=(230, 60, 110, 255))
d.polygon([(15, 1), (9, 5), (15, 10)], fill=(230, 60, 110, 255))
d.ellipse([6, 3, 10, 8], fill=(200, 40, 90, 255))
bow.resize((16 * 6, 12 * 6), Image.NEAREST).save(os.path.join(OUT, "bow.png"))

print("Sprites generados en", os.path.abspath(OUT))
print(os.listdir(OUT))
