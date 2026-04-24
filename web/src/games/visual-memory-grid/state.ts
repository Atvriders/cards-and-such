import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type Phase = "show" | "recall" | "feedback" | "done";

function generatePattern(seed: number, counter: number, gridSize: number, filledCount: number): boolean[] {
  const rng = mulberry32(seed + counter * 999983);
  const cells = Array(gridSize * gridSize).fill(false) as boolean[];
  const indices: number[] = [];
  while (indices.length < filledCount) {
    const idx = Math.floor(rng() * cells.length);
    if (!indices.includes(idx)) indices.push(idx);
  }
  for (const idx of indices) cells[idx] = true;
  return cells;
}

export interface VisualMemoryGridState {
  settings: { gridSize: "3" | "4" | "5"; startFilled: "3" | "4" | "5" };
  phase: Phase;
  pattern: boolean[]; // which cells are lit
  selected: boolean[]; // which cells user has clicked
  gridSize: number;
  filledCount: number;
  round: number;
  score: number;
  lives: number;
  lastCorrect: boolean | null;
  ended: boolean;
  rngSeed: number;
  rngCounter: number;
}

export type VisualMemoryGridAction =
  | { type: "toggle"; index: number }
  | { type: "hide" }
  | { type: "submit" }
  | { type: "next" };

const MAX_LIVES = 3;

export function initialState(
  seed: number,
  settings: { gridSize: "3" | "4" | "5"; startFilled: "3" | "4" | "5" },
): VisualMemoryGridState {
  const gridSize = parseInt(settings.gridSize, 10);
  const filledCount = parseInt(settings.startFilled, 10);
  const pattern = generatePattern(seed, 0, gridSize, filledCount);
  return {
    settings,
    phase: "show",
    pattern,
    selected: Array(gridSize * gridSize).fill(false) as boolean[],
    gridSize,
    filledCount,
    round: 1,
    score: 0,
    lives: MAX_LIVES,
    lastCorrect: null,
    ended: false,
    rngSeed: seed,
    rngCounter: 1,
  };
}

export function reducer(state: VisualMemoryGridState, action: VisualMemoryGridAction): VisualMemoryGridState {
  if (state.ended) return state;

  switch (action.type) {
    case "hide": {
      if (state.phase !== "show") return state;
      return { ...state, phase: "recall" };
    }
    case "toggle": {
      if (state.phase !== "recall") return state;
      const newSelected = [...state.selected];
      newSelected[action.index] = !newSelected[action.index];
      return { ...state, selected: newSelected };
    }
    case "submit": {
      if (state.phase !== "recall") return state;
      const isCorrect = state.pattern.every((v, i) => v === state.selected[i]);
      const newLives = isCorrect ? state.lives : state.lives - 1;
      const ended = newLives <= 0;
      return {
        ...state,
        phase: ended ? "done" : "feedback",
        lives: newLives,
        score: state.score + (isCorrect ? state.filledCount : 0),
        lastCorrect: isCorrect,
        ended,
      };
    }
    case "next": {
      if (state.phase !== "feedback") return state;
      const newFilled = state.lastCorrect ? state.filledCount + 1 : state.filledCount;
      // Ensure filledCount doesn't exceed grid cells
      const maxFilled = state.gridSize * state.gridSize - 1;
      const clampedFilled = Math.min(newFilled, maxFilled);
      const pattern = generatePattern(state.rngSeed, state.rngCounter, state.gridSize, clampedFilled);
      return {
        ...state,
        phase: "show",
        pattern,
        selected: Array(state.gridSize * state.gridSize).fill(false) as boolean[],
        filledCount: clampedFilled,
        round: state.round + 1,
        lastCorrect: null,
        rngCounter: state.rngCounter + 1,
      };
    }
    default:
      return state;
  }
}

export function isTerminal(state: VisualMemoryGridState): { score: number } | null {
  if (!state.ended) return null;
  return { score: state.score };
}
