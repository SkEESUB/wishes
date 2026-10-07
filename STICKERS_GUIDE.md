# 🧸 Teddy Stickers & Visual Assets Guide

This guide outlines where to obtain premium transparent teddy stickers and illustrations for your romantic birthday experience, organized asset conventions, and licensing guidelines.

---

## 📁 Recommended Directory Structure

Store all sticker assets in:
```text
public/
  assets/
    stickers/
      teddy-wave.png       (or .webp / .gif)
      teddy-kiss.png
      teddy-love.png
      teddy-hug.png
      teddy-celebrate.png
      teddy-sparkle.png
```

---

## 🎨 Recommended Sticker Sources

| Source | Link | Best For | Typical License | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Flaticon** | [flaticon.com](https://www.flaticon.com/) | Clean, vector stickers with transparent backgrounds (SVG, PNG, WebP) | Free with attribution / Premium without attribution | Excellent for consistent romantic sticker packs. Search: *"cute teddy bear romantic"*. |
| **Freepik** | [freepik.com](https://www.freepik.com/) | High-resolution watercolor & 3D teddy illustrations | Free with attribution / Premium | Search: *"teddy bear sticker transparent background"*. |
| **GIPHY** | [giphy.com/stickers](https://giphy.com/search/stickers) | Animated looping stickers with alpha transparency | Editorial / Personal | Use the "Stickers" tab (guarantees transparent background, no black boxes). |
| **Tenor** | [tenor.com](https://tenor.com/) | Animated GIF/WebP stickers | Personal / Non-commercial | Search with `"transparent sticker"` to ensure no solid backgrounds. |
| **StickPNG** | [stickpng.com](https://www.stickpng.com/) | Cutout PNGs with genuine transparency | Non-commercial / Personal | No checkerboard baked into image pixels. |
| **PNGWing** | [pngwing.com](https://www.pngwing.com/) | Transparent PNG illustrations | Non-commercial / Personal | Verify genuine alpha channel before downloading. |

---

## ⚖️ Licensing Requirements & Best Practices

1. **Personal Romantic Gift:**
   - If this project is a personal, private birthday gift hosted for your partner, almost all free personal/non-commercial licenses (CC-BY, Flaticon Free, GIPHY Stickers) are permissible.
2. **Commercial or Public Distribution:**
   - If deploying as a public template or SaaS, use royalty-free commercial assets from Flaticon Premium, Freepik Premium, or generate custom unique illustrations using tools like Midjourney or SVG vectors.
3. **Checking Transparency:**
   - Always open the downloaded image in a dark background viewer to verify it has genuine PNG/WebP alpha transparency rather than a fake checkerboard background pattern.
4. **Recommended Format:**
   - **Animated WebP (`.webp`):** Offers 60-80% smaller file sizes than GIF with superior 8-bit alpha transparency and smooth anti-aliased edges (no jagged pixel fringe).
   - **GIF (`.gif`):** Great universal fallback.

---

## 🪄 Edge & Background Removal Tips

If you ever need to remove a background:
- Use transparent background removal tools like [remove.bg](https://www.remove.bg/) or Photoshop/Figma subject selection.
- Always save the original file untouched as `[name]-original.png` before editing.
- Inspect edges against both pure white (`#ffffff`) and dark burgundy (`#180a2b`) to confirm there is no dark or halo outline.
