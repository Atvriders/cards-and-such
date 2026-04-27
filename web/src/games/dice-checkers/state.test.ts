import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_TURNS } from "./state.js";
const S = { dummy: false };
describe("DiceCheckers", () => {
  it("starts at turn 1", () => { const s = initialState(1,S); expect(s.phase).toBe("rolling"); expect(s.turn).toBe(1); });
  it("roll produces a roll", () => { const s = reducer(initialState(1,S),{type:"roll"}); expect(s.lastRoll).toBeGreaterThanOrEqual(1); });
  it("score is non-negative", () => { let s = initialState(1,S); for(let i=0;i<TOTAL_TURNS;i++){ s=reducer(s,{type:"roll"}); if(s.phase!=="done") s=reducer(s,{type:"next"}); } expect(s.score).toBeGreaterThanOrEqual(0); });
  it("game ends after 10 turns", () => { let s = initialState(1,S); for(let i=0;i<TOTAL_TURNS;i++){ s=reducer(s,{type:"roll"}); if(s.phase!=="done") s=reducer(s,{type:"next"}); } expect(s.phase).toBe("done"); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
});
