// Suicide Chess (Antichess / Losing Chess)
// - Captures are mandatory (must capture if possible)
// - Goal: lose all your pieces (or be stalemated)
// - No check concept; king is just a normal piece
// - No castling

import { minimax } from "../../engines/grid/minimax.js";
import type { Board, ChessCoord, ChessMove, PieceColor } from "../_chess-core/types.js";
import { standardBoard, idx, emptyBoard } from "../_chess-core/types.js";
import type { CastlingRights } from "../_chess-core/types.js";
import { pseudoLegalMoves, applyMove, computeEnPassantTarget } from "../_chess-core/moves.js";
import { evaluateMaterial } from "../_chess-core/eval.js";

export type { ChessMove, ChessCoord };

export interface SuicideSettings {
  opponent: "easy" | "medium" | "hard";
}

export type GameResult = "white" | "black" | "draw" | null;

export interface SuicideState {
  settings: SuicideSettings;
  rngSeed: number;
  board: Board;
  turn: PieceColor;
  enPassantTarget: ChessCoord | null;
  result: GameResult;
  promotionPending: { from: ChessCoord; to: ChessCoord } | null;
}

export type SuicideAction =
  | { type: "move"; from: ChessCoord; to: ChessCoord }
  | { type: "promote"; piece: "queen" | "rook" | "bishop" | "knight" };

const NO_CASTLING: CastlingRights = {
  whiteKingside: false,
  whiteQueenside: false,
  blackKingside: false,
  blackQueenside: false,
};

export function getSuicideLegalMoves(board: Board, color: PieceColor, ep: ChessCoord | null): ChessMove[] {
  const pseudo = pseudoLegalMoves(board, color, ep, NO_CASTLING);
  // Mandatory capture: if any capture exists, only captures are legal
  const captures = pseudo.filter((m) => m.capturedPiece || m.isEnPassant);
  if (captures.length > 0) return captures;
  return pseudo;
}

function countPieces(board: Board, color: PieceColor): number {
  let count = 0;
  for (let i = 0; i < 64; i++) {
    const p = board[i];
    if (p && p.color === color) count++;
  }
  return count;
}

export function initialState(seed: number, settings: SuicideSettings): SuicideState {
  return {
    settings,
    rngSeed: seed,
    board: standardBoard(),
    turn: "white",
    enPassantTarget: null,
    result: null,
    promotionPending: null,
  };
}

function depthForSettings(settings: SuicideSettings): number {
  switch (settings.opponent) {
    case "easy": return 2;
    case "medium": return 3;
    case "hard": return 4;
  }
}

interface BotState {
  board: Board;
  turn: PieceColor;
  ep: ChessCoord | null;
}

function applyMoveToState(s: SuicideState, move: ChessMove): SuicideState {
  const newBoard = applyMove(s.board, move);
  const newEP = computeEnPassantTarget(move, s.board);
  const nextTurn: PieceColor = s.turn === "white" ? "black" : "white";

  // Win condition: current player loses all pieces (from their perspective, that's a win for them in antichess)
  // After the move, check if current player has no pieces left => current player wins
  const currentPlayerPieces = countPieces(newBoard, s.turn);
  let result: GameResult = null;
  if (currentPlayerPieces === 0) {
    result = s.turn; // player who lost all pieces wins
  } else {
    const nextMoves = getSuicideLegalMoves(newBoard, nextTurn, newEP);
    if (nextMoves.length === 0) {
      // Stalemate: person with no moves wins (or the one with fewer pieces)
      const nextPieces = countPieces(newBoard, nextTurn);
      const currentPieces = countPieces(newBoard, s.turn);
      if (nextPieces < currentPieces) result = nextTurn;
      else if (currentPieces < nextPieces) result = s.turn;
      else result = "draw";
    }
  }

  return {
    ...s,
    board: newBoard,
    turn: nextTurn,
    enPassantTarget: newEP,
    result,
    promotionPending: null,
  };
}

function runBot(state: SuicideState): SuicideState {
  const depth = depthForSettings(state.settings);

  // In suicide chess, white wants to LOSE pieces = minimize material for white
  const result = minimax<BotState, ChessMove>(
    { board: state.board, turn: state.turn, ep: state.enPassantTarget },
    {
      depth,
      moves(s) { return getSuicideLegalMoves(s.board, s.turn, s.ep); },
      apply(s, move) {
        const newBoard = applyMove(s.board, move);
        const newEP = computeEnPassantTarget(move, s.board);
        return { board: newBoard, turn: s.turn === "white" ? "black" : "white", ep: newEP };
      },
      isTerminal(s) {
        const moves = getSuicideLegalMoves(s.board, s.turn, s.ep);
        return moves.length === 0 || countPieces(s.board, "white") === 0 || countPieces(s.board, "black") === 0;
      },
      // Evaluate: bot is black; black wants to lose pieces = negative black material is good for black
      // So we negate: positive = white has many pieces (bad for white in suicide), negative = black has many (bad for black)
      // White maximizing means white wants to lose = minimize white material = minimize evaluateMaterial?
      // evaluateMaterial returns white - black. White losing = less white material = more negative.
      // White wants to minimize, black wants to maximize (both want fewer pieces)
      // Use: -evaluateMaterial (so white wants to minimize = lose pieces, black maximizing = wants fewer black pieces)
      evaluate(s) { return -evaluateMaterial(s.board); },
      maximizing(s) { return s.turn === "black"; }, // black maximizing in the negated world
    },
  );

  if (!result.move) return state;
  return applyMoveToState(state, result.move);
}

export function reducer(state: SuicideState, action: SuicideAction): SuicideState {
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
  const moves = getSuicideLegalMoves(state.board, state.turn, state.enPassantTarget);
  const matching = moves.filter(
    (m) =>
      m.from.row === from.row && m.from.col === from.col &&
      m.to.row === to.row && m.to.col === to.col,
  );
  if (matching.length === 0) return state;

  const piece = state.board[idx(from.row, from.col)];
  if (piece?.type === "pawn" && (to.row === 0 || to.row === 7)) {
    return { ...state, promotionPending: { from, to } };
  }

  let next = applyMoveToState(state, matching[0]!);
  if (next.result === null && next.turn === "black") next = runBot(next);
  return next;
}

export function isTerminal(state: SuicideState): { score: number } | null {
  if (state.result === null) return null;
  if (state.result === "white") return { score: 100 };
  if (state.result === "draw") return { score: 50 };
  return { score: 0 };
}

export { emptyBoard, idx };
