import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS, isFace } from "./state.js";
const S = { dummy: false };
describe("RoyalRumble", () => {
  it("starts dealing", () => { expect(initialState(1,S).phase).toBe("dealing"); });
  it("deal produces 5 cards", () => { const s=reducer(initialState(1,S),{type:"deal"}); expect(s.hand.length).toBe(5); });
  it("score is non-negative and multiple of 50", () => { const s=reducer(initialState(1,S),{type:"deal"}); expect(s.score).toBeGreaterThanOrEqual(0); expect(s.score % 50).toBe(0); });
  it("isFace correct: J=9, K=11", () => { expect(isFace(9)).toBe(true); expect(isFace(11)).toBe(true); expect(isFace(0)).toBe(false); });
  it("isTerminal null mid-game", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
  it("ends after all rounds", () => {
    let s=initialState(1,S);
    for(let i=0;i<TOTAL_ROUNDS;i++){ s=reducer(s,{type:"deal"}); if(s.phase==="scored") s=reducer(s,{type:"next"}); }
    expect(s.phase).toBe("done");
  });
});
