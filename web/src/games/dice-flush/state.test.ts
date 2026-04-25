import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, calcScore } from "./state.js";
const s0=()=>initialState(1,{rounds:"5"});
describe("DiceFlush",()=>{
  it("starts with 5 dice",()=>{expect(s0().dice.length).toBe(5);});
  it("starts in rolling phase",()=>{expect(s0().phase).toBe("rolling");});
  it("is deterministic",()=>{expect(initialState(42,{rounds:"5"}).dice).toEqual(initialState(42,{rounds:"5"}).dice);});
  it("calcScore five-of-a-kind=500",()=>{expect(calcScore([3,3,3,3,3])).toBe(500);});
  it("calcScore four-of-a-kind=200",()=>{expect(calcScore([4,4,4,4,1])).toBe(200);});
  it("calcScore three-of-a-kind=80",()=>{expect(calcScore([2,2,2,4,5])).toBe(80);});
  it("score transitions to result",()=>{expect(reducer(s0(),{type:"score"}).phase).toBe("result");});
  it("terminal after rounds",()=>{let s=s0();for(let i=0;i<5&&s.phase!=="gameover";i++){s=reducer(s,{type:"score"});if(s.phase==="result")s=reducer(s,{type:"next"});}expect(isTerminal(s)).not.toBeNull();});
});
