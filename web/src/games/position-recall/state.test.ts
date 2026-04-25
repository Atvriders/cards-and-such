import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const s0=()=>initialState(1,{rounds:"5"});
describe("PositionRecall",()=>{
  it("starts with 2-cell sequence",()=>{expect(s0().sequence.length).toBe(2);});
  it("starts showing",()=>{expect(s0().phase).toBe("showing");});
  it("is deterministic",()=>{expect(initialState(6,{rounds:"5"}).sequence).toEqual(initialState(6,{rounds:"5"}).sequence);});
  it("advance increments index",()=>{expect(reducer(s0(),{type:"advance"}).showingIndex).toBe(1);});
  it("after showing goes to input",()=>{let s=s0();s=reducer(s,{type:"advance"});s=reducer(s,{type:"advance"});expect(s.phase).toBe("input");});
  it("correct picks succeed",()=>{
    let s=s0();s=reducer(s,{type:"advance"});s=reducer(s,{type:"advance"});
    s.sequence.forEach(idx=>{s=reducer(s,{type:"pick",index:idx});});
    expect(s.correct).toBe(true);
  });
  it("wrong pick fails",()=>{
    let s=s0();s=reducer(s,{type:"advance"});s=reducer(s,{type:"advance"});
    const wrong=(s.sequence[0]!+1)%9;
    s=reducer(s,{type:"pick",index:wrong});expect(s.correct).toBe(false);
  });
  it("terminal after rounds",()=>{
    let s=s0();
    for(let r=0;r<5&&s.phase!=="gameover";r++){
      while(s.phase==="showing")s=reducer(s,{type:"advance"});
      if(s.phase==="input") for(const idx of s.sequence) s=reducer(s,{type:"pick",index:idx});
      if(s.phase==="result")s=reducer(s,{type:"nextRound"});
    }
    expect(isTerminal(s)).not.toBeNull();
  });
});
