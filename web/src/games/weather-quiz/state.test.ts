import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s0 = () => initialState(1, { questions:"10" });

describe("WeatherQuiz", () => {
  it("creates correct number of questions", () => { expect(s0().questions.length).toBe(10); });
  it("starts in playing phase", () => { expect(s0().phase).toBe("playing"); });
  it("is deterministic", () => {
    const a=initialState(42,{questions:"10"}); const b=initialState(42,{questions:"10"});
    expect(a.questions.map(q=>q.question)).toEqual(b.questions.map(q=>q.question));
  });
  it("select stores choice", () => { expect(reducer(s0(),{type:"select",choice:2}).selected).toBe(2); });
  it("submit scores correct answer", () => {
    const s=s0(); const c=s.questions[0]!.correct;
    const s2=reducer(reducer(s,{type:"select",choice:c}),{type:"submit"});
    expect(s2.score).toBe(100); expect(s2.phase).toBe("result");
  });
  it("submit scores 0 for wrong", () => {
    const s=s0(); const w=(s.questions[0]!.correct+1)%4;
    const s2=reducer(reducer(s,{type:"select",choice:w}),{type:"submit"});
    expect(s2.score).toBe(0);
  });
  it("next advances question", () => {
    const s=s0();
    const s2=reducer(reducer(reducer(s,{type:"select",choice:0}),{type:"submit"}),{type:"next"});
    expect(s2.currentIndex).toBe(1);
  });
  it("terminal after all questions", () => {
    let s=s0();
    for(let i=0;i<10;i++){ s=reducer(reducer(reducer(s,{type:"select",choice:0}),{type:"submit"}),{type:"next"}); }
    expect(isTerminal(s)).not.toBeNull();
  });
});
