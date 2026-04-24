import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const sEasy15 = { rounds: "15" as const, difficulty: "easy" as const };
const sMed20  = { rounds: "20" as const, difficulty: "medium" as const };

describe("SequencePredictor initialState", () => {
  it("generates correct number of questions", () => {
    const s = initialState(1, sEasy15);
    expect(s.questions.length).toBe(15);
  });

  it("starts at index 0 with empty typed", () => {
    const s = initialState(1, sEasy15);
    expect(s.currentIndex).toBe(0);
    expect(s.typed).toBe("");
    expect(s.score).toBe(0);
    expect(s.phase).toBe("playing");
  });

  it("each question has 5 terms", () => {
    const s = initialState(42, sEasy15);
    for (const q of s.questions) {
      expect(q.terms.length).toBe(5);
    }
  });

  it("same seed yields same questions", () => {
    const s1 = initialState(77, sEasy15);
    const s2 = initialState(77, sEasy15);
    expect(s1.questions[0]!.answer).toBe(s2.questions[0]!.answer);
    expect(s1.questions[0]!.kind).toBe(s2.questions[0]!.kind);
  });

  it("20 questions setting generates 20", () => {
    const s = initialState(1, sMed20);
    expect(s.questions.length).toBe(20);
  });
});

describe("SequencePredictor reducer", () => {
  it("type updates typed field", () => {
    const s = initialState(1, sEasy15);
    const s2 = reducer(s, { type: "type", text: "42" });
    expect(s2.typed).toBe("42");
  });

  it("submit correct answer scores 10", () => {
    const s = initialState(1, sEasy15);
    const answer = s.questions[0]!.answer;
    const s2 = reducer(reducer(s, { type: "type", text: String(answer) }), { type: "submit" });
    expect(s2.score).toBe(10);
    expect(s2.correctCount).toBe(1);
    expect(s2.lastResult).toBe("correct");
  });

  it("submit wrong answer scores 0 and advances", () => {
    const s = initialState(1, sEasy15);
    const s2 = reducer(reducer(s, { type: "type", text: "99999" }), { type: "submit" });
    expect(s2.score).toBe(0);
    expect(s2.currentIndex).toBe(1);
    expect(s2.lastResult).toBe("wrong");
  });

  it("empty submit is no-op", () => {
    const s = initialState(1, sEasy15);
    const s2 = reducer(s, { type: "submit" });
    expect(s2.currentIndex).toBe(0);
  });

  it("game ends after all questions", () => {
    const s5 = { rounds: "15" as const, difficulty: "easy" as const };
    let s = initialState(1, s5);
    for (let i = 0; i < 15; i++) {
      s = reducer(s, { type: "type", text: String(s.questions[i]!.answer) });
      s = reducer(s, { type: "submit" });
    }
    expect(s.phase).toBe("done");
  });
});

describe("SequencePredictor isTerminal", () => {
  it("null while playing", () => {
    expect(isTerminal(initialState(1, sEasy15))).toBeNull();
  });

  it("returns score when done", () => {
    let s = initialState(1, sEasy15);
    for (let i = 0; i < 15; i++) {
      s = reducer(s, { type: "type", text: String(s.questions[i]!.answer) });
      s = reducer(s, { type: "submit" });
    }
    const r = isTerminal(s);
    expect(r).not.toBeNull();
    expect(r!.score).toBe(150);
  });
});
