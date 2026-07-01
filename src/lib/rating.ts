import { RATING_THRESHOLD, type Mode, type Rating } from "@/data/config";

const ORDER: Record<Rating, number> = { s: 0, q: 1, e: 2 };

const LABEL: Record<Rating, string> = {
  s: "safe",
  q: "questionable",
  e: "explicit",
};

/** True when a piece is NSFW under the configured threshold. */
export function isNsfw(rating: Rating): boolean {
  return ORDER[rating] >= ORDER[RATING_THRESHOLD];
}

/** Whether a piece is visible in the given mode. */
export function visibleInMode(rating: Rating, mode: Mode): boolean {
  return mode === "nsfw" ? true : !isNsfw(rating);
}

export function ratingLabel(rating: Rating): string {
  return LABEL[rating];
}
