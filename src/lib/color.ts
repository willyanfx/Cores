export type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const toLinear = (c: number) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2 contrast ratio between two colors, 1–21. */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export function wcagLevel(ratio: number): 'AAA' | 'AA' | 'AA large' | null {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA large';
  return null;
}

/** Ink color that reads on top of `hex`. */
export function inkOn(hex: string): string {
  return contrast(hex, '#000000') >= contrast(hex, '#FFFFFF') ? '#000000' : '#FFFFFF';
}

/** OKLCH: lightness 0–1, chroma ~0–0.4, hue 0–360. */
export function oklch(hex: string): { l: number; c: number; h: number } {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const c = Math.hypot(A, B);
  let h = (Math.atan2(B, A) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: L, c, h };
}

export function formatOklch(hex: string): string {
  const { l, c, h } = oklch(hex);
  return `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(3)} ${c < 0.02 ? 0 : h.toFixed(1)})`;
}

export function formatRgb(hex: string): string {
  return `rgb(${hexToRgb(hex).join(' ')})`;
}

/** HSL: hue 0–360, saturation and lightness 0–100. */
export function hsl(hex: string): { h: number; s: number; l: number } {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l: l * 100 };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return { h, s: s * 100, l: l * 100 };
}

export const HUES =['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple', 'pink', 'neutral'] as const;
export type Hue = (typeof HUES)[number];

export function hueFamily(hex: string): Hue {
  const { c, h } = oklch(hex);
  if (c < 0.035) return 'neutral';
  if (h < 20 || h >= 350) return 'pink';
  if (h < 45) return 'red';
  if (h < 75) return 'orange';
  if (h < 115) return 'yellow';
  if (h < 160) return 'green';
  if (h < 215) return 'teal';
  if (h < 285) return 'blue';
  return 'purple';
}

/** Sort key that walks the hue wheel, with neutrals last from light to dark. */
export function spectrumKey(hex: string): number {
  const { l, c, h } = oklch(hex);
  if (c < 0.035) return 1000 + (1 - l);
  // Start the wheel at red-ish pink so warm hues lead.
  return (h + 360 - 10) % 360;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

/** Hex for an OKLCH color, lowering chroma until it fits in sRGB. */
export function oklchToHex(l: number, c: number, h: number): string {
  const rad = (h * Math.PI) / 180;
  for (let chroma = c; ; chroma = Math.max(0, chroma - 0.005)) {
    const A = chroma * Math.cos(rad);
    const B = chroma * Math.sin(rad);
    const l_ = (l + 0.3963377774 * A + 0.2158037573 * B) ** 3;
    const m_ = (l - 0.1055613458 * A - 0.0638541728 * B) ** 3;
    const s_ = (l - 0.0894841775 * A - 1.291485548 * B) ** 3;
    const rgb = [
      4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
      -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
      -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
    ];
    if (chroma === 0 || rgb.every((v) => v >= -0.0005 && v <= 1.0005)) {
      return (
        '#' +
        rgb
          .map((v) => Math.round(Math.min(1, Math.max(0, toGamma(Math.min(1, Math.max(0, v))))) * 255))
          .map((v) => v.toString(16).padStart(2, '0'))
          .join('')
          .toUpperCase()
      );
    }
  }
}

/** Mix two colors in OKLab, t = 0 gives `a`, 1 gives `b`. */
export function mix(a: string, b: string, t: number): string {
  const x = oklch(a);
  const y = oklch(b);
  const ab = (o: { l: number; c: number; h: number }) => {
    const r = (o.h * Math.PI) / 180;
    return [o.l, o.c * Math.cos(r), o.c * Math.sin(r)];
  };
  const [l1, a1, b1] = ab(x);
  const [l2, a2, b2] = ab(y);
  const L = l1 + (l2 - l1) * t;
  const A = a1 + (a2 - a1) * t;
  const B = b1 + (b2 - b1) * t;
  return oklchToHex(L, Math.hypot(A, B), (Math.atan2(B, A) * 180) / Math.PI);
}

/** `text` eased toward `bg` as far as it can go while staying readable (4.5:1) on it. */
export function mutedFor(text: string, bg: string): string {
  for (let t = 0.5; t > 0; t -= 0.05) {
    const m = mix(text, bg, t);
    if (contrast(m, bg) >= 4.5) return m;
  }
  return text;
}
