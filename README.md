# Cores

A static Astro site that collects color palettes extracted from a folder of reference images, deployed to GitHub Pages.

**Live site: [willyanfx.github.io/Cores](https://willyanfx.github.io/Cores/)**, with the [brand lab](https://willyanfx.github.io/Cores/brand/), the [brand studio](https://willyanfx.github.io/Cores/studio/) and the [color of the day](https://willyanfx.github.io/Cores/today/).

## How it works

1. **Extract.** Images in `palettes_base/` (palette cards) and `reference/` (brand moodboards) were read one by one. Printed hex codes were transcribed and checked against the pixels. Where no code was printed, colors were sampled with `scripts/colors.py`. Each batch lands in `data/extracted/batchN.json`.
2. **Merge.** `npm run palettes` combines the batches into `src/data/palettes.json`, dropping duplicates and anything with fewer than two valid colors.
3. **Build.** `src/content.config.ts` loads that file as the `palettes` content collection. The home page lists every palette with hue, mood and search filters. Each palette gets a page at `/p/<id>/` with color values, a contrast table, an in-use preview and CSS, Tailwind or JSON exports.
4. **Color of the day.** `/today/` shows one named color per day as a card with its HEX, RGB, HSL and OKLCH values, plus a 1080 × 1080 PNG download. The pick is made in the browser for the visitor's local date, by walking a fixed shuffle of every named color in the collection (`getDailyColors` in `src/lib/palettes.ts`). No color repeats until the whole list has been used. `?d=YYYY-MM-DD` shows a past day.

The source images are git-ignored. Only the extracted colors are published.

## Logo

The mark is nested chevron bands on an iOS-style squircle with the outlined "Cores" wordmark, defined in `src/lib/logo.ts`. `logoRamp()` turns any palette into a dark-to-light ramp, one color per band. On the home page `src/components/Logo.astro` starts in monochrome and then moves through every palette in the collection, linking to the one on show. `src/pages/logo.svg.ts` builds a standalone `/logo.svg` that animates through eight palettes on its own, for use outside the site.

## Brand studio

`/studio/` tries a brand on every palette. (The six-color brand lab lives separately at `/brand/`.) Upload a symbol and a wide logo (SVG or PNG; an opaque image has its background knocked out), set a name and tagline, then step through palettes with the arrows, the filmstrip, Shuffle or Play. The board below is a deck of nine slides printed on the palette's own paper: a cover, the logo on every palette color, symbol and logo sheets, the color system with tints, typography, posters, a full-color in-app slide with two phone screens, and applications. Each palette color is a registered CSS `<color>` property, so blocks fade between palettes in a ripple. The cover is a banner of stepped color bands under the tagline. The Type panel takes a pairing preset or any Google Fonts family (or your own .woff2, .woff, .ttf or .otf) for headings and body, with sliders for heading weight, tracking and corner radius. Swatches can be edited, and Swap lead moves the primary role to the next color. Roles and inks come from `src/lib/brand.ts`. Uploads and settings stay in the browser's localStorage, and `?p=<id>` opens a given palette.

## Commands

| Command             | What it does                                 |
| ------------------- | -------------------------------------------- |
| `npm install`       | Install dependencies                         |
| `npm run palettes`  | Rebuild `src/data/palettes.json` from batches |
| `npm run dev`       | Dev server at http://localhost:4321          |
| `npm run build`     | Build the static site into `dist/`           |

Color helpers for sampling images (requires Pillow):

```bash
python3 scripts/colors.py dominant palettes_base/<file> 8
python3 scripts/colors.py sample palettes_base/<file> <x> <y>
```

## Deploying to GitHub Pages

1. Push this folder to a GitHub repository with `main` as the default branch.
2. In the repo, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Each push to `main` runs `.github/workflows/deploy.yml`. The site is published at `https://<owner>.github.io/<repo>/`.

`astro.config.mjs` reads `GITHUB_REPOSITORY` during the Action to set `site` and `base`, so no manual config is needed. A repo named `<owner>.github.io` is served from the root.
