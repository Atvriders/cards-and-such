import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s15all  = { rounds: "15" as const, category: "all" as const };
const s15len  = { rounds: "15" as const, category: "length" as const };
const s15temp = { rounds: "15" as const, category: "temperature" as const };

describe("UnitConverterQuiz initialState", () => {
  it("generates correct number of questions", () => {
    const s = initialState(1, s15all);
    expect(s.questions.length).toBe(15);
  });

  it("starts with no selection, score 0", () => {
    const s = initialState(1, s15all);
    expect(s.selected).toBeNull();
    expect(s.score).toBe(0);
    expect(s.phase).toBe("playing");
  });

  it("each question has 4 choices", () => {
    const s = initialState(42, s15all);
    for (const q of s.questions) {
      expect(q.choices.length).toBe(4);
    }
  });

  it("same seed gives same questions", () => {
    const s1 = initialState(7, s15len);
    const s2 = initialState(7, s15len);
    expect(s1.questions[0]!.question).toBe(s2.questions[0]!.question);
  });

  it("temperature filter only produces temperature questions", () => {
    const s = initialState(3, s15temp);
    for (const q of s.questions) {
      expect(q.category).toBe("temperature");
    }
  });
});

describe("UnitConverterQuiz reducer", () => {
  it("select highlights a choice", () => {
    const s = initialState(1, s15all);
    const s2 = reducer(s, { type: "select", index: 2 });
    expect(s2.selected).toBe(2);
  });

  it("submit correct answer scores 10", () => {
    const s = initialState(1, s15all);
    const q = s.questions[0]!;
    const s2 = reducer(reducer(s, { type: "select", index: q.correctIndex }), { type: "submit" });
    expect(s2.score).toBe(10);
    expect(s2.correctCount).toBe(1);
  });

  it("submit wrong answer scores 0", () => {
    const s = initialState(1, s15all);
    const q = s.questions[0]!;
    const wrongIndex = (q.correctIndex + 1) % 4;
    const s2 = reducer(reducer(s, { type: "select", index: wrongIndex }), { type: "submit" });
    expect(s2.score).toBe(0);
  });

  it("next advances index and resets selection", () => {
    const s = initialState(1, s15all);
    const q = s.questions[0]!;
    const submitted = reducer(reducer(s, { type: "select", index: q.correctIndex }), { type: "submit" });
    const next = reducer(submitted, { type: "next" });
    expect(next.currentIndex).toBe(1);
    expect(next.selected).toBeNull();
    expect(next.submitted).toBe(false);
  });

  it("completing all rounds sets phase to done", () => {
    let s = initialState(1, { rounds: "15" as const, category: "all" as const });
    for (let i = 0; i < 15; i++) {
      s = reducer(s, { type: "select", index: s.questions[i]!.correctIndex });
      s = reducer(s, { type: "submit" });
      s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });
});

describe("UnitConverterQuiz isTerminal", () => {
  it("null while playing", () => {
    expect(isTerminal(initialState(1, s15all))).toBeNull();
  });

  it("returns score when done", () => {
    let s = initialState(1, s15all);
    for (let i = 0; i < 15; i++) {
      s = reducer(s, { type: "select", index: s.questions[i]!.correctIndex });
      s = reducer(s, { type: "submit" });
      s = reducer(s, { type: "next" });
    }
    const r = isTerminal(s);
    expect(r).not.toBeNull();
    expect(r!.score).toBe(150);
  });
});
