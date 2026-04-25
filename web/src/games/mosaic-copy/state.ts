import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type MosaicPhase = "idle" | "memorize" | "input" | "failed" | "complete";

export interface MosaicCopyState {
  phase: MosaicPhase;
  gridSize: number;
  /** Set of cell indices that are filled (the pattern to memorize) */
  pattern: readonly number[];
  /** Cells player has filled in */
  playerFilled: readonly number[];
  round: number;
  memorizeTimeMs: number;
  rngSeed: number;
  rngCounter: number;
}

export type MosaicCopyAction =
  | { type: "start" }
  | { type: "hide" }
  | { type: "toggle-cell"; cell: number }
  | { type: "submit" };

function generatePattern(seed: number, counter: number, gridSize: number, count: number): number[] {
  const total = gridSize * gridSize;
  const rng = mulberry32(seed + counter * 314159);
  const indices = Array.from({ length: total }, (_, i) => i);
  // Fisher-Yates shuffle
  for (let i = total - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = indices[i]!;
    indices[i] = indices[j]!;
    indices[j] = tmp;
  }
  return indices.slice(0, count).sort((a, b) => a - b);
}

export function initialState(seed: number, _settings: Record<string, never>): MosaicCopyState {
  return {
    phase: "idle",
    gridSize: 4,
    pattern: [],
    playerFilled: [],
    round: 0,
    memorizeTimeMs: 3000,
    rngSeed: seed,
    rngCounter: 0,
  };
}

export function reducer(state: MosaicCopyState, action: MosaicCopyAction): MosaicCopyState {
  switch (action.type) {
    case "start": {
      if (state.phase === "idle" || state.phase === "failed" || state.phase === "complete") {
        const newRound = state.round + 1;
        const filledCount = Math.min(2 + newRound, 10);
        const pattern = generatePattern(state.rngSeed, state.rngCounter, state.gridSize, filledCount);
        return {
          ...state,
          phase: "memorize",
          pattern,
          playerFilled: [],
          round: newRound,
          rngCounter: state.rngCounter + 1,
        };
      }
      return state;
    }
    case "hide": {
      if (state.phase !== "memorize") return state;
      return { ...state, phase: "input" };
    }
    case "toggle-cell": {
      if (state.phase !== "input") return state;
      const has = state.playerFilled.includes(action.cell);
      const newFilled = has
        ? state.playerFilled.filter(c => c !== action.cell)
        : [...state.playerFilled, action.cell];
      return { ...state, playerFilled: newFilled };
    }
    case "submit": {
      if (state.phase !== "input") return state;
      const sortedPlayer = [...state.playerFilled].sort((a, b) => a - b);
      const sortedPattern = [...state.pattern].sort((a, b) => a - b);
      const correct =
        sortedPlayer.length === sortedPattern.length &&
        sortedPlayer.every((c, i) => c === sortedPattern[i]);
      if (correct) {
        return { ...state, phase: "complete" };
      }
      return { ...state, phase: "failed" };
    }
    default:
      return state;
  }
}

export function isTerminal(state: MosaicCopyState): { score: number } | null {
  if (state.phase === "failed") {
    return { score: Math.max(0, state.round - 1) };
  }
  return null;
}
