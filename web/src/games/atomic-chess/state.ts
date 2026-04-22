// Atomic Chess
// - Captures cause an explosion: the captured square AND all 8 surrounding squares lose non-pawn pieces
// - The capturing piece is also destroyed in the explosion
// - Pawns are immune to explosion (they don't explode, but are still captured normally if directly captured)
// - Win: explode the opponent's king
// - Kings cannot move into the blast radius of a capture they would make
// - A king adjacent to another king is immune to regular check (can't be captured via explosion since
//   both kings would die, but we simplify: if your king would be in the explosion you can't make that capture)

import { minimax } from "../../engines/grid/minimax.js";
import type { Board, ChessCoord, ChessMove, PieceColor, CastlingRights } from "../_chess-core/types.js";
import { standardBoard, idx, inBounds, emptyBoard } from "../_chess-core/types.js";
import {
  pseudoLegalMoves,
  applyMove as standardApplyMove,
  isInCheck,
  updateCastlingRights,
  computeEnPassantTarget,
  findKing,
} from "../_chess-core/moves.js";
import { evaluate } from "../_chess-core/eval.js";

export type { ChessMove, ChessCoord };

export interface AtomicSettings {
  opponent: "easy" | "medium" | "hard";
}

export type GameResult = "white" | "black" | "draw" | null;

export interface AtomicState {
  settings: AtomicSettings;
  rngSeed: number;
  board: Board;
  turn: PieceColor;
  castling: CastlingRights;
  enPassantTarget: ChessCoord | null;
  result: GameResult;
  promotionPending: { from: ChessCoord; to: ChessCoord } | null;
  lastExplosion: ChessCoord[] | null; // for visual effect
}

export type AtomicAction =
  | { type: "move"; from: ChessCoord; to: ChessCoord }
  | { type: "promote"; piece: "queen" | "rook" | "bishop" | "knight" };

function applyAtomicCapture(board: Board, move: ChessMove): Board {
  // Standard move first (pawn en passant etc)
  let b = [...board];
  const piece = b[idx(move.from.row, move.from.col)]!;
  const isCapture = b[idx(move.to.row, move.to.col)] !== null || move.isEnPassant;

  if (!isCapture) {
    // Non-capture: just a normal move
    return standardApplyMove(board, move);
  }

  // Explosion:
  // 1. Remove the capturing piece from its origin
  b[idx(move.from.row, move.from.col)] = null;

  // 2. The capturing piece and captured square explode - destroy all non-pawn pieces in 3x3 around target
  const { row: tr, col: tc } = move.to;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = tr + dr;
      const nc = tc + dc;
      if (!inBounds(nr, nc)) continue;
      const p = b[idx(nr, nc)];
      if (p && p.type !== "pawn") {
        b[idx(nr, nc)] = null;
      }
    }
  }
  // Also clear the target square itself (in case it had a pawn)
  b[idx(tr, tc)] = null;

  // Handle en passant explosion: also clear the captured pawn square
  if (move.isEnPassant) {
    const capturedRow = move.from.row;
    b[idx(capturedRow, move.to.col)] = null;
  }

  // Promotion: if the capturing piece was a pawn promoting, place the promoted piece
  // (rare in atomic but allowed) - however in atomic the piece is destroyed in explosion,
  // so promotion during capture is moot (piece explodes). We skip placing promoted piece on capture.

  void piece; // piece explodes
  return b;
}

export function getAtomicExplosionSquares(board: Board, move: ChessMove): ChessCoord[] {
  const isCapture = board[idx(move.to.row, move.to.col)] !== null || move.isEnPassant;
  if (!isCapture) return [];
  const squares: ChessCoord[] = [];
  const { row: tr, col: tc } = move.to;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = tr + dr;
      const nc = tc + dc;
      if (inBounds(nr, nc)) squares.push({ row: nr, col: nc });
    }
  }
  return squares;
}

export function getAtomicLegalMoves(
  board: Board,
  color: PieceColor,
  ep: ChessCoord | null,
  castling: CastlingRights,
): ChessMove[] {
  const pseudo = pseudoLegalMoves(board, color, ep, castling);
  const result: ChessMove[] = [];

  for (const move of pseudo) {
    const isCapture = board[idx(move.to.row, move.to.col)] !== null || move.isEnPassant;

    if (isCapture) {
      // Check: our own king must not be in the explosion radius
      const newBoard = applyAtomicCapture(board, move);
      const ourKing = findKing(newBoard, color);
      // If our king was destroyed in explosion, this move is illegal
      if (!ourKing) continue;
      // If opponent's king is also destroyed, this is a win — legal
      result.push(move);
    } else {
      // Non-capture: check that our king is not in check
      const newBoard = standardApplyMove(board, move);
      if (!isInCheck(newBoard, color)) {
        result.push(move);
      }
    }
  }

  return result;
}

function kingAlive(board: Board, color: PieceColor): boolean {
  return findKing(board, color) !== null;
}

function applyMoveToState(s: AtomicState, move: ChessMove): AtomicState {
  const isCapture = s.board[idx(move.to.row, move.to.col)] !== null || move.isEnPassant;
  const newCastling = updateCastlingRights(s.castling, move, s.board);
  const newBoard = isCapture ? applyAtomicCapture(s.board, move) : standardApplyMove(s.board, move);
  const newEP = computeEnPassantTarget(move, s.board);
  const nextTurn: PieceColor = s.turn === "white" ? "black" : "white";

  const explosionSquares = isCapture ? getAtomicExplosionSquares(s.board, move) : null;

  let result: GameResult = null;

  // If opponent's king was destroyed in explosion
  if (isCapture && !kingAlive(newBoard, nextTurn)) {
    result = s.turn;
  } else if (isCapture && !kingAlive(newBoard, s.turn)) {
    // Our king also destroyed => opponent wins? Actually this shouldn't happen with legal moves
    result = nextTurn;
  } else {
    // Check if next player has any legal moves
    const nextMoves = getAtomicLegalMoves(newBoard, nextTurn, newEP, newCastling);
    if (nextMoves.length === 0) {
      // Stalemate or no moves
      result = "draw";
    }
  }

  return {
    ...s,
    board: newBoard,
    turn: nextTurn,
    castling: newCastling,
    enPassantTarget: newEP,
    result,
    promotionPending: null,
    lastExplosion: explosionSquares,
  };
}

function runBot(state: AtomicState): AtomicState {
  const depth = state.settings.opponent === "easy" ? 2 : state.settings.opponent === "medium" ? 3 : 4;

  interface BotState {
    board: Board;
    turn: PieceColor;
    castling: CastlingRights;
    ep: ChessCoord | null;
  }

  const result = minimax<BotState, ChessMove>(
    { board: state.board, turn: state.turn, castling: state.castling, ep: state.enPassantTarget },
    {
      depth,
      moves(s) { return getAtomicLegalMoves(s.board, s.turn, s.ep, s.castling); },
      apply(s, move) {
        const isCapture = s.board[idx(move.to.row, move.to.col)] !== null || move.isEnPassant;
        const newBoard = isCapture ? applyAtomicCapture(s.board, move) : standardApplyMove(s.board, move);
        const newCastling = updateCastlingRights(s.castling, move, s.board);
        const newEP = computeEnPassantTarget(move, s.board);
        return { board: newBoard, turn: s.turn === "white" ? "black" : "white", castling: newCastling, ep: newEP };
      },
      isTerminal(s) {
        if (!kingAlive(s.board, "white") || !kingAlive(s.board, "black")) return true;
        return getAtomicLegalMoves(s.board, s.turn, s.ep, s.castling).length === 0;
      },
      evaluate(s) {
        if (!kingAlive(s.board, "white")) return -100000;
        if (!kingAlive(s.board, "black")) return 100000;
        return evaluate(s.board);
      },
      maximizing(s) { return s.turn === "white"; },
    },
  );

  if (!result.move) return state;
  return applyMoveToState(state, result.move);
}

export function initialState(seed: number, settings: AtomicSettings): AtomicState {
  return {
    settings,
    rngSeed: seed,
    board: standardBoard(),
    turn: "white",
    castling: { whiteKingside: true, whiteQueenside: true, blackKingside: true, blackQueenside: true },
    enPassantTarget: null,
    result: null,
    promotionPending: null,
    lastExplosion: null,
  };
}

export function reducer(state: AtomicState, action: AtomicAction): AtomicState {
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
  const moves = getAtomicLegalMoves(state.board, state.turn, state.enPassantTarget, state.castling);
  const matching = moves.filter(
    (m) =>
      m.from.row === from.row && m.from.col === from.col &&
      m.to.row === to.row && m.to.col === to.col,
  );
  if (matching.length === 0) return state;

  // Pawn promotion (non-capture only, since captures destroy piece in atomic)
  const piece = state.board[idx(from.row, from.col)];
  const isCapture = state.board[idx(to.row, to.col)] !== null;
  if (piece?.type === "pawn" && (to.row === 0 || to.row === 7) && !isCapture) {
    return { ...state, promotionPending: { from, to }, lastExplosion: null };
  }

  let next = applyMoveToState(state, matching[0]!);
  if (next.result === null && next.turn === "black") next = runBot(next);
  return next;
}

export function isTerminal(state: AtomicState): { score: number } | null {
  if (state.result === null) return null;
  if (state.result === "white") return { score: 100 };
  if (state.result === "draw") return { score: 50 };
  return { score: 0 };
}

export { emptyBoard, idx };
