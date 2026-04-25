import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface PixelRunnerSettings {
  speed: "normal" | "fast" | "turbo";
}

export interface Obstacle {
  x: number;
  height: number; // 1 = low, 2 = high
}

export interface PixelRunnerState {
  settings: PixelRunnerSettings;
  playerY: number; // 0 = ground, positive = in air
  velocityY: number;
  obstacles: Obstacle[];
  distance: number;
  score: number;
  alive: boolean;
  ticks: number;
  rngSeed: number;
  nextObstacleIn: number;
  groundY: number;
}

export type PixelRunnerAction =
  | { type: "tick" }
  | { type: "jump" };

const GROUND_Y = 0;
const JUMP_VEL = 6;
const GRAVITY = 1;
const PLAYER_X = 3; // fixed x column
const CANVAS_W = 20;

const SPEED_MAP = { normal: 1, fast: 2, turbo: 3 };

export function initialState(seed: number, settings: PixelRunnerSettings): PixelRunnerState {
  const rng = mulberry32(seed);
  return {
    settings,
    playerY: GROUND_Y,
    velocityY: 0,
    obstacles: [],
    distance: 0,
    score: 0,
    alive: true,
    ticks: 0,
    rngSeed: Math.floor(rng() * 2 ** 31),
    nextObstacleIn: 8,
    groundY: GROUND_Y,
  };
}

export function reducer(state: PixelRunnerState, action: PixelRunnerAction): PixelRunnerState {
  if (!state.alive && action.type !== "tick") return state;

  switch (action.type) {
    case "jump": {
      if (!state.alive) return state;
      // Only jump if on ground
      if (state.playerY > GROUND_Y) return state;
      return { ...state, velocityY: JUMP_VEL };
    }

    case "tick": {
      if (!state.alive) return state;

      const speed = SPEED_MAP[state.settings.speed] ?? 1;

      // Update player physics
      let playerY = state.playerY + state.velocityY;
      let velocityY = state.velocityY - GRAVITY;
      if (playerY <= GROUND_Y) {
        playerY = GROUND_Y;
        velocityY = 0;
      }

      // Move obstacles left
      let obstacles = state.obstacles
        .map((o) => ({ ...o, x: o.x - speed }))
        .filter((o) => o.x > -1);

      // Spawn new obstacle
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      let nextObstacleIn = state.nextObstacleIn - 1;
      if (nextObstacleIn <= 0) {
        const height = rng() < 0.4 ? 2 : 1;
        obstacles = [...obstacles, { x: CANVAS_W - 1, height }];
        nextObstacleIn = Math.floor(rng() * 8) + 6;
      }

      // Collision: player at fixed x=PLAYER_X, occupies y=0..1 when on ground
      // Obstacle at x=PLAYER_X means collision if player can't clear it
      let alive = true;
      for (const o of obstacles) {
        if (Math.abs(o.x - PLAYER_X) < 1) {
          // height 1 = low obstacle (clears with jump), height 2 = high obstacle
          if (o.height === 1 && playerY < 1) alive = false;
          if (o.height === 2 && playerY < 3) alive = false;
        }
      }

      const score = alive ? state.score + speed : state.score;
      return {
        ...state,
        playerY,
        velocityY,
        obstacles,
        distance: state.distance + speed,
        score,
        alive,
        ticks: state.ticks + 1,
        rngSeed: nextSeed,
        nextObstacleIn,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: PixelRunnerState): { score: number } | null {
  if (!state.alive) return { score: state.score };
  return null;
}
