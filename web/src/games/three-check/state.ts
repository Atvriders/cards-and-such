// Three-Check Chess
// - Standard chess rules, but a player wins by giving check 3 times.
// - Checkmate also wins. Stalemate is a draw.

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

export interface ThreeCheckSettings {
  opponent: "easy" | "medium" | "hard";
}

export type GameResult = "white" | "black" | "draw" | null;

export interface ThreeCheckState {
  settings: ThreeCheckSettings;
  rngSeed: number;
  board: Board;
  turn: PieceColor;
  castling: CastlingRights;
  enPassantTarget: ChessCoord | null;
  halfMoveClock: number;
  checksGiven: { white: number; black: number }; // checks given BY each player
  result: GameResult;
  selected: ChessCoord | null;
  promotionPending: { from: ChessCoord; to: ChessCoord } | null;
}

export type ThreeCheckAction =
  | { type: "move"; from: ChessCoord; to: ChessCoord }
  | { type: "promote"; piece: "queen" | "rook" | "bishop" | "knight" };

function applyMoveToState(s: ThreeCheckState, move: ChessMove): ThreeCheckState {
  const piece = s.board[idx(move.from.row, move.from.col)];
  const isCapture = s.board[idx(move.to.row, move.to.col)] !== null || move.isEnPassant;
  const newCastling = updateCastlingRights(s.castling, move, s.board);
  const newBoard = applyMove(s.board, move);
  const newEP = computeEnPassantTarget(move, s.board);
  const newHalf = (isCapture || piece?.type === "pawn") ? 0 : s.halfMoveClock + 1;
  const nextTurn: PieceColor = s.turn === "white" ? "black" : "white";

  // Count checks
  const newChecksGiven = { ...s.checksGiven };
  if (isInCheck(newBoard, nextTurn)) {
    newChecksGiven[s.turn] = (newChecksGiven[s.turn] ?? 0) + 1;
  }

  let result: GameResult = null;

  // Win by 3 checks
  if (newChecksGiven[s.turn] >= 3) {
    result = s.turn;
  }

  // 50-move rule
  if (!result && newHalf >= 100) result = "draw";

  if (!result) {
    const nextMoves = legalMoves(newBoard, nextTurn, newEP, newCastling);
    if (nextMoves.length === 0) {
      if (isInCheck(newBoard, nextTurn)) {
        result = s.turn; // checkmate
      } else {
        result = "draw";
      }
    }
  }

  return {
    ...s,
    board: newBoard,
    turn: nextTurn,
    castling: newCastling,
    enPassantTarget: newEP,
    halfMoveClock: newHalf,
    checksGiven: newChecksGiven,
    result,
    selected: null,
    promotionPending: null,
  };
}

function threeCheckEval(board: Board, checksGiven: { white: number; black: number }): number {
  // Bonus for checks given: each check is very valuable
  const checkBonus = (checksGiven.white - checksGiven.black) * 500;
  return evaluate(board) + checkBonus;
}

function runBot(state: ThreeCheckState): ThreeCheckState {
  const depth = state.settings.opponent === "easy" ? 2 : state.settings.opponent === "medium" ? 3 : 4;
  interface BotState { board: Board; turn: PieceColor; castling: CastlingRights; ep: ChessCoord | null; checksGiven: { white: number; black: number }; }
  const result = minimax<BotState, ChessMove>(
    { board: state.board, turn: state.turn, castling: state.castling, ep: state.enPassantTarget, checksGiven: state.checksGiven },
    {
      depth,
      moves(s) { return legalMoves(s.board, s.turn, s.ep, s.castling); },
      apply(s, move) {
        const newBoard = applyMove(s.board, move);
        const nextTurn: PieceColor = s.turn === "white" ? "black" : "white";
        const newChecksGiven = { ...s.checksGiven };
        if (isInCheck(newBoard, nextTurn)) newChecksGiven[s.turn] = (newChecksGiven[s.turn] ?? 0) + 1;
        return {
          board: newBoard,
          turn: nextTurn,
          castling: updateCastlingRights(s.castling, move, s.board),
          ep: computeEnPassantTarget(move, s.board),
          checksGiven: newChecksGiven,
        };
      },
      isTerminal(s) {
        if (s.checksGiven.white >= 3 || s.checksGiven.black >= 3) return true;
        return legalMoves(s.board, s.turn, s.ep, s.castling).length === 0;
      },
      evaluate(s) { return threeCheckEval(s.board, s.checksGiven); },
      maximizing(s) { return s.turn === "white"; },
    },
  );
  if (!result.move) return state;
  return applyMoveToState(state, result.move);
}

export function initialState(seed: number, settings: ThreeCheckSettings): ThreeCheckState {
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
    checksGiven: { white: 0, black: 0 },
    result: null,
    selected: null,
    promotionPending: null,
  };
}

export function getLegalMovesForPiece(state: ThreeCheckState, from: ChessCoord): ChessMove[] {
  return legalMoves(state.board, state.turn, state.enPassantTarget, state.castling)
    .filter(m => m.from.row === from.row && m.from.col === from.col);
}

export function isPlayerInCheck(state: ThreeCheckState): boolean {
  return isInCheck(state.board, state.turn);
}

export function reducer(state: ThreeCheckState, action: ThreeCheckAction): ThreeCheckState {
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

export function isTerminal(state: ThreeCheckState): { score: number } | null {
  if (state.result === null) return null;
  if (state.result === "white") return { score: 100 };
  if (state.result === "draw") return { score: 50 };
  return { score: 0 };
}

export { findKing };
