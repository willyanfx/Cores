import { contrast, oklch } from './color';

/**
 * The Cores mark: nested diamonds centred on the middle of the right edge,
 * drawn on a 100×100 rounded square, with the wordmark set bottom-left.
 * Each band takes one step of a dark-to-light ramp built from a palette.
 */

export const SIZE = 100;
export const RADIUS = 8;
export const BAND_COUNT = 12;

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
  'M12.88 88.23Q10.96 88.23 9.52 87.35Q8.09 86.46 7.29 84.89Q6.50 83.32 6.50 81.26Q6.50 79.26 7.27 77.72Q8.03 76.17 9.45 75.29Q10.88 74.41 12.86 74.41Q14.93 74.41 16.45 75.47Q17.98 76.53 18.47 78.65L16.39 79.14Q16.02 77.57 15.08 76.82Q14.14 76.07 12.85 76.07Q11.51 76.07 10.57 76.74Q9.63 77.41 9.13 78.59Q8.63 79.77 8.63 81.31Q8.63 82.88 9.14 84.07Q9.65 85.25 10.58 85.91Q11.51 86.57 12.78 86.57Q14.15 86.57 15.14 85.75Q16.13 84.93 16.42 83.45L18.56 83.98Q18.01 86.05 16.49 87.14Q14.96 88.23 12.88 88.23Z' +
  'M24.86 88.23Q23.42 88.23 22.32 87.56Q21.22 86.90 20.61 85.72Q20.00 84.54 20.00 82.99Q20.00 81.44 20.61 80.26Q21.22 79.08 22.32 78.42Q23.42 77.75 24.86 77.75Q26.30 77.75 27.40 78.42Q28.50 79.08 29.11 80.26Q29.72 81.44 29.72 82.99Q29.72 84.54 29.11 85.72Q28.50 86.90 27.40 87.56Q26.30 88.23 24.86 88.23Z' +
  'M24.86 86.73Q26.18 86.73 26.94 85.72Q27.70 84.72 27.70 82.99Q27.70 81.26 26.94 80.25Q26.18 79.25 24.86 79.25Q23.54 79.25 22.78 80.25Q22.02 81.26 22.02 82.99Q22.02 84.72 22.78 85.72Q23.54 86.73 24.86 86.73Z' +
  'M33.91 88L32.02 88L32.02 77.98L33.81 77.98L33.81 80.14L33.75 79.88Q34.20 78.82 35.09 78.29Q35.97 77.75 36.92 77.75Q37.19 77.75 37.46 77.79Q37.73 77.84 37.97 77.95L37.76 79.67Q37.23 79.50 36.71 79.50Q36.35 79.50 35.88 79.64Q35.40 79.77 34.95 80.15Q34.51 80.53 34.21 81.27Q33.91 82.01 33.91 83.20L33.91 88Z' +
  'M44.14 88.23Q42.69 88.23 41.61 87.59Q40.54 86.94 39.94 85.77Q39.34 84.60 39.34 82.99Q39.34 81.39 39.94 80.21Q40.53 79.04 41.60 78.39Q42.66 77.75 44.08 77.75Q44.89 77.75 45.71 78.00Q46.52 78.26 47.20 78.89Q47.88 79.52 48.29 80.62Q48.69 81.72 48.69 83.41L40.56 83.41L40.56 82.06L47.04 82.06L46.63 82.62Q46.59 81.39 46.23 80.65Q45.87 79.90 45.30 79.56Q44.73 79.22 44.05 79.22Q43.20 79.22 42.60 79.67Q42.00 80.12 41.69 80.97Q41.37 81.81 41.37 83.01Q41.37 84.77 42.08 85.75Q42.79 86.73 44.13 86.73Q45.08 86.73 45.72 86.25Q46.37 85.77 46.69 84.85L48.48 85.40Q48.12 86.32 47.49 86.95Q46.86 87.58 46.00 87.91Q45.15 88.23 44.14 88.23Z' +
  'M54.51 88.23Q53.41 88.23 52.49 87.88Q51.57 87.53 50.96 86.81Q50.35 86.09 50.16 84.97L52.03 84.60Q52.13 85.69 52.78 86.23Q53.43 86.77 54.45 86.77Q55.48 86.77 56.05 86.28Q56.62 85.79 56.62 85.11Q56.62 84.51 56.20 84.15Q55.79 83.79 54.95 83.64L53.81 83.43Q53.31 83.34 52.76 83.18Q52.21 83.02 51.73 82.72Q51.25 82.42 50.95 81.93Q50.65 81.44 50.65 80.69Q50.65 79.70 51.17 79.05Q51.69 78.41 52.57 78.08Q53.44 77.75 54.49 77.75Q55.58 77.75 56.41 78.08Q57.25 78.42 57.78 79.04Q58.31 79.67 58.48 80.57L56.55 80.96Q56.49 80.44 56.26 80.04Q56.04 79.65 55.61 79.43Q55.19 79.21 54.49 79.21Q53.68 79.21 53.10 79.54Q52.53 79.88 52.53 80.55Q52.53 80.94 52.75 81.21Q52.97 81.49 53.39 81.66Q53.81 81.83 54.42 81.96L55.60 82.20Q56.38 82.35 57.06 82.66Q57.73 82.97 58.14 83.53Q58.56 84.09 58.56 85.01Q58.56 86.02 58.04 86.75Q57.52 87.47 56.61 87.85Q55.70 88.23 54.51 88.23Z';

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
  const ink = contrast(lightest, ground) >= 4.5 && contrast(lightest, bands[3]) >= 3 ? lightest : INK;

  return { ground, bands, ink };
}

/** The monochrome look of the original artwork. */
export const MONO = logoRamp(['#0F0F0F', '#E3E3E3']);
