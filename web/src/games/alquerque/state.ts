import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { minimax } from "../../engines/grid/minimax.js";

// Alquerque — 5×5 board with Alquerque-style adjacency
// Seat 0 = White (player), Seat 1 = Black (bot)
// Each player has 12 pieces. White fills rows 3,4 + left 2 of row 2.
// Black fills rows 0,1 + right 2 of row 2. Center row 2 col 2 is empty.
// Moves: step to adjacent connected empty cell.
// Capture: jump over adjacent opponent into empty space beyond (like checkers, but in more directions).
// Multiple jumps allowed in one turn.
// Player who captures all opponent pieces wins.

export const SIZE = 5;
export const TOTAL = SIZE * SIZE;

export type Cell = 0 | 1 | null;

function buildAdjacency(): ReadonlyArray<readonly number[]> {
  const adj: number[][] = Array.from({ length: TOTAL }, () => []);
  function pos(r: number, c: number): number { return r * SIZE + c; }

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const p = pos(r, c);
      const orth: [number, number][] = [[-1,0],[1,0],[0,-1],[0,1]];
      for (const [dr, dc] of orth) {
        const nr = r + dr; const nc = c + dc;
        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) adj[p]!.push(pos(nr, nc));
      }
      // Diagonal at even-sum cells
      if ((r + c) % 2 === 0) {
        const diag: [number, number][] = [[-1,-1],[-1,1],[1,-1],[1,1]];
        for (const [dr, dc] of diag) {
          const nr = r + dr; const nc = c + dc;
          if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) adj[p]!.push(pos(nr, nc));
        }
      }
    }
  }
  return adj;
}

export const ADJACENCY = buildAdjacency();

export interface AlquerqueSettings { dummy?: string }

export interface AlquerqueState {
  board: readonly Cell[];
  turn: 0 | 1;
  selected: number | null;
  chainFrom: number | null; // mid-capture position
  winner: 0 | 1 | null;
  rngSeed: number;
  settings: AlquerqueSettings;
}

export type AlquerqueAction =
  | { type: "select"; pos: number }
  | { type: "jump"; to: number }
  | { type: "move"; to: number };

function pos(r: number, c: number): number { return r * SIZE + c; }

export function initialState(seed: number, settings: AlquerqueSettings): AlquerqueState {
  const board: Cell[] = new Array(TOTAL).fill(null);
  // Black fills rows 0,1 + positions at row 2, cols 3,4
  for (let c = 0; c < SIZE; c++) {
    board[pos(0, c)] = 1;
    board[pos(1, c)] = 1;
  }
  board[pos(2, 3)] = 1;
  board[pos(2, 4)] = 1;
  // White fills rows 3,4 + positions at row 2, cols 0,1
  for (let c = 0; c < SIZE; c++) {
    board[pos(3, c)] = 0;
    board[pos(4, c)] = 0;
  }
  board[pos(2, 0)] = 0;
  board[pos(2, 1)] = 0;
  // Center (2,2) is empty

  return { board, turn: 0, selected: null, chainFrom: null, winner: null, rngSeed: seed, settings };
}

// Get jump moves (captures) from pos
export function jumpMoves(board: readonly Cell[], pos: number, seat: 0 | 1): { to: number; over: number }[] {
  const opp = seat === 0 ? 1 : 0;
  const moves: { to: number; over: number }[] = [];
  const adj = ADJACENCY[pos]!;

  for (const mid of adj) {
    if (board[mid] !== opp) continue;
    // Find landing square: pos + (mid - pos) * 2
    const r1 = Math.floor(pos / SIZE); const c1 = pos % SIZE;
    const r2 = Math.floor(mid / SIZE); const c2 = mid % SIZE;
    const r3 = r2 + (r2 - r1); const c3 = c2 + (c2 - c1);
    if (r3 < 0 || r3 >= SIZE || c3 < 0 || c3 >= SIZE) continue;
    const landing = r3 * SIZE + c3;
    if (board[landing] !== null) continue;
    // Must be in direction that's valid (connected along a line)
    moves.push({ to: landing, over: mid });
  }
  return moves;
}

export function stepMoves(board: readonly Cell[], posIdx: number): number[] {
  return ADJACENCY[posIdx]!.filter(t => board[t] === null);
}

function checkWinner(board: readonly Cell[]): 0 | 1 | null {
  if (!board.some(c => c === 1)) return 0;
  if (!board.some(c => c === 0)) return 1;
  return null;
}

function hasCaptures(board: readonly Cell[], seat: 0 | 1): boolean {
  return board.some((cell, p) => cell === seat && jumpMoves(board, p, seat).length > 0);
}

// Minimax
interface BotState { board: readonly Cell[]; turn: 0 | 1 }
type BotMove = { from: number; to: number; over: number | null };

function botMovesList(s: BotState): BotMove[] {
  const seat = s.turn;
  const jumps: BotMove[] = [];
  const steps: BotMove[] = [];
  s.board.forEach((cell, from) => {
    if (cell !== seat) return;
    for (const j of jumpMoves(s.board, from, seat)) jumps.push({ from, to: j.to, over: j.over });
    for (const to of stepMoves(s.board, from)) steps.push({ from, to, over: null });
  });
  return jumps.length > 0 ? jumps : steps;
}

function applyBotMove(s: BotState, move: BotMove): BotState {
  const board = [...s.board] as Cell[];
  board[move.to] = board[move.from] ?? null;
  board[move.from] = null;
  if (move.over !== null) board[move.over] = null;
  return { board, turn: s.turn === 0 ? 1 : 0 };
}

function evaluateBot(s: BotState): number {
  const whites = s.board.filter(c => c === 0).length;
  const blacks = s.board.filter(c => c === 1).length;
  return blacks - whites;
}

function botIsTerminal(s: BotState): boolean {
  if (checkWinner(s.board) !== null) return true;
  return botMovesList(s).length === 0;
}

function getBotMove(state: AlquerqueState): BotMove | null {
  const bs: BotState = { board: state.board, turn: state.turn };
  const result = minimax<BotState, BotMove>(bs, {
    depth: 3,
    moves: botMovesList,
    apply: applyBotMove,
    isTerminal: botIsTerminal,
    evaluate: evaluateBot,
    maximizing: (s) => s.turn === 1,
  });
  return result.move;
}

function applyActionToState(state: AlquerqueState, from: number, to: number, over: number | null): AlquerqueState {
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const board = [...state.board] as Cell[];
  board[to] = board[from] ?? null;
  board[from] = null;
  if (over !== null) board[over] = null;

  const winner = checkWinner(board);

  // Check for chain capture
  const canChain = over !== null && jumpMoves(board, to, state.turn).length > 0;
  if (canChain && !winner) {
    return { ...state, board, selected: to, chainFrom: to, winner: null, rngSeed: nextSeed };
  }

  const nextTurn = (state.turn === 0 ? 1 : 0) as 0 | 1;
  return { ...state, board, turn: nextTurn, selected: null, chainFrom: null, winner, rngSeed: nextSeed };
}

function runBotMoves(state: AlquerqueState): AlquerqueState {
  let s = state;
  let limit = 20;
  while (s.winner === null && s.turn === 1 && limit-- > 0) {
    const move = getBotMove(s);
    if (!move) break;
    s = applyActionToState(s, move.from, move.to, move.over);
    // End any chain for bot (simplified)
    if (s.chainFrom !== null) {
      s = { ...s, turn: 0 as const, chainFrom: null, selected: null };
    }
  }
  return s;
}

export function reducer(state: AlquerqueState, action: AlquerqueAction): AlquerqueState {
  if (state.winner !== null) return state;
  if (state.turn !== 0) return state;

  const seat = state.turn;
  const mustCapture = hasCaptures(state.board, seat);

  if (action.type === "select") {
    if (state.chainFrom !== null && action.pos !== state.chainFrom) return state;
    if (state.board[action.pos] !== seat) return state;
    // If must capture, only allow selecting pieces that have captures
    if (mustCapture && jumpMoves(state.board, action.pos, seat).length === 0) return state;
    return { ...state, selected: action.pos };
  }

  if (action.type === "jump") {
    const from = state.chainFrom ?? state.selected;
    if (from === null || state.board[from] !== seat) return state;
    const jumps = jumpMoves(state.board, from, seat);
    const jump = jumps.find(j => j.to === action.to);
    if (!jump) return state;
    const next = applyActionToState(state, from, action.to, jump.over);
    if (next.winner !== null) return next;
    if (next.chainFrom !== null) return next;
    return runBotMoves(next);
  }

  if (action.type === "move") {
    if (mustCapture || state.chainFrom !== null) return state; // must capture if possible
    if (state.selected === null) return state;
    if (!ADJACENCY[state.selected]!.includes(action.to)) return state;
    if (state.board[action.to] !== null) return state;
    const next = applyActionToState(state, state.selected, action.to, null);
    if (next.winner !== null) return next;
    return runBotMoves(next);
  }

  return state;
}

export function isTerminal(state: AlquerqueState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}
