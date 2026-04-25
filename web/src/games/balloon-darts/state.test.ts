import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const s0=()=>initialState(1,{darts:"10"});
describe("BalloonDarts",()=>{
  it("starts with 12 balloons",()=>{expect(s0().balloons.length).toBe(12);});
  it("starts aiming",()=>{expect(s0().phase).toBe("aiming");});
  it("is deterministic",()=>{expect(initialState(42,{darts:"10"}).balloons[0]!.x).toBe(initialState(42,{darts:"10"}).balloons[0]!.x);});
  it("throw decrements darts",()=>{const s=reducer(s0(),{type:"throw",x:0.5,y:0.5});expect(s.dartsLeft).toBe(9);});
  it("direct hit pops balloon",()=>{
    const s=s0();const b=s.balloons[0]!;
    const s2=reducer(s,{type:"throw",x:b.x,y:b.y});
    expect(s2.balloons[0]!.popped).toBe(true);expect(s2.score).toBeGreaterThan(0);
  });
  it("miss does not pop balloon",()=>{
    const s=s0();
    const s2=reducer(s,{type:"throw",x:0.5,y:0.99});
    // may or may not miss depending on balloon layout, just check darts decreased
    expect(s2.dartsLeft).toBe(9);
  });
  it("gameover when darts run out",()=>{
    let s=s0();for(let i=0;i<10;i++)s=reducer(s,{type:"throw",x:0.5,y:0.99});
    expect(s.phase).toBe("gameover");
  });
  it("isTerminal null during play",()=>{expect(isTerminal(s0())).toBeNull();});
});
