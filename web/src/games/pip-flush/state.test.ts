import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, suitOf, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("PipFlush", () => {
  it("starts in dealing", () => { const s = initialState(1, S); expect(s.phase).toBe("dealing"); });
  it("deal produces hand of 5 cards", () => { const s = reducer(initialState(1, S), { type:"deal" }); expect(s.hand.length).toBe(5); });
  it("score is non-negative after deal", () => { const s = reducer(initialState(1, S), { type:"deal" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("suitOf calculates correctly", () => { expect(suitOf(0)).toBe(0); expect(suitOf(13)).toBe(1); expect(suitOf(51)).toBe(3); });
  it("bestSuitCount is at least 2 (pigeonhole)", () => { const s = reducer(initialState(1, S), { type:"deal" }); expect(s.bestSuitCount).toBeGreaterThanOrEqual(2); });
  it("game ends after 8 rounds", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) { s = reducer(s, { type:"deal" }); if (s.phase === "scored") s = reducer(s, { type:"next" }); }
    expect(s.phase).toBe("done");
  });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
