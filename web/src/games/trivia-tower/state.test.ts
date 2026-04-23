import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { rounds: "10" as const };

describe("TriviaTower initialState", () => {
  it("creates correct number of questions", () => {
    const s = initialState(1, defaultSettings);
    expect(s.questions.length).toBe(10);
  });

  it("starts with zero blocks", () => {
    const s = initialState(1, defaultSettings);
    expect(s.blocks).toBe(0);
    expect(s.highBlock).toBe(0);
  });

  it("starts in playing phase", () => {
    const s = initialState(1, defaultSettings);
    expect(s.phase).toBe("playing");
    expect(s.selected).toBeNull();
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(55, defaultSettings);
    const s2 = initialState(55, defaultSettings);
    expect(s1.questions.map(q => q.question)).toEqual(s2.questions.map(q => q.question));
  });

  it("each question has 4 choices", () => {
    const s = initialState(1, defaultSettings);
    for (const q of s.questions) {
      expect(q.choices.length).toBe(4);
      expect([0, 1, 2, 3]).toContain(q.correct);
    }
  });
});

describe("TriviaTower reducer - select and submit", () => {
  it("correct answer adds a block", () => {
    const s = initialState(1, defaultSettings);
    const correct = s.questions[0]!.correct;
    const s2 = reducer(s, { type: "select", choice: correct });
    const s3 = reducer(s2, { type: "submit" });
    expect(s3.blocks).toBe(1);
    expect(s3.wobble).toBe(false);
    expect(s3.highBlock).toBe(1);
  });

  it("wrong answer removes a block (from 1)", () => {
    const s = initialState(1, defaultSettings);
    const correct = s.questions[0]!.correct;
    // First get a block
    const s2 = reducer(s, { type: "select", choice: correct });
    const s3 = reducer(s2, { type: "submit" });
    const s4 = reducer(s3, { type: "next" });
    // Now get it wrong
    const wrong = (s4.questions[s4.currentIndex]!.correct + 1) % 4;
    const s5 = reducer(s4, { type: "select", choice: wrong });
    const s6 = reducer(s5, { type: "submit" });
    expect(s6.blocks).toBe(0);
    expect(s6.wobble).toBe(true);
  });

  it("wrong answer does not go below zero blocks", () => {
    const s = initialState(1, defaultSettings);
    const wrong = (s.questions[0]!.correct + 1) % 4;
    const s2 = reducer(s, { type: "select", choice: wrong });
    const s3 = reducer(s2, { type: "submit" });
    expect(s3.blocks).toBe(0);
  });

  it("highBlock tracks maximum blocks reached", () => {
    let s = initialState(1, defaultSettings);
    // Get 3 correct in a row
    for (let i = 0; i < 3; i++) {
      const correct = s.questions[s.currentIndex]!.correct;
      s = reducer(s, { type: "select", choice: correct });
      s = reducer(s, { type: "submit" });
      s = reducer(s, { type: "next" });
    }
    expect(s.highBlock).toBe(3);
    // Now get one wrong
    const wrong = (s.questions[s.currentIndex]!.correct + 1) % 4;
    s = reducer(s, { type: "select", choice: wrong });
    s = reducer(s, { type: "submit" });
    expect(s.highBlock).toBe(3); // preserved
  });
});

describe("TriviaTower reducer - next", () => {
  it("next advances to next question and resets wobble", () => {
    const s = initialState(1, defaultSettings);
    const wrong = (s.questions[0]!.correct + 1) % 4;
    const s2 = reducer(s, { type: "select", choice: wrong });
    const s3 = reducer(s2, { type: "submit" });
    expect(s3.wobble).toBe(true);
    const s4 = reducer(s3, { type: "next" });
    expect(s4.wobble).toBe(false);
    expect(s4.currentIndex).toBe(1);
  });

  it("next after last question sets done", () => {
    let s = initialState(1, { rounds: "10" });
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "select", choice: 0 });
      s = reducer(s, { type: "submit" });
      s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });
});

describe("TriviaTower isTerminal", () => {
  it("returns null during play", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when done", () => {
    let s = initialState(1, { rounds: "10" });
    for (let i = 0; i < 10; i++) {
      const correct = s.questions[s.currentIndex]!.correct;
      s = reducer(s, { type: "select", choice: correct });
      s = reducer(s, { type: "submit" });
      s = reducer(s, { type: "next" });
    }
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(0);
  });
});
