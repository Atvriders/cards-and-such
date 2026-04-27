import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("DiceRelayMini", () => {
  it("starts in rolling", () => { const s = initialState(1,S); expect(s.phase).toBe("rolling"); expect(s.score).toBe(0); });
  it("roll produces dice", () => { const s = reducer(initialState(1,S),{type:"roll"}); expect(s.dice).not.toBeNull(); });
  it("score is non-negative", () => { let s = initialState(1,S); for(let r=0;r<TOTAL_ROUNDS;r++){ s=reducer(s,{type:"roll"}); if(s.phase!=="done") s=reducer(s,{type:"next"}); } expect(s.score).toBeGreaterThanOrEqual(0); });
  it("game ends after all rounds", () => { let s = initialState(1,S); for(let r=0;r<TOTAL_ROUNDS;r++){ s=reducer(s,{type:"roll"}); if(s.phase!=="done") s=reducer(s,{type:"next"}); } expect(s.phase).toBe("done"); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
});
