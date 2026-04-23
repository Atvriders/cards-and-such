import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ─── Meteor Dodger ────────────────────────────────────────────────────────────
// Ship moves in 8 directions. Meteors fall from top. Dodge as long as possible.

export interface MeteorDodgerSettings {}

export interface Meteor {
  id: number;
  x: number;    // [0,1]
  y: number;    // [0,1]
  r: number;    // radius [0,1]
  vy: number;   // fall speed
}

export interface MeteorDodgerState {
  settings: MeteorDodgerSettings;
  shipX: number;   // [0,1]
  shipY: number;   // [0,1]
  dx: -1 | 0 | 1;
  dy: -1 | 0 | 1;
  meteors: readonly Meteor[];
  elapsed: number;  // time survived = score
  over: boolean;
  rngSeed: number;
  nextId: number;
  spawnTimer: number;
}

export type MeteorDodgerAction =
  | { type: "tick"; dt: number }
  | { type: "move"; dx: -1 | 0 | 1; dy: -1 | 0 | 1 };

// ─── Constants ────────────────────────────────────────────────────────────────
const SHIP_SPEED = 0.55;
const SHIP_R = 0.025;
const METEOR_R_MIN = 0.018;
const METEOR_R_MAX = 0.045;
const METEOR_VY_MIN = 0.2;
const METEOR_VY_MAX = 0.55;
const SPAWN_INTERVAL_BASE = 0.9;
const SPAWN_INTERVAL_MIN = 0.35;

function rng2(seed: number): { val: number; next: number } {
  const r = mulberry32(seed);
  const val = r();
  const next = Math.floor(r() * 2 ** 31);
  return { val, next };
}

export function initialState(seed: number, settings: MeteorDodgerSettings): MeteorDodgerState {
  return {
    settings,
    shipX: 0.5,
    shipY: 0.75,
    dx: 0,
    dy: 0,
    meteors: [],
    elapsed: 0,
    over: false,
    rngSeed: seed,
    nextId: 1,
    spawnTimer: 0,
  };
}

export function reducer(state: MeteorDodgerState, action: MeteorDodgerAction): MeteorDodgerState {
  if (state.over) return state;

  switch (action.type) {
    case "move":
      return { ...state, dx: action.dx, dy: action.dy };

    case "tick": {
      const { dt } = action;
      const elapsed = state.elapsed + dt;

      // Move ship
      const diag = state.dx !== 0 && state.dy !== 0 ? 0.707 : 1;
      const shipX = Math.max(SHIP_R, Math.min(1 - SHIP_R, state.shipX + state.dx * SHIP_SPEED * dt * diag));
      const shipY = Math.max(SHIP_R, Math.min(1 - SHIP_R, state.shipY + state.dy * SHIP_SPEED * dt * diag));

      // Move meteors
      let meteors = (state.meteors as Meteor[]).map((m) => ({ ...m, y: m.y + m.vy * dt }));
      meteors = meteors.filter((m) => m.y < 1 + m.r + 0.05);

      // Spawn meteors
      let spawnTimer = state.spawnTimer - dt;
      let rngSeed = state.rngSeed;
      let nextId = state.nextId;
      const spawnInterval = Math.max(SPAWN_INTERVAL_MIN, SPAWN_INTERVAL_BASE - elapsed * 0.04);

      if (spawnTimer <= 0) {
        const r1 = rng2(rngSeed);
        rngSeed = r1.next;
        const r2 = rng2(rngSeed);
        rngSeed = r2.next;
        const r3 = rng2(rngSeed);
        rngSeed = r3.next;
        const r4 = rng2(rngSeed);
        rngSeed = r4.next;
        const mx = r1.val;
        const mr = METEOR_R_MIN + r2.val * (METEOR_R_MAX - METEOR_R_MIN);
        const mvy = METEOR_VY_MIN + r3.val * (METEOR_VY_MAX - METEOR_VY_MIN);
        meteors = [...meteors, { id: nextId++, x: mx, y: -mr, r: mr, vy: mvy }];
        spawnTimer = spawnInterval;
      }

      // Collision
      let over = false;
      for (const m of meteors) {
        const dx = m.x - shipX;
        const dY = m.y - shipY;
        const dist2 = dx * dx + dY * dY;
        const radSum = m.r + SHIP_R;
        if (dist2 < radSum * radSum) { over = true; break; }
      }

      return { ...state, shipX, shipY, meteors, elapsed, over, rngSeed, nextId, spawnTimer };
    }

    default:
      return state;
  }
}

export function isTerminal(state: MeteorDodgerState): { score: number } | null {
  if (state.over) return { score: Math.floor(state.elapsed) };
  return null;
}
