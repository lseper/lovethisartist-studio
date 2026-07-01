import { useEffect, useRef } from "react";

interface Props {
  src: string;
  title: string;
}

/*
  Single HLS video player. Safari plays .m3u8 natively; everywhere else we
  lazy-load hls.js. No autoplay — init on mount and tear down on unmount.
*/
export default function VideoPlayer({ src, title }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Safari / iOS play HLS natively.
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      return;
    }

    let destroyed = false;
    let cleanup: (() => void) | undefined;

    import("hls.js").then(({ default: Hls }) => {
      if (destroyed || !videoRef.current) return;
      if (!Hls.isSupported()) return;
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
      cleanup = () => hls.destroy();
    });

    return () => {
      destroyed = true;
      cleanup?.();
    };
  }, [src]);

  return (
    <figure className="player">
      <figcaption className="caps player-title">{title}</figcaption>
      <video
        ref={videoRef}
        className="player-video"
        controls
        playsInline
        preload="none"
      />

      <style>{`
        .player { margin: 0; }
        .player-title {
          margin: 0 0 0.5rem;
          color: var(--ink-dim);
          font-size: var(--step--1);
        }
        .player-video {
          display: block;
          width: 100%;
          background: var(--surface);
          border: 1px solid var(--line-strong);
        }
      `}</style>
    </figure>
  );
}
