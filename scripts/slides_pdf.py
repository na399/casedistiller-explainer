"""Combine the per-scene stills in out/pdf/*.png into out/casedistiller-explainer-slides.pdf.

Render the stills first (final frame of each scene, before its fade):
  npx remotion bundle --out-dir=out/bundle
  then for each scene: npx remotion still out/bundle Scene-<id> out/pdf/NN-<id>.png --frame=<frames-20>
Usage: python scripts/slides_pdf.py   (needs pymupdf)
"""
import glob
import os

import pymupdf

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
pngs = sorted(glob.glob(os.path.join(root, "out", "pdf", "*.png")))
out = os.path.join(root, "out", "casedistiller-explainer-slides.pdf")
doc = pymupdf.open()
for png in pngs:
    img = pymupdf.open(png)
    w, h = img[0].rect.width, img[0].rect.height  # 1920 x 1080 px
    page = doc.new_page(width=w * 0.75, height=h * 0.75)  # 1440 x 810 pt, 16:9 at 96 dpi
    page.insert_image(page.rect, filename=png)
doc.set_metadata({
    "title": "CaseDistiller explainer: slides",
    "subject": "CaseDistiller: Learning SQL-Executable Case Definitions from Clinical Records "
               "with Construction-Time Large Language Model Refinement",
})
doc.save(out, deflate=True, garbage=3)
print(f"{len(pngs)} pages -> {out} ({os.path.getsize(out) / 1e6:.1f} MB)")
