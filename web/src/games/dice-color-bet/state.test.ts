import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { rounds: "10" as const };
describe("DiceColorBet", () => {
  it("starts with 100 coins", () => { const s=initialState(1,S); expect(s.coins).toBe(100); });
  it("bet changes coins", () => { const s=reducer(initialState(1,S),{type:"bet",amount:10,color:"red"}); expect(s.coins).toBeGreaterThanOrEqual(0); expect(s.coins).not.toBe(100); });
  it("dice result is pair", () => { const s=reducer(initialState(1,S),{type:"bet",amount:10,color:"red"}); expect(s.dice!.length).toBe(2); });
  it("gameover when rounds exhausted", () => { let s=initialState(1,S); for(let i=0;i<10;i++){s=reducer(s,{type:"bet",amount:1,color:"red"});if(s.phase==="result")s=reducer(s,{type:"next"});} expect(isTerminal(s)).not.toBeNull(); });
});
