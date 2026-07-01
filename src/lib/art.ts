import { getCollection } from "astro:content";
import type { Rating } from "@/data/config";

/** Plain artwork shape passed to React islands (must be serializable). */
export interface Artwork {
  id: string;
  title: string;
  date: string; // ISO
  rating: Rating;
  thumb: string;
  full: string;
  width: number;
  height: number;
  tags: string[];
  characters: string[];
  description?: string;
  featured: boolean;
}

/** Load all artwork, newest first, as serializable plain objects. */
export async function loadArt(): Promise<Artwork[]> {
  const entries = await getCollection("art");
  return entries
    .map((e) => ({
      id: e.id,
      title: e.data.title,
      date: e.data.date.toISOString(),
      rating: e.data.rating,
      thumb: e.data.thumb,
      full: e.data.full,
      width: e.data.width,
      height: e.data.height,
      tags: e.data.tags,
      characters: e.data.characters,
      description: e.data.description,
      featured: e.data.featured,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}
