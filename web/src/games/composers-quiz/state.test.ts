import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { questions: "10" as const };

describe("ComposersQuiz initialState", () => {
  it("creates correct number of questions", () => {
    expect(initialState(1, defaultSettings).questions.length).toBe(10);
  });
  it("starts in playing phase", () => {
    const s = initialState(1, defaultSettings);
    expect(s.phase).toBe("playing");
    expect(s.timeLeft).toBe(15);
  });
  it("is deterministic", () => {
    const s1 = initialState(7, defaultSettings);
    const s2 = initialState(7, defaultSettings);
    expect(s1.questions[0]!.question).toBe(s2.questions[0]!.question);
  });
  it("each question has 4 choices", () => {
    for (const q of initialState(1, defaultSettings).questions) {
      expect(q.choices.length).toBe(4);
    }
  });
});

describe("ComposersQuiz reducer", () => {
  it("select stores choice", () => {
    expect(reducer(initialState(1, defaultSettings), { type: "select", choice: 1 }).selected).toBe(1);
  });
  it("submit on correct awards points", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(reducer(s, { type: "select", choice: s.questions[0]!.correct }), { type: "submit" });
    expect(s2.correctCount).toBe(1);
  });
  it("tick decrements timer", () => {
    expect(reducer(initialState(1, defaultSettings), { type: "tick" }).timeLeft).toBe(14);
  });
  it("next advances index", () => {
    let s = initialState(1, defaultSettings);
    s = reducer(s, { type: "select", choice: 0 });
    s = reducer(s, { type: "submit" });
    s = reducer(s, { type: "next" });
    expect(s.currentIndex).toBe(1);
  });
});

describe("ComposersQuiz isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(1, defaultSettings))).toBeNull();
  });
  it("score when done", () => {
    let s = initialState(1, { questions: "10" });
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "select", choice: 0 });
      s = reducer(s, { type: "submit" });
      s = reducer(s, { type: "next" });
    }
    expect(isTerminal(s)).not.toBeNull();
  });
});
