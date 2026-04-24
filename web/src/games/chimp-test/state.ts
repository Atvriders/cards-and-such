import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type Phase = "show" | "recall" | "done";

export interface ChimpCell {
  number: number;
  x: number; // 0-4 grid column
  y: number; // 0-4 grid row
}

export interface ChimpTestState {
  settings: { startCount: "4" | "5" | "6"; difficulty: "easy" | "medium" | "hard" };
  phase: Phase;
  cells: ChimpCell[];
  clickOrder: number[]; // numbers clicked so far
  expected: number; // next number to click
  count: number; // numbers in current round
  round: number;
  score: number;
  lives: number;
  lastCorrect: boolean | null;
  rngSeed: number;
  rngCounter: number;
}

export type ChimpTestAction =
  | { type: "start" }
  | { type: "click"; number: number };

const GRID_SIZE = 5;
const MAX_LIVES = 3;

function generateCells(seed: number, counter: number, count: number): ChimpCell[] {
  const rng = mulberry32(seed + counter * 999983);
  // Pick unique grid positions
  const positions: Array<{ x: number; y: number }> = [];
  while (positions.length < count) {
    const x = Math.floor(rng() * GRID_SIZE);
    const y = Math.floor(rng() * GRID_SIZE);
    if (!positions.some(p => p.x === x && p.y === y)) {
      positions.push({ x, y });
    }
  }
  return positions.map((pos, i) => ({ number: i + 1, x: pos.x, y: pos.y }));
}

export function initialState(
  seed: number,
  settings: { startCount: "4" | "5" | "6"; difficulty: "easy" | "medium" | "hard" },
): ChimpTestState {
  const count = parseInt(settings.startCount, 10);
  const cells = generateCells(seed, 0, count);
  return {
    settings,
    phase: "show",
    cells,
    clickOrder: [],
    expected: 1,
    count,
    round: 1,
    score: 0,
    lives: MAX_LIVES,
    lastCorrect: null,
    rngSeed: seed,
    rngCounter: 1,
  };
}

export function reducer(state: ChimpTestState, action: ChimpTestAction): ChimpTestState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "start": {
      if (state.phase !== "show") return state;
      return { ...state, phase: "recall" };
    }
    case "click": {
      if (state.phase !== "recall") return state;

      if (action.number !== state.expected) {
        // Wrong click
        const newLives = state.lives - 1;
        if (newLives <= 0) {
          return { ...state, lives: 0, phase: "done", lastCorrect: false };
        }
        // Retry same round
        const cells = generateCells(state.rngSeed, state.rngCounter, state.count);
        return {
          ...state,
          lives: newLives,
          phase: "show",
          cells,
          clickOrder: [],
          expected: 1,
          lastCorrect: false,
          rngCounter: state.rngCounter + 1,
        };
      }

      const newClickOrder = [...state.clickOrder, action.number];
      if (newClickOrder.length === state.count) {
        // Round complete! Advance
        const newCount = state.count + (state.settings.difficulty === "easy" ? 1 : state.settings.difficulty === "medium" ? 1 : 2);
        const newRound = state.round + 1;
        const cells = generateCells(state.rngSeed, state.rngCounter, newCount);
        return {
          ...state,
          phase: "show",
          cells,
          clickOrder: [],
          expected: 1,
          count: newCount,
          round: newRound,
          score: state.score + state.count,
          lastCorrect: true,
          rngCounter: state.rngCounter + 1,
        };
      }

      return {
        ...state,
        clickOrder: newClickOrder,
        expected: state.expected + 1,
      };
    }
    default:
      return state;
  }
}

export function isTerminal(state: ChimpTestState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.score };
}
