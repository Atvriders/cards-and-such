import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const humanSettings = { opponent: "human" as const };
const aiSettings = { opponent: "ai" as const };

describe("UltimateTTT initialState", () => {
  it("creates 9 empty mini-boards", () => {
    const s = initialState(42, humanSettings);
    expect(s.boards).toHaveLength(9);
    for (const board of s.boards) {
      expect(board).toHaveLength(9);
      expect(board.every(c => c === null)).toBe(true);
    }
  });

  it("X goes first and nextBoard is null", () => {
    const s = initialState(42, humanSettings);
    expect(s.currentPlayer).toBe("X");
    expect(s.nextBoard).toBeNull();
    expect(s.winner).toBeNull();
  });

  it("boardWinners are all null at start", () => {
    const s = initialState(42, humanSettings);
    expect(s.boardWinners.every(w => w === null)).toBe(true);
  });

  it("ai mode initializes same as human mode", () => {
    const s = initialState(42, aiSettings);
    expect(s.currentPlayer).toBe("X");
  });
});

describe("UltimateTTT reducer", () => {
  it("move places X in board 0, cell 4", () => {
    const s = initialState(42, humanSettings);
    const s2 = reducer(s, { type: "move", board: 0, cell: 4 });
    expect(s2.boards[0]![4]).toBe("X");
    expect(s2.currentPlayer).toBe("O");
  });

  it("nextBoard after move follows cell index", () => {
    const s = initialState(42, humanSettings);
    const s2 = reducer(s, { type: "move", board: 0, cell: 4 });
    expect(s2.nextBoard).toBe(4);
  });

  it("cannot move in wrong board when nextBoard is set", () => {
    const s = initialState(42, humanSettings);
    const s2 = reducer(s, { type: "move", board: 0, cell: 3 });
    // nextBoard should be 3 now; trying to play in board 0 should fail
    const s3 = reducer(s2, { type: "move", board: 0, cell: 0 });
    expect(s3.boards[0]![0]).toBeNull(); // unchanged
  });

  it("isTerminal returns null when no winner", () => {
    const s = initialState(42, humanSettings);
    expect(isTerminal(s)).toBeNull();
  });
});
