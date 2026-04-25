import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface HalloweenPumpkinSettings {
  size: "4" | "5" | "6";
}

export interface HalloweenPumpkinState {
  settings: HalloweenPumpkinSettings;
  target: boolean[];   // stencil pattern (carved = true)
  carved: boolean[];   // player's current carving
  size: number;
  score: number;
  over: boolean;
  moves: number;
}

export type HalloweenPumpkinAction = { type: "carve"; index: number } | { type: "submit" };

function makeTarget(seed: number, size: number): boolean[] {
  const rng = mulberry32(seed);
  const total = size * size;
  // Ensure 30-70% filled
  return Array.from({ length: total }, () => rng() < 0.5);
}

export function initialState(seed: number, settings: HalloweenPumpkinSettings): HalloweenPumpkinState {
  const size = parseInt(settings.size, 10);
  const target = makeTarget(seed, size);
  return {
    settings,
    target,
    carved: Array(size * size).fill(false),
    size,
    score: 0,
    over: false,
    moves: 0,
  };
}

export function reducer(state: HalloweenPumpkinState, action: HalloweenPumpkinAction): HalloweenPumpkinState {
  if (state.over) return state;

  if (action.type === "carve") {
    const carved = [...state.carved];
    carved[action.index] = !carved[action.index];
    return { ...state, carved, moves: state.moves + 1 };
  }

  if (action.type === "submit") {
    let correct = 0;
    for (let i = 0; i < state.target.length; i++) {
      if (state.carved[i] === state.target[i]) correct++;
    }
    const pct = correct / state.target.length;
    const score = Math.round(pct * 1000 * Math.max(0.5, 1 - state.moves * 0.005));
    return { ...state, score, over: true };
  }

  return state;
}

export function isTerminal(state: HalloweenPumpkinState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
