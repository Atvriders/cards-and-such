import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ─── Endless Runner ───────────────────────────────────────────────────────────
// Side-scrolling runner. Jump over obstacles. Duck under high obstacles.

export interface EndlessRunnerSettings {
  // No configurable settings — speed ramps automatically
}

export type ObstacleType = "low" | "high";

export interface Obstacle {
  id: number;
  x: number; // normalized [0,1], world x
  type: ObstacleType; // low = jump over, high = duck under
}

export interface EndlessRunnerState {
  settings: EndlessRunnerSettings;
  /** Distance traveled (score) */
  distance: number;
  /** World speed (units/sec) */
  speed: number;
  /** Player Y position: 0 = ground, >0 = in air (normalized) */
  playerY: number;
  /** Player vertical velocity */
  playerVy: number;
  /** Whether player is ducking */
  ducking: boolean;
  obstacles: readonly Obstacle[];
  over: boolean;
  nextId: number;
  rngSeed: number;
  /** Distance until next obstacle spawn */
  spawnDist: number;
}

export type EndlessRunnerAction =
  | { type: "tick"; dt: number }
  | { type: "jump" }
  | { type: "duck"; on: boolean };

// ─── Constants ────────────────────────────────────────────────────────────────
const INITIAL_SPEED = 0.4;
const SPEED_RAMP = 0.02; // units/sec per second
const MAX_SPEED = 1.2;
const JUMP_VY = 0.8;
const GRAVITY = -3.0;
const PLAYER_X = 0.15;
const PLAYER_W = 0.04;
const PLAYER_H_NORMAL = 0.12;
const PLAYER_H_DUCK = 0.06;
const OBS_LOW_W = 0.035;
const OBS_LOW_H = 0.12;
const OBS_HIGH_W = 0.04;
const OBS_HIGH_H = 0.07; // top of screen clearance
const OBS_HIGH_Y = 0.08; // y of high obstacle bottom (player must duck below this)
const MIN_SPAWN_DIST = 0.3;
const MAX_SPAWN_DIST = 0.7;

function rng2(seed: number): { val: number; next: number } {
  const rng = mulberry32(seed);
  const val = rng();
  const next = Math.floor(rng() * 2 ** 31);
  return { val, next };
}

// ─── Initial state ────────────────────────────────────────────────────────────
export function initialState(seed: number, settings: EndlessRunnerSettings): EndlessRunnerState {
  return {
    settings,
    distance: 0,
    speed: INITIAL_SPEED,
    playerY: 0,
    playerVy: 0,
    ducking: false,
    obstacles: [],
    over: false,
    nextId: 1,
    rngSeed: seed,
    spawnDist: 0.4,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function reducer(state: EndlessRunnerState, action: EndlessRunnerAction): EndlessRunnerState {
  if (state.over) return state;

  switch (action.type) {
    case "jump": {
      if (state.playerY > 0.001) return state; // already airborne
      return { ...state, playerVy: JUMP_VY };
    }

    case "duck":
      return { ...state, ducking: action.on };

    case "tick": {
      const { dt } = action;

      // ── Speed ramp ─────────────────────────────────────────────────────────
      const speed = Math.min(MAX_SPEED, state.speed + SPEED_RAMP * dt);

      // ── Distance ───────────────────────────────────────────────────────────
      const distance = state.distance + speed * dt;

      // ── Player physics ─────────────────────────────────────────────────────
      let playerVy = state.playerVy + GRAVITY * dt;
      let playerY = Math.max(0, state.playerY + playerVy * dt);
      if (playerY <= 0) playerVy = 0;

      // ── Move obstacles ─────────────────────────────────────────────────────
      let obstacles = (state.obstacles as Obstacle[]).map((o) => ({
        ...o,
        x: o.x - speed * dt,
      }));

      // ── Spawn new obstacles ────────────────────────────────────────────────
      let spawnDist = state.spawnDist - speed * dt;
      let rngSeed = state.rngSeed;
      let nextId = state.nextId;

      if (spawnDist <= 0) {
        // Spawn obstacle
        const r1 = rng2(rngSeed);
        rngSeed = r1.next;
        const type: ObstacleType = r1.val < 0.4 ? "high" : "low";

        obstacles = [...obstacles, { id: nextId++, x: 1.1, type }];

        const r2 = rng2(rngSeed);
        rngSeed = r2.next;
        spawnDist = MIN_SPAWN_DIST + r2.val * (MAX_SPAWN_DIST - MIN_SPAWN_DIST);
      }

      // ── Remove off-screen obstacles ────────────────────────────────────────
      obstacles = obstacles.filter((o) => o.x > -0.1);

      // ── Collision detection ────────────────────────────────────────────────
      const ducking = state.ducking;
      const playerH = ducking ? PLAYER_H_DUCK : PLAYER_H_NORMAL;
      const playerTop = playerY + playerH;
      const playerLeft = PLAYER_X;
      const playerRight = PLAYER_X + PLAYER_W;

      let over = false;
      for (const obs of obstacles) {
        if (obs.type === "low") {
          // Low obstacle: must jump over
          const obsLeft = obs.x;
          const obsRight = obs.x + OBS_LOW_W;
          const obsTop = OBS_LOW_H;
          // Collision: overlap in X and player bottom below obs top
          if (
            playerRight > obsLeft &&
            playerLeft < obsRight &&
            playerY < obsTop
          ) {
            over = true;
            break;
          }
        } else {
          // High obstacle: must duck under
          const obsLeft = obs.x;
          const obsRight = obs.x + OBS_HIGH_W;
          // The high obstacle hangs from top; player must keep their top below OBS_HIGH_Y
          if (
            playerRight > obsLeft &&
            playerLeft < obsRight &&
            playerTop > OBS_HIGH_Y
          ) {
            over = true;
            break;
          }
        }
      }

      return {
        ...state,
        distance,
        speed,
        playerY,
        playerVy,
        obstacles,
        over,
        nextId,
        rngSeed,
        spawnDist,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: EndlessRunnerState): { score: number } | null {
  if (state.over) return { score: Math.floor(state.distance * 100) };
  return null;
}
