import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface LightSwitchSettings {
  size: number;
}

export interface LightSwitchState {
  settings: LightSwitchSettings;
  size: number;
  lights: readonly boolean[]; // current state
  target: readonly boolean[]; // desired state
  won: boolean;
  movesMade: number;
}

export type LightSwitchAction = { type: "toggle"; index: number };

// Each switch toggles itself + orthogonal neighbors (Lights Out style)
function applyToggle(lights: boolean[], index: number, size: number): boolean[] {
  const next = lights.slice();
  const r = Math.floor(index / size);
  const c = index % size;
  const neighbors = [[r, c], [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
  for (const [nr, nc] of neighbors) {
    if (nr !== undefined && nc !== undefined && nr >= 0 && nr < size && nc >= 0 && nc < size) {
      next[nr * size + nc] = !next[nr * size + nc];
    }
  }
  return next;
}

export function initialState(seed: number, settings: LightSwitchSettings): LightSwitchState {
  const rng = mulberry32(seed);
  const size = settings.size;
  const total = size * size;

  // Start with all-off, build a solvable puzzle by applying random toggles
  let lights: boolean[] = new Array<boolean>(total).fill(false);
  const numMoves = 3 + Math.floor(rng() * (size + 2));
  for (let i = 0; i < numMoves; i++) {
    const idx = Math.floor(rng() * total);
    lights = applyToggle(lights, idx, size);
  }

  // Target: a different random pattern
  const target: boolean[] = Array.from({ length: total }, () => rng() > 0.5);

  return {
    settings,
    size,
    lights,
    target,
    won: false,
    movesMade: 0,
  };
}

export function reducer(state: LightSwitchState, action: LightSwitchAction): LightSwitchState {
  if (state.won) return state;
  if (action.type !== "toggle") return state;
  const { index } = action;
  if (index < 0 || index >= state.size * state.size) return state;

  const newLights = applyToggle(state.lights.slice() as boolean[], index, state.size);
  const won = newLights.every((v, i) => v === state.target[i]);
  return { ...state, lights: newLights, won, movesMade: state.movesMade + 1 };
}

export function isTerminal(state: LightSwitchState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(50, 500 - state.movesMade * 10) };
}
