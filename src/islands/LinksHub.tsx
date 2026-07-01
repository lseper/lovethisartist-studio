import { useEffect, useState } from "react";
import { getMode, onModeChange } from "@/lib/mode";
import { copyText } from "@/lib/clipboard";
import { EMAIL, linksForMode } from "@/data/socials";
import type { LinkGroup, SocialLink } from "@/data/socials";

/*
  Socials hub. SFW links render server-side (default mode); NSFW-only links
  appear reactively once the visitor switches to NSFW. Mirrors the old carrd
  ART / STREAM / SOCIAL / NSFW / SUPPORT sections, plus a copy-email row.
*/

const GROUP_ORDER: LinkGroup[] = ["art", "stream", "social", "nsfw", "support"];

const GROUP_HEADINGS: Record<LinkGroup, string> = {
  art: "ART",
  stream: "STREAMS",
  social: "CONTACT",
  nsfw: "NSFW",
  support: "SUPPORT",
};

export default function LinksHub() {
  const [nsfw, setNsfw] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setNsfw(getMode() === "nsfw");
    return onModeChange((mode) => setNsfw(mode === "nsfw"));
  }, []);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);

  async function onCopy() {
    const ok = await copyText(EMAIL);
    if (ok) setCopied(true);
  }

  const links = linksForMode(nsfw);
  const grouped: Record<LinkGroup, SocialLink[]> = {
    art: [],
    stream: [],
    social: [],
    nsfw: [],
    support: [],
  };
  for (const link of links) grouped[link.group].push(link);

  return (
    <div className="links-hub">
      {GROUP_ORDER.map((group) => {
        const items = grouped[group];
        if (items.length === 0) return null;
        return (
          <section className="group" key={group}>
            <h2 className="caps group-head">{GROUP_HEADINGS[group]}</h2>
            <ul className="link-list">
              {items.map((link) => (
                <li className="link-item" key={link.url}>
                  <a
                    className="link-line link-anchor"
                    href={link.url}
                    target="_blank"
                    rel="noopener"
                  >
                    <span className="link-label">{link.label}</span>
                    <span className="link-handle mono">{link.handle}</span>
                    {link.nsfw && <span className="tag-18 caps">18+</span>}
                  </a>
                  {link.note && <p className="link-note">{link.note}</p>}
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <section className="group">
        <h2 className="caps group-head">EMAIL</h2>
        <div className="email-row">
          <span className="link-handle mono">{EMAIL}</span>
          <button
            type="button"
            className="copy-btn caps"
            onClick={onCopy}
            aria-live="polite"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </section>

      <style>{`
        .links-hub {
          display: flex;
          flex-direction: column;
          gap: var(--gutter);
        }
        .group-head {
          margin: 0 0 0.5rem;
          color: var(--accent);
          font-size: var(--step--1);
        }
        .link-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
        }
        .link-item {
          padding: 0.35rem 0;
          border-top: 1px solid var(--line);
        }
        .link-item:first-child { border-top: 0; }
        .link-anchor {
          display: inline-flex;
          align-items: baseline;
          gap: 0.6rem;
          color: var(--ink);
        }
        .link-label { font-size: var(--step-1); }
        .link-handle {
          color: var(--ink-dim);
          font-size: var(--step--1);
        }
        .tag-18 {
          color: var(--accent);
          font-size: var(--step--1);
          border: 1px solid var(--accent);
          padding: 0 0.25rem;
          line-height: 1.4;
        }
        .link-note {
          margin: 0.15rem 0 0;
          color: var(--ink-faint);
          font-size: var(--step--1);
        }
        .email-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .copy-btn {
          background: transparent;
          color: var(--accent);
          border: 1px solid var(--line-strong);
          padding: 0.35rem 0.9rem;
          font: inherit;
          font-size: var(--step--1);
          letter-spacing: var(--tracking-caps);
          cursor: pointer;
          transition: border-color var(--dur-fast) var(--ease),
            color var(--dur-fast) var(--ease);
        }
        .copy-btn:hover { border-color: var(--accent); }
      `}</style>
    </div>
  );
}
