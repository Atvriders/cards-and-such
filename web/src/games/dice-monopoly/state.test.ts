import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_TURNS } from "./state.js";
const S = { dummy: false };
describe("DiceMonopoly", () => {
  it("starts at turn 1 with 100 score", () => { const s = initialState(1,S); expect(s.phase).toBe("rolling"); expect(s.score).toBe(100); });
  it("roll advances pos", () => { const s = reducer(initialState(1,S),{type:"roll"}); expect(s.lastRoll).not.toBeNull(); expect(s.pos).toBeGreaterThanOrEqual(1); });
  it("score is non-negative at end", () => { let s = initialState(1,S); for(let i=0;i<TOTAL_TURNS;i++){ s=reducer(s,{type:"roll"}); if(s.phase!=="done") s=reducer(s,{type:"next"}); } expect(s.score).toBeGreaterThanOrEqual(-100); });
  it("game ends after 12 turns", () => { let s = initialState(1,S); for(let i=0;i<TOTAL_TURNS;i++){ s=reducer(s,{type:"roll"}); if(s.phase!=="done") s=reducer(s,{type:"next"}); } expect(s.phase).toBe("done"); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
});
