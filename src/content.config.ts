import { defineCollection, z } from "astro:content";
import { file } from "astro/loaders";

/*
  Artwork metadata.

  Primary source is src/content/art/zaverose.json — a manifest generated from
  the e621 API by `npm run import:e621`. Each entry points at e621's static CDN
  (a `sample` image as the thumbnail, the full `file` as the hi-res
  click-through). `rating` uses e621 letters and drives the SFW/NSFW split.

  To self-host later, regenerate the manifest with local `thumb`/`full` paths
  (see src/content/art/README.md).
*/
const art = defineCollection({
  loader: file("src/content/art/zaverose.json"),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    rating: z.enum(["s", "q", "e"]),
    /** Thumbnail URL (e621 sample image, or a local /public path). */
    thumb: z.string(),
    /** Hi-res URL the thumbnail links to (e621 file, or local /public path). */
    full: z.string(),
    /** Intrinsic thumbnail dimensions — required to avoid layout shift. */
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    tags: z.array(z.string()).default([]),
    characters: z.array(z.string()).default([]),
    description: z.string().optional(),
    e621PostId: z.number().int().positive().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { art };
