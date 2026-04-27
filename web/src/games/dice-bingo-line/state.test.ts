import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROLLS } from "./state.js";
const S = { dummy: false };
describe("DiceBingoLine", () => {
  it("starts in playing with empty line", () => { const s=initialState(1,S); expect(s.phase).toBe("playing"); expect(s.line).toEqual([false,false,false,false,false]); });
  it("roll advances counter and may fill", () => { const s=reducer(initialState(1,S),{type:"roll"}); expect(s.rolls).toBe(1); expect(s.lastRoll).toBeGreaterThanOrEqual(1); expect(s.lastRoll).toBeLessThanOrEqual(6); });
  it("score is non-negative", () => { let s=initialState(1,S); for(let i=0;i<TOTAL_ROLLS;i++) s=reducer(s,{type:"roll"}); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
  it("ends after TOTAL_ROLLS or bingo", () => { let s=initialState(1,S); for(let i=0;i<TOTAL_ROLLS;i++) s=reducer(s,{type:"roll"}); expect(s.phase).toBe("done"); });
});
