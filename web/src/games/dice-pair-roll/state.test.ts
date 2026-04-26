import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { rounds: "10" as const };
describe("DicePairRoll", () => {
  it("starts in rolling phase", () => { const s=initialState(1,S); expect(s.phase).toBe("rolling"); expect(s.coins).toBe(0); });
  it("roll produces two dice and gains", () => { const s=reducer(initialState(1,S),{type:"roll"}); expect(s.dice).not.toBeNull(); expect(s.coins).toBeGreaterThan(0); });
  it("dice values in range 1-6", () => { const s=reducer(initialState(1,S),{type:"roll"}); expect(s.dice![0]).toBeGreaterThanOrEqual(1); expect(s.dice![1]).toBeLessThanOrEqual(6); });
  it("gameover after all rounds", () => { let s=initialState(1,S); for(let i=0;i<10;i++){s=reducer(s,{type:"roll"});s=reducer(s,{type:"next"});} expect(isTerminal(s)).not.toBeNull(); });
});
