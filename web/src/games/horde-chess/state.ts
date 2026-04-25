// Horde Chess
// - White has 36 pawns (no other pieces), black has the standard army.
// - White wins by promoting a pawn or capturing all black pieces (impossible with only pawns,
//   so white wins by breaking through and queening, while avoiding checkmate).
// - Actually: White wins when black is checkmated or has no legal moves.
//   Black wins when all white pawns are captured.
// - White pawns can promote normally.
// - White pawns on row 1 (ranks 3-4 in horde setup) can move 1 or 2 squares.

import { minimax } from "../../engines/grid/minimax.js";
import type { Board, ChessCoord, ChessMove, PieceColor, PieceType, CastlingRights } from "../_chess-core/types.js";
import { idx, emptyBoard } from "../_chess-core/types.js";
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

export interface HordeSettings {
  opponent: "easy" | "medium" | "hard";
}

export type GameResult = "white" | "black" | "draw" | null;

export interface HordeState {
  settings: HordeSettings;
  rngSeed: number;
  board: Board;
  turn: PieceColor;
  castling: CastlingRights;
  enPassantTarget: ChessCoord | null;
  result: GameResult;
  selected: ChessCoord | null;
  promotionPending: { from: ChessCoord; to: ChessCoord } | null;
}

export type HordeAction =
  | { type: "move"; from: ChessCoord; to: ChessCoord }
  | { type: "promote"; piece: "queen" | "rook" | "bishop" | "knight" };

function hordeBoard(): Board {
  const b = emptyBoard();
  // Black standard army (rows 0-1)
  const backRank: PieceType[] = ["rook","knight","bishop","queen","king","bishop","knight","rook"];
  for (let c = 0; c < 8; c++) {
    const t = backRank[c]!;
    b[idx(0, c)] = { color: "black", type: t };
    b[idx(1, c)] = { color: "black", type: "pawn" };
  }
  // White horde: 36 pawns
  // Rows 4-7: full rows of pawns
  for (let r = 4; r <= 7; r++) {
    for (let c = 0; c < 8; c++) {
      b[idx(r, c)] = { color: "white", type: "pawn" };
    }
  }
  // Row 3: 4 middle pawns
  for (let c = 2; c <= 5; c++) {
    b[idx(3, c)] = { color: "white", type: "pawn" };
  }
  return b;
}

function applyMoveToState(s: HordeState, move: ChessMove): HordeState {
  const piece = s.board[idx(move.from.row, move.from.col)];
  const isCapture = s.board[idx(move.to.row, move.to.col)] !== null || move.isEnPassant;
  const newCastling = updateCastlingRights(s.castling, move, s.board);
  const newBoard = applyMove(s.board, move);
  const newEP = computeEnPassantTarget(move, s.board);
  const nextTurn: PieceColor = s.turn === "white" ? "black" : "white";
  void piece; void isCapture;

  let result: GameResult = null;

  // Check if white has any pawns or promoted pieces left
  const whitePieces = newBoard.filter(p => p?.color === "white");
  if (whitePieces.length === 0) {
    result = "black";
  }

  if (!result) {
    const nextMoves = legalMoves(newBoard, nextTurn, newEP, newCastling);
    if (nextMoves.length === 0) {
      if (nextTurn === "black" && isInCheck(newBoard, "black")) {
        result = "white"; // black checkmated
      } else if (nextTurn === "white") {
        // White horde has no moves — loss for white
        result = "black";
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
    result,
    selected: null,
    promotionPending: null,
  };
}

function hordeEval(board: Board): number {
  // For white: count pawns and promoted pieces
  let score = 0;
  for (const p of board) {
    if (!p) continue;
    const v = p.type === "pawn" ? 100 : p.type === "queen" ? 900 : p.type === "rook" ? 500 : p.type === "bishop" ? 330 : p.type === "knight" ? 320 : 20000;
    score += p.color === "white" ? v : -v;
  }
  return score;
}

function runBot(state: HordeState): HordeState {
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
        const whites = s.board.filter(p => p?.color === "white");
        if (whites.length === 0) return true;
        return legalMoves(s.board, s.turn, s.ep, s.castling).length === 0;
      },
      evaluate(s) { return hordeEval(s.board) + evaluate(s.board) * 0.1; },
      maximizing(s) { return s.turn === "white"; },
    },
  );
  if (!result.move) return state;
  return applyMoveToState(state, result.move);
}

export function initialState(seed: number, settings: HordeSettings): HordeState {
  const castling: CastlingRights = { whiteKingside: false, whiteQueenside: false, blackKingside: true, blackQueenside: true };
  return {
    settings,
    rngSeed: seed,
    board: hordeBoard(),
    turn: "white",
    castling,
    enPassantTarget: null,
    result: null,
    selected: null,
    promotionPending: null,
  };
}

export function getLegalMovesForPiece(state: HordeState, from: ChessCoord): ChessMove[] {
  return legalMoves(state.board, state.turn, state.enPassantTarget, state.castling)
    .filter(m => m.from.row === from.row && m.from.col === from.col);
}

export function reducer(state: HordeState, action: HordeAction): HordeState {
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
  if (piece?.type === "pawn" && to.row === 0) {
    return { ...state, promotionPending: { from, to }, selected: null };
  }

  let next = applyMoveToState(state, matching[0]!);
  if (next.result === null && next.turn === "black") next = runBot(next);
  return next;
}

export function isTerminal(state: HordeState): { score: number } | null {
  if (state.result === null) return null;
  if (state.result === "white") return { score: 100 };
  if (state.result === "draw") return { score: 50 };
  return { score: 0 };
}

export { findKing };
