// Merge the per-batch extraction files into the collection Astro reads.
//   data/extracted/*.json  ->  src/data/palettes.json
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'data/extracted';
const OUT = 'src/data/palettes.json';

const HEX = /^#[0-9A-F]{6}$/;

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const raw = readdirSync(SRC)
  .filter((f) => f.endsWith('.json'))
  .sort()
  .flatMap((f) => JSON.parse(readFileSync(join(SRC, f), 'utf8')));

const normalize = (p) => ({
  ...p,
  colors: (p.colors ?? [])
    .map((c) => ({ ...c, hex: String(c.hex).trim().toUpperCase() }))
    .filter((c) => HEX.test(c.hex)),
  gradients: (p.gradients ?? [])
    .map((g) => g.map((h) => String(h).trim().toUpperCase()).filter((h) => HEX.test(h)))
    .filter((g) => g.length >= 2),
});

// Two palettes are the same when most colors of the smaller one appear in the
// other: the same card saved twice, or a gradient sheet built from a palette.
// Keep the one with more colors and carry over the other's gradients.
const OVERLAP = 0.6;
const overlaps = (a, b) => {
  const A = new Set(a.colors.map((c) => c.hex));
  const B = new Set(b.colors.map((c) => c.hex));
  const shared = [...A].filter((h) => B.has(h)).length;
  return shared / Math.min(A.size, B.size) >= OVERLAP;
};

const kept = [];
const skipped = { duplicate: 0, invalid: 0 };

for (const p of raw.map(normalize).sort((a, b) => a.source.localeCompare(b.source) || a.index - b.index)) {
  if (p.colors.length < 2) {
    skipped.invalid++;
    continue;
  }
  const i = kept.findIndex((k) => overlaps(k, p));
  if (i === -1 && !p.duplicate_of) {
    kept.push(p);
    continue;
  }
  skipped.duplicate++;
  if (i === -1) continue;
  const [winner, loser] = p.colors.length > kept[i].colors.length ? [p, kept[i]] : [kept[i], p];
  const gradients = [...winner.gradients, ...loser.gradients].filter(
    (g, j, all) => all.findIndex((o) => o.join() === g.join()) === j,
  );
  kept[i] = {
    ...winner,
    gradients,
    code: winner.code ?? loser.code,
    credit: winner.credit ?? loser.credit,
    tags: [...new Set([...(winner.tags ?? []), ...(gradients.length ? ['gradient'] : [])])],
  };
}

const seenSlugs = new Set();
const palettes = kept.map((p) => {
  const base = slugify(p.title || 'palette') || 'palette';
  let slug = base;
  for (let n = 2; seenSlugs.has(slug); n++) slug = `${base}-${n}`;
  seenSlugs.add(slug);
  return {
    id: slug,
    title: p.title,
    code: p.code ?? null,
    credit: p.credit ?? null,
    origin: p.source.startsWith('reference/') ? 'brand' : 'palette',
    colors: p.colors.map(({ hex, name, role }) => ({ hex, name: name ?? null, role: role ?? null })),
    gradients: p.gradients,
    tags: [...new Set((p.tags ?? []).map((t) => String(t).toLowerCase().trim()))].filter(Boolean),
    confidence: p.confidence ?? 'sampled',
    source: p.source,
  };
});

writeFileSync(OUT, JSON.stringify(palettes, null, 2) + '\n');
console.log(
  `${palettes.length} palettes, ${palettes.reduce((n, p) => n + p.colors.length, 0)} colors -> ${OUT}` +
    ` (skipped ${skipped.duplicate} duplicates, ${skipped.invalid} invalid)`,
);
