import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("Dice Mirror", () => {
  it("starts in rolling phase round 1", () => { const s=initialState(1,S); expect(s.phase).toBe("rolling"); expect(s.round).toBe(1); });
  it("roll yields two dice in 1-6", () => { const s=reducer(initialState(1,S),{type:"roll"}); expect(s.dice![0]).toBeGreaterThanOrEqual(1); expect(s.dice![0]).toBeLessThanOrEqual(6); expect(s.dice![1]).toBeGreaterThanOrEqual(1); expect(s.dice![1]).toBeLessThanOrEqual(6); });
  it("score is non-negative across game", () => {
    let s=initialState(9,S);
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
