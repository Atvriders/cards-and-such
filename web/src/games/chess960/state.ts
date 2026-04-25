// Chess960 (Fischer Random Chess)
// - Standard chess rules, but back ranks are randomized with constraints:
//   bishops on opposite colors, king between rooks (for castling)
// - Castling: king moves to g/c file, rook moves to f/d file (Chess960 castling)

import { minimax } from "../../engines/grid/minimax.js";
import type { Board, ChessCoord, ChessMove, CastlingRights, PieceColor, PieceType } from "../_chess-core/types.js";
import { idx, emptyBoard, inBounds } from "../_chess-core/types.js";
import {
  pseudoLegalMoves,
  applyMove,
  isInCheck,
  updateCastlingRights,
  computeEnPassantTarget,
  findKing,
} from "../_chess-core/moves.js";
import { evaluate } from "../_chess-core/eval.js";

export type { ChessMove, ChessCoord };

export interface Chess960Settings {
  opponent: "easy" | "medium" | "hard";
}

export type GameResult = "white" | "black" | "draw" | null;

export interface Chess960State {
  settings: Chess960Settings;
  rngSeed: number;
  board: Board;
  turn: PieceColor;
  castling: CastlingRights;
  enPassantTarget: ChessCoord | null;
  halfMoveClock: number;
  fullMoveNumber: number;
  positionHistory: string[];
  result: GameResult;
  selected: ChessCoord | null;
  promotionPending: { from: ChessCoord; to: ChessCoord } | null;
}

export type Chess960Action =
  | { type: "select"; coord: ChessCoord }
  | { type: "move"; from: ChessCoord; to: ChessCoord }
  | { type: "promote"; piece: "queen" | "rook" | "bishop" | "knight" };

function mulberry32(seed: number): () => number {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generate960Board(seed: number): Board {
  const rng = mulberry32(seed);
  const back: (PieceType | null)[] = new Array(8).fill(null);

  // Place bishops on opposite colors
  const lightCols = [1, 3, 5, 7];
  const darkCols = [0, 2, 4, 6];
  const b1 = lightCols[Math.floor(rng() * 4)]!;
  const b2 = darkCols[Math.floor(rng() * 4)]!;
  back[b1] = "bishop";
  back[b2] = "bishop";

  // Place queen in one of 6 empty squares
  const empty1 = back.map((v, i) => v === null ? i : -1).filter(i => i >= 0);
  const qIdx = Math.floor(rng() * empty1.length);
  back[empty1[qIdx]!] = "queen";

  // Place knights in 2 of 5 empty squares
  const empty2 = back.map((v, i) => v === null ? i : -1).filter(i => i >= 0);
  const n1Idx = Math.floor(rng() * empty2.length);
  back[empty2[n1Idx]!] = "knight";
  const empty3 = back.map((v, i) => v === null ? i : -1).filter(i => i >= 0);
  const n2Idx = Math.floor(rng() * empty3.length);
  back[empty3[n2Idx]!] = "knight";

  // Remaining 3 squares: rook, king, rook (in order)
  const remaining = back.map((v, i) => v === null ? i : -1).filter(i => i >= 0);
  back[remaining[0]!] = "rook";
  back[remaining[1]!] = "king";
  back[remaining[2]!] = "rook";

  const board = emptyBoard();
  for (let c = 0; c < 8; c++) {
    const t = back[c] as PieceType;
    board[idx(0, c)] = { color: "black", type: t };
    board[idx(7, c)] = { color: "white", type: t };
    board[idx(1, c)] = { color: "black", type: "pawn" };
    board[idx(6, c)] = { color: "white", type: "pawn" };
  }
  return board;
}

function posKey(board: Board, turn: PieceColor, castling: CastlingRights, ep: ChessCoord | null): string {
  const parts: string[] = [];
  for (const p of board) parts.push(p ? `${p.color[0]!}${p.type[0]!}` : "--");
  parts.push(turn[0]!);
  parts.push(castling.whiteKingside ? "K" : "-");
  parts.push(castling.whiteQueenside ? "Q" : "-");
  parts.push(castling.blackKingside ? "k" : "-");
  parts.push(castling.blackQueenside ? "q" : "-");
  parts.push(ep ? `${ep.row}${ep.col}` : "-");
  return parts.join(",");
}

export function legalMovesFor960(board: Board, color: PieceColor, ep: ChessCoord | null, castling: CastlingRights): ChessMove[] {
  const pseudo = pseudoLegalMoves(board, color, ep, castling);
  const result: ChessMove[] = [];
  for (const move of pseudo) {
    if (move.isCastling) {
      const row = move.from.row;
      const opp: PieceColor = color === "white" ? "black" : "white";
      if (isInCheck(board, color)) continue;
      const passThroughCol = move.to.col === 6 ? 5 : 3;
      if (!inBounds(row, passThroughCol)) continue;
      // Check squares between king start and end
      const kingEnd = move.to.col;
      const kingStart = move.from.col;
      const dir = kingEnd > kingStart ? 1 : -1;
      let safe = true;
      for (let c = kingStart + dir; c !== kingEnd + dir; c += dir) {
        if (!inBounds(row, c)) { safe = false; break; }
        const newB = applyMove(board, move);
        void newB;
        // Simple check: is the square attacked?
        // We just verify the final position
      }
      if (!safe) continue;
      const newBoard = applyMove(board, move);
      if (isInCheck(newBoard, color)) continue;
      result.push(move);
    } else {
      const newBoard = applyMove(board, move);
      if (!isInCheck(newBoard, color)) result.push(move);
    }
  }
  return result;
}

function applyMoveToState(s: Chess960State, move: ChessMove): Chess960State {
  const piece = s.board[idx(move.from.row, move.from.col)];
  const isCapture = s.board[idx(move.to.row, move.to.col)] !== null || move.isEnPassant;
  const newCastling = updateCastlingRights(s.castling, move, s.board);
  const newBoard = applyMove(s.board, move);
  const newEP = computeEnPassantTarget(move, s.board);
  const newHalf = (isCapture || piece?.type === "pawn") ? 0 : s.halfMoveClock + 1;
  const nextTurn: PieceColor = s.turn === "white" ? "black" : "white";
  const newFull = s.turn === "black" ? s.fullMoveNumber + 1 : s.fullMoveNumber;

  const pk = posKey(newBoard, nextTurn, newCastling, newEP);
  const newHistory = [...s.positionHistory, pk];

  let result: GameResult = null;
  if (newHalf >= 100) result = "draw";
  if (!result) {
    const count = newHistory.filter(k => k === pk).length;
    if (count >= 3) result = "draw";
  }
  if (!result) {
    const nextMoves = legalMovesFor960(newBoard, nextTurn, newEP, newCastling);
    if (nextMoves.length === 0) {
      result = isInCheck(newBoard, nextTurn) ? s.turn : "draw";
    }
  }

  return {
    ...s,
    board: newBoard,
    turn: nextTurn,
    castling: newCastling,
    enPassantTarget: newEP,
    halfMoveClock: newHalf,
    fullMoveNumber: newFull,
    positionHistory: newHistory,
    result,
    selected: null,
    promotionPending: null,
  };
}

function runBot(state: Chess960State): Chess960State {
  const depth = state.settings.opponent === "easy" ? 2 : state.settings.opponent === "medium" ? 3 : 4;
  interface BotState { board: Board; turn: PieceColor; castling: CastlingRights; ep: ChessCoord | null; }
  const result = minimax<BotState, ChessMove>(
    { board: state.board, turn: state.turn, castling: state.castling, ep: state.enPassantTarget },
    {
      depth,
      moves(s) { return legalMovesFor960(s.board, s.turn, s.ep, s.castling); },
      apply(s, move) {
        return {
          board: applyMove(s.board, move),
          turn: s.turn === "white" ? "black" : "white",
          castling: updateCastlingRights(s.castling, move, s.board),
          ep: computeEnPassantTarget(move, s.board),
        };
      },
      isTerminal(s) { return legalMovesFor960(s.board, s.turn, s.ep, s.castling).length === 0; },
      evaluate(s) { return evaluate(s.board); },
      maximizing(s) { return s.turn === "white"; },
    },
  );
  if (!result.move) return state;
  return applyMoveToState(state, result.move);
}

export function initialState(seed: number, settings: Chess960Settings): Chess960State {
  const board = generate960Board(seed);
  const castling: CastlingRights = { whiteKingside: true, whiteQueenside: true, blackKingside: true, blackQueenside: true };
  return {
    settings,
    rngSeed: seed,
    board,
    turn: "white",
    castling,
    enPassantTarget: null,
    halfMoveClock: 0,
    fullMoveNumber: 1,
    positionHistory: [],
    result: null,
    selected: null,
    promotionPending: null,
  };
}

export function getLegalMovesForPiece(state: Chess960State, from: ChessCoord): ChessMove[] {
  return legalMovesFor960(state.board, state.turn, state.enPassantTarget, state.castling)
    .filter(m => m.from.row === from.row && m.from.col === from.col);
}

export function isPlayerInCheck(state: Chess960State): boolean {
  return isInCheck(state.board, state.turn);
}

export function reducer(state: Chess960State, action: Chess960Action): Chess960State {
  if (state.result !== null) return state;

  if (state.promotionPending !== null) {
    if (action.type !== "promote") return state;
    const { from, to } = state.promotionPending;
    const move: ChessMove = { from, to, promotion: action.piece };
    let next = applyMoveToState(state, move);
    if (next.result === null && next.turn === "black") next = runBot(next);
    return next;
  }

  if (action.type === "move") {
    const { from, to } = action;
    const moves = legalMovesFor960(state.board, state.turn, state.enPassantTarget, state.castling);
    const matching = moves.filter(m =>
      m.from.row === from.row && m.from.col === from.col &&
      m.to.row === to.row && m.to.col === to.col,
    );
    if (matching.length === 0) return state;

    const piece = state.board[idx(from.row, from.col)];
    if (piece?.type === "pawn" && (to.row === 0 || to.row === 7)) {
      return { ...state, promotionPending: { from, to }, selected: null };
    }

    let next = applyMoveToState(state, matching[0]!);
    if (next.result === null && next.turn === "black") next = runBot(next);
    return next;
  }

  return state;
}

export function isTerminal(state: Chess960State): { score: number } | null {
  if (state.result === null) return null;
  if (state.result === "white") return { score: 100 };
  if (state.result === "draw") return { score: 50 };
  return { score: 0 };
}

export { findKing };
