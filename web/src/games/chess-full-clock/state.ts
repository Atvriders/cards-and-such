// ============================================================================
// Chess (Full FIDE w/ Clock) — state.ts
// ============================================================================
//
// Implements the full FIDE rule-set chess engine, with time control:
//   - All 6 piece types with standard movement
//   - Pawn promotion (Q/R/B/N) — player must choose for the human, AI picks Q
//   - Castling: kingside + queenside, with all four legality checks
//       1. King not currently in check
//       2. King does not pass through an attacked square
//       3. King does not land on an attacked square
//       4. Neither the king nor the relevant rook has moved
//   - En passant: one-move window after a pawn double-step
//   - 50-move rule (100 half-moves with no capture or pawn move)
//   - Threefold repetition (FEN-like position keys tracked in state)
//   - Insufficient material draw (K vs K, K+B vs K, K+N vs K, K+B vs K+B same color)
//   - Check / checkmate / stalemate detection
//
// Time control:
//   Settings choose blitz-5, rapid-15, or classical-30 minutes per side.
//   The component is responsible for measuring wall-clock deltas (e.g. via a
//   requestAnimationFrame loop in useEffect) and dispatching { type: "tick",
//   deltaMs } on each frame; we decrement the side-to-move's remaining time
//   and end the game (timeout loss) when it drops to 0. We do not run any
//   real-time clock inside the reducer.
//
// PGN:
//   state.pgn is a string[] holding SAN move strings appended on every applied
//   move. We use a simple SAN encoder that handles ambiguity by checking
//   whether multiple identical-typed pieces can reach the same square (file
//   disambiguation first, then rank, then both) per the FIDE algebraic spec.
//
// AI design (CPU = Black):
//   Alpha-beta negamax-flavored minimax (max-min variant) at depth 4.
//   Static evaluation = material + piece-square tables (from the shared
//   _chess-core/eval module) + mobility bonus + king-safety penalty.
//
//     score(state) = pst(white) - pst(black)
//                  + MOBILITY_WEIGHT * (mobility(white) - mobility(black))
//                  - KING_SAFETY_WEIGHT * (kingExposure(white) - kingExposure(black))
//
//   Mobility = number of pseudo-legal moves available to that side from the
//   current position. King exposure = count of empty squares adjacent to the
//   king (an open king is unsafe).
//
//   Move ordering: captures first (MVV-LVA heuristic) so alpha-beta prunes
//   more aggressively. This is critical to keep depth-4 search tractable in
//   real-time without a transposition table.
//
//   The bot triggers automatically inside the reducer after the player's
//   ply, mirroring the basic chess module pattern.
//
// ============================================================================

import type {
  Board,
  ChessCoord,
  ChessMove,
  CastlingRights,
  PieceColor,
  PieceType,
  ChessPiece,
} from "../_chess-core/types.js";
import { standardBoard, idx } from "../_chess-core/types.js";
import {
  legalMoves,
  pseudoLegalMoves,
  applyMove,
  isInCheck,
  updateCastlingRights,
  computeEnPassantTarget,
  findKing,
} from "../_chess-core/moves.js";
import { evaluate as pstEvaluate } from "../_chess-core/eval.js";

export type TimeControl = "blitz-5" | "rapid-15" | "classical-30";

export interface ChessFullClockSettings {
  timeControl: TimeControl;
  flipBoardForBlack: boolean;
}

export type GameResult =
  | "white-checkmate"
  | "black-checkmate"
  | "white-timeout"
  | "black-timeout"
  | "draw-stalemate"
  | "draw-50move"
  | "draw-repetition"
  | "draw-material"
  | "draw-agreed"
  | null;

export interface ChessFullClockState {
  settings: ChessFullClockSettings;
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
  /** Remaining milliseconds for white and black. */
  whiteTimeMs: number;
  blackTimeMs: number;
  /** SAN move strings, one per ply. UI can display these as PGN. */
  pgn: string[];
  /** Most recent move (for highlight in UI). */
  lastMove: { from: ChessCoord; to: ChessCoord } | null;
  /** Draw offers — when white offers, black sees a button to accept. */
  drawOfferedBy: PieceColor | null;
}

export type ChessFullClockAction =
  | { type: "select"; coord: ChessCoord }
  | { type: "move"; from: ChessCoord; to: ChessCoord }
  | { type: "promote"; piece: "queen" | "rook" | "bishop" | "knight" }
  | { type: "tick"; deltaMs: number }
  | { type: "offer-draw" }
  | { type: "accept-draw" }
  | { type: "decline-draw" }
  | { type: "resign" };

// ---------------------------------------------------------------------------
// Time control bookkeeping
// ---------------------------------------------------------------------------

function timeControlMs(tc: TimeControl): number {
  switch (tc) {
    case "blitz-5":
      return 5 * 60 * 1000;
    case "rapid-15":
      return 15 * 60 * 1000;
    case "classical-30":
      return 30 * 60 * 1000;
  }
}

// ---------------------------------------------------------------------------
// Position keys (for threefold repetition)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Insufficient material
// ---------------------------------------------------------------------------

function isInsufficientMaterial(board: Board): boolean {
  const pieces: { piece: ChessPiece; r: number; c: number }[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[idx(r, c)];
      if (p) pieces.push({ piece: p, r, c });
    }
  }

  // Any pawn/rook/queen => sufficient
  for (const { piece } of pieces) {
    if (
      piece.type === "pawn" ||
      piece.type === "rook" ||
      piece.type === "queen"
    ) {
      return false;
    }
  }

  // K vs K
  if (pieces.length === 2) return true;

  // K + minor vs K
  if (pieces.length === 3) {
    const nonKing = pieces.filter((p) => p.piece.type !== "king");
    if (
      nonKing.length === 1 &&
      (nonKing[0]!.piece.type === "bishop" ||
        nonKing[0]!.piece.type === "knight")
    ) {
      return true;
    }
  }

  // K+B vs K+B with bishops on same colored squares
  if (pieces.length === 4) {
    const bishops = pieces.filter((p) => p.piece.type === "bishop");
    if (bishops.length === 2) {
      const colorOf = (r: number, c: number) => (r + c) % 2;
      if (
        colorOf(bishops[0]!.r, bishops[0]!.c) ===
        colorOf(bishops[1]!.r, bishops[1]!.c) &&
        bishops[0]!.piece.color !== bishops[1]!.piece.color
      ) {
        return true;
      }
    }
  }

  return false;
}

// ---------------------------------------------------------------------------
// SAN encoder
// ---------------------------------------------------------------------------

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
function squareName(coord: ChessCoord): string {
  return `${FILES[coord.col]}${8 - coord.row}`;
}

function pieceLetter(type: PieceType): string {
  switch (type) {
    case "king":
      return "K";
    case "queen":
      return "Q";
    case "rook":
      return "R";
    case "bishop":
      return "B";
    case "knight":
      return "N";
    case "pawn":
      return "";
  }
}

function moveToSan(
  board: Board,
  move: ChessMove,
  turn: PieceColor,
  ep: ChessCoord | null,
  castling: CastlingRights,
): string {
  // Castling
  if (move.isCastling) {
    const san = move.to.col === 6 ? "O-O" : "O-O-O";
    return appendCheckmateSuffix(san, board, move, turn, ep, castling);
  }

  const piece = board[idx(move.from.row, move.from.col)];
  if (!piece) return "?";

  const captured =
    board[idx(move.to.row, move.to.col)] !== null || move.isEnPassant;
  let san = "";

  if (piece.type === "pawn") {
    if (captured) {
      san = `${FILES[move.from.col]}x${squareName(move.to)}`;
    } else {
      san = squareName(move.to);
    }
    if (move.promotion) san += `=${pieceLetter(move.promotion)}`;
  } else {
    san = pieceLetter(piece.type);

    // Disambiguation: are there other same-typed pieces that could move here?
    const all = legalMoves(board, turn, ep, castling);
    const competitors = all.filter(
      (m) =>
        m.to.row === move.to.row &&
        m.to.col === move.to.col &&
        !(m.from.row === move.from.row && m.from.col === move.from.col),
    );
    const competitorPieces = competitors.filter((m) => {
      const p = board[idx(m.from.row, m.from.col)];
      return p?.type === piece.type;
    });
    if (competitorPieces.length > 0) {
      const sameFile = competitorPieces.some(
        (m) => m.from.col === move.from.col,
      );
      const sameRank = competitorPieces.some(
        (m) => m.from.row === move.from.row,
      );
      if (!sameFile) {
        san += FILES[move.from.col];
      } else if (!sameRank) {
        san += `${8 - move.from.row}`;
      } else {
        san += squareName(move.from);
      }
    }

    if (captured) san += "x";
    san += squareName(move.to);
  }

  return appendCheckmateSuffix(san, board, move, turn, ep, castling);
}

function appendCheckmateSuffix(
  san: string,
  board: Board,
  move: ChessMove,
  turn: PieceColor,
  ep: ChessCoord | null,
  castling: CastlingRights,
): string {
  const newBoard = applyMove(board, move);
  const newCastling = updateCastlingRights(castling, move, board);
  const newEp = computeEnPassantTarget(move, board);
  const opponent: PieceColor = turn === "white" ? "black" : "white";
  if (isInCheck(newBoard, opponent)) {
    const oppMoves = legalMoves(newBoard, opponent, newEp, newCastling);
    if (oppMoves.length === 0) return `${san}#`;
    return `${san}+`;
  }
  return san;
}

// ---------------------------------------------------------------------------
// AI: alpha-beta minimax with material + PST + mobility + king safety
// ---------------------------------------------------------------------------

const AI_DEPTH = 4;
const MOBILITY_WEIGHT = 2;
const KING_SAFETY_WEIGHT = 6;

function kingExposure(board: Board, color: PieceColor): number {
  const king = findKing(board, color);
  if (!king) return 0;
  let openAdj = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = king.row + dr;
      const nc = king.col + dc;
      if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) continue;
      const p = board[idx(nr, nc)];
      if (!p || p.color !== color) openAdj++;
    }
  }
  return openAdj;
}

interface BotChessState {
  board: Board;
  turn: PieceColor;
  castling: CastlingRights;
  enPassantTarget: ChessCoord | null;
}

function evaluatePosition(s: BotChessState): number {
  const pst = pstEvaluate(s.board);
  const wMobility = pseudoLegalMoves(
    s.board,
    "white",
    s.enPassantTarget,
    s.castling,
  ).length;
  const bMobility = pseudoLegalMoves(
    s.board,
    "black",
    s.enPassantTarget,
    s.castling,
  ).length;
  const wExp = kingExposure(s.board, "white");
  const bExp = kingExposure(s.board, "black");
  return (
    pst +
    MOBILITY_WEIGHT * (wMobility - bMobility) -
    KING_SAFETY_WEIGHT * (wExp - bExp)
  );
}

const MATERIAL_VALUE: Record<PieceType, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000,
};

function mvvLva(board: Board, m: ChessMove): number {
  const victim = board[idx(m.to.row, m.to.col)];
  if (!victim && !m.isEnPassant) return 0;
  const attacker = board[idx(m.from.row, m.from.col)];
  const victimVal = victim
    ? MATERIAL_VALUE[victim.type]
    : MATERIAL_VALUE.pawn;
  const attackerVal = attacker ? MATERIAL_VALUE[attacker.type] : 0;
  return victimVal * 10 - attackerVal;
}

function orderedMoves(s: BotChessState): ChessMove[] {
  const list = legalMoves(s.board, s.turn, s.enPassantTarget, s.castling);
  list.sort((a, b) => mvvLva(s.board, b) - mvvLva(s.board, a));
  return list;
}

function applyBotMove(s: BotChessState, move: ChessMove): BotChessState {
  const newCastling = updateCastlingRights(s.castling, move, s.board);
  const newBoard = applyMove(s.board, move);
  const newEP = computeEnPassantTarget(move, s.board);
  return {
    board: newBoard,
    turn: s.turn === "white" ? "black" : "white",
    castling: newCastling,
    enPassantTarget: newEP,
  };
}

function alphaBeta(
  s: BotChessState,
  depth: number,
  alpha: number,
  beta: number,
): { score: number; move: ChessMove | null } {
  if (depth === 0) {
    return { score: evaluatePosition(s), move: null };
  }
  const moves = orderedMoves(s);
  if (moves.length === 0) {
    // Terminal: checkmate (very bad for mover) or stalemate (0)
    if (isInCheck(s.board, s.turn)) {
      const mateScore = s.turn === "white" ? -1_000_000 : 1_000_000;
      return { score: mateScore + (s.turn === "white" ? depth : -depth), move: null };
    }
    return { score: 0, move: null };
  }
  const maxPlayer = s.turn === "white";
  let bestMove: ChessMove | null = null;
  let bestScore = maxPlayer ? -Infinity : Infinity;
  for (const m of moves) {
    const next = applyBotMove(s, m);
    const { score } = alphaBeta(next, depth - 1, alpha, beta);
    if (maxPlayer) {
      if (score > bestScore) {
        bestScore = score;
        bestMove = m;
      }
      alpha = Math.max(alpha, bestScore);
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = m;
      }
      beta = Math.min(beta, bestScore);
    }
    if (beta <= alpha) break;
  }
  return { score: bestScore, move: bestMove };
}

function findBotMove(state: ChessFullClockState): ChessMove | null {
  const botState: BotChessState = {
    board: state.board,
    turn: state.turn,
    castling: state.castling,
    enPassantTarget: state.enPassantTarget,
  };
  const { move } = alphaBeta(botState, AI_DEPTH, -Infinity, Infinity);
  // Bot always promotes to queen
  if (move && move.promotion === undefined) {
    const piece = state.board[idx(move.from.row, move.from.col)];
    const promoteRow = state.turn === "white" ? 0 : 7;
    if (piece?.type === "pawn" && move.to.row === promoteRow) {
      return { ...move, promotion: "queen" };
    }
  }
  return move;
}

// ---------------------------------------------------------------------------
// initialState / reducer
// ---------------------------------------------------------------------------

export function initialState(
  seed: number,
  settings: ChessFullClockSettings,
): ChessFullClockState {
  const board = standardBoard();
  const castling: CastlingRights = {
    whiteKingside: true,
    whiteQueenside: true,
    blackKingside: true,
    blackQueenside: true,
  };
  const posKey = boardToPositionKey(board, "white", castling, null);
  const time = timeControlMs(settings.timeControl);
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
    whiteTimeMs: time,
    blackTimeMs: time,
    pgn: [],
    lastMove: null,
    drawOfferedBy: null,
  };
}

function applyMoveToState(
  s: ChessFullClockState,
  move: ChessMove,
): ChessFullClockState {
  const piece = s.board[idx(move.from.row, move.from.col)];
  const isCapture =
    s.board[idx(move.to.row, move.to.col)] !== null || !!move.isEnPassant;
  const san = moveToSan(s.board, move, s.turn, s.enPassantTarget, s.castling);
  const newCastling = updateCastlingRights(s.castling, move, s.board);
  const newBoard = applyMove(s.board, move);
  const newEP = computeEnPassantTarget(move, s.board);
  const newHalf =
    isCapture || piece?.type === "pawn" ? 0 : s.halfMoveClock + 1;
  const nextTurn: PieceColor = s.turn === "white" ? "black" : "white";
  const newFull =
    s.turn === "black" ? s.fullMoveNumber + 1 : s.fullMoveNumber;

  const posKey = boardToPositionKey(newBoard, nextTurn, newCastling, newEP);
  const newHistory = [...s.positionHistory, posKey];

  let result: GameResult = null;

  if (newHalf >= 100) result = "draw-50move";

  if (!result) {
    const count = newHistory.filter((k) => k === posKey).length;
    if (count >= 3) result = "draw-repetition";
  }

  if (!result && isInsufficientMaterial(newBoard)) {
    result = "draw-material";
  }

  if (!result) {
    const nextMoves = legalMoves(newBoard, nextTurn, newEP, newCastling);
    if (nextMoves.length === 0) {
      if (isInCheck(newBoard, nextTurn)) {
        result = s.turn === "white" ? "white-checkmate" : "black-checkmate";
      } else {
        result = "draw-stalemate";
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
    pgn: [...s.pgn, san],
    lastMove: { from: move.from, to: move.to },
    // a move implicitly declines any standing draw offer from the other side
    drawOfferedBy: null,
  };
}

function runBot(state: ChessFullClockState): ChessFullClockState {
  const move = findBotMove(state);
  if (!move) return state;
  return applyMoveToState(state, move);
}

export function getLegalMovesForPiece(
  state: ChessFullClockState,
  from: ChessCoord,
): ChessMove[] {
  return legalMoves(
    state.board,
    state.turn,
    state.enPassantTarget,
    state.castling,
  ).filter((m) => m.from.row === from.row && m.from.col === from.col);
}

export function getAllLegalMoves(
  state: ChessFullClockState,
): ChessMove[] {
  return legalMoves(
    state.board,
    state.turn,
    state.enPassantTarget,
    state.castling,
  );
}

export function isPlayerInCheck(state: ChessFullClockState): boolean {
  return isInCheck(state.board, state.turn);
}

export function reducer(
  state: ChessFullClockState,
  action: ChessFullClockAction,
): ChessFullClockState {
  if (state.result !== null) return state;

  // Tick: decrement the side-to-move's clock. The component passes deltaMs
  // from its rAF/useEffect tick. If a side runs out of time, that side loses.
  if (action.type === "tick") {
    if (action.deltaMs <= 0) return state;
    if (state.turn === "white") {
      const next = Math.max(0, state.whiteTimeMs - action.deltaMs);
      if (next === 0) {
        return { ...state, whiteTimeMs: 0, result: "white-timeout" };
      }
      return { ...state, whiteTimeMs: next };
    } else {
      const next = Math.max(0, state.blackTimeMs - action.deltaMs);
      if (next === 0) {
        return { ...state, blackTimeMs: 0, result: "black-timeout" };
      }
      return { ...state, blackTimeMs: next };
    }
  }

  if (action.type === "offer-draw") {
    if (state.drawOfferedBy) return state;
    // Player (white) offers; bot evaluates trivially: accepts if material is
    // even or unfavourable to it.
    const eval0 = pstEvaluate(state.board);
    if (eval0 >= -50) {
      // black is doing equal-or-better — decline
      return { ...state, drawOfferedBy: "white" };
    }
    return { ...state, result: "draw-agreed" };
  }
  if (action.type === "accept-draw") {
    if (!state.drawOfferedBy) return state;
    return { ...state, result: "draw-agreed", drawOfferedBy: null };
  }
  if (action.type === "decline-draw") {
    if (!state.drawOfferedBy) return state;
    return { ...state, drawOfferedBy: null };
  }
  if (action.type === "resign") {
    // Player (white) resigns => black wins (we use black-checkmate semantically)
    return { ...state, result: "black-checkmate" };
  }

  if (state.promotionPending !== null) {
    if (action.type !== "promote") return state;
    const { from, to } = state.promotionPending;
    const move: ChessMove = { from, to, promotion: action.piece };
    let next = applyMoveToState(state, move);
    if (next.result === null && next.turn === "black") {
      next = runBot(next);
    }
    return next;
  }

  if (action.type === "select") {
    const piece = state.board[idx(action.coord.row, action.coord.col)];
    if (piece && piece.color === state.turn && state.turn === "white") {
      return { ...state, selected: action.coord };
    }
    return { ...state, selected: null };
  }

  if (action.type === "move") {
    const { from, to } = action;
    const moves = legalMoves(
      state.board,
      state.turn,
      state.enPassantTarget,
      state.castling,
    );
    const matching = moves.filter(
      (m) =>
        m.from.row === from.row &&
        m.from.col === from.col &&
        m.to.row === to.row &&
        m.to.col === to.col,
    );
    if (matching.length === 0) return state;

    const piece = state.board[idx(from.row, from.col)];
    if (piece?.type === "pawn" && (to.row === 0 || to.row === 7)) {
      return { ...state, promotionPending: { from, to }, selected: null };
    }

    const move = matching[0]!;
    let next = applyMoveToState(state, move);
    if (next.result === null && next.turn === "black") {
      next = runBot(next);
    }
    return next;
  }

  return state;
}

export function isTerminal(
  state: ChessFullClockState,
): { score: number } | null {
  if (state.result === null) return null;
  switch (state.result) {
    case "white-checkmate":
    case "black-timeout":
      // Player (white) won
      return { score: 100 };
    case "black-checkmate":
    case "white-timeout":
      // Player (white) lost
      return { score: 0 };
    case "draw-stalemate":
    case "draw-50move":
    case "draw-repetition":
    case "draw-material":
    case "draw-agreed":
      return { score: 50 };
  }
}

export { findKing };
