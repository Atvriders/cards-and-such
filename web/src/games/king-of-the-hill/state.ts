// King of the Hill (KOTH)
// - Standard chess, but a player also wins by moving their king to any of the 4 center squares:
//   d4, e4, d5, e5 (rows 3-4, cols 3-4).
// - Checkmate also wins. Stalemate is still a draw.

import { minimax } from "../../engines/grid/minimax.js";
import type { Board, ChessCoord, ChessMove, CastlingRights, PieceColor } from "../_chess-core/types.js";
import { standardBoard, idx } from "../_chess-core/types.js";
import {
  legalMoves,
  applyMove,
  isInCheck,
  updateCastlingRights,
  computeEnPassantTarget,
  findKing,
} from "../_chess-core/moves.js";
import { evaluate } from "../_chess-core/eval.js";

export type { ChessMove, ChessCoord };

export interface KothSettings {
  opponent: "easy" | "medium" | "hard";
}

export type GameResult = "white" | "black" | "draw" | null;

export interface KothState {
  settings: KothSettings;
  rngSeed: number;
  board: Board;
  turn: PieceColor;
  castling: CastlingRights;
  enPassantTarget: ChessCoord | null;
  halfMoveClock: number;
  positionHistory: string[];
  result: GameResult;
  selected: ChessCoord | null;
  promotionPending: { from: ChessCoord; to: ChessCoord } | null;
}

export type KothAction =
  | { type: "move"; from: ChessCoord; to: ChessCoord }
  | { type: "promote"; piece: "queen" | "rook" | "bishop" | "knight" };

// Center squares: d4=row4,col3  e4=row4,col4  d5=row3,col3  e5=row3,col4
const CENTER_SQUARES = new Set(["3,3","3,4","4,3","4,4"]);

function isKingOnHill(board: Board, color: PieceColor): boolean {
  const kp = findKing(board, color);
  if (!kp) return false;
  return CENTER_SQUARES.has(`${kp.row},${kp.col}`);
}

function posKey(board: Board, turn: PieceColor, castling: CastlingRights, ep: ChessCoord | null): string {
  const parts: string[] = [];
  for (const p of board) parts.push(p ? `${p.color[0]!}${p.type[0]!}` : "--");
  parts.push(turn[0]!);
  parts.push(`${castling.whiteKingside?1:0}${castling.whiteQueenside?1:0}${castling.blackKingside?1:0}${castling.blackQueenside?1:0}`);
  parts.push(ep ? `${ep.row}${ep.col}` : "-");
  return parts.join(",");
}

function applyMoveToState(s: KothState, move: ChessMove): KothState {
  const piece = s.board[idx(move.from.row, move.from.col)];
  const isCapture = s.board[idx(move.to.row, move.to.col)] !== null || move.isEnPassant;
  const newCastling = updateCastlingRights(s.castling, move, s.board);
  const newBoard = applyMove(s.board, move);
  const newEP = computeEnPassantTarget(move, s.board);
  const newHalf = (isCapture || piece?.type === "pawn") ? 0 : s.halfMoveClock + 1;
  const nextTurn: PieceColor = s.turn === "white" ? "black" : "white";

  const pk = posKey(newBoard, nextTurn, newCastling, newEP);
  const newHistory = [...s.positionHistory, pk];

  let result: GameResult = null;

  // Check KOTH win condition (player who just moved)
  if (isKingOnHill(newBoard, s.turn)) {
    result = s.turn;
  }

  if (!result && newHalf >= 100) result = "draw";
  if (!result) {
    const count = newHistory.filter(k => k === pk).length;
    if (count >= 3) result = "draw";
  }
  if (!result) {
    const nextMoves = legalMoves(newBoard, nextTurn, newEP, newCastling);
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
    positionHistory: newHistory,
    result,
    selected: null,
    promotionPending: null,
  };
}

function kothEval(board: Board): number {
  let score = evaluate(board);
  // Bonus for king proximity to center
  const wKing = findKing(board, "white");
  const bKing = findKing(board, "black");
  if (wKing) {
    const dr = Math.abs(wKing.row - 3.5);
    const dc = Math.abs(wKing.col - 3.5);
    score += (4 - dr - dc) * 50; // center bonus
  }
  if (bKing) {
    const dr = Math.abs(bKing.row - 3.5);
    const dc = Math.abs(bKing.col - 3.5);
    score -= (4 - dr - dc) * 50;
  }
  return score;
}

function runBot(state: KothState): KothState {
  const depth = state.settings.opponent === "easy" ? 2 : state.settings.opponent === "medium" ? 3 : 4;
  interface BotState { board: Board; turn: PieceColor; castling: CastlingRights; ep: ChessCoord | null; }
  const result = minimax<BotState, ChessMove>(
    { board: state.board, turn: state.turn, castling: state.castling, ep: state.enPassantTarget },
    {
      depth,
      moves(s) { return legalMoves(s.board, s.turn, s.ep, s.castling); },
      apply(s, move) {
        return {
          board: applyMove(s.board, move),
          turn: s.turn === "white" ? "black" : "white",
          castling: updateCastlingRights(s.castling, move, s.board),
          ep: computeEnPassantTarget(move, s.board),
        };
      },
      isTerminal(s) {
        if (isKingOnHill(s.board, "white") || isKingOnHill(s.board, "black")) return true;
        return legalMoves(s.board, s.turn, s.ep, s.castling).length === 0;
      },
      evaluate(s) { return kothEval(s.board); },
      maximizing(s) { return s.turn === "white"; },
    },
  );
  if (!result.move) return state;
  return applyMoveToState(state, result.move);
}

export function initialState(seed: number, settings: KothSettings): KothState {
  const board = standardBoard();
  const castling: CastlingRights = { whiteKingside: true, whiteQueenside: true, blackKingside: true, blackQueenside: true };
  return {
    settings,
    rngSeed: seed,
    board,
    turn: "white",
    castling,
    enPassantTarget: null,
    halfMoveClock: 0,
    positionHistory: [],
    result: null,
    selected: null,
    promotionPending: null,
  };
}

export function getLegalMovesForPiece(state: KothState, from: ChessCoord): ChessMove[] {
  return legalMoves(state.board, state.turn, state.enPassantTarget, state.castling)
    .filter(m => m.from.row === from.row && m.from.col === from.col);
}

export function isPlayerInCheck(state: KothState): boolean {
  return isInCheck(state.board, state.turn);
}

export function reducer(state: KothState, action: KothAction): KothState {
  if (state.result !== null) return state;

  if (state.promotionPending) {
    if (action.type !== "promote") return state;
    const { from, to } = state.promotionPending;
    const move: ChessMove = { from, to, promotion: action.piece };
    let next = applyMoveToState(state, move);
    if (next.result === null && next.turn === "black") next = runBot(next);
    return next;
  }

  if (action.type !== "move") return state;
  const { from, to } = action;
  const moves = legalMoves(state.board, state.turn, state.enPassantTarget, state.castling);
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

export function isTerminal(state: KothState): { score: number } | null {
  if (state.result === null) return null;
  if (state.result === "white") return { score: 100 };
  if (state.result === "draw") return { score: 50 };
  return { score: 0 };
}

export { findKing, CENTER_SQUARES };
