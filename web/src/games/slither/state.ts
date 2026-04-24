import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Slither — 8×8 grid. Snake-chain based.
// Each player has N pieces. Pieces form "chains" (orthogonally connected groups).
// On your turn, move one piece to a square adjacent (orthogonally) to another of your pieces.
// The piece must remain connected to the chain after moving (can't disconnect others).
// Win: have the longest connected chain (by piece count) when no more moves are possible,
//      OR be first to form a connected chain of 6+ pieces.
// Simplified: players start with 8 pieces each in rows. Each turn move a piece.
// Win by first achieving a chain of 6+, or by longest chain when board fills.

export type Player = 0 | 1;
export type Cell = Player | null;

export interface SlitherState {
  board: Cell[]; // 8×8 row-major
  turn: Player;
  winner: Player | null;
  selected: number | null;
  rngSeed: number;
  movesMade: number;
}

export type SlitherAction =
  | { type: "select"; idx: number }
  | { type: "move"; to: number };

export function rc(row: number, col: number): number { return row * 8 + col; }
export function rowOf(i: number): number { return Math.floor(i / 8); }
export function colOf(i: number): number { return i % 8; }
function inB(r: number, c: number): boolean { return r >= 0 && r < 8 && c >= 0 && c < 8; }

const DIRS4: [number, number][] = [[0,1],[0,-1],[1,0],[-1,0]];

function orthoNeighbors(idx: number): number[] {
  const r = rowOf(idx), c = colOf(idx);
  const result: number[] = [];
  for (const [dr, dc] of DIRS4) {
    const nr = r + dr, nc = c + dc;
    if (inB(nr, nc)) result.push(rc(nr, nc));
  }
  return result;
}

// Get connected group of player starting at idx
function getGroup(board: Cell[], start: number, player: Player): Set<number> {
  const group = new Set<number>();
  if (board[start] !== player) return group;
  const queue = [start];
  group.add(start);
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const n of orthoNeighbors(cur)) {
      if (!group.has(n) && board[n] === player) {
        group.add(n);
        queue.push(n);
      }
    }
  }
  return group;
}

export function largestChain(board: Cell[], player: Player): number {
  const visited = new Set<number>();
  let max = 0;
  for (let i = 0; i < 64; i++) {
    if (board[i] !== player || visited.has(i)) continue;
    const group = getGroup(board, i, player);
    for (const x of group) visited.add(x);
    if (group.size > max) max = group.size;
  }
  return max;
}

// A move is valid if:
// 1. 'to' is empty and adjacent to at least one piece of player (other than 'from')
// 2. After moving from→to, the remaining pieces are still all connected (or if disconnected before, not worse)
// Actually simplified rule: just need 'to' adjacent to any remaining own piece after 'from' leaves.
function remainsConnected(board: Cell[], from: number, player: Player): boolean {
  // Check if all player pieces (excluding 'from') form a single connected group
  const pieces: number[] = [];
  for (let i = 0; i < 64; i++) {
    if (board[i] === player && i !== from) pieces.push(i);
  }
  if (pieces.length === 0) return true;
  const visited = new Set<number>();
  const queue = [pieces[0]!];
  visited.add(pieces[0]!);
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const n of orthoNeighbors(cur)) {
      if (board[n] === player && n !== from && !visited.has(n)) {
        visited.add(n);
        queue.push(n);
      }
    }
  }
  return visited.size === pieces.length;
}

export function getLegalMoves(board: Cell[], from: number, player: Player): number[] {
  if (board[from] !== player) return [];
  const targets: number[] = [];

  // Check if removing 'from' disconnects remaining chain
  if (!remainsConnected(board, from, player)) return []; // can't move this piece

  for (const [dr, dc] of DIRS4) {
    const nr = rowOf(from) + dr, nc = colOf(from) + dc;
    if (!inB(nr, nc)) continue;
    const ni = rc(nr, nc);
    if (board[ni] !== null) continue; // must be empty
    // Must be adjacent to another own piece after moving (i.e., the target has a neighbor that is own and != from)
    const hasOwnNeighbor = orthoNeighbors(ni).some((n) => n !== from && board[n] === player);
    if (hasOwnNeighbor) targets.push(ni);
  }
  return targets;
}

function allMovesFor(board: Cell[], player: Player): Array<{ from: number; to: number }> {
  const moves: Array<{ from: number; to: number }> = [];
  for (let i = 0; i < 64; i++) {
    if (board[i] !== player) continue;
    for (const to of getLegalMoves(board, i, player)) moves.push({ from: i, to });
  }
  return moves;
}

function checkWinner(board: Cell[]): Player | null {
  // Win condition: chain of 6+
  if (largestChain(board, 0) >= 6) return 0;
  if (largestChain(board, 1) >= 6) return 1;
  return null;
}

function getBotMove(state: SlitherState): { from: number; to: number } | null {
  const rng = mulberry32(state.rngSeed);
  const moves = allMovesFor(state.board, 1);
  if (moves.length === 0) return null;
  // Check immediate win
  for (const m of moves) {
    const nb = [...state.board] as Cell[];
    nb[m.from] = null; nb[m.to] = 1;
    if (largestChain(nb, 1) >= 6) return m;
  }
  // Block human near-win
  for (const m of allMovesFor(state.board, 0)) {
    const nb = [...state.board] as Cell[];
    nb[m.from] = null; nb[m.to] = 0;
    if (largestChain(nb, 0) >= 5) {
      // Block: find a bot move that prevents this
      for (const bm of moves) {
        const nb2 = [...state.board] as Cell[];
        nb2[bm.from] = null; nb2[bm.to] = 1;
        if (largestChain(nb2, 0) < 5) return bm;
      }
    }
  }
  // Greedy: maximize own chain
  let best: { from: number; to: number } | null = null;
  let bestScore = -Infinity;
  for (const m of moves) {
    const nb = [...state.board] as Cell[];
    nb[m.from] = null; nb[m.to] = 1;
    const score = largestChain(nb, 1);
    if (score > bestScore) { bestScore = score; best = m; }
  }
  return best ?? moves[Math.floor(rng() * moves.length)]!;
}

export function initialState(seed: number): SlitherState {
  const board: Cell[] = new Array(64).fill(null);
  // Human (0): row 6 cols 1-8 (indices 8 pieces)
  for (let c = 0; c < 8; c++) board[rc(6, c)] = 0;
  // Bot (1): row 1 cols 1-8
  for (let c = 0; c < 8; c++) board[rc(1, c)] = 1;
  return { board, turn: 0, winner: null, selected: null, rngSeed: seed, movesMade: 0 };
}

function runBot(state: SlitherState): SlitherState {
  let s = state;
  while (s.turn === 1 && s.winner === null) {
    const rng = mulberry32(s.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const mv = getBotMove(s);
    if (!mv) {
      // Bot can't move: check chains
      const hc = largestChain(s.board, 0);
      const bc = largestChain(s.board, 1);
      return { ...s, winner: hc >= bc ? 0 : 1, rngSeed: nextSeed };
    }
    const nb = [...s.board] as Cell[];
    nb[mv.from] = null; nb[mv.to] = 1;
    const winner = checkWinner(nb);
    s = { ...s, board: nb, winner, turn: 0, selected: null, movesMade: s.movesMade + 1, rngSeed: nextSeed };
    break;
  }
  return s;
}

export function reducer(state: SlitherState, action: SlitherAction): SlitherState {
  if (state.winner !== null || state.turn !== 0) return state;

  if (action.type === "select") {
    if (state.board[action.idx] !== 0) {
      return { ...state, selected: null };
    }
    return { ...state, selected: state.selected === action.idx ? null : action.idx };
  }

  if (action.type === "move") {
    if (state.selected === null) return state;
    const legal = getLegalMoves(state.board, state.selected, 0);
    if (!legal.includes(action.to)) return state;
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const nb = [...state.board] as Cell[];
    nb[state.selected] = null;
    nb[action.to] = 0;
    const winner = checkWinner(nb);
    // Check if human has no moves (draw/loss)
    let next: SlitherState = { ...state, board: nb, winner, turn: 1, selected: null, movesMade: state.movesMade + 1, rngSeed: nextSeed };
    if (winner !== null) return next;
    next = runBot(next);
    return next;
  }

  return state;
}

export function isTerminal(state: SlitherState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}
