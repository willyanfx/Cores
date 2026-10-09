import { contrast, inkOn, luminance, oklch } from './color';
import { mixOklab } from './logo';

/**
 * Brand roles for the brand studio and the "in use" preview. Free of
 * astro:content so the studio can run it in the browser as palettes change.
 */

export interface BrandColor {
  hex: string;
  name?: string | null;
  role?: string | null;
}

export interface BrandRoles {
  /** Lightest color: the page the identity is printed on. */
  paper: string;
  /** Highest contrast against paper: body text. */
  text: string;
  /** Most chromatic color, or the next one along when shifted. */
  primary: string;
  /** Second voice, as far round the hue wheel from primary as the palette allows. */
  accent: string;
  surface: string;
  /** Darkest color. */
  deep: string;
  /** Lightest color after paper, the bright end of the gradient. */
  light: string;
}

const hueGap = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360;
  return Math.min(d, 360 - d);
};

/**
 * Assign roles. `shift` walks primary through the palette's chromatic colors,
 * so the same palette can be tried with a different lead.
 */
export function brandRoles(colors: BrandColor[], shift = 0): BrandRoles {
  const hexes = [...new Set(colors.map((c) => c.hex))];
  const byL = [...hexes].sort((a, b) => oklch(b).l - oklch(a).l);
  const paper = byL[0];
  const deep = byL[byL.length - 1];
  const text = [...hexes].sort((a, b) => contrast(b, paper) - contrast(a, paper))[0];
  const light = byL[1] ?? paper;

  const rest = hexes.filter((h) => h !== paper);
  const pool = (rest.length > 1 ? rest.filter((h) => h !== deep) : rest).sort((a, b) => oklch(b).c - oklch(a).c);
  const lead = pool.length ? pool : [deep];
  const primary = lead[((shift % lead.length) + lead.length) % lead.length];

  const p = oklch(primary);
  const others = hexes.filter((h) => h !== primary && h !== paper);
  const accent =
    [...others].sort((a, b) => {
      const score = (h: string) => {
        const o = oklch(h);
        return o.c * (0.4 + hueGap(o.h, p.h) / 180) + Math.abs(o.l - p.l) * 0.15;
      };
      return score(b) - score(a);
    })[0] ?? deep;

  const surface = hexes.find((h) => ![paper, text, primary, accent].includes(h)) ?? light;
  return { paper, text, primary, accent, surface, deep, light };
}

/**
 * Ink for a logo or headline on `bg`: the palette color that reads best on it
 * when that clears 4.5:1, otherwise black or white.
 */
export function inkFor(bg: string, hexes: string[]): string {
  const best = hexes.filter((h) => h !== bg).sort((a, b) => contrast(b, bg) - contrast(a, bg))[0];
  return best && contrast(best, bg) >= 4.5 ? best : inkOn(bg);
}

/** Relative widths of the cover banner's bands, left to right. */
export const BANNER_GROW = [1.3, 0.8, 1.1, 1.5, 0.7, 1, 1.25, 0.6, 0.9];

/** Where band `k` sits on the ramp: most bands stay deep, only the last few run out to the paper. */
export const bannerT = (k: number) => (k / (BANNER_GROW.length - 1)) ** 1.6;

/**
 * The banner ramp, deep to paper. Each stop is [from, to, share of from], the same mixes the page
 * writes as CSS color-mix() so the inks picked here match the bands drawn there.
 */
export const BANNER_RAMP = [
  ['primary', 'deep', 0.72],
  ['primary', 'primary', 1],
  ['primary', 'light', 0.5],
  ['light', 'light', 1],
  ['paper', 'paper', 1],
] as const;

function bannerColor(roles: BrandRoles, t: number): string {
  const stop = ([a, b, w]: (typeof BANNER_RAMP)[number]) => mixOklab(roles[a], roles[b], w);
  const x = Math.min(1, Math.max(0, t)) * (BANNER_RAMP.length - 1);
  const i = Math.min(BANNER_RAMP.length - 2, Math.floor(x));
  return mixOklab(stop(BANNER_RAMP[i]), stop(BANNER_RAMP[i + 1]), 1 - (x - i));
}

const ROLE_KEYS = ['paper', 'text', 'primary', 'accent', 'surface', 'deep', 'light'] as const;

/**
 * Every color the studio paints with, as CSS custom properties: each role and
 * the ink that reads on it, then one `--cN` / `--oN` pair per palette slot.
 * Spare slots repeat the last color so their transitions stay quiet.
 */
export function brandVars(colors: BrandColor[], slots: number, shift = 0): Record<string, string> {
  const roles = brandRoles(colors, shift);
  const hexes = [...new Set(colors.map((c) => c.hex))];
  const vars: Record<string, string> = {};
  for (const k of ROLE_KEYS) {
    vars[`--${k}`] = roles[k];
    vars[`--on-${k}`] = inkFor(roles[k], hexes);
  }
  // Cover banner: each band gets whichever of one light and one dark ink reads best on it,
  // so the headline turns from light to dark once as it crosses the ramp.
  const lightInk = luminance(roles.paper) > 0.8 ? roles.paper : '#FFFFFF';
  const darkInk = luminance(roles.text) < 0.06 ? roles.text : '#000000';
  BANNER_GROW.forEach((_, k) => {
    const band = bannerColor(roles, bannerT(k) + 0.08);
    vars[`--bi${k}`] = contrast(lightInk, band) >= contrast(darkInk, band) ? lightInk : darkInk;
  });
  vars['--on-white'] = inkFor('#FFFFFF', hexes);
  vars['--on-black'] = inkFor('#000000', hexes);
  for (let i = 0; i < slots; i++) {
    const hex = colors[i]?.hex ?? colors[colors.length - 1].hex;
    vars[`--c${i}`] = hex;
    vars[`--o${i}`] = inkFor(hex, hexes);
  }
  return vars;
}

/** Contrast of a logo against its ground. Logos are graphics, so 3:1 passes. */
export function logoContrast(ink: string, bg: string): { label: string; pass: boolean } {
  const r = contrast(ink, bg);
  return { label: `${r >= 10 ? Math.round(r) : r.toFixed(1)}:1`, pass: r >= 3 };
}

export function brandTokens(colors: BrandColor[], shift = 0): string {
  const roles = brandRoles(colors, shift);
  return `:root {\n${ROLE_KEYS.map((k) => `  --brand-${k}: ${roles[k]};`).join('\n')}\n}`;
}
