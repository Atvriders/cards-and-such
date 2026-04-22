import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES } from "./puzzles.js";

export interface CrossCluesSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface CrossCluesState {
  settings: CrossCluesSettings;
  puzzleIdx: number;
  rowCategories: [string, string, string];
  colCategories: [string, string, string];
  answers: [[string, string, string], [string, string, string], [string, string, string]];
  /** Player's guesses — playerGuesses[row][col] */
  playerGuesses: [[string, string, string], [string, string, string], [string, string, string]];
  /** Which cell is active [row, col] or null */
  activeCell: [number, number] | null;
  /** Number of hints revealed */
  hintsUsed: number;
  /** Cells revealed as hints: "r,c" */
  hintRevealed: string[];
  /** Submission check results: "r,c" -> correct|wrong|empty */
  checked: Record<string, "correct" | "wrong">;
  submitted: boolean;
  won: boolean;
  score: number;
}

export type CrossCluesAction =
  | { type: "selectCell"; row: number; col: number }
  | { type: "typeText"; text: string }
  | { type: "clearCell" }
  | { type: "hint" }
  | { type: "submit" };

function selectPuzzle(difficulty: CrossCluesSettings["difficulty"], rng: () => number): number {
  const matching = PUZZLES.map((p, i) => ({ p, i })).filter(({ p }) => p.difficulty === difficulty);
  const pool = matching.length > 0 ? matching : PUZZLES.map((p, i) => ({ p, i }));
  return pool[Math.floor(rng() * pool.length)]!.i;
}

function emptyGrid(): [[string, string, string], [string, string, string], [string, string, string]] {
  return [["", "", ""], ["", "", ""], ["", "", ""]];
}

export function initialState(seed: number, settings: CrossCluesSettings): CrossCluesState {
  const rng = mulberry32(seed);
  const puzzleIdx = selectPuzzle(settings.difficulty, rng);
  const puzzle = PUZZLES[puzzleIdx]!;

  return {
    settings,
    puzzleIdx,
    rowCategories: puzzle.rowCategories,
    colCategories: puzzle.colCategories,
    answers: puzzle.answers,
    playerGuesses: emptyGrid(),
    activeCell: null,
    hintsUsed: 0,
    hintRevealed: [],
    checked: {},
    submitted: false,
    won: false,
    score: 0,
  };
}

function cloneGrid(
  g: [[string, string, string], [string, string, string], [string, string, string]]
): [[string, string, string], [string, string, string], [string, string, string]] {
  return [
    [g[0][0], g[0][1], g[0][2]],
    [g[1][0], g[1][1], g[1][2]],
    [g[2][0], g[2][1], g[2][2]],
  ];
}

export function reducer(state: CrossCluesState, action: CrossCluesAction): CrossCluesState {
  if (state.submitted) return state;

  switch (action.type) {
    case "selectCell": {
      const { row, col } = action;
      const key = `${row},${col}`;
      if (state.hintRevealed.includes(key)) return state; // can't type into revealed cells
      return { ...state, activeCell: [row, col] };
    }

    case "typeText": {
      const { activeCell, playerGuesses, hintRevealed } = state;
      if (!activeCell) return state;
      const [row, col] = activeCell;
      const key = `${row},${col}`;
      if (hintRevealed.includes(key)) return state;
      const grid = cloneGrid(playerGuesses);
      if (grid[row]) grid[row]![col] = action.text.toUpperCase();
      return { ...state, playerGuesses: grid };
    }

    case "clearCell": {
      const { activeCell, playerGuesses, hintRevealed } = state;
      if (!activeCell) return state;
      const [row, col] = activeCell;
      const key = `${row},${col}`;
      if (hintRevealed.includes(key)) return state;
      const grid = cloneGrid(playerGuesses);
      if (grid[row]) grid[row]![col] = "";
      return { ...state, playerGuesses: grid };
    }

    case "hint": {
      // Find first unfilled, unrevealed cell
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const key = `${r},${c}`;
          if (!state.hintRevealed.includes(key)) {
            const grid = cloneGrid(state.playerGuesses);
            if (grid[r]) grid[r]![c] = state.answers[r]![c]!.toUpperCase();
            return {
              ...state,
              playerGuesses: grid,
              hintRevealed: [...state.hintRevealed, key],
              hintsUsed: state.hintsUsed + 1,
            };
          }
        }
      }
      return state;
    }

    case "submit": {
      const checked: Record<string, "correct" | "wrong"> = {};
      let correct = 0;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const key = `${r},${c}`;
          const guess = state.playerGuesses[r]![c]!.trim().toLowerCase();
          const answer = state.answers[r]![c]!.toLowerCase();
          if (guess === answer) {
            checked[key] = "correct";
            correct++;
          } else {
            checked[key] = "wrong";
          }
        }
      }
      const won = correct === 9;
      const score = Math.max(0, correct * 100 - state.hintsUsed * 50);
      return { ...state, checked, submitted: true, won, score };
    }

    default:
      return state;
  }
}

export function isTerminal(state: CrossCluesState): { score: number } | null {
  if (!state.submitted) return null;
  return { score: state.score };
}
