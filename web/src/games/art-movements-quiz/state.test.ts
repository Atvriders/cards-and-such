import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { questions: "10" as const };

describe("ArtMovementsQuiz", () => {
  it("creates correct question count", () => {
    expect(initialState(1, S).questions.length).toBe(10);
  });
  it("starts in playing phase with full timer", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.timeLeft).toBe(15);
  });
  it("correct answer scores above 100", () => {
    const s = initialState(1, S);
    const correct = s.questions[0]!.correct;
    const s2 = reducer(reducer(s, { type:"select", choice:correct }), { type:"submit" });
    expect(s2.score).toBeGreaterThan(100);
  });
  it("isTerminal null during play, non-null when done", () => {
    let s = initialState(1, S);
    expect(isTerminal(s)).toBeNull();
    for(let i=0;i<10;i++){ s=reducer(s,{type:"select",choice:0}); s=reducer(s,{type:"submit"}); s=reducer(s,{type:"next"}); }
    expect(isTerminal(s)).not.toBeNull();
  });
});
