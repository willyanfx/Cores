import { getCollection, type CollectionEntry } from 'astro:content';
import { contrast, hueFamily, oklch, spectrumKey, type Hue } from './color';

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

type Colors = Palette['data']['colors'];

const byLightness = (hexes: string[]) => [...hexes].sort((a, b) => oklch(b).l - oklch(a).l);

/**
 * Gradients for a palette. Uses the source image's gradients when it had them,
 * otherwise builds five from the palette ordered light to dark, the way the
 * "one palette, five gradients" cards pair them.
 */
export function paletteGradients(colors: Colors, source: string[][]): { stops: string[][]; built: boolean } {
  if (source.length) return { stops: source, built: false };
  const s = byLightness([...new Set(colors.map((c) => c.hex))]);
  const n = s.length;
  if (n < 2) return { stops: [], built: true };
  const pick = (span: string[], count: number) =>
    span.length <= count
      ? span
      : Array.from({ length: count }, (_, i) => span[Math.round((i * (span.length - 1)) / (count - 1))]);

  const light = s[0];
  const dark = s[n - 1];
  const accents = s.filter((h) => h !== light && h !== dark && oklch(h).c >= 0.03);
  let candidates: string[][];
  if (accents.length >= 2) {
    // Background into each accent, accent to accent, the accent ramp, dark into the strongest accent.
    const strongest = [...accents].sort((a, b) => oklch(b).c - oklch(a).c)[0];
    candidates = [
      [light, accents[0]],
      [light, accents[1]],
      [accents[0], accents[accents.length - 1]],
      pick(accents, 4),
      [dark, strongest],
    ];
  } else {
    const mid = Math.floor((n - 1) / 2);
    candidates = [[s[0], s[1]], [s[0], s[mid]], [s[mid], s[n - 1]], pick(s, 4), [s[n - 2], s[n - 1]]];
  }
  const seen = new Set<string>();
  const stops = candidates
    .map((g) => g.filter((h, i) => h !== g[i - 1]))
    .filter((g) => g.length >= 2 && !seen.has(g.join()) && seen.add(g.join()));
  return { stops, built: true };
}

export const linear = (stops: string[], angle = 180) => `linear-gradient(${angle}deg in oklab, ${stops.join(', ')})`;

/**
 * Conic sweep for the square view, seam at the top-left diagonal. Uses the
 * colors that sit near the palette's strongest hue, light to dark, so the
 * sweep stays one family instead of passing through grey.
 */
export function conic(colors: Colors): string {
  const hexes = [...new Set(colors.map((c) => c.hex))];
  const chromatic = hexes.filter((h) => oklch(h).c >= 0.03);
  const lead = [...chromatic].sort((a, b) => oklch(b).c - oklch(a).c)[0];
  const near = (h: string) => {
    const d = Math.abs(oklch(h).h - oklch(lead).h) % 360;
    return Math.min(d, 360 - d) <= 75;
  };
  const family = lead ? chromatic.filter(near) : [];
  const stops = byLightness(family.length >= 2 ? family : chromatic.length >= 2 ? chromatic : hexes);
  return `conic-gradient(from 315deg at 50% 50% in oklab, ${stops.join(', ')})`;
}

/**
 * Cell positions for the square view, row-major in a cols x cols grid.
 * Up to six colors use the 3x3 card layout (open cells form an L around the
 * center); larger palettes fill the outer ring first, clockwise.
 */
export function squareLayout(n: number): { cols: number; cells: number[] } {
  if (n <= 6) return { cols: 3, cells: [0, 2, 5, 6, 7, 8].slice(0, n === 2 ? 1 : n).concat(n === 2 ? [8] : []) };
  const cols = Math.ceil(Math.sqrt(n + 1));
  const order: number[] = [];
  for (let ring = 0; order.length < cols * cols; ring++) {
    const lo = ring;
    const hi = cols - 1 - ring;
    if (lo > hi) break;
    if (lo === hi) {
      order.push(lo * cols + lo);
      break;
    }
    for (let c = lo; c < hi; c++) order.push(lo * cols + c);
    for (let r = lo; r < hi; r++) order.push(r * cols + hi);
    for (let c = hi; c > lo; c--) order.push(hi * cols + c);
    for (let r = hi; r > lo; r--) order.push(r * cols + lo);
  }
  return { cols, cells: order.slice(0, n) };
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
