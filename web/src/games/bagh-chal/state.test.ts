import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, allTigerMoves, allGoatMoves } from "./state.js";
import type { BaghChalSettings, BaghChalState } from "./state.js";

const settings: BaghChalSettings = { opponent: "bot" };

describe("BaghChal initialState", () => {
  it("places 4 tigers at corners", () => {
    const s = initialState(1, settings);
    expect(s.board[0]).toBe("tiger");  // (0,0)
    expect(s.board[4]).toBe("tiger");  // (0,4)
    expect(s.board[20]).toBe("tiger"); // (4,0)
    expect(s.board[24]).toBe("tiger"); // (4,4)
  });

  it("starts in place phase with 20 goats to place", () => {
    const s = initialState(1, settings);
    expect(s.phase).toBe("place");
    expect(s.goatsToPlace).toBe(20);
    expect(s.goatsCaptured).toBe(0);
  });

  it("starts as goat's turn with no winner", () => {
    const s = initialState(1, settings);
    expect(s.turn).toBe("goat");
    expect(s.winner).toBeNull();
  });
});

describe("BaghChal tigerMoves", () => {
  it("tigers have moves at start (board is mostly empty)", () => {
    const s = initialState(1, settings);
    const moves = allTigerMoves(s.board);
    expect(moves.length).toBeGreaterThan(0);
  });
});

describe("BaghChal reducer", () => {
  it("places a goat and triggers tiger move", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "place", at: 12 }); // centre
    // After goat placement + tiger move, goats placed = 1 (or more if bot placed)
    expect(s2.board[12]).toBe("goat");
    // Turn returns to goat
    expect(s2.turn).toBe("goat");
  });

  it("ignores placing on occupied cell", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "place", at: 0 }); // corner has tiger
    expect(s2).toBe(s);
  });

  it("does not accept place action during move phase", () => {
    const s: BaghChalState = { ...initialState(1, settings), phase: "move", goatsToPlace: 0 };
    const s2 = reducer(s, { type: "place", at: 12 });
    expect(s2).toBe(s);
  });

  it("does not change state after game over", () => {
    const s: BaghChalState = { ...initialState(1, settings), winner: "goat" };
    const s2 = reducer(s, { type: "place", at: 12 });
    expect(s2).toBe(s);
  });
});

describe("BaghChal isTerminal", () => {
  it("returns null when game is not over", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score 25 on goat win", () => {
    const s: BaghChalState = { ...initialState(1, settings), winner: "goat" };
    expect(isTerminal(s)?.score).toBe(25);
  });

  it("returns score 0 on tiger win", () => {
    const s: BaghChalState = { ...initialState(1, settings), winner: "tiger" };
    expect(isTerminal(s)?.score).toBe(0);
  });
});
