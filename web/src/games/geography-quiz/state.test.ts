import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const sEasy10  = { difficulty: "easy" as const,   rounds: "10" as const };
const sMed10   = { difficulty: "medium" as const,  rounds: "10" as const };
const sHard10  = { difficulty: "hard" as const,    rounds: "10" as const };

describe("GeographyQuiz initialState", () => {
  it("generates correct number of questions", () => {
    const s = initialState(1, sEasy10);
    expect(s.questions.length).toBe(10);
  });

  it("starts with no selection, score 0", () => {
    const s = initialState(1, sEasy10);
    expect(s.selected).toBeNull();
    expect(s.score).toBe(0);
    expect(s.phase).toBe("playing");
  });

  it("each question has 4 choices", () => {
    const s = initialState(42, sMed10);
    for (const q of s.questions) {
      expect(q.choices.length).toBe(4);
    }
  });

  it("correct index is in [0,3]", () => {
    const s = initialState(7, sHard10);
    for (const q of s.questions) {
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(4);
    }
  });

  it("correct answer is among choices", () => {
    const s = initialState(99, sEasy10);
    for (const q of s.questions) {
      expect(q.choices[q.correctIndex]).toBeDefined();
    }
  });

  it("same seed gives same questions", () => {
    const s1 = initialState(5, sEasy10);
    const s2 = initialState(5, sEasy10);
    expect(s1.questions[0]!.question).toBe(s2.questions[0]!.question);
  });
});

describe("GeographyQuiz reducer", () => {
  it("select updates selection", () => {
    const s = initialState(1, sEasy10);
    const s2 = reducer(s, { type: "select", index: 1 });
    expect(s2.selected).toBe(1);
  });

  it("correct answer scores 10", () => {
    const s = initialState(1, sEasy10);
    const q = s.questions[0]!;
    const s2 = reducer(reducer(s, { type: "select", index: q.correctIndex }), { type: "submit" });
    expect(s2.score).toBe(10);
    expect(s2.correctCount).toBe(1);
  });

  it("wrong answer scores 0", () => {
    const s = initialState(1, sEasy10);
    const q = s.questions[0]!;
    const wrongIndex = (q.correctIndex + 1) % 4;
    const s2 = reducer(reducer(s, { type: "select", index: wrongIndex }), { type: "submit" });
    expect(s2.score).toBe(0);
  });

  it("next advances to next question", () => {
    const s = initialState(1, sEasy10);
    const q = s.questions[0]!;
    const sub = reducer(reducer(s, { type: "select", index: q.correctIndex }), { type: "submit" });
    const next = reducer(sub, { type: "next" });
    expect(next.currentIndex).toBe(1);
    expect(next.selected).toBeNull();
  });

  it("completes after all questions", () => {
    let s = initialState(1, sEasy10);
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "select", index: s.questions[i]!.correctIndex });
      s = reducer(s, { type: "submit" });
      s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });
});

describe("GeographyQuiz isTerminal", () => {
  it("null while playing", () => {
    expect(isTerminal(initialState(1, sEasy10))).toBeNull();
  });

  it("returns score when done", () => {
    let s = initialState(1, sEasy10);
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "select", index: s.questions[i]!.correctIndex });
      s = reducer(s, { type: "submit" });
      s = reducer(s, { type: "next" });
    }
    const r = isTerminal(s);
    expect(r).not.toBeNull();
    expect(r!.score).toBe(100);
  });
});
