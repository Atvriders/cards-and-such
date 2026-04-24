import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { rounds: "10" as const, mode: "sentence" as const };

describe("StoryBuilder initialState", () => {
  it("starts with empty contributions and round 0", () => {
    const s = initialState(1, defaultSettings);
    expect(s.contributions).toHaveLength(0);
    expect(s.currentRound).toBe(0);
    expect(s.phase).toBe("playing");
  });

  it("starter is a non-empty string", () => {
    const s = initialState(1, defaultSettings);
    expect(typeof s.starter).toBe("string");
    expect(s.starter.length).toBeGreaterThan(0);
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(42, defaultSettings);
    const s2 = initialState(42, defaultSettings);
    expect(s1.starter).toBe(s2.starter);
  });

  it("can vary starter with different seeds", () => {
    const starters = new Set<string>();
    for (let i = 0; i < 10; i++) {
      starters.add(initialState(i * 13, defaultSettings).starter);
    }
    expect(starters.size).toBeGreaterThan(1);
  });
});

describe("StoryBuilder reducer - add", () => {
  it("add appends a contribution", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "add", text: "Hello world." });
    expect(s2.contributions).toHaveLength(1);
    expect(s2.contributions[0]).toBe("Hello world.");
    expect(s2.currentRound).toBe(1);
  });

  it("finishes after max rounds", () => {
    let s = initialState(1, { rounds: "10" as const, mode: "sentence" as const });
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "add", text: `sentence ${i}` });
    }
    expect(s.phase).toBe("done");
  });

  it("does nothing after done", () => {
    let s = initialState(1, { rounds: "10" as const, mode: "sentence" as const });
    for (let i = 0; i < 10; i++) s = reducer(s, { type: "add", text: "x" });
    const s2 = reducer(s, { type: "add", text: "extra" });
    expect(s2.contributions).toHaveLength(10);
  });
});

describe("StoryBuilder reducer - finish", () => {
  it("finish action ends the game early", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "finish" });
    expect(s2.phase).toBe("done");
  });
});

describe("StoryBuilder isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState(1, defaultSettings))).toBeNull();
  });

  it("returns score equal to contributions count", () => {
    let s = initialState(1, { rounds: "10" as const, mode: "sentence" as const });
    for (let i = 0; i < 10; i++) s = reducer(s, { type: "add", text: "x" });
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBe(10);
  });
});
