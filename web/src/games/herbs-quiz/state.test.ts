import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { questions: "10" as const };

describe("HerbsQuiz initialState", () => {
  it("creates correct number of questions", () => {
    const s = initialState(1, defaultSettings);
    expect(s.questions.length).toBe(10);
  });

  it("starts in playing phase with full timer", () => {
    const s = initialState(1, defaultSettings);
    expect(s.phase).toBe("playing");
    expect(s.timeLeft).toBe(15);
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(42, defaultSettings);
    const s2 = initialState(42, defaultSettings);
    expect(s1.questions.map(q => q.question)).toEqual(s2.questions.map(q => q.question));
  });

  it("each question has 4 choices", () => {
    const s = initialState(1, defaultSettings);
    for (const q of s.questions) {
      expect(q.choices.length).toBe(4);
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThanOrEqual(3);
    }
  });
});

describe("HerbsQuiz reducer", () => {
  it("select stores chosen index", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "select", choice: 2 });
    expect(s2.selected).toBe(2);
  });

  it("submit on correct answer awards points", () => {
    const s = initialState(1, defaultSettings);
    const correct = s.questions[0]!.correct;
    const s2 = reducer(reducer(s, { type: "select", choice: correct }), { type: "submit" });
    expect(s2.correctCount).toBe(1);
    expect(s2.score).toBeGreaterThan(100);
  });

  it("tick decrements timeLeft", () => {
    const s = initialState(1, defaultSettings);
    expect(reducer(s, { type: "tick" }).timeLeft).toBe(14);
  });

  it("next advances question index", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(reducer(reducer(s, { type: "select", choice: 0 }), { type: "submit" }), { type: "next" });
    expect(s2.currentIndex).toBe(1);
  });
});

describe("HerbsQuiz isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, defaultSettings))).toBeNull();
  });

  it("returns score when done", () => {
    let s = initialState(1, { questions: "10" });
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "select", choice: 0 });
      s = reducer(s, { type: "submit" });
      s = reducer(s, { type: "next" });
    }
    expect(isTerminal(s)).not.toBeNull();
  });
});
