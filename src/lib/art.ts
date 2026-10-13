import { getCollection } from "astro:content";
import type { Rating } from "@/data/config";
import { ROTATIONS, type Rotation } from "@/data/rotations";

/** Plain artwork shape passed to React islands (must be serializable). */
export interface Artwork {
  id: string;
  title: string;
  date: string; // ISO
  rating: Rating;
  thumb: string;
  full: string;
  /** Displayed dimensions (already swapped for quarter-turn rotations). */
  width: number;
  height: number;
  /** Clockwise display rotation correcting a mis-stored upload. */
  rotate: Rotation;
  tags: string[];
  characters: string[];
  description?: string;
  featured: boolean;
}

/** Load all artwork, newest first, as serializable plain objects. */
export async function loadArt(): Promise<Artwork[]> {
  const entries = [
    ...(await getCollection("art")),
    ...(await getCollection("artExternal")),
  ];
  return entries
    .map((e) => {
      const rotate = ROTATIONS[e.id] ?? 0;
      const swap = rotate === 90 || rotate === 270;
      return {
        id: e.id,
        title: e.data.title,
        date: e.data.date.toISOString(),
        rating: e.data.rating,
        thumb: e.data.thumb,
        full: e.data.full,
        width: swap ? e.data.height : e.data.width,
        height: swap ? e.data.width : e.data.height,
        rotate,
        tags: e.data.tags,
        characters: e.data.characters,
        description: e.data.description,
        featured: e.data.featured,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}
