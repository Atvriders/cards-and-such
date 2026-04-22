import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SkyscrapersSettings {
  size: "4" | "5" | "6";
}

export interface SkyscrapersPuzzle {
  size: number;
  /** solution[r*N+c] = height 1..N */
  solution: number[];
  /** clues: top[c], bottom[c], left[r], right[r]. 0 = no clue */
  topClues: number[];
  bottomClues: number[];
  leftClues: number[];
  rightClues: number[];
}

export interface SkyscrapersState {
  settings: SkyscrapersSettings;
  puzzle: SkyscrapersPuzzle;
  board: number[];
  selected: number | null;
  won: boolean;
  moves: number;
  errorCells: Set<number>;
}

export type SkyscrapersAction =
  | { type: "selectCell"; idx: number }
  | { type: "enterDigit"; digit: number }
  | { type: "clearCell" };

// ---- Helpers ----

/** Count visible buildings in a sequence of heights */
export function countVisible(seq: number[]): number {
  let count = 0;
  let maxH = 0;
  for (const h of seq) {
    if (h > maxH) { count++; maxH = h; }
  }
  return count;
}

function computeClues(sol: number[], N: number) {
  const topClues: number[] = [];
  const bottomClues: number[] = [];
  const leftClues: number[] = [];
  const rightClues: number[] = [];

  for (let c = 0; c < N; c++) {
    const col = Array.from({ length: N }, (_, r) => sol[r * N + c]!);
    topClues.push(countVisible(col));
    bottomClues.push(countVisible([...col].reverse()));
  }
  for (let r = 0; r < N; r++) {
    const row = Array.from({ length: N }, (_, c) => sol[r * N + c]!);
    leftClues.push(countVisible(row));
    rightClues.push(countVisible([...row].reverse()));
  }

  return { topClues, bottomClues, leftClues, rightClues };
}

function makePuzzle(N: number, sol: number[]): SkyscrapersPuzzle {
  const { topClues, bottomClues, leftClues, rightClues } = computeClues(sol, N);
  return { size: N, solution: sol, topClues, bottomClues, leftClues, rightClues };
}

// ---- Pre-designed puzzles ----

// Cyclic Latin squares make valid skyscraper grids
const cyclic = (N: number, shift: number) =>
  Array.from({ length: N * N }, (_, k) => {
    const r = Math.floor(k / N), c = k % N;
    return ((r * shift + c) % N) + 1;
  });

export const PUZZLES: Record<string, SkyscrapersPuzzle[]> = {
  "4": [
    // Valid 4×4 Latin square (cyclic shift=3)
    makePuzzle(4, cyclic(4, 3)),
    // Use verified solutions:
    makePuzzle(4, [
      1, 2, 3, 4,
      2, 1, 4, 3,
      3, 4, 1, 2,
      4, 3, 2, 1,
    ]),
    makePuzzle(4, [
      2, 1, 4, 3,
      1, 2, 3, 4,
      4, 3, 2, 1,
      3, 4, 1, 2,
    ]),
    makePuzzle(4, cyclic(4, 1)),
    makePuzzle(4, [4, 1, 2, 3, 3, 4, 1, 2, 2, 3, 4, 1, 1, 2, 3, 4]),
  ],
  "5": [
    makePuzzle(5, cyclic(5, 1)),
    makePuzzle(5, cyclic(5, 2)),
    makePuzzle(5, cyclic(5, 3)),
    makePuzzle(5, [
      1, 2, 3, 4, 5,
      2, 3, 4, 5, 1,
      3, 4, 5, 1, 2,
      4, 5, 1, 2, 3,
      5, 1, 2, 3, 4,
    ]),
  ],
  "6": [
    makePuzzle(6, cyclic(6, 1)),
    makePuzzle(6, cyclic(6, 5)),
    // Hand-crafted valid 6×6 Latin squares (shifts 2/3 are invalid for N=6)
    makePuzzle(6, [
      1, 2, 3, 4, 5, 6,
      3, 4, 5, 6, 1, 2,
      5, 6, 1, 2, 3, 4,
      2, 1, 4, 3, 6, 5,
      4, 3, 6, 5, 2, 1,
      6, 5, 2, 1, 4, 3,
    ]),
    makePuzzle(6, [
      2, 3, 4, 5, 6, 1,
      4, 5, 6, 1, 2, 3,
      6, 1, 2, 3, 4, 5,
      1, 2, 3, 4, 5, 6,
      3, 4, 5, 6, 1, 2,
      5, 6, 1, 2, 3, 4,
    ]),
  ],
};

// ---- Validation ----

function computeErrors(board: number[], puzzle: SkyscrapersPuzzle): Set<number> {
  const { size: N, topClues, bottomClues, leftClues, rightClues } = puzzle;
  const errors = new Set<number>();

  // Check rows for duplicate digits
  for (let r = 0; r < N; r++) {
    const seen = new Map<number, number>();
    for (let c = 0; c < N; c++) {
      const idx = r * N + c;
      const v = board[idx]!;
      if (v === 0) continue;
      if (seen.has(v)) { errors.add(seen.get(v)!); errors.add(idx); }
      else seen.set(v, idx);
    }
  }

  // Check cols for duplicate digits
  for (let c = 0; c < N; c++) {
    const seen = new Map<number, number>();
    for (let r = 0; r < N; r++) {
      const idx = r * N + c;
      const v = board[idx]!;
      if (v === 0) continue;
      if (seen.has(v)) { errors.add(seen.get(v)!); errors.add(idx); }
      else seen.set(v, idx);
    }
  }

  // Check clues only for fully filled rows/cols
  for (let c = 0; c < N; c++) {
    const col = Array.from({ length: N }, (_, r) => board[r * N + c]!);
    if (col.every((v) => v > 0)) {
      if (topClues[c]! > 0 && countVisible(col) !== topClues[c]) {
        for (let r = 0; r < N; r++) errors.add(r * N + c);
      }
      if (bottomClues[c]! > 0 && countVisible([...col].reverse()) !== bottomClues[c]) {
        for (let r = 0; r < N; r++) errors.add(r * N + c);
      }
    }
  }
  for (let r = 0; r < N; r++) {
    const row = Array.from({ length: N }, (_, c) => board[r * N + c]!);
    if (row.every((v) => v > 0)) {
      if (leftClues[r]! > 0 && countVisible(row) !== leftClues[r]) {
        for (let c = 0; c < N; c++) errors.add(r * N + c);
      }
      if (rightClues[r]! > 0 && countVisible([...row].reverse()) !== rightClues[r]) {
        for (let c = 0; c < N; c++) errors.add(r * N + c);
      }
    }
  }

  return errors;
}

function checkWon(board: number[], puzzle: SkyscrapersPuzzle): boolean {
  if (board.some((v) => v === 0)) return false;
  return computeErrors(board, puzzle).size === 0;
}

export function initialState(seed: number, settings: SkyscrapersSettings): SkyscrapersState {
  const rng = mulberry32(seed);
  const pool = PUZZLES[settings.size]!;
  const idx = Math.floor(rng() * pool.length);
  const puzzle = pool[idx]!;

  return {
    settings,
    puzzle,
    board: new Array(puzzle.size * puzzle.size).fill(0),
    selected: null,
    won: false,
    moves: 0,
    errorCells: new Set(),
  };
}

export function reducer(state: SkyscrapersState, action: SkyscrapersAction): SkyscrapersState {
  if (state.won) return state;
  switch (action.type) {
    case "selectCell":
      return { ...state, selected: action.idx };
    case "enterDigit": {
      if (state.selected === null) return state;
      const d = action.digit;
      if (d < 1 || d > state.puzzle.size) return state;
      const newBoard = state.board.slice();
      newBoard[state.selected] = d;
      const errorCells = computeErrors(newBoard, state.puzzle);
      const won = checkWon(newBoard, state.puzzle);
      return { ...state, board: newBoard, errorCells, won, moves: state.moves + 1 };
    }
    case "clearCell": {
      if (state.selected === null) return state;
      const newBoard = state.board.slice();
      newBoard[state.selected] = 0;
      const errorCells = computeErrors(newBoard, state.puzzle);
      return { ...state, board: newBoard, errorCells, moves: state.moves + 1 };
    }
    default:
      return state;
  }
}

export function isTerminal(state: SkyscrapersState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 5) };
}
