import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const s0=()=>initialState(1,{rounds:"5"});
describe("NumberRecall",()=>{
  it("starts with 3 digits",()=>{expect(s0().sequence.length).toBe(3);});
  it("starts showing",()=>{expect(s0().phase).toBe("showing");});
  it("is deterministic",()=>{expect(initialState(4,{rounds:"5"}).sequence).toEqual(initialState(4,{rounds:"5"}).sequence);});
  it("advance increments index",()=>{expect(reducer(s0(),{type:"advance"}).showingIndex).toBe(1);});
  it("after all shown goes to input",()=>{let s=s0();for(let i=0;i<3;i++)s=reducer(s,{type:"advance"});expect(s.phase).toBe("input");});
  it("correct input marks correct",()=>{
    let s=s0();for(let i=0;i<3;i++)s=reducer(s,{type:"advance"});
    s.sequence.forEach(d=>{s=reducer(s,{type:"pick",digit:d});});
    expect(s.correct).toBe(true);
  });
  it("wrong first digit marks wrong",()=>{
    let s=s0();for(let i=0;i<3;i++)s=reducer(s,{type:"advance"});
    const wrong=(s.sequence[0]!+1)%10;
    s=reducer(s,{type:"pick",digit:wrong});
    expect(s.correct).toBe(false);
  });
  it("terminal after all rounds",()=>{
    let s=s0();
    for(let r=0;r<5&&s.phase!=="gameover";r++){
      while(s.phase==="showing")s=reducer(s,{type:"advance"});
      if(s.phase==="input") for(let i=0;i<s.sequence.length;i++)s=reducer(s,{type:"pick",digit:0});
      if(s.phase==="result")s=reducer(s,{type:"nextRound"});
    }
    expect(isTerminal(s)).not.toBeNull();
  });
});
