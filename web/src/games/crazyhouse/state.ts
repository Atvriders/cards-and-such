// Crazyhouse
// - Captured pieces go into the capturing player's "pocket" (hand).
// - On your turn, instead of moving, you can "drop" a piece from your pocket onto any empty square.
// - Dropped pawns cannot go on ranks 1 or 8 (promotion row).
// - Dropped pieces can give check.
// - All other chess rules apply (checkmate, stalemate, 50-move rule).
// - Captured promoted pieces return as pawns.

import { minimax } from "../../engines/grid/minimax.js";
import type { Board, ChessCoord, ChessMove, CastlingRights, PieceColor, PieceType } from "../_chess-core/types.js";
import { standardBoard, idx, inBounds } from "../_chess-core/types.js";
import {
  pseudoLegalMoves,
  applyMove,
  isInCheck,
  updateCastlingRights,
  computeEnPassantTarget,
  findKing,
} from "../_chess-core/moves.js";
import { evaluate } from "../_chess-core/eval.js";

export type { ChessCoord };

export interface CrazyMove {
  type: "move";
  from: ChessCoord;
  to: ChessCoord;
  promotion?: PieceType;
  isEnPassant?: boolean;
  isCastling?: boolean;
}

export interface CrazyDrop {
  type: "drop";
  piece: PieceType;
  to: ChessCoord;
}

export type CrazyMoveOrDrop = CrazyMove | CrazyDrop;

export interface CrazyhouseSettings {
  opponent: "easy" | "medium" | "hard";
}

export type GameResult = "white" | "black" | "draw" | null;

export type Pocket = Partial<Record<PieceType, number>>;

export interface CrazyhouseState {
  settings: CrazyhouseSettings;
  rngSeed: number;
  board: Board;
  turn: PieceColor;
  castling: CastlingRights;
  enPassantTarget: ChessCoord | null;
  halfMoveClock: number;
  pockets: { white: Pocket; black: Pocket };
  result: GameResult;
  selected: ChessCoord | null;
  selectedDrop: PieceType | null;
  promotionPending: { from: ChessCoord; to: ChessCoord } | null;
}

export type CrazyhouseAction =
  | { type: "move"; from: ChessCoord; to: ChessCoord }
  | { type: "drop"; piece: PieceType; to: ChessCoord }
  | { type: "promote"; piece: "queen" | "rook" | "bishop" | "knight" }
  | { type: "selectDrop"; piece: PieceType | null };

function addToPocket(pocket: Pocket, piece: PieceType): Pocket {
  const t = piece === "queen" || piece === "rook" || piece === "bishop" || piece === "knight" ? piece : "pawn";
  return { ...pocket, [t]: (pocket[t] ?? 0) + 1 };
}

function removeFromPocket(pocket: Pocket, piece: PieceType): Pocket {
  const n = (pocket[piece] ?? 0) - 1;
  if (n <= 0) {
    const next = { ...pocket };
    delete next[piece];
    return next;
  }
  return { ...pocket, [piece]: n };
}

export function crazyhouseLegalMoves(
  board: Board,
  color: PieceColor,
  ep: ChessCoord | null,
  castling: CastlingRights,
): CrazyMoveOrDrop[] {
  const pseudo = pseudoLegalMoves(board, color, ep, castling);
  const result: CrazyMoveOrDrop[] = [];
  for (const move of pseudo) {
    if (move.isCastling) {
      const opp: PieceColor = color === "white" ? "black" : "white";
      const row = move.from.row;
      if (isInCheck(board, color)) continue;
      const passThroughCol = move.to.col === 6 ? 5 : 3;
      if (!inBounds(row, passThroughCol)) continue;
      const newBoard = applyMove(board, move);
      if (isInCheck(newBoard, color)) continue;
      result.push({ type: "move", ...move });
      void opp;
    } else {
      const newBoard = applyMove(board, move);
      if (!isInCheck(newBoard, color)) {
        result.push({ type: "move", ...move });
      }
    }
  }
  return result;
}

export function crazyhouseDropMoves(
  board: Board,
  color: PieceColor,
  pocket: Pocket,
): CrazyDrop[] {
  const drops: CrazyDrop[] = [];
  const pieces = Object.keys(pocket) as PieceType[];
  for (const piece of pieces) {
    if ((pocket[piece] ?? 0) <= 0) continue;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[idx(r, c)] !== null) continue;
        // Pawns can't drop on rank 1 or rank 8
        if (piece === "pawn" && (r === 0 || r === 7)) continue;
        // Check that drop doesn't leave own king in check
        const newBoard = [...board];
        newBoard[idx(r, c)] = { color, type: piece };
        if (isInCheck(newBoard, color)) continue;
        drops.push({ type: "drop", piece, to: { row: r, col: c } });
      }
    }
  }
  return drops;
}

function applyMoveToState(s: CrazyhouseState, move: CrazyMoveOrDrop): CrazyhouseState {
  let newBoard: Board;
  let newPockets = { ...s.pockets };
  let newHalf = s.halfMoveClock;
  let newCastling = s.castling;
  let newEP: ChessCoord | null = null;

  if (move.type === "drop") {
    newBoard = [...s.board];
    newBoard[idx(move.to.row, move.to.col)] = { color: s.turn, type: move.piece };
    newPockets = {
      ...newPockets,
      [s.turn]: removeFromPocket(newPockets[s.turn], move.piece),
    };
    newHalf++;
  } else {
    const chessMove: ChessMove = {
      from: move.from,
      to: move.to,
      ...(move.promotion ? { promotion: move.promotion } : {}),
      ...(move.isEnPassant ? { isEnPassant: move.isEnPassant } : {}),
      ...(move.isCastling ? { isCastling: move.isCastling } : {}),
    };
    const captured = s.board[idx(move.to.row, move.to.col)];
    const movedPiece = s.board[idx(move.from.row, move.from.col)];
    const isCapture = captured !== null || move.isEnPassant;

    // Captured piece goes to opponent's pocket (promoted pieces go back as pawns)
    if (captured) {
      const capturedType = captured.type === "pawn" ? "pawn" : captured.type;
      const opponent: PieceColor = s.turn === "white" ? "black" : "white";
      void opponent;
      newPockets = {
        ...newPockets,
        [s.turn]: addToPocket(newPockets[s.turn], capturedType),
      };
    }
    if (move.isEnPassant) {
      newPockets = {
        ...newPockets,
        [s.turn]: addToPocket(newPockets[s.turn], "pawn"),
      };
    }

    newCastling = updateCastlingRights(s.castling, chessMove, s.board);
    newBoard = applyMove(s.board, chessMove);
    newEP = computeEnPassantTarget(chessMove, s.board);
    newHalf = (isCapture || movedPiece?.type === "pawn") ? 0 : s.halfMoveClock + 1;
  }

  const nextTurn: PieceColor = s.turn === "white" ? "black" : "white";

  let result: GameResult = null;
  if (newHalf >= 100) result = "draw";

  if (!result) {
    const nextMoves = crazyhouseLegalMoves(newBoard, nextTurn, newEP, newCastling);
    const nextDrops = crazyhouseDropMoves(newBoard, nextTurn, newPockets[nextTurn]);
    if (nextMoves.length === 0 && nextDrops.length === 0) {
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
    pockets: newPockets,
    result,
    selected: null,
    selectedDrop: null,
    promotionPending: null,
  };
}

function crazyEval(board: Board, pockets: { white: Pocket; black: Pocket }): number {
  const materialVals: Record<PieceType, number> = { pawn: 100, knight: 320, bishop: 330, rook: 500, queen: 900, king: 0 };
  let pocketScore = 0;
  for (const [pt, cnt] of Object.entries(pockets.white)) {
    pocketScore += (materialVals[pt as PieceType] ?? 0) * (cnt ?? 0);
  }
  for (const [pt, cnt] of Object.entries(pockets.black)) {
    pocketScore -= (materialVals[pt as PieceType] ?? 0) * (cnt ?? 0);
  }
  return evaluate(board) + pocketScore * 0.5;
}

function runBot(state: CrazyhouseState): CrazyhouseState {
  const depth = state.settings.opponent === "easy" ? 2 : state.settings.opponent === "medium" ? 3 : 3;
  interface BotState { board: Board; turn: PieceColor; castling: CastlingRights; ep: ChessCoord | null; pockets: { white: Pocket; black: Pocket }; }
  const result = minimax<BotState, CrazyMoveOrDrop>(
    { board: state.board, turn: state.turn, castling: state.castling, ep: state.enPassantTarget, pockets: state.pockets },
    {
      depth,
      moves(s) {
        return [
          ...crazyhouseLegalMoves(s.board, s.turn, s.ep, s.castling),
          ...crazyhouseDropMoves(s.board, s.turn, s.pockets[s.turn]),
        ];
      },
      apply(s, move) {
        let newBoard: Board;
        let newPockets = { ...s.pockets };
        let newEP: ChessCoord | null = null;
        let newCastling = s.castling;
        if (move.type === "drop") {
          newBoard = [...s.board];
          newBoard[idx(move.to.row, move.to.col)] = { color: s.turn, type: move.piece };
          newPockets = { ...newPockets, [s.turn]: removeFromPocket(newPockets[s.turn], move.piece) };
        } else {
          const chessMove: ChessMove = { from: move.from, to: move.to, ...(move.promotion ? { promotion: move.promotion } : {}), ...(move.isEnPassant ? { isEnPassant: move.isEnPassant } : {}), ...(move.isCastling ? { isCastling: move.isCastling } : {}) };
          const captured = s.board[idx(move.to.row, move.to.col)];
          if (captured) {
            newPockets = { ...newPockets, [s.turn]: addToPocket(newPockets[s.turn], captured.type === "pawn" ? "pawn" : captured.type) };
          }
          newCastling = updateCastlingRights(s.castling, chessMove, s.board);
          newBoard = applyMove(s.board, chessMove);
          newEP = computeEnPassantTarget(chessMove, s.board);
        }
        return { board: newBoard, turn: s.turn === "white" ? "black" : "white", castling: newCastling, ep: newEP, pockets: newPockets };
      },
      isTerminal(s) {
        const moves = crazyhouseLegalMoves(s.board, s.turn, s.ep, s.castling);
        const drops = crazyhouseDropMoves(s.board, s.turn, s.pockets[s.turn]);
        return moves.length === 0 && drops.length === 0;
      },
      evaluate(s) { return crazyEval(s.board, s.pockets); },
      maximizing(s) { return s.turn === "white"; },
    },
  );
  if (!result.move) return state;
  return applyMoveToState(state, result.move);
}

export function initialState(seed: number, settings: CrazyhouseSettings): CrazyhouseState {
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
    pockets: { white: {}, black: {} },
    result: null,
    selected: null,
    selectedDrop: null,
    promotionPending: null,
  };
}

export function getLegalMovesForPiece(state: CrazyhouseState, from: ChessCoord): CrazyMoveOrDrop[] {
  return crazyhouseLegalMoves(state.board, state.turn, state.enPassantTarget, state.castling)
    .filter(m => m.type === "move" && m.from.row === from.row && m.from.col === from.col);
}

export function getDropTargets(state: CrazyhouseState, piece: PieceType): ChessCoord[] {
  return crazyhouseDropMoves(state.board, state.turn, state.pockets[state.turn])
    .filter(d => d.piece === piece)
    .map(d => d.to);
}

export function isPlayerInCheck(state: CrazyhouseState): boolean {
  return isInCheck(state.board, state.turn);
}

export function reducer(state: CrazyhouseState, action: CrazyhouseAction): CrazyhouseState {
  if (state.result !== null) return state;

  if (action.type === "selectDrop") {
    return { ...state, selectedDrop: action.piece, selected: null };
  }

  if (state.promotionPending) {
    if (action.type !== "promote") return state;
    const { from, to } = state.promotionPending;
    const move: CrazyMoveOrDrop = { type: "move", from, to, promotion: action.piece };
    let next = applyMoveToState(state, move);
    if (next.result === null && next.turn === "black") next = runBot(next);
    return next;
  }

  if (action.type === "drop") {
    const drops = crazyhouseDropMoves(state.board, state.turn, state.pockets[state.turn]);
    const valid = drops.find(d => d.piece === action.piece && d.to.row === action.to.row && d.to.col === action.to.col);
    if (!valid) return state;
    let next = applyMoveToState(state, valid);
    if (next.result === null && next.turn === "black") next = runBot(next);
    return next;
  }

  if (action.type === "move") {
    const { from, to } = action;
    const moves = crazyhouseLegalMoves(state.board, state.turn, state.enPassantTarget, state.castling);
    const matching = moves.filter(m =>
      m.type === "move" &&
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

export function isTerminal(state: CrazyhouseState): { score: number } | null {
  if (state.result === null) return null;
  if (state.result === "white") return { score: 100 };
  if (state.result === "draw") return { score: 50 };
  return { score: 0 };
}

export { findKing };
