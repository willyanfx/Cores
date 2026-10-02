// Color of the day: picking a color for a date and drawing the 1080×1080 post.
// Runs both at build time and in the browser, so it must not import astro:content.
import { contrast, hexToRgb, hsl, inkOn, oklch } from './color';

export interface DailyColor {
  hex: string;
  name: string;
  palette: string;
  url: string;
}

/** Midnight of the local calendar day. */
export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** "2026-10-02" in local time. */
export function dayKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function parseDay(s: string | null): Date | null {
  const m = s?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

/**
 * The list arrives already shuffled (see getDailyColors), so walking it one
 * step per day gives every color once before any repeats.
 */
export function pickForDate(colors: DailyColor[], d: Date): DailyColor {
  const day = Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);
  return colors[((day % colors.length) + colors.length) % colors.length];
}

/** "OCT 2, 2026" */
export function formatDay(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

/** The four value rows printed on the card. */
export function valueRows(hex: string): [string, string][] {
  const { h, s, l } = hsl(hex);
  const o = oklch(hex);
  const gap = '  ';
  return [
    ['HEX', hex],
    ['RGB', hexToRgb(hex).join(gap)],
    ['HSL', [h, s, l].map((v) => Math.round(v)).join(gap)],
    ['OKLCH', [o.l.toFixed(4), o.c.toFixed(4), (o.c < 0.0005 ? 0 : o.h).toFixed(2)].join(gap)],
  ];
}

// Post geometry, in pixels of the 1080×1080 export. The on-page card uses the
// same numbers through container query units, so the two stay in step.
export const POST = {
  size: 1080,
  ground: '#E3E2DE',
  ink: '#2B2B2B',
  chip: { x: 250, y: 250, size: 580, pad: 50 },
  name: { max: 88, min: 52, lines: 3, leading: 0.92, tracking: -0.035 },
  rows: { size: 24, valueX: 106, step: 49 },
} as const;

export const SANS = '"Schibsted Grotesk", ui-sans-serif, system-ui, sans-serif';
export const MONO = '"IBM Plex Mono", ui-monospace, Menlo, monospace';

/** Chip edge needed when the color nearly matches the ground. */
export function needsEdge(hex: string): boolean {
  return contrast(hex, POST.ground) < 1.2;
}

/**
 * Largest name size (px at 1080) whose greedy word wrap fits the chip in at
 * most three lines. `measure` returns a string's width at 1px font size.
 */
export function fitName(name: string, measure: (s: string) => number): { size: number; lines: string[] } {
  const width = POST.chip.size - POST.chip.pad * 2;
  const words = name.split(/\s+/);
  const { max, min, lines: maxLines, tracking } = POST.name;
  const w = (s: string, size: number) => (measure(s) + tracking * s.length) * size;
  let lines: string[] = [name];
  for (let size = max; size >= min; size -= 2) {
    lines = [];
    for (const word of words) {
      const last = lines[lines.length - 1];
      if (last && w(`${last} ${word}`, size) <= width) lines[lines.length - 1] = `${last} ${word}`;
      else lines.push(word);
    }
    if (lines.length <= maxLines && lines.every((l) => w(l, size) <= width)) return { size, lines };
  }
  return { size: min, lines };
}

/** Draw the post onto a 1080×1080 canvas. Fonts must already be loaded. */
export function drawPost(canvas: HTMLCanvasElement, color: DailyColor, date: Date, site: string): void {
  const { size, ground, ink, chip, name, rows } = POST;
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const on = inkOn(color.hex);

  ctx.fillStyle = ground;
  ctx.fillRect(0, 0, size, size);

  // Masthead. Positions are cap tops, as on the page, so measure each cap height.
  const capOf = () => ctx.measureText('H').actualBoundingBoxAscent;
  ctx.fillStyle = ink;
  ctx.textBaseline = 'alphabetic';
  ctx.font = `700 26px ${SANS}`;
  const brand = 40 + capOf();
  ctx.fillText('Cores', 40, brand);
  ctx.font = `400 20px ${SANS}`;
  ctx.fillText(site, 40, brand + 14 + capOf());

  // Mark: the site favicon's four stripes
  ['#E9AD17', '#C53D43', '#1B6F81', '#204242'].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(984 + i * 14, 40, 14, 56);
  });

  // Chip
  ctx.fillStyle = color.hex;
  ctx.fillRect(chip.x, chip.y, chip.size, chip.size);
  if (needsEdge(color.hex)) {
    ctx.strokeStyle = 'rgb(0 0 0 / 0.12)';
    ctx.lineWidth = 2;
    ctx.strokeRect(chip.x + 1, chip.y + 1, chip.size - 2, chip.size - 2);
  }

  // Name
  ctx.fillStyle = on;
  ctx.font = `800 100px ${SANS}`;
  const fit = fitName(color.name, (s) => ctx.measureText(s).width / 100);
  ctx.font = `800 ${fit.size}px ${SANS}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${name.tracking * fit.size}px`;
  const left = chip.x + chip.pad;
  const cap = ctx.measureText('H').actualBoundingBoxAscent;
  fit.lines.forEach((line, i) => {
    ctx.fillText(line, left, chip.y + chip.pad + cap + i * fit.size * name.leading);
  });
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';

  // Values, anchored to the bottom of the chip
  const list = valueRows(color.hex);
  const bottom = chip.y + chip.size - chip.pad;
  list.forEach(([label, value], i) => {
    const y = bottom - (list.length - 1 - i) * rows.step;
    ctx.font = `600 ${rows.size}px ${MONO}`;
    ctx.fillText(label, left, y);
    ctx.font = `400 ${rows.size}px ${MONO}`;
    ctx.fillText(value, left + rows.valueX, y);
  });

  // Footer
  ctx.fillStyle = ink;
  ctx.font = `400 20px ${MONO}`;
  ctx.textAlign = 'center';
  if ('letterSpacing' in ctx) ctx.letterSpacing = '1.2px';
  ctx.fillText(`COLOR OF THE DAY — ${formatDay(date)}`, size / 2, 1041);
  ctx.textAlign = 'start';
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
}
