import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface PennyFlipSettings {
  // no settings — fixed 20 flips
}

export type CoinSide = "heads" | "tails";

export interface FlipEntry {
  prediction: CoinSide;
  result: CoinSide;
  correct: boolean;
}

export interface PennyFlipState {
  settings: PennyFlipSettings;
  rngSeed: number;
  totalFlips: number;
  flipsCompleted: number;
  correct: number;
  history: FlipEntry[];
  pendingPrediction: CoinSide | null;
  lastResult: CoinSide | null;
  done: boolean;
}

export type PennyFlipAction =
  | { type: "predict"; side: CoinSide }
  | { type: "flip" };

const TOTAL_FLIPS = 20;

function nextSeed(seed: number): number {
  return (mulberry32(seed)() * 2 ** 31) >>> 0;
}

function flipCoin(seed: number): CoinSide {
  return mulberry32(seed)() < 0.5 ? "heads" : "tails";
}

export function initialState(seed: number, settings: PennyFlipSettings): PennyFlipState {
  return {
    settings,
    rngSeed: seed >>> 0,
    totalFlips: TOTAL_FLIPS,
    flipsCompleted: 0,
    correct: 0,
    history: [],
    pendingPrediction: null,
    lastResult: null,
    done: false,
  };
}

export function reducer(state: PennyFlipState, action: PennyFlipAction): PennyFlipState {
  if (state.done) return state;

  if (action.type === "predict") {
    if (state.pendingPrediction !== null) return state;
    return { ...state, pendingPrediction: action.side };
  }

  if (action.type === "flip") {
    if (state.pendingPrediction === null) return state;

    const result = flipCoin(state.rngSeed);
    const newSeed = nextSeed(state.rngSeed);
    const correct = result === state.pendingPrediction;
    const flipsCompleted = state.flipsCompleted + 1;

    const entry: FlipEntry = {
      prediction: state.pendingPrediction,
      result,
      correct,
    };

    const done = flipsCompleted >= TOTAL_FLIPS;

    return {
      ...state,
      rngSeed: newSeed,
      flipsCompleted,
      correct: state.correct + (correct ? 1 : 0),
      history: [...state.history, entry],
      pendingPrediction: null,
      lastResult: result,
      done,
    };
  }

  return state;
}

export function isTerminal(state: PennyFlipState): { score: number } | null {
  if (!state.done) return null;
  return { score: state.correct * 5 };
}

export { TOTAL_FLIPS };
