import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isRed, TOTAL_DRAWS } from "./state.js";
const S = { dummy: false };
describe("RedRiver", () => {
  it("starts drawing", () => { expect(initialState(1,S).phase).toBe("drawing"); });
  it("isRed: heart=true, spade=false", () => { expect(isRed(13)).toBe(true); expect(isRed(0)).toBe(false); });
  it("draw advances", () => { const s=reducer(initialState(1,S),{type:"draw"}); expect(s.lastCard).not.toBeNull(); });
  it("score non-negative", () => { const s=reducer(initialState(1,S),{type:"draw"}); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null mid-game", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
  it("ends after all draws", () => {
    let s=initialState(1,S);
    for(let i=0;i<TOTAL_DRAWS;i++){ s=reducer(s,{type:"draw"}); if(s.phase==="result") s=reducer(s,{type:"next"}); }
    expect(s.phase).toBe("done");
  });
});
