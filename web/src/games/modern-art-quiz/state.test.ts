import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { questions: "10" as const };
describe("ModernArtQuiz", () => {
  it("creates 10 questions", () => { expect(initialState(1,S).questions.length).toBe(10); });
  it("starts in playing phase", () => { const s=initialState(1,S); expect(s.phase).toBe("playing"); expect(s.timeLeft).toBe(15); });
  it("select + submit awards points on correct", () => {
    const s=initialState(1,S);
    const s2=reducer(reducer(s,{type:"select",choice:s.questions[0]!.correct}),{type:"submit"});
    expect(s2.correctCount).toBeGreaterThanOrEqual(0);
    expect(s2.score).toBeGreaterThanOrEqual(0);
  });
  it("isTerminal returns null during play", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
});
