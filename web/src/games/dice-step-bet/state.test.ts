import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { rounds: "5" as const };
describe("DiceStepBet", () => {
  it("starts in stepping phase with 0 total", () => { const s=initialState(1,S); expect(s.phase).toBe("stepping"); expect(s.runTotal).toBe(0); });
  it("step adds die to history", () => { const s=reducer(initialState(1,S),{type:"step"}); expect(s.dieHistory.length).toBe(1); expect(s.runTotal).toBeGreaterThan(0); });
  it("bank scores current total", () => { let s=initialState(1,S); s=reducer(s,{type:"step"}); s=reducer(s,{type:"bank"}); expect(s.coins).toBeGreaterThan(0); expect(s.phase).toBe("result"); });
  it("gameover after all rounds", () => { let s=initialState(1,S); for(let i=0;i<5;i++){s=reducer(s,{type:"step"});s=reducer(s,{type:"bank"});s=reducer(s,{type:"next"});} expect(isTerminal(s)).not.toBeNull(); });
});
