import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, applyOp, NODE_COUNT, TOTAL_ROLLS } from "./state.js";

const S = { dummy: false };
describe("trek-12-himalaya", () => {
  it("starts empty in rolling phase", () => {
    const s = initialState(3, S);
    expect(s.phase).toBe("rolling");
    expect(s.values.length).toBe(NODE_COUNT);
    expect(s.values.every(v => v === null)).toBe(true);
  });
  it("roll produces two dice and moves to choosing", () => {
    const s = reducer(initialState(3, S), { type: "roll" });
    expect(s.phase).toBe("choosing");
    expect(s.lastDice).not.toBeNull();
    expect(s.lastDice![0]).toBeGreaterThanOrEqual(1);
    expect(s.lastDice![1]).toBeGreaterThanOrEqual(1);
  });
  it("applyOp computes sum/diff/max/min", () => {
    expect(applyOp(3, 4, "sum")).toBe(7);
    expect(applyOp(3, 4, "diff")).toBe(1);
    expect(applyOp(3, 4, "max")).toBe(4);
    expect(applyOp(3, 4, "min")).toBe(3);
  });
  it("place fills a node and adds score", () => {
    let s = reducer(initialState(3, S), { type: "roll" });
    s = reducer(s, { type: "place", index: 0, op: "sum" });
    expect(s.values[0]).not.toBeNull();
    expect(s.score).toBeGreaterThan(0);
    expect(s.rolls).toBe(1);
  });
  it("game ends after TOTAL_ROLLS", () => {
    let s = initialState(3, S);
    for (let i = 0; s.phase !== "done" && i < TOTAL_ROLLS * 4; i++) {
      if (s.phase === "rolling") s = reducer(s, { type: "roll" });
      else {
        const idx = s.values.findIndex(v => v === null);
        if (idx >= 0) s = reducer(s, { type: "place", index: idx, op: "sum" });
        else s = reducer(s, { type: "skip" });
      }
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)?.score).toBeGreaterThanOrEqual(0);
  });
  it("skip increments rolls without filling", () => {
    let s = reducer(initialState(3, S), { type: "roll" });
    const before = s.values.filter(v => v !== null).length;
    s = reducer(s, { type: "skip" });
    expect(s.rolls).toBe(1);
    expect(s.values.filter(v => v !== null).length).toBe(before);
  });
});
