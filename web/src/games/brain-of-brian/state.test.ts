import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, score, step, liveCount, SIZE } from "./state.js";

const S = { dummy: false };

describe("brain-of-brian", () => {
  it("starts with empty grid", () => {
    const s = initialState(1, S);
    expect(s.grid.length).toBe(SIZE * SIZE);
    expect(liveCount(s.grid)).toBe(0);
  });
  it("toggle flips cell to alive", () => {
    const s = reducer(initialState(1, S), { type: "toggle", idx: 5 });
    expect(s.grid[5]).toBe(1);
  });
  it("alive becomes dying after one step", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "toggle", idx: 0 });
    s = reducer(s, { type: "step" });
    // alive cell 0 should now be dying (2)
    expect(s.grid[0]).toBe(2);
  });
  it("step advances generation, finish ends", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "random" });
    s = reducer(s, { type: "step" });
    expect(s.generation).toBeGreaterThanOrEqual(1);
    s = reducer(s, { type: "finish" });
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
    expect(score(s)).toBeGreaterThanOrEqual(0);
  });
  it("step transition function works", () => {
    const g = new Array(SIZE * SIZE).fill(0);
    g[0] = 1;
    const next = step(g);
    expect(next[0]).toBe(2);
  });
});
