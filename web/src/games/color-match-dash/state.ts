import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type Color = "red" | "green" | "blue" | "yellow";
export const COLORS: Color[] = ["red", "green", "blue", "yellow"];

export interface FallingColor {
  id: number;
  color: Color;
  y: number; // 0..1 normalized
  x: number; // 0..1 normalized column center
}

export interface ColorMatchState {
  settings: { speed: "slow" | "normal" | "fast" };
  fallingItems: FallingColor[];
  score: number;
  lives: number;
  rng: () => number;
  rngSeed: number;
  nextId: number;
  spawnTimer: number;
  spawnInterval: number;
  dropSpeed: number;
  over: boolean;
  started: boolean;
}

export type ColorMatchAction =
  | { type: "tick"; dt: number }
  | { type: "press"; color: Color }
  | { type: "start" };

const LANE_X: Record<Color, number> = { red: 0.125, green: 0.375, blue: 0.625, yellow: 0.875 };

export function initialState(
  seed: number,
  s: { speed: "slow" | "normal" | "fast" },
): ColorMatchState {
  const speedMult = s.speed === "slow" ? 0.5 : s.speed === "fast" ? 1.5 : 1.0;
  return {
    settings: s,
    fallingItems: [],
    score: 0,
    lives: 5,
    rng: mulberry32(seed),
    rngSeed: seed,
    nextId: 0,
    spawnTimer: 0,
    spawnInterval: 2.0 / speedMult,
    dropSpeed: 0.2 * speedMult,
    over: false,
    started: false,
  };
}

export function reducer(state: ColorMatchState, action: ColorMatchAction): ColorMatchState {
  switch (action.type) {
    case "start":
      return { ...state, started: true };

    case "press": {
      if (!state.started || state.over) return state;
      const { color } = action;
      // Find lowest falling item in this lane that is near bottom (y > 0.75)
      const target = state.fallingItems
        .filter((f) => f.color === color && f.y > 0.7)
        .sort((a, b) => b.y - a.y)[0];
      if (target) {
        return {
          ...state,
          score: state.score + 10,
          fallingItems: state.fallingItems.filter((f) => f.id !== target.id),
        };
      }
      // Missed — pressing wrong color near bottom, penalty if something near bottom and wrong
      const nearBottom = state.fallingItems.filter((f) => f.color !== color && f.y > 0.85);
      if (nearBottom.length > 0) {
        const newLives = state.lives - 1;
        return {
          ...state,
          lives: newLives,
          over: newLives <= 0,
        };
      }
      return state;
    }

    case "tick": {
      if (!state.started || state.over) return state;
      const { dt } = action;
      const rng = state.rng;

      // Move items down
      let newItems = state.fallingItems.map((f) => ({ ...f, y: f.y + state.dropSpeed * dt }));

      // Remove items that passed bottom and penalize
      let lives = state.lives;
      const missed = newItems.filter((f) => f.y > 1.05);
      if (missed.length > 0) {
        lives = Math.max(0, lives - missed.length);
        newItems = newItems.filter((f) => f.y <= 1.05);
      }

      const over = lives <= 0;

      // Spawn new items
      let { spawnTimer, nextId } = state;
      spawnTimer += dt;
      if (spawnTimer >= state.spawnInterval) {
        spawnTimer -= state.spawnInterval;
        const colorIdx = Math.floor(rng() * COLORS.length);
        const color = COLORS[colorIdx]!;
        newItems.push({ id: nextId++, color, y: 0, x: LANE_X[color] });
      }

      return {
        ...state,
        fallingItems: newItems,
        score: state.score,
        lives,
        spawnTimer,
        nextId,
        over,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: ColorMatchState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
