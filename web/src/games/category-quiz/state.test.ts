import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { questionCount: "10" as const };

describe("CategoryQuiz initialState", () => {
  it("creates the correct number of questions", () => {
    const s = initialState(42, defaultSettings);
    expect(s.questions.length).toBe(10);
    expect(s.currentIndex).toBe(0);
    expect(s.score).toBe(0);
    expect(s.done).toBe(false);
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(77, defaultSettings);
    const s2 = initialState(77, defaultSettings);
    expect(s1.questions[0]!.question).toBe(s2.questions[0]!.question);
    expect(s1.questions[0]!.correctIndex).toBe(s2.questions[0]!.correctIndex);
  });

  it("each question has exactly 4 options", () => {
    const s = initialState(5, defaultSettings);
    s.questions.forEach(q => expect(q.options.length).toBe(4));
  });

  it("correct answer is among the options", () => {
    const s = initialState(5, defaultSettings);
    s.questions.forEach(q => {
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.options.length);
    });
  });
});

describe("CategoryQuiz reducer", () => {
  it("select sets selectedOption", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "select", optionIndex: 2 });
    expect(s2.selectedOption).toBe(2);
  });

  it("confirm with correct option increases score by 10", () => {
    const s = initialState(42, defaultSettings);
    const correct = s.questions[0]!.correctIndex;
    const s2 = reducer(s, { type: "select", optionIndex: correct });
    const s3 = reducer(s2, { type: "confirm" });
    expect(s3.score).toBe(10);
    expect(s3.confirmed).toBe(true);
  });

  it("confirm with wrong option does not increase score", () => {
    const s = initialState(42, defaultSettings);
    const correct = s.questions[0]!.correctIndex;
    const wrong = (correct + 1) % 4;
    const s2 = reducer(s, { type: "select", optionIndex: wrong });
    const s3 = reducer(s2, { type: "confirm" });
    expect(s3.score).toBe(0);
  });

  it("next advances to the next question", () => {
    const s = initialState(42, defaultSettings);
    const correct = s.questions[0]!.correctIndex;
    const s2 = reducer(s, { type: "select", optionIndex: correct });
    const s3 = reducer(s2, { type: "confirm" });
    const s4 = reducer(s3, { type: "next" });
    expect(s4.currentIndex).toBe(1);
    expect(s4.selectedOption).toBeNull();
    expect(s4.confirmed).toBe(false);
  });

  it("marks done after last question", () => {
    let s = initialState(42, defaultSettings);
    for (let i = 0; i < 10; i++) {
      const correct = s.questions[s.currentIndex]!.correctIndex;
      s = reducer(s, { type: "select", optionIndex: correct });
      s = reducer(s, { type: "confirm" });
      s = reducer(s, { type: "next" });
    }
    expect(s.done).toBe(true);
    expect(s.score).toBe(100);
  });
});

describe("CategoryQuiz isTerminal", () => {
  it("returns null while game is in progress", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when done is true", () => {
    const s = { ...initialState(42, defaultSettings), done: true, score: 70 };
    expect(isTerminal(s)?.score).toBe(70);
  });
});
