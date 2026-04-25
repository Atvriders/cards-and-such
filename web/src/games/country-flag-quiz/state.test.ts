import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const s0=()=>initialState(1,{questions:"10"});
describe("CountryFlagQuiz",()=>{
  it("creates 10 questions",()=>{expect(s0().questions.length).toBe(10);});
  it("starts playing",()=>{expect(s0().phase).toBe("playing");});
  it("is deterministic",()=>{expect(initialState(9,{questions:"10"}).questions.map(q=>q.question)).toEqual(initialState(9,{questions:"10"}).questions.map(q=>q.question));});
  it("select stores choice",()=>{expect(reducer(s0(),{type:"select",choice:1}).selected).toBe(1);});
  it("correct scores 100",()=>{const s=s0();const c=s.questions[0]!.correct;expect(reducer(reducer(s,{type:"select",choice:c}),{type:"submit"}).score).toBe(100);});
  it("wrong scores 0",()=>{const s=s0();const w=(s.questions[0]!.correct+1)%4;expect(reducer(reducer(s,{type:"select",choice:w}),{type:"submit"}).score).toBe(0);});
  it("next advances",()=>{const s=s0();expect(reducer(reducer(reducer(s,{type:"select",choice:0}),{type:"submit"}),{type:"next"}).currentIndex).toBe(1);});
  it("terminal at end",()=>{let s=s0();for(let i=0;i<10;i++)s=reducer(reducer(reducer(s,{type:"select",choice:0}),{type:"submit"}),{type:"next"});expect(isTerminal(s)).not.toBeNull();});
});
