import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES_EASY, PUZZLES_HARD } from "./puzzles.js";
import type { TapaPuzzle, TapaClue } from "./puzzles.js";

export type { TapaPuzzle, TapaClue };

export interface TapaSettings {
  difficulty: "easy" | "hard";
}

export type CellMark = "empty" | "shaded" | "dot";

export interface TapaState {
  settings: TapaSettings;
  puzzle: TapaPuzzle;
  board: CellMark[];
  won: boolean;
  moves: number;
}

export type TapaAction =
  | { type: "clickCell"; idx: number }
  | { type: "reset" };

export function checkWon(puzzle: TapaPuzzle, board: CellMark[]): boolean {
  for (let i = 0; i < board.length; i++) {
    const shouldBeShaded = puzzle.solution[i]!;
    if (shouldBeShaded && board[i] !== "shaded") return false;
    if (!shouldBeShaded && board[i] === "shaded") return false;
  }
  return true;
}

/** Get the 8 neighbors (clockwise from NW) of cell (r,c), returning indices (-1 if out of bounds) */
export function getNeighborsCW(size: number, r: number, c: number): number[] {
  const dirs = [[-1,-1],[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1]]; // NW,N,NE,E,SE,S,SW,W
  return dirs.map(([dr, dc]) => {
    const nr = r + dr!, nc = c + dc!;
    if (nr < 0 || nr >= size || nc < 0 || nc >= size) return -1;
    return nr * size + nc;
  });
}

/** Compute shaded groups in neighbors of a cell */
export function computeNeighborGroups(board: CellMark[], size: number, r: number, c: number): number[] {
  const neighbors = getNeighborsCW(size, r, c);
  // Build a circular sequence of shaded/not for valid (in-bounds) neighbors
  const shaded = neighbors.map(idx => idx >= 0 && board[idx] === "shaded");

  // Find groups with wrap-around
  if (shaded.every(s => !s)) return [];
  if (shaded.every(s => s)) return [shaded.filter(Boolean).length];

  // Find first non-shaded position to start (to handle wrap correctly)
  let start = 0;
  while (shaded[start]) start++;

  const groups: number[] = [];
  let cur = 0;
  for (let i = 0; i < 8; i++) {
    const pos = (start + i) % 8;
    if (shaded[pos]) {
      cur++;
    } else if (cur > 0) {
      groups.push(cur);
      cur = 0;
    }
  }
  if (cur > 0) groups.push(cur);

  return groups.sort((a, b) => b - a);
}

export function initialState(seed: number, settings: TapaSettings): TapaState {
  const rng = mulberry32(seed);
  const pool = settings.difficulty === "easy" ? PUZZLES_EASY : PUZZLES_HARD;
  const puzzle = pool[Math.floor(rng() * pool.length)]!;
  return {
    settings,
    puzzle,
    board: new Array(puzzle.size * puzzle.size).fill("empty") as CellMark[],
    won: false,
    moves: 0,
  };
}

export function reducer(state: TapaState, action: TapaAction): TapaState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "clickCell": {
      const { idx } = action;
      // Clue cells can't be clicked
      const { size } = state.puzzle;
      const r = Math.floor(idx / size), c = idx % size;
      if (state.puzzle.clues.some(cl => cl.r === r && cl.c === c)) return state;

      const newBoard = state.board.slice() as CellMark[];
      const cur = newBoard[idx]!;
      newBoard[idx] = cur === "empty" ? "shaded" : cur === "shaded" ? "dot" : "empty";
      const won = checkWon(state.puzzle, newBoard);
      return { ...state, board: newBoard, won, moves: state.moves + 1 };
    }
    case "reset":
      return {
        ...state,
        board: new Array(state.puzzle.size * state.puzzle.size).fill("empty") as CellMark[],
        won: false,
        moves: 0,
      };
    default:
      return state;
  }
}

export function isTerminal(state: TapaState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 4) };
}
