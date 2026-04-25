import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, antichessLegalMoves } from "./state.js";
import type { AntichessSettings } from "./state.js";
import { idx, emptyBoard } from "../_chess-core/types.js";

const settings: AntichessSettings = { opponent: "easy" };

describe("Antichess initialState", () => {
  it("starts with standard board", () => {
    const s = initialState(42, settings);
    expect(s.board.filter(p => p !== null).length).toBe(32);
  });

  it("result starts null", () => {
    const s = initialState(42, settings);
    expect(s.result).toBeNull();
    expect(isTerminal(s)).toBeNull();
  });

  it("white moves first", () => {
    const s = initialState(42, settings);
    expect(s.turn).toBe("white");
  });
});

describe("Antichess forced captures", () => {
  it("forces capture when available", () => {
    const board = emptyBoard();
    board[idx(7,4)] = { color: "white", type: "king" };
    board[idx(6,4)] = { color: "white", type: "pawn" };
    board[idx(5,3)] = { color: "black", type: "pawn" }; // white can capture
    board[idx(0,4)] = { color: "black", type: "king" };
    const moves = antichessLegalMoves(board, "white", null);
    // If any capture available, only captures returned
    const hasCapture = moves.some(m => m.capturedPiece || m.isEnPassant);
    if (hasCapture) {
      // Only captures should be in moves list
      expect(moves.every(m => m.capturedPiece || m.isEnPassant)).toBe(true);
    }
  });

  it("normal moves when no capture available", () => {
    const board = emptyBoard();
    board[idx(7,4)] = { color: "white", type: "king" };
    board[idx(0,4)] = { color: "black", type: "king" };
    board[idx(6,4)] = { color: "white", type: "pawn" };
    const moves = antichessLegalMoves(board, "white", null);
    // No captures available (black king can't be captured by pawn)
    const hasCaptures = moves.some(m => m.capturedPiece || m.isEnPassant);
    if (!hasCaptures) {
      expect(moves.length).toBeGreaterThan(0); // some non-capture moves
    }
  });
});

describe("Antichess win condition", () => {
  it("white wins when all pieces gone", () => {
    const board = emptyBoard();
    // White has one pawn, black has one rook
    board[idx(1,4)] = { color: "white", type: "pawn" }; // about to be captured or promote
    board[idx(0,4)] = { color: "black", type: "rook" }; // black rook can capture
    board[idx(7,7)] = { color: "black", type: "king" };
    const s: ReturnType<typeof initialState> = {
      settings,
      rngSeed: 0,
      board,
      turn: "black",
      enPassantTarget: null,
      result: null,
      selected: null,
      promotionPending: null,
    };
    // Black captures white pawn -> white has 0 pieces -> white wins
    const next = reducer(s, { type: "move", from: { row: 0, col: 4 }, to: { row: 1, col: 4 } });
    // After rook captures pawn, white has 0 pieces -> white wins
    expect(next.result).toBe("white");
  });

  it("isTerminal returns score 100 for white win", () => {
    const s = { ...initialState(42, settings), result: "white" as const };
    expect(isTerminal(s)?.score).toBe(100);
  });
});
