import { z } from "zod";
import type { Seat } from "../rooms.js";

export type Cell = 0 | 1 | null;  // seat 0, seat 1, or empty

export const COLS = 7;
export const ROWS = 6;

export interface Connect4State {
  /** Row-major: board[row * COLS + col]; row 0 is the top, row ROWS-1 is the bottom. */
  board: readonly Cell[];
  turn: 0 | 1;
  winner: 0 | 1 | "draw" | null;
  winningLine: ReadonlyArray<readonly [number, number]> | null;
  /** Number of moves played so far; used to detect draws. */
  movesPlayed: number;
}

export type Connect4Action = { type: "drop"; col: number };

export const Connect4ActionSchema = z.object({
  type: z.literal("drop"),
  col: z.number().int().min(0).max(COLS - 1),
});

export function connect4Initial(_seed: number, _seats: number): Connect4State {
  return {
    board: new Array(COLS * ROWS).fill(null),
    turn: 0,
    winner: null,
    winningLine: null,
    movesPlayed: 0,
  };
}

function idx(row: number, col: number): number { return row * COLS + col; }

function findDropRow(board: readonly Cell[], col: number): number {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[idx(r, col)] === null) return r;
  }
  return -1;
}

const DIRS: ReadonlyArray<readonly [number, number]> = [
  [0, 1],   // horizontal
  [1, 0],   // vertical
  [1, 1],   // diag down-right
  [1, -1],  // diag down-left
];

function findWinningLine(board: readonly Cell[], lastRow: number, lastCol: number, seat: 0 | 1): ReadonlyArray<readonly [number, number]> | null {
  for (const [dr, dc] of DIRS) {
    const line: Array<[number, number]> = [[lastRow, lastCol]];
    // forward
    for (let i = 1; i < 4; i++) {
      const r = lastRow + dr * i, c = lastCol + dc * i;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) break;
      if (board[idx(r, c)] !== seat) break;
      line.push([r, c]);
    }
    // backward
    for (let i = 1; i < 4; i++) {
      const r = lastRow - dr * i, c = lastCol - dc * i;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) break;
      if (board[idx(r, c)] !== seat) break;
      line.unshift([r, c]);
    }
    if (line.length >= 4) return line.slice(0, 4);
  }
  return null;
}

export function connect4Reduce(state: Connect4State, action: Connect4Action, seat: Seat): Connect4State {
  if (state.winner !== null) return state;
  if (seat !== state.turn) return state;
  if (action.type !== "drop") return state;
  if (action.col < 0 || action.col >= COLS) return state;
  const row = findDropRow(state.board, action.col);
  if (row < 0) return state;
  const nextBoard = state.board.slice();
  nextBoard[idx(row, action.col)] = state.turn;
  const line = findWinningLine(nextBoard, row, action.col, state.turn);
  const movesPlayed = state.movesPlayed + 1;
  if (line) {
    return { ...state, board: nextBoard, winner: state.turn, winningLine: line, movesPlayed };
  }
  if (movesPlayed >= COLS * ROWS) {
    return { ...state, board: nextBoard, winner: "draw", winningLine: null, movesPlayed };
  }
  return {
    ...state,
    board: nextBoard,
    turn: (state.turn === 0 ? 1 : 0),
    winner: null,
    winningLine: null,
    movesPlayed,
  };
}

export function connect4Terminal(state: Connect4State): { winner: Seat | "draw"; score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === "draw") return { winner: "draw", score: 50 };
  const winner: Seat = state.winner === 0 ? 0 : 1;
  return { winner, score: 100 };
}
