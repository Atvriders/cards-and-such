import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settingsFwd3 = { mode: "forward" as const, startLength: "3" as const };
const settingsBwd4 = { mode: "backward" as const, startLength: "4" as const };

describe("DigitSpan initialState", () => {
  it("starts in show phase with correct span length", () => {
    const s = initialState(42, settingsFwd3);
    expect(s.phase).toBe("show");
    expect(s.spanLength).toBe(3);
    expect(s.sequence.length).toBe(3);
  });

  it("same seed produces same sequence", () => {
    const s1 = initialState(7, settingsFwd3);
    const s2 = initialState(7, settingsFwd3);
    expect(s1.sequence).toEqual(s2.sequence);
  });

  it("sequence digits are 0-9", () => {
    const s = initialState(42, settingsBwd4);
    for (const d of s.sequence) {
      expect(d).toBeGreaterThanOrEqual(0);
      expect(d).toBeLessThanOrEqual(9);
    }
  });

  it("starts with 3 lives", () => {
    const s = initialState(42, settingsFwd3);
    expect(s.lives).toBe(3);
  });
});

describe("DigitSpan tick", () => {
  it("advances showIndex", () => {
    const s = initialState(42, settingsFwd3);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.showIndex).toBe(1);
  });

  it("transitions to input after last digit", () => {
    let s = initialState(42, settingsFwd3);
    for (let i = 0; i < 3; i++) {
      s = reducer(s, { type: "tick" });
    }
    expect(s.phase).toBe("input");
  });
});

describe("DigitSpan type and submit", () => {
  function advanceToInput(seed: number): ReturnType<typeof initialState> {
    let s = initialState(seed, settingsFwd3);
    for (let i = 0; i < 3; i++) s = reducer(s, { type: "tick" });
    return s;
  }

  it("type action appends digit to input", () => {
    const s = advanceToInput(42);
    const s2 = reducer(s, { type: "type", digit: "5" });
    expect(s2.input).toBe("5");
  });

  it("correct forward submission transitions to feedback", () => {
    const s = advanceToInput(42);
    const expected = s.sequence.map(String).join("");
    let state = s;
    for (const d of expected) {
      state = reducer(state, { type: "type", digit: d });
    }
    state = reducer(state, { type: "submit" });
    expect(state.phase).toBe("feedback");
    expect(state.lastCorrect).toBe(true);
  });

  it("wrong submission loses a life", () => {
    const s = advanceToInput(42);
    let state = s;
    for (let i = 0; i < 3; i++) {
      state = reducer(state, { type: "type", digit: "9" });
    }
    state = reducer(state, { type: "submit" });
    expect(state.lives).toBe(2);
    expect(state.lastCorrect).toBe(false);
  });

  it("backward mode requires reversed sequence", () => {
    let s = initialState(42, settingsBwd4);
    for (let i = 0; i < 4; i++) s = reducer(s, { type: "tick" });
    const reversed = [...s.sequence].reverse().map(String).join("");
    let state = s;
    for (const d of reversed) {
      state = reducer(state, { type: "type", digit: d });
    }
    state = reducer(state, { type: "submit" });
    expect(state.lastCorrect).toBe(true);
  });
});

describe("DigitSpan isTerminal", () => {
  it("returns null while playing", () => {
    const s = initialState(42, settingsFwd3);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when ended", () => {
    const s = { ...initialState(42, settingsFwd3), ended: true, correct: 4, spanLength: 5 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result?.score).toBe(4 * 10 + 5);
  });
});
