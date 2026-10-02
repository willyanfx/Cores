# Cores

A static Astro site that collects color palettes extracted from a folder of reference images, deployed to GitHub Pages.

## How it works

1. **Extract.** Images in `palettes_base/` (palette cards) and `reference/` (brand moodboards) were read one by one. Printed hex codes were transcribed and checked against the pixels. Where no code was printed, colors were sampled with `scripts/colors.py`. Each batch lands in `data/extracted/batchN.json`.
2. **Merge.** `npm run palettes` combines the batches into `src/data/palettes.json`, dropping duplicates and anything with fewer than two valid colors.
3. **Build.** `src/content.config.ts` loads that file as the `palettes` content collection. The home page lists every palette with hue, mood and search filters. Each palette gets a page at `/p/<id>/` with color values, a contrast table, an in-use preview and CSS, Tailwind or JSON exports.
4. **Color of the day.** `/today/` shows one named color per day as a card with its HEX, RGB, HSL and OKLCH values, plus a 1080 × 1080 PNG download. The pick is made in the browser for the visitor's local date, by walking a fixed shuffle of every named color in the collection (`getDailyColors` in `src/lib/palettes.ts`). No color repeats until the whole list has been used. `?d=YYYY-MM-DD` shows a past day.

The source images are git-ignored. Only the extracted colors are published.

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
