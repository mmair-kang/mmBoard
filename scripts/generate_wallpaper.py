# Auto — 2026-06-28
"""Luxury dark phone wallpaper — 5x8 aligned shelf rows, no icon slots."""

from __future__ import annotations

import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


OUT_DIR = Path(r"C:\Users\mmair\Desktop")
OUT_PATH = OUT_DIR / "luxury_home_wallpaper_5x8.png"

WIDTH = 1080
HEIGHT = 2340

# Measured from reference screenshot, then re-spaced evenly for perfect alignment.
MAIN_ROW_COUNT = 7
SHELF_HEIGHT = 168
DOCK_HEIGHT = 176
MARGIN_X = 46

# Evenly spaced main grid (fixes original misalignment).
MAIN_FIRST_CENTER = 221
MAIN_LAST_CENTER = 1822
MAIN_GAP = (MAIN_LAST_CENTER - MAIN_FIRST_CENTER) / (MAIN_ROW_COUNT - 1)

DOCK_CENTER = 2095
DOCK_GAP = DOCK_CENTER - (MAIN_FIRST_CENTER + (MAIN_ROW_COUNT - 1) * MAIN_GAP) - SHELF_HEIGHT / 2 - DOCK_HEIGHT / 2


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def lerp_color(c1: tuple[int, int, int], c2: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return (
        int(lerp(c1[0], c2[0], t)),
        int(lerp(c1[1], c2[1], t)),
        int(lerp(c1[2], c2[2], t)),
    )


def draw_luxury_background(size: tuple[int, int]) -> Image.Image:
    w, h = size
    img = Image.new("RGB", size, (8, 8, 10))
    px = img.load()

    for y in range(h):
        t = y / (h - 1)
        shade = lerp_color((5, 5, 7), (14, 14, 17), min(1.0, t * 0.45))
        for x in range(w):
            px[x, y] = shade

    glow = Image.new("RGBA", size, (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    arcs = [
        ((int(w * -0.05), int(h * 0.02)), (int(w * 1.05), int(h * 0.48)), 95),
        ((int(w * 0.55), int(h * 0.08)), (int(w * 1.15), int(h * 0.62)), 70),
        ((int(w * -0.12), int(h * 0.52)), (int(w * 0.72), int(h * 0.98)), 55),
    ]
    for box, alpha in [(a[0:2], a[2]) for a in arcs]:
        gdraw.ellipse([*box], fill=(255, 255, 255, alpha))

    glow = glow.filter(ImageFilter.GaussianBlur(radius=int(w * 0.11)))
    composed = Image.alpha_composite(img.convert("RGBA"), glow)

    streak = Image.new("RGBA", size, (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(streak)
    sdraw.line([(w * 0.08, h * 0.12), (w * 0.92, h * 0.38)], fill=(255, 255, 255, 38), width=int(w * 0.55))
    sdraw.line([(w * 0.95, h * 0.22), (w * 0.05, h * 0.58)], fill=(255, 255, 255, 28), width=int(w * 0.48))
    streak = streak.filter(ImageFilter.GaussianBlur(radius=int(w * 0.08)))
    composed = Image.alpha_composite(composed, streak)

    rgb = composed.convert("RGB")
    vignette = Image.new("L", size, 0)
    vpx = vignette.load()
    cx, cy = w / 2, h / 2
    max_dist = math.hypot(cx, cy)
    for y in range(h):
        for x in range(w):
            dist = math.hypot(x - cx, y - cy) / max_dist
            vpx[x, y] = int(min(255, (dist**1.6) * 175))
    return Image.composite(Image.new("RGB", size, (0, 0, 0)), rgb, vignette)


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return mask


def draw_shelf(base: Image.Image, x: int, top: int, w: int, h: int, *, dock: bool = False) -> None:
    radius = max(18, int(h * 0.24))
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    body = (34, 34, 38, 108 if dock else 92)
    edge = (255, 255, 255, 42 if dock else 34)
    highlight = (255, 255, 255, 22 if dock else 16)
    shadow = (0, 0, 0, 48 if dock else 38)

    draw.rounded_rectangle((0, 0, w - 1, h - 1), radius=radius, fill=body, outline=edge, width=2)
    draw.rounded_rectangle((2, 2, w - 3, int(h * 0.38)), radius=max(8, radius - 4), fill=highlight)
    draw.rounded_rectangle((2, int(h * 0.62), w - 3, h - 3), radius=max(8, radius - 4), fill=shadow)

    layer = layer.filter(ImageFilter.GaussianBlur(radius=0.45))
    base.paste(layer, (x, top), rounded_mask((w, h), radius))


def row_centers() -> list[tuple[int, int]]:
    centers: list[tuple[int, int]] = []
    for i in range(MAIN_ROW_COUNT):
        cy = int(round(MAIN_FIRST_CENTER + i * MAIN_GAP))
        top = int(round(cy - SHELF_HEIGHT / 2))
        centers.append((cy, top))
    dock_top = int(round(DOCK_CENTER - DOCK_HEIGHT / 2))
    centers.append((DOCK_CENTER, dock_top))
    return centers


def generate() -> Path:
    base = draw_luxury_background((WIDTH, HEIGHT))
    shelf_w = WIDTH - MARGIN_X * 2

    for idx, (_cy, top) in enumerate(row_centers()):
        h = DOCK_HEIGHT if idx == MAIN_ROW_COUNT else SHELF_HEIGHT
        draw_shelf(base, MARGIN_X, top, shelf_w, h, dock=idx == MAIN_ROW_COUNT)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    base.save(OUT_PATH, format="PNG", optimize=True)
    return OUT_PATH


if __name__ == "__main__":
    path = generate()
    centers = row_centers()
    print(f"Saved: {path}")
    print(f"Resolution: {WIDTH}x{HEIGHT}")
    print(f"Main row gap: {MAIN_GAP:.1f}px, dock extra gap: {DOCK_GAP:.1f}px")
    for i, (cy, top) in enumerate(centers, 1):
        label = "dock" if i == 8 else f"row {i}"
        print(f"  {label}: center={cy}, top={top}")
