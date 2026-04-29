import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { questions: "8" as const };
describe("HomonymQuiz", () => {
  it("starts with correct number of questions", () => {
    const s = initialState(1, S);
    expect(s.questions.length).toBeGreaterThanOrEqual(8);
    expect(s.currentIndex).toBe(0);
    expect(s.phase).toBe("playing");
  });
  it("selecting a choice updates selected", () => {
    const s = reducer(initialState(1, S), { type: "select", choice: 2 });
    expect(s.selected).toBe(2);
  });
  it("submitting correct answer increases score", () => {
    let s = initialState(1, S);
    const correct = s.questions[0]!.correct;
    s = reducer(s, { type: "select", choice: correct });
    s = reducer(s, { type: "submit" });
    expect(s.score).toBeGreaterThanOrEqual(100);
    expect(s.correctCount).toBeGreaterThanOrEqual(1);
    expect(s.phase).toBe("result");
  });
  it("submitting wrong answer does not award score", () => {
    let s = initialState(1, S);
    const correct = s.questions[0]!.correct;
    const wrong = (correct + 1) % 4;
    s = reducer(s, { type: "select", choice: wrong });
    s = reducer(s, { type: "submit" });
    expect(s.score).toBe(0);
    expect(s.correctCount).toBe(0);
  });
  it("next advances index or finishes", () => {
    let s = initialState(1, S);
    const correct = s.questions[0]!.correct;
    s = reducer(s, { type: "select", choice: correct });
    s = reducer(s, { type: "submit" });
    s = reducer(s, { type: "next" });
    expect(s.currentIndex === 1 || s.phase === "done").toBe(true);
  });
  it("tick decrements timeLeft", () => {
    const s = reducer(initialState(1, S), { type: "tick" });
    expect(s.timeLeft).toBe(14);
  });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
