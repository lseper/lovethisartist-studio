# DESIGN — brutalist "technical software" system

Reverse-engineered from [r3drunner.com](https://r3drunner.com), filtered through
impeccable anti-slop rules. The site should read like proprietary software: a
fixed left sidebar app-shell, version chrome, ALL-CAPS nav, monoline icons, and
an e621-style tag list. Single source of truth for tokens is
`src/styles/tokens.css`; Tailwind's compile-time `@theme` (`src/styles/global.css`)
maps utilities onto those runtime variables.

## Color

Monochrome base + **one electric accent**, plus two semantic copy colors.

| Token | SFW | NSFW | Use |
|---|---|---|---|
| `--paper` | `#000` | `#000` | Page background |
| `--surface` / `--surface-2` | `#0a0a0a` / `#121212` | same | Raised surfaces |
| `--ink` / `--ink-dim` / `--ink-faint` | `#fff` / `#8a8a8a` / `#4d4d4d` | same | Text tiers |
| `--line` / `--line-strong` | `#1e1e1e` / `#2c2c2c` | same | Hairline borders |
| `--accent` / `--accent-ink` | `#4dffb0` / `#000` | `#ff2d4d` / `#fff` | The one accent, mode-driven |
| `--warn` | `#ffe14d` | same | Yellow — e.g. "eighteen years" |
| `--go` | `#4dff88` | same | Green — e.g. "safe mode" |

The accent (and only the accent) flips with `[data-mode]` on `<html>`. Never
introduce a second decorative color.

## Type

- **Display**: Archivo, heavy grotesk. `--weight-display: 800`,
  `--tracking-display: -0.02em`. Used for the wordmark and page titles.
- **Body**: Inter.
- **Mono**: system mono, for chrome (version, tags, technical labels).
- **Caps**: nav, tags, and labels are `text-transform: uppercase` with
  `--tracking-caps: 0.06em` (`.caps` utility).
- Fluid scale `--step--1 … --step-4` plus `--step-hero` for the landing wordmark.

## Geometry & motion

- `--radius: 0px` — brutalist, no over-rounding (inputs get `2px` only).
- `--sidebar-w: 232px`; page padding via `--gutter` (fluid `1–2rem`).
- Motion: `--ease: cubic-bezier(0.2,0.8,0.2,1)`, durations
  `--dur-fast/dur/dur-slow`. All zeroed under `prefers-reduced-motion`.
- Z-layers: `--z-shell` 20, `--z-overlay` 60, `--z-gate` 100.

## Component vocabulary

- **App-shell**: fixed left sidebar — version chrome (`v0.1.0 · CHANGELOG · INFO`),
  wordmark, tagline, nav (ART / LINKS / STREAM / COMMISSION with monoline icons,
  active = full accent), SFW/NSFW toggle, SETTINGS, Patreon CTA.
- **Booru gallery**: masonry columns, lazy `<img>`, tag list with counts +
  `SHOW ALL`, dash-prefixed tags.
- **Age gate**: full-screen, giant outlined line-art `18+`, stark declarative
  copy, "safe mode" escape. Uses `--warn` and `--go` for the two inline emphases.
- **Buttons**: primary = solid accent fill; ghost = transparent w/ `--line-strong`
  border that goes accent on hover. No shadows, no gradients.

## impeccable anti-slop rules (enforced)

- No gradient text, no gradient fills for meaning.
- No ghost cards (borderless floating boxes) — surfaces get a hairline or nothing.
- No side-stripe / left-accent-bar borders.
- No over-rounding — radius is `0` by default.
- No image-swap-on-hover; hover changes border/color only.
- Respect `prefers-reduced-motion` everywhere.

## Islands style convention

React islands are self-contained: markup + a trailing `<style>{`…`}</style>`
block that references the CSS variables above. `src/islands/ModeControl.tsx` is
the canonical reference for the pattern (scoped styles, mode-aware, no external
CSS module). Follow it for any new island.
