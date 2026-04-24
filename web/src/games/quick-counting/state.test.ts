import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const easy = { difficulty: "easy" as const };
const hard = { difficulty: "hard" as const };

describe("QuickCounting initialState", () => {
  it("starts idle", () => {
    const s = initialState(42, easy);
    expect(s.phase).toBe("idle");
    expect(s.round).toBe(0);
    expect(s.score).toBe(0);
  });

  it("showMs matches difficulty", () => {
    const se = initialState(42, easy);
    const sh = initialState(42, hard);
    expect(se.showMs).toBeGreaterThan(sh.showMs);
  });
});

describe("QuickCounting start", () => {
  it("enters showing with valid target for easy (1-20)", () => {
    const s = initialState(42, easy);
    const s2 = reducer(s, { type: "start" });
    expect(s2.phase).toBe("showing");
    expect(s2.target).toBeGreaterThanOrEqual(1);
    expect(s2.target).toBeLessThanOrEqual(20);
    expect(s2.round).toBe(1);
  });

  it("hard target is 50-100", () => {
    const s = initialState(42, hard);
    const s2 = reducer(s, { type: "start" });
    expect(s2.target).toBeGreaterThanOrEqual(50);
    expect(s2.target).toBeLessThanOrEqual(100);
  });

  it("same seed same targets across rounds", () => {
    const targets = (seed: number) => {
      let s = initialState(seed, easy);
      const ts: number[] = [];
      s = reducer(s, { type: "start" });
      for (let i = 0; i < 5; i++) {
        ts.push(s.target);
        s = reducer(s, { type: "reveal" });
        s = reducer(s, { type: "type-digit", digit: "1" });
        s = reducer(s, { type: "submit" });
        s = reducer(s, { type: "next" });
      }
      return ts;
    };
    expect(targets(10)).toEqual(targets(10));
  });

  it("does not start when already showing", () => {
    const s = reducer(initialState(42, easy), { type: "start" });
    const s2 = reducer(s, { type: "start" });
    expect(s2.round).toBe(1);
  });
});

describe("QuickCounting reveal and input", () => {
  it("reveal transitions to input", () => {
    let s = reducer(initialState(42, easy), { type: "start" });
    s = reducer(s, { type: "reveal" });
    expect(s.phase).toBe("input");
    expect(s.playerInput).toBe("");
  });

  it("type-digit appends", () => {
    let s = reducer(initialState(42, easy), { type: "start" });
    s = reducer(s, { type: "reveal" });
    s = reducer(s, { type: "type-digit", digit: "5" });
    expect(s.playerInput).toBe("5");
  });

  it("backspace removes last digit", () => {
    let s = reducer(initialState(42, easy), { type: "start" });
    s = reducer(s, { type: "reveal" });
    s = reducer(s, { type: "type-digit", digit: "5" });
    s = reducer(s, { type: "type-digit", digit: "3" });
    s = reducer(s, { type: "backspace" });
    expect(s.playerInput).toBe("5");
  });

  it("limited to 3 digits", () => {
    let s = reducer(initialState(42, easy), { type: "start" });
    s = reducer(s, { type: "reveal" });
    for (let i = 0; i < 5; i++) s = reducer(s, { type: "type-digit", digit: "1" });
    expect(s.playerInput.length).toBe(3);
  });
});

describe("QuickCounting submit", () => {
  it("correct guess scores 10", () => {
    let s = reducer(initialState(42, easy), { type: "start" });
    const target = s.target;
    s = reducer(s, { type: "reveal" });
    for (const d of String(target)) s = reducer(s, { type: "type-digit", digit: d });
    s = reducer(s, { type: "submit" });
    expect(s.phase).toBe("result");
    expect(s.lastCorrect).toBe(true);
    expect(s.score).toBe(10);
  });

  it("wrong guess scores 0", () => {
    let s = reducer(initialState(42, easy), { type: "start" });
    const target = s.target;
    s = reducer(s, { type: "reveal" });
    const wrong = String(target + 1);
    for (const d of wrong) s = reducer(s, { type: "type-digit", digit: d });
    s = reducer(s, { type: "submit" });
    expect(s.lastCorrect).toBe(false);
    expect(s.score).toBe(0);
  });

  it("submit is no-op with empty input", () => {
    let s = reducer(initialState(42, easy), { type: "start" });
    s = reducer(s, { type: "reveal" });
    s = reducer(s, { type: "submit" });
    expect(s.phase).toBe("input");
  });
});

describe("QuickCounting progression", () => {
  function playAll(seed: number) {
    let s = reducer(initialState(seed, easy), { type: "start" });
    for (let round = 0; round < 10; round++) {
      s = reducer(s, { type: "reveal" });
      s = reducer(s, { type: "type-digit", digit: "1" });
      s = reducer(s, { type: "submit" });
      s = reducer(s, { type: "next" });
    }
    return s;
  }

  it("phase is done after 10 rounds", () => {
    expect(playAll(42).phase).toBe("done");
  });

  it("isTerminal returns score when done", () => {
    const s = playAll(42);
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(0);
  });

  it("isTerminal returns null when not done", () => {
    expect(isTerminal(initialState(42, easy))).toBeNull();
  });

  it("perfect score is 100", () => {
    let s = reducer(initialState(42, easy), { type: "start" });
    for (let round = 0; round < 10; round++) {
      const target = s.target;
      s = reducer(s, { type: "reveal" });
      for (const d of String(target)) s = reducer(s, { type: "type-digit", digit: d });
      s = reducer(s, { type: "submit" });
      s = reducer(s, { type: "next" });
    }
    expect(s.score).toBe(100);
  });
});
