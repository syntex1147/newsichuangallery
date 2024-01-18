# New Sichuan Gallery

A static photo gallery website for New Sichuan, a Chinese restaurant. The page is organized by menu sections (appetizers, steamed dishes, cold dishes, wok-fried, noodles and rice, Sichuan specialties, Sichuan noodles) with each dish shown as a captioned image tile.

Layout uses [Masonry.js](https://masonry.desandro.com/) so the tiles pack together nicely regardless of image aspect ratio.

## Running it

Plain HTML, CSS, and a tiny bit of JS — no build step:

```
python3 -m http.server
```

Then open `http://localhost:8000`.

## Files

- `index.html` — gallery markup, organized by section
- `styles.css` — layout, parallax header, and tile styling
- `scripts.js` — Masonry initialization
- `imgs/` — dish photos
