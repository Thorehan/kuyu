# Kuyu uygulama simgelerini çizer: koyu kuyu zemini, üstte gün ışığı, bakır halka, ip ve turuncu kahraman.
#   python tools/simge.py
# Çıktı: assets/icons/icon-192.png, icon-512.png, maskable-512.png, apple-180.png
import os
from PIL import Image, ImageDraw, ImageFilter

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'icons')
os.makedirs(OUT, exist_ok=True)

def draw(size, maskable=False):
    S = 4  # önce büyük çiz, sonra küçült (yumuşak kenarlar)
    W = size * S
    img = Image.new('RGBA', (W, W), (13, 20, 22, 255))
    d = ImageDraw.Draw(img)
    # taş tuğlalar
    row = W // 9
    for r in range(10):
        off = (r % 2) * row // 2
        x = -off
        while x < W:
            bw = row * 3 // 2
            shade = 34 + (r * 7 + x // row * 5) % 12
            d.rectangle([x + S * 2, r * row + S * 2, x + bw - S * 2, (r + 1) * row - S * 2], fill=(shade - 6, shade + 4, shade + 1, 255))
            x += bw
    # yukarıdan gün ışığı
    glow = Image.new('RGBA', (W, W), (0, 0, 0, 0))
    g = ImageDraw.Draw(glow)
    g.ellipse([W * 0.1, -W * 0.55, W * 0.9, W * 0.35], fill=(191, 230, 238, 120))
    glow = glow.filter(ImageFilter.GaussianBlur(W * 0.08))
    img = Image.alpha_composite(img, glow)
    d = ImageDraw.Draw(img)
    # güvenli alan: maskable simgede içerik ortadaki %80'de kalır
    k = 0.8 if maskable else 1.0
    cx = W / 2
    def Y(v): return W / 2 + (v - 0.5) * W * k
    def L(v): return v * W * k
    ring_y, ring_r = Y(0.27), L(0.11)
    hero_y, hero_r = Y(0.66), L(0.17)
    # ip
    d.line([cx, ring_y + ring_r * 0.6, cx, hero_y - hero_r * 0.6], fill=(234, 223, 196, 255), width=int(L(0.035)))
    # bakır halka
    d.ellipse([cx - ring_r, ring_y - ring_r, cx + ring_r, ring_y + ring_r], outline=(122, 75, 34, 255), width=int(L(0.06)))
    d.ellipse([cx - ring_r, ring_y - ring_r - L(0.01), cx + ring_r, ring_y + ring_r - L(0.01)], outline=(208, 138, 69, 255), width=int(L(0.04)))
    # kahraman
    d.ellipse([cx - hero_r, hero_y - hero_r + L(0.012), cx + hero_r, hero_y + hero_r + L(0.012)], fill=(184, 64, 27, 255))
    d.ellipse([cx - hero_r, hero_y - hero_r, cx + hero_r, hero_y + hero_r], fill=(242, 106, 58, 255))
    # atkı
    d.rounded_rectangle([cx - hero_r * 0.78, hero_y + hero_r * 0.22, cx + hero_r * 0.78, hero_y + hero_r * 0.52], radius=int(L(0.012)), fill=(47, 179, 166, 255))
    # göz (yukarı bakar)
    ex, ey, er = cx + hero_r * 0.05, hero_y - hero_r * 0.25, hero_r * 0.38
    d.ellipse([ex - er, ey - er, ex + er, ey + er], fill=(255, 255, 255, 255))
    pr = er * 0.45
    d.ellipse([ex - pr, ey - er * 0.55 - pr, ex + pr, ey - er * 0.55 + pr], fill=(26, 18, 16, 255))
    out = img.resize((size, size), Image.LANCZOS)
    if not maskable and size != 180:
        # yuvarlatılmış köşe (maskable ve iOS simgesi tam kare kalır, sistem kendisi keser)
        m = Image.new('L', (size * S, size * S), 0)
        ImageDraw.Draw(m).rounded_rectangle([0, 0, size * S - 1, size * S - 1], radius=int(size * S * 0.2), fill=255)
        out.putalpha(m.resize((size, size), Image.LANCZOS))
    return out

for name, size, mask in [('icon-192.png', 192, False), ('icon-512.png', 512, False), ('maskable-512.png', 512, True), ('apple-180.png', 180, False)]:
    p = os.path.join(OUT, name)
    draw(size, mask).save(p, optimize=True)
    print(name, os.path.getsize(p), 'bayt')
