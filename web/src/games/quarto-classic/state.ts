/**
 * Quarto Classic: 4×4 board, 16 unique pieces with 4 binary attributes.
 * On your turn, place the piece your opponent picked, then choose the next piece for them.
 * Win: 4 in a row sharing at least one attribute (row, column, or diagonal).
 */

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuartoClassicSettings {
  botStrength: "easy" | "hard";
}

export type Piece = number;

export interface QuartoClassicState {
  settings: QuartoClassicSettings;
  rngSeed: number;
  board: (Piece | null)[];
  remaining: Piece[];
  toPlace: Piece | null;
  phase: "place" | "choose";
  turn: "player" | "bot";
  winner: "player" | "bot" | null;
  winningLine: number[] | null;
  gameOver: boolean;
}

export type QuartoClassicAction =
  | { type: "place"; cell: number }
  | { type: "choose"; piece: Piece }
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
  return `${a.tall ? "T" : "S"}${a.light ? "L" : "D"}${a.square ? "Q" : "R"}${a.solid ? "F" : "H"}`;
}

const LINES: number[][] = (() => {
  const out: number[][] = [];
  for (let r = 0; r < 4; r++) out.push([0, 1, 2, 3].map((c) => r * 4 + c));
  for (let c = 0; c < 4; c++) out.push([0, 1, 2, 3].map((r) => r * 4 + c));
  out.push([0, 5, 10, 15]);
  out.push([3, 6, 9, 12]);
  return out;
})();

function checkLine(board: (Piece | null)[], indices: number[]): boolean {
  const pieces = indices.map((i) => board[i]);
  if (pieces.some((p) => p === null)) return false;
  for (let bit = 0; bit < 4; bit++) {
    const mask = 1 << bit;
    if (pieces.every((p) => (p! & mask) === mask) || pieces.every((p) => (p! & mask) === 0)) {
      return true;
    }
  }
  return false;
}

export function checkWinner(board: (Piece | null)[]): { winner: boolean; line: number[] | null } {
  for (const line of LINES) {
    if (checkLine(board, line)) return { winner: true, line };
  }
  return { winner: false, line: null };
}

function botChoosePiece(remaining: Piece[], board: (Piece | null)[], strength: "easy" | "hard", rng: () => number): Piece {
  if (strength === "easy") {
    return remaining[Math.floor(rng() * remaining.length)]!;
  }
  const safe: Piece[] = [];
  for (const p of remaining) {
    let dangerous = false;
    for (let cell = 0; cell < 16; cell++) {
      if (board[cell] !== null) continue;
      const t = [...board];
      t[cell] = p;
      if (checkWinner(t).winner) { dangerous = true; break; }
    }
    if (!dangerous) safe.push(p);
  }
  const pool = safe.length > 0 ? safe : remaining;
  return pool[Math.floor(rng() * pool.length)]!;
}

function botPlacePiece(toPlace: Piece, board: (Piece | null)[], remaining: Piece[], strength: "easy" | "hard", rng: () => number): number {
  const empties: number[] = [];
  for (let i = 0; i < 16; i++) if (board[i] === null) empties.push(i);
  for (const cell of empties) {
    const t = [...board];
    t[cell] = toPlace;
    if (checkWinner(t).winner) return cell;
  }
  if (strength === "easy") return empties[Math.floor(rng() * empties.length)]!;
  const safe: number[] = [];
  for (const cell of empties) {
    const t = [...board];
    t[cell] = toPlace;
    let allow = false;
    for (const p of remaining.filter((p) => p !== toPlace)) {
      for (let c2 = 0; c2 < 16; c2++) {
        if (t[c2] !== null) continue;
        const t2 = [...t];
        t2[c2] = p;
        if (checkWinner(t2).winner) { allow = true; break; }
      }
      if (allow) break;
    }
    if (!allow) safe.push(cell);
  }
  const pool = safe.length > 0 ? safe : empties;
  return pool[Math.floor(rng() * pool.length)]!;
}

export function initialState(seed: number, settings: QuartoClassicSettings): QuartoClassicState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const firstPiece = botChoosePiece(ALL_PIECES, Array(16).fill(null), settings.botStrength, rng);
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

export function reducer(state: QuartoClassicState, action: QuartoClassicAction): QuartoClassicState {
  if (action.type === "restart") return initialState(state.rngSeed + 1, state.settings);
  if (state.gameOver) return state;
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  if (action.type === "place") {
    if (state.phase !== "place" || state.turn !== "player") return state;
    if (state.toPlace === null) return state;
    const { cell } = action;
    if (cell < 0 || cell >= 16) return state;
    if (state.board[cell] !== null) return state;
    const newBoard = [...state.board];
    newBoard[cell] = state.toPlace;
    const { winner, line } = checkWinner(newBoard);
    if (winner) {
      return { ...state, rngSeed: nextSeed, board: newBoard, winner: "player", winningLine: line, gameOver: true };
    }
    if (state.remaining.length === 0) {
      return { ...state, rngSeed: nextSeed, board: newBoard, gameOver: true };
    }
    return { ...state, rngSeed: nextSeed, board: newBoard, toPlace: null, phase: "choose", turn: "player" };
  }

  if (action.type === "choose") {
    if (state.phase !== "choose" || state.turn !== "player") return state;
    const { piece } = action;
    if (!state.remaining.includes(piece)) return state;
    const newRemaining = state.remaining.filter((p) => p !== piece);
    const botCell = botPlacePiece(piece, state.board, newRemaining, state.settings.botStrength, rng);
    const newBoard = [...state.board];
    newBoard[botCell] = piece;
    const { winner: botWon, line: botLine } = checkWinner(newBoard);
    if (botWon) {
      return { ...state, rngSeed: nextSeed, board: newBoard, remaining: newRemaining, winner: "bot", winningLine: botLine, gameOver: true };
    }
    if (newRemaining.length === 0) {
      return { ...state, rngSeed: nextSeed, board: newBoard, remaining: [], gameOver: true };
    }
    const next = botChoosePiece(newRemaining, newBoard, state.settings.botStrength, rng);
    const finalRem = newRemaining.filter((p) => p !== next);
    return {
      ...state,
      rngSeed: nextSeed,
      board: newBoard,
      remaining: finalRem,
      toPlace: next,
      phase: "place",
      turn: "player",
    };
  }
  return state;
}

export function isTerminal(state: QuartoClassicState): { score: number } | null {
  if (!state.gameOver) return null;
  if (state.winner === "player") return { score: 100 };
  if (state.winner === null) return { score: 50 };
  return { score: 0 };
}
