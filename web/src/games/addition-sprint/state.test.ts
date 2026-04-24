import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const easy10 = { difficulty: "easy" as const, questions: "10" as const };
const hard50 = { difficulty: "hard" as const, questions: "50" as const };

describe("AdditionSprint initialState", () => {
  it("starts with zero score and playing phase", () => {
    const s = initialState(1, easy10);
    expect(s.score).toBe(0);
    expect(s.correctCount).toBe(0);
    expect(s.currentIndex).toBe(0);
    expect(s.phase).toBe("playing");
  });

  it("generates the correct number of questions", () => {
    const s = initialState(1, easy10);
    expect(s.questions.length).toBe(10);
  });

  it("same seed produces same questions (deterministic)", () => {
    const s1 = initialState(42, easy10);
    const s2 = initialState(42, easy10);
    expect(s1.questions[0]!.answer).toBe(s2.questions[0]!.answer);
  });

  it("answers equal a + b for every question", () => {
    const s = initialState(7, hard50);
    for (const q of s.questions) {
      expect(q.answer).toBe(q.a + q.b);
    }
  });
});

describe("AdditionSprint reducer", () => {
  it("type updates typed field", () => {
    const s = initialState(1, easy10);
    const s2 = reducer(s, { type: "type", text: "15" });
    expect(s2.typed).toBe("15");
  });

  it("submit correct answer scores 10 and advances", () => {
    const s = initialState(1, easy10);
    const answer = s.questions[0]!.answer;
    const s2 = reducer(reducer(s, { type: "type", text: String(answer) }), { type: "submit" });
    expect(s2.score).toBe(10);
    expect(s2.correctCount).toBe(1);
    expect(s2.currentIndex).toBe(1);
    expect(s2.lastResult).toBe("correct");
  });

  it("submit wrong answer scores 0", () => {
    const s = initialState(1, easy10);
    const wrong = s.questions[0]!.answer + 999;
    const s2 = reducer(reducer(s, { type: "type", text: String(wrong) }), { type: "submit" });
    expect(s2.score).toBe(0);
    expect(s2.lastResult).toBe("wrong");
  });

  it("empty typed is a no-op on submit", () => {
    const s = initialState(1, easy10);
    const s2 = reducer(s, { type: "submit" });
    expect(s2.currentIndex).toBe(0);
  });
});

describe("AdditionSprint isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState(1, easy10))).toBeNull();
  });

  it("returns score object when all questions answered", () => {
    let s = initialState(1, easy10);
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "type", text: String(s.questions[i]!.answer) });
      s = reducer(s, { type: "submit" });
    }
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(100);
  });
});
