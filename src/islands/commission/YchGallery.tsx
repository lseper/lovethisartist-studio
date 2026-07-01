import { useEffect, useState } from "react";
import RequestForm from "@/islands/commission/RequestForm";

export interface YchCard {
  slug: string;
  title: string;
  price: number;
  thumb: string;
  width: number;
  height: number;
}

interface Props {
  offerings: YchCard[];
}

/*
  Grid of current YCH slots. Each card shows a dark gradient overlay on
  hover/focus (always visible on touch/mobile) with the price + an Order Now
  button that opens the shared RequestForm in a modal, pre-selected to that
  slot. Modal is a centered card on desktop, full-viewport on mobile.
*/
export default function YchGallery({ offerings }: Props) {
  const [open, setOpen] = useState<YchCard | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="ych">
      <div className="ych-grid">
        {offerings.map((o) => (
          <figure className="ych-card" key={o.slug}>
            <img
              src={o.thumb}
              width={o.width}
              height={o.height}
              alt={o.title}
              className="ych-img"
              loading="lazy"
              decoding="async"
            />
            <figcaption className="ych-overlay">
              <div className="ych-info">
                <span className="ych-title font-display">{o.title}</span>
                <span className="ych-price mono">${o.price}</span>
              </div>
              <button
                type="button"
                className="btn btn-primary ych-order"
                onClick={() => setOpen(o)}
              >
                Order Now
              </button>
            </figcaption>
          </figure>
        ))}
      </div>

      {open && (
        <div
          className="ych-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`Order ${open.title}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(null);
          }}
        >
          <div className="ych-modal-card">
            <div className="ych-modal-head">
              <h2 className="font-display ych-modal-title">{open.title}</h2>
              <button
                type="button"
                className="ych-close caps"
                onClick={() => setOpen(null)}
                aria-label="Close"
              >
                ✕ ESC
              </button>
            </div>
            <RequestForm
              item={`ych-${open.slug}`}
              itemLabel={`${open.title} — $${open.price}`}
              estimate={`YCH: ${open.title} — $${open.price}`}
            />
          </div>
        </div>
      )}

      <style>{`
        .ych-grid {
          column-count: 3;
          column-gap: var(--gutter);
        }
        @media (max-width: 960px) { .ych-grid { column-count: 2; } }
        @media (max-width: 520px) { .ych-grid { column-count: 1; } }

        .ych-card {
          position: relative;
          margin: 0 0 var(--gutter);
          break-inside: avoid;
          border: 1px solid var(--line);
          overflow: hidden;
        }
        .ych-img { display: block; width: 100%; height: auto; }

        .ych-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          gap: 0.75rem;
          padding: var(--gutter);
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.78),
            rgba(0, 0, 0, 0.25) 55%,
            transparent
          );
          opacity: 0;
          transition: opacity var(--dur-fast) var(--ease);
        }
        .ych-card:hover .ych-overlay,
        .ych-card:focus-within .ych-overlay { opacity: 1; }

        .ych-info {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 1rem;
          width: 100%;
          color: #fff;
        }
        .ych-title { font-size: var(--step-0); }
        .ych-price { font-size: var(--step-1); }
        .ych-order { width: auto; }

        /* Touch / mobile: no hover, so keep the overlay visible. */
        @media (hover: none), (max-width: 520px) {
          .ych-overlay { opacity: 1; }
        }

        .ych-modal {
          position: fixed;
          inset: 0;
          z-index: var(--z-overlay);
          background: color-mix(in srgb, var(--paper) 94%, transparent);
          display: grid;
          place-items: safe center;
          overflow-y: auto;
          padding: var(--gutter);
        }
        .ych-modal-card {
          background: var(--surface);
          border: 1px solid var(--line-strong);
          padding: var(--gutter);
          width: min(28rem, 100%);
          box-sizing: border-box;
        }
        .ych-modal-head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 1rem;
          margin: 0 0 var(--gutter);
        }
        .ych-modal-title { margin: 0; font-size: var(--step-2); }
        .ych-close {
          background: transparent;
          border: 0;
          color: var(--ink-dim);
          font: inherit;
          letter-spacing: var(--tracking-caps);
          cursor: pointer;
        }
        .ych-close:hover { color: var(--ink); }

        @media (max-width: 640px) {
          .ych-modal { padding: 0; place-items: stretch; }
          .ych-modal-card {
            width: 100%;
            min-height: 100dvh;
            border: 0;
          }
        }
      `}</style>
    </div>
  );
}
