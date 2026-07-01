/*
  Every Zaverose link, ported from the carrd site. `nsfw: true` links only
  render in NSFW mode. Grouped to mirror the old site's ART / STREAM / SOCIAL /
  NSFW sections.
*/

export type LinkGroup = "art" | "stream" | "social" | "nsfw" | "support";

export interface SocialLink {
  label: string;
  handle: string;
  url: string;
  group: LinkGroup;
  nsfw: boolean;
  note?: string;
}

export const EMAIL = "zaverosearts@gmail.com";
export const PATREON = "https://patreon.com/ZaveroseArt";
export const TRELLO_QUEUE = "https://trello.com/b/H51HnCLL/zavs-commission-queue";

export const SOCIALS: SocialLink[] = [
  // ---- SFW art ----
  { label: "Telegram", handle: "@zav_art", url: "https://t.me/zav_art", group: "art", nsfw: false, note: "One-stop shop for all art" },
  { label: "Bluesky", handle: "@zaverose.art", url: "https://bsky.app/profile/zaverose.art", group: "art", nsfw: false },
  { label: "TikTok", handle: "@zaverose_art", url: "https://www.tiktok.com/@zaverose_art", group: "art", nsfw: false },
  { label: "Twitter / X", handle: "@zaverose", url: "https://twitter.com/zaverose", group: "art", nsfw: false },
  { label: "Reddit", handle: "u/Zaverose", url: "https://www.reddit.com/user/Zaverose", group: "art", nsfw: false },
  { label: "Instagram", handle: "@zaverose", url: "https://www.instagram.com/zaverose/", group: "art", nsfw: false },
  { label: "ArtFight", handle: "~zaverose", url: "https://artfight.net/~zaverose", group: "art", nsfw: false },

  // ---- streams ----
  { label: "Picarto", handle: "ZaveroseArt", url: "https://picarto.tv/ZaveroseArt", group: "stream", nsfw: false },
  { label: "Twitch", handle: "zaverose_art", url: "https://www.twitch.tv/zaverose_art", group: "stream", nsfw: false },
  { label: "YouTube", handle: "@zaverose9944", url: "https://www.youtube.com/@zaverose9944", group: "stream", nsfw: false },

  // ---- contact / social ----
  { label: "Telegram DM", handle: "@zaverose", url: "https://t.me/zaverose", group: "social", nsfw: false, note: "Preferred contact" },
  { label: "Discord", handle: "zaverose", url: "https://discordapp.com/users/zaverose", group: "social", nsfw: false },

  // ---- NSFW ----
  { label: "Telegram (NSFW)", handle: "@zav_nsfw", url: "https://t.me/zav_nsfw", group: "nsfw", nsfw: true },
  { label: "Bluesky (NSFW)", handle: "@zaverosead", url: "https://bsky.app/profile/zaverosead.bsky.social", group: "nsfw", nsfw: true },
  { label: "FurAffinity", handle: "zaverose", url: "https://www.furaffinity.net/user/zaverose", group: "nsfw", nsfw: true },
  { label: "Twitter (NSFW)", handle: "@zaverose_nsfw", url: "https://twitter.com/zaverose_nsfw", group: "nsfw", nsfw: true },

  // ---- support ----
  { label: "Patreon", handle: "ZaveroseArt", url: PATREON, group: "support", nsfw: false, note: "Unreleased content from $3" },
];

export function linksForMode(nsfwMode: boolean): SocialLink[] {
  return SOCIALS.filter((l) => nsfwMode || !l.nsfw);
}
