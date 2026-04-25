import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { questions: "10" as const };

describe("MoviesTrivia initialState", () => {
  it("creates the correct number of questions", () => {
    const s = initialState(1, defaultSettings);
    expect(s.questions.length).toBe(10);
  });

  it("starts at index 0 with full timer and playing phase", () => {
    const s = initialState(1, defaultSettings);
    expect(s.currentIndex).toBe(0);
    expect(s.timeLeft).toBe(15);
    expect(s.selected).toBeNull();
    expect(s.phase).toBe("playing");
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(42, defaultSettings);
    const s2 = initialState(42, defaultSettings);
    expect(s1.questions.map(q => q.question)).toEqual(s2.questions.map(q => q.question));
  });

  it("produces different questions for different seeds", () => {
    const s1 = initialState(1, defaultSettings);
    const s2 = initialState(99, defaultSettings);
    expect(s1.questions.map(q => q.question)).not.toEqual(s2.questions.map(q => q.question));
  });

  it("each question has 4 choices", () => {
    const s = initialState(1, defaultSettings);
    for (const q of s.questions) {
      expect(q.choices.length).toBe(4);
    }
  });

  it("correct index is within 0-3", () => {
    const s = initialState(1, defaultSettings);
    for (const q of s.questions) {
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThanOrEqual(3);
    }
  });
});

describe("MoviesTrivia reducer", () => {
  it("select stores chosen index", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "select", choice: 2 });
    expect(s2.selected).toBe(2);
  });

  it("submit scores correct answer with bonus", () => {
    const s = initialState(1, defaultSettings);
    const correct = s.questions[0]!.correct;
    const s2 = reducer(s, { type: "select", choice: correct });
    const s3 = reducer(s2, { type: "submit" });
    expect(s3.score).toBeGreaterThan(100);
    expect(s3.correctCount).toBe(1);
    expect(s3.phase).toBe("result");
  });

  it("submit scores 0 for wrong answer", () => {
    const s = initialState(1, defaultSettings);
    const correct = s.questions[0]!.correct;
    const wrong = (correct + 1) % 4;
    const s2 = reducer(s, { type: "select", choice: wrong });
    const s3 = reducer(s2, { type: "submit" });
    expect(s3.score).toBe(0);
    expect(s3.correctCount).toBe(0);
  });

  it("cannot submit without selection", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "submit" });
    expect(s2.phase).toBe("playing");
  });

  it("tick decrements timeLeft", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.timeLeft).toBe(14);
  });

  it("tick to zero auto-submits", () => {
    let s = initialState(1, defaultSettings);
    for (let i = 0; i < 15; i++) s = reducer(s, { type: "tick" });
    expect(s.phase).toBe("result");
    expect(s.timeLeft).toBe(0);
  });

  it("next advances question and resets timer", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "select", choice: 0 });
    const s3 = reducer(s2, { type: "submit" });
    const s4 = reducer(s3, { type: "next" });
    expect(s4.currentIndex).toBe(1);
    expect(s4.timeLeft).toBe(15);
    expect(s4.selected).toBeNull();
  });

  it("next on last question sets phase to done", () => {
    let s = initialState(1, { questions: "10" });
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "select", choice: 0 });
      s = reducer(s, { type: "submit" });
      s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });
});

describe("MoviesTrivia isTerminal", () => {
  it("returns null during play", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score object when done", () => {
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
