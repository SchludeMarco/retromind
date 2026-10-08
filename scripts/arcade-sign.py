# Builds the gaming entrance pictures from Marco's photo (941 x 1672):
#   python3 scripts/arcade-sign.py <photo.png> public/gaming
# arcade-entrance.webp has the ARCADE neon sign switched off, arcade-sign-0..5.webp
# are the six lit letters (positions printed at the end go into SIGN_LETTERS in
# gaming/components/Entrance.tsx), arcade-entrance-door.webp is the door leaf.
import sys, numpy as np
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
im = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)/255
H, W, _ = im.shape
xs = np.arange(W)[None, :].astype(np.float32); ys = np.arange(H)[:, None].astype(np.float32)
def ramp(v, a, b):  # 0 before a, 1 after b
    return np.clip((v - a) / (b - a), 0, 1)
# Sign band: where the neon light is.
BX0, BX1, BY0, BY1, F = 104, 850, 178, 404, 34
M = ramp(xs, BX0 - 12, BX0 + 12) * (1 - ramp(xs, BX1 - 8, BX1 + 8)) * ramp(ys, BY0 - F, BY0 + F) * (1 - ramp(ys, BY1 - F, BY1 + F))
# Unlit: dark night wall, dead grey-ish glass tubes.
lum = (im * [0.299, 0.587, 0.114]).sum(2, keepdims=True)
gray = lum * 0.75 + im * 0.25
dark = gray * (0.3 + 0.14 * (1 - lum))  # bright tubes drop the most
dark = dark * [0.95, 0.95, 1.08]
base = im * (1 - M[..., None]) + dark * M[..., None]
Image.fromarray((np.clip(base, 0, 1) * 255).astype(np.uint8)).save(f'{out}/arcade-entrance.webp', quality=84, method=6)
# Letters: a partition of the band into six strips with soft seams.
cuts = [270, 390, 492, 632, 738]
edges = [-1e9] + cuts + [1e9]
SF = 5
boxes = []
for i in range(6):
    left = ramp(xs, edges[i] - SF, edges[i] + SF) if i else np.ones_like(xs)
    right = (1 - ramp(xs, edges[i+1] - SF, edges[i+1] + SF)) if i < 5 else np.ones_like(xs)
    A = M * left * right
    yy, xx = np.nonzero(A > 0.002)
    x0, x1, y0, y1 = xx.min(), xx.max() + 1, yy.min(), yy.max() + 1
    rgba = np.dstack([im, A])[y0:y1, x0:x1]
    Image.fromarray((rgba * 255).astype(np.uint8), 'RGBA').save(f'{out}/arcade-sign-{i}.webp', quality=88, method=6)
    boxes.append((x0, y0, x1 - x0, y1 - y0))
# The ENTRANCE door leaf, to swing open.
Image.fromarray((im[738:1372, 288:656] * 255).astype(np.uint8)).save(f'{out}/arcade-entrance-door.webp', quality=84, method=6)
print(W, H)
for b in boxes: print(b)
