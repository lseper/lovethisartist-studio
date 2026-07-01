import type { APIRoute } from "astro";
import { loadArt } from "@/lib/art";

/*
  Full artwork set (including explicit). Fetched by the gallery island only
  after the visitor opts into age-verified NSFW mode, so these URLs never
  appear in the SFW page HTML or get crawled inline.
*/
export const GET: APIRoute = async () => {
  const art = await loadArt();
  return new Response(JSON.stringify(art), {
    headers: {
      "Content-Type": "application/json",
      "X-Robots-Tag": "noindex",
    },
  });
};
