import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s10d = { rounds: "10" as const, mode: "decimal" as const };
const s10e = { rounds: "10" as const, mode: "equivalent" as const };
const s10m = { rounds: "10" as const, mode: "mixed" as const };

describe("FractionMatcher initialState", () => {
  it("generates correct number of questions", () => {
    const s = initialState(1, s10d);
    expect(s.questions.length).toBe(10);
  });

  it("starts at index 0 with no selection", () => {
    const s = initialState(1, s10d);
    expect(s.currentIndex).toBe(0);
    expect(s.selected).toBeNull();
    expect(s.submitted).toBe(false);
    expect(s.score).toBe(0);
  });

  it("each question has 4 choices", () => {
    const s = initialState(42, s10m);
    for (const q of s.questions) {
      expect(q.choices.length).toBe(4);
    }
  });

  it("correct index is within range", () => {
    const s = initialState(7, s10e);
    for (const q of s.questions) {
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(4);
    }
  });

  it("same seed gives same questions", () => {
    const s1 = initialState(99, s10d);
    const s2 = initialState(99, s10d);
    expect(s1.questions[0]!.correctIndex).toBe(s2.questions[0]!.correctIndex);
  });
});

describe("FractionMatcher reducer", () => {
  it("select updates selected", () => {
    const s = initialState(1, s10d);
    const s2 = reducer(s, { type: "select", index: 2 });
    expect(s2.selected).toBe(2);
  });

  it("submit correct answer scores 10", () => {
    const s = initialState(1, s10d);
    const q = s.questions[0]!;
    const s2 = reducer(reducer(s, { type: "select", index: q.correctIndex }), { type: "submit" });
    expect(s2.score).toBe(10);
    expect(s2.correctCount).toBe(1);
    expect(s2.submitted).toBe(true);
  });

  it("submit wrong answer scores 0", () => {
    const s = initialState(1, s10d);
    const q = s.questions[0]!;
    const wrongIndex = (q.correctIndex + 1) % 4;
    const s2 = reducer(reducer(s, { type: "select", index: wrongIndex }), { type: "submit" });
    expect(s2.score).toBe(0);
    expect(s2.correctCount).toBe(0);
  });

  it("next advances to next question", () => {
    const s = initialState(1, s10d);
    const q = s.questions[0]!;
    const submitted = reducer(reducer(s, { type: "select", index: q.correctIndex }), { type: "submit" });
    const advanced = reducer(submitted, { type: "next" });
    expect(advanced.currentIndex).toBe(1);
    expect(advanced.selected).toBeNull();
    expect(advanced.submitted).toBe(false);
  });

  it("completing all questions sets phase done", () => {
    let s = initialState(1, { rounds: "10" as const, mode: "decimal" as const });
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "select", index: s.questions[i]!.correctIndex });
      s = reducer(s, { type: "submit" });
      s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });
});

describe("FractionMatcher isTerminal", () => {
  it("null while playing", () => {
    expect(isTerminal(initialState(1, s10d))).toBeNull();
  });

  it("returns score when done", () => {
    let s = initialState(1, s10d);
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
