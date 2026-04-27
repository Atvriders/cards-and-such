import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_FLIPS } from "./state.js";
const S = { dummy: false };
describe("DiceCoinFlip", () => {
  it("starts in predict", () => { const s = initialState(1,S); expect(s.phase).toBe("predict"); expect(s.score).toBe(0); });
  it("predict produces a die", () => { const s = reducer(initialState(1,S),{type:"predict",choice:"heads"}); expect(s.lastDie).not.toBeNull(); });
  it("score is non-negative", () => { let s = initialState(1,S); for(let i=0;i<TOTAL_FLIPS;i++){ s=reducer(s,{type:"predict",choice:"heads"}); if(s.phase!=="done") s=reducer(s,{type:"next"}); } expect(s.score).toBeGreaterThanOrEqual(0); });
  it("game ends after 20 flips", () => { let s = initialState(1,S); for(let i=0;i<TOTAL_FLIPS;i++){ s=reducer(s,{type:"predict",choice:"heads"}); if(s.phase!=="done") s=reducer(s,{type:"next"}); } expect(s.phase).toBe("done"); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
});
