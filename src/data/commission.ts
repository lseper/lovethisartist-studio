import { EMAIL, PATREON, SUBSCRIBESTAR, TRELLO_QUEUE } from "@/data/socials";

/*
  Commission content, ported from the carrd site's TOS + 8-step timeline.

  FORM_ENDPOINT: set this to your Formspree (https://formspree.io/f/xxxx) or
  Web3Forms endpoint. Until then the form falls back to a mailto: to EMAIL.
*/
export const FORM_ENDPOINT = ""; // e.g. "https://formspree.io/f/abcdwxyz"

export const COMMISSION_STATUS: "OPEN" | "CLOSED" = "OPEN";

export const QUEUE_URL = TRELLO_QUEUE;
export const CONTACT_EMAIL = EMAIL;

export interface TimelineStep {
  n: number;
  title: string;
  body: string;
}

export const TIMELINE: TimelineStep[] = [
  {
    n: 1,
    title: "Fill out the form",
    body: "Send your commission details through the form below. Include references, character info, and what you're after.",
  },
  {
    n: 2,
    title: "I reach out",
    body: "I review submissions and get back to you within 24 hours, usually over Telegram (@zaverose) or email.",
  },
  {
    n: 3,
    title: "Payment",
    body: "Pay 50% (or the full amount) up-front within 48 hours via PayPal invoice or Venmo. Work begins once payment lands.",
  },
  {
    n: 4,
    title: "Added to the queue",
    body: "Your commission goes on the public Trello queue so you can track where it sits.",
  },
  {
    n: 5,
    title: "Loose sketch",
    body: "Within 48 hours, you'll receive a loose sketch of your commission. You may request any changes/revisions here. If changes are requested, I'll respond back within 48 hours with the updated sketch applied. You have 3 total revision requests at this stage — PLEASE use them if you have any qualms. It is VERY DIFFICULT to make large changes later, and I will refuse to do so past the sketch page if it is too time consuming.",
  },
  {
    n: 6,
    title: "Remaining payment",
    body: "Upon approval from you, I receive the rest of the payment (if you didn't pay in full up-front). I will not continue work on your commission until the rest of the payment is sent!",
  },
  {
    n: 7,
    title: "Inking",
    body: "I ink the approved sketch. Minor revisions are still fine at this stage.",
  },
  {
    n: 8,
    title: "Render & delivery",
    body: "I render the inked sketch. This is the longest part and, depending on complexity + number of characters, can take anywhere from 48 hours to 1 week. If it takes longer than 48 hours, I'll send a progress update every 48 hours. You receive the final high-res file (digital) or shipment (traditional).",
  },
];

export const TOS: string[] = [
  "If you are purchasing an NSFW commission, you must be 18 years of age or older.",
  "Payment is handled manually via PayPal invoice or Venmo — there is no automatic checkout.",
  "50% (or full) payment is due up-front within 48 hours; the balance is due before inking begins.",
  "You get 3 revision requests at the sketch stage. Large changes after the sketch is approved may be refused if too time-consuming.",
  "Commissions are for personal use. Ask first about commercial usage.",
  "I reserve the right to decline any commission request.",
];

/* -------------------------------------------------------------------------- *
   Monthlys — recurring subscription offerings billed through Patreon /
   SubscribeStar. Prices are placeholders until Zav sets the real tiers.
 * -------------------------------------------------------------------------- */

export interface MonthlyTier {
  level: "low" | "mid" | "high";
  name: string;
  price: number; // TODO(zav): confirm real monthly tier prices
  blurb: string;
}

export interface MonthlyOffering {
  slug: string;
  title: string;
  platform: "Patreon" | "SubscribeStar";
  subscribeUrl: string;
  blurb: string;
  need: string; // what the subscriber has to hand over each month
  tiers: MonthlyTier[];
}

export const MONTHLY_OFFERINGS: MonthlyOffering[] = [
  {
    slug: "fursuit",
    title: "Fursuit Sketches · Sketch Pages · Paintings",
    platform: "Patreon",
    subscribeUrl: PATREON,
    blurb:
      "Traditional, hand-made pieces of your fursuiter, drawn monthly for as long as you're subscribed. SFW or NSFW.",
    need: "Just drop a link to your ever-growing fursuit gallery (Bluesky, Furtrack, Twitter, etc.) and I'll work from your escapades.",
    tiers: [
      {
        level: "low",
        name: "Traditional Sketch",
        price: 25, // TODO(zav): confirm
        blurb: "A loose traditional SFW/NSFW sketch of your fursuiter each month.",
      },
      {
        level: "mid",
        name: "Traditional Sketch Page",
        price: 55, // TODO(zav): confirm
        blurb: "A full traditional sketch page — multiple poses / expressions.",
      },
      {
        level: "high",
        name: "Acrylic Painting",
        price: 120, // TODO(zav): confirm
        blurb: "A finished traditional acrylic painting, shipped to you.",
      },
    ],
  },
  {
    slug: "e621-favorites",
    title: "e621 Favorites Delivery",
    platform: "SubscribeStar",
    subscribeUrl: SUBSCRIBESTAR,
    blurb:
      "A monthly kink-themed piece of your character, drawn from what you actually love — pulled straight from your e621 favorites.",
    need: "Give me your e621 username; each month I'll draw your character in themes based on your favorites.",
    tiers: [
      {
        level: "low",
        name: "Sketch",
        price: 30, // TODO(zav): confirm
        blurb: "A monthly sketch of your character in a kink theme from your favorites.",
      },
      {
        level: "mid",
        name: "Sketch Page",
        price: 65, // TODO(zav): confirm
        blurb: "A monthly sketch page exploring multiple themes from your favorites.",
      },
      {
        level: "high",
        name: "Digital Render",
        price: 140, // TODO(zav): confirm
        blurb: "A fully rendered digital piece each month, themed to your favorites.",
      },
    ],
  },
];

/* -------------------------------------------------------------------------- *
   YCHs — one-off "your character here" slots. Prices/titles are placeholders;
   the images are assigned at build time from safe-rated gallery art (see
   pages/commission/ychs.astro) so no explicit URLs land in the SFW HTML.
   These will eventually be posted automatically by the generation engine.
 * -------------------------------------------------------------------------- */

export interface YchOffering {
  slug: string; // request-form item id becomes `ych-${slug}`
  title: string;
  price: number; // TODO(zav): confirm real YCH prices
}

export const YCH_OFFERINGS: YchOffering[] = [
  { slug: "skyline-duo", title: "Skyline Duo", price: 85 },
  { slug: "cozy-winter", title: "Cozy Winter", price: 65 },
  { slug: "neon-alley", title: "Neon Alley", price: 90 },
  { slug: "spring-bloom", title: "Spring Bloom", price: 70 },
  { slug: "midnight-lounge", title: "Midnight Lounge", price: 110 },
  { slug: "beach-day", title: "Beach Day", price: 75 },
];
