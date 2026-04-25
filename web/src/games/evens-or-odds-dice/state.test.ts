import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const s0=()=>initialState(1,{rounds:"10"});
describe("EvensOrOddsDice",()=>{
  it("starts with 0 score",()=>{expect(s0().score).toBe(0);});
  it("starts in guessing phase",()=>{expect(s0().phase).toBe("guessing");});
  it("is deterministic",()=>{const a=reducer(initialState(5,{rounds:"10"}),{type:"guess",value:"even"});const b=reducer(initialState(5,{rounds:"10"}),{type:"guess",value:"even"});expect(a.dice).toEqual(b.dice);});
  it("guess rolls dice",()=>{const s=reducer(s0(),{type:"guess",value:"even"});expect(s.dice.length).toBe(3);});
  it("all dice between 1-6",()=>{const s=reducer(s0(),{type:"guess",value:"even"});for(const d of s.dice){expect(d).toBeGreaterThanOrEqual(1);expect(d).toBeLessThanOrEqual(6);}});
  it("correct guess scores points",()=>{
    const s=reducer(s0(),{type:"guess",value:"even"});
    if(s.lastResult==="correct") expect(s.score).toBeGreaterThan(0); else expect(s.score).toBe(0);
  });
  it("roll advances round",()=>{const s=reducer(s0(),{type:"guess",value:"even"});if(s.phase==="reveal"){const s2=reducer(s,{type:"roll"});expect(s2.round).toBe(2);}});
  it("terminal after max rounds",()=>{let s=s0();for(let i=0;i<10&&s.phase!=="gameover";i++){s=reducer(s,{type:"guess",value:"even"});if(s.phase==="reveal")s=reducer(s,{type:"roll"});}expect(isTerminal(s)).not.toBeNull();});
});
