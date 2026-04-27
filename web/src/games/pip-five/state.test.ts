import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, pipValue, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("PipFive", () => {
  it("starts in dealing", () => { const s = initialState(1, S); expect(s.phase).toBe("dealing"); expect(s.score).toBe(0); });
  it("deal produces hand of 5 cards", () => { const s = reducer(initialState(1, S), { type:"deal" }); expect(s.hand.length).toBe(5); });
  it("score is non-negative after deal", () => { const s = reducer(initialState(1, S), { type:"deal" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("pipValue: Ace is 1, K/Q/J are 10", () => { expect(pipValue(12)).toBe(1); expect(pipValue(11)).toBe(10); expect(pipValue(10)).toBe(10); expect(pipValue(9)).toBe(10); });
  it("game ends after TOTAL_ROUNDS deal/next loops", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) { s = reducer(s, { type:"deal" }); if (s.phase === "scored") s = reducer(s, { type:"next" }); }
    expect(s.phase).toBe("done");
  });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
