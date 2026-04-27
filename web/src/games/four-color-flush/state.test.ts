import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("Four Color Flush", () => {
  it("starts in dealing phase round 1", () => { const s=initialState(1,S); expect(s.phase).toBe("dealing"); expect(s.round).toBe(1); });
  it("deal produces 4 unique cards and moves to scored", () => {
    const s=reducer(initialState(1,S),{type:"deal"});
    expect(s.hand.length).toBe(4);
    expect(new Set(s.hand).size).toBe(4);
    expect(["scored","done"]).toContain(s.phase);
  });
  it("score is non-negative across full game", () => {
    let s=initialState(7,S);
    for(let r=0;r<TOTAL_ROUNDS;r++){ s=reducer(s,{type:"deal"}); if(s.phase==="scored") s=reducer(s,{type:"next"}); }
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
  it("ends after all rounds", () => {
    let s=initialState(1,S);
    for(let r=0;r<TOTAL_ROUNDS;r++){ s=reducer(s,{type:"deal"}); if(s.phase==="scored") s=reducer(s,{type:"next"}); }
    expect(s.phase).toBe("done");
  });
});
