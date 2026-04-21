import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface LightsOutSettings {
  size: "4" | "5" | "6";
  difficulty: "easy" | "medium" | "hard";
}

export interface LightsOutState {
  settings: LightsOutSettings;
  size: number;
  lights: readonly boolean[]; // length size*size; true = on
  movesMade: number;
  won: boolean;
}

export type LightsOutAction = { type: "press"; row: number; col: number };

const SCRAMBLE_RANGE: Record<"easy" | "medium" | "hard", [number, number]> = {
  easy: [3, 5],
  medium: [6, 10],
  hard: [11, 18],
};

function toggle(lights: boolean[], index: number): void {
  lights[index] = !lights[index];
}

function pressAt(lights: boolean[], size: number, row: number, col: number): boolean[] {
  const next = lights.slice();
  const idx = row * size + col;
  toggle(next, idx);
  if (row > 0) toggle(next, (row - 1) * size + col);
  if (row < size - 1) toggle(next, (row + 1) * size + col);
  if (col > 0) toggle(next, row * size + (col - 1));
  if (col < size - 1) toggle(next, row * size + (col + 1));
  return next;
}

export function initialState(seed: number, settings: LightsOutSettings): LightsOutState {
  const size = parseInt(settings.size, 10);
  const rng = mulberry32(seed);

  const [minClicks, maxClicks] = SCRAMBLE_RANGE[settings.difficulty];
  const scrambleMoves = minClicks + Math.floor(rng() * (maxClicks - minClicks + 1));

  let lights: boolean[] = new Array(size * size).fill(false);

  for (let i = 0; i < scrambleMoves; i++) {
    const row = Math.floor(rng() * size);
    const col = Math.floor(rng() * size);
    lights = pressAt(lights, size, row, col);
  }

  // If all lights happen to be off after scrambling, force one on
  if (lights.every((l) => !l)) {
    lights = pressAt(lights, size, 0, 0);
  }

  return {
    settings,
    size,
    lights,
    movesMade: 0,
    won: false,
  };
}

export function reducer(state: LightsOutState, action: LightsOutAction): LightsOutState {
  if (action.type !== "press") return state;
  if (state.won) return state;

  const { row, col } = action;
  const { size } = state;
  if (row < 0 || row >= size || col < 0 || col >= size) return state;

  const newLights = pressAt(state.lights as boolean[], size, row, col);
  const won = newLights.every((l) => !l);

  return {
    ...state,
    lights: newLights,
    movesMade: state.movesMade + 1,
    won,
  };
}

export function isTerminal(state: LightsOutState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.movesMade * 10) };
}
