import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("CardCollectFlush", () => {
  it("starts in playing", () => { const s = initialState(1,S); expect(s.phase).toBe("playing"); expect(s.score).toBe(0); });
  it("deal produces 5-card hand", () => { const s = reducer(initialState(1,S),{type:"deal"}); expect(s.hand.length).toBe(5); });
  it("score is non-negative", () => { let s = initialState(1,S); for(let r=0;r<TOTAL_ROUNDS;r++){ s=reducer(s,{type:"deal"}); if(s.phase!=="done") s=reducer(s,{type:"next"}); } expect(s.score).toBeGreaterThanOrEqual(0); });
  it("game ends after rounds", () => { let s = initialState(1,S); for(let r=0;r<TOTAL_ROUNDS;r++){ s=reducer(s,{type:"deal"}); if(s.phase!=="done") s=reducer(s,{type:"next"}); } expect(s.phase).toBe("done"); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
});
