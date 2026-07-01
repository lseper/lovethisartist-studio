import { EMAIL, TRELLO_QUEUE } from "@/data/socials";

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
