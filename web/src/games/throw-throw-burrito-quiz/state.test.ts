import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, QUESTIONS } from "./state.js";

const S = { rounds: "10" as const };

describe("Throw Throw Burrito Quiz", () => {
  it("initial state has 10 questions", () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(10);
    const s = initialState(1, S);
    expect(s.score).toBe(0);
    expect(s.phase).toBe("ready");
  });
  it("deterministic init", () => { expect(initialState(2, S)).toEqual(initialState(2, S)); });
  it("answer correct increases score", () => {
    const s = initialState(1, S);
    const qi = s.order[0]!;
    const correct = QUESTIONS[qi]!.c;
    const s2 = reducer(s, { type: "answer", choice: correct });
    expect(s2.score).toBeGreaterThanOrEqual(100);
    expect(s2.phase).toBe("answered");
  });
  it("answer wrong does not increase score", () => {
    const s = initialState(1, S);
    const qi = s.order[0]!;
    const correct = QUESTIONS[qi]!.c;
    const wrong = (correct + 1) % 4;
    const s2 = reducer(s, { type: "answer", choice: wrong });
    expect(s2.score).toBe(0);
  });
  it("next advances index", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "answer", choice: 0 });
    const s3 = reducer(s2, { type: "next" });
    expect(s3.index).toBe(1);
    expect(s3.phase).toBe("ready");
  });
  it("isTerminal null until done", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
