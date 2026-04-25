import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { ToroidalTTTState } from "./state.js";

describe("ToroidalTTT initialState", () => {
  it("has empty board and X to play", () => {
    const s = initialState(42);
    expect(s.board.every((c) => c === null)).toBe(true);
    expect(s.currentPlayer).toBe("X");
    expect(s.gameOver).toBe(false);
  });

  it("is deterministic", () => {
    expect(initialState(7)).toEqual(initialState(7));
  });
});

describe("ToroidalTTT place", () => {
  it("places X and then AI places O", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "place", index: 0 });
    expect(s2.board[0]).toBe("X");
    expect(s2.board.filter((c) => c === "O")).toHaveLength(1);
  });

  it("ignores placing on occupied cell", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "place", index: 4 });
    const s3 = reducer(s2, { type: "place", index: 4 });
    expect(s3.board.filter((c) => c === "X")).toHaveLength(1);
  });

  it("detects X winner", () => {
    // Build state with X about to win
    const s: ToroidalTTTState = {
      ...initialState(1),
      board: ["X","X",null,"O","O",null,null,null,null],
      currentPlayer: "X",
    };
    const s2 = reducer(s, { type: "place", index: 2 });
    expect(s2.winner).toBe("X");
    expect(s2.gameOver).toBe(true);
  });
});

describe("ToroidalTTT isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });

  it("returns 1000 for X win", () => {
    const s: ToroidalTTTState = { ...initialState(1), gameOver: true, winner: "X" };
    expect(isTerminal(s)!.score).toBe(1000);
  });

  it("returns 500 for draw", () => {
    const s: ToroidalTTTState = { ...initialState(1), gameOver: true, winner: "draw" };
    expect(isTerminal(s)!.score).toBe(500);
  });

  it("returns 0 for O win", () => {
    const s: ToroidalTTTState = { ...initialState(1), gameOver: true, winner: "O" };
    expect(isTerminal(s)!.score).toBe(0);
  });
});
