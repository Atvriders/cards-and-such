import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, RUNES } from "./state.js";

const settings = { length: "4" as const };

describe("initialState", () => {
  it("starts in show phase with correct sequence length", () => {
    const s = initialState(1, settings);
    expect(s.sequence.length).toBe(4);
    expect(s.phase).toBe("show");
    expect(s.showIndex).toBe(0);
    expect(s.score).toBe(0);
    expect(s.round).toBe(1);
  });

  it("sequence values are valid rune indices", () => {
    const s = initialState(42, settings);
    for (const r of s.sequence) {
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThan(RUNES.length);
    }
  });
});

describe("advance-show", () => {
  it("increments showIndex and transitions to input", () => {
    let s = initialState(1, { length: "4" as const });
    for (let i = 0; i < 4; i++) {
      s = reducer(s, { type: "advance-show" });
    }
    expect(s.phase).toBe("input");
  });
});

describe("cast", () => {
  it("correct sequence transitions to win", () => {
    let s = initialState(1, settings);
    // advance through show phase
    for (let i = 0; i < 4; i++) s = reducer(s, { type: "advance-show" });
    expect(s.phase).toBe("input");
    for (const rune of s.sequence) {
      s = reducer(s, { type: "cast", rune });
    }
    expect(s.phase).toBe("win");
    expect(s.score).toBeGreaterThan(0);
  });

  it("wrong rune causes fail", () => {
    let s = initialState(1, settings);
    for (let i = 0; i < 4; i++) s = reducer(s, { type: "advance-show" });
    const wrongRune = (s.sequence[0]! + 1) % RUNES.length;
    s = reducer(s, { type: "cast", rune: wrongRune });
    expect(s.phase).toBe("fail");
  });
});

describe("isTerminal", () => {
  it("null during show/input/win", () => {
    const s = initialState(1, settings);
    expect(isTerminal(s)).toBeNull();
    const sw = { ...s, phase: "win" as const };
    expect(isTerminal(sw)).toBeNull();
  });

  it("returns score on fail", () => {
    const s = { ...initialState(1, settings), phase: "fail" as const, score: 400 };
    expect(isTerminal(s)!.score).toBe(400);
  });
});
