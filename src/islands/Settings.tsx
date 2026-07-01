import { useEffect, useState } from "react";

/*
  Minimal "technical software" settings panel, in the spirit of r3drunner's
  SETTINGS. Toggles persist to localStorage and flip data-* flags on <html>
  that CSS can key off. Kept intentionally small; extend by adding to FLAGS.
*/
const FLAGS = [
  { key: "reduce-motion", label: "reduce motion" },
  { key: "hide-tag-counts", label: "hide tag counts" },
  { key: "big-thumbs", label: "large thumbnails" },
] as const;

type FlagKey = (typeof FLAGS)[number]["key"];

function read(key: FlagKey): boolean {
  return localStorage.getItem(`lta:${key}`) === "1";
}

export default function Settings() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initial: Record<string, boolean> = {};
    for (const f of FLAGS) {
      initial[f.key] = read(f.key);
      document.documentElement.toggleAttribute(`data-${f.key}`, initial[f.key]);
    }
    setState(initial);
  }, []);

  function toggle(key: FlagKey) {
    const next = !state[key];
    localStorage.setItem(`lta:${key}`, next ? "1" : "0");
    document.documentElement.toggleAttribute(`data-${key}`, next);
    setState((s) => ({ ...s, [key]: next }));
  }

  return (
    <div className="settings">
      <button
        type="button"
        className="settings-toggle caps"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span aria-hidden="true">⚙</span> settings
      </button>
      {open && (
        <ul className="settings-list">
          {FLAGS.map((f) => (
            <li key={f.key}>
              <label className="opt">
                <input
                  type="checkbox"
                  checked={state[f.key] ?? false}
                  onChange={() => toggle(f.key)}
                />
                <span className="dash-item">{f.label}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
      <style>{`
        .settings { border-top: 1px solid var(--line); }
        .settings-toggle {
          width: 100%;
          text-align: left;
          background: transparent;
          border: 0;
          color: var(--ink-dim);
          padding: 0.6rem var(--gutter);
          font: inherit;
          letter-spacing: var(--tracking-caps);
          cursor: pointer;
        }
        .settings-toggle:hover { color: var(--ink); }
        .settings-list {
          list-style: none;
          margin: 0;
          padding: 0 var(--gutter) 0.75rem;
          font-size: var(--step--1);
        }
        .opt {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.2rem 0;
          color: var(--ink-dim);
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: var(--tracking-caps);
        }
        .opt:hover { color: var(--ink); }
        .opt input { accent-color: var(--accent); }
      `}</style>
    </div>
  );
}
