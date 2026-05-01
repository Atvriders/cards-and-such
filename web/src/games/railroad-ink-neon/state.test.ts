import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, markValue, cellZone, TOTAL_ROLLS, CELL_COUNT } from "./state.js";

const S = { dummy: false };
describe("railroad-ink-neon", () => {
  it("starts in rolling phase, score 0, no marks", () => {
    const s = initialState(7, S);
    expect(s.phase).toBe("rolling");
    expect(s.score).toBe(0);
    expect(s.cells.length).toBe(CELL_COUNT);
    expect(s.cells.some(Boolean)).toBe(false);
  });
  it("roll transitions to marking with a die in range", () => {
    const s = reducer(initialState(7, S), { type: "roll" });
    expect(s.phase).toBe("marking");
    expect(s.lastRoll).not.toBeNull();
    expect(s.lastRoll!).toBeGreaterThanOrEqual(1);
    expect(s.lastRoll!).toBeLessThanOrEqual(6);
  });
  it("marking a cell records value and increments rolls", () => {
    let s = reducer(initialState(7, S), { type: "roll" });
    const v = s.lastRoll!;
    s = reducer(s, { type: "mark", index: 0 });
    expect(s.cells[0]).toBe(true);
    expect(s.cellValues[0]).toBe(v);
    expect(s.rolls).toBe(1);
    expect(s.score).toBeGreaterThan(0);
  });
  it("skip increments rolls without scoring", () => {
    let s = reducer(initialState(7, S), { type: "roll" });
    const before = s.score;
    s = reducer(s, { type: "skip" });
    expect(s.rolls).toBe(1);
    expect(s.score).toBe(before);
  });
  it("game ends after TOTAL_ROLLS with non-negative score", () => {
    let s = initialState(7, S);
    for (let i = 0; s.phase !== "done" && i < 48; i++) {
      if (s.phase === "rolling") s = reducer(s, { type: "roll" });
      else {
        const idx = s.cells.findIndex(c => !c);
        s = idx >= 0 ? reducer(s, { type: "mark", index: idx }) : reducer(s, { type: "skip" });
      }
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)?.score).toBeGreaterThanOrEqual(0);
  });
  it("markValue and cellZone are pure helpers", () => {
    expect(typeof cellZone(0)).toBe("number");
    expect(markValue(3, 0, new Array(CELL_COUNT).fill(false), new Array(CELL_COUNT).fill(0))).toBeGreaterThan(0);
  });
  it("reset clears state", () => {
    let s = reducer(initialState(7, S), { type: "roll" });
    s = reducer(s, { type: "mark", index: 0 });
    s = reducer(s, { type: "reset" });
    expect(s.score).toBe(0);
    expect(s.cells.every(c => !c)).toBe(true);
  });
  it("isTerminal null while playing", () => {
    const s = reducer(initialState(7, S), { type: "roll" });
    expect(isTerminal(s)).toBeNull();
  });
});
