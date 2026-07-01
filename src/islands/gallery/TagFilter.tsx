import { useState } from "react";
import type { TagCount } from "@/lib/tags";

interface Props {
  query: string;
  onQuery: (q: string) => void;
  tags: TagCount[];
  active: Set<string>;
  onToggleTag: (tag: string) => void;
  onClear: () => void;
  total: number;
}

/** r3drunner-style search + dash-prefixed tag list with counts. */
export default function TagFilter({
  query,
  onQuery,
  tags,
  active,
  onToggleTag,
  onClear,
  total,
}: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="filter">
      <div className="search">
        <input
          type="search"
          className="search-input mono caps"
          placeholder="SEARCH"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          aria-label="Filter tags"
        />
        <span className="search-icon" aria-hidden="true">
          ⌕
        </span>
      </div>

      <button
        type="button"
        className={open ? "filter-toggle mono caps on" : "filter-toggle mono caps"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>Tags</span>
        <span className="caret" aria-hidden="true">
          ⌄
        </span>
      </button>

      <div className={open ? "tags-wrap open" : "tags-wrap"}>
        <ul className="tags">
          <li>
            <button
              type="button"
              className={active.size === 0 ? "tag show-all on" : "tag show-all"}
              onClick={onClear}
            >
              SHOW ALL
            </button>
          </li>
          {tags.map((t) => (
            <li key={t.tag}>
              <button
                type="button"
                className={active.has(t.tag) ? "tag on" : "tag"}
                aria-pressed={active.has(t.tag)}
                onClick={() => onToggleTag(t.tag)}
              >
                <span className="count mono">{t.count}</span>
                <span className="name">{t.tag}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="result mono caps">{total} shown</p>

      <style>{`
        .filter { display: flex; flex-direction: column; height: 100%; position: relative; }
        .search { position: relative; margin-bottom: 0.75rem; }
        .search-input {
          width: 100%;
          background: transparent;
          border: 0;
          border-bottom: 1px solid var(--line-strong);
          color: var(--ink);
          padding: 0.4rem 1.5rem 0.4rem 0;
          font-size: var(--step--1);
          letter-spacing: var(--tracking-caps);
        }
        .search-input::placeholder { color: var(--ink-faint); }
        .search-icon {
          position: absolute; right: 0; top: 50%;
          transform: translateY(-50%); color: var(--ink-faint);
        }
        .filter-toggle { display: none; }
        .tags-wrap { flex: 1; min-height: 0; overflow-y: auto; }
        .tags { list-style: none; margin: 0; padding: 0; }
        .tag {
          display: flex; gap: 0.5rem; width: 100%;
          background: transparent; border: 0; color: var(--ink);
          padding: 0.12rem 0; font: inherit; cursor: pointer; text-align: left;
          text-transform: uppercase; letter-spacing: var(--tracking-caps);
          font-size: var(--step--1);
        }
        .tag::before { content: "–"; color: var(--ink-faint); }
        .show-all::before { content: ""; }
        .show-all { color: var(--accent); }
        .tag:hover .name { color: var(--accent); }
        .tag.on { color: var(--accent); }
        .count { color: var(--ink-faint); min-width: 2.5em; }
        :global([data-hide-tag-counts]) .count { display: none; }
        .result { margin: 0.75rem 0 0; color: var(--ink-faint); font-size: var(--step--1); }
        @media (max-width: 960px) {
          .filter { height: auto; }
          .filter-toggle {
            display: flex; align-items: center; justify-content: space-between;
            width: 100%; margin-top: 0.5rem;
            background: transparent; border: 0;
            border-bottom: 1px solid var(--line-strong);
            color: var(--ink); font-size: var(--step--1); cursor: pointer;
            padding: 0.4rem 0; letter-spacing: var(--tracking-caps);
          }
          .filter-toggle .caret {
            transition: transform var(--dur-fast) var(--ease);
          }
          .filter-toggle.on .caret { transform: rotate(180deg); }
          .tags-wrap {
            display: none;
            position: absolute; left: 0; right: 0; top: 100%;
            z-index: var(--z-overlay);
            max-height: 70dvh;
            margin-top: -1px;
            padding: var(--gutter);
            background: color-mix(in srgb, var(--paper) 80%, transparent);
            backdrop-filter: blur(3px);
            border: 1px solid var(--line);
          }
          .tags-wrap.open { display: block; }
        }
      `}</style>
    </div>
  );
}
