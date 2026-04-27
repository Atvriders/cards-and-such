import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isSeven, TOTAL_DRAWS } from "./state.js";
const S = { dummy: false };
describe("SevenStreak", () => {
  it("starts drawing", () => { expect(initialState(1,S).phase).toBe("drawing"); });
  it("isSeven detects rank 5 (i.e. card index '7')", () => { expect(isSeven(5)).toBe(true); expect(isSeven(0)).toBe(false); });
  it("draw produces card and result", () => { const s=reducer(initialState(1,S),{type:"draw"}); expect(s.lastCard).not.toBeNull(); });
  it("score multiple of 50", () => { const s=reducer(initialState(1,S),{type:"draw"}); expect(s.score % 50).toBe(0); });
  it("ends after all draws", () => {
    let s=initialState(1,S);
    for(let i=0;i<TOTAL_DRAWS;i++){ s=reducer(s,{type:"draw"}); if(s.phase==="result") s=reducer(s,{type:"next"}); }
    expect(s.phase).toBe("done");
  });
  it("isTerminal null mid-game", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
});
