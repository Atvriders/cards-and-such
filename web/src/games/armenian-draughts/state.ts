import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Armenian Draughts — 8×8 board on all squares (like Turkish)
// Difference from Turkish: men capture BACKWARDS too (all 4 directions)
// Kings: flying, all directions
// Mandatory capture, most-captures rule
// Player = "white" (rows 5-6), Bot = "black" (rows 1-2)

export type Cell = null | { color: "white" | "black"; king: boolean };
export type Board = Cell[];

export interface ArmenianDraughtsSettings {
  opponent: "bot";
}

export interface ArmenianDraughtsState {
  settings: ArmenianDraughtsSettings;
  rngSeed: number;
  board: Board;
  turn: "white" | "black";
  selected: number | null;
  mustContinueFrom: number | null;
  winner: "white" | "black" | null;
}

export type ArmenianDraughtsAction =
  | { type: "select"; pos: number }
  | { type: "move"; to: number };

function posRC(r: number, c: number): number { return r * 8 + c; }
function rowOf(p: number): number { return Math.floor(p / 8); }
function colOf(p: number): number { return p % 8; }

// ----- Initialisation -----

export function initialState(seed: number, settings: ArmenianDraughtsSettings): ArmenianDraughtsState {
  const board: Board = new Array(64).fill(null);
  for (let r = 1; r <= 2; r++) {
    for (let c = 0; c < 8; c++) {
      board[posRC(r, c)] = { color: "black", king: false };
    }
  }
  for (let r = 5; r <= 6; r++) {
    for (let c = 0; c < 8; c++) {
      board[posRC(r, c)] = { color: "white", king: false };
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

export interface ArmenianMove {
  from: number;
  to: number;
  captured: number[];
}

const ALL_DIRS: [number, number][] = [[0, 1], [0, -1], [1, 0], [-1, 0]];

function forwardDirs(color: "white" | "black"): [number, number][] {
  const fwd: [number, number] = color === "white" ? [-1, 0] : [1, 0];
  return [fwd, [0, 1], [0, -1]];
}

function inB(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function findCaptures(
  board: Board,
  from: number,
  piece: NonNullable<Cell>,
  capturedSet: Set<number>,
): ArmenianMove[] {
  const results: ArmenianMove[] = [];

  for (const [dr, dc] of ALL_DIRS) {
    let r = rowOf(from) + dr;
    let c = colOf(from) + dc;

    if (piece.king) {
      while (inB(r, c) && board[posRC(r, c)] === null) {
        r += dr; c += dc;
      }
    }

    if (!inB(r, c)) continue;
    const midPos = posRC(r, c);
    const midPiece = board[midPos];
    if (!midPiece || midPiece.color === piece.color || capturedSet.has(midPos)) continue;

    let lr = r + dr; let lc = c + dc;
    const landings: number[] = [];
    if (piece.king) {
      while (inB(lr, lc) && board[posRC(lr, lc)] === null) {
        landings.push(posRC(lr, lc));
        lr += dr; lc += dc;
      }
    } else {
      if (inB(lr, lc) && board[posRC(lr, lc)] === null) {
        landings.push(posRC(lr, lc));
      }
    }

    for (const land of landings) {
      const newCaptured = new Set(capturedSet);
      newCaptured.add(midPos);

      const becomesKing = !piece.king &&
        ((piece.color === "white" && rowOf(land) === 0) ||
          (piece.color === "black" && rowOf(land) === 7));

      if (becomesKing) {
        results.push({ from, to: land, captured: [...newCaptured] });
        continue;
      }

      const newBoard = [...board];
      newBoard[from] = null;
      newBoard[land] = piece;
      const chains = findCaptures(newBoard as Board, land, piece, newCaptured);

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

function getSimpleMoves(board: Board, from: number, piece: NonNullable<Cell>): ArmenianMove[] {
  const moves: ArmenianMove[] = [];
  const dirs = piece.king ? ALL_DIRS : forwardDirs(piece.color);

  for (const [dr, dc] of dirs) {
    if (piece.king) {
      let r = rowOf(from) + dr; let c = colOf(from) + dc;
      while (inB(r, c) && board[posRC(r, c)] === null) {
        moves.push({ from, to: posRC(r, c), captured: [] });
        r += dr; c += dc;
      }
    } else {
      const r = rowOf(from) + dr; const c = colOf(from) + dc;
      if (inB(r, c) && board[posRC(r, c)] === null) {
        moves.push({ from, to: posRC(r, c), captured: [] });
      }
    }
  }
  return moves;
}

export function getLegalMoves(
  board: Board,
  color: "white" | "black",
  mustContinueFrom: number | null,
): ArmenianMove[] {
  const sources = mustContinueFrom !== null
    ? [mustContinueFrom]
    : Array.from({ length: 64 }, (_, i) => i).filter((i) => {
        const p = board[i];
        return p != null && (p as NonNullable<Cell>).color === color;
      });

  const allCaptures: ArmenianMove[] = [];
  const allSimple: ArmenianMove[] = [];

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
    const maxCap = Math.max(...allCaptures.map((m) => m.captured.length));
    return allCaptures.filter((m) => m.captured.length === maxCap);
  }
  return allSimple;
}

function applyMove(board: Board, move: ArmenianMove): Board {
  const newBoard = [...board];
  const piece = newBoard[move.from]!;
  for (const cap of move.captured) {
    newBoard[cap] = null;
  }
  newBoard[move.from] = null;
  const becomesKing = !piece.king &&
    ((piece.color === "white" && rowOf(move.to) === 0) ||
      (piece.color === "black" && rowOf(move.to) === 7));
  newBoard[move.to] = becomesKing ? { ...piece, king: true } : piece;
  return newBoard;
}

function runBot(state: ArmenianDraughtsState): ArmenianDraughtsState {
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const moves = getLegalMoves(state.board, "black", state.mustContinueFrom);
  if (moves.length === 0) {
    return { ...state, rngSeed: nextSeed, winner: "white" };
  }
  const move = moves[Math.floor(rng() * moves.length)]!;
  const newBoard = applyMove(state.board, move);

  if (move.captured.length > 0) {
    const piece = newBoard[move.to];
    if (piece && !piece.king) {
      const cont = findCaptures(newBoard, move.to, piece, new Set());
      if (cont.length > 0) {
        return runBot({ ...state, rngSeed: nextSeed, board: newBoard, mustContinueFrom: move.to });
      }
    }
  }

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

export function reducer(state: ArmenianDraughtsState, action: ArmenianDraughtsAction): ArmenianDraughtsState {
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

    if (match.captured.length > 0) {
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

    return runBot({
      ...state,
      board: newBoard,
      turn: "black",
      selected: null,
      mustContinueFrom: null,
    });
  }

  return state;
}

export function isTerminal(state: ArmenianDraughtsState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === "white" ? 20 : 0 };
}
