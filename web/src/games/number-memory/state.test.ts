import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const easy = { difficulty: "3" as const };
const hard = { difficulty: "7" as const };

describe("NumberMemory initialState", () => {
  it("starts in idle phase", () => {
    const s = initialState(42, easy);
    expect(s.phase).toBe("idle");
    expect(s.round).toBe(0);
    expect(s.score).toBe(0);
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(99, easy);
    const s2 = initialState(99, easy);
    expect(s1.rngSeed).toBe(s2.rngSeed);
    expect(s1.rngCounter).toBe(s2.rngCounter);
  });
});

describe("NumberMemory start", () => {
  it("transitions to showing with correct digit count", () => {
    const s = initialState(42, easy);
    const s2 = reducer(s, { type: "start" });
    expect(s2.phase).toBe("showing");
    expect(s2.currentNumber.length).toBe(3);
    expect(s2.round).toBe(1);
  });

  it("hard difficulty generates 7-digit number", () => {
    const s = initialState(42, hard);
    const s2 = reducer(s, { type: "start" });
    expect(s2.currentNumber.length).toBe(7);
    // First digit should be 1-9
    expect(parseInt(s2.currentNumber[0]!, 10)).toBeGreaterThanOrEqual(1);
  });

  it("same seed same sequence", () => {
    const start = (seed: number) => {
      const s = initialState(seed, easy);
      return reducer(s, { type: "start" }).currentNumber;
    };
    expect(start(10)).toBe(start(10));
    expect(start(10)).not.toBe(start(11)); // very likely different
  });

  it("does not start when already in showing phase", () => {
    const s = initialState(42, easy);
    const s2 = reducer(s, { type: "start" });
    const s3 = reducer(s2, { type: "start" }); // no-op
    expect(s3.round).toBe(1);
  });
});

describe("NumberMemory reveal and input", () => {
  it("reveal transitions from showing to input", () => {
    const s = initialState(42, easy);
    const s2 = reducer(s, { type: "start" });
    const s3 = reducer(s2, { type: "reveal" });
    expect(s3.phase).toBe("input");
    expect(s3.playerInput).toBe("");
  });

  it("type-digit appends to playerInput", () => {
    let s = initialState(42, easy);
    s = reducer(s, { type: "start" });
    s = reducer(s, { type: "reveal" });
    s = reducer(s, { type: "type-digit", digit: "5" });
    expect(s.playerInput).toBe("5");
    s = reducer(s, { type: "type-digit", digit: "3" });
    expect(s.playerInput).toBe("53");
  });

  it("backspace removes last digit", () => {
    let s = initialState(42, easy);
    s = reducer(s, { type: "start" });
    s = reducer(s, { type: "reveal" });
    s = reducer(s, { type: "type-digit", digit: "5" });
    s = reducer(s, { type: "type-digit", digit: "3" });
    s = reducer(s, { type: "backspace" });
    expect(s.playerInput).toBe("5");
  });

  it("type-digit is no-op when not in input phase", () => {
    const s = initialState(42, easy);
    const s2 = reducer(s, { type: "type-digit", digit: "5" });
    expect(s2.playerInput).toBe("");
  });
});

describe("NumberMemory submit", () => {
  function reachInput(seed: number) {
    let s = initialState(seed, easy);
    s = reducer(s, { type: "start" });
    const num = s.currentNumber;
    s = reducer(s, { type: "reveal" });
    return { s, num };
  }

  it("correct answer marks lastCorrect=true and awards points", () => {
    const { s, num } = reachInput(42);
    let cur = s;
    for (const d of num) cur = reducer(cur, { type: "type-digit", digit: d });
    cur = reducer(cur, { type: "submit" });
    expect(cur.phase).toBe("result");
    expect(cur.lastCorrect).toBe(true);
    expect(cur.score).toBeGreaterThan(0);
    expect(cur.correctStreak).toBe(1);
  });

  it("wrong answer marks lastCorrect=false and scores 0", () => {
    const { s, num } = reachInput(42);
    let cur = s;
    // Type wrong number (shift each digit by 1)
    const wrong = num.split("").map((d) => String((parseInt(d, 10) + 1) % 10));
    for (const d of wrong) cur = reducer(cur, { type: "type-digit", digit: d });
    cur = reducer(cur, { type: "submit" });
    expect(cur.phase).toBe("result");
    expect(cur.lastCorrect).toBe(false);
    expect(cur.correctStreak).toBe(0);
  });

  it("submit is no-op if input incomplete", () => {
    const { s } = reachInput(42);
    const cur = reducer(s, { type: "submit" });
    expect(cur.phase).toBe("input");
  });
});

describe("NumberMemory progression", () => {
  it("game ends after maxRound rounds", () => {
    let s = initialState(42, easy);
    s = reducer(s, { type: "start" });
    for (let i = 0; i < s.maxRound; i++) {
      const num = s.currentNumber;
      s = reducer(s, { type: "reveal" });
      for (const d of num) s = reducer(s, { type: "type-digit", digit: d });
      s = reducer(s, { type: "submit" });
      s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });

  it("isTerminal returns score when done", () => {
    let s = initialState(42, easy);
    s = reducer(s, { type: "start" });
    for (let i = 0; i < s.maxRound; i++) {
      const num = s.currentNumber;
      s = reducer(s, { type: "reveal" });
      for (const d of num) s = reducer(s, { type: "type-digit", digit: d });
      s = reducer(s, { type: "submit" });
      s = reducer(s, { type: "next" });
    }
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(0);
  });

  it("isTerminal returns null when not done", () => {
    const s = initialState(42, easy);
    expect(isTerminal(s)).toBeNull();
  });

  it("bestStreak tracks longest correct streak", () => {
    let s = initialState(42, easy);
    s = reducer(s, { type: "start" });
    // First round correct
    const num1 = s.currentNumber;
    s = reducer(s, { type: "reveal" });
    for (const d of num1) s = reducer(s, { type: "type-digit", digit: d });
    s = reducer(s, { type: "submit" });
    expect(s.correctStreak).toBe(1);
    expect(s.bestStreak).toBe(1);
    s = reducer(s, { type: "next" });
    // Second round wrong
    s = reducer(s, { type: "reveal" });
    const wrong = s.currentNumber.split("").map((d) => String((parseInt(d, 10) + 1) % 10));
    for (const d of wrong) s = reducer(s, { type: "type-digit", digit: d });
    s = reducer(s, { type: "submit" });
    expect(s.correctStreak).toBe(0);
    expect(s.bestStreak).toBe(1); // bestStreak preserved
  });
});
