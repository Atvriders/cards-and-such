import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DodgeCarsSettings {
  lanes: "3" | "4" | "5";
  speed: "slow" | "medium" | "fast";
}

export interface Car {
  id: number;
  lane: number;
  y: number;
  vy: number;
}

export interface DodgeCarsState {
  settings: DodgeCarsSettings;
  playerLane: number;
  cars: readonly Car[];
  score: number;
  over: boolean;
  elapsed: number;
  rngSeed: number;
  rngCounter: number;
  nextId: number;
}

export type DodgeCarsAction =
  | { type: "tick"; dt: number }
  | { type: "move"; lane: number };

function speedScale(s: DodgeCarsSettings["speed"]): number {
  return s === "slow" ? 0.7 : s === "fast" ? 1.4 : 1.0;
}

function rngAt(seed: number, counter: number): number {
  return mulberry32(seed + counter * 1000003)();
}

const PLAYER_Y = 0.85;
const CAR_H = 0.1;
const SPAWN_INTERVAL_BASE = 1.1;

export function initialState(seed: number, settings: DodgeCarsSettings): DodgeCarsState {
  const lanes = parseInt(settings.lanes, 10);
  return {
    settings,
    playerLane: Math.floor(lanes / 2),
    cars: [],
    score: 0,
    over: false,
    elapsed: 0,
    rngSeed: seed,
    rngCounter: 0,
    nextId: 0,
  };
}

export function reducer(state: DodgeCarsState, action: DodgeCarsAction): DodgeCarsState {
  if (state.over) return state;

  switch (action.type) {
    case "move": {
      const lanes = parseInt(state.settings.lanes, 10);
      const lane = Math.max(0, Math.min(lanes - 1, action.lane));
      return { ...state, playerLane: lane };
    }

    case "tick": {
      const { dt } = action;
      const sf = speedScale(state.settings.speed);
      const lanes = parseInt(state.settings.lanes, 10);
      const newElapsed = state.elapsed + dt;
      let counter = state.rngCounter;
      let nextId = state.nextId;

      // Move cars
      const baseVy = (0.3 + state.elapsed * 0.02) * sf;
      let cars: Car[] = state.cars.map((c) => ({ ...c, y: c.y + c.vy * dt }));

      // Remove off-screen
      cars = cars.filter((c) => c.y < 1.15);

      // Spawn new car
      const spawnInterval = Math.max(0.4, SPAWN_INTERVAL_BASE - state.elapsed * 0.005) / sf;
      const prev = Math.floor(state.elapsed / spawnInterval);
      const curr = Math.floor(newElapsed / spawnInterval);
      if (curr > prev) {
        const lane = Math.floor(rngAt(state.rngSeed, counter++) * lanes);
        const vy = baseVy + rngAt(state.rngSeed, counter++) * 0.15 * sf;
        cars.push({ id: nextId++, lane, y: -0.12, vy });
      }

      // Collision check at player row
      let over = false;
      for (const c of cars) {
        if (c.lane === state.playerLane && c.y + CAR_H / 2 >= PLAYER_Y - 0.06 && c.y - CAR_H / 2 <= PLAYER_Y + 0.06) {
          over = true;
        }
      }

      const score = over ? state.score : Math.floor(newElapsed * 10);

      return {
        ...state,
        cars,
        score,
        over,
        elapsed: newElapsed,
        rngCounter: counter,
        nextId,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: DodgeCarsState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
