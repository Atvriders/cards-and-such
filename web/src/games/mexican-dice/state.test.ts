import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, evalRoll, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("MexicanDice", () => {
  it("starts in rolling", () => { const s = initialState(1, S); expect(s.phase).toBe("rolling"); expect(s.totalScore).toBe(0); });
  it("evalRoll 2-1 is Mexican worth 200", () => { expect(evalRoll(2,1).points).toBe(200); expect(evalRoll(1,2).points).toBe(200); });
  it("evalRoll doubles 6-6 worth 600", () => { expect(evalRoll(6,6).points).toBe(600); });
  it("evalRoll plain sum", () => { expect(evalRoll(3,4).points).toBe(7); });
  it("roll moves to scored or done", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(["scored","done"]).toContain(s.phase); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("score is non-negative", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(s.totalScore).toBeGreaterThanOrEqual(0); });
  it("game ends after all rounds", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) { s = reducer(s, { type:"roll" }); if (i < TOTAL_ROUNDS - 1) s = reducer(s, { type:"next" }); }
    expect(s.phase).toBe("done");
  });
});
