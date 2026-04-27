import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("DiceTally", () => {
  it("starts in rolling phase round 1", () => { const s=initialState(1,S); expect(s.phase).toBe("rolling"); expect(s.round).toBe(1); });
  it("roll moves to scored with 5 dice", () => { const s=reducer(initialState(1,S),{type:"roll"}); expect(s.phase).toBe("scored"); expect(s.dice.length).toBe(5); });
  it("score is non-negative", () => { let s=initialState(1,S); for (let r=0;r<TOTAL_ROUNDS;r++){ s=reducer(s,{type:"roll"}); s=reducer(s,{type:"next"}); } expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
  it("ends after TOTAL_ROUNDS", () => { let s=initialState(1,S); for (let r=0;r<TOTAL_ROUNDS;r++){ s=reducer(s,{type:"roll"}); s=reducer(s,{type:"next"}); } expect(s.phase).toBe("done"); });
});
