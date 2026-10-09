import { contrast, oklch } from './color';

/**
 * The Cores mark: nested diamonds centred on the middle of the right edge,
 * drawn on a 100×100 squircle, with the wordmark set bottom-left.
 * Each band takes one step of a dark-to-light ramp built from a palette.
 */

export const SIZE = 100;
export const BAND_COUNT = 12;

/**
 * Outline of the mark: a superellipse (n = 5), the continuous-corner
 * "squircle" of iOS and macOS app icons, rather than a circular-arc corner.
 */
export const SHAPE = (() => {
  const n = 5;
  const c = SIZE / 2;
  const steps = 160;
  const curve = (v: number) => Math.sign(v) * Math.abs(v) ** (2 / n);
  const points = Array.from({ length: steps }, (_, i) => {
    const t = (i / steps) * 2 * Math.PI;
    return `${+(c + c * curve(Math.cos(t))).toFixed(2)} ${+(c + c * curve(Math.sin(t))).toFixed(2)}`;
  });
  return `M${points.join('L')}Z`;
})();

const OUTER = 95;
const INNER = 11.5;

/** Polygon points for each band, outermost first. */
export const BANDS = Array.from({ length: BAND_COUNT }, (_, i) => {
  const r = +(OUTER - ((OUTER - INNER) * i) / (BAND_COUNT - 1)).toFixed(2);
  const c = SIZE / 2;
  return `${SIZE - r},${c} ${SIZE},${c - r} ${SIZE + r},${c} ${SIZE},${c + r}`;
});

/** "Cores" in Schibsted Grotesk Medium, outlined so the mark needs no font. */
export const WORDMARK =
  'M23.05 88.22Q21.23 88.22 19.87 87.38Q18.50 86.54 17.75 85.06Q17.00 83.57 17.00 81.62Q17.00 79.72 17.73 78.26Q18.45 76.79 19.80 75.96Q21.15 75.12 23.03 75.12Q24.99 75.12 26.43 76.13Q27.87 77.14 28.34 79.14L26.37 79.61Q26.02 78.12 25.13 77.41Q24.24 76.70 23.01 76.70Q21.75 76.70 20.85 77.33Q19.96 77.97 19.49 79.09Q19.02 80.20 19.02 81.66Q19.02 83.15 19.50 84.27Q19.99 85.40 20.87 86.02Q21.75 86.65 22.95 86.65Q24.25 86.65 25.19 85.87Q26.12 85.09 26.40 83.69L28.43 84.19Q27.91 86.15 26.46 87.19Q25.02 88.22 23.05 88.22Z' +
  'M34.39 88.22Q33.03 88.22 31.99 87.59Q30.95 86.95 30.37 85.84Q29.79 84.72 29.79 83.25Q29.79 81.79 30.37 80.67Q30.95 79.55 31.99 78.92Q33.03 78.29 34.39 78.29Q35.76 78.29 36.80 78.92Q37.84 79.55 38.42 80.67Q39.00 81.79 39.00 83.25Q39.00 84.72 38.42 85.84Q37.84 86.95 36.80 87.59Q35.76 88.22 34.39 88.22Z' +
  'M34.39 86.80Q35.64 86.80 36.36 85.84Q37.08 84.89 37.08 83.25Q37.08 81.61 36.36 80.66Q35.64 79.71 34.39 79.71Q33.15 79.71 32.42 80.66Q31.70 81.61 31.70 83.25Q31.70 84.89 32.42 85.84Q33.15 86.80 34.39 86.80Z' +
  'M42.96 88.00L41.18 88.00L41.18 78.51L42.88 78.51L42.88 80.56L42.81 80.31Q43.24 79.31 44.08 78.80Q44.92 78.29 45.82 78.29Q46.07 78.29 46.33 78.33Q46.58 78.38 46.81 78.48L46.61 80.11Q46.11 79.95 45.62 79.95Q45.28 79.95 44.83 80.08Q44.38 80.20 43.96 80.56Q43.53 80.92 43.25 81.62Q42.96 82.32 42.96 83.46L42.96 88.00Z' +
  'M52.66 88.22Q51.29 88.22 50.27 87.61Q49.25 87.00 48.68 85.89Q48.11 84.77 48.11 83.25Q48.11 81.73 48.68 80.62Q49.24 79.51 50.25 78.90Q51.26 78.29 52.60 78.29Q53.37 78.29 54.14 78.53Q54.92 78.77 55.56 79.37Q56.20 79.97 56.59 81.01Q56.97 82.05 56.97 83.65L49.26 83.65L49.26 82.38L55.41 82.38L55.02 82.90Q54.98 81.74 54.64 81.03Q54.30 80.33 53.76 80.01Q53.22 79.69 52.57 79.69Q51.77 79.69 51.20 80.11Q50.64 80.54 50.34 81.34Q50.04 82.14 50.04 83.27Q50.04 84.94 50.71 85.87Q51.38 86.80 52.65 86.80Q53.54 86.80 54.16 86.34Q54.78 85.89 55.07 85.02L56.77 85.54Q56.43 86.41 55.83 87.01Q55.23 87.60 54.42 87.91Q53.62 88.22 52.66 88.22Z' +
  'M62.48 88.22Q61.44 88.22 60.57 87.89Q59.70 87.55 59.12 86.87Q58.55 86.19 58.36 85.13L60.14 84.78Q60.22 85.81 60.84 86.32Q61.46 86.83 62.43 86.83Q63.40 86.83 63.94 86.37Q64.48 85.91 64.48 85.26Q64.48 84.70 64.09 84.35Q63.70 84.01 62.90 83.87L61.82 83.67Q61.35 83.59 60.83 83.43Q60.30 83.28 59.85 83.00Q59.40 82.72 59.11 82.25Q58.83 81.79 58.83 81.07Q58.83 80.13 59.32 79.52Q59.81 78.91 60.64 78.60Q61.47 78.29 62.47 78.29Q63.49 78.29 64.29 78.60Q65.08 78.92 65.58 79.51Q66.09 80.11 66.25 80.96L64.42 81.33Q64.36 80.84 64.14 80.46Q63.93 80.09 63.53 79.88Q63.13 79.67 62.47 79.67Q61.69 79.67 61.15 79.99Q60.61 80.31 60.61 80.94Q60.61 81.31 60.82 81.57Q61.02 81.83 61.42 81.99Q61.82 82.16 62.40 82.28L63.51 82.51Q64.26 82.65 64.90 82.94Q65.53 83.24 65.92 83.77Q66.32 84.30 66.32 85.17Q66.32 86.13 65.82 86.81Q65.33 87.50 64.47 87.86Q63.61 88.22 62.48 88.22Z';

const INK = '#FFFFFF';

export interface LogoRamp {
  ground: string;
  /** One color per band, outermost (darkest) first. */
  bands: string[];
  ink: string;
}

type Lab = [number, number, number];

const toLab = (hex: string): Lab => {
  const { l, c, h } = oklch(hex);
  const rad = (h * Math.PI) / 180;
  return [l, c * Math.cos(rad), c * Math.sin(rad)];
};

const toHex = ([L, a, b]: Lab): string => {
  const l_ = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
  return (
    '#' +
    lin
      .map((v) => {
        const s = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
        return Math.round(Math.min(1, Math.max(0, s)) * 255)
          .toString(16)
          .padStart(2, '0');
      })
      .join('')
      .toUpperCase()
  );
};

/** Mix two colors in OKLab, `w` parts of `a` to `1 - w` of `b`, as CSS `color-mix(in oklab, a w%, b)` does. */
export function mixOklab(a: string, b: string, w: number): string {
  const [p, q] = [toLab(a), toLab(b)];
  return toHex([0, 1, 2].map((i) => p[i] * w + q[i] * (1 - w)) as Lab);
}

/**
 * Dress the mark in a palette. The ground is the palette's richest color that
 * still carries light type, and the bands walk from it to the palette's
 * lightest color in OKLab, in evenly spaced lightness steps that start slow so
 * the outer bands under the wordmark stay close to the ground. The wordmark
 * takes the lightest color when it reads on the ground, otherwise white.
 */
export function logoRamp(hexes: string[]): LogoRamp {
  const unique = [...new Set(hexes)];
  const carriesType = (hex: string) => contrast(hex, '#FFFFFF') >= 5;
  const byChroma = [...unique].sort((x, y) => oklch(y).c - oklch(x).c);

  let ground = byChroma.find(carriesType);
  if (!ground) {
    // Nothing is deep enough: darken the most colorful one until white reads on it.
    const [L, a, b] = toLab(byChroma[0]);
    let l = L;
    while (l > 0.1 && !carriesType(toHex([l, a, b]))) l -= 0.02;
    ground = toHex([l, a, b]);
  }

  const base = toLab(ground);
  const stops = [base, ...unique.map(toLab).filter((s) => s[0] > base[0] + 0.02)].sort((x, y) => x[0] - y[0]);
  const top = stops[stops.length - 1];
  // Too little range to read as a ramp: run on toward a tint of the lightest color.
  if (top[0] - base[0] < 0.35) stops.push([0.97, top[1] * 0.2, top[2] * 0.2]);

  const lo = stops[0][0];
  const hi = stops[stops.length - 1][0];
  const at = (L: number): Lab => {
    let i = 0;
    while (i < stops.length - 2 && stops[i + 1][0] < L) i++;
    const [p, q] = [stops[i], stops[i + 1]];
    const f = q[0] === p[0] ? 1 : Math.min(1, Math.max(0, (L - p[0]) / (q[0] - p[0])));
    return [L, p[1] + (q[1] - p[1]) * f, p[2] + (q[2] - p[2]) * f];
  };

  const bands = Array.from({ length: BAND_COUNT }, (_, i) =>
    toHex(at(lo + (hi - lo) * (0.04 + 0.96 * (i / (BAND_COUNT - 1)) ** 1.7))),
  );
  const lightest = [...unique].sort((x, y) => oklch(y).l - oklch(x).l)[0];
  // The wordmark runs over the ground and the first few bands.
  const ink = contrast(lightest, ground) >= 4.5 && contrast(lightest, bands[4]) >= 3 ? lightest : INK;

  return { ground, bands, ink };
}

/** The monochrome look of the original artwork. */
export const MONO = logoRamp(['#0F0F0F', '#E3E3E3']);
