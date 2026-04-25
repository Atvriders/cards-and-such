import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { FrozenRiverSettings } from "./state.js";

const s5: FrozenRiverSettings = { width: "5" };
const s7: FrozenRiverSettings = { width: "7" };

describe("FrozenRiver initialState", () => {
  it("5x5 grid has 25 cells", () => {
    expect(initialState(1, s5).grid).toHaveLength(25);
  });

  it("7x7 grid has 49 cells", () => {
    expect(initialState(1, s7).grid).toHaveLength(49);
  });

  it("starts at position 0", () => {
    expect(initialState(1, s5).playerPos).toBe(0);
  });

  it("first tile is start", () => {
    expect(initialState(1, s5).grid[0]).toBe("start");
  });

  it("last tile is end", () => {
    expect(initialState(1, s5).grid[24]).toBe("end");
  });
});

describe("FrozenRiver reducer", () => {
  it("cannot move up from top row", () => {
    const s = initialState(1, s5);
    const s2 = reducer(s, { type: "move", dir: "up" });
    expect(s2.playerPos).toBe(0);
  });

  it("restart resets state", () => {
    let s = initialState(1, s5);
    s = reducer(s, { type: "move", dir: "down" });
    s = reducer(s, { type: "restart" });
    expect(s.steps).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("falling in hole ends game", () => {
    let s = initialState(42, s5);
    // force a hole near player
    s = { ...s, grid: s.grid.map((t, i) => i === 1 ? "hole" : t) };
    s = reducer(s, { type: "move", dir: "right" });
    expect(s.fell).toBe(true);
    expect(s.gameOver).toBe(true);
  });
});

describe("FrozenRiver isTerminal", () => {
  it("returns null when not game over", () => {
    expect(isTerminal(initialState(1, s5))).toBeNull();
  });

  it("returns 0 score when fell", () => {
    const s = { ...initialState(1, s5), gameOver: true, fell: true };
    expect(isTerminal(s)!.score).toBe(0);
  });

  it("returns positive score when won", () => {
    const s = { ...initialState(1, s5), gameOver: true, won: true, steps: 8 };
    const result = isTerminal(s);
    expect(result!.score).toBeGreaterThan(0);
  });
});
