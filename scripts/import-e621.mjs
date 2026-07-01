#!/usr/bin/env node
/*
  Import artwork metadata from the e621 API into src/content/art/zaverose.json.

  The gallery renders these directly off e621's static CDN (sample images as
  thumbnails, the full file as the hi-res click-through). Ratings (s/q/e) drive
  the SFW/NSFW split.

  Usage:
    node scripts/import-e621.mjs                 # all posts tagged `zaverose`
    node scripts/import-e621.mjs --tags "zaverose solo"
    node scripts/import-e621.mjs --max 200

  Note: some login-gated posts (e.g. certain tags) return null file URLs when
  unauthenticated; those are skipped since they can't be displayed.
*/
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../src/content/art/zaverose.json");
const UA = "LoveThisArtistSite/0.1 (art portfolio for artist zaverose)";

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const TAGS = arg("--tags", "zaverose");
const MAX = parseInt(arg("--max", "1000"), 10);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function titleFor(post) {
  const chars = post.tags.character?.filter((c) => c !== "zav") ?? [];
  const src = chars.length ? chars : post.tags.character ?? [];
  if (src.length) {
    return src
      .slice(0, 2)
      .map((c) => c.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()))
      .join(" & ");
  }
  return `Zaverose #${post.id}`;
}

function tagsFor(post) {
  const t = post.tags;
  const merged = [
    ...(t.character ?? []),
    ...(t.species ?? []),
    ...(t.general ?? []),
    ...(t.copyright ?? []),
  ].filter((x) => x && x !== "zaverose");
  return [...new Set(merged)];
}

async function fetchPage(beforeId) {
  const url = new URL("https://e621.net/posts.json");
  url.searchParams.set("tags", TAGS);
  url.searchParams.set("limit", "320");
  if (beforeId) url.searchParams.set("page", `b${beforeId}`);
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`e621 ${res.status}: ${await res.text()}`);
  return (await res.json()).posts ?? [];
}

async function main() {
  const out = [];
  let beforeId;
  while (out.length < MAX) {
    const posts = await fetchPage(beforeId);
    if (posts.length === 0) break;
    for (const p of posts) {
      const thumb = p.sample?.url || p.preview?.url || p.file?.url;
      const full = p.file?.url || thumb;
      if (!thumb || !full) continue; // login-gated / deleted
      const w = p.sample?.width || p.file?.width || 800;
      const h = p.sample?.height || p.file?.height || 800;
      out.push({
        id: String(p.id),
        title: titleFor(p),
        date: p.created_at,
        rating: p.rating,
        thumb,
        full,
        width: w,
        height: h,
        tags: tagsFor(p),
        characters: (p.tags.character ?? []).map((c) => c.replace(/_/g, " ")),
        e621PostId: p.id,
        featured: false,
      });
      if (out.length >= MAX) break;
    }
    beforeId = posts[posts.length - 1].id;
    process.stdout.write(`\rfetched ${out.length} posts…`);
    await sleep(600);
  }

  // Mark the newest few SFW pieces as featured for the landing slideshow.
  out
    .filter((a) => a.rating === "s")
    .slice(0, 5)
    .forEach((a) => (a.featured = true));

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`\nwrote ${out.length} entries → ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
