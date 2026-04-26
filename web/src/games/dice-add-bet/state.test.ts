import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { rounds: "10" as const };
describe("DiceAddBet", () => {
  it("starts with 100 coins", () => { const s=initialState(1,S); expect(s.coins).toBe(100); expect(s.phase).toBe("betting"); });
  it("bet rolls 3 dice", () => { const s=reducer(initialState(1,S),{type:"bet",amount:10,side:"hi"}); expect(s.dice).not.toBeNull(); expect(s.dice!.length).toBe(3); });
  it("dice values in range 1-6", () => { const s=reducer(initialState(1,S),{type:"bet",amount:10,side:"hi"}); expect(s.dice![0]).toBeGreaterThanOrEqual(1); expect(s.dice![2]).toBeLessThanOrEqual(6); });
  it("gameover after max rounds", () => { let s=initialState(1,S); for(let i=0;i<10;i++){s=reducer(s,{type:"bet",amount:1,side:"hi"});if(s.phase==="result")s=reducer(s,{type:"next"});} expect(isTerminal(s)).not.toBeNull(); });
});
