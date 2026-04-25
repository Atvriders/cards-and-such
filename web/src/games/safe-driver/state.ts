import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SafeDriverSettings {
  speed: "slow" | "normal" | "fast";
}

export interface Obstacle {
  lane: number; // 0, 1, 2
  y: number;    // 0..19 (grid rows, 0=top, 19=bottom)
}

export interface SafeDriverState {
  settings: SafeDriverSettings;
  rngSeed: number;
  playerLane: number;
  obstacles: Obstacle[];
  tick: number;
  distance: number;
  lives: number;
  gameOver: boolean;
  crashed: boolean;
}

export type SafeDriverAction =
  | { type: "left" }
  | { type: "right" }
  | { type: "tick" }
  | { type: "restart" };

const ROWS = 20;
const PLAYER_ROW = 17;

function speedInterval(speed: SafeDriverSettings["speed"]): number {
  if (speed === "slow") return 4;
  if (speed === "fast") return 2;
  return 3;
}

function spawnObstacle(rng: () => number, existing: Obstacle[]): Obstacle | null {
  const lane = Math.floor(rng() * 3);
  const y = 0;
  // Don't double-spawn at same top position
  if (existing.some(o => o.y <= 1 && o.lane === lane)) return null;
  return { lane, y };
}

export function initialState(seed: number, settings: SafeDriverSettings): SafeDriverState {
  return {
    settings,
    rngSeed: seed,
    playerLane: 1,
    obstacles: [],
    tick: 0,
    distance: 0,
    lives: 3,
    gameOver: false,
    crashed: false,
  };
}

export function reducer(state: SafeDriverState, action: SafeDriverAction): SafeDriverState {
  if (action.type === "restart") {
    return initialState(state.rngSeed + 1, state.settings);
  }

  if (state.gameOver) return state;

  if (action.type === "left") {
    return { ...state, playerLane: Math.max(0, state.playerLane - 1), crashed: false };
  }
  if (action.type === "right") {
    return { ...state, playerLane: Math.min(2, state.playerLane + 1), crashed: false };
  }

  if (action.type === "tick") {
    const interval = speedInterval(state.settings.speed);
    const newTick = state.tick + 1;
    const rng = mulberry32(state.rngSeed + newTick);

    let obstacles = state.obstacles.map(o => ({ ...o, y: o.y + 1 }));
    // Remove off-screen
    obstacles = obstacles.filter(o => o.y < ROWS);

    // Spawn new obstacles every `interval` ticks
    if (newTick % interval === 0) {
      const newObs = spawnObstacle(rng, obstacles);
      if (newObs) obstacles = [...obstacles, newObs];
    }

    // Collision check
    const hit = obstacles.some(o => o.lane === state.playerLane && o.y === PLAYER_ROW);
    let lives = state.lives;
    let crashed = false;
    if (hit) {
      lives -= 1;
      crashed = true;
      // Remove the obstacle that was hit
      obstacles = obstacles.filter(o => !(o.lane === state.playerLane && o.y === PLAYER_ROW));
    }

    const gameOver = lives <= 0;

    return {
      ...state,
      tick: newTick,
      rngSeed: state.rngSeed + newTick,
      obstacles,
      distance: state.distance + 1,
      lives,
      crashed,
      gameOver,
    };
  }

  return state;
}

export function isTerminal(state: SafeDriverState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: Math.min(100, Math.floor(state.distance / 2)) };
}
