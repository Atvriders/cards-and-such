import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const s0=()=>initialState(1,{rounds:"5"});
describe("ColorRecall",()=>{
  it("starts with 2-color sequence",()=>{expect(s0().sequence.length).toBe(2);});
  it("starts showing phase",()=>{expect(s0().phase).toBe("showing");});
  it("is deterministic",()=>{expect(initialState(7,{rounds:"5"}).sequence).toEqual(initialState(7,{rounds:"5"}).sequence);});
  it("advance increments index",()=>{expect(reducer(s0(),{type:"advance"}).showingIndex).toBe(1);});
  it("after all shown moves to input",()=>{let s=s0();s=reducer(s,{type:"advance"});s=reducer(s,{type:"advance"});expect(s.phase).toBe("input");});
  it("correct input gives result correct",()=>{
    let s=s0();
    s=reducer(s,{type:"advance"});s=reducer(s,{type:"advance"});
    s=reducer(s,{type:"pick",color:s.sequence[0]!});
    s=reducer(s,{type:"pick",color:s.sequence[1]!});
    expect(s.phase).toBe("result");expect(s.correct).toBe(true);
  });
  it("wrong input gives result wrong",()=>{
    let s=s0();s=reducer(s,{type:"advance"});s=reducer(s,{type:"advance"});
    const wrong=s.sequence[0]==="red"?"blue":"red";
    s=reducer(s,{type:"pick",color:wrong});
    expect(s.correct).toBe(false);
  });
  it("gameover after max rounds",()=>{
    let s=s0();
    for(let r=0;r<5&&s.phase!=="gameover";r++){
      while(s.phase==="showing")s=reducer(s,{type:"advance"});
      if(s.phase==="input"){ s.sequence.forEach(()=>{ s=reducer(s,{type:"pick",color:"red"}); }); }
      if(s.phase==="result") s=reducer(s,{type:"nextRound"});
    }
    expect(isTerminal(s)).not.toBeNull();
  });
});
