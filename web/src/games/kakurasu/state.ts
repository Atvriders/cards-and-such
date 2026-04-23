import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES } from "./puzzles.js";
import type { KakurasuPuzzle } from "./puzzles.js";
export type { KakurasuPuzzle };

export interface KakurasuSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface KakurasuState {
  settings: KakurasuSettings;
  puzzle: KakurasuPuzzle;
  shaded: boolean[];
  won: boolean;
  moves: number;
}

export type KakurasuAction =
  | { type: "toggle"; idx: number }
  | { type: "reset" };

export function computeRowSum(size: number, shaded: boolean[], row: number): number {
  let sum = 0;
  for (let c = 0; c < size; c++) {
    if (shaded[row * size + c]) sum += c + 1;
  }
  return sum;
}

export function computeColSum(size: number, shaded: boolean[], col: number): number {
  let sum = 0;
  for (let r = 0; r < size; r++) {
    if (shaded[r * size + col]) sum += r + 1;
  }
  return sum;
}

export function checkWon(puzzle: KakurasuPuzzle, shaded: boolean[]): boolean {
  const { size, rowClues, colClues } = puzzle;
  for (let r = 0; r < size; r++) {
    if (computeRowSum(size, shaded, r) !== rowClues[r]) return false;
  }
  for (let c = 0; c < size; c++) {
    if (computeColSum(size, shaded, c) !== colClues[c]) return false;
  }
  return true;
}

export function initialState(seed: number, settings: KakurasuSettings): KakurasuState {
  const rng = mulberry32(seed);
  const puzzle = PUZZLES[Math.floor(rng() * PUZZLES.length)]!;
  return {
    settings,
    puzzle,
    shaded: new Array(puzzle.size * puzzle.size).fill(false),
    won: false,
    moves: 0,
  };
}

export function reducer(state: KakurasuState, action: KakurasuAction): KakurasuState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "toggle": {
      const { idx } = action;
      const newShaded = state.shaded.slice();
      newShaded[idx] = !newShaded[idx];
      const won = checkWon(state.puzzle, newShaded);
      return { ...state, shaded: newShaded, won, moves: state.moves + 1 };
    }
    case "reset":
      return { ...state, shaded: new Array(state.puzzle.size * state.puzzle.size).fill(false), won: false, moves: 0 };
    default:
      return state;
  }
}

export function isTerminal(state: KakurasuState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 5) };
}
