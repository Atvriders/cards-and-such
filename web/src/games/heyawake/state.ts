import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES_EASY, PUZZLES_HARD } from "./puzzles.js";
import type { HeyawakePuzzle } from "./puzzles.js";

export type { HeyawakePuzzle };
export type { Room } from "./puzzles.js";

export interface HeyawakeSettings {
  difficulty: "easy" | "hard";
}

export type CellMark = "empty" | "shaded" | "dot";

export interface HeyawakeState {
  settings: HeyawakeSettings;
  puzzle: HeyawakePuzzle;
  board: CellMark[];
  won: boolean;
  moves: number;
}

export type HeyawakeAction =
  | { type: "clickCell"; idx: number }
  | { type: "reset" };

export function checkWon(puzzle: HeyawakePuzzle, board: CellMark[]): boolean {
  for (let i = 0; i < board.length; i++) {
    const isShaded = puzzle.solution[i]!;
    if (isShaded && board[i] !== "shaded") return false;
    if (!isShaded && board[i] === "shaded") return false;
  }
  return true;
}

export function initialState(seed: number, settings: HeyawakeSettings): HeyawakeState {
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

export function reducer(state: HeyawakeState, action: HeyawakeAction): HeyawakeState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "clickCell": {
      const newBoard = state.board.slice() as CellMark[];
      const cur = newBoard[action.idx]!;
      newBoard[action.idx] = cur === "empty" ? "shaded" : cur === "shaded" ? "dot" : "empty";
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

export function isTerminal(state: HeyawakeState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 4) };
}

/** Count shaded cells in a room */
export function countShadedInRoom(board: CellMark[], puzzle: HeyawakePuzzle, roomIdx: number): number {
  const room = puzzle.rooms[roomIdx]!;
  let count = 0;
  for (let r = room.r; r < room.r + room.h; r++)
    for (let c = room.c; c < room.c + room.w; c++)
      if (board[r * puzzle.size + c] === "shaded") count++;
  return count;
}
