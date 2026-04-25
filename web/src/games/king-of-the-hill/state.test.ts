import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, CENTER_SQUARES } from "./state.js";
import type { KothSettings } from "./state.js";
import { idx, emptyBoard } from "../_chess-core/types.js";
import type { CastlingRights } from "../_chess-core/types.js";

const settings: KothSettings = { opponent: "easy" };

describe("King of the Hill initialState", () => {
  it("starts with standard board", () => {
    const s = initialState(42, settings);
    expect(s.board[idx(7,4)]?.type).toBe("king");
    expect(s.board.filter(p => p !== null).length).toBe(32);
  });

  it("result starts null", () => {
    const s = initialState(42, settings);
    expect(s.result).toBeNull();
    expect(isTerminal(s)).toBeNull();
  });

  it("center squares defined correctly", () => {
    expect(CENTER_SQUARES.has("3,3")).toBe(true);
    expect(CENTER_SQUARES.has("3,4")).toBe(true);
    expect(CENTER_SQUARES.has("4,3")).toBe(true);
    expect(CENTER_SQUARES.has("4,4")).toBe(true);
    expect(CENTER_SQUARES.has("5,5")).toBe(false);
  });
});

describe("King of the Hill win condition", () => {
  it("white wins when king reaches center", () => {
    const board = emptyBoard();
    board[idx(7,4)] = { color: "white", type: "king" };
    board[idx(0,4)] = { color: "black", type: "king" };
    board[idx(5,3)] = { color: "white", type: "queen" }; // control center
    const castling: CastlingRights = { whiteKingside: false, whiteQueenside: false, blackKingside: false, blackQueenside: false };
    const s: ReturnType<typeof initialState> = {
      settings,
      rngSeed: 0,
      board,
      turn: "white",
      castling,
      enPassantTarget: null,
      halfMoveClock: 0,
      positionHistory: [],
      result: null,
      selected: null,
      promotionPending: null,
    };

    // Move king toward center step by step
    // King at (7,4) -> (6,4) -> (5,4) -> (4,4) = e5 = center!
    const s1 = reducer(s, { type: "move", from: { row: 7, col: 4 }, to: { row: 6, col: 4 } });
    const s2 = reducer(s1, { type: "move", from: { row: 6, col: 4 }, to: { row: 5, col: 4 } });
    const s3 = reducer(s2, { type: "move", from: { row: 5, col: 4 }, to: { row: 4, col: 4 } });
    // At (4,4) - center! White should win
    expect(s3.result).toBe("white");
  });

  it("isTerminal returns 100 for white win", () => {
    const s = { ...initialState(42, settings), result: "white" as const };
    expect(isTerminal(s)?.score).toBe(100);
  });

  it("isTerminal returns 0 for black win", () => {
    const s = { ...initialState(42, settings), result: "black" as const };
    expect(isTerminal(s)?.score).toBe(0);
  });

  it("normal moves work", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "move", from: { row: 6, col: 4 }, to: { row: 4, col: 4 } });
    expect(next.board[idx(6,4)]).toBeNull();
    expect(next.board[idx(4,4)]?.type).toBe("pawn");
  });
});
