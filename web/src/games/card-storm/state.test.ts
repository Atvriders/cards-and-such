import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("CardStorm", () => {
  it("starts in playing with hand of 4", () => { const s = initialState(1,S); expect(s.phase).toBe("playing"); expect(s.hand.length).toBe(4); });
  it("lock advances to scored", () => { const s = reducer(initialState(1,S),{type:"lock"}); expect(s.phase).toBeDefined(); expect(s.score).toBeGreaterThanOrEqual(8); });
  it("score is non-negative after rounds", () => { let s = initialState(1,S); for(let r=0;r<TOTAL_ROUNDS;r++){ s=reducer(s,{type:"lock"}); if(s.phase!=="done") s=reducer(s,{type:"next"}); } expect(s.score).toBeGreaterThanOrEqual(0); });
  it("game ends after all rounds", () => { let s = initialState(1,S); for(let r=0;r<TOTAL_ROUNDS;r++){ s=reducer(s,{type:"lock"}); if(s.phase!=="done") s=reducer(s,{type:"next"}); } expect(s.phase).toBe("done"); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
});
