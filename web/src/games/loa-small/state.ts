import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { minimax } from "../../engines/grid/minimax.js";

// Lines of Action — 6×6 variant.
// Human (0) = dark pieces on left and right columns (col 0 and col 5) — 10 pieces total
// Bot (1) = light pieces on top and bottom rows (row 0 and row 5) — 10 pieces total
// (Corner squares are shared; for 6×6 we use standard setup without corners)
//
// Standard LOA start:
//   Row 0 and Row 5: bot pieces except corners
//   Col 0 and Col 5: human pieces except corners
//
// Move: a piece moves exactly N squares in any of 8 directions,
//   where N = total pieces (own + opponent) on that file/rank/diagonal (the "line" of action).
//   It may jump over own pieces but NOT land on them.
//   It may jump over opponent pieces but captures if it LANDS on one.
//
// Win: connect ALL your remaining pieces into a single orthogonally- or diagonally-connected group.

export type Player = 0 | 1;
export type Cell = Player | null;

export interface LoaSmallState {
  board: Cell[]; // 6×6 row-major
  turn: Player;
  winner: Player | null;
  selected: number | null;
  rngSeed: number;
  movesMade: number;
}

export type LoaSmallAction =
  | { type: "select"; idx: number }
  | { type: "move"; to: number };

export function rc(row: number, col: number): number { return row * 6 + col; }
export function rowOf(i: number): number { return Math.floor(i / 6); }
export function colOf(i: number): number { return i % 6; }
function inB(r: number, c: number): boolean { return r >= 0 && r < 6 && c >= 0 && c < 6; }

// Count pieces on a line passing through (row, col) in direction (dr, dc)
function countLine(board: Cell[], row: number, col: number, dr: number, dc: number): number {
  let count = 0;
  // Traverse the whole row/col/diagonal
  let r = row, c = col;
  // Go forward
  while (inB(r, c)) {
    if (board[rc(r, c)] !== null) count++;
    r += dr; c += dc;
  }
  // Go backward (from original position)
  r = row - dr; c = col - dc;
  while (inB(r, c)) {
    if (board[rc(r, c)] !== null) count++;
    r -= dr; c -= dc;
  }
  return count;
}

const DIRS: [number, number][] = [
  [0, 1], [0, -1], [1, 0], [-1, 0],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
];

export function getLegalMovesFrom(board: Cell[], from: number, player: Player): number[] {
  if (board[from] !== player) return [];
  const r = rowOf(from), c = colOf(from);
  const targets: number[] = [];

  for (const [dr, dc] of DIRS) {
    const n = countLine(board, r, c, dr, dc);
    const nr = r + dr * n, nc = c + dc * n;
    if (!inB(nr, nc)) continue;
    const dest = rc(nr, nc);
    if (board[dest] === player) continue; // can't land on own piece

    // Check path
    let pathOk = true;
    for (let d = 1; d < n; d++) {
      const pr = r + dr * d, pc = c + dc * d;
      if (!inB(pr, pc)) { pathOk = false; break; }
    }
    if (!pathOk) continue;

    targets.push(dest);
  }
  return targets;
}

function allMovesFor(board: Cell[], player: Player): Array<{ from: number; to: number }> {
  const moves: Array<{ from: number; to: number }> = [];
  for (let i = 0; i < 36; i++) {
    if (board[i] !== player) continue;
    for (const to of getLegalMovesFrom(board, i, player)) {
      moves.push({ from: i, to });
    }
  }
  return moves;
}

// Check if all pieces of a player form a single connected group
export function isConnected(board: Cell[], player: Player): boolean {
  const pieces: number[] = [];
  for (let i = 0; i < 36; i++) if (board[i] === player) pieces.push(i);
  if (pieces.length === 0) return true; // vacuously connected

  const visited = new Set<number>();
  const queue = [pieces[0]!];
  visited.add(pieces[0]!);
  while (queue.length > 0) {
    const cur = queue.shift()!;
    const r = rowOf(cur), c = colOf(cur);
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (!inB(nr, nc)) continue;
      const ni = rc(nr, nc);
      if (board[ni] === player && !visited.has(ni)) {
        visited.add(ni);
        queue.push(ni);
      }
    }
  }
  return visited.size === pieces.length;
}

// Evaluate: count clusters (lower = better); connectivity score
function countGroups(board: Cell[], player: Player): number {
  const pieces = new Set<number>();
  for (let i = 0; i < 36; i++) if (board[i] === player) pieces.add(i);
  if (pieces.size === 0) return 0;
  const visited = new Set<number>();
  let groups = 0;
  for (const start of pieces) {
    if (visited.has(start)) continue;
    groups++;
    const queue = [start];
    visited.add(start);
    while (queue.length > 0) {
      const cur = queue.shift()!;
      const r = rowOf(cur), c = colOf(cur);
      for (const [dr, dc] of DIRS) {
        const nr = r + dr, nc = c + dc;
        if (!inB(nr, nc)) continue;
        const ni = rc(nr, nc);
        if (pieces.has(ni) && !visited.has(ni)) { visited.add(ni); queue.push(ni); }
      }
    }
  }
  return groups;
}

function evalLoa(board: Cell[]): number {
  // Bot wants own groups → 1, human groups → more
  const botGroups = countGroups(board, 1);
  const humanGroups = countGroups(board, 0);
  return humanGroups - botGroups; // positive = good for bot
}

interface BotState { board: Cell[]; turn: Player }

function getBotMove(state: LoaSmallState): { from: number; to: number } | null {
  const res = minimax<BotState, { from: number; to: number }>(
    { board: state.board, turn: 1 },
    {
      depth: 2,
      moves(s) { return allMovesFor(s.board, s.turn); },
      apply(s, m) {
        const nb = [...s.board] as Cell[];
        nb[m.from] = null;
        nb[m.to] = s.turn;
        return { board: nb, turn: s.turn === 0 ? 1 : 0 };
      },
      isTerminal(s) { return isConnected(s.board, 0) || isConnected(s.board, 1); },
      evaluate(s) { return evalLoa(s.board); },
      maximizing(s) { return s.turn === 1; },
    }
  );
  return res.move;
}

export function initialState(seed: number): LoaSmallState {
  const board: Cell[] = new Array(36).fill(null);
  // Bot (1): row 0 and row 5, excluding corners
  for (let c = 1; c < 5; c++) { board[rc(0, c)] = 1; board[rc(5, c)] = 1; }
  // Human (0): col 0 and col 5, excluding corners
  for (let r = 1; r < 5; r++) { board[rc(r, 0)] = 0; board[rc(r, 5)] = 0; }
  return { board, turn: 0, winner: null, selected: null, rngSeed: seed, movesMade: 0 };
}

function checkWinner(board: Cell[], lastPlayer: Player): Player | null {
  const opp: Player = lastPlayer === 0 ? 1 : 0;
  // After lastPlayer's move, check if lastPlayer wins (connected) first, then opponent
  if (isConnected(board, lastPlayer)) return lastPlayer;
  if (isConnected(board, opp)) return opp;
  return null;
}

function runBot(state: LoaSmallState): LoaSmallState {
  let s = state;
  while (s.turn === 1 && s.winner === null) {
    const rng = mulberry32(s.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const mv = getBotMove(s);
    if (!mv) return { ...s, winner: 0, rngSeed: nextSeed };
    const nb = [...s.board] as Cell[];
    nb[mv.from] = null;
    nb[mv.to] = 1;
    const winner = checkWinner(nb, 1);
    s = { ...s, board: nb, winner, turn: 0, selected: null, movesMade: s.movesMade + 1, rngSeed: nextSeed };
    break;
  }
  return s;
}

export function reducer(state: LoaSmallState, action: LoaSmallAction): LoaSmallState {
  if (state.winner !== null || state.turn !== 0) return state;

  if (action.type === "select") {
    if (state.board[action.idx] !== 0) {
      if (state.selected !== null) return { ...state, selected: null };
      return state;
    }
    return { ...state, selected: state.selected === action.idx ? null : action.idx };
  }

  if (action.type === "move") {
    if (state.selected === null) return state;
    const legal = getLegalMovesFrom(state.board, state.selected, 0);
    if (!legal.includes(action.to)) return state;
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const nb = [...state.board] as Cell[];
    nb[state.selected] = null;
    nb[action.to] = 0;
    const winner = checkWinner(nb, 0);
    let next: LoaSmallState = { ...state, board: nb, winner, turn: 1, selected: null, movesMade: state.movesMade + 1, rngSeed: nextSeed };
    if (winner !== null) return next;
    next = runBot(next);
    return next;
  }

  return state;
}

export function isTerminal(state: LoaSmallState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}
