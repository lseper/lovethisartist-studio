import { useEffect, useState } from "react";
import { getMode, onModeChange } from "@/lib/mode";
import VideoPlayer from "@/islands/VideoPlayer";

/*
  NSFW-gated video gallery. In SFW mode it shows a quiet notice (no age-gate
  auto-prompt); in NSFW mode it mounts the explicit HLS supercuts.
*/

interface Stream {
  title: string;
  src: string;
}

const STREAMS: Stream[] = [
  {
    title: "2025 Yiff Supercut (3 hours)",
    src: "https://pub-954262b5aae944cfa078093111dfa0ea.r2.dev/curated/tmp/playlist.m3u8",
  },
  {
    title: "2025 Yiff Supercut (12 hours)",
    src: "https://pub-900e289458434f449b948325f6950e4c.r2.dev/full/playlist.m3u8",
  },
];

export default function StreamVault() {
  const [nsfw, setNsfw] = useState(false);

  useEffect(() => {
    setNsfw(getMode() === "nsfw");
    return onModeChange((mode) => setNsfw(mode === "nsfw"));
  }, []);

  if (!nsfw) {
    return (
      <p className="vault-notice">
        Explicit video is hidden — switch to NSFW to view.
        <style>{`
          .vault-notice {
            margin: 0;
            color: var(--ink-dim);
            font-size: var(--step-0);
          }
        `}</style>
      </p>
    );
  }

  return (
    <div className="vault">
      {STREAMS.map((stream) => (
        <VideoPlayer key={stream.src} src={stream.src} title={stream.title} />
      ))}

      <style>{`
        .vault {
          display: flex;
          flex-direction: column;
          gap: var(--gutter);
        }
      `}</style>
    </div>
  );
}
