# Adding artwork

Each piece is one JSON file in `entries/`. Thumbnails live in
`public/art/thumbs/` (small, pre-made **AVIF**); the hi-res JPEG the thumbnail
links to lives in `public/art/full/` **or** on an external CDN/R2 URL.

## 1. Drop the images

```
website/public/art/thumbs/my-piece.avif   # small, high-quality AVIF
website/public/art/full/my-piece.jpg       # hi-res JPEG (or use a full URL)
```

Aim for thumbnails ~1000px on the long edge. Keep them small — they load in the
grid. The JPEG is only fetched when someone clicks through.

## 2. Add an entry

`entries/my-piece.json`:

```json
{
  "title": "Title",
  "date": "2026-06-01",
  "rating": "s",                       // e621 letter: s | q | e
  "avif": "/art/thumbs/my-piece.avif",
  "full": "/art/full/my-piece.jpg",    // or "https://cdn.example/.../my-piece.jpg"
  "width": 1000,
  "height": 1400,                       // intrinsic thumbnail size (no layout shift)
  "tags": ["solo", "canine", "colored"],
  "characters": ["Zaverose"],
  "featured": false                     // pin to landing slideshow
}
```

## Ratings drive SFW/NSFW

`rating` uses the e621 letters:

- `s` — safe
- `q` — questionable
- `e` — explicit

The cutoff for what counts as NSFW is `RATING_THRESHOLD` in
`src/data/config.ts` (default `e`: SFW mode shows `s`+`q`, NSFW reveals `e`).

## Bulk import from e621

If a piece is on e621, `npm run import:e621 -- <postId> [<postId> …]` scaffolds
entries with tags + rating pre-filled. See `scripts/import-e621.mjs`.
