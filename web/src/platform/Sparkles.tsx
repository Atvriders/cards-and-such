import { useEffect, useState } from "react";

/**
 * Sparkles — subtle particle burst on key user actions.
 *
 * Fires 6–12 small star particles from a click point. Each particle floats
 * outward, rotates slightly, and fades over ~600ms via a single CSS keyframe.
 * No JS frame loop — animation is pure CSS, particles are unmounted via a
 * single setTimeout when the burst completes.
 *
 * Public API:
 *   - <SparkleHost /> — mount once near the app root
 *   - emitSparkles(x, y) — imperative trigger from any handler
 *   - prefers-reduced-motion is respected (no-op when reduced)
 */

interface Burst {
  id: number;
  x: number;
  y: number;
  particles: Particle[];
}

interface Particle {
  /** Final outward translation in px (x, y). */
  dx: number;
  dy: number;
  /** Particle size in px. */
  size: number;
  /** Final rotation in degrees. */
  rotate: number;
  /** Color tone — gold/white blend feels generic but warm. */
  color: string;
  /** Slight stagger so the burst doesn't feel mechanical. */
  delay: number;
}

const DURATION_MS = 600;
const MIN_PARTICLES = 6;
const MAX_PARTICLES = 12;
const COLORS = ["#fde68a", "#fcd34d", "#fef3c7", "#ffffff", "#fbbf24"];

let nextId = 1;
type Listener = (burst: Burst) => void;
const listeners = new Set<Listener>();

function reducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function makeParticles(): Particle[] {
  const count = MIN_PARTICLES + Math.floor(Math.random() * (MAX_PARTICLES - MIN_PARTICLES + 1));
  const out: Particle[] = [];
  for (let i = 0; i < count; i++) {
    // Even angular distribution with jitter so the burst looks natural.
    const baseAngle = (i / count) * Math.PI * 2;
    const angle = baseAngle + (Math.random() - 0.5) * 0.6;
    const distance = 24 + Math.random() * 36;
    out.push({
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance - 6, // slight upward bias ("float")
      size: 6 + Math.random() * 6,
      rotate: (Math.random() - 0.5) * 240,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      delay: Math.random() * 80,
    });
  }
  return out;
}

/**
 * Fire a sparkle burst at the given client coordinates. No-op when
 * prefers-reduced-motion is set or when SparkleHost isn't mounted.
 */
export function emitSparkles(x: number, y: number): void {
  if (reducedMotion()) return;
  const burst: Burst = {
    id: nextId++,
    x,
    y,
    particles: makeParticles(),
  };
  for (const fn of listeners) fn(burst);
}

/**
 * Convenience: derive a click point from a MouseEvent / React MouseEvent.
 */
export function emitSparklesFromEvent(
  e: { clientX: number; clientY: number } | undefined | null,
): void {
  if (!e) return;
  emitSparkles(e.clientX, e.clientY);
}

/**
 * Mount once near the root of the app. Listens for emit() calls and renders
 * any active bursts as a fixed-position overlay above the page content.
 */
export function SparkleHost(): JSX.Element | null {
  const [bursts, setBursts] = useState<Burst[]>([]);

  useEffect(() => {
    const fn: Listener = (b) => {
      setBursts((prev) => [...prev, b]);
      // Pure timer cleanup — no rAF / no per-frame work.
      window.setTimeout(() => {
        setBursts((prev) => prev.filter((x) => x.id !== b.id));
      }, DURATION_MS + 120);
    };
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);

  if (bursts.length === 0) return null;

  return (
    <div
      data-testid="sparkle-host"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1100,
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes sparkle-pop {
          0% {
            transform: translate3d(-50%, -50%, 0) scale(0.4) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          60% {
            opacity: 1;
          }
          100% {
            transform: translate3d(
              calc(-50% + var(--sparkle-dx, 0px)),
              calc(-50% + var(--sparkle-dy, 0px)),
              0
            ) scale(0.6) rotate(var(--sparkle-rot, 0deg));
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .sparkle-particle { display: none !important; }
        }
      `}</style>
      {bursts.map((b) =>
        b.particles.map((p, i) => (
          <span
            key={`${b.id}-${i}`}
            className="sparkle-particle"
            style={{
              position: "absolute",
              left: `${b.x}px`,
              top: `${b.y}px`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              color: p.color,
              animation: `sparkle-pop ${DURATION_MS}ms ${p.delay}ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards`,
              willChange: "transform, opacity",
              ["--sparkle-dx" as string]: `${p.dx}px`,
              ["--sparkle-dy" as string]: `${p.dy}px`,
              ["--sparkle-rot" as string]: `${p.rotate}deg`,
            } as React.CSSProperties}
          >
            {/* 4-point star — small inline SVG so we don't depend on an icon set */}
            <svg
              viewBox="0 0 24 24"
              width="100%"
              height="100%"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
            </svg>
          </span>
        )),
      )}
    </div>
  );
}

export default SparkleHost;
