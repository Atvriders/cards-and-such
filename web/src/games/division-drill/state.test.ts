import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s10 = { tables: "1-10" as const, questions: "10" as const };
const s12 = { tables: "1-12" as const, questions: "20" as const };

describe("DivisionDrill initialState", () => {
  it("starts with correct counts", () => {
    const s = initialState(1, s10);
    expect(s.score).toBe(0);
    expect(s.correctCount).toBe(0);
    expect(s.currentIndex).toBe(0);
    expect(s.phase).toBe("playing");
  });

  it("generates correct number of questions", () => {
    const s = initialState(1, s10);
    expect(s.questions.length).toBe(10);
  });

  it("all problems divide evenly", () => {
    const s = initialState(42, s12);
    for (const q of s.questions) {
      expect(q.dividend % q.divisor).toBe(0);
      expect(q.answer).toBe(q.dividend / q.divisor);
    }
  });

  it("same seed gives same questions", () => {
    const s1 = initialState(7, s10);
    const s2 = initialState(7, s10);
    expect(s1.questions[0]!.dividend).toBe(s2.questions[0]!.dividend);
  });
});

describe("DivisionDrill reducer", () => {
  it("type cleans non-numeric characters", () => {
    const s = initialState(1, s10);
    const s2 = reducer(s, { type: "type", text: "abc12xyz" });
    expect(s2.typed).toBe("12");
  });

  it("correct answer scores 10", () => {
    const s = initialState(1, s10);
    const answer = s.questions[0]!.answer;
    const s2 = reducer(reducer(s, { type: "type", text: String(answer) }), { type: "submit" });
    expect(s2.score).toBe(10);
    expect(s2.lastResult).toBe("correct");
  });

  it("wrong answer scores 0 and still advances", () => {
    const s = initialState(1, s10);
    const s2 = reducer(reducer(s, { type: "type", text: "9999" }), { type: "submit" });
    expect(s2.score).toBe(0);
    expect(s2.currentIndex).toBe(1);
  });

  it("game ends after all questions answered", () => {
    let s = initialState(1, s10);
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "type", text: "1" });
      s = reducer(s, { type: "submit" });
    }
    expect(s.phase).toBe("done");
  });
});

describe("DivisionDrill isTerminal", () => {
  it("null while playing", () => {
    expect(isTerminal(initialState(1, s10))).toBeNull();
  });

  it("returns score when done", () => {
    let s = initialState(1, s10);
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "type", text: String(s.questions[i]!.answer) });
      s = reducer(s, { type: "submit" });
    }
    const r = isTerminal(s);
    expect(r).not.toBeNull();
    expect(r!.score).toBe(100);
  });
});
