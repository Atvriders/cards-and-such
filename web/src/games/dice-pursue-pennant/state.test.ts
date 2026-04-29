import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS, DIE_COUNT, TARGET_POINTS, BASE_SCORE } from "./state.js";
const S = { dummy: false };
describe("DicePursuePennantState", () => {
  it("starts at zero scores", () => {
    const s = initialState(1, S);
    expect(s.myPoints).toBe(0);
    expect(s.oppPoints).toBe(0);
  });
  it("roll yields dice", () => {
    const s = reducer(initialState(1, S), { type:"roll" });
    expect(s.dice!.length).toBe(DIE_COUNT);
  });
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("ends after rounds with non-negative score", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS + 4; i++) {
      if (s.phase === "rolling") s = reducer(s, { type:"roll" });
      if (s.phase === "rolled") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)!.score).toBeGreaterThanOrEqual(0);
  });
  it("base score and target are defined", () => {
    expect(BASE_SCORE).toBeGreaterThan(0);
    expect(TARGET_POINTS).toBeGreaterThan(0);
  });
});
