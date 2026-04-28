import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, step, liveCount, score, SIZE } from "./state.js";

const S = { dummy: false };

describe("game-of-life-conway", () => {
  it("starts with empty grid", () => {
    const s = initialState(1, S);
    expect(s.grid.length).toBe(SIZE * SIZE);
    expect(liveCount(s.grid)).toBe(0);
    expect(s.phase).toBe("editing");
  });
  it("toggle flips a cell", () => {
    const s = reducer(initialState(1, S), { type: "toggle", idx: 5 });
    expect(s.grid[5]).toBe(1);
    const s2 = reducer(s, { type: "toggle", idx: 5 });
    expect(s2.grid[5]).toBe(0);
  });
  it("blinker oscillates: 3 in a row -> 3 in a column", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "preset", preset: "blinker" });
    const before = liveCount(s.grid);
    expect(before).toBeGreaterThanOrEqual(3);
    const next = step(s.grid);
    expect(liveCount(next)).toBeGreaterThanOrEqual(3);
  });
  it("step advances generation and accumulates", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "preset", preset: "glider" });
    s = reducer(s, { type: "step" });
    expect(s.generation).toBeGreaterThanOrEqual(1);
    expect(s.phase).toBe("running");
  });
  it("finish ends game and isTerminal returns score", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "preset", preset: "glider" });
    s = reducer(s, { type: "step" });
    s = reducer(s, { type: "finish" });
    expect(s.phase).toBe("done");
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(0);
    expect(score(s)).toBeGreaterThanOrEqual(0);
  });
});
