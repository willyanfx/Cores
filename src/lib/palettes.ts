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
