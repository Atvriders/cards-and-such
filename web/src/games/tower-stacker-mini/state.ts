import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Tower Stacker Mini: endless runner. Player has 3 lanes; tap to move; obstacles spawn from right; collision = game over.

export const LANES = 3;
export const LANE_LENGTH = 12; // x positions, 0 (player) to 11 (spawn point)
export const TICK_MS = 100;

export interface TowerStackerMiniSettings { dummy: boolean; }

export interface Obstacle { id: number; lane: number; x: number; }

export interface TowerStackerMiniState {
  rngSeed: number;
  playerLane: number;
  obstacles: Obstacle[];
  nextId: number;
  ticks: number;
  spawnTimer: number;
  spawnInterval: number;
  speed: number; // tiles per tick (fractional accumulator)
  speedAccum: number;
  score: number;
  phase: "playing" | "done";
}

export type TowerStackerMiniAction =
  | { type: "tick" }
  | { type: "lane"; dir: -1 | 1 }
  | { type: "setLane"; lane: number };

export function initialState(seed: number, _settings: TowerStackerMiniSettings): TowerStackerMiniState {
  return {
    rngSeed: seed >>> 0 || 1,
    playerLane: 1,
    obstacles: [],
    nextId: 1,
    ticks: 0,
    spawnTimer: 0,
    spawnInterval: 8,
    speed: 1,
    speedAccum: 0,
    score: 0,
    phase: "playing",
  };
}

function collides(playerLane: number, obstacles: Obstacle[]): boolean {
  for (const o of obstacles) {
    if (o.x === 0 && o.lane === playerLane) return true;
  }
  return false;
}

export function reducer(state: TowerStackerMiniState, action: TowerStackerMiniAction): TowerStackerMiniState {
  if (state.phase === "done") return state;
  if (action.type === "lane") {
    const next = Math.max(0, Math.min(LANES - 1, state.playerLane + action.dir));
    if (next === state.playerLane) return state;
    if (collides(next, state.obstacles)) return { ...state, playerLane: next, phase: "done" };
    return { ...state, playerLane: next };
  }
  if (action.type === "setLane") {
    const next = Math.max(0, Math.min(LANES - 1, action.lane));
    if (next === state.playerLane) return state;
    if (collides(next, state.obstacles)) return { ...state, playerLane: next, phase: "done" };
    return { ...state, playerLane: next };
  }
  if (action.type === "tick") {
    const rng = mulberry32(state.rngSeed);
    const seed2 = Math.floor(rng() * 2 ** 31);
    // advance obstacles
    const accum = state.speedAccum + state.speed;
    const advance = Math.floor(accum);
    const newAccum = accum - advance;
    let obstacles = state.obstacles.map(o => ({ ...o, x: o.x - advance })).filter(o => o.x >= 0);
    // spawn
    let spawnTimer = state.spawnTimer + 1;
    let spawnInterval = state.spawnInterval;
    let nextId = state.nextId;
    if (spawnTimer >= spawnInterval) {
      spawnTimer = 0;
      const lane = Math.floor(rng() * LANES);
      obstacles = [...obstacles, { id: nextId++, lane, x: LANE_LENGTH - 1 }];
    }
    // collision check
    if (collides(state.playerLane, obstacles)) {
      return { ...state, rngSeed: seed2, obstacles, nextId, ticks: state.ticks + 1, spawnTimer, spawnInterval, speedAccum: newAccum, phase: "done" };
    }
    // difficulty scaling
    const ticks = state.ticks + 1;
    if (ticks % 60 === 0 && spawnInterval > 4) spawnInterval--;
    const speed = ticks > 200 ? 1.4 : ticks > 100 ? 1.2 : 1;
    const score = state.score + 1;
    return { ...state, rngSeed: seed2, obstacles, nextId, ticks, spawnTimer, spawnInterval, speed, speedAccum: newAccum, score };
  }
  return state;
}

export function isTerminal(state: TowerStackerMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
