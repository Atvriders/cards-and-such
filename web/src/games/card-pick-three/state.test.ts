import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { rounds: "10" as const };
describe("CardPickThree", () => {
  it("starts with 5-card hand", () => { const s=initialState(1,S); expect(s.hand.length).toBe(5); expect(s.phase).toBe("picking"); });
  it("can pick up to 3 cards", () => { let s=initialState(1,S); s=reducer(s,{type:"pick",index:0}); s=reducer(s,{type:"pick",index:1}); s=reducer(s,{type:"pick",index:2}); expect(s.picked.length).toBe(3); });
  it("confirm with 3 picks scores points", () => { let s=initialState(1,S); s=reducer(s,{type:"pick",index:0});s=reducer(s,{type:"pick",index:1});s=reducer(s,{type:"pick",index:2}); s=reducer(s,{type:"confirm"}); expect(s.coins).toBeGreaterThan(0); });
  it("gameover after all rounds", () => { let s=initialState(1,S); for(let i=0;i<10;i++){s=reducer(s,{type:"pick",index:0});s=reducer(s,{type:"pick",index:1});s=reducer(s,{type:"pick",index:2});s=reducer(s,{type:"confirm"});s=reducer(s,{type:"next"});} expect(isTerminal(s)).not.toBeNull(); });
});
