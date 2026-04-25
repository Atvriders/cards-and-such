// Racing Kings
// - Goal: be the first king to reach rank 8 (row 0)
// - No pawns. No checks allowed during the game (you may not move into check OR give check).
// - Special starting position: both kings and pieces on ranks 1-2.
// - If white reaches rank 8 on their move, black gets one move to also reach rank 8 (draw if they do).

import { minimax } from "../../engines/grid/minimax.js";
import type { Board, ChessCoord, ChessMove, PieceColor } from "../_chess-core/types.js";
import { idx, emptyBoard, inBounds } from "../_chess-core/types.js";
import {
  pseudoLegalMoves,
  applyMove,
  isInCheck,
  findKing,
} from "../_chess-core/moves.js";
import { evaluateMaterial } from "../_chess-core/eval.js";

export type { ChessMove, ChessCoord };

export interface RacingKingsSettings {
  opponent: "easy" | "medium" | "hard";
}

export type GameResult = "white" | "black" | "draw" | null;

export interface RacingKingsState {
  settings: RacingKingsSettings;
  rngSeed: number;
  board: Board;
  turn: PieceColor;
  result: GameResult;
  selected: ChessCoord | null;
  // Track if white already reached rank 8 (waiting for black's response)
  whiteReachedRank8: boolean;
}

export type RacingKingsAction =
  | { type: "move"; from: ChessCoord; to: ChessCoord };

function racingKingsBoard(): Board {
  const b = emptyBoard();
  // Racing Kings starting position (Lichess standard)
  // FEN: 8/8/8/8/8/8/krbnNBRK/qrbnNBRQ w - - 0 1
  // Row 6 (rank 2): bK bR bB bN wN wB wR wK
  b[idx(6, 0)] = { color: "black", type: "king" };
  b[idx(6, 1)] = { color: "black", type: "rook" };
  b[idx(6, 2)] = { color: "black", type: "bishop" };
  b[idx(6, 3)] = { color: "black", type: "knight" };
  b[idx(6, 4)] = { color: "white", type: "knight" };
  b[idx(6, 5)] = { color: "white", type: "bishop" };
  b[idx(6, 6)] = { color: "white", type: "rook" };
  b[idx(6, 7)] = { color: "white", type: "king" };
  // Row 7 (rank 1): bQ bR bB bN wN wB wR wQ
  b[idx(7, 0)] = { color: "black", type: "queen" };
  b[idx(7, 1)] = { color: "black", type: "rook" };
  b[idx(7, 2)] = { color: "black", type: "bishop" };
  b[idx(7, 3)] = { color: "black", type: "knight" };
  b[idx(7, 4)] = { color: "white", type: "knight" };
  b[idx(7, 5)] = { color: "white", type: "bishop" };
  b[idx(7, 6)] = { color: "white", type: "rook" };
  b[idx(7, 7)] = { color: "white", type: "queen" };
  return b;
}

// Legal moves for Racing Kings: cannot give check or be in check after move
export function racingLegalMoves(board: Board, color: PieceColor): ChessMove[] {
  // No castling, no en passant, no pawns
  const noCastling = { whiteKingside: false, whiteQueenside: false, blackKingside: false, blackQueenside: false };
  const pseudo = pseudoLegalMoves(board, color, null, noCastling);
  const opp: PieceColor = color === "white" ? "black" : "white";
  const result: ChessMove[] = [];
  for (const move of pseudo) {
    const newBoard = applyMove(board, move);
    // Can't leave self in check
    if (isInCheck(newBoard, color)) continue;
    // Can't give check to opponent (unique Racing Kings rule)
    if (isInCheck(newBoard, opp)) continue;
    result.push(move);
  }
  return result;
}

function kingRow(board: Board, color: PieceColor): number {
  const pos = findKing(board, color);
  return pos ? pos.row : 7;
}

function applyMoveToState(s: RacingKingsState, move: ChessMove): RacingKingsState {
  const newBoard = applyMove(s.board, move);
  const nextTurn: PieceColor = s.turn === "white" ? "black" : "white";

  const whiteRow = kingRow(newBoard, "white");
  const blackRow = kingRow(newBoard, "black");

  let result: GameResult = null;
  let whiteReachedRank8 = s.whiteReachedRank8;

  if (s.turn === "white" && whiteRow === 0) {
    // White just reached rank 8 — give black a chance
    whiteReachedRank8 = true;
  }

  if (s.turn === "black") {
    if (blackRow === 0) {
      // Black reached rank 8
      if (whiteReachedRank8) {
        result = "draw";
      } else {
        result = "black";
      }
    } else if (whiteReachedRank8) {
      // Black's response move didn't reach rank 8
      result = "white";
    }
  }

  if (!result) {
    const nextMoves = racingLegalMoves(newBoard, nextTurn);
    if (nextMoves.length === 0) result = "draw";
  }

  return {
    ...s,
    board: newBoard,
    turn: nextTurn,
    result,
    selected: null,
    whiteReachedRank8,
  };
}

function racingEval(board: Board): number {
  // Lower row = closer to rank 8 = better for that color
  const wKing = findKing(board, "white");
  const bKing = findKing(board, "black");
  const wProgress = wKing ? (7 - wKing.row) : 0;
  const bProgress = bKing ? (7 - bKing.row) : 0;
  return wProgress - bProgress + evaluateMaterial(board) * 0.01;
}

function runBot(state: RacingKingsState): RacingKingsState {
  const depth = state.settings.opponent === "easy" ? 2 : state.settings.opponent === "medium" ? 3 : 4;
  interface BotState { board: Board; turn: PieceColor; whiteReachedRank8: boolean; }
  const result = minimax<BotState, ChessMove>(
    { board: state.board, turn: state.turn, whiteReachedRank8: state.whiteReachedRank8 },
    {
      depth,
      moves(s) { return racingLegalMoves(s.board, s.turn); },
      apply(s, move) {
        const newBoard = applyMove(s.board, move);
        const wRow = kingRow(newBoard, "white");
        return {
          board: newBoard,
          turn: s.turn === "white" ? "black" : "white",
          whiteReachedRank8: s.whiteReachedRank8 || (s.turn === "white" && wRow === 0),
        };
      },
      isTerminal(s) {
        const wRow = kingRow(s.board, "white");
        const bRow = kingRow(s.board, "black");
        if (bRow === 0) return true;
        if (s.whiteReachedRank8 && s.turn === "white") return true;
        if (wRow === 0 && s.turn === "black") return false; // give black a turn
        return racingLegalMoves(s.board, s.turn).length === 0;
      },
      evaluate(s) { return racingEval(s.board); },
      maximizing(s) { return s.turn === "white"; },
    },
  );
  if (!result.move) return state;
  return applyMoveToState(state, result.move);
}

export function initialState(seed: number, settings: RacingKingsSettings): RacingKingsState {
  return {
    settings,
    rngSeed: seed,
    board: racingKingsBoard(),
    turn: "white",
    result: null,
    selected: null,
    whiteReachedRank8: false,
  };
}

export function getLegalMovesForPiece(state: RacingKingsState, from: ChessCoord): ChessMove[] {
  return racingLegalMoves(state.board, state.turn)
    .filter(m => m.from.row === from.row && m.from.col === from.col);
}

export function reducer(state: RacingKingsState, action: RacingKingsAction): RacingKingsState {
  if (state.result !== null) return state;
  if (action.type !== "move") return state;

  const { from, to } = action;
  const moves = racingLegalMoves(state.board, state.turn);
  const matching = moves.filter(m =>
    m.from.row === from.row && m.from.col === from.col &&
    m.to.row === to.row && m.to.col === to.col,
  );
  if (matching.length === 0) return state;

  let next = applyMoveToState(state, matching[0]!);
  if (next.result === null && next.turn === "black") next = runBot(next);
  return next;
}

export function isTerminal(state: RacingKingsState): { score: number } | null {
  if (state.result === null) return null;
  if (state.result === "white") return { score: 100 };
  if (state.result === "draw") return { score: 50 };
  return { score: 0 };
}

export { findKing, inBounds };
