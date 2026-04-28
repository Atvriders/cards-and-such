import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("DiceRailroad", () => {
  it("starts in roll phase", () => { const s = initialState(1, S); expect(s.phase).toBe("roll"); expect(s.score).toBe(0); });
  it("roll produces dice", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(s.dice).not.toBeNull(); });
  it("score is non-negative after roll", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("ends after total rounds", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type:"roll" });
      if (s.phase === "result") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
  });
});
