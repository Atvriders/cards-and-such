import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ─── Helicopter Game ──────────────────────────────────────────────────────────
// Hold to rise, release to fall. Avoid cave walls. Distance = score.

export interface HelicopterSettings {}

export interface Wall {
  id: number;
  x: number;      // [0,1] horizontal, moves left
  topH: number;   // height of top wall [0, ~0.5]
  botH: number;   // height of bottom wall [0, ~0.5]
}

export interface HelicopterState {
  settings: HelicopterSettings;
  heliY: number;    // [0,1] vertical, 0=top, 1=bottom
  heliVy: number;   // positive = falling
  holding: boolean;
  walls: readonly Wall[];
  distance: number;
  over: boolean;
  rngSeed: number;
  nextId: number;
  nextWallX: number;
}

export type HelicopterAction =
  | { type: "tick"; dt: number }
  | { type: "hold"; on: boolean };

// ─── Constants ────────────────────────────────────────────────────────────────
const GRAVITY = 1.8;
const LIFT = -2.8;
const WALL_SPEED = 0.35;
const WALL_WIDTH = 0.05;
const WALL_SPACING = 0.2;
const GAP_MIN = 0.28;
const GAP_MAX = 0.42;
const TOP_MIN = 0.05;
const TOP_MAX = 0.4;
const HELI_X = 0.15;
const HELI_W = 0.06;
const HELI_H = 0.05;

function rng2(seed: number): { val: number; next: number } {
  const r = mulberry32(seed);
  const val = r();
  const next = Math.floor(r() * 2 ** 31);
  return { val, next };
}

export function initialState(seed: number, settings: HelicopterSettings): HelicopterState {
  return {
    settings,
    heliY: 0.4,
    heliVy: 0,
    holding: false,
    walls: [],
    distance: 0,
    over: false,
    rngSeed: seed,
    nextId: 1,
    nextWallX: 1.0,
  };
}

export function reducer(state: HelicopterState, action: HelicopterAction): HelicopterState {
  if (state.over) return state;

  switch (action.type) {
    case "hold":
      return { ...state, holding: action.on };

    case "tick": {
      const { dt } = action;
      const accel = state.holding ? LIFT : GRAVITY;
      const heliVy = state.heliVy + accel * dt;
      const heliY = Math.max(0, Math.min(1, state.heliY + heliVy * dt));

      // Ceiling/floor collision
      if (heliY <= HELI_H / 2 || heliY >= 1 - HELI_H / 2) {
        return { ...state, heliY, heliVy, over: true };
      }

      // Move walls left
      let walls = (state.walls as Wall[]).map((w) => ({ ...w, x: w.x - WALL_SPEED * dt }));

      // Spawn new walls
      let nextWallX = state.nextWallX - WALL_SPEED * dt;
      let rngSeed = state.rngSeed;
      let nextId = state.nextId;

      if (nextWallX <= 0.9) {
        const r1 = rng2(rngSeed);
        rngSeed = r1.next;
        const r2 = rng2(rngSeed);
        rngSeed = r2.next;
        const r3 = rng2(rngSeed);
        rngSeed = r3.next;
        const gap = GAP_MIN + r1.val * (GAP_MAX - GAP_MIN);
        const topH = TOP_MIN + r2.val * (TOP_MAX - TOP_MIN);
        const botH = 1 - topH - gap;
        walls = [...walls, { id: nextId++, x: 1.05, topH: Math.max(0.05, topH), botH: Math.max(0.05, botH) }];
        nextWallX = WALL_SPACING;
      }

      walls = walls.filter((w) => w.x > -WALL_WIDTH - 0.05);

      // Collision with walls
      const heliLeft = HELI_X;
      const heliRight = HELI_X + HELI_W;
      const heliTop = heliY - HELI_H / 2;
      const heliBot = heliY + HELI_H / 2;
      let over = false;
      for (const w of walls) {
        if (heliRight > w.x && heliLeft < w.x + WALL_WIDTH) {
          if (heliTop < w.topH || heliBot > 1 - w.botH) {
            over = true;
            break;
          }
        }
      }

      const distance = state.distance + WALL_SPEED * dt;

      return { ...state, heliY, heliVy, walls, distance, over, rngSeed, nextId, nextWallX };
    }

    default:
      return state;
  }
}

export function isTerminal(state: HelicopterState): { score: number } | null {
  if (state.over) return { score: Math.floor(state.distance * 100) };
  return null;
}
