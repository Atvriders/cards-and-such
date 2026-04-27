import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("Dice Shoot", () => {
  it("starts in set-target phase", () => { const s=initialState(1,S); expect(s.phase).toBe("set-target"); expect(s.round).toBe(1); });
  it("setTarget moves to roll with target 1-6", () => { const s=reducer(initialState(1,S),{type:"setTarget"}); expect(s.phase).toBe("roll"); expect(s.target).toBeGreaterThanOrEqual(1); expect(s.target).toBeLessThanOrEqual(6); });
  it("score is non-negative across full game", () => {
    let s=initialState(7,S);
    for(let r=0;r<TOTAL_ROUNDS;r++){
      s=reducer(s,{type:"setTarget"});
      s=reducer(s,{type:"roll"});
      if(s.phase==="result") s=reducer(s,{type:"next"});
    }
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
  it("ends after all rounds", () => {
    let s=initialState(1,S);
    for(let r=0;r<TOTAL_ROUNDS;r++){
      s=reducer(s,{type:"setTarget"});
      s=reducer(s,{type:"roll"});
      if(s.phase==="result") s=reducer(s,{type:"next"});
    }
    expect(s.phase).toBe("done");
  });
});
