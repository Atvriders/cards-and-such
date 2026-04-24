import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Kharbaga — North African draughts variant
// 5×5 board, orthogonal movement, pieces on all squares
// Each player has 10 pieces (fills rows 0-1 for black, rows 3-4 for white)
// Captures: orthogonal jump over adjacent opponent to empty square beyond
// Mandatory capture; men capture in all 4 directions
// No kings in standard Kharbaga; win = capture all opponent pieces
// Bot = random legal move

export type Cell = null | "white" | "black";
export type Board = Cell[];

export interface KharbagaSettings {
  opponent: "bot";
}

export interface KharbagaState {
  settings: KharbagaSettings;
  rngSeed: number;
  board: Board;
  turn: "white" | "black";
  selected: number | null;
  mustContinueFrom: number | null;
  winner: "white" | "black" | null;
}

export type KharbagaAction =
  | { type: "select"; pos: number }
  | { type: "move"; to: number };

function posRC(r: number, c: number): number { return r * 5 + c; }
function rowOf(p: number): number { return Math.floor(p / 5); }
function colOf(p: number): number { return p % 5; }
function inBounds(r: number, c: number): boolean { return r >= 0 && r < 5 && c >= 0 && c < 5; }

const DIRS: [number, number][] = [[0, 1], [0, -1], [1, 0], [-1, 0]];

export function initialState(seed: number, settings: KharbagaSettings): KharbagaState {
  const board: Board = new Array(25).fill(null);
  for (let r = 0; r <= 1; r++) {
    for (let c = 0; c < 5; c++) {
      board[posRC(r, c)] = "black";
    }
  }
  for (let r = 3; r <= 4; r++) {
    for (let c = 0; c < 5; c++) {
      board[posRC(r, c)] = "white";
    }
  }
  return {
    settings,
    rngSeed: seed,
    board,
    turn: "white",
    selected: null,
    mustContinueFrom: null,
    winner: null,
  };
}

export interface KharbagaMove {
  from: number;
  to: number;
  captured: number[];
}

function findCaptures(board: Board, from: number, color: "white" | "black", used: Set<number>): KharbagaMove[] {
  const results: KharbagaMove[] = [];
  const r = rowOf(from);
  const c = colOf(from);

  for (const [dr, dc] of DIRS) {
    const mr = r + dr; const mc = c + dc;
    if (!inBounds(mr, mc)) continue;
    const mid = posRC(mr, mc);
    if (board[mid] === null || board[mid] === color || used.has(mid)) continue;
    const lr = mr + dr; const lc = mc + dc;
    if (!inBounds(lr, lc)) continue;
    const land = posRC(lr, lc);
    if (board[land] !== null) continue;

    const newUsed = new Set(used);
    newUsed.add(mid);
    const newBoard = [...board];
    newBoard[from] = null;
    newBoard[land] = color;

    const chains = findCaptures(newBoard as Board, land, color, newUsed);
    if (chains.length === 0) {
      results.push({ from, to: land, captured: [...newUsed] });
    } else {
      for (const ch of chains) {
        results.push({ from, to: ch.to, captured: ch.captured });
      }
    }
  }
  return results;
}

function getSimple(board: Board, from: number, color: "white" | "black"): KharbagaMove[] {
  const moves: KharbagaMove[] = [];
  const r = rowOf(from); const c = colOf(from);
  for (const [dr, dc] of DIRS) {
    const nr = r + dr; const nc = c + dc;
    if (inBounds(nr, nc) && board[posRC(nr, nc)] === null) {
      moves.push({ from, to: posRC(nr, nc), captured: [] });
    }
  }
  return moves;
}

export function getLegalMoves(board: Board, color: "white" | "black", mustContinue: number | null): KharbagaMove[] {
  const sources = mustContinue !== null
    ? [mustContinue]
    : Array.from({ length: 25 }, (_, i) => i).filter((i) => board[i] === color);

  const captures: KharbagaMove[] = [];
  const simple: KharbagaMove[] = [];

  for (const from of sources) {
    if (board[from] !== color) continue;
    const caps = findCaptures(board, from, color, new Set());
    captures.push(...caps);
    if (mustContinue === null) simple.push(...getSimple(board, from, color));
  }

  if (captures.length > 0) {
    const max = Math.max(...captures.map((m) => m.captured.length));
    return captures.filter((m) => m.captured.length === max);
  }
  return simple;
}

function applyMove(board: Board, move: KharbagaMove): Board {
  const nb = [...board];
  const color = nb[move.from] ?? null;
  for (const cap of move.captured) nb[cap] = null;
  nb[move.from] = null;
  nb[move.to] = color;
  return nb;
}

function runBot(state: KharbagaState): KharbagaState {
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const moves = getLegalMoves(state.board, "black", state.mustContinueFrom);
  if (moves.length === 0) return { ...state, rngSeed: nextSeed, winner: "white" };
  const move = moves[Math.floor(rng() * moves.length)]!;
  const nb = applyMove(state.board, move);

  if (move.captured.length > 0) {
    const cont = findCaptures(nb, move.to, "black", new Set());
    if (cont.length > 0) {
      return runBot({ ...state, rngSeed: nextSeed, board: nb, mustContinueFrom: move.to });
    }
  }

  const white = nb.filter((c) => c === "white").length;
  return {
    ...state,
    rngSeed: nextSeed,
    board: nb,
    turn: "white",
    selected: null,
    mustContinueFrom: null,
    winner: white === 0 ? "black" : null,
  };
}

export function reducer(state: KharbagaState, action: KharbagaAction): KharbagaState {
  if (state.winner !== null) return state;

  if (action.type === "select") {
    if (state.turn !== "white") return state;
    if (state.mustContinueFrom !== null && action.pos !== state.mustContinueFrom) return state;
    if (state.board[action.pos] !== "white") return state;
    return { ...state, selected: action.pos };
  }

  if (action.type === "move") {
    if (state.selected === null || state.turn !== "white") return state;
    const moves = getLegalMoves(state.board, "white", state.mustContinueFrom);
    const match = moves.find((m) => m.from === state.selected && m.to === action.to);
    if (!match) return state;

    const nb = applyMove(state.board, match);

    if (match.captured.length > 0) {
      const cont = findCaptures(nb, match.to, "white", new Set());
      if (cont.length > 0) {
        return { ...state, board: nb, mustContinueFrom: match.to, selected: match.to };
      }
    }

    const black = nb.filter((c) => c === "black").length;
    if (black === 0) return { ...state, board: nb, winner: "white", selected: null, mustContinueFrom: null };

    return runBot({ ...state, board: nb, turn: "black", selected: null, mustContinueFrom: null });
  }

  return state;
}

export function isTerminal(state: KharbagaState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === "white" ? 20 : 0 };
}
