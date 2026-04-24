import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Number Order — tap numbers in ascending order as fast as you can

export interface NumberOrderSettings {
  count: "5" | "8" | "10";
}

export interface NumberOrderState {
  settings: NumberOrderSettings;
  rngSeed: number;
  numbers: number[]; // the shuffled numbers shown on screen
  nextExpected: number; // value to tap next
  tapped: number[]; // indices of already-tapped numbers
  mistakes: number;
  message: string;
  done: boolean;
}

export type NumberOrderAction = { type: "tap"; index: number };

export function initialState(seed: number, settings: NumberOrderSettings): NumberOrderState {
  const count = parseInt(settings.count);
  const rng = mulberry32(seed);

  // Generate count distinct numbers 1..30
  const pool = Array.from({ length: 30 }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = pool[i]!;
    pool[i] = pool[j]!;
    pool[j] = tmp;
  }
  const numbers = pool.slice(0, count);
  const sorted = [...numbers].sort((a, b) => a - b);
  const nextExpected = sorted[0]!;

  return {
    settings,
    rngSeed: seed,
    numbers,
    nextExpected,
    tapped: [],
    mistakes: 0,
    message: `Tap the numbers in order! Start with ${nextExpected}`,
    done: false,
  };
}

export function reducer(state: NumberOrderState, action: NumberOrderAction): NumberOrderState {
  if (state.done) return state;
  if (action.type !== "tap") return state;
  const { index } = action;
  if (state.tapped.includes(index)) return state;

  const value = state.numbers[index];
  if (value !== state.nextExpected) {
    return { ...state, mistakes: state.mistakes + 1, message: `Not quite! Tap ${state.nextExpected} next.` };
  }

  const tapped = [...state.tapped, index];

  // Find next expected: smallest untapped number
  const untapped = state.numbers
    .map((n, i) => ({ n, i }))
    .filter(({ i }) => !tapped.includes(i))
    .map(({ n }) => n)
    .sort((a, b) => a - b);

  if (untapped.length === 0) {
    return {
      ...state,
      tapped,
      nextExpected: -1,
      done: true,
      message: `Done! Mistakes: ${state.mistakes}. ${state.mistakes === 0 ? "Perfect!" : "Keep practicing!"}`,
    };
  }

  const nextExpected = untapped[0]!;
  return {
    ...state,
    tapped,
    nextExpected,
    message: `Great! Next: tap ${nextExpected}`,
  };
}

export function isTerminal(state: NumberOrderState): { score: number } | null {
  if (!state.done) return null;
  const count = parseInt(state.settings.count);
  const score = Math.max(0, 100 - state.mistakes * Math.round(100 / count));
  return { score };
}
