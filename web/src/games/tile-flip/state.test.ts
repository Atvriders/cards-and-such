import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { TileFlipState } from "./state.js";

const defaultSettings = { size: "4" as const };

describe("TileFlip initialState", () => {
  it("creates correct size grid", () => {
    const s = initialState(42, defaultSettings);
    expect(s.size).toBe(4);
    expect(s.grid).toHaveLength(16);
    expect(s.target).toHaveLength(16);
    expect(s.won).toBe(false);
    expect(s.movesMade).toBe(0);
  });

  it("grid differs from target at start", () => {
    const s = initialState(42, defaultSettings);
    const differs = s.grid.some((v, i) => v !== s.target[i]);
    expect(differs).toBe(true);
  });

  it("all values are in range 0..3", () => {
    const s = initialState(42, defaultSettings);
    for (const v of s.grid) expect(v).toBeGreaterThanOrEqual(0);
    for (const v of s.grid) expect(v).toBeLessThan(4);
  });

  it("3x3 creates 9 cells", () => {
    const s = initialState(1, { size: "3" as const });
    expect(s.size).toBe(3);
    expect(s.grid).toHaveLength(9);
  });
});

describe("TileFlip reducer", () => {
  it("flip increments cell value mod 4", () => {
    const s = initialState(42, defaultSettings);
    const idx = 0;
    const before = s.grid[idx]!;
    const s2 = reducer(s, { type: "flip", row: 0, col: 0 });
    expect(s2.grid[idx]).toBe((before + 1) % 4);
    expect(s2.movesMade).toBe(1);
  });

  it("four flips on same cell restores original", () => {
    const s = initialState(42, defaultSettings);
    let cur = s;
    for (let i = 0; i < 4; i++) cur = reducer(cur, { type: "flip", row: 1, col: 1 });
    expect(cur.grid[1 * 4 + 1]).toBe(s.grid[1 * 4 + 1]);
  });

  it("does not mutate after won", () => {
    const target = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    // Only center different so one flip wins
    const grid = [0, 0, 0, 0, 3, 0, 0, 0, 0];
    const won: TileFlipState = {
      settings: { size: "3" as const },
      size: 3,
      grid,
      target,
      movesMade: 0,
      won: true,
    };
    const after = reducer(won, { type: "flip", row: 0, col: 0 });
    expect(after.movesMade).toBe(0);
  });

  it("isTerminal returns null when not won", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });
});
