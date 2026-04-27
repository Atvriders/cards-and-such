import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("DiceCricket", () => {
  it("starts in rolling phase round 1", () => { const s=initialState(1,S); expect(s.phase).toBe("rolling"); expect(s.round).toBe(1); });
  it("roll yields 3 dice, scored phase", () => { const s=reducer(initialState(1,S),{type:"roll"}); expect(s.phase).toBe("scored"); expect(s.dice.length).toBe(3); });
  it("score is non-negative across full game", () => { let s=initialState(1,S); for (let r=0;r<TOTAL_ROUNDS;r++){ s=reducer(s,{type:"roll"}); s=reducer(s,{type:"next"}); } expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
  it("ends after TOTAL_ROUNDS", () => { let s=initialState(1,S); for (let r=0;r<TOTAL_ROUNDS;r++){ s=reducer(s,{type:"roll"}); s=reducer(s,{type:"next"}); } expect(s.phase).toBe("done"); });
});
