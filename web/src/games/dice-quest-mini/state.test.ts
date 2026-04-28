import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("DiceQuestMini", () => {
  it("starts in roll phase", () => { const s = initialState(1, S); expect(s.phase).toBe("roll"); expect(s.round).toBe(1); });
  it("roll yields two dice in 1..6", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(s.dice).not.toBeNull(); expect(s.dice![0]).toBeGreaterThanOrEqual(1); expect(s.dice![0]).toBeLessThanOrEqual(6); expect(s.dice![1]).toBeGreaterThanOrEqual(1); expect(s.dice![1]).toBeLessThanOrEqual(6); });
  it("score is non-negative", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game progresses to done", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type:"roll" });
      if (s.phase === "scored") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
  });
});
