import type { APIRoute } from 'astro';
import { BANDS, INK, MONO, RADIUS, SIZE, WORDMARK, logoRamp } from '../lib/logo';
import { getPalettes } from '../lib/palettes';

// A standalone, self-animating copy of the mark for use outside the site.
// It opens in monochrome, then walks a handful of palettes spread around the hue wheel.

const STOPS = 8;
const HOLD = 3.2;

export const GET: APIRoute = async () => {
  const infos = (await getPalettes()).sort((a, b) => a.leadHue - b.leadHue);
  const picked = Array.from({ length: STOPS }, (_, i) => infos[Math.floor((i * infos.length) / STOPS)]);
  const ramps = [MONO, ...picked.map((p) => logoRamp(p.palette.data.colors.map((c) => c.hex))!)];

  const n = ramps.length;
  const pct = (x: number) => `${+((x / n) * 100).toFixed(3)}%`;
  // Hold each palette for most of its slot, then blend into the next one.
  const keyframes = (k: number) =>
    ramps.map((r, j) => `${pct(j)},${pct(j + 0.7)}{fill:${r[k]}}`).join('') + `100%{fill:${ramps[0][k]}}`;

  const shapes = [
    `<rect width="${SIZE}" height="${SIZE}"`,
    ...BANDS.map((points) => `<polygon points="${points}"`),
  ];

  const css = shapes
    .map((_, k) => {
      const delay = (shapes.length - 1 - k) * 0.045;
      return `@keyframes b${k}{${keyframes(k)}}.b${k}{animation:b${k} ${n * HOLD}s ${delay}s ease-in-out infinite}`;
    })
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" role="img" aria-label="Cores">
<style>${css}@media (prefers-reduced-motion:reduce){[class]{animation:none}}</style>
<clipPath id="c"><rect width="${SIZE}" height="${SIZE}" rx="${RADIUS}"/></clipPath>
<g clip-path="url(#c)">
${shapes.map((s, k) => `${s} class="b${k}" fill="${MONO[k]}"/>`).join('\n')}
</g>
<path fill="${INK}" d="${WORDMARK}"/>
</svg>
`;

  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
};
