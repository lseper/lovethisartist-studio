# Adding artwork

The gallery reads two manifests (see `src/content.config.ts`):

- `zaverose.json` — **generated**, don't hand-edit. `npm run import:e621`
  fetches exactly the post IDs listed in `galleryIds.txt` (repo root) and
  rewrites this file.
- `external.json` — **hand-curated** pieces from other platforms (Cara,
  Bluesky, …). The importer never touches it.

## e621 posts

Add the post ID (or the full post URL) to `galleryIds.txt`, then run
`npm run import:e621`.

## Other platforms

Add an entry to `external.json`:

```json
{
  "id": "cara-6892157c",            // unique; prefix with the platform
  "title": "Home",
  "date": "2026-05-14T00:16:37.277Z",
  "rating": "s",                    // e621 letter: s | q | e
  "thumb": "/art/cara/6892157c-thumb.jpg",
  "full": "/art/cara/6892157c-full.jpg",
  "width": 750,                     // intrinsic thumb size (no layout shift)
  "height": 1250,
  "tags": ["digital"],
  "characters": [],
  "source": "https://cara.app/post/…",
  "featured": false
}
```

- **Cara** blocks hotlinking (Cloudflare) and its URLs carry daily-expiring
  tokens, so save the images into `public/art/cara/` (~750px thumb, ~1920px
  full).
- **Bluesky** CDN URLs can be linked directly: `feed_thumbnail` for `thumb`,
  `feed_fullsize` for `full`.

## Ratings drive SFW/NSFW

- `s` — safe
- `q` — questionable
- `e` — explicit

The cutoff is `RATING_THRESHOLD` in `src/data/config.ts` (default `e`: SFW
mode shows `s`+`q`, NSFW reveals `e`).

## Rotated uploads

If a source image is stored sideways, add its `id` to `src/data/rotations.ts`.
