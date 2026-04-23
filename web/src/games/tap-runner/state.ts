import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ─── Tap Runner ───────────────────────────────────────────────────────────────
// One-tap runner. Tap = jump. Hold = glide (reduced gravity). Obstacles approach.

export interface TapRunnerSettings {}

export type ObstacleKind = "low" | "tall" | "gap";

export interface TapRunnerObstacle {
  id: number;
  x: number;           // [0,1]
  kind: ObstacleKind;
  w: number;           // width [0,1]
  h: number;           // height [0,1]
}

export interface TapRunnerState {
  settings: TapRunnerSettings;
  playerY: number;     // 0 = ground, positive = up
  playerVy: number;
  holding: boolean;    // holding tap = glide
  obstacles: readonly TapRunnerObstacle[];
  distance: number;
  speed: number;
  over: boolean;
  rngSeed: number;
  nextId: number;
  spawnDist: number;
}

export type TapRunnerAction =
  | { type: "tick"; dt: number }
  | { type: "tapDown" }
  | { type: "tapUp" };

// ─── Constants ────────────────────────────────────────────────────────────────
const GRAVITY_NORMAL = 2.8;
const GRAVITY_GLIDE  = 1.0;   // reduced gravity while holding
const JUMP_VY = 0.75;
const INITIAL_SPEED = 0.35;
const SPEED_RAMP = 0.015;
const MAX_SPEED = 1.0;
const PLAYER_X = 0.12;
const PLAYER_W = 0.04;
const PLAYER_H = 0.10;
const OBS_LOW_H  = 0.10;
const OBS_TALL_H = 0.20;
const OBS_W      = 0.04;
const MIN_SPAWN  = 0.35;
const MAX_SPAWN  = 0.65;

function rng2(seed: number): { val: number; next: number } {
  const r = mulberry32(seed);
  const val = r();
  const next = Math.floor(r() * 2 ** 31);
  return { val, next };
}

export function initialState(seed: number, settings: TapRunnerSettings): TapRunnerState {
  return {
    settings,
    playerY: 0,
    playerVy: 0,
    holding: false,
    obstacles: [],
    distance: 0,
    speed: INITIAL_SPEED,
    over: false,
    rngSeed: seed,
    nextId: 1,
    spawnDist: 0.5,
  };
}

export function reducer(state: TapRunnerState, action: TapRunnerAction): TapRunnerState {
  if (state.over) return state;

  switch (action.type) {
    case "tapDown": {
      if (state.playerY <= 0.001) {
        // On ground: jump
        return { ...state, playerVy: JUMP_VY, holding: true };
      }
      // In air: engage glide
      return { ...state, holding: true };
    }

    case "tapUp":
      return { ...state, holding: false };

    case "tick": {
      const { dt } = action;
      const speed = Math.min(MAX_SPEED, state.speed + SPEED_RAMP * dt);
      const distance = state.distance + speed * dt;

      // Physics
      const gravity = state.holding && state.playerY > 0.001 ? GRAVITY_GLIDE : GRAVITY_NORMAL;
      let playerVy = state.playerVy - gravity * dt;
      let playerY = Math.max(0, state.playerY + playerVy * dt);
      if (playerY <= 0) playerVy = 0;

      // Move obstacles
      let obstacles = (state.obstacles as TapRunnerObstacle[]).map((o) => ({ ...o, x: o.x - speed * dt }));

      // Spawn
      let spawnDist = state.spawnDist - speed * dt;
      let rngSeed = state.rngSeed;
      let nextId = state.nextId;
      if (spawnDist <= 0) {
        const r1 = rng2(rngSeed);
        rngSeed = r1.next;
        const r2 = rng2(rngSeed);
        rngSeed = r2.next;
        const kind: ObstacleKind = r1.val < 0.5 ? "low" : "tall";
        const h = kind === "low" ? OBS_LOW_H : OBS_TALL_H;
        obstacles = [...obstacles, { id: nextId++, x: 1.05, kind, w: OBS_W, h }];
        const r3 = rng2(rngSeed);
        rngSeed = r3.next;
        spawnDist = MIN_SPAWN + r3.val * (MAX_SPAWN - MIN_SPAWN);
      }

      obstacles = obstacles.filter((o) => o.x > -0.1);

      // Collision
      const pLeft = PLAYER_X;
      const pRight = PLAYER_X + PLAYER_W;
      const pTop = playerY + PLAYER_H;
      let over = false;
      for (const obs of obstacles) {
        if (pRight > obs.x && pLeft < obs.x + obs.w) {
          if (playerY < obs.h) {
            over = true;
            break;
          }
        }
      }

      return { ...state, playerY, playerVy, obstacles, distance, speed, over, rngSeed, nextId, spawnDist };
    }

    default:
      return state;
  }
}

export function isTerminal(state: TapRunnerState): { score: number } | null {
  if (state.over) return { score: Math.floor(state.distance * 100) };
  return null;
}
