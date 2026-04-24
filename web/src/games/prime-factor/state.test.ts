import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const easy10 = { difficulty: "easy" as const, questions: "10" as const };
const hard20 = { difficulty: "hard" as const, questions: "20" as const };

describe("PrimeFactor initialState", () => {
  it("starts with zero score and playing phase", () => {
    const s = initialState(1, easy10);
    expect(s.score).toBe(0);
    expect(s.phase).toBe("playing");
  });

  it("generates correct number of questions", () => {
    const s = initialState(1, easy10);
    expect(s.questions.length).toBe(10);
  });

  it("same seed is deterministic", () => {
    const s1 = initialState(55, easy10);
    const s2 = initialState(55, easy10);
    expect(s1.questions[0]!.answer).toBe(s2.questions[0]!.answer);
  });

  it("all answers are actual prime factors of the number", () => {
    const s = initialState(7, hard20);
    for (const q of s.questions) {
      expect(q.number % q.answer).toBe(0);
      // verify it's prime: no factor between 2 and answer-1 divides it
      for (let d = 2; d < q.answer; d++) {
        expect(q.answer % d).not.toBe(0);
      }
    }
  });
});

describe("PrimeFactor reducer", () => {
  it("type updates typed field", () => {
    const s = initialState(1, easy10);
    const s2 = reducer(s, { type: "type", text: "2" });
    expect(s2.typed).toBe("2");
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
    const wrong = s.questions[0]!.answer + 1000;
    const s2 = reducer(reducer(s, { type: "type", text: String(wrong) }), { type: "submit" });
    expect(s2.score).toBe(0);
    expect(s2.lastResult).toBe("wrong");
  });

  it("empty submit is no-op", () => {
    const s = initialState(1, easy10);
    const s2 = reducer(s, { type: "submit" });
    expect(s2.currentIndex).toBe(0);
  });
});

describe("PrimeFactor isTerminal", () => {
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
