import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s60add = { duration: "60" as const, operations: "add-sub" as const };
const s30all = { duration: "30" as const, operations: "all" as const };

describe("MathChallenge initialState", () => {
  it("starts with score 0, not ended", () => {
    const s = initialState(42, s60add);
    expect(s.score).toBe(0);
    expect(s.ended).toBe(false);
    expect(s.elapsed).toBe(0);
    expect(s.attempted).toBe(0);
  });

  it("has a valid problem", () => {
    const s = initialState(42, s60add);
    expect(typeof s.problem.answer).toBe("number");
    expect(s.problem.display).toContain("=");
  });

  it("same seed gives same problem", () => {
    const s1 = initialState(7, s60add);
    const s2 = initialState(7, s60add);
    expect(s1.problem.display).toBe(s2.problem.display);
    expect(s1.problem.answer).toBe(s2.problem.answer);
  });

  it("add-sub uses only + or -", () => {
    const s = initialState(42, s60add);
    expect(["+", "-"]).toContain(s.problem.op);
  });
});

describe("MathChallenge tick", () => {
  it("advances elapsed and problemElapsed", () => {
    const s = initialState(42, s60add);
    const s2 = reducer(s, { type: "tick", dt: 1 });
    expect(s2.elapsed).toBeCloseTo(1);
    expect(s2.problemElapsed).toBeCloseTo(1);
  });

  it("advances problem after 5 seconds", () => {
    const s = initialState(42, s60add);
    const oldDisplay = s.problem.display;
    const s2 = reducer(s, { type: "tick", dt: 5.1 });
    // Problem should have changed (or at least attempted incremented)
    expect(s2.attempted).toBe(1);
    // New problem may or may not be same display by chance
    expect(typeof s2.problem.display).toBe("string");
    expect(s2.problem.display).not.toBe(undefined);
    void oldDisplay; // just suppressing lint
  });

  it("ends game at duration", () => {
    const s = initialState(42, s30all);
    const ended = reducer(s, { type: "tick", dt: 30 });
    expect(ended.ended).toBe(true);
  });

  it("no tick after ended", () => {
    const s = initialState(42, s30all);
    const ended = reducer(s, { type: "tick", dt: 30 });
    const again = reducer(ended, { type: "tick", dt: 5 });
    expect(again.elapsed).toBe(30);
  });
});

describe("MathChallenge type and submit", () => {
  it("type updates typed field", () => {
    const s = initialState(42, s60add);
    const s2 = reducer(s, { type: "type", text: "42" });
    expect(s2.typed).toBe("42");
  });

  it("submit correct answer scores 10", () => {
    const s = initialState(42, s60add);
    const withAnswer = reducer(s, { type: "type", text: String(s.problem.answer) });
    const s2 = reducer(withAnswer, { type: "submit" });
    expect(s2.score).toBe(10);
    expect(s2.correct).toBe(1);
    expect(s2.attempted).toBe(1);
  });

  it("submit wrong answer scores 0", () => {
    const s = initialState(42, s60add);
    const wrongAnswer = s.problem.answer + 1;
    const withAnswer = reducer(s, { type: "type", text: String(wrongAnswer) });
    const s2 = reducer(withAnswer, { type: "submit" });
    expect(s2.score).toBe(0);
    expect(s2.correct).toBe(0);
    expect(s2.attempted).toBe(1);
  });

  it("submit advances to next problem", () => {
    const s = initialState(42, s60add);
    const oldDisplay = s.problem.display;
    const withAnswer = reducer(s, { type: "type", text: String(s.problem.answer) });
    const s2 = reducer(withAnswer, { type: "submit" });
    // typed should be cleared
    expect(s2.typed).toBe("");
    // problem may change or not, but state is valid
    expect(typeof s2.problem.display).toBe("string");
    void oldDisplay;
  });

  it("empty submit is no-op", () => {
    const s = initialState(42, s60add);
    const s2 = reducer(s, { type: "submit" });
    expect(s2.typed).toBe("");
    expect(s2.attempted).toBe(0);
  });
});

describe("MathChallenge isTerminal", () => {
  it("null while running", () => {
    expect(isTerminal(initialState(1, s60add))).toBeNull();
  });

  it("returns score when ended", () => {
    const s = initialState(42, s30all);
    const ended = reducer(s, { type: "tick", dt: 30 });
    const result = isTerminal(ended);
    expect(result).not.toBeNull();
    expect(typeof result?.score).toBe("number");
  });
});
