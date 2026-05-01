import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TIMER_TICKS, ROWS, COLS } from "./state.js";
const S = { dummy: false };
describe("SuperColumnsMini", () => {
  it("starts with full grid and timer", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.ticksRemaining).toBe(TIMER_TICKS);
    expect(s.grid.length).toBe(ROWS);
    expect(s.grid[0]!.length).toBe(COLS);
  });
  it("tick decrements timer", () => {
    const s = reducer(initialState(1, S), { type: "tick" });
    expect(s.ticksRemaining).toBe(TIMER_TICKS - 1);
  });
  it("select records a cell first time", () => {
    const s = reducer(initialState(1, S), { type: "select", row: 0, col: 0 });
    expect(s.selected).toEqual([0, 0]);
  });
  it("non-adjacent re-select moves selection", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "select", row: 0, col: 0 });
    s = reducer(s, { type: "select", row: 3, col: 3 });
    expect(s.selected).toEqual([3, 3]);
  });
  it("game ends after timer expires", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TIMER_TICKS + 2; i++) s = reducer(s, { type: "tick" });
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
  it("score is non-negative", () => {
    expect(initialState(1, S).score).toBeGreaterThanOrEqual(0);
  });
});
