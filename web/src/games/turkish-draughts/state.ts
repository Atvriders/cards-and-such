import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Turkish Draughts (Dama) — 8×8 board, orthogonal movement
// Pieces move and capture orthogonally (forward + sideways, never backward for men)
// Kings: move and capture in all 4 orthogonal directions, flying kings
// Mandatory capture (most-captures rule)
// Player = "white" (rows 5-6), Bot = "black" (rows 1-2)

export type Cell = null | { color: "white" | "black"; king: boolean };
export type Board = Cell[];

export interface TurkishDraughtsSettings {
  opponent: "bot";
}

export interface TurkishDraughtsState {
  settings: TurkishDraughtsSettings;
  rngSeed: number;
  board: Board;
  turn: "white" | "black";
  selected: number | null;
  mustContinueFrom: number | null;
  winner: "white" | "black" | null;
}

export type TurkishDraughtsAction =
  | { type: "select"; pos: number }
  | { type: "move"; to: number };

function pos(r: number, c: number): number { return r * 8 + c; }
function row(p: number): number { return Math.floor(p / 8); }
function col(p: number): number { return p % 8; }

// ----- Initialisation -----

export function initialState(seed: number, settings: TurkishDraughtsSettings): TurkishDraughtsState {
  const board: Board = new Array(64).fill(null);
  // Black rows 1-2 (top)
  for (let r = 1; r <= 2; r++) {
    for (let c = 0; c < 8; c++) {
      board[pos(r, c)] = { color: "black", king: false };
    }
  }
  // White rows 5-6 (bottom)
  for (let r = 5; r <= 6; r++) {
    for (let c = 0; c < 8; c++) {
      board[pos(r, c)] = { color: "white", king: false };
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

// ----- Move generation -----

export interface TurkishMove {
  from: number;
  to: number;
  captured: number[];
}

// Orthogonal directions as [dr, dc]
const ALL_DIRS: [number, number][] = [[0, 1], [0, -1], [1, 0], [-1, 0]];

function forwardDirs(color: "white" | "black"): [number, number][] {
  // White moves "up" (decreasing row), Black moves "down" (increasing row)
  const fwd: [number, number] = color === "white" ? [-1, 0] : [1, 0];
  return [fwd, [0, 1], [0, -1]]; // forward + sideways
}

function inBounds8(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function findCaptures(
  board: Board,
  from: number,
  piece: NonNullable<Cell>,
  capturedSet: Set<number>,
): TurkishMove[] {
  const results: TurkishMove[] = [];
  const dirs = piece.king ? ALL_DIRS : ALL_DIRS; // kings and men both capture in all directions

  for (const [dr, dc] of dirs) {
    let r = row(from) + dr;
    let c = col(from) + dc;

    if (piece.king) {
      // Slide until hitting something
      while (inBounds8(r, c) && board[pos(r, c)] === null) {
        r += dr; c += dc;
      }
    }

    if (!inBounds8(r, c)) continue;
    const midPos = pos(r, c);
    const midPiece = board[midPos];
    if (!midPiece || midPiece.color === piece.color || capturedSet.has(midPos)) continue;

    // Landing squares beyond mid
    let lr = r + dr; let lc = c + dc;
    const landings: number[] = [];
    if (piece.king) {
      while (inBounds8(lr, lc) && board[pos(lr, lc)] === null) {
        landings.push(pos(lr, lc));
        lr += dr; lc += dc;
      }
    } else {
      if (inBounds8(lr, lc) && board[pos(lr, lc)] === null) {
        landings.push(pos(lr, lc));
      }
    }

    for (const land of landings) {
      const newCaptured = new Set(capturedSet);
      newCaptured.add(midPos);

      // Simulate move: remove captured, move piece
      const newBoard = [...board];
      newBoard[from] = null;
      newBoard[land] = piece;
      // Don't remove captured yet for chain detection

      // King promotion check
      const becomesKing = !piece.king &&
        ((piece.color === "white" && row(land) === 0) ||
          (piece.color === "black" && row(land) === 7));

      if (becomesKing) {
        results.push({ from, to: land, captured: [midPos, ...newCaptured].slice(0, newCaptured.size) });
        // No chain after king promotion
        continue;
      }

      const movedPiece = { ...piece };
      const chains = findCaptures(newBoard as Board, land, movedPiece, newCaptured);

      if (chains.length === 0) {
        results.push({ from, to: land, captured: [...newCaptured] });
      } else {
        for (const chain of chains) {
          results.push({ from, to: chain.to, captured: chain.captured });
        }
      }
    }
  }
  return results;
}

function getSimpleMoves(board: Board, from: number, piece: NonNullable<Cell>): TurkishMove[] {
  const moves: TurkishMove[] = [];
  const dirs = piece.king ? ALL_DIRS : forwardDirs(piece.color);

  for (const [dr, dc] of dirs) {
    if (piece.king) {
      let r = row(from) + dr; let c = col(from) + dc;
      while (inBounds8(r, c) && board[pos(r, c)] === null) {
        moves.push({ from, to: pos(r, c), captured: [] });
        r += dr; c += dc;
      }
    } else {
      const r = row(from) + dr; const c = col(from) + dc;
      if (inBounds8(r, c) && board[pos(r, c)] === null) {
        moves.push({ from, to: pos(r, c), captured: [] });
      }
    }
  }
  return moves;
}

export function getLegalMoves(
  board: Board,
  color: "white" | "black",
  mustContinueFrom: number | null,
): TurkishMove[] {
  const sources = mustContinueFrom !== null
    ? [mustContinueFrom]
    : Array.from({ length: 64 }, (_, i) => i).filter((i) => {
        const p = board[i];
        return p != null && (p as NonNullable<Cell>).color === color;
      });

  const allCaptures: TurkishMove[] = [];
  const allSimple: TurkishMove[] = [];

  for (const from of sources) {
    const piece = board[from];
    if (!piece || piece.color !== color) continue;
    const caps = findCaptures(board, from, piece, new Set());
    allCaptures.push(...caps);
    if (mustContinueFrom === null) {
      allSimple.push(...getSimpleMoves(board, from, piece));
    }
  }

  if (allCaptures.length > 0) {
    // Most-captures rule: must take maximum captures
    const maxCap = Math.max(...allCaptures.map((m) => m.captured.length));
    return allCaptures.filter((m) => m.captured.length === maxCap);
  }
  return allSimple;
}

// ----- Apply move -----

function applyMove(board: Board, move: TurkishMove): Board {
  const newBoard = [...board];
  const piece = newBoard[move.from]!;
  for (const cap of move.captured) {
    newBoard[cap] = null;
  }
  newBoard[move.from] = null;
  const becomesKing = !piece.king &&
    ((piece.color === "white" && row(move.to) === 0) ||
      (piece.color === "black" && row(move.to) === 7));
  newBoard[move.to] = becomesKing ? { ...piece, king: true } : piece;
  return newBoard;
}

// ----- Bot (random legal move) -----

function runBot(state: TurkishDraughtsState): TurkishDraughtsState {
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const moves = getLegalMoves(state.board, "black", state.mustContinueFrom);
  if (moves.length === 0) {
    return { ...state, rngSeed: nextSeed, winner: "white" };
  }
  const move = moves[Math.floor(rng() * moves.length)]!;
  const newBoard = applyMove(state.board, move);

  // Check continuation
  const isCapture = move.captured.length > 0;
  if (isCapture) {
    const piece = newBoard[move.to];
    if (piece && !piece.king) {
      const cont = findCaptures(newBoard, move.to, piece, new Set());
      if (cont.length > 0) {
        const s2: TurkishDraughtsState = {
          ...state,
          rngSeed: nextSeed,
          board: newBoard,
          mustContinueFrom: move.to,
        };
        return runBot(s2);
      }
    }
  }

  // Check win
  const whitePieces = newBoard.filter((p) => p?.color === "white").length;
  const winner = whitePieces === 0 ? "black" : null;

  return {
    ...state,
    rngSeed: nextSeed,
    board: newBoard,
    turn: "white",
    selected: null,
    mustContinueFrom: null,
    winner,
  };
}

// ----- Reducer -----

export function reducer(state: TurkishDraughtsState, action: TurkishDraughtsAction): TurkishDraughtsState {
  if (state.winner !== null) return state;

  if (action.type === "select") {
    if (state.turn !== "white") return state;
    if (state.mustContinueFrom !== null && action.pos !== state.mustContinueFrom) return state;
    const piece = state.board[action.pos];
    if (!piece || piece.color !== "white") return state;
    return { ...state, selected: action.pos };
  }

  if (action.type === "move") {
    if (state.selected === null || state.turn !== "white") return state;
    const moves = getLegalMoves(state.board, "white", state.mustContinueFrom);
    const match = moves.find((m) => m.from === state.selected && m.to === action.to);
    if (!match) return state;

    const newBoard = applyMove(state.board, match);
    const isCapture = match.captured.length > 0;

    // Check continuation
    if (isCapture) {
      const piece = newBoard[match.to];
      if (piece && !piece.king) {
        const cont = findCaptures(newBoard, match.to, piece, new Set());
        if (cont.length > 0) {
          return { ...state, board: newBoard, mustContinueFrom: match.to, selected: match.to };
        }
      }
    }

    const blackPieces = newBoard.filter((p) => p?.color === "black").length;
    if (blackPieces === 0) {
      return { ...state, board: newBoard, winner: "white", selected: null, mustContinueFrom: null };
    }

    const afterPlayer: TurkishDraughtsState = {
      ...state,
      board: newBoard,
      turn: "black",
      selected: null,
      mustContinueFrom: null,
    };

    return runBot(afterPlayer);
  }

  return state;
}

// ----- isTerminal -----

export function isTerminal(state: TurkishDraughtsState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === "white" ? 20 : 0 };
}
