import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isAceCard, TOTAL_DRAWS } from "./state.js";
const S = { dummy: false };
describe("AceAlley", () => {
  it("starts drawing", () => { expect(initialState(1,S).phase).toBe("drawing"); });
  it("isAceCard 12=true, 0=false", () => { expect(isAceCard(12)).toBe(true); expect(isAceCard(0)).toBe(false); });
  it("draw produces a card", () => { const s=reducer(initialState(1,S),{type:"draw"}); expect(s.lastCard).not.toBeNull(); });
  it("score is multiple of 100", () => { const s=reducer(initialState(1,S),{type:"draw"}); expect(s.score % 100).toBe(0); });
  it("isTerminal null mid-game", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
  it("ends after all draws", () => {
    let s=initialState(1,S);
    for(let i=0;i<TOTAL_DRAWS;i++){ s=reducer(s,{type:"draw"}); if(s.phase==="result") s=reducer(s,{type:"next"}); }
    expect(s.phase).toBe("done");
  });
});
