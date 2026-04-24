import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { timeLimit: "60" as const, deck: "mixed" as const };

describe("HeadsUp initialState", () => {
  it("creates a non-empty word list", () => {
    const s = initialState(1, defaultSettings);
    expect(s.words.length).toBeGreaterThan(0);
  });

  it("starts with full time, 0 guessed, playing phase", () => {
    const s = initialState(1, defaultSettings);
    expect(s.timeLeft).toBe(60);
    expect(s.guessed).toBe(0);
    expect(s.skipped).toBe(0);
    expect(s.phase).toBe("playing");
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(77, defaultSettings);
    const s2 = initialState(77, defaultSettings);
    expect(s1.words).toEqual(s2.words);
  });

  it("deck filter works for celebrities", () => {
    const s = initialState(1, { timeLimit: "60" as const, deck: "celebrities" as const });
    expect(s.words.length).toBeGreaterThan(0);
  });
});

describe("HeadsUp reducer - tick", () => {
  it("tick decrements time", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.timeLeft).toBe(59);
  });

  it("tick at 1 finishes game", () => {
    let s = initialState(1, { timeLimit: "30" as const, deck: "mixed" as const });
    for (let i = 0; i < 30; i++) s = reducer(s, { type: "tick" });
    expect(s.phase).toBe("done");
  });
});

describe("HeadsUp reducer - correct / skip", () => {
  it("correct increments guessed and advances word", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "correct" });
    expect(s2.guessed).toBe(1);
    expect(s2.currentIndex).toBe(1);
  });

  it("skip increments skipped and advances word", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "skip" });
    expect(s2.skipped).toBe(1);
    expect(s2.currentIndex).toBe(1);
  });
});

describe("HeadsUp isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState(1, defaultSettings))).toBeNull();
  });

  it("returns guessed count as score when time runs out", () => {
    let s = initialState(1, { timeLimit: "30" as const, deck: "mixed" as const });
    s = reducer(s, { type: "correct" });
    s = reducer(s, { type: "correct" });
    for (let i = 0; i < 30; i++) s = reducer(s, { type: "tick" });
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBe(2);
  });
});
