import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const s0=()=>initialState(1,{balls:"10"});
describe("DunkTank",()=>{
  it("starts with 10 balls",()=>{expect(s0().ballsLeft).toBe(10);});
  it("starts aiming",()=>{expect(s0().phase).toBe("aiming");});
  it("is deterministic",()=>{expect(initialState(5,{balls:"10"}).targetX).toBe(initialState(5,{balls:"10"}).targetX);});
  it("throw decrements balls",()=>{expect(reducer(s0(),{type:"throw",x:0.5}).ballsLeft).toBe(9);});
  it("direct hit scores points",()=>{const s=s0();const s2=reducer(s,{type:"throw",x:s.targetX});expect(s2.score).toBeGreaterThan(0);expect(s2.dunks).toBe(1);});
  it("miss scores 0",()=>{const s=s0();const s2=reducer(s,{type:"throw",x:s.targetX>0.5?0.05:0.95});expect(s2.dunks).toBe(0);});
  it("gameover after all balls",()=>{let s=s0();for(let i=0;i<10;i++)s=reducer(s,{type:"throw",x:0.5});expect(s.phase).toBe("gameover");});
  it("isTerminal null during play",()=>{expect(isTerminal(s0())).toBeNull();});
});
