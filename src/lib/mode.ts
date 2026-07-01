import { COOKIE, AGE_GATE_TTL_DAYS, type Mode } from "@/data/config";

/*
  Global SFW/NSFW mode — behaves like a dark/light toggle.

  - Default is SFW so crawlers and no-JS visitors never see explicit art.
  - The active mode lives on <html data-mode> (set pre-paint by an inline
    script in BaseLayout to avoid a flash) and is mirrored to a cookie so SSR
    can honor it too.
  - Switching *into* NSFW requires a one-time 18+ affirmation, remembered via
    a separate cookie.
*/

const MODE_EVENT = "lta:modechange";

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function getMode(): Mode {
  const attr = document.documentElement.dataset.mode;
  return attr === "nsfw" ? "nsfw" : "sfw";
}

export function isAgeVerified(): boolean {
  return getCookie(COOKIE.ageVerified) === "1";
}

export function markAgeVerified() {
  setCookie(COOKIE.ageVerified, "1", AGE_GATE_TTL_DAYS);
}

/** Apply a mode: update <html>, persist, and broadcast to islands. */
export function applyMode(mode: Mode) {
  document.documentElement.dataset.mode = mode;
  setCookie(COOKIE.mode, mode, 365);
  window.dispatchEvent(new CustomEvent<Mode>(MODE_EVENT, { detail: mode }));
}

/**
 * Request a mode change. Returns true if applied; false when NSFW was blocked
 * pending age verification (caller should open the age gate).
 */
export function requestMode(mode: Mode): boolean {
  if (mode === "nsfw" && !isAgeVerified()) return false;
  applyMode(mode);
  return true;
}

export function onModeChange(cb: (mode: Mode) => void): () => void {
  const handler = (e: Event) => cb((e as CustomEvent<Mode>).detail);
  window.addEventListener(MODE_EVENT, handler);
  return () => window.removeEventListener(MODE_EVENT, handler);
}
