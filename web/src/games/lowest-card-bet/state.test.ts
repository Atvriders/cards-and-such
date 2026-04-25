import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const s0=()=>initialState(1,{rounds:"10"});
describe("LowestCardBet",()=>{
  it("starts with 100 chips",()=>{expect(s0().chips).toBe(100);});
  it("starts betting",()=>{expect(s0().phase).toBe("betting");});
  it("is deterministic",()=>{expect(initialState(42,{rounds:"10"}).currentCard).toBe(initialState(42,{rounds:"10"}).currentCard);});
  it("bet moves to reveal or gameover",()=>{const s=reducer(s0(),{type:"bet",amount:5});expect(["reveal","gameover"]).toContain(s.phase);});
  it("isTerminal null during play",()=>{expect(isTerminal(s0())).toBeNull();});
  it("terminal at gameover",()=>{let s=s0();for(let i=0;i<10&&s.phase!=="gameover";i++){s=reducer(s,{type:"bet",amount:1});if(s.phase==="reveal")s=reducer(s,{type:"next"});}expect(isTerminal(s)).not.toBeNull();});
  it("next advances round",()=>{const s=reducer(s0(),{type:"bet",amount:5});if(s.phase==="reveal"){const s2=reducer(s,{type:"next"});expect(s2.round).toBe(2);}});
  it("chips change after bet",()=>{const s=reducer(s0(),{type:"bet",amount:10});const chipsChanged=s.chips!==100;const isTie=s.lastResult==="tie";expect(chipsChanged||isTie).toBe(true);});
});
