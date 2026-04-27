import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROLLS } from "./state.js";
const S = { dummy: false };
describe("DiceMarathon", () => {
  it("starts in playing with empty counts", () => { const s=initialState(1,S); expect(s.phase).toBe("playing"); expect(s.counts).toEqual([0,0,0,0,0,0]); });
  it("roll advances counter", () => { const s=reducer(initialState(1,S),{type:"roll"}); expect(s.rolls).toBe(1); });
  it("rollAll completes game", () => { const s=reducer(initialState(1,S),{type:"rollAll"}); expect(s.phase).toBe("done"); expect(s.rolls).toBe(TOTAL_ROLLS); });
  it("score equals total pips", () => { const s=reducer(initialState(1,S),{type:"rollAll"}); expect(s.score).toBe(s.total); expect(s.score).toBeGreaterThanOrEqual(100); });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
});
