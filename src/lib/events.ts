import type { AgeRestriction, CaravanEvent } from "@/data/events";
import { EVENTS } from "@/data/events";

const DEFAULT_TZ = "America/New_York";
const SITE = "https://lovethisartist.studio";

/** Events that haven't fully ended yet, soonest start first. */
export function upcomingEvents(now: Date = new Date()): CaravanEvent[] {
  return EVENTS.filter(
    (e) => new Date(e.end).getTime() >= now.getTime(),
  ).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

export function eventTimeZone(e: CaravanEvent): string {
  return e.timeZone ?? DEFAULT_TZ;
}

/** e.g. "Fri, Jul 3, 2026 · 10:00 AM – 1:00 PM EDT" (or spanning days). */
export function formatWhen(e: CaravanEvent): string {
  const tz = eventTimeZone(e);
  const start = new Date(e.start);
  const end = new Date(e.end);
  const date = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: tz,
  });
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: tz,
  });
  const zone =
    new Intl.DateTimeFormat("en-US", { timeZoneName: "short", timeZone: tz })
      .formatToParts(start)
      .find((p) => p.type === "timeZoneName")?.value ?? "";

  const sameDay = date.format(start) === date.format(end);
  const body = sameDay
    ? `${date.format(start)} · ${time.format(start)} – ${time.format(end)}`
    : `${date.format(start)}, ${time.format(start)} – ${date.format(end)}, ${time.format(end)}`;
  return zone ? `${body} ${zone}` : body;
}

export function formatCost(cost: number): string {
  return cost <= 0 ? "Free" : `$${cost}`;
}

export function formatAges(ages: AgeRestriction): string {
  return ages === "all" ? "All ages" : ages;
}

export function mapsUrl(location: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

export function eventShareUrl(slug: string): string {
  return `${SITE}/events/${slug}`;
}
