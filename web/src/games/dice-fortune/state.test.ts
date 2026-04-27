import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("Dice Fortune", () => {
  it("starts in spinning phase round 1", () => { const s=initialState(1,S); expect(s.phase).toBe("spinning"); expect(s.round).toBe(1); });
  it("spin yields die 1-6 and multiplier 1-5", () => {
    const s=reducer(initialState(1,S),{type:"spin"});
    expect(s.die).toBeGreaterThanOrEqual(1); expect(s.die).toBeLessThanOrEqual(6);
    expect(s.multiplier).toBeGreaterThanOrEqual(1); expect(s.multiplier).toBeLessThanOrEqual(5);
  });
  it("score is positive after game (always > 0)", () => {
    let s=initialState(7,S);
    for(let r=0;r<TOTAL_ROUNDS;r++){ s=reducer(s,{type:"spin"}); if(s.phase==="result") s=reducer(s,{type:"next"}); }
    expect(s.score).toBeGreaterThanOrEqual(TOTAL_ROUNDS);
  });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
  it("ends after all rounds", () => {
    let s=initialState(1,S);
    for(let r=0;r<TOTAL_ROUNDS;r++){ s=reducer(s,{type:"spin"}); if(s.phase==="result") s=reducer(s,{type:"next"}); }
    expect(s.phase).toBe("done");
  });
});
