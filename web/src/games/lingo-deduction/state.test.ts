import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { questions: "10" as const };

describe("lingo-deduction", () => {
  it("creates 10 questions", () => {
    expect(initialState(1, S).questions.length).toBe(10);
  });
  it("starts in playing phase", () => {
    expect(initialState(1, S).phase).toBe("playing");
  });
  it("submit on correct awards score", () => {
    const s = initialState(1, S);
    const s2 = reducer(reducer(s, { type: "select", choice: s.questions[0]!.correct }), { type: "submit" });
    expect(s2.score).toBeGreaterThanOrEqual(100);
  });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("next advances index", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "select", choice: 0 });
    s = reducer(s, { type: "submit" });
    s = reducer(s, { type: "next" });
    expect(s.currentIndex).toBeGreaterThanOrEqual(1);
  });
});
