import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
  Subtle line-art backdrop for the landing hero: a slowly rotating wireframe
  icosahedron drawn in the site accent color. Non-interactive; the wrapping
  element is pointer-events:none. Respects prefers-reduced-motion by rendering
  a single static frame with no rotation.
*/

/** Read the live --accent CSS variable (falls back to spring-green). */
function readAccent(): string {
  if (typeof document === "undefined") return "#4dffb0";
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue("--accent")
    .trim();
  return v || "#4dffb0";
}

interface WireframeProps {
  color: string;
  animate: boolean;
}

function Wireframe({ color, animate }: WireframeProps) {
  const group = useRef<THREE.Group>(null);

  // Edge geometry derived once from an icosahedron — thin, clean lines.
  const edges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.6, 0)),
    []
  );

  useEffect(() => {
    return () => edges.dispose();
  }, [edges]);

  useFrame((_state, delta) => {
    if (!animate || !group.current) return;
    group.current.rotation.y += delta * 0.12;
    group.current.rotation.x += delta * 0.05;
  });

  return (
    <group ref={group} rotation={[0.4, 0.6, 0]}>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={color} transparent opacity={0.55} />
      </lineSegments>
    </group>
  );
}

export default function HeroCanvas() {
  const [color, setColor] = useState<string>("#4dffb0");
  const [reduced, setReduced] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    setColor(readAccent());

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onMotion = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onMotion);

    // Track accent changes when the SFW/NSFW mode flips <html data-mode>.
    const observer = new MutationObserver(() => setColor(readAccent()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-mode"],
    });

    return () => {
      mq.removeEventListener("change", onMotion);
      observer.disconnect();
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="hero-canvas" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 5], fov: 45 }}
        frameloop={reduced ? "demand" : "always"}
        style={{ background: "transparent" }}
      >
        <Wireframe color={color} animate={!reduced} />
      </Canvas>

      <style>{`
        .hero-canvas {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.22;
          z-index: 0;
        }
      `}</style>
    </div>
  );
}
