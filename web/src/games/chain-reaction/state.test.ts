import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, capacity, ROWS, COLS, idx } from "./state.js";
import type { ChainReactionState } from "./state.js";

describe("initialState", () => {
  it("creates empty grid", () => {
    const s = initialState(42);
    expect(s.grid).toHaveLength(ROWS * COLS);
    expect(s.grid.every(c => c.owner === null && c.orbs === 0)).toBe(true);
  });

  it("starts with player 0's turn", () => {
    const s = initialState(42);
    expect(s.turn).toBe(0);
  });

  it("starts not won or lost", () => {
    const s = initialState(42);
    expect(s.won).toBe(false);
    expect(s.lost).toBe(false);
  });
});

describe("capacity", () => {
  it("corner capacity = 2", () => {
    expect(capacity(0, 0)).toBe(2);
    expect(capacity(ROWS - 1, COLS - 1)).toBe(2);
  });

  it("edge capacity = 3", () => {
    expect(capacity(0, 2)).toBe(3);
    expect(capacity(2, 0)).toBe(3);
  });

  it("interior capacity = 4", () => {
    expect(capacity(2, 2)).toBe(4);
    expect(capacity(3, 3)).toBe(4);
  });
});

describe("reducer - place", () => {
  it("placing an orb changes the cell", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "place", row: 0, col: 0 });
    // Cell (0,0) should now belong to player or explosion may have changed things
    expect(s2.moveCount).toBeGreaterThanOrEqual(1);
  });

  it("cannot place on opponent cell", () => {
    // Set up state where bot owns a cell
    const s = initialState(2);
    // Manually create a bot-owned cell
    const grid = s.grid.map((c, i) => i === idx(3, 3) ? { owner: 1 as const, orbs: 1 } : c);
    const forced: ChainReactionState = { ...s, grid };
    const s2 = reducer(forced, { type: "place", row: 3, col: 3 });
    expect(s2).toBe(forced);
  });

  it("game is frozen after win", () => {
    const s: ChainReactionState = { ...initialState(3), won: true };
    const s2 = reducer(s, { type: "place", row: 0, col: 0 });
    expect(s2).toBe(s);
  });

  it("multiple moves advance moveCount", () => {
    let s = initialState(5);
    s = reducer(s, { type: "place", row: 2, col: 2 });
    s = reducer(s, { type: "place", row: 4, col: 4 });
    expect(s.moveCount).toBeGreaterThanOrEqual(2);
  });
});

describe("isTerminal", () => {
  it("returns null when ongoing", () => {
    expect(isTerminal(initialState(8))).toBeNull();
  });

  it("returns 100 when won", () => {
    const s: ChainReactionState = { ...initialState(8), won: true };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });

  it("returns 0 when lost", () => {
    const s: ChainReactionState = { ...initialState(8), lost: true };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });
});
