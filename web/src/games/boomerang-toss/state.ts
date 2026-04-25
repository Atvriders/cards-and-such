import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Boomerang Toss: throw a boomerang, aim it through rings, catch it on return.

export interface BoomerangTossSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface Ring {
  id: number;
  x: number; // normalized [0,1]
  y: number;
  radius: number;
  hit: boolean;
}

export interface BoomerangTossState {
  settings: BoomerangTossSettings;
  rngSeed: number;
  phase: "aim" | "flying" | "returning" | "caught" | "missed";
  angle: number;       // throw angle in degrees (0-180)
  power: number;       // throw power 0..1 (increases while held)
  boomerangX: number;
  boomerangY: number;
  boomerangAngle: number; // visual rotation
  t: number;           // flight parameter 0..1
  rings: readonly Ring[];
  score: number;
  throws: number;
  maxThrows: number;
  over: boolean;
}

export type BoomerangTossAction =
  | { type: "chargeStart" }
  | { type: "tick"; dt: number }
  | { type: "release" }
  | { type: "nextThrow" };

const NUM_RINGS = 3;
const RING_SPEED: Record<string, number> = { easy: 0.4, medium: 0.65, hard: 0.9 };

function rng2(seed: number): { val: number; next: number } {
  const r = mulberry32(seed);
  const val = r();
  const next = Math.floor(r() * 2 ** 31);
  return { val, next };
}

function generateRings(seed: number, count: number): { rings: Ring[]; nextSeed: number } {
  const rings: Ring[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    const r1 = rng2(s);
    s = r1.next;
    const r2 = rng2(s);
    s = r2.next;
    rings.push({
      id: i,
      x: 0.15 + r1.val * 0.7,
      y: 0.15 + r2.val * 0.55,
      radius: 0.07,
      hit: false,
    });
  }
  return { rings, nextSeed: s };
}

export function initialState(seed: number, settings: BoomerangTossSettings): BoomerangTossState {
  const { rings, nextSeed } = generateRings(seed, NUM_RINGS);
  return {
    settings,
    rngSeed: nextSeed,
    phase: "aim",
    angle: 90,
    power: 0,
    boomerangX: 0.5,
    boomerangY: 0.85,
    boomerangAngle: 0,
    t: 0,
    rings,
    score: 0,
    throws: 1,
    maxThrows: 5,
    over: false,
  };
}

// Boomerang path: parametric arc then return
function boomerangPos(t: number, throwAngle: number, _power: number): { x: number; y: number } {
  const rad = (throwAngle * Math.PI) / 180;
  const arcRadius = 0.38;
  // Outbound arc: t 0..0.5
  // Return arc: t 0.5..1
  const tau = t < 0.5 ? t * 2 : (1 - t) * 2;
  const cx = 0.5 + Math.sin(rad) * arcRadius * 0.5;
  const cy = 0.85 - Math.cos(rad) * arcRadius;
  const bx = 0.5 + Math.sin(rad + Math.PI * tau) * arcRadius * (1 - tau * 0.3);
  const by = cy + Math.cos(Math.PI * tau) * arcRadius * (1 - tau * 0.3);
  return { x: t < 0.5 ? bx : cx + (0.5 - cx) * (1 - tau), y: t < 0.5 ? by : 0.85 - (0.85 - by) * tau };
}

export function reducer(state: BoomerangTossState, action: BoomerangTossAction): BoomerangTossState {
  if (state.over) return state;

  switch (action.type) {
    case "chargeStart": {
      if (state.phase !== "aim") return state;
      return { ...state, power: 0 };
    }

    case "release": {
      if (state.phase !== "aim") return state;
      return { ...state, phase: "flying", t: 0 };
    }

    case "tick": {
      const { dt } = action;
      if (state.phase === "aim") {
        // Wobble angle
        const newPower = Math.min(1, state.power + dt * 0.8);
        return { ...state, power: newPower };
      }

      if (state.phase === "flying" || state.phase === "returning") {
        const speed = RING_SPEED[state.settings.difficulty] ?? 0.65;
        const newT = Math.min(1, state.t + dt * speed);
        const pos = boomerangPos(newT, state.angle, state.power);

        // Check ring hits
        let rings = state.rings as Ring[];
        let scoreAdd = 0;
        rings = rings.map((ring) => {
          if (ring.hit) return ring;
          const dx = pos.x - ring.x;
          const dy = pos.y - ring.y;
          if (Math.sqrt(dx * dx + dy * dy) < ring.radius + 0.025) {
            scoreAdd += 50;
            return { ...ring, hit: true };
          }
          return ring;
        });

        const newAngle = state.boomerangAngle + 360 * dt * 3;

        if (newT >= 1) {
          // Catch window: if back at start, caught
          const caught = true;
          const bonusScore = caught ? 20 : 0;
          const totalScore = state.score + scoreAdd + bonusScore;
          const isLastThrow = state.throws >= state.maxThrows;
          return {
            ...state,
            rings,
            boomerangX: 0.5,
            boomerangY: 0.85,
            boomerangAngle: newAngle,
            t: 1,
            phase: "caught",
            score: totalScore,
            over: isLastThrow,
          };
        }

        return {
          ...state,
          rings,
          boomerangX: pos.x,
          boomerangY: pos.y,
          boomerangAngle: newAngle,
          t: newT,
          phase: newT < 0.5 ? "flying" : "returning",
          score: state.score + scoreAdd,
        };
      }

      return state;
    }

    case "nextThrow": {
      if (state.phase !== "caught" && state.phase !== "missed") return state;
      if (state.throws >= state.maxThrows) return { ...state, over: true };
      const { rings: newRings, nextSeed } = generateRings(state.rngSeed, NUM_RINGS);
      return {
        ...state,
        rngSeed: nextSeed,
        phase: "aim",
        angle: 90,
        power: 0,
        boomerangX: 0.5,
        boomerangY: 0.85,
        boomerangAngle: 0,
        t: 0,
        rings: newRings,
        throws: state.throws + 1,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: BoomerangTossState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
