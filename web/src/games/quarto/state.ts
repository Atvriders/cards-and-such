/**
 * Quarto: 4×4 board, 16 unique pieces with 4 binary attributes.
 * Twist: opponent chooses which piece you play.
 * Win: 4 in a row sharing at least one attribute.
 */

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuartoSettings {
  botStrength: "easy" | "hard";
}

/** Each piece is a 4-bit number 0-15. Bits: tall(3), light(2), square(1), solid(0) */
export type Piece = number; // 0..15

export interface QuartoState {
  settings: QuartoSettings;
  rngSeed: number;
  /** 4×4 board, null = empty, number = piece index placed */
  board: (Piece | null)[];
  /** Pieces not yet placed */
  remaining: Piece[];
  /** Piece the current player must place (chosen by opponent last turn) */
  toPlace: Piece | null;
  /** Phase: "place" = place the given piece; "choose" = choose a piece for opponent */
  phase: "place" | "choose";
  /** Whose turn it is to act (place or choose) */
  turn: "player" | "bot";
  winner: "player" | "bot" | null;
  winningLine: number[] | null;
  gameOver: boolean;
}

export type QuartoAction =
  | { type: "place"; cell: number }  // place toPlace at cell (0-15)
  | { type: "choose"; piece: Piece } // choose a piece for opponent to place
  | { type: "restart" };

const ALL_PIECES: Piece[] = Array.from({ length: 16 }, (_, i) => i);

export function pieceAttrs(p: Piece): { tall: boolean; light: boolean; square: boolean; solid: boolean } {
  return {
    tall: !!(p & 8),
    light: !!(p & 4),
    square: !!(p & 2),
    solid: !!(p & 1),
  };
}

export function pieceLabel(p: Piece): string {
  const a = pieceAttrs(p);
  return `${a.tall ? "T" : "S"}${a.light ? "L" : "D"}${a.square ? "Q" : "R"}${a.solid ? "S" : "H"}`;
}

function checkLine(board: (Piece | null)[], indices: number[]): boolean {
  const pieces = indices.map((i) => board[i]);
  if (pieces.some((p) => p === null)) return false;
  // Check each attribute bit
  for (let bit = 0; bit < 4; bit++) {
    const mask = 1 << bit;
    if (pieces.every((p) => (p! & mask) === mask) || pieces.every((p) => (p! & mask) === 0)) {
      return true;
    }
  }
  return false;
}

function checkWinner(board: (Piece | null)[]): { winner: boolean; line: number[] | null } {
  const lines: number[][] = [];
  // Rows
  for (let r = 0; r < 4; r++) lines.push([0, 1, 2, 3].map((c) => r * 4 + c));
  // Cols
  for (let c = 0; c < 4; c++) lines.push([0, 1, 2, 3].map((r) => r * 4 + c));
  // Diagonals
  lines.push([0, 5, 10, 15]);
  lines.push([3, 6, 9, 12]);

  for (const line of lines) {
    if (checkLine(board, line)) return { winner: true, line };
  }
  return { winner: false, line: null };
}

/** Greedy bot: choose a piece that doesn't immediately let opponent win. */
function botChoosePiece(remaining: Piece[], board: (Piece | null)[], rng: () => number): Piece {
  const safe: Piece[] = [];
  for (const p of remaining) {
    // Would giving this piece to opponent let them win?
    const emptyCells = board.map((v, i) => v === null ? i : -1).filter((i) => i >= 0);
    let dangerous = false;
    for (const cell of emptyCells) {
      const testBoard = [...board];
      testBoard[cell] = p;
      if (checkWinner(testBoard).winner) { dangerous = true; break; }
    }
    if (!dangerous) safe.push(p);
  }

  const pool = safe.length > 0 ? safe : remaining;
  return pool[Math.floor(rng() * pool.length)]!;
}

/** Bot places piece in safest cell. */
function botPlacePiece(toPlace: Piece, board: (Piece | null)[], remaining: Piece[], rng: () => number): number {
  const emptyCells = board.map((v, i) => v === null ? i : -1).filter((i) => i >= 0);

  // Win immediately if possible
  for (const cell of emptyCells) {
    const testBoard = [...board];
    testBoard[cell] = toPlace;
    if (checkWinner(testBoard).winner) return cell;
  }

  // Avoid cells that would let the opponent easily win with any of their remaining pieces
  const safe: number[] = [];
  for (const cell of emptyCells) {
    const testBoard = [...board];
    testBoard[cell] = toPlace;
    let safe_ = true;
    for (const p of remaining.filter((p) => p !== toPlace)) {
      const empties2 = testBoard.map((v, i) => v === null ? i : -1).filter((i) => i >= 0);
      for (const c2 of empties2) {
        const tb2 = [...testBoard];
        tb2[c2] = p;
        if (checkWinner(tb2).winner) { safe_ = false; break; }
      }
      if (!safe_) break;
    }
    if (safe_) safe.push(cell);
  }

  const pool = safe.length > 0 ? safe : emptyCells;
  return pool[Math.floor(rng() * pool.length)]!;
}

export function initialState(seed: number, settings: QuartoSettings): QuartoState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  // Bot chooses the first piece for the player to place
  const firstPiece = botChoosePiece(ALL_PIECES, Array(16).fill(null), rng);
  return {
    settings,
    rngSeed: nextSeed,
    board: Array(16).fill(null) as (Piece | null)[],
    remaining: ALL_PIECES.filter((p) => p !== firstPiece),
    toPlace: firstPiece,
    phase: "place",
    turn: "player",
    winner: null,
    winningLine: null,
    gameOver: false,
  };
}

export function reducer(state: QuartoState, action: QuartoAction): QuartoState {
  if (action.type === "restart") return initialState(state.rngSeed + 1, state.settings);
  if (state.gameOver) return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  // Player places the given piece
  if (action.type === "place") {
    if (state.phase !== "place" || state.turn !== "player") return state;
    if (state.toPlace === null) return state;
    const { cell } = action;
    if (state.board[cell] !== null) return state;

    const newBoard = [...state.board];
    newBoard[cell] = state.toPlace;
    const { winner, line } = checkWinner(newBoard);

    if (winner) {
      return { ...state, rngSeed: nextSeed, board: newBoard, winner: "player", winningLine: line, gameOver: true };
    }

    if (state.remaining.length === 0) {
      // Draw
      return { ...state, rngSeed: nextSeed, board: newBoard, winner: null, winningLine: null, gameOver: true };
    }

    // Player must now choose a piece for the bot
    return { ...state, rngSeed: nextSeed, board: newBoard, toPlace: null, phase: "choose", turn: "player" };
  }

  // Player chooses a piece for the bot
  if (action.type === "choose") {
    if (state.phase !== "choose" || state.turn !== "player") return state;
    const { piece } = action;
    if (!state.remaining.includes(piece)) return state;

    const newRemaining = state.remaining.filter((p) => p !== piece);

    // Bot places piece
    const botCell = botPlacePiece(piece, state.board, newRemaining, rng);
    const newBoard = [...state.board];
    newBoard[botCell] = piece;
    const { winner: botWon, line: botLine } = checkWinner(newBoard);

    if (botWon) {
      return { ...state, rngSeed: nextSeed, board: newBoard, remaining: newRemaining, winner: "bot", winningLine: botLine, gameOver: true };
    }

    if (newRemaining.length === 0) {
      return { ...state, rngSeed: nextSeed, board: newBoard, remaining: [], winner: null, winningLine: null, gameOver: true };
    }

    // Bot chooses a piece for the player
    const botChosenPiece = botChoosePiece(newRemaining, newBoard, rng);
    const finalRemaining = newRemaining.filter((p) => p !== botChosenPiece);

    return {
      ...state,
      rngSeed: nextSeed,
      board: newBoard,
      remaining: finalRemaining,
      toPlace: botChosenPiece,
      phase: "place",
      turn: "player",
    };
  }

  return state;
}

export function isTerminal(state: QuartoState): { score: number } | null {
  if (!state.gameOver) return null;
  if (state.winner === "player") return { score: 100 };
  if (state.winner === null) return { score: 50 }; // draw
  return { score: 0 };
}
