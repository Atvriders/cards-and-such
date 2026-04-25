import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const s0=()=>initialState(1,{arrows:"10"});
describe("PaperArrow",()=>{
  it("starts with 10 arrows",()=>{expect(s0().arrowsLeft).toBe(10);});
  it("starts aiming",()=>{expect(s0().phase).toBe("aiming");});
  it("is deterministic",()=>{expect(initialState(7,{arrows:"10"}).targetX).toBe(initialState(7,{arrows:"10"}).targetX);});
  it("shoot decrements arrows",()=>{expect(reducer(s0(),{type:"shoot",x:0.5}).arrowsLeft).toBe(9);});
  it("direct hit scores",()=>{const s=s0();const s2=reducer(s,{type:"shoot",x:s.targetX});expect(s2.score).toBeGreaterThan(0);expect(s2.lastHit).toBe(true);});
  it("far miss scores 0",()=>{const s=s0();const s2=reducer(s,{type:"shoot",x:s.targetX>0.5?0.01:0.99});expect(s2.score).toBe(0);expect(s2.lastHit).toBe(false);});
  it("gameover after all arrows",()=>{let s=s0();for(let i=0;i<10;i++)s=reducer(s,{type:"shoot",x:0.5});expect(s.phase).toBe("gameover");});
  it("isTerminal returns score",()=>{let s=s0();for(let i=0;i<10;i++)s=reducer(s,{type:"shoot",x:0.5});expect(isTerminal(s)).not.toBeNull();});
});
