import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const s0=()=>initialState(1,{balls:"10"});
describe("BasketToss",()=>{
  it("starts with 10 balls",()=>{expect(s0().ballsLeft).toBe(10);});
  it("starts aiming",()=>{expect(s0().phase).toBe("aiming");});
  it("is deterministic",()=>{expect(initialState(5,{balls:"10"}).basketX).toBe(initialState(5,{balls:"10"}).basketX);});
  it("toss decrements balls",()=>{expect(reducer(s0(),{type:"toss",x:0.5}).ballsLeft).toBe(9);});
  it("direct toss scores",()=>{const s=s0();const s2=reducer(s,{type:"toss",x:s.basketX});expect(s2.score).toBeGreaterThan(0);expect(s2.lastResult).toBe("made");});
  it("far miss scores 0",()=>{const s=s0();const s2=reducer(s,{type:"toss",x:s.basketX>0.5?0.01:0.99});expect(s2.lastResult).toBe("miss");expect(s2.score).toBe(0);});
  it("gameover after all balls",()=>{let s=s0();for(let i=0;i<10;i++){s=reducer(s,{type:"toss",x:0.5});if(s.phase==="result")s=reducer(s,{type:"next"});}expect(s.phase).toBe("gameover");});
  it("isTerminal returns score",()=>{let s=s0();for(let i=0;i<10;i++){s=reducer(s,{type:"toss",x:0.5});if(s.phase==="result")s=reducer(s,{type:"next"});}expect(isTerminal(s)).not.toBeNull();});
});
