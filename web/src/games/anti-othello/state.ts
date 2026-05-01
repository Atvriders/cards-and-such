import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Anti-Othello (Reversi misère): same placement rules as Reversi, but FEWEST discs wins.

export type Cell = 0 | 1 | null;

export interface AntiOthelloSettings {
  botStrength: "easy" | "hard";
}

export interface AntiOthelloState {
  settings: AntiOthelloSettings;
  board: readonly Cell[];
  turn: 0 | 1;
  blackCount: number;
  whiteCount: number;
  lastPass: boolean;
  winner: 0 | 1 | "draw" | null;
  movesMade: number;
  rngSeed: number;
}

export type AntiOthelloAction =
  | { type: "place"; row: number; col: number }
  | { type: "pass" };

export const SIZE = 8;

const DIRS: ReadonlyArray<readonly [number, number]> = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1],
];

export function idx(r: number, c: number): number { return r * SIZE + c; }

export function flipsAt(board: readonly Cell[], seat: 0 | 1, r: number, c: number): number[] {
  if (board[idx(r, c)] !== null) return [];
  const opp: 0 | 1 = seat === 0 ? 1 : 0;
  const all: number[] = [];
  for (const [dr, dc] of DIRS) {
    const line: number[] = [];
    let nr = r + dr;
    let nc = c + dc;
    while (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[idx(nr, nc)] === opp) {
      line.push(idx(nr, nc));
      nr += dr;
      nc += dc;
    }
    if (line.length > 0 && nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[idx(nr, nc)] === seat) {
      all.push(...line);
    }
  }
  return all;
}

export function legalMoves(board: readonly Cell[], seat: 0 | 1): Array<{ row: number; col: number }> {
  const out: Array<{ row: number; col: number }> = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[idx(r, c)] !== null) continue;
      if (flipsAt(board, seat, r, c).length > 0) out.push({ row: r, col: c });
    }
  }
  return out;
}

function applyPlace(board: readonly Cell[], seat: 0 | 1, r: number, c: number): Cell[] {
  const flips = flipsAt(board, seat, r, c);
  const next = [...board] as Cell[];
  next[idx(r, c)] = seat;
  for (const i of flips) next[i] = seat;
  return next;
}

function counts(board: readonly Cell[]): { black: number; white: number } {
  let black = 0, white = 0;
  for (const c of board) {
    if (c === 0) black++;
    else if (c === 1) white++;
  }
  return { black, white };
}

function endIfDone(board: readonly Cell[]): "draw" | 0 | 1 | null {
  const blackMoves = legalMoves(board, 0).length;
  const whiteMoves = legalMoves(board, 1).length;
  if (blackMoves === 0 && whiteMoves === 0) {
    const { black, white } = counts(board);
    if (black < white) return 0;
    if (white < black) return 1;
    return "draw";
  }
  return null;
}

function pickBotMove(board: readonly Cell[], strength: "easy" | "hard", rng: () => number): { row: number; col: number } | null {
  const moves = legalMoves(board, 1);
  if (moves.length === 0) return null;
  if (strength === "easy") {
    return moves[Math.floor(rng() * moves.length)]!;
  }
  let best = moves[0]!;
  let bestScore = Infinity;
  for (const m of moves) {
    const flips = flipsAt(board, 1, m.row, m.col).length;
    const after = applyPlace(board, 1, m.row, m.col);
    const oppMoves = legalMoves(after, 0).length;
    const score = flips * 10 - oppMoves * 2;
    if (score < bestScore) {
      bestScore = score;
      best = m;
    }
  }
  return best;
}

function runBot(state: AntiOthelloState): AntiOthelloState {
  let s = state;
  while (s.winner === null && s.turn === 1) {
    const rng = mulberry32(s.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const move = pickBotMove(s.board, s.settings.botStrength, rng);
    if (!move) {
      if (s.lastPass) {
        const w = endIfDone(s.board);
        s = { ...s, rngSeed: nextSeed, winner: w ?? "draw" };
      } else {
        s = { ...s, rngSeed: nextSeed, turn: 0, lastPass: true };
      }
      break;
    }
    const newBoard = applyPlace(s.board, 1, move.row, move.col);
    const { black, white } = counts(newBoard);
    s = {
      ...s,
      rngSeed: nextSeed,
      board: newBoard,
      turn: 0,
      lastPass: false,
      blackCount: black,
      whiteCount: white,
      movesMade: s.movesMade + 1,
    };
    const w = endIfDone(newBoard);
    if (w !== null) s = { ...s, winner: w };
    if (s.winner === null && legalMoves(s.board, 0).length === 0) {
      if (legalMoves(s.board, 1).length === 0) {
        const w2 = endIfDone(s.board);
        s = { ...s, winner: w2 ?? "draw" };
        break;
      }
      s = { ...s, turn: 1, lastPass: true };
      continue;
    }
    break;
  }
  return s;
}

export function initialState(seed: number, settings: AntiOthelloSettings): AntiOthelloState {
  const board = new Array<Cell>(64).fill(null);
  board[idx(3, 3)] = 1;
  board[idx(3, 4)] = 0;
  board[idx(4, 3)] = 0;
  board[idx(4, 4)] = 1;
  return {
    settings,
    board,
    turn: 0,
    blackCount: 2,
    whiteCount: 2,
    lastPass: false,
    winner: null,
    movesMade: 0,
    rngSeed: seed,
  };
}

export function reducer(state: AntiOthelloState, action: AntiOthelloAction): AntiOthelloState {
  if (state.winner !== null) return state;

  if (action.type === "pass") {
    if (state.turn !== 0) return state;
    if (legalMoves(state.board, 0).length > 0) return state;
    if (state.lastPass) {
      const w = endIfDone(state.board);
      return { ...state, winner: w ?? "draw" };
    }
    let next: AntiOthelloState = { ...state, turn: 1, lastPass: true };
    next = runBot(next);
    return next;
  }

  if (action.type === "place") {
    if (state.turn !== 0) return state;
    const { row, col } = action;
    if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) return state;
    if (state.board[idx(row, col)] !== null) return state;
    if (flipsAt(state.board, 0, row, col).length === 0) return state;

    const newBoard = applyPlace(state.board, 0, row, col);
    const { black, white } = counts(newBoard);
    let next: AntiOthelloState = {
      ...state,
      board: newBoard,
      turn: 1,
      lastPass: false,
      blackCount: black,
      whiteCount: white,
      movesMade: state.movesMade + 1,
    };
    const w = endIfDone(newBoard);
    if (w !== null) return { ...next, winner: w };
    next = runBot(next);
    return next;
  }

  return state;
}

export function isTerminal(state: AntiOthelloState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === 0) return { score: 100 + (state.whiteCount - state.blackCount) * 5 };
  if (state.winner === "draw") return { score: 50 };
  return { score: Math.max(0, state.whiteCount - 10) };
}
