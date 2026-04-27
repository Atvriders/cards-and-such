import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_DRAWS } from "./state.js";
const S = { dummy: false };
describe("SixShoot", () => {
  it("starts in playing phase with no draws", () => { const s=initialState(1,S); expect(s.phase).toBe("playing"); expect(s.drawn).toBe(0); expect(s.hand).toEqual([]); });
  it("draw advances counter and adds card to hand", () => { const s=reducer(initialState(1,S),{type:"draw"}); expect(s.drawn).toBe(1); expect(s.hand.length).toBe(1); });
  it("score is non-negative across many draws", () => { let s=initialState(1,S); for(let i=0;i<TOTAL_DRAWS;i++) s=reducer(s,{type:"draw"}); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
  it("game ends after TOTAL_DRAWS", () => { let s=initialState(1,S); for(let i=0;i<TOTAL_DRAWS;i++) s=reducer(s,{type:"draw"}); expect(s.phase).toBe("done"); });
  it("TOTAL_DRAWS is 14", () => { expect(TOTAL_DRAWS).toBe(14); });
});
