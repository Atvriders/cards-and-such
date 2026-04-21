import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CoinFlipSettings {
  maxFlips: "5" | "10" | "20";
}

export type CoinSide = "heads" | "tails";

export interface FlipEntry {
  prediction: CoinSide;
  result: CoinSide;
  correct: boolean;
}

export interface CoinFlipState {
  settings: CoinFlipSettings;
  rngSeed: number;
  maxFlips: number;
  streak: number;
  bestStreak: number;
  flipsCompleted: number;
  history: FlipEntry[];
  pendingPrediction: CoinSide | null;
  lastResult: CoinSide | null;
  gameOver: boolean;
  won: boolean; // reached maxFlips without missing
}

export type CoinFlipAction =
  | { type: "predict"; side: CoinSide }
  | { type: "flip" };

function nextSeed(seed: number): number {
  return mulberry32(seed)() * 2 ** 31 >>> 0;
}

function flipCoin(seed: number): CoinSide {
  const rng = mulberry32(seed);
  return rng() < 0.5 ? "heads" : "tails";
}

export function initialState(seed: number, settings: CoinFlipSettings): CoinFlipState {
  return {
    settings,
    rngSeed: seed >>> 0,
    maxFlips: parseInt(settings.maxFlips, 10),
    streak: 0,
    bestStreak: 0,
    flipsCompleted: 0,
    history: [],
    pendingPrediction: null,
    lastResult: null,
    gameOver: false,
    won: false,
  };
}

export function reducer(state: CoinFlipState, action: CoinFlipAction): CoinFlipState {
  if (state.gameOver) return state;

  if (action.type === "predict") {
    if (state.pendingPrediction !== null) return state; // already predicted
    return { ...state, pendingPrediction: action.side };
  }

  if (action.type === "flip") {
    if (state.pendingPrediction === null) return state; // must predict first

    const result = flipCoin(state.rngSeed);
    const newSeed = nextSeed(state.rngSeed);
    const correct = result === state.pendingPrediction;
    const newStreak = correct ? state.streak + 1 : 0;
    const newBestStreak = Math.max(state.bestStreak, newStreak);
    const flipsCompleted = state.flipsCompleted + 1;

    const entry: FlipEntry = {
      prediction: state.pendingPrediction,
      result,
      correct,
    };

    const won = correct && flipsCompleted >= state.maxFlips;
    const gameOver = !correct || won;

    return {
      ...state,
      rngSeed: newSeed,
      streak: newStreak,
      bestStreak: newBestStreak,
      flipsCompleted,
      history: [...state.history, entry],
      pendingPrediction: null,
      lastResult: result,
      gameOver,
      won,
    };
  }

  return state;
}

export function isTerminal(state: CoinFlipState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.bestStreak * 100 };
}
