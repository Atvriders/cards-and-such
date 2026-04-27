import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_QUESTIONS, TIME_LIMIT } from "./state.js";
const S = { dummy: false };
describe("DivisionRace", () => {
  it("starts in playing with full time and 20 questions", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.timeLeft).toBe(TIME_LIMIT);
    expect(s.questions.length).toBe(TOTAL_QUESTIONS);
  });
  it("correct answer scores 10", () => {
    const s = initialState(1, S);
    const q = s.questions[0]!;
    const s2 = reducer(s, { type: "answer", choice: q.correct });
    expect(s2.score).toBeGreaterThanOrEqual(10);
  });
  it("tick reduces time", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.timeLeft).toBe(TIME_LIMIT - 1);
  });
  it("question correct answer is the actual quotient", () => {
    const s = initialState(1, S);
    const q = s.questions[0]!;
    expect(q.choices[q.correct]).toBe(q.a / q.b);
  });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
