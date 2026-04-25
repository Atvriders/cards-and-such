import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { questions: "10" as const };

describe("TreesQuiz initialState", () => {
  it("creates correct number of questions", () => {
    const s = initialState(1, defaultSettings);
    expect(s.questions.length).toBe(10);
  });

  it("starts in playing phase with full timer", () => {
    const s = initialState(1, defaultSettings);
    expect(s.phase).toBe("playing");
    expect(s.timeLeft).toBe(15);
    expect(s.currentIndex).toBe(0);
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(42, defaultSettings);
    const s2 = initialState(42, defaultSettings);
    expect(s1.questions.map(q => q.question)).toEqual(s2.questions.map(q => q.question));
  });

  it("each question has 4 choices with correct index 0-3", () => {
    const s = initialState(1, defaultSettings);
    for (const q of s.questions) {
      expect(q.choices.length).toBe(4);
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThanOrEqual(3);
    }
  });
});

describe("TreesQuiz reducer", () => {
  it("select stores the chosen index", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "select", choice: 2 });
    expect(s2.selected).toBe(2);
  });

  it("submit on correct answer awards points", () => {
    const s = initialState(1, defaultSettings);
    const correct = s.questions[0]!.correct;
    const s2 = reducer(s, { type: "select", choice: correct });
    const s3 = reducer(s2, { type: "submit" });
    expect(s3.correctCount).toBe(1);
    expect(s3.score).toBeGreaterThan(100);
  });

  it("tick decrements timeLeft", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.timeLeft).toBe(14);
  });

  it("next advances to next question", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "select", choice: 0 });
    const s3 = reducer(s2, { type: "submit" });
    const s4 = reducer(s3, { type: "next" });
    expect(s4.currentIndex).toBe(1);
    expect(s4.selected).toBeNull();
  });
});

describe("TreesQuiz isTerminal", () => {
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
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(typeof result!.score).toBe("number");
  });
});
