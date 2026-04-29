import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROLLS, CELL_COUNT } from "./state.js";
const S = { dummy: false };
describe("Trek12Arctic", () => {
  it("starts in rolling phase with score 0", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("rolling");
    expect(s.score).toBe(0);
    expect(s.cells.length).toBe(CELL_COUNT);
  });
  it("roll moves to marking with a die value", () => {
    const s = reducer(initialState(1, S), { type: "roll" });
    expect(s.phase).toBe("marking");
    expect(s.lastRoll).toBeGreaterThanOrEqual(1);
    expect(s.lastRoll).toBeLessThanOrEqual(6);
  });
  it("mark fills a cell and advances", () => {
    let s = reducer(initialState(1, S), { type: "roll" });
    s = reducer(s, { type: "mark", index: 0 });
    expect(s.cells[0]).toBe(true);
    expect(s.rolls).toBeGreaterThanOrEqual(1);
  });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("game ends after TOTAL_ROLLS with non-negative score", () => {
    let s = initialState(1, S);
    let i = 0;
    while (s.phase !== "done" && i < TOTAL_ROLLS * 3) {
      if (s.phase === "rolling") s = reducer(s, { type: "roll" });
      else if (s.phase === "marking") {
        const idx = s.cells.findIndex(c => !c);
        if (idx >= 0) s = reducer(s, { type: "mark", index: idx });
        else s = reducer(s, { type: "skip" });
      }
      i++;
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)?.score).toBeGreaterThanOrEqual(0);
  });
});
