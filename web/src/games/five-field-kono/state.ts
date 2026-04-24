import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Five Field Kono — Korean abstract strategy game
// 5×5 board; each player has 7 pieces placed on their back two rows + corners
// Actually standard Five Field Kono: both players have pieces on rows 0-1 (black) and rows 3-4 (white)
// That's 10 pieces each. But classic description has 7 per side.
// We use 10 per side (rows), which is the common Zillions implementation.
// Movement: pieces move diagonally one square forward (toward opponent) or backward
// Capture: pieces capture by moving diagonally; no jumping — a piece REPLACES an opponent piece
//          when moving diagonally to its square
// Win: capture all opponent pieces

// Board: 5×5, piece at (r,c)
// White moves "up" (decreasing r), Black moves "down" (increasing r)
// Diagonal moves: forward = toward opponent + sideways; backward allowed too
// A piece may move diagonally (4 diagonal dirs) to an adjacent square that is:
//   - empty (non-capturing move), or
//   - occupied by opponent (capturing move)

export const SIZE = 5;
export type Cell = null | "white" | "black";
export type Board = Cell[];

export interface FiveFieldKonoSettings {
  opponent: "bot";
}

export interface FiveFieldKonoState {
  settings: FiveFieldKonoSettings;
  rngSeed: number;
  board: Board;
  turn: "white" | "black";
  selected: number | null;
  winner: "white" | "black" | null;
}

export type FiveFieldKonoAction =
  | { type: "select"; pos: number }
  | { type: "move"; to: number };

function posRC(r: number, c: number): number { return r * SIZE + c; }
function rowOf(p: number): number { return Math.floor(p / SIZE); }
function colOf(p: number): number { return p % SIZE; }
function inBounds(r: number, c: number): boolean { return r >= 0 && r < SIZE && c >= 0 && c < SIZE; }

export function initialState(seed: number, settings: FiveFieldKonoSettings): FiveFieldKonoState {
  const board: Board = new Array(SIZE * SIZE).fill(null);
  // Black rows 0-1
  for (let r = 0; r <= 1; r++) {
    for (let c = 0; c < SIZE; c++) {
      board[posRC(r, c)] = "black";
    }
  }
  // White rows 3-4
  for (let r = 3; r <= 4; r++) {
    for (let c = 0; c < SIZE; c++) {
      board[posRC(r, c)] = "white";
    }
  }
  return {
    settings,
    rngSeed: seed,
    board,
    turn: "white",
    selected: null,
    winner: null,
  };
}

export interface KonoMove {
  from: number;
  to: number;
  isCapture: boolean;
}

const DIAG_DIRS: [number, number][] = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

export function getLegalMoves(board: Board, color: "white" | "black"): KonoMove[] {
  const moves: KonoMove[] = [];
  const captures: KonoMove[] = [];

  for (let from = 0; from < SIZE * SIZE; from++) {
    if (board[from] !== color) continue;
    const r = rowOf(from); const c = colOf(from);
    for (const [dr, dc] of DIAG_DIRS) {
      const nr = r + dr; const nc = c + dc;
      if (!inBounds(nr, nc)) continue;
      const to = posRC(nr, nc);
      const target = board[to];
      if (target === null) {
        moves.push({ from, to, isCapture: false });
      } else if (target !== color) {
        captures.push({ from, to, isCapture: true });
      }
    }
  }

  // Mandatory capture if available
  if (captures.length > 0) return captures;
  return moves;
}

function runBot(state: FiveFieldKonoState): FiveFieldKonoState {
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const moves = getLegalMoves(state.board, "black");
  if (moves.length === 0) return { ...state, rngSeed: nextSeed, winner: "white" };

  const move = moves[Math.floor(rng() * moves.length)]!;
  const nb = [...state.board];
  nb[move.from] = null;
  nb[move.to] = "black";

  const white = nb.filter((c) => c === "white").length;
  return {
    ...state,
    rngSeed: nextSeed,
    board: nb,
    turn: "white",
    selected: null,
    winner: white === 0 ? "black" : null,
  };
}

export function reducer(state: FiveFieldKonoState, action: FiveFieldKonoAction): FiveFieldKonoState {
  if (state.winner !== null) return state;

  if (action.type === "select") {
    if (state.turn !== "white") return state;
    if (state.board[action.pos] !== "white") return state;
    return { ...state, selected: action.pos };
  }

  if (action.type === "move") {
    if (state.selected === null || state.turn !== "white") return state;
    const moves = getLegalMoves(state.board, "white");
    const match = moves.find((m) => m.from === state.selected && m.to === action.to);
    if (!match) return state;

    const nb = [...state.board];
    nb[state.selected] = null;
    nb[match.to] = "white";

    const black = nb.filter((c) => c === "black").length;
    if (black === 0) {
      return { ...state, board: nb, winner: "white", selected: null };
    }

    return runBot({ ...state, board: nb, turn: "black", selected: null });
  }

  return state;
}

export function isTerminal(state: FiveFieldKonoState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === "white" ? 20 : 0 };
}
