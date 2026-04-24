import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const sNS10 = { mode: "name-to-symbol" as const, rounds: "10" as const };
const sSN10 = { mode: "symbol-to-name" as const, rounds: "10" as const };
const sMix20 = { mode: "mixed" as const, rounds: "20" as const };

describe("ChemistryQuiz initialState", () => {
  it("generates correct number of questions", () => {
    const s = initialState(1, sNS10);
    expect(s.questions.length).toBe(10);
  });

  it("starts with no selection, score 0", () => {
    const s = initialState(1, sNS10);
    expect(s.selected).toBeNull();
    expect(s.score).toBe(0);
    expect(s.phase).toBe("playing");
  });

  it("each question has 4 choices", () => {
    const s = initialState(42, sMix20);
    for (const q of s.questions) {
      expect(q.choices.length).toBe(4);
    }
  });

  it("correct index is in [0,3]", () => {
    const s = initialState(7, sSN10);
    for (const q of s.questions) {
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(4);
    }
  });

  it("name-to-symbol mode asks for symbol", () => {
    const s = initialState(1, sNS10);
    for (const q of s.questions) {
      expect(q.question).toContain("symbol for");
    }
  });

  it("symbol-to-name mode asks for name", () => {
    const s = initialState(1, sSN10);
    for (const q of s.questions) {
      expect(q.question).toContain("belongs to");
    }
  });

  it("same seed gives same questions", () => {
    const s1 = initialState(55, sNS10);
    const s2 = initialState(55, sNS10);
    expect(s1.questions[0]!.question).toBe(s2.questions[0]!.question);
    expect(s1.questions[0]!.correctIndex).toBe(s2.questions[0]!.correctIndex);
  });

  it("generates 20 questions for mixed mode", () => {
    const s = initialState(1, sMix20);
    expect(s.questions.length).toBe(20);
  });
});

describe("ChemistryQuiz reducer", () => {
  it("select updates selection", () => {
    const s = initialState(1, sNS10);
    const s2 = reducer(s, { type: "select", index: 3 });
    expect(s2.selected).toBe(3);
  });

  it("correct answer scores 10", () => {
    const s = initialState(1, sNS10);
    const q = s.questions[0]!;
    const s2 = reducer(reducer(s, { type: "select", index: q.correctIndex }), { type: "submit" });
    expect(s2.score).toBe(10);
    expect(s2.correctCount).toBe(1);
  });

  it("wrong answer scores 0", () => {
    const s = initialState(1, sNS10);
    const q = s.questions[0]!;
    const wrongIndex = (q.correctIndex + 1) % 4;
    const s2 = reducer(reducer(s, { type: "select", index: wrongIndex }), { type: "submit" });
    expect(s2.score).toBe(0);
  });

  it("next advances index and clears selection", () => {
    const s = initialState(1, sNS10);
    const q = s.questions[0]!;
    const sub = reducer(reducer(s, { type: "select", index: q.correctIndex }), { type: "submit" });
    const next = reducer(sub, { type: "next" });
    expect(next.currentIndex).toBe(1);
    expect(next.selected).toBeNull();
    expect(next.submitted).toBe(false);
  });

  it("game ends after all questions", () => {
    let s = initialState(1, sNS10);
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "select", index: s.questions[i]!.correctIndex });
      s = reducer(s, { type: "submit" });
      s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });
});

describe("ChemistryQuiz isTerminal", () => {
  it("null while playing", () => {
    expect(isTerminal(initialState(1, sNS10))).toBeNull();
  });

  it("returns score when done", () => {
    let s = initialState(1, sNS10);
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
