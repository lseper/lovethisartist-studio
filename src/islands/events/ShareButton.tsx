import { useState } from "react";
import { copyText } from "@/lib/clipboard";

/*
  Share an event. Uses the native share sheet when available (great on mobile),
  otherwise copies the event URL to the clipboard. The shared URL points at the
  static /events/{slug} page, which carries Open Graph tags so platforms like
  Bluesky, Twitter/X, and Telegram render it as a link card.
*/
interface Props {
  title: string;
  text: string;
  url: string;
}

export default function ShareButton({ title, text, url }: Props) {
  const [copied, setCopied] = useState(false);

  async function onShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        // User dismissed the sheet — don't fall back to a copy.
        if ((err as Error)?.name === "AbortError") return;
      }
    }
    const ok = await copyText(url);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  }

  return (
    <button
      type="button"
      className="share caps"
      onClick={onShare}
      aria-label="Share this event"
    >
      <span aria-hidden="true">↗</span> {copied ? "Copied" : "Share"}
      <style>{`
        .share {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: transparent;
          color: var(--ink-dim);
          border: 1px solid var(--line-strong);
          padding: 0.7rem 1.1rem;
          font: inherit;
          font-size: var(--step--1);
          letter-spacing: var(--tracking-caps);
          text-transform: uppercase;
          cursor: pointer;
          transition: color var(--dur-fast) var(--ease),
            border-color var(--dur-fast) var(--ease);
        }
        .share:hover {
          color: var(--ink);
          border-color: var(--ink-dim);
        }
      `}</style>
    </button>
  );
}
