import { getCollection, type CollectionEntry } from 'astro:content';
import { contrast, hueFamily, oklch, spectrumKey, type Hue } from './color';
import type { DailyColor } from './daily';

export type Palette = CollectionEntry<'palettes'>;

export interface PaletteInfo {
  palette: Palette;
  hues: Hue[];
  /** Hue of the most chromatic color, used for "by hue" ordering. */
  leadHue: number;
  lightness: number;
}

export async function getPalettes(): Promise<PaletteInfo[]> {
  const entries = await getCollection('palettes');
  return entries.map((palette) => {
    const hexes = palette.data.colors.map((c) => c.hex);
    const lead = [...hexes].sort((a, b) => oklch(b).c - oklch(a).c)[0];
    return {
      palette,
      hues: [...new Set(hexes.map(hueFamily))],
      leadHue: spectrumKey(lead),
      lightness: hexes.reduce((s, h) => s + oklch(h).l, 0) / hexes.length,
    };
  });
}

export function href(id: string): string {
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/p/${id}/`;
}

/**
 * Assign UI roles for the "in use" preview. Uses roles from the source when
 * present, otherwise: lightest = background, darkest = text, most chromatic = accent.
 */
export function assignRoles(colors: Palette['data']['colors']) {
  const hexes = colors.map((c) => c.hex);
  const byRole = (r: string) => colors.find((c) => c.role === r)?.hex;
  const byL = [...hexes].sort((a, b) => oklch(b).l - oklch(a).l);
  const background = byRole('background') ?? byL[0];
  const text =
    byRole('text') ??
    [...hexes].sort((a, b) => contrast(b, background) - contrast(a, background))[0];
  const rest = hexes.filter((h) => h !== background && h !== text);
  const pool = rest.length ? rest : hexes;
  const accent =
    byRole('accent') ?? byRole('primary') ?? [...pool].sort((a, b) => oklch(b).c - oklch(a).c)[0];
  const surface = byRole('surface') ?? pool.find((h) => h !== accent) ?? background;
  return { background, surface, text, accent };
}

/**
 * Every distinctly named color in the collection, in a fixed shuffled order
 * for the color of the day. Sorting by hex first keeps the order independent of
 * how palettes are listed; the fixed seed keeps it the same between builds.
 */
// Names too plain to headline a day: bare color words and labels that are
// really palette roles.
const PLAIN = new Set(
  'red orange yellow green blue purple pink brown black white gray grey light minimalism structure'.split(' '),
);

export async function getDailyColors(): Promise<DailyColor[]> {
  const seen = new Set<string>();
  const colors = (await getCollection('palettes'))
    .flatMap((p) =>
      p.data.colors.map((c) => ({ hex: c.hex, name: c.name?.trim() ?? '', palette: p.data.title, url: href(p.id) })),
    )
    .filter(
      (c) =>
        c.name && !/\d/.test(c.name) && !PLAIN.has(c.name.toLowerCase()) && !seen.has(c.hex) && seen.add(c.hex),
    )
    .sort((a, b) => a.hex.localeCompare(b.hex));

  // Mulberry32
  let seed = 0x0c0e5;
  const random = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = colors.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [colors[i], colors[j]] = [colors[j], colors[i]];
  }
  return colors;
}
