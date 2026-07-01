/*
  In-person events — conventions, room parties, gallery showings, nightclub
  popups. Static data for now; the plan is for the caravan generation-engine
  (one level up from website/) to write this file and trigger a deploy. Keep it
  a plain typed array so an automated writer only has to append objects.

  Datetimes are ISO 8601 WITH an explicit UTC offset, and each event carries an
  IANA `timeZone`, so the build formats them in the event's local time and shows
  the right zone abbreviation regardless of where the build runs.
*/

export type AgeRestriction = "all" | "18+" | "21+";

export type EventRole = "hosting" | "attending" | "vending";

export interface RsvpLink {
  /** Button label — reflects the RSVP style (DM, group chat, formal RSVP…). */
  label: string;
  url: string;
}

export interface CaravanEvent {
  slug: string;
  title: string;
  description: string;
  /** ISO 8601 with offset, e.g. 2026-07-03T10:00:00-04:00 */
  start: string;
  /** ISO 8601 with offset. */
  end: string;
  /** IANA zone for display; defaults to America/New_York. */
  timeZone?: string;
  /** Physical address. */
  location: string;
  /** Parent event this sits under, e.g. "Anthrocon 2026". */
  associatedEvent?: string;
  /** What Zav is doing at it. */
  role?: EventRole;
  rsvp: RsvpLink;
  ages: AgeRestriction;
  /** Cost in USD; 0 = free. */
  cost: number;
  /** Optional site-relative or absolute OG image for share cards. */
  ogImage?: string;
}

export const EVENTS: CaravanEvent[] = [
  {
    slug: "anthrocon-2026-plein-air",
    title: "Fursuiters — Plein Air Painting",
    description:
      "We'll be painting fursuiters in plein air in the convention center lobby, in watercolor, acrylic, and gouache.",
    start: "2026-07-03T10:00:00-04:00",
    end: "2026-07-03T13:00:00-04:00",
    timeZone: "America/New_York",
    location: "1000 Fort Duquesne Blvd, Pittsburgh, PA 15222 — Second floor",
    associatedEvent: "Anthrocon 2026",
    role: "hosting",
    rsvp: { label: "RSVP via Telegram DM", url: "https://t.me/zaverose" },
    ages: "all",
    cost: 0,
  },
];
