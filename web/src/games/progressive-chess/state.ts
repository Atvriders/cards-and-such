// Progressive Chess (Scottish Progressive Chess)
// - White makes 1 move, Black makes 2 moves, White makes 3 moves, Black makes 4 moves, etc.
// - Each series of moves is called a "turn". The number of moves increases each turn.
// - A player may NOT give check except on the last move of their series.
// - If the king is in check at the start of a series, the first move of that series must be a "free check response"
//   (i.e., the player must escape check on their first move if in check).
// - Checkmate ends the game immediately, even mid-series.
// - Stalemate draws.

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

export interface ProgressiveSettings {
  opponent: "easy" | "medium" | "hard";
}

export type GameResult = "white" | "black" | "draw" | null;

export interface ProgressiveState {
  settings: ProgressiveSettings;
  rngSeed: number;
  board: Board;
  turn: PieceColor;
  castling: CastlingRights;
  enPassantTarget: ChessCoord | null;
  seriesNumber: number;       // Current series number (starts at 1)
  movesInSeries: number;      // Moves made in current series
  result: GameResult;
  selected: ChessCoord | null;
  promotionPending: { from: ChessCoord; to: ChessCoord } | null;
}

export type ProgressiveAction =
  | { type: "move"; from: ChessCoord; to: ChessCoord }
  | { type: "promote"; piece: "queen" | "rook" | "bishop" | "knight" };

// Legal moves for progressive: cannot give check unless it's the last move of the series
// Also must be a legal move (not leaving own king in check)
export function progressiveLegalMoves(
  board: Board,
  color: PieceColor,
  ep: ChessCoord | null,
  castling: CastlingRights,
  movesInSeries: number,
  seriesNumber: number,
): ChessMove[] {
  const totalMovesAllowed = seriesNumber;
  const isLastMove = movesInSeries + 1 === totalMovesAllowed;
  const standard = legalMoves(board, color, ep, castling);
  const opp: PieceColor = color === "white" ? "black" : "white";

  if (isLastMove) {
    // Last move: can give check (and checkmate), just can't leave own king in check
    return standard;
  } else {
    // Not last move: cannot give check to opponent
    return standard.filter(move => {
      const newBoard = applyMove(board, move);
      return !isInCheck(newBoard, opp);
    });
  }
}

function applyMoveToState(s: ProgressiveState, move: ChessMove): ProgressiveState {
  const piece = s.board[idx(move.from.row, move.from.col)];
  const isCapture = s.board[idx(move.to.row, move.to.col)] !== null || move.isEnPassant;
  const newCastling = updateCastlingRights(s.castling, move, s.board);
  const newBoard = applyMove(s.board, move);
  const newEP = computeEnPassantTarget(move, s.board);
  void piece; void isCapture;

  const totalMovesAllowed = s.seriesNumber;
  const nextMoveInSeries = s.movesInSeries + 1;
  const opp: PieceColor = s.turn === "white" ? "black" : "white";

  let result: GameResult = null;

  // Check if opponent is in checkmate (after this move)
  if (isInCheck(newBoard, opp)) {
    const oppMoves = legalMoves(newBoard, opp, newEP, newCastling);
    if (oppMoves.length === 0) {
      result = s.turn; // checkmate!
    }
  }

  // Check stalemate
  if (!result && !isInCheck(newBoard, opp)) {
    // Only check stalemate at end of series or if last move
    if (nextMoveInSeries >= totalMovesAllowed) {
      const oppMoves = legalMoves(newBoard, opp, newEP, newCastling);
      if (oppMoves.length === 0) result = "draw";
    }
  }

  // Switch sides after series is complete
  let nextTurn = s.turn;
  let nextSeriesNumber = s.seriesNumber;
  let nextMovesInSeries = nextMoveInSeries;

  if (!result && nextMoveInSeries >= totalMovesAllowed) {
    nextTurn = opp;
    nextSeriesNumber = s.seriesNumber + 1;
    nextMovesInSeries = 0;
  }

  return {
    ...s,
    board: newBoard,
    turn: nextTurn,
    castling: newCastling,
    enPassantTarget: newEP,
    seriesNumber: nextSeriesNumber,
    movesInSeries: nextMovesInSeries,
    result,
    selected: null,
    promotionPending: null,
  };
}

interface BotProgressiveState {
  board: Board;
  turn: PieceColor;
  castling: CastlingRights;
  ep: ChessCoord | null;
  seriesNumber: number;
  movesInSeries: number;
}

function runBot(state: ProgressiveState): ProgressiveState {
  const depth = state.settings.opponent === "easy" ? 2 : state.settings.opponent === "medium" ? 3 : 4;

  // Simplify: bot picks best single move (not full series planning)
  // We do a minimax that considers the remaining moves in the series
  const result = minimax<BotProgressiveState, ChessMove>(
    { board: state.board, turn: state.turn, castling: state.castling, ep: state.enPassantTarget, seriesNumber: state.seriesNumber, movesInSeries: state.movesInSeries },
    {
      depth,
      moves(s) {
        return progressiveLegalMoves(s.board, s.turn, s.ep, s.castling, s.movesInSeries, s.seriesNumber);
      },
      apply(s, move) {
        const opp: PieceColor = s.turn === "white" ? "black" : "white";
        const totalAllowed = s.seriesNumber;
        const nextInSeries = s.movesInSeries + 1;
        const newBoard = applyMove(s.board, move);
        const newCastling = updateCastlingRights(s.castling, move, s.board);
        const newEP = computeEnPassantTarget(move, s.board);
        if (nextInSeries >= totalAllowed) {
          return { board: newBoard, turn: opp, castling: newCastling, ep: newEP, seriesNumber: s.seriesNumber + 1, movesInSeries: 0 };
        }
        return { board: newBoard, turn: s.turn, castling: newCastling, ep: newEP, seriesNumber: s.seriesNumber, movesInSeries: nextInSeries };
      },
      isTerminal(s) {
        const moves = progressiveLegalMoves(s.board, s.turn, s.ep, s.castling, s.movesInSeries, s.seriesNumber);
        return moves.length === 0;
      },
      evaluate(s) { return evaluate(s.board); },
      maximizing(s) { return s.turn === "white"; },
    },
  );
  if (!result.move) return state;
  return applyMoveToState(state, result.move);
}

function runBotSeries(state: ProgressiveState): ProgressiveState {
  // Bot plays its full series
  let s = state;
  while (s.result === null && s.turn === "black") {
    const totalAllowed = s.seriesNumber;
    const remaining = totalAllowed - s.movesInSeries;
    if (remaining <= 0) break;
    s = runBot(s);
  }
  return s;
}

export function initialState(seed: number, settings: ProgressiveSettings): ProgressiveState {
  const board = standardBoard();
  const castling: CastlingRights = { whiteKingside: true, whiteQueenside: true, blackKingside: true, blackQueenside: true };
  return {
    settings,
    rngSeed: seed,
    board,
    turn: "white",
    castling,
    enPassantTarget: null,
    seriesNumber: 1,
    movesInSeries: 0,
    result: null,
    selected: null,
    promotionPending: null,
  };
}

export function getLegalMovesForPiece(state: ProgressiveState, from: ChessCoord): ChessMove[] {
  return progressiveLegalMoves(state.board, state.turn, state.enPassantTarget, state.castling, state.movesInSeries, state.seriesNumber)
    .filter(m => m.from.row === from.row && m.from.col === from.col);
}

export function isPlayerInCheck(state: ProgressiveState): boolean {
  return isInCheck(state.board, state.turn);
}

export function reducer(state: ProgressiveState, action: ProgressiveAction): ProgressiveState {
  if (state.result !== null) return state;

  if (state.promotionPending) {
    if (action.type !== "promote") return state;
    const { from, to } = state.promotionPending;
    const move: ChessMove = { from, to, promotion: action.piece };
    let next = applyMoveToState(state, move);
    // If it's bot's turn after this, run the bot
    if (next.result === null && next.turn === "black") {
      next = runBotSeries(next);
    }
    return next;
  }

  if (action.type !== "move") return state;
  const { from, to } = action;
  const moves = progressiveLegalMoves(state.board, state.turn, state.enPassantTarget, state.castling, state.movesInSeries, state.seriesNumber);
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
  // If it's bot's turn after this, run the bot
  if (next.result === null && next.turn === "black") {
    next = runBotSeries(next);
  }
  return next;
}

export function isTerminal(state: ProgressiveState): { score: number } | null {
  if (state.result === null) return null;
  if (state.result === "white") return { score: 100 };
  if (state.result === "draw") return { score: 50 };
  return { score: 0 };
}

export { findKing };
