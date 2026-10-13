import type { Rotation } from "@/data/rotations";

interface Props {
  src: string;
  alt: string;
  /** Displayed (post-rotation) dimensions. */
  width: number;
  height: number;
  rotate?: Rotation;
  className?: string;
  loading?: "lazy" | "eager";
  decoding?: "async" | "sync" | "auto";
}

/*
  <img> that displays its source turned by `rotate` degrees clockwise.

  Quarter turns swap the layout box: a wrapper takes the displayed aspect
  ratio (and whatever size the caller's CSS gives it), and the image is sized
  to the swapped box via container units, then rotated into place. With
  no rotation it's a plain <img>, so callers' existing styles apply unchanged.
*/
export default function RotatedImg({
  src,
  alt,
  width,
  height,
  rotate = 0,
  className,
  loading,
  decoding,
}: Props) {
  if (rotate === 0 || rotate === 180) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={loading}
        decoding={decoding}
        style={rotate ? { transform: "rotate(180deg)" } : undefined}
      />
    );
  }

  return (
    <span
      className={className ? `rimg ${className}` : "rimg"}
      style={
        {
          "--ar": `${width / height}`,
          "--rot": `${rotate}deg`,
        } as React.CSSProperties
      }
    >
      <img
        src={src}
        alt={alt}
        width={height}
        height={width}
        className="rimg-img"
        loading={loading}
        decoding={decoding}
      />
      <style>{`
        .rimg {
          display: block;
          position: relative;
          aspect-ratio: var(--ar);
          container-type: size;
          overflow: hidden;
        }
        .rimg > img.rimg-img {
          position: absolute;
          top: 50%; left: 50%;
          width: 100cqh; height: 100cqw;
          max-width: none; max-height: none;
          margin: 0; border: 0;
          object-fit: cover;
          transform: translate(-50%, -50%) rotate(var(--rot));
        }
      `}</style>
    </span>
  );
}
