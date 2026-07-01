import { useEffect, useRef, useState } from "react";

/*
  Featured-art cross-fade for the landing page. Auto-advances (~4s), pauses on
  hover, and respects prefers-reduced-motion by falling back to a static grid.
  Every slide links to the gallery. Layout is a fixed-aspect area so nothing
  shifts while images decode.
*/

export interface SlideArt {
  id: string;
  thumb: string;
  full: string;
  width: number;
  height: number;
  title: string;
}

interface Props {
  art: SlideArt[];
}

const INTERVAL_MS = 4000;

export default function Slideshow({ art }: Props) {
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onMotion = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onMotion);
    return () => mq.removeEventListener("change", onMotion);
  }, []);

  useEffect(() => {
    if (reduced || paused || art.length < 2) return;
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % art.length);
    }, INTERVAL_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [reduced, paused, art.length]);

  if (art.length === 0) return null;

  // Reduced motion: responsive static grid, no auto-advance.
  if (reduced) {
    return (
      <section className="ss-grid" aria-label="Featured art">
        {art.map((a) => (
          <a key={a.id} href="/art" className="ss-grid-item" aria-label={a.title}>
            <img
              src={a.thumb}
              width={a.width}
              height={a.height}
              alt={a.title}
              loading="lazy"
              decoding="async"
            />
          </a>
        ))}
        <style>{gridStyles}</style>
      </section>
    );
  }

  return (
    <section
      className="ss"
      aria-label="Featured art"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="ss-stage">
        {art.map((a, i) => (
          <a
            key={a.id}
            href="/art"
            className={i === index ? "ss-slide on" : "ss-slide"}
            aria-hidden={i === index ? undefined : true}
            tabIndex={i === index ? 0 : -1}
            aria-label={a.title}
          >
            <img
              src={a.thumb}
              width={a.width}
              height={a.height}
              alt={a.title}
              loading="lazy"
              decoding="async"
            />
          </a>
        ))}
      </div>

      <div className="ss-meta caps mono">
        <span className="ss-count">
          {String(index + 1).padStart(2, "0")} / {String(art.length).padStart(2, "0")}
        </span>
        <span className="ss-dots" role="tablist" aria-label="Featured slides">
          {art.map((a, i) => (
            <button
              key={a.id}
              type="button"
              className={i === index ? "ss-dot on" : "ss-dot"}
              aria-label={`Show ${a.title}`}
              aria-pressed={i === index}
              onClick={() => setIndex(i)}
            />
          ))}
        </span>
      </div>

      <style>{`
        .ss { position: relative; }
        .ss-stage {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          background: var(--surface);
          border: 1px solid var(--line);
          overflow: hidden;
        }
        .ss-slide {
          position: absolute;
          inset: 0;
          display: block;
          opacity: 0;
          transition: opacity var(--dur-slow) var(--ease);
        }
        .ss-slide.on { opacity: 1; }
        .ss-slide img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .ss-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.5rem;
          font-size: var(--step--1);
          color: var(--ink-dim);
        }
        .ss-dots { display: flex; gap: 0.4rem; }
        .ss-dot {
          width: 1.5rem;
          height: 3px;
          padding: 0;
          border: 0;
          background: var(--line-strong);
          cursor: pointer;
          transition: background var(--dur-fast) var(--ease);
        }
        .ss-dot:hover { background: var(--ink-dim); }
        .ss-dot.on { background: var(--accent); }
      `}</style>
    </section>
  );
}

const gridStyles = `
  .ss-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: var(--gutter);
  }
  .ss-grid-item {
    display: block;
    border: 1px solid var(--line);
    line-height: 0;
    transition: border-color var(--dur-fast) var(--ease);
  }
  .ss-grid-item:hover,
  .ss-grid-item:focus-visible { border-color: var(--accent); }
  .ss-grid-item img {
    width: 100%;
    height: auto;
    display: block;
  }
`;
