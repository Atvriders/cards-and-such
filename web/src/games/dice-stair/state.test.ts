import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, longestStair, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("Dice Stair", () => {
  it("longestStair detects 5", () => { expect(longestStair([1,2,3,4,5])).toBe(5); });
  it("longestStair detects 4", () => { expect(longestStair([2,3,4,5,5])).toBe(4); });
  it("starts in rolling phase round 1", () => { const s=initialState(1,S); expect(s.phase).toBe("rolling"); expect(s.round).toBe(1); });
  it("roll produces 5 dice", () => { const s=reducer(initialState(1,S),{type:"roll"}); expect(s.dice.length).toBe(5); });
  it("score non-negative across game", () => {
    let s=initialState(7,S);
    for(let r=0;r<TOTAL_ROUNDS;r++){ s=reducer(s,{type:"roll"}); if(s.phase==="result") s=reducer(s,{type:"next"}); }
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
  it("ends after all rounds", () => {
    let s=initialState(1,S);
    for(let r=0;r<TOTAL_ROUNDS;r++){ s=reducer(s,{type:"roll"}); if(s.phase==="result") s=reducer(s,{type:"next"}); }
    expect(s.phase).toBe("done");
  });
});
