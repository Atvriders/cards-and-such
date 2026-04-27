import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS, pipValue } from "./state.js";
const S = { dummy: false };
describe("LowTide", () => {
  it("starts at round 1", () => { const s = initialState(1, S); expect(s.round).toBe(1); expect(s.score).toBe(0); });
  it("deal puts 5 cards in hand", () => { const s = reducer(initialState(1, S), { type:"deal" }); expect(s.hand.length).toBe(5); });
  it("score is non-negative after a round", () => {
    const s = reducer(initialState(1, S), { type:"deal" });
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after TOTAL_ROUNDS", () => {
    let s = initialState(2, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) { s = reducer(s, { type:"deal" }); if (s.phase !== "done") s = reducer(s, { type:"next" }); }
    expect(s.phase).toBe("done");
  });
  it("pipValue: A=1, K=13, 5=5", () => { expect(pipValue(12)).toBe(1); expect(pipValue(11)).toBe(13); expect(pipValue(3)).toBe(5); });
});
