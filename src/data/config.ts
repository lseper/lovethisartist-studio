/*
  Single source of truth for the site's tunable knobs.
  The whole SFW/NSFW split hinges on RATING_THRESHOLD below.
*/

export type Mode = "sfw" | "nsfw";

/** e621 rating letters. */
export type Rating = "s" | "q" | "e";

/**
 * The rating (and everything "more explicit" than it) that is considered NSFW
 * and therefore hidden in SFW mode. e621 orders ratings s < q < e.
 *
 * Default "e": SFW mode shows safe + questionable; only explicit is gated.
 * Set to "q" to also gate questionable art behind NSFW mode.
 */
export const RATING_THRESHOLD: Rating = "e";

/** Mode-driven brand wordmark (r3drunner-style: wordmark ≠ handle). */
export const BRAND = {
  sfw: "LOVE THIS ARTIST",
  nsfw: "HATE THIS ARTIST",
} as const satisfies Record<Mode, string>;

/** Short technical-software chrome, à la r3drunner's "1.4.4". */
export const VERSION = "0.1.0";

/** Cookie keys. */
export const COOKIE = {
  mode: "lta_mode",
  ageVerified: "lta_18plus",
} as const;

/** How long the 18+ affirmation is remembered (days). */
export const AGE_GATE_TTL_DAYS = 30;
