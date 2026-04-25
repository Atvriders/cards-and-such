import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, currentIndex } from "./state.js";

const defaultSettings = { length: "5" as const };

describe("initialState", () => {
  it("generates correct sequence length", () => {
    const s = initialState(42, defaultSettings);
    expect(s.sequence).toHaveLength(5);
    expect(s.typed).toHaveLength(0);
    expect(s.errors).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("is deterministic", () => {
    const s1 = initialState(42, defaultSettings);
    const s2 = initialState(42, defaultSettings);
    expect(s1.sequence.join("")).toBe(s2.sequence.join(""));
  });

  it("sequence contains valid chars", () => {
    const s = initialState(42, defaultSettings);
    const valid = "abcdefghijklmnopqrstuvwxyz0123456789";
    for (const c of s.sequence) {
      expect(valid).toContain(c);
    }
  });
});

describe("reducer — start", () => {
  it("sets startTime", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "start", time: 1000 });
    expect(s2.startTime).toBe(1000);
  });

  it("ignores start if already started", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "start", time: 1000 });
    const s3 = reducer(s2, { type: "start", time: 2000 });
    expect(s3.startTime).toBe(1000);
  });
});

describe("reducer — key", () => {
  it("records typed key", () => {
    const s = initialState(42, defaultSettings);
    const started = reducer(s, { type: "start", time: 0 });
    const first = s.sequence[0]!;
    const s2 = reducer(started, { type: "key", char: first });
    expect(s2.typed[0]).toBe(first);
    expect(currentIndex(s2)).toBe(1);
  });

  it("increments errors on wrong key", () => {
    const s = initialState(42, defaultSettings);
    const started = reducer(s, { type: "start", time: 0 });
    const first = s.sequence[0]!;
    const wrong = first === "a" ? "b" : "a";
    const s2 = reducer(started, { type: "key", char: wrong });
    expect(s2.errors).toBe(1);
  });

  it("game ends after sequence complete", () => {
    let s = initialState(42, defaultSettings);
    s = reducer(s, { type: "start", time: 0 });
    for (const c of s.sequence) {
      s = reducer(s, { type: "key", char: c });
    }
    expect(s.gameOver).toBe(true);
    expect(s.typed).toHaveLength(5);
  });

  it("is no-op after game over", () => {
    const s = initialState(42, defaultSettings);
    const over = { ...s, gameOver: true };
    expect(reducer(over, { type: "key", char: "a" })).toBe(over);
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("perfect run scores high", () => {
    let s = initialState(42, defaultSettings);
    s = reducer(s, { type: "start", time: 0 });
    for (const c of s.sequence) {
      s = reducer(s, { type: "key", char: c });
    }
    const result = isTerminal(s)!;
    expect(result.score).toBe(1000); // 100% accuracy, 0 errors
  });

  it("errors reduce score", () => {
    let s = initialState(42, defaultSettings);
    s = reducer(s, { type: "start", time: 0 });
    // Type all correctly except make some wrong
    const seq = [...s.sequence];
    seq[0] = seq[0] === "a" ? "b" : "a"; // force error on first
    for (let i = 0; i < s.sequence.length; i++) {
      const char = i === 0 ? seq[0]! : s.sequence[i]!;
      s = reducer(s, { type: "key", char });
    }
    const result = isTerminal(s)!;
    expect(result.score).toBeLessThan(1000);
  });
});
