import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ─── Constants ────────────────────────────────────────────────────────────────
export const GRAVITY = 0.15; // normalized gravity per second²
export const THRUST = 0.35;
export const ROTATE_SPEED = 2.5; // radians/sec
export const SHIP_R = 0.025;
export const SAFE_VELOCITY = 0.18; // max landing speed
export const SAFE_ANGLE = 0.4; // max angle deviation from vertical (radians)
export const FUEL_MAX = 100;

// Landing pad width
export const PAD_W = 0.12;

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Terrain {
  points: readonly { x: number; y: number }[];
  padStart: number; // index in points where pad begins
}

export interface LunarDescentState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number; // radians, 0=pointing up
  fuel: number;
  terrain: Terrain;
  score: number;
  lives: number;
  lost: boolean;
  won: boolean;
  landed: boolean;
  crashed: boolean;
  rngSeed: number;
  thrustOn: boolean;
  rotateLeft: boolean;
  rotateRight: boolean;
}

export type LunarDescentAction =
  | { type: "tick"; dt: number }
  | { type: "thrust-start" }
  | { type: "thrust-stop" }
  | { type: "rotate-left-start" }
  | { type: "rotate-left-stop" }
  | { type: "rotate-right-start" }
  | { type: "rotate-right-stop" }
  | { type: "next-attempt" };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildTerrain(seed: number): Terrain {
  const rng = mulberry32(seed);
  const points: { x: number; y: number }[] = [];
  const segs = 16;
  // Landing pad placed randomly between segment 5 and 11
  const padSeg = 5 + Math.floor(rng() * 7);

  for (let i = 0; i <= segs; i++) {
    const x = i / segs;
    let y: number;
    if (i === padSeg || i === padSeg + 1) {
      // Flat landing pad
      y = i === padSeg ? 0.65 + rng() * 0.2 : points[points.length - 1]!.y;
    } else {
      y = 0.55 + rng() * 0.35;
    }
    points.push({ x, y });
  }
  return { points, padStart: padSeg };
}

function segmentY(terrain: Terrain, x: number): number {
  const { points } = terrain;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]!;
    const b = points[i + 1]!;
    if (x >= a.x && x <= b.x) {
      const t = (x - a.x) / (b.x - a.x);
      return a.y + t * (b.y - a.y);
    }
  }
  return 1;
}

function isOnPad(terrain: Terrain, x: number): boolean {
  const { points, padStart } = terrain;
  const padLeft = points[padStart]!.x;
  const padRight = points[padStart + 1]!.x;
  return x >= padLeft && x <= padRight;
}

// ─── Initial state ────────────────────────────────────────────────────────────
export function initialState(seed: number): LunarDescentState {
  return {
    x: 0.5,
    y: 0.05,
    vx: 0,
    vy: 0,
    angle: 0,
    fuel: FUEL_MAX,
    terrain: buildTerrain(seed),
    score: 0,
    lives: 3,
    lost: false,
    won: false,
    landed: false,
    crashed: false,
    rngSeed: seed,
    thrustOn: false,
    rotateLeft: false,
    rotateRight: false,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function reducer(state: LunarDescentState, action: LunarDescentAction): LunarDescentState {
  switch (action.type) {
    case "thrust-start": return { ...state, thrustOn: true };
    case "thrust-stop": return { ...state, thrustOn: false };
    case "rotate-left-start": return { ...state, rotateLeft: true };
    case "rotate-left-stop": return { ...state, rotateLeft: false };
    case "rotate-right-start": return { ...state, rotateRight: true };
    case "rotate-right-stop": return { ...state, rotateRight: false };

    case "next-attempt": {
      if (!state.crashed && !state.landed) return state;
      const lives = state.crashed ? state.lives - 1 : state.lives;
      const lost = lives <= 0;
      if (state.won || lost) return { ...state, lives, lost };
      return {
        ...state,
        x: 0.5,
        y: 0.05,
        vx: (state.rngSeed % 7 - 3) * 0.03,
        vy: 0,
        angle: 0,
        fuel: FUEL_MAX,
        crashed: false,
        landed: false,
        lives,
        lost,
        thrustOn: false,
        rotateLeft: false,
        rotateRight: false,
      };
    }

    case "tick": {
      if (state.lost || state.won || state.landed || state.crashed) return state;
      const { dt } = action;

      let { x, y, vx, vy, angle, fuel, score } = state;
      let won: boolean = state.won;

      // Rotation
      if (state.rotateLeft) angle -= ROTATE_SPEED * dt;
      if (state.rotateRight) angle += ROTATE_SPEED * dt;

      // Thrust
      let thrustOn = state.thrustOn;
      if (thrustOn && fuel > 0) {
        vx += Math.sin(angle) * THRUST * dt;
        vy -= Math.cos(angle) * THRUST * dt;
        fuel -= dt * 20;
        if (fuel <= 0) { fuel = 0; thrustOn = false; }
      }

      // Gravity
      vy += GRAVITY * dt;

      // Move
      x += vx * dt;
      y += vy * dt;

      // Wrap horizontally
      if (x < 0) x = 1;
      if (x > 1) x = 0;

      // Terrain collision
      const terrainY = segmentY(state.terrain, x);
      let landed = false;
      let crashed = false;

      if (y + SHIP_R >= terrainY) {
        y = terrainY - SHIP_R;
        const onPad = isOnPad(state.terrain, x);
        const speed = Math.sqrt(vx * vx + vy * vy);
        const goodAngle = Math.abs(angle) < SAFE_ANGLE;

        if (onPad && speed <= SAFE_VELOCITY && goodAngle) {
          landed = true;
          const fuelBonus = Math.floor(fuel);
          score += 500 + fuelBonus * 5;
          // Win after 3 successful landings would need wave tracking — simplified: one landing wins
          won = true;
        } else {
          crashed = true;
        }
        vx = 0; vy = 0;
      }

      // Out of bounds top
      if (y < 0) { y = 0; vy = Math.abs(vy) * 0.5; }

      return {
        ...state,
        x, y, vx, vy, angle, fuel, score, won: won as boolean,
        landed, crashed, thrustOn,
      };
    }

    default:
      return state;
  }
}

// ─── Terminal ─────────────────────────────────────────────────────────────────
export function isTerminal(state: LunarDescentState): { score: number } | null {
  if (state.won) return { score: state.score + state.lives * 200 };
  if (state.lost) return { score: state.score };
  return null;
}
