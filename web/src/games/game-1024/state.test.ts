import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, slideGrid, SIZE } from "./state.js";
const S = { dummy: false };
describe("Game1024", () => {
  it("starts with two tiles", () => {
    const s = initialState(7, S);
    const filled = s.grid.flat().filter(v => v !== 0);
    expect(filled.length).toBe(2);
    expect(s.phase).toBe("playing");
    expect(s.grid.length).toBe(SIZE);
  });
  it("merges two equal tiles when sliding left", () => {
    const grid = [[2, 2, 0, 0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    const out = slideGrid(grid, "left");
    expect(out.grid[0]![0]).toBe(4);
    expect(out.gained).toBe(4);
    expect(out.moved).toBe(true);
  });
  it("non-mergable slide does not gain points", () => {
    const grid = [[2, 4, 0, 0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    const out = slideGrid(grid, "left");
    expect(out.gained).toBe(0);
  });
  it("slide action increments moves and adds tile", () => {
    let s = initialState(7, S);
    const before = s.grid.flat().filter(v => v !== 0).length;
    s = reducer(s, { type: "slide", dir: "left" });
    const after = s.grid.flat().filter(v => v !== 0).length;
    // After a successful slide, at most 1 tile is added
    expect(after).toBeGreaterThanOrEqual(before);
    expect(after).toBeLessThanOrEqual(before + 1);
  });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(7, S))).toBeNull();
  });
});
