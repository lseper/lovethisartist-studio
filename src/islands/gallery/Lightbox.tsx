import { useEffect } from "react";
import type { Artwork } from "@/lib/art";
import { ratingLabel } from "@/lib/rating";

interface Props {
  art: Artwork;
  onClose: () => void;
  onNav: (dir: -1 | 1) => void;
}

/** Full-view overlay. The displayed AVIF links out to the hi-res JPEG. */
export default function Lightbox({ art, onClose, onNav }: Props) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNav(-1);
      if (e.key === "ArrowRight") onNav(1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onNav]);

  return (
    <div className="lb" role="dialog" aria-modal="true" aria-label={art.title}>
      <button
        type="button"
        className="lb-close caps"
        onClick={onClose}
        aria-label="Close"
      >
        ✕ ESC
      </button>
      <button
        type="button"
        className="lb-arrow left"
        onClick={() => onNav(-1)}
        aria-label="Previous"
      >
        ‹
      </button>

      <figure className="lb-fig">
        <a href={art.full} target="_blank" rel="noopener" className="lb-imglink">
          <img
            src={art.thumb}
            width={art.width}
            height={art.height}
            alt={art.title}
            className="lb-img"
          />
        </a>
        <figcaption className="lb-meta">
          <h2 className="font-display lb-title">{art.title}</h2>
          <p className="mono caps lb-rating">
            {ratingLabel(art.rating)} · {new Date(art.date).getFullYear()}
          </p>
          {art.characters.length > 0 && (
            <p className="lb-chars caps">{art.characters.join(", ")}</p>
          )}
          {art.description && <p className="lb-desc">{art.description}</p>}
          <ul className="lb-tags caps">
            {art.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <a className="lb-full caps link-line" href={art.full} target="_blank" rel="noopener">
            View hi-res →
          </a>
        </figcaption>
      </figure>

      <button
        type="button"
        className="lb-arrow right"
        onClick={() => onNav(1)}
        aria-label="Next"
      >
        ›
      </button>

      <style>{`
        .lb {
          position: fixed; inset: 0; z-index: var(--z-overlay);
          background: color-mix(in srgb, var(--paper) 94%, transparent);
          display: grid;
          grid-template-columns: auto 1fr auto;
          /* safe center: when the figure is taller than the viewport (tall
             images + a stray scrollbar), fall back to top-align so the top of
             the image is never clipped and the rest stays scroll-reachable. */
          align-items: safe center;
          overflow-y: auto;
        }
        .lb-close {
          position: absolute; top: var(--gutter); right: var(--gutter);
          background: transparent; border: 0; color: var(--ink-dim);
          font: inherit; letter-spacing: var(--tracking-caps); cursor: pointer;
          z-index: 1;
        }
        .lb-close:hover { color: var(--ink); }
        .lb-arrow {
          background: transparent; border: 0; color: var(--ink-dim);
          font-size: var(--step-4); line-height: 1; cursor: pointer;
          padding: 0 0.5rem;
        }
        .lb-arrow:hover { color: var(--accent); }
        .lb-fig {
          margin: 0; padding: var(--gutter);
          display: grid; gap: var(--gutter);
          grid-template-columns: minmax(0, 1fr) minmax(220px, 320px);
          align-items: safe center;
          box-sizing: border-box;
        }
        .lb-imglink { display: block; min-width: 0; }
        .lb-img {
          display: block; max-width: 100%;
          max-height: calc(100dvh - var(--gutter) * 2);
          width: auto; height: auto; margin: 0 auto;
          border: 1px solid var(--line);
        }
        .lb-meta {
          min-width: 0;
          max-height: calc(100dvh - var(--gutter) * 2);
          overflow-y: auto;
        }
        .lb-title { font-size: var(--step-2); margin: 0 0 0.5rem; }
        .lb-rating { color: var(--accent); margin: 0 0 0.75rem; font-size: var(--step--1); }
        .lb-chars { color: var(--ink-dim); margin: 0 0 0.75rem; font-size: var(--step--1); }
        .lb-desc { color: var(--ink-dim); margin: 0 0 1rem; }
        .lb-tags {
          list-style: none; margin: 0 0 1rem; padding: 0;
          display: flex; flex-wrap: wrap; gap: 0.35rem;
          font-size: var(--step--1);
        }
        .lb-tags li { color: var(--ink-faint); }
        .lb-tags li::before { content: "#"; }
        .lb-full { color: var(--accent); display: inline-block; }
        @media (max-width: 720px) {
          .lb { align-items: start; }
          .lb-fig {
            grid-template-columns: 1fr;
            max-height: none; overflow: visible;
          }
          .lb-img { max-height: 70dvh; }
          .lb-meta { max-height: none; overflow: visible; }
          .lb-arrow { font-size: var(--step-2); }
        }
      `}</style>
    </div>
  );
}
