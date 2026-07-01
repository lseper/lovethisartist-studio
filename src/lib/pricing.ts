/*
  Commission price calculator — ported from carrd/helper.js
  (priceCalculatorCategoryData, L147–642).

  Base option prices are reproduced verbatim. The count categories
  (characters / pages) apply a percentage surcharge on the subtotal that
  scales with the count (2 → 25% … >5 → 125%): each extra character/page is
  significant added work, so 5 characters roughly doubles the subtotal.
  Sticker counts are flat surcharges, as before.
*/

export type CategoryId =
  | "commission-type"
  | "commission-medium"
  | "content-type"
  | "nsfw"
  | "render-type"
  | "full-render-type"
  | "background-type"
  | "number-of-characters"
  | "number-of-pages"
  | "number-of-stickers";

export interface Option {
  id: string;
  label: string;
  /** Flat dollar add. */
  price: number;
  /** Subtotal-percentage surcharge (used by count categories). */
  surchargePct?: number;
}

export interface Category {
  id: CategoryId;
  label: string;
  options: Option[];
  /** Only shown when `dependsOn.category`'s selection is in `values`. */
  dependsOn?: { category: CategoryId; values: string[] };
}

export const CATEGORIES: Category[] = [
  {
    id: "commission-type",
    label: "Commission Type",
    options: [
      { id: "type-pinup", label: "Pinup (Single Character)", price: 30 },
      { id: "type-multi-pinup", label: "Multi-Character Pinup", price: 30 },
      { id: "type-scene", label: "Scene (Multi-Character w/ Background)", price: 40 },
      { id: "type-story", label: "Story (Multi-page Comic)", price: 50 },
      { id: "type-sticker", label: "Telegram Stickers", price: 30 },
    ],
  },
  {
    id: "commission-medium",
    label: "Medium",
    dependsOn: {
      category: "commission-type",
      values: ["type-pinup", "type-multi-pinup", "type-scene", "type-story"],
    },
    options: [
      { id: "medium-digital", label: "Digital", price: 0 },
      { id: "medium-traditional", label: "Traditional", price: 35 },
    ],
  },
  {
    id: "content-type",
    label: "Content",
    options: [
      { id: "content-headshot", label: "Headshot", price: 0 },
      { id: "content-bust", label: "Bust (breast and above)", price: 15 },
      { id: "content-half-body", label: "Half-Body (waist and above)", price: 25 },
      { id: "content-full-body", label: "Full-Body", price: 35 },
    ],
  },
  {
    id: "nsfw",
    label: "NSFW",
    options: [
      { id: "nsfw-yes", label: "Yes", price: 30 },
      { id: "nsfw-no", label: "No", price: 0 },
    ],
  },
  {
    id: "render-type",
    label: "Render Type",
    options: [
      { id: "render-sketch", label: "Sketch", price: 0 },
      { id: "render-inked", label: "Ink", price: 20 },
      { id: "render-full", label: "Full Render", price: 45 },
    ],
  },
  {
    id: "full-render-type",
    label: "Full Render Style",
    dependsOn: { category: "render-type", values: ["render-full"] },
    options: [
      { id: "full-watercolor", label: "Painterly Watercolor", price: 10 },
      { id: "full-cell-shaded", label: "Oil Render (Cell-Shaded)", price: 20 },
      { id: "full-charcoal", label: "Charcoal Airbrush", price: 15 },
    ],
  },
  {
    id: "background-type",
    label: "Background",
    dependsOn: { category: "commission-type", values: ["type-scene", "type-story"] },
    options: [
      { id: "bg-simple", label: "Simple", price: 35 },
      { id: "bg-complex", label: "Complex", price: 60 },
    ],
  },
  {
    id: "number-of-characters",
    label: "Number of Characters",
    dependsOn: {
      category: "commission-type",
      values: ["type-multi-pinup", "type-scene", "type-story"],
    },
    options: [
      { id: "chars-2", label: "2", price: 0, surchargePct: 0.25 },
      { id: "chars-3", label: "3", price: 0, surchargePct: 0.5 },
      { id: "chars-4", label: "4", price: 0, surchargePct: 0.75 },
      { id: "chars-5", label: "5", price: 0, surchargePct: 1.0 },
      { id: "chars-gt5", label: ">5", price: 0, surchargePct: 1.25 },
    ],
  },
  {
    id: "number-of-pages",
    label: "Number of Pages",
    dependsOn: { category: "commission-type", values: ["type-story"] },
    options: [
      { id: "pages-2", label: "2", price: 0, surchargePct: 0.25 },
      { id: "pages-3", label: "3", price: 0, surchargePct: 0.5 },
      { id: "pages-4", label: "4", price: 0, surchargePct: 0.75 },
      { id: "pages-5", label: "5", price: 0, surchargePct: 1.0 },
      { id: "pages-gt5", label: ">5", price: 0, surchargePct: 1.25 },
    ],
  },
  {
    id: "number-of-stickers",
    label: "Number of Stickers",
    dependsOn: { category: "commission-type", values: ["type-sticker"] },
    options: [
      { id: "stickers-3", label: "3", price: 0 },
      { id: "stickers-5", label: "5", price: 45 },
      { id: "stickers-8", label: "8", price: 65 },
      { id: "stickers-10", label: "10", price: 80 },
      { id: "stickers-20", label: "20", price: 150 },
    ],
  },
];

export type Selection = Partial<Record<CategoryId, string>>;

/** Categories currently visible given the active selection + dependencies. */
export function visibleCategories(selection: Selection): Category[] {
  return CATEGORIES.filter((cat) => {
    if (!cat.dependsOn) return true;
    const chosen = selection[cat.dependsOn.category];
    return chosen != null && cat.dependsOn.values.includes(chosen);
  });
}

export interface LineItem {
  category: string;
  label: string;
  amount: number;
}

export interface Quote {
  lineItems: LineItem[];
  subtotal: number;
  surcharge: number;
  total: number;
}

function findOption(cat: Category, optionId: string): Option | undefined {
  return cat.options.find((o) => o.id === optionId);
}

/** Compute the quote from a selection, ignoring hidden categories. */
export function computeQuote(selection: Selection): Quote {
  const visible = visibleCategories(selection);
  const lineItems: LineItem[] = [];
  let subtotal = 0;
  const pctItems: { cat: Category; opt: Option }[] = [];

  for (const cat of visible) {
    const optionId = selection[cat.id];
    if (!optionId) continue;
    const opt = findOption(cat, optionId);
    if (!opt) continue;
    if (opt.surchargePct != null) {
      pctItems.push({ cat, opt });
    } else {
      subtotal += opt.price;
      lineItems.push({ category: cat.label, label: opt.label, amount: opt.price });
    }
  }

  let surcharge = 0;
  for (const { cat, opt } of pctItems) {
    const amount = Math.round(subtotal * (opt.surchargePct ?? 0));
    surcharge += amount;
    lineItems.push({ category: cat.label, label: opt.label, amount });
  }

  return { lineItems, subtotal, surcharge, total: subtotal + surcharge };
}

/** Human-readable estimate for the "copy details" button + form prefill. */
export function quoteToText(selection: Selection): string {
  const quote = computeQuote(selection);
  const lines = quote.lineItems.map(
    (li) => `- ${li.category}: ${li.label} (+$${li.amount})`
  );
  lines.push(`Estimated total: $${quote.total}`);
  return lines.join("\n");
}
