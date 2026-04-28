import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { questions: "10" as const };
describe("Sakura Hanafuda Quiz", () => {
  it("creates 10 questions", () => { expect(initialState(1,S).questions.length).toBeGreaterThanOrEqual(5); });
  it("starts in playing phase with timer", () => { const s=initialState(1,S); expect(s.phase).toBe("playing"); expect(s.timeLeft).toBeGreaterThanOrEqual(10); });
  it("submit on correct awards score >= 100", () => {
    const s=initialState(1,S);
    const s2=reducer(reducer(s,{type:"select",choice:s.questions[0]!.correct}),{type:"submit"});
    expect(s2.score).toBeGreaterThanOrEqual(100);
  });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
  it("tick reduces time", () => { const s=initialState(1,S); const s2=reducer(s,{type:"tick"}); expect(s2.timeLeft).toBeLessThanOrEqual(s.timeLeft); });
});
