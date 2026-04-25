import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const s0=()=>initialState(1,{rounds:"5"});
describe("ShapeRecall",()=>{
  it("starts with 2-shape sequence",()=>{expect(s0().sequence.length).toBe(2);});
  it("starts showing",()=>{expect(s0().phase).toBe("showing");});
  it("is deterministic",()=>{expect(initialState(3,{rounds:"5"}).sequence).toEqual(initialState(3,{rounds:"5"}).sequence);});
  it("advance moves index",()=>{expect(reducer(s0(),{type:"advance"}).showingIndex).toBe(1);});
  it("after all shown goes to input",()=>{let s=s0();s=reducer(s,{type:"advance"});s=reducer(s,{type:"advance"});expect(s.phase).toBe("input");});
  it("correct input succeeds",()=>{
    let s=s0();s=reducer(s,{type:"advance"});s=reducer(s,{type:"advance"});
    s.sequence.forEach(sh=>{s=reducer(s,{type:"pick",shape:sh});});
    expect(s.correct).toBe(true);
  });
  it("wrong shape marks wrong",()=>{
    let s=s0();s=reducer(s,{type:"advance"});s=reducer(s,{type:"advance"});
    const wrong=s.sequence[0]==="circle"?"square":"circle";
    s=reducer(s,{type:"pick",shape:wrong});expect(s.correct).toBe(false);
  });
  it("terminal after all rounds",()=>{
    let s=s0();
    for(let r=0;r<5&&s.phase!=="gameover";r++){
      while(s.phase==="showing")s=reducer(s,{type:"advance"});
      if(s.phase==="input") for(const sh of s.sequence) s=reducer(s,{type:"pick",shape:sh});
      if(s.phase==="result")s=reducer(s,{type:"nextRound"});
    }
    expect(isTerminal(s)).not.toBeNull();
  });
});
