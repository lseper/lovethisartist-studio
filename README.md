# LOVE / HATE THIS ARTIST

Art portfolio and commission storefront for the artist **Zaverose**. Brutalist
"technical software" aesthetic; a global SFW/NSFW mode toggle drives the whole
site off each artwork's e621 rating.

Built with Astro 5 + React islands, Tailwind v4, React Three Fiber, and hls.js.
Static output — deployable to Cloudflare Pages / Netlify / Vercel.

## Develop

```bash
npm install          # if the local npm cache is broken: --cache /tmp/npm-cache-website
npm run dev          # http://localhost:4321
npm run check        # type-check
npm run build        # production build → dist/
```

## Add or refresh artwork

Artwork metadata lives in `src/content/art/zaverose.json`. Regenerate it from
the e621 API:

```bash
npm run import:e621                    # all posts tagged `zaverose`
npm run import:e621 -- --tags "zaverose solo" --max 200
```

Each entry's `thumb` (e621 sample) and `full` (hi-res file) are just URLs, so
you can move to self-hosted images later without touching the schema.

## Sections

- **ART** — booru-style gallery with tag/text filtering and a lightbox.
- **LINKS** — socials hub + Patreon; NSFW links appear only in NSFW mode.
- **STREAM** — Picarto/Twitch links + HLS video player (NSFW-gated).
- **COMMISSION** — price calculator, request form (set a Formspree/Web3Forms
  endpoint in `src/data/commission.ts`; falls back to `mailto:`), TOS, timeline.

See `PRODUCT.md`, `DESIGN.md`, and `CLAUDE.md` for the full picture.
