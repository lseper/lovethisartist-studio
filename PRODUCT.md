# PRODUCT — Zaverose art portfolio

## What this is

A single-artist art portfolio and commission storefront for **Zaverose**, a
furry artist. It replaces an old carrd.co export (archived in `../carrd/`). The
site is a static Astro build with React islands for the interactive bits.

## Who it's for

- **Fans / gallery browsers.** Want to scan a lot of art quickly, filter by
  character or tag, and click through to a hi-res version. They arrive from
  social links (Telegram, Bluesky, TikTok, etc.).
- **Commission clients.** Want to estimate a price, understand the terms and
  turnaround, and send a request without an account or a heavy form.
- **Patrons / supporters.** Want the Patreon and the socials hub in one place.

The audience is split SFW / NSFW. Explicit work is gated behind an age check;
the default experience is safe-for-work so search engines and casual visitors
never see explicit art.

## Voice

Brutalist, technical, confident, a little tongue-in-cheek. The site presents
itself like a piece of proprietary software: version number, CHANGELOG, SETTINGS,
monoline icons, ALL-CAPS navigation. Copy is terse and declarative. The wordmark
is the joke: **LOVE THIS ARTIST** in safe mode, **HATE THIS ARTIST** once you
opt into explicit content.

## Core mechanic — SFW / NSFW mode

Mode is a global toggle, like dark/light. It is driven by each artwork's e621
rating (`s`/`q`/`e`):

- **SFW (default, server-rendered).** Shows `safe` + `questionable`. Explicit
  URLs are never in the SSR HTML.
- **NSFW.** First switch shows an **18+ age gate** (remembered via cookie). Once
  accepted, the explicit set is lazy-fetched from `/art-full.json`, the wordmark
  flips to HATE THIS ARTIST, and the accent turns red.

Mode also gates NSFW social links and the STREAM video section.

## Sections

- **ART** — booru-style gallery: masonry grid, e621-style tag list with counts,
  text + tag filtering, lightbox that links out to the hi-res file.
- **LINKS** — socials hub (SFW + NSFW-gated), email copy-to-clipboard, Patreon.
- **STREAM** — Picarto/Twitch links + HLS.js player for R2-hosted supercuts,
  NSFW-gated.
- **COMMISSION** — price calculator ported verbatim from the old carrd site, a
  request form (mailto fallback until a Formspree/Web3Forms endpoint is set),
  TOS, and an 8-step timeline.

## Constraints

- **Static hosting.** No server runtime. Forms go to a third-party endpoint or
  fall back to `mailto:`.
- **Fast.** Thumbnails are e621 `sample` images served off their CDN; the
  lightbox links to the full file. Can move to self-hosted AVIF later without
  schema changes (the `thumb`/`full` fields are just URLs).
- **Identity stays Zaverose.** LOVE/HATE THIS ARTIST is a wordmark gag only;
  handles, email, and branding remain Zaverose.
- **Accessibility & motion.** Keyboard-navigable, respects
  `prefers-reduced-motion` (the R3F hero renders a single static frame).
