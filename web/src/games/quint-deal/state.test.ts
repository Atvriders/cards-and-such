import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("QuintDeal", () => {
  it("starts in guessing with 5 cards", () => { const s = initialState(1, S); expect(s.phase).toBe("guessing"); expect(s.hand.length).toBe(5); });
  it("guess matches highest -> +10", () => { const s = initialState(1, S); const s2 = reducer(s, { type:"guess", index: s.highestIndex }); expect(s2.score).toBe(10); });
  it("wrong guess -> 0", () => {
    const s = initialState(1, S);
    const wrong = (s.highestIndex + 1) % 5;
    const s2 = reducer(s, { type:"guess", index: wrong });
    expect(s2.score).toBeLessThanOrEqual(10);
  });
  it("game ends after rounds", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) { s = reducer(s, { type:"guess", index: s.highestIndex }); if (s.phase === "result") s = reducer(s, { type:"next" }); }
    expect(s.phase).toBe("done");
  });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
