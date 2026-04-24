import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s10 = { tables: "1-10" as const, questions: "10" as const };
const s12 = { tables: "1-12" as const, questions: "20" as const };

describe("TimesTable initialState", () => {
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

  it("same seed gives same questions", () => {
    const s1 = initialState(42, s10);
    const s2 = initialState(42, s10);
    expect(s1.questions[0]!.answer).toBe(s2.questions[0]!.answer);
  });

  it("questions are valid multiplications", () => {
    const s = initialState(7, s12);
    for (const q of s.questions) {
      expect(q.answer).toBe(q.a * q.b);
    }
  });

  it("tables 1-12 can produce larger factors", () => {
    // Check that at least one question uses a factor > 10
    const s = initialState(99, { tables: "1-12" as const, questions: "50" as const });
    const hasLarge = s.questions.some(q => q.a > 10 || q.b > 10);
    expect(hasLarge).toBe(true);
  });
});

describe("TimesTable reducer type/submit", () => {
  it("type updates typed field", () => {
    const s = initialState(1, s10);
    const s2 = reducer(s, { type: "type", text: "42" });
    expect(s2.typed).toBe("42");
  });

  it("submit correct answer scores 10 and advances", () => {
    const s = initialState(1, s10);
    const answer = s.questions[0]!.answer;
    const s2 = reducer(reducer(s, { type: "type", text: String(answer) }), { type: "submit" });
    expect(s2.score).toBe(10);
    expect(s2.correctCount).toBe(1);
    expect(s2.currentIndex).toBe(1);
    expect(s2.lastResult).toBe("correct");
  });

  it("submit wrong answer scores 0", () => {
    const s = initialState(1, s10);
    const wrong = s.questions[0]!.answer + 999;
    const s2 = reducer(reducer(s, { type: "type", text: String(wrong) }), { type: "submit" });
    expect(s2.score).toBe(0);
    expect(s2.lastResult).toBe("wrong");
  });

  it("empty submit is a no-op", () => {
    const s = initialState(1, s10);
    const s2 = reducer(s, { type: "submit" });
    expect(s2.currentIndex).toBe(0);
  });

  it("completes after all questions", () => {
    let s = initialState(1, s10);
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "type", text: String(s.questions[i]!.answer) });
      s = reducer(s, { type: "submit" });
    }
    expect(s.phase).toBe("done");
  });
});

describe("TimesTable isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState(1, s10))).toBeNull();
  });

  it("returns score when done", () => {
    let s = initialState(1, s10);
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "type", text: String(s.questions[i]!.answer) });
      s = reducer(s, { type: "submit" });
    }
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(typeof result?.score).toBe("number");
  });
});
