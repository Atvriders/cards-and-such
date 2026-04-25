import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface EggCatcherSettings {
  speed: "slow" | "medium" | "fast";
  lives: "3" | "5" | "7";
}

export interface Egg {
  id: number;
  x: number;   // 0..1 normalized
  y: number;   // 0..1 normalized
  vy: number;  // normalized units per second
  broken: boolean;
}

export interface EggCatcherState {
  settings: EggCatcherSettings;
  basket: number;      // 0..1 normalized x center
  eggs: readonly Egg[];
  score: number;
  lives: number;
  over: boolean;
  elapsed: number;
  rngSeed: number;
  rngCounter: number;
  nextId: number;
  level: number;
}

export type EggCatcherAction =
  | { type: "tick"; dt: number }
  | { type: "move"; x: number };

const BASKET_WIDTH = 0.14;
const BASE_SPAWN_INTERVAL = 1.4; // seconds between spawns

function speedFactor(speed: EggCatcherSettings["speed"]): number {
  return speed === "slow" ? 0.7 : speed === "fast" ? 1.45 : 1.0;
}

function rngAt(seed: number, counter: number): number {
  const rng = mulberry32(seed + counter * 999983);
  return rng();
}

export function initialState(seed: number, settings: EggCatcherSettings): EggCatcherState {
  return {
    settings,
    basket: 0.5,
    eggs: [],
    score: 0,
    lives: parseInt(settings.lives, 10),
    over: false,
    elapsed: 0,
    rngSeed: seed,
    rngCounter: 0,
    nextId: 0,
    level: 1,
  };
}

export function reducer(state: EggCatcherState, action: EggCatcherAction): EggCatcherState {
  if (state.over) return state;

  switch (action.type) {
    case "move":
      return { ...state, basket: Math.max(0.07, Math.min(0.93, action.x)) };

    case "tick": {
      const { dt } = action;
      const sf = speedFactor(state.settings.speed);
      const newElapsed = state.elapsed + dt;
      const level = 1 + Math.floor(state.score / 10);
      let counter = state.rngCounter;
      let nextId = state.nextId;

      // Move eggs down
      let eggs: Egg[] = state.eggs.map((e) => ({ ...e, y: e.y + e.vy * dt }));

      // Spawn new egg
      const spawnInterval = BASE_SPAWN_INTERVAL / (sf * (1 + (level - 1) * 0.1));
      const prevTick = Math.floor(state.elapsed / spawnInterval);
      const currTick = Math.floor(newElapsed / spawnInterval);
      if (currTick > prevTick) {
        const x = 0.1 + rngAt(state.rngSeed, counter++) * 0.8;
        const vy = (0.18 + rngAt(state.rngSeed, counter++) * 0.12) * sf * (1 + (level - 1) * 0.05);
        eggs.push({ id: nextId++, x, y: 0, vy, broken: false });
      }

      // Check catches and misses
      let score = state.score;
      let lives = state.lives;
      const finalEggs: Egg[] = [];

      for (const egg of eggs) {
        if (egg.broken) continue;
        if (egg.y >= 0.88 && egg.y < 0.95) {
          // Check basket
          if (Math.abs(egg.x - state.basket) < BASKET_WIDTH / 2) {
            score += 1;
            // egg caught — remove
            continue;
          }
        }
        if (egg.y >= 1.0) {
          // Hit ground — lose life
          lives -= 1;
          continue;
        }
        finalEggs.push(egg);
      }

      const over = lives <= 0;
      return {
        ...state,
        eggs: finalEggs,
        score,
        lives,
        over,
        elapsed: newElapsed,
        rngSeed: state.rngSeed,
        rngCounter: counter,
        nextId,
        level,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: EggCatcherState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
