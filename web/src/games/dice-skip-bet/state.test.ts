import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { rounds: "10" as const };
describe("DiceSkipBet", () => {
  it("starts with 100 coins", () => { expect(initialState(1,S).coins).toBe(100); });
  it("bet rolls a die value 1-6", () => { const s=reducer(initialState(1,S),{type:"bet",amount:5,skip:1}); expect(s.die).toBeGreaterThanOrEqual(1); expect(s.die).toBeLessThanOrEqual(6); });
  it("win or lose changes coins", () => { const s=reducer(initialState(1,S),{type:"bet",amount:5,skip:1}); expect(s.coins).not.toBe(100); });
  it("gameover after rounds", () => { let s=initialState(1,S); for(let i=0;i<10;i++){s=reducer(s,{type:"bet",amount:1,skip:6});if(s.phase==="result")s=reducer(s,{type:"next"});} expect(isTerminal(s)).not.toBeNull(); });
});
