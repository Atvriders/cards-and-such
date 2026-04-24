import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Gomoku Pro Rules (Renju-lite) on 15×15 board
// Black has opening restrictions: no double-three, no double-four, no overline (6+ in a row)
// White plays freely
// Player = "black" (goes first), Bot = "white"
// Win: 5 in a row (exactly for black, 5+ for white)

export const SIZE = 15;
export type Cell = "black" | "white" | null;
export type Board = Cell[];

export interface GomokuProSettings {
  opponent: "bot";
}

export interface GomokuProState {
  settings: GomokuProSettings;
  rngSeed: number;
  board: Board;
  turn: "black" | "white";
  winner: "black" | "white" | null;
  winningLine: number[] | null;
}

export type GomokuProAction = { type: "place"; pos: number };

export function initialState(seed: number, settings: GomokuProSettings): GomokuProState {
  return {
    settings,
    rngSeed: seed,
    board: new Array(SIZE * SIZE).fill(null),
    turn: "black",
    winner: null,
    winningLine: null,
  };
}

function posRC(r: number, c: number): number { return r * SIZE + c; }
function rowOf(p: number): number { return Math.floor(p / SIZE); }
function colOf(p: number): number { return p % SIZE; }

// Count consecutive in a direction
function countDir(board: Board, pos: number, dr: number, dc: number, color: Cell): number {
  let count = 0;
  let r = rowOf(pos) + dr;
  let c = colOf(pos) + dc;
  while (r >= 0 && r < SIZE && c >= 0 && c < SIZE && board[posRC(r, c)] === color) {
    count++;
    r += dr;
    c += dc;
  }
  return count;
}

function lineLength(board: Board, pos: number, dr: number, dc: number, color: Cell): number {
  return 1 + countDir(board, pos, dr, dc, color) + countDir(board, pos, -dr, -dc, color);
}

const DIRS: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]];

export function checkWin(board: Board, pos: number, color: Cell): number[] | null {
  if (color === null) return null;
  for (const [dr, dc] of DIRS) {
    const len = lineLength(board, pos, dr, dc, color);
    if (color === "white" && len >= 5) {
      // Build winning line
      const line: number[] = [pos];
      let r = rowOf(pos) - dr; let c = colOf(pos) - dc;
      while (r >= 0 && r < SIZE && c >= 0 && c < SIZE && board[posRC(r, c)] === color) {
        line.push(posRC(r, c)); r -= dr; c -= dc;
      }
      r = rowOf(pos) + dr; c = colOf(pos) + dc;
      while (r >= 0 && r < SIZE && c >= 0 && c < SIZE && board[posRC(r, c)] === color) {
        line.push(posRC(r, c)); r += dr; c += dc;
      }
      return line;
    }
    if (color === "black" && len === 5) {
      const line: number[] = [pos];
      let r = rowOf(pos) - dr; let c = colOf(pos) - dc;
      while (r >= 0 && r < SIZE && c >= 0 && c < SIZE && board[posRC(r, c)] === color) {
        line.push(posRC(r, c)); r -= dr; c -= dc;
      }
      r = rowOf(pos) + dr; c = colOf(pos) + dc;
      while (r >= 0 && r < SIZE && c >= 0 && c < SIZE && board[posRC(r, c)] === color) {
        line.push(posRC(r, c)); r += dr; c += dc;
      }
      return line;
    }
  }
  return null;
}

// Count open-ended fours in a direction (for forbidden-move detection)
function countOpenFours(board: Board, pos: number, color: "black"): number {
  let fours = 0;
  for (const [dr, dc] of DIRS) {
    const len = lineLength(board, pos, dr, dc, color);
    if (len === 4) fours++;
  }
  return fours;
}

function countOpenThrees(board: Board, pos: number, color: "black"): number {
  // Simplified: count open-3 patterns
  let threes = 0;
  for (const [dr, dc] of DIRS) {
    const len = lineLength(board, pos, dr, dc, color);
    if (len === 3) {
      // Check both ends open
      const r0 = rowOf(pos), c0 = colOf(pos);
      const beforeR = r0 - dr * (countDir(board, pos, -dr, -dc, color) + 1);
      const beforeC = c0 - dc * (countDir(board, pos, -dr, -dc, color) + 1);
      const afterR = r0 + dr * (countDir(board, pos, dr, dc, color) + 1);
      const afterC = c0 + dc * (countDir(board, pos, dr, dc, color) + 1);
      const beforeOpen = beforeR >= 0 && beforeR < SIZE && beforeC >= 0 && beforeC < SIZE && board[posRC(beforeR, beforeC)] === null;
      const afterOpen = afterR >= 0 && afterR < SIZE && afterC >= 0 && afterC < SIZE && board[posRC(afterR, afterC)] === null;
      if (beforeOpen && afterOpen) threes++;
    }
  }
  return threes;
}

// Check if placing black at pos violates forbidden-move rules (exported for UI)
export function isForbiddenCell(board: Board, pos: number): boolean {
  return isForbidden(board, pos);
}

// Check if placing black at pos violates forbidden-move rules
function isForbidden(board: Board, pos: number): boolean {
  const testBoard = [...board];
  testBoard[pos] = "black";

  // Overline check
  for (const [dr, dc] of DIRS) {
    if (lineLength(testBoard, pos, dr, dc, "black") > 5) return true;
  }

  // Double-four
  if (countOpenFours(testBoard, pos, "black") >= 2) return true;

  // Double-three
  if (countOpenThrees(testBoard, pos, "black") >= 2) return true;

  return false;
}

// Bot: simple heuristic — try to form 4-in-a-row, else pick near last move
function evaluatePos(board: Board, pos: number, color: Cell): number {
  if (color === null || board[pos] !== null) return -1;
  const testBoard = [...board];
  testBoard[pos] = color;
  let score = 0;
  for (const [dr, dc] of DIRS) {
    const len = lineLength(testBoard, pos, dr, dc, color);
    if (len >= 5) score += 10000;
    else if (len === 4) score += 100;
    else if (len === 3) score += 10;
    else if (len === 2) score += 1;
  }
  return score;
}

function runBot(state: GomokuProState): GomokuProState {
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  // Find candidate moves near existing pieces
  const occupied = new Set<number>();
  for (let i = 0; i < SIZE * SIZE; i++) {
    if (state.board[i] !== null) occupied.add(i);
  }

  const candidates = new Set<number>();
  for (const p of occupied) {
    const r = rowOf(p); const c = colOf(p);
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        const nr = r + dr; const nc = c + dc;
        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && state.board[posRC(nr, nc)] === null) {
          candidates.add(posRC(nr, nc));
        }
      }
    }
  }

  if (candidates.size === 0) {
    // First move: play centre
    candidates.add(posRC(7, 7));
  }

  let best = -1;
  let bestScore = -1;

  for (const pos of candidates) {
    // White wants to win or block black
    const ownScore = evaluatePos(state.board, pos, "white");
    const oppScore = evaluatePos(state.board, pos, "black");
    const score = Math.max(ownScore, oppScore) + Math.floor(rng() * 3);
    if (score > bestScore) {
      bestScore = score;
      best = pos;
    }
  }

  if (best === -1) return { ...state, rngSeed: nextSeed };

  const newBoard = [...state.board];
  newBoard[best] = "white";
  const winLine = checkWin(newBoard, best, "white");

  return {
    ...state,
    rngSeed: nextSeed,
    board: newBoard,
    turn: "black",
    winner: winLine ? "white" : null,
    winningLine: winLine,
  };
}

export function reducer(state: GomokuProState, action: GomokuProAction): GomokuProState {
  if (action.type !== "place") return state;
  if (state.winner !== null) return state;
  if (state.turn !== "black") return state;

  const { pos } = action;
  if (pos < 0 || pos >= SIZE * SIZE) return state;
  if (state.board[pos] !== null) return state;

  // Check forbidden move for black
  if (isForbidden(state.board, pos)) return state;

  const newBoard = [...state.board];
  newBoard[pos] = "black";
  const winLine = checkWin(newBoard, pos, "black");
  if (winLine) {
    return { ...state, board: newBoard, winner: "black", winningLine: winLine };
  }

  const afterPlayer: GomokuProState = {
    ...state,
    board: newBoard,
    turn: "white",
  };

  return runBot(afterPlayer);
}

export function isTerminal(state: GomokuProState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === "black" ? 30 : 0 };
}
