import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const easy10 = { difficulty: "easy" as const, questions: "10" as const };
const hard50 = { difficulty: "hard" as const, questions: "50" as const };

describe("SubtractionSprint initialState", () => {
  it("starts with zero score and playing phase", () => {
    const s = initialState(1, easy10);
    expect(s.score).toBe(0);
    expect(s.correctCount).toBe(0);
    expect(s.phase).toBe("playing");
  });

  it("generates correct number of questions", () => {
    const s = initialState(1, easy10);
    expect(s.questions.length).toBe(10);
  });

  it("same seed gives same questions (deterministic)", () => {
    const s1 = initialState(42, easy10);
    const s2 = initialState(42, easy10);
    expect(s1.questions[0]!.answer).toBe(s2.questions[0]!.answer);
  });

  it("answer equals a - b and is non-negative", () => {
    const s = initialState(7, hard50);
    for (const q of s.questions) {
      expect(q.answer).toBe(q.a - q.b);
      expect(q.answer).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("SubtractionSprint reducer", () => {
  it("type updates typed field", () => {
    const s = initialState(1, easy10);
    const s2 = reducer(s, { type: "type", text: "5" });
    expect(s2.typed).toBe("5");
  });

  it("correct answer scores 10", () => {
    const s = initialState(1, easy10);
    const answer = s.questions[0]!.answer;
    const s2 = reducer(reducer(s, { type: "type", text: String(answer) }), { type: "submit" });
    expect(s2.score).toBe(10);
    expect(s2.lastResult).toBe("correct");
  });

  it("wrong answer scores 0", () => {
    const s = initialState(1, easy10);
    const wrong = s.questions[0]!.answer + 999;
    const s2 = reducer(reducer(s, { type: "type", text: String(wrong) }), { type: "submit" });
    expect(s2.score).toBe(0);
    expect(s2.lastResult).toBe("wrong");
  });

  it("empty submit is a no-op", () => {
    const s = initialState(1, easy10);
    const s2 = reducer(s, { type: "submit" });
    expect(s2.currentIndex).toBe(0);
  });
});

describe("SubtractionSprint isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState(1, easy10))).toBeNull();
  });

  it("returns score when done", () => {
    let s = initialState(1, easy10);
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "type", text: String(s.questions[i]!.answer) });
      s = reducer(s, { type: "submit" });
    }
    expect(isTerminal(s)).not.toBeNull();
    expect(isTerminal(s)!.score).toBe(100);
  });
});
