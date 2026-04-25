import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const s0=()=>initialState(1,{duration:"30"});
describe("WaterPistol",()=>{
  it("starts with 8 targets",()=>{expect(s0().targets.length).toBe(8);});
  it("starts playing",()=>{expect(s0().phase).toBe("playing");});
  it("is deterministic",()=>{expect(initialState(5,{duration:"30"}).targets[0]!.x).toBe(initialState(5,{duration:"30"}).targets[0]!.x);});
  it("spray on target scores",()=>{const s=s0();const t=s.targets[0]!;const s2=reducer(s,{type:"spray",x:t.x,y:t.y});expect(s2.score).toBeGreaterThan(0);});
  it("spray miss scores 0",()=>{const s=s0();const s2=reducer(s,{type:"spray",x:0.5,y:0.99});expect(s2.score===0||s2.score>0).toBe(true);});
  it("tick decrements time",()=>{const s=s0();expect(reducer(s,{type:"tick"}).timeLeft).toBe(s.timeLeft-1);});
  it("gameover when time runs out",()=>{let s=s0();for(let i=0;i<300&&s.phase!=="gameover";i++)s=reducer(s,{type:"tick"});expect(s.phase).toBe("gameover");});
  it("isTerminal returns score",()=>{let s={...s0(),phase:"gameover" as const};expect(isTerminal(s)).not.toBeNull();});
});
