import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { questions: "10" as const };

describe("LiteratureGenresQuiz", () => {
  it("creates correct question count", () => {
    expect(initialState(1, S).questions.length).toBe(10);
  });
  it("starts in playing phase with full timer", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.timeLeft).toBe(15);
    expect(s.selected).toBeNull();
  });
  it("select then submit scores correctly", () => {
    const s = initialState(1, S);
    const correct = s.questions[0]!.correct;
    const s2 = reducer(reducer(s, { type:"select", choice:correct }), { type:"submit" });
    expect(s2.score).toBeGreaterThan(100);
    expect(s2.phase).toBe("result");
  });
  it("isTerminal returns score when done", () => {
    let s = initialState(1, S);
    for(let i=0;i<10;i++){ s=reducer(s,{type:"select",choice:0}); s=reducer(s,{type:"submit"}); s=reducer(s,{type:"next"}); }
    expect(isTerminal(s)).not.toBeNull();
  });
});
