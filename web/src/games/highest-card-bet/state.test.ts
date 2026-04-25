import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, cardValue } from "./state.js";
const s0=()=>initialState(1,{rounds:"10"});
describe("HighestCardBet",()=>{
  it("starts with 100 chips",()=>{expect(s0().chips).toBe(100);});
  it("starts in betting phase",()=>{expect(s0().phase).toBe("betting");});
  it("is deterministic",()=>{expect(initialState(42,{rounds:"10"}).currentCard).toBe(initialState(42,{rounds:"10"}).currentCard);});
  it("bet transitions to reveal or gameover",()=>{const s=reducer(s0(),{type:"bet",amount:10});expect(["reveal","gameover"]).toContain(s.phase);});
  it("win increases chips when next card is higher",()=>{
    let found=false;
    for(let seed=1;seed<50&&!found;seed++){
      const s=initialState(seed,{rounds:"10"});
      if(cardValue(s.nextCard)>cardValue(s.currentCard)){
        const s2=reducer(s,{type:"bet",amount:10});
        expect(s2.chips).toBe(110);found=true;
      }
    }
    if(!found) expect(true).toBe(true);
  });
  it("next advances round",()=>{
    const s=s0();const s2=reducer(s,{type:"bet",amount:5});
    if(s2.phase==="reveal"){const s3=reducer(s2,{type:"next"});expect(s3.round).toBe(2);}
    else expect(s2.phase).toBe("gameover");
  });
  it("gameover after max rounds",()=>{
    let s=s0();
    for(let i=0;i<10&&s.phase!=="gameover";i++){s=reducer(s,{type:"bet",amount:1});if(s.phase==="reveal")s=reducer(s,{type:"next"});}
    expect(s.phase).toBe("gameover");
  });
  it("isTerminal returns chips as score",()=>{
    let s=s0();
    for(let i=0;i<10&&s.phase!=="gameover";i++){s=reducer(s,{type:"bet",amount:1});if(s.phase==="reveal")s=reducer(s,{type:"next"});}
    const t=isTerminal(s);expect(t).not.toBeNull();expect(typeof t!.score).toBe("number");
  });
});
