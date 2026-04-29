import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROLLS, GRID_SIZE, CELL_COUNT } from "./state.js";
const S = { dummy: false };
describe("TrekAmericas", () => {
  it("starts in rolling phase with empty grid", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("rolling");
    expect(s.rolls).toBe(0);
    expect(s.cells.length).toBe(CELL_COUNT);
  });
  it("roll transitions to marking and sets lastRoll", () => {
    const s = reducer(initialState(1, S), { type: "roll" });
    expect(s.phase).toBe("marking");
    expect(s.lastRoll).not.toBeNull();
    expect(s.lastRoll).toBeGreaterThanOrEqual(1);
  });
  it("mark fills a cell and increments rolls", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "mark", index: 0 });
    expect(s.cells[0]).toBe(true);
    expect(s.rolls).toBeGreaterThanOrEqual(1);
  });
  it("skip advances rolls without marking", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "skip" });
    expect(s.rolls).toBeGreaterThanOrEqual(1);
    expect(s.cells.every(c => !c)).toBe(true);
  });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("game ends after TOTAL_ROLLS rolls", () => {
    let s = initialState(1, S);
    let i = 0;
    while (s.phase !== "done" && i < TOTAL_ROLLS * 3) {
      if (s.phase === "rolling") s = reducer(s, { type: "roll" });
      else s = reducer(s, { type: "skip" });
      i++;
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)?.score).toBeGreaterThanOrEqual(0);
  });
  it("constants are positive", () => {
    expect(GRID_SIZE).toBeGreaterThanOrEqual(3);
    expect(TOTAL_ROLLS).toBeGreaterThanOrEqual(6);
  });
});
