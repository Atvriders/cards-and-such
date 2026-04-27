import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TARGET } from "./state.js";
const S = { dummy: false };
describe("DiceSnakeLadder", () => {
  it("starts at position 0", () => { const s = initialState(1,S); expect(s.phase).toBe("rolling"); expect(s.pos).toBe(0); });
  it("roll advances", () => { const s = reducer(initialState(1,S),{type:"roll"}); expect(s.lastRoll).not.toBeNull(); expect(s.rolls).toBe(1); });
  it("eventually reaches done", () => { let s = initialState(1,S); for(let i=0;i<200;i++){ if(s.phase==="done") break; s=reducer(s,{type:"roll"}); } expect(s.phase).toBe("done"); expect(s.pos).toBeGreaterThanOrEqual(TARGET); });
  it("score is non-negative on finish", () => { let s = initialState(1,S); for(let i=0;i<200;i++){ if(s.phase==="done") break; s=reducer(s,{type:"roll"}); } expect(s.score).toBeGreaterThanOrEqual(10); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
});
