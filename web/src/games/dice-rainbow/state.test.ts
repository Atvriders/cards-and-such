import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, uniqueFaces, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("Dice Rainbow", () => {
  it("uniqueFaces counts correctly", () => { expect(uniqueFaces([1,2,3,4,5,6])).toBe(6); expect(uniqueFaces([1,1,2,3,4,5])).toBe(5); });
  it("starts in rolling phase round 1", () => { const s=initialState(1,S); expect(s.phase).toBe("rolling"); expect(s.round).toBe(1); });
  it("roll produces 6 dice", () => { const s=reducer(initialState(1,S),{type:"roll"}); expect(s.dice.length).toBe(6); });
  it("score non-negative across game", () => {
    let s=initialState(11,S);
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
