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

export interface ChessSettings {
  opponent: "easy" | "medium" | "hard";
  flipBoardForBlack: boolean;
}

export type GameResult = "white" | "black" | "draw" | null;

export interface ChessState {
  settings: ChessSettings;
  rngSeed: number;
  board: Board;
  turn: PieceColor;
  castling: CastlingRights;
  enPassantTarget: ChessCoord | null;
  halfMoveClock: number; // for 50-move rule
  fullMoveNumber: number;
  positionHistory: string[]; // FEN-like position strings for repetition detection
  result: GameResult;
  selected: ChessCoord | null;
  promotionPending: { from: ChessCoord; to: ChessCoord } | null;
}

export type ChessAction =
  | { type: "select"; coord: ChessCoord }
  | { type: "move"; from: ChessCoord; to: ChessCoord }
  | { type: "promote"; piece: "queen" | "rook" | "bishop" | "knight" };

function boardToPositionKey(
  board: Board,
  turn: PieceColor,
  castling: CastlingRights,
  ep: ChessCoord | null,
): string {
  const parts: string[] = [];
  for (const p of board) {
    parts.push(p ? `${p.color[0]!}${p.type[0]!}` : "--");
  }
  parts.push(turn[0]!);
  parts.push(castling.whiteKingside ? "K" : "-");
  parts.push(castling.whiteQueenside ? "Q" : "-");
  parts.push(castling.blackKingside ? "k" : "-");
  parts.push(castling.blackQueenside ? "q" : "-");
  parts.push(ep ? `${ep.row}${ep.col}` : "-");
  return parts.join(",");
}

export function initialState(seed: number, settings: ChessSettings): ChessState {
  const board = standardBoard();
  const castling: CastlingRights = {
    whiteKingside: true,
    whiteQueenside: true,
    blackKingside: true,
    blackQueenside: true,
  };
  const posKey = boardToPositionKey(board, "white", castling, null);
  return {
    settings,
    rngSeed: seed,
    board,
    turn: "white",
    castling,
    enPassantTarget: null,
    halfMoveClock: 0,
    fullMoveNumber: 1,
    positionHistory: [posKey],
    result: null,
    selected: null,
    promotionPending: null,
  };
}

function depthForSettings(settings: ChessSettings): number {
  switch (settings.opponent) {
    case "easy": return 2;
    case "medium": return 3;
    case "hard": return 4;
  }
}

interface BotChessState {
  board: Board;
  turn: PieceColor;
  castling: CastlingRights;
  enPassantTarget: ChessCoord | null;
}

function applyMoveToState(s: ChessState, move: ChessMove): ChessState {
  const piece = s.board[idx(move.from.row, move.from.col)];
  const isCapture = s.board[idx(move.to.row, move.to.col)] !== null || move.isEnPassant;
  const newCastling = updateCastlingRights(s.castling, move, s.board);
  const newBoard = applyMove(s.board, move);
  const newEP = computeEnPassantTarget(move, s.board);
  const newHalf = (isCapture || piece?.type === "pawn") ? 0 : s.halfMoveClock + 1;
  const nextTurn: PieceColor = s.turn === "white" ? "black" : "white";
  const newFull = s.turn === "black" ? s.fullMoveNumber + 1 : s.fullMoveNumber;

  const posKey = boardToPositionKey(newBoard, nextTurn, newCastling, newEP);
  const newHistory = [...s.positionHistory, posKey];

  // Determine result
  let result: GameResult = null;

  // Check 50-move rule
  if (newHalf >= 100) {
    result = "draw";
  }

  // Check 3-fold repetition
  if (!result) {
    const count = newHistory.filter((k) => k === posKey).length;
    if (count >= 3) result = "draw";
  }

  if (!result) {
    const nextMoves = legalMoves(newBoard, nextTurn, newEP, newCastling);
    if (nextMoves.length === 0) {
      if (isInCheck(newBoard, nextTurn)) {
        result = s.turn; // current player wins
      } else {
        result = "draw"; // stalemate
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
    fullMoveNumber: newFull,
    positionHistory: newHistory,
    result,
    selected: null,
    promotionPending: null,
  };
}

function runBot(state: ChessState): ChessState {
  const depth = depthForSettings(state.settings);

  const result = minimax<BotChessState, ChessMove>(
    {
      board: state.board,
      turn: state.turn,
      castling: state.castling,
      enPassantTarget: state.enPassantTarget,
    },
    {
      depth,
      moves(s) {
        return legalMoves(s.board, s.turn, s.enPassantTarget, s.castling);
      },
      apply(s, move) {
        const newCastling = updateCastlingRights(s.castling, move, s.board);
        const newBoard = applyMove(s.board, move);
        const newEP = computeEnPassantTarget(move, s.board);
        return {
          board: newBoard,
          turn: s.turn === "white" ? "black" : "white",
          castling: newCastling,
          enPassantTarget: newEP,
        };
      },
      isTerminal(s) {
        return legalMoves(s.board, s.turn, s.enPassantTarget, s.castling).length === 0;
      },
      evaluate(s) {
        return evaluate(s.board);
      },
      maximizing(s) {
        return s.turn === "white";
      },
    },
  );

  if (!result.move) return state;
  return applyMoveToState(state, result.move);
}

export function getLegalMovesForPiece(state: ChessState, from: ChessCoord): ChessMove[] {
  return legalMoves(state.board, state.turn, state.enPassantTarget, state.castling)
    .filter((m) => m.from.row === from.row && m.from.col === from.col);
}

export function getAllLegalMoves(state: ChessState): ChessMove[] {
  return legalMoves(state.board, state.turn, state.enPassantTarget, state.castling);
}

export function isPlayerInCheck(state: ChessState): boolean {
  return isInCheck(state.board, state.turn);
}

export function reducer(state: ChessState, action: ChessAction): ChessState {
  if (state.result !== null) return state;
  if (state.promotionPending !== null) {
    if (action.type !== "promote") return state;
    const { from, to } = state.promotionPending;
    const move: ChessMove = { from, to, promotion: action.piece };
    let next = applyMoveToState(state, move);
    // Bot turn
    if (next.result === null && next.turn === "black") {
      next = runBot(next);
    }
    return next;
  }

  if (action.type === "move") {
    const { from, to } = action;
    const moves = legalMoves(state.board, state.turn, state.enPassantTarget, state.castling);
    const matching = moves.filter(
      (m) =>
        m.from.row === from.row && m.from.col === from.col &&
        m.to.row === to.row && m.to.col === to.col,
    );
    if (matching.length === 0) return state;

    // Check if promotion
    const piece = state.board[idx(from.row, from.col)];
    if (piece?.type === "pawn" && (to.row === 0 || to.row === 7)) {
      // Promotion pending — player must choose
      return { ...state, promotionPending: { from, to }, selected: null };
    }

    const move = matching[0]!;
    let next = applyMoveToState(state, move);

    // Bot turn
    if (next.result === null && next.turn === "black") {
      next = runBot(next);
    }
    return next;
  }

  return state;
}

export function isTerminal(state: ChessState): { score: number } | null {
  if (state.result === null) return null;
  if (state.result === "white") return { score: 100 };
  if (state.result === "draw") return { score: 50 };
  return { score: 0 };
}

export { findKing };
