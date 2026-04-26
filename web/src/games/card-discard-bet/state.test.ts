import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { rounds: "10" as const };
describe("CardDiscardBet", () => {
  it("starts in decide phase", () => { const s=initialState(1,S); expect(s.phase).toBe("decide"); expect(s.coins).toBe(0); });
  it("keep earns rank points", () => { const s=reducer(initialState(1,S),{type:"keep"}); expect(s.coins).toBeGreaterThan(0); expect(s.phase).toBe("result"); });
  it("discard doubles points", () => { const s=reducer(initialState(1,S),{type:"discard"}); expect(s.lastGain % 2).toBe(0); expect(s.phase).toBe("result"); });
  it("gameover after all rounds", () => { let s=initialState(1,S); for(let i=0;i<10;i++){s=reducer(s,{type:"keep"});s=reducer(s,{type:"next"});} expect(isTerminal(s)).not.toBeNull(); });
});
