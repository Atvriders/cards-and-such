import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const s0=()=>initialState(1,{difficulty:"easy"});
describe("FlySwatter",()=>{
  it("starts with flies",()=>{expect(s0().flies.length).toBeGreaterThan(0);});
  it("starts playing",()=>{expect(s0().phase).toBe("playing");});
  it("is deterministic",()=>{expect(initialState(3,{difficulty:"easy"}).flies[0]!.x).toBe(initialState(3,{difficulty:"easy"}).flies[0]!.x);});
  it("swat increases score",()=>{const s=s0();const id=s.flies[0]!.id;const s2=reducer(s,{type:"swat",id});expect(s2.score).toBe(100);});
  it("swat increments swatted",()=>{const s=s0();const id=s.flies[0]!.id;const s2=reducer(s,{type:"swat",id});expect(s2.swatted).toBe(1);});
  it("tick moves flies",()=>{const s=s0();const origX=s.flies[0]!.x;const s2=reducer(s,{type:"tick"});expect(s2.flies[0]?.x).not.toBe(origX);});
  it("isTerminal null during play",()=>{expect(isTerminal(s0())).toBeNull();});
  it("terminal after 50 swats",()=>{let s={...s0(),swatted:50};expect(isTerminal(s)).not.toBeNull();});
});
