import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { FILLOMINO_PUZZLES } from "./puzzles.js";
import type { FillominoPuzzle } from "./puzzles.js";

export type { FillominoPuzzle };

export interface FillominoSettings {
  difficulty: "easy" | "hard";
}

export interface FillominoState {
  settings: FillominoSettings;
  puzzle: FillominoPuzzle;
  /** Player's current number entries (0 = empty) */
  current: number[];
  /** Selected cell index */
  selected: number | null;
  won: boolean;
  moves: number;
}

export type FillominoAction =
  | { type: "select"; idx: number | null }
  | { type: "enter"; value: number } // 0 = clear
  | { type: "reset" };

export function checkWon(puzzle: FillominoPuzzle, current: number[]): boolean {
  for (let i = 0; i < current.length; i++) {
    if (current[i] !== puzzle.solution[i]) return false;
  }
  return true;
}

export function initialState(seed: number, settings: FillominoSettings): FillominoState {
  const rng = mulberry32(seed);
  const pool = FILLOMINO_PUZZLES[settings.difficulty]!;
  const puzzle = pool[Math.floor(rng() * pool.length)]!;
  return {
    settings,
    puzzle,
    current: puzzle.given.slice(),
    selected: null,
    won: false,
    moves: 0,
  };
}

export function reducer(state: FillominoState, action: FillominoAction): FillominoState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "select":
      return { ...state, selected: action.idx };
    case "enter": {
      const { selected } = state;
      if (selected === null) return state;
      if (state.puzzle.given[selected] !== 0) return state; // can't overwrite given
      const newCurrent = state.current.slice();
      newCurrent[selected] = action.value;
      const won = checkWon(state.puzzle, newCurrent);
      return { ...state, current: newCurrent, won, moves: state.moves + 1 };
    }
    case "reset":
      return {
        ...state,
        current: state.puzzle.given.slice(),
        selected: null,
        won: false,
        moves: 0,
      };
    default:
      return state;
  }
}

export function isTerminal(state: FillominoState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 5) };
}
