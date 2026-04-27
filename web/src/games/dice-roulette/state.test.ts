import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, bucketOf, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("DiceRoulette", () => {
  it("starts in betting", () => { const s = initialState(1, S); expect(s.phase).toBe("betting"); });
  it("bet rolls 3 dice with valid sum", () => { const s = reducer(initialState(1, S), { type:"bet", bucket:"low" }); expect(s.dice).not.toBeNull(); expect(s.sum).toBeGreaterThanOrEqual(3); expect(s.sum).toBeLessThanOrEqual(18); });
  it("bucketOf classifies correctly", () => { expect(bucketOf(3)).toBe("low"); expect(bucketOf(7)).toBe("mid"); expect(bucketOf(12)).toBe("high"); expect(bucketOf(18)).toBe("boom"); });
  it("game ends after 10 rounds", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) { s = reducer(s, { type:"bet", bucket:"mid" }); if (s.phase === "result") s = reducer(s, { type:"next" }); }
    expect(s.phase).toBe("done");
  });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
