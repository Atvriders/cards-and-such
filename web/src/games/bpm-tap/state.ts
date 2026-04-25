import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface BpmTapSettings {
  target: "60" | "120" | "180";
}

export interface BpmTapState {
  settings: BpmTapSettings;
  rngSeed: number;
  targetBpm: number;
  taps: number[];     // timestamps (ms from game start)
  currentBpm: number; // live calculated from last 4 taps
  bestError: number;  // smallest abs error achieved (lower = better)
  done: boolean;      // finished after 8 taps
  gameOver: boolean;
}

export type BpmTapAction =
  | { type: "tap"; time: number };

export function initialState(seed: number, settings: BpmTapSettings): BpmTapState {
  // use rng to verify seed stored
  const _rng = mulberry32(seed >>> 0);
  return {
    settings,
    rngSeed: seed >>> 0,
    targetBpm: parseInt(settings.target, 10),
    taps: [],
    currentBpm: 0,
    bestError: Infinity,
    done: false,
    gameOver: false,
  };
}

function calcBpm(taps: number[]): number {
  if (taps.length < 2) return 0;
  // Average interval of last 4 taps
  const recent = taps.slice(-4);
  let totalInterval = 0;
  for (let i = 1; i < recent.length; i++) {
    totalInterval += recent[i]! - recent[i - 1]!;
  }
  const avgInterval = totalInterval / (recent.length - 1);
  return Math.round(60000 / avgInterval);
}

export function reducer(state: BpmTapState, action: BpmTapAction): BpmTapState {
  if (state.gameOver) return state;

  if (action.type === "tap") {
    const taps = [...state.taps, action.time];
    const currentBpm = calcBpm(taps);
    const error = currentBpm > 0 ? Math.abs(currentBpm - state.targetBpm) : Infinity;
    const bestError = Math.min(state.bestError === Infinity ? error : state.bestError, error);
    const done = taps.length >= 8;
    const gameOver = done;
    return {
      ...state,
      taps,
      currentBpm,
      bestError,
      done,
      gameOver,
    };
  }

  return state;
}

export function isTerminal(state: BpmTapState): { score: number } | null {
  if (!state.gameOver) return null;
  // Score: perfect = 1000, each BPM off reduces score
  const error = state.bestError === Infinity ? 100 : state.bestError;
  const score = Math.max(0, Math.round(1000 - error * 10));
  return { score };
}
