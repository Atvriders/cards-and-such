import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const s0=()=>initialState(1,{difficulty:"easy"});
describe("TargetGrab",()=>{
  it("starts with targets on screen",()=>{expect(s0().targets.length).toBeGreaterThan(0);});
  it("starts playing",()=>{expect(s0().phase).toBe("playing");});
  it("is deterministic",()=>{expect(initialState(5,{difficulty:"easy"}).targets[0]!.x).toBe(initialState(5,{difficulty:"easy"}).targets[0]!.x);});
  it("click on target increases score",()=>{const s=s0();const id=s.targets[0]!.id;const s2=reducer(s,{type:"click",id});expect(s2.score).toBeGreaterThan(0);});
  it("tick ages targets",()=>{const s=s0();const tl=s.targets[0]!.timeLeft;const s2=reducer(s,{type:"tick"});expect(s2.targets[0]?.timeLeft??tl-1).toBeLessThanOrEqual(tl);});
  it("isTerminal null during play",()=>{expect(isTerminal(s0())).toBeNull();});
  it("gameover returns score",()=>{let s=s0();s={...s,phase:"gameover" as const};expect(isTerminal(s)).not.toBeNull();});
  it("misses cause gameover",()=>{
    let s=s0();
    // tick many times to expire targets
    for(let i=0;i<500&&s.phase!=="gameover";i++) s=reducer(s,{type:"tick"});
    expect(s.phase).toBe("gameover");
  });
});
