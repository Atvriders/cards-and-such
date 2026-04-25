import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s0 = () => initialState(1, { questions:"10" });

describe("MusicDecadeQuiz", () => {
  it("creates 10 questions", () => { expect(s0().questions.length).toBe(10); });
  it("starts playing", () => { expect(s0().phase).toBe("playing"); });
  it("is deterministic", () => {
    expect(initialState(42,{questions:"10"}).questions.map(q=>q.question))
      .toEqual(initialState(42,{questions:"10"}).questions.map(q=>q.question));
  });
  it("select works", () => { expect(reducer(s0(),{type:"select",choice:1}).selected).toBe(1); });
  it("correct answer scores 100", () => {
    const s=s0(); const c=s.questions[0]!.correct;
    expect(reducer(reducer(s,{type:"select",choice:c}),{type:"submit"}).score).toBe(100);
  });
  it("wrong answer scores 0", () => {
    const s=s0(); const w=(s.questions[0]!.correct+1)%4;
    expect(reducer(reducer(s,{type:"select",choice:w}),{type:"submit"}).score).toBe(0);
  });
  it("next advances index", () => {
    const s=s0();
    const s2=reducer(reducer(reducer(s,{type:"select",choice:0}),{type:"submit"}),{type:"next"});
    expect(s2.currentIndex).toBe(1);
  });
  it("terminal after completing all questions", () => {
    let s=s0();
    for(let i=0;i<10;i++) s=reducer(reducer(reducer(s,{type:"select",choice:0}),{type:"submit"}),{type:"next"});
    expect(isTerminal(s)).not.toBeNull();
  });
});
