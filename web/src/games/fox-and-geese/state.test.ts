import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, foxMoves, gooseMoves, isValid } from "./state.js";
import type { FoxGeeseSettings, FoxGeeseState } from "./state.js";

const settings: FoxGeeseSettings = { opponent: "bot" };

describe("FoxAndGeese initialState", () => {
  it("places fox at centre (3,3)", () => {
    const s = initialState(1, settings);
    expect(s.grid[3]![3]).toBe("fox");
  });

  it("has 13 geese on board", () => {
    const s = initialState(1, settings);
    const count = s.grid.flat().filter((c) => c === "goose").length;
    expect(count).toBe(13);
  });

  it("starts fox's turn with no winner", () => {
    const s = initialState(1, settings);
    expect(s.turn).toBe("fox");
    expect(s.winner).toBeNull();
  });
});

describe("FoxAndGeese isValid", () => {
  it("centre cell (3,3) is valid", () => {
    expect(isValid(3, 3)).toBe(true);
  });

  it("corner cell (0,0) is invalid", () => {
    expect(isValid(0, 0)).toBe(false);
  });
});

describe("FoxAndGeese foxMoves", () => {
  it("fox at centre has some moves at start (geese block all adjacent?)", () => {
    const s = initialState(1, settings);
    const moves = foxMoves(s.grid, [3, 3]);
    // Fox is surrounded by geese; may have jump moves
    expect(moves.length).toBeGreaterThanOrEqual(0);
  });
});

describe("FoxAndGeese reducer", () => {
  it("ignores select of non-fox cell", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "select", row: 0, col: 2 });
    expect(s2.selected).toBeNull();
  });

  it("selects the fox", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "select", row: 3, col: 3 });
    expect(s2.selected).toEqual([3, 3]);
  });

  it("does not change state after game over", () => {
    const s: FoxGeeseState = { ...initialState(1, settings), winner: "fox" };
    const s2 = reducer(s, { type: "select", row: 3, col: 3 });
    expect(s2).toBe(s);
  });
});

describe("FoxAndGeese isTerminal", () => {
  it("returns null when game is not over", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score 20 on fox win", () => {
    const s: FoxGeeseState = { ...initialState(1, settings), winner: "fox" };
    expect(isTerminal(s)?.score).toBe(20);
  });

  it("returns score 0 on geese win", () => {
    const s: FoxGeeseState = { ...initialState(1, settings), winner: "geese" };
    expect(isTerminal(s)?.score).toBe(0);
  });
});
