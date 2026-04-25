import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isRed } from "./state.js";
const s0=()=>initialState(1,{rounds:"10"});
describe("CardColorGuess",()=>{
  it("starts with 0 score",()=>{expect(s0().score).toBe(0);});
  it("starts guessing",()=>{expect(s0().phase).toBe("guessing");});
  it("is deterministic",()=>{expect(initialState(5,{rounds:"10"}).currentCard).toBe(initialState(5,{rounds:"10"}).currentCard);});
  it("guess transitions phase",()=>{const s=reducer(s0(),{type:"guess",color:"red"});expect(["reveal","gameover"]).toContain(s.phase);});
  it("correct guess scores points",()=>{
    const s=s0();const color=isRed(s.currentCard)?"red":"black";
    const s2=reducer(s,{type:"guess",color});
    expect(s2.lastResult).toBe("correct");expect(s2.score).toBeGreaterThan(0);
  });
  it("wrong guess scores 0",()=>{
    const s=s0();const color=isRed(s.currentCard)?"black":"red";
    const s2=reducer(s,{type:"guess",color});
    expect(s2.lastResult).toBe("wrong");expect(s2.score).toBe(0);
  });
  it("next advances round",()=>{const s=reducer(s0(),{type:"guess",color:"red"});if(s.phase==="reveal"){const s2=reducer(s,{type:"next"});expect(s2.round).toBe(2);}});
  it("gameover after max rounds",()=>{let s=s0();for(let i=0;i<10&&s.phase!=="gameover";i++){s=reducer(s,{type:"guess",color:"red"});if(s.phase==="reveal")s=reducer(s,{type:"next"});}expect(isTerminal(s)).not.toBeNull();});
});
