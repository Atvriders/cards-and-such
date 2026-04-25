import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const s0=()=>initialState(1,{rounds:"10"});
describe("Total7OrNot",()=>{
  it("starts 0 score",()=>{expect(s0().score).toBe(0);});
  it("starts guessing",()=>{expect(s0().phase).toBe("guessing");});
  it("is deterministic",()=>{expect(reducer(initialState(42,{rounds:"10"}),{type:"guess",value:"seven"}).dice).toEqual(reducer(initialState(42,{rounds:"10"}),{type:"guess",value:"seven"}).dice);});
  it("guess rolls 2 dice",()=>{const s=reducer(s0(),{type:"guess",value:"seven"});expect(s.dice.length).toBe(2);expect(s.dice[0]).toBeGreaterThanOrEqual(1);expect(s.dice[1]).toBeLessThanOrEqual(6);});
  it("isTerminal null during play",()=>{expect(isTerminal(s0())).toBeNull();});
  it("next advances round",()=>{const s=reducer(s0(),{type:"guess",value:"not"});if(s.phase==="reveal"){expect(reducer(s,{type:"next"}).round).toBe(2);}});
  it("terminal after rounds",()=>{let s=s0();for(let i=0;i<10&&s.phase!=="gameover";i++){s=reducer(s,{type:"guess",value:"not"});if(s.phase==="reveal")s=reducer(s,{type:"next"});}expect(isTerminal(s)).not.toBeNull();});
  it("seven guess scores 200 on hit",()=>{
    let s=s0();let found=false;
    for(let seed=1;seed<100&&!found;seed++){
      s=reducer(initialState(seed,{rounds:"10"}),{type:"guess",value:"seven"});
      if(s.lastResult==="seven"){expect(s.score).toBe(200);found=true;}
    }
  });
});
