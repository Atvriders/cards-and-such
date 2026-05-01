import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_QUESTIONS } from "./state.js";

const S = { dummy: false };

describe("avalon-quiz", () => {
  it("starts at first question", () => {
    const s = initialState(1, S);
    expect(s.current).toBe(0);
    expect(s.phase).toBe("ask");
    expect(s.questions.length).toBeGreaterThanOrEqual(1);
  });
  it("answering goes to feedback", () => {
    const s0 = initialState(1, S);
    const s1 = reducer(s0, { type: "answer", choice: 0, elapsedMs: 0 });
    expect(s1.phase).toBe("feedback");
  });
  it("next advances current", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "answer", choice: 0, elapsedMs: 0 });
    s = reducer(s, { type: "next" });
    expect(s.current).toBe(1);
  });
  it("isTerminal null until done", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("scoring correct yields >= 10 points", () => {
    const s0 = initialState(1, S);
    const correctIdx = s0.questions[0]!.answer;
    const s1 = reducer(s0, { type: "answer", choice: correctIdx, elapsedMs: 0 });
    expect(s1.score).toBeGreaterThanOrEqual(10);
  });
  it("completing all questions terminates", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
      s = reducer(s, { type: "answer", choice: 0, elapsedMs: 0 });
      s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
});
