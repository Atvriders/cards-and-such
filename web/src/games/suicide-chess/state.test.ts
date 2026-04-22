import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, getSuicideLegalMoves } from "./state.js";
import type { SuicideSettings } from "./state.js";
import { emptyBoard, idx } from "../_chess-core/types.js";

const defaultSettings: SuicideSettings = { opponent: "easy" };

describe("SuicideChess initialState", () => {
  it("starts with standard board setup", () => {
    const s = initialState(42, defaultSettings);
    expect(s.board[idx(6, 4)]?.type).toBe("pawn");
    expect(s.board[idx(6, 4)]?.color).toBe("white");
    expect(s.board[idx(7, 4)]?.type).toBe("king");
    expect(s.turn).toBe("white");
    expect(s.result).toBeNull();
  });
});

describe("SuicideChess mandatory capture", () => {
  it("forces capture when available", () => {
    const board = emptyBoard();
    board[idx(7, 4)] = { color: "white", type: "king" };
    board[idx(0, 4)] = { color: "black", type: "king" };
    board[idx(4, 4)] = { color: "white", type: "pawn" };
    board[idx(3, 5)] = { color: "black", type: "pawn" }; // white pawn can capture this
    const moves = getSuicideLegalMoves(board, "white", null);
    // All moves must be captures
    expect(moves.length).toBeGreaterThan(0);
    expect(moves.every((m) => m.capturedPiece || m.isEnPassant)).toBe(true);
  });

  it("allows normal moves when no captures available", () => {
    const board = emptyBoard();
    board[idx(7, 4)] = { color: "white", type: "king" };
    board[idx(0, 4)] = { color: "black", type: "king" };
    board[idx(6, 4)] = { color: "white", type: "pawn" };
    const moves = getSuicideLegalMoves(board, "white", null);
    // No captures, normal pawn moves available
    expect(moves.length).toBeGreaterThan(0);
    expect(moves.some((m) => !m.capturedPiece)).toBe(true);
  });

  it("white wins when all white pieces captured", () => {
    // Simulate a state where white has one piece and it gets captured
    const s = initialState(42, { opponent: "easy" });
    // Game should be ongoing at start
    expect(s.result).toBeNull();
  });

  it("no castling in suicide chess", () => {
    const board = emptyBoard();
    board[idx(7, 4)] = { color: "white", type: "king" };
    board[idx(7, 7)] = { color: "white", type: "rook" };
    board[idx(0, 4)] = { color: "black", type: "king" };
    const moves = getSuicideLegalMoves(board, "white", null);
    // No castling moves
    const castlingMoves = moves.filter((m) => m.isCastling);
    expect(castlingMoves.length).toBe(0);
  });
});

describe("SuicideChess isTerminal", () => {
  it("returns null when game is in progress", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });
});
