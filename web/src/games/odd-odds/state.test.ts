import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isOddRank } from "./state.js";
const S = { dummy: false };
describe("OddOdds", () => {
  it("starts in ready, score 0", () => { const s = initialState(1, S); expect(s.phase).toBe("ready"); expect(s.score).toBe(0); });
  it("draw reveals pair", () => { const s = reducer(initialState(1, S), { type:"draw" }); expect(s.pair).not.toBeNull(); expect(["revealed","done"]).toContain(s.phase); });
  it("score is non-negative after draw", () => { const s = reducer(initialState(1, S), { type:"draw" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isOddRank: 3 (rank index 1) is odd", () => { expect(isOddRank(1)).toBe(true); expect(isOddRank(0)).toBe(false); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
