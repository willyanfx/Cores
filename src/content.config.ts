import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

const hex = z.string().regex(/^#[0-9A-F]{6}$/);

const palettes = defineCollection({
  loader: file('src/data/palettes.json'),
  schema: z.object({
    title: z.string(),
    code: z.string().nullable(),
    credit: z.string().nullable(),
    origin: z.enum(['palette', 'brand']),
    colors: z
      .array(
        z.object({
          hex,
          name: z.string().nullable(),
          role: z.string().nullable(),
        }),
      )
      .min(2),
    gradients: z.array(z.array(hex).min(2)),
    tags: z.array(z.string()),
    confidence: z.enum(['printed', 'sampled']),
    source: z.string(),
  }),
});

export const collections = { palettes };
