import { useEffect, useState } from "react";
import {
  applyMode,
  getMode,
  isAgeVerified,
  markAgeVerified,
  onModeChange,
  requestMode,
} from "@/lib/mode";
import type { Mode } from "@/data/config";

/*
  Sidebar SFW/NSFW switch + the 18+ age gate.

  Switching into NSFW opens a full-screen affirmation gate the first time
  (mirrors the old carrd cookie gate). "Safe mode" keeps the visitor in SFW.
*/
export default function ModeControl() {
  const [mode, setMode] = useState<Mode>("sfw");
  const [gateOpen, setGateOpen] = useState(false);

  useEffect(() => {
    setMode(getMode());
    return onModeChange(setMode);
  }, []);

  useEffect(() => {
    if (!gateOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setGateOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [gateOpen]);

  function toggle(next: Mode) {
    if (next === mode) return;
    if (next === "nsfw" && !isAgeVerified()) {
      setGateOpen(true);
      return;
    }
    requestMode(next);
    setMode(next);
  }

  function affirm() {
    markAgeVerified();
    applyMode("nsfw");
    setMode("nsfw");
    setGateOpen(false);
  }

  const nsfw = mode === "nsfw";

  return (
    <div className="mode-control">
      <div
        className="switch caps"
        role="group"
        aria-label="Content mode"
      >
        <button
          type="button"
          className={!nsfw ? "seg on" : "seg"}
          aria-pressed={!nsfw}
          onClick={() => toggle("sfw")}
        >
          SFW
        </button>
        <button
          type="button"
          className={nsfw ? "seg on" : "seg"}
          aria-pressed={nsfw}
          onClick={() => toggle("nsfw")}
        >
          NSFW
        </button>
      </div>

      {gateOpen && (
        <div
          className="gate"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gate-title"
        >
          <div className="gate-scan" aria-hidden="true" />
          <div className="gate-mark font-display" aria-hidden="true">
            18+
          </div>
          <div className="gate-body">
            <h2 id="gate-title" className="font-display gate-heading">
              This content is explicit.
            </h2>
            <p className="gate-copy">
              By continuing you affirm you are{" "}
              <span className="warn">eighteen years</span> of age or older.
              Otherwise, use <span className="go">safe mode</span>.
            </p>
            <div className="gate-actions caps">
              <button type="button" className="btn-primary" onClick={affirm}>
                I am 18 or older — enter
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setGateOpen(false)}
              >
                Safe mode
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .mode-control { padding: 0.75rem var(--gutter); }
        .switch {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border: 1px solid var(--line-strong);
        }
        .seg {
          background: transparent;
          color: var(--ink-dim);
          border: 0;
          padding: 0.5rem 0;
          font: inherit;
          letter-spacing: var(--tracking-caps);
          cursor: pointer;
          transition: background var(--dur-fast) var(--ease),
            color var(--dur-fast) var(--ease);
        }
        .seg + .seg { border-left: 1px solid var(--line-strong); }
        .seg.on { background: var(--accent); color: var(--accent-ink); }
        .seg:not(.on):hover { color: var(--ink); }

        .gate {
          position: fixed;
          inset: 0;
          z-index: var(--z-gate);
          background: var(--paper);
          display: grid;
          place-items: center;
          overflow: hidden;
        }
        .gate-scan {
          position: absolute;
          inset: 0;
          height: 40%;
          background: linear-gradient(
            var(--accent) 0%,
            transparent 100%
          );
          opacity: 0.05;
          animation: gate-scan 3s var(--ease) infinite;
        }
        .gate-mark {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          font-size: var(--step-hero);
          color: transparent;
          -webkit-text-stroke: 2px var(--line-strong);
          user-select: none;
          pointer-events: none;
        }
        .gate-body {
          position: relative;
          max-width: 40ch;
          padding: var(--gutter);
          text-align: left;
        }
        .gate-heading { font-size: var(--step-3); margin: 0 0 0.75rem; }
        .gate-copy { color: var(--ink-dim); margin: 0 0 1.5rem; font-size: var(--step-1); }
        .warn { color: var(--warn); }
        .go { color: var(--go); }
        .gate-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; }
        .btn-primary {
          background: var(--accent);
          color: var(--accent-ink);
          border: 0;
          padding: 0.75rem 1.25rem;
          font: inherit;
          letter-spacing: var(--tracking-caps);
          cursor: pointer;
        }
        .btn-ghost {
          background: transparent;
          color: var(--go);
          border: 1px solid var(--line-strong);
          padding: 0.75rem 1.25rem;
          font: inherit;
          letter-spacing: var(--tracking-caps);
          cursor: pointer;
        }
        .btn-primary:hover { filter: brightness(1.1); }
        .btn-ghost:hover { border-color: var(--go); }
      `}</style>
    </div>
  );
}
