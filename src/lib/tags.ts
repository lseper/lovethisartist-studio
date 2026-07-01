import type { Mode } from "@/data/config";
import { visibleInMode } from "@/lib/rating";
import type { Artwork } from "@/lib/art";

export interface TagCount {
  tag: string;
  count: number;
}

/** Artworks visible in the current mode. */
export function visibleArt(art: Artwork[], mode: Mode): Artwork[] {
  return art.filter((a) => visibleInMode(a.rating, mode));
}

/**
 * Tag counts over the visible set, sorted by frequency then alpha —
 * mirrors r3drunner's "- 591 cub / - 450 male …" sidebar.
 */
export function tagCounts(art: Artwork[]): TagCount[] {
  const counts = new Map<string, number>();
  for (const a of art) {
    for (const tag of a.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** AND-filter: a piece must carry every active tag. Empty = SHOW ALL. */
export function filterByTags(art: Artwork[], active: Set<string>): Artwork[] {
  if (active.size === 0) return art;
  return art.filter((a) => {
    for (const tag of active) if (!a.tags.includes(tag)) return false;
    return true;
  });
}

/** Free-text search across title, characters, and tags. */
export function searchArt(art: Artwork[], query: string): Artwork[] {
  const q = query.trim().toLowerCase();
  if (!q) return art;
  return art.filter((a) => {
    const haystack = [a.title, ...a.characters, ...a.tags]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
