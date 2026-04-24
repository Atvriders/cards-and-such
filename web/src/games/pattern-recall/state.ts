import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type PRPhase = "idle" | "showing" | "input" | "result" | "done";
export type Difficulty = "easy" | "medium" | "hard";

export const GRID_COLS = 4;
export const GRID_ROWS = 4;
export const GRID_SIZE = GRID_COLS * GRID_ROWS; // 16 cells

const HIGHLIGHT_COUNT: Record<Difficulty, number> = {
  easy: 4,
  medium: 7,
  hard: 10,
};

export interface PatternRecallState {
  settings: { difficulty: Difficulty };
  phase: PRPhase;
  /** Cells that are highlighted in the pattern (0..15) */
  pattern: readonly number[];
  /** Cells the player has toggled on */
  playerPattern: readonly number[];
  round: number;
  score: number;
  lastAccuracy: number | null;
  rngSeed: number;
  rngCounter: number;
}

export type PatternRecallAction =
  | { type: "start" }
  | { type: "reveal" }
  | { type: "toggle-cell"; cell: number }
  | { type: "submit" }
  | { type: "next" };

function generatePattern(seed: number, counter: number, count: number): number[] {
  const rng = mulberry32(seed + counter * 999983);
  const indices = Array.from({ length: GRID_SIZE }, (_, i) => i);
  // Shuffle and take first `count`
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j]!, indices[i]!];
  }
  return indices.slice(0, count).sort((a, b) => a - b);
}

export function initialState(
  seed: number,
  settings: { difficulty: Difficulty },
): PatternRecallState {
  return {
    settings,
    phase: "idle",
    pattern: [],
    playerPattern: [],
    round: 0,
    score: 0,
    lastAccuracy: null,
    rngSeed: seed,
    rngCounter: 0,
  };
}

export function reducer(state: PatternRecallState, action: PatternRecallAction): PatternRecallState {
  switch (action.type) {
    case "start": {
      if (state.phase !== "idle" && state.phase !== "done") return state;
      const count = HIGHLIGHT_COUNT[state.settings.difficulty];
      const pattern = generatePattern(state.rngSeed, state.rngCounter, count);
      return {
        ...state,
        phase: "showing",
        pattern,
        playerPattern: [],
        round: 1,
        score: 0,
        lastAccuracy: null,
        rngCounter: state.rngCounter + 1,
      };
    }

    case "reveal": {
      if (state.phase !== "showing") return state;
      return { ...state, phase: "input", playerPattern: [] };
    }

    case "toggle-cell": {
      if (state.phase !== "input") return state;
      const { cell } = action;
      const has = state.playerPattern.includes(cell);
      const newPattern = has
        ? state.playerPattern.filter((c) => c !== cell)
        : [...state.playerPattern, cell];
      return { ...state, playerPattern: newPattern };
    }

    case "submit": {
      if (state.phase !== "input") return state;
      const patternSet = new Set(state.pattern);
      const playerSet = new Set(state.playerPattern);
      let correct = 0;
      for (const c of patternSet) {
        if (playerSet.has(c)) correct++;
      }
      const accuracy = state.pattern.length > 0 ? correct / state.pattern.length : 0;
      const roundScore = Math.round(accuracy * state.pattern.length * 20);
      return {
        ...state,
        phase: "result",
        lastAccuracy: accuracy,
        score: state.score + roundScore,
      };
    }

    case "next": {
      if (state.phase !== "result") return state;
      if (state.round >= 8) {
        return { ...state, phase: "done" };
      }
      const count = HIGHLIGHT_COUNT[state.settings.difficulty];
      const pattern = generatePattern(state.rngSeed, state.rngCounter, count);
      return {
        ...state,
        phase: "showing",
        pattern,
        playerPattern: [],
        round: state.round + 1,
        lastAccuracy: null,
        rngCounter: state.rngCounter + 1,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: PatternRecallState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.score };
}
