import { useEffect, useMemo } from "react";

const COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
  "#a855f7", // purple
  "#ec4899", // pink
];

const PARTICLE_COUNT_MAX = 80;
const PARTICLE_COUNT_MIN = 60;
const DURATION_MS = 3000;

/**
 * Scale particle count by viewport. Tiny screens (phones) get the minimum;
 * desktop/large get the cap. Animation is pure CSS keyframes — no rAF or
 * setInterval — so cost is GPU compositor work plus N DOM nodes.
 */
function pickParticleCount(): number {
  if (typeof window === "undefined") return PARTICLE_COUNT_MIN;
  const w = window.innerWidth || 1024;
  if (w < 480) return PARTICLE_COUNT_MIN;
  if (w < 1024) return Math.round((PARTICLE_COUNT_MIN + PARTICLE_COUNT_MAX) / 2);
  return PARTICLE_COUNT_MAX;
}

interface Particle {
  left: number;
  top: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  rotate: number;
  drift: number;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function generateParticles(): Particle[] {
  const count = pickParticleCount();
  const out: Particle[] = [];
  for (let i = 0; i < count; i++) {
    // Half from top edge, quarter each from left/right edges
    const edge = Math.random();
    let left: number;
    let top: number;
    if (edge < 0.5) {
      left = Math.random() * 100;
      top = -5 - Math.random() * 10;
    } else if (edge < 0.75) {
      left = -5 - Math.random() * 5;
      top = Math.random() * 30;
    } else {
      left = 100 + Math.random() * 5;
      top = Math.random() * 30;
    }
    out.push({
      left,
      top,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      size: 6 + Math.random() * 8,
      delay: Math.random() * 600,
      duration: 1800 + Math.random() * 1200,
      rotate: Math.random() * 720 - 360,
      drift: Math.random() * 40 - 20,
    });
  }
  return out;
}

export interface ConfettiProps {
  onDone?: () => void;
}

export function Confetti({ onDone }: ConfettiProps): JSX.Element | null {
  const reduced = useMemo(() => prefersReducedMotion(), []);
  const particles = useMemo(() => (reduced ? [] : generateParticles()), [reduced]);

  useEffect(() => {
    if (reduced) {
      onDone?.();
      return;
    }
    const t = setTimeout(() => {
      onDone?.();
    }, DURATION_MS);
    return () => clearTimeout(t);
  }, [reduced, onDone]);

  if (reduced) return null;

  return (
    <div
      data-testid="confetti"
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 1000,
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translate3d(var(--confetti-drift, 0px), 110vh, 0) rotate(var(--confetti-rotate, 360deg));
            opacity: 0;
          }
        }
      `}</style>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: `${p.top}vh`,
            width: `${p.size}px`,
            height: `${p.size * 0.4}px`,
            backgroundColor: p.color,
            borderRadius: "2px",
            animation: `confetti-fall ${p.duration}ms ${p.delay}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
            ["--confetti-drift" as string]: `${p.drift}vw`,
            ["--confetti-rotate" as string]: `${p.rotate}deg`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

export default Confetti;
