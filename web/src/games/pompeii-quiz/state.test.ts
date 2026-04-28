import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { questions: "10" as const };
describe("PompeiiQuiz", () => {
  it("creates questions", () => { const s=initialState(1,S); expect(s.questions.length).toBeGreaterThanOrEqual(1); expect(s.questions.length).toBeLessThanOrEqual(10); });
  it("starts in playing phase with timer", () => { const s=initialState(1,S); expect(s.phase).toBe("playing"); expect(s.timeLeft).toBe(15); });
  it("submit on correct awards score", () => {
    const s=initialState(1,S);
    const s2=reducer(reducer(s,{type:"select",choice:s.questions[0]!.correct}),{type:"submit"});
    expect(s2.score).toBeGreaterThanOrEqual(100);
  });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
  it("tick decrements timer", () => { const s=initialState(1,S); const s2=reducer(s,{type:"tick"}); expect(s2.timeLeft).toBeLessThanOrEqual(15); });
});
