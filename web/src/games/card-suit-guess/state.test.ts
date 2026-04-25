import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, cardSuit } from "./state.js";
const s0=()=>initialState(1,{rounds:"10"});
describe("CardSuitGuess",()=>{
  it("starts with 0 score",()=>{expect(s0().score).toBe(0);});
  it("starts guessing",()=>{expect(s0().phase).toBe("guessing");});
  it("is deterministic",()=>{expect(initialState(10,{rounds:"10"}).currentCard).toBe(initialState(10,{rounds:"10"}).currentCard);});
  it("guess transitions phase",()=>{const s=reducer(s0(),{type:"guess",suit:0});expect(["reveal","gameover"]).toContain(s.phase);});
  it("correct guess scores 250",()=>{
    const s=s0();const suit=cardSuit(s.currentCard) as 0|1|2|3;
    const s2=reducer(s,{type:"guess",suit});
    expect(s2.score).toBe(250);expect(s2.lastResult).toBe("correct");
  });
  it("wrong guess scores 0",()=>{
    const s=s0();const wrongSuit=((cardSuit(s.currentCard)+1)%4) as 0|1|2|3;
    const s2=reducer(s,{type:"guess",suit:wrongSuit});
    expect(s2.score).toBe(0);
  });
  it("next advances round",()=>{const s=reducer(s0(),{type:"guess",suit:0});if(s.phase==="reveal"){const s2=reducer(s,{type:"next"});expect(s2.round).toBe(2);}});
  it("terminal at gameover",()=>{let s=s0();for(let i=0;i<10&&s.phase!=="gameover";i++){s=reducer(s,{type:"guess",suit:0});if(s.phase==="reveal")s=reducer(s,{type:"next"});}expect(isTerminal(s)).not.toBeNull();});
});
