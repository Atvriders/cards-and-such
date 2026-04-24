import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Nonogram5x5Settings {
  difficulty: "easy" | "medium" | "hard";
}

export type CellState = 0 | 1 | 2; // 0=unknown, 1=filled, 2=marked empty

export interface Nonogram5x5State {
  settings: Nonogram5x5Settings;
  solution: readonly boolean[];
  cells: readonly CellState[];
  rowClues: readonly (readonly number[])[];
  colClues: readonly (readonly number[])[];
  won: boolean;
  movesMade: number;
}

export type Nonogram5x5Action =
  | { type: "fill"; index: number }
  | { type: "mark"; index: number };

// Easy: sparse (few filled), Medium: ~half, Hard: dense
const EASY_PATTERNS: boolean[][] = [
  [false,false,true,false,false, false,false,true,false,false, false,false,true,false,false, false,false,true,false,false, false,false,true,false,false],
  [true,false,false,false,true, false,false,false,false,false, false,false,true,false,false, false,false,false,false,false, true,false,false,false,true],
  [false,true,true,true,false, false,true,false,true,false, false,true,false,true,false, false,true,false,true,false, false,true,true,true,false],
];

const MEDIUM_PATTERNS: boolean[][] = [
  [false,true,false,true,false, true,true,true,true,true, true,true,true,true,true, false,true,true,true,false, false,false,true,false,false],
  [false,false,true,false,false, false,false,true,false,false, true,true,true,true,true, false,false,true,false,false, false,false,true,false,false],
  [true,true,true,true,true, false,false,false,false,false, false,true,false,true,false, false,false,false,false,false, true,true,true,true,true],
  [false,true,true,true,false, true,false,false,false,true, true,false,false,false,true, true,false,false,false,true, false,true,true,true,false],
];

const HARD_PATTERNS: boolean[][] = [
  [true,false,true,false,true, false,true,false,true,false, true,false,true,false,true, false,true,false,true,false, true,false,true,false,true],
  [true,true,true,true,true, true,false,false,false,true, true,false,false,false,true, true,false,false,false,true, true,true,true,true,true],
  [false,false,true,false,false, false,true,true,true,false, true,true,true,true,true, false,true,true,true,false, false,false,true,false,false],
  [true,true,false,true,true, true,false,false,false,true, false,false,false,false,false, true,false,false,false,true, true,true,false,true,true],
];

const ALL_PATTERNS: Record<string, boolean[][]> = {
  easy: EASY_PATTERNS,
  medium: MEDIUM_PATTERNS,
  hard: HARD_PATTERNS,
};

function computeLineClues(bits: boolean[]): number[] {
  const clues: number[] = [];
  let run = 0;
  for (const b of bits) {
    if (b) { run++; }
    else if (run > 0) { clues.push(run); run = 0; }
  }
  if (run > 0) clues.push(run);
  return clues.length ? clues : [0];
}

function buildClues(solution: readonly boolean[]) {
  const rowClues: number[][] = [];
  const colClues: number[][] = [];
  for (let r = 0; r < 5; r++) {
    rowClues.push(computeLineClues(Array.from({ length: 5 }, (_, c) => solution[r * 5 + c]!)));
  }
  for (let c = 0; c < 5; c++) {
    colClues.push(computeLineClues(Array.from({ length: 5 }, (_, r) => solution[r * 5 + c]!)));
  }
  return { rowClues, colClues };
}

export function initialState(seed: number, settings: Nonogram5x5Settings): Nonogram5x5State {
  const rng = mulberry32(seed);
  const patterns = ALL_PATTERNS[settings.difficulty]!;
  const pi = Math.floor(rng() * patterns.length);
  const solution = patterns[pi]!.slice();
  const { rowClues, colClues } = buildClues(solution);
  return {
    settings,
    solution,
    cells: new Array<CellState>(25).fill(0),
    rowClues,
    colClues,
    won: false,
    movesMade: 0,
  };
}

function checkWon(cells: readonly CellState[], solution: readonly boolean[]): boolean {
  return cells.every((c, i) => (c === 1) === solution[i]);
}

export function reducer(state: Nonogram5x5State, action: Nonogram5x5Action): Nonogram5x5State {
  if (state.won) return state;
  const { index } = action;
  if (index < 0 || index >= 25) return state;
  const newCells = state.cells.slice() as CellState[];
  if (action.type === "fill") {
    newCells[index] = newCells[index] === 1 ? 0 : 1;
  } else {
    newCells[index] = newCells[index] === 2 ? 0 : 2;
  }
  const won = checkWon(newCells, state.solution);
  return { ...state, cells: newCells, won, movesMade: state.movesMade + 1 };
}

export function isTerminal(state: Nonogram5x5State): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 500 - state.movesMade * 5) };
}
