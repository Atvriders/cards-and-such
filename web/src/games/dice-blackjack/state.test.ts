import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("DiceBlackjack", () => {
  it("starts in playing", () => { const s = initialState(1, S); expect(s.phase).toBe("playing"); expect(s.total).toBe(0); });
  it("roll adds die value 1-6", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(s.total).toBeGreaterThanOrEqual(1); });
  it("stand transitions to scored", () => {
    let s = initialState(1, S);
    s = reducer(s, { type:"roll" });
    s = reducer(s, { type:"stand" });
    expect(["scored","done"]).toContain(s.phase);
  });
  it("game ends after 8 rounds", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type:"roll" });
      if (s.phase === "playing") s = reducer(s, { type:"stand" });
      if (s.phase === "scored") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
  });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
