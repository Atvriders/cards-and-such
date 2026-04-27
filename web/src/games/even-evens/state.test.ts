import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isEvenRank } from "./state.js";
const S = { dummy: false };
describe("EvenEvens", () => {
  it("starts in ready, no pair, score 0", () => { const s = initialState(1, S); expect(s.phase).toBe("ready"); expect(s.pair).toBeNull(); expect(s.score).toBe(0); });
  it("draw reveals pair", () => { const s = reducer(initialState(1, S), { type:"draw" }); expect(s.pair).not.toBeNull(); expect(["revealed","done"]).toContain(s.phase); });
  it("score is non-negative after draw", () => { const s = reducer(initialState(1, S), { type:"draw" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isEvenRank works on a 4 (rank index 2)", () => { expect(isEvenRank(2)).toBe(true); expect(isEvenRank(1)).toBe(false); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
