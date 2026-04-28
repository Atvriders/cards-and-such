import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("DiceDragonFight", () => {
  it("starts in rolling", () => { const s = initialState(1, S); expect(s.phase).toBe("rolling"); expect(s.score).toBe(0); });
  it("roll produces dice and points", () => {
    const s = reducer(initialState(1, S), { type:"roll" });
    expect(s.rolls.length).toBeGreaterThanOrEqual(1);
    expect(s.score).toBeGreaterThanOrEqual(1);
  });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after total rounds", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type:"roll" });
      if (s.phase === "scored") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
  });
  it("score grows after rolls", () => {
    let s = initialState(1, S);
    s = reducer(s, { type:"roll" });
    expect(s.score).toBeGreaterThanOrEqual(1);
  });
});
