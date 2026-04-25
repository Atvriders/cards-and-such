import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { questionCount: "5" as const };

describe("DrinksQuiz", () => {
  it("creates correct number of entries", () => {
    const s = initialState(42, S);
    expect(s.entries.length).toBe(5);
    expect(s.done).toBe(false);
  });
  it("each entry has 4 choices including the answer", () => {
    const s = initialState(7, S);
    for (const e of s.entries) { expect(e.choices.length).toBe(4); expect(e.choices).toContain(e.answer); }
  });
  it("correct answer adds 10 points", () => {
    const s = initialState(42, S);
    const idx = s.entries[0]!.choices.indexOf(s.entries[0]!.answer);
    expect(reducer(s, { type: "select", index: idx }).score).toBe(10);
  });
  it("isTerminal after all questions", () => {
    let s = initialState(1, S);
    for (let i = 0; i < 5; i++) { s = reducer(s, { type: "select", index: 0 }); s = reducer(s, { type: "next" }); }
    expect(isTerminal(s)).not.toBeNull();
  });
});
