import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, resolveMerge, SIZE } from "./state.js";
const S = { dummy: false };
describe("MergeMansionMini", () => {
  it("starts empty with a next tile", () => {
    const s = initialState(11, S);
    expect(s.phase).toBe("playing");
    expect(s.grid.length).toBe(SIZE);
    expect(s.next).toBeGreaterThan(0);
    expect(s.movesUsed).toBe(0);
  });
  it("placing fills a cell", () => {
    let s = initialState(11, S);
    const startNext = s.next;
    s = reducer(s, { type: "place", row: 2, col: 2 });
    // tile may have merged already if surrounded; check cell is at least startNext (or higher tier)
    expect(s.grid[2]![2]).toBeGreaterThanOrEqual(startNext);
    expect(s.movesUsed).toBe(1);
    expect(s.score).toBeGreaterThan(0);
  });
  it("placing on occupied cell is no-op", () => {
    let s = initialState(11, S);
    s = reducer(s, { type: "place", row: 0, col: 0 });
    const before = s.movesUsed;
    s = reducer(s, { type: "place", row: 0, col: 0 });
    expect(s.movesUsed).toBe(before);
  });
  it("three same tiles in a row merge to higher tier", () => {
    const grid: number[][] = Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => 0));
    grid[0]![0] = 1; grid[0]![1] = 1; grid[0]![2] = 1;
    const out = resolveMerge(grid, 0, 0);
    // After merge from (0,0): 3 tier-1 cleared, (0,0) becomes tier 2
    const tiles = out.grid.flat().filter(v => v !== 0);
    expect(tiles.length).toBe(1);
    expect(tiles[0]).toBe(2);
    expect(out.gained).toBeGreaterThan(0);
  });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(11, S))).toBeNull();
  });
});
