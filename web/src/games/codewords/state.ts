import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES } from "./puzzles.js";

export interface CodewordsSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface CodewordsState {
  settings: CodewordsSettings;
  puzzleIdx: number;
  grid: (number | null)[][];
  width: number;
  height: number;
  /** The correct mapping: code -> letter */
  solution: Record<number, string>;
  /** Player's current mapping: code -> letter (populated as they guess) */
  playerMap: Record<number, string>;
  /** Codes revealed as given (shown automatically) */
  givenCodes: number[];
  /** Currently selected code number (1-26) or null */
  selectedCode: number | null;
  won: boolean;
  guesses: number;
}

export type CodewordsAction =
  | { type: "selectCode"; code: number }
  | { type: "guessLetter"; letter: string }
  | { type: "clearCode" };

function selectPuzzle(difficulty: CodewordsSettings["difficulty"], rng: () => number): number {
  const matching = PUZZLES.map((p, i) => ({ p, i })).filter(({ p }) => p.difficulty === difficulty);
  const pool = matching.length > 0 ? matching : PUZZLES.map((p, i) => ({ p, i }));
  return pool[Math.floor(rng() * pool.length)]!.i;
}

export function initialState(seed: number, settings: CodewordsSettings): CodewordsState {
  const rng = mulberry32(seed);
  const puzzleIdx = selectPuzzle(settings.difficulty, rng);
  const puzzle = PUZZLES[puzzleIdx]!;

  // Pre-fill given codes in the player map
  const playerMap: Record<number, string> = {};
  for (const code of puzzle.givenCodes) {
    playerMap[code] = puzzle.solution[code]!;
  }

  return {
    settings,
    puzzleIdx,
    grid: puzzle.grid,
    width: puzzle.width,
    height: puzzle.height,
    solution: puzzle.solution,
    playerMap,
    givenCodes: puzzle.givenCodes,
    selectedCode: null,
    won: false,
    guesses: 0,
  };
}

function checkWin(solution: Record<number, string>, playerMap: Record<number, string>, gridCodes: Set<number>): boolean {
  for (const code of gridCodes) {
    if (playerMap[code] !== solution[code]) return false;
  }
  return true;
}

/** Get all unique codes appearing in the grid */
export function getGridCodes(grid: (number | null)[][]): Set<number> {
  const codes = new Set<number>();
  for (const row of grid) {
    for (const cell of row) {
      if (cell !== null) codes.add(cell);
    }
  }
  return codes;
}

export function reducer(state: CodewordsState, action: CodewordsAction): CodewordsState {
  if (state.won) return state;

  switch (action.type) {
    case "selectCode": {
      const { code } = action;
      if (state.givenCodes.includes(code)) return state; // can't change given codes
      return { ...state, selectedCode: code };
    }

    case "guessLetter": {
      const { selectedCode } = state;
      if (!selectedCode) return state;
      if (state.givenCodes.includes(selectedCode)) return state;

      const letter = action.letter.toUpperCase();
      if (!/^[A-Z]$/.test(letter)) return state;

      const playerMap = { ...state.playerMap, [selectedCode]: letter };
      const won = checkWin(state.solution, playerMap, getGridCodes(state.grid));

      return {
        ...state,
        playerMap,
        guesses: state.guesses + 1,
        selectedCode: null,
        won,
      };
    }

    case "clearCode": {
      const { selectedCode } = state;
      if (!selectedCode) return state;
      if (state.givenCodes.includes(selectedCode)) return state;
      const playerMap = { ...state.playerMap };
      delete playerMap[selectedCode];
      return { ...state, playerMap, selectedCode: null };
    }

    default:
      return state;
  }
}

export function isTerminal(state: CodewordsState): { score: number } | null {
  if (!state.won) return null;
  const score = Math.max(100, 1000 - state.guesses * 20);
  return { score };
}
