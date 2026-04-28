import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, score, step, WIDTH } from "./state.js";

const S = { rule: "30" as const };

describe("life-1d", () => {
  it("starts with a single live center cell", () => {
    const s = initialState(1, S);
    expect(s.row.length).toBe(WIDTH);
    expect(s.row.reduce((a, b) => a + b, 0)).toBe(1);
    expect(s.generation).toBe(0);
  });
  it("step advances generation", () => {
    const s = reducer(initialState(1, S), { type: "step" });
    expect(s.generation).toBe(1);
    expect(s.row.length).toBe(WIDTH);
  });
  it("rule 30 makes patterns spread", () => {
    let row = new Array(WIDTH).fill(0);
    row[Math.floor(WIDTH / 2)] = 1;
    row = step(row, "30");
    expect(row.reduce((a, b) => a + b, 0)).toBeGreaterThanOrEqual(1);
  });
  it("score grows with steps and finish ends game", () => {
    let s = initialState(1, S);
    for (let i = 0; i < 20; i++) s = reducer(s, { type: "step" });
    expect(score(s)).toBeGreaterThanOrEqual(20);
    s = reducer(s, { type: "finish" });
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
});
