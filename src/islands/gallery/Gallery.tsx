import { useEffect, useMemo, useState } from "react";
import type { Artwork } from "@/lib/art";
import type { Mode } from "@/data/config";
import { getMode, onModeChange } from "@/lib/mode";
import { filterByTags, tagCounts } from "@/lib/tags";
import TagFilter from "./TagFilter";
import Lightbox from "./Lightbox";

interface Props {
  /** SFW-only art, server-rendered into the page. */
  initialArt: Artwork[];
  /** JSON endpoint returning the full set (incl. explicit), fetched on opt-in. */
  fullEndpoint: string;
}

/*
  Booru-style gallery. SFW art arrives with the page; the explicit set is only
  fetched from `fullEndpoint` once the visitor is in (age-verified) NSFW mode,
  so explicit URLs never sit in the SFW HTML.
*/
export default function Gallery({ initialArt, fullEndpoint }: Props) {
  const [mode, setMode] = useState<Mode>("sfw");
  const [art, setArt] = useState<Artwork[]>(initialArt);
  const [fullLoaded, setFullLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    setMode(getMode());
    return onModeChange(setMode);
  }, []);

  // Lazy-load the explicit set the first time NSFW mode is active.
  useEffect(() => {
    if (mode !== "nsfw" || fullLoaded) return;
    let cancelled = false;
    fetch(fullEndpoint)
      .then((r) => r.json())
      .then((data: Artwork[]) => {
        if (cancelled) return;
        setArt(data);
        setFullLoaded(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [mode, fullLoaded, fullEndpoint]);

  // In SFW mode always show the SFW subset (even after NSFW was loaded once).
  const modeArt = useMemo(
    () => (mode === "nsfw" ? art : initialArt),
    [mode, art, initialArt]
  );

  const counts = useMemo(() => tagCounts(modeArt), [modeArt]);

  // The search box filters the tag list itself, not the artwork.
  const shownTags = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return counts;
    return counts.filter((t) => t.tag.toLowerCase().includes(q));
  }, [counts, query]);

  const shown = useMemo(
    () => filterByTags(modeArt, active),
    [modeArt, active]
  );

  function toggleTag(tag: string) {
    setActive((prev) => {
      const next = new Set(prev);
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });
  }

  const openIndex = shown.findIndex((a) => a.id === openId);
  const openArt = openIndex >= 0 ? shown[openIndex] : null;

  function nav(dir: -1 | 1) {
    if (openIndex < 0) return;
    const next = (openIndex + dir + shown.length) % shown.length;
    setOpenId(shown[next].id);
  }

  return (
    <div className="gallery">
      <aside className="gallery-filter">
        <TagFilter
          query={query}
          onQuery={setQuery}
          tags={shownTags}
          active={active}
          onToggleTag={toggleTag}
          onClear={() => setActive(new Set())}
          total={shown.length}
        />
      </aside>

      <div className="gallery-grid">
        {shown.length === 0 ? (
          <p className="empty mono caps">No art matches — try SHOW ALL.</p>
        ) : (
          shown.map((a) => (
            <button
              key={a.id}
              type="button"
              className="thumb"
              onClick={() => setOpenId(a.id)}
              aria-label={`Open ${a.title}`}
            >
              <img
                src={a.thumb}
                width={a.width}
                height={a.height}
                alt={a.title}
                loading="lazy"
                decoding="async"
              />
            </button>
          ))
        )}
      </div>

      {openArt && (
        <Lightbox art={openArt} onClose={() => setOpenId(null)} onNav={nav} />
      )}

      <style>{`
        .gallery {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: var(--gutter);
          align-items: start;
        }
        .gallery-filter {
          position: sticky; top: var(--gutter);
          height: calc(100dvh - var(--gutter) * 2);
          border-right: 1px solid var(--line);
          padding-right: var(--gutter);
        }
        .gallery-grid {
          column-count: 3;
          column-gap: var(--gutter);
        }
        :global([data-big-thumbs]) .gallery-grid { column-count: 2; }
        .thumb {
          display: block; width: 100%; padding: 0; margin: 0 0 var(--gutter);
          background: transparent; border: 1px solid var(--line);
          cursor: pointer; break-inside: avoid; line-height: 0;
          transition: border-color var(--dur-fast) var(--ease);
        }
        .thumb:hover, .thumb:focus-visible { border-color: var(--accent); }
        .thumb img { width: 100%; height: auto; display: block; }
        .empty { color: var(--ink-faint); }
        @media (max-width: 960px) {
          .gallery { grid-template-columns: 1fr; }
          .gallery-filter {
            position: static; height: auto;
            border-right: 0; border-bottom: 1px solid var(--line);
            padding: 0 0 var(--gutter);
          }
          .gallery-grid { column-count: 2; }
        }
        @media (max-width: 520px) {
          .gallery-grid, :global([data-big-thumbs]) .gallery-grid { column-count: 1; }
        }
      `}</style>
    </div>
  );
}
